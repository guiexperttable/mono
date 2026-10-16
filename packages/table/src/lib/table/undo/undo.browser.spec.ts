// Undo and redo (prompt 013 stage 3): U1–U15.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import {
  CellRange,
  ColumnDef,
  EventAdapter,
  FocusModel,
  SelectionModel,
  TableFactory,
  TrueFn,
  px100,
} from '@guiexpert/table';
import type { GeModelChangeEvent, GeUndoEvent, TableOptionsIf, UndoOptionsIf } from '@guiexpert/table';
import { destroyAllTables, getCellDiv, mountTable, nextFrame } from '../../../../test-utils/mount-table';

afterEach(destroyAllTables);

interface Row { id: number; name: string; qty: number }
const ID = 0, NAME = 1, QTY = 2;

function rowsOf(n = 40): Row[] {
  return Array.from({ length: n }, (_, i) => ({ id: i, name: `N${i}`, qty: i * 10 }));
}

async function mount(opts: { rows?: Row[]; undo?: boolean | Partial<UndoOptionsIf>; tableOptions?: Partial<TableOptionsIf> } = {}) {
  const rows = opts.rows ?? rowsOf();
  const listener = new EventAdapter();
  const changes: GeModelChangeEvent[] = [];
  const undoEvents: GeUndoEvent[] = [];
  listener.onModelChanged = e => changes.push(e);
  listener.onUndoStackChanged = e => undoEvents.push(e);
  const fm = new FocusModel('cell');
  const sm = new SelectionModel('range', 'multi');
  const t = mountTable(TableFactory.createTableModel({
    rows,
    columnDefs: [
      ColumnDef.create({ property: 'id', headerLabel: 'ID', width: px100 }),
      ColumnDef.create({ property: 'name', headerLabel: 'Name', width: px100, editable: TrueFn }),
      ColumnDef.create({ property: 'qty', headerLabel: 'Qty', width: px100, editable: TrueFn }),
    ],
  }), {
    eventListener: listener,
    tableOptions: {
      getFocusModel: () => fm, getSelectionModel: () => sm, editing: true, clipboard: true, fillHandle: true,
      undo: opts.undo ?? true, ...opts.tableOptions,
    },
  });
  await nextFrame();
  t.host.focus();
  const focus = (r: number, c: number) => {
    fm.setFocus(r, c);
    sm.clear();
    t.api.repaint();
    t.host.focus();
  };
  return { ...t, rows, fm, sm, changes, undoEvents, focus };
}

const paste = (host: HTMLElement, text: string) => {
  const dt = new DataTransfer();
  dt.setData('text/plain', text);
  host.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
};

describe('undo and redo', () => {

  it('U1: edit, Ctrl+Z: the old value, focus and selection on the cell, one event "undo", announced', async () => {
    const t = await mount();
    t.focus(3, QTY);
    await userEvent.keyboard('7{Enter}');
    expect(t.rows[3].qty).toBe(7);
    t.focus(10, NAME);
    t.changes.length = 0;
    await userEvent.keyboard('{Control>}z{/Control}');
    expect(t.rows[3].qty).toBe(30);
    expect(t.changes).toHaveLength(1);
    expect(t.changes[0].source).toBe('undo');
    expect(t.fm.getFocus()).toEqual([3, QTY]);
    expect(t.sm.isSelected(3, QTY)).toBe(true);
    expect(document.querySelector('[aria-live]')).not.toBeNull();
  });

  it('U2: a fill over 30 cells is one step', async () => {
    const t = await mount();
    t.api.fillRange(new CellRange(0, QTY, 0, QTY), 'down', 30, 'copy');
    expect(t.rows.slice(1, 31).every(r => r.qty === 0)).toBe(true);
    expect(t.api.undo()).toBe(true);
    expect(t.rows.slice(1, 31).map(r => r.qty)).toEqual(Array.from({ length: 30 }, (_, i) => (i + 1) * 10));
    expect(t.api.canUndo()).toBe(false);
  });

  it('U3: paste, cut and Delete are one step each', async () => {
    const t = await mount();
    t.focus(0, NAME);
    paste(t.host, 'a\nb\nc');
    t.focus(5, NAME);
    t.sm.addSelection(new CellRange(5, NAME, 6, NAME));
    await userEvent.keyboard('{Delete}');
    expect([t.rows[5].name, t.rows[6].name]).toEqual(['', '']);
    expect(t.api.getUndoState()).toMatchObject({ canUndo: true, undoLabel: 'Clear', size: 2 });
    t.api.undo();
    expect([t.rows[5].name, t.rows[6].name]).toEqual(['N5', 'N6']);
    expect(t.api.getUndoState()?.undoLabel).toBe('Paste');
    t.api.undo();
    expect(t.rows.slice(0, 3).map(r => r.name)).toEqual(['N0', 'N1', 'N2']);
    // cut: target and source in one step
    t.focus(0, NAME);
    t.sm.addSelection(new CellRange(0, NAME, 1, NAME));
    const dt = new DataTransfer();
    t.host.dispatchEvent(new ClipboardEvent('cut', { clipboardData: dt, bubbles: true, cancelable: true }));
    t.focus(0, QTY);
    paste(t.host, dt.getData('text/plain'));
    expect([t.rows[0].name, t.rows[0].qty]).toEqual(['', 'N0']);
    t.api.undo();
    expect([t.rows[0].name, t.rows[0].qty, t.rows[1].name, t.rows[1].qty]).toEqual(['N0', 0, 'N1', 10]);
  });

  it('U4: Ctrl+Y and Ctrl+Shift+Z redo (source "redo")', async () => {
    const t = await mount();
    t.api.applyCellChanges([{ rowIndex: 0, column: NAME, value: 'x' }], 'edit');
    t.api.undo();
    t.changes.length = 0;
    await userEvent.keyboard('{Control>}y{/Control}');
    expect(t.rows[0].name).toBe('x');
    expect(t.changes[0].source).toBe('redo');
    await userEvent.keyboard('{Control>}z{/Control}');
    expect(t.rows[0].name).toBe('N0');
    await userEvent.keyboard('{Control>}{Shift>}z{/Shift}{/Control}');
    expect(t.rows[0].name).toBe('x');
    expect(t.api.redo()).toBe(false); // nothing left
  });

  it('U5: a new change after undo clears redo', async () => {
    const t = await mount();
    t.api.applyCellChanges([{ rowIndex: 0, column: NAME, value: 'x' }], 'edit');
    t.api.undo();
    expect(t.api.canRedo()).toBe(true);
    t.api.applyCellChanges([{ rowIndex: 1, column: NAME, value: 'y' }], 'edit');
    expect(t.api.canRedo()).toBe(false);
  });

  it('U6: sorted and filtered in between – the right row; a filtered-out row is set back as well', async () => {
    const t = await mount();
    t.api.applyCellChanges([{ rowIndex: 2, column: NAME, value: 'two' }, { rowIndex: 5, column: NAME, value: 'five' }], 'edit');
    t.api.sortByColumn('id', 'desc');
    t.scope.tableOptions.externalFilterFunction = (r: Row) => r.id !== 5;
    t.api.externalFilterChanged();
    await nextFrame();
    t.changes.length = 0;
    t.api.undo();
    expect([t.rows[2].name, t.rows[5].name]).toEqual(['N2', 'N5']);
    expect(t.changes[0].changes!.map(c => c.rowIndex).sort((a, b) => a - b)).toEqual([-1, 36]);
    expect(t.fm.getFocus()).toEqual([36, NAME]); // only shown cells get the focus
  });

  it('U8: Ctrl+Z in the open editor belongs to the editor', async () => {
    const t = await mount();
    t.api.applyCellChanges([{ rowIndex: 0, column: NAME, value: 'x' }], 'edit');
    t.focus(4, NAME);
    await userEvent.keyboard('abc{Control>}z{/Control}');
    expect(t.api.isEditing()).toBe(true);
    expect(t.rows[0].name).toBe('x');
    expect(t.api.undo()).toBe(false); // not while editing
  });

  it('U9: batch edit – undo takes marked values back; commit and cancel empty the history', async () => {
    const t = await mount({ tableOptions: { batchEdit: true } });
    t.api.applyCellChanges([{ rowIndex: 0, column: NAME, value: 'p1' }], 'edit');
    t.api.applyCellChanges([{ rowIndex: 0, column: NAME, value: 'p2' }, { rowIndex: 1, column: NAME, value: 'q' }], 'edit');
    expect(t.api.getPendingChanges().map(c => c.newValue)).toEqual(['p2', 'q']);
    t.api.undo();
    expect(t.api.getPendingChanges().map(c => c.newValue)).toEqual(['p1']);
    t.api.redo();
    expect(t.api.getPendingChanges().map(c => c.newValue)).toEqual(['p2', 'q']);
    t.api.undo();
    t.api.undo();
    expect(t.api.hasPendingChanges()).toBe(false);
    t.api.redo();
    t.api.commitBatchEdit();
    expect(t.rows[0].name).toBe('p1');
    expect([t.api.canUndo(), t.api.canRedo()]).toEqual([false, false]);
    t.api.applyCellChanges([{ rowIndex: 0, column: NAME, value: 'z' }], 'edit');
    t.api.cancelBatchEdit();
    expect(t.api.canUndo()).toBe(false);
  });

  it('U10: a value changed by something else is skipped (announced) – or overwritten', async () => {
    const t = await mount();
    t.api.applyCellChanges([{ rowIndex: 0, column: NAME, value: 'mine' }, { rowIndex: 1, column: NAME, value: 'mine' }], 'edit');
    t.rows[0].name = 'live';
    t.api.undo();
    expect([t.rows[0].name, t.rows[1].name]).toEqual(['live', 'N1']);
    destroyAllTables();
    const o = await mount({ undo: { onConflict: 'overwrite' } });
    o.api.applyCellChanges([{ rowIndex: 0, column: NAME, value: 'mine' }], 'edit');
    o.rows[0].name = 'live';
    o.api.undo();
    expect(o.rows[0].name).toBe('N0');
  });

  it('U11: setRows (another rows array) empties the history', async () => {
    const t = await mount();
    t.api.applyCellChanges([{ rowIndex: 0, column: NAME, value: 'x' }], 'edit');
    (t.scope.tableModel.getBodyModel() as unknown as { setRows: (r: Row[]) => void }).setRows(rowsOf(5));
    t.api.repaintHard();
    expect(t.api.canUndo()).toBe(false);
    expect(t.api.undo()).toBe(false);
  });

  it('U13: API and the event for buttons', async () => {
    const t = await mount();
    expect(t.api.getUndoState()).toMatchObject({ canUndo: false, canRedo: false, size: 0 });
    t.api.applyCellChanges([{ rowIndex: 0, column: NAME, value: 'x' }], 'paste');
    expect(t.undoEvents.at(-1)).toMatchObject({ canUndo: true, canRedo: false, undoLabel: 'Paste', size: 1 });
    t.api.undo();
    expect(t.undoEvents.at(-1)).toMatchObject({ canUndo: false, canRedo: true, redoLabel: 'Paste' });
    t.api.clearUndoHistory();
    expect(t.undoEvents.at(-1)).toMatchObject({ canUndo: false, canRedo: false });
    const n = t.undoEvents.length;
    t.api.clearUndoHistory(); // nothing changed: no event
    expect(t.undoEvents).toHaveLength(n);
  });

  it('U15: without the option Ctrl+Z does nothing; the API is safe', async () => {
    const t = await mount({ undo: false });
    t.api.applyCellChanges([{ rowIndex: 0, column: NAME, value: 'x' }], 'edit');
    await userEvent.keyboard('{Control>}z{/Control}');
    expect(t.rows[0].name).toBe('x');
    expect([t.api.undo(), t.api.redo(), t.api.canUndo(), t.api.canRedo()]).toEqual([false, false, false, false]);
    expect(t.api.getUndoState()).toBeUndefined();
    t.api.clearUndoHistory();
    expect(t.api.batchUndoable('x', () => 42)).toBe(42);
  });

  it('api changes: recorded only with recordApiChanges or { undoable: true }; batchUndoable groups', async () => {
    const t = await mount();
    t.api.applyCellChanges([{ rowIndex: 0, column: NAME, value: 'a' }]);
    expect(t.api.canUndo()).toBe(false);
    t.api.applyCellChanges([{ rowIndex: 0, column: NAME, value: 'b' }], 'api', { undoable: true });
    expect(t.api.getUndoState()?.undoLabel).toBe('Change');
    t.api.applyCellChanges([{ rowIndex: 1, column: NAME, value: 'c' }], 'edit', { undoable: false });
    expect(t.api.getUndoState()?.size).toBe(1);
    t.api.batchUndoable('Import', () => {
      t.api.applyCellChanges([{ rowIndex: 2, column: NAME, value: 'i1' }], 'api', { undoable: true });
      t.api.batchUndoable('inner', () => t.api.applyCellChanges([{ rowIndex: 3, column: NAME, value: 'i2' }], 'edit'));
      expect(t.api.undo()).toBe(false); // not inside
    });
    expect(t.api.getUndoState()).toMatchObject({ undoLabel: 'Import', size: 2 });
    t.api.undo();
    expect([t.rows[2].name, t.rows[3].name]).toEqual(['N2', 'N3']);
    t.api.redo();
    expect([t.rows[2].name, t.rows[3].name]).toEqual(['i1', 'i2']);
    t.api.batchUndoable('Empty', () => undefined);
    expect(t.api.getUndoState()?.size).toBe(2);
    destroyAllTables();
    const r = await mount({ undo: { recordApiChanges: true } });
    r.api.applyCellChanges([{ rowIndex: 0, column: NAME, value: 'a' }]);
    expect(r.api.canUndo()).toBe(true);
  });

  it('maxCells: a change too large empties the history (announced)', async () => {
    const t = await mount({ undo: { maxCells: 5 } });
    t.api.applyCellChanges([{ rowIndex: 0, column: NAME, value: 'a' }], 'edit');
    t.api.fillRange(new CellRange(0, QTY, 0, QTY), 'down', 10, 'copy');
    expect(t.api.canUndo()).toBe(false);
  });

  it('a row that left the model is skipped; a read-only cell too; a removed column', async () => {
    const t = await mount();
    t.api.applyCellChanges([{ rowIndex: 0, column: NAME, value: 'x' }, { rowIndex: 1, column: NAME, value: 'y' }], 'edit');
    const body = t.scope.tableModel.getBodyModel() as unknown as { getAllRows: () => Row[]; getFilteredRows: () => Row[] };
    body.getAllRows().splice(0, 1); // same array, row 0 gone
    body.getFilteredRows().splice(0, 1);
    t.api.repaintHard();
    t.api.undo();
    expect(t.rows.find(r => r.id === 1)!.name).toBe('N1');
    t.api.applyCellChanges([{ rowIndex: 0, column: NAME, value: 'z' }], 'edit');
    t.scope.tableModel.getColumnDef(NAME)!.editable = () => false;
    t.api.undo();
    expect(t.rows[0].name).toBe('z');
  });

  it('undo after a column moved: found by property', async () => {
    const t = await mount();
    t.api.applyCellChanges([{ rowIndex: 0, column: NAME, value: 'x' }], 'edit');
    const defs = t.scope.tableModel.getColumnDefs()!;
    defs.reverse();
    t.api.repaint();
    t.api.undo();
    expect(t.rows[0].name).toBe('N0');
    t.api.applyCellChanges([{ rowIndex: 1, column: 'name', value: 'y' }], 'edit');
    defs.splice(defs.findIndex(d => d.property === 'name'), 1); // the column is gone
    t.api.repaint();
    t.api.undo(); // skipped
    expect(t.rows[1].name).toBe('y');
  });

  it('the old in-cell editor and a double click are recorded too', async () => {
    const t = await mount();
    await userEvent.dblClick(getCellDiv(t.host, 'body', 'center', 2, NAME));
    await userEvent.keyboard('{Control>}a{/Control}new{Enter}');
    expect(t.rows[2].name).toBe('new');
    t.api.undo();
    expect(t.rows[2].name).toBe('N2');
  });

  it('a "Loading…" overlay blocks the keys', async () => {
    const t = await mount();
    t.api.applyCellChanges([{ rowIndex: 0, column: NAME, value: 'x' }], 'edit');
    t.focus(0, NAME);
    t.api.showLoadingOverlay();
    await userEvent.keyboard('{Control>}z{/Control}');
    expect(t.rows[0].name).toBe('x');
    t.api.hideOverlay();
    vi.useRealTimers();
  });
});
