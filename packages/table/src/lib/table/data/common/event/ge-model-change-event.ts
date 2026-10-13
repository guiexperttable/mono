import { GeCellIndices } from "./ge-cell-indices";

/**
 * Reported by {@link EventListenerIf.onModelChanged} after cells were edited: the row and column indices
 * of the changed cells. The new values are already written into the area model.
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
    public cells: GeCellIndices[]
  ) {
  }

  static createSingle(rowIndex: number, columnIndex: number) {
    return new GeModelChangeEvent([new GeCellIndices(rowIndex, columnIndex)]);
  }
}
