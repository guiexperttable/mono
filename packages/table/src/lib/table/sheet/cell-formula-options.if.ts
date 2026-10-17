import type { FormulaFunction } from "../formula/formula-options.if";

/**
 * Cell formulas like in Excel ({@link TableOptionsIf.cellFormulas}, {@link SheetEngine}): `=B2*C2`, `=SUM(D2:D100)`.
 * `cellFormulas: true` uses the defaults of {@link CellFormulaOptions}; an object overrides single values.
 *
 * @example
 * const engine = SheetEngine.fromArrays(data, { functions: { VAT: (net) => Number(net) * 0.19 } });
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export interface CellFormulaOptionsIf {
  /**
   * Own functions by name (case-insensitive); they may replace built-in ones. A range argument (`A1:B5`) arrives as
   * {@link FormulaRange}, a date as its serial number.
   */
  functions: Record<string, FormulaFunction>;
  /** ISO text (`"2026-10-16"`) counts as date in arithmetic (`=A2+1`) and date functions. Default `true`. */
  isoDatesAsDates: boolean;
  /** Larger ranges are `#ERROR!` (`A1:XFD1048576`). Default `10_000_000`. */
  maxRangeCells: number;
  /** The table refuses formulas with a syntax error instead of storing them (`#ERROR!`). Default `false`. */
  rejectInvalidFormulas: boolean;
  /** Only these properties hold formulas (the other columns keep `=…` as text). Default: every data column. */
  columns?: string[];
}
