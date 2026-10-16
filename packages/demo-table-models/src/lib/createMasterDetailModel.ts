import {
  ColumnDef,
  FocusModel,
  px100,
  px120,
  px160,
  px200,
  SelectionModel,
  TableFactory,
  TableModelAndOptions,
  TableModelAndOptionsIf,
  TableModelIf,
  TableOptions,
  TableOptionsIf
} from "@guiexpert/table";
import type { DetailRenderContextIf, MasterDetailOptionsIf } from "@guiexpert/table";
import { MasterOrderIf, MasterOrderItemIf } from "../model/master-order.if";

const CUSTOMERS = ["Ada Lovelace", "Alan Turing", "Grace Hopper", "Linus Torvalds", "Margaret Hamilton", "Dennis Ritchie",
  "Barbara Liskov", "Ken Thompson", "Katherine Johnson", "Tim Berners-Lee"];
const CITIES = ["Berlin", "Hamburg", "Munich", "Cologne", "Vienna", "Zurich"];
const STATUS = ["open", "paid", "shipped", "delivered"];
const PRODUCTS: [string, number][] = [["Desk lamp", 39.9], ["Standing desk", 499], ["Office chair", 289], ["Monitor arm", 89.5],
  ["Notebook A5", 4.2], ["USB-C cable", 12.9], ["Keyboard", 79], ["Mouse", 39], ["Webcam", 99], ["Headset", 149],
  ["Coffee beans", 15.5], ["Water bottle", 19.9]];

/**
 * `count` orders with 1 … 8 items each for master/detail demos (since 1.1.97). Fixed seed: the same count gives the
 * same orders.
 *
 * @param count - number of orders (default 1000)
 */
export function generateMasterOrders(count = 1000): MasterOrderIf[] {
  let seed = 20261016;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const orders: MasterOrderIf[] = [];
  for (let i = 0; i < count; i++) {
    const items: MasterOrderItemIf[] = [];
    const n = 1 + Math.floor(rnd() * 8);
    for (let k = 0; k < n; k++) {
      const [product, unitPrice] = PRODUCTS[Math.floor(rnd() * PRODUCTS.length)];
      items.push({ sku: `SKU-${String(1 + Math.floor(rnd() * 900)).padStart(3, "0")}`, product, quantity: 1 + Math.floor(rnd() * 5), unitPrice });
    }
    const day = 1 + (i % 28);
    orders.push({
      id: i + 1,
      orderNo: `ORD-${String(10001 + i)}`,
      customer: CUSTOMERS[Math.floor(rnd() * CUSTOMERS.length)],
      city: CITIES[i % CITIES.length],
      date: `2026-${String(1 + (i % 9)).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      status: STATUS[Math.floor(rnd() * STATUS.length)],
      total: Math.round(items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0) * 100) / 100,
      items
    });
  }
  return orders;
}

/**
 * The table model of the items of one order – the nested table of a detail row.
 *
 * @param order - the master row
 */
export function createOrderItemsModel(order: MasterOrderIf): TableModelIf {
  return TableFactory.createTableModel({
    rows: order.items,
    columnDefs: [
      ColumnDef.create({ property: "sku", headerLabel: "SKU", width: px100 }),
      ColumnDef.create({ property: "product", headerLabel: "Product", width: px200 }),
      ColumnDef.create({ property: "quantity", headerLabel: "Qty", width: px100, bodyClasses: ["ge-table-text-align-right"] }),
      ColumnDef.create({ property: "unitPrice", headerLabel: "Unit price", width: px120, bodyClasses: ["ge-table-text-align-right"] })
    ]
  });
}

/**
 * Master/detail demo (since 1.1.97): orders (the order number fixed on the left) – expand an order with the arrow
 * (or Enter) and its items appear below as a second GuiExpert table over the full width.
 *
 * @param orders - the rows (default: 100.000 orders of {@link generateMasterOrders})
 * @param masterDetail - overrides of the master/detail options (default: nested item table, 6 rows high)
 */
export function createMasterDetailModelAndOptions(
  orders: MasterOrderIf[] = generateMasterOrders(100_000),
  masterDetail: Partial<MasterDetailOptionsIf<MasterOrderIf>> = {}
): TableModelAndOptionsIf {
  const tableModel = TableFactory.createTableModel({
    rows: orders,
    columnDefs: [
      ColumnDef.create({ property: "orderNo", headerLabel: "Order", width: px160 }),
      ColumnDef.create({ property: "date", headerLabel: "Date", width: px120, sortable: () => true }),
      ColumnDef.create({ property: "customer", headerLabel: "Customer", width: px200, sortable: () => true }),
      ColumnDef.create({ property: "city", headerLabel: "City", width: px120, sortable: () => true }),
      ColumnDef.create({ property: "status", headerLabel: "Status", width: px100 }),
      ColumnDef.create({ property: "total", headerLabel: "Total", width: px120, sortable: () => true, bodyClasses: ["ge-table-text-align-right"] })
    ],
    fixedLeftColumnCount: 1
  });
  const focusModel = new FocusModel("cell");
  const selectionModel = new SelectionModel("row", "multi");
  const tableOptions: TableOptionsIf = {
    ...new TableOptions(),
    hoverColumnVisible: false,
    getFocusModel: () => focusModel,
    getSelectionModel: () => selectionModel,
    ariaLabel: "Orders",
    masterDetail: {
      detailHeight: 6 * 34 + 2 + 16,   // header + 5 rows, borders, padding of the detail cell
      detailRenderer: (_container: HTMLDivElement, order: MasterOrderIf, ctx: DetailRenderContextIf<MasterOrderIf>) => {
        ctx.createTable({ tableModel: createOrderItemsModel(order) });
      },
      getRowId: (order: MasterOrderIf) => order.id,
      ...masterDetail
    }
  };
  return new TableModelAndOptions(tableModel, tableOptions);
}
