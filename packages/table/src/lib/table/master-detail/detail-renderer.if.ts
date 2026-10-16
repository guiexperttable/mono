import type { TableApi } from "../table-api";
import type { TableModelIf } from "../data/tablemodel/table-model.if";
import type { TableOptionsIf } from "../data/options/table-options.if";
import type { EventListenerIf } from "../event-listener.if";

/**
 * What {@link DetailRenderContextIf.createTable} needs for a nested table in a detail row.
 *
 * @category Master/detail
 * @since 1.1.97
 */
export interface DetailTableParamsIf {
  /** The model of the nested table, e.g. `TableFactory.createTableModel({ rows: order.items, properties: [...] })`. */
  tableModel: TableModelIf;
  /** Its options (default: `new TableOptions()`). */
  tableOptions?: TableOptionsIf;
  /** Its event listener (default: none). */
  eventListener?: EventListenerIf;
  /**
   * The height of the nested table: px or a CSS length. Default: `"100%"` with a fixed
   * {@link MasterDetailOptionsIf.detailHeight}, otherwise {@link MasterDetailOptionsIf.estimatedDetailHeight} px.
   */
  height?: number | string;
}

/**
 * The context a {@link DetailRendererIf} gets: the master row, the outer table and helpers whose resources are released
 * together with the detail row.
 *
 * @example
 * const renderDetail: DetailRenderFnType<Order> = (container, order, ctx) => {
 *   const button = document.createElement("button");
 *   button.textContent = `Open order ${order.id}`;
 *   button.addEventListener("click", () => ctx.tableApi.announce(`Order ${order.id}`), { signal: ctx.signal });
 *   container.appendChild(button);
 * };
 *
 * @category Master/detail
 * @since 1.1.97
 */
export interface DetailRenderContextIf<T = any> {
  /** The master row (the row object of the body model). */
  readonly row: T;
  /** The display index of the master row when the detail was created (it changes with sorting and filtering). */
  readonly rowIndex: number;
  /** The API of the outer (master) table. */
  readonly tableApi: TableApi;
  /**
   * `true` if the content of this detail row existed before and was destroyed (too many rendered details, see
   * {@link MasterDetailOptionsIf.maxRenderedDetails}, or {@link TableApi.refreshDetail}) – state that lives only in the
   * DOM (inputs, scroll positions) is gone then.
   */
  readonly recreated: boolean;
  /** Aborted when the detail row is destroyed – pass it to `addEventListener(…, { signal })`. */
  readonly signal: AbortSignal;

  /**
   * Creates a GuiExpert table inside the detail row; it is destroyed (`TableScope.destroy()`) together with the detail
   * row. The CSS variables of the page (light/dark theme) apply to it as well.
   *
   * @param {DetailTableParamsIf} params - model, options, listener, height
   * @returns {TableApi} the API of the nested table
   */
  createTable(params: DetailTableParamsIf): TableApi;
}

/**
 * Renders the content of a detail row – a function (see {@link DetailRendererIf}). It may return a cleanup function,
 * called when the detail row is destroyed (collapsed, too many rendered details, new table model).
 *
 * @example
 * const renderDetail: DetailRenderFnType<Order> = (container, order) => {
 *   container.textContent = `${order.items.length} items, ordered on ${order.date}`;  // textContent: no HTML injection
 * };
 *
 * @category Master/detail
 * @since 1.1.97
 */
export type DetailRenderFnType<T = any> =
  (container: HTMLDivElement, row: T, context: DetailRenderContextIf<T>) => (() => void) | void;

/**
 * Renders the content of a detail row – the object form of {@link DetailRenderFnType}, e.g. the
 * `DetailComponentRendererWrapper` of the framework wrappers (React, Vue, Svelte …).
 *
 * The content is created once, when the detail row becomes visible for the first time, and lives until the row is
 * collapsed – scrolling only hides and shows it (inputs, selections and scroll positions stay).
 *
 * @example
 * class OrderNotesRenderer implements DetailRendererIf<Order> {
 *   render(container: HTMLDivElement, order: Order): () => void {
 *     const textarea = document.createElement("textarea");
 *     textarea.value = order.notes ?? "";
 *     container.appendChild(textarea);
 *     return () => { order.notes = textarea.value; };   // cleanup: keep the text
 *   }
 * }
 *
 * @category Master/detail
 * @since 1.1.97
 */
export interface DetailRendererIf<T = any> {
  render(container: HTMLDivElement, row: T, context: DetailRenderContextIf<T>): (() => void) | void;
}
