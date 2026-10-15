import type { FormulaError } from "./formula-error";

/**
 * A value inside a formula: a number, a text, a boolean, blank (`null`) or an error.
 *
 * @example
 * const fn: FormulaFunction = (x: FormulaValue) => typeof x === "number" ? x * 1.19 : x;
 *
 * @since 1.1.95
 * @category Calculated columns & formulas
 */
export type FormulaValue = number | string | boolean | null | FormulaError;

/**
 * An own function for formulas. It gets the evaluated arguments (never an error – an error argument is returned
 * without calling the function) and returns a number, text, boolean or `null`. Anything else, an exception or
 * `NaN` becomes `#VALUE!` resp. `#NUM!`.
 *
 * @example
 * const VAT: FormulaFunction = (net) => Number(net) * 0.19;
 * compileFormula("VAT([price])", { functions: { VAT } });
 *
 * @since 1.1.95
 * @category Calculated columns & formulas
 */
export type FormulaFunction = (...args: FormulaValue[]) => unknown;

/**
 * Options of {@link compileFormula}.
 *
 * @example
 * const options: FormulaOptionsIf = {
 *   functions: { NET: (gross) => Number(gross) / 1.19 }
 * };
 * ColumnDef.create({ property: "net", headerLabel: "Net", formula: "NET([gross])", formulaOptions: options });
 *
 * @since 1.1.95
 * @category Calculated columns & formulas
 */
export interface FormulaOptionsIf {
  /** Own functions by name (case-insensitive). They may replace built-in ones. */
  functions?: Record<string, FormulaFunction>;
}
