import { describe, expect, it } from 'vitest';
import { ALL_TABLE_STATE_PARTS, readLegacyState, removeLegacyState } from '@guiexpert/table';
import { memoryStorage, throwingStorage } from '../../../../test-utils/memory-storage';

const PROPS = ['id', 'customer', 'city', 'total'];

describe('readLegacyState() – the keys before 1.1.92 (S8)', () => {

  it('undefined when nothing was stored', () => {
    expect(readLegacyState(memoryStorage(), 'orders', PROPS)).toBeUndefined();
  });

  it('sort items: column index → property of the default column order', () => {
    const storage = memoryStorage({ orderssortingState: '[{"columnIndex":3,"sortState":"desc"},{"columnIndex":0,"sortState":"asc"}]' });
    expect(readLegacyState(storage, 'orders', PROPS)).toEqual({
      version: 1,
      sort: [{ property: 'total', sortState: 'desc' }, { property: 'id', sortState: 'asc' }],
    });
  });

  it('sort items: an index without property stays an index; empty or invalid items are dropped', () => {
    const storage = memoryStorage({
      orderssortingState: '[{"columnIndex":9,"sortState":"asc"},{"columnIndex":1,"sortState":""},{"sortState":"asc"},null]',
    });
    expect(readLegacyState(storage, 'orders', PROPS)!.sort).toEqual([{ columnIndex: 9, sortState: 'asc' }]);
  });

  it('scroll position', () => {
    const storage = memoryStorage({ ordersscrollState: '[10,250]' });
    expect(readLegacyState(storage, 'orders', PROPS)).toEqual({ version: 1, scroll: { left: 10, top: 250 } });
  });

  it('an invalid scroll value is ignored', () => {
    expect(readLegacyState(memoryStorage({ ordersscrollState: '"x"' }), 'orders', PROPS)).toBeUndefined();
  });

  it.each([
    [{ mode: 'expanded', rowIds: [1, 2], allCollapsed: false, allExpanded: false }, { expandedRowIds: [1, 2] }],
    [{ mode: 'collapsed', rowIds: ['a'], allCollapsed: false, allExpanded: false }, { collapsedRowIds: ['a'] }],
    [{ mode: 'collapsed', rowIds: [], allCollapsed: false, allExpanded: true }, { collapsedRowIds: [] }],
    [{ mode: 'expanded', rowIds: [], allCollapsed: true, allExpanded: false }, { expandedRowIds: [] }],
    [{}, { collapsedRowIds: [] }],
  ])('tree %j → %j', (legacy, tree) => {
    const storage = memoryStorage({ orderscollapsedExpandedState: JSON.stringify(legacy) });
    expect(readLegacyState(storage, 'orders', PROPS)).toEqual({ version: 1, tree });
  });

  it('broken JSON and a blocked storage → undefined', () => {
    expect(readLegacyState(memoryStorage({ orderssortingState: '{broken' }), 'orders', PROPS)).toBeUndefined();
    expect(readLegacyState(throwingStorage(), 'orders', PROPS)).toBeUndefined();
  });
});

describe('removeLegacyState()', () => {

  it('removes the three old keys of this table only', () => {
    const storage = memoryStorage({
      orderssortingState: '[]', ordersscrollState: '[0,0]', orderscollapsedExpandedState: '{}', otherscrollState: '[0,0]',
      orderstableState: '{}',
    });
    removeLegacyState(storage, 'orders');
    expect([...Array(storage.length).keys()].map(i => storage.key(i))).toEqual(['otherscrollState', 'orderstableState']);
  });

  it('a blocked storage does not throw', () => {
    expect(() => removeLegacyState(throwingStorage(), 'orders')).not.toThrow();
  });
});

describe('ALL_TABLE_STATE_PARTS', () => {
  it('lists every part once, in the order they are applied', () => {
    expect(ALL_TABLE_STATE_PARTS).toEqual(['headerGroups', 'columns', 'tree', 'sort', 'checked', 'selection', 'scroll', 'custom']);
  });
});
