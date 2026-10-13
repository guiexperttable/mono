import { afterEach, describe, expect, it, vi } from 'vitest';
import { SortItem, StoreStateSortingService } from '@guiexpert/table';
import { memoryStorage } from '../../../../test-utils/memory-storage';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('StoreStateSortingService', () => {

  it('starts without sort items', () => {
    expect(new StoreStateSortingService(undefined).getSortItems()).toEqual([]);
  });

  it('stores the sort items as JSON under "<key>sortingState"', () => {
    const storage = memoryStorage();
    vi.stubGlobal('localStorage', storage);
    const service = new StoreStateSortingService(() => 'orders');
    service.setSortItems([new SortItem(2, 'desc'), new SortItem(0, 'asc')]);
    expect(storage.getItem('orderssortingState')).toBe('[{"columnIndex":2,"sortState":"desc"},{"columnIndex":0,"sortState":"asc"}]');
    expect(service.getSortItems()).toEqual([new SortItem(2, 'desc'), new SortItem(0, 'asc')]);
  });

  it('stores an empty list as "[]" (does not remove the key)', () => {
    const storage = memoryStorage({ 'orderssortingState': '[{"columnIndex":1,"sortState":"asc"}]' });
    vi.stubGlobal('localStorage', storage);
    new StoreStateSortingService(() => 'orders').setSortItems([]);
    expect(storage.getItem('orderssortingState')).toBe('[]');
  });

  it('restores the sort items (as plain objects) on construction', () => {
    vi.stubGlobal('localStorage', memoryStorage({ 'orderssortingState': '[{"columnIndex":1,"sortState":"asc"}]' }));
    const items = new StoreStateSortingService(() => 'orders').getSortItems();
    expect(items).toEqual([{ columnIndex: 1, sortState: 'asc' }]);
    expect(items[0]).not.toBeInstanceOf(SortItem);
  });

  it('uses separate keys per table', () => {
    const storage = memoryStorage();
    vi.stubGlobal('localStorage', storage);
    new StoreStateSortingService(() => 'a').setSortItems([new SortItem(0, 'asc')]);
    expect(new StoreStateSortingService(() => 'b').getSortItems()).toEqual([]);
    expect(new StoreStateSortingService(() => 'a').getSortItems()).toEqual([{ columnIndex: 0, sortState: 'asc' }]);
  });
});
