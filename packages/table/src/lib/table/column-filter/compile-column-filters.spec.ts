import { describe, expect, it } from 'vitest';
import {
  compileColumnFilterPredicate,
  compileSingleColumnFilter,
  filterValueKey,
  isBlankFilterValue,
  type ColumnFilterIf,
  type ColumnFiltersMap,
  deserializeColumnFilters,
  serializeColumnFilters,
} from '@guiexpert/table';

describe('isBlankFilterValue & filterValueKey', () => {
  it('treats null, undefined, empty string and NaN as blank, but keeps 0 and false', () => {
    expect(isBlankFilterValue(null)).toBe(true);
    expect(isBlankFilterValue(undefined)).toBe(true);
    expect(isBlankFilterValue('')).toBe(true);
    expect(isBlankFilterValue(Number.NaN)).toBe(true);
    expect(isBlankFilterValue(0)).toBe(false);
    expect(isBlankFilterValue(false)).toBe(false);
    expect(isBlankFilterValue(' ')).toBe(false);
  });

  it('distinguishes 1 from "1", booleans, dates and blanks', () => {
    expect(filterValueKey(1)).not.toBe(filterValueKey('1'));
    expect(filterValueKey(true)).not.toBe(filterValueKey('true'));
    expect(filterValueKey(null)).toBe(filterValueKey(undefined));
    expect(filterValueKey(null)).toBe(filterValueKey(''));
    expect(filterValueKey(new Date(2026, 4, 10))).toBe(filterValueKey(new Date(2026, 4, 10)));
    expect(filterValueKey(new Date(Number.NaN))).toBe(filterValueKey(null));
  });
});

describe('compileSingleColumnFilter – text', () => {
  it('supports contains, startsWith, endsWith, equals, notEquals (case-insensitive by default)', () => {
    const contains = compileSingleColumnFilter({ condition: { operator: 'contains', value: 'EM' } }, 'text');
    expect(contains('EMEA')).toBe(true);
    expect(contains('emea')).toBe(true);
    expect(contains('APAC')).toBe(false);
    expect(contains(null)).toBe(false);

    const starts = compileSingleColumnFilter({ condition: { operator: 'startsWith', value: 'ber' } }, 'text');
    expect(starts('Berlin')).toBe(true);
    expect(starts('Hamburg')).toBe(false);

    const ends = compileSingleColumnFilter({ condition: { operator: 'endsWith', value: 'LIN' } }, 'text');
    expect(ends('Berlin')).toBe(true);
    expect(ends('Berna')).toBe(false);

    const eq = compileSingleColumnFilter({ condition: { operator: 'equals', value: 'emea' } }, 'text');
    expect(eq('EMEA')).toBe(true);
    expect(eq('EMEA West')).toBe(false);

    const neq = compileSingleColumnFilter({ condition: { operator: 'notEquals', value: 'emea' } }, 'text');
    expect(neq('EMEA')).toBe(false);
    expect(neq('APAC')).toBe(true);
    expect(neq(null)).toBe(true);
  });

  it('respects caseSensitive option and converts numbers in text columns', () => {
    const cs = compileSingleColumnFilter(
      { condition: { operator: 'contains', value: 'Em' } },
      'text',
      { caseSensitive: true },
    );
    expect(cs('Emea')).toBe(true);
    expect(cs('EMEA')).toBe(false);

    const numAsText = compileSingleColumnFilter({ condition: { operator: 'contains', value: '23' } }, 'text');
    expect(numAsText(1234)).toBe(true);
    expect(numAsText(5678)).toBe(false);
  });

  it('supports blank and notBlank', () => {
    const blank = compileSingleColumnFilter({ condition: { operator: 'blank' } }, 'text');
    expect(blank(null)).toBe(true);
    expect(blank(undefined)).toBe(true);
    expect(blank('')).toBe(true);
    expect(blank('x')).toBe(false);

    const notBlank = compileSingleColumnFilter({ condition: { operator: 'notBlank' } }, 'text');
    expect(notBlank(null)).toBe(false);
    expect(notBlank('')).toBe(false);
    expect(notBlank('x')).toBe(true);
  });
});

describe('compileSingleColumnFilter – number', () => {
  it('supports equals, notEquals, <, <=, >, >=, between (including swapped bounds)', () => {
    const lt = compileSingleColumnFilter({ condition: { operator: 'lessThan', value: 10 } }, 'number');
    expect(lt(9)).toBe(true);
    expect(lt(10)).toBe(false);
    expect(lt(null)).toBe(false);
    expect(lt(Number.NaN)).toBe(false);
    expect(lt('5')).toBe(false);

    const lte = compileSingleColumnFilter({ condition: { operator: 'lessOrEqual', value: 10 } }, 'number');
    expect(lte(10)).toBe(true);
    expect(lte(10.1)).toBe(false);

    const gt = compileSingleColumnFilter({ condition: { operator: 'greaterThan', value: 10 } }, 'number');
    expect(gt(11)).toBe(true);
    expect(gt(10)).toBe(false);

    const gte = compileSingleColumnFilter({ condition: { operator: 'greaterOrEqual', value: 10 } }, 'number');
    expect(gte(10)).toBe(true);
    expect(gte(9.9)).toBe(false);

    const eq = compileSingleColumnFilter({ condition: { operator: 'equals', value: 0 } }, 'number');
    expect(eq(0)).toBe(true);
    expect(eq(null)).toBe(false);
    expect(eq('')).toBe(false);

    const neq = compileSingleColumnFilter({ condition: { operator: 'notEquals', value: 10 } }, 'number');
    expect(neq(10)).toBe(false);
    expect(neq(5)).toBe(true);
    expect(neq(null)).toBe(true);

    // swapped bounds: 20..10 behaves identically to 10..20 (inclusive)
    const between = compileSingleColumnFilter(
      { condition: { operator: 'between', value: 20, valueTo: 10 } },
      'number',
    );
    expect(between(10)).toBe(true);
    expect(between(15)).toBe(true);
    expect(between(20)).toBe(true);
    expect(between(9.99)).toBe(false);
    expect(between(20.01)).toBe(false);
    expect(between(Number.NaN)).toBe(false);
  });
});

describe('compileSingleColumnFilter – date', () => {
  it('compares Date instances and ISO strings by calendar day when filter value is date-only', () => {
    const d1 = new Date(2026, 4, 10, 14, 30, 0); // local 2026-05-10 14:30
    const d2 = new Date(2026, 4, 11, 0, 0, 0);

    const eq = compileSingleColumnFilter({ condition: { operator: 'equals', value: '2026-05-10' } }, 'date');
    expect(eq(d1)).toBe(true);
    expect(eq('2026-05-10T09:15:00')).toBe(true);
    expect(eq('2026-05-10')).toBe(true);
    expect(eq(d2)).toBe(false);
    expect(eq(null)).toBe(false);

    const gt = compileSingleColumnFilter({ condition: { operator: 'greaterThan', value: '2026-05-10' } }, 'date');
    expect(gt(d1)).toBe(false);
    expect(gt(d2)).toBe(true);

    const between = compileSingleColumnFilter(
      { condition: { operator: 'between', value: '2026-05-20', valueTo: '2026-05-10' } },
      'date',
    );
    expect(between(d1)).toBe(true);
    expect(between(new Date(2026, 4, 20, 23, 59, 0))).toBe(true);
    expect(between('2026-05-09')).toBe(false);
    expect(between('2026-05-21')).toBe(false);
  });
});

describe('compileSingleColumnFilter – boolean & values (set)', () => {
  it('handles boolean equals/notEquals', () => {
    const eq = compileSingleColumnFilter({ condition: { operator: 'equals', value: true } }, 'boolean');
    expect(eq(true)).toBe(true);
    expect(eq(false)).toBe(false);
    expect(eq(null)).toBe(false);
  });

  it('handles values set filter preserving 1 !== "1" and combining with condition via AND', () => {
    const setOnly = compileSingleColumnFilter({ values: [1, 'a', null] }, 'set');
    expect(setOnly(1)).toBe(true);
    expect(setOnly('1')).toBe(false);
    expect(setOnly('a')).toBe(true);
    expect(setOnly(undefined)).toBe(true); // blank matches blank
    expect(setOnly(2)).toBe(false);

    const emptySet = compileSingleColumnFilter({ values: [] }, 'set');
    expect(emptySet('anything')).toBe(false);
    expect(emptySet(null)).toBe(false);

    const combined: ColumnFilterIf = {
      condition: { operator: 'startsWith', value: 'e' },
      values: ['EMEA', 'APAC'],
    };
    const fn = compileSingleColumnFilter(combined, 'text');
    expect(fn('EMEA')).toBe(true);
    expect(fn('APAC')).toBe(false);
    expect(fn('Europe')).toBe(false);
  });
});

describe('compileColumnFilterPredicate', () => {
  it('combines multiple columns with AND in a single closure', () => {
    interface Row { region: string; seats: number; active: boolean }
    const rows: Row[] = [
      { region: 'EMEA', seats: 50, active: true },
      { region: 'EMEA', seats: 20, active: true },
      { region: 'APAC', seats: 80, active: true },
      { region: 'EMEA', seats: 60, active: false },
    ];
    const filters: ColumnFiltersMap = {
      region: { condition: { operator: 'equals', value: 'emea' } },
      seats: { condition: { operator: 'greaterThan', value: 40 } },
      active: { condition: { operator: 'equals', value: true } },
    };
    const pred = compileColumnFilterPredicate<Row>(filters, [
      { property: 'region', type: 'text', getValue: r => r.region },
      { property: 'seats', type: 'number', getValue: r => r.seats },
      { property: 'active', type: 'boolean', getValue: r => r.active },
    ]);
    expect(pred).toBeDefined();
    expect(rows.filter(pred!)).toEqual([{ region: 'EMEA', seats: 50, active: true }]);
  });

  it('returns undefined when no active filters exist', () => {
    const pred = compileColumnFilterPredicate({}, []);
    expect(pred).toBeUndefined();
  });
});

describe('review findings (023)', () => {
  it('between with one bound only is a one-sided comparison, not "everything"', () => {
    const from5 = compileSingleColumnFilter({ condition: { operator: 'between', value: 5 } }, 'number');
    expect([1, 5, 9].map(from5)).toEqual([false, true, true]);
    const upTo5 = compileSingleColumnFilter({ condition: { operator: 'between', value: undefined, valueTo: 5 } }, 'number');
    expect([1, 5, 9].map(upTo5)).toEqual([true, true, false]);
  });

  it('a value list with Date objects survives serializing (state, JSON)', () => {
    const day1 = new Date(2026, 0, 15, 10, 30);
    const day2 = new Date(2026, 1, 20, 8, 0);
    const stored = JSON.parse(JSON.stringify(serializeColumnFilters({ created: { values: [day1] } })));
    const restored = deserializeColumnFilters(stored);
    const fn = compileSingleColumnFilter(restored['created'], 'date');
    expect(fn(new Date(2026, 0, 15, 10, 30))).toBe(true);
    expect(fn(day2)).toBe(false);
    expect(fn(null)).toBe(false);
  });
});
