// Chapter 23 – events: override only what you need; a context menu of your own.
// #region events
import { EventAdapter, type GeMouseEvent } from "@guiexpert/table";

export class OrderEvents extends EventAdapter {
  constructor(
    private readonly onRowDoubleClick: (rowIndex: number) => void,
    private readonly onMenu: (evt: GeMouseEvent) => void) {
    super();
  }

  override onMouseClicked(evt: GeMouseEvent): void {      // rowIndex, columnIndex, areaIdent, clickCount
    if (evt.areaIdent === "body" && evt.clickCount === 2) this.onRowDoubleClick(evt.rowIndex);
  }

  override onContextmenu(evt: GeMouseEvent): void {
    if (evt.areaIdent === "body" && evt.rowIndex > -1) this.onMenu(evt);
  }
}
// #endregion events

// #region menu
export interface MenuItem {
  label: string;
  action: () => void;
}

export function showContextMenu(event: MouseEvent, items: MenuItem[]): void {
  event.preventDefault();                                 // no browser menu
  closeContextMenu();
  const menu = document.body.appendChild(document.createElement("div"));
  menu.className = "td-context-menu"; // @show: menu.className = "context-menu";
  menu.style.left = `${event.clientX}px`;
  menu.style.top = `${event.clientY}px`;
  for (const item of items) {
    const button = menu.appendChild(document.createElement("button"));
    button.textContent = item.label;
    button.addEventListener("click", () => { closeContextMenu(); item.action(); });
  }
}

export function closeContextMenu(): void {
  document.querySelector(".td-context-menu")?.remove(); // @show: document.querySelector(".context-menu")?.remove();
}

document.addEventListener("mousedown", e => {             // close on a click outside …
  if (!(e.target as HTMLElement).closest(".td-context-menu")) closeContextMenu(); // @show:   if (!(e.target as HTMLElement).closest(".context-menu")) closeContextMenu();
});
document.addEventListener("keydown", e => e.key === "Escape" && closeContextMenu());   // … and on Escape
// #endregion menu

import { SimpleDomService, TableFactory, TableOptions, TableScope } from "@guiexpert/table";
import { createOrders, type Order } from "./shared/orders";
import { createOrderColumns } from "./shared/order-columns";
import { type DemoContext } from "./shared/demo";

export default function (ctx: DemoContext) {
  const orders = createOrders(100_000);
  let query = "";
  const options = {
    ...new TableOptions(),
    externalFilterFunction: (o: Order) => !query || o.customer === query
  };
  const tableModel = TableFactory.createTableModel({ rows: orders, columnDefs: createOrderColumns({ renderers: true }) });
  // #region wire
  const orderAt = (rowIndex: number) => tableModel.getBodyModel().getRowByIndex(rowIndex) as Order;   // displayed row → object
  const showOrder = (o: Order) => ctx.info(`#${o.id} · ${o.customer}, ${o.city} · ${o.quantity} × ${o.product}`); // @show: const showOrder = (o: Order) => info.textContent = `#${o.id} · ${o.customer} · ${o.quantity} × ${o.product}`;

  const events = new OrderEvents(row => showOrder(orderAt(row)), evt => {
    const order = orderAt(evt.rowIndex);
    showContextMenu(evt.originalEvent!, [
      { label: `Show order #${order.id}`, action: () => showOrder(order) },
      { label: "Copy selection", action: () => tableApi.copyToClipboard() },
      { label: `Only ${order.customer}`, action: () => { query = order.customer; tableApi.externalFilterChanged(); } },
      { label: "Show all", action: () => { query = ""; tableApi.externalFilterChanged(); } },
      { label: "Export view as Excel", action: () => tableApi.downloadExcel("orders.xlsx", "GuiExpert") }
    ]);
  });
  const scope = new TableScope(ctx.host, tableModel, new SimpleDomService(), options, events); // @show: const tableScope = new TableScope(host, tableModel, new SimpleDomService(), options, events);
  scope.firstInit(); // @show: tableScope.firstInit();
  const tableApi = scope.getApi(); // @show: const tableApi = tableScope.getApi();
  // #endregion wire
  ctx.info("double-click a row · right-click for the menu");
  return () => { closeContextMenu(); scope.destroy(); };
}
