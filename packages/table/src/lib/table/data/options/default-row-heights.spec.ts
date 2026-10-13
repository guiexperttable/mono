import { describe, it, expect } from 'vitest';
import { DefaultRowHeights } from '@guiexpert/table';

describe('DefaultRowHeights', () => {
  it('defaults to 34px for header, body and footer', () => {
    expect(new DefaultRowHeights()).toEqual({ header: 34, body: 34, footer: 34 });
  });

  it('stores header, body and footer height in this order', () => {
    expect(new DefaultRowHeights(40, 30, 36)).toEqual({ header: 40, body: 30, footer: 36 });
  });
});
