// Keyboard handling end to end in a real browser: real key presses (userEvent → Chromium) on the focused table host
// → ShortcutService → TableScope / SelectionService → focus, selection, clipboard, editor.
// Regression for the bug "every key triggers START_EDITING" (shortcut.service.ts findEntity) and the arrow-key names.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import {
  ColumnDef,
  EventAdapter,
  FocusModel,
  InputCellRenderer,
  SelectionModel,
  TableFactory,
  TrueFn,
} from '@guiexpert/table';
import { createRows, destroyAllTables, mountTable, nextFrame } from '../../../test-utils/mount-table';

afterEach(destroyAllTables);

async function mountKeyboardTable(rowCount = 1000) {
  const fm = new FocusModel('cell');
  const sm = new SelectionModel('range', 'multi');
  const listener = new EventAdapter();
  const onFocusChanged = vi.spyOn(listener, 'onFocusChanged');
  const columnDefs = [
    ColumnDef.create({ property: 'id', headerLabel: 'Id' }),
    ColumnDef.create({ property: 'name', headerLabel: 'Name', editable: TrueFn }),
    ColumnDef.create({ property: 'value', headerLabel: 'Value' }),
  ];
  const model = TableFactory.createTableModel({ rows: createRows(rowCount), columnDefs });
  const table = mountTable(model, {
    eventListener: listener,
    tableOptions: {
      getFocusModel: () => fm,
      getSelectionModel: () => sm,
      getEditRenderer: () => new InputCellRenderer(),
    },
  });
  await nextFrame();
  table.host.focus();
  return { ...table, fm, sm, onFocusChanged };
}

describe('keyboard (real key presses in Chromium)', () => {

  it('the table host gets the keyboard focus', async () => {
    const { host } = await mountKeyboardTable();
    expect(document.activeElement).toBe(host);
  });

  it('arrow keys move the focused cell and fire onFocusChanged once per move', async () => {
    const { fm, onFocusChanged } = await mountKeyboardTable();
    fm.setFocus(0, 0);
    onFocusChanged.mockClear();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowRight}');
    expect(fm.getFocus()).toEqual([2, 1]);
    await userEvent.keyboard('{ArrowUp}{ArrowLeft}');
    expect(fm.getFocus()).toEqual([1, 0]);
    expect(onFocusChanged).toHaveBeenCalledTimes(5);
  });

  it('arrow keys stop at the first/last row and column', async () => {
    const { fm, onFocusChanged } = await mountKeyboardTable(3);
    fm.setFocus(0, 0);
    onFocusChanged.mockClear();
    await userEvent.keyboard('{ArrowUp}{ArrowLeft}');
    expect(fm.getFocus()).toEqual([0, 0]);
    expect(onFocusChanged).not.toHaveBeenCalled();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}{ArrowRight}{ArrowRight}{ArrowRight}');
    expect(fm.getFocus()).toEqual([2, 2]);
  });

  it('the first arrow key without a focused cell focuses the first cell', async () => {
    const { fm } = await mountKeyboardTable();
    expect(fm.getFocus()).toEqual([-1, -1]);
    await userEvent.keyboard('{ArrowDown}');
    expect(fm.getFocus()).toEqual([0, 0]);
  });

  it('scrolls the focused row into view', async () => {
    const { fm, api } = await mountKeyboardTable();
    fm.setFocus(0, 0);
    for (let i = 0; i < 30; i++) {
      await userEvent.keyboard('{ArrowDown}');
    }
    await nextFrame();
    expect(fm.getFocus()).toEqual([30, 0]);
    expect(api.getFirstVisibleRowIndex()).toBeGreaterThan(0);
    expect(api.getLastFullVisibleRowIndex()).toBeGreaterThanOrEqual(30);
  });

  it('Ctrl+A selects all, Ctrl+Shift+A deselects all', async () => {
    const { sm } = await mountKeyboardTable();
    await userEvent.keyboard('{Control>}a{/Control}');
    expect(sm.isAllSelected()).toBe(true);
    await userEvent.keyboard('{Control>}{Shift>}a{/Shift}{/Control}');
    expect(sm.isAllSelected()).toBe(false);
  });

  it('Space toggles the selection of the focused cell', async () => {
    const { fm, sm } = await mountKeyboardTable();
    fm.setFocus(4, 1);
    await userEvent.keyboard(' ');
    expect(sm.isSelected(4, 1)).toBe(true);
  });

  it('Ctrl+C copies the focused cell', async () => {
    const { fm, scope } = await mountKeyboardTable();
    const copyContent = vi.spyOn(scope.copyService, 'copyContent').mockResolvedValue(undefined);
    fm.setFocus(7, 1);
    await userEvent.keyboard('{Control>}c{/Control}');
    await vi.waitFor(() => expect(copyContent).toHaveBeenCalledWith('Name 7'));
  });

  it('F2 opens the cell editor of an editable focused cell', async () => {
    const { fm, scope, host } = await mountKeyboardTable();
    fm.setFocus(3, 1);
    await userEvent.keyboard('{F2}');
    expect(scope.isEditing()).toBe(true);
    expect(host.querySelector('input.ge-table-cell-editor-input')).not.toBeNull();
  });

  it('F2 on a non-editable cell opens no editor', async () => {
    const { fm, scope } = await mountKeyboardTable();
    fm.setFocus(3, 0);
    await userEvent.keyboard('{F2}');
    expect(scope.isEditing()).toBe(false);
  });

  // the bug: every key triggered START_EDITING (and was swallowed with preventDefault)
  it('a plain letter triggers no action, opens no editor and is not swallowed', async () => {
    const { fm, scope, host } = await mountKeyboardTable();
    fm.setFocus(3, 1);
    const onAction = vi.spyOn(scope, 'onActionTriggered');
    let defaultPrevented: boolean | undefined;
    host.addEventListener('keydown', e => { defaultPrevented = e.defaultPrevented; });
    await userEvent.keyboard('x');
    expect(onAction).not.toHaveBeenCalled();
    expect(scope.isEditing()).toBe(false);
    expect(defaultPrevented).toBe(false);
  });

  it('Tab is not swallowed – the keyboard focus can leave the table', async () => {
    const { host } = await mountKeyboardTable();
    const after = document.createElement('button');
    document.body.appendChild(after);
    try {
      await userEvent.keyboard('{Tab}');
      expect(document.activeElement).not.toBe(host);
    } finally {
      after.remove();
    }
  });
});
