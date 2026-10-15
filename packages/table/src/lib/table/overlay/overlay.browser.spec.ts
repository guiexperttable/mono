// Overlays "Loading…" / "No rows to show" / "No matching rows" in a real browser – the reference cases O1–O12 of
// prompts/002-overlays-laden-keine-daten.md (design: prompts/002-overlays-laden-keine-daten.design.md).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConvenienceDomService, EventAdapter, FocusModel, LiveAnnouncer, SimpleDomService, TableFactory, TableOptions, TableOverlay, TableScope } from '@guiexpert/table';
import type { GeMouseEvent, GeOverlayKind, OverlayOptionsIf, TableOptionsIf } from '@guiexpert/table';
import {
  areaRows, createRows, destroyAllTables, getCellDiv, mountTable, nextFrame, renderedRows,
} from '../../../../test-utils/mount-table';
import { axeViolations } from '../../../../test-utils/axe';

beforeEach(() => {
  LiveAnnouncer.defaultDelayInMs = 0;
  vi.spyOn(console, 'debug').mockImplementation(() => undefined); // ShortcutService on localhost
});

afterEach(() => {
  destroyAllTables();
  vi.restoreAllMocks();
  LiveAnnouncer.defaultDelayInMs = 150;
  document.documentElement.removeAttribute('data-theme');
  delete (window as unknown as { geXss?: number }).geXss;
});

type Row = { id: number; name: string; value: number };

async function mount(rowCount: number, overlayOptions?: Partial<OverlayOptionsIf>, tableOptions: Partial<TableOptionsIf> = {}) {
  const clicked: GeMouseEvent[] = [];
  const listener = new EventAdapter();
  listener.onMouseClicked = e => clicked.push(e);
  const tableModel = TableFactory.createTableModel({ rows: createRows(rowCount), properties: ['id', 'name', 'value'] });
  const table = mountTable(tableModel, { eventListener: listener, tableOptions: { ...tableOptions, overlayOptions } });
  table.scope.mouseHandler.doubleClickDelay = 0;
  await nextFrame();
  return { ...table, clicked };
}

const overlayOf = (host: HTMLElement) => host.querySelector<HTMLElement>(':scope > .ge-table-overlay')!;
const isShown = (host: HTMLElement) => getComputedStyle(overlayOf(host)).display !== 'none';
const overlayText = (host: HTMLElement) => overlayOf(host).querySelector('.ge-table-overlay-text')?.textContent;
const liveText = () => document.querySelector('[role="status"][aria-live="polite"]')?.textContent ?? '';
const rect = (el: Element) => el.getBoundingClientRect();

/** A real click at the middle of a cell: hits whatever element is on top there (the overlay or the cell). */
function clickAtCell(host: HTMLElement, row: number, col: number) {
  const r = rect(getCellDiv(host, 'body', 'center', row, col));
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  const target = document.elementFromPoint(x, y)!;
  for (const type of ['mousedown', 'mouseup', 'click']) {
    target.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, detail: 1 }));
  }
  return target;
}

describe('overlay element', () => {

  it('exists once, as a direct child of the host, hidden from screen readers and invisible without content', async () => {
    const { host } = await mount(10);
    const overlays = host.querySelectorAll('.ge-table-overlay');
    expect(overlays).toHaveLength(1);
    expect(overlays[0].parentElement).toBe(host); // stacking: z-index (see O7), not the DOM order
    expect(overlays[0].getAttribute('aria-hidden')).toBe('true');
    expect(isShown(host)).toBe(false);
  });
});

describe('O1/O2 – loading overlay', () => {

  it('O1: showLoadingOverlay → spinner + "Loading…" over the body, header readable, aria-busy', async () => {
    const { host, api } = await mount(10);
    api.showLoadingOverlay();
    const overlay = overlayOf(host);

    expect(isShown(host)).toBe(true);
    expect(api.getOverlayState()).toBe('loading');
    expect(overlay.classList).toContain('ge-table-overlay-loading');
    expect(overlay.querySelector('.ge-table-spinner')).not.toBeNull();
    expect(overlayText(host)).toBe('Loading…');
    expect(host.getAttribute('aria-busy')).toBe('true');

    // body only: starts below the header, the header row is not covered
    const headerRow = areaRows(host, 'header')[0];
    expect(rect(overlay).top).toBeGreaterThanOrEqual(rect(headerRow).bottom - 1);
    expect(rect(overlay).height).toBeGreaterThan(100);
  });

  it('a text for this call only: showLoadingOverlay("Saving…")', async () => {
    const { host, api } = await mount(10);
    api.showLoadingOverlay('Saving…');
    expect(overlayText(host)).toBe('Saving…');
    api.hideOverlay();
    api.showLoadingOverlay();
    expect(overlayText(host)).toBe('Loading…');
  });

  it('O2: hideOverlay → gone, aria-busy removed, rows usable again', async () => {
    const { host, api, clicked } = await mount(10);
    api.showLoadingOverlay();
    api.hideOverlay();

    expect(isShown(host)).toBe(false);
    expect(api.getOverlayState()).toBe('none');
    expect(host.hasAttribute('aria-busy')).toBe(false);
    clickAtCell(host, 2, 1);
    expect(clicked).toHaveLength(1);
    expect(clicked[0].rowIndex).toBe(2);
  });

  it('an aria-busy the app set on the host comes back after loading', async () => {
    const host = document.createElement('div');
    host.style.cssText = 'position:relative; width:800px; height:500px;';
    host.setAttribute('aria-busy', 'false');
    document.body.appendChild(host);
    const tableModel = TableFactory.createTableModel({ rows: createRows(5), properties: ['id', 'name'] });
    const scope = new TableScope(host, tableModel, new SimpleDomService(), new TableOptions(), new EventAdapter());
    scope.firstInit();
    const api = scope.getApi();
    api.showLoadingOverlay();
    expect(host.getAttribute('aria-busy')).toBe('true');
    api.hideOverlay();
    expect(host.getAttribute('aria-busy')).toBe('false');
    api.destroy();
    host.remove();
  });

  it('hideOverlay without an overlay changes nothing', async () => {
    const { host, api } = await mount(10);
    api.hideOverlay();
    expect(host.hasAttribute('aria-busy')).toBe(false);
    expect(isShown(host)).toBe(false);
  });

  it('loading wins over "no rows" (0 rows)', async () => {
    const { host, api } = await mount(0);
    expect(api.getOverlayState()).toBe('noRows');
    api.showLoadingOverlay();
    expect(api.getOverlayState()).toBe('loading');
    expect(overlayText(host)).toBe('Loading…');
    api.hideOverlay();
    expect(api.getOverlayState()).toBe('noRows'); // derived state comes back by itself
  });

  it('loadingDelayInMs: nothing is shown before the delay, a quick hideOverlay shows nothing at all', async () => {
    const { host, api } = await mount(10, { loadingDelayInMs: 80 });
    api.showLoadingOverlay();
    expect(isShown(host)).toBe(false);
    expect(api.getOverlayState()).toBe('none');
    await vi.waitFor(() => expect(api.getOverlayState()).toBe('loading'), { timeout: 2000 });
    expect(isShown(host)).toBe(true);

    api.hideOverlay();
    api.showLoadingOverlay();
    api.hideOverlay(); // faster than the delay
    await new Promise(r => setTimeout(r, 150));
    expect(api.getOverlayState()).toBe('none');
    expect(isShown(host)).toBe(false);
  });

  it('loadingDelayInMs with an empty body: "no rows" stays during the delay, a fast answer changes nothing', async () => {
    const { host, api } = await mount(0, { loadingDelayInMs: 80 });
    await nextFrame();
    expect(api.getOverlayState()).toBe('noRows');
    const mutations: MutationRecord[] = [];
    const observer = new MutationObserver(m => mutations.push(...m));
    observer.observe(overlayOf(host), { attributes: true, childList: true, subtree: true });
    const announce = vi.spyOn(api.getTableScope(), 'announce');

    api.showLoadingOverlay();
    expect(api.getOverlayState()).toBe('noRows'); // no flicker: the shown overlay stays until the spinner is due
    api.hideOverlay();                             // fast answer (still empty)
    await new Promise(r => setTimeout(r, 120));
    observer.disconnect();
    expect(api.getOverlayState()).toBe('noRows');
    expect(mutations).toEqual([]);
    expect(announce).not.toHaveBeenCalled();       // no second "No rows to show"

    api.showLoadingOverlay();
    await vi.waitFor(() => expect(api.getOverlayState()).toBe('loading'), { timeout: 2000 });
  });
});

describe('O3–O5 – automatic "no rows" / "no matching rows"', () => {

  it('O3: a model with 0 rows shows "No rows to show" without an API call, without blocking', async () => {
    const { host, api } = await mount(0);
    expect(isShown(host)).toBe(true);
    expect(api.getOverlayState()).toBe('noRows');
    expect(overlayOf(host).classList).toContain('ge-table-overlay-no-rows');
    expect(overlayOf(host).classList).not.toContain('ge-table-overlay-blocking');
    expect(overlayOf(host).querySelector('.ge-table-spinner')).toBeNull();
    expect(overlayText(host)).toBe('No rows to show');
    expect(host.hasAttribute('aria-busy')).toBe(false);
  });

  it('O4: the filter hides all rows → "No matching rows", filter reset → gone', async () => {
    let filter = (_: Row) => false;
    const { host, api } = await mount(100, undefined, { externalFilterFunction: (r: Row) => filter(r) });
    expect(api.getOverlayState()).toBe('noMatches');
    expect(overlayText(host)).toBe('No matching rows');

    filter = () => true;
    api.externalFilterChanged();
    expect(api.getOverlayState()).toBe('none');
    expect(isShown(host)).toBe(false);
    expect(renderedRows(host).length).toBeGreaterThan(5);

    filter = r => r.id > 1000;
    api.externalFilterChanged();
    expect(api.getOverlayState()).toBe('noMatches');
  });

  it('O5: rows arrive with setRows / addRows → the overlay disappears with the next repaint', async () => {
    const { host, api } = await mount(0);
    api.addRows(createRows(3));
    api.repaintHard();
    expect(api.getOverlayState()).toBe('none');
    expect(isShown(host)).toBe(false);
    expect(renderedRows(host)).toHaveLength(3);

    api.setRows([]);
    api.repaintHard();
    expect(api.getOverlayState()).toBe('noRows');
  });

  it('autoNoRows: false → an empty table stays empty', async () => {
    const { host, api } = await mount(0, { autoNoRows: false });
    expect(api.getOverlayState()).toBe('none');
    expect(isShown(host)).toBe(false);
  });

  it('showNoRowsOverlay(text) shows a manual message even over rows; hideOverlay ends it', async () => {
    const { host, api } = await mount(5, { autoNoRows: false });
    api.showNoRowsOverlay('No permission');
    expect(api.getOverlayState()).toBe('noRows');
    expect(overlayText(host)).toBe('No permission');
    api.hideOverlay();
    expect(api.getOverlayState()).toBe('none');
  });

  it('the overlay element is updated only on a change (no DOM writes while scrolling)', async () => {
    const { host, api } = await mount(0);
    const overlay = overlayOf(host);
    const mutations: MutationRecord[] = [];
    const observer = new MutationObserver(m => mutations.push(...m));
    observer.observe(overlay, { attributes: true, childList: true, subtree: true });
    api.repaint();
    api.repaint();
    await nextFrame();
    observer.disconnect();
    expect(mutations).toEqual([]);
  });
});

describe('O6 – loading over existing rows (refresh)', () => {

  it('rows stay visible under a semi-transparent layer, clicks are blocked by default', async () => {
    const { host, api, clicked } = await mount(20);
    api.showLoadingOverlay();
    const overlay = overlayOf(host);

    expect(renderedRows(host).length).toBeGreaterThan(5);
    expect(overlay.classList).toContain('ge-table-overlay-blocking');
    const bg = getComputedStyle(overlay).backgroundColor;
    expect(bg).toMatch(/rgba\(.*, 0\.\d+\)/); // semi-transparent

    const pageClicks = vi.fn();
    document.addEventListener('click', pageClicks);
    const target = clickAtCell(host, 2, 1);
    document.removeEventListener('click', pageClicks);
    expect(overlay.contains(target)).toBe(true);
    expect(clicked).toHaveLength(0);
    expect(pageClicks).toHaveBeenCalledTimes(1); // page handlers ("click outside closes the menu") still see it
  });

  it('the hover row disappears when the blocking overlay appears', async () => {
    const { host, api } = await mount(20);
    const cell = getCellDiv(host, 'body', 'center', 3, 1);
    const r = rect(cell);
    cell.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: r.left + 5, clientY: r.top + 5 }));
    const hoverRow = host.querySelector<HTMLElement>('.ge-table-hover-row')!;
    await vi.waitFor(() => expect(hoverRow.style.display).not.toBe('none'));
    api.showLoadingOverlay();
    expect(hoverRow.style.display).toBe('none');
  });

  it('a header column drag over the loading overlay keeps following the mouse (mousemove not blocked while pressed)', async () => {
    const { host, api, scope } = await mount(20);
    api.showLoadingOverlay();
    const moved = vi.spyOn(scope, 'setDragging');
    const header = areaRows(host, 'header')[0].querySelector<HTMLElement>('[data-col-index="1"]')!;
    const h = rect(header);
    header.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: h.left + 20, clientY: h.top + 5 }));
    overlayOf(host).dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: h.left + 60, clientY: h.top + 80 }));
    host.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: h.left + 60, clientY: h.top + 80 }));
    expect(moved).toHaveBeenCalledWith(true);
  });

  async function mountEditable(overlayOptions?: Partial<OverlayOptionsIf>) {
    const focusModel = new FocusModel();
    const table = await mount(20, overlayOptions, { getFocusModel: () => focusModel });
    focusModel.setFocus(2, 1);
    vi.spyOn(table.api.getBodyModel(), 'isEditable').mockReturnValue(true);
    const edit = vi.spyOn(table.scope, 'initRenderEditor').mockImplementation(() => undefined);
    return { ...table, focusModel, edit };
  }

  it('blocking: keyboard editing is ignored while loading, navigation works', async () => {
    const { api, scope, focusModel, edit } = await mountEditable();
    api.showLoadingOverlay();
    expect(scope.onActionTriggered('START_EDITING')).toBe(true);
    expect(scope.onActionTriggered('TOGGLE_SELECTION')).toBe(true);
    expect(scope.onActionTriggered('ACTIVATE_CELL')).toBe(true);
    expect(edit).not.toHaveBeenCalled();

    scope.onActionTriggered('NAVIGATE_DOWN');
    expect(focusModel.getFocus()).toEqual([3, 1]);
  });

  it('blocking does not stop Enter on a header cell (the header is not covered)', async () => {
    const { api, scope, focusModel } = await mountEditable();
    focusModel.setFocus(0, 1);
    scope.onActionTriggered('NAVIGATE_UP'); // into the header
    expect(scope.getHeaderFocus()).toBeDefined();
    // private method: spied through an index type
    const activate = vi.spyOn(scope as unknown as { activateHeaderCell(): boolean }, 'activateHeaderCell').mockReturnValue(true);
    api.showLoadingOverlay();
    scope.onActionTriggered('ACTIVATE_CELL');
    expect(activate).toHaveBeenCalledTimes(1);
  });

  it('without blocking (or after hideOverlay) F2 starts editing as usual', async () => {
    const { api, scope, edit } = await mountEditable({ blockInteractionWhileLoading: false });
    api.showLoadingOverlay();
    scope.onActionTriggered('START_EDITING');
    expect(edit).toHaveBeenCalledTimes(1);
  });

  it('blockInteractionWhileLoading: false → clicks reach the cells', async () => {
    const { host, api, clicked } = await mount(20, { blockInteractionWhileLoading: false });
    api.showLoadingOverlay();
    expect(overlayOf(host).classList).not.toContain('ge-table-overlay-blocking');
    clickAtCell(host, 2, 1);
    expect(clicked).toHaveLength(1);
  });

  it('"no rows" never blocks: the header stays clickable, the overlay lets pointer events through', async () => {
    const { host } = await mount(0);
    expect(getComputedStyle(overlayOf(host)).pointerEvents).toBe('none');
  });
});

describe('O7 – position', () => {

  it('stays over the visible body when scrolled horizontally', async () => {
    const tableModel = TableFactory.createTableModel({
      rows: createRows(30).map(r => ({ ...r, a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8 })),
      properties: ['id', 'name', 'value', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
    });
    const { host, api, scope } = mountTable(tableModel, { width: 400, height: 300 });
    await nextFrame();
    api.showLoadingOverlay();
    const before = rect(overlayOf(host));
    scope.scrollViewport.scrollLeft = 300;
    scope.adjustAfterScrolling();
    await nextFrame();
    const after = rect(overlayOf(host));
    expect(after.left).toBe(before.left);
    expect(after.width).toBe(before.width);
    expect(rect(overlayOf(host)).right).toBeLessThanOrEqual(rect(host).right);
  });

  it('the content is centered in the body; a very low table clips instead of overflowing', async () => {
    const { host, api } = await mount(10);
    api.showLoadingOverlay();
    const o = rect(overlayOf(host));
    const c = rect(overlayOf(host).querySelector('.ge-table-overlay-content')!);
    expect(Math.abs((c.left + c.width / 2) - (o.left + o.width / 2))).toBeLessThan(2);
    expect(Math.abs((c.top + c.height / 2) - (o.top + o.height / 2))).toBeLessThan(2);
    expect(getComputedStyle(overlayOf(host)).overflow).toBe('hidden');
  });

  it('follows a resize of the host', async () => {
    const { host, api } = await mount(10);
    api.showLoadingOverlay();
    host.style.height = '300px';
    api.repaintHard();
    expect(rect(overlayOf(host)).bottom).toBeLessThanOrEqual(rect(host).bottom + 0.5);
  });

  it('a hidden header: the overlay starts at the top', async () => {
    const { host, api } = await mount(0);
    api.setHeaderVisible(false);
    expect(Math.round(rect(overlayOf(host)).top)).toBe(Math.round(rect(host).top));
  });

  it('is above the fixed east columns and the focus frame (z-index)', async () => {
    const focusModel = new FocusModel();
    const { host, api } = await mount(10, undefined, { getFocusModel: () => focusModel });
    focusModel.setFocus(2, 1);
    api.repaint();
    api.showLoadingOverlay();
    const focusFrame = host.querySelector<HTMLElement>('.ge-table-focus-border');
    expect(focusFrame).not.toBeNull();
    const overlayZ = Number(getComputedStyle(overlayOf(host)).zIndex);
    expect(overlayZ).toBeGreaterThan(999);
    expect(overlayZ).toBeGreaterThan(Number(getComputedStyle(focusFrame!).zIndex) || 0);
  });
});

describe('O8/O9 – CSS', () => {

  it('O8: the spinner is pure CSS and stops with prefers-reduced-motion', async () => {
    const { host, api } = await mount(10);
    api.showLoadingOverlay();
    expect(getComputedStyle(host.querySelector('.ge-table-spinner')!).animationName).toBe('ge-table-spin');

    const reducedRules = Array.from(document.styleSheets)
      .flatMap(s => { try { return Array.from(s.cssRules); } catch { return []; } })
      .filter((r): r is CSSMediaRule => r instanceof CSSMediaRule && r.conditionText.includes('prefers-reduced-motion'))
      .flatMap(r => Array.from(r.cssRules) as CSSStyleRule[])
      .filter(r => r.selectorText?.includes('.ge-table-spinner'));
    expect(reducedRules.length).toBeGreaterThan(0);
    expect(reducedRules.some(r => r.style.animationName === 'none' || r.style.animation.startsWith('none'))).toBe(true);
  });

  it('O9: colors come from CSS variables, light and dark differ', async () => {
    const { host, api } = await mount(10);
    api.showLoadingOverlay();
    const overlay = overlayOf(host);
    const light = getComputedStyle(overlay).backgroundColor;
    const lightText = getComputedStyle(overlay.querySelector('.ge-table-overlay-text')!).color;
    document.documentElement.setAttribute('data-theme', 'dark');
    const dark = getComputedStyle(overlay).backgroundColor;
    const darkText = getComputedStyle(overlay.querySelector('.ge-table-overlay-text')!).color;
    expect(dark).not.toBe(light);
    expect(darkText).not.toBe(lightText);
    expect(getComputedStyle(document.documentElement).getPropertyValue('--ge-table-spinner-color').trim()).not.toBe('');
  });
});

describe('O10/O11 – content', () => {

  const XSS = '<img src="x" onerror="geXss = 1">';

  it('O10: texts from the options and from the API are shown as text (HTML injection)', async () => {
    const { host, api } = await mount(0, { noRowsText: XSS });
    expect(overlayOf(host).querySelector('img')).toBeNull();
    expect(overlayText(host)).toBe(XSS);
    api.showLoadingOverlay(XSS);
    expect(overlayOf(host).querySelector('img')).toBeNull();
    expect(overlayText(host)).toBe(XSS);
  });

  it('O11: getOverlayElement → own element; undefined keeps the default; removed on hide, change and destroy', async () => {
    const calls: [GeOverlayKind, string][] = [];
    const getOverlayElement = (kind: GeOverlayKind, text: string) => {
      calls.push([kind, text]);
      if (kind !== 'noRows') return undefined;
      const div = document.createElement('div');
      div.className = 'my-empty-state';
      div.textContent = `📭 ${text}`;
      return div;
    };
    const table = await mount(0, { getOverlayElement });
    const { host, api } = table;
    const own = host.querySelector('.my-empty-state')!;
    expect(own.textContent).toBe('📭 No rows to show');
    expect(calls).toEqual([['noRows', 'No rows to show']]);

    api.showLoadingOverlay(); // default content for "loading"
    expect(own.isConnected).toBe(false);
    expect(host.querySelector('.ge-table-spinner')).not.toBeNull();

    api.hideOverlay(); // back to noRows: a new element
    const own2 = host.querySelector('.my-empty-state')!;
    expect(own2).not.toBe(own);

    table.destroy();
    expect(own2.isConnected).toBe(false);
    expect(host.querySelector('.ge-table-overlay')).toBeNull();
  });
});

describe('robustness', () => {

  it('a throwing getOverlayElement falls back to the built-in content and is not called every frame', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const getOverlayElement = vi.fn((): HTMLElement => { throw new Error('boom'); });
    const { host, api } = await mount(0, { getOverlayElement });
    expect(overlayText(host)).toBe('No rows to show');
    api.repaint();
    api.repaint();
    await nextFrame();
    expect(getOverlayElement).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(1);
  });

  it('a body of arrays (bodyData) with a filter that hides everything → "No matching rows"', async () => {
    const tableModel = TableFactory.createTableModel({ bodyData: [[1, 'a'], [2, 'b']] });
    const table = mountTable(tableModel, { tableOptions: { externalFilterFunction: () => false } });
    await nextFrame();
    expect(table.api.getOverlayState()).toBe('noMatches');
  });
});

describe('O12 – accessibility', () => {

  it('loading: aria-busy + the live region speaks the loading text', async () => {
    const { host, api } = await mount(10);
    api.showLoadingOverlay('Loading orders…');
    expect(host.getAttribute('aria-busy')).toBe('true');
    await vi.waitFor(() => expect(liveText()).toBe('Loading orders…'));
  });

  it('a loading announcement still waiting is dropped when loading ends at once', async () => {
    LiveAnnouncer.defaultDelayInMs = 60;
    const { api } = await mount(10);
    api.showLoadingOverlay('Loading orders…');
    api.hideOverlay();
    await new Promise(r => setTimeout(r, 120));
    expect(liveText()).not.toBe('Loading orders…');
  });

  it('"no rows" is announced when it appears after the start, not for the initial empty table', async () => {
    const { api } = await mount(0);
    await nextFrame();
    expect(liveText()).toBe('');

    api.addRows(createRows(2));
    api.repaintHard();
    api.setRows([]);
    api.repaintHard();
    await vi.waitFor(() => expect(liveText()).toBe('No rows to show'));
  });

  it('"no matching rows" is not announced twice (the filter announcement says "No rows")', async () => {
    let filter = (_: Row) => true;
    const { api } = await mount(20, undefined, { externalFilterFunction: (r: Row) => filter(r) });
    const announce = vi.spyOn(api.getTableScope() as unknown as { announce(t: string, d?: number): void }, 'announce');
    filter = () => false;
    api.externalFilterChanged();
    const texts = announce.mock.calls.map(c => c[0]);
    expect(texts).not.toContain('No matching rows');
  });

  it('axe: no violations with each overlay', async () => {
    const { host, api } = await mount(10);
    api.showLoadingOverlay();
    expect(await axeViolations(host)).toEqual([]);
    api.hideOverlay();
    api.setRows([]);
    api.repaintHard();
    expect(api.getOverlayState()).toBe('noRows');
    expect(await axeViolations(host)).toEqual([]);
  });
});

describe('lifecycle', () => {

  it('destroy() removes the overlay, aria-busy and a pending delayed overlay', async () => {
    const table = await mount(10, { loadingDelayInMs: 30 });
    table.api.showLoadingOverlay();
    const host = table.host;
    table.api.destroy();
    expect(host.hasAttribute('aria-busy')).toBe(false);
    expect(host.querySelector('.ge-table-overlay')).toBeNull();
    await new Promise(r => setTimeout(r, 80));
    expect(host.querySelector('.ge-table-overlay')).toBeNull();
  });

  it('API calls after destroy() are harmless', async () => {
    const table = await mount(10);
    table.api.destroy();
    expect(() => {
      table.api.showLoadingOverlay();
      table.api.showNoRowsOverlay();
      table.api.hideOverlay();
    }).not.toThrow();
    expect(table.api.getOverlayState()).toBe('none');
  });

  it('TableOverlay is exported for own tests and subclasses (Internals)', () => {
    expect(typeof TableOverlay).toBe('function');
  });
});

describe('TableOverlay (standalone)', () => {

  function create(options?: Partial<OverlayOptionsIf>) {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const overlay = new TableOverlay(host as HTMLDivElement, new ConvenienceDomService(new SimpleDomService()), options);
    return { host, overlay };
  }

  it('works without an update callback; update() decides and reports changes only', () => {
    const { host, overlay } = create();
    overlay.showLoading(); // default callback: nothing happens until update()
    expect(overlay.getState()).toBe('none');
    expect(overlay.update(0, 0)).toEqual({ previous: 'none', kind: 'loading', text: 'Loading…' });
    expect(overlay.update(0, 0)).toBeUndefined();
    overlay.hide();
    expect(overlay.update(0, 0)).toEqual({ previous: 'loading', kind: 'noRows', text: 'No rows to show' });
    overlay.destroy();
    host.remove();
  });

  it('isEventBlocked: only events on a blocking overlay', () => {
    const { host, overlay } = create();
    const onOverlay = new MouseEvent('click', { bubbles: true });
    overlay.update(0, 0); // noRows, never blocking
    overlay.element.dispatchEvent(onOverlay);
    expect(overlay.isEventBlocked(onOverlay)).toBe(false);

    overlay.showLoading();
    overlay.update(0, 0); // loading, blocking
    const blocked = new MouseEvent('click', { bubbles: true });
    overlay.element.dispatchEvent(blocked);
    expect(overlay.isEventBlocked(blocked)).toBe(true);
    const elsewhere = new MouseEvent('click', { bubbles: true });
    host.dispatchEvent(elsewhere);
    expect(overlay.isEventBlocked(elsewhere)).toBe(false);
    overlay.destroy();
    host.remove();
  });

  it('after destroy(): update and setBounds do nothing, destroy twice is harmless', () => {
    const { host, overlay } = create();
    overlay.destroy();
    expect(overlay.update(0, 0)).toBeUndefined();
    overlay.setBounds(1, 2, 3, 4);
    expect(overlay.element.style.left).toBe('');
    expect(() => overlay.destroy()).not.toThrow();
    host.remove();
  });

  it('a second showLoading while loading keeps the overlay and changes only the text', () => {
    const { host, overlay } = create({ loadingDelayInMs: 1000 });
    overlay.showLoading();
    expect(overlay.update(5)).toBeUndefined(); // waiting for the delay
    overlay.showLoading('Still loading…'); // no second timer
    overlay.showNoRows('x'); // ends the delay
    expect(overlay.update(5)?.kind).toBe('noRows');
    overlay.destroy();
    host.remove();
  });
});
