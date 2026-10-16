import type { DetailRendererIf, DetailRenderFnType } from "./detail-renderer.if";

/**
 * The height of a detail row: px, or `"auto"` = measured from its content (a `ResizeObserver` follows changes).
 *
 * @category Master/detail
 * @since 1.1.97
 */
export type DetailHeightType = number | "auto";

/**
 * Master/detail: a master row can be expanded; below it a detail row over the full width of the table (fixed columns
 * included) shows any content – a nested GuiExpert table, a form, a chart, a framework component. Works with virtual
 * scrolling and millions of rows: the content is created when the detail row becomes visible and lives until it is
 * collapsed (scrolling only hides and shows it). Only for flat body models (not for trees, row groups and pivot tables).
 *
 * Fields you leave out keep their default ({@link MasterDetailOptions}).
 *
 * @example
 * const tableOptions: TableOptionsIf = {
 *   ...new TableOptions(),
 *   masterDetail: {
 *     detailHeight: 180,
 *     detailRenderer: (_container, order: Order, ctx) => {
 *       ctx.createTable({
 *         tableModel: TableFactory.createTableModel({ rows: order.items, properties: ["sku", "name", "qty", "price"] })
 *       });
 *     }
 *   }
 * };
 *
 * @see Training: [Master/detail](https://gui.expert/training/master-detail/)
 *
 * @category Master/detail
 * @since 1.1.97
 */
export interface MasterDetailOptionsIf<T = any> {
  /** Renders the content of a detail row (function or object with `render()`). */
  detailRenderer: DetailRendererIf<T> | DetailRenderFnType<T>;
  /** Which rows can be expanded. Default: every row. */
  isMaster?: (row: T, rowIndex: number) => boolean;
  /** Height of the detail rows: px, `"auto"` (measured) or a function per row. Default `"auto"`. */
  detailHeight: DetailHeightType | ((row: T, rowIndex: number) => DetailHeightType);
  /** Height of an `"auto"` detail row before its content was measured (px). Default 200. */
  estimatedDetailHeight: number;
  /**
   * The column with the expand/collapse icon: column index or property. Default: the first data column (behind a row
   * number and a row checkbox column – where a tree has its arrow).
   */
  toggleColumn?: number | string;
  /**
   * At most this many detail contents exist at the same time. Beyond it the detail row that was out of view the
   * longest is destroyed and created again when it scrolls back into view (`context.recreated`). Default 50.
   */
  maxRenderedDetails: number;
  /**
   * The id of a master row – keeps detail rows open when the rows are replaced by new objects with the same ids
   * (`setRows`). Default: `autoRestoreOptions.getRowId`, otherwise the row object itself.
   */
  getRowId?: (row: T) => string | number;
}
