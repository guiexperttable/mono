// Prompt 024: a cover grid is usable with the keyboard – the tiles are ONE sequence of items.
//
// Arrow keys wrap over the end of a row, empty tiles never get the focus, Enter and double click report
// onCellActivated, the focus follows the item (sort, filter, resize) and the focus frame is shown only while the grid
// is used with the keyboard (focusFrame: "keyboard", the default of a cover grid).
//
// Geometry: host 620 px wide, tiles 150 px → 4 per row (also with a classic 15 px scroll bar: 605 / 150 = 4.03);
// host 500 px high, tiles 200 px → 2.5 rows visible.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { CoverGridFactory, EventAdapter, FocusModel } from '@guiexpert/table';
import type {
  AreaIdent,
  AreaModelIf,
  CellRendererIf,
  CoverGridTableModel,
  GeCellActivateEvent,
  GeMouseEvent,
  TableOptionsIf,
} from '@guiexpert/table';
import { destroyAllTables, DIRECTIONS, getCellDiv, mountTable, nextFrame } from '../../../../test-utils/mount-table';
import { axeViolations } from '../../../../test-utils/axe';
import { keyInitOf, mockPlatform, PLATFORMS } from '../../../../test-utils/platform';

afterEach(() => {
  destroyAllTables();
  vi.restoreAllMocks();
});

interface Book {
  id: number;
  title: string;
}

const createBooks = (count: number): Book[] =>
  Array.from({ length: count }, (_, i) => ({ id: i, title: 'Book ' + String(i).padStart(3, '0') }));

const renderer: CellRendererIf = {
  render(cellDiv: HTMLDivElement, _r: number, _c: number, _a: AreaIdent, _m: AreaModelIf, book: unknown) {
    cellDiv.textContent = book ? (book as Book).title : '';
    return undefined;
  },
};

const PER_ROW = 4;

async function mountGrid(direction: 'ltr' | 'rtl', count = 10, tableOptions: Partial<TableOptionsIf> = {}) {
  const books = createBooks(count);
  const model: CoverGridTableModel<Book> = CoverGridFactory.createCoverGridModel(books, renderer, 150, 200);
  const activated: GeCellActivateEvent[] = [];
  const clicked: GeMouseEvent[] = [];
  const listener = new EventAdapter();
  listener.onCellActivated = e => activated.push(e);
  listener.onMouseClicked = e => clicked.push(e);
  const onFocusChanged = vi.spyOn(listener, 'onFocusChanged');
  const onSelectionChanged = vi.spyOn(listener, 'onSelectionChanged');
  const table = mountTable(model, {
    width: 620,
    eventListener: listener,
    tableOptions: {
      ...CoverGridFactory.createCoverGridDefaultOptions(200),
      autoRestoreOptions: undefined,   // nothing in localStorage between tests
      resizeEventDebounceDelay: 10,
      ariaLabel: 'Books',
      direction,
      ...tableOptions,
    },
  });
  await nextFrame();
  await new Promise(resolve => setTimeout(resolve, 40)); // the first ResizeObserver callback
  await nextFrame();
  expect(model.getColumnCount()).toBe(PER_ROW);
  const fm = table.scope.focusModel()!;
  /** index of the focused item (-1 = none) */
  const focusIndex = () => {
    const [r, c] = fm.getFocus();
    return r < 0 || c < 0 ? -1 : r * model.getColumnCount() + c;
  };
  const focusItem = (index: number) => fm.setFocus(Math.floor(index / PER_ROW), index % PER_ROW);
  const frames = () => table.host.querySelectorAll<HTMLElement>('.ge-table-focus-border');
  const tile = (index: number) => getCellDiv(table.host, 'body', 'center', Math.floor(index / PER_ROW), index % PER_ROW);
  table.host.focus();
  return { ...table, books, model, body: model.bodyModel, activated, clicked, onFocusChanged, onSelectionChanged, fm, focusIndex, focusItem, frames, tile };
}

/** A key press on the host as the browser reports it. */
function keydown(host: HTMLElement, key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const evt = new KeyboardEvent('keydown', { key, code: key.length === 1 ? 'Key' + key.toUpperCase() : key, bubbles: true, cancelable: true, ...init });
  host.dispatchEvent(evt);
  return evt;
}

describe.each(DIRECTIONS)('cover grid: keyboard (%s)', direction => {
  /** the arrow key that moves to the next / previous item (mirrored in right-to-left) */
  const NEXT = direction === 'rtl' ? '{ArrowLeft}' : '{ArrowRight}';
  const PREVIOUS = direction === 'rtl' ? '{ArrowRight}' : '{ArrowLeft}';

  describe('navigation', () => {
    it('Tab into the grid focuses the first item and shows the focus frame', async () => {
      const before = document.createElement('button');
      before.textContent = 'before';
      document.body.prepend(before);
      try {
        const g = await mountGrid(direction);
        expect(g.focusIndex()).toBe(-1);
        before.focus();
        await userEvent.tab();
        await nextFrame();
        expect(document.activeElement).toBe(g.host);
        expect(g.focusIndex()).toBe(0);
        expect(g.frames()).toHaveLength(4);
      } finally {
        before.remove();
      }
    });

    it('next at the end of a row moves to the first item of the next row, previous back', async () => {
      const g = await mountGrid(direction);
      g.focusItem(3);
      await userEvent.keyboard(NEXT);
      expect(g.focusIndex()).toBe(4);
      expect(g.fm.getFocus()).toEqual([1, 0]);
      await userEvent.keyboard(PREVIOUS);
      expect(g.focusIndex()).toBe(3);
      expect(g.fm.getFocus()).toEqual([0, 3]);
    });

    it('stays on the first and on the last item', async () => {
      const g = await mountGrid(direction);
      g.focusItem(0);
      await userEvent.keyboard(PREVIOUS + '{ArrowUp}');
      expect(g.focusIndex()).toBe(0);
      g.focusItem(9);
      await userEvent.keyboard(NEXT + '{ArrowDown}');
      expect(g.focusIndex()).toBe(9);
    });

    it('arrow down and up move one row', async () => {
      const g = await mountGrid(direction);
      g.focusItem(1);
      await userEvent.keyboard('{ArrowDown}');
      expect(g.focusIndex()).toBe(5);
      await userEvent.keyboard('{ArrowDown}');
      expect(g.focusIndex()).toBe(9);
      await userEvent.keyboard('{ArrowUp}{ArrowUp}');
      expect(g.focusIndex()).toBe(1);
    });

    it('arrow down without an item below goes to the last item of the incomplete last row', async () => {
      const g = await mountGrid(direction);   // [0 1 2 3] [4 5 6 7] [8 9 · ·]
      g.focusItem(7);
      await userEvent.keyboard('{ArrowDown}');
      expect(g.focusIndex()).toBe(9);
    });

    it('Home and End go to the first and the last item', async () => {
      const g = await mountGrid(direction);
      g.focusItem(5);
      await userEvent.keyboard('{End}');
      expect(g.focusIndex()).toBe(9);
      await userEvent.keyboard('{Home}');
      expect(g.focusIndex()).toBe(0);
    });

    it.each(PLATFORMS)('Ctrl+Home / Ctrl+End resp. ⌘↑ / ⌘↓ go to the first and the last item (%s)', async platform => {
      mockPlatform(platform);
      const g = await mountGrid(direction);
      g.focusItem(5);
      keydown(g.host, platform === 'mac' ? 'ArrowDown' : 'End', keyInitOf(platform));
      expect(g.focusIndex()).toBe(9);
      keydown(g.host, platform === 'mac' ? 'ArrowUp' : 'Home', keyInitOf(platform));
      expect(g.focusIndex()).toBe(0);
    });

    it('Page Down and Page Up move a page, same column', async () => {
      const g = await mountGrid(direction, 100);
      g.focusItem(1);
      const page = Math.max(1, g.api.getDisplayedRowCount() - 1);
      await userEvent.keyboard('{PageDown}');
      expect(g.focusIndex()).toBe(1 + page * PER_ROW);
      await userEvent.keyboard('{PageUp}');
      expect(g.focusIndex()).toBe(1);
      await userEvent.keyboard('{PageUp}');
      expect(g.focusIndex()).toBe(1);
    });

    it('never focuses an empty tile, whatever keys are pressed', async () => {
      const g = await mountGrid(direction);
      g.focusItem(6);
      const keys = ['{ArrowDown}', NEXT, '{End}', '{ArrowDown}', NEXT, NEXT, '{PageDown}', '{ArrowUp}', '{ArrowDown}',
        '{PageDown}', NEXT, '{Home}', '{PageDown}', '{PageDown}', NEXT, '{ArrowDown}'];
      for (const key of keys) {
        await userEvent.keyboard(key);
        expect(g.focusIndex()).toBeGreaterThanOrEqual(0);
        expect(g.focusIndex()).toBeLessThan(10);
        expect(g.body.getValueAt(...g.fm.getFocus())).toBeDefined();
      }
    });

    it('a click on an empty tile does not move the focus; a click on an item does', async () => {
      const g = await mountGrid(direction);
      await userEvent.click(g.tile(5));
      expect(g.focusIndex()).toBe(5);
      await userEvent.click(g.tile(10));   // empty
      await nextFrame();
      expect(g.focusIndex()).toBe(5);
      expect(g.clicked).toHaveLength(2);    // the click itself is still reported
    });

    it('fires onFocusChanged once per move and none at the edge', async () => {
      const g = await mountGrid(direction);
      g.focusItem(0);
      g.onFocusChanged.mockClear();
      await userEvent.keyboard(NEXT + '{ArrowDown}' + PREVIOUS);
      expect(g.focusIndex()).toBe(4);
      expect(g.onFocusChanged).toHaveBeenCalledTimes(3);
      await userEvent.keyboard(PREVIOUS + PREVIOUS + PREVIOUS + PREVIOUS + PREVIOUS);
      expect(g.focusIndex()).toBe(0);
      expect(g.onFocusChanged).toHaveBeenCalledTimes(7);
    });

    it('scrolls the focused item into view', async () => {
      const g = await mountGrid(direction, 100);
      g.focusItem(0);
      await userEvent.keyboard('{End}');
      await nextFrame();
      expect(g.focusIndex()).toBe(99);
      const cell = g.tile(99);
      expect(cell.textContent).toBe('Book 099');
      const hostRect = g.host.getBoundingClientRect();
      const rect = cell.getBoundingClientRect();
      expect(rect.top).toBeGreaterThanOrEqual(hostRect.top - 1);
      expect(rect.bottom).toBeLessThanOrEqual(hostRect.bottom + 1);
      await userEvent.keyboard('{Home}');
      await nextFrame();
      expect(g.tile(0).getBoundingClientRect().top).toBeGreaterThanOrEqual(hostRect.top - 1);
    });

    it('the keys are consumed (the page does not scroll)', async () => {
      const g = await mountGrid(direction);
      g.focusItem(9);
      expect(keydown(g.host, 'ArrowDown').defaultPrevented).toBe(true);   // at the edge, too
      expect(keydown(g.host, 'End').defaultPrevented).toBe(true);
      expect(keydown(g.host, 'PageDown').defaultPrevented).toBe(true);
    });
  });

  describe('open a tile: onCellActivated', () => {
    it('Enter on the focused item reports it once (source "keyboard", value = item)', async () => {
      const g = await mountGrid(direction);
      g.focusItem(6);
      await userEvent.keyboard('{Enter}');
      expect(g.activated).toHaveLength(1);
      const evt = g.activated[0];
      expect(evt.source).toBe('keyboard');
      expect(evt.value).toBe(g.books[6]);
      expect([evt.areaIdent, evt.rowIndex, evt.columnIndex]).toEqual(['body', 1, 2]);
      expect(evt.row).toBeUndefined();
      expect(evt.originalEvent).toBeInstanceOf(KeyboardEvent);
    });

    it('Enter without a focused item reports nothing', async () => {
      const g = await mountGrid(direction);
      await userEvent.keyboard('{Enter}');
      expect(g.activated).toHaveLength(0);
    });

    it('a double click reports it once (source "mouse") and onMouseClicked with clickCount 2', async () => {
      const g = await mountGrid(direction);
      await userEvent.dblClick(g.tile(5));
      await nextFrame();
      expect(g.activated).toHaveLength(1);
      expect(g.activated[0].source).toBe('mouse');
      expect(g.activated[0].value).toBe(g.books[5]);
      expect(g.activated[0].originalEvent).toBeInstanceOf(MouseEvent);
      expect(g.clicked.map(e => e.clickCount)).toEqual([1, 2]);
    });

    it('a double click on an empty tile reports nothing', async () => {
      const g = await mountGrid(direction);
      await userEvent.dblClick(g.tile(11));
      await nextFrame();
      expect(g.activated).toHaveLength(0);
    });

    it('triggerAction("ACTIVATE_CELL") reports the focused item with source "api"', async () => {
      const g = await mountGrid(direction);
      g.focusItem(2);
      g.api.triggerAction('ACTIVATE_CELL');
      expect(g.activated.map(e => [e.source, e.value, e.originalEvent])).toEqual([['api', g.books[2], undefined]]);
    });
  });

  describe('the focus follows the item', () => {
    it('after sort()', async () => {
      const g = await mountGrid(direction);
      g.focusItem(1);
      g.api.sort((a: Book, b: Book) => b.id - a.id);
      await nextFrame();
      expect(g.body.getValueAt(...g.fm.getFocus())).toBe(g.books[1]);
      expect(g.focusIndex()).toBe(8);
      expect(g.books.map(b => b.id)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);   // the array of the app keeps its order
    });

    it('after a filter that keeps the item', async () => {
      let odd = false;
      const g = await mountGrid(direction, 10, { externalFilterFunction: (b: Book) => !odd || b.id % 2 === 1 });
      g.focusItem(7);
      odd = true;
      g.api.externalFilterChanged();
      await nextFrame();
      expect(g.body.getValueAt(...g.fm.getFocus())).toBe(g.books[7]);
      expect(g.focusIndex()).toBe(3);
    });

    it('a filtered-out item: the tile at the same index gets the focus (the last item if there is none)', async () => {
      let max = 99;
      const g = await mountGrid(direction, 10, { externalFilterFunction: (b: Book) => b.id !== 2 && b.id <= max });
      g.focusItem(2);
      g.api.externalFilterChanged();   // book 2 is gone: [0 1 3 4 …]
      await nextFrame();
      expect(g.focusIndex()).toBe(2);
      expect(g.body.getValueAt(...g.fm.getFocus())).toBe(g.books[3]);
      g.focusItem(8);                  // book 9, the last one
      max = 4;                         // [0 1 3 4]
      g.api.externalFilterChanged();
      await nextFrame();
      expect(g.focusIndex()).toBe(3);
      expect(g.body.getValueAt(...g.fm.getFocus())).toBe(g.books[4]);
    });

    it('no items left: the focus is cleared', async () => {
      let none = false;
      const g = await mountGrid(direction, 10, { externalFilterFunction: () => !none });
      g.focusItem(4);
      none = true;
      g.api.externalFilterChanged();
      await nextFrame();
      expect(g.fm.getFocus()).toEqual([-1, -1]);
      await userEvent.keyboard('{ArrowDown}{Enter}');   // nothing to navigate to, no error
      expect(g.fm.getFocus()).toEqual([-1, -1]);
      expect(g.activated).toHaveLength(0);
    });

    it('after a resize with another number of tiles per row', async () => {
      const g = await mountGrid(direction);
      g.focusItem(6);                  // row 1, column 2
      g.host.style.width = '320px';    // 2 per row
      await vi.waitFor(() => expect(g.model.getColumnCount()).toBe(2));
      await nextFrame();
      expect(g.body.getValueAt(...g.fm.getFocus())).toBe(g.books[6]);
      expect(g.fm.getFocus()).toEqual([3, 0]);
    });

    it('after other tile sizes (coverWidth + repaintHard)', async () => {
      const g = await mountGrid(direction);
      g.focusItem(7);
      g.body.coverWidth = 300;         // 2 per row
      g.api.repaintHard();
      await nextFrame();
      expect(g.model.getColumnCount()).toBe(2);
      expect(g.body.getValueAt(...g.fm.getFocus())).toBe(g.books[7]);
    });

    it('after new items that still contain the item', async () => {
      const g = await mountGrid(direction);
      g.focusItem(3);
      const reversed = g.books.slice().reverse();
      g.body.items = reversed;
      g.body.filteredItems = reversed;
      g.api.repaintHard();
      await nextFrame();
      expect(g.body.getValueAt(...g.fm.getFocus())).toBe(g.books[3]);
      expect(g.focusIndex()).toBe(6);
    });

    it('an item that had the focus before the grid was built (own focus model)', async () => {
      const fm = new FocusModel('cell');
      fm.setFocus(1, 1);               // book 5 with 4 per row
      const g = await mountGrid(direction, 10, { getFocusModel: () => fm });
      g.api.sort((a: Book, b: Book) => b.id - a.id);
      await nextFrame();
      expect(g.body.getValueAt(...fm.getFocus())).toBe(g.books[5]);
    });

    it('scrolling does not search the items', async () => {
      const g = await mountGrid(direction, 2000);
      g.focusItem(5);
      await nextFrame();
      const indexOfTile = vi.spyOn(g.body, 'indexOfTile');
      const viewport = g.host.querySelector<HTMLElement>('.ge-table-scroll-viewport')!;
      for (const top of [400, 1200, 5000, 0]) {
        viewport.scrollTop = top;
        await nextFrame();
      }
      expect(indexOfTile).not.toHaveBeenCalled();
      expect(g.focusIndex()).toBe(5);
    });
  });

  describe('focus frame', () => {
    it('"keyboard" (cover grid default): shown after a key, hidden after a mouse press', async () => {
      const g = await mountGrid(direction);
      await userEvent.click(g.tile(1));
      await nextFrame();
      expect(g.focusIndex()).toBe(1);
      expect(g.frames()).toHaveLength(0);
      await userEvent.keyboard(NEXT);
      await nextFrame();
      expect(g.focusIndex()).toBe(2);
      expect(g.frames()).toHaveLength(4);
      await userEvent.click(g.tile(2));   // the focused tile itself: the focus does not move, the frame goes
      await nextFrame();
      await nextFrame();
      expect(g.focusIndex()).toBe(2);
      expect(g.frames()).toHaveLength(0);
    });

    it('the focused cell is the active descendant also without a frame', async () => {
      const g = await mountGrid(direction);
      await userEvent.click(g.tile(5));
      await nextFrame();
      await nextFrame();
      expect(g.frames()).toHaveLength(0);
      const id = g.host.getAttribute('aria-activedescendant');
      expect(id).toBeTruthy();
      expect(g.host.querySelector('#' + id)?.textContent).toBe('Book 005');
    });

    it('"never": no frame after keys', async () => {
      const g = await mountGrid(direction, 10, { focusFrame: 'never' });
      g.focusItem(0);
      await userEvent.keyboard(NEXT);
      await nextFrame();
      expect(g.focusIndex()).toBe(1);
      expect(g.frames()).toHaveLength(0);
    });

    it('"always": the frame is there after a click, too', async () => {
      const g = await mountGrid(direction, 10, { focusFrame: 'always' });
      await userEvent.click(g.tile(1));
      await nextFrame();
      await nextFrame();
      expect(g.frames()).toHaveLength(4);
    });

    it('the frame lies inside the tile (not cut off in the last column)', async () => {
      const g = await mountGrid(direction);
      g.focusItem(2);
      await userEvent.keyboard(NEXT);   // item 3: the last column
      await nextFrame();
      const cell = g.tile(3).getBoundingClientRect();
      const frames = Array.from(g.frames(), f => f.getBoundingClientRect());
      expect(frames).toHaveLength(4);
      for (const f of frames) {
        expect(f.left).toBeGreaterThanOrEqual(cell.left - 0.5);
        expect(f.right).toBeLessThanOrEqual(cell.right + 0.5);
        expect(f.top).toBeGreaterThanOrEqual(cell.top - 0.5);
        expect(f.bottom).toBeLessThanOrEqual(cell.bottom + 0.5);
      }
    });
  });

  describe('other shortcuts do nothing wrong', () => {
    it.each(PLATFORMS)('Space, Ctrl/⌘+A, F2 and Ctrl/⌘+C: no selection, no editor, nothing copied (%s)', async platform => {
      mockPlatform(platform);
      const g = await mountGrid(direction);
      const copyContent = vi.spyOn(g.scope.copyService, 'copyContent').mockResolvedValue(undefined as never);
      g.focusItem(1);
      keydown(g.host, ' ', { code: 'Space' });
      keydown(g.host, 'a', keyInitOf(platform));
      keydown(g.host, 'F2');
      keydown(g.host, 'c', keyInitOf(platform));
      await nextFrame();
      await nextFrame();
      expect(g.onSelectionChanged).not.toHaveBeenCalled();
      expect(g.scope.selectionModel()?.hasSelection()).toBe(false);
      expect(g.host.querySelector('.ge-selected-background, input, textarea:not(.ge-table-clipboard-proxy)')).toBeNull();
      expect(g.scope.isEditing()).toBe(false);
      expect(copyContent).not.toHaveBeenCalled();
      expect(g.focusIndex()).toBe(1);
    });
  });

  describe('geometry (model fixes)', () => {
    it('full rows: no empty extra row, the scroll height is rows × tile height', async () => {
      const g = await mountGrid(direction, 8);   // 2 full rows
      expect(g.body.getRowCount()).toBe(2);
      expect(g.model.getContentHeightInPixel()).toBe(400);
      expect(g.host.getAttribute('aria-rowcount')).toBe('2');
      expect(g.host.querySelectorAll('.ge-table-body-center .ge-table-row-div')).toHaveLength(2);
    });

    it('a grid narrower than one tile has one column and as many rows as items', async () => {
      const books = createBooks(5);
      const model = CoverGridFactory.createCoverGridModel(books, renderer, 150, 200);
      const { host } = mountTable(model, {
        width: 100,
        tableOptions: { ...CoverGridFactory.createCoverGridDefaultOptions(200), autoRestoreOptions: undefined, direction },
      });
      await nextFrame();
      expect(model.getColumnCount()).toBe(1);
      expect(model.bodyModel.getRowCount()).toBe(5);
      expect(model.getContentHeightInPixel()).toBe(1000);
      expect(host.querySelectorAll('.ge-table-body-center .ge-table-col-div').length).toBeLessThanOrEqual(4);
    });
  });

  describe('accessibility', () => {
    it('no axe violations with a focused tile', async () => {
      const g = await mountGrid(direction);
      g.focusItem(0);
      await userEvent.keyboard(NEXT);
      await nextFrame();
      expect(g.host.getAttribute('role')).toBe('grid');
      expect(g.host.getAttribute('aria-colcount')).toBe(String(PER_ROW));
      expect(g.host.getAttribute('aria-rowcount')).toBe('3');
      expect(g.tile(1).getAttribute('role')).toBe('gridcell');
      expect(await axeViolations(g.host)).toEqual([]);
    });
  });
});
