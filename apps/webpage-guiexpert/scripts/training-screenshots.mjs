// Screenshots of the live demos of the training (posters of <LiveDemo> and <Figure src="demo-…">).
//
//   pnpm dev                                    # website on http://localhost:4321
//   node scripts/training-screenshots.mjs [baseUrl] [demo …]
//
// Needs Playwright with Chromium (e.g. `npm i -g playwright && npx playwright install chromium`).
// Writes src/assets/training/shots/demo-<name>-light.png and -dark.png.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const base = (process.argv[2] ?? "http://localhost:4321").replace(/\/$/, "");
const only = process.argv.slice(3);
// with the dev server running, writing into src/ triggers a reload – SHOTS_OUT=/tmp/x writes elsewhere (copy afterwards)
const out = process.env.SHOTS_OUT ?? "src/assets/training/shots";
mkdirSync(out, { recursive: true });

const cell = (row, col) => `.td-host .ge-table-body-center [data-row-index="${row}"][data-col-index="${col}"]`;

/** demo name → chapter slug + what to do before the screenshot */
const DEMOS = {
  "naive-table": { slug: "why-big-tables-freeze" },
  "virtual-scroll": { slug: "virtual-scrolling" },
  "first-table": { slug: "first-table" },
  "table-model-areas": { slug: "table-model-areas" },
  "array-to-table-model": { slug: "array-to-table-model" },
  "column-definitions": { slug: "column-definitions" },
  "array-of-arrays": { slug: "array-of-arrays", wait: 800 },
  "header-groups": { slug: "header-groups" },
  "footer-totals": { slug: "footer-totals", search: "berlin" },
  "footer-aggregates": { slug: "footer-totals", search: "berlin", drag: [[1, 3], [4, 5]] },
  "custom-area-model": { slug: "custom-area-model", button: "row 1,000,000" },
  "fixed-columns": { slug: "fixed-columns", button: "→ scroll right" },
  "row-numbers": { slug: "fixed-columns", button: "sort by total ↓", numbers: [[2], [6]] },
  "table-options": { slug: "table-options" },
  "sorting": { slug: "sorting", button: "sort by status" },
  "filtering": { slug: "filtering", search: "berlin" },
  "selection-and-copy": { slug: "selection-and-copy", drag: [[2, 2], [7, 5]] },
  "events-and-context-menu": { slug: "events-and-context-menu", contextmenu: [3, 2] },
  "excel-export": { slug: "excel-export", search: "berlin" },
  "cell-renderers": { slug: "cell-renderers" },
  "heatmap": { slug: "heatmap" },
  "theming": { slug: "theming-dark-mode", drag: [[2, 1], [6, 4]] },
  "rowspan-colspan": { slug: "rowspan-colspan" },
  "tree-table": { slug: "tree-table", expand: 3 },
  "inline-editing": { slug: "inline-editing", dblclick: [2, 7] },
  "live-data": { slug: "live-data", wait: 1500 },
  "overlays": { slug: "live-data", wait: 1500, button: "refresh" },
  "persist-state": { slug: "persist-state" },
  "finale": { slug: "checklist", drag: [[3, 2], [6, 4]] },
  "row-grouping": { slug: "row-grouping", search: "laptop" },
  "row-drag": { slug: "events-and-context-menu", button: "move down" },
  "fill-batch": { slug: "inline-editing", fillDown: 4 },
  "pivot-tables": { slug: "pivot-tables", button: "expand all" },
  "master-detail": { slug: "master-detail", wait: 900, toggleDetail: 3 },
  "accessibility": { slug: "accessibility", button: "focus table", keys: ["ArrowDown", "ArrowDown", "ArrowUp", "ArrowUp", "ArrowUp", "ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight", "Enter"] }
};

// CHROMIUM_PATH: a preinstalled Chromium instead of Playwright's own download (e.g. in a container)
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
let failed = 0;
for (const theme of ["light", "dark"]) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.addInitScript(t => {
    localStorage.setItem("theme", t);
    for (const key of Object.keys(localStorage)) if (key.startsWith("ge-training")) localStorage.removeItem(key);
  }, theme);
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  for (const [name, step] of Object.entries(DEMOS)) {
    if (only.length && !only.includes(name)) continue;
    errors.length = 0;
    await page.goto(`${base}/training/${step.slug}/`, { waitUntil: "networkidle" })
      .catch(() => page.goto(`${base}/training/${step.slug}/`, { waitUntil: "networkidle" }));
    await page.addStyleTag({ content: "astro-dev-toolbar { display: none !important }" });
    const demo = page.locator(`.training-demo[data-demo="${name}"]`);
    await demo.scrollIntoViewIfNeeded();
    await demo.locator(".td-run").click();
    await page.waitForSelector(`.training-demo[data-demo="${name}"][data-ready]`, { timeout: 30_000 });
    await page.waitForTimeout(step.wait ?? 500);
    if (step.search) { await demo.locator(".td-toolbar input[type=search]").fill(step.search); await page.waitForTimeout(300); }
    if (step.button) { await demo.getByRole("button", { name: step.button }).click(); await page.waitForTimeout(400); }
    if (step.numbers) {                                   // click the first row number, Shift-click the others
      for (const [i, [row]] of step.numbers.entries()) {
        await demo.locator(`.td-host .ge-table-body-west [data-row-index="${row}"][data-col-index="0"]`).first()
          .click({ modifiers: i ? ["Shift"] : [] });
        await page.waitForTimeout(250);
      }
    }
    if (step.drag) {
      const [[r1, c1], [r2, c2]] = step.drag;
      const a = await demo.locator(cell(r1, c1)).first().boundingBox();
      const b = await demo.locator(cell(r2, c2)).first().boundingBox();
      if (a && b) {
        await page.mouse.move(a.x + 10, a.y + 8);
        await page.mouse.down();
        await page.mouse.move(b.x + 20, b.y + 10, { steps: 8 });
        await page.mouse.up();
        await page.waitForTimeout(200);
      }
    }
    if (step.fillDown) {                                  // drag the fill handle n rows down
      const h = await demo.locator(".ge-table-fill-handle").first().boundingBox();
      if (h) {
        await page.mouse.move(h.x + 3, h.y + 3);
        await page.mouse.down();
        await page.mouse.move(h.x + 3, h.y + 20, { steps: 4 });
        await page.mouse.move(h.x + 3, h.y + 34 * step.fillDown, { steps: 8 });
        await page.mouse.up();
        await page.waitForTimeout(300);
      }
    }
    if (step.toggleDetail !== undefined) {                // open the detail row of a master row (▸)
      await demo.locator(`.td-host .ge-table-detail-toggle[data-row-index="${step.toggleDetail}"]`).first().click();
      await page.waitForTimeout(400);
    }
    if (step.contextmenu) {
      const box = await demo.locator(cell(...step.contextmenu)).first().boundingBox();
      if (box) await page.mouse.click(box.x + 30, box.y + 10, { button: "right" });
      await page.waitForTimeout(200);
    }
    if (step.dblclick) {
      const box = await demo.locator(cell(...step.dblclick)).first().boundingBox();
      if (box) await page.mouse.dblclick(box.x + 20, box.y + 10);
      await page.waitForTimeout(300);
    }
    if (step.expand) {
      for (let i = 0; i < step.expand; i++) {
        await demo.locator(".td-host .ge-table-tree-arrow-div").nth(i * 2).click().catch(() => {});
        await page.waitForTimeout(250);
      }
    }
    if (step.keys) {
      for (const key of step.keys) {
        await page.keyboard.press(key);
        await page.waitForTimeout(40);
      }
      await page.waitForTimeout(300);
    }
    await page.mouse.move(5, 5);                         // no hover effects in the poster
    await demo.locator(".td-stage").screenshot({ path: `${out}/demo-${name}-${theme}.png` });
    await page.keyboard.press("Escape");
    console.log(`${theme.padEnd(5)} ${name}${errors.length ? "  ERRORS: " + errors.join(" | ") : ""}`);
    if (errors.length) failed++;
  }
  await page.close();
}
await browser.close();
process.exit(failed ? 1 : 0);
