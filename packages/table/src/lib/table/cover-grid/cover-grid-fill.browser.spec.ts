// Prompt 027: a cover grid that fills the whole width – one option instead of fitCoversToWidth + an own
// ResizeObserver of the app (finding G4 of the cover grid film).
//
// Geometry: tile width 165 px; host 960 px → 5 per row (with a classic 15 px scroll bar: 945 px → 5 as well),
// 620 px → 3 per row (605 px → 3). The expectations read the layout width of the table, so they hold in both
// projects (browser, browser-scrollbars).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CoverGridFactory, TableFactory } from '@guiexpert/table';
import type { AreaIdent, AreaModelIf, CellRendererIf, CoverGridTableModel, TableOptionsIf } from '@guiexpert/table';
import { DIRECTIONS, destroyAllTables, mountTable, nextFrame, startPx, stylePx } from '../../../../test-utils/mount-table';
import { countRenders } from '../../../../test-utils/perf-counters';

interface Book {
  id: number;
  title: string;
}

const createBooks = (count: number): Book[] =>
  Array.from({ length: count }, (_, i) => ({ id: i, title: 'Book ' + i }));

const renderer: CellRendererIf = {
  render(cellDiv: HTMLDivElement, _r: number, _c: number, _a: AreaIdent, _m: AreaModelIf, book: unknown) {
    cellDiv.textContent = book ? (book as Book).title : '';
    return undefined;
  },
};

let warn: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  warn = vi.spyOn(console, 'warn');
});

afterEach(() => {
  destroyAllTables();
  vi.restoreAllMocks();
});

function mountGrid(width: number, options: Partial<TableOptionsIf>, count = 10_000, model?: CoverGridTableModel<Book>) {
  const books = createBooks(count);
  const grid = model ?? CoverGridFactory.createCoverGridModel(books, renderer, 165, 220);
  const table = mountTable(grid, {
    width,
    height: 600,
    tableOptions: {
      ...CoverGridFactory.createCoverGridDefaultOptions(220),
      autoRestoreOptions: undefined,
      ...options,
    },
  });
  return { ...table, books, model: grid, body: grid.bodyModel };
}

type Grid = ReturnType<typeof mountGrid>;

/** The cell divs of the first rendered row, in column order. */
function firstRowCells(grid: Grid): HTMLElement[] {
  const row = grid.scope.getFirstVisibleRowIndex();
  return Array.from(grid.host.querySelectorAll<HTMLElement>(`.ge-table-body-center .ge-table-col-div[data-row-index="${row}"]`))
    .sort((a, b) => Number(a.dataset['colIndex']) - Number(b.dataset['colIndex']));
}

/** The logical end (from the start of the row) of the last tile of the first rendered row. */
function lastTileEnd(grid: Grid): number {
  const cells = firstRowCells(grid);
  const last = cells[cells.length - 1];
  return startPx(last) + stylePx(last, 'width');
}

function firstRowItems(grid: Grid): Book[] {
  const perRow = grid.body.getTilesPerRow();
  const first = grid.scope.getFirstVisibleRowIndex();
  return grid.body.filteredItems.slice(first * perRow, (first + 1) * perRow);
}

const FILL = { tileWidth: 165, aspectRatio: 220 / 165, extraHeight: 44 };

describe.each(DIRECTIONS)('cover grid: coverGridFill (%s)', direction => {

  it('the tiles fill the width: the last tile ends flush with the layout width – already in the first render', () => {
    const grid = mountGrid(960, { direction, coverGridFill: { tileWidth: 165 } });
    const layoutWidth = grid.scope.getLayoutWidth();
    expect(grid.body.getTilesPerRow()).toBe(Math.floor(layoutWidth / 165));
    const cells = firstRowCells(grid);
    expect(cells).toHaveLength(grid.body.getTilesPerRow());
    expect(startPx(cells[0])).toBe(0);
    expect(Math.abs(lastTileEnd(grid) - layoutWidth)).toBeLessThanOrEqual(0.5);
    // the tiles touch each other (no gap, no overlap)
    for (let i = 1; i < cells.length; i++) {
      expect(startPx(cells[i])).toBe(startPx(cells[i - 1]) + stylePx(cells[i - 1], 'width'));
    }
    // no horizontal scroll bar
    const viewport = grid.scope.scrollViewport;
    expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.clientWidth);
    expect(grid.model.getContentWidthInPixel()).toBe(layoutWidth);
  });

  it('aspectRatio + extraHeight: the tile height follows the width', async () => {
    const grid = mountGrid(960, { direction, coverGridFill: FILL });
    await nextFrame();
    const base = Math.floor(grid.scope.getLayoutWidth() / 5);
    expect(grid.body.coverWidth).toBe(base);
    expect(grid.body.coverHeight).toBe(Math.round(base * 220 / 165) + 44);
    expect(stylePx(firstRowCells(grid)[0], 'height')).toBe(grid.body.coverHeight);
  });

  it('a resize is taken over in the next frame (not after resizeEventDebounceDelay), with one render; the top item stays', async () => {
    const grid = mountGrid(960, { direction, coverGridFill: FILL });   // resizeEventDebounceDelay: 500 (default)
    await nextFrame();                       // the first ResizeObserver callback
    grid.api.scrollToIndex(0, 100);          // 5 per row: items 500 … 504 on top
    await nextFrame();
    expect(firstRowItems(grid).map(b => b.id)).toContain(500);
    const renders = countRenders(grid.scope);

    grid.host.style.width = '620px';
    await nextFrame();
    expect(grid.body.getTilesPerRow()).toBe(3);
    expect(renders.count()).toBe(1);
    expect(Math.abs(lastTileEnd(grid) - grid.scope.getLayoutWidth())).toBeLessThanOrEqual(0.5);
    expect(firstRowItems(grid).map(b => b.id)).toContain(500);
    renders.stop();
  });

  it('switched on while a debounced resize is pending: that call is dropped (no second render)', async () => {
    const grid = mountGrid(960, { direction, resizeEventDebounceDelay: 60 });   // without fill: debounced
    await new Promise(resolve => setTimeout(resolve, 100));   // the first (debounced) ResizeObserver pass
    await nextFrame();
    grid.host.style.width = '620px';
    await nextFrame();                       // the ResizeObserver callback ran: a call is pending
    const renders = countRenders(grid.scope);
    grid.api.setCoverGridFill(FILL);
    expect(renders.count()).toBe(1);
    expect(grid.body.getTilesPerRow()).toBe(3);
    await new Promise(resolve => setTimeout(resolve, 120));
    await nextFrame();
    expect(renders.count()).toBe(1);
    renders.stop();
  });

  it('several resizes in a row: one render each, the item does not drift', async () => {
    const grid = mountGrid(960, { direction, coverGridFill: FILL });
    await nextFrame();
    grid.api.scrollToIndex(0, 100);
    await nextFrame();
    for (const width of [620, 800, 400, 960]) {
      const renders = countRenders(grid.scope);
      grid.host.style.width = width + 'px';
      await nextFrame();
      expect(renders.count()).toBe(1);
      expect(grid.body.getTilesPerRow()).toBe(Math.max(1, Math.floor(grid.scope.getLayoutWidth() / 165)));
      expect(firstRowItems(grid).map(b => b.id)).toContain(500);
      renders.stop();
    }
  });

  it('setCoverGridFill({ tileWidth }) at runtime: columns and height, one render, the focused item stays', async () => {
    const grid = mountGrid(960, { direction, coverGridFill: FILL });
    await nextFrame();
    const fm = grid.scope.focusModel()!;
    fm.setFocus(1, 2);                        // item 7 (5 per row)
    await nextFrame();
    const layoutWidth = grid.scope.getLayoutWidth();
    for (const tileWidth of [115, 280]) {
      const renders = countRenders(grid.scope);
      expect(grid.api.setCoverGridFill({ tileWidth })).toBe(true);
      expect(renders.count()).toBe(1);
      renders.stop();
      const columns = Math.floor(layoutWidth / tileWidth);
      const base = Math.floor(layoutWidth / columns);
      expect(grid.body.getTilesPerRow()).toBe(columns);
      expect(grid.body.coverHeight).toBe(Math.round(base * 220 / 165) + 44);
      expect(grid.body.getValueAt(...fm.getFocus())).toBe(grid.books[7]);
      expect(grid.api.getCoverGridFill()).toEqual({ ...FILL, tileWidth });
      await nextFrame();
      expect(Math.abs(lastTileEnd(grid) - layoutWidth)).toBeLessThanOrEqual(0.5);
    }
  });

  it('setCoverGridFill(false): tiles of tileWidth again, the gap on the right is back; true: filled again', async () => {
    const grid = mountGrid(960, { direction, coverGridFill: { tileWidth: 165 } });
    await nextFrame();
    grid.api.setCoverGridFill(false);
    expect(grid.api.getCoverGridFill()).toBeUndefined();
    expect(grid.body.coverWidth).toBe(165);
    await nextFrame();
    expect(lastTileEnd(grid)).toBe(5 * 165);
    grid.api.setCoverGridFill(true);
    expect(grid.api.getCoverGridFill()).toEqual({ tileWidth: 165 });
    await nextFrame();
    expect(Math.abs(lastTileEnd(grid) - grid.scope.getLayoutWidth())).toBeLessThanOrEqual(0.5);
  });
});

describe('cover grid: coverGridFill – options', () => {

  it('without the option: tiles keep coverWidth, the resize is debounced as before, no warning', async () => {
    const grid = mountGrid(960, { resizeEventDebounceDelay: 200 });
    expect(grid.api.getCoverGridFill()).toBeUndefined();
    expect(lastTileEnd(grid)).toBe(5 * 165);
    await new Promise(resolve => setTimeout(resolve, 250));   // the first (debounced) ResizeObserver pass
    grid.host.style.width = '620px';
    await nextFrame();
    expect(grid.body.getTilesPerRow()).toBe(5);   // still the old width
    await vi.waitFor(() => expect(grid.body.getTilesPerRow()).toBe(3));
    expect(warn).not.toHaveBeenCalled();
  });

  it('coverGridFill: true = the coverWidth of the model as tileWidth, the height stays', () => {
    const grid = mountGrid(960, { coverGridFill: true });
    expect(grid.api.getCoverGridFill()).toEqual({ tileWidth: 165 });
    expect(grid.body.coverHeight).toBe(220);
    expect(Math.abs(lastTileEnd(grid) - grid.scope.getLayoutWidth())).toBeLessThanOrEqual(0.5);
  });

  it('a fill set on the model is kept without the option; coverGridFill: false switches it off', () => {
    const model = CoverGridFactory.createCoverGridModel(createBooks(100), renderer, 165, 220);
    model.bodyModel.setFill({ tileWidth: 165 });
    const first = mountGrid(960, {}, 100, model);
    expect(first.api.getCoverGridFill()).toEqual({ tileWidth: 165 });
    first.destroy();
    const second = mountGrid(960, { coverGridFill: false }, 100, model);
    expect(second.api.getCoverGridFill()).toBeUndefined();
    expect(model.bodyModel.coverWidth).toBe(165);
  });

  it('a rebuild with the same options (framework wrapper) starts with the options, not with a runtime change', () => {
    const model = CoverGridFactory.createCoverGridModel(createBooks(100), renderer, 165, 220);
    const options = { coverGridFill: { tileWidth: 165 } };
    const first = mountGrid(960, options, 100, model);
    first.api.setCoverGridFill({ tileWidth: 250, aspectRatio: 1.5 });
    first.destroy();
    const second = mountGrid(960, options, 100, model);
    expect(second.api.getCoverGridFill()).toEqual({ tileWidth: 165 });
  });

  it('another body than a cover grid: one warning, setCoverGridFill() returns false', () => {
    const model = TableFactory.createTableModel({ rows: [{ a: 1 }], properties: ['a'] });
    const table = mountTable(model, { tableOptions: { coverGridFill: true } });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toContain('coverGridFill');
    expect(table.api.setCoverGridFill({ tileWidth: 100 })).toBe(false);
    expect(table.api.getCoverGridFill()).toBeUndefined();
  });

  it('destroy(): a resize after destroy does nothing', async () => {
    const grid = mountGrid(960, { coverGridFill: FILL });
    await nextFrame();
    const renders = countRenders(grid.scope);
    grid.api.destroy();
    grid.host.style.width = '620px';
    await nextFrame();
    expect(renders.count()).toBe(0);
    renders.stop();
  });
});
