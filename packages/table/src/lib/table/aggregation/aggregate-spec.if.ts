import type { AggregatorRef } from "./aggregator-name.type";
import type { ValueAccessor } from "./value-accessor.type";

/**
 * One aggregate in full form: which aggregator, which value, and (in a footer) how it is shown.
 *
 * @example
 * const spec: AggregateSpecIf<Order> = {
 *   aggregator: "avg",
 *   value: "total",                                    // default: the key of the spec
 *   format: v => `${(v as number).toFixed(2)} €`         // footer text; Excel gets the number
 * };
 *
 * @since 1.1.94
 * @category Aggregation
 */
export interface AggregateSpecIf<T = any> {
  /** A built-in aggregator by name or an own one. */
  aggregator: AggregatorRef;
  /** The value of a row. Default: the key of the spec as property path. */
  value?: ValueAccessor<T>;
  /** The text in a footer cell. Default: numbers with at most two decimals (`"1,234.5"`), dates as date, `undefined` empty. */
  format?: (result: unknown) => string;
}

/**
 * An aggregate in short form (`"sum"`, an own aggregator) or in full form ({@link AggregateSpecIf}).
 *
 * @example
 * const short: AggregateSpec<Order> = "sum";
 * const full: AggregateSpec<Order> = { aggregator: "sum", value: o => o.quantity * o.price };
 *
 * @since 1.1.94
 * @category Aggregation
 */
export type AggregateSpec<T = any> = AggregatorRef | AggregateSpecIf<T>;

/**
 * Several aggregates by key. In {@link aggregateColumns} the key names the result (and is the default property path);
 * in a footer ({@link AreaModelAggregateFooter}) the key is the property of the column that shows the result.
 *
 * @example
 * const specs: AggregateSpecMap<Order> = {
 *   quantity: "sum",
 *   total: "sum",
 *   customer: "countDistinct",
 *   avgTotal: { aggregator: "avg", value: "total" }   // a key without a column: only in the results
 * };
 *
 * @since 1.1.94
 * @category Aggregation
 */
export type AggregateSpecMap<T = any> = Record<string, AggregateSpec<T>>;
