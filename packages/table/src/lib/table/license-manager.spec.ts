// LicenseManager is a singleton with state (alreadySet). Every test starts with a fresh instance
// (the private static field is reset), so the tests do not depend on their order.
// `document` is stubbed with a minimal fake (createElement + getElementsByTagName('head')).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LicenseManager } from '@guiexpert/table';

function fakeDocument() {
  const head = { appendChild: vi.fn() };
  const doc = {
    createElement: vi.fn(() => ({ content: '', name: '' })),
    getElementsByTagName: vi.fn((tag: string) => (tag === 'head' ? [head] : [])),
  };
  vi.stubGlobal('document', doc);
  return { doc, head };
}

beforeEach(() => {
  (LicenseManager as unknown as { instance: LicenseManager | undefined }).instance = undefined;
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('LicenseManager', () => {

  it('is a singleton', () => {
    expect(LicenseManager.getInstance()).toBe(LicenseManager.getInstance());
  });

  it('ignores an empty or undefined key (no DOM access)', () => {
    const { doc } = fakeDocument();
    LicenseManager.getInstance().setLicenseKey('');
    LicenseManager.getInstance().setLicenseKey(undefined);
    expect(doc.createElement).not.toHaveBeenCalled();
  });

  it('adds <meta name="guiexperttable" content="license=<key>"> to the head', () => {
    const { doc, head } = fakeDocument();
    LicenseManager.getInstance().setLicenseKey('ABC-123');
    expect(doc.createElement).toHaveBeenCalledWith('meta');
    expect(head.appendChild).toHaveBeenCalledTimes(1);
    expect(head.appendChild).toHaveBeenCalledWith({ content: 'license=ABC-123', name: 'guiexperttable' });
  });

  it('sets the key only once – later keys are ignored', () => {
    const { doc, head } = fakeDocument();
    LicenseManager.getInstance().setLicenseKey('FIRST');
    LicenseManager.getInstance().setLicenseKey('OTHER');
    expect(doc.createElement).toHaveBeenCalledTimes(1);
    expect(head.appendChild).toHaveBeenCalledTimes(1);
    expect(head.appendChild).toHaveBeenCalledWith({ content: 'license=FIRST', name: 'guiexperttable' });
  });

  it('an empty key does not block a later real key', () => {
    const { head } = fakeDocument();
    LicenseManager.getInstance().setLicenseKey('');
    LicenseManager.getInstance().setLicenseKey('LATER');
    expect(head.appendChild).toHaveBeenCalledWith({ content: 'license=LATER', name: 'guiexperttable' });
  });
});
