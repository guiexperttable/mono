// Chapter 2 – the principle behind every fast data grid: only draw what you see.
import { createOrders, type Order } from "./shared/orders";
import { type DemoContext, domCount, fmt } from "./shared/demo";

export default function (ctx: DemoContext) {
  // #region dom
  // @show: <div class="viewport">          <!-- overflow: auto; fixed height -->
  // @show:   <div class="spacer"></div>    <!-- as high as ALL rows → real scrollbar -->
  // @show:   <div class="rows"></div>      <!-- the few visible rows, position: absolute -->
  // @show: </div>
  // #endregion dom
  const viewport = ctx.host.appendChild(document.createElement("div"));
  viewport.className = "vs-viewport";
  const spacer = viewport.appendChild(document.createElement("div"));
  const rowsDiv = viewport.appendChild(document.createElement("div"));
  rowsDiv.className = "vs-rows";
  let orders: Order[] = [];

  // #region scroller
  const ROW_HEIGHT = 30;

  function renderRow(order: Order): HTMLDivElement {
    const row = document.createElement("div");
    row.className = "vs-row";
    for (const value of Object.values(order)) {
      row.appendChild(document.createElement("span")).textContent = String(value);
    }
    return row;
  }

  // 1. The spacer is as high as ALL rows together → the browser shows a real scrollbar.
  function setRowCount(count: number): void {
    spacer.style.height = `${count * ROW_HEIGHT}px`;
  }

  // 2. On every scroll: which rows are visible? Only those go into the DOM.
  function render(): void {
    const first = Math.floor(viewport.scrollTop / ROW_HEIGHT);
    const visible = Math.ceil(viewport.clientHeight / ROW_HEIGHT) + 1;
    const rows = orders.slice(first, first + visible);
    rowsDiv.style.transform = `translateY(${first * ROW_HEIGHT}px)`;   // 3. move them to their place
    rowsDiv.replaceChildren(...rows.map(renderRow));
  }

  viewport.addEventListener("scroll", render);
  // #endregion scroller

  function renderAndMeasure(): void {
    const t0 = performance.now();
    render();
    const ms = (performance.now() - t0).toFixed(1);
    const first = Math.floor(viewport.scrollTop / ROW_HEIGHT);
    ctx.info(`row ${fmt(first + 1)} of ${fmt(orders.length)} · ${domCount(viewport)} DOM elements · ${ms} ms`);
  }
  viewport.addEventListener("scroll", renderAndMeasure);

  function load(count: number): void {
    orders = createOrders(count);
    setRowCount(count);
    viewport.scrollTop = 0;
    renderAndMeasure();
  }
  ctx.button("100,000 rows", () => load(100_000));
  ctx.button("1,000,000 rows", () => load(1_000_000));
  ctx.button("jump to the middle", () => { viewport.scrollTop = viewport.scrollHeight / 2; });
  load(100_000);
}
