// Fixtures and helpers of the E2E smoke tests (prompt 026, decision E8).
//
// `guard` is an auto fixture: every test collects page errors, console errors/warnings, own requests with status
// >= 400, failed requests and requests to foreign hosts (aborted) – and fails at the end if there is any.
import { test as base, expect, type Locator, type Page } from '@playwright/test';
import { ALLOWED_FOREIGN_HOSTS, ALLOWED_WARNINGS, FOREIGN_MOCKS, hasNoInteraction, isSkipped } from './exceptions.ts';

const OWN_HOSTS = new Set(['127.0.0.1', 'localhost', '[::1]']);

export interface GuardIf {
  /** Problems found so far (text per problem). */
  readonly problems: string[];
  /** Ignore problems matching `pattern` in this test (only for cases the test itself provokes). */
  ignore(pattern: RegExp): void;
}

export const test = base.extend<{ guard: GuardIf }>({
  guard: [async ({ page }, use, testInfo) => {
    const problems: string[] = [];
    const ignored: RegExp[] = [];
    const target = testInfo.title;
    testInfo.skip(isSkipped(target), 'exceptions.ts: skip');
    const allowedHosts = new Set(ALLOWED_FOREIGN_HOSTS.filter(h => h.target === target).map(h => h.host));
    const add = (text: string) => { if (!ignored.some(r => r.test(text))) problems.push(text); };
    const isAllowedWarning = (text: string) =>
      ALLOWED_WARNINGS.some(w => (w.target === '*' || w.target === target) && w.message.test(text));

    await page.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.protocol === 'data:' || url.protocol === 'blob:' || OWN_HOSTS.has(url.hostname)) return route.fallback();
      if (allowedHosts.has(url.hostname)) return route.abort('blockedbyclient');   // allowed, but never fetched in a test
      const mock = FOREIGN_MOCKS.find(m => m.host === url.hostname);
      if (mock) {
        return route.fulfill({ json: mock.respond(url, route.request().method()), headers: { 'access-control-allow-origin': '*' } });
      }
      add(`request to a foreign host: ${url.href}`);
      return route.abort('blockedbyclient');
    });
    page.on('pageerror', e => add(`pageerror: ${e.message}`));
    page.on('console', msg => {
      const where = msg.location()?.url ? ` (${msg.location().url}:${msg.location().lineNumber})` : '';
      // the browser reports our own abort of a foreign request as a console error
      if (msg.text().includes('ERR_BLOCKED_BY_CLIENT')) return;
      if (msg.type() === 'error') add(`console.error: ${msg.text()}${where}`);
      else if (msg.type() === 'warning' && !isAllowedWarning(msg.text())) add(`console.warn: ${msg.text()}${where}`);
    });
    page.on('response', r => {
      if (r.status() >= 400 && OWN_HOSTS.has(new URL(r.url()).hostname)) add(`HTTP ${r.status()}: ${r.url()}`);
    });
    page.on('requestfailed', r => {
      const failure = r.failure()?.errorText ?? '';
      // our own abort of a foreign host is already reported above
      if (failure.includes('BLOCKED_BY_CLIENT') || failure.includes('blockedbyclient')) return;
      if (!OWN_HOSTS.has(new URL(r.url()).hostname)) return;
      add(`request failed (${failure}): ${r.url()}`);
    });

    await use({ problems, ignore: p => { ignored.push(p); } });

    if (problems.length) await testInfo.attach('problems', { body: problems.join('\n'), contentType: 'text/plain' });
    expect(problems, `console / network problems on ${page.url()}`).toEqual([]);
  }, { auto: true }],
});

export { expect };

/** E10: exactly one Angular app root with the expected major – two versions in one bundle show up here or as an error. */
export async function expectOneAngular(page: Page, major: number): Promise<void> {
  const versions = page.locator('[ng-version]');
  await expect(versions, 'exactly one Angular root ([ng-version])').toHaveCount(1);
  expect(Number((await versions.getAttribute('ng-version'))?.split('.')[0]), 'Angular major').toBe(major);
}

/** Body cells of a table (all three sides, also cover grid tiles). */
export const bodyCells = (table: Locator) => table.locator('.ge-table-col-div[data-area="body"][data-row-index]');

/**
 * E8 (2): a visible `.ge-table` with a height > 0 that shows at least one body row – or a visible overlay
 * ("Loading", "No rows to show") for pages that start empty. Returns the first table of the scope.
 */
export async function expectTable(page: Page, scope: Locator = page.locator('body')): Promise<Locator> {
  const table = scope.locator('.ge-table').first();
  await expectTableShowsSomething(table);
  return table;
}

export async function expectTableShowsSomething(table: Locator): Promise<void> {
  await expect(table, 'a GuiExpert table (.ge-table) is visible').toBeVisible();
  await expect.poll(async () => (await table.boundingBox())?.height ?? 0, { message: 'table host has a height' }).toBeGreaterThan(0);
  await expect.poll(async () => {
    if (await bodyCells(table).count()) return 'rows';
    if (await table.locator('.ge-table-overlay').isVisible()) return 'overlay';
    return 'empty';
  }, { message: 'the table shows body rows or an overlay' }).not.toBe('empty');
}

/** Every visible table of the scope shows rows or an overlay (master/detail, multi demos). Returns the count. */
export async function expectTables(page: Page, scope: Locator = page.locator('body')): Promise<number> {
  await expectTable(page, scope);
  const tables = scope.locator('.ge-table');
  const n = await tables.count();
  for (let i = 0; i < n; i++) {
    const t = tables.nth(i);
    if (await t.isVisible()) await expectTableShowsSomething(t);   // a hidden one: e.g. another tab
  }
  return n;
}

/** The rendered body rows as a key, e.g. "0,1,2,…" – changes when the table re-renders after a scroll. */
const renderedRows = (table: Locator) => bodyCells(table).evaluateAll(cells =>
  [...new Set(cells.map(c => Number(c.getAttribute('data-row-index'))))].sort((a, b) => a - b).join(','));

/**
 * Center of a body cell that is really on top at that point (not under the header, a footer or a detail). Prefers the
 * middle columns and plain cells (no checkbox, button, link, input) – the wheel over fixed columns has its own Vitest
 * spec (fixed-columns-wheel.realmouse.browser.spec.ts), and a click on a control may move the focus into the control.
 */
async function visibleBodyCellPoint(table: Locator): Promise<{ x: number; y: number } | undefined> {
  return table.evaluate(t => {
    const all = Array.from(t.querySelectorAll<HTMLElement>('.ge-table-col-div[data-area="body"][data-row-index]'));
    const plain = (c: HTMLElement) => !c.querySelector('input, button, a, select, textarea, [contenteditable="true"]');
    const center = (c: HTMLElement) => !!c.closest('.ge-table-scroll-viewport');
    const ordered = [
      ...all.filter(c => center(c) && plain(c)), ...all.filter(c => !center(c) && plain(c)), ...all.filter(c => !plain(c)),
    ];
    for (const c of ordered) {
      const r = c.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;   // the "ultra" demo draws 5 px cells
      const x = r.left + Math.min(r.width / 2, 40), y = r.top + r.height / 2;
      const hit = document.elementFromPoint(x, y);
      // the cell itself – or, with tiny cells, a border/hover line of the same table's body on top of it
      const ownBody = hit && hit.closest('.ge-table') === t && !!hit.closest('.ge-table-scroll-viewport, .ge-table-body');
      if (hit && (hit === c || c.contains(hit) || ownBody)) return { x, y };
    }
    return undefined;
  });
}

/**
 * E8 (3), generic and cheap: wheel over a body cell → other rows rendered (only if the viewport can scroll), click on a
 * body cell → the focus is in the table. Targets where this does not fit: exception `noInteraction`.
 */
export async function tryInteraction(page: Page, table: Locator, target: string): Promise<void> {
  if (hasNoInteraction(target)) return;
  if (!(await bodyCells(table).count())) return;            // starts with an overlay – nothing to scroll or click
  const viewport = table.locator('.ge-table-scroll-viewport').first();
  const scrollable = await viewport.evaluate(v => v.scrollHeight - v.clientHeight > 40).catch(() => false);
  if (scrollable) {
    const before = await renderedRows(table);
    const point = await visibleBodyCellPoint(table);
    expect(point, 'a body cell is visible').toBeDefined();
    await page.mouse.move(point!.x, point!.y);
    await page.mouse.wheel(0, 400);
    await expect.poll(() => renderedRows(table), { message: 'wheel → other rows rendered' }).not.toBe(before);
  }
  // click a cell that is really visible – the first cell in DOM order may sit half under the header
  const point = await visibleBodyCellPoint(table);
  expect(point, 'a body cell is visible').toBeDefined();
  await page.mouse.click(point!.x, point!.y);
  await expect.poll(() => table.evaluate(t => t.contains(document.activeElement)), { message: 'click → focus in the table' }).toBe(true);
}
