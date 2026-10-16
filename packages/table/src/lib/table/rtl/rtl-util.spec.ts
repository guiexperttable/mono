import { describe, expect, it } from 'vitest';
import {
  canScrollHorizontally,
  getLogicalScrollLeft,
  mirrorArrowKeys,
  resolveTableDirection,
  setLogicalScrollLeft,
  toLogicalX,
  toPhysicalScrollLeft,
} from '@guiexpert/table';

describe('resolveTableDirection', () => {
  it('"rtl" and "ltr" as given, missing = "ltr"', () => {
    expect(resolveTableDirection('rtl')).toBe('rtl');
    expect(resolveTableDirection('ltr')).toBe('ltr');
    expect(resolveTableDirection(undefined)).toBe('ltr');
  });

  it('"auto" without a host = "ltr"', () => {
    expect(resolveTableDirection('auto')).toBe('ltr');
  });

  it('"auto" on a detached host: the nearest dir attribute', () => {
    const rtlParent = { isConnected: false, closest: () => ({ getAttribute: () => 'RTL' }) } as unknown as HTMLElement;
    const noDir = { isConnected: false, closest: () => null } as unknown as HTMLElement;
    expect(resolveTableDirection('auto', rtlParent)).toBe('rtl');
    expect(resolveTableDirection('auto', noDir)).toBe('ltr');
  });
});

describe('logical scrollLeft', () => {
  it('ltr: scrollLeft as is', () => {
    const el = { scrollLeft: 120 };
    expect(getLogicalScrollLeft(el, false)).toBe(120);
    setLogicalScrollLeft(el, 30, false);
    expect(el.scrollLeft).toBe(30);
  });

  it('rtl: 0 at the right start, negative to the left (CSSOM View)', () => {
    const el = { scrollLeft: -120 };
    expect(getLogicalScrollLeft(el, true)).toBe(120);
    setLogicalScrollLeft(el, 30, true);
    expect(el.scrollLeft).toBe(-30);
    el.scrollLeft = 0;
    expect(getLogicalScrollLeft(el, true)).toBe(0);
    el.scrollLeft = 5; // never seen in spec-conform browsers: clamped
    expect(getLogicalScrollLeft(el, true)).toBe(0);
  });

  it('toPhysicalScrollLeft', () => {
    expect(toPhysicalScrollLeft(200, false)).toBe(200);
    expect(toPhysicalScrollLeft(200, true)).toBe(-200);
    expect(Object.is(toPhysicalScrollLeft(0, true), 0)).toBe(true); // no -0
  });
});

describe('canScrollHorizontally', () => {
  const box = (scrollLeft: number) => ({ scrollLeft, scrollWidth: 500, clientWidth: 200 });

  it('ltr', () => {
    expect(canScrollHorizontally(box(0), 10, false)).toBe(true);
    expect(canScrollHorizontally(box(0), -10, false)).toBe(false);
    expect(canScrollHorizontally(box(300), 10, false)).toBe(false);
    expect(canScrollHorizontally(box(300), -10, false)).toBe(true);
  });

  it('rtl: at the right start it can only scroll to the left', () => {
    expect(canScrollHorizontally(box(0), 10, true)).toBe(false);
    expect(canScrollHorizontally(box(0), -10, true)).toBe(true);
    expect(canScrollHorizontally(box(-300), -10, true)).toBe(false);
    expect(canScrollHorizontally(box(-300), 10, true)).toBe(true);
  });

  it('nothing to scroll, no delta', () => {
    expect(canScrollHorizontally({ scrollLeft: 0, scrollWidth: 200, clientWidth: 200 }, 10, false)).toBe(false);
    expect(canScrollHorizontally(box(100), 0, false)).toBe(false);
  });
});

describe('toLogicalX', () => {
  it('ltr: from the left edge, rtl: from the right edge', () => {
    expect(toLogicalX(150, 100, 400, false)).toBe(50);
    expect(toLogicalX(450, 100, 400, true)).toBe(50);
    expect(toLogicalX(500, 100, 400, true)).toBe(0);
  });
});

describe('mirrorArrowKeys', () => {
  it('swaps only the arrow keys', () => {
    expect(mirrorArrowKeys('left')).toBe('right');
    expect(mirrorArrowKeys('right')).toBe('left');
    expect(mirrorArrowKeys('cmd left')).toBe('cmd right');
    expect(mirrorArrowKeys('ctrl alt up')).toBe('ctrl alt up');
    expect(mirrorArrowKeys('ctrl c')).toBe('ctrl c');
  });
});
