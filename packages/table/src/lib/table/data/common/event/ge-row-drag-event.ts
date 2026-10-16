import type { RowDropTargetIf } from "../../../row-drag/row-drop-target.if";

/**
 * Phase of a row drag: `"start"` (the pointer moved past the threshold, or a move key), `"move"` (the drop target
 * changed), `"end"` (dropped) or `"cancel"` (Escape, `pointercancel`, `tableApi.cancelRowDrag()`, destroy).
 *
 * @category Row drag
 * @since 1.1.95
 */
export type GeRowDragEventType = "start" | "move" | "end" | "cancel";

/**
 * What started the drag: the pointer (mouse, touch, pen) on a drag handle, or the keyboard
 * (`MOVE_ROW_UP` / `MOVE_ROW_DOWN`, Ctrl+Alt+↑/↓).
 *
 * @category Row drag
 * @since 1.1.95
 */
export type GeRowDragSource = "pointer" | "keyboard";

/**
 * A row drag ({@link EventListenerIf.onRowDragStart}, {@link EventListenerIf.onRowDragMove},
 * {@link EventListenerIf.onRowDragEnd}).
 *
 * Call {@link preventDefault} to veto: in `"start"` no drag happens, in `"move"` the target is invalid (no drop
 * marker, no drop). In managed mode `"end"` comes after the move (`moved`, `toIndex` = the real position).
 *
 * @example
 * const listener = new EventAdapter();
 * listener.onRowDragEnd = (evt: GeRowDragEvent<Order>) => {
 *   if (evt.moved) {
 *     const ids = evt.rows.map(order => order.id);
 *     void fetch("/api/orders/move", { method: "POST", body: JSON.stringify({ ids, toIndex: evt.toIndex }) });
 *   }
 * };
 *
 * @category Row drag
 * @since 1.1.95
 */
export class GeRowDragEvent<T = any> {

  /** true if the moved rows changed in the table (managed mode, `"end"`, not prevented). */
  moved = false;

  private prevented = false;

  constructor(
    /** Phase of the drag. */
    public readonly type: GeRowDragEventType,
    /** Pointer or keyboard. */
    public readonly source: GeRowDragSource,
    /** The dragged row objects (tree: the `TreeRow`s) in display order. */
    public readonly rows: T[],
    /** Display indices of the dragged rows when the drag started (ascending). */
    public readonly rowIndices: number[],
    /** The current drop target – `undefined` if there is none (invalid, vetoed, outside the table). */
    public readonly target: RowDropTargetIf | undefined,
    /**
     * Flat tables: display index of the first dragged row after the drop (`0` = first row), `-1` without target.
     * Trees: `-1` before the move; in a managed `"end"` the index the row really got.
     */
    public toIndex: number,
    /** true if the pointer is outside the table – e.g. over an own drop zone of the page. */
    public readonly outside: boolean,
    /** true if the table moves the rows itself ({@link RowDragOptionsIf.managed}). */
    public readonly managed: boolean,
    /** The browser event behind this event (pointer or keyboard). */
    public readonly originalEvent?: PointerEvent | KeyboardEvent
  ) {
  }

  /** true after {@link preventDefault}. */
  get defaultPrevented(): boolean {
    return this.prevented;
  }

  /** Veto: no drag (`"start"`), invalid target (`"move"`); no effect in `"end"` and `"cancel"`. */
  preventDefault(): void {
    this.prevented = true;
  }
}
