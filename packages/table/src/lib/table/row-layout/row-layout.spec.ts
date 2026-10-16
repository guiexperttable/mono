import { describe, expect, it } from 'vitest';
import { RowLayout } from '@guiexpert/table';

/** reference: tops by plain summation */
function naiveTops(heights: number[], extras: Map<number, number>): number[] {
  const tops: number[] = [];
  let y = 0;
  for (let i = 0; i < heights.length; i++) {
    tops.push(y);
    y += heights[i] + (extras.get(i) ?? 0);
  }
  tops.push(y);
  return tops;
}

function naiveIndexAt(tops: number[], rowCount: number, y: number): number {
  if (rowCount < 1) return -1;
  if (y <= 0) return 0;
  for (let i = 0; i < rowCount; i++) {
    if (y < tops[i + 1]) return i;
  }
  return rowCount - 1;
}

describe('RowLayout', () => {

  it('is empty before setRows()', () => {
    const layout = new RowLayout();
    expect(layout.getRowCount()).toBe(0);
    expect(layout.getTotalHeight()).toBe(0);
    expect(layout.findIndexAt(100)).toBe(-1);
    expect(layout.getTop(0)).toBe(0);
  });

  it('constant heights: O(1) positions, no array', () => {
    const layout = new RowLayout();
    let calls = 0;
    layout.setRows(2_000_000, () => { calls++; return 34; }, 34);
    expect(layout.getTop(0)).toBe(0);
    expect(layout.getTop(10)).toBe(340);
    expect(layout.getTop(2_000_000)).toBe(68_000_000);
    expect(layout.getTotalHeight()).toBe(68_000_000);
    expect(layout.findIndexAt(0)).toBe(0);
    expect(layout.findIndexAt(33.9)).toBe(0);
    expect(layout.findIndexAt(34)).toBe(1);
    expect(layout.findIndexAt(68_000_000 + 5)).toBe(1_999_999);
    expect(layout.findIndexAt(-10)).toBe(0);
    expect(layout.getRowHeight(5)).toBe(34);
    expect(calls).toBe(0);
    expect(layout.hasPrefixSums()).toBe(false);
  });

  it('variable heights: prefix sums are built lazily, once', () => {
    const heights = [10, 20, 30, 40, 50];
    const layout = new RowLayout();
    let calls = 0;
    layout.setRows(heights.length, i => { calls++; return heights[i]; });
    expect(calls).toBe(0);
    expect(layout.getTop(3)).toBe(60);
    expect(layout.getTop(5)).toBe(150);
    expect(layout.getTotalHeight()).toBe(150);
    expect(layout.getRowHeight(4)).toBe(50);
    expect(calls).toBe(5);
    layout.getTop(2);
    expect(calls).toBe(5);
    expect(layout.hasPrefixSums()).toBe(true);
  });

  it('findIndexAt: the row whose slot contains y', () => {
    const layout = new RowLayout();
    layout.setRows(4, i => [10, 20, 30, 40][i]);
    expect(layout.findIndexAt(0)).toBe(0);
    expect(layout.findIndexAt(9.99)).toBe(0);
    expect(layout.findIndexAt(10)).toBe(1);
    expect(layout.findIndexAt(29)).toBe(1);
    expect(layout.findIndexAt(30)).toBe(2);
    expect(layout.findIndexAt(99)).toBe(3);
    expect(layout.findIndexAt(1000)).toBe(3);
  });

  it('rows of height 0 (hidden) are skipped by findIndexAt', () => {
    const layout = new RowLayout();
    layout.setRows(4, i => [10, 0, 0, 10][i]);
    expect(layout.findIndexAt(10)).toBe(3);
    expect(layout.getTop(3)).toBe(10);
  });

  it('extras (details) shift the rows below them', () => {
    const layout = new RowLayout();
    layout.setRows(10, () => 20, 20);
    layout.setExtras([2, 5], [100, 50]);
    expect(layout.getExtraCount()).toBe(2);
    expect(layout.getTop(2)).toBe(40);
    expect(layout.getExtraHeight(2)).toBe(100);
    expect(layout.getExtraHeight(3)).toBe(0);
    expect(layout.getTop(3)).toBe(160);
    expect(layout.getTop(6)).toBe(120 + 150);
    expect(layout.getTotalHeight()).toBe(200 + 150);
    expect(layout.getExtraTotal()).toBe(150);
    // inside the detail of row 2 → row 2
    expect(layout.findIndexAt(60)).toBe(2);
    expect(layout.findIndexAt(159)).toBe(2);
    expect(layout.findIndexAt(160)).toBe(3);
    expect(layout.getExtraBefore(3)).toBe(100);
    expect(layout.getExtraBefore(2)).toBe(0);
    expect(layout.getExtraBefore(10)).toBe(150);
  });

  it('extras: unsorted input, duplicates add up, out of range and ≤ 0 are ignored', () => {
    const layout = new RowLayout();
    layout.setRows(5, () => 10, 10);
    layout.setExtras([4, 1, 1, 9, -1, 3], [5, 7, 3, 100, 100, 0]);
    expect(layout.getExtraHeight(1)).toBe(10);
    expect(layout.getExtraHeight(4)).toBe(5);
    expect(layout.getExtraHeight(3)).toBe(0);
    expect(layout.getExtraCount()).toBe(2);
    expect(layout.getTotalHeight()).toBe(65);
  });

  it('matches a naive summation (random heights and extras)', () => {
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let round = 0; round < 20; round++) {
      const n = 1 + Math.floor(rnd() * 300);
      const heights = Array.from({ length: n }, () => Math.floor(rnd() * 4) * 12);
      const extras = new Map<number, number>();
      for (let k = 0; k < 15; k++) {
        if (rnd() < 0.5) extras.set(Math.floor(rnd() * n), 1 + Math.floor(rnd() * 200));
      }
      const layout = new RowLayout();
      const constant = heights.every(h => h === heights[0]) ? heights[0] : undefined;
      layout.setRows(n, i => heights[i], constant);
      layout.setExtras([...extras.keys()], [...extras.values()]);
      const tops = naiveTops(heights, extras);
      for (let i = 0; i <= n; i++) {
        expect(layout.getTop(i)).toBe(tops[i]);
      }
      const total = tops[n];
      for (let k = 0; k < 50; k++) {
        const y = rnd() * (total + 20) - 10;
        expect(layout.findIndexAt(y)).toBe(naiveIndexAt(tops, n, y));
      }
    }
  });

  it('setExtraHeight changes one detail height (O(k))', () => {
    const layout = new RowLayout();
    layout.setRows(10, () => 20, 20);
    layout.setExtras([2, 5], [100, 50]);
    expect(layout.setExtraHeight(5, 80)).toBe(true);
    expect(layout.getTotalHeight()).toBe(200 + 180);
    expect(layout.setExtraHeight(5, 80)).toBe(false);
    expect(layout.setExtraHeight(3, 80)).toBe(false); // no detail behind row 3
  });

  it('setRows() keeps no stale prefix sums', () => {
    const layout = new RowLayout();
    const heights = [10, 20, 30];
    layout.setRows(3, i => heights[i]);
    expect(layout.getTotalHeight()).toBe(60);
    heights[0] = 100;
    layout.setRows(3, i => heights[i]);
    expect(layout.getTotalHeight()).toBe(150);
    layout.setRows(2, () => 5, 5);
    expect(layout.hasPrefixSums()).toBe(false);
    expect(layout.getTotalHeight()).toBe(10);
  });

  it('extras beyond the row count are dropped when the rows shrink', () => {
    const layout = new RowLayout();
    layout.setRows(10, () => 20, 20);
    layout.setExtras([8], [100]);
    layout.setRows(5, () => 20, 20);
    expect(layout.getExtraCount()).toBe(0);
    expect(layout.getTotalHeight()).toBe(100);
  });

  it('getTop() clamps the index', () => {
    const layout = new RowLayout();
    layout.setRows(3, () => 10, 10);
    expect(layout.getTop(-5)).toBe(0);
    expect(layout.getTop(99)).toBe(30);
  });
});

describe('RowLayout.setExtra', () => {
  it('adds, changes and removes one extra (the others stay)', () => {
    const layout = new RowLayout();
    layout.setRows(10, () => 20, 20);
    layout.setExtras([5], [50]);
    expect(layout.setExtra(2, 100)).toBe(true);
    expect(layout.getExtraCount()).toBe(2);
    expect(layout.getTop(6)).toBe(120 + 150);
    expect(layout.setExtra(2, 30)).toBe(true);
    expect(layout.getTop(6)).toBe(120 + 80);
    expect(layout.setExtra(2, 0)).toBe(true);
    expect(layout.getExtraCount()).toBe(1);
    expect(layout.getTop(6)).toBe(170);
    expect(layout.setExtra(3, 0)).toBe(false);
    expect(layout.setExtra(99, 10)).toBe(false);
    expect(layout.setExtra(9, 10)).toBe(true);
    expect(layout.getTotalHeight()).toBe(200 + 60);
  });
});
