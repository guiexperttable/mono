import {
  ColumnDef,
  ColumnDefIf,
  px100,
  px110,
  px140,
  px160,
  RowGroupFactory,
  RowGroupField,
  SelectionModel,
  TableModelAndOptions,
  TableModelAndOptionsIf,
  TableOptions,
  TableOptionsIf,
  TrueFn
} from "@guiexpert/table";
import { SalesOrderIf } from "../model/sales-order.if";

const LOCATIONS: [string, string][] = [["Germany", "Hamburg"], ["Germany", "Berlin"], ["Germany", "Munich"],
  ["Austria", "Vienna"], ["Austria", "Graz"], ["Switzerland", "Zurich"], ["France", "Paris"], ["France", "Lyon"],
  ["Italy", "Milan"], ["Spain", "Madrid"], ["Poland", "Warsaw"], ["Denmark", "Copenhagen"]];
const PRODUCTS: [string, string, number][] = [["Laptop", "Hardware", 1299], ["Monitor", "Hardware", 349],
  ["Keyboard", "Accessories", 89], ["Mouse", "Accessories", 39], ["Docking Station", "Accessories", 219],
  ["Office License", "Software", 129], ["Cloud Credits", "Services", 500], ["Support Plan", "Services", 990]];

/** A small seeded PRNG (mulberry32) – the same seed gives the same orders. */
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
 * Deterministic sales orders for row grouping demos (country, city, product, category, quantity, price, total).
 *
 * @param count - number of orders
 * @param seed - the same seed gives the same orders
 */
export function generateSalesOrders(count: number, seed = 42): SalesOrderIf[] {
  const rnd = seeded(seed);
  const pick = <T>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)];
  const orders: SalesOrderIf[] = new Array(count);
  for (let i = 0; i < count; i++) {
    const [country, city] = pick(LOCATIONS);
    const [product, category, basePrice] = pick(PRODUCTS);
    const quantity = 1 + Math.floor(rnd() * 20);
    const price = Math.round(basePrice * (0.85 + rnd() * 0.3) * 100) / 100;
    orders[i] = { id: i + 1, country, city, product, category, quantity, price, total: Math.round(quantity * price * 100) / 100 };
  }
  return orders;
}

const right = { headerClasses: ["ge-table-text-align-right"], bodyClasses: ["ge-table-text-align-right"], sortable: TrueFn };

/** The columns of {@link generateSalesOrders}. */
export function createSalesOrderColumnDefs(): ColumnDefIf[] {
  return [
    ColumnDef.create({ property: "id", headerLabel: "Order", width: px100, ...right }),
    ColumnDef.create({ property: "country", headerLabel: "Country", width: px140, sortable: TrueFn }),
    ColumnDef.create({ property: "city", headerLabel: "City", width: px140, sortable: TrueFn }),
    ColumnDef.create({ property: "product", headerLabel: "Product", width: px160, sortable: TrueFn }),
    ColumnDef.create({ property: "category", headerLabel: "Category", width: px140, sortable: TrueFn }),
    ColumnDef.create({ property: "quantity", headerLabel: "Qty", width: px100, ...right }),
    ColumnDef.create({ property: "price", headerLabel: "Ø Price", width: px110, ...right }),
    ColumnDef.create({ property: "total", headerLabel: "Total", width: px140, ...right }),
  ];
}

/**
 * Row grouping demo (since 1.1.94): orders grouped by country › city (default), with the sum of quantity and total, the
 * average price and a total row. Regroup at runtime with `tableApi.setRowGroupBy(["category", "product"])`.
 *
 * @param count - number of orders (default 50,000)
 * @param groupBy - the levels (default country › city)
 * @param expanded - open levels (default 1: countries open, cities closed)
 */
export function createRowGroupModelAndOptions(
  count = 50_000,
  groupBy: RowGroupField<SalesOrderIf>[] = ["country", "city"],
  expanded = 1): TableModelAndOptionsIf {

  const selectionModel = new SelectionModel("row", "multi");
  const tableOptions: TableOptionsIf = {
    ...new TableOptions(),
    hoverColumnVisible: false,
    getSelectionModel: () => selectionModel,
  };
  const tableModel = RowGroupFactory.createTableModel<SalesOrderIf>({
    rows: generateSalesOrders(count),
    columnDefs: createSalesOrderColumnDefs(),
    groupBy,
    aggregations: { quantity: "sum", price: "avg", total: "sum" },
    expanded,
    tableOptions,
  });
  return new TableModelAndOptions(tableModel, tableOptions);
}
