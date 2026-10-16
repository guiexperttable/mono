import { describe, expect, it } from 'vitest';
import { allRowObjectsOf, rowsArrayOf } from './model-rows';

describe('model rows', () => {
  it('object arrays, row groupings, arrays of arrays, unknown models', () => {
    const rows = [{ a: 1 }];
    expect(rowsArrayOf({ getAllRows: () => rows })).toBe(rows);
    expect(rowsArrayOf({ getSourceRows: () => rows })).toBe(rows);
    expect(rowsArrayOf({ arr: rows })).toBe(rows);
    expect(rowsArrayOf({})).toBeUndefined();
    expect(allRowObjectsOf({ arr: rows })!.has(rows[0])).toBe(true);
    expect(allRowObjectsOf({})).toBeNull();
  });
});
