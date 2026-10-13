// Chapter 24 – Excel without a library, two ways.
// #region excel
import { type AreaModelObjectArray, ExcelService, type TableApi } from "@guiexpert/table";
import type { Order } from "./shared/orders";

// 1. what the table shows: filtered rows, current sort order, header + footer, visible columns
export function downloadView(tableApi: TableApi): Promise<void> {
  return tableApi.downloadExcel("orders-view.xlsx", "GuiExpert");
}

// 2. all orders, ignoring filter and sorting – you choose the columns
export function downloadAll(tableApi: TableApi): Promise<void> {
  const body = tableApi.getBodyModel() as AreaModelObjectArray<Order>;
  const matrix = [
    ["ID", "Date", "Customer", "Country", "Category", "Total", "Status"],
    ...body.getAllRows().map(o => [o.id, o.date, o.customer, o.country, o.category, o.total, o.status])
  ];
  return new ExcelService().downloadExcel(matrix, "orders-all.xlsx", "GuiExpert");
}
// #endregion excel

import { EventAdapter, SimpleDomService, TableFactory, TableOptions, TableScope } from "@guiexpert/table";
import { createOrders } from "./shared/orders";
import { createOrderColumns } from "./shared/order-columns";
import { OrderTotalsFooterModel } from "./shared/order-totals-footer";
import { type DemoContext, fmt, since } from "./shared/demo";

export default function (ctx: DemoContext) {
  const orders = createOrders(100_000);
  const columns = createOrderColumns();
  let query = "";
  const options = {
    ...new TableOptions(),
    externalFilterFunction: (o: Order) => !query || `${o.customer} ${o.city}`.toLowerCase().includes(query)
  };
  const tableModel = TableFactory.createTableModel({
    rows: orders, columnDefs: columns,
    footerAreaModel: new OrderTotalsFooterModel(() => tableModel.getBodyModel() as AreaModelObjectArray<Order>, columns)
  });
  const scope = new TableScope(ctx.host, tableModel, new SimpleDomService(), options, new EventAdapter());
  scope.firstInit();
  const api = scope.getApi();
  ctx.search("filter first, e.g. berlin", value => {
    query = value.trim().toLowerCase();
    api.externalFilterChanged();
    ctx.info(`view: ${fmt(api.getBodyModel().getRowCount())} rows`);
  });
  ctx.button("xlsx: view", async () => {
    const t0 = performance.now();
    await downloadView(api);
    ctx.info(`orders-view.xlsx · ${fmt(api.getBodyModel().getRowCount())} rows · ${since(t0)} ms`);
  });
  ctx.button("xlsx: all", async () => {
    const t0 = performance.now();
    await downloadAll(api);
    ctx.info(`orders-all.xlsx · ${fmt(orders.length)} rows · ${since(t0)} ms`);
  });
  ctx.info("filter, sort (double-click a header), then export");
  return () => scope.destroy();
}
