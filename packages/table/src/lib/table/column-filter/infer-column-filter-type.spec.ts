import { describe, expect, it } from 'vitest';
import { inferColumnFilterType } from '@guiexpert/table';

describe('inferColumnFilterType', () => {
  it('detects number, date (Date and ISO string), boolean, and falls back to text', () => {
    expect(inferColumnFilterType([null, undefined, '', 1, 2.5, 0], x => x)).toBe('number');
    expect(inferColumnFilterType([null, new Date(2026, 0, 1), new Date(2026, 5, 1)], x => x)).toBe('date');
    expect(inferColumnFilterType(['2026-01-01', '2026-05-10T12:00:00Z', null], x => x)).toBe('date');
    expect(inferColumnFilterType([true, false, null], x => x)).toBe('boolean');
    expect(inferColumnFilterType(['EMEA', 'APAC'], x => x)).toBe('text');
  });

  it('falls back to text for mixed types or all-blank columns', () => {
    expect(inferColumnFilterType([1, 'two', 3], x => x)).toBe('text');
    expect(inferColumnFilterType([null, undefined, ''], x => x)).toBe('text');
    expect(inferColumnFilterType([], x => x)).toBe('text');
  });

  it('respects sampleSize cap', () => {
    const rows = Array.from({ length: 500 }, (_, i) => (i < 150 ? i : 'text'));
    expect(inferColumnFilterType(rows, x => x, 50)).toBe('number');
  });
});
