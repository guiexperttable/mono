import { describe, it, expect, vi } from 'vitest';
import { runInNewContext } from 'node:vm';
import { CellRange, SelectionModel } from '@guiexpert/table';
import type { EventSelectionChangedListenerIf, ExtendedSelectionType, SelectionMode } from '@guiexpert/table';

const MAX = Number.MAX_SAFE_INTEGER;

/**
 * Runs a synchronous function with a hard time limit: node:vm terminates even an endless loop inside `fn`
 * (a vitest timeout can't interrupt synchronous code and the worker would hang).
 */
function runWithin<T>(ms: number, fn: () => T): T {
  return runInNewContext('fn()', { fn }, { timeout: ms }) as T;
}

function listenerSpy() {
  const onSelectionChanged = vi.fn();
  const listener: EventSelectionChangedListenerIf = { onSelectionChanged };
  return { listener, onSelectionChanged };
}

/** Exposes the protected `silent` flag. */
class SilentSelectionModel extends SelectionModel {
  setSilent(silent: boolean) {
    this.silent = silent;
  }
}

describe('SelectionModel', () => {

  describe('constructor / defaults', () => {
    it('defaults to selectionType "none" and selectionMode "single"', () => {
      const sm = new SelectionModel();
      expect(sm.selectionType).toBe('none');
      expect(sm.selectionMode).toBe('single');
    });

    it('stores the given type and mode', () => {
      const sm = new SelectionModel('range', 'multi');
      expect(sm.selectionType).toBe('range');
      expect(sm.selectionMode).toBe('multi');
    });

    it('starts without any selection', () => {
      const sm = new SelectionModel('cell');
      expect(sm.getRanges()).toEqual([]);
      expect(sm.hasSelection()).toBe(false);
      expect(sm.hasNoSelection()).toBe(true);
      expect(sm.isAllSelected()).toBe(false);
      expect(sm.isSelected(0, 0)).toBe(false);
      expect(sm.getSelectionCount(0, 0)).toBe(0);
      expect(sm.getMergedRowIndices()).toEqual([]);
    });
  });

  describe('selectionType "none"', () => {
    const modes: SelectionMode[] = ['single', 'multi'];

    it.each(modes)('ignores addSelection() (mode %s)', (mode) => {
      const sm = new SelectionModel('none', mode);
      sm.addSelection(new CellRange(0, 0, 2, 2));
      expect(sm.getRanges()).toEqual([]);
      expect(sm.isSelected(1, 1)).toBe(false);
      expect(sm.hasSelection()).toBe(false);
    });

    it.each(modes)('ignores firstClick() (mode %s)', (mode) => {
      const sm = new SelectionModel('none', mode);
      sm.firstClick(1, 1);
      expect(sm.getRanges()).toEqual([]);
    });

    it('ignores togglePoint()', () => {
      const sm = new SelectionModel('none');
      sm.togglePoint(1, 1);
      expect(sm.isSelected(1, 1)).toBe(false);
    });

    it('ignores removeSelection() (no negative range is recorded)', () => {
      const sm = new SelectionModel('none');
      sm.selectAll();
      sm.removeSelection(CellRange.singleCell(1, 1));
      expect(sm.isInNegativeRange(1, 1)).toBe(false);
      expect(sm.isSelected(1, 1)).toBe(true);
    });

    it('still allows selectAll()', () => {
      // NOTE: selectAll() ignores the selection type – even a table with selectionType "none" becomes "all selected".
      const sm = new SelectionModel('none');
      sm.selectAll();
      expect(sm.isAllSelected()).toBe(true);
      expect(sm.isSelected(5, 5)).toBe(true);
      expect(sm.hasSelection()).toBe(true);
    });
  });

  describe('selectionType "cell"', () => {

    it('collapses an added range to its first cell (r1/c1)', () => {
      const sm = new SelectionModel('cell', 'multi');
      sm.addSelection(new CellRange(1, 2, 5, 7));
      expect(sm.getRanges()).toEqual([new CellRange(1, 2, 1, 2)]);
      expect(sm.isSelected(1, 2)).toBe(true);
      expect(sm.isSelected(1, 3)).toBe(false);
      expect(sm.isSelected(2, 2)).toBe(false);
    });

    it('mutates the CellRange object passed to addSelection()', () => {
      const range = new CellRange(1, 2, 5, 7);
      new SelectionModel('cell').addSelection(range);
      // NOTE: the caller's range object is modified in place (r2/c2 overwritten) and stored by reference.
      expect(range).toEqual(new CellRange(1, 2, 1, 2));
    });

    it('single mode: a new selection replaces the previous one', () => {
      const sm = new SelectionModel('cell', 'single');
      sm.addSelection(CellRange.singleCell(0, 0));
      sm.addSelection(CellRange.singleCell(3, 3));
      expect(sm.getRanges()).toHaveLength(1);
      expect(sm.isSelected(0, 0)).toBe(false);
      expect(sm.isSelected(3, 3)).toBe(true);
    });

    it('multi mode: selections accumulate', () => {
      const sm = new SelectionModel('cell', 'multi');
      sm.addSelection(CellRange.singleCell(0, 0));
      sm.addSelection(CellRange.singleCell(3, 3));
      expect(sm.getRanges()).toHaveLength(2);
      expect(sm.isSelected(0, 0)).toBe(true);
      expect(sm.isSelected(3, 3)).toBe(true);
    });

    it('firstClick() selects nothing', () => {
      // NOTE: only "row" and "column" react to firstClick(); a plain click never selects a cell for "cell"/"range".
      const sm = new SelectionModel('cell');
      sm.firstClick(2, 3);
      expect(sm.getRanges()).toEqual([]);
      expect(sm.isSelected(2, 3)).toBe(false);
    });

    it('removeSelection() deselects one cell', () => {
      const sm = new SelectionModel('cell', 'multi');
      sm.addSelection(CellRange.singleCell(1, 1));
      sm.addSelection(CellRange.singleCell(1, 2));
      sm.removeSelection(CellRange.singleCell(1, 1));
      expect(sm.isSelected(1, 1)).toBe(false);
      expect(sm.isSelected(1, 2)).toBe(true);
    });

    it('removeSelection() keeps the full removed range (not collapsed to one cell like addSelection)', () => {
      const sm = new SelectionModel('cell', 'multi');
      sm.addSelection(CellRange.singleCell(1, 1));
      sm.addSelection(CellRange.singleCell(2, 2));
      sm.removeSelection(new CellRange(0, 0, 9, 9));
      // NOTE: addSelection() collapses ranges to one cell for type "cell", removeSelection() does not.
      expect(sm.isSelected(1, 1)).toBe(false);
      expect(sm.isSelected(2, 2)).toBe(false);
      expect(sm.isInNegativeRange(9, 9)).toBe(true);
    });

    it('togglePoint() selects an unselected cell', () => {
      const sm = new SelectionModel('cell', 'multi');
      sm.togglePoint(2, 3);
      expect(sm.isSelected(2, 3)).toBe(true);
      expect(sm.getRanges()).toEqual([CellRange.singleCell(2, 3)]);
    });

    it('togglePoint() deselects a selected cell', () => {
      const sm = new SelectionModel('cell', 'multi');
      sm.togglePoint(2, 3);
      sm.togglePoint(2, 3);
      expect(sm.isSelected(2, 3)).toBe(false);
      expect(sm.isInNegativeRange(2, 3)).toBe(true);
    });

    // Regression: negative ranges were only removed by clear(), so a cell that was toggled off stayed off forever.
    it('togglePoint() selects a cell again after it was toggled off', () => {
      const sm = new SelectionModel('cell', 'multi');
      sm.togglePoint(2, 3);
      sm.togglePoint(2, 3);
      sm.togglePoint(2, 3);
      expect(sm.isSelected(2, 3)).toBe(true);
      expect(sm.isInNegativeRange(2, 3)).toBe(false);
    });

    it('togglePoint() on/off/on keeps a single range (no stacked overlay)', () => {
      const sm = new SelectionModel('cell', 'multi');
      sm.togglePoint(2, 3);
      sm.togglePoint(2, 3);
      sm.togglePoint(2, 3);
      expect(sm.getSelectionCount(2, 3)).toBe(1);
      expect(sm.getRanges()).toEqual([CellRange.singleCell(2, 3)]);
    });

    // Regression: same root cause – addSelection() did not lift an earlier removeSelection() of that cell.
    it('addSelection() selects a cell again after removeSelection() of the same cell', () => {
      const sm = new SelectionModel('cell', 'single');
      sm.addSelection(CellRange.singleCell(1, 1));
      sm.removeSelection(CellRange.singleCell(1, 1));
      sm.addSelection(CellRange.singleCell(1, 1));
      expect(sm.isSelected(1, 1)).toBe(true);
    });

    it('addSelection() in multi mode selects a removed cell again, too', () => {
      const sm = new SelectionModel('cell', 'multi');
      sm.addSelection(CellRange.singleCell(1, 1));
      sm.addSelection(CellRange.singleCell(1, 2));
      sm.removeSelection(CellRange.singleCell(1, 1));
      sm.addSelection(CellRange.singleCell(1, 1));
      expect(sm.isSelected(1, 1)).toBe(true);
      expect(sm.isSelected(1, 2)).toBe(true);
      expect(sm.isInNegativeRange(1, 1)).toBe(false);
    });
  });

  describe('selectionType "row"', () => {

    it('firstClick() selects the whole row of the clicked cell', () => {
      const sm = new SelectionModel('row');
      sm.firstClick(3, 5);
      expect(sm.getRanges()).toEqual([new CellRange(3, 0, 3, MAX)]);
      expect(sm.isSelected(3, 0)).toBe(true);
      expect(sm.isSelected(3, 999)).toBe(true);
      expect(sm.isSelected(2, 5)).toBe(false);
      expect(sm.isSelected(4, 5)).toBe(false);
    });

    it('addSelection() widens the range to all columns but keeps the rows', () => {
      const sm = new SelectionModel('row', 'multi');
      sm.addSelection(new CellRange(2, 4, 3, 6));
      expect(sm.getRanges()).toEqual([new CellRange(2, 0, 3, MAX)]);
      expect(sm.isSelected(2, 0)).toBe(true);
      expect(sm.isSelected(3, 100)).toBe(true);
      expect(sm.isSelected(4, 4)).toBe(false);
    });

    it('single mode: the next firstClick() replaces the row', () => {
      const sm = new SelectionModel('row', 'single');
      sm.firstClick(1, 0);
      sm.firstClick(4, 0);
      expect(sm.isSelected(1, 0)).toBe(false);
      expect(sm.isSelected(4, 0)).toBe(true);
    });

    it('multi mode: firstClick() adds rows', () => {
      const sm = new SelectionModel('row', 'multi');
      sm.firstClick(1, 0);
      sm.firstClick(4, 0);
      expect(sm.isSelected(1, 0)).toBe(true);
      expect(sm.isSelected(4, 0)).toBe(true);
      expect(sm.getMergedRowIndices()).toEqual([1, 4]);
    });

    it('removeSelection() of a single cell removes the whole row', () => {
      const sm = new SelectionModel('row', 'multi');
      sm.firstClick(3, 0);
      sm.removeSelection(CellRange.singleCell(3, 5));
      expect(sm.isSelected(3, 0)).toBe(false);
      expect(sm.isSelected(3, 5)).toBe(false);
      expect(sm.isSelected(3, 1000)).toBe(false);
    });

    // Regression: for type "row" removeSelection() reduced the range to CellRange.singleRow(range.r1) – rows 3 and 4
    // stayed selected.
    it('removeSelection() of a multi-row range removes all of its rows', () => {
      const sm = new SelectionModel('row', 'multi');
      sm.addSelection(new CellRange(2, 0, 4, 0));
      sm.removeSelection(new CellRange(2, 0, 4, 0));
      expect(sm.isSelected(2, 0)).toBe(false);
      expect(sm.isSelected(3, 0)).toBe(false);
      expect(sm.isSelected(4, 0)).toBe(false);
      expect(sm.isInNegativeRange(4, 1000)).toBe(true);
    });

    it('addSelection() of one row inside a removed multi-row range selects only that row again', () => {
      // the removed range (rows 1–4, all columns) is split above/below the re-added row
      const sm = new SelectionModel('row', 'multi');
      sm.addSelection(new CellRange(0, 0, 5, 0));
      sm.removeSelection(new CellRange(1, 0, 4, 0));
      sm.addSelection(CellRange.singleRow(2));
      expect([0, 1, 2, 3, 4, 5].map(r => sm.isSelected(r, 7))).toEqual([true, false, true, false, false, true]);
      expect(sm.getMergedRowIndices()).toEqual([0, 2, 5]);
    });

    it('firstClick() selects a removed row again', () => {
      const sm = new SelectionModel('row', 'multi');
      sm.firstClick(3, 0);
      sm.removeSelection(CellRange.singleCell(3, 2));
      sm.firstClick(3, 1);
      expect(sm.isSelected(3, 99)).toBe(true);
    });

    it('togglePoint() selects and deselects the whole row', () => {
      const sm = new SelectionModel('row', 'multi');
      sm.togglePoint(3, 1);
      expect(sm.isSelected(3, 7)).toBe(true);
      sm.togglePoint(3, 1);
      expect(sm.isSelected(3, 7)).toBe(false);
    });

    it('getMergedRowIndices() lists the selected rows without duplicates', () => {
      const sm = new SelectionModel('row', 'multi');
      sm.addSelection(new CellRange(1, 0, 3, 0));
      sm.addSelection(new CellRange(2, 0, 4, 0));
      expect(sm.getMergedRowIndices()).toEqual([1, 2, 3, 4]);
    });

    it('getMergedRowIndices() leaves out removed rows', () => {
      const sm = new SelectionModel('row', 'multi');
      sm.addSelection(new CellRange(1, 0, 4, 0));
      sm.removeSelection(CellRange.singleRow(2));
      expect(sm.getMergedRowIndices()).toEqual([1, 3, 4]);
    });
  });

  describe('selectionType "column"', () => {

    it('firstClick() selects the whole column of the clicked cell', () => {
      const sm = new SelectionModel('column');
      sm.firstClick(3, 5);
      expect(sm.getRanges()).toEqual([new CellRange(0, 5, MAX, 5)]);
      expect(sm.isSelected(0, 5)).toBe(true);
      expect(sm.isSelected(1_000_000, 5)).toBe(true);
      expect(sm.isSelected(3, 4)).toBe(false);
      expect(sm.isSelected(3, 6)).toBe(false);
    });

    it('addSelection() widens the range to all rows but keeps the columns', () => {
      const sm = new SelectionModel('column', 'multi');
      sm.addSelection(new CellRange(2, 1, 8, 2));
      expect(sm.getRanges()).toEqual([new CellRange(0, 1, MAX, 2)]);
      expect(sm.isSelected(0, 1)).toBe(true);
      expect(sm.isSelected(500, 2)).toBe(true);
      expect(sm.isSelected(0, 3)).toBe(false);
    });

    it('single mode: the next firstClick() replaces the column', () => {
      const sm = new SelectionModel('column', 'single');
      sm.firstClick(0, 1);
      sm.firstClick(0, 2);
      expect(sm.isSelected(0, 1)).toBe(false);
      expect(sm.isSelected(0, 2)).toBe(true);
    });

    it('multi mode: firstClick() adds columns', () => {
      const sm = new SelectionModel('column', 'multi');
      sm.firstClick(0, 1);
      sm.firstClick(0, 2);
      expect(sm.isSelected(9, 1)).toBe(true);
      expect(sm.isSelected(9, 2)).toBe(true);
    });

    it('removeSelection() of a single cell removes the whole column', () => {
      const sm = new SelectionModel('column', 'multi');
      sm.firstClick(0, 5);
      sm.firstClick(0, 6);
      sm.removeSelection(CellRange.singleCell(7, 5));
      expect(sm.isSelected(0, 5)).toBe(false);
      expect(sm.isSelected(1000, 5)).toBe(false);
      expect(sm.isSelected(0, 6)).toBe(true);
    });

    // Regression: like type "row", removeSelection() reduced the range to its first column (c1).
    it('removeSelection() of a multi-column range removes all of its columns', () => {
      const sm = new SelectionModel('column', 'multi');
      sm.addSelection(new CellRange(0, 1, 0, 4));
      sm.removeSelection(new CellRange(5, 2, 5, 3));
      expect([1, 2, 3, 4].map(c => sm.isSelected(77, c))).toEqual([true, false, false, true]);
    });

    it('firstClick() selects a removed column again', () => {
      const sm = new SelectionModel('column', 'multi');
      sm.firstClick(0, 5);
      sm.removeSelection(CellRange.singleCell(7, 5));
      sm.firstClick(2, 5);
      expect(sm.isSelected(1_000_000, 5)).toBe(true);
    });

    // Regression: getMergedRowIndices() iterated r1…r2 = 0…MAX_SAFE_INTEGER for a column selection (also after
    // firstClick with type "column") and never returned. runWithin() aborts a hanging call instead of the worker.
    it('getMergedRowIndices() returns (skipping the all-rows range) for a column selection', () => {
      const sm = new SelectionModel('column', 'multi');
      sm.firstClick(3, 1);
      expect(sm.getRanges()[0].r2).toBe(MAX); // the range really covers "all rows"
      expect(runWithin(2000, () => sm.getMergedRowIndices())).toEqual([]);
    });

    it('getMergedRowIndices(rowCount) lists all rows for a column selection', () => {
      const sm = new SelectionModel('column', 'multi');
      sm.firstClick(3, 1);
      expect(runWithin(2000, () => sm.getMergedRowIndices(4))).toEqual([0, 1, 2, 3]);
      expect(sm.getMergedRowIndices(0)).toEqual([]);
    });
  });

  describe('selectionType "range"', () => {

    it('keeps an added range as it is', () => {
      const sm = new SelectionModel('range');
      sm.addSelection(new CellRange(1, 1, 3, 4));
      expect(sm.getRanges()).toEqual([new CellRange(1, 1, 3, 4)]);
    });

    it('isSelected() is true inside the range (inclusive) and false outside', () => {
      const sm = new SelectionModel('range');
      sm.addSelection(new CellRange(1, 1, 3, 4));
      expect(sm.isSelected(1, 1)).toBe(true);
      expect(sm.isSelected(3, 4)).toBe(true);
      expect(sm.isSelected(2, 2)).toBe(true);
      expect(sm.isSelected(0, 1)).toBe(false);
      expect(sm.isSelected(4, 4)).toBe(false);
      expect(sm.isSelected(2, 5)).toBe(false);
    });

    it('firstClick() selects nothing', () => {
      const sm = new SelectionModel('range');
      sm.firstClick(1, 1);
      expect(sm.hasSelection()).toBe(false);
    });

    it('single mode: a new range replaces the previous one', () => {
      const sm = new SelectionModel('range', 'single');
      sm.addSelection(new CellRange(0, 0, 1, 1));
      sm.addSelection(new CellRange(5, 5, 6, 6));
      expect(sm.getRanges()).toEqual([new CellRange(5, 5, 6, 6)]);
    });

    it('multi mode: ranges accumulate in insertion order', () => {
      const sm = new SelectionModel('range', 'multi');
      sm.addSelection(new CellRange(0, 0, 1, 1));
      sm.addSelection(new CellRange(5, 5, 6, 6));
      expect(sm.getRanges()).toEqual([new CellRange(0, 0, 1, 1), new CellRange(5, 5, 6, 6)]);
    });

    it('removeSelection() cuts a hole into a selected range (negative range)', () => {
      const sm = new SelectionModel('range', 'multi');
      sm.addSelection(new CellRange(0, 0, 4, 4));
      sm.removeSelection(new CellRange(1, 1, 2, 2));
      expect(sm.isInNegativeRange(1, 1)).toBe(true);
      expect(sm.isInNegativeRange(2, 2)).toBe(true);
      expect(sm.isInNegativeRange(0, 0)).toBe(false);
      expect(sm.isSelected(1, 1)).toBe(false);
      expect(sm.isSelected(2, 2)).toBe(false);
      expect(sm.isSelected(0, 0)).toBe(true);
      expect(sm.isSelected(3, 3)).toBe(true);
      // the positive range itself stays untouched
      expect(sm.getRanges()).toEqual([new CellRange(0, 0, 4, 4)]);
    });

    it('getMergedRowIndices() returns the union of the rows of all ranges', () => {
      const sm = new SelectionModel('range', 'multi');
      sm.addSelection(new CellRange(1, 0, 2, 3));
      sm.addSelection(new CellRange(2, 5, 3, 6));
      expect(sm.getMergedRowIndices()).toEqual([1, 2, 3]);
    });

    it('getMergedRowIndices() sorts and de-duplicates the rows of overlapping ranges added in any order', () => {
      // (before: insertion order – see the regression test below)
      const sm = new SelectionModel('range', 'multi');
      sm.addSelection(new CellRange(7, 0, 8, 0));
      sm.addSelection(new CellRange(0, 2, 0, 2));
      sm.addSelection(new CellRange(3, 1, 7, 1));
      expect(sm.getMergedRowIndices()).toEqual([0, 3, 4, 5, 6, 7, 8]);
    });

    // Regression: SelectionModelIf.getMergedRowIndices() JSDoc promises "sorted", the implementation returned
    // insertion order.
    it('getMergedRowIndices() returns the row indices sorted', () => {
      const sm = new SelectionModel('range', 'multi');
      sm.addSelection(new CellRange(5, 0, 6, 0));
      sm.addSelection(new CellRange(1, 0, 2, 0));
      expect(sm.getMergedRowIndices()).toEqual([1, 2, 5, 6]);
    });

    // Regression: getMergedRowIndices() checked the negative ranges only for column 0, so a row whose first cell was
    // deselected disappeared although other cells of that row were still selected.
    it('getMergedRowIndices() keeps a row that still has selected cells after column 0 was deselected', () => {
      const sm = new SelectionModel('range', 'multi');
      sm.addSelection(new CellRange(0, 0, 2, 3));
      sm.removeSelection(CellRange.singleCell(1, 0));
      expect(sm.isSelected(1, 2)).toBe(true);
      expect(sm.getMergedRowIndices()).toEqual([0, 1, 2]);
    });

    it('getMergedRowIndices() leaves out a row whose cells were all removed (by several negative ranges)', () => {
      const sm = new SelectionModel('range', 'multi');
      sm.addSelection(new CellRange(0, 0, 2, 3));
      sm.removeSelection(new CellRange(1, 0, 1, 1));
      sm.removeSelection(new CellRange(0, 2, 1, 3));
      expect(sm.getMergedRowIndices()).toEqual([0, 2]);
    });

    it('getMergedRowIndices(rowCount) leaves out rows >= rowCount', () => {
      const sm = new SelectionModel('range', 'multi');
      sm.addSelection(new CellRange(2, 0, 9, 0));
      expect(sm.getMergedRowIndices(5)).toEqual([2, 3, 4]);
    });

    it('addSelection() selects the re-added part of a removed rectangle again (the rest stays removed)', () => {
      const sm = new SelectionModel('range', 'multi');
      sm.addSelection(new CellRange(0, 0, 4, 4));
      sm.removeSelection(new CellRange(1, 1, 3, 3));
      sm.addSelection(CellRange.singleCell(2, 2));
      expect(sm.isSelected(2, 2)).toBe(true);
      // the 8 surrounding cells of the hole stay removed (hole split above/below/left/right)
      for (const [r, c] of [[1, 1], [1, 2], [1, 3], [2, 1], [2, 3], [3, 1], [3, 2], [3, 3]]) {
        expect(sm.isSelected(r, c), `${r}/${c}`).toBe(false);
      }
      expect(sm.isSelected(0, 0)).toBe(true);
      expect(sm.isSelected(4, 4)).toBe(true);
    });

    it('addSelection() of a rectangle that covers a removed one lifts it completely', () => {
      const sm = new SelectionModel('range', 'multi');
      sm.addSelection(new CellRange(0, 0, 4, 4));
      sm.removeSelection(new CellRange(1, 1, 2, 2));
      sm.addSelection(new CellRange(0, 0, 3, 3));
      expect(sm.isInNegativeRange(1, 1)).toBe(false);
      expect(sm.isInNegativeRange(2, 2)).toBe(false);
      expect(sm.isSelected(2, 2)).toBe(true);
    });

    it('togglePoint() inside a range: off and on again leaves one range and no hole', () => {
      const sm = new SelectionModel('range', 'multi');
      sm.addSelection(new CellRange(0, 0, 2, 2));
      sm.togglePoint(1, 1);
      expect(sm.isSelected(1, 1)).toBe(false);
      sm.togglePoint(1, 1);
      expect(sm.isSelected(1, 1)).toBe(true);
      expect(sm.getSelectionCount(1, 1)).toBe(1);
      expect(sm.getRanges()).toHaveLength(1);
    });

    it('single mode: a new range also drops the cells removed from the previous one', () => {
      const sm = new SelectionModel('range', 'single');
      sm.addSelection(new CellRange(0, 0, 4, 4));
      sm.removeSelection(CellRange.singleCell(2, 2));
      sm.addSelection(new CellRange(5, 5, 6, 6));
      expect(sm.isInNegativeRange(2, 2)).toBe(false);
    });
  });

  describe('addRange via subclasses / all types × modes', () => {
    const cases: Array<[ExtendedSelectionType, SelectionMode, number]> = [
      ['none', 'single', 0], ['none', 'multi', 0],
      ['cell', 'single', 1], ['cell', 'multi', 2],
      ['row', 'single', 1], ['row', 'multi', 2],
      ['column', 'single', 1], ['column', 'multi', 2],
      ['range', 'single', 1], ['range', 'multi', 2],
    ];

    it.each(cases)('type %s / mode %s keeps %i range(s) after two addSelection() calls', (type, mode, expected) => {
      const sm = new SelectionModel(type, mode);
      sm.addSelection(new CellRange(0, 0, 1, 1));
      sm.addSelection(new CellRange(3, 3, 4, 4));
      expect(sm.getRanges()).toHaveLength(expected);
    });
  });

  describe('getSelectionCount', () => {
    it('is 0 outside of every range', () => {
      const sm = new SelectionModel('range', 'multi');
      sm.addSelection(new CellRange(0, 0, 1, 1));
      expect(sm.getSelectionCount(5, 5)).toBe(0);
    });

    it('counts overlapping ranges', () => {
      const sm = new SelectionModel('range', 'multi');
      sm.addSelection(new CellRange(0, 0, 2, 2));
      sm.addSelection(new CellRange(1, 1, 3, 3));
      expect(sm.getSelectionCount(0, 0)).toBe(1);
      expect(sm.getSelectionCount(1, 1)).toBe(2);
      expect(sm.getSelectionCount(3, 3)).toBe(1);
    });

    it('adds 1 when everything is selected', () => {
      const sm = new SelectionModel('range', 'multi');
      sm.addSelection(new CellRange(0, 0, 0, 0));
      sm.selectAll();
      // selectAll() keeps the ranges; addSelection() afterwards would reset the "all" flag
      expect(sm.getSelectionCount(0, 0)).toBe(2);
      expect(sm.getSelectionCount(9, 9)).toBe(1);
    });

    it('is 0 inside a negative range, even if everything is selected', () => {
      const sm = new SelectionModel('range', 'multi');
      sm.addSelection(new CellRange(0, 0, 3, 3));
      sm.selectAll();
      sm.removeSelection(CellRange.singleCell(2, 2));
      expect(sm.getSelectionCount(2, 2)).toBe(0);
      expect(sm.getSelectionCount(1, 1)).toBe(2);
    });
  });

  describe('isInNegativeRange', () => {
    it('is false without removed ranges', () => {
      expect(new SelectionModel('range').isInNegativeRange(0, 0)).toBe(false);
    });

    it('is true for every cell of any removed range', () => {
      const sm = new SelectionModel('range', 'multi');
      sm.removeSelection(new CellRange(0, 0, 0, 1));
      sm.removeSelection(new CellRange(5, 5, 5, 5));
      expect(sm.isInNegativeRange(0, 1)).toBe(true);
      expect(sm.isInNegativeRange(5, 5)).toBe(true);
      expect(sm.isInNegativeRange(1, 0)).toBe(false);
    });
  });

  describe('selectAll / isAllSelected', () => {
    it('selects every cell', () => {
      const sm = new SelectionModel('cell', 'multi');
      sm.selectAll();
      expect(sm.isAllSelected()).toBe(true);
      expect(sm.isSelected(0, 0)).toBe(true);
      expect(sm.isSelected(10_000, 99)).toBe(true);
      expect(sm.hasSelection()).toBe(true);
    });

    it('does not create a range', () => {
      // NOTE: consumers of getRanges()/getMergedRowIndices() must check isAllSelected() themselves.
      const sm = new SelectionModel('row', 'multi');
      sm.selectAll();
      expect(sm.getRanges()).toEqual([]);
      expect(sm.getMergedRowIndices()).toEqual([]);
    });

    it('is reset by a following addSelection()', () => {
      const sm = new SelectionModel('cell', 'multi');
      sm.selectAll();
      sm.addSelection(CellRange.singleCell(1, 1));
      expect(sm.isAllSelected()).toBe(false);
      expect(sm.isSelected(1, 1)).toBe(true);
      expect(sm.isSelected(2, 2)).toBe(false);
    });

    it('is reset by a following firstClick() for row selection', () => {
      const sm = new SelectionModel('row', 'multi');
      sm.selectAll();
      sm.firstClick(2, 0);
      expect(sm.isAllSelected()).toBe(false);
      expect(sm.isSelected(1, 0)).toBe(false);
    });

    it('lets removeSelection() cut holes into "all selected"', () => {
      const sm = new SelectionModel('cell', 'multi');
      sm.selectAll();
      sm.removeSelection(CellRange.singleCell(1, 1));
      expect(sm.isAllSelected()).toBe(true);
      expect(sm.isSelected(1, 1)).toBe(false);
      expect(sm.isSelected(1, 2)).toBe(true);
    });

    // Regression: selectAll() ("Selects all cells") kept the old negative ranges, so earlier deselected cells stayed
    // unselected.
    it('selects cells that were deselected before', () => {
      const sm = new SelectionModel('cell', 'multi');
      sm.addSelection(CellRange.singleCell(1, 1));
      sm.removeSelection(CellRange.singleCell(1, 1));
      sm.selectAll();
      expect(sm.isSelected(1, 1)).toBe(true);
    });

    it('togglePoint() off and on keeps "all selected"', () => {
      const sm = new SelectionModel('cell', 'multi');
      sm.selectAll();
      sm.togglePoint(1, 1);
      expect(sm.isSelected(1, 1)).toBe(false);
      sm.togglePoint(1, 1);
      expect(sm.isSelected(1, 1)).toBe(true);
      expect(sm.isAllSelected()).toBe(true);
      expect(sm.isSelected(50, 50)).toBe(true);
    });

    it('getMergedRowIndices(rowCount) lists all rows except fully removed ones', () => {
      const sm = new SelectionModel('row', 'multi');
      sm.selectAll();
      sm.removeSelection(CellRange.singleRow(2));
      expect(sm.getMergedRowIndices(4)).toEqual([0, 1, 3]);
      // without rowCount "all rows" can't be listed (see 'does not create a range')
      expect(sm.getMergedRowIndices()).toEqual([]);
    });
  });

  describe('clear / hasSelection / hasNoSelection', () => {
    it('hasSelection() is true after addSelection()', () => {
      const sm = new SelectionModel('cell');
      sm.addSelection(CellRange.singleCell(0, 0));
      expect(sm.hasSelection()).toBe(true);
      expect(sm.hasNoSelection()).toBe(false);
    });

    it('hasSelection() ignores negative ranges', () => {
      const sm = new SelectionModel('cell');
      sm.addSelection(CellRange.singleCell(0, 0));
      sm.removeSelection(CellRange.singleCell(0, 0));
      // NOTE: no cell is selected any more, but hasSelection() only looks at the positive ranges.
      expect(sm.isSelected(0, 0)).toBe(false);
      expect(sm.hasSelection()).toBe(true);
    });

    it('clear() removes ranges, negative ranges and the "all selected" flag', () => {
      const sm = new SelectionModel('range', 'multi');
      sm.addSelection(new CellRange(0, 0, 3, 3));
      sm.removeSelection(CellRange.singleCell(1, 1));
      sm.selectAll();
      sm.clear();
      expect(sm.getRanges()).toEqual([]);
      expect(sm.isInNegativeRange(1, 1)).toBe(false);
      expect(sm.isAllSelected()).toBe(false);
      expect(sm.hasSelection()).toBe(false);
      expect(sm.hasNoSelection()).toBe(true);
    });

    it('after clear() a previously removed cell can be selected again', () => {
      const sm = new SelectionModel('cell', 'multi');
      sm.togglePoint(1, 1);
      sm.togglePoint(1, 1);
      sm.clear();
      sm.togglePoint(1, 1);
      expect(sm.isSelected(1, 1)).toBe(true);
    });
  });

  describe('getRanges', () => {
    it('returns the internal array (live reference)', () => {
      const sm = new SelectionModel('range', 'multi');
      const ranges = sm.getRanges();
      sm.addSelection(new CellRange(0, 0, 0, 0));
      expect(sm.getRanges()).toBe(ranges);
      expect(ranges).toHaveLength(1);
    });

    it('returns a new array after single mode replaced the selection', () => {
      const sm = new SelectionModel('range', 'single');
      const before = sm.getRanges();
      sm.addSelection(new CellRange(0, 0, 0, 0));
      expect(sm.getRanges()).not.toBe(before);
    });
  });

  describe('listeners', () => {
    it('registers a listener only once', () => {
      const sm = new SelectionModel('cell');
      const { listener } = listenerSpy();
      sm.addEventSelectionChangedListener(listener);
      sm.addEventSelectionChangedListener(listener);
      expect(sm.getEventSelectionChangedListeners()).toEqual([listener]);
    });

    it('removes a registered listener and ignores unknown ones', () => {
      const sm = new SelectionModel('cell');
      const a = listenerSpy();
      const b = listenerSpy();
      sm.addEventSelectionChangedListener(a.listener);
      sm.removeEventSelectionChangedListener(b.listener);
      expect(sm.getEventSelectionChangedListeners()).toEqual([a.listener]);
      sm.removeEventSelectionChangedListener(a.listener);
      expect(sm.getEventSelectionChangedListeners()).toEqual([]);
    });

    it('fireChangeEvent() calls every listener in registration order with the model', () => {
      const sm = new SelectionModel('cell');
      const calls: string[] = [];
      sm.addEventSelectionChangedListener({ onSelectionChanged: (m) => calls.push('a:' + (m === sm)) });
      sm.addEventSelectionChangedListener({ onSelectionChanged: (m) => calls.push('b:' + (m === sm)) });
      sm.fireChangeEvent();
      expect(calls).toEqual(['a:true', 'b:true']);
    });

    it('a removed listener is not called any more', () => {
      const sm = new SelectionModel('cell');
      const { listener, onSelectionChanged } = listenerSpy();
      sm.addEventSelectionChangedListener(listener);
      sm.removeEventSelectionChangedListener(listener);
      sm.addSelection(CellRange.singleCell(0, 0));
      expect(onSelectionChanged).not.toHaveBeenCalled();
    });

    it('addSelection() fires twice', () => {
      const sm = new SelectionModel('cell');
      const { listener, onSelectionChanged } = listenerSpy();
      sm.addEventSelectionChangedListener(listener);
      sm.addSelection(CellRange.singleCell(0, 0));
      // NOTE: addRange() fires and addSelection() fires again – listeners get two events for one change.
      expect(onSelectionChanged).toHaveBeenCalledTimes(2);
      expect(onSelectionChanged).toHaveBeenCalledWith(sm);
    });

    it('addSelection() still fires once for type "none" although nothing changed', () => {
      const sm = new SelectionModel('none');
      const { listener, onSelectionChanged } = listenerSpy();
      sm.addEventSelectionChangedListener(listener);
      sm.addSelection(CellRange.singleCell(0, 0));
      expect(onSelectionChanged).toHaveBeenCalledTimes(1);
    });

    it('removeSelection() fires once, but not for type "none"', () => {
      const cell = new SelectionModel('cell');
      const none = new SelectionModel('none');
      const a = listenerSpy();
      const b = listenerSpy();
      cell.addEventSelectionChangedListener(a.listener);
      none.addEventSelectionChangedListener(b.listener);
      cell.removeSelection(CellRange.singleCell(0, 0));
      none.removeSelection(CellRange.singleCell(0, 0));
      expect(a.onSelectionChanged).toHaveBeenCalledTimes(1);
      expect(b.onSelectionChanged).not.toHaveBeenCalled();
    });

    it('firstClick() fires once for "row"/"column" and not at all for "cell"/"range"', () => {
      const counts = (['row', 'column', 'cell', 'range'] as ExtendedSelectionType[]).map(type => {
        const sm = new SelectionModel(type);
        const { listener, onSelectionChanged } = listenerSpy();
        sm.addEventSelectionChangedListener(listener);
        sm.firstClick(1, 1);
        return onSelectionChanged.mock.calls.length;
      });
      expect(counts).toEqual([1, 1, 0, 0]);
    });

    it('togglePoint() fires once when it selects a removed cell again', () => {
      const sm = new SelectionModel('range', 'multi');
      sm.addSelection(new CellRange(0, 0, 2, 2));
      sm.togglePoint(1, 1);
      const { listener, onSelectionChanged } = listenerSpy();
      sm.addEventSelectionChangedListener(listener);
      sm.togglePoint(1, 1);
      expect(onSelectionChanged).toHaveBeenCalledTimes(1);
    });

    it('selectAll() and clear() fire once each', () => {
      const sm = new SelectionModel('cell');
      const { listener, onSelectionChanged } = listenerSpy();
      sm.addEventSelectionChangedListener(listener);
      sm.selectAll();
      expect(onSelectionChanged).toHaveBeenCalledTimes(1);
      sm.clear();
      expect(onSelectionChanged).toHaveBeenCalledTimes(2);
    });

    it('a silent model does not notify its listeners', () => {
      const sm = new SilentSelectionModel('cell', 'multi');
      const { listener, onSelectionChanged } = listenerSpy();
      sm.addEventSelectionChangedListener(listener);
      sm.setSilent(true);
      sm.addSelection(CellRange.singleCell(0, 0));
      sm.removeSelection(CellRange.singleCell(0, 0));
      sm.selectAll();
      sm.clear();
      sm.fireChangeEvent();
      expect(onSelectionChanged).not.toHaveBeenCalled();
      sm.setSilent(false);
      sm.fireChangeEvent();
      expect(onSelectionChanged).toHaveBeenCalledTimes(1);
    });
  });
});
