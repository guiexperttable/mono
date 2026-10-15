import type { AggregatorRef } from "./aggregator-name.type";
import type { ValueAccessor } from "./value-accessor.type";
import type { AggregateSpecMap } from "./aggregate-spec.if";
import { aggregateStates, resolveAggregateSpec } from "./aggregate-internals";

/**
 * Aggregates one value of all rows.
 *
 * @param {ArrayLike<T>} rows - the rows (an array, also filtered or sorted ones)
 * @param {ValueAccessor<T>} value - property path (`"total"`, `"address.zip"`) or function
 * @param {AggregatorRef} aggregator - `"sum"`, `"count"`, `"avg"`, `"min"`, `"max"`, `"countDistinct"`, `"first"`,
 *        `"last"` or an own {@link AggregatorIf}
 * @returns {unknown} the result (`sum` of no numbers is `0`, `avg`/`min`/`max` of no numbers `undefined`)
 *
 * @example
 * aggregate(orders, "total", "sum");                      // all orders
 * aggregate(orders.filter(o => o.city === "Berlin"), "total", "avg");
 * aggregate(orders, o => o.quantity * o.price, "max");    // a computed value
 *
 * @since 1.1.94
 * @category Aggregation
 */
export function aggregate<T = any>(rows: ArrayLike<T>, value: ValueAccessor<T>, aggregator: AggregatorRef): unknown {
  const spec = resolveAggregateSpec<T>("", { aggregator, value });
  const [state] = aggregateStates(rows, [spec]);
  return spec.aggregator.result(state);
}

/**
 * Aggregates several values in **one** pass over the rows. The keys of `specs` name the results; a key is also the
 * default property path.
 *
 * @param {ArrayLike<T>} rows - the rows
 * @param {AggregateSpecMap<T>} specs - key → aggregator name, own aggregator or {@link AggregateSpecIf}
 * @returns {Record<string, unknown>} key → result, in the order of `specs`
 *
 * @example
 * const totals = aggregateColumns(orders, {
 *   quantity: "sum",
 *   total: "sum",
 *   customer: "countDistinct",
 *   avgTotal: { aggregator: "avg", value: "total" }
 * });
 * // { quantity: 549812, total: 27481033.5, customer: 412, avgTotal: 274.81 }
 *
 * @since 1.1.94
 * @category Aggregation
 */
export function aggregateColumns<T = any>(rows: ArrayLike<T>, specs: AggregateSpecMap<T>): Record<string, unknown> {
  const resolved = Object.keys(specs).map(key => resolveAggregateSpec(key, specs[key]));
  const states = aggregateStates(rows, resolved);
  const result: Record<string, unknown> = {};
  resolved.forEach((spec, i) => result[spec.key] = spec.aggregator.result(states[i]));
  return result;
}

const NUMBER_FORMAT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

/**
 * The default text of an aggregate (e.g. in a footer cell or a status bar): numbers with at most two decimals and
 * thousands separators, dates as date (en-US), `null`/`undefined` empty, everything else as text.
 *
 * @param {unknown} value - an aggregation result
 * @returns {string} the text
 *
 * @example
 * formatAggregateValue(1234.5678);   // "1,234.57"
 * formatAggregateValue(undefined);   // ""
 *
 * @since 1.1.94
 * @category Aggregation
 */
export function formatAggregateValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return Number.isFinite(value) ? NUMBER_FORMAT.format(value) : String(value);
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? "" : value.toLocaleDateString("en-US");
  return String(value);
}
