
import {
  FocusModelIf,
  GeBatchEditEvent, GeDetailEvent, GeEditEvent, GeUndoEvent, GeColumnResizeEvent, GeColumnMoveEvent, GeModelChangeEvent, GeMouseEvent, GeRowDragEvent, GeScrollEvent, GeStateChangeEvent, SelectionModelIf, TableApi, TableModelIf, TableOptions
} from '@guiexpert/table';

export type GeMouseEventFn = (evt: GeMouseEvent) => void;
export type GeCheckboxEventFn = (evt: any[]) => void;
export type GeTableReadyEventFn = (evt: TableApi) => void;
export type GeModelChangeEventFn = (evt: GeModelChangeEvent) => void;
export type GeSelectionChangeEventFn = (evt: SelectionModelIf) => void;
export type GeFocusChangeEventFn = (evt: FocusModelIf) => void;
export type GeScrollEventFn = (evt: GeScrollEvent) => void;
export type GeStateChangeEventFn = (evt: GeStateChangeEvent) => void;
export type GeRowDragEventFn = (evt: GeRowDragEvent) => void;
export type GeBatchEditEventFn = (evt: GeBatchEditEvent) => void;
export type GeDetailEventFn = (evt: GeDetailEvent) => void;
export type GeEditEventFn = (evt: GeEditEvent) => void;
export type GeUndoEventFn = (evt: GeUndoEvent) => void;
export type GeColumnResizeEventFn = (evt: GeColumnResizeEvent) => void;
export type GeColumnMoveEventFn = (evt: GeColumnMoveEvent) => void;


export interface GuiexpertTableProps {
  tableModel: TableModelIf,
  tableOptions?: TableOptions,
  scroll?: GeScrollEventFn,
  mouseMoved?: GeMouseEventFn,
  contextmenu?: GeMouseEventFn,
  mouseClicked?: GeMouseEventFn,
  mouseDragging?: GeMouseEventFn,
  mouseDraggingEnd?: GeMouseEventFn,
  checkboxChanged?: GeCheckboxEventFn,
  modelChanged?: GeModelChangeEventFn,
  selectionChanged?: GeSelectionChangeEventFn;
  focusChanged?: GeFocusChangeEventFn;
  /**
   * The state changed (column layout, sorting, scroll position, tree, checked/selected rows …) – once after the
   * changes settled. Save `evt.state` (e.g. on your server) and pass it back as `tableOptions.initialState`.
   * @since 1.1.92
   */
  stateChanged?: GeStateChangeEventFn,
  /** Row drag (since 1.1.95, handles via `ColumnDef.rowDrag`): started / target changed / ended ("end" or "cancel"). */
  rowDragStart?: GeRowDragEventFn,
  rowDragMove?: GeRowDragEventFn,
  rowDragEnd?: GeRowDragEventFn,
  /** Batch edit: values marked, set back, written or discarded (since 1.1.96). */
  batchEditChanged?: GeBatchEditEventFn,
  /** Master/detail: a detail row was expanded or collapsed (since 1.1.97). */
  detailExpandedChanged?: GeDetailEventFn,
  /** The cell editor opened, its text changed, it committed or it was cancelled (since 1.1.99). */
  editingChanged?: GeEditEventFn,
  /** The undo history changed (since 1.1.99). */
  undoStackChanged?: GeUndoEventFn,
  /** The user started to resize a column (since 1.1.110). */
  columnResizeStart?: GeColumnResizeEventFn,
  /** A column resize by the user ended – `evt.type` "end" or "cancel"; save the layout here (since 1.1.110). */
  columnResizeEnd?: GeColumnResizeEventFn,
  /** The user started to move a column (since 1.1.110). */
  columnMoveStart?: GeColumnMoveEventFn,
  /** A column move by the user ended – `evt.columnOrder` (since 1.1.110). */
  columnMoveEnd?: GeColumnMoveEventFn,
  tableReady?: GeTableReadyEventFn,
  licenseKey?: string,
  /**
   * `true` shows the loading overlay ("Loading…" with a CSS spinner) over the body, `false` hides it.
   * Changing it does **not** re-create the table. Texts: `tableOptions.overlayOptions`. @since 1.1.92
   */
  loading?: boolean,
}

