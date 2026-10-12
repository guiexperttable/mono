import { describe, it, expect, vi } from 'vitest';
import { EventAdapter, EventCheckboxChangedHandler, GeMouseEvent, SelectionModel } from '@guiexpert/table';

describe('EventCheckboxChangedHandler', () => {

  it('is an EventAdapter', () => {
    expect(new EventCheckboxChangedHandler(() => undefined)).toBeInstanceOf(EventAdapter);
  });

  it('forwards onCheckboxChanged() to the callback with the checked rows', () => {
    const callback = vi.fn();
    const handler = new EventCheckboxChangedHandler(callback);
    const rows = [{ id: 1 }, { id: 2 }];
    handler.onCheckboxChanged(rows);
    expect(callback).toHaveBeenCalledExactlyOnceWith(rows);
  });

  it('forwards every call (no debouncing)', () => {
    const callback = vi.fn();
    const handler = new EventCheckboxChangedHandler(callback);
    handler.onCheckboxChanged([]);
    handler.onCheckboxChanged([1]);
    expect(callback.mock.calls).toEqual([[[]], [[1]]]);
  });

  it('installs onCheckboxChanged as own instance property (shadowing the EventAdapter method)', () => {
    const handler = new EventCheckboxChangedHandler(() => undefined);
    expect(Object.prototype.hasOwnProperty.call(handler, 'onCheckboxChanged')).toBe(true);
    // other handlers stay untouched
    expect(new EventAdapter().onCheckboxChanged).toBe(EventAdapter.prototype.onCheckboxChanged);
  });

  it('ignores all other events like an EventAdapter', () => {
    const callback = vi.fn();
    const handler = new EventCheckboxChangedHandler(callback);
    handler.onMouseClicked(new GeMouseEvent());
    handler.onSelectionChanged(new SelectionModel());
    expect(callback).not.toHaveBeenCalled();
  });
});
