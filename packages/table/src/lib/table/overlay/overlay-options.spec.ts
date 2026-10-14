import { describe, expect, it } from 'vitest';
import { OverlayOptions, TableOptions } from '@guiexpert/table';

describe('OverlayOptions', () => {

  it('has English defaults and the documented behaviour', () => {
    const o = new OverlayOptions();
    expect(o.loadingText).toBe('Loading…');
    expect(o.noRowsText).toBe('No rows to show');
    expect(o.noMatchesText).toBe('No matching rows');
    expect(o.autoNoRows).toBe(true);
    expect(o.blockInteractionWhileLoading).toBe(true);
    expect(o.loadingDelayInMs).toBe(0);
    expect(o.getOverlayElement).toBeUndefined();
  });

  it('TableOptions has no overlayOptions by default (all defaults apply)', () => {
    expect(new TableOptions().overlayOptions).toBeUndefined();
  });

  it('OverlayOptions.create merges a partial object over the defaults', () => {
    const o = OverlayOptions.create({ noRowsText: 'Keine Daten', autoNoRows: false });
    expect(o.noRowsText).toBe('Keine Daten');
    expect(o.autoNoRows).toBe(false);
    expect(o.loadingText).toBe('Loading…');
    expect(OverlayOptions.create(undefined).noMatchesText).toBe('No matching rows');
    // undefined fields (e.g. from a spread of optional values) keep the default
    expect(OverlayOptions.create({ loadingText: undefined }).loadingText).toBe('Loading…');
  });
});
