// Chapter 25 – a renderer decides how a cell LOOKS. The value stays the same:
// sorting, filter, copy and Excel keep working with the raw value.
// #region badge
import {
  type AreaIdent, type AreaModelIf, type CellRendererIf, type DomServiceIf, type RendererCleanupFnType
} from "@guiexpert/table";
import type { Order } from "./shared/orders";

/** Status as a coloured badge – plain DOM, no innerHTML. */
export class StatusBadgeRenderer implements CellRendererIf {
  render(cellDiv: HTMLDivElement, _rowIndex: number, _columnIndex: number, _areaIdent: AreaIdent,
         _areaModel: AreaModelIf, cellValue: Order["status"], dom: DomServiceIf): RendererCleanupFnType | undefined {
    const badge = dom.createElement<HTMLSpanElement>("span");
    dom.addClass(badge, "status-badge");
    dom.addClass(badge, `status-${cellValue}`);           // CSS: .status-paid { background: … }
    badge.textContent = cellValue;
    dom.appendChild(cellDiv, badge);
    return undefined;                                     // optional: a cleanup function
  }
}
// #endregion badge

// #region euro
const EUR = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });

export class EuroRenderer implements CellRendererIf {
  render(cellDiv: HTMLDivElement, _rowIndex: number, _columnIndex: number, _areaIdent: AreaIdent,
         _areaModel: AreaModelIf, cellValue: number, dom: DomServiceIf): RendererCleanupFnType | undefined {
    const label = dom.createElement<HTMLDivElement>("div");
    dom.addClass(label, "ge-table-label");                // same padding as a normal cell
    label.textContent = EUR.format(cellValue);
    dom.appendChild(cellDiv, label);
    return undefined;
  }
}
// #endregion euro

// #region apply
import {
  type ColumnDefIf, DateToLocaleDateCellRenderer, NumberCellProgressBarCellRenderer
} from "@guiexpert/table";

export function applyOrderRenderers(columns: ColumnDefIf[]): void {
  const column = (property: keyof Order) => columns.find(c => c.property === property)!;
  column("date").rendererMap.body = new DateToLocaleDateCellRenderer();                   // built in
  column("quantity").rendererMap.body = new NumberCellProgressBarCellRenderer(20, false); // built in, max 20
  column("status").rendererMap.body = new StatusBadgeRenderer();                          // own
  column("price").rendererMap.body = new EuroRenderer();                                  // own
  column("total").rendererMap.body = new EuroRenderer();
  column("total").rendererMap.footer = new EuroRenderer();                                // footer too
}
// #endregion apply

import {
  type AreaModelObjectArray, EventAdapter, SimpleDomService, TableFactory, TableOptions, TableScope
} from "@guiexpert/table";
import { createOrders } from "./shared/orders";
import { createOrderColumns } from "./shared/order-columns";
import { OrderTotalsFooterModel } from "./shared/order-totals-footer";
import { type DemoContext } from "./shared/demo";

export default function (ctx: DemoContext) {
  const orders = createOrders(100_000);
  let scope: TableScope | undefined;
  function build(withRenderers: boolean): void {
    scope?.destroy();
    ctx.host.replaceChildren();
    const columns = createOrderColumns();
    if (withRenderers) applyOrderRenderers(columns);
    const tableModel = TableFactory.createTableModel({
      rows: orders, columnDefs: columns,
      footerAreaModel: new OrderTotalsFooterModel(() => tableModel.getBodyModel() as AreaModelObjectArray<Order>, columns)
    });
    scope = new TableScope(ctx.host, tableModel, new SimpleDomService(),
      { ...new TableOptions(), hoverColumnVisible: false }, new EventAdapter());
    scope.firstInit();
    ctx.info(withRenderers ? "date, progress bar, badge, euro – same values underneath" : "raw values");
  }
  ctx.toggle("renderers", true, build);
  build(true);
  return () => scope?.destroy();
}
