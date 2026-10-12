import { describe, it, expect } from 'vitest';
import {
  AreaModelObjectArray,
  AreaModelTree,
  CheckboxColumnDef,
  ColumnDef,
  TreeFactory,
  TreeRow,
  isAreaModelTree,
  isCheckboxColumnDef,
  isTreeRow,
} from '@guiexpert/table';

describe('instanceof-workaround', () => {

  describe('isTreeRow', () => {
    it('is true for a TreeRow', () => {
      expect(isTreeRow(new TreeRow({ id: 1 }, true, undefined, undefined))).toBe(true);
    });

    it('is true for rows built by TreeFactory', () => {
      const [row] = TreeFactory.buildTreeRows([{ id: 1 }]);
      expect(isTreeRow(row)).toBe(true);
    });

    it('is true for any object with type "TreeRow" (duck typing across bundles)', () => {
      expect(isTreeRow({ type: 'TreeRow' })).toBe(true);
    });

    it('is false for plain row objects and other markers', () => {
      expect(isTreeRow({ id: 1 })).toBe(false);
      expect(isTreeRow({ type: '' })).toBe(false);
      expect(isTreeRow({ type: 'AreaModelTree' })).toBe(false);
    });

    it('returns the falsy input itself for null/undefined', () => {
      // NOTE: declared as boolean, but `row && …` returns null/undefined (not false) for those inputs.
      expect(isTreeRow(null)).toBeNull();
      expect(isTreeRow(undefined)).toBeUndefined();
      expect(isTreeRow(0)).toBe(0);
    });
  });

  describe('isAreaModelTree', () => {
    it('is true for an AreaModelTree', () => {
      const model = new AreaModelTree('body', TreeFactory.buildTreeRows([{ id: 1 }]), 20, [ColumnDef.create({ property: 'id' })]);
      expect(isAreaModelTree(model)).toBe(true);
    });

    it('is false for a flat area model', () => {
      const model = new AreaModelObjectArray('body', [{ id: 1 }], 20, [ColumnDef.create({ property: 'id' })]);
      expect(isAreaModelTree(model)).toBe(false);
    });

    it('is true for any object with type "AreaModelTree"', () => {
      expect(isAreaModelTree({ type: 'AreaModelTree' })).toBe(true);
      expect(isAreaModelTree({ type: 'TreeRow' })).toBe(false);
    });

    it('returns the falsy input itself for null/undefined', () => {
      expect(isAreaModelTree(null)).toBeNull();
      expect(isAreaModelTree(undefined)).toBeUndefined();
    });
  });

  describe('isCheckboxColumnDef', () => {
    it('is true for a CheckboxColumnDef', () => {
      expect(isCheckboxColumnDef(new CheckboxColumnDef())).toBe(true);
    });

    it('is false for a normal ColumnDef', () => {
      expect(isCheckboxColumnDef(ColumnDef.create({ property: 'id' }))).toBe(false);
    });

    it('is true for any object with type "CheckboxColumnDef"', () => {
      expect(isCheckboxColumnDef({ type: 'CheckboxColumnDef' })).toBe(true);
    });

    it('returns the falsy input itself for null/undefined', () => {
      expect(isCheckboxColumnDef(null)).toBeNull();
      expect(isCheckboxColumnDef(undefined)).toBeUndefined();
    });
  });
});
