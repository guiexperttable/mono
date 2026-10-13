// TableApi in a real browser – the methods that are not covered by the topic specs (visible-row information,
// ensureRowIsVisible, filtering, find/update rows, sorting helpers, Excel export, actions, logging) and the
// TableScope entry points. The visibility stubs (setColumnVisible …) and the selection/clipboard API are not tested here.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import {
  ColumnDef,
  EleScope,
  FocusModel,
  SimpleDomService,
  TableFactory,
  TableOptions,
  TableScope,
  TrueFn,
  px100,
} from '@guiexpert/table';
import type { EventListenerIf, TableModelIf, TableOptionsIf } from '@guiexpert/table';
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
  storageKeys.splice(0).forEach(k => localStorage.removeItem(k + 'sortingState'));
});

type Row = { id: number; name: string; value: number };

function model(rows: Row[] = createRows(1000), extra: { footer?: boolean; hiddenValue?: boolean } = {}): TableModelIf {
  const columnDefs = [
    ColumnDef.create({ property: 'id', headerLabel: 'Id', width: px100, sortable: TrueFn }),
    ColumnDef.create({ property: 'name', headerLabel: 'Name', width: px100, sortable: TrueFn, editable: TrueFn }),
    ColumnDef.create({ property: 'value', headerLabel: 'Value', width: px100, sortable: TrueFn, isVisible: () => !extra.hiddenValue }),
  ];
  return TableFactory.createTableModel({ rows, columnDefs, footerData: extra.footer ? [['Sum', '', '42']] : undefined });
}

const names = (host: HTMLElement, count = 3) =>
  renderedRows(host).slice(0, count).map(r => r.querySelector('[data-col-index="1"]')!.textContent);

describe('visible rows', () => {

  it('first/last (full) visible row index and displayed row count', async () => {
    // body: 500 px host - 34 px header = 466 px → 13 full rows (442 px) + 24 px of row 13
    const { api } = mountTable(model());
    await nextFrame();
    expect(api.getFirstVisibleRowIndex()).toBe(0);
    expect(api.getFirstFullVisibleRowIndex()).toBe(0);
    expect(api.getLastVisibleRowIndex()).toBe(13);
    expect(api.getLastFullVisibleRowIndex()).toBe(12);
    expect(api.getDisplayedRowCount()).toBe(13);
  });

  it('a partly scrolled-out first row is visible but not full visible', async () => {
    const { api } = mountTable(model());
    await nextFrame();
    api.scrollToPixel(0, 10 * 34 + 20); // 20 px of row 10 hidden
    await nextFrame();
    expect(api.getFirstVisibleRowIndex()).toBe(10);
    expect(api.getFirstFullVisibleRowIndex()).toBe(11);
    expect(api.getLastVisibleRowIndex()).toBe(24); // 456 … 490 px: only 10 px visible
    expect(api.getLastFullVisibleRowIndex()).toBe(23);
  });

  it('ensureRowIsVisible() scrolls only if needed', async () => {
    const { api } = mountTable(model());
    await nextFrame();
    expect(api.ensureRowIsVisible(5)).toBe(false);
    expect(api.getFirstVisibleRowIndex()).toBe(0);

    expect(api.ensureRowIsVisible(100)).toBe(true); // below → becomes the last full visible row
    await nextFrame();
    expect(api.getLastFullVisibleRowIndex()).toBe(100);

    expect(api.ensureRowIsVisible(50)).toBe(true); // above → becomes the first visible row
    await nextFrame();
    expect(api.getFirstFullVisibleRowIndex()).toBe(50);
  });

  it('a table with fewer rows than the viewport: last visible row = last row', async () => {
    const { api } = mountTable(model(createRows(4)));
    await nextFrame();
    expect(api.getLastVisibleRowIndex()).toBe(3);
    expect(api.getDisplayedRowCount()).toBe(4);
  });

  it('an empty table renders no body rows', async () => {
    const { host, api } = mountTable(model([]));
    await nextFrame();
    expect(renderedRows(host)).toHaveLength(0);
    expect(api.getFirstVisibleRowIndex()).toBe(-1);
    expect(host.querySelectorAll('.ge-table-header-center .ge-table-col-div')).toHaveLength(3);
  });
});

describe('external filter (TableOptions.externalFilterFunction)', () => {

  it('filters on mount and after externalFilterChanged(); scrolls back to the top', async () => {
    const tableOptions: Partial<TableOptionsIf> = { externalFilterFunction: (row: Row) => row.id % 10 === 0 };
    const { host, api, scope } = mountTable(model(), { tableOptions });
    await nextFrame();
    expect(names(host)).toEqual(['Name 0', 'Name 10', 'Name 20']);
    expect(api.getBodyModel().getRowCount()).toBe(100);
    api.scrollToPixel(0, 34 * 50);
    await nextFrame();

    scope.tableOptions.externalFilterFunction = (row: Row) => row.name.endsWith('7');
    api.externalFilterChanged();
    await nextFrame();
    expect(scope.scrollViewport.scrollTop).toBe(0);
    expect(names(host)).toEqual(['Name 7', 'Name 17', 'Name 27']);
    expect(stylePx(host.querySelector<HTMLElement>('.ge-table-scroll-content-wrapper')!, 'height')).toBe(100 * 34 + 1);
  });

  it('keeps the header sorting and the last sort(fn) when filtering', async () => {
    const tableOptions: Partial<TableOptionsIf> = { externalFilterFunction: () => true };
    const { host, api, scope } = mountTable(model(), { tableOptions });
    await nextFrame();
    api.sortByColumn('id', 'desc');
    scope.tableOptions.externalFilterFunction = (row: Row) => row.id < 500;
    api.externalFilterChanged();
    expect(names(host)).toEqual(['Name 499', 'Name 498', 'Name 497']);

    api.sort((a: Row, b: Row) => (a.id % 7) - (b.id % 7) || a.id - b.id);
    scope.tableOptions.externalFilterFunction = (row: Row) => row.id < 300;
    api.externalFilterChanged();
    expect(names(host)).toEqual(['Name 0', 'Name 7', 'Name 14']);
  });

  it('findRowFromFilteredRowsByAllCriteria / findRowFromAllRowsByAllCriteria', async () => {
    const tableOptions: Partial<TableOptionsIf> = { externalFilterFunction: (row: Row) => row.id < 10 };
    const { api } = mountTable(model(), { tableOptions });
    await nextFrame();
    const sameName = (c: Partial<Row>, row: Row) => row.name === c.name;
    expect(api.findRowFromFilteredRowsByAllCriteria<Row>({ name: 'Name 5' }, sameName)).toMatchObject({ id: 5 });
    expect(api.findRowFromFilteredRowsByAllCriteria<Row>({ name: 'Name 50' }, sameName)).toBeUndefined();
    expect(api.findRowFromAllRowsByAllCriteria<Row>({ name: 'Name 50' }, sameName)).toMatchObject({ id: 50 });
  });
});

describe('row and sort helpers', () => {

  it('updateRows() copies the properties into the matching rows – visible after repaint()', async () => {
    const rows = createRows(10);
    const { host, api } = mountTable(model(rows));
    await nextFrame();
    api.updateRows<Row>([{ id: 1, name: 'One', value: 1 }], (a, b) => a.id === b.id);
    expect(rows[1]).toEqual({ id: 1, name: 'One', value: 1 });
    // NOTE: like setRows()/addRows() – no repaint
    expect(names(host)).toEqual(['Name 0', 'Name 1', 'Name 2']);
    api.repaint();
    expect(names(host)).toEqual(['Name 0', 'One', 'Name 2']);
  });

  it('sortByColumn(): column index or property, next state without sortState, false for an unknown column', async () => {
    const { host, api, scope } = mountTable(model(createRows(30)));
    await nextFrame();
    expect(api.sortByColumn(0)).toBe(true); // '' → asc
    expect(scope.tableModel.getColumnDef(0)!.sortState).toBe('asc');
    expect(api.sortByColumn(0)).toBe(true); // asc → desc
    expect(names(host)).toEqual(['Name 29', 'Name 28', 'Name 27']);
    expect(api.sortByColumn('nope')).toBe(false);
  });

  it('sort(fn) clears the header icons', async () => {
    const { host, api } = mountTable(model(createRows(30)));
    await nextFrame();
    api.sortByColumn('id', 'asc');
    expect(host.querySelector('.ge-header-sorted-asc')).not.toBeNull();
    api.sort((a: Row, b: Row) => b.value - a.value);
    expect(host.querySelector('.ge-table-sorted-icon-div')).toBeNull();
    expect(names(host)).toEqual(['Name 29', 'Name 28', 'Name 27']);
  });

  it('reSort() applies the stored sorting again (e.g. after setRows())', async () => {
    const key = 'ge-table-api-test-' + Math.random().toString(36).slice(2);
    storageKeys.push(key);
    const { host, api } = mountTable(model(createRows(30)), {
      tableOptions: { autoRestoreOptions: { autoRestoreSortingState: true, getStorageKeyFn: () => key } },
    });
    await nextFrame();
    api.sortByColumn('id', 'desc');
    api.setRows(createRows(20));
    api.repaintHard();
    expect(names(host)).toEqual(['Name 0', 'Name 1', 'Name 2']);
    api.reSort();
    expect(names(host)).toEqual(['Name 19', 'Name 18', 'Name 17']);
  });
});

describe('downloadExcel()', () => {

  it('passes the current view (header, filtered body, footer, visible columns) to the ExcelService', async () => {
    const { api, scope } = mountTable(model(createRows(5), { footer: true, hiddenValue: true }), {
      tableOptions: { externalFilterFunction: (row: Row) => row.id !== 2 },
    });
    await nextFrame();
    const download = vi.spyOn(scope.excelService, 'downloadExcel').mockResolvedValue(undefined);
    await expect(api.downloadExcel('orders.xlsx', 'Me')).resolves.toBeUndefined();
    expect(download).toHaveBeenCalledWith([
      ['Id', 'Name'],
      [0, 'Name 0'], [1, 'Name 1'], [3, 'Name 3'], [4, 'Name 4'],
      ['Sum', ''],
    ], 'orders.xlsx', 'Me');
  });
});

describe('actions, shortcuts, logging, accessors', () => {

  it('getShortcutActionMapping() contains the default mapping', async () => {
    const { api } = mountTable(model());
    await nextFrame();
    const mapping = api.getShortcutActionMapping();
    expect(mapping['f2']).toBe('START_EDITING');
    expect(Object.values(mapping)).toContain('NAVIGATE_DOWN');
  });

  it('triggerAction() runs an action like its shortcut', async () => {
    const fm = new FocusModel('cell');
    const { host, api, scope } = mountTable(model(), { tableOptions: { getFocusModel: () => fm } });
    await nextFrame();
    fm.setFocus(2, 1);
    api.triggerAction('NAVIGATE_DOWN');
    expect(fm.getFocus()).toEqual([3, 1]);
    expect(host.querySelectorAll('.ge-table-focus-border')).toHaveLength(4); // the focused cell gets 4 border divs
    api.triggerAction('START_EDITING');
    expect(scope.isEditing()).toBe(true);
    expect(getCellDiv(host, 'body', 'center', 3, 1).querySelector('input')!.value).toBe('Name 3');
  });

  it('setLoggingActive(true) logs the visible row indices of every render pass', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const { api } = mountTable(model());
    await nextFrame();
    expect(api.isLoggingActive()).toBe(false);
    api.setLoggingActive(true);
    expect(api.isLoggingActive()).toBe(true);
    api.repaint();
    expect(log).toHaveBeenCalledWith(expect.stringContaining('firstVisibleRowIndex <- 0'));
  });

  it('accessors return the scope, the models and the own selection model', async () => {
    const tableModel = model();
    const { api, scope } = mountTable(tableModel);
    await nextFrame();
    expect(api.getTableScope()).toBe(scope);
    expect(api.getTableModel()).toBe(tableModel);
    expect(api.getBodyModel()).toBe(tableModel.getBodyModel());
    expect(api.getSelectionModel()).toBeDefined();
    expect(tableModel.getTableScope()).toBe(scope);
  });
});

describe('TableScope entry points', () => {

  function host() {
    const div = document.createElement('div');
    div.style.cssText = 'position:relative; width:400px; height:300px;';
    document.body.appendChild(div);
    return div;
  }

  it('TableScope.create() with default options, listener and DOM service', async () => {
    const div = host();
    const scope = TableScope.create(div, model(createRows(10)));
    try {
      scope.firstInit();
      await nextFrame();
      expect(renderedRows(div).length).toBe(8); // (300 - 34) / 34 → 7.8 rows
      expect(div.classList).toContain('ge-table');
      expect(div.getAttribute('tabindex')).toBe('0');
    } finally {
      scope.destroy();
      div.remove();
    }
  });

  it('a missing event listener falls back to an EventAdapter', async () => {
    const div = host();
    const scope = new TableScope(div, model(createRows(10)), new SimpleDomService(), new TableOptions(), undefined as unknown as EventListenerIf);
    try {
      scope.firstInit();
      await nextFrame();
      await userEvent.click(getCellDiv(div, 'body', 'center', 1, 1));
      expect(scope.getApi().getFirstVisibleRowIndex()).toBe(0);
    } finally {
      scope.destroy();
      div.remove();
    }
  });

  it('a capped scroll height: the mouse wheel is scaled to content pixels', async () => {
    const { api, scope } = mountTable(model(createRows(2_000_000)));
    await nextFrame();
    expect(scope.isScrollHeightCapped()).toBe(true);
    expect(scope.scrollViewport.scrollHeight).toBeLessThanOrEqual(EleScope.maxScrollHeightInPx);
    const wheel = new WheelEvent('wheel', { deltaY: 340, deltaMode: 0, bubbles: true, cancelable: true });
    scope.scrollViewport.dispatchEvent(wheel);
    expect(wheel.defaultPrevented).toBe(true);
    await vi.waitFor(() => expect(api.getFirstVisibleRowIndex()).toBeGreaterThan(0));
    // 340 content px ≈ 10 rows (the scroll bar is ~8.5× coarser than the content)
    expect(api.getFirstVisibleRowIndex()).toBeGreaterThanOrEqual(9);
    expect(api.getFirstVisibleRowIndex()).toBeLessThanOrEqual(10);
    expect(scope.scrollViewport.scrollTop).toBeLessThan(340);

    const zoom = new WheelEvent('wheel', { deltaY: 340, ctrlKey: true, bubbles: true, cancelable: true });
    scope.scrollViewport.dispatchEvent(zoom);
    expect(zoom.defaultPrevented).toBe(false); // ctrl + wheel = browser zoom
  });

  it('a normal table leaves the mouse wheel to the browser', async () => {
    const { scope } = mountTable(model());
    await nextFrame();
    const wheel = new WheelEvent('wheel', { deltaY: 340, bubbles: true, cancelable: true });
    scope.scrollViewport.dispatchEvent(wheel);
    expect(wheel.defaultPrevented).toBe(false);
  });
});
