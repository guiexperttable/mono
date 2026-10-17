import type { FormulaNode } from "./formula-ast.if";
import { FormulaError } from "./formula-error";
import type { FormulaFunction, FormulaOptionsIf, FormulaValue } from "./formula-options.if";
import type { ValueGetterContextIf } from "../calc/value-getter-context.if";
import type { ValueGetter } from "../calc/value-getter.type";
import { parseFormula } from "./parser";
import { FormulaSyntaxError } from "./tokenizer";
import { FormulaEvaluator } from "./evaluator";
import { BUILT_IN_FUNCTIONS, LAZY_FUNCTIONS } from "./functions";

/**
 * The names of the built-in formula functions (upper case), e.g. for the help text of an own formula input.
 *
 * @example
 * hint.textContent = `Functions: ${FORMULA_FUNCTION_NAMES.join(", ")}`;
 *
 * @since 1.1.95
 * @category Calculated columns & formulas
 */
export const FORMULA_FUNCTION_NAMES: readonly string[] =
  Object.freeze([...Object.keys(BUILT_IN_FUNCTIONS), ...Object.keys(LAZY_FUNCTIONS)].sort());

/**
 * A formula compiled once ({@link compileFormula}): the AST, the referenced fields and `evaluate()` for a row.
 * A formula with a syntax error or an unknown function has `error` set; `evaluate()` then always returns it.
 *
 * @example
 * const f = compileFormula("[price] * [quantity] * 1.19");
 * f.fields;                                    // ["price", "quantity"]
 * f.evaluate({ price: 1299, quantity: 2 });    // 3091.62
 *
 * @since 1.1.95
 * @category Calculated columns & formulas
 */
export interface CompiledFormula {
  /** The formula text as given. */
  readonly source: string;
  /** The syntax tree; `undefined` if the formula has an error. */
  readonly ast?: FormulaNode;
  /** The error of the formula itself (`#ERROR!`, `#NAME?` for an unknown function); `undefined` if it is valid. */
  readonly error?: FormulaError;
  /** The referenced fields (`[price]` → `"price"`), each once, in order of appearance. */
  readonly fields: readonly string[];
  /** True if the formula uses a column aggregate (`SUM([total])` …). */
  readonly usesAggregates: boolean;
  /**
   * Evaluates the formula for a row. Never throws: errors are returned as {@link FormulaError}.
   * Without a context, column aggregates (`SUM([x])`) return `#VALUE!`.
   */
  evaluate(row: unknown, context?: ValueGetterContextIf): FormulaValue;
}

function check(node: FormulaNode, functions: Map<string, FormulaFunction>, fields: string[], flags: { aggregates: boolean }): FormulaError | undefined {
  switch (node.kind) {
    case "literal":
      return undefined;
    case "field":
      if (!fields.includes(node.name)) fields.push(node.name);
      return undefined;
    case "unary":
      return check(node.operand, functions, fields, flags);
    case "binary":
      return check(node.left, functions, fields, flags) ?? check(node.right, functions, fields, flags);
    case "call": {
      if (!functions.has(node.name)) {
        const arity = BUILT_IN_FUNCTIONS[node.name] ?? LAZY_FUNCTIONS[node.name];
        if (!arity) {
          return new FormulaError("#NAME?", `Unknown function ${node.name}`);
        }
        if (node.args.length < arity.min || node.args.length > arity.max) {
          const expected = arity.min === arity.max ? `${arity.min}` : arity.max >= 255 ? `at least ${arity.min}` : `${arity.min} to ${arity.max}`;
          return new FormulaError("#ERROR!", `${node.name} needs ${expected} argument${arity.max === 1 ? "" : "s"}, got ${node.args.length}`);
        }
        if (["SUM", "AVG", "AVERAGE", "MIN", "MAX", "COUNT"].includes(node.name) && node.args.length === 1 && node.args[0].kind === "field") {
          flags.aggregates = true;
        }
      }
      for (const arg of node.args) {
        const e = check(arg, functions, fields, flags);
        if (e) return e;
      }
      return undefined;
    }
    default:
      return new FormulaError("#ERROR!", "Cell references are not allowed in column formulas"); // only cell formulas
  }
}

/**
 * Compiles a formula once – no `eval`, no `new Function` (works with a strict Content-Security-Policy, user input
 * cannot run code). The result evaluates rows; never throws.
 *
 * Syntax (details: instructions.md „Formulas“):
 * - fields in brackets: `[price]`, `[address.city]`, `[Unit price]` – own properties of the row or calculated columns
 * - numbers `12`, `1.5`, `1e3`, texts `"a"` / `'a'`, `TRUE`, `FALSE`
 * - operators: `+ - * / ^` (power), `&` (text), `= <> < <= > >=`; `-2^2 = -4`
 * - functions: `ROUND(x, 2)`, `IF(c, a, b)`, `IFERROR`, `AND`, `OR`, `NOT`, `ABS`, `MOD`, `SQRT`, `POWER`, `FLOOR`,
 *   `CEILING`, `CONCAT`, `LEN`, `UPPER`, `LOWER`, `TRIM`, `ISBLANK`; `SUM AVG MIN MAX COUNT` – with one field the
 *   aggregate of the column (`[total] / SUM([total])`), otherwise of the arguments
 *
 * @param {string} source - the formula, e.g. `"[price] * [quantity] * 1.19"` (a leading `=` is ignored)
 * @param {FormulaOptionsIf} [options] - own functions
 * @returns {CompiledFormula} the compiled formula
 *
 * @example
 * const gross = compileFormula("ROUND([price] * [quantity] * 1.19, 2)");
 * gross.evaluate({ price: 25, quantity: 10 });         // 297.5
 * compileFormula("[price] / 0").evaluate({ price: 1 }); // FormulaError #DIV/0!
 * compileFormula("[price] *").error?.code;             // "#ERROR!"
 *
 * @since 1.1.95
 * @category Calculated columns & formulas
 */
export function compileFormula(source: string, options?: FormulaOptionsIf): CompiledFormula {
  let text = "";
  const functions = new Map<string, FormulaFunction>();
  for (const name of Object.keys(options?.functions ?? {})) {
    const fn = options!.functions![name];
    if (typeof fn === "function") functions.set(name.toUpperCase(), fn);
  }
  let ast: FormulaNode | undefined;
  let error: FormulaError | undefined;
  const fields: string[] = [];
  const flags = { aggregates: false };
  let run: ((row: unknown, context: ValueGetterContextIf | undefined) => FormulaValue) | undefined;
  try {
    text = typeof source === "string" ? source : String(source ?? "");
    const trimmed = text.replace(/^\s+/, "");
    ast = parseFormula(trimmed.startsWith("=") && !trimmed.startsWith("==") ? trimmed.slice(1) : text);
    error = check(ast, functions, fields, flags);
    if (!error) run = new FormulaEvaluator(functions).compile(ast);
  } catch (e) {
    error = e instanceof FormulaSyntaxError ? e.toFormulaError() : new FormulaError("#ERROR!", "Invalid formula");
  }
  if (error) {
    ast = undefined;
    fields.length = 0;
  }
  if (error) run = undefined;
  return Object.freeze({
    source: text,
    ast,
    error,
    fields: Object.freeze([...fields]),
    usesAggregates: flags.aggregates,
    evaluate: (row: unknown, context?: ValueGetterContextIf): FormulaValue => run ? run(row, context) : error!,
  });
}

/**
 * The {@link ValueGetter} of a formula – what `ColumnDef.create({ formula })` sets as `valueGetter`.
 *
 * @param {CompiledFormula | string} formula - a compiled formula or its text
 * @param {FormulaOptionsIf} [options] - own functions (only with a text)
 * @returns {ValueGetter} the getter
 *
 * @example
 * const column = ColumnDef.create({ property: "gross", headerLabel: "Gross" });
 * column.valueGetter = createFormulaValueGetter("[net] * 1.19");
 *
 * @since 1.1.95
 * @category Calculated columns & formulas
 */
export function createFormulaValueGetter(formula: CompiledFormula | string, options?: FormulaOptionsIf): ValueGetter {
  const compiled = typeof formula === "string" ? compileFormula(formula, options) : formula;
  return (row: unknown, context: ValueGetterContextIf) => compiled.evaluate(row, context);
}
