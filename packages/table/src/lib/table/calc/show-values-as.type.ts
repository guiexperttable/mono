/**
 * How a column shows its numbers – without changing the data („Show values as“):
 *
 * | Mode | Shows | Flat table | Tree / row groups | Pivot |
 * |---|---|---|---|---|
 * | `"percentOfColumnTotal"` | value / sum of the column | ✓ | sum of the (filtered) leaf rows | cell / column total |
 * | `"percentOfGrandTotal"` | value / grand total | = column total | = column total | cell / grand total |
 * | `"percentOfParentTotal"` | value / total of the parent | = column total | value / sum of its siblings (each group = 100 %) | cell / parent row |
 * | `"percentOfRowTotal"` | value / row total | – | – | cell / row total |
 * | `"differenceFromPrevious"` | value − value of the row above | ✓ (first row empty) | among siblings | – |
 * | `"runningTotal"` | sum up to this row (display order) | ✓ | among siblings | – |
 * | `"rank"` | 1 = largest value, ties share a rank (1, 2, 2, 4) | ✓ | among siblings | – |
 *
 * The reference are the **filtered** rows (like the total row). Not applicable (–): the raw value is shown.
 * Values that are no numbers and a total of 0 give an empty cell.
 *
 * @example
 * ColumnDef.create({ property: "share", headerLabel: "Share", valueGetter: o => o.total,
 *                    showValuesAs: "percentOfColumnTotal" });
 *
 * @since 1.1.95
 * @category Calculated columns & formulas
 */
export type ShowValuesAs =
  | "percentOfColumnTotal"
  | "percentOfGrandTotal"
  | "percentOfParentTotal"
  | "percentOfRowTotal"
  | "differenceFromPrevious"
  | "runningTotal"
  | "rank";

/**
 * „Show values as“ with options: mode, decimals, own text.
 *
 * @example
 * ColumnDef.create({
 *   property: "total", headerLabel: "Share",
 *   showValuesAs: { mode: "percentOfColumnTotal", fractionDigits: 2 }   // "66.70%"
 * });
 *
 * @since 1.1.95
 * @category Calculated columns & formulas
 */
export interface ShowValuesAsIf {
  /** The mode. */
  mode: ShowValuesAs;
  /** Decimals of the text. Default: 1 for percentages, at most 2 otherwise, 0 for `rank`. */
  fractionDigits?: number;
  /** An own text of the shown value (a fraction for percentages, e.g. `0.667`). Text only – never HTML. */
  format?: (value: number) => string;
}

/**
 * The configuration of a column: a mode or a mode with options.
 *
 * @example
 * const share: ShowValuesAsConfig = "percentOfColumnTotal";
 * const precise: ShowValuesAsConfig = { mode: "percentOfColumnTotal", fractionDigits: 2 };
 *
 * @since 1.1.95
 * @category Calculated columns & formulas
 */
export type ShowValuesAsConfig = ShowValuesAs | ShowValuesAsIf;
