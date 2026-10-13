// Inline editing end to end in a real browser: F2 / double click → editor renderer (InputCellRenderer,
// SelectCellRenderer) → typing → "change" event (InputHandler) → AreaModel.setValue (editInputPipe) →
// onModelChanged → repaint.
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import {
  ColumnDef,
  EventAdapter,
  FocusModel,
  SelectCellRenderer,
  TableFactory,
  TrueFn,
  editInputPipeForNumber,
  px100,
} from '@guiexpert/table';
import type { GeModelChangeEvent, TableOptionsIf } from '@guiexpert/table';
import { createRows, destroyAllTables, getCellDiv, mountTable, nextFrame } from '../../../test-utils/mount-table';

afterEach(destroyAllTables);

interface Row { id: number; name?: string; value: number | string; status: string }

/** id | name (editable, text) | value (editable, number pipe) | status (editable, select). */
async function mountEditTable(rows: Row[] = createRows(50).map(r => ({ ...r, status: 'open' })), tableOptions: Partial<TableOptionsIf> = {}) {
  const listener = new EventAdapter();
  const modelChanges: GeModelChangeEvent[] = [];
  listener.onModelChanged = e => modelChanges.push(e);
  const fm = new FocusModel('cell');
  const columnDefs = [
    ColumnDef.create({ property: 'id', width: px100 }),
    ColumnDef.create({ property: 'name', width: px100, editable: TrueFn }),
    ColumnDef.create({ property: 'value', width: px100, editable: TrueFn, editInputPipe: editInputPipeForNumber }),
    ColumnDef.create({
      property: 'status', width: px100, editable: TrueFn,
      getEditRenderer: () => SelectCellRenderer.create(['open', 'paid', 'void']),
    }),
  ];
  const table = mountTable(TableFactory.createTableModel({ rows, columnDefs }), {
    eventListener: listener,
    tableOptions: { getFocusModel: () => fm, ...tableOptions },
  });
  await nextFrame();
  table.host.focus();
  return { ...table, rows, fm, modelChanges };
}

const editorInput = (host: HTMLElement) => host.querySelector<HTMLInputElement>('input.ge-table-cell-editor-input');
const editorSelect = (host: HTMLElement) => host.querySelector<HTMLSelectElement>('select.ge-table-cell-editor-select');
const cellText = (host: HTMLElement, r: number, c: number) => getCellDiv(host, 'body', 'center', r, c).textContent;

describe('InputCellRenderer (default editor of TableOptions.getEditRenderer)', () => {

  it('F2 renders a focused text input with the current value selected', async () => {
    const { host, fm, scope } = await mountEditTable();
    fm.setFocus(3, 1);
    await userEvent.keyboard('{F2}');
    const input = editorInput(host)!;
    expect(scope.isEditing()).toBe(true);
    expect(input.closest('.ge-table-col-div')).toBe(getCellDiv(host, 'body', 'center', 3, 1));
    expect(input.closest('.ge-table-col-div')!.classList).toContain('ge-table-row-input-div');
    expect(input.value).toBe('Name 3');
    expect(document.activeElement).toBe(input);
    expect([input.selectionStart, input.selectionEnd]).toEqual([0, 'Name 3'.length]);
    expect(input.dataset).toMatchObject({ area: 'body', rowIndex: '3', colIndex: '1', inputType: 'text' });
  });

  it('typing + Enter writes the value into the row, fires onModelChanged and closes the editor', async () => {
    const { host, fm, scope, rows, modelChanges } = await mountEditTable();
    fm.setFocus(3, 1);
    await userEvent.keyboard('{F2}');
    await userEvent.keyboard('Hello{Enter}');
    expect(rows[3].name).toBe('Hello');
    expect(modelChanges).toHaveLength(1);
    expect(modelChanges[0].cells).toEqual([{ rowIndex: 3, columnIndex: 1 }]);
    expect(scope.isEditing()).toBe(false);
    expect(editorInput(host)).toBeNull();
    expect(cellText(host, 3, 1)).toBe('Hello');
    expect(document.activeElement).toBe(host); // keyboard navigation continues
  });

  it('a double click on an editable cell opens the editor', async () => {
    const { host, scope } = await mountEditTable();
    await userEvent.dblClick(getCellDiv(host, 'body', 'center', 5, 1));
    expect(scope.isEditing()).toBe(true);
    expect(editorInput(host)!.value).toBe('Name 5');
    expect(document.activeElement).toBe(editorInput(host));
  });

  it('a double click on a non-editable cell opens no editor', async () => {
    const { host, scope } = await mountEditTable();
    await userEvent.dblClick(getCellDiv(host, 'body', 'center', 5, 0));
    expect(scope.isEditing()).toBe(false);
    expect(editorInput(host)).toBeNull();
  });

  it('the editInputPipe of the column converts the text (editInputPipeForNumber → number)', async () => {
    const { fm, rows } = await mountEditTable();
    fm.setFocus(2, 2);
    await userEvent.keyboard('{F2}');
    await userEvent.keyboard('42{Enter}');
    expect(rows[2].value).toBe(42);
  });

  it('leaving the editor (blur) commits the typed text as well', async () => {
    const { host, fm, rows, scope } = await mountEditTable();
    fm.setFocus(3, 1);
    await userEvent.keyboard('{F2}');
    await userEvent.keyboard('Blurred');
    await userEvent.click(getCellDiv(host, 'body', 'center', 8, 0));
    expect(rows[3].name).toBe('Blurred');
    expect(scope.isEditing()).toBe(false);
  });

  it('TableOptions.getEditRenderer returning undefined: no editor', async () => {
    const { host, fm, scope } = await mountEditTable(undefined, { getEditRenderer: () => undefined });
    fm.setFocus(3, 1);
    await userEvent.keyboard('{F2}');
    expect(scope.isEditing()).toBe(false);
    expect(editorInput(host)).toBeNull();
  });

  it('updateCells() for the cell being edited re-renders the editor with the new value', async () => {
    const { host, fm, api, scope } = await mountEditTable();
    fm.setFocus(3, 1);
    await userEvent.keyboard('{F2}');
    await userEvent.keyboard('typed');
    api.updateCells([{ area: 'body', rowIndex: 3, columnIndex: 1, value: 'From server', cssClasses: {} }]);
    // NOTE: a live update of the edited cell replaces the editor – the typed text is gone, the editor stays open.
    expect(scope.isEditing()).toBe(true);
    expect(editorInput(host)!.value).toBe('From server');
  });

  // BUG: no Escape handling at all (ShortcutService ignores keys in inputs, InputCellRenderer has no key handler) –
  // the editor stays open and the typed text is committed as soon as the input loses the focus.
  it.fails('Escape cancels the editing and keeps the old value', async () => {
    const { host, fm, rows, scope } = await mountEditTable();
    fm.setFocus(3, 1);
    await userEvent.keyboard('{F2}');
    await userEvent.keyboard('Typo{Escape}');
    expect(scope.isEditing()).toBe(false);
    expect(editorInput(host)).toBeNull();
    expect(rows[3].name).toBe('Name 3');
  });

  // Regression: input-cell-renderer.ts wrote the value unescaped into value="…" – a double quote ended the attribute
  // (the rest of the text was lost, and committing the edit truncated the value).
  it('the editor shows a value with double quotes completely', async () => {
    const rows: Row[] = [{ id: 0, name: 'He said "hi"', value: 1, status: 'open' }];
    const { host, fm } = await mountEditTable(rows);
    fm.setFocus(0, 1);
    await userEvent.keyboard('{F2}');
    expect(editorInput(host)!.value).toBe('He said "hi"');
  });

  it('a value with markup is edited as text (no HTML injection)', async () => {
    const xss = '"><img src="x" onerror="geXss = 1">';
    const rows: Row[] = [{ id: 0, name: xss, value: 1, status: 'open' }];
    const { host, fm } = await mountEditTable(rows);
    fm.setFocus(0, 1);
    await userEvent.keyboard('{F2}');
    expect(editorInput(host)!.value).toBe(xss);
    expect(host.querySelector('img')).toBeNull();
  });

  // Regression: input-cell-renderer.ts – an empty cell (undefined) opened the editor with the text "undefined".
  it('an empty cell opens an empty editor', async () => {
    const rows: Row[] = [{ id: 0, value: 1, status: 'open' }];
    const { host, fm } = await mountEditTable(rows);
    expect(cellText(host, 0, 1)).toBe('');
    fm.setFocus(0, 1);
    await userEvent.keyboard('{F2}');
    expect(editorInput(host)!.value).toBe('');
  });
});

describe('SelectCellRenderer (ColumnDef.getEditRenderer)', () => {

  it('renders a focused select with the options and the current value selected', async () => {
    const { host } = await mountEditTable();
    await userEvent.dblClick(getCellDiv(host, 'body', 'center', 2, 3));
    const select = editorSelect(host)!;
    expect(select.closest('.ge-table-col-div')!.classList).toContain('ge-table-row-select-div');
    expect(Array.from(select.options, o => [o.value, o.textContent])).toEqual([['open', 'open'], ['paid', 'paid'], ['void', 'void']]);
    expect(select.value).toBe('open');
    expect(document.activeElement).toBe(select);
  });

  it('choosing an option writes it into the row and closes the editor', async () => {
    const { host, rows, modelChanges, scope } = await mountEditTable();
    await userEvent.dblClick(getCellDiv(host, 'body', 'center', 2, 3));
    await userEvent.selectOptions(editorSelect(host)!, 'paid');
    expect(rows[2].status).toBe('paid');
    expect(modelChanges[0].cells).toEqual([{ rowIndex: 2, columnIndex: 3 }]);
    expect(scope.isEditing()).toBe(false);
    expect(editorSelect(host)).toBeNull();
    expect(cellText(host, 2, 3)).toBe('paid');
  });

  it('the column editor wins over TableOptions.getEditRenderer, other columns keep the text input', async () => {
    const { host, fm, scope } = await mountEditTable();
    fm.setFocus(4, 3);
    await userEvent.keyboard('{F2}');
    expect(editorSelect(host)).not.toBeNull();
    expect(editorInput(host)).toBeNull();
    scope.resetEditorRenderer();
    scope.repaint();
    host.focus(); // the select had the keyboard focus
    fm.setFocus(4, 1);
    await userEvent.keyboard('{F2}');
    expect(editorInput(host)).not.toBeNull();
  });
});
