import type { AggregatorIf } from "./aggregator.if";
import type { AggregatorRef } from "./aggregator-name.type";
import type { AggregateSpec, AggregateSpecIf } from "./aggregate-spec.if";
import { Aggregators, getAggregator } from "./aggregators";
import { createValueGetter } from "./create-value-getter";
import type { ValueAccessor } from "./value-accessor.type";

// Not exported from index.ts: shared by aggregate.ts and AreaModelAggregateFooter.

/**
 * A spec of {@link AggregateSpecMap} resolved for a pass over rows.
 */
export interface ResolvedAggregateSpec<T = any> {
  key: string;
  aggregator: AggregatorIf;
  /** where the value comes from: the spec's `value`, otherwise the key as property path */
  value: ValueAccessor<T>;
  /** undefined for `count` (the value does not matter) */
  getValue?: (row: T) => unknown;
  format?: (result: unknown) => string;
}

/**
 * Resolves one entry of an {@link AggregateSpecMap}: the aggregator object, the value getter (default: the key as
 * property path) and the format.
 */
export function resolveAggregateSpec<T>(key: string, spec: AggregateSpec<T>): ResolvedAggregateSpec<T> {
  const full: AggregateSpecIf<T> = (typeof spec === "string" || !("aggregator" in spec))
    ? { aggregator: spec as AggregatorRef }
    : spec;
  const aggregator = getAggregator(full.aggregator);
  const value = full.value ?? key;
  return {
    key,
    aggregator,
    value,
    getValue: aggregator === Aggregators.count ? undefined : createValueGetter<T>(value),
    format: full.format,
  };
}

/**
 * Runs resolved specs over the rows in one pass and returns the states (for `merge` by the caller) – the core of
 * {@link aggregateColumns} and of {@link AreaModelAggregateFooter}.
 */
export function aggregateStates<T>(rows: ArrayLike<T>, specs: ResolvedAggregateSpec<T>[]): unknown[] {
  const states = specs.map(spec => spec.aggregator.init());
  const n = specs.length;
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    for (let i = 0; i < n; i++) {
      const spec = specs[i];
      states[i] = spec.aggregator.add(states[i], spec.getValue ? spec.getValue(row) : row);
    }
  }
  return states;
}


/**
 * Like {@link aggregateStates} for models without row objects: the getters get the row index 0 … rowCount-1.
 */
export function aggregateIndexStates(rowCount: number, specs: Pick<ResolvedAggregateSpec<number>, 'aggregator' | 'getValue'>[]): unknown[] {
  const states = specs.map(spec => spec.aggregator.init());
  const n = specs.length;
  for (let r = 0; r < rowCount; r++) {
    for (let i = 0; i < n; i++) {
      const spec = specs[i];
      states[i] = spec.aggregator.add(states[i], spec.getValue ? spec.getValue(r) : r);
    }
  }
  return states;
}
