import { AbstractAreaModel } from "./abstract-area-model";
import { AreaIdent } from "../area-ident.type";
import { ColumnDefIf } from "../column/column-def.if";
import { FilterFunction } from "../../common/filter-function";

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
   * @since 1.1.91
   */
  getUnfilteredRowCount(): number {
    return this.arr?.length ?? 0;
  }

  getValueAt(rowIndex: number, columnIndex: number): any {
    return this.filteredArr[rowIndex][columnIndex];
  }

  override setValue(rowIndex: number, columnIndex: number, value: any): boolean {
    const editInputPipe = this.columnDefs[columnIndex]?.editInputPipe;
    if (editInputPipe) {
      value = editInputPipe(value, rowIndex, columnIndex);
    }
    this.arr[rowIndex][columnIndex] = value;
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

