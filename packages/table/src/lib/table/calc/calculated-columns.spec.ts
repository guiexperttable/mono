// Calculated columns and „Show values as“ on the models (prompt 008 parts A and B, design
// prompts/008-formeln-berechnete-spalten-show-values-as.design.md §§ 2–3): F1–F12 without a DOM, cycles (F15),
// row groups (006) and pivot (007), the helpers of show-values-as.ts.
import { describe, expect, it } from 'vitest';
import {
  AreaModelObjectArray,
  AreaModelTree,
  ColumnDef,
  PivotFactory,
  RowGroupFactory,
  SortItem,
  TableFactory,
  TreeRow,
  TrueFn,
  calculateShowValuesAs,
  formatShowValuesAs,
  isFormulaError,
  isPercentShowValuesAs,
  resolveShowValuesAs,
  sumOfNumbers,
  SHOW_VALUES_AS_MODES,
} from '@guiexpert/table';
import type { AreaModelIf, AreaModelPivot, AreaModelRowGroups, ColumnDefIf, ShowValuesAs, TableModelIf } from '@guiexpert/table';
import { createItems, itemColumns, type Item } from '../../../../test-utils/calc-fixtures';
import { createSales, type SaleRow } from '../../../../test-utils/grouping-fixtures';

function model(columnDefs: ColumnDefIf[] = itemColumns(), rows: Item[] = createItems(), footer = true): TableModelIf {
  return TableFactory.createTableModel({ rows, columnDefs, footerAggregates: footer ? { total: 'sum' } : undefined });
}

function column(m: TableModelIf, property: string): number {
  return (m.getColumnDefs() ?? []).findIndex(def => def.property === property);
}

function values(body: AreaModelIf, columnIndex: number): unknown[] {
  return Array.from({ length: body.getRowCount() }, (_, r) => body.getValueAt(r, columnIndex));
}

function texts(body: AreaModelIf, columnIndex: number): string[] {
  return Array.from({ length: body.getRowCount() }, (_, r) => body.getTextValueAt(r, columnIndex));
}

describe('part A – calculated columns (valueGetter)', () => {
  it('F1: total = price × quantity, the data stays unchanged', () => {
    const rows = createItems();
    const m = model(itemColumns(), rows);
    const body = m.getBodyModel();
    expect(values(body, column(m, 'total'))).toEqual([2598, 1047, 250]);
    expect(texts(body, column(m, 'total'))).toEqual(['2598', '1047', '250']);
    expect(rows[0]).toEqual({ product: 'Laptop', price: 1299, quantity: 2 });
  });

  it('F2: sorting by the calculated column (desc and asc)', () => {
    const m = model();
    const body = m.getBodyModel() as AreaModelObjectArray<Item>;
    body.doSort([new SortItem(column(m, 'total'), 'desc')]);
    expect(body.getFilteredRows().map(r => r.product)).toEqual(['Laptop', 'Monitor', 'Mouse']);
    body.doSort([new SortItem(column(m, 'total'), 'asc')]);
    expect(body.getFilteredRows().map(r => r.product)).toEqual(['Mouse', 'Monitor', 'Laptop']);
  });

  it('F2: the getter runs once per row per sort pass, not per comparison', () => {
    let calls = 0;
    const rows = Array.from({ length: 200 }, (_, i) => ({ product: `p${i}`, price: (i * 37) % 101, quantity: 1 }));
    const m = model([ColumnDef.create({ property: 'total', valueGetter: (o: Item) => { calls++; return o.price * o.quantity; } })], rows, false);
    const body = m.getBodyModel() as AreaModelObjectArray<Item>;
    body.doSort([new SortItem(0, 'asc')]);
    expect(calls).toBe(200);
    expect(body.getFilteredRows().map(r => r.price)).toEqual([...rows.map(r => r.price)].sort((a, b) => a - b));
  });

  it('F2: a sortComparator gets the computed values', () => {
    const m = model(itemColumns([ColumnDef.create({
      property: 'label', valueGetter: (o: Item) => o.product.length, sortComparator: (a: number, b: number) => b - a,
    })]));
    const body = m.getBodyModel() as AreaModelObjectArray<Item>;
    body.doSort([new SortItem(column(m, 'label'), 'asc')]);
    expect(body.getFilteredRows().map(r => r.product)).toEqual(['Monitor', 'Laptop', 'Mouse']);
  });

  it('F3: filter "total > 500" with getRowValue()', () => {
    const m = model();
    const body = m.getBodyModel() as AreaModelObjectArray<Item>;
    body.externalFilterChanged((row: Item) => Number(body.getRowValue(row, 'total')) > 500);
    expect(body.getFilteredRows().map(r => r.product)).toEqual(['Laptop', 'Monitor']);
    expect(body.getRowValue({ product: 'x', price: 2, quantity: 3 }, 'total')).toBe(6);
    expect(body.getRowValue({ product: 'x', price: 2, quantity: 3 }, 'price')).toBe(2);
    expect(body.getRowValue(new TreeRow({ price: 2, quantity: 5 }, true, undefined, undefined), 'total')).toBe(10);
  });

  it('F5: footer sum(total) = 3895 (filter: 3645)', () => {
    const m = model();
    const footer = m.getAreaModel('footer');
    expect(footer.getValueAt(0, column(m, 'total'))).toBe(3895);
    const body = m.getBodyModel() as AreaModelObjectArray<Item>;
    body.externalFilterChanged((row: Item) => Number(body.getRowValue(row, 'total')) > 500);
    footer.invalidateDerivedValues?.();
    expect(footer.getValueAt(0, column(m, 'total'))).toBe(3645);
  });

  it('F6: editing price of Mouse to 30 → total 300, footer 3945', () => {
    const m = model();
    const body = m.getBodyModel();
    expect(body.setValue(2, column(m, 'price'), 30)).toBe(true);
    m.getAreaModel('footer').invalidateDerivedValues?.();
    expect(body.getValueAt(2, column(m, 'total'))).toBe(300);
    expect(m.getAreaModel('footer').getValueAt(0, column(m, 'total'))).toBe(3945);
  });

  it('F7: a calculated column is not editable – even with editable: TrueFn – unless it has a valueSetter', () => {
    const m = model();
    const body = m.getBodyModel();
    const total = column(m, 'total');
    expect(body.isEditable(0, total)).toBe(false);
    expect(body.setValue(0, total, 1)).toBe(false);
    expect(body.isEditable(0, column(m, 'price'))).toBe(true);

    const m2 = model(itemColumns([ColumnDef.create({
      property: 'net', editable: TrueFn, valueGetter: (o: Item) => o.price * o.quantity,
      valueSetter: (o: Item, v) => { const n = Number(v); if (!Number.isFinite(n)) return false; o.price = n / o.quantity; return true; },
    })]));
    const body2 = m2.getBodyModel();
    const net = column(m2, 'net');
    expect(body2.isEditable(0, net)).toBe(true);
    expect(body2.setValue(0, net, 3000)).toBe(true);
    expect(body2.getValueAt(0, column(m2, 'price'))).toBe(1500);
    expect(body2.setValue(0, net, 'abc')).toBe(false);
  });

  it('ColumnDef.create({ formula }) compiles the formula into the valueGetter (F13 on a model)', () => {
    const m = model(itemColumns([
      ColumnDef.create({ property: 'gross', formula: 'ROUND([total] * 1.19, 2)' }),
      ColumnDef.create({ property: 'share', formula: '[total] / SUM([total])' }),
    ]));
    const body = m.getBodyModel();
    expect(values(body, column(m, 'gross'))).toEqual([3091.62, 1245.93, 297.5]);
    expect((values(body, column(m, 'share')) as number[]).reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12);
    expect(m.getColumnDefs()![column(m, 'gross')].formula).toBe('ROUND([total] * 1.19, 2)');
    expect(body.isCalculatedProperty?.('gross')).toBe(true);
  });

  it('F15: circular references → #CIRC!, an exception in a getter → #VALUE!', () => {
    const m = model([
      ColumnDef.create({ property: 'a', formula: '[b] + 1' }),
      ColumnDef.create({ property: 'b', formula: '[a] + 1' }),
      ColumnDef.create({ property: 'c', formula: '[c] * 2' }),
      ColumnDef.create({ property: 'd', formula: '[price] / SUM([d])' }),
      ColumnDef.create({ property: 'e', valueGetter: () => { throw new Error('boom'); } }),
      ColumnDef.create({ property: 'price' }),
    ], createItems(), false);
    const body = m.getBodyModel();
    for (const p of ['a', 'b', 'c', 'd']) {
      const v = body.getValueAt(0, column(m, p));
      expect(isFormulaError(v) && v.code, p).toBe('#CIRC!');
    }
    const e = body.getValueAt(0, column(m, 'e'));
    expect(isFormulaError(e) && e.message).toMatch(/boom/);
    expect(body.getTextValueAt(0, column(m, 'a'))).toBe('#CIRC!');
    expect(body.getCustomClassesAt(0, column(m, 'a'))).toContain('ge-table-cell-error');
    expect(body.getCustomClassesAt(0, column(m, 'price'))).not.toContain('ge-table-cell-error');
    expect(body.getTooltipAt(0, column(m, 'a'))).toMatch(/Circular/);
    expect(body.getTooltipAt(0, column(m, 'price'))).toBe('');
  });

  it('a getter may read the same column of another row (no false #CIRC!)', () => {
    const rows = [{ v: 1 }, { v: 2 }, { v: 3 }];
    const m = model([ColumnDef.create({ property: 'cum', valueGetter: (o: { v: number }, ctx) => {
      const i = rows.indexOf(o);
      return o.v + (i > 0 ? Number(ctx.getValue(rows[i - 1], 'cum')) : 0);
    } })], rows as any, false);
    expect(values(m.getBodyModel(), 0)).toEqual([1, 3, 6]);
  });

  it('row grouping follows a formula set later (setColumnFormula path: valueGetter + invalidate)', () => {
    const m = RowGroupFactory.createTableModel<SaleRow>({
      rows: createSales(), groupBy: ['region'], aggregations: { calc: 'sum' },
      columnDefs: [ColumnDef.create({ property: 'region' }), ColumnDef.create({ property: 'calc' })],
    });
    const body = m.getBodyModel() as AreaModelRowGroups<SaleRow>;
    expect(body.getGroups()[0].results['calc']).toBe(0);
    m.getColumnDefs()![column(m, 'calc')].valueGetter = (o: SaleRow) => o.umsatz * 10;
    body.invalidateDerivedValues();
    expect(body.getGroups().map(g => g.results['calc'])).toEqual([2700, 1800]);
  });

  it('formula errors sort last in both directions', () => {
    const rows = [{ v: 2 }, { v: 0 }, { v: 4 }];
    const m = model([ColumnDef.create({ property: 'x', formula: '8 / [v]' })], rows as any, false);
    const body = m.getBodyModel() as AreaModelObjectArray<{ v: number }>;
    body.doSort([new SortItem(0, 'asc')]);
    expect(body.getFilteredRows().map(r => r.v)).toEqual([4, 2, 0]);
    body.doSort([new SortItem(0, 'desc')]);
    expect(body.getFilteredRows().map(r => r.v)).toEqual([2, 4, 0]);
  });

  it('aggregates in formulas are cached until invalidateDerivedValues()', () => {
    let calls = 0;
    const m = model(itemColumns([
      ColumnDef.create({ property: 'counted', valueGetter: (o: Item) => { calls++; return o.price; } }),
      ColumnDef.create({ property: 'share', formula: '[counted] / SUM([counted])' }),
    ]), createItems(), false);
    const body = m.getBodyModel();
    const share = column(m, 'share');
    values(body, share);
    const first = calls;
    values(body, share);
    expect(calls - first).toBe(3); // only the row values, not the sum again
    body.invalidateDerivedValues?.();
    values(body, share);
    expect(calls - first).toBe(3 + 3 + 3);
  });

  it('header and footer models ignore valueGetters (they show their own data)', () => {
    const columnDefs = itemColumns();
    const footer = new AreaModelObjectArray<Item>('footer', [{ product: 'Sum', price: 1, quantity: 1, total: 'own' } as any], 30, columnDefs);
    expect(footer.getValueAt(0, 3)).toBe('own');
    expect(footer.isEditable(0, 3)).toBe(true);  // editable: TrueFn – only the body refuses calculated columns
  });

  it('without calculated columns nothing changes: paths, missing values, text', () => {
    const m = TableFactory.createTableModel({ rows: [{ a: { b: 1 }, c: undefined }], columnDefs: [
      ColumnDef.create({ property: 'a.b' }), ColumnDef.create({ property: 'c' }),
    ] });
    const body = m.getBodyModel();
    expect(body.getValueAt(0, 0)).toBe(1);
    expect(body.getValueAt(0, 1)).toBeUndefined();
    expect(body.getTextValueAt(0, 1)).toBe('undefined'); // unchanged legacy behaviour
    expect(body.isCalculatedProperty?.('a.b')).toBe(false);
  });

  it('a tree: calculated values on TreeRow.data, sorting, setValue with a setter', () => {
    const columnDefs = [
      ColumnDef.create({ property: 'name' }),
      ColumnDef.create({ property: 'double', valueGetter: (o: { v: number }) => o.v * 2, editable: TrueFn,
        valueSetter: (o: { v: number }, v) => { o.v = Number(v) / 2; } }),
    ];
    const child1 = new TreeRow({ name: 'c1', v: 5 }, true, undefined, undefined, 1);
    const child2 = new TreeRow({ name: 'c2', v: 1 }, true, undefined, undefined, 1);
    const root = new TreeRow<any>({ name: 'r', v: 10 }, true, [child1, child2], undefined);
    child1.parent = root;
    child2.parent = root;
    const tree = new AreaModelTree<any>('body', [root], 30, columnDefs);
    expect(values(tree, 1)).toEqual([20, 10, 2]);
    tree.doSort([new SortItem(1, 'asc')]);
    expect(values(tree, 0)).toEqual(['r', 'c2', 'c1']);
    expect(tree.setValue(1, 1, 8)).toBe(true);
    expect(child2.data.v).toBe(4);
    expect(tree.getValueByT(child1.data, 'double')).toBe(10);
  });
});

describe('part B – „Show values as“', () => {
  function sva(mode: ShowValuesAs, extra: Partial<ColumnDefIf> = {}): TableModelIf {
    return model(itemColumns([ColumnDef.create({ property: 'share', valueGetter: (o: Item) => o.price * o.quantity, showValuesAs: mode, ...extra })]), createItems(), false);
  }

  it('F8: share of the column total – 66.7 %, 26.9 %, 6.4 % (sum 100 %)', () => {
    const m = sva('percentOfColumnTotal');
    const body = m.getBodyModel();
    const c = column(m, 'share');
    const v = values(body, c) as number[];
    expect(v[0]).toBeCloseTo(2598 / 3895, 12);
    expect(v.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12);
    expect(texts(body, c)).toEqual(['66.7%', '26.9%', '6.4%']);
    expect(body.getCellRenderer(0, c)).toBeDefined();          // shows the text
    expect(body.getCellRenderer(0, column(m, 'price'))).toBeUndefined();
  });

  it('F9: the reference are the filtered rows', () => {
    const m = sva('percentOfColumnTotal');
    const body = m.getBodyModel() as AreaModelObjectArray<Item>;
    body.externalFilterChanged((row: Item) => Number(body.getRowValue(row, 'total')) > 500);
    expect(texts(body, column(m, 'share'))).toEqual(['71.3%', '28.7%']);
  });

  it('percentOfGrandTotal / percentOfParentTotal = column total in a flat table, percentOfRowTotal = raw', () => {
    expect(texts(sva('percentOfGrandTotal').getBodyModel(), 4)).toEqual(['66.7%', '26.9%', '6.4%']);
    expect(texts(sva('percentOfParentTotal').getBodyModel(), 4)).toEqual(['66.7%', '26.9%', '6.4%']);
    expect(values(sva('percentOfRowTotal').getBodyModel(), 4)).toEqual([2598, 1047, 250]);
  });

  it('running total, difference from previous, rank (display order)', () => {
    expect(values(sva('runningTotal').getBodyModel(), 4)).toEqual([2598, 3645, 3895]);
    expect(texts(sva('runningTotal').getBodyModel(), 4)).toEqual(['2,598', '3,645', '3,895']);
    expect(values(sva('differenceFromPrevious').getBodyModel(), 4)).toEqual([undefined, -1551, -797]);
    expect(texts(sva('differenceFromPrevious').getBodyModel(), 4)).toEqual(['', '-1,551', '-797']);
    expect(values(sva('rank').getBodyModel(), 4)).toEqual([1, 2, 3]);
  });

  it('F12: sorting uses the raw value; running totals follow the new order', () => {
    const m = sva('runningTotal');
    const body = m.getBodyModel() as AreaModelObjectArray<Item>;
    body.doSort([new SortItem(4, 'asc')]);
    expect(body.getFilteredRows().map(r => r.product)).toEqual(['Mouse', 'Monitor', 'Laptop']);
    expect(values(body, 4)).toEqual([250, 1297, 3895]);
  });

  it('options: fraction digits, own format; an error stays an error', () => {
    const m = sva('percentOfColumnTotal', { showValuesAs: { mode: 'percentOfColumnTotal', fractionDigits: 2 } });
    expect(texts(m.getBodyModel(), 4)).toEqual(['66.70%', '26.88%', '6.42%']);
    const m2 = sva('percentOfColumnTotal', { showValuesAs: { mode: 'percentOfColumnTotal', format: v => `${Math.round(v * 100)} pct` } });
    expect(texts(m2.getBodyModel(), 4)).toEqual(['67 pct', '27 pct', '6 pct']);
    const m3 = model([ColumnDef.create({ property: 'x', formula: '1 / [v]', showValuesAs: 'percentOfColumnTotal' })], [{ v: 0 }, { v: 1 }] as any, false);
    expect(m3.getBodyModel().getTextValueAt(0, 0)).toBe('#DIV/0!');
    expect(m3.getBodyModel().getTextValueAt(1, 0)).toBe('100.0%');
  });

  it('works on a normal column, too (no valueGetter)', () => {
    const m = model(itemColumns([ColumnDef.create({ property: 'quantity', headerLabel: 'Qty share', showValuesAs: 'percentOfColumnTotal' })]), createItems(), false);
    expect(texts(m.getBodyModel(), 4)).toEqual(['13.3%', '20.0%', '66.7%']);
  });

  it('F10: row grouping – details sum up to 100 % per group, groups per parent', () => {
    const m = RowGroupFactory.createTableModel<SaleRow>({
      rows: createSales(),
      groupBy: ['region'],
      aggregations: { umsatz: 'sum' },
      columnDefs: [
        ColumnDef.create({ property: 'region', headerLabel: 'Region' }),
        ColumnDef.create({ property: 'produkt', headerLabel: 'Produkt' }),
        ColumnDef.create({ property: 'umsatz', headerLabel: 'Share', showValuesAs: 'percentOfParentTotal' }),
      ],
    });
    const body = m.getBodyModel() as AreaModelRowGroups<SaleRow>;
    const c = column(m, 'umsatz');
    // Nord (270 = 60 %), its 3 rows, Süd (180 = 40 %), its 3 rows
    const shown = values(body, c) as number[];
    expect(texts(body, c)).toEqual(['60.0%', '37.0%', '18.5%', '44.4%', '40.0%', '44.4%', '38.9%', '16.7%']);
    expect(shown[1] + shown[2] + shown[3]).toBeCloseTo(1, 12);
    expect(shown[5] + shown[6] + shown[7]).toBeCloseTo(1, 12);
    expect(shown[0] + shown[4]).toBeCloseTo(1, 12);
  });

  it('row grouping: aggregations and groupBy on a calculated column use the computed values', () => {
    const m = RowGroupFactory.createTableModel<SaleRow>({
      rows: createSales(),
      groupBy: ['size'],
      aggregations: { doubled: 'sum' },
      columnDefs: [
        ColumnDef.create({ property: 'region', headerLabel: 'Region' }),
        ColumnDef.create({ property: 'size', headerLabel: 'Size', valueGetter: (o: SaleRow) => o.umsatz >= 80 ? 'big' : 'small' }),
        ColumnDef.create({ property: 'doubled', headerLabel: 'Doubled', valueGetter: (o: SaleRow) => o.umsatz * 2 }),
      ],
    });
    const body = m.getBodyModel() as AreaModelRowGroups<SaleRow>;
    expect(body.getGroups().map(g => [g.key, g.count, g.results['doubled']])).toEqual([['big', 3, 600], ['small', 3, 300]]);
    expect(body.getTotals()['doubled']).toBe(900);
  });

  it('F11: pivot – percentOfRowTotal: every pivot row sums up to 100 %; footer and total column', () => {
    const m = PivotFactory.createTableModel<SaleRow>({
      rows: createSales(),
      rowFields: ['region'],
      columnFields: ['monat'],
      values: [{ value: 'umsatz', showValuesAs: 'percentOfRowTotal' }],
    });
    const body = m.getBodyModel() as AreaModelPivot<SaleRow>;
    const jan = body.getColumnIndex(['Jan']);
    const feb = body.getColumnIndex(['Feb']);
    const total = body.getColumnIndex([]);
    for (let r = 0; r < body.getRowCount(); r++) {
      expect((body.getValueAt(r, jan) as number) + (body.getValueAt(r, feb) as number)).toBeCloseTo(1, 12);
      expect(body.getValueAt(r, total)).toBe(1);
    }
    expect(body.getTextValueAt(0, jan)).toBe('55.6%'); // Nord: 150 / 270
    const footer = m.getAreaModel('footer');
    expect(footer.getTextValueAt(0, jan)).toBe('51.1%'); // 230 / 450
    expect(footer.getTextValueAt(0, total)).toBe('100.0%');
  });

  it('pivot: column, grand and parent shares; sorting by the shown share', () => {
    const make = (mode: ShowValuesAs, rowFields: string[] = ['region']) => PivotFactory.createTableModel<SaleRow>({
      rows: createSales(), rowFields, columnFields: ['monat'], values: [{ value: 'umsatz', showValuesAs: mode }],
    });
    const col = make('percentOfColumnTotal').getBodyModel() as AreaModelPivot<SaleRow>;
    expect(col.getTextValueAt(0, col.getColumnIndex(['Jan']))).toBe('65.2%');   // 150 / 230
    const grand = make('percentOfGrandTotal').getBodyModel() as AreaModelPivot<SaleRow>;
    expect(grand.getTextValueAt(0, grand.getColumnIndex(['Jan']))).toBe('33.3%'); // 150 / 450
    const parent = make('percentOfParentTotal', ['region', 'produkt']).getBodyModel() as AreaModelPivot<SaleRow>;
    // row 0 = Nord (top level: share of the column), row 1 = Nord / A: 100 of 150 in Jan
    expect(parent.getTextValueAt(0, parent.getColumnIndex(['Jan']))).toBe('65.2%');
    expect(parent.getTextValueAt(1, parent.getColumnIndex(['Jan']))).toBe('66.7%');
    // other modes don't apply: the value
    const rank = make('rank').getBodyModel() as AreaModelPivot<SaleRow>;
    expect(rank.getValueAt(0, rank.getColumnIndex(['Jan']))).toBe(150);

    const rowShare = make('percentOfRowTotal').getBodyModel() as AreaModelPivot<SaleRow>;
    const feb = rowShare.getColumnIndex(['Feb']);
    // Nord Feb 120/270 = 44 %, Süd Feb 100/180 = 56 % → sorted desc by the share: Süd first (raw: Nord 120 > Süd 100)
    rowShare.doSort([new SortItem(feb, 'desc')]);
    expect(rowShare.getRowGroup(0)?.key).toBe('Süd');
  });
});

describe('trees: „Show values as“ among siblings and over the leaves', () => {
  function tree(mode: ShowValuesAs) {
    const columnDefs = [
      ColumnDef.create({ property: 'name' }),
      ColumnDef.create({ property: 'v', showValuesAs: mode }),
      ColumnDef.create({ property: 'f', formula: '10 / [v]' }),
    ];
    const a1 = new TreeRow<any>({ name: 'a1', v: 1 }, true, undefined, undefined, 1);
    const a2 = new TreeRow<any>({ name: 'a2', v: 3 }, true, undefined, undefined, 1);
    const b1 = new TreeRow<any>({ name: 'b1', v: 0 }, true, undefined, undefined, 1);
    const a = new TreeRow<any>({ name: 'a', v: 4 }, true, [a1, a2], undefined);
    const b = new TreeRow<any>({ name: 'b', v: 6 }, true, [b1], undefined);
    a1.parent = a; a2.parent = a; b1.parent = b;
    return new AreaModelTree<any>('body', [a, b], 30, columnDefs);
  }

  it('percentOfColumnTotal over the leaves, percentOfParentTotal and runningTotal among siblings', () => {
    // rows: a, a1, a2, b, b1 – leaves a1 + a2 + b1 = 4
    expect(texts(tree('percentOfColumnTotal'), 1)).toEqual(['100.0%', '25.0%', '75.0%', '150.0%', '0.0%']);
    expect(texts(tree('percentOfParentTotal'), 1)).toEqual(['40.0%', '25.0%', '75.0%', '60.0%', '']);
    expect(values(tree('runningTotal'), 1)).toEqual([4, 1, 4, 10, 0]);
    expect(values(tree('rank'), 1)).toEqual([2, 2, 1, 1, 1]);
    expect(values(tree('percentOfRowTotal'), 1)).toEqual([4, 1, 3, 6, 0]);
  });

  it('a filter changes the siblings; sorting the order of running totals', () => {
    const m = tree('runningTotal');
    m.externalFilterChanged((row: any) => row.data.name !== 'a1');
    expect(values(m, 0)).toEqual(['a', 'a2', 'b', 'b1']);
    expect(values(m, 1)).toEqual([4, 3, 10, 0]);
    m.externalFilterChanged(() => true);
    m.doSort([new SortItem(1, 'desc')]);
    expect(values(m, 0)).toEqual(['b', 'b1', 'a', 'a2', 'a1']);
    expect(values(m, 1)).toEqual([6, 0, 10, 3, 4]);
  });

  it('formula errors in a tree: text, class, tooltip; renderer only for „Show values as“', () => {
    const m = tree('percentOfColumnTotal');
    const b1 = 4;
    expect(m.getTextValueAt(b1, 2)).toBe('#DIV/0!');
    expect(m.getCustomClassesAt(b1, 2)).toContain('ge-table-cell-error');
    expect(m.getCustomClassesAt(0, 2)).not.toContain('ge-table-cell-error');
    expect(m.getTooltipAt(b1, 2)).toBe('Division by zero');
    expect(m.getTooltipAt(0, 2)).toBe('');
    expect(m.getTooltipAt(0, 0)).toBe('');
    expect(m.getCellRenderer(0, 1)).toBeDefined();
    expect(m.getCellRenderer(0, 0)).toBeUndefined();
    expect(m.getTextValueAt(0, 0)).toBe('a');
    expect(m.isCalculatedProperty('f')).toBe(true);
    expect(m.hasDerivedColumns()).toBe(true);
    expect(m.isDerivedProperty('v')).toBe(true);
    expect(m.isDerivedProperty('name')).toBe(false);
    // SUM over the leaves of a tree
    const withSum = new AreaModelTree<any>('body', [new TreeRow<any>({ v: 2 }, true, undefined, undefined)], 30,
      [ColumnDef.create({ property: 'v' }), ColumnDef.create({ property: 's', formula: 'SUM([v])' })]);
    expect(withSum.getValueAt(0, 1)).toBe(2);
    m.invalidateDerivedValues();
    expect(m.getTextValueAt(0, 1)).toBe('100.0%');
  });

  it('a model without derived columns', () => {
    const m = model([ColumnDef.create({ property: 'price' })], createItems(), false);
    expect(m.getBodyModel().getRowValue?.(createItems()[0], 'price')).toBe(1299);
    expect((m.getBodyModel() as AreaModelObjectArray<Item>).hasDerivedColumns()).toBe(false);
  });
});

describe('show-values-as helpers', () => {
  it('calculateShowValuesAs()', () => {
    expect(calculateShowValuesAs([2598, 1047, 250], 'percentOfColumnTotal').map(v => v!.toFixed(3))).toEqual(['0.667', '0.269', '0.064']);
    expect(calculateShowValuesAs([10, 20, 20, 5], 'rank')).toEqual([3, 1, 1, 4]);
    expect(calculateShowValuesAs([10, 'x', 5], 'rank')).toEqual([1, undefined, 2]);
    expect(calculateShowValuesAs([10, 20, 5], 'runningTotal')).toEqual([10, 30, 35]);
    expect(calculateShowValuesAs([10, null, 5], 'runningTotal')).toEqual([10, undefined, 15]);
    expect(calculateShowValuesAs([10, 20, 5], 'differenceFromPrevious')).toEqual([undefined, 10, -15]);
    expect(calculateShowValuesAs([0, 0], 'percentOfGrandTotal')).toEqual([undefined, undefined]);
    expect(calculateShowValuesAs([1, 'a', NaN], 'percentOfRowTotal')).toEqual([1, undefined, undefined]);
    expect(calculateShowValuesAs([], 'rank')).toEqual([]);
    // 0.1 + 0.2 + 0.7 summed exactly (Neumaier): the shares are exactly 0.1 / 0.2 / 0.7 of 1
    expect(sumOfNumbers([0.1, 0.2, 0.7, 'x', undefined])).toBe(1);
  });

  it('formatShowValuesAs(), resolveShowValuesAs(), isPercentShowValuesAs()', () => {
    expect(formatShowValuesAs(0.667, 'percentOfColumnTotal')).toBe('66.7%');
    expect(formatShowValuesAs(1, 'percentOfColumnTotal')).toBe('100.0%');
    expect(formatShowValuesAs(0.5, { mode: 'percentOfColumnTotal', fractionDigits: 0 })).toBe('50%');
    expect(formatShowValuesAs(3, 'rank')).toBe('3');
    expect(formatShowValuesAs(1234.567, 'runningTotal')).toBe('1,234.57');
    expect(formatShowValuesAs(1234.5, { mode: 'runningTotal', fractionDigits: 2 })).toBe('1,234.50');
    expect(formatShowValuesAs(undefined, 'rank')).toBe('');
    expect(formatShowValuesAs('x', 'rank')).toBe('x');
    expect(resolveShowValuesAs('rank')).toEqual({ mode: 'rank' });
    expect(resolveShowValuesAs('nope' as ShowValuesAs)).toBeUndefined();
    expect(resolveShowValuesAs(undefined)).toBeUndefined();
    expect(isPercentShowValuesAs('percentOfRowTotal')).toBe(true);
    expect(isPercentShowValuesAs('runningTotal')).toBe(false);
    expect(SHOW_VALUES_AS_MODES).toHaveLength(7);
  });

  it('HTML in an own format stays text (the renderer uses text nodes)', () => {
    expect(formatShowValuesAs(0.5, { mode: 'rank', format: () => '<img src=x onerror=alert(1)>' })).toBe('<img src=x onerror=alert(1)>');
  });
});
