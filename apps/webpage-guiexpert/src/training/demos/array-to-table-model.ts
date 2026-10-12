// Chapter 12 – Array<T> → TableModel: choose and order the columns, typed.
// #region model
import { TableFactory, type TableModelIf } from "@guiexpert/table";
import type { Order } from "./shared/orders";

const ORDER_PROPERTIES: (keyof Order)[] =
  ["id", "date", "customer", "country", "product", "quantity", "total", "status"];

export function createOrdersModel(orders: Order[]): TableModelIf {
  return TableFactory.createTableModel({ rows: orders, properties: ORDER_PROPERTIES });
}
// #endregion model

import { EventAdapter, SimpleDomService, TableOptions, TableScope } from "@guiexpert/table";
import { createOrders } from "./shared/orders";
import { type DemoContext, fmt } from "./shared/demo";

export default function (ctx: DemoContext) {
  const orders = createOrders(100_000);
  let scope: TableScope | undefined;
  const show = (tableModel: TableModelIf, label: string) => {
    scope?.destroy();
    ctx.host.replaceChildren();
    scope = new TableScope(ctx.host, tableModel, new SimpleDomService(), { ...new TableOptions() }, new EventAdapter());
    scope.firstInit();
    ctx.info(`${label} · ${tableModel.getColumnCount()} columns · ${fmt(orders.length)} rows`);
  };
  const withProperties = ctx.button("rows + properties", () => {
    show(createOrdersModel(orders), "with properties");
    withProperties.setAttribute("aria-pressed", "true");
    onlyRows.removeAttribute("aria-pressed");
  });
  const onlyRows = ctx.button("only rows", () => {
    show(TableFactory.createTableModel({ rows: orders }), "only rows: every key is a column");
    onlyRows.setAttribute("aria-pressed", "true");
    withProperties.removeAttribute("aria-pressed");
  });
  withProperties.click();
  return () => scope?.destroy();
}
