// Chapter 11 – a TableModel is three area models (header, body, footer) plus columns;
// fixed columns split every row into west, center and east → nine areas.
import { EventAdapter, SimpleDomService, TableFactory, TableOptions, TableScope, type TableModelIf } from "@guiexpert/table";
import { createOrders } from "./shared/orders";
import { type DemoContext } from "./shared/demo";

// #region describe
export function describeModel(tableModel: TableModelIf): string {
  const header = tableModel.getAreaModel("header");
  const body = tableModel.getAreaModel("body");
  const footer = tableModel.getAreaModel("footer");
  const rows = `${header.getRowCount()} / ${body.getRowCount()} / ${footer.getRowCount()}`;
  const firstCustomer = body.getValueAt(0, 2);              // row 0, column 2
  const left = tableModel.getFixedLeftColumnCount();
  const right = tableModel.getFixedRightColumnCount();
  return `rows (header/body/footer): ${rows} · ${tableModel.getColumnCount()} columns · ` +
    `fixed west/east: ${left}/${right} · first customer: ${firstCustomer}`;
}
// #endregion describe

export default function (ctx: DemoContext) {
  const orders = createOrders(10_000);
  // #region model
  const tableModel = TableFactory.createTableModel({
    rows: orders,
    properties: ["id", "date", "customer", "country", "city", "product", "quantity", "price", "total", "status"],
    footerData: [["Σ", "", `${orders.length} orders`, "", "", "", "", "", "", ""]],
    fixedLeftColumnCount: 1,      // west: ID
    fixedRightColumnCount: 1      // east: status
  });
  // #endregion model
  ctx.root.classList.add("areas-demo");
  const scope = new TableScope(ctx.host, tableModel, new SimpleDomService(), { ...new TableOptions() }, new EventAdapter());
  scope.firstInit();
  ctx.info(describeModel(tableModel));
  ctx.toggle("colour the 9 areas", true, on => ctx.root.classList.toggle("areas-demo", on));
  return () => scope.destroy();
}
