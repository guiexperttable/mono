import { describe, expect, it } from 'vitest';
import { CellRange, FocusModel, RowIndexShift, SelectionModel } from '@guiexpert/table';

/** Reference: apply the step to an array of old indices and look up where each old row went. */
function simulate(oldCount: number, removed: number[], inserted: number[]): number[] {
  const kept = Array.from({ length: oldCount }, (_, i) => i).filter(i => !removed.includes(i));
  const after: (number | 'new')[] = [...kept];
  for (const p of inserted) after.splice(p, 0, 'new'); // ascending final positions
  return Array.from({ length: oldCount }, (_, i) => after.indexOf(i));
}

describe('RowIndexShift', () => {
  it('nothing changes: same index, isEmpty', () => {
    const shift = new RowIndexShift();
    expect(shift.isEmpty()).toBe(true);
    expect(shift.mapIndex(7)).toBe(7);
    expect(shift.mapRange(2, 5)).toEqual([[2, 5]]);
    expect(shift.touchesUpTo(1_000)).toBe(false);
  });

  it('appended at the end: indices stay', () => {
    const shift = new RowIndexShift([], [10, 11, 12]);
    expect(shift.mapIndex(9)).toBe(9);
    expect(shift.mapRange(5, 9)).toEqual([[5, 9]]);
    expect(shift.touchesUpTo(9)).toBe(false);
    expect(shift.getInsertedCount()).toBe(3);
  });

  it('removed at the start (ring buffer): indices move up, removed rows give -1', () => {
    const shift = new RowIndexShift([0, 1, 2], [7, 8, 9]);
    expect(shift.mapIndex(0)).toBe(-1);
    expect(shift.mapIndex(2)).toBe(-1);
    expect(shift.mapIndex(3)).toBe(0);
    expect(shift.mapIndex(9)).toBe(6);
    expect(shift.mapRange(1, 4)).toEqual([[0, 1]]);
    expect(shift.mapRange(0, 2)).toEqual([]);
    expect(shift.touchesUpTo(0)).toBe(true);
    expect(shift.getRemovedCount()).toBe(3);
  });

  it('inserted in the middle (sorted): later rows move down, a range is split', () => {
    const shift = new RowIndexShift([], [2, 5]);
    expect(shift.mapIndex(1)).toBe(1);
    expect(shift.mapIndex(2)).toBe(3);
    expect(shift.mapIndex(3)).toBe(4);
    expect(shift.mapIndex(4)).toBe(6);
    expect(shift.mapRange(0, 4)).toEqual([[0, 1], [3, 4], [6, 6]]);
    expect(shift.mapRange(4, 0)).toEqual([[0, 1], [3, 4], [6, 6]]); // reversed bounds
    expect(shift.touchesUpTo(1)).toBe(false);
    expect(shift.touchesUpTo(2)).toBe(true);
  });

  it('several rows inserted at the same place split once', () => {
    const shift = new RowIndexShift([], [2, 3, 4]);
    expect(shift.mapRange(0, 3)).toEqual([[0, 1], [5, 6]]);
  });

  it('inserted in front of a range moves it as a whole', () => {
    const shift = new RowIndexShift([], [0, 1]);
    expect(shift.mapRange(3, 5)).toEqual([[5, 7]]);
  });

  it('whole columns (r2 = MAX_SAFE_INTEGER) stay open', () => {
    const shift = new RowIndexShift([0], [3]);
    expect(shift.mapRange(0, Number.MAX_SAFE_INTEGER)).toEqual([[0, 2], [4, Number.MAX_SAFE_INTEGER]]);
  });

  it('mapIndexOrNext: a removed row maps to the next remaining one', () => {
    const shift = new RowIndexShift([2, 3], []);
    expect(shift.mapIndexOrNext(2)).toBe(2); // old row 4
    expect(shift.mapIndexOrNext(4)).toBe(2);
    expect(shift.mapIndexOrNext(1)).toBe(1);
    expect(shift.mapIndexOrNext(-5)).toBe(0);
  });

  it('matches a reference simulation for random steps', () => {
    let seed = 7;
    const rnd = (n: number) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };
    for (let round = 0; round < 200; round++) {
      const oldCount = 1 + rnd(30);
      const removed = [...new Set(Array.from({ length: rnd(5) }, () => rnd(oldCount)))].sort((a, b) => a - b);
      const finalCount = oldCount - removed.length + rnd(6);
      const insertCount = finalCount - (oldCount - removed.length);
      const inserted = [...new Set(Array.from({ length: insertCount * 2 }, () => rnd(finalCount)))]
        .sort((a, b) => a - b).slice(0, insertCount);
      if (inserted.length !== insertCount) continue;
      const shift = new RowIndexShift(removed, inserted);
      const expected = simulate(oldCount, removed, inserted);
      for (let i = 0; i < oldCount; i++) {
        expect(shift.mapIndex(i), `round ${round} index ${i}`).toBe(expected[i]);
      }
      // a range = the mapped indices of its remaining rows, grouped into consecutive runs
      const lo = rnd(oldCount);
      const hi = lo + rnd(oldCount - lo);
      const mapped = expected.slice(lo, hi + 1).filter(i => i >= 0);
      const runs: [number, number][] = [];
      for (const i of mapped) {
        const last = runs[runs.length - 1];
        if (last && last[1] + 1 === i) last[1] = i; else runs.push([i, i]);
      }
      expect(shift.mapRange(lo, hi), `round ${round} range ${lo}-${hi}`).toEqual(runs);
    }
  });
});


describe('SelectionModel / FocusModel.adjustForRowChanges', () => {
  it('a selected range moves with its rows (no event), a removed row leaves it', () => {
    const sm = new SelectionModel('range', 'multi');
    sm.addSelection(new CellRange(5, 1, 7, 2));
    let events = 0;
    sm.addEventSelectionChangedListener({ onSelectionChanged: () => events++ });
    expect(sm.adjustForRowChanges(new RowIndexShift([0, 1], [20]))).toBe(false);
    expect(sm.getRanges().map(r => [r.r1, r.r2])).toEqual([[3, 5]]);
    expect(events).toBe(0);
    expect(sm.adjustForRowChanges(new RowIndexShift([3], []))).toBe(true);
    expect(sm.getRanges().map(r => [r.r1, r.r2])).toEqual([[3, 4]]);
  });

  it('the same range object is kept (snapshots/anchor point at it); inserted rows split it', () => {
    const sm = new SelectionModel('range', 'multi');
    const range = new CellRange(2, 0, 4, 0);
    sm.addSelection(range);
    sm.adjustForRowChanges(new RowIndexShift([], [3]));
    expect(sm.getRanges()[0]).toBe(range);
    expect(sm.getRanges().map(r => [r.r1, r.r2])).toEqual([[2, 2], [4, 5]]);
    expect(sm.isSelected(3, 0)).toBe(false);
  });

  it('whole columns and "all selected" stay; negative ranges move, too', () => {
    const sm = new SelectionModel('column', 'multi');
    sm.addSelection(new CellRange(0, 2, 0, 2));
    sm.adjustForRowChanges(new RowIndexShift([0, 1, 2], [10]));
    expect(sm.getRanges().map(r => [r.r1, r.r2])).toEqual([[0, Number.MAX_SAFE_INTEGER]]);
    const all = new SelectionModel('range', 'multi');
    all.selectAll();
    all.togglePoint(6, 1); // a negative range
    all.adjustForRowChanges(new RowIndexShift([0, 1], []));
    expect(all.isAllSelected()).toBe(true);
    expect(all.isSelected(4, 1)).toBe(false);
    expect(all.isSelected(6, 1)).toBe(true);
  });

  it('a reversed range (dragged upwards) keeps its direction', () => {
    const sm = new SelectionModel('range', 'multi');
    sm.addSelection(new CellRange(8, 0, 6, 0));
    sm.adjustForRowChanges(new RowIndexShift([0], []));
    expect(sm.getRanges().map(r => [r.r1, r.r2])).toEqual([[7, 5]]);
  });

  it('a range whose rows were all removed disappears', () => {
    const sm = new SelectionModel('row', 'multi');
    sm.addSelection(CellRange.singleRow(1));
    expect(sm.adjustForRowChanges(new RowIndexShift([0, 1], []))).toBe(true);
    expect(sm.getRanges()).toEqual([]);
  });

  it('FocusModel: the same row without an event, a removed row → the next row with an event', () => {
    const fm = new FocusModel('cell');
    fm.setFocus(5, 1);
    let events = 0;
    fm.addEventFocusChangedListener({ onFocusChanged: () => events++ });
    fm.adjustForRowChanges(new RowIndexShift([0, 1], [9]));
    expect(fm.getFocus()).toEqual([3, 1]);
    expect(events).toBe(0);
    fm.adjustForRowChanges(new RowIndexShift([3], []));
    expect(fm.getFocus()).toEqual([3, 1]);
    expect(events).toBe(1);
    const none = new FocusModel('cell');
    none.adjustForRowChanges(new RowIndexShift([0], []));
    expect(none.getFocus()).toEqual([-1, -1]);
  });

  it('review #5: a range open to the end (r > 0 … MAX) keeps one piece; rows appended at the end join it', () => {
    const sm = new SelectionModel('range', 'multi');
    sm.addSelection(new CellRange(3, 1, Number.MAX_SAFE_INTEGER, 1));
    for (let u = 0; u < 5; u++) sm.adjustForRowChanges(new RowIndexShift([0], [20 + u]));
    expect(sm.getRanges().length).toBe(1);
    expect(sm.getRanges()[0].r2).toBe(Number.MAX_SAFE_INTEGER);
    expect(sm.getRanges()[0].r1).toBe(0); // rows 0 … 2 removed one per update: the range starts at row 0
  });
});
