import { AbstractAreaModel } from "./abstract-area-model";
import { AreaIdent } from "../area-ident.type";
import { ColumnDefIf } from "../column/column-def.if";
import { FilterFunction } from "../../common/filter-function";
import type { RowDropTargetIf } from "../../../row-drag/row-drop-target.if";
import { canMoveFlatRows, moveFlatRows } from "../../../row-drag/move-rows";

/**
 * Represents a model for an area containing a two-dimensional array of data.
 * @template T - The type of data in the array.
 *
 * @category Area models
 */
export class AreaModelArrayOfArrays<T> extends AbstractAreaModel<T[][]> {

  public filteredArr: T[][];

  constructor(
    public override areaIdent: AreaIdent,
    public readonly arr: T[][],
    public override defaultRowHeight: number,
    protected override columnDefs: ColumnDefIf[] = []
  ) {
    super(areaIdent, columnDefs, defaultRowHeight);
    this.filteredArr = [...arr];
  }

  externalFilterChanged(predictFn: FilterFunction<any>): void {
    this.filteredArr = this.arr ? this.arr.filter(predictFn) : [];
  }

  getRowCount(): number {
    if (this.filteredArr) {
      return this.filteredArr.length;
    }
    return 0;
  }

  /**
   * The number of all rows, without the external filter.
   *
   * @returns {number} the length of the array
   * @since 1.1.92
   */
  getUnfilteredRowCount(): number {
    return this.arr?.length ?? 0;
  }

  /**
   * Row drag: true if the rows can be moved (no filter hides a row, target `"before"` / `"after"` a row).
   *
   * @param {number[]} rowIndices - display indices of the dragged rows
   * @param {RowDropTargetIf} target - the drop target
   * @returns {boolean} true if {@link moveRows} would move them
   * @since 1.1.95
   */
  canMoveRows(rowIndices: number[], target: RowDropTargetIf): boolean {
    return canMoveFlatRows(this.filteredArr.length, this.arr.length, rowIndices, target);
  }

  /**
   * Row drag: moves the rows – in place in the displayed rows and in {@link arr}.
   *
   * @param {number[]} rowIndices - display indices of the dragged rows
   * @param {RowDropTargetIf} target - the drop target (display index before the move)
   * @returns {boolean} true if moved
   *
   * @example
   * const model = new AreaModelArrayOfArrays("body", [["a"], ["b"], ["c"]], 30);
   * model.moveRows([0], { rowIndex: 2, position: "after" });   // b, c, a
   *
   * @since 1.1.95
   */
  moveRows(rowIndices: number[], target: RowDropTargetIf): boolean {
    return moveFlatRows(this.filteredArr, this.arr, rowIndices, target);
  }

  getValueAt(rowIndex: number, columnIndex: number): any {
    const row = this.filteredArr[rowIndex];
    const value = row[columnIndex];
    // cell formulas (since 1.1.99): "=B2*C2" → its result
    return this.sheetCells && typeof value === "string" ? this.sheetCells.valueAt(row, columnIndex, value) : value;
  }

  /**
   * The input of a cell – the formula text of a cell formula (`"=B2*C2"`), otherwise the value (since 1.1.99,
   * {@link TableOptionsIf.cellFormulas}).
   *
   * @param {number} rowIndex - display index
   * @param {number} columnIndex - column
   * @returns {unknown} the input
   *
   * @example
   * new AreaModelArrayOfArrays("body", [[2, "=A1*2"]], 30).getInputValueAt(0, 1);   // "=A1*2"
   *
   * @since 1.1.99
   */
  getInputValueAt(rowIndex: number, columnIndex: number): unknown {
    return this.filteredArr[rowIndex]?.[columnIndex];
  }

  override setValue(rowIndex: number, columnIndex: number, value: any): boolean {
    const editInputPipe = this.columnDefs[columnIndex]?.editInputPipe;
    if (editInputPipe) {
      value = editInputPipe(value, rowIndex, columnIndex);
    }
    // display index → the shown row (before 1.1.96: `arr[rowIndex]` – with a filter the wrong row)
    const row = this.filteredArr[rowIndex];
    if (!row) {
      return false;
    }
    row[columnIndex] = value;
    return true;
  }

  override getRowByIndex(rowIndex: number): any {
    return this.filteredArr[rowIndex];
  }

  getRowHeight(_rowIndex: number): number {
    return this.defaultRowHeight;
  }

  /**
   * All rows share `defaultRowHeight` – unless a subclass overrides `getRowHeight()`, then row heights may
   * vary and `undefined` is returned.
   *
   * @returns {number | undefined} The constant row height or `undefined`.
   */
  getConstantRowHeight(): number | undefined {
    const ownImpl = this.getRowHeight === AreaModelArrayOfArrays.prototype.getRowHeight;
    return ownImpl && this.defaultRowHeight > 0 ? this.defaultRowHeight : undefined;
  }

  override changeColumnOrder(sourceColumnIndex: number, targetColumnIndex: number): void {
    this.filteredArr.forEach(row => this.arrayMove(row, sourceColumnIndex, targetColumnIndex));
    super.changeColumnOrder(sourceColumnIndex, targetColumnIndex);
  }


}

