// Aggregators and helper functions (prompt 005, design prompts/005-aggregation-gesamtzeile.design.md § 2.1–2.3):
// reference cases G1–G6, merge = one pass (property test with a fixed seed), own aggregators, accessor vs. path.
import { describe, expect, expectTypeOf, it } from 'vitest';
import { Aggregators, aggregate, aggregateColumns, createValueGetter, formatAggregateValue, getAggregator } from '@guiexpert/table';
import type { AggregatorIf, AggregatorName } from '@guiexpert/table';
import { createSales, createSalesWithInvalidValues, seededRandom } from '../../../../test-utils/grouping-fixtures';

const NAMES: AggregatorName[] = ['sum', 'count', 'avg', 'min', 'max', 'countDistinct', 'first', 'last'];

/** One pass over all values with an aggregator. */
function run(aggregator: AggregatorIf, values: unknown[]): unknown {
  let state = aggregator.init();
  for (const v of values) state = aggregator.add(state, v);
  return aggregator.result(state);
}

describe('G1/G2 – the built-in aggregators on the reference rows', () => {
  const rows = createSales();

  it.each([
    ['sum', 450], ['count', 6], ['avg', 75], ['min', 30], ['max', 120], ['first', 100], ['last', 30],
  ] as const)('%s(umsatz) = %s', (name, expected) => {
    expect(aggregate(rows, 'umsatz', name)).toBe(expected);
  });

  it('countDistinct(region) = 2 (G2)', () => {
    expect(aggregate(rows, 'region', 'countDistinct')).toBe(2);
    expect(aggregate(rows, 'produkt', 'countDistinct')).toBe(2);
    expect(aggregate(rows, 'monat', Aggregators.countDistinct)).toBe(2);
  });

  it('aggregateColumns() computes several columns in one pass; a spec can name its value', () => {
    expect(aggregateColumns(rows, {
      umsatz: 'sum',
      region: 'countDistinct',
      avg: { aggregator: 'avg', value: 'umsatz' },
      doubled: { aggregator: 'sum', value: r => r.umsatz * 2 },
    })).toEqual({ umsatz: 450, region: 2, avg: 75, doubled: 900 });
  });

  it('the result keys keep the order of the spec', () => {
    expect(Object.keys(aggregateColumns(rows, { umsatz: 'max', region: 'count' }))).toEqual(['umsatz', 'region']);
  });
});

describe('G3 – a filtered subset', () => {
  it('January: sum 230, count 3, avg 76.67, min 50, max 100', () => {
    const jan = createSales().filter(r => r.monat === 'Jan');
    const result = aggregateColumns(jan, {
      sum: { aggregator: 'sum', value: 'umsatz' },
      count: 'count',
      avg: { aggregator: 'avg', value: 'umsatz' },
      min: { aggregator: 'min', value: 'umsatz' },
      max: { aggregator: 'max', value: 'umsatz' },
    });
    expect(result).toEqual({ sum: 230, count: 3, avg: expect.closeTo(76.667, 3), min: 50, max: 100 });
  });
});

describe('G4 – merge combines partial results', () => {
  const rows = createSales();
  const state = (name: AggregatorName, region: string) => {
    const a = getAggregator(name);
    let s = a.init();
    for (const r of rows.filter(r => r.region === region)) s = a.add(s, r.umsatz);
    return s;
  };

  it('avg of Nord (270/3) and Süd (180/3) is 75 = 450/6 – not the mean of the means', () => {
    const avg = Aggregators.avg;
    expect(avg.result(state('avg', 'Nord'))).toBe(90);
    expect(avg.result(state('avg', 'Süd'))).toBe(60);
    expect(avg.result(avg.merge(state('avg', 'Nord'), state('avg', 'Süd')))).toBe(75);
  });

  it.each(NAMES)('%s: merge(Nord, Süd) equals one pass over all rows (in that order)', name => {
    const a = getAggregator(name);
    const values = [...rows.filter(r => r.region === 'Nord'), ...rows.filter(r => r.region === 'Süd')].map(r => r.umsatz);
    expect(a.result(a.merge(state(name, 'Nord'), state(name, 'Süd')))).toEqual(run(a, values));
  });

  it.each(NAMES)('%s: merge with an empty state changes nothing (both sides)', name => {
    const a = getAggregator(name);
    const values = rows.map(r => r.umsatz);
    const full = () => { let s = a.init(); for (const v of values) s = a.add(s, v); return s; };
    expect(a.result(a.merge(full(), a.init()))).toEqual(run(a, values));
    expect(a.result(a.merge(a.init(), full()))).toEqual(run(a, values));
  });

  it.each(NAMES)('%s: random splits into 1–6 parts give the result of one pass (seed 4711)', name => {
    const random = seededRandom(4711);
    const a = getAggregator(name);
    for (let round = 0; round < 200; round++) {
      // integers and repeated values: exact comparison is possible
      const values = Array.from({ length: 1 + Math.floor(random() * 40) }, () => Math.floor(random() * 50) - 10);
      const parts: number[][] = [[]];
      for (const v of values) {
        if (random() < 0.25 && parts.length < 6) parts.push([]);
        parts[parts.length - 1].push(v);
      }
      const merged = parts
        .map(part => part.reduce((s, v) => a.add(s, v), a.init()))
        .reduce((x, y) => a.merge(x, y));
      expect(a.result(merged)).toEqual(run(a, values));
    }
  });

  it.each(NAMES)('%s: merge(a, b) never changes b – a merged state can be used further (e.g. by a parent group)', name => {
    const a = getAggregator(name);
    const child = [5, 7].reduce((s, v) => a.add(s, v), a.init());
    const before = a.result(child);
    const parent = a.merge(a.init(), child);
    a.add(parent, 99);
    a.add(parent, -50);
    a.merge(parent, [1].reduce((s, v) => a.add(s, v), a.init()));
    expect(a.result(child)).toEqual(before);
    const other = [3].reduce((s, v) => a.add(s, v), a.init());
    a.merge(other, child);
    expect(a.result(child)).toEqual(before);
  });

  it('sum and avg: floating point splits stay within 1e-9 of one pass (compensated summation)', () => {
    const random = seededRandom(42);
    const values = Array.from({ length: 10_000 }, () => random() * 1000 - 300);
    for (const name of ['sum', 'avg'] as const) {
      const a = getAggregator(name);
      const left = values.slice(0, 3_333).reduce((s, v) => a.add(s, v), a.init());
      const right = values.slice(3_333).reduce((s, v) => a.add(s, v), a.init());
      expect(a.result(a.merge(left, right)) as number).toBeCloseTo(run(a, values) as number, 9);
    }
  });

  it('sum: 0.1 + 0.2 + 0.3 is 0.6 (no 0.6000000000000001)', () => {
    expect(aggregate([0.1, 0.2, 0.3], v => v, 'sum')).toBe(0.6);
  });
});

describe('G5 – the empty set', () => {
  it.each([
    ['sum', 0], ['count', 0], ['countDistinct', 0],
    ['avg', undefined], ['min', undefined], ['max', undefined], ['first', undefined], ['last', undefined],
  ] as const)('%s → %s', (name, expected) => {
    expect(aggregate([], 'umsatz', name)).toBe(expected);
  });
});

describe('G6 – invalid values (null, undefined, "", "abc", NaN)', () => {
  const rows = createSalesWithInvalidValues();

  it('sum, avg, min, max use the numbers only', () => {
    expect(aggregateColumns(rows, {
      sum: { aggregator: 'sum', value: 'umsatz' },
      avg: { aggregator: 'avg', value: 'umsatz' },
      min: { aggregator: 'min', value: 'umsatz' },
      max: { aggregator: 'max', value: 'umsatz' },
    })).toEqual({ sum: 100, avg: 100, min: 100, max: 100 });
  });

  it('count counts rows (the value does not matter)', () => {
    expect(aggregate(rows, 'umsatz', 'count')).toBe(6);
  });

  it('countDistinct ignores null and undefined (NaN counts once)', () => {
    expect(aggregate(rows, 'umsatz', 'countDistinct')).toBe(4);
    expect(aggregate([NaN, NaN, 1], v => v, 'countDistinct')).toBe(2);
  });

  it('first and last take the value as it is', () => {
    expect(aggregate(rows, 'umsatz', 'first')).toBe(100);
    expect(aggregate(rows, 'umsatz', 'last')).toBeNaN();
    expect(aggregate([{ v: null }, { v: 2 }], 'v', 'first')).toBeNull();
  });

  it('numbers as text are not converted (like Excel SUM over a range) – an accessor can do it', () => {
    const texts = [{ v: '12' }, { v: '30' }];
    expect(aggregate(texts, 'v', 'sum')).toBe(0);
    expect(aggregate(texts, r => Number(r.v), 'sum')).toBe(42);
  });

  it('only numbers: no number at all → avg/min/max undefined, sum 0', () => {
    const none = [{ v: 'x' }, { v: null }];
    expect(aggregateColumns(none, {
      s: { aggregator: 'sum', value: 'v' }, a: { aggregator: 'avg', value: 'v' },
      mi: { aggregator: 'min', value: 'v' }, ma: { aggregator: 'max', value: 'v' },
    })).toEqual({ s: 0, a: undefined, mi: undefined, ma: undefined });
  });

  it('Infinity is a number', () => {
    expect(aggregate([1, Infinity], v => v, 'sum')).toBe(Infinity);
    expect(aggregate([1, -Infinity], v => v, 'min')).toBe(-Infinity);
  });

  it('bigint and booleans are ignored by sum', () => {
    expect(aggregate([1, true, 2n, 3], v => v, 'sum')).toBe(4);
  });
});

describe('min/max with dates', () => {
  const d1 = new Date('2026-01-05');
  const d2 = new Date('2026-03-01');
  const d3 = new Date('2025-12-24');

  it('return the earliest/latest Date itself', () => {
    expect(aggregate([d1, d2, d3], v => v, 'min')).toBe(d3);
    expect(aggregate([d1, d2, d3], v => v, 'max')).toBe(d2);
  });

  it('ignore invalid dates', () => {
    expect(aggregate([new Date('nonsense'), d1], v => v, 'min')).toBe(d1);
  });

  it('countDistinct counts equal points in time once', () => {
    expect(aggregate([d1, new Date(d1.getTime()), d2], v => v, 'countDistinct')).toBe(2);
  });
});

describe('own aggregators', () => {
  /** product of all numbers */
  const product: AggregatorIf<number, number> = {
    name: 'product',
    init: () => 1,
    add: (s, v) => typeof v === 'number' ? s * v : s,
    merge: (a, b) => a * b,
    result: s => s,
  };

  it('work in aggregate() and aggregateColumns()', () => {
    expect(aggregate([{ v: 2 }, { v: 3 }, { v: 7 }], 'v', product)).toBe(42);
    expect(aggregateColumns([{ v: 2 }, { v: 5 }], { v: product, n: 'count' })).toEqual({ v: 10, n: 2 });
  });

  it('getAggregator() returns an own aggregator unchanged and throws for unknown names', () => {
    expect(getAggregator(product)).toBe(product);
    expect(getAggregator('sum')).toBe(Aggregators.sum);
    expect(() => getAggregator('median' as AggregatorName)).toThrow(/median.*sum, count, avg/);
  });

  it('every built-in aggregator has its name', () => {
    for (const name of NAMES) expect(Aggregators[name].name).toBe(name);
  });
});

describe('createValueGetter – property path vs. accessor', () => {
  const rows = [{ address: { city: 'Kiel', zip: 24103 } }, { address: undefined }, { address: { city: 'Ulm', zip: 89073 } }];

  it('a dotted path reads nested properties (missing parents → undefined)', () => {
    const get = createValueGetter<typeof rows[number]>('address.city');
    expect(rows.map(get)).toEqual(['Kiel', undefined, 'Ulm']);
    expect(aggregate(rows, 'address.zip', 'sum')).toBe(113176);
  });

  it('a function is used as it is', () => {
    const fn = (r: { address?: { zip: number } }) => r.address?.zip;
    expect(createValueGetter(fn)).toBe(fn);
  });

  it('rows may be any ArrayLike (e.g. a typed array via accessor)', () => {
    expect(aggregate(new Float64Array([1.5, 2.5]), v => v, 'sum')).toBe(4);
  });

  it('types: the accessor gets the row type', () => {
    expectTypeOf(aggregate<{ total: number }>).parameter(1).toEqualTypeOf<string | ((row: { total: number }) => unknown)>();
  });
});

describe('formatAggregateValue', () => {
  it.each([
    [1234.5678, '1,234.57'], [0, '0'], [-0.005, '-0.01'], [undefined, ''], [null, ''],
    [Infinity, 'Infinity'], [NaN, 'NaN'], ['text', 'text'], [true, 'true'],
  ])('%s → %j', (value, text) => {
    expect(formatAggregateValue(value)).toBe(text);
  });

  it('dates as en-US date, an invalid date empty', () => {
    expect(formatAggregateValue(new Date(2026, 9, 15))).toBe('10/15/2026');
    expect(formatAggregateValue(new Date('nonsense'))).toBe('');
  });
});
