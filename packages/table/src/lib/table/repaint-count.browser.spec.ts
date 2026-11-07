// One render per update (prompt 017, part A): an application whose row count grows and that keeps a content position
// (a live log tail: 5000 new rows/s, up to 10 million rows) repaints with `repaintHard()` and sets the position.
// Before 1.1.107 that cost three full render passes – `repaintHard()` rendered twice (adjustContainersAndRows() and
// again at its end), `scrollToPixel()` once more – plus a fourth one from the native scroll event.
// Now: `repaintHard()` renders once, `repaintHard({ px, py })` sets the position in that same pass, and the scroll
// event of a position that is already rendered renders nothing.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AreaModel, ColumnDef, DefaultRowHeights, EleScope, TableFactory, px100 } from '@guiexpert/table';
import type { GeScrollEvent, TableModelIf, TableScope } from '@guiexpert/table';
import { createRows, DIRECTIONS, destroyAllTables, mountTable as mountTableBase, nextFrame } from '../../../test-utils/mount-table';
import type { MountOptions } from '../../../test-utils/mount-table';

let direction: 'ltr' | 'rtl' = 'ltr';
const mountTable = (model: TableModelIf, opts: MountOptions = {}) =>
  mountTableBase(model, { ...opts, tableOptions: { direction, ...opts.tableOptions } });

const ROW_HEIGHT = 20;

/** A growing body (like a live log): values on demand, constant row height. */
class GrowingBody extends AreaModel {
  constructor(public rowCount: number) {
    super();
    this.areaIdent = 'body';
  }

  override getRowCount(): number {
    return this.rowCount;
  }

  override getRowHeight(_rowIndex: number): number {
    return ROW_HEIGHT;
  }

  override getConstantRowHeight(): number {
    return ROW_HEIGHT;
  }

  override getValueAt(row: number, col: number): any {
    return `r${row}c${col}`;
  }
}

async function mountGrowing(rowCount: number, { columns = 2, eventListener }: { columns?: number; eventListener?: MountOptions['eventListener'] } = {}) {
  const body = new GrowingBody(rowCount);
  const tableModel = TableFactory.createTableModel({
    bodyAreaModel: body,
    columnDefs: Array.from({ length: columns }, (_, i) => new ColumnDef('c' + i, 'C' + i, px100)),
    // the same height as the model: part A does not depend on part B (scroll height from the area model)
    defaultRowHeights: new DefaultRowHeights(34, ROW_HEIGHT, 34),
  });
  const table = mountTable(tableModel, { width: 800, height: 500, eventListener });
  await nextFrame();
  return { ...table, body };
}

/** Counts the render passes (`adjustAfterScrolling`) of a table from now on. */
function countRenders(scope: TableScope) {
  return vi.spyOn(scope, 'adjustAfterScrolling');
}

const viewportOf = (host: HTMLElement) => host.querySelector<HTMLElement>('.ge-table-scroll-viewport')!;

/** Top of a rendered body row relative to the top of the visible body (undefined: not rendered). */
function rowTop(host: HTMLElement, rowIndex: number): number | undefined {
  const cell = host.querySelector<HTMLElement>(`.ge-table-body-center .ge-table-col-div[data-row-index="${rowIndex}"]`);
  const body = host.querySelector<HTMLElement>('.ge-table-body-center')!;
  return cell ? cell.getBoundingClientRect().top - body.getBoundingClientRect().top : undefined;
}

/** The logical horizontal scroll position (from the start of the rows). */
function logicalScrollLeft(host: HTMLElement): number {
  const raw = viewportOf(host).scrollLeft;
  return direction === 'rtl' ? (raw === 0 ? 0 : -raw) : raw;
}

afterEach(() => {
  vi.restoreAllMocks();
  destroyAllTables();
});

describe.each(DIRECTIONS)('%s', dir => {
  beforeEach(() => { direction = dir; });

  describe('repaintHard() – one render pass', () => {

    it('repaintHard() renders exactly once', async () => {
      const { scope, api, body } = await mountGrowing(3000);
      const renders = countRenders(scope);
      body.rowCount = 3100;
      api.repaintHard();
      expect(renders).toHaveBeenCalledTimes(1);
    });

    it('repaintHard() without a new position: the scroll height follows the rows, the position stays', async () => {
      const { host, scope, api, body } = await mountGrowing(3000);
      api.scrollToIndex(0, 1000);
      await nextFrame();
      const viewport = viewportOf(host);
      const scrollTop = viewport.scrollTop;
      body.rowCount = 4000;
      api.repaintHard();
      expect(viewport.scrollHeight).toBe(4000 * ROW_HEIGHT + 1);
      expect(viewport.scrollTop).toBe(scrollTop);
      expect(api.getFirstVisibleRowIndex()).toBe(1000);
    });

    it('repaintHard({ py }) renders once and shows exactly the requested content position', async () => {
      const { host, scope, api, body } = await mountGrowing(3000);
      const renders = countRenders(scope);
      body.rowCount = 3500;
      api.repaintHard({ py: 1234 * ROW_HEIGHT });
      expect(renders).toHaveBeenCalledTimes(1);
      expect(api.getFirstVisibleRowIndex()).toBe(1234);
      expect(rowTop(host, 1234)).toBeCloseTo(0, 0);
    });

    it('repaintHard({ px }) sets the horizontal position from the start of the rows (also right-to-left)', async () => {
      const { host, scope, api, body } = await mountGrowing(100, { columns: 30 });
      const renders = countRenders(scope);
      body.rowCount = 120;
      api.repaintHard({ px: 300 });
      expect(renders).toHaveBeenCalledTimes(1);
      expect(logicalScrollLeft(host)).toBeCloseTo(300, 0);
      expect(api.getFirstVisibleRowIndex()).toBe(0); // py missing: the vertical position stays
    });

    it('repaintHard({ px, py }) keeps the other axis when one is missing', async () => {
      const { host, api } = await mountGrowing(3000, { columns: 30 });
      api.repaintHard({ px: 200, py: 500 * ROW_HEIGHT });
      expect(api.getFirstVisibleRowIndex()).toBe(500);
      expect(logicalScrollLeft(host)).toBeCloseTo(200, 0);
      api.repaintHard({ py: 600 * ROW_HEIGHT });
      expect(api.getFirstVisibleRowIndex()).toBe(600);
      expect(logicalScrollLeft(host)).toBeCloseTo(200, 0);
      api.repaintHard({ px: 0 });
      expect(api.getFirstVisibleRowIndex()).toBe(600);
      expect(logicalScrollLeft(host)).toBe(0);
    });

    it('the native scroll event of a position that is already rendered renders nothing', async () => {
      const { host, scope, api, body } = await mountGrowing(3000);
      const renders = countRenders(scope);
      body.rowCount = 3500;
      api.repaintHard({ py: 2000 * ROW_HEIGHT });
      await nextFrame(); // the browser fires "scroll" for the new scrollTop
      viewportOf(host).dispatchEvent(new Event('scroll'));
      expect(renders).toHaveBeenCalledTimes(1);
      expect(api.getFirstVisibleRowIndex()).toBe(2000);
    });

    it('a scroll event of a new position still renders', async () => {
      const { host, scope, api } = await mountGrowing(3000);
      const renders = countRenders(scope);
      const viewport = viewportOf(host);
      viewport.scrollTop = 100 * ROW_HEIGHT;
      viewport.dispatchEvent(new Event('scroll'));
      expect(renders).toHaveBeenCalledTimes(1);
      expect(api.getFirstVisibleRowIndex()).toBe(100);
    });

    it('onScroll gets exactly one GeScrollEvent per repaintHard({ py })', async () => {
      const events: GeScrollEvent[] = [];
      const { api, body } = await mountGrowing(3000, { eventListener: { onScroll: (e: GeScrollEvent) => events.push(e) } as any });
      await nextFrame();
      events.length = 0;
      body.rowCount = 3500;
      api.repaintHard({ py: 700 * ROW_HEIGHT });
      expect(events.length).toBe(1);
      await nextFrame();
      expect(events.length).toBe(1); // the native scroll event of the same position is not a second render
    });

    it('row numbers get wider (99,999 → 100,000 rows): still one GeScrollEvent per repaintHard({ py })', async () => {
      // the nested render pass of the row-number width change emitted onScroll, the outer pass a second time
      const events: GeScrollEvent[] = [];
      const tableModel = TableFactory.createTableModel({ rows: createRows(99_995), properties: ['id', 'name'], rowNumbersVisible: true });
      const { api } = mountTable(tableModel, { eventListener: { onScroll: (e: GeScrollEvent) => events.push(e) } as any });
      await nextFrame();
      api.scrollToIndex(-1, 99_900);
      await nextFrame();
      events.length = 0;
      api.addRows(createRows(10).map(r => ({ ...r, id: 100_000 + r.id })));
      api.repaintHard({ py: 99_900 * 34 });
      expect(events.length).toBe(1);
      expect(api.getFirstVisibleRowIndex()).toBe(99_900);
    });

    it('scrollToPixel() still renders the position at once (one pass)', async () => {
      const { scope, api } = await mountGrowing(3000);
      const renders = countRenders(scope);
      api.scrollToPixel(0, 1500 * ROW_HEIGHT);
      expect(renders).toHaveBeenCalledTimes(1);
      expect(api.getFirstVisibleRowIndex()).toBe(1500);
    });
  });

  describe('growing rows with a capped scroll height (1,000,000 × 20 px > 8,000,000 px)', () => {
    const START = 1_000_000;
    const ROW = 500_000;

    it('repaintHard({ py }) keeps row 500,000 at the same place while the table grows by 10 × 50,000 rows', async () => {
      const { host, scope, api, body } = await mountGrowing(START);
      expect(START * ROW_HEIGHT).toBeGreaterThan(EleScope.maxScrollHeightInPx);
      api.scrollToPixel(0, ROW * ROW_HEIGHT);
      await nextFrame();
      expect(api.getFirstVisibleRowIndex()).toBe(ROW);
      const top = rowTop(host, ROW)!;
      expect(top).toBeDefined();

      const renders = countRenders(scope);
      for (let k = 1; k <= 10; k++) {
        body.rowCount = START + k * 50_000;
        api.repaintHard({ py: ROW * ROW_HEIGHT });
        expect(api.getFirstVisibleRowIndex()).toBe(ROW);
        expect(Math.abs(rowTop(host, ROW)! - top)).toBeLessThanOrEqual(0.5);
      }
      expect(renders).toHaveBeenCalledTimes(10);

      // a native scroll event afterwards (same scrollTop) does not move the content (pendingContentScroll still holds)
      viewportOf(host).dispatchEvent(new Event('scroll'));
      await nextFrame();
      expect(api.getFirstVisibleRowIndex()).toBe(ROW);
      expect(Math.abs(rowTop(host, ROW)! - top)).toBeLessThanOrEqual(0.5);
    });

    it('without a position (scrolled with the scroll bar, then only repaintHard()): the row moves', async () => {
      // the content position of a capped scroll height is scrollTop / scroller range × content range – the content
      // range grows with the rows, the scroller range does not
      const { host, api, body } = await mountGrowing(START);
      const viewport = viewportOf(host);
      viewport.scrollTop = (viewport.scrollHeight - viewport.clientHeight) / 2; // like dragging the thumb
      viewport.dispatchEvent(new Event('scroll'));
      const first = api.getFirstVisibleRowIndex();
      body.rowCount = START + 500_000;
      api.repaintHard();
      expect(api.getFirstVisibleRowIndex()).toBeGreaterThan(first + 100_000);
    });

    it('a position from scrollToPixel() survives a plain repaintHard() as long as the scroll bar was not moved', async () => {
      // NOTE: pendingContentScroll (1.1.95) holds the exact content position while scrollTop stays the same
      const { api, body } = await mountGrowing(START);
      api.scrollToPixel(0, ROW * ROW_HEIGHT);
      body.rowCount = START + 200_000;
      api.repaintHard();
      expect(api.getFirstVisibleRowIndex()).toBe(ROW);
    });
  });
});
