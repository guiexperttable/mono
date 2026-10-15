// AreaModelAggregateFooter without a browser (prompt 005, design § 2.4–2.6): G7, G8, cache (G10), invalidation (G9),
// data sources (flat, all, tree, own models), labels, formatting, factory option footerAggregates.
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  AreaModel,
  AreaModelAggregateFooter,
  AreaModelObjectArray,
  AreaModelTree,
  CheckboxColumnDef,
  ColumnDef,
  RowNumberColumnDef,
  TableFactory,
  TreeRow,
  isAreaModelAggregateFooter,
} from '@guiexpert/table';
import type { AggregatorIf, AreaModelIf, ColumnDefIf } from '@guiexpert/table';
import { createSales, type SaleRow } from '../../../../../../test-utils/grouping-fixtures';

afterEach(() => vi.restoreAllMocks());

function salesColumns(): ColumnDefIf[] {
  return ['region', 'produkt', 'monat', 'umsatz'].map(p => new ColumnDef(p, p));
}

function salesBody(rows: SaleRow[] = createSales(), columnDefs = salesColumns()): AreaModelObjectArray<SaleRow> {
  return new AreaModelObjectArray<SaleRow>('body', rows, 34, columnDefs);
}

/** All cell values of a footer row (for a quick comparison). */
function rowValues(footer: AreaModelIf, rowIndex: number, columnCount: number): unknown[] {
  return Array.from({ length: columnCount }, (_, c) => footer.getValueAt(rowIndex, c));
}

describe('basics', () => {
  it('is a footer, one row per aggregate row, type marker', () => {
    const columns = salesColumns();
    const footer = new AreaModelAggregateFooter(salesBody(createSales(), columns), columns, { umsatz: 'sum' });
    expect(footer.areaIdent).toBe('footer');
    expect(footer.getRowCount()).toBe(1);
    expect(footer.getRowHeight(0)).toBe(34);
    expect(footer.getConstantRowHeight()).toBe(34);
    expect(isAreaModelAggregateFooter(footer)).toBe(true);
    expect(isAreaModelAggregateFooter(new AreaModel())).toBe(false);
    expect(isAreaModelAggregateFooter(undefined)).toBe(false);
  });

  it('G7: one row – label "6 rows" in the first column without aggregate, the sum in its column', () => {
    const columns = salesColumns();
    const footer = new AreaModelAggregateFooter(salesBody(createSales(), columns), columns, { umsatz: 'sum' });
    expect(rowValues(footer, 0, 4)).toEqual(['6 rows', '', '', 450]);
    expect(footer.getTextValueAt(0, 3)).toBe('450');
    expect(footer.isLabelCell(0, 0)).toBe(true);
    expect(footer.isLabelCell(0, 3)).toBe(false);
    expect(footer.getResults()).toEqual({ umsatz: 450 });
    expect(footer.getAggregationRowCount()).toBe(6);
  });

  it('"1 row", thousands separators in the default label', () => {
    const columns = salesColumns();
    expect(new AreaModelAggregateFooter(salesBody(createSales().slice(0, 1), columns), columns, { umsatz: 'sum' })
      .getValueAt(0, 0)).toBe('1 row');
    const many = Array.from({ length: 1234 }, () => createSales()[0]);
    expect(new AreaModelAggregateFooter(salesBody(many, columns), columns, { umsatz: 'sum' })
      .getValueAt(0, 0)).toBe('1,234 rows');
  });

  it('the label skips columns with an aggregate (also the row number and checkbox column)', () => {
    const columns: ColumnDefIf[] = [new RowNumberColumnDef(), new CheckboxColumnDef(), ...salesColumns()];
    const footer = new AreaModelAggregateFooter(salesBody(createSales(), columns), columns,
      { region: 'countDistinct', umsatz: 'sum' });
    expect(rowValues(footer, 0, 6)).toEqual(['', '', 2, '6 rows', '', 450]);
  });

  it('classes: results ge-table-footer-aggregate; the label may overflow only into an empty next cell', () => {
    const columns = salesColumns();
    const footer = new AreaModelAggregateFooter(salesBody(createSales(), columns), columns, [
      { aggregates: { umsatz: 'sum' } },
      { aggregates: { produkt: 'countDistinct', umsatz: 'avg' } },
    ]);
    expect(footer.getCustomClassesAt(0, 0)).toEqual(['ge-table-footer-label', 'ge-table-footer-label-overflow']);
    expect(footer.getCustomClassesAt(0, 3)).toEqual(['ge-table-footer-aggregate']);
    expect(footer.getCustomClassesAt(0, 1)).toEqual([]);
    expect(footer.getCustomClassesAt(1, 0)).toEqual(['ge-table-footer-label']);   // produkt (next) shows a value
    const last = new AreaModelAggregateFooter(salesBody(createSales(), columns), columns,
      { labelProperty: 'umsatz', rows: [{ aggregates: { region: 'count' } }] });
    expect(last.getCustomClassesAt(0, 3)).toEqual(['ge-table-footer-label', 'ge-table-footer-label-overflow']);
  });

  it('labelProperty puts the label into a given column; a string label is used as it is', () => {
    const columns = salesColumns();
    const footer = new AreaModelAggregateFooter(salesBody(createSales(), columns), columns, {
      labelProperty: 'monat',
      rows: [{ label: 'Total', aggregates: { umsatz: 'sum' } }],
    });
    expect(rowValues(footer, 0, 4)).toEqual(['', '', 'Total', 450]);
  });

  it('no label if every column has an aggregate', () => {
    const columns = salesColumns();
    const footer = new AreaModelAggregateFooter(salesBody(createSales(), columns), columns,
      { region: 'countDistinct', produkt: 'countDistinct', monat: 'countDistinct', umsatz: 'sum' });
    expect(rowValues(footer, 0, 4)).toEqual([2, 2, 2, 450]);
    expect([0, 1, 2, 3].some(c => footer.isLabelCell(0, c))).toBe(false);
  });

  it('a label function gets the row count and the results', () => {
    const columns = salesColumns();
    const label = vi.fn((n: number, r: Record<string, unknown>) => `${n} sales, ${r['umsatz']} €`);
    const footer = new AreaModelAggregateFooter(salesBody(createSales(), columns), columns,
      [{ label, aggregates: { umsatz: 'sum' } }]);
    expect(footer.getValueAt(0, 0)).toBe('6 sales, 450 €');
    expect(label).toHaveBeenCalledWith(6, { umsatz: 450 });
  });

  it('cells outside the rows/columns are empty', () => {
    const columns = salesColumns();
    const footer = new AreaModelAggregateFooter(salesBody(createSales(), columns), columns, { umsatz: 'sum' });
    expect(footer.getValueAt(1, 3)).toBe('');
    expect(footer.getValueAt(0, 9)).toBe('');
    expect(footer.getTextValueAt(0, 9)).toBe('');
    expect(footer.getResults(5)).toEqual({});
  });

  it('accepts the body model as a function (built before the table model)', () => {
    const columns = salesColumns();
    const body = salesBody(createSales(), columns);
    const footer = new AreaModelAggregateFooter(() => body, columns, { umsatz: 'max' });
    expect(footer.getValueAt(0, 3)).toBe(120);
  });

  it('an empty options object or empty rows → no footer rows', () => {
    const columns = salesColumns();
    expect(new AreaModelAggregateFooter(salesBody(), columns, []).getRowCount()).toBe(0);
    expect(new AreaModelAggregateFooter(salesBody(), columns, { rows: [] }).getRowCount()).toBe(0);
  });
});

describe('G8 – several rows', () => {
  it('sum and average, each with its own label', () => {
    const columns = salesColumns();
    const footer = new AreaModelAggregateFooter(salesBody(createSales(), columns), columns, [
      { label: 'Sum', aggregates: { umsatz: 'sum' } },
      { label: (n: number) => `Ø of ${n}`, aggregates: { umsatz: 'avg' } },
    ]);
    expect(footer.getRowCount()).toBe(2);
    expect(rowValues(footer, 0, 4)).toEqual(['Sum', '', '', 450]);
    expect(rowValues(footer, 1, 4)).toEqual(['Ø of 6', '', '', 75]);
  });

  it('without labels: the word of the aggregator if all aggregates of the row use the same one', () => {
    const columns = salesColumns();
    const footer = new AreaModelAggregateFooter(salesBody(createSales(), columns), columns, [
      { aggregates: { umsatz: 'sum' } },
      { aggregates: { umsatz: 'avg' } },
      { aggregates: { umsatz: 'min' } },
      { aggregates: { umsatz: 'max' } },
      { aggregates: { region: 'countDistinct', umsatz: 'count' } },
    ]);
    expect([0, 1, 2, 3].map(r => footer.getValueAt(r, 0))).toEqual(['Sum', 'Average', 'Min', 'Max']);
    expect(rowValues(footer, 4, 4)).toEqual([2, '6 rows', '', 6]);
  });

  it('a single row without label keeps "6 rows"', () => {
    const columns = salesColumns();
    const footer = new AreaModelAggregateFooter(salesBody(createSales(), columns), columns, [{ aggregates: { umsatz: 'avg' } }]);
    expect(footer.getValueAt(0, 0)).toBe('6 rows');
  });
});

describe('G3 – follows filter and sorting of the body', () => {
  it('filter January → 230 / 3 rows; filter removed → 450', () => {
    const columns = salesColumns();
    const body = salesBody(createSales(), columns);
    const footer = new AreaModelAggregateFooter(body, columns, { umsatz: 'sum' });
    expect(footer.getValueAt(0, 3)).toBe(450);
    body.externalFilterChanged((r: SaleRow) => r.monat === 'Jan');
    expect(rowValues(footer, 0, 4)).toEqual(['3 rows', '', '', 230]);
    body.externalFilterChanged(() => true);
    expect(footer.getValueAt(0, 3)).toBe(450);
  });

  it('source "all" ignores the filter', () => {
    const columns = salesColumns();
    const body = salesBody(createSales(), columns);
    const footer = new AreaModelAggregateFooter(body, columns, { source: 'all', rows: [{ aggregates: { umsatz: 'sum' } }] });
    body.externalFilterChanged((r: SaleRow) => r.monat === 'Jan');
    expect(footer.getValueAt(0, 3)).toBe(450);
  });

  it('first/last follow the sort order after invalidateDerivedValues() (the body sorts its array in place)', () => {
    const columns = salesColumns();
    const body = salesBody(createSales(), columns);
    const footer = new AreaModelAggregateFooter(body, columns, [{ aggregates: { umsatz: 'first' } }]);
    expect(footer.getValueAt(0, 3)).toBe(100);
    body.sort((a, b) => a.umsatz - b.umsatz);
    footer.invalidateDerivedValues();
    expect(footer.getValueAt(0, 3)).toBe(30);
  });

  it('follows the column order (columns are found by property)', () => {
    const columns = salesColumns();
    const tableModel = TableFactory.createTableModel({ rows: createSales(), columnDefs: columns, footerAggregates: { umsatz: 'sum' } });
    tableModel.changeColumnOrder(3, 0);
    const footer = tableModel.getAreaModel('footer');
    expect(rowValues(footer, 0, 4)).toEqual([450, '6 rows', '', '']);
  });
});

describe('G9/G10 – cache and invalidation', () => {
  function countingSetup() {
    const columns = salesColumns();
    const body = salesBody(createSales(), columns);
    const calls = vi.fn((r: SaleRow) => r.umsatz);
    const footer = new AreaModelAggregateFooter(body, columns, { umsatz: { aggregator: 'sum', value: calls } });
    return { body, footer, calls };
  }

  it('reading all cells many times computes once', () => {
    const { footer, calls } = countingSetup();
    for (let i = 0; i < 100; i++) {
      for (let c = 0; c < 4; c++) footer.getValueAt(0, c);
      footer.getTextValueAt(0, 3);
      footer.getResults();
    }
    expect(calls).toHaveBeenCalledTimes(6);
  });

  it('a new filter result (new array) computes again – without invalidateDerivedValues()', () => {
    const { body, footer, calls } = countingSetup();
    footer.getValueAt(0, 3);
    body.externalFilterChanged((r: SaleRow) => r.region === 'Nord');
    expect(footer.getValueAt(0, 3)).toBe(270);
    expect(calls).toHaveBeenCalledTimes(6 + 3);
  });

  it('setRows() computes again', () => {
    const { body, footer } = countingSetup();
    footer.getValueAt(0, 3);
    body.setRows([...createSales(), { region: 'Ost', produkt: 'C', monat: 'Mär', umsatz: 50 }]);
    expect(footer.getValueAt(0, 3)).toBe(500);
  });

  it('a changed value: old sum until invalidateDerivedValues(), then the new one (G9)', () => {
    const { body, footer } = countingSetup();
    expect(footer.getValueAt(0, 3)).toBe(450);
    body.setValue(0, 3, 1000);   // in place – same array
    expect(footer.getValueAt(0, 3)).toBe(450);
    footer.invalidateDerivedValues();
    expect(footer.getValueAt(0, 3)).toBe(1350);
  });

  it('a row pushed into the same array is noticed by the length', () => {
    const rows = createSales();
    const columns = salesColumns();
    const body = salesBody(rows, columns);
    const footer = new AreaModelAggregateFooter(body, columns, { source: 'all', rows: [{ aggregates: { umsatz: 'sum' } }] });
    expect(footer.getValueAt(0, 3)).toBe(450);
    rows.push({ region: 'Ost', produkt: 'C', monat: 'Mär', umsatz: 1 });
    expect(footer.getValueAt(0, 3)).toBe(451);
  });

  it('several footer rows share one pass over the data', () => {
    const columns = salesColumns();
    const body = salesBody(createSales(), columns);
    const calls = vi.fn((r: SaleRow) => r.umsatz);
    const footer = new AreaModelAggregateFooter(body, columns, [
      { aggregates: { umsatz: { aggregator: 'sum', value: calls } } },
      { aggregates: { umsatz: { aggregator: 'avg', value: calls } } },
    ]);
    footer.getValueAt(0, 3);
    footer.getValueAt(1, 3);
    expect(calls).toHaveBeenCalledTimes(12);
    expect(footer.getValueAt(1, 3)).toBe(75);
  });
});

describe('formatting (getTextValueAt)', () => {
  it('numbers: at most 2 decimals with thousands separators; undefined → empty', () => {
    const columns = salesColumns();
    const rows = [{ region: 'x', produkt: 'A', monat: 'Jan', umsatz: 1234.5 }, { region: 'y', produkt: 'A', monat: 'Jan', umsatz: 1 }];
    const footer = new AreaModelAggregateFooter(salesBody(rows, columns), columns, [
      { aggregates: { umsatz: 'sum' } },
      { aggregates: { umsatz: 'avg' } },
    ]);
    expect(footer.getTextValueAt(0, 3)).toBe('1,235.5');
    expect(footer.getTextValueAt(1, 3)).toBe('617.75');
    const empty = new AreaModelAggregateFooter(salesBody([], columns), columns, [{ aggregates: { umsatz: 'avg' } }]);
    expect(empty.getValueAt(0, 3)).toBeUndefined();
    expect(empty.getTextValueAt(0, 3)).toBe('');
  });

  it('G3: the average of January is shown as 76.67', () => {
    const columns = salesColumns();
    const body = salesBody(createSales(), columns);
    body.externalFilterChanged((r: SaleRow) => r.monat === 'Jan');
    const footer = new AreaModelAggregateFooter(body, columns, [{ aggregates: { umsatz: 'avg' } }]);
    expect(footer.getTextValueAt(0, 3)).toBe('76.67');
  });

  it('an own format function; dates and texts', () => {
    const columns = [new ColumnDef('d', 'Date'), new ColumnDef('t', 'Text'), new ColumnDef('n', 'N')];
    const rows = [{ d: new Date(2026, 9, 15), t: 'b', n: 2 }, { d: new Date(2026, 0, 2), t: 'a', n: 3 }];
    const body = new AreaModelObjectArray('body', rows, 34, columns);
    const footer = new AreaModelAggregateFooter(body, columns, {
      d: 'min', t: 'first', n: { aggregator: 'sum', format: v => `${v} pcs` },
    });
    expect(footer.getTextValueAt(0, 0)).toBe('1/2/2026');
    expect(footer.getTextValueAt(0, 1)).toBe('b');
    expect(footer.getTextValueAt(0, 2)).toBe('5 pcs');
    expect(footer.getValueAt(0, 2)).toBe(5);   // the raw value (Excel, own footer renderer)
  });
});

describe('data sources', () => {
  interface Node { label: string; amount?: number }

  function treeModel() {
    const columns = [new ColumnDef('label', 'Label'), new ColumnDef('amount', 'Amount')];
    const leaf = (label: string, amount: number) => new TreeRow<Node>({ label, amount }, false, [], undefined);
    const nord = new TreeRow<Node>({ label: 'Nord', amount: 999 }, false, [leaf('A', 100), leaf('B', 50)], undefined);
    const sued = new TreeRow<Node>({ label: 'Süd' }, true, [leaf('C', 80), new TreeRow<Node>({ label: 'Süd-Ost' }, false, [leaf('D', 30)], undefined)], undefined);
    for (const parent of [nord, sued, sued.children![1]]) for (const child of parent.children!) child.parent = parent;
    const body = new AreaModelTree<Node>('body', [nord, sued], 34, columns);
    return { body, columns };
  }

  it('tree: the leaves that pass the filter – independent of expanding, parents not counted', () => {
    const { body, columns } = treeModel();
    const footer = new AreaModelAggregateFooter(body, columns, { amount: 'sum' });
    expect(body.getRowCount()).toBe(4);                  // Nord (collapsed), Süd, C, Süd-Ost (collapsed)
    expect(rowValues(footer, 0, 2)).toEqual(['4 rows', 260]);
    body.externalFilterChanged((r: TreeRow<Node>) => r.data.label === 'D' || r.data.label === 'A');
    footer.invalidateDerivedValues();
    expect(rowValues(footer, 0, 2)).toEqual(['2 rows', 130]);
    expect(body.getLeafRows().map(r => r.data.label)).toEqual(['A', 'D']);
    expect(body.getLeafRows(false).map(r => r.data.label)).toEqual(['A', 'B', 'C', 'D']);
  });

  it('tree (G10): reading cells uses the cache – no walk over the tree; expanding does not recompute', () => {
    const { body, columns } = treeModel();
    const footer = new AreaModelAggregateFooter(body, columns, { amount: 'sum' });
    const walk = vi.spyOn(body, 'getLeafRows');
    for (let i = 0; i < 50; i++) { footer.getValueAt(0, 0); footer.getValueAt(0, 1); footer.getTextValueAt(0, 1); }
    expect(walk).toHaveBeenCalledTimes(1);
    body.toggleExpandCollapseAll(true);
    expect(footer.getValueAt(0, 1)).toBe(260);
    expect(walk).toHaveBeenCalledTimes(1);
    footer.invalidateDerivedValues();
    footer.getValueAt(0, 1);
    expect(walk).toHaveBeenCalledTimes(2);
  });

  it('an own body model without row objects: values via getValueAt of the column', () => {
    const columns = [new ColumnDef('id', 'Id'), new ColumnDef('value', 'Value')];
    class Million extends AreaModel {
      override getRowCount() { return 1000; }
      override getValueAt(r: number, c: number) { return c === 0 ? `id${r}` : r; }
    }
    const footer = new AreaModelAggregateFooter(new Million(), columns, { value: 'sum' });
    expect(rowValues(footer, 0, 2)).toEqual(['1,000 rows', 499500]);
  });

  it('an own body model: an accessor gets getRowByIndex(r)', () => {
    const columns = [new ColumnDef('id', 'Id'), new ColumnDef('value', 'Value')];
    const data = [{ id: 1, value: 2 }, { id: 2, value: 5 }];
    class Rows extends AreaModel {
      override getRowCount() { return data.length; }
      override getRowByIndex(r: number) { return data[r]; }
      override getValueAt(r: number, c: number) { return c === 0 ? data[r].id : data[r].value; }
    }
    const footer = new AreaModelAggregateFooter(new Rows(), columns, {
      value: { aggregator: 'sum', value: (row: { value: number }) => row.value * 10 },
    });
    expect(footer.getValueAt(0, 1)).toBe(70);
  });

  it('bodyData (rows of values) works via getValueAt', () => {
    const tableModel = TableFactory.createTableModel({
      bodyData: [['a', 1], ['b', 2]], columnDefs: [new ColumnDef('k', 'K'), new ColumnDef('v', 'V')],
      footerAggregates: { v: 'sum' },
    });
    expect(rowValues(tableModel.getAreaModel('footer'), 0, 2)).toEqual(['2 rows', 3]);
  });

  it('getRows is called once per change (a new array each time is fine), again after invalidateDerivedValues()', () => {
    const columns = salesColumns();
    const getRows = vi.fn(() => createSales().filter(r => r.produkt === 'A'));
    const footer = new AreaModelAggregateFooter(salesBody(createSales(), columns), columns, {
      getRows, rows: [{ aggregates: { umsatz: 'sum' } }],
    });
    for (let i = 0; i < 20; i++) footer.getValueAt(0, 3);
    expect(getRows).toHaveBeenCalledTimes(1);
    footer.invalidateDerivedValues();
    expect(footer.getValueAt(0, 3)).toBe(330);
    expect(getRows).toHaveBeenCalledTimes(2);
  });

  it('getRows: an own source', () => {
    const columns = salesColumns();
    const footer = new AreaModelAggregateFooter(salesBody(createSales(), columns), columns, {
      getRows: () => createSales().filter(r => r.produkt === 'B'),
      rows: [{ aggregates: { umsatz: 'sum' } }],
    });
    expect(rowValues(footer, 0, 4)).toEqual(['2 rows', '', '', 120]);
  });

  it('an aggregate key without a column is computed but not shown (getResults)', () => {
    const columns = salesColumns();
    const footer = new AreaModelAggregateFooter(salesBody(createSales(), columns), columns, {
      umsatz: 'sum', avgUmsatz: { aggregator: 'avg', value: 'umsatz' },
    });
    expect(footer.getResults()).toEqual({ umsatz: 450, avgUmsatz: 75 });
    expect(rowValues(footer, 0, 4)).toEqual(['6 rows', '', '', 450]);
  });

  it('own aggregators in the footer', () => {
    const columns = salesColumns();
    const range: AggregatorIf<{ min: number; max: number }, number> = {
      name: 'range',
      init: () => ({ min: Infinity, max: -Infinity }),
      add: (s, v) => typeof v === 'number' ? { min: Math.min(s.min, v), max: Math.max(s.max, v) } : s,
      merge: (a, b) => ({ min: Math.min(a.min, b.min), max: Math.max(a.max, b.max) }),
      result: s => s.max - s.min,
    };
    const footer = new AreaModelAggregateFooter(salesBody(createSales(), columns), columns, [{ label: 'Range', aggregates: { umsatz: range } }]);
    expect(rowValues(footer, 0, 4)).toEqual(['Range', '', '', 90]);
  });
});

describe('TableFactory.createTableModel({ footerAggregates })', () => {
  it('builds an AreaModelAggregateFooter over the body with the footer row height', () => {
    const tableModel = TableFactory.createTableModel({
      rows: createSales(), columnDefs: salesColumns(),
      defaultRowHeights: { header: 40, body: 30, footer: 36 },
      footerAggregates: { umsatz: 'sum' },
    });
    const footer = tableModel.getAreaModel('footer');
    expect(isAreaModelAggregateFooter(footer)).toBe(true);
    expect(footer.getRowHeight(0)).toBe(36);
    expect(rowValues(footer, 0, 4)).toEqual(['6 rows', '', '', 450]);
  });

  it('accepts rows and full options', () => {
    const a = TableFactory.createTableModel({ rows: createSales(), columnDefs: salesColumns(),
      footerAggregates: [{ label: 'Σ', aggregates: { umsatz: 'sum' } }, { label: 'Ø', aggregates: { umsatz: 'avg' } }] });
    expect(a.getAreaModel('footer').getRowCount()).toBe(2);
    const b = TableFactory.createTableModel({ rows: createSales(), columnDefs: salesColumns(),
      footerAggregates: { rows: [{ aggregates: { umsatz: 'max' } }], rowHeight: 50, labelProperty: 'produkt' } });
    expect(b.getAreaModel('footer').getRowHeight(0)).toBe(50);
    expect(rowValues(b.getAreaModel('footer'), 0, 4)).toEqual(['', '6 rows', '', 120]);
  });

  it('with rowNumbersVisible: columns found by property, label after the number column', () => {
    const tableModel = TableFactory.createTableModel({
      rows: createSales(), columnDefs: salesColumns(), rowNumbersVisible: true, footerAggregates: { umsatz: 'sum' },
    });
    expect(rowValues(tableModel.getAreaModel('footer'), 0, 5)).toEqual(['', '6 rows', '', '', 450]);
  });

  it('tree rows', () => {
    const rows = [new TreeRow({ label: 'P', amount: 7 }, true, [new TreeRow({ label: 'C', amount: 5 }, false, [], undefined)], undefined)];
    rows[0].children![0].parent = rows[0];
    const tableModel = TableFactory.createTableModel({
      rows, columnDefs: [new ColumnDef('label', 'L'), new ColumnDef('amount', 'A')], footerAggregates: { amount: 'sum' },
    });
    expect(rowValues(tableModel.getAreaModel('footer'), 0, 2)).toEqual(['1 row', 5]);
  });

  it('an own footerAreaModel wins (warning)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const own = new AreaModel();
    own.areaIdent = 'footer';
    const tableModel = TableFactory.createTableModel({
      rows: createSales(), columnDefs: salesColumns(), footerAreaModel: own, footerAggregates: { umsatz: 'sum' },
    });
    expect(tableModel.getAreaModel('footer')).toBe(own);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('footerAggregates is ignored'));
  });

  it('footerAggregates win over footerData (warning)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const tableModel = TableFactory.createTableModel({
      rows: createSales(), columnDefs: salesColumns(), footerData: [['x', '', '', '']], footerAggregates: { umsatz: 'sum' },
    });
    expect(isAreaModelAggregateFooter(tableModel.getAreaModel('footer'))).toBe(true);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('footerData is ignored'));
  });

  it('without footerAggregates nothing changes', () => {
    const tableModel = TableFactory.createTableModel({ rows: createSales(), columnDefs: salesColumns() });
    expect(isAreaModelAggregateFooter(tableModel.getAreaModel('footer'))).toBe(false);
  });
});
