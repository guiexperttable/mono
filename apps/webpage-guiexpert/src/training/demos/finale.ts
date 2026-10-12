// Chapter 34 – everything of the training in one table.
import {
  type AreaModelObjectArray, AutoRestoreOptions, SelectionModel, SimpleDomService, SortItem, TableFactory,
  TableOptions, type TableOptionsIf, TableScope
} from "@guiexpert/table";
import { createOrders, type Order } from "./shared/orders";
import { createOrderColumns } from "./shared/order-columns";
import { OrderTotalsFooterModel } from "./shared/order-totals-footer";
import { matchesOrder, orderFilter } from "./filtering";
import { OrderEvents, closeContextMenu, showContextMenu } from "./events-and-context-menu";
import { applyOrderEditing, recalcOrder } from "./inline-editing";
import { downloadAll, downloadView } from "./excel-export";
import { type DemoContext, fmt } from "./shared/demo";

export default function (ctx: DemoContext) {
  const orders = createOrders(100_000);
  const columns = createOrderColumns({ renderers: true });          // 13, 20, 25
  applyOrderEditing(columns);                                       // 31
  const selectionModel = new SelectionModel("range", "multi");      // 22
  const options: TableOptionsIf = {                                 // 19
    ...new TableOptions(),
    hoverColumnVisible: false,
    columnsResizable: true,
    columnsDraggable: true,
    verticalBorderVisible: false,
    defaultRowHeights: { header: 40, body: 30, footer: 36 },
    getSelectionModel: () => selectionModel,
    externalFilterFunction: matchesOrder,                           // 21
    autoRestoreOptions: {                                           // 33
      ...new AutoRestoreOptions<Order>(),
      getStorageKeyFn: () => "ge-training-finale",
      autoRestoreSortingState: true,
      autoRestoreScrollPosition: true
    }
  };
  const tableModel = TableFactory.createTableModel({
    rows: orders, columnDefs: columns, tableOptions: options, fixedLeftColumnCount: 1,   // 12, 18
    footerAreaModel: new OrderTotalsFooterModel(                    // 16
      () => tableModel.getBodyModel() as AreaModelObjectArray<Order>, columns, 36)
  });
  tableModel.doSort([new SortItem(columns.findIndex(c => c.property === "total"), "desc")]);

  const orderAt = (row: number) => tableModel.getBodyModel().getRowByIndex(row) as Order;
  const show = (o: Order) => ctx.info(`#${o.id} · ${o.customer}, ${o.city} · ${o.quantity} × ${o.product}`);
  const events = new OrderEvents(row => show(orderAt(row)), evt => {             // 23
    const order = orderAt(evt.rowIndex);
    showContextMenu(evt.originalEvent!, [
      { label: `Show order #${order.id}`, action: () => show(order) },
      { label: "Copy selection", action: () => api.copyToClipboard() },
      { label: `Only ${order.customer}`, action: () => { search.value = orderFilter.text = order.customer; filter(); } },
      { label: "Export view as Excel", action: () => downloadView(api) }
    ]);
  });
  events.onModelChanged = evt => {                                  // 31
    for (const cell of evt.cells) recalcOrder(orderAt(cell.rowIndex));
    (tableModel.getAreaModel("footer") as OrderTotalsFooterModel).invalidate();
    api.repaint();
  };
  const scope = new TableScope(ctx.host, tableModel, new SimpleDomService(), options, events);
  scope.firstInit();
  const api = scope.getApi();

  const filter = () => {
    api.externalFilterChanged();
    ctx.info(`${fmt(api.getBodyModel().getRowCount())} of ${fmt(orders.length)} orders`);
  };
  const search = ctx.search("search …", value => { orderFilter.text = value; filter(); });
  ctx.button("auto-size", () => api.autoResizeColumns());
  ctx.button("copy", () => api.copyToClipboard());
  ctx.button("xlsx: view", () => downloadView(api));
  ctx.button("xlsx: all", () => downloadAll(api));
  ctx.root.classList.add("brand-table");                            // 28
  ctx.info("filter · sort · select · right-click · double-click a quantity");
  return () => { orderFilter.text = ""; closeContextMenu(); scope.destroy(); };
}
