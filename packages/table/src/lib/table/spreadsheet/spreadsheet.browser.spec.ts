// Spreadsheet mode (prompt 013 stage 7): X1–X13.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import {
  ColumnDef, EventAdapter, FormulaBar, SpreadsheetFactory, TableFactory, TableOptions, applySpreadsheetPreset, isFormulaError,
  isSpreadsheetTableModel,
} from '@guiexpert/table';
import type { GeModelChangeEvent, SpreadsheetParamIf, TableOptionsIf } from '@guiexpert/table';
import { destroyAllTables, getCellDiv, mountTable, nextFrame } from '../../../../test-utils/mount-table';
import { axeViolations } from '../../../../test-utils/axe';

afterEach(destroyAllTables);

const DATA = (): unknown[][] => [
  ['Product', 'Price', 'Qty', 'Total'],
  ['Laptop', 1299, 2, '=B2*C2'],
  ['Monitor', 349, 3, '=B3*C3'],
  ['Mouse', 25, 10, '=B4*C4'],
  ['', '', '', '=SUM(D2:D4)'],
];
const A = 1, B = 2, C = 3, D = 4; // model columns behind the row numbers

async function sheet(param: Partial<SpreadsheetParamIf> = {}) {
  const changes: GeModelChangeEvent[] = [];
  const listener = new EventAdapter();
  listener.onModelChanged = e => changes.push(e);
  const { tableModel, tableOptions } = SpreadsheetFactory.create(param);
  const t = mountTable(tableModel, { tableOptions, eventListener: listener });
  await nextFrame();
  t.host.focus();
  const value = (r: number, c: number) => {
    const v = t.api.getCellValue(r, c);
    return isFormulaError(v) ? v.code : v;
  };
  return { ...t, tableModel, tableOptions, changes, value };
}

const clickHeader = (host: HTMLElement, col: number, init: MouseEventInit = {}) => {
  const cell = getCellDiv(host, 'header', col === 0 ? 'west' : 'center', 0, col);
  const r = cell.getBoundingClientRect();
  const opts = { bubbles: true, clientX: r.left + 5, clientY: r.top + 5, ...init };
  cell.dispatchEvent(new MouseEvent('mousedown', opts));
  cell.dispatchEvent(new MouseEvent('mouseup', opts));
  cell.dispatchEvent(new MouseEvent('click', opts));
};

describe('spreadsheet', () => {
  it('X1: an empty sheet A–Z × 1–100, focus on A1, typing, formulas, undo, range selection', async () => {
    const t = await sheet();
    expect(t.tableModel.getBodyModel().getRowCount()).toBe(100);
    expect(t.tableModel.getColumnCount()).toBe(27);
    expect(getCellDiv(t.host, 'header', 'center', 0, A).textContent).toBe('A');
    expect(getCellDiv(t.host, 'body', 'west', 0, 0).textContent).toBe('1');
    expect(t.api.getActiveCell()).toEqual([0, A]);
    await userEvent.keyboard('=1+1{Enter}');
    expect(t.value(0, A)).toBe(2);
    expect(t.api.getActiveCell()).toEqual([1, A]);
    await userEvent.keyboard('{Shift>}{ArrowRight}{ArrowDown}{/Shift}');
    expect(t.api.getSelectionModel()?.getRanges().at(-1)).toMatchObject({ r1: 1, c1: A, r2: 2, c2: B });
    expect(t.api.undo()).toBe(true);
    expect(t.value(0, A)).toBe('');
    expect(t.scope.getFillHandleOptions()).toBeDefined();
    expect(t.api.hasCellFormulas()).toBe(true);
  });

  it('X2: data with formulas; getSheetData returns the same', async () => {
    const t = await sheet({ data: DATA() });
    expect([1, 2, 3, 4].map(r => t.value(r, D))).toEqual([2598, 1047, 250, 3895]);
    expect(getCellDiv(t.host, 'body', 'center', 4, D).textContent).toBe('3895');
    expect(t.api.getSheetData()).toEqual(DATA());
    t.api.setCellInput(6, C, 'x');
    expect(t.api.getSheetData()).toHaveLength(7);
    expect(t.api.getSheetData()![5]).toEqual(['', '', '', '']);
  });

  it('X3: letters A … Z, AA; a letter selects the column, Shift extends, Ctrl adds; the corner selects all', async () => {
    const t = await sheet({ columnCount: 30 });
    expect(t.tableModel.getColumnDef(27)?.headerLabel).toBe('AA');
    clickHeader(t.host, B);
    const sm = t.api.getSelectionModel()!;
    expect(sm.isSelected(50, B)).toBe(true);
    expect(sm.isSelected(50, C)).toBe(false);
    expect(t.api.getActiveCell()?.[1]).toBe(B);
    clickHeader(t.host, D, { shiftKey: true });
    expect([B, C, D].every(c => sm.isSelected(10, c))).toBe(true);
    clickHeader(t.host, A, { ctrlKey: true });
    expect(sm.isSelected(3, A) && sm.isSelected(3, D)).toBe(true);
    clickHeader(t.host, 0); // the corner over the row numbers
    expect(sm.isAllSelected()).toBe(true);
    // a letter does not sort (double click)
    const cell = getCellDiv(t.host, 'header', 'center', 0, B);
    cell.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    expect(t.tableModel.getColumnDef(B)?.sortState).toBeFalsy();
  });

  it('X4: the formula bar shows address and input; typing there writes the cell, Escape restores', async () => {
    const t = await sheet({ data: DATA() });
    const container = document.createElement('div');
    document.body.appendChild(container);
    const bar = new FormulaBar(container, t.api);
    t.api.goToAddress('D3');
    expect(bar.addressInput.value).toBe('D3');
    expect(bar.input.value).toBe('=B3*C3');
    // the cell editor: live
    t.host.focus();
    await userEvent.keyboard('{F2}*2');
    expect(bar.input.value).toBe('=B3*C3*2');
    await userEvent.keyboard('{Escape}');
    expect(bar.input.value).toBe('=B3*C3');
    // typing in the bar
    bar.input.focus();
    bar.input.value = '=B3*10';
    bar.input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(t.value(2, D)).toBe(3490);
    expect(t.api.getActiveCell()).toEqual([3, D]);
    expect(bar.addressInput.value).toBe('D4');
    bar.input.focus();
    bar.input.value = 'nope';
    bar.input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(t.value(3, D)).toBe(250);
    expect(bar.input.value).toBe('=B4*C4');
    expect(document.activeElement).toBe(t.host);
    // Tab moves right
    bar.input.focus();
    bar.input.value = '7';
    bar.input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(t.value(3, D)).toBe(7); // a number (the sheet's input pipe)
    expect(t.api.getActiveCell()).toEqual([3, D + 1]);
    expect(await axeViolations(container)).toEqual([]);
    bar.destroy();
    expect(container.children).toHaveLength(0);
    container.remove();
  });

  it('X5: the address box goes to D10 and selects B2:C5; an invalid address is marked', async () => {
    const t = await sheet();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const bar = new FormulaBar(container, t.api, { ariaLabel: 'Formel', addressAriaLabel: 'Adresse' });
    expect(bar.input.getAttribute('aria-label')).toBe('Formel');
    const enter = (text: string) => {
      bar.addressInput.focus();
      bar.addressInput.value = text;
      bar.addressInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    };
    enter('D10');
    expect(t.api.getActiveCell()).toEqual([9, D]);
    enter('B2:C5');
    expect(t.api.getSelectionModel()?.getRanges().at(-1)).toMatchObject({ r1: 1, c1: B, r2: 4, c2: C });
    enter('nonsense');
    expect(bar.addressInput.getAttribute('aria-invalid')).toBe('true');
    bar.addressInput.dispatchEvent(new Event('input'));
    expect(bar.addressInput.hasAttribute('aria-invalid')).toBe(false);
    enter('ZZ1');
    bar.addressInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(bar.addressInput.hasAttribute('aria-invalid')).toBe(false);
    bar.destroy();
    container.remove();
  });

  it('X6/S8: insert and delete rows and columns adjust the formulas, each one undo step', async () => {
    const t = await sheet({ data: DATA() });
    expect(t.api.insertRows(2, 1)).toBe(true); // before row 3
    expect(t.api.getCellInput(5, D)).toBe('=SUM(D2:D5)');
    expect(t.api.getCellInput(3, D)).toBe('=B4*C4');
    expect(t.value(5, D)).toBe(3895);
    expect(t.changes.at(-1)?.source).toBe('structure');
    expect(t.api.deleteRows(2, 2)).toBe(true); // rows 3 and 4 (the new one and Monitor)
    expect(t.api.getCellInput(3, D)).toBe('=SUM(D2:D3)');
    expect(t.value(3, D)).toBe(2848);
    t.api.setCellInput(6, A, '=B3');
    t.api.deleteRows(2, 1);
    expect(t.api.getCellInput(5, A)).toBe('=#REF!');
    // columns
    expect(t.api.insertColumns(1, 1)).toBe(true); // a new column B
    expect(t.tableModel.getColumnCount()).toBe(28);
    expect(t.api.getCellInput(1, D + 1)).toBe('=C2*D2');
    expect(t.value(1, D + 1)).toBe(2598);
    expect(t.api.deleteColumns(0, 1)).toBe(true); // A
    expect(t.api.getCellInput(1, D)).toBe('=B2*C2');
    // undo: one step each, back to the start
    for (let i = 0; i < 5; i++) expect(t.api.undo()).toBe(true); // setCellInput (api) is no step – its cell stays
    expect(JSON.stringify(t.api.getSheetData()!.slice(0, 5).map(r => r.slice(0, 4)))).toBe(JSON.stringify(DATA()));
    expect(t.value(4, D)).toBe(3895);
    expect(t.api.redo()).toBe(true);
    expect(t.api.getCellInput(5, D)).toBe('=SUM(D2:D5)');
    // invalid edits
    expect(t.api.deleteRows(500, 1)).toBe(false);
    expect(t.api.insertRows(-1)).toBe(false);
    expect(t.api.insertRows(0, 0)).toBe(false);
  });

  it('X6: object rows – rows only, the app array changes in place; arrays', async () => {
    const rows = [{ a: 1, b: '=A1*2' }, { a: 2, b: '=SUM(A1:A2)' }];
    const t = mountTable(TableFactory.createTableModel({
      rows, columnDefs: [ColumnDef.create({ property: 'a' }), ColumnDef.create({ property: 'b' })],
    }), { tableOptions: { spreadsheet: true, clipboard: { createRow: () => ({ a: 10, b: '' }) } } });
    await nextFrame();
    expect(t.api.insertRows(1, 1)).toBe(true);
    expect(rows).toHaveLength(3);
    expect(rows[1]).toEqual({ a: 10, b: '' });
    expect(rows[2].b).toBe('=SUM(A1:A3)');
    expect(t.api.getCellValue(2, 1)).toBe(13);
    expect(t.api.insertColumns(0)).toBe(false);
    expect(t.api.getSheetData()).toBeUndefined();
    t.api.undo();
    expect(rows).toEqual([{ a: 1, b: '=A1*2' }, { a: 2, b: '=SUM(A1:A2)' }]);
    expect(t.api.getCellValue(1, 1)).toBe(3);
    t.api.deleteRows(0);
    expect(rows[0].b).toBe('=SUM(A1:A1)');
    const arrays = mountTable(TableFactory.createTableModel({ headerData: [['a', 'b']], bodyData: [[1, '=A1+1'], [2, '=A2+B1']] } as never),
      { tableOptions: { cellFormulas: true } });
    await nextFrame();
    expect(arrays.api.insertRows(0, 2)).toBe(true);
    expect(arrays.api.getCellInput(3, 1)).toBe('=A4+B3');
    expect(arrays.api.getCellValue(3, 1)).toBe(4);
    arrays.scope.undoService ?? expect(arrays.api.undo()).toBe(false);
    const plain = mountTable(TableFactory.createTableModel({ rows: [{ a: 1 }], columnDefs: [ColumnDef.create({ property: 'a' })] }),
      { tableOptions: { undo: true } });
    expect(plain.api.insertRows(1, 2)).toBe(true);
    expect(plain.api.getTableScope().tableModel.getBodyModel().getRowCount()).toBe(3);
    expect(plain.api.undo()).toBe(true);
    expect(plain.api.getTableScope().tableModel.getBodyModel().getRowCount()).toBe(1);
    const undoArrays = mountTable(TableFactory.createTableModel({ headerData: [['a', 'b']], bodyData: [[1, '=A1+1']] } as never),
      { tableOptions: { cellFormulas: true, undo: true } });
    undoArrays.api.insertRows(0, 1);
    expect(undoArrays.api.getCellInput(1, 1)).toBe('=A2+1');
    undoArrays.api.undo();
    expect(undoArrays.api.getCellInput(0, 1)).toBe('=A1+1');
    expect(undoArrays.api.getCellValue(0, 1)).toBe(2);
  });

  it('X7: a million empty rows stay sparse and quick', async () => {
    const start = performance.now();
    const t = await sheet({ rowCount: 1_000_000, data: [[1, '=A1*2']] });
    expect(performance.now() - start).toBeLessThan(3000);
    expect(t.value(0, B)).toBe(2);
    t.api.scrollToIndex(1, 999_990);
    await nextFrame();
    expect(t.tableModel.getBodyModel().getRowCount()).toBe(1_000_000);
    expect(t.host.textContent).toContain('1000000');
    t.api.setCellInput(999_999, A, '=A1+1');
    expect(t.value(999_999, A)).toBe(2);
    expect(t.api.getSheetData()).toHaveLength(1_000_000);
  });

  it('X8: existing object data with spreadsheet: true – letters above the labels, formulas in released columns', async () => {
    const rows = [{ product: 'Laptop', price: 1299, qty: 2, total: '=B1*C1' }];
    const tableOptions: TableOptionsIf = { ...new TableOptions(), spreadsheet: { cellFormulas: { columns: ['total'] } } };
    const t = mountTable(TableFactory.createTableModel({
      rows, rowNumbersVisible: { mode: 'original' }, columnLetters: true,
      columnDefs: ['product', 'price', 'qty', 'total'].map(property => ColumnDef.create({ property, headerLabel: property })),
    }), { tableOptions });
    await nextFrame();
    expect(getCellDiv(t.host, 'header', 'center', 0, 1).textContent).toBe('A');
    expect(getCellDiv(t.host, 'header', 'center', 1, 1).textContent).toBe('product');
    expect(getCellDiv(t.host, 'header', 'west', 0, 0).textContent).toBe('');
    expect(t.api.getCellValue(0, 4)).toBe(2598);
    const o = applySpreadsheetPreset(t.scope.tableOptions);
    expect(o.editing).toEqual({ defaultEditable: true });
    expect([o.clipboard, o.undo, o.fillHandle]).toEqual([true, true, true]);
    expect(tableOptions.undo).toBeUndefined(); // the app's object is not changed
    t.api.setCellInput(0, 'product', '=1+1');
    expect(t.api.getCellValue(0, 'product')).toBe('=1+1'); // not released
    // the Excel export leaves the letters out
    const download = vi.spyOn(t.scope.excelService, 'downloadExcel').mockResolvedValue(undefined);
    await t.api.downloadExcel('x.xlsx', '', { cellFormulas: true });
    const matrix = download.mock.calls[0][0];
    expect(matrix[0]).toEqual(['product', 'price', 'qty', 'total']);
    expect(matrix[1][3]).toEqual({ formula: 'B2*C2', value: 2598 });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    TableFactory.createTableModel({ rows, headerAreaModel: TableFactory.createTableModel({ rows }).getAreaModel('header'), columnLetters: true });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('columnLetters'));
  });

  it('X8: the preset fills only unset options; parts can be switched off', () => {
    const o = applySpreadsheetPreset({ ...new TableOptions(), spreadsheet: { undo: false, editing: { enterMoves: 'right' } }, clipboard: false });
    expect(o.undo).toBeUndefined();
    expect(o.clipboard).toBe(false);
    expect(o.editing).toEqual({ defaultEditable: true, enterMoves: 'right' });
    expect(o.cellFormulas).toBe(true);
    const plain = new TableOptions();
    expect(applySpreadsheetPreset(plain)).toBe(plain);
    expect(plain.editing).toBeUndefined();
    const shared = Object.freeze({ ...new TableOptions(), spreadsheet: true });
    expect(applySpreadsheetPreset(shared)).not.toBe(shared); // a copy: frozen or shared objects stay as they are
  });

  it('X11: Excel export of a sheet with real formulas (no letter row)', async () => {
    const t = await sheet({ data: DATA() });
    const download = vi.spyOn(t.scope.excelService, 'downloadExcel').mockResolvedValue(undefined);
    await t.api.downloadExcel('sheet.xlsx', '', { cellFormulas: true });
    const matrix = download.mock.calls[0][0];
    expect(matrix[0][0]).toBe('Product');
    expect(matrix[1][3]).toEqual({ formula: 'B2*C2', value: 2598 });
    expect(matrix[4][3]).toEqual({ formula: 'SUM(D2:D4)', value: 3895 });
  });

  it('X12: keyboard only, dark mode, right to left, axe', async () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    try {
      const t = await sheet({ data: DATA(), tableOptions: { direction: 'rtl' } });
      await userEvent.keyboard('{ArrowDown}{ArrowLeft}'); // rtl: ← goes forward (to B)
      expect(t.api.getActiveCell()).toEqual([1, B]);
      await userEvent.keyboard('5{Tab}');
      expect(t.value(1, D)).toBe(10);
      expect(await axeViolations(t.host)).toEqual([]);
    } finally {
      document.documentElement.removeAttribute('data-theme');
    }
  });

  it('sorting and filtering a sheet keep the row numbers and references of the physical rows', async () => {
    const t = await sheet({ data: DATA(), rowCount: 6 });
    t.api.sortByColumn(B, 'asc');
    await nextFrame();
    expect(t.api.getCellAddress(0, D)).toBe('D4'); // Mouse 25 first
    expect(getCellDiv(t.host, 'body', 'west', 0, 0).textContent).toBe('4');
    expect(t.value(0, D)).toBe(250);
    t.api.sortByColumn(B, '');
    t.scope.tableOptions.externalFilterFunction = (row: unknown[]) => row[0] !== 'Monitor';
    t.api.externalFilterChanged();
    expect(t.tableModel.getBodyModel().getRowCount()).toBe(5);
    expect(t.api.getSheetValue('D5')).toBe(3895);
    expect(t.api.getCellByAddress('D3')).toEqual([-1, D]);
  });

  it('factory parameters; formula bar details', async () => {
    const t = await sheet({
      data: [[new Date(2026, 0, 2), '=MYFN()']], rowNumbers: false, columnWidth: 80, rowHeight: 24, columnCount: 3,
      functions: { MYFN: () => 42 }, tableOptions: { undo: false },
    });
    expect(isSpreadsheetTableModel(t.tableModel)).toBe(true);
    expect(t.tableModel.getColumnCount()).toBe(3);
    expect(t.tableModel.getColumnWidth(0)).toBe(80);
    expect(t.api.getCellValue(0, 1)).toBe(42);
    expect(t.api.getActiveCell()).toEqual([0, 0]);
    expect(t.scope.undoService).toBeUndefined();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const bar = new FormulaBar(container, t.api, { addressBox: false });
    expect(bar.addressInput.hidden).toBe(true);
    expect(bar.input.value).toBe('2026-01-02');
    // no active cell: disabled
    t.tableOptions.getFocusModel!()!.clear();
    bar.show();
    expect(bar.input.disabled).toBe(true);
    t.api.goToAddress('B1');
    expect(bar.input.disabled).toBe(false);
    // typing in the bar: other events don't overwrite it; IME keys and other keys are left alone
    bar.input.focus();
    bar.input.value = '=1';
    bar.show();
    t.scope.getEventListener().onEditingChanged?.({ type: 'input', input: 'x' } as never);
    expect(bar.input.value).toBe('=1');
    bar.input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', isComposing: true }));
    bar.input.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    expect(t.api.getCellInput(0, 1)).toBe('=MYFN()');
    bar.input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true }));
    expect(t.api.getCellValue(0, 1)).toBe(1);
    expect(t.api.getActiveCell()).toEqual([0, 1]); // Shift+Enter: up (already in row 1)
    bar.input.focus();
    bar.input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true }));
    expect(t.api.getActiveCell()).toEqual([0, 0]);
    // blur writes a changed input
    bar.input.focus();
    bar.input.value = 'blurred';
    t.host.focus();
    expect(t.api.getCellValue(0, 0)).toBe('blurred');
    bar.destroy();
    container.remove();
  });

  it('structure edits: clamping, an open editor, unsupported models', async () => {
    const t = await sheet({ data: DATA(), rowCount: 5 });
    expect(t.api.deleteRows(3, 10)).toBe(true); // clamped to the last rows
    expect(t.tableModel.getBodyModel().getRowCount()).toBe(3);
    expect(t.api.insertRows(9, 1)).toBe(false);
    t.api.goToAddress('A1');
    t.host.focus();
    await userEvent.keyboard('{F2}x');
    expect(t.api.insertRows(0)).toBe(true); // commits the editor first
    expect(t.api.getCellInput(1, A)).toBe('Productx');
    const tree = mountTable(TableFactory.createTableModel({
      rows: [{ name: 'a' }], columnDefs: [ColumnDef.create({ property: 'name' })],
    }), {});
    expect(tree.api.deleteRows(0)).toBe(true); // no formulas needed
    expect(tree.api.insertColumns(0)).toBe(false);
  });

  describe('review of stage 7', () => {
    it('#1: typed numbers are numbers – SUM works', async () => {
      const t = await sheet({ locale: 'en-US' });
      await userEvent.keyboard('5{Enter}6{Enter}=SUM(A1:A2){Enter}TRUE{Enter}');
      expect([0, 1, 2, 3].map(r => t.value(r, A))).toEqual([5, 6, 11, true]);
    });

    it('#2/#3: structure undo keeps the rows – earlier and later steps still apply', async () => {
      const t = await sheet({ data: DATA() });
      t.api.goToAddress('B2');
      t.host.focus();
      await userEvent.keyboard('5{Enter}');
      t.api.insertRows(0);
      t.api.undo();
      t.api.undo();
      expect(t.value(1, B)).toBe(1299);
      t.api.redo();
      t.api.redo();
      expect(t.value(2, B)).toBe(5);
      const rows = [{ a: 1 }, { a: 2 }];
      const o = mountTable(TableFactory.createTableModel({ rows, columnDefs: [ColumnDef.create({ property: 'a' })] }),
        { tableOptions: { spreadsheet: { cellFormulas: false } } });
      o.api.insertRows(1);
      o.api.applyCellChanges([{ rowIndex: 1, column: 0, value: 43 }], 'edit');
      o.api.undo();
      o.api.undo();
      o.api.redo();
      o.api.redo();
      expect(rows).toEqual([{ a: 1 }, { a: 43 }, { a: 2 }]);
    });

    it('#4: a formula bar edit is one undo step', async () => {
      const t = await sheet({ data: DATA() });
      const container = document.createElement('div');
      document.body.appendChild(container);
      const bar = new FormulaBar(container, t.api);
      t.api.goToAddress('B2');
      bar.input.focus();
      bar.input.value = '7';
      bar.input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      expect(t.value(1, B)).toBe(7);
      expect(t.api.undo()).toBe(true);
      expect(t.value(1, B)).toBe(1299);
      bar.destroy();
      container.remove();
    });

    it('#5/#7/#8/#11: no structure edit in a batch; the factory respects the preset; the active cell stays; property', async () => {
      const t = await sheet({ data: DATA(), tableOptions: { spreadsheet: { cellFormulas: false } } });
      expect(t.api.hasCellFormulas()).toBe(false);
      const f = await sheet({ data: DATA(), columnCount: 4 });
      f.api.startBatchEdit();
      expect(f.api.insertRows(0)).toBe(false);
      f.api.cancelBatchEdit();
      f.api.goToAddress('D2');
      expect(f.api.deleteColumns(3)).toBe(true);
      expect(f.api.getActiveCell()).toEqual([1, C]);
      f.api.insertRows(1);
      expect(f.changes.at(-1)!.changes!.every(c => c.property !== undefined)).toBe(true);
      const rows = [{ a: 1, b: '=A1+1' }];
      const o = mountTable(TableFactory.createTableModel({ rows, columnDefs: [ColumnDef.create({ property: 'a' }), ColumnDef.create({ property: 'b' })] }),
        { tableOptions: { spreadsheet: true } });
      const events: GeModelChangeEvent[] = [];
      o.api.subscribe({ onModelChanged: e => events.push(e) });
      o.api.insertRows(0);
      expect(events[0].changes![0]).toMatchObject({ property: 'b', oldValue: '=A1+1', newValue: '=A2+1' });
      o.api.undo();
      o.api.redo();
      expect(events.map(e => e.source)).toEqual(['structure', 'undo', 'redo']);
    });

    it('structure undo/redo: formulas left of the change, deleted rows of plain arrays, own texts, a refused editor', async () => {
      const announced: string[] = [];
      const own = (n: number) => `own ${n}`;
      const t = await sheet({
        data: [['=C1', 1, 2, '=B1+C1']],
        tableOptions: { ariaTexts: { rowsInserted: own, rowsDeleted: own, columnsInserted: own, columnsDeleted: own } as never },
      });
      vi.spyOn(t.scope, 'announce').mockImplementation(text => { announced.push(String(text)); });
      t.api.insertColumns(1); // A stays left of the change
      expect(t.api.getCellInput(0, A)).toBe('=D1');
      t.api.deleteColumns(2); // the old B: A stays, E moves to D
      expect(t.api.getCellInput(0, A)).toBe('=C1');
      expect(t.api.getCellInput(0, D)).toBe('=#REF!+C1');
      t.api.insertRows(0);
      t.api.deleteRows(0);
      expect(announced).toEqual(['own 1', 'own 1', 'own 1', 'own 1']);
      for (let i = 0; i < 4; i++) t.api.undo();
      expect(JSON.stringify(t.api.getSheetData()![0].slice(0, 4))).toBe(JSON.stringify(['=C1', 1, 2, '=B1+C1']));
      for (let i = 0; i < 4; i++) t.api.redo();
      expect(t.api.getCellInput(0, A)).toBe('=C1');
      // plain arrays: delete, undo, redo
      const arr = [[1], [2], [3]];
      const p = mountTable(TableFactory.createTableModel({ headerData: [['a']], bodyData: arr } as never), { tableOptions: { undo: true } });
      expect(p.api.deleteRows(0, 2)).toBe(true);
      expect(arr).toEqual([[3]]);
      p.api.undo();
      expect(arr).toEqual([[1], [2], [3]]);
      p.api.redo();
      expect(arr).toEqual([[3]]);
      // an editor that can't commit (invalid value) blocks the edit
      const v = await sheet({ data: DATA() });
      vi.spyOn(v.scope.cellEditorService!, 'isOpen').mockReturnValue(true);
      vi.spyOn(v.scope.cellEditorService!, 'commit').mockReturnValue(false);
      expect(v.api.insertRows(0)).toBe(false);
    });

    it('#9: the Excel export of a sheet ends at the last filled cell', async () => {
      const t = await sheet({ data: DATA(), rowCount: 200_000, columnCount: 26 });
      const download = vi.spyOn(t.scope.excelService, 'downloadExcel').mockResolvedValue(undefined);
      await t.api.downloadExcel('x.xlsx');
      const matrix = download.mock.calls[0][0];
      expect(matrix).toHaveLength(5);
      expect(matrix[0]).toHaveLength(4); // A–D (the row numbers are not exported)
    });
  });
});
