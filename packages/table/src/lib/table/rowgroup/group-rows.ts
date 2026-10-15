import type { RowGroupField } from "./row-group-field.type";
import type { GroupRowsOptionsIf } from "./group-rows-options.if";
import type { AggregateSpecMap } from "../aggregation/aggregate-spec.if";
import type { RowGroup } from "./row-group";
import { resolveRowGroupFields } from "./row-group-internals";
import { resolveAggregateSpec } from "../aggregation/aggregate-internals";
import { aggregateRowGroupsResolved, groupRowsResolved } from "./group-rows-internals";

const DEFAULT_EMPTY_LABEL = "(empty)";

/**
 * Groups rows by one or more levels – the engine behind {@link AreaModelRowGroups} (and pivot tables). One pass over
 * the rows with nested `Map`s: keys are compared as values (`1` and `"1"` are different groups, two dates of the same
 * time one group); `null`, `undefined` and `""` form one group (label `"(empty)"`), which is always last. Groups are
 * ordered by the `order` of their level (default ascending); the rows of a group stay in source order. The rows are
 * not changed.
 *
 * Aggregates are filled by {@link aggregateRowGroups}.
 *
 * @param {ArrayLike<T>} rows - the rows
 * @param {RowGroupField<T>[]} groupBy - the levels, top first: property paths, functions or {@link RowGroupFieldIf}
 * @param {GroupRowsOptionsIf} [options] - e.g. the label of empty keys
 * @returns {RowGroup<T>[]} the groups of the top level (empty for no levels or no rows)
 *
 * @example
 * const groups = groupRows(sales, ["region", "produkt"]);
 * groups[0].label;                  // "Nord"
 * groups[0].children[0].getRows();  // the rows of Nord › A
 *
 * @since 1.1.94
 * @category Row grouping
 */
export function groupRows<T = any>(rows: ArrayLike<T>, groupBy: RowGroupField<T>[], options: GroupRowsOptionsIf = {}): RowGroup<T>[] {
  return groupRowsResolved(rows, resolveRowGroupFields(groupBy), options.emptyLabel ?? DEFAULT_EMPTY_LABEL);
}

/**
 * Computes the aggregates of all groups ({@link RowGroupIf.results}) and their row counts ({@link RowGroupIf.count}).
 * A group of the last level aggregates its rows; every group above **merges** the states of its sub-groups – an
 * average stays the average of all rows (sum and count are merged), never the average of averages.
 *
 * @param {RowGroup<T>[]} groups - the top-level groups of {@link groupRows}
 * @param {AggregateSpecMap<T>} aggregations - key → aggregator (`{ umsatz: "sum" }`, see {@link AggregateSpecMap})
 * @param {(sourceIndex: number) => boolean} [accept] - a filter: only rows it accepts count (index into the source rows)
 * @returns {Record<string, unknown>} the totals over all groups
 *
 * @example
 * const groups = groupRows(sales, ["region", "produkt"]);
 * const totals = aggregateRowGroups(groups, { umsatz: "avg" });
 * groups[0].results.umsatz;   // 90 – Nord: (100 + 50 + 120) / 3, not the mean of A (110) and B (50)
 * totals.umsatz;              // 75
 *
 * @since 1.1.94
 * @category Row grouping
 */
export function aggregateRowGroups<T = any>(
  groups: RowGroup<T>[],
  aggregations: AggregateSpecMap<T>,
  accept?: (sourceIndex: number) => boolean): Record<string, unknown> {

  const specs = Object.keys(aggregations ?? {}).map(key => resolveAggregateSpec<T>(key, aggregations[key]));
  return aggregateRowGroupsResolved(groups, specs, accept);
}

