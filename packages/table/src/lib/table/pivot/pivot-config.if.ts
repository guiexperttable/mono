import type { RowGroupField } from "../rowgroup/row-group-field.type";
import type { RowGroupExpanded } from "../rowgroup/row-group-model-options.if";
import type { PivotValue } from "./pivot-value.type";

/**
 * What a pivot table shows: the row fields (grouped like a row grouping), the column fields (their values become
 * columns) and the values (aggregated per row × column), plus subtotals and totals. Used by
 * {@link PivotFactory.createTableModel}, {@link pivotRows} and {@link TableApi.setPivotConfig}.
 *
 * Fields have the form of a row grouping level ({@link RowGroupField}): a property path, a function (e.g. the quarter
 * of a date) or {@link RowGroupFieldIf} with `label`, `format` and `order` – `groupBy` of a row grouping works as
 * `rowFields`.
 *
 * @example
 * const config: PivotConfigIf<Sale> = {
 *   rowFields: ["region", "produkt"],
 *   columnFields: [{ value: "monat", order: "insertion" }],   // Jan before Feb (order in the data)
 *   values: ["umsatz"],                                        // sum of umsatz
 *   emptyText: "–"
 * };
 *
 * @typeParam T - the row type
 * @since 1.1.94
 * @category Pivot
 */
export interface PivotConfigIf<T = any> {
  /** The row levels, top first. Several levels form a hierarchy with subtotals. An empty list shows one total row. */
  rowFields: RowGroupField<T>[];
  /** The fields whose values become columns, top first. Several fields form a multi-row header. Default `[]` (totals only). */
  columnFields?: RowGroupField<T>[];
  /** The aggregated values (at least one): `"umsatz"` (sum) or {@link PivotValueIf}. With several values every column key gets one column per value. */
  values: PivotValue<T>[];
  /** Show the aggregates in the group rows (subtotals). Default true. */
  subtotals?: boolean;
  /**
   * A total column behind every column group (e.g. "2026 Total" behind its quarters); the group gets a toggle and,
   * when collapsed, shows only its total. Default: true with two or more column fields.
   */
  columnSubtotals?: boolean;
  /** The total column(s) on the right: `"fixed"` (default, fixed on the right), `true` (last columns, scrolled) or `false`. */
  totalColumn?: boolean | "fixed";
  /** The total row in the footer. Default true. */
  totalRow?: boolean;
  /**
   * The maximum number of column keys (of the lowest column level). More keys: the first ones are shown, a warning is
   * logged and {@link PivotResult.truncated} is true – total column, subtotal columns and total row still count all rows.
   * Default 1000.
   */
  maxColumns?: number;
  /** Expanded row groups: `true` (default), `false`, open levels as a number (`0` = all closed) or a function per group. */
  expanded?: RowGroupExpanded<T>;
  /** The label of empty keys (`null`, `undefined`, `""`) – rows and columns. Default `"(empty)"`. */
  emptyLabel?: string;
  /** The text of a cell without data (the value stays `undefined`, not 0). Default `""`. */
  emptyText?: string;
  /** The word for totals: header of the total column, label of the total row, suffix of subtotal columns. Default `"Total"`. */
  totalLabel?: string;
}
