// A plain object shaped like a KeyboardEvent – for unit tests in Node, which has no KeyboardEvent.
//
//   createHarmonizedShortcutByKeyboardEvent(keyEvent({ key: 'c', code: 'KeyC', ctrlKey: true })) // → "ctrl c"
//
// Lives outside src/ on purpose: it must not end up in the npm package.

export type KeyEventInit = Partial<Pick<KeyboardEvent, 'key' | 'code' | 'ctrlKey' | 'altKey' | 'shiftKey' | 'metaKey'>>;

/**
 * The key a user presses for each shortcut string used in the built-in shortcut mappings
 * (WindowsShortcutActionIdMapping / OsxShortcutActionIdMapping), as the browser reports it.
 */
export const KEY_EVENTS_BY_MAPPING_KEY: Record<string, KeyEventInit> = {
  'f2': { key: 'F2', code: 'F2' },
  'space': { key: ' ', code: 'Space' },
  'ctrl+num_add': { key: '+', code: 'NumpadAdd', ctrlKey: true },
  'ctrl+num_subtract': { key: '-', code: 'NumpadSubtract', ctrlKey: true },
  'ctrl+a': { key: 'a', code: 'KeyA', ctrlKey: true },
  'meta+a': { key: 'a', code: 'KeyA', metaKey: true },
  'ctrl+shift+a': { key: 'A', code: 'KeyA', ctrlKey: true, shiftKey: true },
  'meta+shift+a': { key: 'A', code: 'KeyA', metaKey: true, shiftKey: true },
  'ctrl+x': { key: 'x', code: 'KeyX', ctrlKey: true },
  'meta+x': { key: 'x', code: 'KeyX', metaKey: true },
  'ctrl -': { key: '-', code: 'Minus', ctrlKey: true },
  'meta -': { key: '-', code: 'Minus', metaKey: true },
  'ctrl+c': { key: 'c', code: 'KeyC', ctrlKey: true },
  'meta+c': { key: 'c', code: 'KeyC', metaKey: true },
  'arrowup': { key: 'ArrowUp', code: 'ArrowUp' },
  'arrowdown': { key: 'ArrowDown', code: 'ArrowDown' },
  'arrowleft': { key: 'ArrowLeft', code: 'ArrowLeft' },
  'arrowright': { key: 'ArrowRight', code: 'ArrowRight' },
  // since 1.1.91 (grid navigation, prompts/001-aria-screenreader.design.md § 2.8)
  'home': { key: 'Home', code: 'Home' },
  'end': { key: 'End', code: 'End' },
  'ctrl+home': { key: 'Home', code: 'Home', ctrlKey: true },
  'ctrl+end': { key: 'End', code: 'End', ctrlKey: true },
  'meta+left': { key: 'ArrowLeft', code: 'ArrowLeft', metaKey: true },
  'meta+right': { key: 'ArrowRight', code: 'ArrowRight', metaKey: true },
  'meta+up': { key: 'ArrowUp', code: 'ArrowUp', metaKey: true },
  'meta+down': { key: 'ArrowDown', code: 'ArrowDown', metaKey: true },
  'pageup': { key: 'PageUp', code: 'PageUp' },
  'pagedown': { key: 'PageDown', code: 'PageDown' },
  'enter': { key: 'Enter', code: 'Enter' },
  // since 1.1.95 (row drag, keyboard alternative, prompts/009-row-drag.design.md § 2.8)
  'ctrl+alt+up': { key: 'ArrowUp', code: 'ArrowUp', ctrlKey: true, altKey: true },
  'ctrl+alt+down': { key: 'ArrowDown', code: 'ArrowDown', ctrlKey: true, altKey: true },
};

export function keyEvent(init: KeyEventInit): KeyboardEvent {
  return {
    key: '',
    code: '',
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    ...init,
  } as KeyboardEvent;
}
