// Excel-style editing (prompt 013, stage 1, reference cases E1–E21): typing opens the editor above the cell,
// Enter/Tab/arrows commit and move, Shift/Ctrl+arrows select, Delete clears – with userEvent (real key events).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import {
  CellRange,
  ColumnDef,
  EventAdapter,
  FalseFn,
  FocusModel,
  SelectCellEditor,
  SelectionModel,
  TableFactory,
  TrueFn,
  editInputPipeForNumber,
  px100,
} from '@guiexpert/table';
import type { EditingOptionsIf, GeEditEvent, GeModelChangeEvent, TableOptionsIf } from '@guiexpert/table';
import { destroyAllTables, getCellDiv, mountTable, nextFrame } from '../../../../test-utils/mount-table';
import { axeViolations } from '../../../../test-utils/axe';

afterEach(destroyAllTables);

interface Row { id: number; name: string; qty: number | string; price: number | string; status: string; done: boolean }

const ID = 0, NAME = 1, QTY = 2, PRICE = 3, STATUS = 4, DONE = 5;

function createSheetRows(n = 1000): Row[] {
  return Array.from({ length: n }, (_, i) => ({
    id: i, name: `Name ${i}`, qty: i % 7, price: 10 + i, status: 'open', done: i % 2 === 0,
  }));
}

async function mountSheet(opts: { rows?: Row[]; editing?: boolean | Partial<EditingOptionsIf>; tableOptions?: Partial<TableOptionsIf> } = {}) {
  const rows = opts.rows ?? createSheetRows();
  const listener = new EventAdapter();
  const modelChanges: GeModelChangeEvent[] = [];
  const editEvents: GeEditEvent[] = [];
  listener.onModelChanged = e => modelChanges.push(e);
  listener.onEditingChanged = e => editEvents.push(e);
  const fm = new FocusModel('cell');
  const sm = new SelectionModel('range', 'multi');
  const columnDefs = [
    ColumnDef.create({ property: 'id', headerLabel: 'ID', width: px100 }),
    ColumnDef.create({ property: 'name', headerLabel: 'Name', width: px100, editable: TrueFn }),
    ColumnDef.create({ property: 'qty', headerLabel: 'Qty', width: px100, editable: TrueFn, editInputPipe: editInputPipeForNumber }),
    ColumnDef.create({ property: 'price', headerLabel: 'Price', width: px100, editable: TrueFn }),
    ColumnDef.create({
      property: 'status', headerLabel: 'Status', width: px100, editable: TrueFn,
      editor: () => SelectCellEditor.create(['open', 'paid', 'void']),
    }),
    ColumnDef.create({ property: 'done', headerLabel: 'Done', width: px100, editable: TrueFn }),
  ];
  const table = mountTable(TableFactory.createTableModel({ rows, columnDefs }), {
    eventListener: listener,
    tableOptions: {
      getFocusModel: () => fm,
      getSelectionModel: () => sm,
      editing: opts.editing ?? true,
      ...opts.tableOptions,
    },
  });
  await nextFrame();
  table.host.focus();
  return { ...table, rows, fm, sm, modelChanges, editEvents };
}

const editorBox = (host: HTMLElement) => host.querySelector<HTMLDivElement>('.ge-table-cell-editor');
const editorInput = (host: HTMLElement) => host.querySelector<HTMLInputElement>('.ge-table-cell-editor input');
const editorSelect = (host: HTMLElement) => host.querySelector<HTMLSelectElement>('.ge-table-cell-editor select');
const isOpen = (host: HTMLElement) => editorBox(host)?.style.display === 'block';

function focusCell(t: { fm: FocusModel; api: { repaint(): void }; host: HTMLElement }, r: number, c: number) {
  t.fm.setFocus(r, c);
  t.api.repaint();
  t.host.focus();
}

function liveText(scope: { ariaIds: { liveRegion(): string } }) {
  return document.getElementById(scope.ariaIds.liveRegion())?.textContent ?? '';
}

describe('typing, F2, Enter (E1, E2, E7)', () => {

  it('E1: a printable key opens the editor above the cell with that character ("enter" mode)', async () => {
    const t = await mountSheet();
    focusCell(t, 3, QTY);
    await userEvent.keyboard('7');
    expect(isOpen(t.host)).toBe(true);
    const input = editorInput(t.host)!;
    expect(input.value).toBe('7');
    expect(document.activeElement).toBe(input);
    expect([input.selectionStart, input.selectionEnd]).toEqual([1, 1]);
    expect(t.api.isEditing()).toBe(true);
    expect(t.api.getEditingCell()).toEqual([3, QTY]);
    // the editor is not inside the cell – the cell is rendered as usual below it
    expect(getCellDiv(t.host, 'body', 'center', 3, QTY).contains(input)).toBe(false);
    expect(t.editEvents.map(e => e.type)).toEqual(['start']);
    expect(t.editEvents[0].mode).toBe('enter');
  });

  it('E2: F2 edits with the caret at the end; a double click selects the text', async () => {
    const t = await mountSheet();
    focusCell(t, 3, NAME);
    await userEvent.keyboard('{F2}');
    const input = editorInput(t.host)!;
    expect(input.value).toBe('Name 3');
    expect([input.selectionStart, input.selectionEnd]).toEqual([6, 6]);
    await userEvent.keyboard('{Escape}');
    await userEvent.dblClick(getCellDiv(t.host, 'body', 'center', 5, NAME));
    const input2 = editorInput(t.host)!;
    expect(input2.value).toBe('Name 5');
    expect([input2.selectionStart, input2.selectionEnd]).toEqual([0, 6]);
  });

  it('E7: Enter on a cell without editor opens it with the text selected (Google Sheets)', async () => {
    const t = await mountSheet();
    focusCell(t, 2, NAME);
    await userEvent.keyboard('{Enter}');
    const input = editorInput(t.host)!;
    expect(input.value).toBe('Name 2');
    expect([input.selectionStart, input.selectionEnd]).toEqual([0, 6]);
  });

  it('E7: enterKey "moveDown" moves down like Excel instead', async () => {
    const t = await mountSheet({ editing: { enterKey: 'moveDown' } });
    focusCell(t, 2, NAME);
    await userEvent.keyboard('{Enter}');
    expect(isOpen(t.host)).toBe(false);
    expect(t.fm.getFocus()).toEqual([3, NAME]);
  });
});

describe('commit and move (E3–E6, E15)', () => {

  it('E3: Enter commits (one onModelChanged, source "edit") and moves down; Shift+Enter up', async () => {
    const t = await mountSheet();
    focusCell(t, 3, NAME);
    await userEvent.keyboard('Hello{Enter}');
    expect(t.rows[3].name).toBe('Hello');
    expect(t.modelChanges).toHaveLength(1);
    expect(t.modelChanges[0].source).toBe('edit');
    expect(t.fm.getFocus()).toEqual([4, NAME]);
    expect(isOpen(t.host)).toBe(false);
    expect(document.activeElement).toBe(t.host);
    await userEvent.keyboard('X{Shift>}{Enter}{/Shift}');
    expect(t.rows[4].name).toBe('X');
    expect(t.fm.getFocus()).toEqual([3, NAME]);
    expect(t.editEvents.map(e => e.type)).toEqual(['start', 'input', 'input', 'input', 'input', 'commit', 'start', 'commit']);
  });

  it('E3: the column pipe converts the input (qty "12" → 12)', async () => {
    const t = await mountSheet();
    focusCell(t, 1, QTY);
    await userEvent.keyboard('12{Enter}');
    expect(t.rows[1].qty).toBe(12);
  });

  it('E4: Tab commits and moves right, Shift+Tab left; Enter after Tabs returns to the first column (Excel)', async () => {
    const t = await mountSheet();
    focusCell(t, 3, NAME);
    await userEvent.keyboard('a{Tab}');
    expect(t.rows[3].name).toBe('a');
    expect(t.fm.getFocus()).toEqual([3, QTY]);
    await userEvent.keyboard('5{Tab}');
    expect(t.rows[3].qty).toBe(5);
    expect(t.fm.getFocus()).toEqual([3, PRICE]);
    await userEvent.keyboard('9{Enter}');
    expect(t.fm.getFocus()).toEqual([4, NAME]); // back to the column the Tab sequence started in
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
    expect(t.fm.getFocus()).toEqual([4, ID]);
  });

  it('E4: Tab in the last column is not used – the browser focus leaves the table (no keyboard trap)', async () => {
    const t = await mountSheet();
    focusCell(t, 0, DONE);
    const evt = new KeyboardEvent('keydown', { key: 'Tab', code: 'Tab', bubbles: true, cancelable: true });
    t.host.dispatchEvent(evt);
    expect(evt.defaultPrevented).toBe(false);
    focusCell(t, 0, PRICE);
    await userEvent.keyboard('1');
    const inEditor = new KeyboardEvent('keydown', { key: 'Tab', code: 'Tab', bubbles: true, cancelable: true });
    focusCell(t, 0, STATUS); // the select editor is the last editable before "done"
    await userEvent.keyboard('{F2}');
    editorSelect(t.host)!.dispatchEvent(inEditor);
    expect(inEditor.defaultPrevented).toBe(true); // "done" is beside it: Tab moves there
  });

  it('E5: in "enter" mode the arrow keys commit and move; in "edit" mode (F2) they move the caret; F2 switches', async () => {
    const t = await mountSheet();
    focusCell(t, 5, NAME);
    await userEvent.keyboard('ab{ArrowDown}');
    expect(t.rows[5].name).toBe('ab');
    expect(t.fm.getFocus()).toEqual([6, NAME]);
    await userEvent.keyboard('{F2}{ArrowLeft}{ArrowLeft}');
    expect(isOpen(t.host)).toBe(true);
    expect(editorInput(t.host)!.selectionStart).toBe(4); // "Name 6" – caret moved
    await userEvent.keyboard('{F2}{ArrowRight}'); // back to "enter" mode: the arrow commits
    expect(isOpen(t.host)).toBe(false);
    expect(t.fm.getFocus()).toEqual([6, QTY]);
  });

  it('E6: Escape keeps the old value and reports no model change', async () => {
    const t = await mountSheet();
    focusCell(t, 3, NAME);
    await userEvent.keyboard('Changed{Escape}');
    expect(t.rows[3].name).toBe('Name 3');
    expect(t.modelChanges).toHaveLength(0);
    expect(t.editEvents.at(-1)?.type).toBe('cancel');
    expect(document.activeElement).toBe(t.host);
  });

  it('committing the unchanged text writes nothing', async () => {
    const t = await mountSheet();
    focusCell(t, 3, NAME);
    await userEvent.keyboard('{F2}{Enter}');
    expect(t.modelChanges).toHaveLength(0);
    expect(t.fm.getFocus()).toEqual([4, NAME]);
  });

  it('E15: a click on another cell commits and focuses that cell', async () => {
    const t = await mountSheet();
    focusCell(t, 3, NAME);
    await userEvent.keyboard('Clicked');
    await userEvent.click(getCellDiv(t.host, 'body', 'center', 6, PRICE));
    await nextFrame();
    expect(t.rows[3].name).toBe('Clicked');
    expect(isOpen(t.host)).toBe(false);
    expect(t.fm.getFocus()).toEqual([6, PRICE]);
  });

  it('an invalid value keeps the editor open (aria-invalid, title)', async () => {
    const rows = createSheetRows(50);
    const t = await mountSheet({ rows });
    t.scope.tableModel.getColumnDef(PRICE)!.validate = (v: unknown) => (String(v).startsWith('-') ? 'No negative prices' : undefined);
    focusCell(t, 3, PRICE);
    await userEvent.keyboard('-5{Enter}');
    expect(isOpen(t.host)).toBe(true);
    expect(editorInput(t.host)!.getAttribute('aria-invalid')).toBe('true');
    expect(editorInput(t.host)!.title).toBe('No negative prices');
    expect(rows[3].price).toBe(13);
    await userEvent.keyboard('{Escape}');
    expect(isOpen(t.host)).toBe(false);
  });
});

describe('selection with the keyboard (E11–E13)', () => {

  it('E11: Shift+arrows extend from the active cell; the focus stays on it', async () => {
    const t = await mountSheet();
    focusCell(t, 3, NAME);
    await userEvent.keyboard('{Shift>}{ArrowDown}{ArrowDown}{ArrowDown}{ArrowRight}{/Shift}');
    expect(t.sm.getRanges().map(r => [r.r1, r.c1, r.r2, r.c2])).toEqual([[3, NAME, 6, QTY]]);
    expect(t.fm.getFocus()).toEqual([3, NAME]);
    await userEvent.keyboard('{Shift>}{ArrowUp}{/Shift}');
    expect(t.sm.getRanges().map(r => [r.r1, r.c1, r.r2, r.c2])).toEqual([[3, NAME, 5, QTY]]);
    await vi.waitFor(() => expect(liveText(t.scope)).toBe('3 rows, 2 columns selected'));
  });

  it('an arrow key without Shift ends the range: the selection is the active cell (Excel)', async () => {
    const t = await mountSheet();
    focusCell(t, 3, NAME);
    await userEvent.keyboard('{Shift>}{ArrowDown}{ArrowDown}{/Shift}{ArrowRight}');
    expect(t.fm.getFocus()).toEqual([3, QTY]);
    expect(t.sm.getRanges().map(r => [r.r1, r.c1, r.r2, r.c2])).toEqual([[3, QTY, 3, QTY]]);
  });

  it('Shift+click extends from the active cell set by the keyboard', async () => {
    const t = await mountSheet();
    focusCell(t, 2, NAME);
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Shift>}');
    await userEvent.click(getCellDiv(t.host, 'body', 'center', 5, PRICE));
    await userEvent.keyboard('{/Shift}');
    expect(t.sm.getRanges().at(-1)).toMatchObject({ r1: 3, c1: NAME, r2: 5, c2: PRICE });
  });

  it('E12: Ctrl+↓ jumps to the end of the block / to the next filled cell; Ctrl+Shift+↓ extends', async () => {
    const rows = createSheetRows(20);
    for (const i of [3, 4, 5]) rows[i].name = '';
    const t = await mountSheet({ rows });
    focusCell(t, 0, NAME);
    await userEvent.keyboard('{Control>}{ArrowDown}{/Control}');
    expect(t.fm.getFocus()).toEqual([2, NAME]);
    await userEvent.keyboard('{Control>}{ArrowDown}{/Control}');
    expect(t.fm.getFocus()).toEqual([6, NAME]);
    await userEvent.keyboard('{Control>}{ArrowDown}{/Control}');
    expect(t.fm.getFocus()).toEqual([19, NAME]);
    focusCell(t, 0, NAME); // a focus set by code: Shift+arrows start at it (the anchor follows the active cell)
    await userEvent.keyboard('{Control>}{Shift>}{ArrowDown}{/Shift}{/Control}');
    expect(t.sm.getRanges().at(-1)).toMatchObject({ r1: 0, r2: 2, c1: NAME, c2: NAME });
  });

  it('E13: Shift+Space selects the rows, Ctrl+Space the columns of the active cell', async () => {
    const t = await mountSheet();
    focusCell(t, 4, QTY);
    await userEvent.keyboard('{Shift>} {/Shift}');
    expect(isOpen(t.host)).toBe(false);
    expect(t.sm.isSelected(4, ID)).toBe(true);
    expect(t.sm.isSelected(4, DONE)).toBe(true);
    expect(t.sm.isSelected(5, QTY)).toBe(false);
    await userEvent.keyboard('{ArrowDown}{ArrowUp}'); // back to one cell
    await userEvent.keyboard('{Control>} {/Control}');
    expect(t.sm.isSelected(0, QTY)).toBe(true);
    expect(t.sm.isSelected(999, QTY)).toBe(true);
    expect(t.sm.isSelected(4, ID)).toBe(false);
  });
});

describe('clearing and Ctrl+Enter (E8–E10)', () => {

  it('E8: Delete clears the editable cells of the selection – one event "clear", announced', async () => {
    const t = await mountSheet();
    focusCell(t, 2, ID);
    t.sm.addSelection(new CellRange(2, ID, 5, QTY));
    await userEvent.keyboard('{Delete}');
    expect(t.rows.slice(2, 6).map(r => [r.id, r.name, r.qty])).toEqual([[2, '', ''], [3, '', ''], [4, '', ''], [5, '', '']]);
    expect(t.modelChanges).toHaveLength(1);
    expect(t.modelChanges[0].source).toBe('clear');
    expect(t.modelChanges[0].changes).toHaveLength(8);
    await vi.waitFor(() => expect(liveText(t.scope)).toBe('8 cells cleared'));
  });

  it('ColumnDef.emptyValue is the value of a cleared cell; api.clearCells works with ranges', async () => {
    const t = await mountSheet();
    t.scope.tableModel.getColumnDef(PRICE)!.emptyValue = 0;
    expect(t.api.clearCells([new CellRange(0, PRICE, 1, PRICE)])).toBe(2);
    expect([t.rows[0].price, t.rows[1].price]).toEqual([0, 0]);
  });

  it('E9: Backspace on one cell opens the editor empty – Escape keeps the value', async () => {
    const t = await mountSheet();
    focusCell(t, 3, NAME);
    await userEvent.keyboard('{Backspace}');
    expect(isOpen(t.host)).toBe(true);
    expect(editorInput(t.host)!.value).toBe('');
    await userEvent.keyboard('{Escape}');
    expect(t.rows[3].name).toBe('Name 3');
    await userEvent.keyboard('{Backspace}{Enter}');
    expect(t.rows[3].name).toBe('');
  });

  it('E10: Ctrl+Enter writes the input into all selected editable cells (one event)', async () => {
    const t = await mountSheet();
    focusCell(t, 2, QTY);
    t.sm.addSelection(new CellRange(2, ID, 4, QTY));
    await userEvent.keyboard('5{Control>}{Enter}{/Control}');
    expect(t.rows.slice(2, 5).map(r => [r.id, r.name, r.qty])).toEqual([[2, '5', 5], [3, '5', 5], [4, '5', 5]]);
    expect(t.modelChanges).toHaveLength(1);
    expect(t.modelChanges[0].changes).toHaveLength(6);
  });
});

describe('editor behaviour (E14, E16–E20)', () => {

  it('E14: the typed text survives scrolling away and back; Enter commits it', async () => {
    const t = await mountSheet();
    focusCell(t, 3, NAME);
    await userEvent.keyboard('abc');
    t.api.scrollToPixel(0, 2000 * 34);
    await nextFrame();
    expect(editorBox(t.host)!.classList).toContain('ge-table-cell-editor-clipped');
    expect(document.activeElement).toBe(editorInput(t.host));
    t.api.scrollToPixel(0, 0);
    await nextFrame();
    expect(editorBox(t.host)!.classList).not.toContain('ge-table-cell-editor-clipped');
    await userEvent.keyboard('d{Enter}');
    expect(t.rows[3].name).toBe('abcd');
  });

  it('E14: the editor follows its row when the rows are sorted while editing', async () => {
    const t = await mountSheet({ rows: createSheetRows(30) });
    focusCell(t, 3, NAME);
    await userEvent.keyboard('Z');
    t.api.sort((a: Row, b: Row) => b.id - a.id); // row 3 is now display row 26
    t.api.repaint();
    await nextFrame();
    expect(t.api.getEditingCell()).toEqual([26, NAME]);
    await userEvent.keyboard('{Enter}');
    expect(t.rows.find(r => r.id === 3)!.name).toBe('Z');
  });

  it('E16: an IME key ("Process") or a dead key opens the editor empty without preventDefault', async () => {
    const t = await mountSheet();
    focusCell(t, 3, NAME);
    const ime = new KeyboardEvent('keydown', { key: 'Process', bubbles: true, cancelable: true });
    t.host.dispatchEvent(ime);
    expect(ime.defaultPrevented).toBe(false);
    expect(isOpen(t.host)).toBe(true);
    expect(editorInput(t.host)!.value).toBe('');
    expect(document.activeElement).toBe(editorInput(t.host));
    await userEvent.keyboard('{Escape}');
    const dead = new KeyboardEvent('keydown', { key: 'Dead', code: 'Equal', bubbles: true, cancelable: true });
    t.host.dispatchEvent(dead);
    expect(dead.defaultPrevented).toBe(false);
    expect(isOpen(t.host)).toBe(true);
  });

  it('E17: no inline event handlers in the editors (strict CSP); the in-cell editors have no inline styles', async () => {
    const t = await mountSheet();
    focusCell(t, 3, NAME);
    await userEvent.keyboard('x');
    const attributes = [editorBox(t.host)!, ...editorBox(t.host)!.querySelectorAll('*')]
      .flatMap(el => [...el.attributes].map(a => a.name));
    expect(attributes.filter(a => a.startsWith('on'))).toEqual([]);
    await userEvent.keyboard('{Escape}');
    // the editor of TableOptions.getEditRenderer (InputCellRenderer) without the option
    destroyAllTables();
    const plain = await mountSheet({ editing: false });
    focusCell(plain, 3, NAME);
    await userEvent.keyboard('{F2}');
    const input = plain.host.querySelector<HTMLInputElement>('input.ge-table-cell-editor-input')!;
    expect([...input.attributes].map(a => a.name).filter(a => a.startsWith('on') || a === 'style')).toEqual([]);
    expect(getComputedStyle(input).borderTopWidth).toBe('0px'); // the former inline style now comes from the CSS
  });

  it('E18: a key on a read-only cell opens nothing and says "Read only"', async () => {
    const t = await mountSheet();
    focusCell(t, 3, ID);
    await userEvent.keyboard('a');
    expect(isOpen(t.host)).toBe(false);
    await vi.waitFor(() => expect(liveText(t.scope)).toBe('Read only'));
  });

  it('E19: a list editor: typing picks the first match, ↑/↓ change the choice, Enter commits', async () => {
    const t = await mountSheet();
    focusCell(t, 3, STATUS);
    await userEvent.keyboard('p');
    const select = editorSelect(t.host)!;
    expect(select.value).toBe('paid');
    expect(document.activeElement).toBe(select);
    await userEvent.keyboard('{ArrowDown}');
    expect(isOpen(t.host)).toBe(true);
    await userEvent.keyboard('{Enter}');
    expect(['paid', 'void']).toContain(t.rows[3].status);
    expect(isOpen(t.host)).toBe(false);
  });

  it('E20: Space on a true/false cell toggles it (no editor)', async () => {
    const t = await mountSheet();
    focusCell(t, 2, DONE);
    await userEvent.keyboard(' ');
    expect(isOpen(t.host)).toBe(false);
    expect(t.rows[2].done).toBe(false);
    expect(t.modelChanges).toHaveLength(1);
  });

  it('a batch edit marks the committed value instead of writing it', async () => {
    const t = await mountSheet({ tableOptions: { batchEdit: true } });
    focusCell(t, 3, NAME);
    await userEvent.keyboard('Pending{Enter}');
    expect(t.rows[3].name).toBe('Name 3');
    expect(t.api.getPendingChanges().map(c => c.newValue)).toEqual(['Pending']);
    expect(getCellDiv(t.host, 'body', 'center', 3, NAME).classList).toContain('ge-table-cell-pending');
  });

  it('a blocking loading overlay: typing and Delete do nothing', async () => {
    const t = await mountSheet();
    focusCell(t, 3, NAME);
    t.api.showLoadingOverlay();
    await nextFrame();
    t.host.focus();
    await userEvent.keyboard('a{Delete}');
    expect(isOpen(t.host)).toBe(false);
    expect(t.rows[3].name).toBe('Name 3');
  });
});

describe('API, events, defaults', () => {

  it('api.startEditing / stopEditing / getEditingCell', async () => {
    const t = await mountSheet();
    expect(t.api.startEditing(2, 'name', 'New')).toBe(true);
    expect(editorInput(t.host)!.value).toBe('New');
    expect(t.api.getEditingCell()).toEqual([2, NAME]);
    expect(t.api.stopEditing()).toBe(true);
    expect(t.rows[2].name).toBe('New');
    t.api.startEditing(2, NAME);
    expect(t.api.stopEditing(true)).toBe(true);
    expect(t.api.startEditing(2, ID)).toBe(false); // not editable
  });

  it('api.subscribe adds listeners next to the main one; the returned function removes them', async () => {
    const t = await mountSheet();
    const seen: string[] = [];
    const off = t.api.subscribe({ onEditingChanged: e => seen.push(e.type), onModelChanged: () => seen.push('model') });
    focusCell(t, 3, NAME);
    await userEvent.keyboard('Q{Enter}');
    expect(seen).toEqual(['start', 'model', 'commit']); // "Q" opened the editor (no input event)
    expect(t.modelChanges).toHaveLength(1); // the main listener still gets everything
    off();
    await userEvent.keyboard('R{Enter}');
    expect(seen).toHaveLength(3);
  });

  it('defaultEditable: columns without an own editable can be edited, explicit FalseFn stays read only', async () => {
    const rows = createSheetRows(10);
    const table = mountTable(TableFactory.createTableModel({
      rows,
      columnDefs: [ColumnDef.create({ property: 'id', editable: FalseFn }), ColumnDef.create({ property: 'name' })],
    }), { tableOptions: { editing: { defaultEditable: true } } });
    await nextFrame();
    const body = table.scope.tableModel.getBodyModel();
    expect(body.isEditable(0, 0)).toBe(false);
    expect(body.isEditable(0, 1)).toBe(true);
  });

  it('E21: without the option nothing changes – letters do not edit, Enter does not edit, Tab is not used', async () => {
    const t = await mountSheet({ editing: false });
    focusCell(t, 3, NAME);
    await userEvent.keyboard('a{Enter}');
    expect(t.scope.isEditing()).toBe(false);
    const tab = new KeyboardEvent('keydown', { key: 'Tab', code: 'Tab', bubbles: true, cancelable: true });
    t.host.dispatchEvent(tab);
    expect(tab.defaultPrevented).toBe(false);
    expect(t.host.querySelector('.ge-table-cell-editor')).toBeNull();
    expect(t.host.getAttribute('aria-description')).toBeNull();
  });

  it('the old in-cell editor keeps the typed text over a repaint (before 1.1.99 it was lost)', async () => {
    const t = await mountSheet({ editing: false });
    focusCell(t, 3, NAME);
    await userEvent.keyboard('{F2}');
    await userEvent.keyboard('{End}xyz');
    t.api.repaint();
    const input = t.host.querySelector<HTMLInputElement>('input.ge-table-cell-editor-input')!;
    expect(input.value).toBe('Name 3xyz');
    expect(document.activeElement).toBe(input);
    await userEvent.keyboard('{Enter}');
    expect(t.rows[3].name).toBe('Name 3xyz');
  });
});

describe('accessibility', () => {

  it('the edited cell owns the editor (aria-owns), the input is named, read-only cells say so – axe clean', async () => {
    const t = await mountSheet({ rows: createSheetRows(30) });
    expect(t.host.getAttribute('aria-description')).toContain('Type to edit');
    expect(getCellDiv(t.host, 'body', 'center', 0, ID).getAttribute('aria-readonly')).toBe('true');
    expect(getCellDiv(t.host, 'body', 'center', 0, NAME).hasAttribute('aria-readonly')).toBe(false);
    focusCell(t, 3, NAME);
    await userEvent.keyboard('x');
    const input = editorInput(t.host)!;
    expect(getCellDiv(t.host, 'body', 'center', 3, NAME).getAttribute('aria-owns')).toBe(input.id);
    expect(input.getAttribute('aria-label')).toBe('Name'); // the column label
    expect(await axeViolations(t.host)).toEqual([]);
    await userEvent.keyboard('{Escape}');
    expect(getCellDiv(t.host, 'body', 'center', 3, NAME).hasAttribute('aria-owns')).toBe(false);
  });
});

describe('right-to-left', () => {

  it('Tab moves in reading direction, ← in "enter" mode goes forward', async () => {
    const t = await mountSheet({ tableOptions: { direction: 'rtl' } });
    focusCell(t, 3, NAME);
    await userEvent.keyboard('a{Tab}');
    expect(t.fm.getFocus()).toEqual([3, QTY]);
    await userEvent.keyboard('1{ArrowLeft}');
    expect(t.fm.getFocus()).toEqual([3, PRICE]);
  });
});
