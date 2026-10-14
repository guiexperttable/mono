import { TableModelIf } from "../data/tablemodel/table-model.if";
import { AreaIdent } from "../data/tablemodel/area-ident.type";

/**
 * Row and column numbers for screen readers – computed once per render pass from the table model.
 *
 * With virtual scrolling only the visible rows and columns are in the DOM, so the table tells screen readers the
 * real size (`aria-rowcount`, `aria-colcount` on the grid) and the position of every rendered row and cell
 * (`aria-rowindex`, `aria-colindex`):
 *
 * - rows are numbered 1-based over header → body → footer; a hidden header/footer (`setHeaderVisible(false)`) counts 0,
 * - the body counts **all** rows of the model (after the filter; a tree: the displayed nodes),
 * - columns count only the **shown** columns (width > 0): a column hidden with `setColumnVisible(…, false)` has no
 *   `aria-colindex`, the following columns move up,
 * - a body with an unknown row count (`getRowCount() < 0`) gives `aria-rowcount="-1"`.
 *
 * @example
 * // 1 header row, 1000 body rows, 10 columns, column 3 hidden
 * const info = AriaGridInfo.create(tableModel);
 * info.rowCount;               // 1001
 * info.colCount;               // 9
 * info.rowIndex("header", 0);  // 1
 * info.rowIndex("body", 0);    // 2
 * info.colIndex(4);            // 4 (column 3 is skipped)
 * info.colIndex(3);            // 0 (hidden)
 *
 * @since 1.1.91
 * @category Accessibility
 */
export class AriaGridInfo {

  /**
   * @param {number} headerRowCount - rendered header rows (0 if the header is hidden)
   * @param {number} bodyRowCount - body rows of the model (negative = unknown)
   * @param {number} footerRowCount - rendered footer rows (0 if the footer is hidden)
   * @param {number[]} colIndexMap - per model column its `aria-colindex` (0 = hidden)
   */
  constructor(
    readonly headerRowCount: number,
    readonly bodyRowCount: number,
    readonly footerRowCount: number,
    private readonly colIndexMap: number[]
  ) {
  }

  /**
   * Reads the counts of a table model.
   *
   * @param {TableModelIf} tableModel - the table model (only the area models, header/footer visibility and column widths are read)
   * @returns {AriaGridInfo} the counts
   */
  static create(
    tableModel: Pick<TableModelIf, "getAreaModel" | "isHeaderVisibe" | "isFooterVisibe" | "getColumnCount" | "getColumnWidth">
  ): AriaGridInfo {
    const headerRowCount = tableModel.isHeaderVisibe() ? Math.max(0, tableModel.getAreaModel("header")?.getRowCount() ?? 0) : 0;
    const footerRowCount = tableModel.isFooterVisibe() ? Math.max(0, tableModel.getAreaModel("footer")?.getRowCount() ?? 0) : 0;
    const bodyRowCount = tableModel.getAreaModel("body")?.getRowCount() ?? 0;
    const columnCount = tableModel.getColumnCount();
    const colIndexMap: number[] = new Array(Math.max(0, columnCount));
    let n = 0;
    for (let c = 0; c < columnCount; c++) {
      colIndexMap[c] = tableModel.getColumnWidth(c) > 0 ? ++n : 0;
    }
    return new AriaGridInfo(headerRowCount, bodyRowCount, footerRowCount, colIndexMap);
  }

  /** `aria-rowcount` of the grid: header + body + footer rows, `-1` if the body does not know its row count. */
  get rowCount(): number {
    if (this.bodyRowCount < 0) {
      return -1;
    }
    return this.headerRowCount + this.bodyRowCount + this.footerRowCount;
  }

  /** `aria-colcount` of the grid: the number of shown columns. */
  get colCount(): number {
    let n = 0;
    for (const idx of this.colIndexMap) {
      if (idx > 0) n++;
    }
    return n;
  }

  /**
   * `aria-rowindex` of a row (1-based over header → body → footer).
   *
   * @param {AreaIdent} area - header, body or footer
   * @param {number} rowIndex - row index in the area
   * @returns {number} the 1-based row number in the whole grid
   */
  rowIndex(area: AreaIdent, rowIndex: number): number {
    if (area === "header") {
      return rowIndex + 1;
    }
    if (area === "body") {
      return this.headerRowCount + rowIndex + 1;
    }
    return this.headerRowCount + Math.max(0, this.bodyRowCount) + rowIndex + 1;
  }

  /**
   * `aria-colindex` of a column.
   *
   * @param {number} columnIndex - model column index (west + center + east)
   * @returns {number} the 1-based position among the shown columns, 0 for a hidden or unknown column
   */
  colIndex(columnIndex: number): number {
    return this.colIndexMap[columnIndex] ?? 0;
  }

  /**
   * `aria-colspan` of a cell that spans columns: the number of **shown** columns it covers.
   *
   * @param {number} columnIndex - the first column of the cell
   * @param {number} colspan - the number of model columns the cell spans
   * @returns {number} the number of shown columns (at least 1)
   */
  colSpan(columnIndex: number, colspan: number): number {
    let n = 0;
    for (let c = columnIndex; c < columnIndex + colspan; c++) {
      if ((this.colIndexMap[c] ?? 0) > 0) n++;
    }
    return Math.max(1, n);
  }
}
