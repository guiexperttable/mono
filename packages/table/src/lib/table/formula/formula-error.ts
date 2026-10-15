/**
 * The error codes of a formula – like in a spreadsheet:
 *
 * | Code | Meaning |
 * |---|---|
 * | `#ERROR!` | syntax error (the whole column shows it) |
 * | `#NAME?` | unknown field or function |
 * | `#VALUE!` | wrong type, e.g. `"abc" * 2` |
 * | `#DIV/0!` | division by zero |
 * | `#NUM!` | the result is not a finite number (`SQRT(-1)`, overflow) |
 * | `#CIRC!` | circular reference between calculated columns |
 *
 * @since 1.1.95
 * @category Calculated columns & formulas
 */
export type FormulaErrorCode = "#ERROR!" | "#NAME?" | "#VALUE!" | "#DIV/0!" | "#NUM!" | "#CIRC!";

/**
 * An error value of a formula. Formulas never throw: a cell shows the {@link FormulaErrorCode} (`toString()`), the
 * table adds the CSS class `ge-table-cell-error` and shows the message as tooltip. Errors propagate through
 * operators and functions (`[a] / 0 + 1` → `#DIV/0!`), `IFERROR(x, fallback)` catches them, aggregators skip them.
 *
 * @example
 * const result = compileFormula("[price] / [quantity]").evaluate({ price: 10, quantity: 0 });
 * if (isFormulaError(result)) {
 *   console.log(result.code, result.message);   // "#DIV/0!" "Division by zero"
 * }
 *
 * @since 1.1.95
 * @category Calculated columns & formulas
 */
export class FormulaError {

  /** Marker (works across copies of the core): {@link isFormulaError}. */
  readonly type = "FormulaError";

  /**
   * @param {FormulaErrorCode} code - the code shown in the cell
   * @param {string} message - a short English explanation (tooltip); never contains HTML
   * @param {number} [position] - for syntax errors: the position in the formula text (0-based)
   */
  constructor(
    readonly code: FormulaErrorCode,
    readonly message: string,
    readonly position?: number
  ) {
  }

  /** The code, e.g. `"#DIV/0!"` – what a cell shows. */
  toString(): string {
    return this.code;
  }
}

/**
 * True for an error value of a formula ({@link FormulaError}) – also for one created by another copy of the core.
 *
 * @param {unknown} value - any value
 * @returns {boolean} whether it is a formula error
 *
 * @example
 * const value = tableApi.getRowValue(row, "margin");
 * if (!isFormulaError(value)) console.log(value);
 *
 * @since 1.1.95
 * @category Calculated columns & formulas
 */
export function isFormulaError(value: unknown): value is FormulaError {
  return !!value && typeof value === "object" && (value as { type?: unknown }).type === "FormulaError";
}
