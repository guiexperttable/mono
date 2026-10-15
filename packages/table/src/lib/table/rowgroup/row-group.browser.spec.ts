// Row grouping in a real browser (prompt 006, design prompts/006-row-grouping.design.md): rendering R1/R2, expand and
// collapse, group column, sorting by header (R5), filter (R4), editing, updateCells, persistence, checkboxes, export,
// regrouping, HTML injection, ARIA, 100,000 rows.
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  AutoRestoreOptions,
  CellRange,
  CheckboxColumnDef,
  ColumnDef,
  RowGroupFactory,
  SelectionModel,
  TrueFn,
  isAreaModelRowGroups,
} from '@guiexpert/table';
import type { AreaModelRowGroups, ColumnDefIf, RowGroupTableModelParaIf, TableModelIf, TableOptionsIf } from '@guiexpert/table';
import { cellDiv, destroyAllTables, getCellDiv, mountTable, nextFrame, renderedRows } from '../../../../test-utils/mount-table';
import type { MountOptions } from '../../../../test-utils/mount-table';
import { axeViolations } from '../../../../test-utils/axe';
import { memoryStorage } from '../../../../test-utils/memory-storage';
import { createSales, type SaleRow } from '../../../../test-utils/grouping-fixtures';

afterEach(() => {
  destroyAllTables();
  vi.restoreAllMocks();
});

function columns(): ColumnDefIf[] {
  return [
    ColumnDef.create({ property: 'region', headerLabel: 'Region', sortable: TrueFn }),
    ColumnDef.create({ property: 'produkt', headerLabel: 'Produkt', sortable: TrueFn }),
    ColumnDef.create({ property: 'monat', headerLabel: 'Monat', sortable: TrueFn }),
    ColumnDef.create({ property: 'umsatz', headerLabel: 'Umsatz', sortable: TrueFn, editable: TrueFn }),
  ];
}

function groupModel(p: Partial<RowGroupTableModelParaIf<SaleRow>> = {}): TableModelIf {
  return RowGroupFactory.createTableModel<SaleRow>({
    rows: createSales(), columnDefs: columns(), groupBy: ['region'], aggregations: { umsatz: 'sum' }, ...p,
  });
}

async function mount(tableModel: TableModelIf, opts: MountOptions = {}) {
  const table = mountTable(tableModel, opts);
  await nextFrame();
  return table;
}

/** The label text of a cell (without the tree arrow). */
const text = (cell: HTMLElement | null) => cell?.querySelector('.ge-table-label-div')?.textContent ?? '';
/** Group column (west, index 0) and umsatz (center, index 4) of the displayed rows. */
function view(host: HTMLElement, rowCount: number): [string, string][] {
  return Array.from({ length: rowCount }, (_, r) =>
    [text(cellDiv(host, 'body', 'west', r, 0)), text(cellDiv(host, 'body', 'center', r, 4))]);
}
const body = (m: TableModelIf) => m.getBodyModel() as AreaModelRowGroups<SaleRow>;

describe('rendering', () => {
  it('R1: group rows with label, count and sum, detail rows, total row in the footer', async () => {
    const m = groupModel();
    const { host } = await mount(m);
    expect(view(host, 8)).toEqual([
      ['Nord (3)', '270'], ['', '100'], ['', '50'], ['', '120'],
      ['Süd (3)', '180'], ['', '80'], ['', '70'], ['', '30'],
    ]);
    expect(text(getCellDiv(host, 'footer', 'center', 0, 4))).toBe('450');
    expect(text(getCellDiv(host, 'footer', 'west', 0, 0))).toBe('6 rows');
    expect(text(getCellDiv(host, 'header', 'west', 0, 0))).toBe('Region');
    // the group column is fixed (west), the grouped column "region" hidden (width 0)
    expect(getCellDiv(host, 'body', 'west', 0, 0).querySelector('.ge-table-tree-arrow-div')).not.toBeNull();
    expect(cellDiv(host, 'body', 'center', 1, 1)?.style.width ?? '0px').toBe('0px');
    const label = getCellDiv(host, 'body', 'west', 0, 0);
    expect(label.classList).toContain('ge-table-row-group');
    expect(label.classList).toContain('ge-table-row-group-label');
    expect(getCellDiv(host, 'body', 'center', 0, 4).classList).toContain('ge-table-row-group-aggregate');
    expect(getComputedStyle(label).fontWeight).toBe('600');
    expect(getComputedStyle(getCellDiv(host, 'body', 'center', 0, 4)).textAlign).toBe('end');
  });

  it('R2: levels with CSS classes; expand/collapse by click and all at once', async () => {
    const m = groupModel({ groupBy: ['region', 'produkt'] });
    const { host, api } = await mount(m);
    expect(text(getCellDiv(host, 'body', 'west', 1, 0))).toBe('A (2)');
    expect(getCellDiv(host, 'body', 'west', 1, 0).classList).toContain('ge-table-row-group-level-1');
    expect(getCellDiv(host, 'body', 'west', 1, 0).classList).toContain('ge-table-tree-deep-1');
    expect(getCellDiv(host, 'body', 'west', 2, 0).classList).toContain('ge-table-tree-deep-2');
    api.collapseAll();
    await nextFrame();
    expect(api.getBodyModel().getRowCount()).toBe(2);
    expect(view(host, 2)).toEqual([['Nord (3)', '270'], ['Süd (3)', '180']]);
    expect(api.setRowExpanded(0, true)).toBe(true);
    await nextFrame();
    expect(view(host, 4).map(([l]) => l)).toEqual(['Nord (3)', 'A (2)', 'B (1)', 'Süd (3)']);
    // a click on the arrow of "A"
    const arrow = getCellDiv(host, 'body', 'west', 1, 0).querySelector<HTMLElement>('.ge-table-tree-arrow-div')!;
    arrow.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 1, clientY: 1 }));
    api.expandAll();
    await nextFrame();
    expect(api.getBodyModel().getRowCount()).toBe(12);
  });

  it('screen readers: treegrid, levels, the group label is a row header; no axe violations', async () => {
    const { host } = await mount(groupModel({ groupBy: ['region', 'produkt'] }));
    expect(host.getAttribute('role')).toBe('treegrid');
    const rowDiv = getCellDiv(host, 'body', 'west', 1, 0).parentElement!;
    expect(rowDiv.getAttribute('aria-level')).toBe('2');
    expect(rowDiv.getAttribute('aria-expanded')).toBe('true');
    expect(getCellDiv(host, 'body', 'west', 0, 0).getAttribute('role')).toBe('rowheader');
    expect(getCellDiv(host, 'body', 'center', 0, 4).getAttribute('role')).toBe('gridcell');
    expect(getCellDiv(host, 'body', 'west', 2, 0).getAttribute('role')).toBe('gridcell');
    expect(await axeViolations(host)).toEqual([]);
  });
});

describe('sorting, filter (R4, R5)', () => {
  it('R5: header sort by umsatz desc – groups by sum, rows by value', async () => {
    const m = groupModel();
    const { host, api } = await mount(m);
    api.sortByColumn('umsatz', 'desc');
    await nextFrame();
    expect(view(host, 8)).toEqual([
      ['Nord (3)', '270'], ['', '120'], ['', '100'], ['', '50'],
      ['Süd (3)', '180'], ['', '80'], ['', '70'], ['', '30'],
    ]);
    api.sortByColumn('umsatz', 'asc');
    await nextFrame();
    expect(view(host, 1)).toEqual([['Süd (3)', '180']]);
    api.sortByColumn(0, 'desc');                // the group column: by key
    await nextFrame();
    expect(view(host, 1)).toEqual([['Süd (3)', '180']]);
  });

  it('R4: filter with the objects – aggregates, counts and footer follow', async () => {
    const filter = { month: '' };
    const m = groupModel();
    const { host, api } = await mount(m, {
      tableOptions: { externalFilterFunction: (s: SaleRow) => !filter.month || s.monat === filter.month } as Partial<TableOptionsIf>,
    });
    filter.month = 'Jan';
    api.externalFilterChanged();
    await nextFrame();
    expect(view(host, 5)).toEqual([['Nord (2)', '150'], ['', '100'], ['', '50'], ['Süd (1)', '80'], ['', '80']]);
    expect(text(getCellDiv(host, 'footer', 'center', 0, 4))).toBe('230');
    expect(text(getCellDiv(host, 'footer', 'west', 0, 0))).toBe('3 rows');
    filter.month = 'Mär';
    api.externalFilterChanged();
    await nextFrame();
    expect(api.getBodyModel().getRowCount()).toBe(0);
    expect(api.getOverlayState()).toBe('noMatches');
  });
});

describe('editing and live data', () => {
  it('inline edit of a detail row: group row and footer show the new value', async () => {
    const m = groupModel();
    const { host, scope } = await mount(m);
    scope.updateModelValueAfterEdit('body', 1, 4, 1000 as unknown as string);
    await nextFrame();
    expect(view(host, 2)).toEqual([['Nord (3)', '1,170'], ['', '1000']]);
    expect(text(getCellDiv(host, 'footer', 'center', 0, 4))).toBe('1,350');
    expect(m.getBodyModel().isEditable(0, 4)).toBe(false);
  });

  it('editing a grouped value moves the row; the table repaints with the new row count', async () => {
    const m = RowGroupFactory.createTableModel<SaleRow>({
      rows: createSales(), groupBy: ['region'], aggregations: { umsatz: 'sum' }, hideGroupedColumns: false,
      columnDefs: columns().map(c => { c.editable = TrueFn; return c; }),
    });
    const { host, scope, api } = await mount(m);
    scope.updateModelValueAfterEdit('body', 1, 1, 'Ost');
    await nextFrame();
    expect(api.getBodyModel().getRowCount()).toBe(9);
    expect([0, 3, 5].map(r => text(cellDiv(host, 'body', 'west', r, 0)))).toEqual(['Nord (2)', 'Ost (1)', 'Süd (3)']);
  });

  it('updateCells() with a changed grouped value: rows move, later events hit their rows, labels and counts follow', async () => {
    const { host, api } = await mount(groupModel({ hideGroupedColumns: false }));
    const regionColumn = 1;
    api.updateCells([
      { area: 'body', rowIndex: 1, columnIndex: regionColumn, value: 'Süd', cssClasses: {} },   // Nord A Jan 100 → Süd
      { area: 'body', rowIndex: 2, columnIndex: 4, value: 999, cssClasses: {} },               // Nord B Jan 50
    ]);
    await nextFrame();
    expect(view(host, 3)).toEqual([['Nord (2)', '1,119'], ['', '999'], ['', '120']]);
    expect(text(getCellDiv(host, 'body', 'west', 3, 0))).toBe('Süd (4)');
    expect(text(getCellDiv(host, 'body', 'center', 3, 4))).toBe('280');
    expect(text(getCellDiv(host, 'footer', 'center', 0, 4))).toBe('1,399');
  });

  it('updateCells() without repaintAll: the rendered group row follows', async () => {
    const m = groupModel();
    const { host, api } = await mount(m);
    api.updateCells([{ area: 'body', rowIndex: 2, columnIndex: 4, value: 500, cssClasses: {} }]);
    await nextFrame();
    expect(view(host, 3)).toEqual([['Nord (3)', '720'], ['', '100'], ['', '500']]);
    expect(text(getCellDiv(host, 'footer', 'center', 0, 4))).toBe('900');
    api.updateCells([{ area: 'body', rowIndex: 2, columnIndex: 4, value: 50, cssClasses: {} }], true);
    await nextFrame();
    expect(view(host, 1)).toEqual([['Nord (3)', '270']]);
  });
});

describe('regrouping', () => {
  it('setRowGroupBy: new groups, columns and header follow, expanded state of unchanged paths stays', async () => {
    const m = groupModel({ groupBy: ['region', 'produkt'] });
    const { host, api } = await mount(m);
    api.setRowExpanded(0, false);                 // Nord
    await nextFrame();
    expect(api.setRowGroupBy(['region'])).toBe(true);
    await nextFrame();
    expect(api.getRowGroupBy()).toEqual(['region']);
    expect(view(host, 2)).toEqual([['Nord (3)', '270'], ['Süd (3)', '180']]);
    expect(text(getCellDiv(host, 'header', 'west', 0, 0))).toBe('Region');
    expect(api.isColumnVisible('produkt')).toBe(true);
    expect(api.isColumnVisible('region')).toBe(false);
    api.setRowGroupBy(['produkt']);
    await nextFrame();
    expect(api.isColumnVisible('region')).toBe(true);
    expect(text(getCellDiv(host, 'header', 'west', 0, 0))).toBe('Produkt');
    expect(view(host, 1)).toEqual([['A (4)', '330']]);
    api.setRowGroupBy([]);
    await nextFrame();
    expect(api.getBodyModel().getRowCount()).toBe(6);
    expect(text(getCellDiv(host, 'footer', 'center', 0, 4))).toBe('450');
  });

  it('a flat table: setRowGroupBy is false, getRowGroupBy undefined', async () => {
    const { api } = await mount(RowGroupFactory.createTableModel({ rows: [], groupBy: [] }));
    expect(isAreaModelRowGroups(api.getBodyModel())).toBe(true);
    const flat = mountTable((await import('@guiexpert/table')).TableFactory.createTableModel({ rows: createSales() }));
    expect(flat.api.setRowGroupBy(['region'])).toBe(false);
    expect(flat.api.getRowGroupBy()).toBeUndefined();
  });

  it('a new model in the same host (as the wrappers do): destroy() releases the old one', async () => {
    const first = await mount(groupModel());
    first.destroy();
    expect(first.host.isConnected).toBe(false);
    const second = await mount(groupModel({ groupBy: ['produkt'] }));
    expect(text(getCellDiv(second.host, 'body', 'west', 0, 0))).toBe('A (4)');
  });
});

describe('state, checkboxes, export', () => {
  it('autoRestoreOptions: a collapsed group stays collapsed after a rebuild (stable group ids)', async () => {
    const storage = memoryStorage();
    const tableOptions = {
      autoRestoreOptions: {
        ...new AutoRestoreOptions<SaleRow>(), getStorageKeyFn: () => 'sales', storage,
        autoRestoreCollapsedExpandedState: true, getRowId: (s: SaleRow) => `${s.region}-${s.produkt}-${s.monat}`,
      },
      stateChangedDebounceDelay: 0,
    } as Partial<TableOptionsIf>;
    const first = await mount(groupModel(), { tableOptions });
    first.api.setRowExpanded(4, false);            // Süd
    first.destroy();                               // writes what is pending
    expect(storage.getItem('salestableState')).toContain('rowgroup:');
    const { api, host } = await mount(groupModel(), { tableOptions });
    expect(api.getBodyModel().getRowCount()).toBe(5);
    expect(text(getCellDiv(host, 'body', 'west', 4, 0))).toBe('Süd (3)');
  });

  it('checkbox column: checking a group checks its rows', async () => {
    const m = groupModel({ columnDefs: [new CheckboxColumnDef(), ...columns()] });
    const { scope } = await mount(m);
    scope.toggleRowCheckbox(0, 0, 'body');        // Nord
    expect(body(m).getCheckedRows().map(r => r.umsatz)).toEqual([100, 50, 120]);
    expect(m.getBodyModel().isRowChecked(4)).toBe('none');
  });

  it('selection includes group rows; copy and Excel: label, raw aggregates, no hidden columns', async () => {
    const m = groupModel();
    const selectionModel = new SelectionModel('row', 'multi');
    const { api, scope } = await mount(m, { tableOptions: { getSelectionModel: () => selectionModel } });
    const download = vi.spyOn(scope.excelService, 'downloadExcel').mockResolvedValue(undefined);
    await api.downloadExcel('groups.xlsx');
    const matrix = download.mock.calls[0][0] as unknown[][];
    expect(matrix[0]).toEqual(['Region', 'Produkt', 'Monat', 'Umsatz']);
    expect(matrix[1]).toEqual(['Nord (3)', '', '', 270]);
    expect(matrix[2]).toEqual(['', 'A', 'Jan', 100]);
    expect(matrix.at(-1)).toEqual(['6 rows', '', '', 450]);
    vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
    selectionModel.addSelection(CellRange.singleRow(0));
    const copied = await api.copyToClipboard();
    expect(copied.split('\n')[0]).toContain('Nord (3)');
  });
});

describe('security and size', () => {
  it('HTML injection: keys and own labels are text', async () => {
    const XSS = '<img src="x" onerror="geXss = 1">';
    const rows = createSales().map((s, i) => ({ ...s, region: i < 3 ? XSS : s.region }));
    const m = RowGroupFactory.createTableModel({ rows, columnDefs: columns(), groupBy: ['region'], aggregations: { umsatz: 'sum' },
      groupColumn: { headerLabel: XSS } });
    const { host } = await mount(m);
    expect(host.querySelector('img')).toBeNull();
    expect(text(getCellDiv(host, 'header', 'west', 0, 0))).toBe(XSS);
    const labels = [0, 3, 4, 6].map(r => text(cellDiv(host, 'body', 'west', r, 0))).filter(Boolean);
    expect(labels).toContain(`${XSS} (3)`);
    const own = RowGroupFactory.createTableModel({ rows: createSales(), columnDefs: columns(), groupBy: ['region'],
      groupColumn: { label: () => XSS }, aggregations: { umsatz: { aggregator: 'sum', format: () => XSS } } });
    const second = await mount(own);
    expect(second.host.querySelector('img')).toBeNull();
    expect(text(getCellDiv(second.host, 'body', 'center', 0, 4))).toBe(XSS);
  });

  it('100,000 rows grouped: scrolling to the end renders the last rows', async () => {
    const rows = Array.from({ length: 100_000 }, (_, i) => ({ region: `R${i % 50}`, produkt: `P${i % 7}`, monat: 'Jan', umsatz: i }));
    const m = RowGroupFactory.createTableModel({ rows, columnDefs: columns(), groupBy: ['region', 'produkt'], aggregations: { umsatz: 'sum' } });
    const { api, host } = await mount(m);
    const count = m.getBodyModel().getRowCount();
    expect(count).toBe(100_000 + 50 + 350);
    api.scrollToIndex(0, count - 1);
    await nextFrame();
    await vi.waitFor(() => expect(api.getLastVisibleRowIndex()).toBe(count - 1));
    expect(renderedRows(host).length).toBeLessThan(60);
  });
});
