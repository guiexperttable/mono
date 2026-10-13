// Chapter 5 – the first table: host element, table model, options, TableScope.
// #region full
import { EventAdapter, SimpleDomService, TableFactory, TableOptions, TableScope } from "@guiexpert/table";
import { createOrders } from "./shared/orders";
// #endregion full
import { type DemoContext, domCount, fmt, since } from "./shared/demo";

export default function (ctx: DemoContext) {
  const t0 = performance.now();
  // #region full
  const orders = createOrders(100_000);                 // 100,000 plain objects

  const host = ctx.host; // @show: const host = document.querySelector<HTMLDivElement>(".table-div")!;
  const tableModel = TableFactory.createTableModel({ rows: orders });
  const options = { ...new TableOptions() };
  const tableScope = new TableScope(
    host, tableModel, new SimpleDomService(), options, new EventAdapter());
  tableScope.firstInit();
  // #endregion full

  // #region api
  const tableApi = tableScope.getApi();
  tableApi.scrollToIndex(0, 50_000);                    // column 0, row 50,000
  // #endregion api

  requestAnimationFrame(() =>
    ctx.info(`${fmt(orders.length)} rows · ${since(t0)} ms · ${fmt(domCount(host))} DOM elements`));
  ctx.button("top", () => tableApi.scrollToIndex(0, 0));
  ctx.button("row 50,000", () => tableApi.scrollToIndex(0, 50_000));
  ctx.button("end", () => tableApi.ensureRowIsVisible(orders.length - 1));
  return () => tableScope.destroy();
}
