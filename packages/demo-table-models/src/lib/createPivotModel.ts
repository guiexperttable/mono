import {
  PivotFactory,
  PivotTableModel,
  RowGroupField,
  SelectionModel,
  TableModelAndOptions,
  TableModelAndOptionsIf,
  TableOptions,
  TableOptionsIf,
  px120
} from "@guiexpert/table";
import { PivotOrderIf } from "../model/pivot-order.if";
import { generateSalesOrders } from "./createRowGroupModel";

/** A small seeded PRNG (mulberry32) – separate from the one of the orders, so their values stay the same. */
function seeded(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministic orders for pivot demos: {@link generateSalesOrders} plus an order date between 2024-01-01 and 2026-12-31.
 *
 * @param count - number of orders
 * @param seed - the same seed gives the same orders
 */
export function generatePivotOrders(count: number, seed = 42): PivotOrderIf[] {
  const rnd = seeded(seed + 1);
  const start = Date.UTC(2024, 0, 1);
  const days = 3 * 365 + 1;
  return generateSalesOrders(count, seed).map(order => ({
    ...order,
    date: new Date(start + Math.floor(rnd() * days) * 86_400_000).toISOString().slice(0, 10),
  }));
}

/** The year of an order (pivot field). */
export const pivotYear: RowGroupField<PivotOrderIf> = { name: "year", label: "Year", value: o => Number(o.date.slice(0, 4)) };

/** The quarter of an order as 1 … 4, shown as "Q1" … "Q4" (pivot field). */
export const pivotQuarter: RowGroupField<PivotOrderIf> = {
  name: "quarter", label: "Quarter",
  value: o => Math.floor((Number(o.date.slice(5, 7)) - 1) / 3) + 1,
  format: q => `Q${q}`
};

/**
 * Pivot demo (since 1.1.94): orders by country › city (rows) × year › quarter (columns), revenue (sum of total) and
 * number of orders, year totals (collapsible years), total column and total row. Pivot again at runtime with
 * `tableApi.setPivotConfig({ columnFields: [pivotYear] })`.
 *
 * @param count - number of orders (default 50,000)
 * @param columnFields - the column fields (default year › quarter)
 * @param expanded - open row levels (default 0: countries closed)
 */
export function createPivotModelAndOptions(
  count = 50_000,
  columnFields: RowGroupField<PivotOrderIf>[] = [pivotYear, pivotQuarter],
  expanded = 0): TableModelAndOptionsIf {

  const selectionModel = new SelectionModel("range", "multi");
  const tableOptions: TableOptionsIf = {
    ...new TableOptions(),
    hoverColumnVisible: false,
    getSelectionModel: () => selectionModel,
  };
  const tableModel: PivotTableModel<PivotOrderIf> = PivotFactory.createTableModel<PivotOrderIf>({
    rows: generatePivotOrders(count),
    rowFields: [{ value: "country", label: "Country" }, { value: "city", label: "City" }],
    columnFields,
    values: [
      { value: "total", label: "Revenue", format: v => v === undefined ? "" : Math.round(v as number).toLocaleString("en-US") },
      { value: "id", aggregator: "count", label: "Orders" },
    ],
    expanded,
    valueColumnWidth: px120,
    groupColumn: { showCount: false },
    tableOptions,
  });
  return new TableModelAndOptions(tableModel, tableOptions);
}
