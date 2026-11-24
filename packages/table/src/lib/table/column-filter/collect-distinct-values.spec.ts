import { describe, expect, it } from 'vitest';
import { collectDistinctValues } from '@guiexpert/table';

describe('collectDistinctValues', () => {
  it('collects unique values with counts, keeps 1 !== "1", puts blanks last and sorts naturally', () => {
    const rows = [10, 2, '10', '2', 2, null, undefined, '', 1];
    const res = collectDistinctValues(rows, x => x, { blanksLabel: '(Blanks)' });

    expect(res.truncated).toBe(false);
    // numbers sorted numerically, strings sorted lexically, blank at the end
    expect(res.items.map(i => i.value)).toEqual([1, 2, 10, '10', '2', null]);
    expect(res.items.find(i => i.value === 2)?.count).toBe(2);
    expect(res.items.find(i => i.value === '2')?.count).toBe(1);
    expect(res.items[res.items.length - 1]).toEqual({ value: null, label: '(Blanks)', count: 3 });
  });

  it('caps at maxValues and sets truncated = true', () => {
    const rows = Array.from({ length: 100 }, (_, i) => `item-${i}`);
    const res = collectDistinctValues(rows, x => x, { maxValues: 10 });
    expect(res.items.length).toBe(10);
    expect(res.truncated).toBe(true);
  });

  it('filters by search substring even when full dataset would exceed maxValues', () => {
    const rows = Array.from({ length: 100 }, (_, i) => `item-${i}`);
    const res = collectDistinctValues(rows, x => x, { maxValues: 10, search: 'item-95' });
    expect(res.items.map(i => i.value)).toEqual(['item-95']);
    expect(res.truncated).toBe(false);
  });

  it('sorts dates chronologically', () => {
    const d1 = new Date(2026, 0, 5);
    const d2 = new Date(2026, 5, 1);
    const d3 = new Date(2025, 11, 31);
    const res = collectDistinctValues([d2, d1, d3], x => x);
    expect(res.items.map(i => i.value)).toEqual([d3, d1, d2]);
  });
});
