import { describe, expect, it } from 'vitest';
import { editInputPipeForNumber } from '@guiexpert/table';
import type { editInputPipe } from '@guiexpert/table';

describe('editInputPipeForNumber', () => {
  const pipe: editInputPipe = editInputPipeForNumber;

  it.each([
    ['42', 42],
    ['3.5', 3.5],
    ['-1', -1],
    ['0', 0],
    [' 7 ', 7],
    ['1e3', 1000],
  ])('converts the input text "%s" to the number %s', (input, expected) => {
    expect(pipe(input, 0, 0)).toBe(expected);
  });

  it('returns "" for empty input', () => {
    expect(pipe('', 0, 0)).toBe('');
    expect(pipe(null, 0, 0)).toBe('');
    expect(pipe(undefined, 0, 0)).toBe('');
  });

  it('returns "" for the number 0', () => {
    // NOTE: falsy check – the number 0 becomes "" while the text "0" becomes 0.
    expect(pipe(0, 0, 0)).toBe('');
  });

  it('returns NaN for text that is not a number (incl. a decimal comma)', () => {
    // NOTE: no validation – "abc" and the German "1,5" become NaN.
    expect(pipe('abc', 0, 0)).toBeNaN();
    expect(pipe('1,5', 0, 0)).toBeNaN();
  });

  it('ignores row and column index', () => {
    expect(pipe('5', 3, 9)).toBe(pipe('5', 0, 0));
  });
});
