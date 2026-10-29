// The scroll bars of the scroll viewport must never cover table content:
// - the horizontal one not the last body row or the footer,
// - the vertical one not the last center column or the fixed east columns (right-to-left: it is on the left),
// - % and weight columns share the width next to the vertical scroll bar (no needless horizontal scroll bar).
// The viewport reaches down to the bottom of the host (its scroll bar stays usable below the footer); with classic
// (non-overlay) scroll bars – Windows, Linux, macOS with a mouse attached – the bar takes space at its bottom.
// Before the fix the body and the footer were laid out for the full host height: when scrolled to the end, the
// last row lay half behind the scroll bar (without footer), with a footer the bar covered the footer.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ColumnDef, Size, TableFactory, px100 } from '@guiexpert/table';
import type { TableModelIf } from '@guiexpert/table';
import {
  areaRows,
  destroyAllTables,
  DIRECTIONS,
  mountTable as mountTableBase,
  nextFrame,
  renderedRows,
} from '../../../test-utils/mount-table';
import type { MountOptions } from '../../../test-utils/mount-table';

afterEach(destroyAllTables);

// Runs in the project "browser-scrollbars" (vitest.config.ts): Chromium with classic scroll bars that take space.

let direction: 'ltr' | 'rtl' = 'ltr';
const mountTable = (model: TableModelIf, opts: MountOptions = {}) =>
  mountTableBase(model, { ...opts, tableOptions: { direction, ...opts.tableOptions } });

function model(opts: { columns: number; rows?: number; footer?: boolean; fixedRight?: number; width?: Size }): TableModelIf {
  const columnDefs = Array.from({ length: opts.columns },
    (_, c) => ColumnDef.create({ property: 'c' + c, headerLabel: 'H' + c, width: opts.width ?? px100 }));
  const rows = Array.from({ length: opts.rows ?? 200 },
    (_, r) => Object.fromEntries(columnDefs.map((cd, c) => [cd.property, `${r}/${c}`])));
  return TableFactory.createTableModel({
    rows,
    columnDefs,
    fixedRightColumnCount: opts.fixedRight ?? 0,
    footerData: opts.footer ? [columnDefs.map((_, c) => 'F' + c)] : undefined,
  });
}

const viewportOf = (host: HTMLElement) => host.querySelector<HTMLElement>('.ge-table-scroll-viewport')!;

/** Height of the horizontal scroll bar of the viewport (0 = none or overlay scroll bars). */
const scrollBarHeight = (host: HTMLElement) => {
  const viewport = viewportOf(host);
  return viewport.offsetHeight - viewport.clientHeight;
};

/** Width of the vertical scroll bar of the viewport. */
const scrollBarWidth = (host: HTMLElement) => {
  const viewport = viewportOf(host);
  return viewport.offsetWidth - viewport.clientWidth;
};

/** The visible part of the viewport between its scroll bars (client coordinates). */
const clientBox = (host: HTMLElement) => {
  const viewport = viewportOf(host);
  const r = viewport.getBoundingClientRect();
  const left = r.left + viewport.clientLeft; // right-to-left: the vertical scroll bar is on the left
  return { left, right: left + viewport.clientWidth };
};

async function scrollToHorizontalEnd(host: HTMLElement) {
  const viewport = viewportOf(host);
  viewport.scrollLeft = direction === 'rtl' ? -viewport.scrollWidth : viewport.scrollWidth;
  viewport.dispatchEvent(new Event('scroll'));
  await nextFrame();
}

/** The cell of a column in the first rendered body row of a side. */
const cellOf = (host: HTMLElement, side: 'center' | 'east', col: number) =>
  renderedRows(host, side)[0].querySelector<HTMLElement>(`[data-col-index="${col}"]`)!;

/** The y (client coordinates) where the horizontal scroll bar starts – nothing of the table may be below it. */
const visibleBottom = (host: HTMLElement) => {
  const viewport = viewportOf(host);
  return viewport.getBoundingClientRect().top + viewport.clientTop + viewport.clientHeight;
};

const rect = (el: Element) => el.getBoundingClientRect();

async function scrollToEnd(host: HTMLElement) {
  const viewport = viewportOf(host);
  viewport.scrollTop = viewport.scrollHeight;
  viewport.dispatchEvent(new Event('scroll'));
  await nextFrame();
}

/** The bottom of the lowest rendered body row (client coordinates). */
function lastRowBottom(host: HTMLElement): number {
  const rows = renderedRows(host);
  return Math.max(...rows.map(r => r.getBoundingClientRect().bottom));
}

describe.each(DIRECTIONS)('%s', dir => {
  beforeEach(() => { direction = dir; });

  describe('horizontal scroll bar', () => {

    it('the test browser has classic scroll bars (precondition)', async () => {
      const { host } = mountTable(model({ columns: 30 }));
      await nextFrame();
      expect(scrollBarHeight(host)).toBeGreaterThan(0);
    });

    it('without footer: the last body row is fully visible above the scroll bar when scrolled to the end', async () => {
      const { host, api } = mountTable(model({ columns: 30 }));
      await nextFrame();
      await scrollToEnd(host);
      expect(api.getLastFullVisibleRowIndex()).toBe(199);
      expect(lastRowBottom(host)).toBeLessThanOrEqual(visibleBottom(host) + 0.5);
      const body = host.querySelector<HTMLElement>('.ge-table-body-center')!.parentElement!;
      expect(body.getBoundingClientRect().bottom).toBeLessThanOrEqual(visibleBottom(host) + 0.5);
    });

    it('with footer: the footer lies above the scroll bar, the last body row above the footer', async () => {
      const { host } = mountTable(model({ columns: 30, footer: true }));
      await nextFrame();
      await scrollToEnd(host);
      const footer = host.querySelector<HTMLElement>('.ge-table-footer-center')!;
      const footerRect = footer.getBoundingClientRect();
      expect(footerRect.bottom).toBeLessThanOrEqual(visibleBottom(host) + 0.5);
      expect(areaRows(host, 'footer')[0].getBoundingClientRect().bottom).toBeLessThanOrEqual(visibleBottom(host) + 0.5);
      expect(lastRowBottom(host)).toBeLessThanOrEqual(footerRect.top + 0.5);
    });

    it('without a horizontal scroll bar the body keeps the full height', async () => {
      const { host } = mountTable(model({ columns: 5 }));
      await nextFrame();
      expect(scrollBarHeight(host)).toBe(0);
      const body = host.querySelector<HTMLElement>('.ge-table-body-center')!.parentElement!;
      const header = host.querySelector<HTMLElement>('.ge-table-header-center')!;
      expect(body.getBoundingClientRect().height + header.getBoundingClientRect().height)
        .toBeCloseTo(host.clientHeight, 0);
    });

    it('a scroll bar that appears later (wider column) shrinks the body', async () => {
      const { host, api } = mountTable(model({ columns: 5 }));
      await nextFrame();
      expect(scrollBarHeight(host)).toBe(0);
      api.setColumnWidth(0, 2000);
      api.recalcWrappers();
      await nextFrame();
      expect(scrollBarHeight(host)).toBeGreaterThan(0);
      await scrollToEnd(host);
      expect(lastRowBottom(host)).toBeLessThanOrEqual(visibleBottom(host) + 0.5);
    });

    it('a scroll bar that appears when the host gets narrower shrinks the body', async () => {
      const { host } = mountTable(model({ columns: 7 })); // 700 px in 800 px
      await nextFrame();
      expect(scrollBarHeight(host)).toBe(0);
      host.style.width = '500px';
      window.dispatchEvent(new Event('resize'));
      await vi.waitFor(() => expect(scrollBarHeight(host)).toBeGreaterThan(0));
      await vi.waitFor(async () => {
        await scrollToEnd(host);
        expect(lastRowBottom(host)).toBeLessThanOrEqual(visibleBottom(host) + 0.5);
      });
    });

    it('the scroll bar disappears again: the body gets the full height back', async () => {
      const { host, api } = mountTable(model({ columns: 30 }));
      await nextFrame();
      expect(scrollBarHeight(host)).toBeGreaterThan(0);
      for (let c = 0; c < 30; c++) api.setColumnWidth(c, 10);
      api.recalcWrappers();
      await nextFrame();
      expect(scrollBarHeight(host)).toBe(0);
      const body = host.querySelector<HTMLElement>('.ge-table-body-center')!.parentElement!;
      const header = host.querySelector<HTMLElement>('.ge-table-header-center')!;
      expect(body.getBoundingClientRect().height + header.getBoundingClientRect().height)
        .toBeCloseTo(host.clientHeight, 0);
    });
  });

  describe('vertical scroll bar', () => {

    it('scrolled to the end, the last center column is fully visible next to the vertical scroll bar', async () => {
      const { host } = mountTable(model({ columns: 30 }));
      await nextFrame();
      expect(scrollBarWidth(host)).toBeGreaterThan(0);
      await scrollToHorizontalEnd(host);
      const last = rect(cellOf(host, 'center', 29));
      const box = clientBox(host);
      expect(last.left).toBeGreaterThanOrEqual(box.left - 0.5);
      expect(last.right).toBeLessThanOrEqual(box.right + 0.5);
      // flush with the scroll bar – no gap
      if (direction === 'ltr') expect(last.right).toBeCloseTo(box.right, 0);
      else expect(last.left).toBeCloseTo(box.left, 0);
    });

    it('the fixed east column lies next to the vertical scroll bar, not below it', async () => {
      const { host } = mountTable(model({ columns: 30, fixedRight: 1 }));
      await nextFrame();
      const east = rect(cellOf(host, 'east', 29));
      const box = clientBox(host);
      if (direction === 'ltr') expect(east.right).toBeCloseTo(box.right, 0);
      else expect(east.left).toBeCloseTo(box.left, 0);
      const header = rect(areaRows(host, 'header', 'east')[0]);
      expect(header.width).toBeCloseTo(east.width, 0);
      if (direction === 'ltr') expect(header.right).toBeCloseTo(box.right, 0);
      else expect(header.left).toBeCloseTo(box.left, 0);
    });

    it('% columns fill the width next to the vertical scroll bar: no horizontal scroll bar', async () => {
      const { host, scope } = mountTable(model({ columns: 4, width: new Size(25, '%') }));
      await nextFrame();
      expect(scrollBarWidth(host)).toBeGreaterThan(0);
      expect(scrollBarHeight(host)).toBe(0);
      const sum = [0, 1, 2, 3].reduce((acc, c) => acc + scope.tableModel.getColumnWidth(c), 0);
      expect(sum).toBeLessThanOrEqual(viewportOf(host).clientWidth);
      expect(sum).toBeGreaterThan(viewportOf(host).clientWidth - 4);
    });

    it('weight columns: rows added later bring the vertical scroll bar – the columns get narrower', async () => {
      const { host, api, scope } = mountTable(model({ columns: 4, rows: 3, width: new Size(1, 'weight') }));
      await nextFrame();
      expect(scrollBarWidth(host)).toBe(0);
      const before = scope.tableModel.getColumnWidth(0);
      api.setRows(Array.from({ length: 300 }, (_, r) => ({ c0: r, c1: r, c2: r, c3: r })));
      api.repaintHard();
      await nextFrame();
      expect(scrollBarWidth(host)).toBeGreaterThan(0);
      expect(scope.tableModel.getColumnWidth(0)).toBeLessThan(before);
      expect(scrollBarHeight(host)).toBe(0);
    });
  });
});
