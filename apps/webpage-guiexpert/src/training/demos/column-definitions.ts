// Chapter 13 – columns with ColumnDef: header label, width, alignment, visibility.
// #region columns
import {
  ColumnDef, type ColumnDefIf, FalseFn, Size, TableFactory,
  allRight, bodyLeft, px80, px110, px120, px130, px160, px180, px200
} from "@guiexpert/table";
import type { Order } from "./shared/orders";

export const ORDER_COLUMNS: ColumnDefIf[] = [
  new ColumnDef("id", "ID", px80, allRight),                // property, header label, width, CSS classes
  new ColumnDef("date", "Date", px120),
  new ColumnDef("customer", "Customer", px180, bodyLeft),
  new ColumnDef("country", "Country", px130, bodyLeft),
  new ColumnDef("city", "City", px110, bodyLeft),
  new ColumnDef("product", "Product", px160, bodyLeft),
  ColumnDef.create({ property: "category", headerLabel: "Category", isVisible: FalseFn }),  // hidden
  new ColumnDef("quantity", "Qty", px80, allRight),
  ColumnDef.create({                                        // named parameters for everything else
    property: "price", headerLabel: "Price",
    width: new Size(8, "%"), minWidth: px80, maxWidth: px200, // 8 % of the table width, at least 80, at most 200 px
    headerClasses: ["ge-table-text-align-right"],
    bodyClasses: ["ge-table-text-align-right"]
  }),
  new ColumnDef("status", "Status", px110),
  new ColumnDef("total", "Total", px120, allRight)
];
// #endregion columns

import { EventAdapter, SimpleDomService, TableOptions, TableScope } from "@guiexpert/table";
import { createOrders } from "./shared/orders";
import { type DemoContext, fmt } from "./shared/demo";

export default function (ctx: DemoContext) {
  const orders = createOrders(100_000);
  // #region model
  const tableModel = TableFactory.buildByTypedRows<Order>(orders, ORDER_COLUMNS);
  // #endregion model
  const scope = new TableScope(ctx.host, tableModel, new SimpleDomService(),
    { ...new TableOptions(), columnsResizable: true }, new EventAdapter());
  scope.firstInit();
  ctx.info(`${fmt(orders.length)} orders · ${ORDER_COLUMNS.length} column defs, 1 hidden`);
  return () => scope.destroy();
}
