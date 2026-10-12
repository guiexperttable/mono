// Chapter 33 – remember sorting and scroll position: one localStorage key per table.
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
      autoRestoreScrollPosition: true
    }
  };
}
// #endregion options

import { EventAdapter, SimpleDomService, TableFactory, TableScope } from "@guiexpert/table";
import { createOrders } from "./shared/orders";
import { createOrderColumns } from "./shared/order-columns";
import { type DemoContext } from "./shared/demo";

const KEY = "ge-training-persist-state";

export default function (ctx: DemoContext) {
  const options = createOrderTableOptions();
  options.autoRestoreOptions!.getStorageKeyFn = () => KEY;      // own key for the training page
  const tableModel = TableFactory.createTableModel({ rows: createOrders(100_000), columnDefs: createOrderColumns({ renderers: true }) });
  const scope = new TableScope(ctx.host, tableModel, new SimpleDomService(), options, new EventAdapter());
  scope.firstInit();
  let stored = false;
  try { stored = !!localStorage.getItem(KEY); } catch { /* blocked storage */ }
  ctx.info(stored ? "restored from localStorage ✓" : "sort (double-click a header), scroll – then reload");
  ctx.button("reload page", () => {
    try { sessionStorage.setItem("ge-training-autostart", "persist-state"); } catch { /* ignore */ }
    location.reload();
  });
  ctx.button("forget state", () => {
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
    ctx.info("state removed – reload to see the defaults");
  });
  return () => scope.destroy();
}
