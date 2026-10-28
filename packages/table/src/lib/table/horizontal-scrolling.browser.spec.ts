// Horizontal virtual scrolling, fixed (west/east) columns and column widths in a real browser.
// Only the visible center columns are in the DOM; the fixed columns live in their own areas and never scroll.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ColumnDef, EventAdapter, Size, TableFactory, px100 } from '@guiexpert/table';
import type { GeScrollEvent, TableModelIf } from '@guiexpert/table';
import {
  areaRows,
  columnIndices,
  createRows,
  destroyAllTables,
  getCellDiv,
  DIRECTIONS,
  mountTable as mountTableBase,
  nextFrame,
  renderedRows,
  startPx,
  stylePx,
} from '../../../test-utils/mount-table';
import type { MountOptions } from '../../../test-utils/mount-table';

afterEach(destroyAllTables);

// Every test runs left-to-right and right-to-left (since 1.1.98): positions are checked from the start of the row
// (startPx = style.left, right-to-left style.right) and scroll positions from the start (getViewportScrollLeft).
let direction: 'ltr' | 'rtl' = 'ltr';
const mountTable = (model: TableModelIf, opts: MountOptions = {}) =>
  mountTableBase(model, { ...opts, tableOptions: { direction, ...opts.tableOptions } });

/** 300 columns à 100 px, cell values "row/column". */
function wideModel(opts: { columns?: number; rows?: number; fixedLeft?: number; fixedRight?: number; footer?: boolean } = {}): TableModelIf {
  const columnCount = opts.columns ?? 300;
  const columnDefs = Array.from({ length: columnCount },
    (_, c) => ColumnDef.create({ property: 'c' + c, headerLabel: 'H' + c, width: px100 }));
  const rows = Array.from({ length: opts.rows ?? 50 },
    (_, r) => Object.fromEntries(columnDefs.map((cd, c) => [cd.property, `${r}/${c}`])));
  return TableFactory.createTableModel({
    rows,
    columnDefs,
    fixedLeftColumnCount: opts.fixedLeft ?? 0,
    fixedRightColumnCount: opts.fixedRight ?? 0,
    footerData: opts.footer ? [columnDefs.map((_, c) => 'F' + c)] : undefined,
  });
}

function expectContiguous(cols: number[]) {
  cols.forEach((c, i) => expect(c).toBe(cols[0] + i));
}

/** The center cells of a row div, sorted by column index. */
function centerCells(rowDiv: HTMLElement): HTMLElement[] {
  return Array.from(rowDiv.querySelectorAll<HTMLElement>(':scope > .ge-table-col-div'));
}

const bodyCenterWidth = (host: HTMLElement) => stylePx(host.querySelector<HTMLElement>('.ge-table-body-center')!, 'width');

describe.each(DIRECTIONS)('%s', dir => {
  beforeEach(() => { direction = dir; });

  describe('horizontal virtual scrolling', () => {

    it('renders only the visible center columns of 300', async () => {
      const { host } = mountTable(wideModel());
      await nextFrame();
      for (const row of renderedRows(host)) {
        const cols = columnIndices(row);
        expect(cols[0]).toBe(0);
        expect(cols).toContain(7); // 8 × 100 px = 800 px host width
        expect(cols.length).toBeLessThanOrEqual(9);
        expectContiguous(cols);
      }
      const cells = centerCells(renderedRows(host)[0]);
      expect(cells.map(c => startPx(c))).toEqual(cells.map((_, i) => i * 100));
      expect(cells.every(c => stylePx(c, 'width') === 100)).toBe(true);
      // 300 columns would be 300 cells per row
      expect(host.querySelectorAll('.ge-table-body-center .ge-table-col-div').length).toBeLessThan(9 * renderedRows(host).length + 1);
    });

    it('the scroll content is as wide as all center columns', async () => {
      const { host, scope } = mountTable(wideModel({ fixedLeft: 2, fixedRight: 1 }));
      await nextFrame();
      const wrapper = host.querySelector<HTMLElement>('.ge-table-scroll-content-wrapper')!;
      expect(stylePx(wrapper, 'width')).toBe(297 * 100);
      expect(scope.scrollViewport.scrollWidth).toBe(297 * 100);
    });

    it('header and footer render the same center columns as the body', async () => {
      const { host, api } = mountTable(wideModel({ footer: true }));
      await nextFrame();
      api.scrollToPixel(4_000, 0);
      await nextFrame();
      const bodyCols = columnIndices(renderedRows(host)[0]);
      expect(columnIndices(areaRows(host, 'header')[0])).toEqual(bodyCols);
      expect(columnIndices(areaRows(host, 'footer')[0])).toEqual(bodyCols);
      expect(getCellDiv(host, 'header', 'center', 0, bodyCols[1]).textContent).toBe('H' + bodyCols[1]);
      expect(getCellDiv(host, 'footer', 'center', 0, bodyCols[1]).textContent).toBe('F' + bodyCols[1]);
    });

    it('scrollToPixel(x, 0) scrolls the viewport and renders the columns at x', async () => {
      const { host, api, scope } = mountTable(wideModel());
      await nextFrame();
      api.scrollToPixel(5_000, 0);
      await nextFrame();
      expect(scope.getViewportScrollLeft()).toBe(5_000);
      const cells = centerCells(renderedRows(host)[0]);
      const cols = cells.map(c => Number(c.getAttribute('data-col-index')));
      expectContiguous(cols);
      // the cell at x = 0 is column ~50 (the scroll bar is scaled to the content range – not pixel exact)
      const atZero = cells.find(c => startPx(c) <= 0 && startPx(c) + 100 > 0)!;
      expect(Number(atZero.getAttribute('data-col-index'))).toBeGreaterThanOrEqual(49);
      expect(Number(atZero.getAttribute('data-col-index'))).toBeLessThanOrEqual(51);
      expect(cols).not.toContain(0);
      expect(getCellDiv(host, 'body', 'center', 0, cols[2]).textContent).toBe(`0/${cols[2]}`);
    });

    it('at the right end the last column is flush with the right edge of the body', async () => {
      const { host, api } = mountTable(wideModel());
      await nextFrame();
      api.scrollToPixel(1e9, 0); // clamped by the browser
      await nextFrame();
      const cells = centerCells(renderedRows(host)[0]);
      const last = cells[cells.length - 1];
      expect(last.getAttribute('data-col-index')).toBe('299');
      expect(startPx(last) + stylePx(last, 'width')).toBe(bodyCenterWidth(host));
    });

    it('scrollToPixel(x, y) scrolls in both directions', async () => {
      const { host, api } = mountTable(wideModel({ rows: 1000 }));
      await nextFrame();
      api.scrollToPixel(3_000, 34 * 200);
      await nextFrame();
      expect(api.getFirstVisibleRowIndex()).toBe(200);
      expect(renderedRows(host)[0].getAttribute('data-row-index')).toBe('200');
      const cols = columnIndices(renderedRows(host)[0]);
      expect(cols[0]).toBeGreaterThanOrEqual(29);
      expect(cols[0]).toBeLessThanOrEqual(31);
      expect(columnIndices(areaRows(host, 'header')[0])).toEqual(cols);
    });

    it('onScroll receives a GeScrollEvent with the horizontal position', async () => {
      const listener = new EventAdapter();
      const events: GeScrollEvent[] = [];
      listener.onScroll = evt => events.push(evt);
      const { api, scope } = mountTable(wideModel(), { eventListener: listener });
      await nextFrame();
      events.length = 0;
      api.scrollToPixel(5_000, 0);
      await vi.waitFor(() => expect(events.length).toBeGreaterThan(0));
      const evt = events[events.length - 1];
      expect(evt.scrollLeft).toBe(5_000);
      expect(evt.scrollTop).toBe(0);
      expect(evt.scrollWidth).toBe(scope.scrollViewport.scrollWidth);
      expect(evt.clientWidth).toBe(scope.scrollViewport.clientWidth);
      expect(evt.scrollFactorX).toBeCloseTo(5_000 / (evt.scrollWidth - evt.clientWidth), 6);
      expect(evt.scrollFactorY).toBe(0);
    });
  });

  describe('fixed columns (fixedLeftColumnCount / fixedRightColumnCount in the model)', () => {

    it('renders the fixed columns in the west/east areas – never in the center', async () => {
      const { host } = mountTable(wideModel({ fixedLeft: 2, fixedRight: 1 }));
      await nextFrame();
      const center = renderedRows(host);
      const west = renderedRows(host, 'west');
      const east = renderedRows(host, 'east');
      expect(west.length).toBe(center.length);
      expect(east.length).toBe(center.length);
      for (let i = 0; i < center.length; i++) {
        expect(columnIndices(west[i])).toEqual([0, 1]);
        expect(columnIndices(east[i])).toEqual([299]);
        expect(columnIndices(center[i])[0]).toBe(2);
      }
      expect(columnIndices(areaRows(host, 'header', 'west')[0])).toEqual([0, 1]);
      expect(columnIndices(areaRows(host, 'header', 'east')[0])).toEqual([299]);
      expect(getCellDiv(host, 'body', 'east', 3, 299).textContent).toBe('3/299');
    });

    it('the fixed columns stay in place when scrolling horizontally', async () => {
      const { host, api } = mountTable(wideModel({ fixedLeft: 2, fixedRight: 1 }));
      await nextFrame();
      api.scrollToPixel(1e9, 0);
      await nextFrame();
      const west = renderedRows(host, 'west')[0];
      expect(columnIndices(west)).toEqual([0, 1]);
      expect(centerCells(west).map(c => startPx(c))).toEqual([0, 100]);
      const east = renderedRows(host, 'east')[0];
      expect(columnIndices(east)).toEqual([299]);
      expect(startPx(centerCells(east)[0])).toBe(0);
      const center = columnIndices(renderedRows(host)[0]);
      expect(center[center.length - 1]).toBe(298);
      expect(center).not.toContain(299);
      expect(center).not.toContain(1);
    });

    it('west and east areas are as wide as their columns', async () => {
      const { host } = mountTable(wideModel({ fixedLeft: 2, fixedRight: 1 }));
      await nextFrame();
      for (const area of ['header', 'body', 'footer'] as const) {
        const west = host.querySelector<HTMLElement>(`.ge-table-${area}-west`)!;
        const east = host.querySelector<HTMLElement>(`.ge-table-${area}-east`)!;
        expect(stylePx(west, 'width'), area).toBe(200);
        expect(startPx(west), area).toBe(0);
        expect(stylePx(east, 'width'), area).toBe(100);
        expect(startPx(east), area).toBe(700);
      }
      expect(bodyCenterWidth(host)).toBe(500);
      expect(startPx(host.querySelector<HTMLElement>('.ge-table-header-center')!)).toBe(200);
    });

    it('without fixed columns the west/east areas are empty and 0 px wide', async () => {
      const { host } = mountTable(wideModel());
      await nextFrame();
      expect(renderedRows(host, 'west')).toHaveLength(0);
      expect(renderedRows(host, 'east')).toHaveLength(0);
      expect(stylePx(host.querySelector<HTMLElement>('.ge-table-body-west')!, 'width')).toBe(0);
    });

    it('shows the west separator border right of the fixed columns', async () => {
      const { host } = mountTable(wideModel({ fixedLeft: 2 }));
      await nextFrame();
      const border = host.querySelector<HTMLElement>('.ge-table-west-fixed-column-border')!;
      expect(border.style.display).toBe('block');
      expect(startPx(border)).toBe(200);
      // and the full-height line between west and center:
      const line = Array.from(host.querySelectorAll<HTMLElement>(':scope > .ge-table-body-west-vertical-border'))
        .find(e => stylePx(e, 'width') === 1);
      expect(line).toBeDefined();
      expect(startPx(line!)).toBe(200);
    });

    it('fixedWestSeparatorBorderVisible = false hides the west separator border', async () => {
      const { host } = mountTable(wideModel({ fixedLeft: 2 }), { tableOptions: { fixedWestSeparatorBorderVisible: false } });
      await nextFrame();
      // since 1.1.103 the separator div is not created when switched off (before: display none)
      expect(host.querySelector('.ge-table-west-fixed-column-border')).toBeNull();
    });

    // Regression: ele-scope.ts checked getFixedLeftColumnCount() for the EAST separator – with only fixed right
    // columns the east border was hidden (and with only fixed left columns it was shown at the right table edge).
    it('shows the east separator border with fixed right columns only', async () => {
      const { host } = mountTable(wideModel({ fixedRight: 1 }));
      await nextFrame();
      const border = host.querySelector<HTMLElement>('.ge-table-east-fixed-column-border')!;
      expect(border.style.display).toBe('block');
      expect(startPx(border)).toBe(800 - 100);
    });

    it('shows no east separator border with fixed left columns only', async () => {
      const { host } = mountTable(wideModel({ fixedLeft: 1 }));
      await nextFrame();
      expect(host.querySelector<HTMLElement>('.ge-table-east-fixed-column-border')!.style.display).toBe('none');
    });

    // Regression: ele-scope.ts created the header/east area with data-area="body" (copy & paste) – a mouse event on
    // that area outside of a cell would have been reported as a body event.
    it('the header/east area is tagged as header area', async () => {
      const { host } = mountTable(wideModel({ fixedRight: 1 }));
      await nextFrame();
      expect(host.querySelector('.ge-table-header-east')!.getAttribute('data-area')).toBe('header');
    });
  });

  describe('column widths', () => {

    /** Mounts a 3-column table (200 px each) and waits for the first ResizeObserver callback. */
    async function mountThreeColumns(rows = createRows(20)) {
      const model = TableFactory.createTableModel({ rows, properties: ['id', 'name', 'value'] });
      const table = mountTable(model, { tableOptions: { resizeEventDebounceDelay: 10 } });
      const recalc = vi.spyOn(table.scope, 'recalcColumnWidths');
      await vi.waitFor(() => expect(recalc).toHaveBeenCalled());
      await nextFrame();
      recalc.mockClear();
      return { ...table, model, recalc };
    }

    const rowCellWidths = (host: HTMLElement) => centerCells(renderedRows(host)[0]).map(c => stylePx(c, 'width'));
    const rowCellLefts = (host: HTMLElement) => centerCells(renderedRows(host)[0]).map(c => startPx(c));

    it('setColumnWidth() changes the model – the DOM follows with the next repaint', async () => {
      const { host, api, model } = await mountThreeColumns();
      expect(rowCellWidths(host)).toEqual([200, 200, 200]);
      api.setColumnWidth(0, 300);
      expect(model.getColumnWidth(0)).toBe(300);
      // NOTE: setColumnWidth() does not repaint (the cells keep 200 px until repaint()/recalcWrappers()).
      expect(rowCellWidths(host)).toEqual([200, 200, 200]);
      api.repaint();
      expect(rowCellWidths(host)).toEqual([300, 200, 200]);
      expect(rowCellLefts(host)).toEqual([0, 300, 500]);
      expect(getCellDiv(host, 'header', 'center', 0, 0).style.width).toBe('300px');
    });

    it('setColumnWidth() + recalcWrappers() also resizes the scroll content', async () => {
      const { host, api } = await mountThreeColumns();
      api.setColumnWidth(1, 1_000);
      api.recalcWrappers();
      expect(stylePx(host.querySelector<HTMLElement>('.ge-table-scroll-content-wrapper')!, 'width')).toBe(1_400);
      expect(rowCellWidths(host)).toEqual([200, 1_000]); // column 2 starts at 1200 px – outside of the 800 px host
    });

    it('autoResizeColumns() sets measured widths (≥ 50 px) and repaints', async () => {
      const rows = createRows(20).map(r => ({ ...r, name: 'A rather long name number ' + r.id }));
      const { host, api, model } = await mountThreeColumns(rows);
      api.autoResizeColumns();
      const widths = [0, 1, 2].map(c => model.getColumnWidth(c));
      widths.forEach(w => expect(w).toBeGreaterThanOrEqual(50));
      expect(widths[1]).toBeGreaterThan(widths[0]); // long names vs. short ids
      expect(rowCellWidths(host)).toEqual(widths);
      expect(stylePx(host.querySelector<HTMLElement>('.ge-table-scroll-content-wrapper')!, 'width')).toBe(widths[0] + widths[1] + widths[2]);
    });

    it('recalcColumnWidths() calculates % widths from the viewport width', async () => {
      const columnDefs = [
        ColumnDef.create({ property: 'id', width: new Size(25, '%') }),
        ColumnDef.create({ property: 'name', width: new Size(75, '%') }),
      ];
      const { host, api } = mountTable(TableFactory.createTableModel({ rows: createRows(5), columnDefs }));
      await nextFrame();
      api.recalcColumnWidths();
      expect(rowCellWidths(host)).toEqual([200, 600]);
    });

    // Regression: firstInit() → tableModel.init() used the default parentSize of 400 px (table-model.ts constructor),
    // not the host width – % columns were wrong until the first ResizeObserver callback (≥ 500 ms later).
    it('% widths fit the host width right after mounting', async () => {
      const columnDefs = [
        ColumnDef.create({ property: 'id', width: new Size(50, '%') }),
        ColumnDef.create({ property: 'name', width: new Size(50, '%') }),
      ];
      const { host } = mountTable(TableFactory.createTableModel({ rows: createRows(5), columnDefs }));
      await nextFrame();
      expect(rowCellWidths(host)).toEqual([400, 400]);
    });

    function mountHalfHalf() {
      const columnDefs = [
        ColumnDef.create({ property: 'id', width: new Size(50, '%') }),
        ColumnDef.create({ property: 'name', width: new Size(50, '%') }),
      ];
      return mountTable(TableFactory.createTableModel({ rows: createRows(5), columnDefs }),
        { tableOptions: { resizeEventDebounceDelay: 10 } });
    }

    it('host + window resize: the ResizeObserver recalculates % widths', async () => {
      const { host } = mountHalfHalf();
      await vi.waitFor(() => expect(rowCellWidths(host)).toEqual([400, 400]));
      host.style.width = '1000px';
      window.dispatchEvent(new Event('resize')); // → adjustContainersAndRows() before the debounced observer callback
      await vi.waitFor(() => expect(rowCellWidths(host)).toEqual([500, 500]));
    });

    // Regression: recalcColumnWidths(clientWidth) ignored the new width passed by the ResizeObserver and read the scroll
    // viewport, which still had the OLD size (it is resized afterwards in repaintHard()). Without a window resize event
    // (e.g. a splitter or flex layout changes the host) % columns were always one resize behind.
    it('host resize alone: the ResizeObserver recalculates % widths', async () => {
      const { host, scope } = mountHalfHalf();
      await vi.waitFor(() => expect(rowCellWidths(host)).toEqual([400, 400]));
      const recalc = vi.spyOn(scope, 'recalcColumnWidths');
      host.style.width = '1000px';
      await vi.waitFor(() => expect(recalc).toHaveBeenCalledWith(1000));
      expect(rowCellWidths(host)).toEqual([500, 500]);
    });

    // Regression: every ResizeObserver callback calls recalcColumnWidths() → tableModel.init() → widths are rebuilt from
    // the ColumnDefs. Widths set by setColumnWidth(), autoResizeColumns() or by dragging a header edge were lost on the
    // next host resize – and the initial callback ~500 ms after mounting reverted widths set right after creation
    // (e.g. autoResizeColumns() in "tableReady"). setColumnWidth() now stores the width in the ColumnDef.
    it('a host resize keeps a width set by setColumnWidth()', async () => {
      const { host, api, recalc, model } = await mountThreeColumns();
      const sharedPx200 = model.getColumnDefs()![1]!.width;
      api.setColumnWidth(0, 300);
      api.repaint();
      host.style.height = '400px';
      await vi.waitFor(() => expect(recalc).toHaveBeenCalled());
      expect(rowCellWidths(host)).toEqual([300, 200, 200]);
      expect(model.getColumnDefs()![0]!.width).toMatchObject({ value: 300, unit: 'px' });
      expect(sharedPx200.value).toBe(200); // a shared Size constant is replaced, not changed
    });

    it('a host resize keeps the widths of autoResizeColumns() and turns a resized % column into px', async () => {
      const columnDefs = [
        ColumnDef.create({ property: 'id', width: new Size(50, '%') }),
        ColumnDef.create({ property: 'name', width: new Size(50, '%') }),
      ];
      const table = mountTable(TableFactory.createTableModel({ rows: createRows(5), columnDefs }),
        { tableOptions: { resizeEventDebounceDelay: 10 } });
      await vi.waitFor(() => expect(rowCellWidths(table.host)).toEqual([400, 400]));
      table.api.setColumnWidth(1, 250);
      table.api.repaint();
      table.host.style.width = '1000px';
      await vi.waitFor(() => expect(rowCellWidths(table.host)).toEqual([500, 250]));
    });

    it('a column with isVisible() = false has width 0 and is not rendered', async () => {
      const columnDefs = [
        ColumnDef.create({ property: 'id', width: px100 }),
        ColumnDef.create({ property: 'name', width: px100, isVisible: () => false }),
        ColumnDef.create({ property: 'value', width: px100 }),
      ];
      const { host } = mountTable(TableFactory.createTableModel({ rows: createRows(5), columnDefs }));
      await nextFrame();
      expect(columnIndices(renderedRows(host)[0])).toEqual([0, 2]);
      expect(rowCellLefts(host)).toEqual([0, 100]);
      expect(columnIndices(areaRows(host, 'header')[0])).toEqual([0, 2]);
    });
  });
});
