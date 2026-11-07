// The scroll bars of the scroll viewport must never cover table content:
// - the horizontal one not the last body row or the footer,
// - the vertical one not the last center column or the fixed east columns (right-to-left: it is on the left),
// - % and weight columns share the width next to the vertical scroll bar (no needless horizontal scroll bar).
// The viewport reaches down to the bottom of the host (its scroll bar stays usable below the footer); with classic
// (non-overlay) scroll bars – Windows, Linux, macOS with a mouse attached – the bar takes space at its bottom.
// Before the fix the body and the footer were laid out for the full host height: when scrolled to the end, the
// last row lay half behind the scroll bar (without footer), with a footer the bar covered the footer.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AreaModel, ColumnDef, Size, TableFactory, px100 } from '@guiexpert/table';
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

function model(opts: { columns: number; rows?: number; footer?: boolean; fixedLeft?: number; fixedRight?: number; width?: Size }): TableModelIf {
  const columnDefs = Array.from({ length: opts.columns },
    (_, c) => ColumnDef.create({ property: 'c' + c, headerLabel: 'H' + c, width: opts.width ?? px100 }));
  const rows = Array.from({ length: opts.rows ?? 200 },
    (_, r) => Object.fromEntries(columnDefs.map((cd, c) => [cd.property, `${r}/${c}`])));
  return TableFactory.createTableModel({
    rows,
    columnDefs,
    fixedLeftColumnCount: opts.fixedLeft ?? 0,
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
  // Before 1.1.104 the east area (and the footer) lay over the classic scroll bars: a click on the vertical bar hit
  // a header/body/footer cell of an east column, so the bar could not be dragged (Angular demo /demo/simple,
  // fixedRightColumnCount: 2). Prompt 016.
  describe('the scroll bars can be grabbed: elementFromPoint on them hits the scroll viewport', () => {

    async function mountGrabTable() {
      const t = mountTable(model({ columns: 30, footer: true, fixedLeft: 1, fixedRight: 2 }));
      await nextFrame();
      const viewport = viewportOf(t.host);
      expect(scrollBarWidth(t.host)).toBeGreaterThan(0);
      expect(scrollBarHeight(t.host)).toBeGreaterThan(0);
      const r = viewport.getBoundingClientRect();
      const barX = direction === 'ltr' ? r.right - scrollBarWidth(t.host) / 2 : r.left + scrollBarWidth(t.host) / 2;
      const barY = visibleBottom(t.host) + scrollBarHeight(t.host) / 2;
      return { ...t, viewport, r, barX, barY };
    }

    const hit = (x: number, y: number) => document.elementFromPoint(x, y);

    // (the viewport starts below the header and after the fixed west columns: there is no bar beside the header and
    // below the west columns)
    it('vertical bar: in the middle and beside the footer (fixed east columns)', async () => {
      const { host, viewport, r, barX } = await mountGrabTable();
      expect(hit(barX, (r.top + visibleBottom(host)) / 2)).toBe(viewport);
      const body = rect(renderedRows(host, 'east')[0]);
      expect(hit(barX, body.top + body.height / 2)).toBe(viewport);
      const footer = rect(areaRows(host, 'footer', 'east')[0]);
      expect(hit(barX, footer.top + footer.height / 2)).toBe(viewport);
    });

    it('horizontal bar: below the fixed east columns and below the center', async () => {
      const { host, viewport, barY } = await mountGrabTable();
      for (const side of ['center', 'east'] as const) {
        const footer = rect(areaRows(host, 'footer', side)[0]);
        expect(hit(footer.left + footer.width / 2, barY), side).toBe(viewport);
      }
    });
  });
  // No scroll bars at all (instead of an option overflowY "hidden", prompt 017): plain CSS on the scroll viewport.
  // The table measures 0 px bars and uses the full width and height; wheel, keyboard and the API still scroll.
  describe('scroll bars hidden with CSS (scrollbar-width: none)', () => {
    it('no space for bars, the content still scrolls to the last row', async () => {
      const style = document.createElement('style');
      style.textContent = '.no-bars .ge-table-scroll-viewport { scrollbar-width: none; }';
      document.head.appendChild(style);
      try {
        const { host, api } = mountTable(model({ columns: 30 }));
        host.classList.add('no-bars');
        api.repaintHard();
        await nextFrame();
        expect(scrollBarWidth(host)).toBe(0);
        expect(scrollBarHeight(host)).toBe(0);
        await scrollToEnd(host);
        expect(api.getLastFullVisibleRowIndex()).toBe(199);
        api.scrollToIndex(-1, 50);
        await nextFrame();
        expect(api.getFirstVisibleRowIndex()).toBe(50);
      } finally {
        style.remove();
      }
    });
  });

  // prompt 017 part B (1.1.107): the scroll height comes from the area model, not from defaultRowHeights (34)
  describe('an own area model with 20 px rows (defaultRowHeights 34)', () => {
    class Rows20 extends AreaModel {
      constructor(private readonly rowCount: number) {
        super();
        this.areaIdent = 'body';
      }

      override getRowCount(): number {
        return this.rowCount;
      }

      override getRowHeight(): number {
        return 20;
      }

      override getConstantRowHeight(): number {
        return 20;
      }

      override getValueAt(row: number, col: number): any {
        return `${row}/${col}`;
      }
    }

    const ownModel = (rows: number, columns = 3) => TableFactory.createTableModel({
      bodyAreaModel: new Rows20(rows),
      columnDefs: Array.from({ length: columns }, (_, c) => ColumnDef.create({ property: 'c' + c, headerLabel: 'H' + c, width: px100 })),
    });

    it('15 rows (300 px) in a 500 px host: no vertical scroll bar', async () => {
      const { host } = mountTable(ownModel(15));
      await nextFrame();
      expect(scrollBarWidth(host)).toBe(0);
      expect(viewportOf(host).scrollHeight).toBeLessThanOrEqual(viewportOf(host).clientHeight);
    });

    it('3000 rows: the scroll height is 3000 × 20 + 1, at the end the last row is fully visible', async () => {
      const { host, api } = mountTable(ownModel(3000, 30));
      await nextFrame();
      expect(scrollBarWidth(host)).toBeGreaterThan(0);
      expect(viewportOf(host).scrollHeight).toBe(3000 * 20 + 1);
      await scrollToEnd(host);
      expect(api.getLastFullVisibleRowIndex()).toBe(2999);
      expect(lastRowBottom(host)).toBeLessThanOrEqual(visibleBottom(host) + 0.5);
    });
  });
});
