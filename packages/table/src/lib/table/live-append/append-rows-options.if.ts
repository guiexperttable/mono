/**
 * Where the view goes after new rows came in (`tableApi.appendRows()` / `rowsAppended()`):
 * - `"auto"` (default): it follows the end if it was at the end before ("tail -f"), otherwise the first visible row
 *   stays where it is;
 * - `true`: always to the end;
 * - `false`: the first visible row always stays (a "freeze scroll" button of the app).
 *
 * While the mouse button is held in the table (a click, a drag), `"auto"` keeps the row – the content does not slide
 * away under the pointer.
 *
 * @category Live data
 * @since 1.1.108
 */
export type AppendFollowMode = "auto" | boolean;

/**
 * Options of `tableApi.appendRows(rows, options)`.
 *
 * @example
 * const result = tableApi.appendRows(lines, { follow: "auto", maxRows: 1_000_000 });
 *
 * @category Live data
 * @since 1.1.108
 */
export interface AppendRowsOptionsIf {
  /** Where the view goes – see {@link AppendFollowMode}. Default `"auto"`. */
  follow?: AppendFollowMode;
  /**
   * Ring buffer: keep at most this many rows – the oldest (first) rows of the data are removed from the start, in
   * blocks of at least 1 % of `maxRows` (removing from the start of an array moves all rows: O(n) – the blocks make
   * that rare), so the row count stays between 99 % and 100 % of `maxRows`.
   * Selection, focus and the visible row stay at their rows; a selected row that is removed leaves the selection.
   */
  maxRows?: number;
}

/**
 * Options of `tableApi.rowsAppended(count, options)` – an own area model that appended (and maybe removed) rows
 * itself.
 *
 * @example
 * const logLines: string[] = [];             // the data of an own area model
 * for (const line of newLines) logLines.push(line);
 * const dropped = Math.max(0, logLines.length - 100_000);
 * logLines.splice(0, dropped);               // the app keeps its own ring buffer
 * tableApi.rowsAppended(newLines.length, { follow: "auto", removedAtStart: dropped });
 *
 * @category Live data
 * @since 1.1.108
 */
export interface RowsAppendedOptionsIf {
  /** Where the view goes – see {@link AppendFollowMode}. Default `"auto"`. */
  follow?: AppendFollowMode;
  /** Number of rows the app removed at the start (display indices 0 … n-1 before the step). Default 0. */
  removedAtStart?: number;
}

/**
 * Result of `tableApi.appendRows()` / `rowsAppended()`.
 *
 * @category Live data
 * @since 1.1.108
 */
export interface AppendRowsResultIf {
  /** rows added to the data */
  added: number;
  /** of them shown (an active filter hides the others) */
  shown: number;
  /** rows removed at the start (`maxRows` / `removedAtStart`) */
  removed: number;
  /** true if the view follows the end after this update */
  following: boolean;
}

/**
 * What a table passes to {@link AreaModelIf.appendRows}: the active filter and sort order, so the model treats only
 * the new rows (O(k) unsorted, O(n + k) sorted).
 *
 * @category Live data
 * @since 1.1.108
 */
export interface AppendRowsContextIf<T = unknown> {
  /** the active filter (`tableOptions.externalFilterFunction`) – new rows it rejects are kept but not shown */
  filter?: (row: T) => boolean;
  /** the active sort order – new rows are inserted at their place (stable: behind equal rows) */
  compare?: (a: T, b: T) => number;
  /** ring buffer size, see {@link AppendRowsOptionsIf.maxRows} */
  maxRows?: number;
}

/**
 * What {@link AreaModelIf.appendRows} did – the table moves selection, focus and position along.
 *
 * @category Live data
 * @since 1.1.108
 */
export interface AppendRowsModelResultIf {
  added: number;
  shown: number;
  /** rows removed from the data */
  removed: number;
  /** display indices **before** the step of the removed rows that were shown, ascending */
  removedPositions: Int32Array;
  /** display indices **after** the step of the new shown rows, ascending */
  insertedPositions: Int32Array;
}
