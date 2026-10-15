// The DOM-free row grouping engine (prompt 006, design § 2.1): groupRows + aggregateRowGroups, R1–R3, keys, order.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { aggregateRowGroups, aggregateColumns, Aggregators, groupRows, isRowGroup, RowGroup } from '@guiexpert/table';
import type { AggregatorIf, RowGroupIf } from '@guiexpert/table';
import { createSales, R1, R2, R3, seededRandom, type SaleRow } from '../../../../test-utils/grouping-fixtures';

afterEach(() => vi.restoreAllMocks());

const umsatzOf = (rows: SaleRow[]) => rows.map(r => r.umsatz);

describe('groupRows', () => {
  it('R1: one level, groups ascending, rows in source order', () => {
    const groups = groupRows(createSales(), ['region']);
    expect(groups.map(g => g.label)).toEqual(['Nord', 'Süd']);
    expect(groups.map(g => umsatzOf(g.getRows()))).toEqual(R1.groups.map(g => g.rows));
    expect(groups.every(g => g.level === 0 && g.parent === undefined && g.field === 'region')).toBe(true);
    expect(groups[0]).toBeInstanceOf(RowGroup);
    expect(isRowGroup(groups[0])).toBe(true);
  });

  it('R2: two levels with paths and parents', () => {
    const [nord, sued] = groupRows(createSales(), ['region', 'produkt']);
    expect(nord.children.map(g => g.label)).toEqual(['A', 'B']);
    expect(sued.children.map(g => g.path)).toEqual([['Süd', 'A'], ['Süd', 'B']]);
    expect(nord.children[0].parent).toBe(nord);
    expect(nord.children[0].level).toBe(1);
    expect(umsatzOf(nord.getRows())).toEqual([100, 120, 50]);   // view order: A (100, 120), then B (50)
    expect(umsatzOf(nord.children[0].getRows())).toEqual([100, 120]);
  });

  it('accessor functions and paths with dots', () => {
    const rows = [{ a: { city: 'Kiel' }, d: new Date(2025, 1, 3) }, { a: { city: 'Bonn' }, d: new Date(2026, 0, 1) }];
    expect(groupRows(rows, ['a.city']).map(g => g.key)).toEqual(['Bonn', 'Kiel']);
    const byYear = groupRows(rows, [{ name: 'year', value: r => r.d.getFullYear(), order: 'desc' }]);
    expect(byYear.map(g => g.key)).toEqual([2026, 2025]);
    expect(byYear[0].field).toBe('year');
    expect(groupRows(rows, [r => r.a.city])[0].field).toBe('level0');
  });

  it('null, undefined and "" form one group "(empty)", always last', () => {
    const rows = [{ k: 'b' }, { k: null }, { k: undefined }, { k: '' }, { k: 'a' }, {}];
    const groups = groupRows(rows, ['k']);
    expect(groups.map(g => g.label)).toEqual(['a', 'b', '(empty)']);
    expect(groups[2].getRows()).toHaveLength(4);
    expect(groups[2].key).toBeNull();
    expect(groupRows(rows, [{ value: 'k', order: 'desc' }]).map(g => g.label)).toEqual(['b', 'a', '(empty)']);
    expect(groupRows(rows, ['k'], { emptyLabel: '–' })[2].label).toBe('–');
  });

  it('1 and "1" are different groups; separators do not collide; dates by time; NaN is one group', () => {
    const groups = groupRows([{ k: 1 }, { k: '1' }, { k: 1 }], ['k']);
    expect(groups.map(g => [g.key, g.getRows().length])).toEqual([[1, 2], ['1', 1]]);
    expect(new Set(groups.map(g => g.id)).size).toBe(2);

    const sep = groupRows([{ a: 'a|b', b: 'c' }, { a: 'a', b: '|b' }], ['a', 'b']);
    expect(sep.length).toBe(2);
    expect(sep[0].children[0].id).not.toBe(sep[1].children[0].id);

    const d1 = new Date(2026, 0, 1);
    const dates = groupRows([{ d: d1 }, { d: new Date(d1.getTime()) }, { d: new Date(2026, 0, 2) }], ['d']);
    expect(dates.map(g => g.getRows().length)).toEqual([2, 1]);
    expect(dates[0].label).toBe('1/1/2026');

    expect(groupRows([{ n: NaN }, { n: NaN }, { n: 2 }], ['n']).map(g => g.getRows().length)).toEqual([1, 2]);
  });

  it('mixed key types: numbers, dates, booleans, text, objects', () => {
    const o = { toString: () => 'obj' };
    const rows = [{ k: 'x' }, { k: true }, { k: o }, { k: 10 }, { k: 9 }, { k: new Date(0) }, { k: false }, { k: 10n }];
    expect(groupRows(rows, ['k']).map(g => g.label)).toEqual(['9', '10', '10', expect.any(String), 'false', 'true', 'x', 'obj']);
    expect(groupRows([{ k: o }, { k: o }], ['k'])).toHaveLength(1);
  });

  it('rare keys: symbols, functions, invalid dates, NaN among numbers, ties between objects', () => {
    const sym = Symbol('s');
    const fn = () => 1;
    const bad = new Date('nope');
    const groups = groupRows([{ k: sym }, { k: fn }, { k: bad }, { k: new Date('nope') }, { k: NaN }, { k: 3 }, { k: Symbol() }], ['k']);
    expect(groups.map(g => g.label)).toEqual(['3', 'NaN', 'Invalid Date', expect.any(String), expect.any(String), expect.any(String)]);
    expect(groups[2].getRows()).toHaveLength(2);
    expect(new Set(groups.map(g => g.id)).size).toBe(groups.length);
    const dates = groupRows([{ d: bad }, { d: new Date(5) }, { d: new Date(1) }], ['d']);
    expect(dates.map(g => g.label.startsWith('Invalid'))).toEqual([false, false, true]);
    expect(groupRows([{ k: NaN }, { k: NaN }], [{ value: 'k', order: 'desc' }])).toHaveLength(1);
    expect(groupRows([{ k: 2 }, { k: NaN }, { k: 1 }], [{ value: 'k', order: 'desc' }]).map(g => g.key)).toEqual([NaN, 2, 1]);
  });

  it('"insertion" keeps the empty group last as well', () => {
    const groups = groupRows([{ k: '' }, { k: 'x' }, { k: null }, { k: 'a' }], [{ value: 'k', order: 'insertion' }]);
    expect(groups.map(g => g.label)).toEqual(['x', 'a', '(empty)']);
  });

  it('first/last follow the grouped view (groups in their order, rows in source order) – like the total row', () => {
    const rows = [{ g: 'b', v: 1 }, { g: 'a', v: 2 }, { g: 'b', v: 3 }, { g: 'a', v: 4 }];
    const groups = groupRows(rows, ['g']);
    const totals = aggregateRowGroups(groups, { first: { aggregator: 'first', value: 'v' }, last: { aggregator: 'last', value: 'v' } });
    expect(groups.map(g => [g.results['first'], g.results['last']])).toEqual([[2, 4], [1, 3]]);
    expect(totals).toEqual({ first: 2, last: 3 });
    expect(groups.flatMap(g => g.getRows().map(r => r.v))).toEqual([2, 4, 1, 3]);
  });

  it('text keys in natural order; insertion order; own comparator', () => {
    const rows = ['A10', 'A2', 'B', 'a1'].map(k => ({ k }));
    expect(groupRows(rows, ['k']).map(g => g.key)).toEqual(['a1', 'A2', 'A10', 'B']);
    expect(groupRows(rows, [{ value: 'k', order: 'insertion' }]).map(g => g.key)).toEqual(['A10', 'A2', 'B', 'a1']);
    const months = ['Jan', 'Feb'];
    expect(groupRows(createSales(), [{ value: 'monat', order: (a, b) => months.indexOf(a as string) - months.indexOf(b as string) }])
      .map(g => g.key)).toEqual(['Jan', 'Feb']);
  });

  it('format of a level', () => {
    const groups = groupRows(createSales(), [{ value: 'region', format: k => `Region ${k}` }]);
    expect(groups.map(g => g.label)).toEqual(['Region Nord', 'Region Süd']);
  });

  it('stable ids: the same data give the same ids', () => {
    const a = groupRows(createSales(), ['region', 'produkt']);
    const b = groupRows(createSales().reverse(), ['region', 'produkt']);
    expect(a.flatMap(g => [g.id, ...g.children.map(c => c.id)])).toEqual(b.flatMap(g => [g.id, ...g.children.map(c => c.id)]));
    expect(a[0].children[0].id).toBe('rowgroup:[["region","s:Nord"],["produkt","s:A"]]');
  });

  it('edge cases: no rows, no levels, one row, one group, one group per row', () => {
    expect(groupRows([], ['region'])).toEqual([]);
    expect(groupRows(createSales(), [])).toEqual([]);
    expect(groupRows([createSales()[0]], ['region'])).toHaveLength(1);
    expect(groupRows(createSales(), [() => 'all'])).toHaveLength(1);
    expect(groupRows(createSales(), ['umsatz'])).toHaveLength(6);
  });

  it('does not change the source rows', () => {
    const rows = createSales().map(r => Object.freeze(r));
    const copy = structuredClone(createSales());
    const groups = groupRows(Object.freeze(rows) as SaleRow[], ['region', 'produkt']);
    aggregateRowGroups(groups, { umsatz: 'sum' });
    expect(rows).toEqual(copy);
  });

  it('throws for a level without value', () => {
    expect(() => groupRows(createSales(), [{} as never])).toThrow(/level 0/);
  });

  it('getRows(false) ignores the filter', () => {
    const groups = groupRows(createSales(), ['region']);
    aggregateRowGroups(groups, { umsatz: 'sum' }, i => i === 0);
    expect(groups[0].getRows()).toHaveLength(1);
    expect(groups[0].getRows(false)).toHaveLength(3);
  });
});

describe('aggregateRowGroups', () => {
  it('R1 + R2: sums of groups, sub-groups and total', () => {
    const groups = groupRows(createSales(), ['region', 'produkt']);
    const totals = aggregateRowGroups(groups, { umsatz: 'sum' });
    const [nord, sued] = groups;
    expect([nord.results['umsatz'], nord.children[0].results['umsatz'], nord.children[1].results['umsatz']]).toEqual([R2.Nord.sum, R2.Nord.A, R2.Nord.B]);
    expect([sued.results['umsatz'], sued.children[0].results['umsatz'], sued.children[1].results['umsatz']]).toEqual([R2.Süd.sum, R2.Süd.A, R2.Süd.B]);
    expect(totals['umsatz']).toBe(R2.total);
    expect([nord.count, nord.children[1].count]).toEqual([3, 1]);
  });

  it('R3: average from merged states – Nord 90 (not 80), Süd 60 (not 62.5), total 75', () => {
    const groups = groupRows(createSales(), ['region', 'produkt']);
    const totals = aggregateRowGroups(groups, { umsatz: 'avg' });
    const [nord, sued] = groups;
    expect(nord.results['umsatz']).toBeCloseTo(R3.Nord.avg);
    expect(nord.children.map(c => c.results['umsatz'])).toEqual([R3.Nord.A, R3.Nord.B]);
    expect(sued.results['umsatz']).toBeCloseTo(R3.Süd.avg);
    expect(sued.children.map(c => c.results['umsatz'])).toEqual([R3.Süd.A, R3.Süd.B]);
    expect(totals['umsatz']).toBeCloseTo(R3.total);
  });

  it('every built-in aggregator through the grouping equals one pass over the rows', () => {
    const rows = createSales();
    const names = ['sum', 'count', 'avg', 'min', 'max', 'countDistinct', 'first', 'last'] as const;
    const specs = Object.fromEntries(names.map(n => [n, { aggregator: n, value: 'umsatz' }]));
    const groups = groupRows(rows, ['region']);
    const totals = aggregateRowGroups(groups, specs);
    expect(totals).toEqual(aggregateColumns(rows, specs));
    for (const group of groups) {
      expect(group.results).toEqual(aggregateColumns(group.getRows(), specs));
    }
  });

  it('an own aggregator; parents merge and never change child states', () => {
    const product: AggregatorIf<{ p: number }, number> = {
      name: 'product',
      init: () => ({ p: 1 }),
      add: (s, v) => { if (typeof v === 'number') s.p *= v; return s; },
      merge: (a, b) => { a.p *= b.p; return a; },
      result: s => s.p,
    };
    const merge = vi.spyOn(product, 'merge');
    const rows = [{ g: 'x', h: 1, v: 2 }, { g: 'x', h: 2, v: 3 }, { g: 'y', h: 1, v: 7 }];
    const groups = groupRows(rows, ['g', 'h']);
    const totals = aggregateRowGroups(groups, { v: product });
    expect(groups.map(g => g.results['v'])).toEqual([6, 7]);
    expect(groups[0].children.map(g => g.results['v'])).toEqual([2, 3]);
    expect(totals['v']).toBe(42);
    expect(merge).toHaveBeenCalled();
  });

  it('property test: group sums by merge equal one pass over the raw values (fixed seed)', () => {
    const random = seededRandom(7);
    const rows = Array.from({ length: 2000 }, () => ({
      a: Math.floor(random() * 5), b: Math.floor(random() * 7), v: (random() - 0.5) * 1e6,
    }));
    const groups = groupRows(rows, ['a', 'b']);
    const totals = aggregateRowGroups(groups, { v: 'sum', avg: { aggregator: 'avg', value: 'v' } });
    const direct = aggregateColumns(rows, { v: 'sum', avg: { aggregator: 'avg', value: 'v' } });
    expect(totals['v']).toBeCloseTo(direct['v'] as number, 6);
    expect(totals['avg']).toBeCloseTo(direct['avg'] as number, 9);
    for (const group of groups) {
      expect(group.results['v']).toBeCloseTo(aggregate(group), 6);
    }
    function aggregate(group: RowGroupIf<typeof rows[number]>): number {
      return group.getRows().reduce((s, r) => s + r.v, 0);
    }
  });

  it('a filter: counts and aggregates of the accepted rows; an empty group has neutral results', () => {
    const groups = groupRows(createSales(), ['region']);
    const totals = aggregateRowGroups(groups, { umsatz: 'sum', n: 'count', a: { aggregator: 'avg', value: 'umsatz' } },
      i => createSales()[i].region === 'Nord');
    expect(groups[1].count).toBe(0);
    expect(groups[1].results).toEqual({ umsatz: 0, n: 0, a: undefined });
    expect(totals).toEqual({ umsatz: 270, n: 3, a: 90 });
  });

  it('no aggregations: only counts', () => {
    const groups = groupRows(createSales(), ['region']);
    expect(aggregateRowGroups(groups, {})).toEqual({});
    expect(groups.map(g => g.count)).toEqual([3, 3]);
    expect(Aggregators.sum.name).toBe('sum');
  });
});
