/**
 * Where dragged rows are dropped, relative to the row under the drop marker:
 * `"before"` / `"after"` that row, or `"inside"` it (it becomes the last child – trees only).
 *
 * @example
 * const target: RowDropTargetIf = { rowIndex: 7, position: "before" };   // between row 7 and row 8 (1-based)
 *
 * @category Row drag
 * @since 1.1.95
 */
export type RowDropPosition = "before" | "after" | "inside";

/**
 * The drop target of a row drag ({@link GeRowDragEvent.target}, {@link TableApi.moveRows}).
 *
 * `rowIndex` is the display index (body row index) of the target row **before** the rows are moved.
 *
 * @example
 * // move the rows 2 and 3 behind the last row
 * tableApi.moveRows([2, 3], { rowIndex: tableApi.getDisplayedRowCount() - 1, position: "after" });
 *
 * @category Row drag
 * @since 1.1.95
 */
export interface RowDropTargetIf {
  /** Display index of the row next to (or under) the drop marker – before the move. */
  rowIndex: number;
  /** Before or after that row, or inside it (tree: becomes its last child). */
  position: RowDropPosition;
}
