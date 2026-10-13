import { describe, expect, it } from 'vitest';
// SorterService is not exported from src/index.ts (internal helper of the area models) → relative import.
import { SorterService } from './sorter.service';

describe('SorterService.genericSortComparator', () => {
  const s = new SorterService();
  const cmp = (a: unknown, b: unknown, f = 1) => s.genericSortComparator(a, b, f);

  it('compares numbers numerically, f = 1 ascending and f = -1 descending', () => {
    expect(cmp(2, 10)).toBeLessThan(0);
    expect(cmp(10, 2)).toBeGreaterThan(0);
    expect(cmp(2, 10, -1)).toBeGreaterThan(0);
    expect(cmp(5, 5)).toBe(0);
  });

  it('sorts a number array ascending / descending', () => {
    expect([10, 2, 33, 1].sort((a, b) => cmp(a, b))).toEqual([1, 2, 10, 33]);
    expect([10, 2, 33, 1].sort((a, b) => cmp(a, b, -1))).toEqual([33, 10, 2, 1]);
  });

  it('compares strings with localeCompare', () => {
    expect(cmp('apple', 'banana')).toBeLessThan(0);
    expect(cmp('banana', 'apple')).toBeGreaterThan(0);
    expect(['b', 'a', 'c'].sort((a, b) => cmp(a, b))).toEqual(['a', 'b', 'c']);
  });

  it('sorts true before false in ascending order', () => {
    expect([false, true, false].sort((a, b) => cmp(a, b))).toEqual([true, false, false]);
    expect([true, false].sort((a, b) => cmp(a, b, -1))).toEqual([false, true]);
  });

  it('compares dates by time', () => {
    const d1 = new Date(2020, 0, 1);
    const d2 = new Date(2021, 0, 1);
    expect(cmp(d1, d2)).toBeLessThan(0);
    expect(cmp(d2, d1)).toBeGreaterThan(0);
  });

  it('compares non-empty arrays by their first element', () => {
    expect(cmp([2, 'x'], [10, 'a'])).toBeLessThan(0);
    expect(cmp(['b'], ['a'])).toBeGreaterThan(0);
  });

  it('compares mixed types as text', () => {
    // "10" < "9" as text
    expect(cmp(10, '9')).toBeLessThan(0);
  });

  it('compares null and undefined as the texts "null" / "undefined"', () => {
    // NOTE: null sorts like the word "null" (between "m" and "o"), not at the start or end.
    expect(cmp(null, 'a')).toBeGreaterThan(0);
    expect(cmp(null, 'z')).toBeLessThan(0);
    expect(cmp(undefined, 'a')).toBeGreaterThan(0);
  });

  it('returns NaN for NaN numbers', () => {
    // NOTE: a NaN comparator result makes Array.sort treat the pair as equal – order becomes unpredictable.
    expect(cmp(NaN, 1)).toBeNaN();
  });
});
