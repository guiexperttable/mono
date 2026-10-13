// Chapter 18 – ID fixed on the left, Total fixed on the right, 40 columns scroll in between.
import {
  type AreaModelObjectArray, ColumnDef, type ColumnDefIf, EventAdapter, SimpleDomService, TableFactory, TableOptions,
  TableScope, type TableModelIf, allRight, px90
} from "@guiexpert/table";
import { createOrders, type Order } from "./shared/orders";
import { createOrderColumns } from "./shared/order-columns";
import { OrderTotalsFooterModel } from "./shared/order-totals-footer";
import { type DemoContext, domCount, fmt } from "./shared/demo";

// #region wide
// 40 columns: the orders plus 30 months of (made-up) follow-up revenue
const MONTHS = Array.from({ length: 30 }, (_, i) => new Date(Date.UTC(2024, i, 1)).toISOString().slice(0, 7));
type WideOrder = Order & Record<string, number | string>;

function widenOrders(orders: Order[]): WideOrder[] {
  return orders.map(o => {
    const wide: WideOrder = { ...o };
    MONTHS.forEach((m, i) => wide[m] = Math.round(o.total * ((o.id * 7919 + i * 104_729) % 97) / 200));
    return wide;
  });
}
// #endregion wide

// #region model
function createWideOrdersModel(orders: Order[]): TableModelIf {
  const columns = createOrderColumns();
  const total = columns.find(c => c.property === "total")!;
  const wideColumns: ColumnDefIf[] = [
    ...columns.filter(c => c !== total),
    ...MONTHS.map(m => new ColumnDef(m, m, px90, allRight)),
    total                                                    // total is the last column
  ];
  const tableModel = TableFactory.createTableModel({
    rows: widenOrders(orders),
    columnDefs: wideColumns,
    fixedLeftColumnCount: 1,        // ID stays on the left   (west)
    fixedRightColumnCount: 1,       // Total stays on the right (east)
    footerAreaModel: new OrderTotalsFooterModel(
      () => tableModel.getBodyModel() as AreaModelObjectArray<Order>, wideColumns)
  });
  return tableModel;
}
// #endregion model

export default function (ctx: DemoContext) {
  const tableModel = createWideOrdersModel(createOrders(100_000));
  const scope = new TableScope(ctx.host, tableModel, new SimpleDomService(), new TableOptions(), new EventAdapter());
  scope.firstInit();
  requestAnimationFrame(() => ctx.info(
    `${tableModel.getColumnCount()} columns · ${fmt(domCount(ctx.host))} DOM elements – scroll sideways`));
  ctx.button("→ scroll right", () => scope.getApi().scrollToIndex(35, scope.getApi().getFirstVisibleRowIndex()));
  // column 0 is fixed (always visible, keeps the scroll position) – 1 is the first scrollable column
  ctx.button("← back", () => scope.getApi().scrollToIndex(1, scope.getApi().getFirstVisibleRowIndex()));
  return () => scope.destroy();
}
