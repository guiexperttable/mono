// throttle uses window.setTimeout and Date.now() → `window` is stubbed with globalThis, timers and Date are faked.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { throttle } from '@guiexpert/table';

beforeEach(() => {
  vi.stubGlobal('window', globalThis);
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 0, 1, 12, 0, 0));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('throttle', () => {

  it('calls the function immediately on the first call (leading edge)', () => {
    const fn = vi.fn();
    throttle(fn, 100)('a');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('a');
  });

  it('collapses calls within the wait time into one trailing call at the end of the window', () => {
    const fn = vi.fn();
    const t = throttle(fn, 100);
    t(1);
    vi.advanceTimersByTime(20);
    t(2);
    vi.advanceTimersByTime(20);
    t(3);
    expect(fn).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(59);
    expect(fn).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1); // 100 ms after the first call
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('uses the arguments of the FIRST throttled call for the trailing call', () => {
    // NOTE: later calls in the window are dropped completely – the trailing call does not get the latest arguments.
    const fn = vi.fn();
    const t = throttle(fn, 100);
    t(1);
    vi.advanceTimersByTime(10);
    t(2);
    vi.advanceTimersByTime(10);
    t(3);
    vi.advanceTimersByTime(100);
    expect(fn.mock.calls).toEqual([[1], [2]]);
  });

  it('calls immediately again once the wait time has passed', () => {
    const fn = vi.fn();
    const t = throttle(fn, 100);
    t('a');
    vi.advanceTimersByTime(150);
    t('b');
    expect(fn.mock.calls).toEqual([['a'], ['b']]);
  });

  it('limits a steady stream of calls to about one call per wait time', () => {
    const fn = vi.fn();
    const t = throttle(fn, 100);
    for (let i = 0; i < 100; i++) { // 1 s, a call every 10 ms
      t(i);
      vi.advanceTimersByTime(10);
    }
    vi.advanceTimersByTime(100);
    expect(fn.mock.calls.length).toBeGreaterThanOrEqual(10);
    expect(fn.mock.calls.length).toBeLessThanOrEqual(11);
  });

  it('waits 500 ms by default', () => {
    const fn = vi.fn();
    const t = throttle(fn);
    t();
    t();
    vi.advanceTimersByTime(499);
    expect(fn).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('keeps `this`', () => {
    const seen: number[] = [];
    const obj = {
      value: 7,
      handler: throttle(function (this: { value: number }) {
        seen.push(this.value);
      }, 50),
    };
    obj.handler();
    obj.handler();
    vi.advanceTimersByTime(50);
    expect(seen).toEqual([7, 7]);
  });

  it('does not call the function immediately when Date.now() is smaller than the wait time', () => {
    // NOTE: lastCallTime starts at 0 – only relevant for clocks near the epoch (e.g. mocked Date in tests).
    vi.setSystemTime(100);
    const fn = vi.fn();
    throttle(fn, 500)();
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(400);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
