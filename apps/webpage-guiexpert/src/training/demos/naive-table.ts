// Chapter 1 – the "naive" way: one <tr> per order, every row straight into the DOM.
import { createOrders, type Order } from "./shared/orders";
import { type DemoContext, domCount, fmt } from "./shared/demo";

export default function (ctx: DemoContext) {
  const scroll = ctx.host.appendChild(document.createElement("div"));
  scroll.className = "naive-scroll";
  const table = scroll.appendChild(document.createElement("table"));
  let orders: Order[] = [];
  const columns: (keyof Order)[] = ["id", "date", "customer", "country", "city", "product", "category",
    "quantity", "price", "total", "status"];

  // #region render
  function render(rows: Order[]): void {
    table.innerHTML = "";
    const header = table.createTHead().insertRow();
    for (const col of columns) {
      const th = header.appendChild(document.createElement("th"));
      th.textContent = col;
      th.onclick = () => sortBy(col);
    }
    const tbody = table.createTBody();
    for (const order of rows) {                      // one <tr> per order …
      const tr = tbody.insertRow();
      for (const value of Object.values(order)) {    // … one <td> per value
        tr.insertCell().textContent = String(value);
      }
    }
  }
  // #endregion render

  /** Measures until the browser has really painted – layout of all cells included. */
  function measure(label: string, work: () => void): void {
    ctx.info(`${label} …`);
    setTimeout(() => {                                // let the "…" appear before the browser blocks
      const t0 = performance.now();
      work();
      requestAnimationFrame(() => setTimeout(() => {
        const ms = Math.round(performance.now() - t0);
        ctx.info(`${label}: ${fmt(ms)} ms · ${fmt(domCount(table))} DOM elements`);
      }));
    }, 30);
  }

  let sortCol: keyof Order | undefined;
  let asc = true;
  // #region sort
  function sortBy(col: keyof Order): void {
    asc = col === sortCol ? !asc : true;
    sortCol = col;
    measure(`sort by ${col}`, () => {
      // sorting itself takes milliseconds – building every cell again is what hurts
      orders.sort((a, b) => (a[col] < b[col] ? -1 : a[col] > b[col] ? 1 : 0) * (asc ? 1 : -1));
      render(orders);
    });
  }
  // #endregion sort

  function load(count: number): void {
    orders = createOrders(count);
    measure(`${fmt(count)} rows`, () => render(orders));
  }

  ctx.button("1,000 rows", () => load(1_000));
  ctx.button("5,000 rows", () => load(5_000));
  ctx.button("20,000 rows (slow!)", () => load(20_000));
  load(1_000);
}
