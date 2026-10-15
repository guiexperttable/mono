// Pivot tables in a real browser (prompt 007, design prompts/007-pivot.design.md): case 1/2 rendered, tree, header
// groups (collapse keeps widths), sorting, filter, export, HTML injection, setPivotConfig without a new table, ARIA.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CellRange, PivotFactory, SelectionModel } from '@guiexpert/table';
import type { PivotTableModel, PivotTableModelParaIf } from '@guiexpert/table';
import { cellDiv, destroyAllTables, getCellDiv, mountTable, nextFrame, stylePx } from '../../../../test-utils/mount-table';
import type { MountOptions } from '../../../../test-utils/mount-table';
import { axeViolations } from '../../../../test-utils/axe';
import { createSales, P1, P2, type SaleRow } from '../../../../test-utils/grouping-fixtures';

afterEach(() => {
  destroyAllTables();
  vi.restoreAllMocks();
});

const MONTHS = { value: 'monat', order: 'insertion' as const };

function pivot(p: Partial<PivotTableModelParaIf<SaleRow>> = {}): PivotTableModel<SaleRow> {
  return PivotFactory.createTableModel<SaleRow>({
    rows: createSales(), rowFields: ['region'], columnFields: [MONTHS], values: ['umsatz'], ...p,
  });
}

async function mount(tableModel: PivotTableModel<SaleRow>, opts: MountOptions = {}) {
  const table = mountTable(tableModel, opts);
  await nextFrame();
  return table;
}

/** The text of a cell (label or value), without arrows. */
const text = (cell: HTMLElement | null) =>
  (cell?.querySelector('.ge-table-label-div, .ge-table-label, span') ?? cell)?.textContent?.trim() ?? '';

describe('rendering', () => {
  it('case 1: header, group column (west), values (center), total column (east), total row (footer)', async () => {
    const { host } = await mount(pivot());
    expect(text(getCellDiv(host, 'header', 'west', 0, 0))).toBe('Region');
    expect(text(getCellDiv(host, 'header', 'center', 0, 1))).toBe('Jan');
    expect(text(getCellDiv(host, 'header', 'center', 0, 2))).toBe('Feb');
    expect(text(getCellDiv(host, 'header', 'east', 0, 3))).toBe('Total');
    expect([0, 1].map(r => text(getCellDiv(host, 'body', 'west', r, 0)))).toEqual(['Nord', 'Süd']);
    expect(text(getCellDiv(host, 'body', 'center', 0, 1))).toBe(`${P1.Nord.Jan}`);
    expect(text(getCellDiv(host, 'body', 'center', 1, 2))).toBe(`${P1.Süd.Feb}`);
    expect(text(getCellDiv(host, 'body', 'east', 0, 3))).toBe(`${P1.Nord.total}`);
    expect(text(getCellDiv(host, 'footer', 'west', 0, 0))).toBe('Total');
    expect(text(getCellDiv(host, 'footer', 'center', 0, 1))).toBe(`${P1.total.Jan}`);
    expect(text(getCellDiv(host, 'footer', 'east', 0, 3))).toBe(`${P1.total.total}`);
    expect(getCellDiv(host, 'body', 'east', 0, 3).classList).toContain('ge-table-pivot-total');
    expect(getCellDiv(host, 'footer', 'center', 0, 1).classList).toContain('ge-table-pivot-total');
  });

  it('case 2: tree with subtotal rows; collapsing a region hides its products', async () => {
    const { api, host } = await mount(pivot({ rowFields: ['region', 'produkt'], emptyText: '–' }));
    expect(api.getBodyModel().getRowCount()).toBe(6);
    const nord = getCellDiv(host, 'body', 'center', 0, 1);
    expect(nord.classList).toContain('ge-table-pivot-subtotal');
    expect(text(nord)).toBe(`${P2.Nord.Jan}`);
    expect(getCellDiv(host, 'body', 'center', 1, 1).classList).not.toContain('ge-table-pivot-subtotal');
    expect(text(getCellDiv(host, 'body', 'center', 2, 2))).toBe('–');                     // Nord B, Feb
    expect(getCellDiv(host, 'body', 'center', 2, 2).classList).toContain('ge-table-pivot-empty');
    expect(api.setRowExpanded(0, false)).toBe(true);
    await nextFrame();
    expect(api.getBodyModel().getRowCount()).toBe(4);
    expect(text(getCellDiv(host, 'body', 'west', 1, 0))).toBe('Süd');
    api.collapseAll();
    await nextFrame();
    expect(api.getBodyModel().getRowCount()).toBe(2);
  });

  it('two column fields: two header rows, spans; collapsing a month keeps the widths of the other columns', async () => {
    const m = pivot({ columnFields: [MONTHS, 'produkt'] });
    const { api, host } = await mount(m, { width: 1000 });
    expect(m.getAreaModel('header').getRowCount()).toBe(2);
    const jan = getCellDiv(host, 'header', 'center', 0, 1);
    expect(text(jan)).toBe('Jan');
    expect(stylePx(jan, 'width')).toBe(300);                        // A, B, Jan Total
    expect(text(getCellDiv(host, 'header', 'center', 1, 3))).toBe('Jan Total');
    const feb = m.getPivotBody().getColumnIndex(['Feb', 'A']);
    api.setColumnWidth(feb, 140);
    await nextFrame();
    expect(api.setHeaderGroupCollapsed('rowgroup:[["monat","s:Jan"]]', true)).toBe(true);
    await nextFrame();
    expect(m.isColumnVisible(1)).toBe(false);
    expect(m.isColumnVisible(3)).toBe(true);                        // Jan Total stays
    expect(m.getColumnWidth(feb)).toBe(140);
    expect(text(getCellDiv(host, 'body', 'center', 0, 3))).toBe('150');
    api.setHeaderGroupCollapsed('rowgroup:[["monat","s:Jan"]]', false);
    await nextFrame();
    expect(m.isColumnVisible(1)).toBe(true);
  });

  it('two values: sub-columns per month with their labels', async () => {
    const m = pivot({ values: [{ value: 'umsatz', label: 'Sum' }, { value: 'umsatz', aggregator: 'count', label: 'Count' }] });
    const { host } = await mount(m, { width: 1000 });
    expect(text(getCellDiv(host, 'header', 'center', 0, 1))).toBe('Jan');
    expect(text(getCellDiv(host, 'header', 'center', 1, 2))).toBe('Count');
    expect(text(getCellDiv(host, 'body', 'center', 0, 2))).toBe('2');
    expect(text(getCellDiv(host, 'body', 'east', 0, 6))).toBe('3');
  });
});

describe('interaction', () => {
  it('sorting by a value column (like a header click) and by the group column', async () => {
    const m = pivot();
    const { api, host } = await mount(m);
    api.sortByColumn(m.getPivotBody().getColumnProperty(['Feb'])!, 'asc');
    await nextFrame();
    expect([0, 1].map(r => text(getCellDiv(host, 'body', 'west', r, 0)))).toEqual(['Süd', 'Nord']);   // 100 < 120
    api.sortByColumn(0, 'desc');
    await nextFrame();
    expect(text(getCellDiv(host, 'body', 'west', 0, 0))).toBe('Süd');
    api.sortByColumn(0, 'asc');
    await nextFrame();
    expect(text(getCellDiv(host, 'body', 'west', 0, 0))).toBe('Nord');
  });

  it('a double click on the header of a value column sorts', async () => {
    const m = pivot();
    const { host } = await mount(m);
    const header = getCellDiv(host, 'header', 'center', 0, 2).querySelector('span')!;
    header.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }));
    await vi.waitFor(() => expect(m.getColumnDef(2)?.sortState).toBeTruthy());
  });

  it('filter: externalFilterFunction gets the source objects, cells and totals follow', async () => {
    const tableOptions = { externalFilterFunction: (s: SaleRow) => s.produkt === 'A' };
    const { api, host, scope } = await mount(pivot(), { tableOptions });
    expect(text(getCellDiv(host, 'body', 'east', 0, 3))).toBe('220');
    expect(text(getCellDiv(host, 'footer', 'east', 0, 3))).toBe('330');
    scope.tableOptions.externalFilterFunction = (s: SaleRow) => s.monat === 'Feb';
    api.externalFilterChanged();
    await nextFrame();
    expect(text(getCellDiv(host, 'body', 'center', 0, 1))).toBe('');            // no Jan rows left
    expect(text(getCellDiv(host, 'footer', 'east', 0, 3))).toBe('220');
  });

  it('Excel and clipboard export the pivot view (header groups, raw numbers, totals)', async () => {
    const m = pivot({ rowFields: ['region', 'produkt'] });
    const selectionModel = new SelectionModel('row', 'multi');
    const { api, scope } = await mount(m, { tableOptions: { getSelectionModel: () => selectionModel } });
    const download = vi.spyOn(scope.excelService, 'downloadExcel').mockResolvedValue(undefined);
    await api.downloadExcel('pivot.xlsx');
    const matrix = download.mock.calls[0][0] as unknown[][];
    expect(matrix[0].map(v => `${v}`)).toEqual(['Region › Produkt', 'Jan', 'Feb', 'Total']);
    expect(matrix[1]).toEqual(['Nord', 150, 120, 270]);
    expect(matrix[3]).toEqual(['B', 50, undefined, 50]);
    expect(matrix.at(-1)).toEqual(['Total', 230, 220, 450]);
    vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
    selectionModel.addSelection(CellRange.singleRow(0));
    const copied = await api.copyToClipboard();
    expect(copied.split('\n')[0]).toContain('Nord');
    expect(copied.split('\n')[0]).toContain('270');
  });

  it('drill-down from a click: the source rows of the clicked cell', async () => {
    const m = pivot({ rowFields: ['region', 'produkt'] });
    await mount(m);
    expect(m.getPivotBody().getCellSourceRows(0, 1).map(s => s.umsatz)).toEqual([100, 50]);
  });

  it('setPivotConfig: new columns in the same table (no new scope), filter stays; destroy releases', async () => {
    const m = pivot();
    const tableOptions = { externalFilterFunction: (s: SaleRow) => s.region === 'Nord' };
    const { api, host, scope } = await mount(m, { tableOptions });
    api.sortByColumn(1, 'desc');
    expect(api.setPivotConfig({ columnFields: ['produkt'], rowFields: ['monat'] })).toBe(true);
    await nextFrame();
    expect(api.getTableModel()).toBe(m);
    expect(text(getCellDiv(host, 'header', 'west', 0, 0))).toBe('Monat');
    expect(text(getCellDiv(host, 'header', 'center', 0, 1))).toBe('A');
    expect(text(getCellDiv(host, 'body', 'west', 0, 0))).toBe('Feb');
    expect(text(getCellDiv(host, 'body', 'center', 0, 1))).toBe('120');        // Nord only
    expect(text(getCellDiv(host, 'footer', 'east', 0, 3))).toBe('270');
    expect(m.getColumnDefs()!.every(d => !d.sortState)).toBe(true);
    expect(api.getPivotConfig()?.rowFields).toEqual(['monat']);
    api.setPivotConfig({ columnFields: [MONTHS, 'produkt'] });
    await nextFrame();
    expect(m.getAreaModel('header').getRowCount()).toBe(2);
    expect(text(getCellDiv(host, 'header', 'center', 1, 3))).toBe('Jan Total');
    api.destroy();
    expect(scope.isDestroyed()).toBe(true);
  });

  it('setPivotConfig on a table that is no pivot table returns false', async () => {
    const { RowGroupFactory } = await import('@guiexpert/table');
    const m = RowGroupFactory.createTableModel<SaleRow>({ rows: createSales(), groupBy: ['region'] });
    const { api } = mountTable(m);
    expect(api.setPivotConfig({ rowFields: ['produkt'] })).toBe(false);
    expect(api.getPivotConfig()).toBeUndefined();
  });

  it('expanded rows are remembered (autoRestoreOptions) and survive setPivotConfig', async () => {
    const m = pivot({ rowFields: ['region', 'produkt'] });
    const { api } = await mount(m);
    api.setRowExpanded(0, false);
    api.setPivotConfig({ values: [{ value: 'umsatz', aggregator: 'avg' }] });
    await nextFrame();
    expect(api.getBodyModel().getRowCount()).toBe(4);
  });
});

describe('security, accessibility, size', () => {
  it('HTML injection: row keys, column keys and labels are text', async () => {
    const XSS = '<img src="x" onerror="geXss = 1">';
    const rows = createSales().map((s, i) => ({ ...s, region: i < 3 ? XSS : s.region, monat: i === 0 ? XSS : s.monat }));
    const m = PivotFactory.createTableModel({ rows, rowFields: ['region'], columnFields: [MONTHS], values: [{ value: 'umsatz', label: XSS }],
      totalLabel: XSS, emptyText: XSS });
    const { host } = await mount(m, { width: 1000 });
    expect(host.querySelector('img')).toBeNull();
    expect(text(getCellDiv(host, 'header', 'center', 0, 1))).toBe(XSS);
    expect(text(getCellDiv(host, 'body', 'west', 0, 0))).toBe(XSS);
    expect(text(getCellDiv(host, 'footer', 'west', 0, 0))).toBe(XSS);
    expect(text(cellDiv(host, 'body', 'center', 1, 1))).toBe(XSS);     // Süd has no XSS-month row → emptyText
  });

  it('ARIA: treegrid, row headers for labels, no axe violations', async () => {
    const { host } = await mount(pivot({ rowFields: ['region', 'produkt'], columnFields: [MONTHS, 'produkt'] }), { width: 1000 });
    expect(host.getAttribute('role')).toBe('treegrid');
    expect(getCellDiv(host, 'body', 'west', 0, 0).getAttribute('role')).toBe('rowheader');
    expect(getCellDiv(host, 'body', 'center', 0, 1).getAttribute('role')).toBe('gridcell');
    expect(getCellDiv(host, 'footer', 'west', 0, 0).getAttribute('role')).toBe('rowheader');
    expect(await axeViolations(host)).toEqual([]);
  });

  it('200,000 source rows, 500 row groups × 12 columns: renders and scrolls', async () => {
    const rows = Array.from({ length: 200_000 }, (_, i) => ({ region: `R${i % 500}`, produkt: 'A', monat: `M${i % 12}`, umsatz: 1 }));
    const m = PivotFactory.createTableModel({ rows, rowFields: ['region'], columnFields: ['monat'], values: ['umsatz'] });
    const { api, host } = await mount(m);
    expect(api.getBodyModel().getRowCount()).toBe(500);
    expect(text(getCellDiv(host, 'footer', 'east', 0, 13))).toBe('200,000');
    api.scrollToIndex(0, 499);
    await nextFrame();
    await vi.waitFor(() => expect(api.getLastVisibleRowIndex()).toBe(499));
  });
});
