/**
 * Options of row dragging ({@link TableOptionsIf.rowDragOptions}). Rows get a drag handle in every column with
 * {@link ColumnDefIf.rowDrag} (or `TableFactory.createTableModel({ rows, rowDrag: true })`).
 *
 * @example
 * const tableOptions: TableOptionsIf = {
 *   ...new TableOptions(),
 *   rowDragOptions: { managed: false, autoScrollMaxSpeedInPx: 40 }   // events only – the app moves the rows
 * };
 *
 * @category Row drag
 * @since 1.1.95
 */
export interface RowDragOptionsIf {

  /**
   * `true` (default): the table moves the rows itself (`AreaModelIf.moveRows`) – only while the table is neither
   * sorted (a column with sort state asc/desc) nor filtered. `false`: the table only reports the drag
   * (`onRowDragStart/Move/End`), the app moves the rows (e.g. after the server confirmed), always allowed.
   */
  managed: boolean;

  /** `true` (default): grabbing a selected row drags all rows with a selection (their order stays). */
  multiRow: boolean;

  /** `true` (default): tree – dropping on the middle of a row makes the rows its children. */
  treeDropInside: boolean;

  /** Distance in px the pointer has to move before a drag starts (default 4) – below it is a click on the handle. */
  dragThresholdInPx: number;

  /** Height in px of the zone at the top and bottom edge of the body that scrolls automatically (default 40). */
  autoScrollZoneInPx: number;

  /** Maximum auto-scroll speed in px per animation frame (default 24). */
  autoScrollMaxSpeedInPx: number;

  /**
   * Text of the drag ghost. Default: the text of the handle cell of the first row, "(+2)" for two more rows.
   * The text is shown as text (never as HTML).
   */
  ghostText?: (rows: any[]) => string;
}
