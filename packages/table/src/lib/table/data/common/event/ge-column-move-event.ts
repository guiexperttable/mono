import type { ColumnDefIf } from "../../tablemodel/column/column-def.if";
import type { GeColumnDragEventType } from "./ge-column-resize-event";

/**
 * The user moves a column by dragging its header ({@link EventListenerIf.onColumnMoveStart},
 * {@link EventListenerIf.onColumnMoveEnd}).
 *
 * One start and one end per drag – no event for the steps in between (the table moves the column while the mouse
 * moves). Only user actions report it, not {@link TableApi.applyState} or `tableModel.changeColumnOrder()`. The end
 * comes after the table applied the order: in the handler `tableApi.getTableModel().getColumnDefs()` and
 * {@link TableApi.getState} already have it.
 *
 * @example
 * const listener = new EventAdapter();
 * listener.onColumnMoveEnd = (evt: GeColumnMoveEvent) => {
 *   if (evt.moved) {
 *     localStorage.setItem("column-order", JSON.stringify(evt.columnOrder));
 *   }
 * };
 *
 * @category Column drag
 * @since 1.1.110
 */
export class GeColumnMoveEvent {

  constructor(
    /** Phase: `"start"`, `"end"` or `"cancel"` (Escape: the old order is back). */
    public readonly type: GeColumnDragEventType,
    /** Model index of the column when the drag started. */
    public readonly fromIndex: number,
    /** Model index of the column now (`"start"` and `"cancel"`: `fromIndex`; `"end"`: also when it did not change). */
    public readonly toIndex: number,
    /** The column definition of the dragged column. */
    public readonly columnDef: ColumnDefIf | undefined,
    /** The property of the dragged column (`columnDef.property`). */
    public readonly property: string | undefined,
    /** The properties of all columns in the order now (after the move for `"end"`). */
    public readonly columnOrder: string[],
    /** The browser event behind it (mouse up; `undefined` for {@link TableApi.cancelColumnDrag}). */
    public readonly originalEvent?: Event
  ) {
  }

  /** true if the column has another index now (`toIndex !== fromIndex`). */
  get moved(): boolean {
    return this.toIndex !== this.fromIndex;
  }
}
