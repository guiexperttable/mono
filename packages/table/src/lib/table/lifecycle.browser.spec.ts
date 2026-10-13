// Lifecycle and data updates in a real browser: autoRestoreOptions (localStorage), destroy(), ResizeObserver,
// repaint/repaintHard/updateCells and the row methods of the TableApi (setRows, addRows, addRowsAt, removeRows).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import {
  ColumnDef,
  EventAdapter,
  FocusModel,
  TableFactory,
  TreeFactory,
  TrueFn,
  px100,
} from '@guiexpert/table';
import type { AutoRestoreOptionsIf, TableModelIf, TableOptionsIf } from '@guiexpert/table';
import {
  createRows,
  destroyAllTables,
  getCellDiv,
  mountTable,
  nextFrame,
  renderedRows,
  stylePx,
} from '../../../test-utils/mount-table';

const storageKeys: string[] = [];

afterEach(() => {
  destroyAllTables();
  vi.restoreAllMocks();
  for (const key of storageKeys.splice(0)) {
    for (const suffix of ['sortingState', 'scrollState', 'collapsedExpandedState']) localStorage.removeItem(key + suffix);
  }
});

/** A unique storage key for this test (removed from localStorage afterwards). */
function storageKey(): string {
  const key = 'ge-table-test-' + Math.random().toString(36).slice(2);
  storageKeys.push(key);
  return key;
}

type Row = { id: number; name: string; value: number };

function objectModel(rows: Row[] = createRows(1000)): TableModelIf {
  const columnDefs = ['id', 'name', 'value'].map(p => ColumnDef.create({ property: p, headerLabel: p.toUpperCase(), width: px100, sortable: TrueFn }));
  return TableFactory.createTableModel({ rows, columnDefs });
}

const firstNames = (host: HTMLElement, count = 3) =>
  renderedRows(host).slice(0, count).map(r => r.querySelector('[data-col-index="1"]')!.textContent);

describe('autoRestoreOptions (localStorage)', () => {

  const restoreOptions = (key: string, opts: Partial<AutoRestoreOptionsIf<Row>>): Partial<TableOptionsIf> => ({
    autoRestoreOptions: { autoRestoreSortingState: false, getStorageKeyFn: () => key, ...opts },
  });

  it('restores the sorting (rows and header icon) after re-mounting', async () => {
    const key = storageKey();
    const tableOptions = restoreOptions(key, { autoRestoreSortingState: true });
    const first = mountTable(objectModel(), { tableOptions });
    await nextFrame();
    first.api.sortByColumn('value', 'desc');
    expect(JSON.parse(localStorage.getItem(key + 'sortingState')!)).toEqual([{ columnIndex: 2, sortState: 'desc' }]);
    first.destroy();

    const second = mountTable(objectModel(), { tableOptions });
    await nextFrame();
    expect(renderedRows(second.host)[0].querySelector('[data-col-index="2"]')!.textContent).toBe(String(999 * 3));
    expect(getCellDiv(second.host, 'header', 'center', 0, 2).querySelector('.ge-header-sorted-desc')!.textContent).toBe('↓');
  });

  it('restores the scroll position after re-mounting', async () => {
    const key = storageKey();
    const tableOptions = restoreOptions(key, { autoRestoreScrollPosition: true });
    const first = mountTable(objectModel(), { tableOptions });
    await nextFrame();
    first.api.scrollToPixel(0, 200 * 34);
    // saved 500 ms after the last render pass
    await vi.waitFor(() => expect(localStorage.getItem(key + 'scrollState')).toBe(JSON.stringify([0, 200 * 34])), { timeout: 2_000 });
    first.destroy();

    const second = mountTable(objectModel(), { tableOptions });
    await vi.waitFor(() => expect(second.api.getFirstVisibleRowIndex()).toBe(200));
    expect(renderedRows(second.host)[0].getAttribute('data-row-index')).toBe('200');
  });

  it('stores nothing without getStorageKeyFn', async () => {
    const before = localStorage.length;
    const { api } = mountTable(objectModel(), { tableOptions: { autoRestoreOptions: { autoRestoreSortingState: true } } });
    await nextFrame();
    api.sortByColumn('name', 'asc');
    expect(localStorage.length).toBe(before);
  });

  describe('collapsed/expanded state of a tree', () => {

    interface Node { id: number; name: string; children?: Node[] }

    const treeModel = () => {
      const data: Node[] = [
        { id: 1, name: 'A', children: [{ id: 11, name: 'A1' }, { id: 12, name: 'A2' }] },
        { id: 2, name: 'B', children: [{ id: 21, name: 'B1' }] },
      ];
      const columnDefs = [ColumnDef.create({ property: 'name', width: px100 }), ColumnDef.create({ property: 'id', width: px100 })];
      return TableFactory.createTableModel({ rows: TreeFactory.buildTreeRows(data), columnDefs });
    };
    const visibleNames = (host: HTMLElement) => renderedRows(host).map(r => r.querySelector('[data-col-index="0"]')!.textContent!.replace(/^>/, ''));

    it('renders tree arrows and collapses a node by a click on its arrow', async () => {
      const { host } = mountTable(treeModel());
      await nextFrame();
      expect(visibleNames(host)).toEqual(['A', 'A1', 'A2', 'B', 'B1']);
      const arrowA = getCellDiv(host, 'body', 'center', 0, 0).querySelector<HTMLElement>('.ge-table-tree-arrow-div')!;
      expect(arrowA.classList).toContain('gt-table-tree-arrow-expanded');
      expect(getCellDiv(host, 'body', 'center', 1, 0).querySelector('.ge-table-tree-arrow-div')!.classList).toContain('gt-table-tree-arrow-hidden');
      await userEvent.click(arrowA);
      await nextFrame();
      expect(visibleNames(host)).toEqual(['A', 'B', 'B1']);
      expect(getCellDiv(host, 'body', 'center', 0, 0).querySelector('.ge-table-tree-arrow-div')!.classList).toContain('ge-table-tree-arrow-collapsed');
    });

    it('restores a collapsed node after re-mounting', async () => {
      const key = storageKey();
      const tableOptions = restoreOptions(key, { autoRestoreCollapsedExpandedState: true, getRowId: (row: any) => row.id });
      const first = mountTable(treeModel(), { tableOptions });
      await nextFrame();
      await userEvent.click(getCellDiv(first.host, 'body', 'center', 0, 0).querySelector('.ge-table-tree-arrow-div')!);
      expect(localStorage.getItem(key + 'collapsedExpandedState')).toContain('"rowIds":[1]');
      first.destroy();

      const second = mountTable(treeModel(), { tableOptions });
      await nextFrame();
      expect(visibleNames(second.host)).toEqual(['A', 'B', 'B1']);
    });
  });
});

describe('scrollToIndex() (vertical)', () => {

  it('scrolls the row to the top of the body', async () => {
    const { host, api } = mountTable(objectModel());
    await nextFrame();
    api.scrollToIndex(0, 300);
    await nextFrame();
    expect(api.getFirstVisibleRowIndex()).toBe(300);
    expect(stylePx(renderedRows(host)[0], 'top')).toBe(0);
  });

  // BUG: the scroll content is 1 px higher than the rows (ele-scope.ts:314, "we want to see the last horizontal
  // border"), but render-scope.ts:284 maps scrollTop with the scroll bar range onto the content range – the further
  // down, the larger the error: from the middle of a 1000-row table on, scrollToIndex(0, n) leaves 1 px of row n-1
  // visible and getFirstVisibleRowIndex() returns n-1.
  it.fails('scrollToIndex(0, n) makes row n the first visible row in the lower half of the table', async () => {
    const { host, api } = mountTable(objectModel());
    await nextFrame();
    api.scrollToIndex(0, 700);
    await nextFrame();
    expect(api.getFirstVisibleRowIndex()).toBe(700);
    expect(renderedRows(host)[0].getAttribute('data-row-index')).toBe('700');
  });
});

describe('destroy()', () => {

  it('empties the host and stops reacting to scroll, window resize and host resize', async () => {
    const { host, scope, api } = mountTable(objectModel(), { tableOptions: { resizeEventDebounceDelay: 10 } });
    await nextFrame();
    const viewport = scope.scrollViewport;
    const adjustAfterScrolling = vi.spyOn(scope, 'adjustAfterScrolling');
    const adjustContainers = vi.spyOn(scope, 'adjustContainersAndRows');
    const recalc = vi.spyOn(scope, 'recalcColumnWidths');
    api.destroy();
    expect(host.childElementCount).toBe(0);
    expect(scope.isDestroyed()).toBe(true);

    viewport.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('resize'));
    host.style.width = '600px';
    for (let i = 0; i < 3; i++) await nextFrame(); // ≈ 6 frames: resize observation + debounce (10 ms) are long over
    expect(adjustAfterScrolling).not.toHaveBeenCalled();
    expect(adjustContainers).not.toHaveBeenCalled();
    expect(recalc).not.toHaveBeenCalled();
  });

  it('removes the mouse and keyboard listeners and leaves the focus model', async () => {
    const listener = new EventAdapter();
    const clicked = vi.spyOn(listener, 'onMouseClicked');
    const focusChanged = vi.spyOn(listener, 'onFocusChanged');
    const fm = new FocusModel('cell');
    const { host, scope, api } = mountTable(objectModel(), { eventListener: listener, tableOptions: { getFocusModel: () => fm } });
    await nextFrame();
    const onAction = vi.spyOn(scope, 'onActionTriggered');
    api.destroy();
    host.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    host.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fm.setFocus(1, 1);
    expect(clicked).not.toHaveBeenCalled();
    expect(onAction).not.toHaveBeenCalled();
    expect(focusChanged).not.toHaveBeenCalled();
  });

  it('can be called twice', async () => {
    const { api, scope } = mountTable(objectModel());
    await nextFrame();
    api.destroy();
    expect(() => api.destroy()).not.toThrow();
    expect(scope.isDestroyed()).toBe(true);
  });
});

describe('ResizeObserver (host size)', () => {

  it('a taller host renders more rows', async () => {
    const { host, scope } = mountTable(objectModel(), { tableOptions: { resizeEventDebounceDelay: 10 } });
    await nextFrame();
    const before = renderedRows(host).length;
    const recalc = vi.spyOn(scope, 'recalcColumnWidths');
    host.style.height = '1000px';
    await vi.waitFor(() => expect(recalc).toHaveBeenCalled());
    expect(renderedRows(host).length).toBeGreaterThan(before + 10);
    expect(stylePx(host.querySelector<HTMLElement>('.ge-table-scroll-viewport')!, 'height')).toBe(1000 - 34);
  });

  it('several resizes within resizeEventDebounceDelay are handled once (with the last size)', async () => {
    const { host, scope } = mountTable(objectModel(), { tableOptions: { resizeEventDebounceDelay: 250 } });
    const recalc = vi.spyOn(scope, 'recalcColumnWidths');
    await vi.waitFor(() => expect(recalc).toHaveBeenCalledTimes(1)); // the initial observation
    recalc.mockClear();
    for (const width of [700, 650, 600]) {
      host.style.width = width + 'px';
      await nextFrame();
    }
    await vi.waitFor(() => expect(recalc).toHaveBeenLastCalledWith(600));
    expect(recalc).toHaveBeenCalledTimes(1);
  });
});

describe('repaint(), repaintHard(), updateCells()', () => {

  it('a changed row object becomes visible with repaint()', async () => {
    const rows = createRows(100);
    const { host, api } = mountTable(objectModel(rows));
    await nextFrame();
    rows[1].name = 'Changed';
    expect(firstNames(host)).toEqual(['Name 0', 'Name 1', 'Name 2']);
    api.repaint();
    expect(firstNames(host)).toEqual(['Name 0', 'Changed', 'Name 2']);
  });

  it('updateCells() writes the model and re-renders only the given cells', async () => {
    const rows = createRows(100);
    const { host, api } = mountTable(objectModel(rows));
    await nextFrame();
    const untouched = getCellDiv(host, 'body', 'center', 2, 1);
    const updated = getCellDiv(host, 'body', 'center', 1, 1);
    api.updateCells([{ area: 'body', rowIndex: 1, columnIndex: 1, value: 'Live', cssClasses: { 'ge-flash': true } }]);
    expect(rows[1].name).toBe('Live');
    expect(getCellDiv(host, 'body', 'center', 1, 1)).toBe(updated); // same element, new content
    expect(updated.textContent).toBe('Live');
    expect(updated.classList).toContain('ge-flash');
    expect(getCellDiv(host, 'body', 'center', 2, 1)).toBe(untouched);

    api.updateCells([{ area: 'body', rowIndex: 1, columnIndex: 1, value: 'Again', cssClasses: { 'ge-flash': false } }]);
    expect(updated.classList).not.toContain('ge-flash');
  });

  it('updateCells(…, true) repaints the whole table', async () => {
    const rows = createRows(100);
    const { host, api } = mountTable(objectModel(rows));
    await nextFrame();
    const old = getCellDiv(host, 'body', 'center', 2, 1);
    api.updateCells([{ area: 'body', rowIndex: 1, columnIndex: 1, value: 'All', cssClasses: {} }], true);
    expect(getCellDiv(host, 'body', 'center', 2, 1)).not.toBe(old);
    expect(getCellDiv(host, 'body', 'center', 1, 1).textContent).toBe('All');
  });

  it('updateCells() for a row that is not rendered only changes the model', async () => {
    const rows = createRows(1000);
    const { api } = mountTable(objectModel(rows));
    await nextFrame();
    expect(() => api.updateCells([{ area: 'body', rowIndex: 900, columnIndex: 1, value: 'Far', cssClasses: {} }])).not.toThrow();
    expect(rows[900].name).toBe('Far');
  });

  it('repaintHard() adapts the scroll height to a changed row count', async () => {
    const rows = createRows(100);
    const { host, api } = mountTable(objectModel(rows));
    await nextFrame();
    const wrapper = host.querySelector<HTMLElement>('.ge-table-scroll-content-wrapper')!;
    expect(stylePx(wrapper, 'height')).toBe(100 * 34 + 1);
    api.addRows(createRows(50));
    api.repaint();
    expect(stylePx(wrapper, 'height')).toBe(100 * 34 + 1);
    api.repaintHard();
    expect(stylePx(wrapper, 'height')).toBe(150 * 34 + 1);
  });
});

describe('setRows / addRows / addRowsAt / removeRows (TableApi)', () => {

  it('setRows() replaces the rows – visible after repaintHard()', async () => {
    const { host, api } = mountTable(objectModel(createRows(100)));
    await nextFrame();
    const newRows = createRows(3).map(r => ({ ...r, name: 'New ' + r.id }));
    api.setRows(newRows);
    expect(api.getBodyModel().getRowCount()).toBe(3);
    // NOTE: no repaint – the table still shows the old rows (TODO.md: users call repaintHard() themselves)
    expect(renderedRows(host).length).toBeGreaterThan(3);
    expect(firstNames(host)).toEqual(['Name 0', 'Name 1', 'Name 2']);
    api.repaintHard();
    expect(renderedRows(host)).toHaveLength(3);
    expect(firstNames(host)).toEqual(['New 0', 'New 1', 'New 2']);
  });

  it('setRows() drops the external filter until externalFilterChanged()', async () => {
    const { host, api } = mountTable(objectModel(createRows(100)), {
      tableOptions: { externalFilterFunction: (row: Row) => row.id % 2 === 0 },
    });
    await nextFrame();
    expect(api.getBodyModel().getRowCount()).toBe(50);
    api.setRows(createRows(10));
    // NOTE: setRows() resets the filtered rows to all rows (TODO.md) – the filter only applies again after
    // externalFilterChanged().
    expect(api.getBodyModel().getRowCount()).toBe(10);
    api.externalFilterChanged();
    expect(api.getBodyModel().getRowCount()).toBe(5);
    expect(firstNames(host)).toEqual(['Name 0', 'Name 2', 'Name 4']);
  });

  it('setRows() drops the sorting – the header icon stays', async () => {
    const { host, api } = mountTable(objectModel(createRows(100)));
    await nextFrame();
    api.sortByColumn('id', 'desc');
    expect(firstNames(host)).toEqual(['Name 99', 'Name 98', 'Name 97']);
    api.setRows(createRows(100));
    api.repaintHard();
    // NOTE: the new rows are shown in their given order while the header still says "descending" (TODO.md);
    // api.reSort() is a no-op without autoRestoreOptions (it re-applies the STORED sort items only).
    expect(firstNames(host)).toEqual(['Name 0', 'Name 1', 'Name 2']);
    expect(getCellDiv(host, 'header', 'center', 0, 0).querySelector('.ge-header-sorted-desc')).not.toBeNull();
  });

  it('addRows() appends, addRowsAt() inserts, removeRows() removes – each without repaint', async () => {
    const rows = createRows(5);
    const { host, api } = mountTable(objectModel(rows));
    await nextFrame();
    api.addRows([{ id: 100, name: 'Last', value: 0 }]);
    api.addRowsAt([{ id: 101, name: 'Second', value: 0 }], 1);
    api.removeRows([{ id: 0 } as Row], (a, b) => a.id === b.id);
    expect(renderedRows(host)).toHaveLength(5); // nothing repainted yet
    api.repaintHard();
    expect(renderedRows(host).map(r => r.querySelector('[data-col-index="1"]')!.textContent))
      .toEqual(['Second', 'Name 1', 'Name 2', 'Name 3', 'Name 4', 'Last']);
    expect(api.findRows([{ id: 101 } as Row], (a, b) => a.id === b.id)).toEqual([{ id: 101, name: 'Second', value: 0 }]);
  });

  it('only works for object-array bodies – other body models warn and stay unchanged', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const model = TableFactory.createTableModel({ bodyData: [['a', 'b'], ['c', 'd']], columnSizes: [100, 100] });
    const { api } = mountTable(model);
    await nextFrame();
    api.setRows([['x', 'y']]);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(api.getBodyModel().getRowCount()).toBe(2);
  });
});
