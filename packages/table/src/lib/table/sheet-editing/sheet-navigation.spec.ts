import { describe, expect, it } from 'vitest';
import { EditingOptions, editingShortcutLayer, findDataEdge } from '@guiexpert/table';

/** A column of values; '' / null / undefined are empty. */
function edge(values: unknown[], start: number, dir: 1 | -1): number {
  const isEmpty = (r: number) => values[r] === '' || values[r] === null || values[r] === undefined;
  return findDataEdge((r, _c) => isEmpty(r), values.length, 1, start, 0, dir, 0)[0];
}

describe('findDataEdge (Ctrl+arrow, Excel rule)', () => {

  const col = [1, 2, '', '', 5, 6, 7, '', 9];

  it('inside a block: to its last filled cell', () => {
    expect(edge(col, 0, 1)).toBe(1);
    expect(edge(col, 4, 1)).toBe(6);
    expect(edge(col, 6, -1)).toBe(4);
  });

  it('at the edge of a block: to the next filled cell', () => {
    expect(edge(col, 1, 1)).toBe(4);
    expect(edge(col, 6, 1)).toBe(8);
    expect(edge(col, 4, -1)).toBe(1);
  });

  it('from an empty cell: to the next filled cell, otherwise to the last cell', () => {
    expect(edge(col, 2, 1)).toBe(4);
    expect(edge(['', '', ''], 0, 1)).toBe(2);
    expect(edge([1, '', ''], 0, 1)).toBe(2);
  });

  it('at the border: stays', () => {
    expect(edge(col, 8, 1)).toBe(8);
    expect(edge(col, 0, -1)).toBe(0);
  });

  it('0 and false are not empty', () => {
    expect(edge([0, false, 0, ''], 0, 1)).toBe(2);
  });

  it('skips hidden columns horizontally', () => {
    const row = ['a', 'b', 'HIDDEN', 'd', ''];
    const isEmpty = (_r: number, c: number) => row[c] === '';
    const shown = (c: number) => c !== 2;
    expect(findDataEdge(isEmpty, 1, 5, 0, 0, 0, 1, shown)).toEqual([0, 3]);
    expect(findDataEdge(isEmpty, 1, 5, 0, 3, 0, -1, shown)).toEqual([0, 0]);
  });
});

describe('EditingOptions', () => {

  it('false/undefined = off, true = defaults, an object overrides single values', () => {
    expect(EditingOptions.create(undefined)).toBeUndefined();
    expect(EditingOptions.create(false)).toBeUndefined();
    expect(EditingOptions.create(true)).toMatchObject({
      startOnType: true, enterKey: 'edit', enterMoves: 'down', tabMoves: true, arrowKeysCommit: true,
      textSelection: 'all', clearKeys: true, ctrlEnterFillsSelection: true, collapseSelectionOnNavigate: true,
      emptyValue: '', defaultEditable: false, maxClearCells: 1_000_000,
    });
    expect(EditingOptions.create({ enterKey: 'moveDown', emptyValue: undefined })).toMatchObject({ enterKey: 'moveDown', emptyValue: '' });
  });
});

describe('editingShortcutLayer', () => {

  it('Windows: Ctrl+arrows to the data edge; macOS: ⌘+arrows (⌃+arrows belong to macOS Spaces)', () => {
    expect(editingShortcutLayer(false)['ctrl+arrowdown']).toBe('NAVIGATE_DATA_EDGE_DOWN');
    expect(editingShortcutLayer(false)['meta+arrowdown']).toBeUndefined();
    expect(editingShortcutLayer(true)['meta+arrowdown']).toBe('NAVIGATE_DATA_EDGE_DOWN');
    expect(editingShortcutLayer(true)['meta+shift+arrowleft']).toBe('EXTEND_TO_DATA_EDGE_LEFT');
    expect(editingShortcutLayer(true)['ctrl+arrowdown']).toBeUndefined();
  });

  it('Tab, Shift+arrows, Shift/Ctrl+Space, Delete, Backspace', () => {
    expect(editingShortcutLayer(false)).toMatchObject({
      'tab': 'NAVIGATE_NEXT_CELL', 'shift+tab': 'NAVIGATE_PREVIOUS_CELL', 'shift+arrowup': 'EXTEND_SELECTION_UP',
      'shift+space': 'SELECT_ROW', 'ctrl+space': 'SELECT_COLUMN', 'delete': 'CLEAR_CELLS', 'backspace': 'CLEAR_AND_EDIT',
    });
  });
});
