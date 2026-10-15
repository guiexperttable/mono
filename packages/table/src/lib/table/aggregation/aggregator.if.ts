/**
 * An aggregation (sum, average, …) as four small functions over a **state**: `init` → `add` per value → `result`.
 * `merge` combines two partial states – the result is the same as one pass over all values. That makes groups
 * (row grouping, pivot) cheap: the state of a group is the merge of the states of its sub-groups, and an average of
 * averages stays correct (`{ sum, count }` instead of a number).
 *
 * The built-in aggregators are in {@link Aggregators}; an own aggregator implements this interface and can be used
 * everywhere a name like `"sum"` is accepted ({@link AggregatorRef}).
 *
 * `add(state, …)` and `merge(a, b)` may change `state` / `a` and return it (no allocation per row with millions of
 * rows); `merge` never changes `b`, so a child state can be merged into several parents. Call `init()` for a fresh
 * state, e.g. `merge(init(), child)` for a parent that must not change the child.
 *
 * @example
 * // the product of all numbers
 * const product: AggregatorIf<number, number> = {
 *   name: "product",
 *   init: () => 1,
 *   add: (state, value) => typeof value === "number" ? state * value : state,
 *   merge: (a, b) => a * b,
 *   result: state => state
 * };
 * aggregate([{ f: 2 }, { f: 3 }, { f: 7 }], "f", product); // 42
 *
 * @example
 * // partial results: the average of two groups is the average of all rows
 * const avg = Aggregators.avg;
 * const north = [100, 50, 120].reduce((s, v) => avg.add(s, v), avg.init());
 * const south = [80, 70, 30].reduce((s, v) => avg.add(s, v), avg.init());
 * avg.result(avg.merge(north, south)); // 75 – not the mean of 90 and 60
 *
 * @typeParam S - the state
 * @typeParam R - the result
 * @since 1.1.94
 * @category Aggregation
 */
export interface AggregatorIf<S = any, R = unknown> {
  /** The name, e.g. `"sum"` – the built-in ones use their {@link AggregatorName}. */
  readonly name: string;

  /** The state of the empty set. */
  init(): S;

  /** Takes one value into the state (values the aggregator can't use are ignored); returns the state. */
  add(state: S, value: unknown): S;

  /**
   * Combines two partial states (`a` first, then `b` – matters for `first`/`last`); may change `a` and returns the
   * combined state; never changes `b`.
   */
  merge(a: S, b: S): S;

  /** The result of a state, e.g. `sum / count` for the average. */
  result(state: S): R;
}
