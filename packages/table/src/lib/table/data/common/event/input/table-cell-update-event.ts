import { TableCellUpdateEventIf } from "./table-cell-update-event.if";
import { AreaIdent } from "../../../tablemodel/area-ident.type";

/**
 * A new value for one cell – the input of {@link TableApi.updateCells}.
 * The value is written into the area model; if the cell is visible, only this cell is redrawn.
 * `cssClasses` are applied to the current drawing of the cell (e.g. a short "flash"); permanent colours
 * belong into the model ({@link AreaModelIf.getCustomClassesAt}).
 *
 * @example
 * tableApi.updateCells([
 *   new TableCellUpdateEvent("body", row, 2, price, { "tick-up": up, "tick-down": !up }),
 *   new TableCellUpdateEvent("body", row, 4, volume)
 * ]);
 *
 * @see Training: [Live data without rebuilding the table](https://gui.expert/training/live-data/)
 *
 * @category Events
 */
export class TableCellUpdateEvent implements TableCellUpdateEventIf {

  constructor(
    public area: AreaIdent,
    public rowIndex: number,
    public columnIndex: number,
    public value: any,
    public cssClasses: {[key:string]: boolean} = {},
  ) {
  }

}
