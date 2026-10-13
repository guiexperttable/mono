import { describe, it, expect, vi } from 'vitest';
import { CellRange, MultiRowsSelectionModel, SelectionModel } from '@guiexpert/table';
import type { ObjectArrayHolderIf } from '@guiexpert/table';

interface Item {
  id: number;
}

const ALL: Item[] = [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }];

function holder(all: Item[] = ALL, filtered: Item[] = all): ObjectArrayHolderIf<Item> {
  return {
    getAllRows: () => all,
    getFilteredRows: () => filtered,
  };
}

function selectedRows(sm: MultiRowsSelectionModel<Item>, rowCount = ALL.length): number[] {
  const ret: number[] = [];
  for (let i = 0; i < rowCount; i++) {
    if (sm.isSelected(i, 0)) ret.push(i);
  }
  return ret;
}

function withListener(sm: MultiRowsSelectionModel<Item>) {
  const onSelectionChanged = vi.fn();
  sm.addEventSelectionChangedListener({ onSelectionChanged });
  return onSelectionChanged;
}

describe('MultiRowsSelectionModel', () => {

  describe('constructor', () => {
    it('is a SelectionModel with type "row" and mode "multi"', () => {
      const sm = new MultiRowsSelectionModel(holder());
      expect(sm).toBeInstanceOf(SelectionModel);
      expect(sm.selectionType).toBe('row');
      expect(sm.selectionMode).toBe('multi');
    });

    it('keeps the given model', () => {
      const model = holder();
      expect(new MultiRowsSelectionModel(model).model).toBe(model);
    });
  });

  describe('selectRow / unselectRow', () => {
    it('selectRow() selects whole rows and accumulates them', () => {
      const sm = new MultiRowsSelectionModel(holder());
      sm.selectRow(1);
      sm.selectRow(3);
      expect(selectedRows(sm)).toEqual([1, 3]);
      expect(sm.isSelected(1, 42)).toBe(true);
    });

    it('unselectRow() deselects a row', () => {
      const sm = new MultiRowsSelectionModel(holder());
      sm.selectRow(1);
      sm.selectRow(2);
      sm.unselectRow(1);
      expect(selectedRows(sm)).toEqual([2]);
    });

    it('selectRow() and unselectRow() fire one event each', () => {
      const sm = new MultiRowsSelectionModel(holder());
      const spy = withListener(sm);
      sm.selectRow(1);
      expect(spy).toHaveBeenCalledTimes(1);
      sm.unselectRow(1);
      expect(spy).toHaveBeenCalledTimes(2);
    });
  });

  describe('toggleRow', () => {
    it('selects an unselected row', () => {
      const sm = new MultiRowsSelectionModel(holder());
      sm.toggleRow(2);
      expect(selectedRows(sm)).toEqual([2]);
    });

    it('deselects a selected row', () => {
      const sm = new MultiRowsSelectionModel(holder());
      sm.selectRow(2);
      sm.toggleRow(2);
      expect(selectedRows(sm)).toEqual([]);
    });

    // Regression: unselectRow() added a negative range that was never removed, so the row could not be selected again
    // (only clear() helped).
    it('selects a row again after it was toggled off', () => {
      const sm = new MultiRowsSelectionModel(holder());
      sm.toggleRow(2);
      sm.toggleRow(2);
      sm.toggleRow(2);
      expect(selectedRows(sm)).toEqual([2]);
      expect(sm.getSelectionCount(2, 0)).toBe(1); // no second, overlapping range
    });

    it('selectRow() selects a row again after unselectRow()', () => {
      const sm = new MultiRowsSelectionModel(holder());
      sm.selectRow(1);
      sm.unselectRow(1);
      sm.selectRow(1);
      expect(selectedRows(sm)).toEqual([1]);
    });

    it('toggles a row of "all selected" off and on again without losing "all selected"', () => {
      const sm = new MultiRowsSelectionModel(holder());
      sm.selectAll();
      sm.toggleRow(1);
      expect(selectedRows(sm)).toEqual([0, 2, 3]);
      sm.toggleRow(1);
      expect(selectedRows(sm)).toEqual([0, 1, 2, 3]);
      expect(sm.isAllSelected()).toBe(true);
    });

    it('fires one event per toggle', () => {
      const sm = new MultiRowsSelectionModel(holder());
      const spy = withListener(sm);
      sm.toggleRow(2);
      sm.toggleRow(2);
      sm.toggleRow(2);
      expect(spy).toHaveBeenCalledTimes(3);
    });
  });

  describe('getSelectedRowItems', () => {
    it('returns the items at the selected row indices, in array order', () => {
      const sm = new MultiRowsSelectionModel(holder());
      sm.selectRow(3);
      sm.selectRow(1);
      expect(sm.getSelectedRowItems(ALL)).toEqual([ALL[1], ALL[3]]);
    });

    it('returns an empty array without selection', () => {
      const sm = new MultiRowsSelectionModel(holder());
      expect(sm.getSelectedRowItems(ALL)).toEqual([]);
    });

    it('leaves out unselected rows', () => {
      const sm = new MultiRowsSelectionModel(holder());
      sm.selectRow(0);
      sm.selectRow(1);
      sm.unselectRow(0);
      expect(sm.getSelectedRowItems(ALL)).toEqual([ALL[1]]);
    });

    it('returns the given array itself when everything is selected', () => {
      const sm = new MultiRowsSelectionModel(holder());
      sm.selectAll();
      expect(sm.getSelectedRowItems(ALL)).toBe(ALL);
    });

    it('leaves out rows removed from "all selected"', () => {
      const sm = new MultiRowsSelectionModel(holder());
      sm.selectAll();
      sm.unselectRow(2);
      expect(sm.getSelectedRowItems(ALL)).toEqual([ALL[0], ALL[1], ALL[3]]);
    });

    it('ignores selected row indices beyond the given array', () => {
      const sm = new MultiRowsSelectionModel(holder());
      sm.addSelection(new CellRange(2, 0, 1_000_000, 0));
      expect(sm.getSelectedRowItems(ALL)).toEqual([ALL[2], ALL[3]]);
    });

    it('applies the (displayed) row indices to whatever array is passed in', () => {
      const filtered = [ALL[2], ALL[3]];
      const sm = new MultiRowsSelectionModel(holder(ALL, filtered));
      sm.toggleFilteredRowsSelection(); // selects the displayed rows 0 and 1
      // NOTE: indices are view indices; passing getAllRows() instead of the displayed rows returns the wrong items.
      expect(sm.getSelectedRowItems(ALL)).toEqual([ALL[0], ALL[1]]);
      expect(sm.getSelectedRowItems(filtered)).toEqual([ALL[2], ALL[3]]);
    });
  });

  describe('toggleSelection', () => {
    it('selects all when nothing is selected', () => {
      const sm = new MultiRowsSelectionModel(holder());
      sm.toggleSelection();
      expect(sm.isAllSelected()).toBe(true);
    });

    it('clears when everything is selected', () => {
      const sm = new MultiRowsSelectionModel(holder());
      sm.selectAll();
      sm.toggleSelection();
      expect(sm.isAllSelected()).toBe(false);
      expect(sm.hasSelection()).toBe(false);
    });

    it('inverts a partial selection over all rows of the model', () => {
      const sm = new MultiRowsSelectionModel(holder());
      sm.selectRow(1);
      sm.toggleSelection();
      expect(selectedRows(sm)).toEqual([0, 2, 3]);
      expect(sm.isAllSelected()).toBe(false);
    });

    it('fires exactly one event when inverting (listeners are silenced in between)', () => {
      const sm = new MultiRowsSelectionModel(holder());
      sm.selectRow(1);
      const spy = withListener(sm);
      sm.toggleSelection();
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('toggleFilteredRowsSelection', () => {
    it('selects the displayed rows 0 … filteredCount-1 when nothing is selected', () => {
      const sm = new MultiRowsSelectionModel(holder(ALL, [ALL[1], ALL[3]]));
      sm.toggleFilteredRowsSelection();
      expect(selectedRows(sm)).toEqual([0, 1]);
      expect(sm.isAllSelected()).toBe(false);
    });

    it('fires exactly one event when selecting the filtered rows', () => {
      const sm = new MultiRowsSelectionModel(holder(ALL, [ALL[1], ALL[3]]));
      const spy = withListener(sm);
      sm.toggleFilteredRowsSelection();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('clears when everything is selected', () => {
      const sm = new MultiRowsSelectionModel(holder());
      sm.selectAll();
      sm.toggleFilteredRowsSelection();
      expect(sm.hasSelection()).toBe(false);
    });

    it('inverts a partial selection over the filtered rows only', () => {
      const sm = new MultiRowsSelectionModel(holder(ALL, [ALL[0], ALL[1], ALL[2]]));
      sm.selectRow(0);
      sm.toggleFilteredRowsSelection();
      expect(selectedRows(sm)).toEqual([1, 2]);
    });
  });
});
