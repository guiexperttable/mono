/**
 * A value to write into a body cell – the input of {@link TableApi.applyCellChanges} (and of the fill handle).
 *
 * @example
 * const change: CellValueChangeIf = { rowIndex: 3, column: "price", value: 9.9 };
 * tableApi.applyCellChanges([change]);
 *
 * @category Fill handle & batch edit
 * @since 1.1.96
 */
export interface CellValueChangeIf {
  /** Display index of the row in the body. */
  rowIndex: number;
  /** Model index of the column, or its property. */
  column: number | string;
  /** The new value – like typed into the editor: it runs through the column's `editInputPipe`. */
  value: unknown;
}
