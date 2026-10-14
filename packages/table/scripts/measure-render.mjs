// Measures the render time of one scroll frame (TableScope.adjustAfterScrolling) of a large table in Chromium.
//
//   node scripts/measure-render.mjs [distDir] [--rows 2000000] [--cols 30] [--frames 300]
//
// distDir defaults to ./dist (run `pnpm build:core` first). Compare two builds by passing a copy of an older dist.
// Used for the performance budget of the ARIA feature (prompts/001-aria-screenreader.design.md, §Performance):
// the same 2-million-row model as the website showcase "Large dataset", 1200 × 800 px, scrolled to `frames`
// positions spread over the whole table; the median and p95 of the render time per frame are printed.
// Not part of the test suites (timings depend on the machine) – run it manually before/after a rendering change.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, join, extname } from 'node:path';
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i > -1 ? Number(args[i + 1]) : def;
};
const distDir = resolve(args.find(a => !a.startsWith('--') && !/^\d+$/.test(a)) ?? 'dist');
const rows = opt('rows', 2_000_000);
const cols = opt('cols', 30);
const frames = opt('frames', 300);
const runs = opt('runs', 5);

const page = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="/dist/css/main.css">
<style>body{margin:0} .table-div{width:1200px;height:800px}</style></head>
<body><div class="table-div"></div>
<script type="module">
import { AreaModel, ColumnDef, TableFactory, TableOptions, TableScope, SimpleDomService, EventAdapter } from '/dist/index.js';
class LargeBody extends AreaModel {
  constructor() { super(); this.areaIdent = 'body'; }
  getRowCount() { return ${rows}; }
  getRowHeight() { return 34; }
  getConstantRowHeight() { return 34; }
  getValueAt(r, c) { return c === 0 ? r : 'R' + r + ' C' + c; }
}
const columnDefs = Array.from({ length: ${cols} }, (_, i) => new ColumnDef('c' + i, 'Column ' + i));
const tableModel = TableFactory.createTableModel({ bodyAreaModel: new LargeBody(), columnDefs, fixedLeftColumnCount: 1 });
const host = document.querySelector('.table-div');
const scope = new TableScope(host, tableModel, new SimpleDomService(), new TableOptions(), new EventAdapter());
scope.firstInit();
window.measure = (frames) => {
  const vp = scope.scrollViewport;
  const max = vp.scrollHeight - vp.clientHeight;
  const times = [];
  for (let i = 0; i < frames; i++) {
    vp.scrollTop = Math.round(max * ((i * 7919) % frames) / frames);
    vp.scrollLeft = (i % 5) * 200;
    const t0 = performance.now();
    scope.adjustAfterScrolling();
    document.body.offsetHeight; // include style + layout of the new DOM
    times.push(performance.now() - t0);
  }
  times.sort((a, b) => a - b);
  return { median: times[Math.floor(times.length / 2)], p95: times[Math.floor(times.length * 0.95)],
           cells: host.querySelectorAll('.ge-table-col-div').length };
};
window.ready = true;
</script></body></html>`;

const types = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.cjs': 'text/javascript' };
const server = createServer(async (req, res) => {
  try {
    if (req.url === '/' || req.url === '/index.html') {
      res.writeHead(200, { 'content-type': 'text/html' });
      return res.end(page);
    }
    if (req.url.startsWith('/dist/')) {
      const file = join(distDir, req.url.slice('/dist/'.length).split('?')[0]);
      const data = await readFile(file);
      res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
      return res.end(data);
    }
  } catch (e) { /* 404 below */ }
  res.writeHead(404);
  res.end();
});
await new Promise(r => server.listen(0, r));
const port = server.address().port;

const executablePath = process.env.CHROMIUM_PATH || undefined;
const browser = await chromium.launch({ executablePath });
const results = [];
try {
  for (let run = 0; run < runs; run++) {
    const p = await browser.newPage({ viewport: { width: 1300, height: 900 } });
    await p.goto(`http://localhost:${port}/`);
    await p.waitForFunction(() => window.ready === true);
    await p.evaluate(f => window.measure(f), 30); // warm-up (JIT)
    results.push(await p.evaluate(f => window.measure(f), frames));
    await p.close();
  }
} finally {
  await browser.close();
  server.close();
}
const med = results.map(r => r.median).sort((a, b) => a - b)[Math.floor(runs / 2)];
const p95 = results.map(r => r.p95).sort((a, b) => a - b)[Math.floor(runs / 2)];
console.log(JSON.stringify({ distDir, rows, cols, frames, runs, cellsPerFrame: results[0].cells,
  medianMs: +med.toFixed(3), p95Ms: +p95.toFixed(3) }));
