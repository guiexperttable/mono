import { describe, it, expect } from 'vitest';
import { CellRange } from '@guiexpert/table';

describe('CellRange', () => {

  it('stores the corners and defaults gammaRange to false', () => {
    const r = new CellRange(1, 2, 3, 4);
    expect([r.r1, r.c1, r.r2, r.c2, r.gammaRange]).toEqual([1, 2, 3, 4, false]);
  });

  describe('create', () => {
    it('creates a range from named parameters', () => {
      const r = CellRange.create({ rowIndex1: 1, columnIndex1: 2, rowIndex2: 3, columnIndex2: 4 });
      expect(r).toEqual(new CellRange(1, 2, 3, 4, false));
    });

    it('passes gammaRange', () => {
      expect(CellRange.create({ rowIndex1: 0, columnIndex1: 0, rowIndex2: 0, columnIndex2: 0, gammaRange: true }).gammaRange).toBe(true);
    });

    it('writes the default gammaRange back into the params object', () => {
      const params: { rowIndex1: number; columnIndex1: number; rowIndex2: number; columnIndex2: number; gammaRange?: boolean } =
        { rowIndex1: 0, columnIndex1: 0, rowIndex2: 0, columnIndex2: 0 };
      CellRange.create(params);
      // NOTE: create() mutates its argument (sets params.gammaRange = false) instead of using a local default.
      expect(params.gammaRange).toBe(false);
    });
  });

  it('singleRow/singleColumn span 0 … Number.MAX_SAFE_INTEGER', () => {
    expect(CellRange.singleRow(4)).toEqual(new CellRange(4, 0, 4, Number.MAX_SAFE_INTEGER));
    expect(CellRange.singleColumn(2)).toEqual(new CellRange(0, 2, Number.MAX_SAFE_INTEGER, 2));
    expect(CellRange.singleCell(3, 7)).toEqual(new CellRange(3, 7, 3, 7));
  });

  it('singleCell covers exactly one cell', () => {
    const r = CellRange.singleCell(2, 3);
    expect(r.isInRange(2, 3)).toBe(true);
    expect(r.isInRange(2, 4)).toBe(false);
    expect(r.isInRange(3, 3)).toBe(false);
  });

  it('singleRow covers all columns of one row', () => {
    const r = CellRange.singleRow(5);
    expect(r.isInRange(5, 0)).toBe(true);
    expect(r.isInRange(5, 1_000_000)).toBe(true);
    expect(r.isInRange(4, 0)).toBe(false);
  });

  it('singleColumn covers all rows of one column', () => {
    const r = CellRange.singleColumn(1);
    expect(r.isInRange(0, 1)).toBe(true);
    expect(r.isInRange(1_000_000, 1)).toBe(true);
    expect(r.isInRange(0, 2)).toBe(false);
  });

  describe('isInRange', () => {
    const r = new CellRange(1, 1, 3, 2);

    it('includes the corners (inclusive bounds)', () => {
      expect(r.isInRange(1, 1)).toBe(true);
      expect(r.isInRange(3, 2)).toBe(true);
      expect(r.isInRange(1, 2)).toBe(true);
      expect(r.isInRange(3, 1)).toBe(true);
    });

    it('excludes cells outside', () => {
      expect(r.isInRange(0, 1)).toBe(false);
      expect(r.isInRange(4, 1)).toBe(false);
      expect(r.isInRange(2, 0)).toBe(false);
      expect(r.isInRange(2, 3)).toBe(false);
    });

    it('is empty for reversed corners', () => {
      // NOTE: ranges are not normalized – r1 > r2 matches nothing.
      expect(new CellRange(3, 0, 1, 0).isInRange(2, 0)).toBe(false);
    });
  });
});
