// Chapter 17 – own AreaModel: two million rows, no array behind it.
// #region model
import { AreaModel } from "@guiexpert/table";

const COUNTRIES = ["Germany", "Austria", "Switzerland", "France", "Italy", "Spain", "Poland", "Czechia"];
const STATUS = ["open", "paid", "shipped", "cancelled"];
const DAY = 86_400_000, START = Date.UTC(2020, 0, 1);

// cheap, deterministic "random" number per row and column (same row → same value, every time)
function hash(row: number, col: number): number {
  let h = Math.imul(row ^ (col << 24), 0x9e3779b1);
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  return (h ^ (h >>> 13)) >>> 0;
}

export class TwoMillionRows extends AreaModel {
  constructor(private readonly rows = 2_000_000) {
    super();
    this.areaIdent = "body";
  }
  override getRowCount(): number { return this.rows; }
  override getRowHeight(_rowIndex: number): number { return 34; }
  override getConstantRowHeight(): number { return 34; }   // all rows equally high → O(1) while scrolling

  override getValueAt(row: number, col: number): any {      // called only for visible cells
    switch (col) {
      case 0: return row + 1;                                                          // ID
      case 1: return new Date(START + (row % 2_400) * DAY).toISOString().slice(0, 10); // date
      case 2: return COUNTRIES[hash(row, 2) % COUNTRIES.length];                       // country
      case 3: return (hash(row, 3) % 100_000) / 100;                                   // amount
      case 4: return STATUS[hash(row, 4) % STATUS.length];                             // status
    }
    return "";
  }
}
// #endregion model

// #region table
import {
  ColumnDef, EventAdapter, SimpleDomService, TableFactory, TableOptions, TableScope, allRight, bodyLeft, px120, px160
} from "@guiexpert/table";
// #endregion table
import { type DemoContext, domCount, fmt, since } from "./shared/demo";

export default function (ctx: DemoContext) {
  const rowCount = 2_000_000;
  const t0 = performance.now();
  // #region table
  const tableModel = TableFactory.createTableModel({
    bodyAreaModel: new TwoMillionRows(rowCount),
    columnDefs: [
      new ColumnDef("id", "ID", px120, allRight),
      new ColumnDef("date", "Date", px120),
      new ColumnDef("country", "Country", px160, bodyLeft),
      new ColumnDef("amount", "Amount", px120, allRight),
      new ColumnDef("status", "Status", px120)
    ]
  });
  const host = ctx.host; // @show: const host = document.querySelector<HTMLDivElement>(".table-div")!;
  const scope = new TableScope(host, tableModel, new SimpleDomService(), new TableOptions(), new EventAdapter())
    .firstInit();
  const api = scope.getApi();
  // #endregion table
  const ms = since(t0);
  const fps = ctx.info;
  ctx.button("top", () => api.ensureRowIsVisible(0));
  ctx.button("row 1,000,000", () => api.scrollToIndex(0, 999_999));
  ctx.button("end", () => api.ensureRowIsVisible(rowCount - 1));

  let frames = 0, last = performance.now(), alive = true;
  (function tick(now: number) {
    if (!alive) return;
    frames++;
    if (now - last >= 1000) {
      fps(`${fmt(rowCount)} rows · ready in ${ms} ms · ${frames} fps · ${fmt(domCount(host))} DOM elements`);
      frames = 0; last = now;
    }
    requestAnimationFrame(tick);
  })(last);
  return () => { alive = false; scope.destroy(); };
}

// #region paged
import type { Order } from "./shared/orders";

/** Sketch: rows come from a server, 100 at a time. */
export class PagedOrders extends AreaModel {
  private readonly pages = new Map<number, Order[]>();
  private readonly loading = new Set<number>();

  constructor(private readonly total: number, private readonly onLoaded: () => void) {
    super();
    this.areaIdent = "body";
  }
  override getRowCount(): number { return this.total; }
  override getRowHeight(_rowIndex: number): number { return 34; }
  override getConstantRowHeight(): number { return 34; }

  override getValueAt(row: number, col: number): any {
    const page = Math.floor(row / 100);
    const rows = this.pages.get(page);
    if (!rows) {
      this.load(page);
      return "…";                                          // placeholder until the page has arrived
    }
    return Object.values(rows[row % 100])[col];
  }

  private async load(page: number): Promise<void> {
    if (this.loading.has(page)) return;
    this.loading.add(page);
    const res = await fetch(`/api/orders?offset=${page * 100}&limit=100`);
    this.pages.set(page, await res.json());
    this.onLoaded();                                       // e.g. () => tableApi.repaint()
  }
}
// #endregion paged
