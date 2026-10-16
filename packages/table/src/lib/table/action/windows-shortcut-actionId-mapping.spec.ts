import { describe, expect, it } from 'vitest';
import {
  actionIds,
  createHarmonizedShortcutByKeyboardEvent,
  harmonizeShortcut,
  WindowsShortcutActionIdMapping,
} from '@guiexpert/table';
import { KEY_EVENTS_BY_MAPPING_KEY, keyEvent } from '../../../../test-utils/key-event';

const ARROW_KEYS = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright'];

describe('WindowsShortcutActionIdMapping', () => {
  const mapping = new WindowsShortcutActionIdMapping().get();

  it('maps exactly these shortcuts', () => {
    expect(mapping).toEqual({
      'f2': 'START_EDITING',
      'space': 'TOGGLE_SELECTION',
      'ctrl+num_add': 'SELECT_ALL',
      'ctrl+a': 'SELECT_ALL',
      'ctrl+shift+a': 'DESELECT_ALL',
      'ctrl+x': 'DESELECT_ALL',
      'ctrl+num_subtract': 'DESELECT_ALL',
      'meta -': 'DESELECT_ALL',
      'arrowup': 'NAVIGATE_UP',
      'arrowdown': 'NAVIGATE_DOWN',
      'arrowleft': 'NAVIGATE_LEFT',
      'arrowright': 'NAVIGATE_RIGHT',
      'home': 'NAVIGATE_ROW_START',
      'end': 'NAVIGATE_ROW_END',
      'ctrl+home': 'NAVIGATE_FIRST_CELL',
      'ctrl+end': 'NAVIGATE_LAST_CELL',
      'pageup': 'NAVIGATE_PAGE_UP',
      'pagedown': 'NAVIGATE_PAGE_DOWN',
      'enter': 'ACTIVATE_CELL',
      'ctrl+alt+up': 'MOVE_ROW_UP',
      'ctrl+alt+down': 'MOVE_ROW_DOWN',
      'meta+c': 'COPY_2_CLIPBOARD',
      'ctrl+c': 'COPY_2_CLIPBOARD',
    });
  });

  it('maps Ctrl+C and Meta+C to COPY_2_CLIPBOARD', () => {
    expect(mapping['ctrl+c']).toBe('COPY_2_CLIPBOARD');
    expect(mapping['meta+c']).toBe('COPY_2_CLIPBOARD');
  });

  it('maps the arrow keys to NAVIGATE_*', () => {
    expect(mapping['arrowup']).toBe('NAVIGATE_UP');
    expect(mapping['arrowdown']).toBe('NAVIGATE_DOWN');
    expect(mapping['arrowleft']).toBe('NAVIGATE_LEFT');
    expect(mapping['arrowright']).toBe('NAVIGATE_RIGHT');
  });

  it('maps Ctrl+X to DESELECT_ALL', () => {
    // NOTE: Ctrl+X is "cut" everywhere else; here it deselects.
    expect(mapping['ctrl+x']).toBe('DESELECT_ALL');
  });

  it('uses "meta -" (not "ctrl -") for DESELECT_ALL', () => {
    // NOTE: the OSX mapping has "ctrl -", the Windows mapping "meta -" (the Windows key) – looks swapped.
    expect(mapping['meta -']).toBe('DESELECT_ALL');
    expect(mapping['ctrl -']).toBeUndefined();
  });

  it('every value is a valid ActionId', () => {
    for (const [key, value] of Object.entries(mapping)) {
      expect(actionIds, key).toContain(value);
    }
  });

  it('covers every ActionId with at least one shortcut', () => {
    expect(new Set(Object.values(mapping))).toEqual(new Set(actionIds));
  });

  it('returns a new object on every call', () => {
    const m = new WindowsShortcutActionIdMapping();
    const a = m.get();
    a['ctrl+c'] = 'SELECT_ALL';
    expect(m.get()['ctrl+c']).toBe('COPY_2_CLIPBOARD');
  });

  it('every non-arrow shortcut matches the harmonized shortcut of its keyboard event', () => {
    for (const key of Object.keys(mapping).filter(k => !ARROW_KEYS.includes(k))) {
      const init = KEY_EVENTS_BY_MAPPING_KEY[key];
      expect(init, `no key event known for "${key}"`).toBeDefined();
      expect(createHarmonizedShortcutByKeyboardEvent(keyEvent(init!)), key).toBe(harmonizeShortcut(key));
    }
  });

  // Regression: the mapping uses "arrowup" …, the keyboard event is harmonized to "up" … – harmonizeShortcut()
  // maps both spellings to the same key (before, the arrow shortcuts could never match).
  it('the arrow shortcuts match the harmonized shortcut of the arrow key events', () => {
    for (const key of ARROW_KEYS) {
      expect(createHarmonizedShortcutByKeyboardEvent(keyEvent(KEY_EVENTS_BY_MAPPING_KEY[key]!)), key)
        .toBe(harmonizeShortcut(key));
    }
  });
});
