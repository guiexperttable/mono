import type { ColumnAutoWidthContextIf } from "./column-auto-width-context.if";

/**
 * Fitting a column width to its content: a double click on the resize handle, {@link TableApi.autoResizeColumn} and
 * {@link TableApi.autoResizeColumns} (`tableOptions.columnAutoWidth`).
 *
 * @example
 * const tableOptions: TableOptionsIf = {
 *   ...new TableOptions(),
 *   columnAutoWidth: {
 *     maxRows: 50_000,
 *     getWidth: ctx => ctx.property === "message" ? ctx.measureText("x".repeat(80)) : undefined,
 *   },
 * };
 *
 * @category Column drag
 * @since 1.1.110
 */
export interface ColumnAutoWidthOptionsIf {
  /**
   * A double click on the resize handle fits the width of the column to its content. Only where a handle is
   * (`columnsResizable` and the column is not `resizable: false`). Default `true`.
   */
  doubleClick: boolean;
  /**
   * Body rows that are measured: up to this number of rows all of them, above only the rows drawn now (the time stays
   * the same with millions of rows). Header and footer are always measured. Default `10_000`.
   */
  maxRows: number;
  /**
   * Own measurement: return the width in px, or `undefined` for the default. The result is limited by
   * `minWidth` / `maxWidth` of the column.
   */
  getWidth?: (ctx: ColumnAutoWidthContextIf) => number | undefined;
}
