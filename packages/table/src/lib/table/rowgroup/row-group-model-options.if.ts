import type { RowGroupField } from "./row-group-field.type";
import type { AggregateSpecMap } from "../aggregation/aggregate-spec.if";
import type { RowGroupIf } from "./row-group.if";
import type { RowGroupColumnOptionsIf } from "./row-group-column-options.if";

/**
 * Which groups are expanded: all (`true`), none (`false`), the levels above a number (`1` = the top level is open, its
 * sub-groups are closed; `0` = all closed), or a function per group.
 *
 * @example
 * const onlyNorth: RowGroupExpanded<Sale> = group => group.path[0] === "Nord";
 *
 * @since 1.1.94
 * @category Row grouping
 */
export type RowGroupExpanded<T = any> = boolean | number | ((group: RowGroupIf<T>) => boolean);

/**
 * Options of an {@link AreaModelRowGroups} (the factory {@link RowGroupFactory.createTableModel} fills them).
 *
 * @example
 * const body = new AreaModelRowGroups<Sale>(sales, columnDefs, { groupBy: ["region"], aggregations: { umsatz: "sum" } });
 *
 * @since 1.1.94
 * @category Row grouping
 */
export interface RowGroupModelOptionsIf<T = any> {
  /** The levels, top first. An empty list shows the rows without groups. */
  groupBy: RowGroupField<T>[];
  /** The aggregates of the group rows; the key is the property of the column that shows it (`{ umsatz: "sum" }`). */
  aggregations?: AggregateSpecMap<T>;
  /** Which groups are expanded at the start and in new paths after regrouping. Default true. */
  expanded?: RowGroupExpanded<T>;
  /** The label of the group of empty keys (`null`, `undefined`, `""`). Default `"(empty)"`. */
  emptyLabel?: string;
  /** Label options of the group column (`showCount`, `label`). */
  groupColumn?: Partial<RowGroupColumnOptionsIf<T>>;
  /** Hide the columns of the grouped properties (their values are in the group column). Default true. */
  hideGroupedColumns?: boolean;
}
