import type { AggregateSpecMap } from "../../../aggregation/aggregate-spec.if";
import type { AreaModelIf } from "./area-model.if";

/**
 * One total row of an {@link AreaModelAggregateFooter}: the aggregates by column property and an optional label.
 *
 * @example
 * const sumRow: AggregateFooterRowIf<Order> = { label: "Sum", aggregates: { quantity: "sum", total: "sum" } };
 * const avgRow: AggregateFooterRowIf<Order> = {
 *   label: (rowCount, results) => `Ø of ${rowCount} orders`,
 *   aggregates: { total: { aggregator: "avg", format: v => `${(v as number).toFixed(2)} €` } }
 * };
 *
 * @since 1.1.94
 * @category Aggregation
 */
export interface AggregateFooterRowIf<T = any> {
  /** Key = property of the column that shows the result (a key without a column is only in `getResults()`). */
  aggregates: AggregateSpecMap<T>;
  /**
   * Text in the label column (always set as text, never as HTML). Default: `"6 rows"` – or, in a footer with
   * several rows whose aggregates all use the same built-in aggregator, its word (`"Sum"`, `"Average"`, `"Min"` …).
   */
  label?: string | ((rowCount: number, results: Record<string, unknown>) => string);
}

/**
 * The options of an {@link AreaModelAggregateFooter} (and of `TableFactory.createTableModel({ footerAggregates })`).
 *
 * @example
 * const options: AggregateFooterOptionsIf<Order> = {
 *   rows: [
 *     { label: "Sum", aggregates: { quantity: "sum", total: "sum" } },
 *     { label: "Average", aggregates: { quantity: "avg", total: "avg" } }
 *   ],
 *   labelProperty: "customer",   // the labels go into the customer column
 *   rowHeight: 36
 * };
 *
 * @since 1.1.94
 * @category Aggregation
 */
export interface AggregateFooterOptionsIf<T = any> {
  /** One footer row per entry. */
  rows: AggregateFooterRowIf<T>[];
  /** The column of the labels (property). Default: the first data column without an aggregate in that row. */
  labelProperty?: string;
  /** Height of the footer rows in px. Default 34 (the factory uses `defaultRowHeights.footer`). */
  rowHeight?: number;
  /**
   * Which rows are aggregated: `"filtered"` (default) – the rows the body shows (after `externalFilterFunction`;
   * in a tree all leaves that pass the filter, expanded or not); `"all"` – all rows, the filter is ignored.
   */
  source?: "filtered" | "all";
  /** An own source of rows (instead of the body model's rows), e.g. the data of a server response. */
  getRows?: (bodyModel: AreaModelIf) => ArrayLike<T>;
}

/**
 * The short and the full forms of a footer configuration:
 * - `{ total: "sum" }` – one row ({@link AggregateSpecMap}),
 * - `[{ label: "Sum", aggregates: … }, …]` – several rows ({@link AggregateFooterRowIf}),
 * - `{ rows: […], labelProperty, rowHeight, source, getRows }` – everything ({@link AggregateFooterOptionsIf}).
 *
 * @example
 * const oneRow: AggregateFooterConfig<Order> = { quantity: "sum", total: "sum" };
 * const twoRows: AggregateFooterConfig<Order> = [
 *   { label: "Sum", aggregates: { total: "sum" } },
 *   { label: "Max", aggregates: { total: "max" } }
 * ];
 *
 * @since 1.1.94
 * @category Aggregation
 */
export type AggregateFooterConfig<T = any> = AggregateSpecMap<T> | AggregateFooterRowIf<T>[] | AggregateFooterOptionsIf<T>;
