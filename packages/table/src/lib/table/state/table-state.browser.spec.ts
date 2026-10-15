// Table state (prompts/003): getState / applyState / resetState, initialState, onStateChanged and the
// autoRestoreOptions with a real rebuild of the table (reference cases S1–S13 of prompts/003-zustand-speichern.md).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import {
  AreaModel,
  AreaModelCellGroups,
  AreaModelObjectArrayWithColumndefs,
  AutoRestoreOptions,
  CellRange,
  CellgroupFactory,
  CheckboxColumnDef,
  ColumnDef,
  EventAdapter,
  GeStateChangeEvent,
  ALL_TABLE_STATE_PARTS,
  SelectionModel,
  Size,
  TableFactory,
  TreeFactory,
  TrueFn,
  px100,
} from '@guiexpert/table';
import type {
  AutoRestoreOptionsIf,
  CellGroupIf,
  ColumnDefIf,
  StateStorageIf,
  TableModelIf,
  TableOptionsIf,
  TableStateIf,
} from '@guiexpert/table';
import { destroyAllTables, getCellDiv, mountTable, nextFrame, renderedRows } from '../../../../test-utils/mount-table';
import { memoryStorage, throwingStorage } from '../../../../test-utils/memory-storage';

type Order = { id: number; customer: string; city: string; total: number };

/** total is not ordered like id (sorting the wrong column gives another first row). */
const orders = (count = 200): Order[] =>
  Array.from({ length: count }, (_, i) => ({ id: i, customer: 'C' + i, city: 'City ' + (i % 7), total: (i * 7919) % 1000 }));

/** the highest total of orders(200) – the first row when sorted by total descending */
const MAX_TOTAL = String(Math.max(...orders().map(o => o.total)));

const columns = (): ColumnDefIf[] => ['id', 'customer', 'city', 'total'].map(p =>
  ColumnDef.create({ property: p, headerLabel: p.toUpperCase(), width: px100, sortable: TrueFn }));

function orderModel(rows: Order[] = orders(), opts: { fixedLeft?: number; fixedRight?: number; checkbox?: boolean } = {}): TableModelIf {
  const columnDefs = columns();
  if (opts.checkbox) columnDefs.unshift(new CheckboxColumnDef());
  return TableFactory.createTableModel({
    rows, columnDefs, fixedLeftColumnCount: opts.fixedLeft ?? 0, fixedRightColumnCount: opts.fixedRight ?? 0,
  });
}

let storage: Storage;

beforeEach(() => {
  storage = memoryStorage();
});

afterEach(() => {
  destroyAllTables();
  vi.restoreAllMocks();
});

const KEY = 'orders';

function restore(opts: Partial<AutoRestoreOptionsIf<Order>>, more: Partial<TableOptionsIf> = {}): Partial<TableOptionsIf> {
  return {
    autoRestoreOptions: { ...new AutoRestoreOptions<Order>(), getStorageKeyFn: () => KEY, storage, ...opts },
    ...more,
  };
}

const stored = (): TableStateIf => JSON.parse(storage.getItem(KEY + 'tableState') ?? 'null');
const properties = (model: TableModelIf) => model.getColumnDefs()!.map(cd => cd.property);
const firstCell = (host: HTMLElement, col: number) =>
  renderedRows(host)[0].querySelector(`[data-col-index="${col}"]`)!.textContent;

describe('getState()', () => {

  it('returns columns, sort, scroll – no tree, checked, selection or groups for a plain table', async () => {
    const { api } = mountTable(orderModel());
    await nextFrame();
    expect(api.getState()).toEqual({
      version: 1,
      columns: [
        { property: 'id', visible: true }, { property: 'customer', visible: true },
        { property: 'city', visible: true }, { property: 'total', visible: true },
      ],
      sort: [],
      scroll: { left: 0, top: 0, firstRowId: 0 },
    });
  });

  it('only the requested parts', async () => {
    const { api } = mountTable(orderModel());
    await nextFrame();
    expect(api.getState(['sort'])).toEqual({ version: 1, sort: [] });
  });

  it('column order, changed widths and hidden columns by property (S1–S3)', async () => {
    const { api, scope } = mountTable(orderModel());
    await nextFrame();
    api.setColumnWidth(3, 240);
    scope.tableModel.changeColumnOrder(2, 0);                // city first (like a header drag)
    api.setColumnVisible('customer', false);
    expect(api.getState(['columns']).columns).toEqual([
      { property: 'city', visible: true }, { property: 'id', visible: true },
      { property: 'customer', visible: false }, { property: 'total', width: 240, visible: true },
    ]);
  });

  it('sort by property; the last sorted column is the primary key', async () => {
    const { api } = mountTable(orderModel());
    await nextFrame();
    api.sortByColumn('total', 'desc');
    expect(api.getState(['sort']).sort).toEqual([{ property: 'total', sortState: 'desc' }]);
    api.sort((a: Order, b: Order) => a.id - b.id);           // an own comparator can't be stored
    expect(api.getState(['sort']).sort).toEqual([]);
  });

  it('holds no cell values', async () => {
    const { api } = mountTable(orderModel(), { tableOptions: { getSelectionModel: () => new SelectionModel('row', 'multi') } });
    await nextFrame();
    api.getSelectionModel()!.addSelection(CellRange.singleRow(3));
    expect(JSON.stringify(api.getState())).not.toContain('City');
  });
});

describe('autoRestoreOptions: rebuild with the same key', () => {

  it('S1–S3: width, order and visibility of the columns', async () => {
    const tableOptions = restore({ autoRestoreColumnLayout: true });
    const first = mountTable(orderModel(), { tableOptions });
    await nextFrame();
    first.api.setColumnWidth(3, 240);
    first.scope.tableModel.changeColumnOrder(2, 0);
    first.api.setColumnVisible('customer', false);
    first.destroy();

    const second = mountTable(orderModel(), { tableOptions });
    await nextFrame();
    const model = second.scope.tableModel;
    expect(properties(model)).toEqual(['city', 'id', 'customer', 'total']);
    expect(model.getColumnWidth(3)).toBe(240);
    expect(second.api.isColumnVisible('customer')).toBe(false);
    // the area model follows the order: column 0 shows the city
    expect(firstCell(second.host, 0)).toBe('City 0');
  });

  it('S1 by dragging the header edge; S2 by dragging the header', async () => {
    const tableOptions = restore({ autoRestoreColumnLayout: true }, { stateChangedDebounceDelay: 10 });
    const first = mountTable(orderModel(), { tableOptions });
    await nextFrame();
    await userEvent.dragAndDrop(getCellDiv(first.host, 'header', 'center', 0, 0), getCellDiv(first.host, 'header', 'center', 0, 2));
    await vi.waitFor(() => expect(stored()?.columns?.map(c => c.property)).toEqual(['customer', 'city', 'id', 'total']));
    first.destroy();
    const second = mountTable(orderModel(), { tableOptions });
    await nextFrame();
    expect(properties(second.scope.tableModel)).toEqual(['customer', 'city', 'id', 'total']);
  });

  it('S5: sorts the same column after a column drag (sort stored by property)', async () => {
    const tableOptions = restore({ autoRestoreSortingState: true });
    const first = mountTable(orderModel(), { tableOptions });
    await nextFrame();
    first.scope.tableModel.changeColumnOrder(3, 0);
    first.api.sortByColumn('total', 'desc');
    first.destroy();
    expect(stored().sort).toEqual([{ property: 'total', sortState: 'desc' }]);

    const second = mountTable(orderModel(), { tableOptions });
    await nextFrame();
    expect(firstCell(second.host, 3)).toBe(MAX_TOTAL);
    expect(second.scope.tableModel.getColumnDef(3)!.sortState).toBe('desc');
  });

  it('S5 with the column layout: the moved column is sorted', async () => {
    const tableOptions = restore({ autoRestoreSortingState: true, autoRestoreColumnLayout: true });
    const first = mountTable(orderModel(), { tableOptions });
    await nextFrame();
    first.scope.tableModel.changeColumnOrder(3, 0);
    first.api.sortByColumn('total', 'desc');
    first.scope.stateService.markDirty('columns');
    first.destroy();

    const second = mountTable(orderModel(), { tableOptions });
    await nextFrame();
    expect(properties(second.scope.tableModel)[0]).toBe('total');
    expect(firstCell(second.host, 0)).toBe(MAX_TOTAL);
  });

  it('works with fixed columns on both sides (like the Angular demo "columndef")', async () => {
    const tableOptions = restore({ autoRestoreColumnLayout: true, autoRestoreSortingState: true });
    const first = mountTable(orderModel(orders(), { fixedLeft: 1, fixedRight: 1 }), { tableOptions });
    await nextFrame();
    first.scope.tableModel.changeColumnOrder(2, 1);         // city before customer (center)
    first.api.sortByColumn('city', 'asc');
    first.scope.stateService.markDirty('columns');
    first.destroy();

    const second = mountTable(orderModel(orders(), { fixedLeft: 1, fixedRight: 1 }), { tableOptions });
    await nextFrame();
    expect(properties(second.scope.tableModel)).toEqual(['id', 'city', 'customer', 'total']);
    expect(renderedRows(second.host, 'center')[0].querySelector('[data-col-index="1"]')!.textContent).toBe('City 0');
  });

  it('S6: checked rows by id – also when the rows arrive in another order', async () => {
    const tableOptions = restore({ autoRestoreCheckedState: true });
    const first = mountTable(orderModel(orders(), { checkbox: true }), { tableOptions });
    await nextFrame();
    for (const row of [3, 7, 9]) first.scope.toggleRowCheckbox(row, 0, 'body');
    first.destroy();
    expect(stored().checkedRowIds).toEqual([3, 7, 9]);

    const reversed = orders().reverse();
    const second = mountTable(orderModel(reversed, { checkbox: true }), { tableOptions });
    await nextFrame();
    const checked = second.scope.tableModel.getBodyModel().rowSelectionModel!.getCheckedRows() as Order[];
    expect(checked.map(o => o.id).sort((a, b) => a - b)).toEqual([3, 7, 9]);
    expect(second.scope.tableModel.getBodyModel().isRowChecked(200 - 1 - 3)).toBe('full');
  });

  it('S7: selected rows (type "row") by id, restored in the current order', async () => {
    const sm1 = new SelectionModel('row', 'multi');
    const tableOptions = restore({ autoRestoreSelectedState: true }, { getSelectionModel: () => sm1 });
    const first = mountTable(orderModel(), { tableOptions });
    await nextFrame();
    sm1.addSelection(CellRange.singleRow(3));
    sm1.addSelection(new CellRange(10, 0, 12, Number.MAX_SAFE_INTEGER));
    first.destroy();
    expect(stored().selection).toEqual({ ranges: [{ fromRowId: 3, toRowId: 3 }, { fromRowId: 10, toRowId: 12 }] });

    const sm2 = new SelectionModel('row', 'multi');
    const second = mountTable(orderModel(orders().reverse()), { tableOptions: { ...tableOptions, getSelectionModel: () => sm2 } });
    await nextFrame();
    const selectedIds = Array.from({ length: 200 }, (_, i) => i)
      .filter(i => sm2.isSelected(i, 0))
      .map(i => (second.api.getBodyModel().getRowByIndex(i) as Order).id)
      .sort((a, b) => a - b);
    expect(selectedIds).toEqual([3, 10, 11, 12]);
  });

  it('S7: a cell range (type "range") by row id and property', async () => {
    const sm1 = new SelectionModel('range', 'multi');
    const tableOptions = restore({ autoRestoreSelectedState: true, autoRestoreColumnLayout: true }, { getSelectionModel: () => sm1 });
    const first = mountTable(orderModel(), { tableOptions });
    await nextFrame();
    sm1.addSelection(new CellRange(2, 1, 4, 2));
    first.destroy();
    expect(stored().selection!.ranges).toEqual([{ fromRowId: 2, toRowId: 4, fromProperty: 'customer', toProperty: 'city' }]);

    const sm2 = new SelectionModel('range', 'multi');
    mountTable(orderModel(), { tableOptions: { ...tableOptions, getSelectionModel: () => sm2 } });
    await nextFrame();
    expect(sm2.getRanges()).toEqual([new CellRange(2, 1, 4, 2)]);
  });

  it('S8: reads the format before 1.1.92 (sort by index) and removes the old keys with the next save', async () => {
    storage.setItem(KEY + 'sortingState', '[{"columnIndex":3,"sortState":"desc"}]');
    storage.setItem(KEY + 'scrollState', '[0,340]');
    const tableOptions = restore({ autoRestoreSortingState: true, autoRestoreScrollPosition: true });
    const table = mountTable(orderModel(), { tableOptions });
    await nextFrame();
    expect(table.scope.tableModel.getColumnDef(3)!.sortState).toBe('desc');
    expect(table.api.getFirstVisibleRowIndex()).toBe(10);
    table.api.sortByColumn('id', 'asc');
    table.destroy();
    expect(stored().sort).toEqual([{ property: 'id', sortState: 'asc' }]);
    expect(storage.getItem(KEY + 'sortingState')).toBeNull();
    expect(storage.getItem(KEY + 'scrollState')).toBeNull();
  });

  it('S9: unknown columns are ignored, the rest is applied', async () => {
    storage.setItem(KEY + 'tableState', JSON.stringify({
      version: 1,
      columns: [{ property: 'gone', width: 50 }, { property: 'total', width: 222 }, { property: 'id' }],
      sort: [{ property: 'gone', sortState: 'asc' }, { property: 'total', sortState: 'asc' }],
    }));
    const tableOptions = restore({ autoRestoreColumnLayout: true, autoRestoreSortingState: true });
    const { scope } = mountTable(orderModel(), { tableOptions });
    await nextFrame();
    // total, id as stored; customer and city stay behind the column they follow (id, customer)
    expect(properties(scope.tableModel)).toEqual(['total', 'id', 'customer', 'city']);
    expect(scope.tableModel.getColumnWidth(0)).toBe(222);
    expect(scope.tableModel.getColumnDef(0)!.sortState).toBe('asc');
  });

  it('S9: broken JSON or another version → starts without a stored state', async () => {
    storage.setItem(KEY + 'tableState', '{broken');
    const tableOptions = restore({ autoRestoreColumnLayout: true });
    const a = mountTable(orderModel(), { tableOptions });
    await nextFrame();
    expect(properties(a.scope.tableModel)).toEqual(['id', 'customer', 'city', 'total']);
    a.destroy();
    storage.setItem(KEY + 'tableState', JSON.stringify({ version: 99, columns: [{ property: 'total' }] }));
    const b = mountTable(orderModel(), { tableOptions });
    await nextFrame();
    expect(properties(b.scope.tableModel)).toEqual(['id', 'customer', 'city', 'total']);
  });

  it('S12: a blocked storage – the table starts, getState() and the event work', async () => {
    const onStateChanged = vi.fn();
    const listener = new EventAdapter();
    listener.onStateChanged = onStateChanged;
    const tableOptions: Partial<TableOptionsIf> = {
      autoRestoreOptions: { ...new AutoRestoreOptions<Order>(), getStorageKeyFn: () => KEY, storage: throwingStorage(), autoRestoreSortingState: true },
      stateChangedDebounceDelay: 10,
    };
    const { api } = mountTable(orderModel(), { tableOptions, eventListener: listener });
    await nextFrame();
    expect(() => api.sortByColumn('total', 'asc')).not.toThrow();
    await vi.waitFor(() => expect(onStateChanged).toHaveBeenCalledTimes(1));
    expect(api.getState(['sort']).sort).toEqual([{ property: 'total', sortState: 'asc' }]);
  });

  it('S13: one warning when a flag is set without getStorageKeyFn; nothing is stored', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { api } = mountTable(orderModel(), {
      tableOptions: { autoRestoreOptions: { ...new AutoRestoreOptions<Order>(), storage, autoRestoreSortingState: true } },
    });
    await nextFrame();
    api.sortByColumn('total', 'asc');
    api.destroy();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('getStorageKeyFn');
    expect(storage.length).toBe(0);
  });

  it('no warning without any flag', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mountTable(orderModel(), { tableOptions: { autoRestoreOptions: new AutoRestoreOptions<Order>() } });
    await nextFrame();
    expect(warn).not.toHaveBeenCalled();
  });

  it('stores only the parts switched on', async () => {
    const tableOptions = restore({ autoRestoreSortingState: true });
    const { api } = mountTable(orderModel(), { tableOptions });
    await nextFrame();
    api.sortByColumn('total', 'asc');
    api.setColumnWidth(0, 300);
    api.destroy();
    expect(stored()).toEqual({ version: 1, sort: [{ property: 'total', sortState: 'asc' }] });
  });

  it('a storage adapter (e.g. sessionStorage)', async () => {
    const calls: string[] = [];
    const own: StateStorageIf = {
      getItem: key => { calls.push('get ' + key); return null; },
      setItem: (key) => { calls.push('set ' + key); },
      removeItem: key => { calls.push('remove ' + key); },
    };
    const { api } = mountTable(orderModel(), {
      tableOptions: { autoRestoreOptions: { ...new AutoRestoreOptions<Order>(), getStorageKeyFn: () => KEY, storage: own, autoRestoreSortingState: true } },
    });
    await nextFrame();
    api.sortByColumn('total', 'asc');
    api.destroy();
    expect(calls).toContain('get orderstableState');
    expect(calls.filter(c => c.startsWith('set'))).toEqual(['set orderstableState']);
  });

  it('a stored state wins over initialState, part by part', async () => {
    storage.setItem(KEY + 'tableState', JSON.stringify({ version: 1, sort: [{ property: 'id', sortState: 'desc' }] }));
    const tableOptions = restore({ autoRestoreSortingState: true }, {
      initialState: { sort: [{ property: 'total', sortState: 'asc' }], columns: [{ property: 'total' }, { property: 'id' }] },
    });
    const { scope } = mountTable(orderModel(), { tableOptions });
    await nextFrame();
    expect(properties(scope.tableModel)[0]).toBe('total');            // from initialState
    expect(scope.tableModel.getColumnDefs()!.find(cd => cd.property === 'id')!.sortState).toBe('desc'); // stored
  });

  it('scroll: pixel position, then the first row by id when the data changed', async () => {
    const tableOptions = restore({ autoRestoreScrollPosition: true });
    const first = mountTable(orderModel(), { tableOptions });
    await nextFrame();
    first.api.scrollToIndex(0, 50);
    await nextFrame();
    first.destroy();
    expect(stored().scroll).toEqual({ left: 0, top: 50 * 34, firstRowId: 50 });

    const second = mountTable(orderModel(orders().slice(5)), { tableOptions });   // 5 rows less at the top
    await vi.waitFor(() => expect(second.api.getFirstVisibleRowIndex()).toBe(45));
    expect((second.api.getBodyModel().getRowByIndex(45) as Order).id).toBe(50);
  });
});

describe('header groups (S4)', () => {

  beforeEach(() => {
    vi.spyOn(console, 'table').mockImplementation(() => undefined);
  });

  const groups = (): CellGroupIf[] => [
    { data: 'Order', children: [{ data: 'ID', property: 'id' }, { data: 'Total', property: 'total' }] },
    {
      data: 'Customer', toggle: true, children: [
        { data: 'Customer', property: 'customer', visibility: 'always' },
        { data: 'City', property: 'city' },
      ],
    },
  ];

  function groupModel(): TableModelIf {
    const cellGroups = groups();
    const columnDefs = CellgroupFactory.buildColumnDefs(CellgroupFactory.buildGroupExts(cellGroups));
    const headerAreaModel = new AreaModelCellGroups('header', cellGroups, columnDefs, 34);
    const bodyAreaModel = new AreaModelObjectArrayWithColumndefs('body', orders(20), columnDefs, 34);
    return TableFactory.createTableModel({ headerAreaModel, bodyAreaModel, columnDefs });
  }

  it('getState() names the toggleable groups by their label path', async () => {
    const { api } = mountTable(groupModel());
    await nextFrame();
    expect(api.getState(['headerGroups']).headerGroups).toEqual([{ id: 'Customer', closed: false }]);
  });

  it('setHeaderGroupCollapsed() hides the columns of the group; false for unknown ids', async () => {
    const { api } = mountTable(groupModel());
    await nextFrame();
    expect(api.setHeaderGroupCollapsed('Customer', true)).toBe(true);
    expect(api.isColumnVisible('city')).toBe(false);
    expect(api.getState(['headerGroups', 'columns'])).toMatchObject({
      headerGroups: [{ id: 'Customer', closed: true }],
      columns: expect.arrayContaining([{ property: 'city', visible: true }]),   // hidden by the group, not by the API
    });
    expect(api.setHeaderGroupCollapsed('Nope', true)).toBe(false);
  });

  it('a collapsed group stays collapsed after a rebuild', async () => {
    const tableOptions = restore({ autoRestoreHeaderGroupState: true });
    const first = mountTable(groupModel(), { tableOptions });
    await nextFrame();
    first.api.setHeaderGroupCollapsed('Customer', true);
    first.destroy();
    expect(stored().headerGroups).toEqual([{ id: 'Customer', closed: true }]);

    const second = mountTable(groupModel(), { tableOptions });
    await nextFrame();
    expect(second.api.isColumnVisible('city')).toBe(false);
    expect(second.api.isColumnVisible('customer')).toBe(true);
  });

  it('CellGroupIf.id is used when given', async () => {
    const cellGroups = groups();
    cellGroups[1].id = 'cust';
    const columnDefs = CellgroupFactory.buildColumnDefs(CellgroupFactory.buildGroupExts(cellGroups));
    const header = new AreaModelCellGroups('header', cellGroups, columnDefs, 34);
    expect(header.getToggleGroupStates()).toEqual([{ id: 'cust', closed: false }]);
  });
});

describe('tree', () => {

  interface Node { id: number; name: string; children?: Node[] }
  const nodes = (): Node[] => [
    { id: 1, name: 'A', children: [{ id: 11, name: 'A1', children: [{ id: 111, name: 'A1a' }] }, { id: 12, name: 'A2' }] },
    { id: 2, name: 'B', children: [{ id: 21, name: 'B1' }] },
    { id: 3, name: 'C' },
  ];
  const treeModel = (checkbox = false) => {
    const columnDefs: ColumnDefIf[] = [ColumnDef.create({ property: 'name', width: px100 }), ColumnDef.create({ property: 'id', width: px100 })];
    if (checkbox) columnDefs.unshift(new CheckboxColumnDef());
    return TableFactory.createTableModel({ rows: TreeFactory.buildTreeRows(nodes(), { expanded: true }), columnDefs, rowCheckboxVisible: checkbox });
  };
  const names = (host: HTMLElement, col = 0) =>
    renderedRows(host).map(r => r.querySelector(`[data-col-index="${col}"]`)!.textContent!.replace(/^>/, ''));

  it('stores the shorter list and restores nested nodes', async () => {
    const tableOptions = restore({ autoRestoreCollapsedExpandedState: true });
    const first = mountTable(treeModel(), { tableOptions });
    await nextFrame();
    const amt = first.scope.tableModel.getBodyModel();
    first.scope.setTreeRowExpanded(amt.getRowByIndex(1), false);   // A1 collapsed
    first.destroy();
    expect(stored().tree).toEqual({ collapsedRowIds: [11] });

    const second = mountTable(treeModel(), { tableOptions });
    await nextFrame();
    expect(names(second.host)).toEqual(['A', 'A1', 'A2', 'B', 'B1', 'C']);
  });

  it('collapseAll() → { expandedRowIds: [] }', async () => {
    const { api } = mountTable(treeModel());
    await nextFrame();
    api.collapseAll();
    expect(api.getState(['tree']).tree).toEqual({ expandedRowIds: [] });
  });

  it('checked tree nodes (parents are derived again)', async () => {
    const tableOptions = restore({ autoRestoreCheckedState: true });
    const first = mountTable(treeModel(true), { tableOptions });
    await nextFrame();
    first.scope.toggleRowCheckbox(4, 0, 'body');        // B → B and B1
    first.destroy();
    expect(stored().checkedRowIds).toEqual([2, 21]);

    const second = mountTable(treeModel(true), { tableOptions });
    await nextFrame();
    const body = second.scope.tableModel.getBodyModel();
    expect(body.isRowChecked(4)).toBe('full');
    expect(body.isRowChecked(5)).toBe('full');
    expect(body.isRowChecked(0)).toBe('none');
  });
});

describe('applyState() / initialState / resetState()', () => {

  it('S10: getState() → initialState of a new table → same state', async () => {
    const first = mountTable(orderModel());
    await nextFrame();
    first.api.setColumnWidth(1, 180);
    first.scope.tableModel.changeColumnOrder(3, 0);
    first.api.sortByColumn('total', 'desc');
    first.api.setColumnVisible('city', false);
    const state = JSON.parse(JSON.stringify(first.api.getState(['columns', 'sort']))) as TableStateIf;
    first.destroy();

    const second = mountTable(orderModel(), { tableOptions: { initialState: state } });
    await nextFrame();
    expect(second.api.getState(['columns', 'sort'])).toEqual(state);
    expect(firstCell(second.host, 0)).toBe(MAX_TOTAL);
  });

  it('applies only the parts of the state; a missing part stays', async () => {
    const { api, scope, host } = mountTable(orderModel());
    await nextFrame();
    api.sortByColumn('id', 'desc');
    // not listed columns stay behind the column they follow now: customer behind id, total behind city
    api.applyState({ columns: [{ property: 'city' }, { property: 'id' }] });
    await nextFrame();
    expect(properties(scope.tableModel)).toEqual(['city', 'total', 'id', 'customer']);
    expect(properties(scope.tableModel)[0]).toBe('city');
    expect(api.getState(['sort']).sort).toEqual([{ property: 'id', sortState: 'desc' }]);
    expect(host.querySelector('.ge-table-header-center')!.textContent).toContain('CITY');
  });

  it('only the given parts', async () => {
    const { api, scope } = mountTable(orderModel());
    await nextFrame();
    api.applyState({ columns: [{ property: 'city' }], sort: [{ property: 'id', sortState: 'desc' }] }, ['sort']);
    expect(properties(scope.tableModel)[0]).toBe('id');
    expect(api.getState(['sort']).sort).toEqual([{ property: 'id', sortState: 'desc' }]);
  });

  it('a column without width gets the width of the code back', async () => {
    const { api, scope } = mountTable(orderModel());
    await nextFrame();
    api.setColumnWidth(0, 300);
    api.applyState({ columns: [{ property: 'id' }] });
    expect(scope.tableModel.getColumnWidth(0)).toBe(100);
    expect(api.getState(['columns']).columns![0]).toEqual({ property: 'id', visible: true });
  });

  it('a % column gets its % width back', async () => {
    const columnDefs = columns();
    columnDefs[0].width = new Size(20, '%');
    const { api, scope } = mountTable(TableFactory.createTableModel({ rows: orders(), columnDefs }));
    await nextFrame();
    const before = scope.tableModel.getColumnWidth(0);
    api.setColumnWidth(0, 300);
    api.applyState({ columns: [{ property: 'id' }] });
    expect(scope.tableModel.getColumnWidth(0)).toBe(before);
    expect(columnDefs[0].width).toEqual(new Size(20, '%'));
  });

  it('resetState(): the layout of the code, storage emptied', async () => {
    const tableOptions = restore({ autoRestoreColumnLayout: true, autoRestoreSortingState: true });
    const { api, scope } = mountTable(orderModel(), { tableOptions });
    await nextFrame();
    api.setColumnWidth(0, 300);
    scope.tableModel.changeColumnOrder(3, 0);
    api.sortByColumn('total', 'desc');
    api.setColumnVisible('city', false);
    scope.stateService.flush();
    expect(stored()).not.toBeNull();

    api.resetState();
    expect(properties(scope.tableModel)).toEqual(['id', 'customer', 'city', 'total']);
    expect(scope.tableModel.getColumnWidth(0)).toBe(100);
    expect(api.isColumnVisible('city')).toBe(true);
    expect(api.getState(['sort']).sort).toEqual([]);
    expect(stored()).toBeNull();
  });

  it('setCustomState(): stored with autoRestoreCustomState and back after a rebuild', async () => {
    const tableOptions = restore({ autoRestoreCustomState: true });
    const first = mountTable(orderModel(), { tableOptions });
    await nextFrame();
    first.api.setCustomState({ filter: 'City 3' });
    first.destroy();
    expect(stored().custom).toEqual({ filter: 'City 3' });
    const second = mountTable(orderModel(), { tableOptions });
    await nextFrame();
    expect(second.api.getState(['custom']).custom).toEqual({ filter: 'City 3' });
  });
});

describe('onStateChanged (S11)', () => {

  function mountWithEvents(more: Partial<TableOptionsIf> = {}) {
    const events: GeStateChangeEvent[] = [];
    const listener = new EventAdapter();
    listener.onStateChanged = evt => events.push(evt);
    const table = mountTable(orderModel(), { eventListener: listener, tableOptions: { stateChangedDebounceDelay: 20, ...more } });
    return { ...table, events };
  }

  it('no event while the table is built (also not for a restored state)', async () => {
    const { events } = mountWithEvents({ initialState: { sort: [{ property: 'total', sortState: 'asc' }] } });
    await nextFrame();
    await new Promise(r => setTimeout(r, 60));
    expect(events).toEqual([]);
  });

  it('one debounced event for several changes, with the changed parts', async () => {
    const { api, events } = mountWithEvents();
    await nextFrame();
    api.setColumnWidth(0, 150);
    api.setColumnWidth(0, 160);
    api.sortByColumn('total', 'asc');
    await vi.waitFor(() => expect(events).toHaveLength(1));
    expect(events[0].changedParts).toEqual(['columns', 'sort']);
    expect(events[0].state.columns![0]).toEqual({ property: 'id', width: 160, visible: true });
    expect(events[0]).toBeInstanceOf(GeStateChangeEvent);
  });

  it('no event when nothing really changed', async () => {
    const { api, events, scope } = mountWithEvents();
    await nextFrame();
    api.setColumnWidth(0, 100);                 // the same width
    scope.stateService.flush();
    expect(events).toEqual([]);
  });

  it('scrolling is reported once, after the scrolling stopped', async () => {
    const { api, events } = mountWithEvents();
    await nextFrame();
    api.scrollToIndex(0, 20);
    await nextFrame();
    api.scrollToIndex(0, 40);
    await nextFrame();
    await vi.waitFor(() => expect(events).toHaveLength(1));
    expect(events[0].changedParts).toEqual(['scroll']);
    expect(events[0].state.scroll).toEqual({ left: 0, top: 40 * 34, firstRowId: 40 });
  });

  it('destroy() reports a pending change', async () => {
    const { api, events } = mountWithEvents({ stateChangedDebounceDelay: 10_000 });
    await nextFrame();
    api.sortByColumn('total', 'asc');
    api.destroy();
    expect(events).toHaveLength(1);
  });
});

describe('models without row objects', () => {

  class ComputedBody extends AreaModel {
    constructor() { super(); this.areaIdent = 'body'; }
    override getRowCount(): number { return 1000; }
    override getRowHeight(): number { return 34; }
    override getValueAt(row: number, col: number): unknown { return `${row}/${col}`; }
  }
  const computedModel = () => TableFactory.createTableModel({
    bodyAreaModel: new ComputedBody(),
    columnDefs: ['a', 'b'].map(p => ColumnDef.create({ property: p, width: px100 })),
  });

  it('rows are skipped (one warning when the part is stored) without an own getRowId', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const sm = new SelectionModel('row', 'multi');
    const { api } = mountTable(computedModel(), { tableOptions: { getSelectionModel: () => sm, ...restore({ autoRestoreSelectedState: true }) } });
    await nextFrame();
    sm.addSelection(CellRange.singleRow(4));
    expect(api.getState(['selection']).selection).toEqual({ ranges: [] });
    api.getState(['selection']);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('getRowId(row, rowIndex) stores them by index', async () => {
    const sm = new SelectionModel('row', 'multi');
    const { api } = mountTable(computedModel(), {
      tableOptions: {
        getSelectionModel: () => sm,
        autoRestoreOptions: { autoRestoreSortingState: false, getRowId: (_row: unknown, rowIndex?: number) => rowIndex ?? -1 },
      },
    });
    await nextFrame();
    sm.addSelection(CellRange.singleRow(4));
    expect(api.getState(['selection']).selection).toEqual({ ranges: [{ fromRowId: 4, toRowId: 4 }] });
    expect(api.getState(['scroll']).scroll).toEqual({ left: 0, top: 0, firstRowId: 0 });
  });
});

describe('applyState() – every part and invalid input', () => {

  it('tree, checked rows, selection and custom data at runtime', async () => {
    interface Node { id: number; name: string; children?: Node[] }
    const nodes: Node[] = [
      { id: 1, name: 'A', children: [{ id: 11, name: 'A1' }] },
      { id: 2, name: 'B', children: [{ id: 21, name: 'B1' }] },
    ];
    const sm = new SelectionModel('row', 'multi');
    const columnDefs: ColumnDefIf[] = [new CheckboxColumnDef(), ColumnDef.create({ property: 'name', width: px100 })];
    const model = TableFactory.createTableModel({ rows: TreeFactory.buildTreeRows(nodes, { expanded: true }), columnDefs, rowCheckboxVisible: true });
    const { api } = mountTable(model, { tableOptions: { getSelectionModel: () => sm } });
    await nextFrame();
    api.applyState({
      tree: { collapsedRowIds: [1] },
      checkedRowIds: [21],
      selection: { ranges: [{ fromRowId: 2, toRowId: 21 }] },
      custom: { filter: 'x' },
    });
    await nextFrame();
    expect(api.getDisplayedRowCount()).toBe(3);                 // A, B, B1
    expect(api.getState(['tree', 'checked', 'selection', 'custom'])).toEqual({
      version: 1,
      tree: { expandedRowIds: [2] },                           // the same, as the shorter list (tie → expanded)
      checkedRowIds: [2, 21],                                  // B is checked because all its children are
      selection: { ranges: [{ fromRowId: 2, toRowId: 21 }] },
      custom: { filter: 'x' },
    });
  });

  it('several sort columns: the first is the primary key', async () => {
    const rows = orders(20).map(o => ({ ...o, city: o.id < 10 ? 'A' : 'B' }));
    const { api, host } = mountTable(orderModel(rows));
    await nextFrame();
    api.applyState({ sort: [{ property: 'city', sortState: 'desc' }, { property: 'id', sortState: 'asc' }] });
    await nextFrame();
    expect(firstCell(host, 0)).toBe('10');
    expect(api.getState(['sort']).sort).toEqual([{ property: 'city', sortState: 'desc' }, { property: 'id', sortState: 'asc' }]);
  });

  it('a column selection (type "column"), negative ranges and "all selected"', async () => {
    const sm = new SelectionModel('column', 'multi');
    const { api } = mountTable(orderModel(), { tableOptions: { getSelectionModel: () => sm } });
    await nextFrame();
    sm.addSelection(CellRange.singleColumn(2));
    expect(api.getState(['selection']).selection).toEqual({ ranges: [{ fromProperty: 'city', toProperty: 'city' }] });
    api.applyState({
      selection: { allSelected: true, ranges: [], negativeRanges: [{ fromRowId: 1, toRowId: 1, fromProperty: 'id', toProperty: 'id' }] },
    });
    expect(sm.isSelected(5, 3)).toBe(true);
    expect(sm.isSelected(1, 0)).toBe(false);
    expect(api.getState(['selection']).selection).toEqual({
      allSelected: true, ranges: [], negativeRanges: [{ fromRowId: 1, toRowId: 1, fromProperty: 'id', toProperty: 'id' }],
    });
  });

  it('unknown rows and columns in a selection are dropped', async () => {
    const sm = new SelectionModel('range', 'multi');
    const { api } = mountTable(orderModel(), { tableOptions: { getSelectionModel: () => sm } });
    await nextFrame();
    api.applyState({
      selection: {
        ranges: [{ fromRowId: 999, toRowId: 1 }, { fromProperty: 'gone', toProperty: 'id' }, { fromRowId: 1, toRowId: 2 }],
      },
    });
    expect(sm.getRanges()).toEqual([new CellRange(1, 0, 2, Number.MAX_SAFE_INTEGER)]);
  });

  it('a selection model without snapshots (SelectionModelIf only)', async () => {
    const sm = new SelectionModel('row', 'multi');
    const plain = Object.assign(sm, { createSnapshot: undefined, restoreSnapshot: undefined });
    const { api } = mountTable(orderModel(), { tableOptions: { getSelectionModel: () => plain } });
    await nextFrame();
    api.applyState({ selection: { ranges: [{ fromRowId: 4, toRowId: 4 }] } });
    expect(api.getState(['selection']).selection).toEqual({ ranges: [{ fromRowId: 4, toRowId: 4 }] });
  });

  it('header groups at runtime', async () => {
    vi.spyOn(console, 'table').mockImplementation(() => undefined);
    const cellGroups: CellGroupIf[] = [
      { data: 'G', toggle: true, children: [{ data: 'ID', property: 'id', visibility: 'always' }, { data: 'Total', property: 'total' }] },
    ];
    const columnDefs = CellgroupFactory.buildColumnDefs(CellgroupFactory.buildGroupExts(cellGroups));
    const headerAreaModel = new AreaModelCellGroups('header', cellGroups, columnDefs, 34);
    const bodyAreaModel = new AreaModelObjectArrayWithColumndefs('body', orders(5), columnDefs, 34);
    const { api } = mountTable(TableFactory.createTableModel({ headerAreaModel, bodyAreaModel, columnDefs }));
    await nextFrame();
    api.applyState({ headerGroups: [{ id: 'G', closed: true }, { id: 'unknown', closed: true }] });
    expect(api.isColumnVisible('total')).toBe(false);
    api.resetState();
    expect(api.isColumnVisible('total')).toBe(true);
  });

  it('ignores invalid input without throwing', async () => {
    const { api, scope } = mountTable(orderModel());
    await nextFrame();
    const before = api.getState();
    const invalid = [
      null, 'x',
      { columns: 'x', sort: 'x', tree: {}, checkedRowIds: 'x', selection: {}, headerGroups: 'x', scroll: { top: 'x' } },
      { sort: [null, { property: 'id' }, { property: 'id', sortState: 'asc' }, { property: 'id', sortState: 'desc' }, { columnIndex: 99, sortState: 'asc' }] },
      { selection: { ranges: [null] } },
    ];
    for (const state of invalid) {
      expect(() => api.applyState(state as unknown as TableStateIf)).not.toThrow();
    }
    expect(api.getState(['columns'])).toEqual({ version: 1, columns: before.columns });
    expect(api.getState(['sort']).sort).toEqual([{ property: 'id', sortState: 'asc' }]);   // the first valid item
    expect(properties(scope.tableModel)).toEqual(['id', 'customer', 'city', 'total']);
  });

  it('sort by column index (tables of the old format)', async () => {
    const { api } = mountTable(orderModel());
    await nextFrame();
    api.applyState({ sort: [{ columnIndex: 3, sortState: 'desc' }] });
    expect(api.getState(['sort']).sort).toEqual([{ property: 'total', sortState: 'desc' }]);
  });

  it('a table without column definitions has no columns and no sort part', async () => {
    const model = TableFactory.createTableModel({ bodyData: [[1, 2], [3, 4]], headerData: [['a', 'b']] } as never);
    const { api } = mountTable(model);
    await nextFrame();
    const state = api.getState();
    expect(state.columns).toBeUndefined();
    expect(state.sort).toBeUndefined();
    expect(() => api.applyState({ columns: [{ property: 'a' }], sort: [{ property: 'a', sortState: 'asc' }] })).not.toThrow();
  });
});

describe('rows without id', () => {
  it('nothing of the row is stored (no JSON of the row); one warning only for a stored part', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const rows = Array.from({ length: 50 }, (_, i) => ({ name: 'N' + i, mail: `n${i}@mail.de` }));
    const columnDefs: ColumnDefIf[] = [new CheckboxColumnDef(), ColumnDef.create({ property: 'name', width: px100 })];
    const plain = mountTable(TableFactory.createTableModel({ rows, columnDefs }));
    await nextFrame();
    expect(plain.api.getState(['scroll', 'checked'])).toEqual({ version: 1, scroll: { left: 0, top: 0 }, checkedRowIds: [] });
    expect(warn).not.toHaveBeenCalled();
    plain.destroy();

    const table = mountTable(TableFactory.createTableModel({ rows, columnDefs: [new CheckboxColumnDef(), ...columnDefs.slice(1)] }),
      { tableOptions: restore({ autoRestoreCheckedState: true, autoRestoreScrollPosition: true }) });
    await nextFrame();
    table.scope.toggleRowCheckbox(2, 0, 'body');
    table.destroy();
    expect(storage.getItem(KEY + 'tableState')).not.toContain('mail');
    expect(stored().checkedRowIds).toEqual([]);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('getRowId');
  });

  it('array rows (bodyData) store no firstRowId', async () => {
    const model = TableFactory.createTableModel({ bodyData: [['secret@mail.de', 1], ['x@mail.de', 2]], headerData: [['a', 'b']] } as never);
    const { api } = mountTable(model, { tableOptions: restore({ autoRestoreScrollPosition: true }) });
    await nextFrame();
    expect(api.getState(['scroll']).scroll).toEqual({ left: 0, top: 0 });
  });
});

describe('review findings (regressions)', () => {

  it('a scroll back to a position that is a prefix of the old one is stored (100 → 10)', async () => {
    const tableOptions = restore({ autoRestoreScrollPosition: true }, { stateChangedDebounceDelay: 10 });
    const { api, scope } = mountTable(orderModel(), { tableOptions });
    await nextFrame();
    api.scrollToPixel(0, 100);
    await vi.waitFor(() => expect(stored()?.scroll?.top).toBe(100));
    api.scrollToPixel(0, 10);
    await vi.waitFor(() => expect(stored()?.scroll?.top).toBe(scope.scrollViewport.scrollTop));
    expect(scope.scrollViewport.scrollTop).toBe(10);
  });

  it('a column hidden by the code (isVisible: FalseFn) and shown by the user stays shown', async () => {
    const model = () => {
      const columnDefs = columns();
      columnDefs[2].isVisible = () => false;
      return TableFactory.createTableModel({ rows: orders(), columnDefs });
    };
    const tableOptions = restore({ autoRestoreColumnLayout: true });
    const first = mountTable(model(), { tableOptions });
    await nextFrame();
    expect(first.api.getState(['columns']).columns![2]).toEqual({ property: 'city', visible: false });
    first.api.setColumnVisible('city', true);
    first.destroy();
    expect(stored().columns![2]).toEqual({ property: 'city', visible: true });
    const second = mountTable(model(), { tableOptions });
    await nextFrame();
    expect(second.api.isColumnVisible('city')).toBe(true);
  });

  it('destroy() releases the table even if onStateChanged throws', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const listener = new EventAdapter();
    listener.onStateChanged = () => { throw new Error('app'); };
    const { api, scope } = mountTable(orderModel(), { eventListener: listener });
    await nextFrame();
    api.sortByColumn('total', 'asc');
    expect(() => api.destroy()).not.toThrow();
    expect(scope.listenerAbortController.signal.aborted).toBe(true);
    expect(scope.isDestroyed()).toBe(true);
    expect(error).toHaveBeenCalled();
  });

  it('a custom state that is no JSON does not break the table', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { api } = mountTable(orderModel(), { tableOptions: restore({ autoRestoreCustomState: true }) });
    await nextFrame();
    const cyclic: Record<string, unknown> = {};
    cyclic['self'] = cyclic;
    api.setCustomState(cyclic);
    expect(() => api.destroy()).not.toThrow();
    expect(error).toHaveBeenCalled();
  });

  it('checked rows changed by the app through the model are stored with destroy()', async () => {
    const tableOptions = restore({ autoRestoreCheckedState: true });
    const first = mountTable(orderModel(orders(), { checkbox: true }), { tableOptions });
    await nextFrame();
    const body = first.scope.tableModel.getBodyModel();
    body.rowSelectionModel!.checkRow(body.getRowByIndex(4), true);
    first.destroy();
    expect(stored().checkedRowIds).toEqual([4]);
  });

  it('nothing is marked or stored before the table is built', async () => {
    const columnState = [{ property: 'total' }, { property: 'id' }, { property: 'customer' }, { property: 'city' }];
    storage.setItem(KEY + 'tableState', JSON.stringify({ version: 1, columns: columnState }));
    const tableOptions = restore({ autoRestoreColumnLayout: true });
    const { scope } = mountTable(orderModel(), { tableOptions });
    await nextFrame();
    expect(properties(scope.tableModel)[0]).toBe('total');
    expect(stored().columns).toEqual(columnState);   // untouched by the start
  });

  it('a range to the last row (after Ctrl+A and a deselect) is kept "to the end"', async () => {
    const sm = new SelectionModel('row', 'multi');
    const { api } = mountTable(orderModel(), { tableOptions: { getSelectionModel: () => sm } });
    await nextFrame();
    sm.addSelection(new CellRange(5, 0, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER));
    const state = api.getState(['selection']);
    expect(state.selection).toEqual({ ranges: [{ fromRowId: 5 }] });
    sm.clear();
    api.applyState(state);
    expect(sm.getRanges()).toEqual([new CellRange(5, 0, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)]);
  });

  it('the event holds a copy; ALL_TABLE_STATE_PARTS is frozen', async () => {
    const events: GeStateChangeEvent[] = [];
    const listener = new EventAdapter();
    listener.onStateChanged = evt => events.push(evt);
    const { api } = mountTable(orderModel(), { eventListener: listener, tableOptions: { stateChangedDebounceDelay: 10 } });
    await nextFrame();
    api.setColumnWidth(0, 150);
    await vi.waitFor(() => expect(events).toHaveLength(1));
    events[0].state.columns!.length = 0;
    api.sortByColumn('total', 'asc');
    await vi.waitFor(() => expect(events).toHaveLength(2));
    expect(events[1].state.columns).toHaveLength(4);
    expect(Object.isFrozen(ALL_TABLE_STATE_PARTS)).toBe(true);
  });
});
