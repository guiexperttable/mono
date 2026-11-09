// Performance invariants (prompt 021, stage 1): count work instead of measuring time. A change that renders more
// often, rebuilds more cells, reads more values or walks all rows fails here – on every machine the same, so these
// tests guard the release (test:browser, Linux and macOS CI).
//
// Helpers: test-utils/perf-counters.ts. Time and ratios (small n vs. large n) are measured in `pnpm test:perf`
// (packages/table/perf), never here.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { ColumnDef, SelectionModel, TableCellUpdateEvent, TableFactory, px100 } from '@guiexpert/table';
import type { TableModelIf, TableOptionsIf } from '@guiexpert/table';
import { createRows, destroyAllTables, DIRECTIONS, getCellDiv, mountTable, nextFrame } from '../../../test-utils/mount-table';
import {
  countCalls,
  countCellBuilds,
  countRenders,
  countRowLayoutBuilds,
  visibleBodyCells,
} from '../../../test-utils/perf-counters';
import { realMouse } from '../../../test-utils/real-mouse';

afterEach(async () => {
  vi.restoreAllMocks();
  destroyAllTables();
  await realMouse.move(0, 0);
});

const COLUMNS = ['id', 'name', 'value'];

function createModel(rowCount: number, opts: { sortable?: boolean; comparator?: (a: any, b: any) => number } = {}): TableModelIf {
  return TableFactory.createTableModel({
    rows: createRows(rowCount),
    columnDefs: COLUMNS.map(p => ColumnDef.create({
      property: p, headerLabel: p, width: px100,
      sortable: opts.sortable ? () => true : undefined,
      sortComparator: opts.comparator,
    })),
  });
}

async function mount(rowCount: number, direction: 'ltr' | 'rtl', tableOptions: Partial<TableOptionsIf> = {},
                     model = createModel(rowCount)) {
  const table = mountTable(model, { tableOptions: { direction, resizeEventDebounceDelay: 10, ...tableOptions } });
  await settleMount();
  return table;
}

/** Waits for the first ResizeObserver callback after mounting (it renders once – not part of what a test counts). */
async function settleMount() {
  await nextFrame();
  await new Promise(resolve => setTimeout(resolve, 40));
  await nextFrame();
}

const viewportOf = (host: HTMLElement) => host.querySelector<HTMLElement>('.ge-table-scroll-viewport')!;

/** Scrolls the viewport and waits for the render of the scroll event. */
async function scrollTo(host: HTMLElement, top: number) {
  viewportOf(host).scrollTop = top;
  await nextFrame();
}

describe.each(DIRECTIONS)('performance invariants (%s)', direction => {

  describe('scrolling', () => {
    it.each([['one row', 374], ['far away', 200_000]])(
      'scrolling %s: 1 render, rebuilt cells ≈ visible cells, values read ≈ visible cells – independent of n',
      async (_label, top) => {
        const reads: number[] = [];
        for (const rowCount of [10_000, 1_000_000]) {
          const t = await mount(rowCount, direction);
          await scrollTo(t.host, 340); // not at the top: scrolling up or down is the same work
          const renders = countRenders(t.scope);
          const cells = countCellBuilds(t.host);
          const values = countCalls(t.api.getBodyModel(), 'getValueAt');
          const layout = countRowLayoutBuilds(t.scope);
          await scrollTo(t.host, top);
          const visible = visibleBodyCells(t.host);
          expect(renders.count()).toBe(1);
          expect(cells.count()).toBe(visible + headerCells(t.host)); // every render rebuilds the header row, too
          expect(values.count()).toBeLessThanOrEqual(visible * 2);
          expect(layout.count()).toBe(0);
          reads.push(values.count());
          t.destroy();
        }
        // the same work for 10,000 and 1,000,000 rows – ± one partly visible row (above 8,000,000 px the scroll bar is
        // scaled: the same scrollTop shows another content offset)
        expect(Math.abs(reads[1] - reads[0])).toBeLessThanOrEqual(COLUMNS.length);
      });
  });

  describe('repaint', () => {
    it('tableApi.repaint(): 1 render, the row layout is built once (the app may have changed data)', async () => {
      const t = await mount(10_000, direction);
      const renders = countRenders(t.scope);
      const layout = countRowLayoutBuilds(t.scope);
      t.api.repaint();
      await nextFrame();
      expect(renders.count()).toBe(1);
      // NOTE: the PUBLIC repaint() drops derived values and the row positions (invalidateAggregates, CLAUDE.md §3.3) –
      // O(1) for a constant row height, O(n) prefix sums for variable heights. The internal repaint keeps them.
      expect(layout.count()).toBe(1);
    });

    it('the internal repaint (focus, selection, click): 1 render, the row layout is kept', async () => {
      const t = await mount(10_000, direction);
      const renders = countRenders(t.scope);
      const layout = countRowLayoutBuilds(t.scope);
      t.scope.repaint();
      await nextFrame();
      expect(renders.count()).toBe(1);
      expect(layout.count()).toBe(0);
    });

    it('repaintHard(): 1 render, the row layout is built once', async () => {
      const t = await mount(10_000, direction);
      const renders = countRenders(t.scope);
      const layout = countRowLayoutBuilds(t.scope);
      t.api.repaintHard();
      await nextFrame();
      expect(renders.count()).toBe(1);
      expect(layout.count()).toBe(1);
    });

    it('repaintHard({ py }): 1 render including the scroll event of the new position', async () => {
      const t = await mount(10_000, direction);
      const renders = countRenders(t.scope);
      t.api.repaintHard({ py: 50_000 });
      await nextFrame();
      expect(renders.count()).toBe(1);
    });

    it('repaint() rebuilds the visible cells, not more', async () => {
      const t = await mount(10_000, direction);
      const cells = countCellBuilds(t.host);
      t.api.repaint();
      expect(cells.count()).toBe(visibleBodyCells(t.host) + headerCells(t.host));
    });
  });

  describe('updateCells', () => {
    it('3 cells: no render, 3 values written, the row layout is kept', async () => {
      const t = await mount(10_000, direction);
      const renders = countRenders(t.scope);
      const layout = countRowLayoutBuilds(t.scope);
      const cells = countCellBuilds(t.host);
      const setValue = countCalls(t.api.getBodyModel(), 'setValue');
      t.api.updateCells([1, 2, 3].map(r => new TableCellUpdateEvent('body', r, 1, 'x' + r)));
      await nextFrame();
      expect(renders.count()).toBe(0);
      expect(setValue.count()).toBe(3);
      expect(layout.count()).toBe(0);
      expect(cells.count()).toBe(0); // the content of the 3 cells is replaced, the cell divs stay
    });

    it('with repaintAll: 1 render', async () => {
      const t = await mount(10_000, direction);
      const renders = countRenders(t.scope);
      t.api.updateCells([new TableCellUpdateEvent('body', 1, 1, 'x')], true);
      await nextFrame();
      expect(renders.count()).toBe(1);
    });
  });

  describe('mouse and keyboard', () => {
    it('a click on a cell (range selection): no render while pressed, ≤ 1 after mouseup', async () => {
      const t = await mount(10_000, direction, { getSelectionModel: () => new SelectionModel('range', 'multi') });
      const renders = countRenders(t.scope);
      await realMouse.moveTo(getCellDiv(t.host, 'body', 'center', 3, 1));
      await realMouse.down();
      await nextFrame();
      expect(renders.count()).toBe(0);
      await realMouse.up();
      await vi.waitFor(() => expect(t.scope.focusModel()?.getFocus()).toEqual([3, 1]));
      await nextFrame();
      expect(renders.count()).toBeLessThanOrEqual(1);
    });

    it('hover (mousemove over the body): no full render per move', async () => {
      const t = await mount(10_000, direction, { hoverRowVisible: true, hoverColumnVisible: true });
      const renders = countRenders(t.scope);
      const cell = getCellDiv(t.host, 'body', 'center', 2, 0);
      for (let i = 0; i < 10; i++) {
        await realMouse.moveTo(cell, 0, i * 30);
        await nextFrame();
      }
      expect(renders.count()).toBe(0);
    });

    it('↓ inside the visible rows: ≤ 1 render, the row layout is kept', async () => {
      const t = await mount(10_000, direction);
      await userEvent.click(getCellDiv(t.host, 'body', 'center', 2, 1));
      await nextFrame();
      await nextFrame();
      const renders = countRenders(t.scope);
      const layout = countRowLayoutBuilds(t.scope);
      await userEvent.keyboard('{ArrowDown}');
      await nextFrame();
      expect(t.scope.focusModel()?.getFocus()).toEqual([3, 1]);
      expect(renders.count()).toBeLessThanOrEqual(1);
      expect(layout.count()).toBe(0);
    });

    it('↓ at the bottom edge (the table scrolls): ≤ 2 renders (scroll + repaint), the row layout is kept', async () => {
      const t = await mount(10_000, direction);
      const last = t.api.getLastFullVisibleRowIndex();
      await userEvent.click(getCellDiv(t.host, 'body', 'center', last, 1));
      await nextFrame();
      await nextFrame();
      const renders = countRenders(t.scope);
      const layout = countRowLayoutBuilds(t.scope);
      await userEvent.keyboard('{ArrowDown}');
      await nextFrame();
      expect(t.scope.focusModel()?.getFocus()).toEqual([last + 1, 1]);
      // NOTE: ensureRowIsVisible scrolls (1 render from the scroll event) and the focus change repaints (1) – two
      // passes; one would do. Kept as the current behaviour (TODO.md, prompt 021).
      expect(renders.count()).toBeLessThanOrEqual(2);
      expect(layout.count()).toBe(0);
    });

    it('dragging a column width (10 moves): renders ≤ moves, the row layout is kept', async () => {
      const t = await mount(1_000, direction, { columnsResizable: true });
      const handle = t.host.querySelector<HTMLElement>('[data-ge-action="resize-column"][data-col-index="1"]')!;
      expect(handle).toBeTruthy();
      await realMouse.moveTo(handle);
      await realMouse.down();
      const renders = countRenders(t.scope);
      const layout = countRowLayoutBuilds(t.scope);
      const sign = direction === 'rtl' ? -1 : 1;
      for (let i = 1; i <= 10; i++) {
        await realMouse.moveTo(handle, sign * i * 5, 0);
        await nextFrame();
      }
      await realMouse.up();
      await nextFrame();
      await nextFrame();
      expect(renders.count()).toBeLessThanOrEqual(12); // one per move + start and end of the drag
      expect(layout.count()).toBe(0);
    });
  });

  describe('sorting and filtering', () => {
    it('sortByColumn: comparator calls ≤ 2 · n log₂ n, 1 render', async () => {
      const n = 10_000;
      let comparisons = 0;
      const comparator = (a: any, b: any) => { comparisons++; return a < b ? -1 : a > b ? 1 : 0; };
      const t = await mount(n, direction, {}, createModel(n, { sortable: true, comparator }));
      const renders = countRenders(t.scope);
      comparisons = 0;
      t.api.sortByColumn('value', 'desc');
      await nextFrame();
      expect(comparisons).toBeGreaterThan(0);
      expect(comparisons).toBeLessThanOrEqual(2 * n * Math.log2(n));
      expect(renders.count()).toBe(1);
    });

    it('externalFilterChanged: the filter function runs exactly n times, 1 render', async () => {
      const n = 10_000;
      let calls = 0;
      const t = await mount(n, direction, { externalFilterFunction: (row: any) => { calls++; return row.id % 2 === 0; } });
      const renders = countRenders(t.scope);
      calls = 0;
      t.api.externalFilterChanged();
      await nextFrame();
      expect(calls).toBe(n);
      expect(renders.count()).toBe(1);
    });
  });

  describe('resize', () => {
    it('a host resize: 1 render (debounced)', async () => {
      const t = await mount(1_000, direction);
      const renders = countRenders(t.scope);
      t.host.style.width = '700px';
      t.host.style.width = '650px';
      await vi.waitFor(() => expect(renders.count()).toBeGreaterThan(0));
      await new Promise(resolve => setTimeout(resolve, 50));
      await nextFrame();
      expect(renders.count()).toBe(1);
    });
  });
});

/** Header cell divs currently in the DOM. */
function headerCells(host: HTMLElement): number {
  return host.querySelectorAll('.ge-table-header-west .ge-table-col-div, .ge-table-header-center .ge-table-col-div, '
    + '.ge-table-header-east .ge-table-col-div').length;
}
