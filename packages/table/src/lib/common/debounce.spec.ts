// debounce uses window.setTimeout / window.clearTimeout → `window` is stubbed with globalThis, timers are faked.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { debounce } from '@guiexpert/table';

beforeEach(() => {
  vi.stubGlobal('window', globalThis);
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('debounce', () => {

  it('does not call the function immediately', () => {
    const fn = vi.fn();
    debounce(fn, 100)();
    expect(fn).not.toHaveBeenCalled();
  });

  it('calls the function once after the wait time', () => {
    const fn = vi.fn();
    debounce(fn, 100)('a');
    vi.advanceTimersByTime(99);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('a');
  });

  it('collapses a burst of calls into one call with the LAST arguments', () => {
    const fn = vi.fn();
    const d = debounce(fn, 100);
    d(1);
    d(2);
    d(3);
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(3);
  });

  it('restarts the wait time with every call (trailing edge)', () => {
    const fn = vi.fn();
    const d = debounce(fn, 100);
    d();
    vi.advanceTimersByTime(80);
    d();
    vi.advanceTimersByTime(80);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(20);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('calls again for calls after the wait time', () => {
    const fn = vi.fn();
    const d = debounce(fn, 100);
    d('a');
    vi.advanceTimersByTime(100);
    d('b');
    vi.advanceTimersByTime(100);
    expect(fn.mock.calls).toEqual([['a'], ['b']]);
  });

  it('waits 500 ms by default', () => {
    const fn = vi.fn();
    debounce(fn)();
    vi.advanceTimersByTime(499);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('keeps `this` of the (last) call', () => {
    const obj = {
      value: 42,
      seen: 0,
      handler: debounce(function (this: { value: number; seen: number }) {
        this.seen = this.value;
      }, 10),
    };
    obj.handler();
    vi.advanceTimersByTime(10);
    expect(obj.seen).toBe(42);
  });

  it('returns undefined (the result of the function is not available)', () => {
    expect(debounce(() => 1, 10)()).toBeUndefined();
  });

  it('keeps independent timers per debounced function', () => {
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    const d1 = debounce(fn1, 100);
    const d2 = debounce(fn2, 100);
    d1();
    vi.advanceTimersByTime(50);
    d2();
    vi.advanceTimersByTime(50);
    expect(fn1).toHaveBeenCalledTimes(1);
    expect(fn2).not.toHaveBeenCalled();
  });

  it('throws without a global `window` (needs a browser-like environment)', () => {
    // NOTE: uses window.setTimeout instead of globalThis.setTimeout – not usable in Node/SSR/workers.
    vi.unstubAllGlobals();
    const d = debounce(() => undefined, 10);
    expect(() => d()).toThrow(ReferenceError);
  });
});
