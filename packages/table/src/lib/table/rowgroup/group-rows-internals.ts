import { RowGroup } from "./row-group";
import {
  defaultGroupKeyLabel,
  EMPTY_GROUP_KEY,
  isEmptyGroupKey,
  type ResolvedRowGroupField,
  typedGroupKey
} from "./row-group-internals";
import type { ResolvedAggregateSpec } from "../aggregation/aggregate-internals";

// Not exported from index.ts: the engine behind groupRows/aggregateRowGroups and AreaModelRowGroups.

/** The sub-groups of a group while building: by key (dates by time – two Date objects of the same time are one key). */
interface Bucket<T> {
  byKey: Map<unknown, [RowGroup<T>, Bucket<T>]>;
  byTime?: Map<number, [RowGroup<T>, Bucket<T>]>;
}

/** {@link groupRows} with resolved levels. @internal */
export function groupRowsResolved<T>(rows: ArrayLike<T>, fields: ResolvedRowGroupField<T>[], emptyLabel: string): RowGroup<T>[] {
  const roots: RowGroup<T>[] = [];
  const levels = fields.length;
  if (!levels) {
    return roots;
  }
  const rootBucket: Bucket<T> = { byKey: new Map() };
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    let bucket = rootBucket;
    let parent: RowGroup<T> | undefined = undefined;
    for (let level = 0; level < levels; level++) {
      const field = fields[level];
      let key = field.getKey(row);
      if (isEmptyGroupKey(key)) key = EMPTY_GROUP_KEY;
      let entry: [RowGroup<T>, Bucket<T>] | undefined;
      const time = key instanceof Date ? key.getTime() : undefined;
      if (time !== undefined) {
        entry = bucket.byTime?.get(time);
      } else {
        entry = bucket.byKey.get(key);
      }
      if (!entry) {
        const label = field.format && !isEmptyGroupKey(key) ? field.format(key) : defaultGroupKeyLabel(key, emptyLabel);
        const group: RowGroup<T> = new RowGroup<T>(key, `${label ?? ""}`, level, field.name,
          parent ? [...parent.path, key] : [key], parent, rows, typedGroupKey(key));
        entry = [group, { byKey: new Map() }];
        if (time !== undefined) {
          (bucket.byTime ??= new Map()).set(time, entry);
        } else {
          bucket.byKey.set(key, entry);
        }
        (parent ? parent.children : roots).push(group);
      }
      parent = entry[0];
      bucket = entry[1];
    }
    parent!.sourceIndices.push(i);
  }
  sortGroups(roots, fields);
  return roots;
}

function sortGroups<T>(groups: RowGroup<T>[], fields: ResolvedRowGroupField<T>[]): void {
  if (!groups.length) return;
  const compare = fields[groups[0].level]?.compare;
  if (compare) {
    groups.sort((a, b) => compare(a.key, b.key));
  }
  for (const group of groups) {
    sortGroups(group.children, fields);
  }
}

/** {@link aggregateRowGroups} with resolved specs. @internal */
export function aggregateRowGroupsResolved<T>(
  groups: RowGroup<T>[],
  specs: ResolvedAggregateSpec<T>[],
  accept?: (sourceIndex: number) => boolean): Record<string, unknown> {

  for (const group of groups) {
    computeGroup(group, specs, accept);
  }
  return totalsOf(groups, specs);
}

/** The totals: the merged states of the given groups. @internal */
export function totalsOf<T>(groups: RowGroup<T>[], specs: ResolvedAggregateSpec<T>[]): Record<string, unknown> {
  const states = specs.map(spec => spec.aggregator.init());
  for (const group of groups) {
    specs.forEach((spec, i) => states[i] = spec.aggregator.merge(states[i], group.states[i]));
  }
  const ret: Record<string, unknown> = {};
  specs.forEach((spec, i) => ret[spec.key] = spec.aggregator.result(states[i]));
  return ret;
}

function computeGroup<T>(group: RowGroup<T>, specs: ResolvedAggregateSpec<T>[], accept?: (i: number) => boolean): void {
  if (group.isLeaf()) {
    computeLeaf(group, specs, accept);
    return;
  }
  for (const child of group.children) {
    computeGroup(child, specs, accept);
  }
  mergeChildren(group, specs);
}

/** Aggregates the rows of a group of the last level. @internal */
export function computeLeaf<T>(group: RowGroup<T>, specs: ResolvedAggregateSpec<T>[], accept?: (i: number) => boolean): void {
  const source = group.source;
  // the accepted rows once, then one tight loop per aggregate (monomorphic: faster than all aggregates per row)
  let indices = group.sourceIndices;
  if (accept) {
    indices = [];
    for (const index of group.sourceIndices) {
      if (accept(index)) indices.push(index);
    }
  }
  const count = indices.length;
  const states = specs.map(spec => {
    const aggregator = spec.aggregator;
    const getValue = spec.getValue;
    let state = aggregator.init();
    for (let k = 0; k < count; k++) {
      const row = source[indices[k]];
      state = aggregator.add(state, getValue ? getValue(row) : row);
    }
    return state;
  });
  group.accept = accept;
  group.states = states;
  group.count = count;
  group.results = resultsOf(states, specs);
}

/** A group above the last level: merges the states of its sub-groups (they stay unchanged). @internal */
export function mergeChildren<T>(group: RowGroup<T>, specs: ResolvedAggregateSpec<T>[]): void {
  const states = specs.map(spec => spec.aggregator.init());
  let count = 0;
  for (const child of group.children) {
    count += child.count;
    specs.forEach((spec, i) => states[i] = spec.aggregator.merge(states[i], child.states[i]));
  }
  group.states = states;
  group.count = count;
  group.results = resultsOf(states, specs);
}

function resultsOf<T>(states: unknown[], specs: ResolvedAggregateSpec<T>[]): Record<string, unknown> {
  const ret: Record<string, unknown> = {};
  specs.forEach((spec, i) => ret[spec.key] = spec.aggregator.result(states[i]));
  return ret;
}
