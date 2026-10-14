// Chapter 32 – loading and empty tables: "Loading…" with a CSS spinner while the data is on the way,
// "No rows to show" for an empty answer and "No matching rows" for a filter without hits (since 1.1.92).
import {
  EventAdapter, SimpleDomService, TableFactory, TableOptions, TableScope, type TableApi, type TableOptionsIf
} from "@guiexpert/table";
import { type Order, createOrders } from "./shared/orders";
import { createOrderColumns } from "./shared/order-columns";
import { type DemoContext, fmt } from "./shared/demo";

/** Stands in for `fetch("/api/orders")`: answers after `ms`. */
const fakeFetch = (rows: Order[], ms = 1000) => new Promise<Order[]>(resolve => setTimeout(() => resolve(rows), ms));

export default function (ctx: DemoContext) {
  const allOrders = createOrders(2_000);
  let customer = "";

  // #region table
  const tableModel = TableFactory.createTableModel({ rows: [] as Order[], columnDefs: createOrderColumns() });
  const tableOptions: TableOptionsIf = {
    ...new TableOptions(),
    externalFilterFunction: (order: Order) => !customer || order.customer.toLowerCase().includes(customer),
    overlayOptions: { noRowsText: "No orders yet" }         // "No matching rows" and "Loading…" stay English
  };
  // #endregion table
  const scope = new TableScope(ctx.host, tableModel, new SimpleDomService(), tableOptions, new EventAdapter());
  scope.firstInit();
  const tableApi: TableApi = scope.getApi();

  // #region load
  async function load(answer: Order[]) {
    tableApi.showLoadingOverlay();           // CSS spinner over the body, the header stays readable
    try {
      const orders = await fakeFetch(answer); // @show: const orders: Order[] = await (await fetch("/api/orders")).json();
      tableApi.setRows(orders);
      tableApi.repaintHard();                // the row count changed
    } finally {
      tableApi.hideOverlay();                // empty answer → "No orders yet" appears by itself
    }
  }
  // #endregion load

  const report = () => ctx.info(`${fmt(tableApi.getBodyModel().getRowCount())} rows · overlay: ${tableApi.getOverlayState()}`);
  const timer = window.setInterval(report, 200);

  ctx.button("load (1 s)", () => load(allOrders));
  ctx.button("empty answer", () => load([]));
  ctx.button("refresh", () => load(allOrders.slice().reverse()));
  ctx.search("customer, e.g. zzz", value => {
    customer = value.trim().toLowerCase();
    tableApi.externalFilterChanged();        // nothing found → "No matching rows"
  });
  void load(allOrders);

  return () => {
    window.clearInterval(timer);
    scope.destroy();
  };
}
