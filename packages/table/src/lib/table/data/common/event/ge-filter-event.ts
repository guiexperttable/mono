import type { ColumnFiltersMap } from "../../../column-filter/column-filter.if";

/**
 * What triggered a column filter change ({@link GeFilterEvent.source}).
 *
 * @category Events
 * @since 1.1.114
 */
export type GeFilterEventSource = "row" | "menu" | "api" | "state";

/**
 * Reported by {@link EventListenerIf.onFilterChanged} after column filters changed, the table re-filtered and
 * rendered (so `tableApi.getDisplayedRowCount()` already equals {@link rowCount}).
 *
 * @example
 * const listener = new EventAdapter();
 * listener.onFilterChanged = (evt: GeFilterEvent) => {
 *   console.log(`${evt.rowCount} of ${evt.unfilteredRowCount} rows`, evt.filters);
 * };
 *
 * @category Events
 * @since 1.1.114
 */
export class GeFilterEvent {
  constructor(
    /** Snapshot of all currently active column filters (property → filter). */
    readonly filters: ColumnFiltersMap,
    /** Property of the changed column, or `undefined` for `setColumnFilters`, `clearColumnFilters` and state restore. */
    readonly property: string | undefined,
    /** What triggered the change. */
    readonly source: GeFilterEventSource,
    /** Displayed body row count after filtering. */
    readonly rowCount: number,
    /** Total body row count before filtering. */
    readonly unfilteredRowCount: number,
  ) {}
}
