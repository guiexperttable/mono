// Chapter 27 – heatmap: revenue per city and month, the colour comes from the value.
import type { Order } from "./shared/orders";

interface RevenueMatrix { months: string[]; rows: (string | number)[][]; min: number; max: number }

/** One row per city, one column per month (revenue in thousand euro). */
function revenueByCityAndMonth(orders: Order[]): RevenueMatrix {
  const perMonth = new Map<string, number>();
  for (const o of orders) perMonth.set(o.date.slice(0, 7), (perMonth.get(o.date.slice(0, 7)) ?? 0) + 1);
  const average = orders.length / perMonth.size;
  const months = [...perMonth.keys()].filter(m => perMonth.get(m)! > average / 2).sort();   // complete months
  const cities = [...new Set(orders.map(o => o.city))].sort();
  const sums = new Map<string, number>();
  for (const o of orders) {
    const key = `${o.city}|${o.date.slice(0, 7)}`;
    sums.set(key, (sums.get(key) ?? 0) + o.total);
  }
  const rows = cities.map(c => [c, ...months.map(m => Math.round((sums.get(`${c}|${m}`) ?? 0) / 1000))]);
  const values = rows.flatMap(r => r.slice(1) as number[]);
  return { months, rows, min: Math.min(...values), max: Math.max(...values) };
}

// #region model
import { AreaModelArrayOfArrays, ColorRgb, GeCssColorUtil, ThreeColorGradientArg } from "@guiexpert/table";

export class RevenueHeatmapModel extends AreaModelArrayOfArrays<string | number> {
  private readonly gradient: ThreeColorGradientArg;

  constructor(matrix: RevenueMatrix) {
    super("body", matrix.rows, 34);
    this.gradient = new ThreeColorGradientArg(
      matrix.min, new ColorRgb(255, 255, 255),                       // white
      (matrix.min + matrix.max) / 2, new ColorRgb(244, 114, 182),    // pink
      matrix.max, new ColorRgb(79, 70, 229));                        // indigo
  }

  // called only for visible cells
  override getCustomStyleAt(rowIndex: number, columnIndex: number): { [key: string]: string } | undefined {
    if (columnIndex === 0) return undefined;                         // the city name
    const value = Number(this.getValueAt(rowIndex, columnIndex));
    return {
      "background-color": GeCssColorUtil.getThreeColorGradientRGB(value, this.gradient),
      "color": value > this.gradient.middleValue ? "#ffffff" : "#111827"
    };
  }
}
// #endregion model

import { EventAdapter, SimpleDomService, TableFactory, TableOptions, TableScope } from "@guiexpert/table";
import { createOrders } from "./shared/orders";
import { type DemoContext } from "./shared/demo";

export default function (ctx: DemoContext) {
  const matrix = revenueByCityAndMonth(createOrders(100_000));
  // #region table
  const tableModel = TableFactory.createTableModel({
    headerData: [["City (k€)", ...matrix.months]],
    bodyAreaModel: new RevenueHeatmapModel(matrix),
    columnSizes: [150, ...matrix.months.map(() => 90)],
    fixedLeftColumnCount: 1                                          // the city stays visible
  });
  // #endregion table
  const scope = new TableScope(ctx.host, tableModel, new SimpleDomService(),
    { ...new TableOptions(), hoverColumnVisible: false }, new EventAdapter());
  scope.firstInit();
  ctx.info(`${matrix.rows.length} cities × ${matrix.months.length} months · ${matrix.min}–${matrix.max} k€`);
  return () => scope.destroy();
}

// #region classes
import { AreaModelObjectArray } from "@guiexpert/table";

export class OrderBodyModel extends AreaModelObjectArray<Order> {
  override getCustomClassesAt(rowIndex: number, columnIndex: number): string[] {
    const order = this.getRowByIndex(rowIndex) as Order;
    const classes: string[] = [];
    if (order.status === "cancelled") classes.push("row-cancelled");
    if (this.columnDefs[columnIndex]?.property === "total" && order.total > 10_000) classes.push("big-order");
    return classes;
  }
}
// const tableModel = TableFactory.createTableModel({ bodyAreaModel: new OrderBodyModel("body", orders, 34, columnDefs), columnDefs });
// #endregion classes
