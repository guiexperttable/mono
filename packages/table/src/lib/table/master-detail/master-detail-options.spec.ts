import { describe, expect, it } from 'vitest';
import { GeDetailEvent, MasterDetailOptions } from '@guiexpert/table';

describe('MasterDetailOptions', () => {
  it('has the documented defaults', () => {
    const options = MasterDetailOptions.create();
    expect(options.detailHeight).toBe('auto');
    expect(options.estimatedDetailHeight).toBe(200);
    expect(options.maxRenderedDetails).toBe(50);
    expect(options.isMaster).toBeUndefined();
    expect(options.toggleColumn).toBeUndefined();
    expect(options.getRowId).toBeUndefined();
    expect(typeof options.detailRenderer).toBe('function');
    expect((options.detailRenderer as () => unknown)()).toBeUndefined();
  });

  it('given values win, undefined keeps the default', () => {
    const detailRenderer = () => undefined;
    const options = MasterDetailOptions.create({ detailHeight: 120, maxRenderedDetails: undefined, detailRenderer });
    expect(options.detailHeight).toBe(120);
    expect(options.maxRenderedDetails).toBe(50);
    expect(options.detailRenderer).toBe(detailRenderer);
  });
});

describe('GeDetailEvent', () => {
  it('holds row, index, state and source', () => {
    const row = { id: 1 };
    const evt = new GeDetailEvent(row, 3, true, 'keyboard');
    expect([evt.row, evt.rowIndex, evt.expanded, evt.source]).toEqual([row, 3, true, 'keyboard']);
  });
});
