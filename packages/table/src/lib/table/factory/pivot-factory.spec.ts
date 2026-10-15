// PivotFactory + AreaModelPivot + AreaModelPivotFooter + PivotTableModel (prompt 007, design § 2.3–2.8) in Node:
// columns, header groups, cells and texts, totals, options, sorting, filter, drill-down, setPivotConfig, types.
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import {
  AreaModelCellGroups,
  AreaModelPivot,
  AreaModelPivotFooter,
  CellGroupExt,
  PivotFactory,
  PivotTableModel,
  RowGroupColumnDef,
  SortItem,
  TableOptions,
  isAreaModelPivot,
  isAreaModelTree,
  isPivotColumnDef,
  isPivotTableModel,
  isRowNumberColumnDef,
  pivotRows,
  px80,
} from '@guiexpert/table';
import type { PivotTableModelParaIf, PivotValue, RowGroupIf, TableModelIf } from '@guiexpert/table';
import { createSales, P1, P2, type SaleRow } from '../../../../test-utils/grouping-fixtures';

afterEach(() => vi.restoreAllMocks());

const MONTHS = { value: 'monat' as const, order: 'insertion' as const };

function pivot(p: Partial<PivotTableModelParaIf<SaleRow>> = {}): PivotTableModel<SaleRow> {
  return PivotFactory.createTableModel<SaleRow>({
    rows: createSales(), rowFields: ['region'], columnFields: [MONTHS], values: ['umsatz'], ...p,
  });
}

const props = (m: TableModelIf) => (m.getColumnDefs() ?? []).map(d => d.property);
const labels = (m: TableModelIf) => (m.getColumnDefs() ?? []).map(d => d.headerLabel);
/** The values of all displayed body rows (group column = label). */
const bodyView = (m: TableModelIf) => {
  const body = m.getBodyModel();
  return Array.from({ length: body.getRowCount() }, (_, r) =>
    Array.from({ length: m.getColumnCount() }, (_, c) => body.getValueAt(r, c)));
};
const footerView = (m: TableModelIf) => Array.from({ length: m.getColumnCount() }, (_, c) => m.getAreaModel('footer').getValueAt(0, c));
/** The header as text rows (span cells by label, covered cells as "·"). */
const headerView = (m: TableModelIf) => {
  const header = m.getAreaModel('header');
  return Array.from({ length: header.getRowCount() }, (_, r) =>
    Array.from({ length: m.getColumnCount() }, (_, c) => {
      const v = header.getValueAt(r, c);
      return v instanceof CellGroupExt ? `${v.data}` : '·';
    }));
};

describe('PivotFactory.createTableModel', () => {
  it('case 1: group column (fixed), value columns, total column (fixed right), header, body and footer', () => {
    const m = pivot();
    expect(isPivotTableModel(m)).toBe(true);
    expect(isAreaModelPivot(m.getBodyModel())).toBe(true);
    expect(isAreaModelTree(m.getBodyModel())).toBe(true);
    expect(labels(m)).toEqual(['Region', 'Jan', 'Feb', 'Total']);
    expect(props(m)[0]).toBe(RowGroupColumnDef.PROPERTY);
    expect(props(m).slice(1)).toEqual([
      'pivot:[["monat","s:Jan"],"sum(umsatz)"]', 'pivot:[["monat","s:Feb"],"sum(umsatz)"]', 'pivot:total:["sum(umsatz)"]',
    ]);
    expect([m.getFixedLeftColumnCount(), m.getFixedRightColumnCount(), m.getColumnCount()]).toEqual([1, 1, 4]);
    expect(m.getAreaModel('header').getRowCount()).toBe(1);
    expect(bodyView(m)).toEqual([
      ['Nord', P1.Nord.Jan, P1.Nord.Feb, P1.Nord.total],
      ['Süd', P1.Süd.Jan, P1.Süd.Feb, P1.Süd.total],
    ]);
    expect(footerView(m)).toEqual(['Total', P1.total.Jan, P1.total.Feb, P1.total.total]);
    expect(m.getAreaModel('footer')).toBeInstanceOf(AreaModelPivotFooter);
  });

  it('case 2: a tree with subtotals in the group rows; missing combinations: value undefined, text emptyText', () => {
    const m = pivot({ rowFields: ['region', 'produkt'], emptyText: '–' });
    expect(labels(m)[0]).toBe('Region › Produkt');
    expect(bodyView(m)).toEqual([
      ['Nord', P2.Nord.Jan, P2.Nord.Feb, P2.Nord.total],
      ['A', P2.Nord.A.Jan, P2.Nord.A.Feb, P2.Nord.A.total],
      ['B', P2.Nord.B.Jan, undefined, P2.Nord.B.total],
      ['Süd', P2.Süd.Jan, P2.Süd.Feb, P2.Süd.total],
      ['A', P2.Süd.A.Jan, P2.Süd.A.Feb, P2.Süd.A.total],
      ['B', undefined, P2.Süd.B.Feb, P2.Süd.B.total],
    ]);
    const body = m.getPivotBody();
    expect(body.getTextValueAt(2, 2)).toBe('–');
    expect(body.getTextValueAt(0, 3)).toBe('270');
    expect(body.getCustomClassesAt(2, 2)).toContain('ge-table-pivot-empty');
  });

  it('case 3: avg – texts with at most two decimals, footer Jan 76.67', () => {
    const m = pivot({ values: [{ value: 'umsatz', aggregator: 'avg' }] });
    const footer = m.getAreaModel('footer');
    expect(footer.getValueAt(0, 1)).toBeCloseTo(76.6667, 4);
    expect(footer.getTextValueAt(0, 1)).toBe('76.67');
    expect(footer.getTextValueAt(0, 0)).toBe('Total');
  });

  it('every built-in aggregator through the factory gives the engine result', () => {
    for (const name of ['sum', 'count', 'avg', 'min', 'max', 'countDistinct', 'first', 'last'] as const) {
      const m = pivot({ values: [{ value: 'umsatz', aggregator: name }] });
      const result = m.getPivotBody().getResult();
      expect(bodyView(m)[0][1], name).toEqual(result.getValue(result.rowGroups[0], result.columnLeaves[0]));
      expect(footerView(m)[3], name).toEqual(result.getValue());
    }
  });

  it('CSS classes: value, subtotal (group rows), total (total column, footer), label, level', () => {
    const m = pivot({ rowFields: ['region', 'produkt'] });
    const body = m.getPivotBody();
    expect(body.getCustomClassesAt(0, 0)).toEqual(expect.arrayContaining(['ge-table-pivot-label', 'ge-table-pivot-subtotal', 'ge-table-pivot-level-0']));
    expect(body.getCustomClassesAt(0, 1)).toEqual(expect.arrayContaining(['ge-table-pivot-value', 'ge-table-pivot-subtotal']));
    expect(body.getCustomClassesAt(1, 1)).toEqual(expect.arrayContaining(['ge-table-pivot-value', 'ge-table-pivot-level-1']));
    expect(body.getCustomClassesAt(1, 1)).not.toContain('ge-table-pivot-subtotal');
    expect(body.getCustomClassesAt(1, 3)).toContain('ge-table-pivot-total');
    expect(m.getAreaModel('footer').getCustomClassesAt(0, 1)).toEqual(['ge-table-pivot-value', 'ge-table-pivot-total']);
    expect(m.getAreaModel('footer').getCustomClassesAt(0, 0)).toEqual(['ge-table-pivot-total', 'ge-table-pivot-label']);
  });

  it('row headers, not editable, renderer only for values', () => {
    const m = pivot();
    const body = m.getPivotBody();
    expect([body.isRowHeaderCell(0, 0), body.isRowHeaderCell(0, 1), body.isRowHeaderCell(9, 0)]).toEqual([true, false, false]);
    const footer = m.getAreaModel('footer') as AreaModelPivotFooter;
    expect([footer.isRowHeaderCell(0, 0), footer.isRowHeaderCell(0, 1)]).toEqual([true, false]);
    expect([body.isEditable(0, 1), body.setValue(0, 1, 5)]).toEqual([false, false]);
    expect(body.getCellRenderer(0, 0)).toBeUndefined();
    expect(body.getCellRenderer(0, 1)).toBeDefined();
    expect(body.getValueAt(99, 1)).toBe('');
  });

  it('two column fields: header rows, spans, subtotal columns (toggle, visibility "always") and ids', () => {
    const m = pivot({ columnFields: [MONTHS, 'produkt'] });
    expect(labels(m)).toEqual(['Region', 'A', 'B', 'Jan Total', 'A', 'B', 'Feb Total', 'Total']);
    expect(headerView(m)).toEqual([
      ['Region', 'Jan', '·', '·', 'Feb', '·', '·', 'Total'],
      ['·', 'A', 'B', 'Jan Total', 'A', 'B', 'Feb Total', '·'],
    ]);
    const header = m.getAreaModel('header') as AreaModelCellGroups;
    expect(header.getColspanAt(0, 1)).toBe(3);
    expect(header.getRowspanAt(0, 0)).toBe(2);
    expect(header.getToggleGroupStates().map(s => s.id)).toEqual(['rowgroup:[["monat","s:Jan"]]', 'rowgroup:[["monat","s:Feb"]]']);
    expect(bodyView(m)[0]).toEqual(['Nord', 100, 50, 150, 120, undefined, 120, 270]);
    // collapse Jan: only its total stays, widths are kept (same ColumnDef objects)
    const before = m.getColumnDefs()!;
    const after = header.setGroupClosed('rowgroup:[["monat","s:Jan"]]', true)!;
    expect(after).toEqual(before);
    expect(after.filter(d => d.isVisible?.() !== false).map(d => d.headerLabel)).toEqual(['Region', 'Jan Total', 'A', 'B', 'Feb Total', 'Total']);
  });

  it('columnSubtotals: false – no subtotal columns, no toggle; true with one field', () => {
    const off = pivot({ columnFields: [MONTHS, 'produkt'], columnSubtotals: false });
    expect(labels(off)).toEqual(['Region', 'A', 'B', 'A', 'B', 'Total']);
    expect((off.getAreaModel('header') as AreaModelCellGroups).getToggleGroupStates()).toEqual([]);
    const on = pivot({ rowFields: ['region'], columnFields: ['produkt', MONTHS], columnSubtotals: true });
    expect(labels(on)).toEqual(['Region', 'Jan', 'Feb', 'A Total', 'Jan', 'Feb', 'B Total', 'Total']);
  });

  it('two values: sub-columns per key, value labels in the lowest header row', () => {
    const m = pivot({ values: [{ value: 'umsatz', label: 'Sum' }, { value: 'umsatz', aggregator: 'count', label: 'Count' }] });
    expect(labels(m)).toEqual(['Region', 'Sum', 'Count', 'Sum', 'Count', 'Sum', 'Count']);
    expect(headerView(m)).toEqual([
      ['Region', 'Jan', '·', 'Feb', '·', 'Total', '·'],
      ['·', 'Sum', 'Count', 'Sum', 'Count', 'Sum', 'Count'],
    ]);
    expect(m.getFixedRightColumnCount()).toBe(2);
    expect(bodyView(m)[0]).toEqual(['Nord', 150, 2, 120, 1, 270, 3]);
    expect(footerView(m)).toEqual(['Total', 230, 3, 220, 3, 450, 6]);
  });

  it('totalColumn: true (scrolled) and false; totalRow: false; subtotals: false; no column fields', () => {
    expect(pivot({ totalColumn: true }).getFixedRightColumnCount()).toBe(0);
    const noTotal = pivot({ totalColumn: false });
    expect(labels(noTotal)).toEqual(['Region', 'Jan', 'Feb']);
    expect(pivot({ totalRow: false }).getAreaModel('footer').getRowCount()).toBe(0);
    const noSub = pivot({ rowFields: ['region', 'produkt'], subtotals: false });
    expect(bodyView(noSub)[0]).toEqual(['Nord', undefined, undefined, undefined]);
    expect(noSub.getPivotBody().getTextValueAt(0, 1)).toBe('');
    expect(bodyView(noSub)[1]).toEqual(['A', 100, 120, 220]);
    const noColumns = pivot({ columnFields: [], values: ['umsatz', { value: 'umsatz', aggregator: 'count', label: 'Count' }] });
    expect(labels(noColumns)).toEqual(['Region', 'sum(umsatz)', 'Count']);
    expect(noColumns.getFixedRightColumnCount()).toBe(0);
    expect(bodyView(noColumns)).toEqual([['Nord', 270, 3], ['Süd', 180, 3]]);
  });

  it('no row fields: one body row "Total", no footer', () => {
    const m = pivot({ rowFields: [] });
    expect(bodyView(m)).toEqual([['Total', 230, 220, 450]]);
    expect(m.getAreaModel('footer').getRowCount()).toBe(0);
    expect(m.getPivotBody().getRowGroup(0)).toBeUndefined();
    expect(m.getPivotBody().getCellSourceRows(0, 1)).toHaveLength(3);
  });

  it('labels: totalLabel, emptyLabel, groupColumn options (showCount, label, headerLabel, width)', () => {
    const rows = [...createSales(), { region: '', produkt: 'A', monat: 'Jan', umsatz: 1 }];
    const m = PivotFactory.createTableModel<SaleRow>({
      rows, rowFields: [{ value: 'region', label: 'Gebiet' }], columnFields: [MONTHS], values: ['umsatz'],
      totalLabel: 'Summe', emptyLabel: '(ohne)', groupColumn: { showCount: true, width: px80 }, valueColumnWidth: px80,
    });
    expect(labels(m)).toEqual(['Gebiet', 'Jan', 'Feb', 'Summe']);
    expect(bodyView(m).map(r => r[0])).toEqual(['Nord (3)', 'Süd (3)', '(ohne) (1)']);
    expect(footerView(m)[0]).toBe('Summe');
    expect(m.getColumnDefs()!.map(d => d.width.value)).toEqual([80, 80, 80, 80]);
    const own = pivot({ groupColumn: { headerLabel: 'Area', label: (g: RowGroupIf) => `${g.label}!` } });
    expect(labels(own)[0]).toBe('Area');
    expect(bodyView(own)[0][0]).toBe('Nord!');
  });

  it('row numbers in front of the group column (both fixed)', () => {
    const m = pivot({ rowNumbersVisible: true });
    expect(isRowNumberColumnDef(m.getColumnDefs()![0])).toBe(true);
    expect(props(m)[1]).toBe(RowGroupColumnDef.PROPERTY);
    expect(m.getFixedLeftColumnCount()).toBe(2);
    expect(headerView(m)[0].slice(0, 2)).toEqual(['#', 'Region']);
    const notFixed = pivot({ groupColumn: { fixed: false } });
    expect(notFixed.getFixedLeftColumnCount()).toBe(0);
  });

  it('row heights and the header group icons from the table options', () => {
    const tableOptions = new TableOptions();
    tableOptions.defaultRowHeights = { header: 40, body: 30, footer: 28 };
    const m = pivot({ tableOptions });
    expect([m.getRowHeight('header', 0), m.getRowHeight('body', 0), m.getRowHeight('footer', 0)]).toEqual([40, 30, 28]);
  });
});

describe('AreaModelPivot', () => {
  it('getColumnProperty / getColumnIndex / getColumnInfo', () => {
    const m = pivot({ columnFields: [MONTHS, 'produkt'] });
    const body = m.getPivotBody();
    expect(body.getColumnIndex(['Jan', 'B'])).toBe(2);
    expect(body.getColumnIndex(['Jan'])).toBe(3);                     // the subtotal column of Jan
    expect(body.getColumnIndex([])).toBe(7);
    expect(body.getColumnIndex(['Mar'])).toBe(-1);
    expect(body.getColumnProperty(['Jan', 'A'], 'unknown')).toBeUndefined();
    expect(body.getColumnInfo(2)).toMatchObject({ kind: 'value', valueIndex: 0 });
    expect(body.getColumnInfo(2)?.column?.path).toEqual(['Jan', 'B']);
    expect(body.getColumnInfo(3)?.kind).toBe('subtotal');
    expect(body.getColumnInfo(7)?.kind).toBe('total');
    expect(body.getColumnInfo(0)).toBeUndefined();
    expect(body.getPropertyAt(0)).toBe(RowGroupColumnDef.PROPERTY);
    expect(isPivotColumnDef(m.getColumnDefs()![1])).toBe(true);
  });

  it('getCellSourceRows: drill-down of a cell, a subtotal and a total', () => {
    const m = pivot({ rowFields: ['region', 'produkt'] });
    const body = m.getPivotBody();
    expect(body.getCellSourceRows(0, 1).map(s => s.umsatz)).toEqual([100, 50]);   // Nord, Jan
    expect(body.getCellSourceRows(1, 3).map(s => s.umsatz)).toEqual([100, 120]);  // Nord A, Total
    expect(body.getCellSourceRows(0, 0).map(s => s.umsatz)).toEqual([100, 50, 120]);
    expect(body.getCellSourceRows(99, 1)).toEqual([]);
  });

  it('filter: the predicate gets the source objects; cells, totals and rows follow, columns stay', () => {
    const m = pivot({ rowFields: ['region', 'produkt'] });
    const body = m.getPivotBody();
    const seen: unknown[] = [];
    body.externalFilterChanged((s: SaleRow) => { seen.push(s); return s.produkt === 'B'; });
    expect(seen).toHaveLength(6);
    expect(seen[0]).toBe(body.getSourceRows()[0]);
    expect(bodyView(m)).toEqual([
      ['Nord', 50, undefined, 50], ['B', 50, undefined, 50],
      ['Süd', undefined, 70, 70], ['B', undefined, 70, 70],
    ]);
    expect(footerView(m)).toEqual(['Total', 50, 70, 120]);
    expect(body.getUnfilteredRowCount()).toBe(6);
    body.externalFilterChanged(() => false);
    expect(body.getRowCount()).toBe(0);
  });

  it('doSort by a value column (empty cells last in both directions) and by the group column; sort(fn)', () => {
    const m = pivot({ rowFields: ['region', 'produkt'] });
    const body = m.getPivotBody();
    const labelsOf = () => bodyView(m).map(r => r[0]);
    body.doSort([new SortItem(2, 'desc')]);   // Feb
    expect(labelsOf()).toEqual(['Nord', 'A', 'B', 'Süd', 'B', 'A']);
    body.doSort([new SortItem(2, 'asc')]);
    expect(labelsOf()).toEqual(['Süd', 'A', 'B', 'Nord', 'A', 'B']);   // Nord B (no Feb) stays last
    body.doSort([new SortItem(0, 'desc')]);
    expect(labelsOf()).toEqual(['Süd', 'B', 'A', 'Nord', 'B', 'A']);
    expect(body.doSort([])).toBe(false);
    body.doSort([new SortItem(0, '')]);
    body.sort((a: RowGroupIf, b: RowGroupIf) => a.count - b.count || String(a.key).localeCompare(String(b.key)));
    expect(labelsOf()).toEqual(['Nord', 'B', 'A', 'Süd', 'B', 'A']);   // by count (Süd B: 1, A: 2), then key
  });

  it('a column with an own sortComparator', () => {
    const m = pivot();
    const def = m.getColumnDefs()![1];
    def.sortComparator = (a: number, b: number) => (a % 100) - (b % 100);   // 150 → 50, 80 → 80
    m.getPivotBody().doSort([new SortItem(1, 'asc')]);
    expect(bodyView(m).map(r => r[0])).toEqual(['Nord', 'Süd']);
  });

  it('expanded: a number opens the levels above, a function per group', () => {
    const closed = pivot({ rowFields: ['region', 'produkt'], expanded: 0 });
    expect(bodyView(closed).map(r => r[0])).toEqual(['Nord', 'Süd']);
    const onlyNorth = pivot({ rowFields: ['region', 'produkt'], expanded: (g: RowGroupIf) => g.key === 'Nord' });
    expect(bodyView(onlyNorth).map(r => r[0])).toEqual(['Nord', 'A', 'B', 'Süd']);
    expect(pivot({ rowFields: ['region', 'produkt'], expanded: false }).getBodyModel().getRowCount()).toBe(2);
  });

  it('invalidateDerivedValues: changed source values are computed again on the next read', () => {
    const m = pivot();
    const body = m.getPivotBody();
    expect(bodyView(m)[0][3]).toBe(270);
    body.getSourceRows()[0].umsatz = 1000;
    expect(bodyView(m)[0][3]).toBe(270);   // cached
    body.invalidateDerivedValues();
    expect(bodyView(m)[0][3]).toBe(1170);
  });
});

describe('PivotTableModel.setPivotConfig', () => {
  it('new column fields: new columns and header in the same objects; widths and expanded rows stay', () => {
    const m = pivot({ rowFields: ['region', 'produkt'] });
    const header = m.getAreaModel('header');
    const body = m.getBodyModel();
    m.init();   // column sizes (the table calls it)
    m.setColumnWidth(m.getPivotBody().getColumnIndex([]), 150);
    m.getPivotBody().rows[0].expanded = false;   // Nord closed
    m.getPivotBody().recalcVisibleTreeRows(false);
    m.setPivotConfig({ columnFields: ['produkt'] });
    expect(m.getAreaModel('header')).toBe(header);
    expect(m.getBodyModel()).toBe(body);
    expect(labels(m)).toEqual(['Region › Produkt', 'A', 'B', 'Total']);
    expect(m.getColumnCount()).toBe(4);
    expect(m.getColumnDefs()![3].width.value).toBe(150);
    expect(bodyView(m).map(r => r[0])).toEqual(['Nord', 'Süd', 'A', 'B']);
    expect(bodyView(m)[0]).toEqual(['Nord', 220, 50, 270]);
    expect(m.getPivotConfig().columnFields).toEqual(['produkt']);
  });

  it('new row fields update the header of the group column; new values; fixed right count follows', () => {
    const m = pivot();
    m.setPivotConfig({ rowFields: ['produkt'], values: ['umsatz', { value: 'umsatz', aggregator: 'count' }] });
    expect(labels(m)[0]).toBe('Produkt');
    expect(m.getFixedRightColumnCount()).toBe(2);
    expect(bodyView(m)[0]).toEqual(['A', 180, 2, 150, 2, 330, 4]);
    m.setPivotConfig({ totalColumn: false });
    expect(m.getFixedRightColumnCount()).toBe(0);
  });

  it('new rows; collapsed column groups stay collapsed; an invalid field throws before anything changes', () => {
    const m = pivot({ columnFields: [MONTHS, 'produkt'] });
    const header = m.getAreaModel('header') as AreaModelCellGroups;
    header.setGroupClosed('rowgroup:[["monat","s:Jan"]]', true);
    m.setPivotConfig({}, [...createSales(), { region: 'Ost', produkt: 'A', monat: 'Jan', umsatz: 5 }]);
    expect(header.getToggleGroupStates()).toEqual([
      { id: 'rowgroup:[["monat","s:Jan"]]', closed: true }, { id: 'rowgroup:[["monat","s:Feb"]]', closed: false },
    ]);
    expect(bodyView(m).map(r => r[0])).toEqual(['Nord', 'Ost', 'Süd']);
    expect(() => m.setPivotConfig({ rowFields: [{} as never] })).toThrow();
    expect(bodyView(m)).toHaveLength(3);
  });

  it('the filter stays after a new configuration', () => {
    const m = pivot();
    m.getPivotBody().externalFilterChanged((s: SaleRow) => s.monat === 'Jan');
    m.setPivotConfig({ rowFields: ['produkt'] });
    expect(bodyView(m)).toEqual([['A', 180, undefined, 180], ['B', 50, undefined, 50]]);
  });
});

describe('edge cases', () => {
  it('value format in body and footer; row number column has no pivot content', () => {
    const m = pivot({ rowNumbersVisible: { exported: true }, values: [{ value: 'umsatz', format: v => `${v} €` }] });
    const body = m.getPivotBody();
    const footer = m.getAreaModel('footer') as AreaModelPivotFooter;
    expect(body.getTextValueAt(0, 2)).toBe('150 €');
    expect(footer.getTextValueAt(0, 2)).toBe('230 €');
    expect(footer.getTextValueAt(0, 1)).toBe('Total');
    expect([body.getValueAt(0, 0), body.getTextValueAt(0, 0)]).toEqual(['', '']);   // row numbers: drawn by their column
    expect(body.getCustomClassesAt(0, 0)).not.toContain('ge-table-pivot-value');
    expect([footer.getValueAt(0, 0), footer.getTextValueAt(0, 0), footer.getCellRenderer(0, 0), footer.getCustomClassesAt(0, 0)])
      .toEqual(['', '', undefined, []]);
    expect([footer.getValueAt(1, 2), footer.getRowHeight(0), footer.getConstantRowHeight()]).toEqual(['', 34, 34]);
    expect(footer.getCellRenderer(0, 2)).toBeDefined();
    expect(body.getTextValueAt(0, 1)).toBe('Nord');
  });

  it('footer: empty column total with emptyText and the empty class', () => {
    const m = pivot({ emptyText: '–' });
    m.getPivotBody().externalFilterChanged((s: SaleRow) => s.monat === 'Feb');
    const footer = m.getAreaModel('footer');
    expect([footer.getValueAt(0, 1), footer.getTextValueAt(0, 1)]).toEqual([undefined, '–']);
    expect(footer.getCustomClassesAt(0, 1)).toContain('ge-table-pivot-empty');
  });

  it('a third value with the same name; an own label function returning nothing; getBuildCount', () => {
    const m = pivot({ values: ['umsatz', 'umsatz', 'umsatz'], groupColumn: { label: () => undefined as never } });
    expect(m.getPivotBody().getResult().values.map(v => v.name)).toEqual(['sum(umsatz)', 'sum(umsatz)#2', 'sum(umsatz)#3']);
    expect(bodyView(m)[0][0]).toBe('');
    const before = m.getPivotBody().getBuildCount();
    m.setPivotConfig({});
    expect(m.getPivotBody().getBuildCount()).toBe(before + 1);
  });

  it('sorting: two empty cells are equal; a column without info does not sort', () => {
    const rows = [{ r: 'a', c: 'x', v: 1 }, { r: 'c', c: 'y', v: 3 }, { r: 'b', c: 'y', v: 2 }];
    const m = PivotFactory.createTableModel({ rows, rowFields: [{ value: 'r', order: 'insertion' }], columnFields: ['c'], values: ['v'], rowNumbersVisible: true });
    const body = m.getPivotBody();
    body.doSort([new SortItem(2, 'asc')]);   // column x: a = 1, c and b empty (stay in order)
    expect(bodyView(m).map(r => r[1])).toEqual(['a', 'c', 'b']);
    body.doSort([new SortItem(0, 'asc')]);   // row numbers: no pivot column
    expect(bodyView(m).map(r => r[1])).toEqual(['a', 'c', 'b']);
  });

  it('maxColumns with two column fields: a column group without shown keys is left out', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const m = pivot({ columnFields: [MONTHS, 'produkt'], maxColumns: 2 });
    expect(labels(m)).toEqual(['Region', 'A', 'B', 'Jan Total', 'Total']);
    expect(m.getPivotBody().getResult().truncated).toBe(true);
    expect(bodyView(m)[0]).toEqual(['Nord', 100, 50, 150, 270]);
  });

  it('own group column header stays after setPivotConfig; columnFields: undefined = totals only', () => {
    const m = pivot({ groupColumn: { headerLabel: 'Area' } });
    m.setPivotConfig({ rowFields: ['produkt'], columnFields: undefined });
    expect(labels(m)).toEqual(['Area', 'sum(umsatz)']);
    expect(bodyView(m)).toEqual([['A', 330], ['B', 120]]);
  });

  it('JavaScript callers: missing arrays are empty', () => {
    const m = PivotFactory.createTableModel({ rows: undefined as never, rowFields: undefined as never, values: ['umsatz'] });
    expect(bodyView(m)).toEqual([['Total', undefined]]);
    m.setPivotConfig({ rowFields: undefined as never });
    expect(m.getBodyModel().getRowCount()).toBe(1);
    expect(pivotRows(undefined as never, { rowFields: ['a'], values: ['v'] }).getValue()).toBeUndefined();
    expect(pivotRows([{ v: 1 }], { rowFields: undefined as never, values: ['v'] }).getValue()).toBe(1);
  });
});

describe('review fixes', () => {
  it('a setPivotConfig that throws changes nothing (config, rows, columns)', () => {
    const m = pivot();
    const before = { config: m.getPivotConfig(), labels: labels(m), view: bodyView(m) };
    expect(() => m.setPivotConfig({ values: [] })).toThrow(/at least one value/);
    expect(() => m.setPivotConfig({ columnFields: [42 as never] })).toThrow();
    expect(m.getPivotConfig()).toEqual(before.config);
    expect(labels(m)).toEqual(before.labels);
    expect(bodyView(m)).toEqual(before.view);
    m.setPivotConfig({ columnFields: ['produkt'] });   // a later partial change works
    expect(labels(m)).toEqual(['Region', 'A', 'B', 'Total']);
  });

  it('rows added in place + invalidateDerivedValues: the filter still applies', () => {
    const m = pivot();
    const body = m.getPivotBody();
    body.externalFilterChanged((s: SaleRow) => s.region === 'Nord');
    body.getSourceRows().push({ region: 'Süd', produkt: 'A', monat: 'Jan', umsatz: 1000 });
    body.invalidateDerivedValues();
    expect(body.getResult().getValue()).toBe(270);
  });

  it('subtotal columns count all keys of their group, also the ones cut off by maxColumns', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const rows = [{ a: 'A', y: 2025, q: 1, v: 1 }, { a: 'A', y: 2025, q: 2, v: 10 }, { a: 'A', y: 2026, q: 1, v: 100 }];
    const m = PivotFactory.createTableModel({ rows, rowFields: ['a'], columnFields: ['y', 'q'], values: ['v'], maxColumns: 1 });
    expect(labels(m)).toEqual(['A', '1', '2025 Total', 'Total']);
    expect(bodyView(m)[0]).toEqual(['A', 1, 11, 111]);
    expect(m.getPivotBody().getCellSourceRows(0, 2).map(r => r.v)).toEqual([1, 10]);
  });

  it('getColumnProperty([]) is undefined without a total column', () => {
    expect(pivot({ totalColumn: false }).getPivotBody().getColumnProperty([])).toBeUndefined();
  });

  it('a column hidden by the API stays hidden after setPivotConfig', () => {
    const m = pivot();
    const jan = m.getPivotBody().getColumnProperty(['Jan'])!;
    m.setColumnVisible(jan, false);
    m.setPivotConfig({ rowFields: ['produkt'] });
    expect(m.isColumnVisible(jan)).toBe(false);
    expect(m.isColumnVisible(m.getPivotBody().getColumnProperty(['Feb'])!)).toBe(true);
  });
});

describe('types', () => {
  it('generic fields and values', () => {
    expectTypeOf(PivotFactory.createTableModel<SaleRow>).parameter(0).toHaveProperty('rows').toEqualTypeOf<SaleRow[]>();
    expectTypeOf<PivotValue<SaleRow>>().toMatchTypeOf<string | ((row: SaleRow) => unknown) | object>();
    expectTypeOf(pivot().getPivotBody()).toEqualTypeOf<AreaModelPivot<SaleRow>>();
    expectTypeOf(pivot().getPivotBody().getCellSourceRows(0, 0)).toEqualTypeOf<SaleRow[]>();
    // @ts-expect-error an accessor gets the row type
    PivotFactory.createTableModel<SaleRow>({ rows: [], rowFields: [(s: SaleRow) => s.unknown], values: ['umsatz'] });
  });
});
