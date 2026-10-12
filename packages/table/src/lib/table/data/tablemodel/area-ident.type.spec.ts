import { describe, it, expect } from 'vitest';
import { getAreaIdentByString } from '@guiexpert/table';

describe('getAreaIdentByString', () => {
  it('maps "header", "body" and "footer"', () => {
    expect(getAreaIdentByString('header')).toBe('header');
    expect(getAreaIdentByString('body')).toBe('body');
    expect(getAreaIdentByString('footer')).toBe('footer');
  });

  it('falls back to "body" for null and unknown strings', () => {
    expect(getAreaIdentByString(null)).toBe('body');
    expect(getAreaIdentByString('')).toBe('body');
    expect(getAreaIdentByString('Header')).toBe('body');
  });
});
