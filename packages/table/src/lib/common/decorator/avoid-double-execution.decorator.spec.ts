// The decorator is applied manually to a property descriptor (no decorator syntax needed), Date.now() is mocked.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AvoidDoubleExecution } from '@guiexpert/table';

function decorate<F extends (...args: any[]) => any>(fn: F, delay?: number): (...args: Parameters<F>) => ReturnType<F> | undefined {
  const descriptor: PropertyDescriptor = { value: fn, writable: true, configurable: true };
  const decorator = delay === undefined ? AvoidDoubleExecution() : AvoidDoubleExecution(delay);
  return decorator({}, 'method', descriptor).value;
}

let now = 0;

function mockNow(start: number) {
  now = start;
  vi.spyOn(Date, 'now').mockImplementation(() => now);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('AvoidDoubleExecution', () => {

  it('returns the same descriptor with a wrapped method', () => {
    const original = () => 1;
    const descriptor: PropertyDescriptor = { value: original };
    const result = AvoidDoubleExecution(100)({}, 'm', descriptor);
    expect(result).toBe(descriptor);
    expect(result.value).not.toBe(original);
  });

  it('executes the first call and returns its result', () => {
    mockNow(1_000_000);
    const fn = vi.fn((x: number) => x * 2);
    expect(decorate(fn, 100)(21)).toBe(42);
    expect(fn).toHaveBeenCalledWith(21);
  });

  it('skips calls within the delay and returns undefined for them', () => {
    mockNow(1_000_000);
    const fn = vi.fn(() => 'ok');
    const m = decorate(fn, 100);
    expect(m()).toBe('ok');
    now += 50;
    expect(m()).toBeUndefined();
    now += 49; // 99 ms after the first call
    expect(m()).toBeUndefined();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('executes again once the delay has passed (measured from the last EXECUTED call)', () => {
    mockNow(1_000_000);
    const fn = vi.fn();
    const m = decorate(fn, 100);
    m();
    now += 60;
    m(); // skipped, does not extend the delay
    now += 40; // exactly 100 ms after the first call
    m();
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('uses a delay of 500 ms by default', () => {
    mockNow(1_000_000);
    const fn = vi.fn();
    const m = decorate(fn);
    m();
    now += 499;
    m();
    expect(fn).toHaveBeenCalledTimes(1);
    now += 1;
    m();
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('passes `this` and the arguments to the original method', () => {
    mockNow(1_000_000);
    class Counter {
      total = 0;

      add(n: number) {
        this.total += n;
        return this.total;
      }
    }
    const descriptor = Object.getOwnPropertyDescriptor(Counter.prototype, 'add')!;
    Object.defineProperty(Counter.prototype, 'add', AvoidDoubleExecution(100)(Counter.prototype, 'add', descriptor));
    const c = new Counter();
    expect(c.add(5)).toBe(5);
    expect(c.total).toBe(5);
  });

  it('shares the delay between all instances of a class', () => {
    // NOTE: the timestamp lives in the decorator closure (per method, not per instance) –
    // a click on table A blocks the same method on table B for the delay.
    mockNow(1_000_000);
    class Button {
      clicks = 0;

      click() {
        this.clicks++;
      }
    }
    const descriptor = Object.getOwnPropertyDescriptor(Button.prototype, 'click')!;
    Object.defineProperty(Button.prototype, 'click', AvoidDoubleExecution(100)(Button.prototype, 'click', descriptor));
    const a = new Button();
    const b = new Button();
    a.click();
    now += 10;
    b.click();
    expect(a.clicks).toBe(1);
    expect(b.clicks).toBe(0);
  });
});
