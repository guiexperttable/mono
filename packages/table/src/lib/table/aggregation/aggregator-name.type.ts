import type { AggregatorIf } from "./aggregator.if";

/**
 * The names of the built-in aggregators ({@link Aggregators}).
 *
 * | name | result | uses |
 * |---|---|---|
 * | `sum` | sum, `0` for no numbers | numbers (`NaN` ignored) |
 * | `count` | number of rows | every row – the value does not matter |
 * | `avg` | sum / count of the numbers, `undefined` for none | numbers |
 * | `min`, `max` | smallest / largest value, `undefined` for none | numbers and valid `Date`s |
 * | `countDistinct` | number of different values | everything except `null`/`undefined`; dates by time |
 * | `first`, `last` | value of the first / last row | every row, the value as it is |
 *
 * Text is never converted to a number (like Excel's SUM over a range): `"12"` does not count. Use an accessor such as
 * `row => Number(row.amount)` for numbers stored as text.
 *
 * @example
 * const name: AggregatorName = "avg";
 * aggregate(orders, "total", name);
 *
 * @since 1.1.94
 * @category Aggregation
 */
export type AggregatorName = "sum" | "count" | "avg" | "min" | "max" | "countDistinct" | "first" | "last";

/**
 * A built-in aggregator by name or an own {@link AggregatorIf}.
 *
 * @example
 * const byName: AggregatorRef = "sum";
 * const own: AggregatorRef = { name: "range", init: () => [Infinity, -Infinity],
 *   add: ([lo, hi]: number[], v: unknown) => typeof v === "number" ? [Math.min(lo, v), Math.max(hi, v)] : [lo, hi],
 *   merge: (a: number[], b: number[]) => [Math.min(a[0], b[0]), Math.max(a[1], b[1])],
 *   result: ([lo, hi]: number[]) => hi - lo };
 *
 * @since 1.1.94
 * @category Aggregation
 */
export type AggregatorRef = AggregatorName | AggregatorIf;
