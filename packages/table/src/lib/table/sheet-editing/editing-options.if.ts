/**
 * Excel-style editing ({@link TableOptionsIf.editing}): what typing, Enter, Tab, the arrow keys and Delete do.
 * `editing: true` uses the defaults of {@link EditingOptions}; an object overrides single values.
 *
 * @example
 * const tableOptions: TableOptionsIf = {
 *   ...new TableOptions(),
 *   getSelectionModel: () => selectionModel,           // new SelectionModel("range", "multi")
 *   editing: { enterKey: "moveDown", textSelection: "end" },   // Enter moves down like Excel
 * };
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export interface EditingOptionsIf {
  /** A printable key on a focused editable cell opens the editor with that character ("enter" mode). Default `true`. */
  startOnType: boolean;
  /**
   * Enter on a cell without editor: `"edit"` opens the editor (Google Sheets, default), `"moveDown"` moves down
   * (Excel). Checkbox, tree, group and detail cells keep their own Enter action.
   */
  enterKey: "edit" | "moveDown";
  /** Where Enter in the editor goes after committing (Shift+Enter: the opposite). Default `"down"`. */
  enterMoves: "down" | "right" | "none";
  /**
   * Tab/Shift+Tab commit and move to the next/previous shown column. In the last (first) column Tab is not used:
   * the browser focus leaves the table (no keyboard trap). Default `true`.
   */
  tabMoves: boolean;
  /** In "enter" mode (opened by typing) the arrow keys commit and move; in "edit" mode they move the caret. Default `true`. */
  arrowKeysCommit: boolean;
  /** Enter and double click select the text of the editor (`"all"`, default) or put the caret at the end; F2 always at the end. */
  textSelection: "all" | "end";
  /** Delete clears the selected cells, Backspace clears one cell and opens the editor. Default `true`. */
  clearKeys: boolean;
  /** Ctrl/⌘+Enter in the editor writes the input into all selected cells. Default `true`. */
  ctrlEnterFillsSelection: boolean;
  /** Arrow keys, Tab, Enter and clicks select the active cell (Excel); Shift+arrows extend from it. Default `true`. */
  collapseSelectionOnNavigate: boolean;
  /** The value of a cleared cell (a column can have its own: {@link ColumnDefIf.emptyValue}). Default `""`. */
  emptyValue: unknown;
  /**
   * `true`: columns without an own `editable` are editable (row numbers, checkbox and group columns, calculated
   * columns without `valueSetter` stay read only). Default `false`.
   */
  defaultEditable: boolean;
  /** At most this many cells are cleared at once (Delete). Default 1 000 000. */
  maxClearCells: number;
}
