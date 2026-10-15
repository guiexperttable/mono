// Chapter 37 – pivot tables (since 1.1.94): flat orders as countries › cities × years › quarters with revenue and
// number of orders, subtotals, collapsible years, total column and total row; pivot again at runtime; a filter that works
// before the aggregation; a click shows the orders behind a cell (drill-down).
import {
  EventAdapter, PivotFactory, SimpleDomService, TableOptions, TableScope, px110,
  type GeMouseEvent, type PivotValue, type RowGroupField, type TableApi, type TableOptionsIf
} from "@guiexpert/table";
import { createOrders, type Order } from "./shared/orders";
import { type DemoContext, fmt, since } from "./shared/demo";

// #region fields
const YEAR: RowGroupField<Order> = { name: "year", label: "Year", value: o => Number(o.date.slice(0, 4)) };
const QUARTER: RowGroupField<Order> = {
  name: "quarter", label: "Quarter",
  value: o => Math.ceil(Number(o.date.slice(5, 7)) / 3),     // 1 … 4
  format: q => `Q${q}`
};
// #endregion fields

const money = (v: unknown) => v === undefined ? "" : Math.round(v as number).toLocaleString("en");

// #region values
const REVENUE_AND_ORDERS: PivotValue<Order>[] = [
  { value: "total", label: "Revenue", format: money },        // sum is the default
  { value: "id", aggregator: "count", label: "Orders" }
];
// #endregion values

export default function (ctx: DemoContext) {
  const orders = createOrders(100_000);
  let query = "";
  const t0 = performance.now();
  // #region model
  const tableModel = PivotFactory.createTableModel<Order>({
    rows: orders,
    rowFields: ["country", "city"],          // rows: a hierarchy with subtotals
    columnFields: [YEAR, QUARTER],           // columns: made from the data
    values: REVENUE_AND_ORDERS,              // in every cell
    expanded: 0,                             // countries closed
    valueColumnWidth: px110
  });
  // #endregion model
  const listener = new EventAdapter();
  // #region drill
  listener.onMouseClicked = (evt: GeMouseEvent) => {
    if (evt.areaIdent !== "body") return;
    const body = tableModel.getPivotBody();
    const rows = body.getCellSourceRows(evt.rowIndex, evt.columnIndex);   // the orders behind the cell
    ctx.info(`${body.getRowGroup(evt.rowIndex)?.label ?? ""}: ${fmt(rows.length)} orders`);
  };
  // #endregion drill
  const tableOptions: TableOptionsIf = {
    ...new TableOptions(),
    hoverColumnVisible: false,
    // #region filter
    externalFilterFunction: (o: Order) => !query || `${o.product} ${o.category}`.toLowerCase().includes(query)
    // #endregion filter
  };
  const scope = new TableScope(ctx.host, tableModel, new SimpleDomService(), tableOptions, listener);
  scope.firstInit();
  const api: TableApi = scope.getApi();
  ctx.info(`${fmt(orders.length)} orders pivoted in ${since(t0)} ms`);

  const pivot = (label: string, columnFields: RowGroupField<Order>[]) => ctx.button(label, () => {
    const t1 = performance.now();
    // #region repivot
    api.setPivotConfig({ columnFields });    // same model, same table: new columns
    // #endregion repivot
    ctx.info(`pivoted ${fmt(orders.length)} orders in ${since(t1)} ms`);
  });
  pivot("year › quarter", [YEAR, QUARTER]);
  pivot("year", [YEAR]);
  pivot("category", ["category"]);
  ctx.button("average", () => api.setPivotConfig({ values: [{ value: "total", aggregator: "avg", label: "Ø Order", format: money }] }));
  ctx.button("expand all", () => api.expandAll());
  ctx.search("filter: product or category …", value => {
    query = value.trim().toLowerCase();
    api.externalFilterChanged();             // all cells and totals follow – the filter works on the orders
  });
  return () => scope.destroy();
}
