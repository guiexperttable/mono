import type { AggregatorRef } from "../aggregation/aggregator-name.type";

/**
 * The second parameter of a {@link ValueGetter}: access to other columns of the same table – also calculated ones –
 * and to column aggregates over the (filtered) rows. Formulas ({@link compileFormula}) use it for `[total]` and
 * `SUM([total])`.
 *
 * @example
 * ColumnDef.create({
 *   property: "share", headerLabel: "Share",
 *   valueGetter: (row: Item, ctx: ValueGetterContextIf) =>
 *     Number(ctx.getValue(row, "total")) / Number(ctx.aggregate("total", "sum"))
 * });
 *
 * @since 1.1.95
 * @category Calculated columns & formulas
 */
export interface ValueGetterContextIf {
  /** The property of the column that is computed. */
  readonly property: string;
  /**
   * The value of another column of the row: its `valueGetter` (with protection against circular references –
   * a cycle returns a `#CIRC!` {@link FormulaError}) or the property path.
   */
  getValue(row: any, property: string): unknown;
  /** True if a column of the table shows this property. */
  hasColumn(property: string): boolean;
  /** True if that column is calculated (`valueGetter` or `formula`). */
  isCalculated(property: string): boolean;
  /**
   * An aggregate of a column over the filtered rows of the body (cached until the data, filter or sorting changes),
   * e.g. `aggregate("total", "sum")`. Values that are no numbers are skipped (see {@link Aggregators}).
   */
  aggregate(property: string, aggregator: AggregatorRef): unknown;
}
