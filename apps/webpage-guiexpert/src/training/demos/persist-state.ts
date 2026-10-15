// Chapter 33 – remember sorting, scroll position and the column layout: one localStorage key per table.
// Since 1.1.92 also the state API: getState() / applyState() / onStateChanged for your own storage or server.
// #region options
import { AutoRestoreOptions, TableOptions, type TableOptionsIf } from "@guiexpert/table";
import type { Order } from "./shared/orders";

export function createOrderTableOptions(): TableOptionsIf {
  return {
    ...new TableOptions(),
    autoRestoreOptions: {
      ...new AutoRestoreOptions<Order>(),
      getStorageKeyFn: () => "ge-demo-orders",          // one key per table (localStorage)
      autoRestoreSortingState: true,
      autoRestoreScrollPosition: true,
      autoRestoreColumnLayout: true                     // widths, order, hidden columns (since 1.1.92)
    }
  };
}
// #endregion options

import { EventAdapter, SimpleDomService, TableFactory, TableScope, type GeStateChangeEvent } from "@guiexpert/table";
import { createOrders } from "./shared/orders";
import { createOrderColumns } from "./shared/order-columns";
import { type DemoContext } from "./shared/demo";

const KEY = "ge-training-persist-state";

export default function (ctx: DemoContext) {
  const options = createOrderTableOptions();
  options.autoRestoreOptions!.getStorageKeyFn = () => KEY;      // own key for the training page
  // #region event
  const listener = new EventAdapter();
  listener.onStateChanged = (evt: GeStateChangeEvent) => {
    ctx.info(`changed: ${evt.changedParts.join(", ")} – stored`);   // or: fetch("/api/prefs", { method: "PUT", … })
  };
  // #endregion event
  const tableModel = TableFactory.createTableModel({ rows: createOrders(100_000), columnDefs: createOrderColumns({ renderers: true }) });
  const scope = new TableScope(ctx.host, tableModel, new SimpleDomService(), options, listener);
  scope.firstInit();
  const tableApi = scope.getApi();
  let stored = false;
  try { stored = !!localStorage.getItem(KEY + "tableState"); } catch { /* blocked storage */ }
  ctx.info(stored ? "restored from localStorage ✓" : "sort, resize or move a column, scroll – then reload");
  ctx.button("reload page", () => {
    try { sessionStorage.setItem("ge-training-autostart", "persist-state"); } catch { /* ignore */ }
    location.reload();
  });
  // #region reset
  ctx.button("reset layout", () => {
    tableApi.resetState();            // layout of the code, stored state removed
  });
  // #endregion reset
  return () => scope.destroy();
}
