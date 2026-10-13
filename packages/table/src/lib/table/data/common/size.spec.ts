import { describe, it, expect } from 'vitest';
import { Size } from '@guiexpert/table';

describe('Size', () => {
  it('defaults to 100 px', () => {
    const size = new Size();
    expect(size.value).toBe(100);
    expect(size.unit).toBe('px');
  });

  it('stores value and unit', () => {
    expect(new Size(37, 'px')).toEqual({ value: 37, unit: 'px' });
    expect(new Size(10, '%')).toEqual({ value: 10, unit: '%' });
    expect(new Size(2, 'weight')).toEqual({ value: 2, unit: 'weight' });
  });

  it('uses px as default unit', () => {
    expect(new Size(42).unit).toBe('px');
  });
});
