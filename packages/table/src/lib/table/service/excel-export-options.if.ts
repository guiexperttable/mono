/**
 * Options of an Excel export ({@link ExcelService.downloadExcel}, {@link ExcelService.createExcelBlob}).
 *
 * @example
 * // an Arabic sheet: column A on the right, like the table
 * await new ExcelService().downloadExcel(matrix, "sales.xlsx", "", { rightToLeft: true });
 *
 * @since 1.1.98
 * @category Export & clipboard
 */
export interface ExcelExportOptionsIf {

  /**
   * The worksheet runs from right to left (`<sheetView rightToLeft="1">`): column A on the right.
   * {@link TableApi.downloadExcel} sets it for a right-to-left table ({@link TableOptionsIf.direction}).
   */
  rightToLeft?: boolean;

  /**
   * {@link TableApi.downloadExcel}: cell formulas ({@link TableOptionsIf.cellFormulas}) become Excel formulas with their
   * calculated values (otherwise: values). Only if the export is the sheet itself – no filter hides rows, no sorting,
   * every data column visible; otherwise values and a warning. Since 1.1.99.
   */
  cellFormulas?: boolean;
}
