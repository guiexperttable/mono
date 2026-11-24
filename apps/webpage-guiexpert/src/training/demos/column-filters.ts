// Chapter 21 – built-in column filters, Excel value checklist and column chooser (since 1.1.114).
import {
  ColumnDef, EventAdapter, SimpleDomService, TableFactory, TableOptions, TableScope,
  type GeFilterEvent, type TableOptionsIf, TrueFn, px120, px160, px90
} from "@guiexpert/table";
import { createOrders } from "./shared/orders";
import { type DemoContext, fmt } from "./shared/demo";

export default function (ctx: DemoContext) {
  const orders = createOrders(100_000);
  // #region setup
  const columnDefs = [
    ColumnDef.create({ property: "id", headerLabel: "#", width: px90, sortable: TrueFn, hideable: false, filter: "number" }),
    ColumnDef.create({ property: "customer", headerLabel: "Customer", width: px160, sortable: TrueFn }),
    ColumnDef.create({ property: "country", headerLabel: "Country", width: px120, sortable: TrueFn }),
    ColumnDef.create({ property: "city", headerLabel: "City", width: px120, sortable: TrueFn }),
    ColumnDef.create({ property: "product", headerLabel: "Product", width: px160, sortable: TrueFn }),
    ColumnDef.create({ property: "total", headerLabel: "Total", width: px120, sortable: TrueFn, filter: "number" }),
  ];
  const tableModel = TableFactory.createTableModel({
    rows: orders,
    columnDefs,
    footerAggregates: { total: "sum" },
  });
  const options: TableOptionsIf = {
    ...new TableOptions(),
    filterRow: true,            // persistent inputs below the header (>1000, 500..2000, =Berlin)
    columnFilterMenu: true,     // funnel button + virtualized Excel value checklist
  };
  // #endregion setup

  const listener = new EventAdapter();
  // #region events
  listener.onFilterChanged = (evt: GeFilterEvent) => {
    const active = Object.keys(evt.filters).length;
    ctx.info(`${fmt(evt.rowCount)} of ${fmt(evt.unfilteredRowCount)} orders` + (active ? ` · ${active} filter(s)` : ""));
  };
  // #endregion events

  const scope = new TableScope(ctx.host, tableModel, new SimpleDomService(), options, listener);
  scope.firstInit();
  const tableApi = scope.getApi();

  // #region controls
  ctx.button("Filter row", () => tableApi.setFilterRowVisible(!tableApi.isFilterRowVisible()));
  const colBtn = ctx.button("Columns", () => tableApi.showColumnChooser(colBtn));
  ctx.button("Clear filters", () => tableApi.clearColumnFilters());
  // #endregion controls

  ctx.info(`${fmt(orders.length)} orders – type ">5000" in Total or click a header funnel`);
  return () => scope.destroy();
}
