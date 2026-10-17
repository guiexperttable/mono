import type { FormulaNode } from "./formula-ast.if";
import { FormulaError, isFormulaError } from "./formula-error";
import type { FormulaFunction, FormulaValue } from "./formula-options.if";
import type { ValueGetterContextIf } from "../calc/value-getter-context.if";
import { AGGREGATE_FUNCTIONS, BUILT_IN_FUNCTIONS } from "./functions";
import { compareValues, fromData, numberResult, toBoolean, toNumber, toText } from "./formula-values";

// Not exported from index.ts: CompiledFormula.evaluate() is the public entry.
//
// The AST is turned once into nested closures (no code generation: no `eval`, no `new Function` – CSP-safe).
// Evaluating a row only calls these closures; field paths are split at compile time.

/** Property names a formula may never read – not even as own property. */
const BLOCKED = new Set(["__proto__", "constructor", "prototype"]);

const hasOwn = (o: object, key: string): boolean => Object.prototype.hasOwnProperty.call(o, key);

type Evaluate = (row: unknown, context: ValueGetterContextIf | undefined) => FormulaValue;

/** Reads a field: own properties only (no prototype chain), path segments separated by ".". */
export function readField(row: unknown, name: string, context?: ValueGetterContextIf, path: string[] = name.split(".")): FormulaValue {
  if (context?.isCalculated(name)) {
    return fromData(context.getValue(row, name), name, true);
  }
  if (path.some(key => BLOCKED.has(key))) {
    return new FormulaError("#NAME?", `Unknown field [${name}]`);
  }
  let o: unknown = row;
  for (let i = 0; i < path.length; i++) {
    if (o === null || o === undefined || typeof o !== "object") {
      return null; // a missing parent: blank (like an empty cell)
    }
    if (!hasOwn(o, path[i])) {
      if (i === 0 && !context?.hasColumn(name)) {
        return new FormulaError("#NAME?", `Unknown field [${name}]`);
      }
      return null;
    }
    o = (o as Record<string, unknown>)[path[i]];
  }
  return fromData(o, name);
}

function binary(op: string, a: FormulaValue, b: FormulaValue): FormulaValue {
  if (isFormulaError(a)) return a;
  if (isFormulaError(b)) return b;
  if (op === "&") {
    const x = toText(a);
    if (isFormulaError(x)) return x;
    const y = toText(b);
    return isFormulaError(y) ? y : x + y;
  }
  if (op === "=" || op === "<>" || op === "<" || op === "<=" || op === ">" || op === ">=") {
    const c = compareValues(a, b);
    if (isFormulaError(c)) return c;
    switch (op) {
      case "=": return c === 0;
      case "<>": return c !== 0;
      case "<": return c < 0;
      case "<=": return c <= 0;
      case ">": return c > 0;
      default: return c >= 0;
    }
  }
  const x = typeof a === "number" ? a : toNumber(a);
  if (isFormulaError(x)) return x;
  const y = typeof b === "number" ? b : toNumber(b);
  if (isFormulaError(y)) return y;
  switch (op) {
    case "+": return numberResult(x + y);
    case "-": return numberResult(x - y);
    case "*": return numberResult(x * y);
    case "/": return y === 0 ? new FormulaError("#DIV/0!", "Division by zero") : numberResult(x / y);
    default: return numberResult(Math.pow(x, y));
  }
}

/** The result of an own function as formula value. */
function sanitize(v: unknown, name: string): FormulaValue {
  if (v === undefined || v === null) return null;
  if (typeof v === "number") return Number.isNaN(v) ? new FormulaError("#NUM!", `${name} returned NaN`) : v;
  if (typeof v === "string" || typeof v === "boolean" || isFormulaError(v)) return v;
  if (v instanceof Date) return fromData(v, name);
  return new FormulaError("#VALUE!", `${name} returned no number, text or boolean`);
}

/** Evaluates arguments eagerly; the first error is returned instead of the list. */
function evaluateArgs(args: Evaluate[], row: unknown, context: ValueGetterContextIf | undefined): FormulaValue[] | FormulaError {
  const values: FormulaValue[] = new Array(args.length);
  for (let i = 0; i < args.length; i++) {
    const v = args[i](row, context);
    if (isFormulaError(v)) return v;
    values[i] = v;
  }
  return values;
}

/** Compiles an AST into closures. Never throws at evaluation time (see {@link FormulaEvaluator.evaluate}). */
export class FormulaEvaluator {

  constructor(private readonly functions: Map<string, FormulaFunction>) {
  }

  /** The evaluation function of a (checked) AST. */
  compile(node: FormulaNode): Evaluate {
    const fn = this.node(node);
    return (row, context) => {
      try {
        const v = fn(row, context);
        return typeof v === "number" ? numberResult(v) : v;
      } catch (e) {
        // defensive: a getter of the data threw, or the call stack overflowed
        return new FormulaError("#VALUE!", e instanceof Error ? e.message.slice(0, 200) : "Evaluation failed");
      }
    };
  }

  /** Evaluates an AST once (compiles it each time – for single use). */
  evaluate(node: FormulaNode, row: unknown, context?: ValueGetterContextIf): FormulaValue {
    return this.compile(node)(row, context);
  }

  private node(node: FormulaNode): Evaluate {
    switch (node.kind) {
      case "literal": {
        const value = node.value;
        return () => value;
      }
      case "field": {
        const name = node.name;
        const path = name.split(".");
        return (row, context) => readField(row, name, context, path);
      }
      case "unary": {
        const operand = this.node(node.operand);
        const minus = node.op === "-";
        return (row, context) => {
          const v = operand(row, context);
          const n = typeof v === "number" ? v : toNumber(v);
          if (isFormulaError(n)) return n;
          return minus ? -n : n;
        };
      }
      case "binary": {
        const left = this.node(node.left);
        const right = this.node(node.right);
        const op = node.op;
        if (op === "*" || op === "+" || op === "-") {
          // fast path for numbers
          return (row, context) => {
            const a = left(row, context);
            const b = right(row, context);
            if (typeof a === "number" && typeof b === "number") {
              return numberResult(op === "*" ? a * b : op === "+" ? a + b : a - b);
            }
            return binary(op, a, b);
          };
        }
        return (row, context) => binary(op, left(row, context), right(row, context));
      }
      case "call":
        return this.call(node.name, node.args);
      default: {
        const error = new FormulaError("#ERROR!", "Cell references are not allowed in column formulas");
        return () => error;
      }
    }
  }

  private call(name: string, argNodes: readonly FormulaNode[]): Evaluate {
    const own = this.functions.get(name);
    if (own) {
      const args = argNodes.map(arg => this.node(arg));
      return (row, context) => {
        const values = evaluateArgs(args, row, context);
        if (isFormulaError(values)) return values;
        try {
          return sanitize(own(...values), name);
        } catch (e) {
          return new FormulaError("#VALUE!", `${name}: ${e instanceof Error ? e.message.slice(0, 200) : "failed"}`);
        }
      };
    }
    switch (name) {
      case "IF": {
        const [c, a, b] = argNodes.map(arg => this.node(arg));
        return (row, context) => {
          const cond = toBoolean(c(row, context));
          if (isFormulaError(cond)) return cond;
          if (cond) return a(row, context);
          return b ? b(row, context) : false;
        };
      }
      case "IFERROR": {
        const [x, fallback] = argNodes.map(arg => this.node(arg));
        return (row, context) => {
          const v = x(row, context);
          return isFormulaError(v) ? fallback(row, context) : v;
        };
      }
      case "AND":
      case "OR": {
        const and = name === "AND";
        const args = argNodes.map(arg => this.node(arg));
        return (row, context) => {
          for (const arg of args) {
            const b = toBoolean(arg(row, context));
            if (isFormulaError(b)) return b;
            if (and && !b) return false;
            if (!and && b) return true;
          }
          return and;
        };
      }
    }
    const aggregator = AGGREGATE_FUNCTIONS[name];
    const first = argNodes[0];
    if (aggregator && argNodes.length === 1 && first.kind === "field") {
      const field = first.name;
      return (_row, context) => {
        if (!context) {
          return new FormulaError("#VALUE!", `${name}([${field}]) needs the rows of a table`);
        }
        if (!context.hasColumn(field)) {
          return new FormulaError("#NAME?", `Unknown column [${field}] in ${name}`);
        }
        const result = context.aggregate(field, aggregator);
        if (result === undefined) {
          return aggregator === "avg" ? new FormulaError("#DIV/0!", "AVG of no numbers") : 0;
        }
        return fromData(result, field, true);
      };
    }
    const fn = BUILT_IN_FUNCTIONS[name];
    if (!fn) {
      const error = new FormulaError("#NAME?", `Unknown function ${name}`);
      return () => error;
    }
    const args = argNodes.map(arg => this.node(arg));
    return (row, context) => {
      const values = evaluateArgs(args, row, context);
      return isFormulaError(values) ? values : fn.fn(values);
    };
  }
}
