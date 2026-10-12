import { afterEach, describe, it, expect, vi } from 'vitest';
import { AutoRestoreOptions } from '@guiexpert/table';
import type { AutoRestoreOptionsIf } from '@guiexpert/table';

interface Order {
  id?: number | null;
  uuid?: string;
  name?: string;
  self?: unknown;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('AutoRestoreOptions', () => {

  describe('defaults', () => {
    const options = new AutoRestoreOptions<Order>();

    it('switches every restore flag off', () => {
      expect(options.autoRestoreSortingState).toBe(false);
      expect(options.autoRestoreCollapsedExpandedState).toBe(false);
      expect(options.autoRestoreScrollPosition).toBe(false);
      expect(options.autoRestoreCheckedState).toBe(false);
      expect(options.autoRestoreSelectedState).toBe(false);
    });

    it('has no storage key function', () => {
      // NOTE: AutoRestoreOptionsIf documents a constant fallback key 'autorestoreoptionsif', but without
      // getStorageKeyFn the store-state services persist nothing.
      expect(options.getStorageKeyFn).toBeUndefined();
    });

    it('provides getRowId and isSame functions', () => {
      expect(typeof options.getRowId).toBe('function');
      expect(typeof options.isSame).toBe('function');
    });
  });

  describe('getRowId', () => {
    const { getRowId } = new AutoRestoreOptions<Order>();

    it('uses the "id" property', () => {
      expect(getRowId({ id: 42, uuid: 'u' })).toBe(42);
    });

    it('accepts id 0', () => {
      expect(getRowId({ id: 0, uuid: 'u' })).toBe(0);
    });

    it('falls back to "uuid" when id is missing or null', () => {
      expect(getRowId({ uuid: 'abc' })).toBe('abc');
      expect(getRowId({ id: null, uuid: 'abc' })).toBe('abc');
    });

    it('falls back to the JSON of the row without id/uuid', () => {
      expect(getRowId({ name: 'x' })).toBe('{"name":"x"}');
    });

    it('returns -1 and logs for a row that cannot be serialised', () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const row: Order = { name: 'loop' };
      row.self = row;
      expect(getRowId(row)).toBe(-1);
      expect(error).toHaveBeenCalledTimes(1);
      expect(warn).toHaveBeenCalledTimes(1);
    });

    it('returns -1 and warns for undefined', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      expect(getRowId(undefined as unknown as Order)).toBe(-1);
      expect(warn).toHaveBeenCalledTimes(1);
    });
  });

  describe('isSame', () => {
    it('compares the ids returned by options.getRowId', () => {
      const options = new AutoRestoreOptions<Order>();
      expect(options.isSame({ id: 1, name: 'a' }, { id: 1, name: 'b' }, options)).toBe(true);
      expect(options.isSame({ id: 1 }, { id: 2 }, options)).toBe(false);
    });

    it('uses the getRowId of the passed options, not its own', () => {
      const options = new AutoRestoreOptions<Order>();
      const byName: AutoRestoreOptionsIf<Order> = { ...options, getRowId: (r: Order) => r.name ?? '' };
      expect(options.isSame({ id: 1, name: 'a' }, { id: 2, name: 'a' }, byName)).toBe(true);
    });

    it('is false without getRowId in the options', () => {
      const options = new AutoRestoreOptions<Order>();
      const withoutId: AutoRestoreOptionsIf<Order> = { autoRestoreSortingState: false };
      expect(options.isSame({ id: 1 }, { id: 1 }, withoutId)).toBe(false);
    });

    it('is false when one row is missing', () => {
      const options = new AutoRestoreOptions<Order>();
      expect(options.isSame({ id: 1 }, undefined as unknown as Order, options)).toBe(false);
    });
  });

  describe('spread usage (JSDoc example)', () => {
    it('keeps defaults and functions when spread and overridden', () => {
      const opts: AutoRestoreOptionsIf<Order> = {
        ...new AutoRestoreOptions<Order>(),
        getStorageKeyFn: () => 'orders-table',
        autoRestoreSortingState: true,
      };
      expect(opts.autoRestoreSortingState).toBe(true);
      expect(opts.autoRestoreScrollPosition).toBe(false);
      expect(opts.getStorageKeyFn?.()).toBe('orders-table');
      expect(opts.getRowId?.({ id: 7 })).toBe(7);
    });
  });
});
