import { describe, expect, it } from 'vitest';
import { computePastePlan, getPasteSize } from './paste-plan';

const cols = [0, 1, 2, 3, 4];

describe('computePastePlan', () => {

  it('pastes a block once from the anchor', () => {
    const plan = computePastePlan({ matrix: [['a', 'b'], ['c', 'd'], ['e', 'f']], anchorRow: 4, anchorColumn: 3, shownColumns: cols, rowCount: 10 });
    expect(plan.cells.map(c => [c.rowIndex, c.columnIndex, c.value])).toEqual([
      [4, 3, 'a'], [4, 4, 'b'], [5, 3, 'c'], [5, 4, 'd'], [6, 3, 'e'], [6, 4, 'f']]);
    expect(plan.range).toMatchObject({ r1: 4, c1: 3, r2: 6, c2: 4 });
    expect([plan.skipped, plan.clipped, plan.addRows]).toEqual([0, 0, 0]);
  });

  it('P4: one value fills the selected range', () => {
    const plan = computePastePlan({ matrix: [['x']], anchorRow: 1, anchorColumn: 1, shownColumns: cols, rowCount: 20, selection: { rows: 9, columns: 1 } });
    expect(plan.cells).toHaveLength(9);
    expect(plan.range).toMatchObject({ r1: 1, r2: 9, c1: 1, c2: 1 });
  });

  it('P5: tiled when the selection is an integer multiple, otherwise once', () => {
    const tiled = computePastePlan({ matrix: [['a'], ['b']], anchorRow: 0, anchorColumn: 0, shownColumns: cols, rowCount: 20, selection: { rows: 6, columns: 1 } });
    expect(tiled.cells.map(c => c.value)).toEqual(['a', 'b', 'a', 'b', 'a', 'b']);
    const once = computePastePlan({ matrix: [['a'], ['b']], anchorRow: 0, anchorColumn: 0, shownColumns: cols, rowCount: 20, selection: { rows: 5, columns: 1 } });
    expect(once.cells).toHaveLength(2);
  });

  it('P6: cut off at the last column (counted)', () => {
    const plan = computePastePlan({ matrix: [['a', 'b', 'c']], anchorRow: 0, anchorColumn: 3, shownColumns: cols, rowCount: 5 });
    expect(plan.cells.map(c => c.columnIndex)).toEqual([3, 4]);
    expect(plan.clipped).toBe(1);
  });

  it('P7: over the last row – cut off, or rows to add', () => {
    const clipped = computePastePlan({ matrix: [['a'], ['b'], ['c']], anchorRow: 3, anchorColumn: 0, shownColumns: cols, rowCount: 4 });
    expect(clipped.cells).toHaveLength(1);
    expect(clipped.clipped).toBe(2);
    const added = computePastePlan({ matrix: [['a'], ['b'], ['c']], anchorRow: 3, anchorColumn: 0, shownColumns: cols, rowCount: 4, canAddRows: true });
    expect(added.cells.map(c => c.rowIndex)).toEqual([3, 4, 5]);
    expect(added.addRows).toBe(2);
  });

  it('P8: hidden columns are skipped and not counted; read-only cells are left out', () => {
    const plan = computePastePlan({
      matrix: [['a', 'b', 'c']], anchorRow: 0, anchorColumn: 0, shownColumns: [0, 2, 3], rowCount: 3,
      isWritable: (_r, c) => c !== 2,
    });
    expect(plan.cells.map(c => [c.columnIndex, c.value])).toEqual([[0, 'a'], [3, 'c']]);
    expect(plan.skipped).toBe(1);
    expect(plan.range).toMatchObject({ c1: 0, c2: 3 });
  });

  it('nothing to paste: empty matrix, anchor outside, the anchor at the very end', () => {
    expect(computePastePlan({ matrix: [], anchorRow: 0, anchorColumn: 0, shownColumns: cols, rowCount: 3 }).cells).toEqual([]);
    expect(computePastePlan({ matrix: [['a']], anchorRow: 0, anchorColumn: 9, shownColumns: cols, rowCount: 3 }).cells).toEqual([]);
    expect(computePastePlan({ matrix: [['a']], anchorRow: -1, anchorColumn: 0, shownColumns: cols, rowCount: 3 }).cells).toEqual([]);
    const beyond = computePastePlan({ matrix: [['a']], anchorRow: 3, anchorColumn: 0, shownColumns: cols, rowCount: 3 });
    expect(beyond.cells).toEqual([]);
    expect(beyond.clipped).toBe(1);
  });

  it('ragged rows: missing cells are ""', () => {
    const plan = computePastePlan({ matrix: [['a', 'b'], ['c']], anchorRow: 0, anchorColumn: 0, shownColumns: cols, rowCount: 3 });
    expect(plan.cells.map(c => c.value)).toEqual(['a', 'b', 'c', '']);
  });
});

describe('getPasteSize', () => {
  it.each([
    [1, 1, undefined, { rows: 1, columns: 1 }],
    [1, 1, { rows: 1, columns: 1 }, { rows: 1, columns: 1 }],
    [1, 1, { rows: 4, columns: 2 }, { rows: 4, columns: 2 }],
    [2, 2, { rows: 4, columns: 4 }, { rows: 4, columns: 4 }],
    [2, 2, { rows: 4, columns: 3 }, { rows: 2, columns: 2 }],
    [3, 1, { rows: 2, columns: 1 }, { rows: 3, columns: 1 }],
  ])('%i×%i in %j', (r, c, sel, size) => {
    expect(getPasteSize(r, c, sel)).toEqual(size);
  });
});
