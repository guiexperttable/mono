import { afterEach, describe, expect, it, vi } from 'vitest';
import { CollapsedExpandedData, StoreStateCollapsedExpandService } from '@guiexpert/table';
import { memoryStorage } from '../../../../test-utils/memory-storage';

const KEY = 'treecollapsedExpandedState';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('StoreStateCollapsedExpandService', () => {

  it('starts in mode "collapsed" without ids and without a stored state', () => {
    const service = new StoreStateCollapsedExpandService(undefined);
    expect(service.collapsedExpandedStateGet()).toEqual(new CollapsedExpandedData('collapsed', [], false, false));
    expect(service.hasStoredState()).toBe(false);
  });

  it('initModeIfEmpty sets the mode while nothing is stored', () => {
    const service = new StoreStateCollapsedExpandService(undefined);
    service.initModeIfEmpty('expanded');
    expect(service.collapsedExpandedStateGet().mode).toBe('expanded');
  });

  it('initModeIfEmpty keeps the mode once an id was stored', () => {
    const service = new StoreStateCollapsedExpandService(undefined);
    service.initModeIfEmpty('expanded');
    service.collapsedStateIdsPush(1);
    service.initModeIfEmpty('collapsed');
    expect(service.collapsedExpandedStateGet().mode).toBe('expanded');
  });

  it('collapsedStateIdsPush adds an id once and resets the "all" flags', () => {
    const service = new StoreStateCollapsedExpandService(undefined);
    service.collapsedStateAll(true);
    service.collapsedStateIdsPush('a');
    service.collapsedStateIdsPush('a');
    service.collapsedStateIdsPush(2);
    const state = service.collapsedExpandedStateGet();
    expect(state.rowIds).toEqual(['a', 2]);
    expect(state.allExpanded).toBe(false);
    expect(state.allCollapsed).toBe(false);
    expect(service.collapsedExpandedStateIncludes('a')).toBe(true);
    expect(service.collapsedExpandedStateIncludes('b')).toBe(false);
    expect(service.hasStoredState()).toBe(true);
  });

  it('collapsedStateIdsRemove removes an id; unknown ids are ignored', () => {
    const service = new StoreStateCollapsedExpandService(undefined);
    service.collapsedStateIdsPush(1);
    service.collapsedStateIdsPush(2);
    service.collapsedStateIdsRemove(1);
    service.collapsedStateIdsRemove(99);
    expect(service.collapsedExpandedStateGet().rowIds).toEqual([2]);
  });

  it('collapsedStateAll(true) = all expanded: no ids, ids then mean the collapsed rows', () => {
    const service = new StoreStateCollapsedExpandService(undefined);
    service.collapsedStateIdsPush(1);
    service.collapsedStateAll(true);
    expect(service.collapsedExpandedStateGet()).toEqual(new CollapsedExpandedData('collapsed', [], false, true));
  });

  it('collapsedStateAll(false) = all collapsed: no ids, ids then mean the expanded rows', () => {
    const service = new StoreStateCollapsedExpandService(undefined);
    service.collapsedStateAll(false);
    expect(service.collapsedExpandedStateGet()).toEqual(new CollapsedExpandedData('expanded', [], true, false));
    expect(service.hasStoredState()).toBe(true);
  });

  it('persists every change as JSON under "<key>collapsedExpandedState"', () => {
    const storage = memoryStorage();
    vi.stubGlobal('localStorage', storage);
    const service = new StoreStateCollapsedExpandService(() => 'tree');
    service.initModeIfEmpty('expanded');
    service.collapsedStateIdsPush(7);
    expect(JSON.parse(storage.getItem(KEY)!)).toEqual({ mode: 'expanded', rowIds: [7], allCollapsed: false, allExpanded: false });
  });

  it('restores the state on construction and reports it as stored', () => {
    vi.stubGlobal('localStorage', memoryStorage({
      [KEY]: JSON.stringify({ mode: 'expanded', rowIds: [3, 'x'], allCollapsed: false, allExpanded: false }),
    }));
    const service = new StoreStateCollapsedExpandService(() => 'tree');
    expect(service.hasStoredState()).toBe(true);
    expect(service.collapsedExpandedStateIncludes('x')).toBe(true);
    // the stored mode wins over the first toggle:
    service.initModeIfEmpty('collapsed');
    expect(service.collapsedExpandedStateGet().mode).toBe('expanded');
  });

  it('has no stored state when the storage has nothing for the key', () => {
    vi.stubGlobal('localStorage', memoryStorage());
    expect(new StoreStateCollapsedExpandService(() => 'tree').hasStoredState()).toBe(false);
  });
});
