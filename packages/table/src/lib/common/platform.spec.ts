import { afterEach, describe, expect, it, vi } from 'vitest';
import { isMacPlatform } from './platform';

describe('isMacPlatform', () => {
  afterEach(() => vi.unstubAllGlobals());

  it.each([
    ['MacIntel', true],
    ['MacPPC', true],
    ['Win32', false],
    ['Linux x86_64', false],
    ['', false],
  ])('navigator.platform %j → %s', (platform, expected) => {
    vi.stubGlobal('navigator', { platform });
    expect(isMacPlatform()).toBe(expected);
  });

  it('without navigator (SSR) or without platform: false', () => {
    vi.stubGlobal('navigator', undefined);
    expect(isMacPlatform()).toBe(false);
    vi.stubGlobal('navigator', {});
    expect(isMacPlatform()).toBe(false);
  });
});
