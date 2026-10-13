import { describe, expect, it } from 'vitest';
import { EventAdapter, FocusModel, SelectionModel } from '@guiexpert/table';
import type { EventListenerIf, GeModelChangeEvent, GeMouseEvent, GeScrollEvent } from '@guiexpert/table';

const METHODS = [
  'onCheckboxChanged',
  'onContextmenu',
  'onFocusChanged',
  'onModelChanged',
  'onMouseClicked',
  'onMouseDragging',
  'onMouseDraggingEnd',
  'onMouseMoved',
  'onScroll',
  'onSelectionChanged',
];

describe('EventAdapter', () => {

  it('implements EventListenerIf (compile-time check)', () => {
    const listener: EventListenerIf = new EventAdapter();
    expect(listener).toBeInstanceOf(EventAdapter);
  });

  it('has exactly these event methods', () => {
    const names = Object.getOwnPropertyNames(EventAdapter.prototype).filter(n => n !== 'constructor').sort();
    expect(names).toEqual(METHODS);
  });

  it('every method is a no-op returning undefined', () => {
    const adapter = new EventAdapter();
    const mouse = {} as GeMouseEvent;
    expect(adapter.onCheckboxChanged([1, 2])).toBeUndefined();
    expect(adapter.onContextmenu(mouse)).toBeUndefined();
    expect(adapter.onModelChanged({} as GeModelChangeEvent)).toBeUndefined();
    expect(adapter.onMouseClicked(mouse)).toBeUndefined();
    expect(adapter.onMouseDragging(mouse)).toBeUndefined();
    expect(adapter.onMouseDraggingEnd(mouse)).toBeUndefined();
    expect(adapter.onMouseMoved(mouse)).toBeUndefined();
    expect(adapter.onScroll({} as GeScrollEvent)).toBeUndefined();
    expect(adapter.onSelectionChanged(new SelectionModel())).toBeUndefined();
    expect(adapter.onFocusChanged(new FocusModel())).toBeUndefined();
  });

  it('can be extended to override single events', () => {
    const rows: unknown[][] = [];
    class TreeEvents extends EventAdapter {
      override onCheckboxChanged(evt: unknown[]): void {
        rows.push(evt);
      }
    }
    const listener: EventListenerIf = new TreeEvents();
    listener.onCheckboxChanged?.(['a']);
    listener.onScroll?.({} as GeScrollEvent);
    expect(rows).toEqual([['a']]);
  });
});
