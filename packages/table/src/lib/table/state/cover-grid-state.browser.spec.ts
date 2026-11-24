// Prompt 025 (finding G10): the scroll state of a cover grid.
//
// A row of a cover grid is not a record but `perRow` tiles – CoverGridBodyModel.getRowByIndex() is always undefined.
// Before 1.1.116 the state service tried to store the first visible ROW as `firstRowId` and warned on every start of
// a cover grid ("the body model has no row objects – … getRowId = (_row, rowIndex) => rowIndex"). That advice would
// have been wrong: a row number depends on the width (tiles per row). Now a grid of tiles (AreaModelIf.getTileLayout)
// stores the id of the first ITEM of the first visible row and finds it again with another number of tiles per row.
//
// Geometry: tiles 150 × 200 px; host 620 px wide → 4 per row, 920 px → 6 per row (also with a classic 15 px scroll
// bar: 605 / 150 = 4.03, 905 / 150 = 6.03); host 500 px high.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CoverGridFactory } from '@guiexpert/table';
import type { AreaIdent, AreaModelIf, AutoRestoreOptionsIf, CellRendererIf, CoverGridTableModel, TableOptionsIf, TableStateIf } from '@guiexpert/table';
import { destroyAllTables, mountTable, nextFrame } from '../../../../test-utils/mount-table';
import { memoryStorage } from '../../../../test-utils/memory-storage';

interface Book {
  id: number;
  title: string;
}

const createBooks = (count: number): Book[] =>
  Array.from({ length: count }, (_, i) => ({ id: 1000 + i, title: 'Book ' + i }));

const renderer: CellRendererIf = {
  render(cellDiv: HTMLDivElement, _r: number, _c: number, _a: AreaIdent, _m: AreaModelIf, item: unknown) {
    cellDiv.textContent = item ? (typeof item === 'string' ? item : (item as Book).title) : '';
    return undefined;
  },
};

const KEY = 'covers';
let storage: Storage;
let warn: ReturnType<typeof vi.spyOn>;
let error: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  storage = memoryStorage();
  warn = vi.spyOn(console, 'warn');
  error = vi.spyOn(console, 'error');
});

afterEach(() => {
  destroyAllTables();
  vi.restoreAllMocks();
});

const stored = (): TableStateIf | null => JSON.parse(storage.getItem(KEY + 'tableState') ?? 'null');

/** The default options of a cover grid – only the storage is in memory and the state is reported after 10 ms. */
function gridOptions(base: TableOptionsIf, restore: Partial<AutoRestoreOptionsIf<unknown>> = {}): Partial<TableOptionsIf> {
  return {
    ...base,
    autoRestoreOptions: { ...base.autoRestoreOptions!, storage, ...restore },
    stateChangedDebounceDelay: 10,
    resizeEventDebounceDelay: 10,
  };
}

async function mountGrid<T>(items: T[], width: number, options: Partial<TableOptionsIf>) {
  const model: CoverGridTableModel<T> = CoverGridFactory.createCoverGridModel(items, renderer, 150, 200);
  const table = mountTable(model, { width, tableOptions: options });
  await nextFrame();
  await new Promise(resolve => setTimeout(resolve, 40)); // the first ResizeObserver callback
  await nextFrame();
  return { ...table, model, body: model.bodyModel };
}

/** The items of the first visible row. */
function firstRowItems<T>(grid: { scope: { getFirstVisibleRowIndex(): number }; body: CoverGridTableModel<T>['bodyModel'] }): T[] {
  const perRow = grid.body.getTilesPerRow();
  const first = grid.scope.getFirstVisibleRowIndex();
  return grid.body.filteredItems.slice(first * perRow, (first + 1) * perRow);
}

describe('cover grid: no console warning (G10)', () => {

  it.each([
    ['createCoverGridDefaultOptions', () => CoverGridFactory.createCoverGridDefaultOptions(220, () => KEY)],
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    ['createCoverGrisDefaultOptions (old name)', () => CoverGridFactory.createCoverGrisDefaultOptions(220, () => KEY)],
  ])('%s: start, scroll, store, destroy – no console.warn / console.error', async (_name, create) => {
    const grid = await mountGrid(createBooks(10_000), 620, gridOptions(create()));
    expect(grid.body.getTilesPerRow()).toBe(4);
    grid.api.scrollToIndex(0, 300);
    await vi.waitFor(() => expect(stored()?.scroll?.top).toBe(grid.scope.scrollViewport.scrollTop));
    expect(grid.scope.scrollViewport.scrollTop).toBeGreaterThan(0);
    grid.destroy();
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it('items without id (strings): only the pixel position, no warning', async () => {
    const urls = Array.from({ length: 1000 }, (_, i) => `cover-${i}.jpg`);
    const options = gridOptions(CoverGridFactory.createCoverGridDefaultOptions(200, () => KEY));
    const first = await mountGrid(urls, 620, options);
    first.api.scrollToIndex(0, 50);
    await vi.waitFor(() => expect(stored()?.scroll?.top).toBe(50 * 200));
    expect(stored()!.scroll).toEqual({ left: 0, top: 50 * 200 });
    first.destroy();

    const second = await mountGrid(urls, 620, options);
    expect(second.scope.scrollViewport.scrollTop).toBe(50 * 200);
    expect(warn).not.toHaveBeenCalled();
  });
});

describe('cover grid: the scroll position follows the item', () => {

  it('stores the id of the first item of the first visible row', async () => {
    const grid = await mountGrid(createBooks(10_000), 620, gridOptions(CoverGridFactory.createCoverGridDefaultOptions(200, () => KEY)));
    grid.api.scrollToIndex(0, 100);
    await vi.waitFor(() => expect(stored()?.scroll?.top).toBe(100 * 200));
    expect(grid.scope.getFirstVisibleRowIndex()).toBe(100);
    expect(stored()!.scroll).toEqual({ left: 0, top: 100 * 200, firstRowId: 1000 + 400 });   // item 400 = row 100 × 4
    expect(grid.api.getState(['scroll']).scroll!.firstRowId).toBe(1400);
  });

  it('another number of tiles per row: the same item is in the first visible row again', async () => {
    const books = createBooks(10_000);
    const options = gridOptions(CoverGridFactory.createCoverGridDefaultOptions(200, () => KEY));
    const narrow = await mountGrid(books, 620, options);
    narrow.api.scrollToIndex(0, 100);   // first row: items 400 … 403
    await vi.waitFor(() => expect(stored()?.scroll?.firstRowId).toBe(1400));
    narrow.destroy();

    const wide = await mountGrid(books, 920, options);   // 6 per row: item 400 sits in row 66, the pixel position 20000 would be row 100 (item 600)
    expect(wide.body.getTilesPerRow()).toBe(6);
    expect(wide.scope.getFirstVisibleRowIndex()).toBe(66);
    expect(firstRowItems(wide).map(b => b.id)).toContain(1400);
    expect(warn).not.toHaveBeenCalled();
  });

  it('the same width: the pixel position is kept exactly (no second scroll)', async () => {
    const books = createBooks(10_000);
    const options = gridOptions(CoverGridFactory.createCoverGridDefaultOptions(200, () => KEY));
    const first = await mountGrid(books, 620, options);
    first.api.scrollToPixel(0, 100 * 200 + 70);   // row 100, scrolled 70 px into it
    await vi.waitFor(() => expect(stored()?.scroll?.top).toBe(100 * 200 + 70));
    first.destroy();

    const second = await mountGrid(books, 620, options);
    expect(second.scope.scrollViewport.scrollTop).toBe(100 * 200 + 70);
  });

  it('new items before the stored one: the table scrolls to the stored item', async () => {
    const options = gridOptions(CoverGridFactory.createCoverGridDefaultOptions(200, () => KEY));
    const first = await mountGrid(createBooks(2000), 620, options);
    first.api.scrollToIndex(0, 100);
    await vi.waitFor(() => expect(stored()?.scroll?.firstRowId).toBe(1400));
    first.destroy();

    // 40 new books at the start: item 1400 is now at index 440 (row 110)
    const books = [...Array.from({ length: 40 }, (_, i) => ({ id: i, title: 'New ' + i })), ...createBooks(2000)];
    const second = await mountGrid(books, 620, options);
    expect(second.scope.getFirstVisibleRowIndex()).toBe(110);
    expect(firstRowItems(second).map(b => b.id)).toContain(1400);
  });

  it('an own getRowId gets the item and its index in the shown items', async () => {
    const getRowId = vi.fn((book: unknown, _index?: number) => 'b' + (book as Book).id);
    const options = gridOptions(CoverGridFactory.createCoverGridDefaultOptions(200, () => KEY), { getRowId });
    const grid = await mountGrid(createBooks(1000), 620, options);
    grid.api.scrollToIndex(0, 20);
    await vi.waitFor(() => expect(stored()?.scroll?.firstRowId).toBe('b1080'));
    expect(getRowId).toHaveBeenCalledWith(grid.body.filteredItems[80], 80);
  });

  it('the stored item was removed: the pixel position stays', async () => {
    const options = gridOptions(CoverGridFactory.createCoverGridDefaultOptions(200, () => KEY));
    const first = await mountGrid(createBooks(2000), 620, options);
    first.api.scrollToIndex(0, 100);
    await vi.waitFor(() => expect(stored()?.scroll?.firstRowId).toBe(1400));
    first.destroy();

    const second = await mountGrid(createBooks(2000).filter(b => b.id !== 1400), 920, options);
    expect(second.scope.scrollViewport.scrollTop).toBe(100 * 200);
    expect(warn).not.toHaveBeenCalled();
  });
});

// Prompt 025, follow-up: the scroll position also follows the item WHILE the grid lives – another width (another
// number of tiles per row) or another tile size (fitCoversToWidth + repaintHard) keeps the first item at the top.
// Before, only the pixels stayed: after a resize other covers were at the top, and a restored grid whose app fitted
// the tiles after the restore (the cover grid demo) did not show the stored item.
describe('cover grid: the scroll position follows the item at runtime', () => {

  const noRestore = (): Partial<TableOptionsIf> => ({
    ...CoverGridFactory.createCoverGridDefaultOptions(200),
    autoRestoreOptions: undefined,
    resizeEventDebounceDelay: 10,
  });

  it('another width: the first item stays at the top', async () => {
    const grid = await mountGrid(createBooks(10_000), 620, noRestore());
    grid.api.scrollToIndex(0, 100);   // first row: items 400 … 403
    await nextFrame();
    expect(firstRowItems(grid).map(b => b.id)).toEqual([1400, 1401, 1402, 1403]);

    grid.host.style.width = '920px';   // 6 per row: item 400 sits in row 66 (items 396 … 401)
    grid.api.recalcColumnWidths();
    await nextFrame();
    expect(grid.body.getTilesPerRow()).toBe(6);
    expect(grid.scope.getFirstVisibleRowIndex()).toBe(66);
    expect(grid.scope.scrollViewport.scrollTop).toBe(66 * 200);
    expect(firstRowItems(grid).map(b => b.id)).toContain(1400);
  });

  it('several widths in a row: the item does not drift', async () => {
    const grid = await mountGrid(createBooks(10_000), 620, noRestore());
    grid.api.scrollToIndex(0, 100);   // item 400 on top
    await nextFrame();
    for (const width of [920, 470, 920, 620]) {   // 6, 3, 6, 4 per row
      grid.host.style.width = width + 'px';
      grid.api.recalcColumnWidths();
      await nextFrame();
      expect(firstRowItems(grid).map(b => b.id)).toContain(1400);
    }
    expect(grid.scope.getFirstVisibleRowIndex()).toBe(100);   // back at 4 per row: row 100 again
  });

  it('another width through the ResizeObserver of the table', async () => {
    const grid = await mountGrid(createBooks(10_000), 620, noRestore());
    grid.api.scrollToIndex(0, 100);
    await nextFrame();
    grid.host.style.width = '920px';
    await vi.waitFor(() => expect(grid.body.getTilesPerRow()).toBe(6));
    await nextFrame();
    expect(firstRowItems(grid).map(b => b.id)).toContain(1400);
  });

  it('another tile height (repaintHard): the same row, the offset inside the row scales', async () => {
    const grid = await mountGrid(createBooks(10_000), 620, noRestore());
    grid.api.scrollToPixel(0, 100 * 200 + 100);   // half of row 100
    await nextFrame();
    grid.body.coverHeight = 300;
    grid.api.repaintHard();
    await nextFrame();
    expect(grid.scope.getFirstVisibleRowIndex()).toBe(100);
    expect(grid.scope.scrollViewport.scrollTop).toBe(100 * 300 + 150);
  });

  it('tiles fitted to the width after a restore (like the cover grid demo): the stored item is at the top', async () => {
    const books = createBooks(10_000);
    const options = gridOptions(CoverGridFactory.createCoverGridDefaultOptions(200, () => KEY));
    const first = await mountGrid(books, 620, options);
    first.api.scrollToIndex(0, 100);
    await vi.waitFor(() => expect(stored()?.scroll?.firstRowId).toBe(1400));
    first.destroy();

    const second = await mountGrid(books, 920, options);
    expect(firstRowItems(second).map(b => b.id)).toContain(1400);
    // the app stretches the tiles to the width: 920 / 6 → 5 per row with 180 × 240 px tiles
    second.body.coverWidth = 180;
    second.body.coverHeight = 240;
    second.api.repaintHard();
    await nextFrame();
    expect(second.body.getTilesPerRow()).toBe(5);
    expect(second.scope.getFirstVisibleRowIndex()).toBe(80);   // item 400 = row 80 × 5
    expect(firstRowItems(second).map(b => b.id)).toContain(1400);
  });

  it('a filter still scrolls to the top (only the geometry is followed, not the items)', async () => {
    let even = false;
    const grid = await mountGrid(createBooks(10_000), 620, {
      ...noRestore(),
      externalFilterFunction: (book: Book) => !even || book.id % 2 === 0,
    });
    grid.api.scrollToIndex(0, 100);
    await nextFrame();
    even = true;
    grid.api.externalFilterChanged();
    await nextFrame();
    expect(grid.scope.scrollViewport.scrollTop).toBe(0);
  });

  it('one render pass per change, the item is not searched while it keeps its index', async () => {
    const grid = await mountGrid(createBooks(10_000), 620, noRestore());
    grid.api.scrollToIndex(0, 100);
    await nextFrame();
    const renders = vi.spyOn(grid.scope, 'adjustAfterScrolling');
    const search = vi.spyOn(grid.body, 'indexOfTile');
    grid.body.coverWidth = 100;   // 6 per row (the host keeps its size: no ResizeObserver pass of the table)
    grid.api.repaintHard();
    expect(grid.body.getTilesPerRow()).toBe(6);
    expect(renders).toHaveBeenCalledTimes(1);   // the new position is part of that render pass
    renders.mockClear();
    await nextFrame();   // the scroll event of the new position renders nothing
    expect(renders).not.toHaveBeenCalled();
    expect(search).not.toHaveBeenCalled();
    expect(firstRowItems(grid).map(b => b.id)).toContain(1400);
  });
});

describe('cover grid: review findings', () => {

  it('the host has no width at the start (1 tile per row): the restored item is on top once the width is known', async () => {
    const books = createBooks(10_000);
    const options = gridOptions(CoverGridFactory.createCoverGridDefaultOptions(200, () => KEY));
    const first = await mountGrid(books, 620, options);
    first.api.scrollToIndex(0, 100);
    await vi.waitFor(() => expect(stored()?.scroll?.firstRowId).toBe(1400));
    first.destroy();

    const second = await mountGrid(books, 0, options);   // e.g. a flex child that is not laid out yet
    expect(second.body.getTilesPerRow()).toBe(1);
    second.host.style.width = '620px';
    await vi.waitFor(() => expect(second.body.getTilesPerRow()).toBe(4));
    await nextFrame();
    expect(second.scope.getFirstVisibleRowIndex()).toBe(100);
    expect(firstRowItems(second).map(b => b.id)).toContain(1400);
  });
});
