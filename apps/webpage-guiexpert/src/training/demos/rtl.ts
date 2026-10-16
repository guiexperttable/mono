// Chapter 28 (section) – right-to-left: one option mirrors the table (since 1.1.98).
import {
  EventAdapter, SimpleDomService, TableFactory, TableOptions, TableScope, type TableOptionsIf
} from "@guiexpert/table";
import { createOrders } from "./shared/orders";
import { createOrderColumns } from "./shared/order-columns";
import { type DemoContext, fmt } from "./shared/demo";

/** Arabic header labels for the order columns – the data stays as it is (mixed text is fine). */
const ARABIC: Record<string, string> = {
  id: "الرقم", date: "التاريخ", customer: "العميل", country: "البلد", city: "المدينة", product: "المنتج",
  quantity: "الكمية", price: "السعر", status: "الحالة", total: "المجموع"
};

export default function (ctx: DemoContext) {
  const orders = createOrders(100_000);
  let rtl = true;
  let scope: TableScope | undefined;

  const create = () => {
    scope?.destroy();
    const columnDefs = createOrderColumns();
    for (const column of columnDefs) column.headerLabel = ARABIC[column.property] ?? column.headerLabel;
    // Latin names with a final period ("Rossi S.p.A."): each label gets the direction of its own text
    columnDefs.find(c => c.property === "customer")!.classes.body = ["ge-table-text-plaintext"];
    // #region rtl
    const tableModel = TableFactory.createTableModel({
      rows: orders,
      columnDefs,
      fixedLeftColumnCount: 1                 // "left" = start: stays on the RIGHT in right-to-left
    });
    const tableOptions: TableOptionsIf = {
      ...new TableOptions(),
      direction: rtl ? "rtl" : "ltr"          // or "auto": the direction of the page (<html dir="rtl">)
    };
    // #endregion rtl
    scope = new TableScope(ctx.host, tableModel, new SimpleDomService(), tableOptions, new EventAdapter());
    scope.firstInit();
    ctx.info(`${fmt(orders.length)} orders – direction: ${scope.getApi().getDirection()}`);
  };

  create();
  ctx.toggle("right-to-left", true, checked => { rtl = checked; create(); });
  ctx.button("→ scroll to the end", () => scope?.getApi().ensureColumnIsVisible(10));
  return () => scope?.destroy();
}
