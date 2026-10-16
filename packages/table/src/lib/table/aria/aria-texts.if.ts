import { SortState } from "../data/common/sort-state.type";

/**
 * The texts the table speaks to screen reader users: announcements of the live region (sorting, filter, copy,
 * select all) and the accessible names of controls the table renders (row checkboxes, header group toggles).
 *
 * The defaults are English ({@link AriaTexts}). Override single functions – e.g. for another language – with
 * {@link TableOptionsIf.ariaTexts}; the others keep their default.
 *
 * Every function returns plain text. It is written with `textContent` / `setAttribute`, never as HTML,
 * so data in it (column labels, group labels) needs no escaping.
 *
 * @example
 * const tableOptions: TableOptionsIf = {
 *   ...new TableOptions(),
 *   ariaTexts: {
 *     filtered: (rowCount: number) => `${rowCount} Zeilen`,
 *     sorted: (column: string, state: SortState) => state ? `Sortiert nach ${column}` : `Sortierung entfernt`,
 *   },
 * };
 *
 * @since 1.1.91
 * @see Training: [Accessible tables: keyboard and screen readers](https://gui.expert/training/accessibility/)
 * @category Accessibility
 */
export interface AriaTextsIf {

  /**
   * Announced after a column was sorted (header double click, Enter on a header cell, {@link TableApi.sortByColumn}).
   *
   * @param {string} columnLabel - the header label of the column
   * @param {SortState} sortState - the new sort state, `""` = unsorted
   * @returns {string} default: `"Sorted by Total, descending"`, `"Sorting of Total removed"`
   */
  sorted(columnLabel: string, sortState: SortState): string;

  /**
   * Announced after the external filter changed ({@link TableApi.externalFilterChanged}).
   *
   * @param {number} rowCount - the number of rows the body shows now
   * @returns {string} default: `"42 rows"`, `"1 row"`, `"No rows"`
   */
  filtered(rowCount: number): string;

  /**
   * Announced after cells were copied to the clipboard (Ctrl/⌘+C, {@link TableApi.copyToClipboard}).
   *
   * @param {number} cellCount - the number of copied cells
   * @returns {string} default: `"12 cells copied"`, `"1 cell copied"`
   */
  copied(cellCount: number): string;

  /**
   * Announced after Ctrl/⌘+A.
   *
   * @returns {string} default: `"All cells selected"`
   */
  allSelected(): string;

  /**
   * Announced after the selection was cleared by the keyboard (e.g. Ctrl+Shift+A).
   *
   * @returns {string} default: `"Selection cleared"`
   */
  selectionCleared(): string;

  /**
   * The accessible name of the checkbox of a body row.
   *
   * @param {number} rowNumber - 1-based number of the row in the body
   * @returns {string} default: `"Select row 5"`
   */
  selectRow(rowNumber: number): string;

  /**
   * The accessible name of the checkbox in the header (checks all rows).
   *
   * @returns {string} default: `"Select all rows"`
   */
  selectAllRows(): string;

  /**
   * The accessible name of the toggle button of a collapsed header group.
   *
   * @param {string} groupLabel - the label of the group
   * @returns {string} default: `"Expand group Q1"`
   */
  expandGroup(groupLabel: string): string;

  /**
   * The accessible name of the toggle button of an expanded header group.
   *
   * @param {string} groupLabel - the label of the group
   * @returns {string} default: `"Collapse group Q1"`
   */
  collapseGroup(groupLabel: string): string;

  /**
   * Announced when a row drag starts (optional – {@link AriaTexts} has a default).
   *
   * @param {number} rowCount - number of dragged rows
   * @returns {string} default: `"Dragging 1 row. Press Escape to cancel."`
   * @since 1.1.95
   */
  rowDragStarted?(rowCount: number): string;

  /**
   * Announced after rows were moved by drag and drop or Ctrl+Alt+↑/↓ (optional – {@link AriaTexts} has a default).
   *
   * @param {number} position - 1-based position of the first moved row
   * @param {number} rowCount - number of displayed rows
   * @returns {string} default: `"Row moved to position 7 of 20"`
   * @since 1.1.95
   */
  rowMoved?(position: number, rowCount: number): string;

  /**
   * Announced when rows cannot be moved: the table is sorted or filtered (managed row drag), or the row cannot move
   * further (optional – {@link AriaTexts} has a default).
   *
   * @returns {string} default: `"Rows cannot be moved while the table is sorted or filtered"`
   * @since 1.1.95
   */
  rowMoveNotPossible?(): string;

  /**
   * Announced when a row drag was cancelled (Escape) – optional, {@link AriaTexts} has a default.
   *
   * @returns {string} default: `"Drag cancelled"`
   * @since 1.1.95
   */
  rowDragCancelled?(): string;

  /**
   * Announced after a fill (fill handle, Ctrl/⌘+D, Ctrl/⌘+R) – optional, {@link AriaTexts} has a default.
   *
   * @param {number} cellCount - the number of filled cells
   * @returns {string} default: `"3 cells filled"`
   * @since 1.1.96
   */
  cellsFilled?(cellCount: number): string;

  /**
   * Announced when a fill is refused because it covers too many cells ({@link FillHandleOptionsIf.maxCells}).
   *
   * @param {number} maxCells - the limit
   * @returns {string} default: `"Too many cells to fill (at most 100000)"`
   * @since 1.1.96
   */
  fillTooLarge?(maxCells: number): string;

  /**
   * Announced after a value was marked in a batch edit (or set back).
   *
   * @param {number} pendingCount - the number of pending cells
   * @returns {string} default: `"3 changes not saved"`, `"No unsaved changes"`
   * @since 1.1.96
   */
  pendingChanges?(pendingCount: number): string;

  /**
   * Announced after {@link TableApi.commitBatchEdit}.
   *
   * @param {number} cellCount - the number of written cells
   * @returns {string} default: `"3 changes saved"`
   * @since 1.1.96
   */
  changesCommitted?(cellCount: number): string;

  /**
   * Announced after {@link TableApi.cancelBatchEdit}.
   *
   * @returns {string} default: `"Changes discarded"`
   * @since 1.1.96
   */
  changesDiscarded?(): string;

  /**
   * Announced when invalid values block {@link TableApi.commitBatchEdit}.
   *
   * @param {number} invalidCount - the number of invalid cells
   * @returns {string} default: `"2 invalid values – nothing saved"`
   * @since 1.1.96
   */
  commitBlocked?(invalidCount: number): string;

  /**
   * Announced when an edited value is invalid ({@link ColumnDefIf.validate}) and not written (without batch edit).
   *
   * @param {string} message - the message of the validator
   * @returns {string} default: `"Invalid value: <message>"`
   * @since 1.1.96
   */
  invalidValue?(message: string): string;

  /**
   * Announced after a detail row was expanded (master/detail).
   *
   * @returns {string} default: `"Details expanded"`
   * @since 1.1.97
   */
  detailExpanded?(): string;

  /**
   * Announced after a detail row was collapsed (master/detail).
   *
   * @returns {string} default: `"Details collapsed"`
   * @since 1.1.97
   */
  detailCollapsed?(): string;

  /**
   * Announced when the cell editor opens (Excel-style editing).
   *
   * @param {string} columnLabel - the column label
   * @returns {string} default: `"Editing Price"`
   * @since 1.1.99
   */
  editingStarted?(columnLabel: string): string;

  /**
   * Announced when a key is typed on a cell that cannot be edited (Excel-style editing).
   *
   * @returns {string} default: `"Read only"`
   * @since 1.1.99
   */
  readOnlyCell?(): string;

  /**
   * Announced after Delete/Backspace cleared cells.
   *
   * @param {number} cellCount - the number of cleared cells
   * @returns {string} default: `"8 cells cleared"`
   * @since 1.1.99
   */
  cellsCleared?(cellCount: number): string;

  /**
   * Announced when more cells should be cleared than `EditingOptionsIf.maxClearCells` allows.
   *
   * @param {number} maxCells - the limit
   * @returns {string} default: `"Too many cells to clear (at most 1000000)"`
   * @since 1.1.99
   */
  clearTooLarge?(maxCells: number): string;

  /**
   * Announced when Shift+arrows change the selected range (the focus stays on the active cell).
   *
   * @param {number} rowCount - rows of the range
   * @param {number} columnCount - shown columns of the range
   * @returns {string} default: `"3 rows, 2 columns selected"`
   * @since 1.1.99
   */
  rangeSelected?(rowCount: number, columnCount: number): string;

  /**
   * Announced after Shift+Space selected the rows of the active cell.
   *
   * @param {number} rowCount - number of selected rows
   * @returns {string} default: `"Row selected"`
   * @since 1.1.99
   */
  rowSelected?(rowCount: number): string;

  /**
   * Announced after Ctrl+Space selected the columns of the active cell.
   *
   * @param {number} columnCount - number of selected columns
   * @returns {string} default: `"Column selected"`
   * @since 1.1.99
   */
  columnSelected?(columnCount: number): string;

  /**
   * The description of the grid with Excel-style editing (`aria-description` of the host): how it is used.
   *
   * @returns {string} default: `"Type to edit a cell, Enter to edit or commit, Escape to cancel. Tab in the last column leaves the table."`
   * @since 1.1.99
   */
  gridEditingHint?(): string;
}
