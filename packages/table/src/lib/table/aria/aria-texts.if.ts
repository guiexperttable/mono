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
}
