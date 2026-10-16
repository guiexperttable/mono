// Orders with items for the master/detail tests (fixed seed, no Math.random).
//
// Lives outside src/ on purpose: it must not end up in the npm package.
import { ColumnDef, TableFactory, px100, px120, px200 } from '@guiexpert/table';
import type { TableModelIf } from '@guiexpert/table';

export interface OrderItem {
  sku: string;
  name: string;
  qty: number;
  price: number;
}

export interface Order {
  id: number;
  customer: string;
  city: string;
  total: number;
  items: OrderItem[];
}

const CUSTOMERS = ['Ada', 'Bob', 'Cleo', 'Dan', 'Eve', 'Finn', 'Gus', 'Hana'];
const CITIES = ['Berlin', 'Hamburg', 'Munich', 'Cologne'];
const PRODUCTS = ['Pen', 'Paper', 'Stapler', 'Folder', 'Marker', 'Tape'];

/** `count` orders with 1 … 6 items each (deterministic). */
export function createOrders(count: number): Order[] {
  let seed = 4711;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const orders: Order[] = [];
  for (let i = 0; i < count; i++) {
    const items: OrderItem[] = [];
    const n = 1 + Math.floor(rnd() * 6);
    for (let k = 0; k < n; k++) {
      const product = PRODUCTS[Math.floor(rnd() * PRODUCTS.length)];
      items.push({ sku: `${product.slice(0, 3).toUpperCase()}-${i}-${k}`, name: product, qty: 1 + Math.floor(rnd() * 9), price: Math.round(rnd() * 5000) / 100 });
    }
    orders.push({
      id: i + 1,
      customer: CUSTOMERS[i % CUSTOMERS.length],
      city: CITIES[i % CITIES.length],
      total: Math.round(items.reduce((sum, it) => sum + it.qty * it.price, 0) * 100) / 100,
      items,
    });
  }
  return orders;
}

/** id (fixed west column), customer, city, total. */
export function createOrderModel(orders: Order[], fixedLeftColumnCount = 1): TableModelIf {
  const columnDefs = [
    ColumnDef.create({ property: 'id', headerLabel: 'Id', width: px100 }),
    ColumnDef.create({ property: 'customer', headerLabel: 'Customer', width: px200, sortable: () => true }),
    ColumnDef.create({ property: 'city', headerLabel: 'City', width: px200 }),
    ColumnDef.create({ property: 'total', headerLabel: 'Total', width: px120, sortable: () => true }),
  ];
  return TableFactory.createTableModel({ rows: orders, columnDefs, fixedLeftColumnCount });
}

/** The model of the items of one order (for nested tables). */
export function createItemModel(order: Order): TableModelIf {
  return TableFactory.createTableModel({ rows: order.items, properties: ['sku', 'name', 'qty', 'price'] });
}
