import type { ValueAccessor } from "../aggregation/value-accessor.type";
import type { AggregatorRef } from "../aggregation/aggregator-name.type";
import type { AggregatorIf } from "../aggregation/aggregator.if";
import type { ShowValuesAsConfig, ShowValuesAsIf } from "../calc/show-values-as.type";

/**
 * One value of a pivot table in full form: where the value of a row comes from, how it is aggregated, and how its
 * columns are named. The short form is just the {@link ValueAccessor} (`"umsatz"` = the sum of umsatz).
 *
 * @example
 * const revenue: PivotValueIf<Order> = { value: "total", label: "Revenue" };                  // sum
 * const orders: PivotValueIf<Order> = { value: "id", aggregator: "count", label: "Orders" };
 * const avgPrice: PivotValueIf<Order> = {
 *   value: o => o.total / o.quantity, aggregator: "avg", label: "Avg. price",
 *   format: v => v === undefined ? "" : `${(v as number).toFixed(2)} €`
 * };
 *
 * @typeParam T - the row type
 * @since 1.1.94
 * @category Pivot
 */
export interface PivotValueIf<T = any> {
  /** The value of a row: a property path (`"umsatz"`, `"order.total"`) or a function. */
  value: ValueAccessor<T>;
  /** A built-in aggregator by name (`"sum"`, `"avg"`, `"count"` …) or an own {@link AggregatorIf}. Default `"sum"`. */
  aggregator?: AggregatorRef;
  /**
   * The id of the value – part of the column properties and the name in {@link PivotResult.getValue}.
   * Default: `"<aggregator>(<path>)"`, e.g. `"sum(umsatz)"`; for a function `"<aggregator>(value<N>)"`.
   */
  name?: string;
  /** The header of its columns (with several values). Default: the name. Text only – never HTML. */
  label?: string;
  /** The text of a result in a cell. Default: numbers with at most two decimals (`"1,234.5"`). Excel gets the raw value. */
  format?: (result: unknown) => string;
  /**
   * „Show values as“ (since 1.1.95): `"percentOfRowTotal"` (each pivot row = 100 %), `"percentOfColumnTotal"`,
   * `"percentOfGrandTotal"` or `"percentOfParentTotal"` (share of the parent row group). The cells then hold the
   * fraction (Excel: number with percent format), the text is a percentage; `format` is not used. Other modes of
   * {@link ShowValuesAs} don't apply to a pivot (the value is shown).
   *
   * @example
   * values: [{ value: "umsatz", showValuesAs: "percentOfRowTotal" }]
   */
  showValuesAs?: ShowValuesAsConfig;
}

/**
 * A value of a pivot table: a property path or function (summed) or the full form {@link PivotValueIf}.
 *
 * @example
 * const values: PivotValue<Sale>[] = ["umsatz", { value: "umsatz", aggregator: "count", label: "Count" }];
 *
 * @typeParam T - the row type
 * @since 1.1.94
 * @category Pivot
 */
export type PivotValue<T = any> = ValueAccessor<T> | PivotValueIf<T>;

/**
 * A value of a pivot table as the table uses it: name, label, aggregator and format resolved
 * ({@link PivotResult.values}, {@link PivotColumnInfoIf.value}).
 *
 * @example
 * const pivotBody = pivotModel.getPivotBody();
 * pivotBody.getResult().values.map(v => v.name);   // ["sum(umsatz)"]
 *
 * @since 1.1.94
 * @category Pivot
 */
export interface PivotValueInfoIf {
  /** The id ({@link PivotValueIf.name}). */
  readonly name: string;
  /** The header label. */
  readonly label: string;
  /** The aggregator. */
  readonly aggregator: AggregatorIf;
  /** The format of a result, if one was given. */
  readonly format?: (result: unknown) => string;
  /** „Show values as“, if one was given (since 1.1.95). */
  readonly showValuesAs?: ShowValuesAsIf;
}
