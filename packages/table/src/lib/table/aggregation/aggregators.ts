import type { AggregatorIf } from "./aggregator.if";
import type { AggregatorName, AggregatorRef } from "./aggregator-name.type";

/** Compensated sum (Neumaier): `sum + compensation` is the exact sum rounded once. */
interface SumState { sum: number; compensation: number }
interface AvgState extends SumState { count: number }
interface PickState { has: boolean; value: unknown }
interface ExtremeState extends PickState { key: number }
interface DistinctState { values: Set<unknown>; dates: Set<number> }

/** A number the numeric aggregators use: no `NaN`, no text, no bigint. */
function isNumberValue(value: unknown): value is number {
  return typeof value === "number" && !Number.isNaN(value);
}

/** The comparison key of a value `min`/`max` use (numbers and valid dates), otherwise `undefined`. */
function extremeKey(value: unknown): number | undefined {
  if (isNumberValue(value)) return value;
  if (value instanceof Date) {
    const time = value.getTime();
    return Number.isNaN(time) ? undefined : time;
  }
  return undefined;
}

function addToSum(state: SumState, value: number): void {
  const sum = state.sum;
  const t = sum + value;
  if (Number.isFinite(t)) {
    // Neumaier: keep the low-order bits that got lost in t
    state.compensation += Math.abs(sum) >= Math.abs(value) ? (sum - t) + value : (value - t) + sum;
  }
  state.sum = t;
}

function sumResult(state: SumState): number {
  return Number.isFinite(state.sum) ? state.sum + state.compensation : state.sum;
}

function mergeSums(a: SumState, b: SumState): void {
  addToSum(a, b.sum);
  a.compensation += b.compensation;
}

const sum: AggregatorIf<SumState, number> = {
  name: "sum",
  init: () => ({ sum: 0, compensation: 0 }),
  add: (state, value) => {
    if (isNumberValue(value)) addToSum(state, value);
    return state;
  },
  merge: (a, b) => {
    mergeSums(a, b);
    return a;
  },
  result: state => sumResult(state),
};

const count: AggregatorIf<number, number> = {
  name: "count",
  init: () => 0,
  add: state => state + 1,
  merge: (a, b) => a + b,
  result: state => state,
};

const avg: AggregatorIf<AvgState, number | undefined> = {
  name: "avg",
  init: () => ({ sum: 0, compensation: 0, count: 0 }),
  add: (state, value) => {
    if (isNumberValue(value)) {
      addToSum(state, value);
      state.count++;
    }
    return state;
  },
  merge: (a, b) => {
    mergeSums(a, b);
    a.count += b.count;
    return a;
  },
  result: state => state.count ? sumResult(state) / state.count : undefined,
};

function extreme(name: "min" | "max", better: (candidate: number, best: number) => boolean): AggregatorIf<ExtremeState, unknown> {
  return {
    name,
    init: () => ({ has: false, value: undefined, key: 0 }),
    add: (state, value) => {
      const key = extremeKey(value);
      if (key !== undefined && (!state.has || better(key, state.key))) {
        state.has = true;
        state.value = value;
        state.key = key;
      }
      return state;
    },
    merge: (a, b) => {
      if (b.has && (!a.has || better(b.key, a.key))) {
        a.has = true;
        a.value = b.value;
        a.key = b.key;
      }
      return a;
    },
    result: state => state.has ? state.value : undefined,
  };
}

const countDistinct: AggregatorIf<DistinctState, number> = {
  name: "countDistinct",
  init: () => ({ values: new Set<unknown>(), dates: new Set<number>() }),
  add: (state, value) => {
    if (value instanceof Date) {
      state.dates.add(value.getTime());
    } else if (value !== null && value !== undefined) {
      state.values.add(value);
    }
    return state;
  },
  merge: (a, b) => {
    b.values.forEach(v => a.values.add(v));
    b.dates.forEach(d => a.dates.add(d));
    return a;
  },
  result: state => state.values.size + state.dates.size,
};

const first: AggregatorIf<PickState, unknown> = {
  name: "first",
  init: () => ({ has: false, value: undefined }),
  add: (state, value) => {
    if (!state.has) {
      state.has = true;
      state.value = value;
    }
    return state;
  },
  merge: (a, b) => {
    if (!a.has && b.has) {
      a.has = true;
      a.value = b.value;
    }
    return a;
  },
  result: state => state.value,
};

const last: AggregatorIf<PickState, unknown> = {
  name: "last",
  init: () => ({ has: false, value: undefined }),
  add: (state, value) => {
    state.has = true;
    state.value = value;
    return state;
  },
  merge: (a, b) => {
    if (b.has) {
      a.has = true;
      a.value = b.value;
    }
    return a;
  },
  result: state => state.value,
};

/**
 * The built-in aggregators by name ({@link AggregatorName}) – each one is an {@link AggregatorIf}, so `merge` combines
 * partial results correctly (the average of groups is the average of all rows).
 *
 * - `sum` and `avg` sum with compensation (Neumaier): `0.1 + 0.2 + 0.3` is `0.6`, and splitting the data into groups
 *   does not change the result.
 * - Numeric aggregators use numbers only (`NaN`, text, `null` … are ignored); `min`/`max` also valid `Date`s;
 *   `count` counts rows; `countDistinct` ignores `null`/`undefined`; `first`/`last` take the value as it is.
 *
 * @example
 * const { sum } = Aggregators;
 * let state = sum.init();
 * for (const order of orders) state = sum.add(state, order.total);
 * sum.result(state);                         // the same as aggregate(orders, "total", "sum")
 *
 * @since 1.1.94
 * @category Aggregation
 */
export const Aggregators: Readonly<Record<AggregatorName, AggregatorIf>> = Object.freeze({
  sum,
  count,
  avg,
  min: extreme("min", (candidate, best) => candidate < best),
  max: extreme("max", (candidate, best) => candidate > best),
  countDistinct,
  first,
  last,
});

/**
 * The aggregator for a name, or the given aggregator itself.
 *
 * @param {AggregatorRef} aggregator - a name like `"sum"` or an own {@link AggregatorIf}
 * @returns {AggregatorIf} the aggregator
 * @throws {Error} for an unknown name (the message lists the built-in names)
 *
 * @example
 * getAggregator("avg").name;            // "avg"
 * getAggregator(Aggregators.max);       // the same object
 *
 * @since 1.1.94
 * @category Aggregation
 */
export function getAggregator(aggregator: AggregatorRef): AggregatorIf {
  if (typeof aggregator !== "string") {
    return aggregator;
  }
  const found = (Aggregators as Record<string, AggregatorIf | undefined>)[aggregator];
  if (!found) {
    throw new Error(`Unknown aggregator "${aggregator}" – use one of: ${Object.keys(Aggregators).join(", ")}, or an own AggregatorIf.`);
  }
  return found;
}
