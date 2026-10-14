import { describe, expect, it, vi } from 'vitest';
import { LiveAnnouncer } from '@guiexpert/table';
import type { DomServiceIf } from '@guiexpert/table';

const domService = {} as DomServiceIf; // never used without a document

describe('LiveAnnouncer (without a document, e.g. server side rendering)', () => {

  it('does nothing and creates nothing', () => {
    vi.useFakeTimers();
    const announcer = new LiveAnnouncer(undefined, 'ge-t1-live', domService);
    announcer.announce('Sorted');
    vi.runAllTimers();
    expect(announcer.getElement()).toBeUndefined();
    announcer.destroy(); // harmless
  });

  it('a document without body: no element', () => {
    const announcer = new LiveAnnouncer({ body: null } as unknown as Document, 'x', domService);
    expect(announcer.getElement()).toBeUndefined();
  });
});
