import { afterEach, describe, expect, it, vi } from 'vitest';
import { StoreStateScrollPosService } from '@guiexpert/table';
import { memoryStorage, throwingStorage } from '../../../../test-utils/memory-storage';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('StoreStateScrollPosService', () => {

  it('starts at [0, 0] without a storage key function', () => {
    expect(new StoreStateScrollPosService(undefined).getScrollOffset()).toEqual([0, 0]);
  });

  it('works in an environment without localStorage (Node / SSR)', () => {
    const service = new StoreStateScrollPosService(() => 'tbl');
    expect(service.getScrollOffset()).toEqual([0, 0]);
    expect(() => service.updateScrollOffset([1, 2])).not.toThrow();
    expect(service.getScrollOffset()).toEqual([1, 2]);
  });

  it('stores the offset as JSON under "<key>scrollState"', () => {
    const storage = memoryStorage();
    vi.stubGlobal('localStorage', storage);
    new StoreStateScrollPosService(() => 'orders').updateScrollOffset([10, 250]);
    expect(storage.getItem('ordersscrollState')).toBe('[10,250]');
  });

  it('restores the offset from the storage on construction', () => {
    vi.stubGlobal('localStorage', memoryStorage({ 'ordersscrollState': '[7,99]' }));
    expect(new StoreStateScrollPosService(() => 'orders').getScrollOffset()).toEqual([7, 99]);
  });

  it('starts at [0, 0] when the stored value is invalid JSON', () => {
    vi.stubGlobal('localStorage', memoryStorage({ 'ordersscrollState': '{broken' }));
    expect(new StoreStateScrollPosService(() => 'orders').getScrollOffset()).toEqual([0, 0]);
  });

  it('does not persist without a key function or with an empty key', () => {
    const storage = memoryStorage();
    vi.stubGlobal('localStorage', storage);
    new StoreStateScrollPosService(undefined).updateScrollOffset([1, 1]);
    new StoreStateScrollPosService(() => '').updateScrollOffset([2, 2]);
    expect(storage.length).toBe(0);
  });

  it('keeps working when the storage throws (private mode, quota)', () => {
    vi.stubGlobal('localStorage', throwingStorage());
    const service = new StoreStateScrollPosService(() => 'tbl');
    expect(() => service.updateScrollOffset([3, 4])).not.toThrow();
    expect(service.getScrollOffset()).toEqual([3, 4]);
  });

  it('autoConvertMapToObject turns a Map into a plain object and anything else into {}', () => {
    const service = new StoreStateScrollPosService(undefined);
    expect(service.autoConvertMapToObject(new Map<string, unknown>([['a', 1], ['b', [2]]]))).toEqual({ a: 1, b: [2] });
    expect(service.autoConvertMapToObject([1, 2])).toEqual({});
    expect(service.autoConvertMapToObject(null)).toEqual({});
  });
});
