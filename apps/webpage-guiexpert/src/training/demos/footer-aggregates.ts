// Chapter 16 – since 1.1.94 the footer of totals is built in: one option instead of an own footer model,
// plus the sum of the selected cells for a status bar.
import {
  EventAdapter, SelectionModel, SimpleDomService, TableFactory, TableOptions, TableScope, formatAggregateValue,
  px140, type TableApi, type TableOptionsIf
} from "@guiexpert/table";
import { createOrders, type Order } from "./shared/orders";
import { createOrderColumns } from "./shared/order-columns";
import { type DemoContext, fmt } from "./shared/demo";

const KEEP = ["id", "customer", "city", "quantity", "price", "total"];

export default function (ctx: DemoContext) {
  const orders = createOrders(100_000);
  const columns = createOrderColumns().filter(c => KEEP.includes(c.property)); // fewer columns: the totals stay in view
  columns[columns.length - 1].width = px140;          // the grand total is wider than the single totals
  let query = "";
  // #region model
  const tableModel = TableFactory.createTableModel({
    rows: orders,
    columnDefs: columns,
    footerAggregates: [
      { label: "Sum", aggregates: { quantity: "sum", total: "sum" } },
      { label: "Average", aggregates: { quantity: "avg", price: "avg", total: "avg" } }
    ]
  });
  // #endregion model
  const selectionModel = new SelectionModel("range", "multi");
  const tableOptions: TableOptionsIf = {
    ...new TableOptions(),
    getSelectionModel: () => selectionModel,
    externalFilterFunction: (o: Order) => !query || `${o.customer} ${o.city}`.toLowerCase().includes(query)
  };
  const listener = new EventAdapter();
  // #region status
  listener.onSelectionChanged = () => {
    const a = api.getSelectionAggregates();         // the selected body cells
    ctx.info(a.capped ? "selection too large"
      : a.numericCount ? `count ${fmt(a.count)} · sum ${formatAggregateValue(a.sum)} · average ${formatAggregateValue(a.avg)}`
      : "select cells with numbers – drag, Shift-click, Ctrl+A");
  };
  // #endregion status
  const scope = new TableScope(ctx.host, tableModel, new SimpleDomService(), tableOptions, listener);
  scope.firstInit();
  const api: TableApi = scope.getApi();
  ctx.search("filter: customer or city …", value => {
    query = value.trim().toLowerCase();
    api.externalFilterChanged();                      // the totals follow the filter
  });
  ctx.info("drag over Qty … Total – the sum of the selection appears here");
  return () => scope.destroy();
}
