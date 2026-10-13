import { describe, expect, it } from 'vitest';
import { createHarmonizedShortcutByKeyboardEvent, harmonizeShortcut } from '@guiexpert/table';
import { keyEvent } from '../../../../test-utils/key-event';

describe('harmonizeShortcut', () => {

  it.each([
    ['ctrl+c', 'ctrl c'],
    ['ctrl c', 'ctrl c'],
    ['  ctrl   +   c  ', 'ctrl c'],
    ['c+ctrl', 'ctrl c'],
    ['shift+ctrl+a', 'ctrl shift a'],
    ['shift+alt+ctrl+cmd+x', 'cmd ctrl alt shift x'],
    ['f2', 'f2'],
    ['space', 'space'],
  ])('normalizes "%s" to "%s"', (input, expected) => {
    expect(harmonizeShortcut(input)).toBe(expected);
  });

  it.each([
    ['meta+c', 'cmd c'],
    ['command+c', 'cmd c'],
    ['⌘+c', 'cmd c'],
    ['control+c', 'ctrl c'],
    ['⌃+c', 'ctrl c'],
    ['option+x', 'alt x'],
    ['opt+x', 'alt x'],
    ['⌥+x', 'alt x'],
    ['⇧+x', 'shift x'],
    ['⌫', 'backspace'],
    ['↩', 'enter'],
    ['escape', 'esc'],
    ['ctrl+*', 'ctrl multiply'],
    ['arrowup', 'up'],
    ['arrowdown', 'down'],
    ['arrowleft', 'left'],
    ['shift+arrowright', 'shift right'],
    ['up', 'up'],
  ])('maps the alias "%s" to "%s"', (input, expected) => {
    expect(harmonizeShortcut(input)).toBe(expected);
  });

  it('orders modifiers cmd < ctrl < alt < shift, then the other keys alphabetically', () => {
    expect(harmonizeShortcut('b+shift+a+alt')).toBe('alt shift a b');
  });

  it('removes duplicate tokens', () => {
    expect(harmonizeShortcut('ctrl+ctrl+c+c')).toBe('ctrl c');
    expect(harmonizeShortcut('meta+cmd+c')).toBe('cmd c');
  });

  it('keeps the minus key', () => {
    expect(harmonizeShortcut('ctrl -')).toBe('ctrl -');
    expect(harmonizeShortcut('meta -')).toBe('cmd -');
  });

  it('returns an empty string for an empty or blank shortcut', () => {
    expect(harmonizeShortcut('')).toBe('');
    expect(harmonizeShortcut('   ')).toBe('');
  });

  it('cannot express the plus key: "+" is always a separator', () => {
    // NOTE: "ctrl++" loses the "+" key – there is no alias like "plus".
    expect(harmonizeShortcut('ctrl++')).toBe('ctrl');
  });

  it('does not split symbol modifiers written without separator', () => {
    // NOTE: "⌘c" becomes the single token "cmdc", not "cmd c".
    expect(harmonizeShortcut('⌘c')).toBe('cmdc');
  });

  it('is case-sensitive: upper-case modifiers are not recognized', () => {
    // NOTE: no lower-casing – "Ctrl+C" is not harmonized to "ctrl c".
    expect(harmonizeShortcut('Ctrl+C')).toBe('C Ctrl');
  });
});

describe('createHarmonizedShortcutByKeyboardEvent', () => {

  it('builds "ctrl c" for Ctrl+C', () => {
    expect(createHarmonizedShortcutByKeyboardEvent(keyEvent({ key: 'c', code: 'KeyC', ctrlKey: true }))).toBe('ctrl c');
  });

  it('builds "cmd c" for Meta+C (cmd on macOS)', () => {
    expect(createHarmonizedShortcutByKeyboardEvent(keyEvent({ key: 'c', code: 'KeyC', metaKey: true }))).toBe('cmd c');
  });

  it('lower-cases the key (Shift+A → "shift a")', () => {
    expect(createHarmonizedShortcutByKeyboardEvent(keyEvent({ key: 'A', code: 'KeyA', shiftKey: true }))).toBe('shift a');
  });

  it('returns just the key without modifiers', () => {
    expect(createHarmonizedShortcutByKeyboardEvent(keyEvent({ key: 'x', code: 'KeyX' }))).toBe('x');
  });

  it('orders all four modifiers cmd ctrl alt shift (duplicates from the string building are removed)', () => {
    // NOTE: the modifiers are appended with `shortcut += shortcut + ' alt'`, which duplicates the prefix;
    // only harmonizeShortcut's de-duplication makes the result correct.
    const evt = keyEvent({ key: 'x', code: 'KeyX', ctrlKey: true, altKey: true, shiftKey: true, metaKey: true });
    expect(createHarmonizedShortcutByKeyboardEvent(evt)).toBe('cmd ctrl alt shift x');
  });

  it.each([
    [' ', 'Space', 'space'],
    ['ArrowLeft', 'ArrowLeft', 'left'],
    ['ArrowRight', 'ArrowRight', 'right'],
    ['ArrowUp', 'ArrowUp', 'up'],
    ['ArrowDown', 'ArrowDown', 'down'],
    ['Escape', 'Escape', 'esc'],
    ['Enter', 'Enter', 'enter'],
    ['Delete', 'Delete', 'delete'],
    ['Backspace', 'Backspace', 'backspace'],
    ['Tab', 'Tab', 'tab'],
    ['-', 'Minus', '-'],
    ['*', 'BracketRight', 'multiply'],
  ])('maps key "%s" (code %s) to "%s"', (key, code, expected) => {
    expect(createHarmonizedShortcutByKeyboardEvent(keyEvent({ key, code }))).toBe(expected);
  });

  it.each([
    ['+', 'NumpadAdd', 'num_add'],
    ['-', 'NumpadSubtract', 'num_subtract'],
    ['*', 'NumpadMultiply', 'num_multiply'],
    ['/', 'NumpadDivide', 'num_divide'],
    [',', 'NumpadDecimal', 'num_decimal'],
    ['Enter', 'NumpadEnter', 'num_enter'],
    ['5', 'Numpad5', 'num_5'],
  ])('maps numpad key "%s" (code %s) to "%s"', (key, code, expected) => {
    expect(createHarmonizedShortcutByKeyboardEvent(keyEvent({ key, code }))).toBe(expected);
  });

  it('builds "ctrl num_add" for Ctrl + numpad plus', () => {
    expect(createHarmonizedShortcutByKeyboardEvent(keyEvent({ key: '+', code: 'NumpadAdd', ctrlKey: true }))).toBe('ctrl num_add');
  });

  it('uses the code for function keys (F2 → "f2", F12 → "f12")', () => {
    expect(createHarmonizedShortcutByKeyboardEvent(keyEvent({ key: 'F2', code: 'F2' }))).toBe('f2');
    expect(createHarmonizedShortcutByKeyboardEvent(keyEvent({ key: 'F12', code: 'F12', shiftKey: true }))).toBe('shift f12');
  });

  it('uses the digit of the code for digit keys, independent of the layout/shift (Shift+1 → "shift 1")', () => {
    expect(createHarmonizedShortcutByKeyboardEvent(keyEvent({ key: '!', code: 'Digit1', shiftKey: true }))).toBe('shift 1');
    expect(createHarmonizedShortcutByKeyboardEvent(keyEvent({ key: '0', code: 'Digit0' }))).toBe('0');
  });

  it('returns only the modifier when the modifier key itself is pressed', () => {
    expect(createHarmonizedShortcutByKeyboardEvent(keyEvent({ key: 'Shift', code: 'ShiftLeft', shiftKey: true }))).toBe('shift');
    expect(createHarmonizedShortcutByKeyboardEvent(keyEvent({ key: 'Control', code: 'ControlLeft', ctrlKey: true }))).toBe('ctrl');
  });

  it('loses the "+" key of the main keyboard', () => {
    // NOTE: key "+" is turned into a separator by harmonizeShortcut → empty shortcut (only the numpad "+" works).
    expect(createHarmonizedShortcutByKeyboardEvent(keyEvent({ key: '+', code: 'BracketRight' }))).toBe('');
    expect(createHarmonizedShortcutByKeyboardEvent(keyEvent({ key: '+', code: 'BracketRight', ctrlKey: true }))).toBe('ctrl');
  });
});
