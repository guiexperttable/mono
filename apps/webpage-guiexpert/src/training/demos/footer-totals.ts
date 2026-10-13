// Chapter 16 – a footer that follows filter and sorting: it sums the rows the body currently shows.
import {
  type AreaModelObjectArray, EventAdapter, SimpleDomService, TableFactory, TableOptions, TableScope
} from "@guiexpert/table";
import { createOrders, type Order } from "./shared/orders";
import { createOrderColumns } from "./shared/order-columns";
import { OrderTotalsFooterModel } from "./shared/order-totals-footer";
import { type DemoContext, fmt } from "./shared/demo";

export default function (ctx: DemoContext) {
  const orders = createOrders(100_000);
  const columns = createOrderColumns();
  let query = "";
  const tableOptions = {
    ...new TableOptions(),
    externalFilterFunction: (o: Order) => !query || `${o.customer} ${o.city}`.toLowerCase().includes(query)
  };
  // #region model
  const tableModel = TableFactory.createTableModel({
    rows: orders,
    columnDefs: columns,
    footerAreaModel: new OrderTotalsFooterModel(
      () => tableModel.getBodyModel() as AreaModelObjectArray<Order>, columns)
  });
  // #endregion model
  const scope = new TableScope(ctx.host, tableModel, new SimpleDomService(), tableOptions, new EventAdapter());
  scope.firstInit();
  const api = scope.getApi();
  ctx.search("filter: customer or city …", value => {
    query = value.trim().toLowerCase();
    api.externalFilterChanged();
    ctx.info(`${fmt(api.getBodyModel().getRowCount())} of ${fmt(orders.length)} orders – look at the footer`);
  });
  ctx.info("type “berlin” – the footer sums only the rows you see");
  return () => scope.destroy();
}
