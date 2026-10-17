import type { ExcelExportOptionsIf } from "./excel-export-options.if";

/**
 * Writes an Excel file from a matrix of values. The default implementation is {@link ExcelService};
 * pass your own as last argument of the `TableScope` constructor to change how {@link TableApi.downloadExcel} exports.
 *
 * @category Export & clipboard
 */
export interface ExcelServiceIf {

  /** Creates the file from `matrix` (rows of values) and hands it to the browser as download. */
  downloadExcel(matrix: Array<Array<any>>, filename: string, author?: string, options?: ExcelExportOptionsIf): void | Promise<void>;

  /**
   * True if the service understands cells of the form {@link ExcelFormattedValueIf} (`{ value, numberFormat }`).
   * Only then {@link TableApi.downloadExcel} exports percentages of „Show values as“ columns with the format `0.0%`;
   * otherwise a service gets plain numbers (since 1.1.95).
   */
  readonly supportsNumberFormats?: boolean;

  /**
   * True if the service understands cells of the form {@link ExcelFormulaCellIf} (`{ formula, value }`). Only then
   * {@link TableApi.downloadExcel} with `{ cellFormulas: true }` exports cell formulas as formulas (since 1.1.99).
   */
  readonly supportsFormulas?: boolean;

}

/**
 * A cell of an Excel matrix with a formula (`<f>`) and its calculated value (`<v>`, shown until Excel recalculates).
 * Understood by {@link ExcelService}; {@link TableApi.downloadExcel} writes them for cell formulas with
 * `{ cellFormulas: true }`.
 *
 * @example
 * await new ExcelService().downloadExcel([[2, 3, { formula: "A1*B1", value: 6 }]], "sheet.xlsx");
 *
 * @since 1.1.99
 * @category Export & clipboard
 */
export interface ExcelFormulaCellIf {
  /** The formula without `=`, with Excel's function names (`"SUM(D2:D4)"`, `"_xlfn.XLOOKUP(…)"`). */
  formula: string;
  /** The calculated value: a number, text, boolean, `Date` or an error value. */
  value: unknown;
}

/**
 * True for a cell of the form {@link ExcelFormulaCellIf}.
 *
 * @param {unknown} cell - a cell of an Excel matrix
 * @returns {boolean} whether it is a formula cell
 *
 * @example
 * isExcelFormulaCell({ formula: "A1*2", value: 4 });   // true
 *
 * @since 1.1.99
 * @category Export & clipboard
 */
export function isExcelFormulaCell(cell: unknown): cell is ExcelFormulaCellIf {
  return !!cell && typeof cell === "object" && typeof (cell as ExcelFormulaCellIf).formula === "string"
    && "value" in (cell as object);
}
/**
 * A cell of an Excel matrix with a number format, e.g. a share shown as percentage. Understood by
 * {@link ExcelService} (`supportsNumberFormats`).
 *
 * @example
 * await new ExcelService().downloadExcel([["Share"], [{ value: 0.667, numberFormat: "0.0%" }]], "shares.xlsx");
 *
 * @since 1.1.95
 * @category Export & clipboard
 */
export interface ExcelFormattedValueIf {
  /** The number. */
  value: number;
  /** An Excel number format code, e.g. `"0.0%"`, `"#,##0.00"`. */
  numberFormat: string;
}

/**
 * True for a cell of the form {@link ExcelFormattedValueIf}.
 *
 * @param {unknown} cell - a cell of an Excel matrix
 * @returns {boolean} whether it is a number with format
 *
 * @example
 * isExcelFormattedValue({ value: 0.5, numberFormat: "0%" });   // true
 *
 * @since 1.1.95
 * @category Export & clipboard
 */
export function isExcelFormattedValue(cell: unknown): cell is ExcelFormattedValueIf {
  return !!cell && typeof cell === "object" && typeof (cell as ExcelFormattedValueIf).value === "number"
    && typeof (cell as ExcelFormattedValueIf).numberFormat === "string";
}
