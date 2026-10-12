// Chapter 21 – filtering: the filter UI is yours, the table only asks "show this row?".
// #region filter
import type { Order } from "./shared/orders";

export const orderFilter = { text: "", minTotal: 0 };

export function matchesOrder(order: Order): boolean {
  if (order.total < orderFilter.minTotal) return false;
  const query = orderFilter.text.trim().toLowerCase();
  if (!query) return true;
  return `${order.customer} ${order.country} ${order.city} ${order.product}`
    .toLowerCase().includes(query);
}
// #endregion filter

import { type AreaModelObjectArray, EventAdapter, SimpleDomService, TableFactory, TableOptions, TableScope } from "@guiexpert/table";
import { createOrders } from "./shared/orders";
import { createOrderColumns } from "./shared/order-columns";
import { OrderTotalsFooterModel } from "./shared/order-totals-footer";
import { type DemoContext, fmt } from "./shared/demo";

export default function (ctx: DemoContext) {
  const orders = createOrders(100_000);
  const columns = createOrderColumns({ renderers: true });
  // #region options
  const options = { ...new TableOptions() }; // @hide
  options.externalFilterFunction = matchesOrder;               // before the table starts
  // #endregion options
  const tableModel = TableFactory.createTableModel({
    rows: orders, columnDefs: columns,
    footerAreaModel: new OrderTotalsFooterModel(() => tableModel.getBodyModel() as AreaModelObjectArray<Order>, columns)
  });
  const scope = new TableScope(ctx.host, tableModel, new SimpleDomService(), options, new EventAdapter());
  scope.firstInit();
  const tableApi = scope.getApi();

  // #region input
  function filterChanged(): void {
    const t0 = performance.now(); // @hide
    tableApi.externalFilterChanged();                          // runs matchesOrder() for every row
    const shown = tableApi.getBodyModel().getRowCount();       // rows after the filter
    ctx.info(`${fmt(shown)} of ${fmt(orders.length)} orders · ${Math.round(performance.now() - t0)} ms`); // @show: info.textContent = `${shown} of ${orders.length} orders`;
  }
  ctx.search("search customer, city …", value => { orderFilter.text = value; filterChanged(); }); // @show: search.addEventListener("input", () => { orderFilter.text = search.value; filterChanged(); });
  ctx.range("min. total", 0, 20_000, 500, value => { orderFilter.minTotal = value; filterChanged(); }); // @show: minTotal.addEventListener("input", () => { orderFilter.minTotal = Number(minTotal.value); filterChanged(); });
  // #endregion input
  ctx.info(`${fmt(orders.length)} orders – type “berlin”`);
  return () => { orderFilter.text = ""; orderFilter.minTotal = 0; scope.destroy(); };
}
