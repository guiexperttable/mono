import { describe, it, expect } from 'vitest';
import { TreeRow, isTreeRow } from '@guiexpert/table';

describe('TreeRow', () => {

  it('has the marker type "TreeRow"', () => {
    const row = new TreeRow({ id: 1 }, true, undefined, undefined);
    expect(row.type).toBe('TreeRow');
    expect(isTreeRow(row)).toBe(true);
  });

  it('applies the defaults: deep 0, unchecked, not kept', () => {
    const row = new TreeRow({ id: 1 }, true, undefined, undefined);
    expect(row.deep).toBe(0);
    expect(row.checked).toBe(false);
    expect(row.keep).toBe(false);
  });

  it('defaults expanded to true when undefined is passed', () => {
    const row = new TreeRow({ id: 1 }, undefined, undefined, undefined);
    expect(row.expanded).toBe(true);
  });

  it('stores all constructor arguments', () => {
    const data = { id: 2 };
    const parent = new TreeRow({ id: 1 }, true, [], undefined);
    const row = new TreeRow(data, false, [], parent, 1, true, true);
    expect(row.data).toBe(data);
    expect(row.expanded).toBe(false);
    expect(row.children).toEqual([]);
    expect(row.parent).toBe(parent);
    expect(row.deep).toBe(1);
    expect(row.checked).toBe(true);
    expect(row.keep).toBe(true);
  });

  it('does not register itself as a child of the parent', () => {
    const parent = new TreeRow({ id: 1 }, true, [], undefined);
    new TreeRow({ id: 2 }, true, [], parent, 1);
    expect(parent.children).toEqual([]);
  });
});
