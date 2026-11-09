import type { ColumnDefIf } from "../../tablemodel/column/column-def.if";

/**
 * Phase of a column drag (resize or move): `"start"` (the mouse moved past the drag threshold of 4 px, or a double
 * click on the resize handle), `"end"` (released – also outside of the table) or `"cancel"` (Escape,
 * {@link TableApi.cancelColumnDrag}: the old width resp. order is back).
 *
 * @category Column drag
 * @since 1.1.110
 */
export type GeColumnDragEventType = "start" | "end" | "cancel";

/**
 * What changed the width: dragging the resize handle (`"mouse"`) or a double click on it (`"dblclick"`, fits the width
 * to the content).
 *
 * @category Column drag
 * @since 1.1.110
 */
export type GeColumnResizeSource = "mouse" | "dblclick";

/**
 * The user resizes a column ({@link EventListenerIf.onColumnResizeStart}, {@link EventListenerIf.onColumnResizeEnd}).
 *
 * Only user actions report it – not {@link TableApi.setColumnWidth}, {@link TableApi.applyState},
 * {@link TableApi.autoResizeColumns} or {@link TableApi.autoResizeColumn}. The end comes once per start, after the
 * table applied the width: in the handler {@link TableApi.getState} and the table model already have it.
 *
 * @example
 * const listener = new EventAdapter();
 * listener.onColumnResizeEnd = (evt: GeColumnResizeEvent) => {
 *   if (evt.type === "end" && evt.property) {
 *     localStorage.setItem(`width-${evt.property}`, String(evt.newWidth));
 *   }
 * };
 *
 * @category Column drag
 * @since 1.1.110
 */
export class GeColumnResizeEvent {

  constructor(
    /** Phase: `"start"`, `"end"` or `"cancel"`. */
    public readonly type: GeColumnDragEventType,
    /** Dragging the handle or a double click on it. */
    public readonly source: GeColumnResizeSource,
    /** Model index of the column (over west, center and east). */
    public readonly columnIndex: number,
    /** The column definition – `undefined` for a table model without column definitions. */
    public readonly columnDef: ColumnDefIf | undefined,
    /** The property of the column (`columnDef.property`) – use it to store the width, indices change. */
    public readonly property: string | undefined,
    /** Width in px when the drag started. */
    public readonly oldWidth: number,
    /** Width in px now: `"start"` = `oldWidth`, `"end"` = the new width, `"cancel"` = `oldWidth` again. */
    public readonly newWidth: number,
    /** The browser event behind it (mouse up, double click; `undefined` for {@link TableApi.cancelColumnDrag}). */
    public readonly originalEvent?: Event
  ) {
  }
}
