import { describe, it, expect } from 'vitest';
import { CheckboxModel } from '@guiexpert/table';

interface Item {
  id: number;
}

const a: Item = { id: 1 };
const b: Item = { id: 2 };
const c: Item = { id: 3 };

describe('CheckboxModel', () => {

  it('starts without checked rows', () => {
    const cm = new CheckboxModel<Item>();
    expect(cm.getCheckedRows()).toEqual([]);
    expect(cm.isRowChecked(a)).toBe('none');
  });

  describe('checkRow', () => {
    it('true checks a row', () => {
      const cm = new CheckboxModel<Item>();
      cm.checkRow(a, true);
      expect(cm.isRowChecked(a)).toBe('full');
      expect(cm.getCheckedRows()).toEqual([a]);
    });

    it('checking a row twice keeps it once', () => {
      const cm = new CheckboxModel<Item>();
      cm.checkRow(a, true);
      cm.checkRow(a, true);
      expect(cm.getCheckedRows()).toEqual([a]);
    });

    it('false unchecks a row', () => {
      const cm = new CheckboxModel<Item>();
      cm.checkRow(a, true);
      cm.checkRow(b, true);
      cm.checkRow(a, false);
      expect(cm.getCheckedRows()).toEqual([b]);
      expect(cm.isRowChecked(a)).toBe('none');
    });

    it('unchecking an unchecked row is a no-op', () => {
      const cm = new CheckboxModel<Item>();
      cm.checkRow(a, true);
      cm.checkRow(b, false);
      expect(cm.getCheckedRows()).toEqual([a]);
    });

    it('keeps the check order', () => {
      const cm = new CheckboxModel<Item>();
      cm.checkRow(c, true);
      cm.checkRow(a, true);
      expect(cm.getCheckedRows()).toEqual([c, a]);
    });
  });

  describe('isRowChecked', () => {
    it('compares rows by identity, not by value', () => {
      const cm = new CheckboxModel<Item>();
      cm.checkRow(a, true);
      expect(cm.isRowChecked({ id: 1 })).toBe('none');
    });

    it('never returns "semi"', () => {
      const cm = new CheckboxModel<Item>();
      cm.checkRow(a, true);
      expect([cm.isRowChecked(a), cm.isRowChecked(b)]).toEqual(['full', 'none']);
    });

    it('works with primitive rows', () => {
      const cm = new CheckboxModel<number>();
      cm.checkRow(5, true);
      expect(cm.isRowChecked(5)).toBe('full');
      expect(cm.isRowChecked(6)).toBe('none');
    });
  });

  describe('setCheckedRows', () => {
    it('replaces the checked rows', () => {
      const cm = new CheckboxModel<Item>();
      cm.checkRow(a, true);
      cm.setCheckedRows([b, c]);
      expect(cm.getCheckedRows()).toEqual([b, c]);
      expect(cm.isRowChecked(a)).toBe('none');
    });

    it('keeps the given array by reference', () => {
      const cm = new CheckboxModel<Item>();
      const arr = [a];
      cm.setCheckedRows(arr);
      cm.checkRow(b, true);
      // NOTE: the caller's array is used internally (no copy) and is mutated by later checkRow() calls.
      expect(arr).toEqual([a, b]);
      expect(cm.getCheckedRows()).toBe(arr);
    });
  });

  describe('after setCheckedRows(undefined) (loosely typed callers)', () => {
    it('reports "none" and starts a new list on the next check', () => {
      const cm = new CheckboxModel<Item>();
      cm.setCheckedRows(undefined as unknown as Item[]);
      expect(cm.isRowChecked(a)).toBe('none');
      cm.checkRow(a, true);
      expect(cm.getCheckedRows()).toEqual([a]);
    });

    it('addCheckedRows() starts a new list', () => {
      const cm = new CheckboxModel<Item>();
      cm.setCheckedRows(undefined as unknown as Item[]);
      cm.addCheckedRows([b]);
      expect(cm.getCheckedRows()).toEqual([b]);
    });

    it('unchecking does not throw', () => {
      const cm = new CheckboxModel<Item>();
      cm.setCheckedRows(undefined as unknown as Item[]);
      expect(() => cm.checkRow(a, false)).not.toThrow();
    });
  });

  describe('addCheckedRows', () => {
    it('adds rows without duplicates', () => {
      const cm = new CheckboxModel<Item>();
      cm.checkRow(a, true);
      cm.addCheckedRows([a, b, b]);
      expect(cm.getCheckedRows()).toEqual([a, b]);
    });
  });

  describe('checkAll', () => {
    it('unchecks every row and ignores its argument', () => {
      const cm = new CheckboxModel<Item>();
      cm.checkRow(a, true);
      cm.checkAll([a, b, c]);
      // NOTE: despite its name checkAll() clears all check marks (same in TreeCheckboxModel).
      expect(cm.getCheckedRows()).toEqual([]);
      expect(cm.isRowChecked(b)).toBe('none');
    });
  });
});
