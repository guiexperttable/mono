import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  AreaModel,
  AutoRestoreOptions,
  ColumnDef,
  EventAdapter,
  GeFilterEvent,
  GeStateChangeEvent,
  PivotFactory,
  RowGroupFactory,
  SelectionModel,
  SpreadsheetFactory,
  TableFactory,
  TableOptions,
  TreeFactory,
  TrueFn,
  px100,
  px120,
  px80,
  type ColumnDefIf,
  type StateStorageIf,
  type TableOptionsIf,
} from '@guiexpert/table';
import { destroyAllTables, mountTable, nextFrame } from '../../../../test-utils/mount-table';
import { countRenders } from '../../../../test-utils/perf-counters';

interface Account {
  id: number;
  company: string;
  region: string;
  plan: string;
  seats: number;
  mrr: number;
  created: string;
  active: boolean;
}

function sampleAccounts(): Account[] {
  return [
    { id: 1, company: 'Acme GmbH', region: 'EMEA', plan: 'Pro', seats: 50, mrr: 5000, created: '2026-01-15', active: true },
    { id: 2, company: 'Beacon Inc', region: 'AMER', plan: 'Starter', seats: 12, mrr: 600, created: '2026-02-20', active: true },
    { id: 3, company: 'Cobalt AG', region: 'EMEA', plan: 'Enterprise', seats: 120, mrr: 18000, created: '2026-03-10', active: true },
    { id: 4, company: 'Delta Ltd', region: 'APAC', plan: 'Pro', seats: 35, mrr: 3500, created: '2026-04-05', active: false },
    { id: 5, company: 'Echo SAS', region: 'EMEA', plan: 'Starter', seats: 8, mrr: 400, created: '2026-05-18', active: false },
  ];
}

function accountColumns(): ColumnDefIf[] {
  return [
    ColumnDef.create({ property: 'id', headerLabel: 'ID', width: px80, sortable: TrueFn }),
    ColumnDef.create({ property: 'company', headerLabel: 'Company', width: px120, sortable: TrueFn }),
    ColumnDef.create({ property: 'region', headerLabel: 'Region', width: px100, sortable: TrueFn }),
    ColumnDef.create({ property: 'plan', headerLabel: 'Plan', width: px100, sortable: TrueFn }),
    ColumnDef.create({ property: 'seats', headerLabel: 'Seats', width: px80, sortable: TrueFn }),
    ColumnDef.create({ property: 'mrr', headerLabel: 'MRR', width: px100, sortable: TrueFn }),
    ColumnDef.create({ property: 'created', headerLabel: 'Created', width: px100, sortable: TrueFn }),
    ColumnDef.create({ property: 'active', headerLabel: 'Active', width: px80, sortable: TrueFn }),
  ];
}

function createMemoryStorage(): StateStorageIf & { map: Map<string, string> } {
  const map = new Map<string, string>();
  return {
    map,
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => { map.set(k, v); },
    removeItem: (k: string) => { map.delete(k); },
  };
}

afterEach(() => {
  destroyAllTables();
});

describe('Column filters – Teil A (model, API, events, state, interactions)', () => {
  it('without column filters, externalFilterFunction behaves identically to before', async () => {
    let minSeats = 30;
    const model = TableFactory.createTableModel({ rows: sampleAccounts(), columnDefs: accountColumns() });
    const { api } = mountTable(model, {
      tableOptions: { externalFilterFunction: (row: Account) => row.seats >= minSeats },
    });
    await nextFrame();
    expect(api.getDisplayedRowCount()).toBe(3);

    minSeats = 100;
    api.externalFilterChanged();
    await nextFrame();
    expect(api.getDisplayedRowCount()).toBe(1);
    expect(api.getColumnFilters()).toEqual({});
  });

  it('setColumnFilter / getColumnFilter / getColumnFilters / clearColumnFilters / isColumnFiltered work by property, index and ColumnDef', async () => {
    const cols = accountColumns();
    const model = TableFactory.createTableModel({ rows: sampleAccounts(), columnDefs: cols });
    const events: GeFilterEvent[] = [];
    const listener = new EventAdapter();
    listener.onFilterChanged = evt => events.push(evt);

    const { api } = mountTable(model, { eventListener: listener });
    await nextFrame();

    api.setColumnFilter('region', { condition: { operator: 'equals', value: 'emea' } });
    expect(api.getDisplayedRowCount()).toBe(3);
    expect(api.isColumnFiltered('region')).toBe(true);
    expect(api.isColumnFiltered(2)).toBe(true);
    expect(api.isColumnFiltered(cols[2])).toBe(true);
    expect(api.isColumnFiltered('plan')).toBe(false);
    expect(api.getColumnFilter('region')).toEqual({ condition: { operator: 'equals', value: 'emea' } });
    expect(events.length).toBe(1);
    expect(events[0].property).toBe('region');
    expect(events[0].source).toBe('api');
    expect(events[0].rowCount).toBe(3);
    expect(events[0].unfilteredRowCount).toBe(5);

    // second column combines via AND
    api.setColumnFilter(4, { condition: { operator: 'greaterThan', value: 40 } }); // seats
    expect(api.getDisplayedRowCount()).toBe(2);
    expect(Object.keys(api.getColumnFilters())).toEqual(['region', 'seats']);

    // clear one column
    api.setColumnFilter('region', undefined);
    expect(api.isColumnFiltered('region')).toBe(false);
    expect(api.getDisplayedRowCount()).toBe(2); // ids 1 (50) and 3 (120)

    // clear all restores all 5 rows
    api.clearColumnFilters();
    expect(api.getDisplayedRowCount()).toBe(5);
    expect(api.getColumnFilters()).toEqual({});
  });

  it('fires onFilterChanged once after render and matches getDisplayedRowCount() inside the handler', async () => {
    const model = TableFactory.createTableModel({ rows: sampleAccounts(), columnDefs: accountColumns() });
    let displayedInHandler = -1;
    let eventCount = 0;
    let apiRef: ReturnType<typeof mountTable>['api'] | undefined;
    const listener = new EventAdapter();
    listener.onFilterChanged = evt => {
      eventCount++;
      displayedInHandler = apiRef!.getDisplayedRowCount();
      expect(evt.rowCount).toBe(displayedInHandler);
    };

    const mounted = mountTable(model, { eventListener: listener });
    apiRef = mounted.api;
    await nextFrame();

    mounted.api.setColumnFilters({
      region: { values: ['EMEA', 'APAC'] },
      seats: { condition: { operator: 'greaterOrEqual', value: 35 } },
    });
    expect(eventCount).toBe(1);
    expect(displayedInHandler).toBe(3);
  });

  it('perf invariant: setColumnFilter and setColumnFilters each trigger 1 filter pass and 1 render pass', async () => {
    const model = TableFactory.createTableModel({ rows: sampleAccounts(), columnDefs: accountColumns() });
    const { api, scope } = mountTable(model, { tableOptions: { resizeEventDebounceDelay: 10 } });
    await nextFrame();

    const filterSpy = vi.spyOn(model, 'externalFilterChanged');
    const renders = countRenders(scope);

    api.setColumnFilters({
      region: { condition: { operator: 'equals', value: 'EMEA' } },
      seats: { condition: { operator: 'greaterThan', value: 10 } },
    });

    expect(filterSpy).toHaveBeenCalledTimes(1);
    expect(renders.count()).toBe(1);
    renders.reset();
    filterSpy.mockClear();

    api.setColumnFilter('plan', { values: ['Pro'] });
    expect(filterSpy).toHaveBeenCalledTimes(1);
    expect(renders.count()).toBe(1);
    renders.stop();
  });

  it('combines column filters with externalFilterFunction via AND', async () => {
    let onlyActive = true;
    const model = TableFactory.createTableModel({ rows: sampleAccounts(), columnDefs: accountColumns() });
    const { api } = mountTable(model, {
      tableOptions: { externalFilterFunction: (row: Account) => !onlyActive || row.active },
    });
    await nextFrame();
    expect(api.getDisplayedRowCount()).toBe(3);

    api.setColumnFilter('region', { condition: { operator: 'equals', value: 'EMEA' } });
    expect(api.getDisplayedRowCount()).toBe(2); // id 1, 3

    onlyActive = false;
    api.externalFilterChanged();
    expect(api.getDisplayedRowCount()).toBe(3); // id 1, 3, 5 (column filter stays!)

    api.clearColumnFilters();
    expect(api.getDisplayedRowCount()).toBe(5);
  });

  it('keeps sorting, updates footerAggregates, selection aggregates, showValuesAs, overlay noMatches, and blocks row drag', async () => {
    const sm = new SelectionModel('range', 'multi');
    const cols = [
      ColumnDef.create({ property: 'company', headerLabel: 'Company', width: px120, sortable: TrueFn, rowDrag: true }),
      ColumnDef.create({ property: 'region', headerLabel: 'Region', width: px100 }),
      ColumnDef.create({ property: 'mrr', headerLabel: 'MRR', width: px100, sortable: TrueFn }),
      ColumnDef.create({ property: 'share', headerLabel: 'Share', width: px100, valueGetter: (r: Account) => r.mrr, showValuesAs: 'percentOfColumnTotal' }),
    ];
    const model = TableFactory.createTableModel({
      rows: sampleAccounts(),
      columnDefs: cols,
      footerAggregates: { mrr: 'sum' },
    });
    const { api, scope } = mountTable(model, {
      tableOptions: { getSelectionModel: () => sm },
    });
    await nextFrame();

    api.sortByColumn('mrr', 'desc');
    api.setColumnFilter('region', { condition: { operator: 'equals', value: 'EMEA' } });
    await nextFrame();

    // sorted desc within EMEA: 18000, 5000, 400
    expect(model.getBodyModel().getValueAt(0, 2)).toBe(18000);
    expect(model.getBodyModel().getValueAt(1, 2)).toBe(5000);
    expect(model.getBodyModel().getValueAt(2, 2)).toBe(400);
    // footer total follows filtered rows: 18000 + 5000 + 400 = 23400
    expect(model.getAreaModel('footer').getValueAt(0, 2)).toBe(23400);
    // showValuesAs follows filtered rows: 18000 / 23400 ≈ 76.9%
    expect(model.getBodyModel().getTextValueAt(0, 3)).toContain('76.9');
    // row drag blocked while filtered (clear sort first so filter is the active block reason)
    api.sortByColumn('mrr', '');
    expect(scope.rowDragService?.getBlockReason()).toBe('filtered');

    // no matching rows -> noMatches overlay
    api.setColumnFilter('company', { condition: { operator: 'equals', value: 'DoesNotExist' } });
    await nextFrame();
    expect(api.getDisplayedRowCount()).toBe(0);
    expect(api.getOverlayState()).toBe('noMatches');
  });

  it('works with calculated columns (valueGetter, formula) and custom filter.valueGetter', async () => {
    const cols = [
      ColumnDef.create({ property: 'company', headerLabel: 'Company', width: px120 }),
      ColumnDef.create({ property: 'seats', headerLabel: 'Seats', width: px80 }),
      ColumnDef.create({ property: 'mrr', headerLabel: 'MRR', width: px100 }),
      ColumnDef.create({ property: 'perSeat', headerLabel: 'Per Seat', width: px100, formula: '[mrr] / [seats]' }),
      ColumnDef.create({
        property: 'tag',
        headerLabel: 'Tag',
        width: px100,
        filter: { type: 'text', valueGetter: (r: Account) => `${r.region}-${r.plan}` },
      }),
    ];
    const model = TableFactory.createTableModel({ rows: sampleAccounts(), columnDefs: cols });
    const { api } = mountTable(model);
    await nextFrame();

    api.setColumnFilter('perSeat', { condition: { operator: 'greaterOrEqual', value: 100 } });
    expect(api.getDisplayedRowCount()).toBe(3); // 100, 150, 100

    api.setColumnFilters({ tag: { condition: { operator: 'equals', value: 'emea-enterprise' } } });
    expect(api.getDisplayedRowCount()).toBe(1);
  });

  it('appendRows filters new rows with the combined predicate and setRows keeps active column filters', async () => {
    const model = TableFactory.createTableModel({ rows: sampleAccounts(), columnDefs: accountColumns() });
    const { api } = mountTable(model);
    await nextFrame();

    api.setColumnFilter('region', { condition: { operator: 'equals', value: 'EMEA' } });
    expect(api.getDisplayedRowCount()).toBe(3);

    const res = api.appendRows([
      { id: 6, company: 'Foxtrot', region: 'EMEA', plan: 'Pro', seats: 25, mrr: 2500, created: '2026-06-01', active: true },
      { id: 7, company: 'Golf', region: 'APAC', plan: 'Pro', seats: 90, mrr: 9000, created: '2026-06-02', active: true },
    ]);
    expect(res && res.shown).toBe(1);
    expect(api.getDisplayedRowCount()).toBe(4);

    // setRows keeps active column filter
    api.setRows([
      { id: 10, company: 'Hotel', region: 'EMEA', plan: 'Pro', seats: 10, mrr: 1000, created: '2026-07-01', active: true },
      { id: 11, company: 'India', region: 'AMER', plan: 'Pro', seats: 10, mrr: 1000, created: '2026-07-02', active: true },
    ]);
    api.repaintHard();
    expect(api.getDisplayedRowCount()).toBe(1);
    expect(api.getColumnFilter('region')).toEqual({ condition: { operator: 'equals', value: 'EMEA' } });
  });

  it('works with AreaModelArrayOfArrays (#<index>), AreaModelTree, AreaModelRowGroups, AreaModelPivot and AreaModelSheet', async () => {
    // 1. Array of arrays
    const arrModel = TableFactory.createTableModel({
      headerData: [['Name', 'Score']],
      bodyData: [['Anna', 90], ['Ben', 40], ['Cara', 75]],
      columnSizes: [100, 100],
    });
    const arr = mountTable(arrModel);
    await nextFrame();
    arr.api.setColumnFilter(1, { condition: { operator: 'greaterThan', value: 50 } });
    expect(arr.api.getDisplayedRowCount()).toBe(2);
    expect(arr.api.getColumnFilters()).toEqual({ '#1': { condition: { operator: 'greaterThan', value: 50 } } });
    destroyAllTables();

    // 2. Tree (keeps ancestors of matching children)
    interface Node { name: string; size: number; children?: Node[] }
    const treeRows = TreeFactory.buildTreeRows<Node>([
      { name: 'src', size: 0, children: [{ name: 'index.ts', size: 200 }, { name: 'util.ts', size: 50 }] },
      { name: 'docs', size: 0, children: [{ name: 'readme.md', size: 30 }] },
    ], 'children');
    const treeModel = TableFactory.createTableModel({
      rows: treeRows,
      columnDefs: [
        ColumnDef.create({ property: 'name', headerLabel: 'Name', width: px120 }),
        ColumnDef.create({ property: 'size', headerLabel: 'Size', width: px80 }),
      ],
    });
    const tree = mountTable(treeModel);
    await nextFrame();
    tree.api.setColumnFilter('size', { condition: { operator: 'greaterThan', value: 100 } });
    expect(tree.api.getDisplayedRowCount()).toBe(2); // "src" ancestor + "index.ts"
    destroyAllTables();

    // 3. Row Groups
    const groupModel = RowGroupFactory.createTableModel<Account>({
      rows: sampleAccounts(),
      columnDefs: accountColumns(),
      groupBy: ['region'],
      aggregations: { mrr: 'sum' },
    });
    const rg = mountTable(groupModel);
    await nextFrame();
    rg.api.setColumnFilter('plan', { condition: { operator: 'equals', value: 'Enterprise' } });
    expect(rg.api.getDisplayedRowCount()).toBe(2); // EMEA group row (expanded by default) + 1 matching detail row
    destroyAllTables();

    // 4. Pivot (source properties)
    const pivotModel = PivotFactory.createTableModel<Account>({
      rows: sampleAccounts(),
      rowFields: ['region'],
      columnFields: ['plan'],
      values: ['mrr'],
    });
    const pv = mountTable(pivotModel);
    await nextFrame();
    pv.api.setColumnFilter('active', { condition: { operator: 'equals', value: true } });
    expect(pv.api.getDisplayedRowCount()).toBe(2); // EMEA & AMER (APAC has only active:false)
    destroyAllTables();

    // 5. Spreadsheet (AreaModelSheet + cellFormulas)
    const sheet = SpreadsheetFactory.create({
      data: [
        ['Item', 'Qty', 'Price', 'Total'],
        ['Pen', 10, 2, '=B2*C2'],
        ['Book', 5, 20, '=B3*C3'],
        ['Lamp', 1, 50, '=B4*C4'],
      ],
    });
    const sp = mountTable(sheet.tableModel, { tableOptions: sheet.tableOptions });
    await nextFrame();
    // Filter by column 4 (D = Total; column 0 is row numbers)
    sp.api.setColumnFilter(4, { condition: { operator: 'greaterOrEqual', value: 50 } });
    expect(sp.api.getDisplayedRowCount()).toBe(2); // Book (100) and Lamp (50)
  });

  it('warns on non-filterable custom AreaModel when managed:true, and emits onFilterChanged without filtering when managed:false', async () => {
    class StaticBody extends AreaModel {
      override getRowCount() { return 3; }
      override getValueAt(r: number, c: number) { return `${r}:${c}`; }
    }
    const model = TableFactory.createTableModel({
      bodyAreaModel: new StaticBody(),
      columnDefs: [ColumnDef.create({ property: 'a', headerLabel: 'A', width: px100 })],
    });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { api } = mountTable(model);
    await nextFrame();
    api.setColumnFilter('a', { condition: { operator: 'contains', value: '1' } });
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
    destroyAllTables();

    // managed: false (server-side hook)
    const events: GeFilterEvent[] = [];
    const listener = new EventAdapter();
    listener.onFilterChanged = evt => events.push(evt);
    const managedFalse = mountTable(
      TableFactory.createTableModel({ rows: sampleAccounts(), columnDefs: accountColumns() }),
      { tableOptions: { columnFilter: { managed: false } }, eventListener: listener },
    );
    await nextFrame();
    managedFalse.api.setColumnFilter('region', { condition: { operator: 'equals', value: 'EMEA' } });
    expect(managedFalse.api.getDisplayedRowCount()).toBe(5); // not filtered client-side
    expect(events.length).toBe(1);
    expect(events[0].filters).toEqual({ region: { condition: { operator: 'equals', value: 'EMEA' } } });
  });

  it('persists and restores filters via TableState (getState, applyState, autoRestoreFilterState, resetState, onStateChanged)', async () => {
    const storage = createMemoryStorage();
    const stateEvents: GeStateChangeEvent[] = [];
    const listener = new EventAdapter();
    listener.onStateChanged = evt => stateEvents.push(evt);

    const makeOpts = (): Partial<TableOptionsIf> => ({
      stateChangedDebounceDelay: 10,
      autoRestoreOptions: {
        ...new AutoRestoreOptions<Account>(),
        getStorageKeyFn: () => 'acc-filter-test',
        getRowId: a => a.id,
        storage,
        autoRestoreFilterState: true,
      },
    });

    const first = mountTable(
      TableFactory.createTableModel({ rows: sampleAccounts(), columnDefs: accountColumns() }),
      { tableOptions: makeOpts(), eventListener: listener },
    );
    await nextFrame();

    // No filters -> getState() does not pollute plain state
    expect(first.api.getState().filters).toBeUndefined();

    first.api.setColumnFilter('seats', { condition: { operator: 'greaterThan', value: 40 } });
    expect(first.api.getState().filters).toEqual({ seats: { condition: { operator: 'greaterThan', value: 40 } } });
    await vi.waitFor(() => expect(stateEvents.length).toBeGreaterThanOrEqual(1));
    expect(stateEvents[stateEvents.length - 1].changedParts).toContain('filters');

    // Destroy flushes to storage; reload into a new table restores filter automatically
    first.scope.destroy();

    const second = mountTable(
      TableFactory.createTableModel({ rows: sampleAccounts(), columnDefs: accountColumns() }),
      { tableOptions: makeOpts() },
    );
    await nextFrame();
    expect(second.api.getDisplayedRowCount()).toBe(2);
    expect(second.api.getColumnFilter('seats')).toEqual({ condition: { operator: 'greaterThan', value: 40 } });

    // applyState with unknown column ignores unknown and applies valid
    second.api.applyState({
      version: 1,
      filters: {
        region: { values: ['APAC'] },
        nonExistent: { condition: { operator: 'contains', value: 'x' } },
      },
    });
    expect(second.api.getDisplayedRowCount()).toBe(1);
    expect(second.api.getColumnFilters()).toEqual({ region: { values: ['APAC'] } });

    // resetState clears filters back to unfiltered
    second.api.resetState();
    expect(second.api.getDisplayedRowCount()).toBe(5);
    expect(second.api.getColumnFilters()).toEqual({});
  });

  it('batch-edit and master/detail work cleanly alongside column filters', async () => {
    const rows = sampleAccounts();
    const cols = accountColumns().map(c => ({ ...c, editable: TrueFn }));
    const { api } = mountTable(
      TableFactory.createTableModel({ rows, columnDefs: cols }),
      {
        tableOptions: {
          batchEdit: true,
          masterDetail: {
            detailRenderer: (el, row: Account) => { el.textContent = row.company; },
          },
        },
      },
    );
    await nextFrame();

    api.setDetailExpanded(rows[1], true); // AMER row expanded
    expect(api.isDetailExpanded(rows[1])).toBe(true);

    api.applyCellChanges([{ rowIndex: 1, column: 'company', value: 'Beacon Updated' }]);
    // Filter out AMER row
    api.setColumnFilter('region', { condition: { operator: 'equals', value: 'EMEA' } });
    expect(api.getDisplayedRowCount()).toBe(3);
    // Detail expanded state of filtered-out row stays remembered
    expect(api.isDetailExpanded(rows[1])).toBe(true);
    // Commit batch edit writes into the filtered-out row too
    expect(api.commitBatchEdit()).toBe(true);
    expect(rows[1].company).toBe('Beacon Updated');
  });
});
