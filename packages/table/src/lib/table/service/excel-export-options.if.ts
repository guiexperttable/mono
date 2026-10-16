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
}
