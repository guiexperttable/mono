/**
 * What started a change of cells: `"edit"` (cell editor), `"fill"` (fill handle, Ctrl/⌘+D, Ctrl/⌘+R),
 * `"commit"` ({@link TableApi.commitBatchEdit}), `"api"` ({@link TableApi.applyCellChanges}) or – since 1.1.99 –
 * `"clear"` (Delete/Backspace in Excel-style editing, {@link TableApi.clearCells}), `"paste"` (Ctrl/⌘+V,
 * {@link TableApi.pasteText}), `"cut"` (pasting cut cells: target and emptied source in one change set), `"undo"` and
 * `"redo"` ({@link TableApi.undo}, {@link TableApi.redo}), `"structure"` (rows or columns inserted or deleted,
 * {@link TableApi.insertRows} – the changes are the formulas whose references were adjusted).
 *
 * @category Fill handle & batch edit
 * @since 1.1.96
 */
export type CellChangeSource = "edit" | "fill" | "commit" | "api" | "clear" | "paste" | "cut" | "undo" | "redo"
  | "structure";

/**
 * One changed cell: row, column, old and new value – the unit of a change set ({@link GeModelChangeEvent.changes},
 * {@link TableApi.getPendingChanges}). With old **and** new value it is enough for undo and redo.
 *
 * @example
 * const listener = new EventAdapter();
 * listener.onModelChanged = (evt: GeModelChangeEvent) => {
 *   for (const change of evt.changes ?? []) {
 *     console.log(change.property, change.oldValue, "→", change.newValue, change.row);
 *   }
 * };
 *
 * @category Fill handle & batch edit
 * @since 1.1.96
 */
export interface CellChangeIf<T = any> {
  /** The row object (tree: the data of the `TreeRow`); `undefined` for own area models without row objects. */
  row: T;
  /** Display index of the row when the change was reported, `-1` if a filter hides the row. */
  rowIndex: number;
  /** Model index of the column when the change was reported, `-1` if the column no longer exists. */
  columnIndex: number;
  /** The property of the column (`"#3"` for a column without property). */
  property: string;
  /** The value before the change (batch edit: before the first change of the cell). */
  oldValue: unknown;
  /** The new value (after the column's `editInputPipe`). */
  newValue: unknown;
  /** Batch edit: the message of {@link ColumnDefIf.validate} if the new value is invalid. */
  error?: string;
}
