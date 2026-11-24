// Prompt 024: a REAL double click on a tile reports onCellActivated exactly once – also when the app repaints in its
// click handler (the cover grid demo marks the clicked tile: the first click replaces the element the second click
// would have hit). Real mouse input (Playwright page.mouse); `pnpm test:browser:webkit` runs this file in WebKit too.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CoverGridFactory, EventAdapter } from '@guiexpert/table';
import type { AreaIdent, AreaModelIf, CellRendererIf, GeCellActivateEvent, GeMouseEvent, TableApi } from '@guiexpert/table';
import { destroyAllTables, DIRECTIONS, getCellDiv, mountTable, nextFrame } from '../../../../test-utils/mount-table';
import { realMouse } from '../../../../test-utils/real-mouse';

afterEach(async () => {
  destroyAllTables();
  vi.restoreAllMocks();
  await realMouse.move(0, 0);
});

interface Book { id: number; title: string }

const renderer: CellRendererIf = {
  render(cellDiv: HTMLDivElement, _r: number, _c: number, _a: AreaIdent, _m: AreaModelIf, book: unknown) {
    cellDiv.textContent = book ? (book as Book).title : '';
    return undefined;
  },
};

async function mountGrid(direction: 'ltr' | 'rtl', repaintOnClick: boolean | 'sortOnSecondClick') {
  const books: Book[] = Array.from({ length: 10 }, (_, i) => ({ id: i, title: 'Book ' + i }));
  const model = CoverGridFactory.createCoverGridModel(books, renderer, 150, 200);
  const activated: GeCellActivateEvent[] = [];
  const clicked: GeMouseEvent[] = [];
  const listener = new EventAdapter();
  let api: TableApi | undefined;
  listener.onCellActivated = e => activated.push(e);
  listener.onMouseClicked = e => {
    clicked.push(e);
    if (repaintOnClick === 'sortOnSecondClick') {
      if (e.clickCount === 2) api?.sort((a: Book, b: Book) => b.id - a.id); // the tiles change their places
    } else if (repaintOnClick) {
      api?.repaint(); // the app marks the clicked tile
    }
  };
  const table = mountTable(model, {
    width: 620,
    eventListener: listener,
    tableOptions: { ...CoverGridFactory.createCoverGridDefaultOptions(200), autoRestoreOptions: undefined, direction },
  });
  api = table.api;
  await nextFrame();
  const tile = (index: number) => getCellDiv(table.host, 'body', 'center', Math.floor(index / 4), index % 4);
  return { ...table, books, activated, clicked, tile };
}

async function settle() {
  await new Promise(resolve => setTimeout(resolve, 30));
  await nextFrame();
}

async function doubleClick(element: Element) {
  await realMouse.moveTo(element);
  await realMouse.click(1);
  await realMouse.click(2);
  await settle();
}

describe.each(DIRECTIONS)('cover grid: a real double click opens a tile (%s)', direction => {

  it.each([false, true])('reports onCellActivated once and onMouseClicked with clickCount 1 and 2 (app repaints on click: %s)', async repaint => {
    const g = await mountGrid(direction, repaint);
    await doubleClick(g.tile(5));
    expect(g.activated).toHaveLength(1);
    expect(g.activated[0].source).toBe('mouse');
    expect(g.activated[0].value).toBe(g.books[5]);
    expect(g.clicked.map(e => e.clickCount)).toEqual([1, 2]);
    expect(g.scope.focusModel()?.getFocus()).toEqual([1, 1]);
  });

  it('a triple click opens once (app repaints on click)', async () => {
    const g = await mountGrid(direction, true);
    await realMouse.moveTo(g.tile(5));
    await realMouse.click(1);
    await realMouse.click(2);
    await realMouse.click(3);
    await settle();
    expect(g.activated).toHaveLength(1);
    expect(g.activated[0].value).toBe(g.books[5]);
  });

  it('the app sorts in the handler of the second click: the clicked item is opened, not the one now at its place', async () => {
    const g = await mountGrid(direction, 'sortOnSecondClick');
    await doubleClick(g.tile(1));
    expect(g.activated).toHaveLength(1);
    expect(g.activated[0].value).toBe(g.books[1]);
    expect([g.activated[0].rowIndex, g.activated[0].columnIndex]).toEqual([2, 0]);   // book 1 is item 8 now
  });

  it('a real double click on an empty tile reports nothing and does not move the focus', async () => {
    const g = await mountGrid(direction, false);
    await realMouse.moveTo(g.tile(2));
    await realMouse.click(1);
    await settle();
    await doubleClick(g.tile(11));
    expect(g.activated).toHaveLength(0);
    expect(g.scope.focusModel()?.getFocus()).toEqual([0, 2]);
  });

  it('a single real click reports nothing; the focus frame stays hidden (focusFrame "keyboard")', async () => {
    const g = await mountGrid(direction, false);
    await realMouse.moveTo(g.tile(6));
    await realMouse.click(1);
    await settle();
    expect(g.activated).toHaveLength(0);
    expect(g.scope.focusModel()?.getFocus()).toEqual([1, 2]);
    expect(g.host.querySelectorAll('.ge-table-focus-border')).toHaveLength(0);
  });
});
