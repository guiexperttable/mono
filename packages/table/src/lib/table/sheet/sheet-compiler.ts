import type { FormulaNode, FormulaRefNode } from "../formula/formula-ast.if";
import type { FormulaFunction } from "../formula/formula-options.if";
import { FormulaError, type FormulaErrorCode, isFormulaError } from "../formula/formula-error";
import { parseFormula } from "../formula/parser";
import { FormulaSyntaxError } from "../formula/tokenizer";
import { SHEET_FUNCTIONS, type SheetFnContext } from "./sheet-functions";
import { SHEET_MAX_COLUMNS, SHEET_MAX_ROWS } from "./cell-address";
import {
  compareSheet,
  FormulaRange,
  fromCellData,
  isFormulaRange,
  isoTextToSerial,
  isSheetDate,
  num,
  scalar,
  SheetDate,
  type SheetValue,
  toNum,
  toStr,
} from "./sheet-values";

// Not exported from index.ts: SheetEngine uses it.

/** A range a formula reads (0-based, inclusive, already cut to the sheet). */
export interface RangeRef {
  r1: number;
  c1: number;
  r2: number;
  c2: number;
}

/** What the compiled formula of a cell needs from the engine. */
export interface SheetCompileEnv {
  /** The value of a cell (formula result or data). */
  read(row: number, col: number): SheetValue;
  /** Rows of the data (ranges are cut there). */
  rowCount(): number;
  /** The column of a data field (`[price]`), -1 if it is none. */
  fieldColumn(name: string): number;
  /** Own functions (upper case names). */
  functions: Map<string, FormulaFunction>;
  /** Largest range (cells) – larger ones are #ERROR!. */
  maxRangeCells: number;
  fn: SheetFnContext;
}

/** A compiled cell formula: evaluation and the cells it reads. */
export interface CompiledCellFormula {
  evaluate(): SheetValue;
  /** Single cells read (`row * 16384 + col`). */
  readonly singles: number[];
  readonly ranges: RangeRef[];
  readonly volatile: boolean;
  /** Syntax error or unknown function – the evaluation returns it. */
  readonly error?: FormulaError;
}

type Thunk = () => SheetValue;

const KNOWN_CODES = new Set(["#ERROR!", "#NAME?", "#VALUE!", "#DIV/0!", "#NUM!", "#CIRC!", "#REF!", "#N/A"]);
const AGGREGATES = new Set(["SUM", "AVERAGE", "AVG", "MIN", "MAX", "COUNT"]);

/** The key of a cell in maps. */
export function cellKey(row: number, col: number): number {
  return row * SHEET_MAX_COLUMNS + col;
}

/** Text of a formula without the leading `=`. */
function body(source: string): string {
  return source.replace(/^\s*=/, "");
}

/**
 * Compiles the formula of a cell (`=B2*C2`) into closures over the engine – no `eval`, no `new Function`.
 *
 * @param {string} source - the formula with `=`
 * @param {number} row - the row of the cell (for `[field]`)
 * @param {SheetCompileEnv} env - the engine
 * @returns {CompiledCellFormula} the compiled formula
 */
export function compileCellFormula(source: string, row: number, env: SheetCompileEnv): CompiledCellFormula {
  let ast: FormulaNode;
  try {
    ast = parseFormula(body(source), true);
  } catch (e) {
    const error = e instanceof FormulaSyntaxError ? e.toFormulaError() : new FormulaError("#ERROR!", "Invalid formula");
    return { evaluate: () => error, singles: [], ranges: [], volatile: false, error };
  }
  return new Compiler(env, row).compile(ast);
}

class Compiler {
  private readonly singles = new Set<number>();
  private readonly ranges: RangeRef[] = [];
  private volatile = false;

  constructor(private readonly env: SheetCompileEnv, private readonly row: number) {
  }

  compile(ast: FormulaNode): CompiledCellFormula {
    const fn = this.node(ast);
    const evaluate = (): SheetValue => {
      try {
        const v = fn();
        const r = isFormulaRange(v) ? scalar(v) : v;
        if (r === null) return 0; // =A5 with an empty A5 shows 0, like Excel
        return typeof r === "number" ? num(r) : r;
      } catch (e) {
        return new FormulaError("#VALUE!", e instanceof Error ? e.message.slice(0, 200) : "Evaluation failed");
      }
    };
    return { evaluate, singles: [...this.singles], ranges: this.ranges, volatile: this.volatile };
  }

  private ref(r: number, c: number): Thunk {
    this.singles.add(cellKey(r, c));
    const env = this.env;
    return () => env.read(r, c);
  }

  private node(n: FormulaNode): Thunk {
    switch (n.kind) {
      case "literal": {
        const v = n.value;
        return () => v;
      }
      case "ref":
        if (n.row < 0 || n.col < 0 || n.row >= SHEET_MAX_ROWS || n.col >= SHEET_MAX_COLUMNS) {
          return this.fail("#REF!", "Invalid reference");
        }
        return this.ref(n.row, n.col);
      case "range":
        return this.range(n.from, n.to);
      case "field": {
        const col = this.env.fieldColumn(n.name);
        if (col < 0) {
          return this.fail("#NAME?", `[${n.name}] is no column of the sheet`);
        }
        return this.ref(this.row, col);
      }
      case "error": {
        const code = KNOWN_CODES.has(n.code) ? n.code as FormulaErrorCode : "#ERROR!";
        return this.fail(code, n.message ?? (code === "#REF!" ? "A reference to a deleted cell" : n.code));
      }
      case "unary": {
        const operand = this.node(n.operand);
        const env = this.env;
        if (n.op === "%") {
          return () => {
            const x = toNum(operand(), env.fn);
            return isFormulaError(x) ? x : num(x / 100);
          };
        }
        if (n.op === "+") {
          return () => scalar(operand());
        }
        return () => {
          const v = scalar(operand());
          const x = toNum(v, env.fn);
          return isFormulaError(x) ? x : num(-x);
        };
      }
      case "binary":
        return this.binary(n.op, this.node(n.left), this.node(n.right));
      case "call":
        return this.call(n.name, n.args);
    }
  }

  private fail(code: FormulaErrorCode, message: string): Thunk {
    const error = new FormulaError(code, message);
    return () => error;
  }

  private range(from: FormulaRefNode, to: FormulaRefNode): Thunk {
    const r1 = from.row < 0 ? 0 : from.row;
    const r2 = to.row < 0 ? SHEET_MAX_ROWS - 1 : to.row;
    const c1 = from.col < 0 ? 0 : from.col;
    const c2 = to.col < 0 ? SHEET_MAX_COLUMNS - 1 : to.col;
    if (r1 > r2 || c1 > c2 || r2 >= SHEET_MAX_ROWS || c2 >= SHEET_MAX_COLUMNS) {
      return this.fail("#REF!", "Invalid range");
    }
    this.ranges.push({ r1, c1, r2, c2 });
    const env = this.env;
    const cols = c2 - c1 + 1;
    return () => {
      const rows = Math.max(0, Math.min(r2, env.rowCount() - 1) - r1 + 1);
      if (rows * cols > env.maxRangeCells) {
        return new FormulaError("#ERROR!", `The range has more than ${env.maxRangeCells} cells`);
      }
      return new FormulaRange(r1, c1, rows, cols, env.read);
    };
  }

  private binary(op: string, left: Thunk, right: Thunk): Thunk {
    const env = this.env;
    if (op === "&") {
      return () => {
        const a = toStr(left());
        if (isFormulaError(a)) return a;
        const b = toStr(right());
        return isFormulaError(b) ? b : a + b;
      };
    }
    if (op === "=" || op === "<>" || op === "<" || op === "<=" || op === ">" || op === ">=") {
      return () => {
        const c = compareSheet(left(), right());
        if (isFormulaError(c)) return c;
        switch (op) {
          case "=": return c === 0;
          case "<>": return c !== 0;
          case "<": return c < 0;
          case "<=": return c <= 0;
          case ">": return c > 0;
          default: return c >= 0;
        }
      };
    }
    return () => {
      const a = scalar(left());
      if (isFormulaError(a)) return a;
      const b = scalar(right());
      if (isFormulaError(b)) return b;
      const x = toNum(a, env.fn);
      if (isFormulaError(x)) return x;
      const y = toNum(b, env.fn);
      if (isFormulaError(y)) return y;
      switch (op) {
        case "+":
        case "-": {
          const r = op === "+" ? x + y : x - y;
          // date ± number stays a date; date − date is a number of days (ISO text counts as date, isoDatesAsDates)
          const dateA = isSheetDate(a) || (env.fn.isoDatesAsDates && typeof a === "string" && isoTextToSerial(a.trim()) !== undefined);
          const dateB = isSheetDate(b) || (env.fn.isoDatesAsDates && typeof b === "string" && isoTextToSerial(b.trim()) !== undefined);
          if ((dateA && !dateB) || (op === "+" && dateB && !dateA)) {
            const n = num(r);
            return isFormulaError(n) ? n : new SheetDate(n);
          }
          return num(r);
        }
        case "*": return num(x * y);
        case "/": return y === 0 ? new FormulaError("#DIV/0!", "Division by zero") : num(x / y);
        default:
          if (x === 0 && y === 0) return new FormulaError("#NUM!", "0^0");
          if (x === 0 && y < 0) return new FormulaError("#DIV/0!", "0 to a negative power");
          return num(Math.pow(x, y));
      }
    };
  }

  private call(name: string, argNodes: readonly FormulaNode[]): Thunk {
    if (AGGREGATES.has(name) && argNodes.length === 1 && argNodes[0].kind === "field") {
      const field = (argNodes[0] as { name: string }).name;
      return this.fail("#NAME?", `${name}([${field}]) is a column formula – in a cell use a range, e.g. ${name}(D:D)`);
    }
    const own = this.env.functions.get(name);
    if (own) {
      const args = argNodes.map(a => this.node(a));
      return () => {
        const values: unknown[] = [];
        for (const a of args) {
          const v = a();
          if (isFormulaError(v)) return v;
          values.push(isSheetDate(v) ? v.serial : v);
        }
        try {
          return sanitize(own(...(values as never[])), name);
        } catch (e) {
          return new FormulaError("#VALUE!", `${name}: ${e instanceof Error ? e.message.slice(0, 200) : "failed"}`);
        }
      };
    }
    const spec = SHEET_FUNCTIONS[name];
    if (!spec) {
      return this.fail("#NAME?", `Unknown function ${name}`);
    }
    if (argNodes.length < spec.min || argNodes.length > spec.max) {
      const expected = spec.min === spec.max ? `${spec.min}` : spec.max >= 254 ? `at least ${spec.min}` : `${spec.min} to ${spec.max}`;
      return this.fail("#ERROR!", `${name} needs ${expected} argument${spec.max === 1 ? "" : "s"}, got ${argNodes.length}`);
    }
    if (spec.volatile) {
      this.volatile = true;
    }
    if ((name === "SUMIF" || name === "AVERAGEIF") && argNodes.length === 3) {
      argNodes = [argNodes[0], argNodes[1], resizeLike(argNodes[2], argNodes[0])]; // Excel: the size of the criteria range
    }
    const args = argNodes.map(a => this.node(a));
    const ctx = this.env.fn;
    if (spec.lazy) {
      const lazy = spec.lazy;
      return () => lazy(args, ctx);
    }
    const fn = spec.fn!;
    const acceptsErrors = !!spec.acceptsErrors;
    return () => {
      const values: SheetValue[] = new Array(args.length);
      for (let i = 0; i < args.length; i++) {
        const v = args[i]();
        if (!acceptsErrors && isFormulaError(v)) return v;
        values[i] = v;
      }
      return fn(values, ctx);
    };
  }
}

/** A sum range resized to the size of the criteria range (from its top left cell) – so the graph knows the cells. */
function resizeLike(node: FormulaNode, like: FormulaNode): FormulaNode {
  const corner = node.kind === "range" ? node.from : node.kind === "ref" ? node : undefined;
  if (!corner || like.kind !== "range" || corner.row < 0 || corner.col < 0) return node;
  const rows = like.to.row - like.from.row;
  const cols = like.to.col - like.from.col;
  if (like.from.row < 0 || like.from.col < 0) {
    return like.from.row < 0
      ? { kind: "range", from: { ...corner, row: -1 }, to: { ...corner, row: -1, col: corner.col + cols } }
      : { kind: "range", from: { ...corner, col: -1 }, to: { ...corner, col: -1, row: corner.row + rows } };
  }
  return { kind: "range", from: corner, to: { ...corner, row: corner.row + rows, col: corner.col + cols } };
}

/** The result of an own function as sheet value. */
function sanitize(v: unknown, name: string): SheetValue {
  if (v === undefined) return null;
  if (typeof v === "number") return Number.isNaN(v) ? new FormulaError("#NUM!", `${name} returned NaN`) : v;
  if (isFormulaRange(v)) return v;
  const s = fromCellData(v);
  return isFormulaError(s) && !isFormulaError(v) ? new FormulaError("#VALUE!", `${name} returned no number, text or boolean`) : s;
}
