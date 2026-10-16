import { GeCellIndices } from "./ge-cell-indices";
import type { CellChangeIf, CellChangeSource } from "../../../batch-edit/cell-change.if";

/**
 * Reported by {@link EventListenerIf.onModelChanged} after cells were edited: the row and column indices
 * of the changed cells. The new values are already written into the area model.
 *
 * Since 1.1.96 the event comes **once per change** – an edit, a fill (fill handle, Ctrl/⌘+D), a commit of a batch
 * edit or {@link TableApi.applyCellChanges} – with all cells, and {@link changes} tells old and new values.
 *
 * @example
 * override onModelChanged(evt: GeModelChangeEvent): void {
 *   for (const { rowIndex } of evt.cells) {
 *     const order = tableModel.getBodyModel().getRowByIndex(rowIndex) as Order;
 *     order.total = order.quantity * order.price;          // recalculate derived values
 *   }
 *   tableApi.repaint();
 * }
 *
 * @see Training: [Inline editing](https://gui.expert/training/inline-editing/)
 *
 * @category Events
 */
export class GeModelChangeEvent {

  constructor(
    public cells: GeCellIndices[],
    /**
     * The changed cells with row object, property, old and new value (since 1.1.96; `undefined` for events created by
     * own code with the old constructor).
     */
    public changes?: CellChangeIf[],
    /** What changed the cells: `"edit"`, `"fill"`, `"commit"` or `"api"` (since 1.1.96). */
    public source?: CellChangeSource
  ) {
  }

  /**
   * An event for a change set (since 1.1.96): `cells` from the row and column indices of the changes.
   *
   * @param {CellChangeIf[]} changes - the changed cells
   * @param {CellChangeSource} source - what changed them
   * @returns {GeModelChangeEvent} the event
   */
  static createForChanges(changes: CellChangeIf[], source: CellChangeSource): GeModelChangeEvent {
    // rows a filter hides (rowIndex -1, batch commit) are only in `changes` – `cells` are display indices
    const cells = changes.filter(c => c.rowIndex > -1).map(c => new GeCellIndices(c.rowIndex, c.columnIndex));
    return new GeModelChangeEvent(cells, changes, source);
  }

  static createSingle(rowIndex: number, columnIndex: number) {
    return new GeModelChangeEvent([new GeCellIndices(rowIndex, columnIndex)]);
  }
}
