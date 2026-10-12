// Chapter 30 – tree table with checkboxes: country → customer → order.
// #region data
import type { Order } from "./shared/orders";

export interface OrderNode {
  id: string;                    // unique per node – needed to remember expanded rows (chapter 33)
  label: string;
  orders: number;
  total: number;
  date?: string;
  status?: Order["status"];
  children?: OrderNode[];
}

function group<T>(items: T[], key: (t: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) map.set(key(item), [...(map.get(key(item)) ?? []), item]);
  return new Map([...map].sort(([a], [b]) => a.localeCompare(b)));
}
const sum = (orders: Order[]) => Math.round(orders.reduce((s, o) => s + o.total, 0) * 100) / 100;

export function buildOrderTree(orders: Order[]): OrderNode[] {
  return [...group(orders, o => o.country)].map(([country, byCountry]) => ({
    id: country, label: country, orders: byCountry.length, total: sum(byCountry),
    children: [...group(byCountry, o => o.customer)].map(([customer, byCustomer]) => ({
      id: `${country}/${customer}`, label: customer, orders: byCustomer.length, total: sum(byCustomer),
      children: byCustomer.map(o => ({
        id: String(o.id), label: `#${o.id} · ${o.product}`, orders: 1, total: o.total, date: o.date, status: o.status
      }))
    }))
  }));
}
// #endregion data

// #region model
import {
  ColumnDef, TableFactory, type TableModelIf, type TableOptionsIf, TreeFactory,
  allRight, bodyLeft, px100, px110, px120, px300
} from "@guiexpert/table";
import { EuroRenderer, StatusBadgeRenderer } from "./shared/order-columns"; // @show: import { EuroRenderer, StatusBadgeRenderer } from "./order-renderers";   // chapter 25

export function createOrderTreeModel(orders: Order[], tableOptions: TableOptionsIf): TableModelIf {
  const columnDefs = [
    new ColumnDef("label", "Country / customer / order", px300, bodyLeft),   // the first column holds the tree
    new ColumnDef("orders", "Orders", px100, allRight),
    ColumnDef.create({ property: "total", headerLabel: "Total", width: px120,
      headerClasses: ["ge-table-text-align-right"], bodyClasses: ["ge-table-text-align-right"],
      bodyRenderer: new EuroRenderer() }),
    new ColumnDef("date", "Date", px120),
    ColumnDef.create({ property: "status", headerLabel: "Status", width: px110, bodyRenderer: new StatusBadgeRenderer() })
  ];
  const rows = TreeFactory.buildTreeRows<OrderNode>(buildOrderTree(orders), {
    childrenProperty: "children",
    expanded: false                     // start collapsed (default: everything open)
  });
  return TableFactory.createTableModel({ rows, columnDefs, tableOptions });
}
// #endregion model

// #region table
import { EventAdapter, SimpleDomService, TableOptions, TableScope } from "@guiexpert/table";
// #endregion table
import { createOrders } from "./shared/orders";
import { type DemoContext } from "./shared/demo";

export default function (ctx: DemoContext) {
  // #region table
  const tableOptions: TableOptionsIf = {
    ...new TableOptions(),
    hoverColumnVisible: false,
    showCheckboxWihoutExtraColumn: true          // checkbox inside the tree column, after the arrow
  };
  const tableModel = createOrderTreeModel(createOrders(5_000), tableOptions);

  class TreeEvents extends EventAdapter {
    override onCheckboxChanged(rows: any[]): void {   // all checked rows (parents check their children)
      ctx.info(`${rows.length} rows checked`); // @show:     info.textContent = `${rows.length} rows checked`;
    }
  }
  const host = ctx.host; // @show: const host = document.querySelector<HTMLDivElement>(".table-div")!;
  const scope = new TableScope(host, tableModel, new SimpleDomService(), tableOptions, new TreeEvents()).firstInit();
  // #endregion table
  ctx.info("5,000 orders · click ▸ to expand · Alt+click in the first column works too");
  return () => scope.destroy();
}
