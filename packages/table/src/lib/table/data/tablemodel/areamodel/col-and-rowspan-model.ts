import { CellRange } from "../../common/cell-range";
import { AreaModelIf } from "./area-model.if";
import { TableModelIf } from "../table-model.if";

/**
 * Represents a model for handling colspan and rowspan in a table.
 *
 * @category Area models
 */
export class ColAndRowspanModel {

  protected colAndRowspanRanges: CellRange[] | undefined = undefined;

  constructor(
    protected tableModel: TableModelIf,
    protected areaModel: AreaModelIf
  ) {
  }

  /** Row count of the area model at the last {@link init} (−1: not initialized yet). */
  protected rowCountAtInit = -1;

  init() {
    this.rowCountAtInit = this.areaModel.getRowCount();
    if (this.areaModel.getMaxColspan() < 2 && this.areaModel.getMaxRowspan() < 2) {
      this.colAndRowspanRanges = undefined;
      return; // skip
    }
    this.colAndRowspanRanges = [];
    const rowCount = this.areaModel.getRowCount();
    for (let r = 0; r < rowCount; r++) {
      this.scanRow(r, this.colAndRowspanRanges);
    }
  }

  /** Adds the spans starting in a row. */
  private scanRow(r: number, ranges: CellRange[]): void {
    const colCount = this.tableModel.getColumnCount();
    for (let c = 0; c < colCount; c++) {
      let cs = this.areaModel.getColspanAt(r, c);
      let rs = this.areaModel.getRowspanAt(r, c);
      if (cs > 1 || rs > 1) {
        if (cs === 0) {
          cs = 1;
        }
        if (rs === 0) {
          rs = 1;
        }
        const gammaRange = 'gammaCells' in this.areaModel;
        ranges.push(new CellRange(r, c, r + rs - 1, c + cs - 1, gammaRange));
      }
    }
  }

  /**
   * Live data (since 1.1.108): rows were inserted (and maybe removed at the start) – scans only the inserted rows
   * (O(k)) instead of all rows ({@link init}: O(n) per update, because most area models report a possible span of 31).
   * Only possible while no span exists; otherwise (or before the first init) false – then {@link initIfRowCountChanged}
   * builds the ranges again.
   *
   * @param {ArrayLike<number>} insertedPositions - display indices of the inserted rows (after the step), ascending
   * @returns {boolean} true if the ranges are up to date
   */
  updateForInsertedRows(insertedPositions: ArrayLike<number>): boolean {
    if (this.rowCountAtInit < 0 || this.colAndRowspanRanges?.length) {
      return false;
    }
    const ranges: CellRange[] = [];
    if (this.areaModel.getMaxColspan() >= 2 || this.areaModel.getMaxRowspan() >= 2) {
      for (let i = 0; i < insertedPositions.length; i++) {
        this.scanRow(insertedPositions[i], ranges);
      }
    }
    this.colAndRowspanRanges = ranges.length ? ranges : this.colAndRowspanRanges;
    this.rowCountAtInit = this.areaModel.getRowCount();
    return true;
  }

  /**
   * Builds the ranges again if the row count of the area model changed since the last {@link init} – e.g. after
   * `setRows()` or a filter (the old ranges could point to rows that no longer exist). Cheap otherwise.
   *
   * @returns {boolean} true if the ranges were rebuilt
   */
  initIfRowCountChanged(): boolean {
    if (this.areaModel.getRowCount() === this.rowCountAtInit) {
      return false;
    }
    this.init();
    return true;
  }

  getRanges(): CellRange[] {
    if (this.colAndRowspanRanges) {
      return this.colAndRowspanRanges;
    }
    return [];
  }

  isInRange(rowIndex: number, columnIndex: number): boolean {
    if (this.colAndRowspanRanges) {
      for (const range of this.colAndRowspanRanges) {
        if (range.isInRange(rowIndex, columnIndex)) {
          return true;
        }
      }
    }
    return false;
  }

}
