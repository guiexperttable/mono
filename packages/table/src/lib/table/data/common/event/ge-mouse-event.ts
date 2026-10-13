import { AreaIdent } from "../../tablemodel/area-ident.type";
import { SideIdent } from "../../side-ident.type";

/**
 * A mouse event of the table: where it happened (area, side, row, column) plus the browser event.
 * Passed to {@link EventListenerIf.onMouseClicked}, {@link EventListenerIf.onContextmenu} and the other mouse methods.
 *
 * `rowIndex` is the row as **displayed** (after filter and sorting) – get your object with
 * `tableModel.getBodyModel().getRowByIndex(evt.rowIndex)`.
 *
 * @example
 * override onContextmenu(evt: GeMouseEvent): void {
 *   if (evt.areaIdent !== "body" || evt.rowIndex < 0) return;
 *   evt.originalEvent?.preventDefault();                       // no browser menu
 *   showMyMenu(evt.originalEvent!.clientX, evt.originalEvent!.clientY, evt.rowIndex);
 * }
 *
 * @see Training: [Events and a context menu of your own](https://gui.expert/training/events-and-context-menu/)
 *
 * @category Events
 */
export class GeMouseEvent {


  constructor(
    /** Row index in the area (as displayed); -1 outside of rows. */
    public rowIndex: number = -1,
    /** Top position of the row in px. */
    public rowTop: number = -1,
    /** Column index (model index over west + center + east); -1 outside of columns. */
    public columnIndex: number = -1,
    /** Left position of the column in px. */
    public columnLeft: number = -1,
    /** `"header"`, `"body"` or `"footer"`. */
    public areaIdent?: AreaIdent,
    /** `"west"` (fixed left), `"center"` or `"east"` (fixed right). */
    public sideIdent?: SideIdent,
    /** The browser event – position, buttons, modifier keys. */
    public originalEvent?: MouseEvent,
    /** 1 = click, 2 = double-click on the same cell. */
    public clickCount: number = 0,
    /** Horizontal distance in px while dragging. */
    public draggingX: number = 0,
    /** Vertical distance in px while dragging. */
    public draggingY: number = 0,
    /** Internal action of the clicked element (e.g. a tree arrow), otherwise empty. */
    public action: string | null = ""
  ) {
  }

  clone(): GeMouseEvent {
    return new GeMouseEvent(
      this.rowIndex,
      this.rowTop,
      this.columnIndex,
      this.columnLeft,
      this.areaIdent,
      this.sideIdent,
      this.originalEvent,
      this.clickCount,
      this.draggingX,
      this.draggingY,
      this.action
    );
  }

}
