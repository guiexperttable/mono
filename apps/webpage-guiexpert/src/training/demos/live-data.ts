// Chapter 32 – live data: prices change many times per second, only the changed cells are redrawn.
// #region model
import {
  ColumnDef, type ColumnDefIf, type TableApi, TableCellUpdateEvent, TableFactory, type TableModelIf,
  allRight, bodyLeft, px100, px120, px200
} from "@guiexpert/table";

export interface Quote { symbol: string; name: string; price: number; change: number; volume: number }

const QUOTE_COLUMNS: ColumnDefIf[] = [
  new ColumnDef("symbol", "Symbol", px100, bodyLeft),
  new ColumnDef("name", "Name", px200, bodyLeft),
  new ColumnDef("price", "Price", px120, allRight),       // column 2
  new ColumnDef("change", "Change %", px120, allRight),   // column 3
  new ColumnDef("volume", "Volume", px120, allRight)      // column 4
];

export function createQuoteModel(quotes: Quote[]): TableModelIf {
  return TableFactory.createTableModel({ rows: quotes, columnDefs: QUOTE_COLUMNS });
}
// #endregion model

const PREFIX = ["Nord", "Alpen", "Rhein", "Elbe", "Baltic", "Donau", "Main", "Isar"];
const SUFFIX = ["Tech", "Energy", "Logistics", "Pharma", "Bank", "Motors", "Foods", "Software"];

function createQuotes(count: number): Quote[] {
  return Array.from({ length: count }, (_, i) => ({
    symbol: `GE${String(i + 1).padStart(4, "0")}`,
    name: `${PREFIX[i % PREFIX.length]} ${SUFFIX[(i * 7) % SUFFIX.length]} ${Math.floor(i / 64) + 1}`,
    price: Math.round((20 + ((i * 37) % 480) + (i % 100) / 100) * 100) / 100,
    change: 0,
    volume: (i * 7919) % 50_000
  }));
}

// #region tick
/** One tick: some quotes move – only their cells are updated. Returns the number of changed cells. */
export function tick(api: TableApi, quotes: Quote[], moves: number): number {
  const events: TableCellUpdateEvent[] = [];
  for (let n = 0; n < moves; n++) {
    const row = Math.floor(Math.random() * quotes.length);
    const q = quotes[row];
    const price = Math.max(1, Math.round(q.price * (1 + (Math.random() - 0.5) / 50) * 100) / 100);
    const change = Math.round((price - q.price) / q.price * 10000) / 100;
    const volume = q.volume + Math.floor(Math.random() * 500);
    const up = change >= 0;
    events.push(
      new TableCellUpdateEvent("body", row, 2, price, { "tick-up": up, "tick-down": !up }),
      new TableCellUpdateEvent("body", row, 3, change, { "tick-up": up, "tick-down": !up }),
      new TableCellUpdateEvent("body", row, 4, volume));
  }
  api.updateCells(events);       // writes the values into the model, redraws only these cells
  return events.length;
}
// #endregion tick

import { EventAdapter, SimpleDomService, TableOptions, TableScope } from "@guiexpert/table";
import { type DemoContext, fmt } from "./shared/demo";

export default function (ctx: DemoContext) {
  const quotes = createQuotes(1_000);
  const scope = new TableScope(ctx.host, createQuoteModel(quotes), new SimpleDomService(),
    { ...new TableOptions(), hoverColumnVisible: false }, new EventAdapter()).firstInit();
  const api = scope.getApi();

  // #region timer
  let cells = 0;
  let timer = window.setInterval(() => cells += tick(api, quotes, 50), 100);   // 50 quotes every 100 ms
  // #endregion timer

  let frames = 0, last = performance.now(), alive = true;
  (function measure(now: number) {
    if (!alive) return;
    frames++;
    if (now - last >= 1000) {
      ctx.info(`${fmt(quotes.length)} quotes · ${fmt(cells)} cell updates/s · ${frames} fps`);
      cells = 0; frames = 0; last = now;
    }
    requestAnimationFrame(measure);
  })(last);
  ctx.button("pause", b => {
    if (timer) { clearInterval(timer); timer = 0; } else timer = window.setInterval(() => cells += tick(api, quotes, 50), 100);
    b.textContent = timer ? "pause" : "play";
  });
  return () => { alive = false; clearInterval(timer); scope.destroy(); };
}
