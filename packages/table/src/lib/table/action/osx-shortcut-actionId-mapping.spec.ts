import { describe, expect, it } from 'vitest';
import {
  actionIds,
  editingShortcutLayer,
  createHarmonizedShortcutByKeyboardEvent,
  harmonizeShortcut,
  OsxShortcutActionIdMapping,
} from '@guiexpert/table';
import { KEY_EVENTS_BY_MAPPING_KEY, keyEvent } from '../../../../test-utils/key-event';

const ARROW_KEYS = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright'];

describe('OsxShortcutActionIdMapping', () => {
  const mapping = new OsxShortcutActionIdMapping().get();

  it('maps exactly these shortcuts', () => {
    expect(mapping).toEqual({
      'f2': 'START_EDITING',
      'space': 'TOGGLE_SELECTION',
      'ctrl+num_add': 'SELECT_ALL',
      'meta+a': 'SELECT_ALL',
      'ctrl+a': 'SELECT_ALL',
      'meta+x': 'DESELECT_ALL',
      'meta+shift+a': 'DESELECT_ALL',
      'ctrl+shift+a': 'DESELECT_ALL',
      'ctrl+num_subtract': 'DESELECT_ALL',
      'ctrl -': 'DESELECT_ALL',
      'arrowup': 'NAVIGATE_UP',
      'arrowdown': 'NAVIGATE_DOWN',
      'arrowleft': 'NAVIGATE_LEFT',
      'arrowright': 'NAVIGATE_RIGHT',
      'home': 'NAVIGATE_ROW_START',
      'end': 'NAVIGATE_ROW_END',
      'meta+left': 'NAVIGATE_ROW_START',
      'meta+right': 'NAVIGATE_ROW_END',
      'ctrl+home': 'NAVIGATE_FIRST_CELL',
      'ctrl+end': 'NAVIGATE_LAST_CELL',
      'meta+up': 'NAVIGATE_FIRST_CELL',
      'meta+down': 'NAVIGATE_LAST_CELL',
      'pageup': 'NAVIGATE_PAGE_UP',
      'pagedown': 'NAVIGATE_PAGE_DOWN',
      'enter': 'ACTIVATE_CELL',
      'ctrl+alt+up': 'MOVE_ROW_UP',
      'ctrl+alt+down': 'MOVE_ROW_DOWN',
      'meta+d': 'FILL_DOWN',
      'meta+r': 'FILL_RIGHT',
      'meta+c': 'COPY_2_CLIPBOARD',
      'ctrl+c': 'COPY_2_CLIPBOARD',
    });
  });

  it('maps Cmd+C (meta) and Ctrl+C to COPY_2_CLIPBOARD', () => {
    expect(mapping['meta+c']).toBe('COPY_2_CLIPBOARD');
    expect(mapping['ctrl+c']).toBe('COPY_2_CLIPBOARD');
  });

  it('maps Cmd+A to SELECT_ALL and Cmd+Shift+A to DESELECT_ALL', () => {
    expect(mapping['meta+a']).toBe('SELECT_ALL');
    expect(mapping['meta+shift+a']).toBe('DESELECT_ALL');
  });

  it('maps the arrow keys to NAVIGATE_*', () => {
    expect(mapping['arrowup']).toBe('NAVIGATE_UP');
    expect(mapping['arrowdown']).toBe('NAVIGATE_DOWN');
    expect(mapping['arrowleft']).toBe('NAVIGATE_LEFT');
    expect(mapping['arrowright']).toBe('NAVIGATE_RIGHT');
  });

  it('every value is a valid ActionId', () => {
    for (const [key, value] of Object.entries(mapping)) {
      expect(actionIds, key).toContain(value);
    }
  });

  it('covers every ActionId with at least one shortcut – together with the Excel-style editing layer (1.1.99)', () => {
    expect(new Set([...Object.values(mapping), ...Object.values(editingShortcutLayer(true))])).toEqual(new Set(actionIds));
  });

  it('has no "ctrl+x" and no "meta -" shortcut (unlike the Windows mapping)', () => {
    // documents two differences between the built-in mappings
    expect(mapping['ctrl+x']).toBeUndefined();
    expect(mapping['meta -']).toBeUndefined();
  });

  it('returns a new object on every call', () => {
    const m = new OsxShortcutActionIdMapping();
    m.get()['meta+c'] = 'SELECT_ALL';
    expect(m.get()['meta+c']).toBe('COPY_2_CLIPBOARD');
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
