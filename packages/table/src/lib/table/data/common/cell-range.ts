/**
 * A rectangle of cells: rows `r1`…`r2`, columns `c1`…`c2` (inclusive, body indices as displayed).
 * {@link SelectionModelIf.getRanges} returns the selection as a list of them.
 *
 * @example
 * const firstTenRows = new CellRange(0, 0, 9, tableModel.getColumnCount() - 1);
 * tableApi.getSelectionModel()?.addSelection(firstTenRows);
 * tableApi.repaint();
 *
 * @category Selection & focus
 */
export class CellRange {


  /**
   * @param r1 - first row
   * @param c1 - first column
   * @param r2 - last row (inclusive)
   * @param c2 - last column (inclusive)
   * @param gammaRange - reserved for {@link AreaModelCellGroups}, not used yet (default false)
   */
  constructor(
    public r1: number,
    public c1: number,
    public r2: number,
    public c2: number,
    public gammaRange: boolean = false) {
  }

  static create(params: {
    rowIndex1: number,
    columnIndex1: number,
    rowIndex2: number,
    columnIndex2: number,
    gammaRange?: boolean
  }): CellRange {
    if (params.gammaRange === undefined) {
      params.gammaRange = false;
    }
    return new CellRange(
      params.rowIndex1,
      params.columnIndex1,
      params.rowIndex2,
      params.columnIndex2,
      params.gammaRange
    );
  }

  static singleCell(
    rowIndex: number,
    columnIndex: number
  ): CellRange {
    return new CellRange(rowIndex, columnIndex, rowIndex, columnIndex);
  }

  static singleRow(
    rowIndex: number
  ): CellRange {
    return new CellRange(rowIndex, 0, rowIndex, Number.MAX_SAFE_INTEGER);
  }

  static singleColumn(
    columnIndex: number
  ): CellRange {
    return new CellRange(0, columnIndex, Number.MAX_SAFE_INTEGER, columnIndex);
  }

  isInRange(rowIndex: number, columnIndex: number): boolean {
    return rowIndex >= this.r1
      && rowIndex <= this.r2
      && columnIndex >= this.c1
      && columnIndex <= this.c2;
  }

}
