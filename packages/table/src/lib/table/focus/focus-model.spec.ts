import { describe, it, expect, vi } from 'vitest';
import { FocusModel } from '@guiexpert/table';
import type { EventFocusChangedListenerIf } from '@guiexpert/table';

function listenerSpy() {
  const onFocusChanged = vi.fn();
  const listener: EventFocusChangedListenerIf = { onFocusChanged };
  return { listener, onFocusChanged };
}

describe('FocusModel', () => {

  describe('constructor / defaults', () => {
    it('defaults to selectionType "none"', () => {
      expect(new FocusModel().selectionType).toBe('none');
    });

    it('stores the given focus type', () => {
      expect(new FocusModel('row').selectionType).toBe('row');
    });

    it('starts without focus: getFocus() is [-1, -1]', () => {
      const fm = new FocusModel('cell');
      expect(fm.getFocus()).toEqual([-1, -1]);
      expect(fm.hasFocus(0, 0)).toBe(false);
      expect(fm.hasFocus(-1, -1)).toBe(true);
    });

    it('starts unchanged', () => {
      expect(new FocusModel('cell').hasChanged()).toBe(false);
    });
  });

  describe('setFocus / hasFocus / getFocus', () => {
    it('moves the focus to the given cell', () => {
      const fm = new FocusModel('cell');
      fm.setFocus(2, 3);
      expect(fm.getFocus()).toEqual([2, 3]);
      expect(fm.hasFocus(2, 3)).toBe(true);
      expect(fm.hasFocus(2, 4)).toBe(false);
      expect(fm.hasFocus(3, 3)).toBe(false);
    });

    it('returns a new tuple on every getFocus() call', () => {
      const fm = new FocusModel('cell');
      fm.setFocus(1, 1);
      const a = fm.getFocus();
      a[0] = 99;
      expect(fm.getFocus()).toEqual([1, 1]);
    });

    it('compares the column also for focus type "row"', () => {
      // NOTE: selectionType is stored but ignored by the model – "row" focus still is a single cell.
      const fm = new FocusModel('row');
      fm.setFocus(2, 3);
      expect(fm.hasFocus(2, 0)).toBe(false);
    });

    it('accepts a focus even for focus type "none"', () => {
      // NOTE: focus type "none" does not prevent setFocus().
      const fm = new FocusModel('none');
      fm.setFocus(1, 1);
      expect(fm.hasFocus(1, 1)).toBe(true);
    });
  });

  describe('hasChanged / clearChanged', () => {
    it('setFocus() marks the model as changed', () => {
      const fm = new FocusModel('cell');
      fm.setFocus(0, 0);
      expect(fm.hasChanged()).toBe(true);
    });

    it('clearChanged() resets the flag', () => {
      const fm = new FocusModel('cell');
      fm.setFocus(0, 0);
      fm.clearChanged();
      expect(fm.hasChanged()).toBe(false);
    });

    it('setFocus() on the already focused cell does not mark a change', () => {
      const fm = new FocusModel('cell');
      fm.setFocus(1, 1);
      fm.clearChanged();
      fm.setFocus(1, 1);
      expect(fm.hasChanged()).toBe(false);
    });

    it('clear() does not mark a change', () => {
      const fm = new FocusModel('cell');
      fm.setFocus(1, 1);
      fm.clearChanged();
      fm.clear();
      // NOTE: removing the focus is a focus change, but hasChanged() stays false (only setFocus() sets the flag).
      expect(fm.hasChanged()).toBe(false);
    });
  });

  describe('clear', () => {
    it('removes the focus', () => {
      const fm = new FocusModel('cell');
      fm.setFocus(4, 5);
      fm.clear();
      expect(fm.getFocus()).toEqual([-1, -1]);
      expect(fm.hasFocus(4, 5)).toBe(false);
    });

    it('allows to focus the same cell again afterwards (fires again)', () => {
      const fm = new FocusModel('cell');
      const { listener, onFocusChanged } = listenerSpy();
      fm.setFocus(4, 5);
      fm.clear();
      fm.addEventFocusChangedListener(listener);
      fm.setFocus(4, 5);
      expect(onFocusChanged).toHaveBeenCalledTimes(1);
    });
  });

  describe('listeners', () => {
    it('registers a listener only once', () => {
      const fm = new FocusModel('cell');
      const { listener } = listenerSpy();
      fm.addEventFocusChangedListener(listener);
      fm.addEventFocusChangedListener(listener);
      expect(fm.getEventFocusChangedListeners()).toEqual([listener]);
    });

    it('removes a registered listener and ignores unknown ones', () => {
      const fm = new FocusModel('cell');
      const a = listenerSpy();
      const b = listenerSpy();
      fm.addEventFocusChangedListener(a.listener);
      fm.removeEventFocusChangedListener(b.listener);
      expect(fm.getEventFocusChangedListeners()).toEqual([a.listener]);
      fm.removeEventFocusChangedListener(a.listener);
      expect(fm.getEventFocusChangedListeners()).toEqual([]);
    });

    it('setFocus() notifies every listener with the model', () => {
      const fm = new FocusModel('cell');
      const a = listenerSpy();
      const b = listenerSpy();
      fm.addEventFocusChangedListener(a.listener);
      fm.addEventFocusChangedListener(b.listener);
      fm.setFocus(1, 2);
      expect(a.onFocusChanged).toHaveBeenCalledExactlyOnceWith(fm);
      expect(b.onFocusChanged).toHaveBeenCalledExactlyOnceWith(fm);
    });

    it('listeners see the new focus', () => {
      const fm = new FocusModel('cell');
      let seen: [number, number] | undefined;
      fm.addEventFocusChangedListener({ onFocusChanged: m => { seen = m.getFocus(); } });
      fm.setFocus(7, 8);
      expect(seen).toEqual([7, 8]);
    });

    it('setFocus() on the already focused cell does not notify', () => {
      const fm = new FocusModel('cell');
      const { listener, onFocusChanged } = listenerSpy();
      fm.setFocus(1, 2);
      fm.addEventFocusChangedListener(listener);
      fm.setFocus(1, 2);
      expect(onFocusChanged).not.toHaveBeenCalled();
    });

    it('clear() notifies, even when there was no focus', () => {
      const fm = new FocusModel('cell');
      const { listener, onFocusChanged } = listenerSpy();
      fm.addEventFocusChangedListener(listener);
      fm.clear();
      // NOTE: unlike setFocus(), clear() fires without checking whether anything changed.
      expect(onFocusChanged).toHaveBeenCalledTimes(1);
    });

    it('fireChangeEvent() can be called directly', () => {
      const fm = new FocusModel('cell');
      const { listener, onFocusChanged } = listenerSpy();
      fm.addEventFocusChangedListener(listener);
      fm.fireChangeEvent();
      expect(onFocusChanged).toHaveBeenCalledWith(fm);
    });

    it('a removed listener is not called any more', () => {
      const fm = new FocusModel('cell');
      const { listener, onFocusChanged } = listenerSpy();
      fm.addEventFocusChangedListener(listener);
      fm.removeEventFocusChangedListener(listener);
      fm.setFocus(1, 1);
      expect(onFocusChanged).not.toHaveBeenCalled();
    });
  });
});
