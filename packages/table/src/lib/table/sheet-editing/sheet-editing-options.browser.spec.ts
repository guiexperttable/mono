// Excel-style editing: options, editors, edge cases (prompt 013 stage 1) – completes sheet-editing.browser.spec.ts.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import {
  CellRange,
  ColumnDef,
  DateCellEditor,
  EventAdapter,
  FalseFn,
  FocusModel,
  InputCellRenderer,
  SelectCellEditor,
  SelectionModel,
  TableFactory,
  TextCellEditor,
  TrueFn,
  px100,
} from '@guiexpert/table';
import type { CellEditorContextIf, EditingOptionsIf, GeEditEvent, GeModelChangeEvent, TableOptionsIf } from '@guiexpert/table';
import { destroyAllTables, getCellDiv, mountTable, nextFrame } from '../../../../test-utils/mount-table';

afterEach(destroyAllTables);

interface Row { id: number; name: string; due: Date; iso: string; qty: number }

const ID = 0, NAME = 1, DUE = 2, ISO = 3, QTY = 4;

function rowsOf(n = 100): Row[] {
  return Array.from({ length: n }, (_, i) => ({
    id: i, name: `Name ${i}`, due: new Date(2026, 9, 1 + (i % 28)), iso: `2026-10-${String(1 + (i % 28)).padStart(2, '0')}`, qty: i,
  }));
}

async function mount(opts: { rows?: Row[]; editing?: boolean | Partial<EditingOptionsIf>; tableOptions?: Partial<TableOptionsIf>; selection?: SelectionModel } = {}) {
  const rows = opts.rows ?? rowsOf();
  const listener = new EventAdapter();
  const modelChanges: GeModelChangeEvent[] = [];
  const editEvents: GeEditEvent[] = [];
  listener.onModelChanged = e => modelChanges.push(e);
  listener.onEditingChanged = e => editEvents.push(e);
  const fm = new FocusModel('cell');
  const sm = opts.selection ?? new SelectionModel('range', 'multi');
  const columnDefs = [
    ColumnDef.create({ property: 'id', headerLabel: 'ID', width: px100 }),
    ColumnDef.create({ property: 'name', headerLabel: 'Name', width: px100, editable: TrueFn }),
    ColumnDef.create({ property: 'due', headerLabel: 'Due', width: px100, editable: TrueFn }),
    ColumnDef.create({ property: 'iso', headerLabel: 'Iso', width: px100, editable: TrueFn, editor: 'date' }),
    ColumnDef.create({ property: 'qty', headerLabel: 'Qty', width: px100, editable: TrueFn }),
  ];
  const table = mountTable(TableFactory.createTableModel({ rows, columnDefs }), {
    eventListener: listener,
    tableOptions: { getFocusModel: () => fm, getSelectionModel: () => sm, editing: opts.editing ?? true, ...opts.tableOptions },
  });
  await nextFrame();
  table.host.focus();
  const focus = (r: number, c: number) => {
    fm.setFocus(r, c);
    table.api.repaint();
    table.host.focus();
  };
  return { ...table, rows, fm, sm, modelChanges, editEvents, focus };
}

const box = (host: HTMLElement) => host.querySelector<HTMLDivElement>('.ge-table-cell-editor')!;
const field = (host: HTMLElement) => host.querySelector<HTMLInputElement>('.ge-table-cell-editor input');
const open = (host: HTMLElement) => box(host)?.style.display === 'block';

describe('editors', () => {

  it('a Date value gets the date editor; the value comes back as Date', async () => {
    const t = await mount();
    t.focus(3, DUE);
    await userEvent.keyboard('{F2}');
    const input = field(t.host)!;
    expect(input.type).toBe('date');
    expect(input.value).toBe('2026-10-04');
    input.value = '2026-12-24';
    await userEvent.keyboard('{ArrowDown}'); // belongs to the date field
    expect(open(t.host)).toBe(true);
    input.value = '2026-12-24';
    await userEvent.keyboard('{Enter}');
    expect(t.rows[3].due).toEqual(new Date(2026, 11, 24));
  });

  it('editor "date" on ISO text: the value stays ISO text; typing keeps the date; an empty field writes ""', async () => {
    const t = await mount();
    t.focus(2, ISO);
    await userEvent.keyboard('{F2}');
    field(t.host)!.value = '2027-01-31';
    await userEvent.keyboard('{Enter}');
    expect(t.rows[2].iso).toBe('2027-01-31');
    t.focus(5, ISO);
    await userEvent.keyboard('1');
    expect(field(t.host)!.value).toBe('2026-10-06'); // a character cannot be shown in a date field
    await userEvent.keyboard('{Escape}');
    t.focus(6, ISO);
    await userEvent.keyboard('{F2}');
    field(t.host)!.value = '';
    await userEvent.keyboard('{Enter}');
    expect(t.rows[6].iso).toBe('');
  });

  it('a number without pipe is written as number; other text stays text', async () => {
    const t = await mount();
    t.focus(1, QTY);
    await userEvent.keyboard('42{Enter}');
    expect(t.rows[1].qty).toBe(42);
    await userEvent.keyboard('abc{Enter}');
    expect(t.rows[2].qty).toBe('abc');
  });

  it('TextCellEditor: getText/setText, composition state', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const editor = new TextCellEditor();
    const ctx = {
      rowIndex: 0, columnIndex: 0, row: {}, value: 'x', input: 'x', mode: 'edit', textSelection: 'end', direction: 'ltr',
      ariaLabel: 'X', domService: { createElement: (n: string) => document.createElement(n), setAttribute: (e: HTMLElement, k: string, v: string) => e.setAttribute(k, v), addClass: (e: HTMLElement, c: string) => { e.classList.add(c); return e; }, appendChild: (p: HTMLElement, c: HTMLElement) => p.appendChild(c) },
      commit: vi.fn(), cancel: vi.fn(), inputChanged: vi.fn(),
    } as unknown as CellEditorContextIf;
    editor.open(container, ctx);
    expect(editor.getText()).toBe('x');
    editor.setText('hello');
    expect(editor.getValue()).toBe('hello');
    const input = editor.getFocusElement() as HTMLInputElement;
    input.dispatchEvent(new CompositionEvent('compositionstart'));
    expect(editor.isComposing()).toBe(true);
    input.dispatchEvent(new CompositionEvent('compositionend'));
    expect(editor.isComposing()).toBe(false);
    expect(editor.wantsKey(new KeyboardEvent('keydown', { key: 'ArrowUp' }), 'enter')).toBe(false);
    editor.setMode('edit');
    editor.close();
    expect(container.children).toHaveLength(0);
    expect(editor.getText()).toBe('');
    editor.focus(); // no input any more: nothing happens
    container.remove();
  });

  it('DateCellEditor wants the arrow keys', () => {
    const editor = new DateCellEditor();
    expect(editor.wantsKey(new KeyboardEvent('keydown', { key: 'ArrowLeft' }), 'enter')).toBe(true);
    expect(editor.wantsKey(new KeyboardEvent('keydown', { key: 'Enter' }), 'enter')).toBe(false);
  });

  it('a column with an own getEditRenderer keeps the in-cell editor: typing does not open it, F2 does', async () => {
    const t = await mount();
    t.scope.tableModel.getColumnDef(NAME)!.getEditRenderer = () => new InputCellRenderer();
    t.focus(3, NAME);
    await userEvent.keyboard('a');
    expect(t.api.isEditing()).toBe(false);
    await userEvent.keyboard('{F2}');
    expect(t.api.getEditingCell()).toEqual([3, NAME]);
    expect(t.host.querySelector('input.ge-table-cell-editor-input')).not.toBeNull();
    expect(t.editEvents.map(e => e.type)).toEqual(['start']);
    expect(t.api.stopEditing()).toBe(true);
    expect(t.editEvents.map(e => e.type)).toEqual(['start', 'commit']);
    await userEvent.keyboard('{F2}');
    expect(t.api.stopEditing(true)).toBe(true);
    expect(t.editEvents.at(-1)?.type).toBe('cancel');
  });

  it('an own tableOptions.getEditRenderer of the app keeps the in-cell editor too', async () => {
    const t = await mount({ tableOptions: { getEditRenderer: () => new InputCellRenderer() } });
    t.focus(3, NAME);
    await userEvent.keyboard('{F2}');
    expect(t.host.querySelector('input.ge-table-cell-editor-input')).not.toBeNull();
    expect(open(t.host)).toBe(false);
  });
});

describe('options', () => {

  it('startOnType false: typing does nothing, F2 still edits', async () => {
    const t = await mount({ editing: { startOnType: false } });
    t.focus(3, NAME);
    await userEvent.keyboard('a');
    expect(open(t.host)).toBe(false);
    await userEvent.keyboard('{F2}');
    expect(open(t.host)).toBe(true);
  });

  it('enterMoves "right" / "none"; textSelection "end"', async () => {
    const t = await mount({ editing: { enterMoves: 'right', textSelection: 'end' } });
    t.focus(3, NAME);
    await userEvent.keyboard('{Enter}');
    const input = field(t.host)!;
    expect([input.selectionStart, input.selectionEnd]).toEqual([6, 6]);
    await userEvent.keyboard('{Enter}');
    expect(t.fm.getFocus()).toEqual([3, DUE]);
    await userEvent.keyboard('{Enter}'); // opens the editor…
    await userEvent.keyboard('{Shift>}{Enter}{/Shift}'); // …Shift+Enter commits to the left
    expect(t.fm.getFocus()).toEqual([3, NAME]);
    destroyAllTables();
    const n = await mount({ editing: { enterMoves: 'none' } });
    n.focus(3, NAME);
    await userEvent.keyboard('x{Enter}');
    expect(n.fm.getFocus()).toEqual([3, NAME]);
    await userEvent.keyboard('y{Shift>}{Enter}{/Shift}');
    expect(n.fm.getFocus()).toEqual([3, NAME]);
  });

  it('tabMoves false: Tab is not used (also in the editor); arrowKeysCommit false: arrows stay in the editor', async () => {
    const t = await mount({ editing: { tabMoves: false, arrowKeysCommit: false } });
    t.focus(3, NAME);
    const tab = new KeyboardEvent('keydown', { key: 'Tab', code: 'Tab', bubbles: true, cancelable: true });
    t.host.dispatchEvent(tab);
    expect(tab.defaultPrevented).toBe(false);
    await userEvent.keyboard('ab{ArrowLeft}');
    expect(open(t.host)).toBe(true);
    const tab2 = new KeyboardEvent('keydown', { key: 'Tab', code: 'Tab', bubbles: true, cancelable: true });
    field(t.host)!.dispatchEvent(tab2);
    expect(tab2.defaultPrevented).toBe(false);
  });

  it('clearKeys false: Delete and Backspace do nothing; ctrlEnterFillsSelection false: Ctrl+Enter commits one cell', async () => {
    const t = await mount({ editing: { clearKeys: false, ctrlEnterFillsSelection: false } });
    t.focus(3, NAME);
    await userEvent.keyboard('{Delete}{Backspace}');
    expect(t.rows[3].name).toBe('Name 3');
    expect(open(t.host)).toBe(false);
    t.sm.addSelection(new CellRange(3, NAME, 5, NAME));
    await userEvent.keyboard('z{Control>}{Enter}{/Control}');
    expect([t.rows[3].name, t.rows[4].name]).toEqual(['z', 'Name 4']);
  });

  it('Alt+Enter in the editor does nothing (no line breaks in a one-line editor)', async () => {
    const t = await mount();
    t.focus(3, NAME);
    await userEvent.keyboard('q{Alt>}{Enter}{/Alt}');
    expect(open(t.host)).toBe(true);
  });

  it('maxClearCells: too many cells are not cleared and announced', async () => {
    const t = await mount({ editing: { maxClearCells: 3 } });
    t.focus(0, NAME);
    t.sm.addSelection(new CellRange(0, NAME, 9, NAME));
    await userEvent.keyboard('{Delete}');
    expect(t.rows[0].name).toBe('Name 0');
    expect(t.api.clearCells([new CellRange(0, NAME, 9, NAME)])).toBe(-1);
  });

  it('Ctrl+A then Delete clears all editable cells', async () => {
    const t = await mount({ rows: rowsOf(5) });
    t.focus(0, NAME);
    await userEvent.keyboard('{Control>}a{/Control}{Delete}');
    expect(t.rows.every(r => r.name === '' && r.qty === '' as unknown as number)).toBe(true);
    expect(t.rows.map(r => r.id)).toEqual([0, 1, 2, 3, 4]);
  });
});

describe('edge cases', () => {

  it('Shift+Home/End/Page Down extend; Shift+Tab in the first column leaves', async () => {
    const t = await mount();
    t.focus(3, DUE);
    await userEvent.keyboard('{Shift>}{End}{/Shift}');
    expect(t.sm.getRanges().at(-1)).toMatchObject({ r1: 3, c1: DUE, r2: 3, c2: QTY });
    await userEvent.keyboard('{Shift>}{Home}{/Shift}');
    expect(t.sm.getRanges().at(-1)).toMatchObject({ c1: ID, c2: DUE });
    await userEvent.keyboard('{Shift>}{PageDown}{/Shift}');
    expect(t.sm.getRanges().at(-1)!.r2).toBeGreaterThan(5);
    await userEvent.keyboard('{Shift>}{PageUp}{/Shift}');
    expect(t.sm.getRanges().at(-1)!.r1).toBe(3);
    t.focus(3, ID);
    const tab = new KeyboardEvent('keydown', { key: 'Tab', code: 'Tab', shiftKey: true, bubbles: true, cancelable: true });
    t.host.dispatchEvent(tab);
    expect(tab.defaultPrevented).toBe(false);
  });

  it('Shift+arrows and Shift/Ctrl+Space need a range selection', async () => {
    const t = await mount({ selection: new SelectionModel('cell', 'single') });
    t.focus(3, NAME);
    await userEvent.keyboard('{Shift>}{ArrowDown}{/Shift}');
    expect(t.sm.getRanges().length).toBeLessThanOrEqual(1);
    await userEvent.keyboard('{Shift>} {/Shift}');
    expect(t.sm.isSelected(3, ID)).toBe(false);
  });

  it('the keyboard is ignored in the header: no clearing, no editing', async () => {
    const t = await mount();
    t.focus(0, NAME);
    await userEvent.keyboard('{ArrowUp}'); // into the header
    await userEvent.keyboard('{Delete}{Backspace}a');
    expect(open(t.host)).toBe(false);
    expect(t.rows[0].name).toBe('Name 0');
  });

  it('focus leaving the table commits; a click on the scroll viewport keeps editing', async () => {
    const outside = document.createElement('button');
    outside.textContent = 'outside';
    document.body.appendChild(outside);
    const t = await mount();
    t.focus(3, NAME);
    await userEvent.keyboard('Left');
    t.scope.scrollViewport.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    expect(open(t.host)).toBe(true);
    outside.focus();
    expect(t.rows[3].name).toBe('Left');
    expect(open(t.host)).toBe(false);
    outside.remove();
  });

  it('a click elsewhere with an invalid value: the editor stays, the click is blocked', async () => {
    const t = await mount();
    t.scope.tableModel.getColumnDef(NAME)!.validate = (v: unknown) => (v === 'bad' ? 'Bad' : undefined);
    t.focus(3, NAME);
    await userEvent.keyboard('bad');
    const evt = new PointerEvent('pointerdown', { bubbles: true, cancelable: true });
    getCellDiv(t.host, 'body', 'center', 6, NAME).dispatchEvent(evt);
    expect(evt.defaultPrevented).toBe(true);
    expect(open(t.host)).toBe(true);
  });

  it('the row of the editor is filtered out: the editor closes without writing', async () => {
    const t = await mount();
    t.focus(3, NAME);
    await userEvent.keyboard('Gone');
    t.scope.tableOptions.externalFilterFunction = (r: Row) => r.id !== 3;
    t.api.externalFilterChanged();
    await nextFrame();
    expect(open(t.host)).toBe(false);
    expect(t.rows[3].name).toBe('Name 3');
    expect(t.editEvents.at(-1)?.type).toBe('cancel');
  });

  it('api.startEditing on another cell commits the open editor first; a focused host gives the focus back to the editor', async () => {
    const t = await mount();
    t.api.startEditing(1, NAME, 'One');
    t.api.startEditing(2, NAME);
    expect(t.rows[1].name).toBe('One');
    expect(t.api.getEditingCell()).toEqual([2, NAME]);
    expect(t.api.startEditing(2, 'name')).toBe(true); // the same cell: stays open
    expect(t.api.startEditing(2, 'nope')).toBe(false);
    t.host.focus();
    t.api.repaint();
    expect(document.activeElement).toBe(field(t.host));
  });

  it('a batch edit commit by a click (deferred repaint) marks the value', async () => {
    const t = await mount({ tableOptions: { batchEdit: true } });
    t.focus(3, NAME);
    await userEvent.keyboard('Later');
    await userEvent.click(getCellDiv(t.host, 'body', 'center', 7, QTY));
    await nextFrame();
    expect(t.api.getPendingChanges().map(c => c.newValue)).toEqual(['Later']);
  });

  it('right-to-left: the editor is placed from the right and clipped in logical directions', async () => {
    const t = await mount({ tableOptions: { direction: 'rtl' } });
    t.focus(3, NAME);
    await userEvent.keyboard('r');
    expect(box(t.host).style.right).not.toBe('');
    t.api.scrollToPixel(0, 3 * 34 + 20); // the row partly under the header
    await nextFrame();
    expect(box(t.host).style.clipPath).toMatch(/^inset\(\d/);
  });

  it('destroy() removes the editor', async () => {
    const t = await mount();
    t.focus(3, NAME);
    await userEvent.keyboard('x');
    t.destroy();
    expect(document.querySelector('.ge-table-cell-editor')).toBeNull();
  });
});

describe('more branches', () => {

  it('select editor: no matching value selects nothing (""); Alt+↓ opens the list and stays in the editor', async () => {
    const t = await mount();
    t.scope.tableModel.getColumnDef(NAME)!.editor = () => SelectCellEditor.create(['open', 'paid']);
    t.focus(3, NAME);
    await userEvent.keyboard('{F2}');
    const select = t.host.querySelector<HTMLSelectElement>('.ge-table-cell-editor select')!;
    expect(select.selectedIndex).toBe(-1);
    const picker = vi.fn();
    (select as unknown as { showPicker: () => void }).showPicker = picker;
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
    expect(picker).toHaveBeenCalled();
    expect(open(t.host)).toBe(true);
    t.api.repaint(); // the select has the focus: focus() leaves it alone
    expect(document.activeElement).toBe(select);
    await userEvent.keyboard('{Enter}');
    expect(t.rows[3].name).toBe('Name 3'); // unchanged text: nothing written
  });

  it('subscribe: a throwing subscriber is logged and does not stop the others; unsubscribe', async () => {
    const t = await mount();
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const seen: string[] = [];
    const off1 = t.api.subscribe({ onEditingChanged: () => { throw new Error('boom'); } });
    const off2 = t.api.subscribe({ onEditingChanged: e => seen.push(e.type) });
    t.focus(3, NAME);
    await userEvent.keyboard('x{Escape}');
    expect(seen).toEqual(['start', 'cancel']);
    expect(error).toHaveBeenCalled();
    off1();
    off2();
    await userEvent.keyboard('y{Escape}');
    expect(seen).toEqual(['start', 'cancel']);
    error.mockRestore();
  });

  it('null and invalid Date values open an empty editor', async () => {
    const rows = rowsOf(5);
    (rows[1] as unknown as { name: null }).name = null;
    rows[2].due = new Date(NaN);
    const t = await mount({ rows });
    t.focus(1, NAME);
    await userEvent.keyboard('{F2}');
    expect(field(t.host)!.value).toBe('');
    await userEvent.keyboard('{Escape}');
    t.focus(2, DUE);
    await userEvent.keyboard('{F2}');
    expect(field(t.host)!.value).toBe('');
  });

  it('Tab in the last column commits and lets the focus leave; with an invalid value it stays', async () => {
    const t = await mount();
    t.focus(3, QTY);
    await userEvent.keyboard('7');
    const tab = new KeyboardEvent('keydown', { key: 'Tab', code: 'Tab', bubbles: true, cancelable: true });
    field(t.host)!.dispatchEvent(tab);
    expect(tab.defaultPrevented).toBe(false);
    expect(t.rows[3].qty).toBe(7);
    t.scope.tableModel.getColumnDef(QTY)!.validate = (v: unknown) => (v === 'bad' ? 'Bad' : undefined);
    t.focus(4, QTY);
    await userEvent.keyboard('bad');
    const tab2 = new KeyboardEvent('keydown', { key: 'Tab', code: 'Tab', bubbles: true, cancelable: true });
    field(t.host)!.dispatchEvent(tab2);
    expect(tab2.defaultPrevented).toBe(true);
    expect(open(t.host)).toBe(true);
    expect(field(t.host)!.getAttribute('aria-invalid')).toBe('true');
    expect(field(t.host)!.title).toBe('Bad');
    const ctrlTab = new KeyboardEvent('keydown', { key: 'Tab', code: 'Tab', ctrlKey: true, bubbles: true, cancelable: true });
    field(t.host)!.dispatchEvent(ctrlTab);
    expect(ctrlTab.defaultPrevented).toBe(false);
  });

  it('F2 in the editor switches to edit mode: arrows move the caret; F2 again: arrows commit', async () => {
    const t = await mount();
    t.focus(3, NAME);
    await userEvent.keyboard('ab{F2}{ArrowLeft}');
    expect(open(t.host)).toBe(true);
    await userEvent.keyboard('{F2}{Shift>}{ArrowLeft}{/Shift}');
    expect(open(t.host)).toBe(true); // Shift+arrow selects text
    await userEvent.keyboard('{ArrowUp}');
    expect(open(t.host)).toBe(false);
    expect(t.fm.getFocus()).toEqual([2, NAME]);
  });

  it('right-to-left: ← in enter mode commits forward (to the next column)', async () => {
    const t = await mount({ tableOptions: { direction: 'rtl' } });
    t.focus(3, NAME);
    await userEvent.keyboard('r{ArrowLeft}');
    expect(t.fm.getFocus()).toEqual([3, DUE]);
    t.focus(3, QTY);
    await userEvent.keyboard('5{ArrowRight}');
    expect(t.fm.getFocus()).toEqual([3, ISO]);
  });

  it('keys during an IME composition stay with the IME', async () => {
    const t = await mount();
    t.focus(3, NAME);
    await userEvent.keyboard('k');
    const enter = new KeyboardEvent('keydown', { key: 'Enter', isComposing: true, bubbles: true, cancelable: true });
    field(t.host)!.dispatchEvent(enter);
    expect(open(t.host)).toBe(true);
    const process = new KeyboardEvent('keydown', { key: 'Process', bubbles: true, cancelable: true });
    field(t.host)!.dispatchEvent(process);
    expect(open(t.host)).toBe(true);
  });

  it('a table of arrays (rows without object identity) keeps the editor by index', async () => {
    const listener = new EventAdapter();
    const fm = new FocusModel('cell');
    const model = TableFactory.createTableModel({
      rows: [['a', 'b'], ['c', 'd']],
      columnDefs: [
        ColumnDef.create({ property: '0', headerLabel: 'A', width: px100, editable: TrueFn }),
        ColumnDef.create({ property: '1', headerLabel: 'B', width: px100, editable: TrueFn }),
      ],
    });
    const t = mountTable(model, { eventListener: listener, tableOptions: { getFocusModel: () => fm, editing: true } });
    await nextFrame();
    fm.setFocus(1, 0);
    t.api.repaint();
    t.host.focus();
    await userEvent.keyboard('z');
    t.api.repaint();
    expect(open(t.host)).toBe(true);
    await userEvent.keyboard('{Enter}');
  });
});

describe('review fixes (stage 1)', () => {

  it('clearCells with a huge range (a whole column) is clamped to the table and skips hidden columns', async () => {
    const t = await mount({ rows: rowsOf(20), editing: { maxClearCells: 30 } });
    t.api.setColumnVisible('qty', false);
    const t0 = performance.now();
    expect(t.api.clearCells([new CellRange(0, NAME, Number.MAX_SAFE_INTEGER, NAME)])).toBe(20);
    expect(t.api.clearCells([new CellRange(0, QTY, 3, QTY)])).toBe(0);
    expect(t.api.clearCells([new CellRange(0, ID, 3_000_000, QTY)])).toBe(-1);
    expect(performance.now() - t0).toBeLessThan(100);
    expect(t.rows[19].name).toBe('');
    expect(t.rows[0].qty).toBe(0);
  });

  it('a Date keeps its time of day; Backspace on a date opens it empty', async () => {
    const rows = rowsOf(5);
    rows[1].due = new Date(2026, 9, 16, 14, 30);
    rows[2].iso = '2026-10-16T08:15:00';
    const t = await mount({ rows });
    t.focus(1, DUE);
    await userEvent.keyboard('x');
    expect(field(t.host)!.value).toBe('2026-10-16');
    await userEvent.keyboard('{Enter}');
    expect(t.rows[1].due).toBe(rows[1].due); // unchanged: the same object
    t.focus(1, DUE);
    await userEvent.keyboard('{F2}');
    field(t.host)!.value = '2026-10-20';
    await userEvent.keyboard('{Enter}');
    expect(t.rows[1].due).toEqual(new Date(2026, 9, 20, 14, 30));
    t.focus(2, ISO);
    await userEvent.keyboard('{F2}');
    field(t.host)!.value = '2026-11-01';
    await userEvent.keyboard('{Enter}');
    expect(t.rows[2].iso).toBe('2026-11-01T08:15:00');
    t.focus(3, DUE);
    await userEvent.keyboard('{Backspace}');
    expect(field(t.host)!.value).toBe('');
    await userEvent.keyboard('{Enter}');
    expect(t.rows[3].due).toBe('');
  });

  it('focus going to the page background (no new focus element) commits', async () => {
    const t = await mount();
    t.focus(3, NAME);
    await userEvent.keyboard('Bg');
    field(t.host)!.blur();
    await new Promise(r => setTimeout(r, 10));
    expect(t.rows[3].name).toBe('Bg');
    expect(t.api.isEditing()).toBe(false);
  });

  it('an invalid value refuses the click: the focus and the selection stay', async () => {
    const t = await mount();
    t.scope.tableModel.getColumnDef(NAME)!.validate = (v: unknown) => (v === 'bad' ? 'Bad' : undefined);
    t.focus(1, NAME);
    await userEvent.keyboard('bad');
    await userEvent.click(getCellDiv(t.host, 'body', 'center', 6, QTY));
    expect(t.fm.getFocus()).toEqual([1, NAME]);
    expect(t.sm.isSelected(6, QTY)).toBe(false);
    expect(open(t.host)).toBe(true);
    await userEvent.keyboard('{Escape}');
    await new Promise(r => setTimeout(r, 600));
    await userEvent.click(getCellDiv(t.host, 'body', 'center', 6, QTY));
    expect(t.fm.getFocus()).toEqual([6, QTY]);
  });

  it('master/detail: Tab on a master row with an open detail still goes into the detail', async () => {
    const t = await mount({
      tableOptions: {
        masterDetail: {
          detailHeight: 60,
          detailRenderer: (el: HTMLElement) => {
            const b = document.createElement('button');
            b.textContent = 'inner';
            el.appendChild(b);
          },
        },
      },
    });
    t.api.setDetailExpanded(2, true);
    await nextFrame();
    t.focus(2, NAME);
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement?.textContent).toBe('inner');
    t.host.focus(); // (the host takes the focus back from the detail: its master row gets the focus)
    t.fm.setFocus(4, NAME);
    t.api.repaint();
    await userEvent.keyboard('{Tab}');
    expect(t.fm.getFocus()).toEqual([4, DUE]); // no detail: Tab moves right
  });

  it('a model with a new row object per call keeps the editor open', async () => {
    const t = await mount();
    const body = t.scope.tableModel.getBodyModel();
    const original = body.getRowByIndex.bind(body);
    t.focus(3, NAME);
    await userEvent.keyboard('Fresh');
    body.getRowByIndex = (i: number) => ({ ...original(i) });
    t.api.repaint();
    expect(open(t.host)).toBe(true);
    body.getRowByIndex = original;
    await userEvent.keyboard('{Enter}');
    expect(t.rows[3].name).toBe('Fresh');
  });

  it('the editor follows its column when the columns change while editing', async () => {
    const t = await mount();
    t.focus(3, QTY);
    await userEvent.keyboard('9');
    t.api.setColumnVisible('name', false);
    const defs = t.scope.tableModel.getColumnDefs()!;
    const qty = defs.splice(QTY, 1)[0];
    defs.splice(1, 0, qty);
    t.api.repaint();
    expect(t.api.getEditingCell()).toEqual([3, 1]);
    await userEvent.keyboard('{Escape}');
    defs.splice(1, 1);
    t.focus(3, 1);
    await userEvent.keyboard('z');
    defs.splice(0, defs.length, ...defs.filter(d => d.property !== 'name'));
    t.api.repaint();
    expect(t.api.isEditing()).toBe(false); // the column is gone
  });

  it('an IME start without input writes nothing; Enter with keyCode 229 belongs to the IME', async () => {
    const t = await mount();
    t.focus(3, NAME);
    const ime = new KeyboardEvent('keydown', { key: 'Process', keyCode: 229, bubbles: true, cancelable: true } as KeyboardEventInit);
    t.host.dispatchEvent(ime);
    expect(open(t.host)).toBe(true);
    const enter229 = new KeyboardEvent('keydown', { key: 'Enter', keyCode: 229, bubbles: true, cancelable: true } as KeyboardEventInit);
    field(t.host)!.dispatchEvent(enter229);
    expect(open(t.host)).toBe(true);
    await userEvent.keyboard('{Enter}');
    expect(t.rows[3].name).toBe('Name 3');
  });

  it('Backspace on 3 selected cells clears all three (like Delete)', async () => {
    const t = await mount();
    t.focus(2, NAME);
    t.sm.addSelection(new CellRange(2, NAME, 4, NAME));
    await userEvent.keyboard('{Backspace}');
    expect([t.rows[2].name, t.rows[3].name, t.rows[4].name]).toEqual(['', '', '']);
    expect(open(t.host)).toBe(false);
  });

  it('Ctrl+Enter on a selection above maxClearCells keeps editing and writes nothing', async () => {
    const t = await mount({ editing: { maxClearCells: 2 } });
    t.focus(2, NAME);
    t.sm.addSelection(new CellRange(2, NAME, 6, NAME));
    await userEvent.keyboard('w{Control>}{Enter}{/Control}');
    expect(open(t.host)).toBe(true);
    expect(t.rows[2].name).toBe('Name 2');
  });

  it('defaultEditable: an editable set later (also FalseFn) wins', async () => {
    const t = await mount({ editing: { defaultEditable: true } });
    expect(t.scope.tableModel.getBodyModel().isEditable(0, ID)).toBe(true);
    t.scope.tableModel.getColumnDef(ID)!.editable = FalseFn;
    expect(t.scope.tableModel.getBodyModel().isEditable(0, ID)).toBe(false);
  });

  it('Alt+letter is left to the page (access keys); Shift+arrows in the header select nothing', async () => {
    const t = await mount();
    t.focus(3, NAME);
    const alt = new KeyboardEvent('keydown', { key: 'f', altKey: true, bubbles: true, cancelable: true });
    t.host.dispatchEvent(alt);
    expect(alt.defaultPrevented).toBe(false);
    expect(open(t.host)).toBe(false);
    t.focus(0, NAME);
    await userEvent.keyboard('{ArrowUp}{Shift>}{ArrowRight}{ArrowDown}{/Shift}');
    expect(t.sm.hasSelection()).toBe(false);
  });
});
