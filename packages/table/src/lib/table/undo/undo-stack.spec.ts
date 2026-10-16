import { describe, expect, it } from 'vitest';
import { UndoOptions, UndoStack, undoShortcutLayer } from '@guiexpert/table';

const step = (label: string, cellCount = 1) => ({ label, cellCount });

describe('UndoStack', () => {

  it('push, undo, redo; a new step clears redo', () => {
    const s = new UndoStack<ReturnType<typeof step>>(10, 100);
    expect(s.canUndo()).toBe(false);
    expect(s.undo()).toBeUndefined();
    expect(s.redo()).toBeUndefined();
    s.push(step('a', 2));
    s.push(step('b', 3));
    expect([s.size(), s.cellCount(), s.peekUndo()?.label]).toEqual([2, 5, 'b']);
    expect(s.undo()?.label).toBe('b');
    expect([s.canUndo(), s.canRedo(), s.peekRedo()?.label]).toEqual([true, true, 'b']);
    expect(s.redo()?.label).toBe('b');
    s.undo();
    s.push(step('c'));
    expect([s.canRedo(), s.cellCount()]).toEqual([false, 3]);
  });

  it('U12: maxSteps drops the oldest', () => {
    const s = new UndoStack<ReturnType<typeof step>>(100, 1_000_000);
    for (let i = 0; i < 101; i++) s.push(step(`s${i}`));
    expect(s.size()).toBe(100);
    let last: string | undefined;
    while (s.canUndo()) last = s.undo()?.label;
    expect(last).toBe('s1');
  });

  it('maxCells drops the oldest; a too large step empties the history', () => {
    const s = new UndoStack<ReturnType<typeof step>>(10, 10);
    s.push(step('a', 6));
    s.push(step('b', 6));
    expect([s.size(), s.peekUndo()?.label, s.cellCount()]).toEqual([1, 'b', 6]);
    expect(s.push(step('huge', 11))).toBe(false);
    expect([s.canUndo(), s.canRedo(), s.cellCount()]).toEqual([false, false, 0]);
    expect(new UndoStack(0, 10).push(step('x'))).toBe(false);
  });

  it('clear', () => {
    const s = new UndoStack<ReturnType<typeof step>>(10, 10);
    s.push(step('a'));
    s.undo();
    s.clear();
    expect([s.canUndo(), s.canRedo()]).toEqual([false, false]);
  });
});

describe('UndoOptions and keys', () => {
  it('create', () => {
    expect(UndoOptions.create()).toBeUndefined();
    expect(UndoOptions.create(true)).toMatchObject({ maxSteps: 100, maxCells: 1_000_000, onConflict: 'skip', recordApiChanges: false });
    expect(UndoOptions.create({ maxSteps: 3, onConflict: undefined })).toMatchObject({ maxSteps: 3, onConflict: 'skip' });
  });
  it('U4 keys: Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z, ⌘+Z / ⌘+Shift+Z', () => {
    expect(undoShortcutLayer(false)).toEqual({ 'ctrl+z': 'UNDO', 'ctrl+y': 'REDO', 'ctrl+shift+z': 'REDO' });
    expect(undoShortcutLayer(true)).toEqual({ 'meta+z': 'UNDO', 'meta+shift+z': 'REDO' });
  });
});
