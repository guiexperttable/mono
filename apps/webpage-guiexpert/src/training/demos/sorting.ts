// Chapter 20 – sorting: double-click on a header, own comparators, sorting from code.
// #region columns
import { ColumnDef, TrueFn, px110, px120, px180 } from "@guiexpert/table";
import type { Order } from "./shared/orders";

const STATUS_ORDER: Order["status"][] = ["open", "paid", "shipped", "cancelled"];
const rank = (s: Order["status"]) => STATUS_ORDER.indexOf(s);

const customer = ColumnDef.create({
  property: "customer", headerLabel: "Customer", width: px180, sortable: TrueFn,
  sortComparator: (a: string, b: string) => a.localeCompare(b, "de")     // "Müller" before "Nordlicht"
});
const status = ColumnDef.create({
  property: "status", headerLabel: "Status", width: px110, sortable: TrueFn,
  sortComparator: (a: Order["status"], b: Order["status"]) => rank(a) - rank(b)   // workflow order
});
const total = ColumnDef.create({
  property: "total", headerLabel: "Total", width: px120, sortable: TrueFn,
  sortState: "desc"                                     // only the icon – see doSort() below
});
// #endregion columns

import {
  EventAdapter, SimpleDomService, SortItem, TableFactory, TableOptions, TableScope, allRight, bodyLeft, px80, px130
} from "@guiexpert/table";
import { createOrders } from "./shared/orders";
import { type DemoContext, fmt } from "./shared/demo";

export default function (ctx: DemoContext) {
  const orders = createOrders(100_000);
  const columnDefs = [
    new ColumnDef("id", "ID", px80, allRight),
    new ColumnDef("date", "Date", px120),
    customer,
    new ColumnDef("country", "Country", px130, bodyLeft),
    status,
    total
  ];
  for (const c of columnDefs) c.sortable ??= TrueFn;
  customer.classes.body = ["ge-table-text-align-left"];
  total.classes.header = ["ge-table-text-align-right"];
  total.classes.body = ["ge-table-text-align-right"];

  // #region doSort
  const tableModel = TableFactory.createTableModel({ rows: orders, columnDefs });
  const index = columnDefs.indexOf(total);
  tableModel.doSort([new SortItem(index, "desc")]);    // sort once to match the icon
  // #endregion doSort
  const scope = new TableScope(ctx.host, tableModel, new SimpleDomService(), { ...new TableOptions() }, new EventAdapter());
  scope.firstInit();
  const tableApi = scope.getApi();

  // #region api
  // like a double-click on the header: icon included, without a direction it toggles
  ctx.button("sort by status", () => tableApi.sortByColumn("status")); // @show: statusButton.onclick = () => tableApi.sortByColumn("status");
  ctx.button("total ↓", () => tableApi.sortByColumn("total", "desc")); // @show: totalButton.onclick = () => tableApi.sortByColumn("total", "desc");

  // any comparator on the row objects (clears the header icons – they would not match)
  ctx.button("newest first", () => { // @show: newestButton.onclick = () => {
    const t0 = performance.now(); // @hide
    tableApi.sort((a: Order, b: Order) => b.date.localeCompare(a.date));
    ctx.info(`${fmt(orders.length)} rows sorted in ${Math.round(performance.now() - t0)} ms`); // @hide
  });
  // #endregion api
  ctx.info("double-click a header: asc → desc → asc …");
  return () => scope.destroy();
}
