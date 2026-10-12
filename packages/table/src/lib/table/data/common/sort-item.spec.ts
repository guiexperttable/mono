import { describe, it, expect } from 'vitest';
import { SortItem } from '@guiexpert/table';
import type { SortState } from '@guiexpert/table';

describe('SortItem', () => {

  it.each<SortState>(['asc', 'desc', ''])('stores column index and sort state "%s"', (state) => {
    const item = new SortItem(3, state);
    expect(item.columnIndex).toBe(3);
    expect(item.sortState).toBe(state);
  });

  it('serialises to a plain JSON object (as stored by autoRestoreOptions)', () => {
    expect(JSON.stringify([new SortItem(2, 'desc')])).toBe('[{"columnIndex":2,"sortState":"desc"}]');
  });

  it('is mutable', () => {
    const item = new SortItem(0, 'asc');
    item.sortState = 'desc';
    item.columnIndex = 5;
    expect(item).toEqual(new SortItem(5, 'desc'));
  });
});
