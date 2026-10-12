import { describe, it, expect } from 'vitest';
import * as api from '@guiexpert/table';
import { Size, px0, px100, px500 } from '@guiexpert/table';

const expectedPx = [
  0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200,
  210, 220, 230, 240, 250, 260, 270, 280, 290, 300, 400, 500,
];

describe('px constants (sizes.ts)', () => {

  it.each(expectedPx)('px%i is a Size of %i px', (value) => {
    const size = (api as unknown as Record<string, unknown>)[`px${value}`];
    expect(size).toBeInstanceOf(Size);
    expect(size).toEqual(new Size(value, 'px'));
  });

  it('exports exactly these px constants', () => {
    const names = Object.keys(api).filter(k => /^px\d+$/.test(k)).sort();
    expect(names).toEqual(expectedPx.map(v => `px${v}`).sort());
  });

  it('are shared instances (mutating one affects every user)', () => {
    // NOTE: the constants are mutable singletons – `px100.value = 120` would change every column using px100.
    expect(px100).toBe(api.px100);
    expect(Object.isFrozen(px100)).toBe(false);
  });

  it('cover the range from px0 to px500', () => {
    expect(px0.value).toBe(0);
    expect(px500.value).toBe(500);
  });
});
