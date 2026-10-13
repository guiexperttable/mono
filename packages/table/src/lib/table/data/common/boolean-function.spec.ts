import { describe, it, expect } from 'vitest';
import { FalseFn, TrueFn } from '@guiexpert/table';

describe('TrueFn / FalseFn', () => {
  it('TrueFn always returns true', () => {
    expect(TrueFn()).toBe(true);
  });

  it('FalseFn always returns false', () => {
    expect(FalseFn()).toBe(false);
  });
});
