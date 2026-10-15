// Pivot engine (prompt 007, design prompts/007-pivot.design.md § 2.1, 2.2, 2.4, 2.6): reference cases 1–3, empty
// combinations, keys, values, order, maxColumns, filter, drill-down, a property test against a naive computation.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { aggregate, pivotRows } from '@guiexpert/table';
import type { AggregatorIf, PivotResult, RowGroupIf } from '@guiexpert/table';
import { createSales, P1, P2, P3, seededRandom, type SaleRow } from '../../../../test-utils/grouping-fixtures';

afterEach(() => vi.restoreAllMocks());

const MONTHS = { value: 'monat', order: 'insertion' as const };

/** The row group / column key with the given keys. */
function find<T>(groups: RowGroupIf<T>[], ...path: unknown[]): RowGroupIf<T> {
  let found: RowGroupIf<T> | undefined;
  let list = groups;
  for (const key of path) {
    found = list.find(g => g.key === key);
    if (!found) throw new Error(`no group ${String(key)}`);
    list = found.children;
  }
  return found!;
}

function table<T>(r: PivotResult<T>, rows: unknown[][], columns: unknown[]) {
  return rows.map(path => {
    const row = path.length ? find(r.rowGroups, ...path) : undefined;
    return columns.map(c => r.getValue(row, c === 'total' ? undefined : find(r.columnGroups, c)));
  });
}

describe('pivotRows – reference cases', () => {
  it('case 1: region × monat, sum – cells, row totals, column totals, grand total', () => {
    const r = pivotRows(createSales(), { rowFields: ['region'], columnFields: [MONTHS], values: ['umsatz'] });
    expect(r.rowGroups.map(g => g.label)).toEqual(['Nord', 'Süd']);
    expect(r.columnLeaves.map(g => g.label)).toEqual(['Jan', 'Feb']);
    expect(table(r, [['Nord'], ['Süd'], []], ['Jan', 'Feb', 'total'])).toEqual([
      [P1.Nord.Jan, P1.Nord.Feb, P1.Nord.total],
      [P1.Süd.Jan, P1.Süd.Feb, P1.Süd.total],
      [P1.total.Jan, P1.total.Feb, P1.total.total],
    ]);
    expect(r.truncated).toBe(false);
  });

  it('case 2: region › produkt – subtotals in the group rows, a missing combination is undefined (not 0)', () => {
    const r = pivotRows(createSales(), { rowFields: ['region', 'produkt'], columnFields: [MONTHS], values: ['umsatz'] });
    const cols = ['Jan', 'Feb', 'total'];
    expect(table(r, [['Nord'], ['Nord', 'A'], ['Nord', 'B'], ['Süd'], ['Süd', 'A'], ['Süd', 'B'], []], cols)).toEqual([
      [P2.Nord.Jan, P2.Nord.Feb, P2.Nord.total],
      [P2.Nord.A.Jan, P2.Nord.A.Feb, P2.Nord.A.total],
      [P2.Nord.B.Jan, undefined, P2.Nord.B.total],
      [P2.Süd.Jan, P2.Süd.Feb, P2.Süd.total],
      [P2.Süd.A.Jan, P2.Süd.A.Feb, P2.Süd.A.total],
      [undefined, P2.Süd.B.Feb, P2.Süd.B.total],
      [P2.total.Jan, P2.total.Feb, P2.total.total],
    ]);
    expect(r.getCount(find(r.rowGroups, 'Nord', 'B'), find(r.columnGroups, 'Feb'))).toBe(0);
  });

  it('case 3: avg – the Jan total is 230 / 3 = 76.67, not the mean of the region means (77.5)', () => {
    const r = pivotRows(createSales(), {
      rowFields: ['region'], columnFields: [MONTHS], values: [{ value: 'umsatz', aggregator: 'avg' }],
    });
    const jan = find(r.columnGroups, 'Jan');
    expect(r.getValue(find(r.rowGroups, 'Nord'), jan)).toBe(P3.Nord.Jan);
    expect(r.getValue(find(r.rowGroups, 'Süd'), jan)).toBe(P3.Süd.Jan);
    expect(r.getValue(undefined, jan)).toBeCloseTo(76.6667, 4);
    expect(r.getValue(undefined, jan)).not.toBeCloseTo(77.5, 1);
    expect(r.getValue(undefined, find(r.columnGroups, 'Feb'))).toBeCloseTo(P3.total.Feb, 10);
    expect(r.getValue(find(r.rowGroups, 'Nord'))).toBe(P3.Nord.total);
    expect(r.getValue(find(r.rowGroups, 'Süd'))).toBe(P3.Süd.total);
    expect(r.getValue()).toBe(P3.total.total);
  });

  it('avg over a two-level hierarchy: Nord = mean of its 3 rows (90), not of A (110) and B (50)', () => {
    const r = pivotRows(createSales(), { rowFields: ['region', 'produkt'], values: [{ value: 'umsatz', aggregator: 'avg' }] });
    expect(r.getValue(find(r.rowGroups, 'Nord'))).toBe(90);
    expect(r.getValue(find(r.rowGroups, 'Nord', 'A'))).toBe(110);
  });
});

describe('pivotRows – structure', () => {
  it('no column fields: only the totals; no row fields: one total row', () => {
    const noColumns = pivotRows(createSales(), { rowFields: ['region'], values: ['umsatz'] });
    expect(noColumns.columnGroups).toEqual([]);
    expect(noColumns.getValue(find(noColumns.rowGroups, 'Nord'))).toBe(270);
    const noRows = pivotRows(createSales(), { rowFields: [], columnFields: [MONTHS], values: ['umsatz'] });
    expect(noRows.rowGroups).toEqual([]);
    expect(noRows.getValue(undefined, find(noRows.columnGroups, 'Feb'))).toBe(220);
    expect(noRows.getValue()).toBe(450);
  });

  it('two column fields: column groups with subtotals by merge (in column direction)', () => {
    const r = pivotRows(createSales(), { rowFields: ['region'], columnFields: [MONTHS, 'produkt'], values: ['umsatz'] });
    expect(r.columnGroups.map(g => g.label)).toEqual(['Jan', 'Feb']);
    expect(r.columnLeaves.map(g => g.path)).toEqual([['Jan', 'A'], ['Jan', 'B'], ['Feb', 'A'], ['Feb', 'B']]);
    const nord = find(r.rowGroups, 'Nord');
    expect(r.getValue(nord, find(r.columnGroups, 'Jan', 'B'))).toBe(50);
    expect(r.getValue(nord, find(r.columnGroups, 'Jan'))).toBe(150);
    expect(r.getValue(nord, find(r.columnGroups, 'Feb', 'B'))).toBeUndefined();
    expect(r.getValue(undefined, find(r.columnGroups, 'Feb'))).toBe(220);
  });

  it('two values: default names and labels, access by index and by name', () => {
    const r = pivotRows(createSales(), {
      rowFields: ['region'], columnFields: [MONTHS],
      values: ['umsatz', { value: 'umsatz', aggregator: 'count', label: 'Count' }],
    });
    expect(r.values.map(v => [v.name, v.label])).toEqual([['sum(umsatz)', 'sum(umsatz)'], ['count(umsatz)', 'Count']]);
    const nord = find(r.rowGroups, 'Nord');
    const jan = find(r.columnGroups, 'Jan');
    expect([r.getValue(nord, jan, 0), r.getValue(nord, jan, 1)]).toEqual([150, 2]);
    expect(r.getValue(nord, jan, 'count(umsatz)')).toBe(2);
    expect(r.getValue(nord, jan, 'unknown')).toBeUndefined();
    expect(r.getValue(nord, jan, 7)).toBeUndefined();
  });

  it('duplicate value names get a suffix; a function value is named value<N>', () => {
    const r = pivotRows(createSales(), { rowFields: ['region'], values: ['umsatz', 'umsatz', (s: SaleRow) => s.umsatz * 2] });
    expect(r.values.map(v => v.name)).toEqual(['sum(umsatz)', 'sum(umsatz)#2', 'sum(value2)']);
    expect(r.getValue(undefined, undefined, 2)).toBe(900);
  });

  it('no values or an invalid value throws', () => {
    expect(() => pivotRows(createSales(), { rowFields: ['region'], values: [] })).toThrow(/at least one value/);
    expect(() => pivotRows(createSales(), { rowFields: ['region'], values: [{} as never] })).toThrow(/value 0/);
  });

  it('counts and totals are also on the groups (count, results by value name)', () => {
    const r = pivotRows(createSales(), { rowFields: ['region'], columnFields: [MONTHS], values: ['umsatz'] });
    const nord = find(r.rowGroups, 'Nord');
    expect([nord.count, nord.results['sum(umsatz)']]).toEqual([3, 270]);
    const jan = find(r.columnGroups, 'Jan');
    expect([jan.count, jan.results['sum(umsatz)']]).toEqual([3, 230]);
  });
});

describe('pivotRows – fields and keys', () => {
  it('a field as property path and as accessor (quarter of an ISO date)', () => {
    const rows = [
      { o: { country: 'DE' }, date: '2026-01-15', total: 10 },
      { o: { country: 'DE' }, date: '2026-05-01', total: 20 },
      { o: { country: 'FR' }, date: '2026-02-28', total: 5 },
    ];
    const r = pivotRows(rows, {
      rowFields: ['o.country'],
      columnFields: [{ value: row => Math.floor(new Date(row.date).getMonth() / 3) + 1, format: q => `Q${q}` }],
      values: ['total'],
    });
    expect(r.columnLeaves.map(c => c.label)).toEqual(['Q1', 'Q2']);
    expect(r.getValue(find(r.rowGroups, 'DE'), find(r.columnGroups, 1))).toBe(10);
    expect(r.getValue(undefined, find(r.columnGroups, 1))).toBe(15);
  });

  it('null, undefined and "" are one "(empty)" key at the end – rows and columns; emptyLabel', () => {
    const rows = [{ a: null, b: 'x', v: 1 }, { a: undefined, b: '', v: 2 }, { a: '', b: 'x', v: 3 }, { a: 'k', b: null, v: 4 }];
    const r = pivotRows(rows, { rowFields: ['a'], columnFields: ['b'], values: ['v'], emptyLabel: '–' });
    expect(r.rowGroups.map(g => g.label)).toEqual(['k', '–']);
    expect(r.columnLeaves.map(g => g.label)).toEqual(['x', '–']);
    expect(r.getValue(r.rowGroups[1], r.columnLeaves[0])).toBe(4);   // 1 + 3
    expect(r.getValue(r.rowGroups[1], r.columnLeaves[1])).toBe(2);
  });

  it('1 and "1" are different keys; "a|b" does not collide with "a" + "|b"; NaN is one key; dates by time', () => {
    const d1 = new Date(2026, 0, 1);
    const rows = [
      { r: 1, c: 'a|b', d: d1, v: 1 },
      { r: '1', c: 'a', d: new Date(d1.getTime()), v: 2 },
      { r: NaN, c: '|b', d: d1, v: 4 },
      { r: NaN, c: 'a|b', d: d1, v: 8 },
    ];
    const r = pivotRows(rows, { rowFields: ['r'], columnFields: ['c', 'd'], values: ['v'] });
    expect(r.rowGroups.map(g => g.key)).toEqual([1, NaN, '1']);
    expect(r.columnGroups.map(g => g.key)).toEqual(['|b', 'a', 'a|b']);
    expect(r.columnLeaves).toHaveLength(3);                            // one date per column key
    expect(r.getValue(r.rowGroups[1])).toBe(12);                         // NaN: 4 + 8
    expect(r.getValue(undefined, find(r.columnGroups, 'a|b'))).toBe(9);
  });

  it('non-numeric values: sum and avg ignore them (005 rule), count counts the rows', () => {
    const rows = [{ g: 'x', v: 10 }, { g: 'x', v: '20' }, { g: 'x', v: null }, { g: 'x', v: NaN }, { g: 'x', v: 30 }];
    const r = pivotRows(rows, { rowFields: ['g'], values: ['v', { value: 'v', aggregator: 'avg' }, { value: 'v', aggregator: 'count' }] });
    expect([0, 1, 2].map(i => r.getValue(r.rowGroups[0], undefined, i))).toEqual([40, 20, 5]);
  });

  it('every built-in aggregator equals an independent computation over the cell rows', () => {
    const rows = createSales();
    for (const name of ['sum', 'count', 'avg', 'min', 'max', 'countDistinct', 'first', 'last'] as const) {
      const r = pivotRows(rows, { rowFields: ['region'], columnFields: [MONTHS], values: [{ value: 'umsatz', aggregator: name }] });
      for (const region of ['Nord', 'Süd']) {
        for (const monat of ['Jan', 'Feb']) {
          const cellRows = rows.filter(s => s.region === region && s.monat === monat);
          expect(r.getValue(find(r.rowGroups, region), find(r.columnGroups, monat)), `${name} ${region} ${monat}`)
            .toEqual(aggregate(cellRows, 'umsatz', name));
        }
      }
      if (name !== 'first' && name !== 'last') {
        expect(r.getValue(), name).toEqual(aggregate(rows, 'umsatz', name));
      }
    }
  });

  it('an own aggregator (init/add/merge/result) – subtotals merge its states', () => {
    const range: AggregatorIf<[number, number], number> = {
      name: 'range',
      init: () => [Infinity, -Infinity],
      add: ([lo, hi], v) => typeof v === 'number' ? [Math.min(lo, v), Math.max(hi, v)] : [lo, hi],
      merge: (a, b) => [Math.min(a[0], b[0]), Math.max(a[1], b[1])],
      result: ([lo, hi]) => hi - lo,
    };
    const r = pivotRows(createSales(), { rowFields: ['region', 'produkt'], values: [{ value: 'umsatz', aggregator: range }] });
    expect(r.values[0].name).toBe('range(umsatz)');
    expect(r.getValue(find(r.rowGroups, 'Nord'))).toBe(70);   // 120 - 50
    expect(r.getValue()).toBe(90);                             // 120 - 30
  });
});

describe('pivotRows – order, maxColumns, filter, drill-down, edge cases', () => {
  it('column keys in natural order by default, with a comparator or descending', () => {
    expect(pivotRows(createSales(), { rowFields: [], columnFields: ['monat'], values: ['umsatz'] }).columnLeaves.map(c => c.key))
      .toEqual(['Feb', 'Jan']);
    const months = ['Jan', 'Feb'];
    const byCalendar = pivotRows(createSales(), {
      rowFields: [], values: ['umsatz'],
      columnFields: [{ value: 'monat', order: (a, b) => months.indexOf(a as string) - months.indexOf(b as string) }],
    });
    expect(byCalendar.columnLeaves.map(c => c.key)).toEqual(['Jan', 'Feb']);
    const desc = pivotRows(createSales(), { rowFields: [{ value: 'region', order: 'desc' }], values: ['umsatz'] });
    expect(desc.rowGroups.map(g => g.key)).toEqual(['Süd', 'Nord']);
  });

  it('maxColumns: the first keys are shown, a warning, truncated – the totals still count all rows', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const rows = Array.from({ length: 10 }, (_, i) => ({ g: 'x', c: i, v: 1 }));
    const r = pivotRows(rows, { rowFields: ['g'], columnFields: ['c'], values: ['v'], maxColumns: 3 });
    expect(r.truncated).toBe(true);
    expect(r.columnLeaves.map(c => c.key)).toEqual([0, 1, 2]);
    expect(warn).toHaveBeenCalledOnce();
    expect(r.getValue(r.rowGroups[0])).toBe(10);
    expect(r.getValue()).toBe(10);
    expect(r.isColumnShown(r.columnGroups[2])).toBe(true);
    expect(r.isColumnShown(r.columnGroups[3])).toBe(false);
    expect(r.getValue(r.rowGroups[0], r.columnGroups[5])).toBe(1);   // not shown as a column, but computed (subtotals)
  });

  it('compute(accept): a filter of the source rows before the aggregation (the keys stay)', () => {
    const rows = createSales();
    const r = pivotRows(rows, { rowFields: ['region'], columnFields: [MONTHS], values: ['umsatz'] });
    r.compute(i => rows[i].produkt === 'A');
    expect(r.getValue(find(r.rowGroups, 'Nord'))).toBe(220);
    expect(r.getValue(find(r.rowGroups, 'Süd'), find(r.columnGroups, 'Feb'))).toBe(30);
    expect(r.getValue()).toBe(330);
    expect(r.columnLeaves).toHaveLength(2);
    r.compute(() => false);
    expect(r.getValue()).toBeUndefined();
    expect(r.getCount()).toBe(0);
    r.compute();
    expect(r.getValue()).toBe(450);
  });

  it('a filter passed to pivotRows; getRows() of a group follows it', () => {
    const rows = createSales();
    const r = pivotRows(rows, { rowFields: ['region'], values: ['umsatz'] }, i => rows[i].monat === 'Jan');
    expect(r.getValue()).toBe(230);
    expect(find(r.rowGroups, 'Nord').getRows().map(s => s.umsatz)).toEqual([100, 50]);
  });

  it('getSourceRows: drill-down of a cell, a row, a column, everything – filtered, in source order', () => {
    const rows = createSales();
    const r = pivotRows(rows, { rowFields: ['region', 'produkt'], columnFields: [MONTHS], values: ['umsatz'] });
    const nord = find(r.rowGroups, 'Nord');
    const jan = find(r.columnGroups, 'Jan');
    expect(r.getSourceRows(nord, jan).map(s => s.umsatz)).toEqual([100, 50]);
    expect(r.getSourceRows(nord).map(s => s.umsatz)).toEqual([100, 50, 120]);
    expect(r.getSourceRows(undefined, jan).map(s => s.umsatz)).toEqual([100, 50, 80]);
    expect(r.getSourceRows()).toHaveLength(6);
    r.compute(i => rows[i].produkt === 'B');
    expect(r.getSourceRows(nord, jan).map(s => s.umsatz)).toEqual([50]);
  });

  it('empty input, one row, a field without hits', () => {
    const empty = pivotRows([], { rowFields: ['region'], columnFields: ['monat'], values: ['umsatz'] });
    expect([empty.rowGroups, empty.columnLeaves, empty.getValue()]).toEqual([[], [], undefined]);
    const one = pivotRows([createSales()[0]], { rowFields: ['region'], columnFields: ['monat'], values: ['umsatz'] });
    expect(one.getValue(one.rowGroups[0], one.columnLeaves[0])).toBe(100);
    const none = pivotRows(createSales(), { rowFields: ['missing'], values: ['umsatz'] });
    expect(none.rowGroups.map(g => g.label)).toEqual(['(empty)']);
    expect(none.getValue(none.rowGroups[0])).toBe(450);
  });

  it('the source rows are not changed (frozen objects and array)', () => {
    const rows = Object.freeze(createSales().map(s => Object.freeze(s)));
    const copy = structuredClone(rows);
    const r = pivotRows(rows, { rowFields: ['region', 'produkt'], columnFields: [MONTHS], values: ['umsatz', { value: 'umsatz', aggregator: 'avg' }] });
    r.compute(i => i > 0);
    expect(rows).toEqual(copy);
  });

  it('first/last: source order inside a cell, merged in display order (columns first, then rows)', () => {
    const r = pivotRows(createSales(), { rowFields: ['region'], columnFields: [MONTHS], values: [{ value: 'umsatz', aggregator: 'first' }] });
    expect(r.getValue(find(r.rowGroups, 'Süd'), find(r.columnGroups, 'Feb'))).toBe(70);
    expect(r.getValue(find(r.rowGroups, 'Süd'))).toBe(80);     // first of the row in source order
    expect(r.getValue(undefined, find(r.columnGroups, 'Feb'))).toBe(120);   // Nord before Süd
    expect(r.getValue()).toBe(100);
  });
});

describe('pivotRows – property test (fixed seed)', () => {
  it('every cell, subtotal and total equals a naive computation over the matching rows', () => {
    const random = seededRandom(7);
    const pick = <V>(list: V[]) => list[Math.floor(random() * list.length)];
    const rows = Array.from({ length: 2000 }, () => ({
      a: pick(['x', 'y', 'z', null]), b: pick([1, 2, 3]), c: pick(['p', 'q']), d: pick([10, 20, '']),
      v: random() < 0.1 ? null : Math.round(random() * 1000) / 10,
    }));
    const r = pivotRows(rows, {
      rowFields: ['a', 'b'], columnFields: ['c', 'd'],
      values: ['v', { value: 'v', aggregator: 'avg' }, { value: 'v', aggregator: 'max' }],
    });
    const norm = (k: unknown) => (k === '' || k === undefined) ? null : k;
    const matches = (row: typeof rows[number], path: readonly unknown[], fields: ('a' | 'b' | 'c' | 'd')[]) =>
      path.every((key, i) => norm(row[fields[i]]) === key);
    const rowNodes: (RowGroupIf | undefined)[] = [undefined];
    const colNodes: (RowGroupIf | undefined)[] = [undefined];
    const walk = (groups: RowGroupIf[], into: (RowGroupIf | undefined)[]) => groups.forEach(g => { into.push(g); walk(g.children, into); });
    walk(r.rowGroups, rowNodes);
    walk(r.columnGroups, colNodes);
    let checked = 0;
    for (const rowNode of rowNodes) {
      for (const colNode of colNodes) {
        const subset = rows.filter(row =>
          (!rowNode || matches(row, rowNode.path, ['a', 'b'])) && (!colNode || matches(row, colNode.path, ['c', 'd'])));
        for (const [i, name] of (['sum', 'avg', 'max'] as const).entries()) {
          const expected = subset.length ? aggregate(subset, 'v', name) : undefined;
          const actual = r.getValue(rowNode, colNode, i);
          if (typeof expected === 'number') expect(actual as number).toBeCloseTo(expected, 8);
          else expect(actual).toEqual(expected);
          checked++;
        }
      }
    }
    expect(checked).toBeGreaterThan(300);
  });
});
