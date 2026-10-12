/**
 * Writes an Excel file from a matrix of values. The default implementation is {@link ExcelService};
 * pass your own as last argument of the `TableScope` constructor to change how {@link TableApi.downloadExcel} exports.
 *
 * @category Export & clipboard
 */
export interface ExcelServiceIf {

  /** Creates the file from `matrix` (rows of values) and hands it to the browser as download. */
  downloadExcel(matrix: Array<Array<any>>, filename: string, author?: string): void | Promise<void>;

}