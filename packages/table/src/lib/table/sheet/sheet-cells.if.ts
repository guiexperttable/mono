/**
 * The link between the body model and the cell formulas of a table ({@link TableOptionsIf.cellFormulas}): the model
 * asks it for the value of every text input – an `=…` cell of a formula column gives its result. Set by the table.
 *
 * @category Internals
 * @since 1.1.99
 */
export interface SheetCellsIf {
  /** The value of a cell of an array row (`AreaModelArrayOfArrays`): the result for a formula, otherwise `input`. */
  valueAt(row: unknown, columnIndex: number, input: string): unknown;
  /** The value of a property of a row object: the result for a formula, otherwise `input`. */
  valueOfProperty(row: unknown, property: string, input: string): unknown;
  /** True if the column of this property may hold formulas. */
  isFormulaProperty(property: string): boolean;
  /** True if the column may hold formulas. */
  isFormulaColumnIndex(columnIndex: number): boolean;
}
