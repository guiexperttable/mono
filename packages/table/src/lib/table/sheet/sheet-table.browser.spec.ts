// Cell formulas in the table (prompt 013 stage 5): S3, S6–S13, S20, S22–S24 and the rules of design § 6.9.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import {
  CellRange,
  ColumnDef,
  EventAdapter,
  FocusModel,
  SelectionModel,
  TableFactory,
  TreeFactory,
  TrueFn,
  isFormulaError,
  px100,
} from '@guiexpert/table';
import type { CellFormulaOptionsIf, ColumnDefIf, GeModelChangeEvent, TableOptionsIf } from '@guiexpert/table';
import { destroyAllTables, getCellDiv, mountTable, nextFrame } from '../../../../test-utils/mount-table';

afterEach(destroyAllTables);

interface Row { product: string; price: unknown; qty: unknown; total: unknown; extra?: unknown }
const PRODUCT = 0, PRICE = 1, QTY = 2, TOTAL = 3, EXTRA = 4;

/** The reference sheet of the prompt: row 1 holds the header texts as data. */
function sheetRows(): Row[] {
  return [
    { product: 'Product', price: 'Price', qty: 'Qty', total: 'Total', extra: '' },
    { product: 'Laptop', price: 1299, qty: 2, total: '=B2*C2', extra: '' },
    { product: 'Monitor', price: 349, qty: 3, total: '=B3*C3', extra: '' },
    { product: 'Mouse', price: 25, qty: 10, total: '=B4*C4', extra: '' },
    { product: '', price: null, qty: null, total: '=SUM(D2:D4)', extra: '' },
  ];
}

function columns(extra: Partial<Record<keyof Row, Partial<ColumnDefIf>>> = {}): ColumnDefIf[] {
  return (['product', 'price', 'qty', 'total', 'extra'] as const).map(property => ColumnDef.create({
    property, headerLabel: property, width: px100, editable: TrueFn, sortable: TrueFn, ...(extra[property] as object),
  }));
}

async function mount(opts: {
  rows?: Row[]; cellFormulas?: boolean | Partial<CellFormulaOptionsIf>; tableOptions?: Partial<TableOptionsIf>;
  columnDefs?: ColumnDefIf[]; footerAggregates?: Record<string, string>;
} = {}) {
  const rows = opts.rows ?? sheetRows();
  const listener = new EventAdapter();
  const changes: GeModelChangeEvent[] = [];
  listener.onModelChanged = e => changes.push(e);
  const fm = new FocusModel('cell');
  const sm = new SelectionModel('range', 'multi');
  const t = mountTable(TableFactory.createTableModel({
    rows, columnDefs: opts.columnDefs ?? columns(), ...(opts.footerAggregates ? { footerAggregates: opts.footerAggregates } : {}),
  } as never), {
    eventListener: listener,
    tableOptions: {
      getFocusModel: () => fm, getSelectionModel: () => sm, editing: true, clipboard: true, fillHandle: true, undo: true,
      cellFormulas: opts.cellFormulas ?? true, ...opts.tableOptions,
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
  const value = (r: number, c: number | string) => {
    const v = t.api.getCellValue(r, c);
    return isFormulaError(v) ? v.code : v;
  };
  return { ...t, rows, fm, sm, changes, focus, value };
}

const clip = (host: HTMLElement, kind: 'copy' | 'cut' | 'paste', dt = new DataTransfer()) => {
  host.dispatchEvent(new ClipboardEvent(kind, { clipboardData: dt, bubbles: true, cancelable: true }));
  return dt;
};

describe('cell formulas in the table', () => {

  it('S1/S2/S24: values, rendered text, the data keep the formula text', async () => {
    const t = await mount();
    expect([1, 2, 3, 4].map(r => t.value(r, TOTAL))).toEqual([2598, 1047, 250, 3895]);
    expect(getCellDiv(t.host, 'body', 'center', 1, TOTAL).textContent).toBe('2598');
    expect(getCellDiv(t.host, 'body', 'center', 4, TOTAL).textContent).toBe('3895');
    expect(t.rows[1].total).toBe('=B2*C2');
    expect(t.api.getCellInput(1, 'total')).toBe('=B2*C2');
    expect(t.api.hasCellFormulas()).toBe(true);
    expect(t.api.getSheetEngine()?.getFormulaCount()).toBe(4);
  });

  it('S3: a write recalculates only the dependents – before the repaint', async () => {
    const t = await mount();
    const engine = t.api.getSheetEngine()!;
    const spy = vi.spyOn(engine, 'inputsChanged');
    expect(t.api.setCellInput(3, 'price', 30)).toBe(true);
    expect([t.value(3, TOTAL), t.value(4, TOTAL)]).toEqual([300, 3945]);
    expect(spy.mock.results[0].value.evaluated).toBe(2);
    expect(getCellDiv(t.host, 'body', 'center', 4, TOTAL).textContent).toBe('3945');
    expect(t.changes.at(-1)?.changes?.[0]).toMatchObject({ property: 'price', oldValue: 25, newValue: 30 });
  });

  it('S13/S24: F2 shows the formula, typing a formula stores its text (no editInputPipe, no validate)', async () => {
    const validate = vi.fn(() => 'never');
    const pipe = vi.fn((v: unknown) => Number(v));
    const t = await mount({ columnDefs: columns({ total: { validate, editInputPipe: pipe } }) });
    t.focus(1, TOTAL);
    await userEvent.keyboard('{F2}');
    const input = t.host.querySelector<HTMLInputElement>('.ge-table-cell-editor input')!;
    expect(input.value).toBe('=B2*C2');
    expect(getCellDiv(t.host, 'body', 'center', 1, TOTAL).textContent).toBe('2598');
    await userEvent.keyboard('{Escape}');
    t.focus(2, TOTAL);
    await userEvent.keyboard('=B3*2{Enter}');
    expect(t.rows[2].total).toBe('=B3*2');
    expect(t.value(2, TOTAL)).toBe(698);
    expect(t.value(4, TOTAL)).toBe(2598 + 698 + 250);
    expect(validate).not.toHaveBeenCalled();
    expect(pipe).not.toHaveBeenCalled();
    expect(t.changes.at(-1)?.changes?.[0]).toMatchObject({ oldValue: '=B3*C3', newValue: '=B3*2' });
  });

  it('S22: undo after a formula change brings formula and values back', async () => {
    const t = await mount();
    t.focus(1, TOTAL);
    await userEvent.keyboard('=B2*3{Enter}');
    expect(t.value(4, TOTAL)).toBe(3897 + 1047 + 250);
    expect(t.api.undo()).toBe(true);
    expect(t.rows[1].total).toBe('=B2*C2');
    expect([t.value(1, TOTAL), t.value(4, TOTAL)]).toEqual([2598, 3895]);
    expect(t.api.redo()).toBe(true);
    expect(t.value(1, TOTAL)).toBe(3897);
  });

  it('S6: the fill handle moves the references of formulas ($ parts stay)', async () => {
    const rows = sheetRows();
    rows[1].extra = '=D2*$B$2';
    const t = await mount({ rows });
    expect(t.api.fillRange(new CellRange(1, TOTAL, 1, EXTRA), 'down', 2)).toBe(4);
    expect([t.rows[2].total, t.rows[3].total]).toEqual(['=B3*C3', '=B4*C4']);
    expect([t.rows[2].extra, t.rows[3].extra]).toEqual(['=D3*$B$2', '=D4*$B$2']);
    expect(t.value(3, EXTRA)).toBe(250 * 1299);
    // upwards: references move up
    t.api.fillRange(new CellRange(4, TOTAL, 4, TOTAL), 'up', 1);
    expect(t.rows[3].total).toBe('=SUM(D1:D3)');
  });

  it('S7: copy and paste inside the table moves the references; outside the sheet #REF!', async () => {
    const t = await mount();
    t.focus(1, TOTAL);
    const dt = clip(t.host, 'copy');
    expect(dt.getData('text/plain')).toBe('2598'); // other apps get the value
    t.focus(2, EXTRA);
    clip(t.host, 'paste', dt);
    expect(t.rows[2].extra).toBe('=C3*D3');
    expect(t.value(2, EXTRA)).toBe(3 * 1047);
    t.focus(2, PRICE);
    clip(t.host, 'paste', dt);
    expect(t.rows[2].price).toBe('=#REF!*A3');
    expect(t.value(2, PRICE)).toBe('#REF!');
    // text from another app: a formula text is a formula too
    t.focus(0, EXTRA);
    const external = new DataTransfer();
    external.setData('text/plain', '=SUM(D2,D4)');
    clip(t.host, 'paste', external);
    expect(t.value(0, EXTRA)).toBe(2598 + 250);
    expect(t.value(4, TOTAL)).toBe('#REF!'); // D3 reads the #REF! of B3
  });

  it('S7: a cut formula moves unchanged', async () => {
    const t = await mount();
    t.focus(1, TOTAL);
    const dt = clip(t.host, 'cut');
    t.focus(1, EXTRA);
    clip(t.host, 'paste', dt);
    expect(t.rows[1].extra).toBe('=B2*C2');
    expect(t.rows[1].total).toBe('');
    expect(t.value(1, EXTRA)).toBe(2598);
  });

  it('S9/S10: sorting and filters keep the references at the physical rows', async () => {
    const t = await mount();
    t.api.sortByColumn('price', 'desc');
    await nextFrame();
    const addresses = [0, 1, 2, 3, 4].map(i => t.api.getCellAddress(i, 'total'));
    expect(addresses).not.toEqual(['D1', 'D2', 'D3', 'D4', 'D5']);
    expect([...addresses].sort()).toEqual(['D1', 'D2', 'D3', 'D4', 'D5']);
    for (let i = 0; i < 5; i++) {
      const address = t.api.getCellAddress(i, 'total')!;
      expect(t.value(i, TOTAL)).toEqual(t.api.getSheetValue(address));
    }
    expect(t.api.getSheetValue('D5')).toBe(3895);
    t.api.sortByColumn('price', '');
    t.scope.tableOptions.externalFilterFunction = (row: Row) => row.product !== 'Monitor';
    t.api.externalFilterChanged();
    expect(t.api.getCellByAddress('D3')).toEqual([-1, TOTAL]);
    expect(t.api.getSheetValue('D5')).toBe(3895); // like Excel: SUM counts the hidden row
    const sumRow = t.api.getCellByAddress('D5')![0];
    expect(t.value(sumRow, TOTAL)).toBe(3895);
  });

  it('S11: dragging a column of objects: the letter moves with the property', async () => {
    const t = await mount({ tableOptions: { columnsDraggable: true } });
    t.scope.tableModel.changeColumnOrder(QTY, PRODUCT);
    t.api.repaint();
    expect(t.scope.tableModel.getColumnDef(0)?.property).toBe('qty');
    expect(t.api.getCellAddress(1, 0)).toBe('C2');
    expect(t.value(1, t.api.getColumnIndex('total'))).toBe(2598);
    t.api.setCellInput(1, 0, 4);
    expect(t.value(1, t.api.getColumnIndex('total'))).toBe(5196);
    expect(t.scope.tableSheet?.allowsColumnDrag()).toBe(true);
  });

  it('S12: "=1+1" in a column without formulas is text; \'=1+1 is the text =1+1; columnDef.cellFormulas false', async () => {
    const rows = sheetRows();
    rows[1].product = '=1+1';
    rows[2].total = "'=1+1";
    rows[3].extra = '=1+1';
    const t = await mount({ rows, cellFormulas: { columns: ['total', 'extra'] }, columnDefs: columns({ extra: { cellFormulas: false } }) });
    expect(t.value(1, PRODUCT)).toBe('=1+1');
    expect(t.value(2, TOTAL)).toBe('=1+1');
    expect(t.api.getCellInput(2, TOTAL)).toBe("'=1+1");
    expect(t.value(3, EXTRA)).toBe('=1+1');
    expect(t.value(4, TOTAL)).toBe(2598 + 250); // the text counts as nothing
    t.api.setCellInput(0, 'product', '=2+2');
    expect(t.value(0, PRODUCT)).toBe('=2+2');
  });

  it('without the option a formula is text (bit for bit as before)', async () => {
    const t = await mount({ cellFormulas: false });
    expect(t.api.hasCellFormulas()).toBe(false);
    expect(t.value(1, TOTAL)).toBe('=B2*C2');
    expect(t.api.getCellAddress(1, TOTAL)).toBeUndefined();
    expect(t.api.getPrecedents(1, TOTAL)).toEqual([]);
    expect(t.api.getSheetValue('D2')).toBeUndefined();
    expect(t.api.evaluateFormula('=1+1')).toBeUndefined();
    t.api.recalculate();
  });

  it('S20: Excel export – values by default, formulas with { cellFormulas: true }', async () => {
    const rows = sheetRows();
    rows[0].extra = '=XLOOKUP("Mouse",A2:A4,B2:B4)';
    rows[1].extra = '="a<b"&TEXTJOIN(",",TRUE,A2:A3)';
    rows[2].extra = '=1/0';
    const t = await mount({ rows });
    const download = vi.spyOn(t.scope.excelService, 'downloadExcel').mockResolvedValue(undefined);
    await t.api.downloadExcel('sheet.xlsx');
    expect(download.mock.calls[0][0][2][TOTAL]).toBe(2598); // header row + rows: body row 1 = matrix row 2
    await t.api.downloadExcel('sheet.xlsx', '', { cellFormulas: true });
    const matrix = download.mock.calls[1][0];
    expect(matrix[2][TOTAL]).toEqual({ formula: 'B3*C3', value: 2598 }); // one header row above the data
    expect(matrix[5][TOTAL]).toEqual({ formula: 'SUM(D3:D5)', value: 3895 });
    expect(matrix[1][PRICE]).toBe('Price');
    expect(matrix[1][EXTRA]).toEqual({ formula: '_xlfn.XLOOKUP("Mouse",A3:A5,B3:B5)', value: 25 });
    expect(matrix[2][EXTRA].formula).toBe('"a<b"&_xlfn.TEXTJOIN(",",TRUE,A3:A4)');
    expect(matrix[3][EXTRA].value.code).toBe('#DIV/0!');
    expect(matrix[2][PRICE]).toBe(1299);
    expect(download.mock.calls[1][3]).toEqual({ cellFormulas: true });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    t.scope.tableModel.getColumnDef(QTY)!.isVisible = () => false; // not exported: the references would be wrong
    await t.api.downloadExcel('sheet.xlsx', '', { cellFormulas: true });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('hidden'));
    t.scope.tableModel.getColumnDef(QTY)!.isVisible = TrueFn;
    t.scope.tableOptions.externalFilterFunction = (row: Row) => row.product !== 'Monitor';
    t.api.externalFilterChanged();
    await t.api.downloadExcel('sheet.xlsx', '', { cellFormulas: true });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('filter'));
    t.scope.tableOptions.externalFilterFunction = () => true;
    t.api.externalFilterChanged();
    // sorted: values and a warning
    t.api.sortByColumn('price', 'desc');
    await t.api.downloadExcel('sheet.xlsx', '', { cellFormulas: true });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('sorted'));
    expect(download.mock.calls.at(-1)![0].flat().some((c: unknown) => !!c && typeof c === 'object' && 'formula' in (c as object))).toBe(false);
  });

  it('S23: totals, sorting and copy use the results', async () => {
    const t = await mount({ footerAggregates: { total: 'sum' } });
    const footer = t.scope.tableModel.getAreaModel('footer');
    expect(footer.getValueAt(0, TOTAL)).toBe(2598 + 1047 + 250 + 3895);
    t.api.setCellInput(3, 'qty', 20);
    expect(footer.getValueAt(0, TOTAL)).toBe(2598 + 1047 + 500 + 4145);
    t.api.sortByColumn('total', 'asc');
    expect([0, 1, 2, 3].map(r => t.value(r, TOTAL))).toEqual([500, 1047, 2598, 4145]);
    t.sm.addSelection(new CellRange(0, TOTAL, 1, TOTAL));
    expect(t.api.getSelectionAsText()).toBe('500\n1047');
    expect(t.api.getRowValue(t.rows[1], 'total')).toBe(2598);
  });

  it('errors: class ge-table-cell-error and the message as tooltip; HTML stays text', async () => {
    const rows = sheetRows();
    rows[1].extra = '=B2/0';
    rows[2].extra = '="<img src=x onerror=alert(1)>"';
    const t = await mount({ rows });
    const cell = getCellDiv(t.host, 'body', 'center', 1, EXTRA);
    expect(cell.textContent).toBe('#DIV/0!');
    expect(cell.classList.contains('ge-table-cell-error')).toBe(true);
    expect(cell.getAttribute('title')).toBeTruthy();
    const html = getCellDiv(t.host, 'body', 'center', 2, EXTRA);
    expect(html.querySelector('img')).toBeNull();
    expect(html.textContent).toBe('<img src=x onerror=alert(1)>');
    expect(getCellDiv(t.host, 'body', 'center', 2, PRICE).classList.contains('ge-table-cell-error')).toBe(false);
  });

  it('rejectInvalidFormulas refuses a syntax error; otherwise it is stored as #ERROR!', async () => {
    const t = await mount({ cellFormulas: { rejectInvalidFormulas: true } });
    expect(t.api.setCellInput(1, 'extra', '=SUM(')).toBe(false);
    expect(t.rows[1].extra).toBe('');
    const t2 = await mount();
    expect(t2.api.setCellInput(1, 'extra', '=SUM(')).toBe(true);
    expect(t2.value(1, EXTRA)).toBe('#ERROR!');
  });

  it('batch edit: a pending formula shows its text, it is calculated after the commit', async () => {
    const pipe = vi.fn((v: unknown) => Number(v));
    const t = await mount({ columnDefs: columns({ extra: { editInputPipe: pipe } }) });
    t.api.startBatchEdit();
    t.api.setCellInput(1, 'extra', '=D2*2');
    await nextFrame();
    const cell = getCellDiv(t.host, 'body', 'center', 1, EXTRA);
    expect(cell.textContent).toBe('=D2*2');
    expect(cell.classList.contains('ge-table-cell-pending')).toBe(true);
    expect(t.rows[1].extra).toBe('');
    expect(t.api.commitBatchEdit()).toBe(true);
    expect(t.rows[1].extra).toBe('=D2*2');
    expect(t.value(1, EXTRA)).toBe(5196);
    expect(pipe).not.toHaveBeenCalled();
  });

  it('updateCells, recalculate, setRows and new rows', async () => {
    const t = await mount();
    t.api.updateCells([{ area: 'body', rowIndex: 1, columnIndex: QTY, value: 3 } as never]);
    expect(t.value(4, TOTAL)).toBe(3897 + 1047 + 250);
    expect(getCellDiv(t.host, 'body', 'center', 4, TOTAL).textContent).toBe(String(3897 + 1047 + 250));
    t.rows[1].qty = 1;            // outside the table
    t.api.recalculate();
    expect(t.value(1, TOTAL)).toBe(1299);
    const fresh = sheetRows();
    fresh[1].price = 1;
    t.api.setRows(fresh);
    await nextFrame();
    expect(t.value(1, TOTAL)).toBe(2);
    expect(t.value(4, TOTAL)).toBe(2 + 1047 + 250);
    t.api.addRows([{ product: 'x', price: 1, qty: 1, total: '=B6*C6+D5', extra: '' }] as never);
    await nextFrame();
    expect(t.value(5, TOTAL)).toBe(1 + 2 + 1047 + 250);
  });

  it('API: addresses, precedents, dependents, evaluateFormula', async () => {
    const t = await mount();
    expect(t.api.getCellAddress(1, 'total')).toBe('D2');
    expect(t.api.getCellAddress(1, 99)).toBeUndefined();
    expect(t.api.getCellByAddress('$B$3')).toEqual([2, PRICE]);
    expect(t.api.getCellByAddress('Z1')).toBeUndefined();
    expect(t.api.getCellByAddress('B99')).toBeUndefined();
    expect(t.api.getCellByAddress('nope')).toBeUndefined();
    expect(t.api.getPrecedents(1, 'total')).toEqual(['B2', 'C2']);
    expect(t.api.getPrecedents(4, 'total')).toEqual(['D2:D4']);
    expect(t.api.getPrecedents(1, 'price')).toEqual([]);
    expect(t.api.getDependents(1, 'price')).toEqual([[1, TOTAL]]);
    expect(t.api.getDependents(1, 'total')).toEqual([[4, TOTAL]]);
    expect(t.api.evaluateFormula('SUM(D2:D3)')).toBe(3645);
    expect(t.api.getCellValue(99, 0)).toBeUndefined();
    expect(t.api.getCellInput(-1, 0)).toBeUndefined();
  });

  it('row drag is off; a tree or master/detail has no cell formulas (warning)', async () => {
    const t = await mount({ columnDefs: columns({ product: { rowDrag: true } }) });
    expect(t.api.moveRows([1], 3)).toBe(false);
    expect(t.scope.rowDragService!.getBlockReason()).toBe('cellFormulas');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const md = await mount({ tableOptions: { masterDetail: { detailRenderer: () => undefined } } });
    expect(md.api.hasCellFormulas()).toBe(false);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('master/detail'));
    const tree = mountTable(TableFactory.createTableModel({
      rows: TreeFactory.buildTreeRows([{ name: '=1+1' }], { expanded: true }),
      columnDefs: [ColumnDef.create({ property: 'name' })],
    }), { tableOptions: { cellFormulas: true } });
    expect(tree.api.hasCellFormulas()).toBe(false);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('flat body'));
  });

  it('an array body: references by position, column drag off', async () => {
    const fm = new FocusModel('cell');
    const t = mountTable(TableFactory.createTableModel({
      headerData: [['a', 'b', 'c']], bodyData: [[1, 2, '=A1+B1'], [3, 4, '=C1*A2'], [null, null, "'=x"]],
    } as never), { tableOptions: { cellFormulas: true, editing: true, getFocusModel: () => fm } });
    await nextFrame();
    expect(t.api.getCellValue(0, 2)).toBe(3);
    expect(t.api.getCellValue(1, 2)).toBe(9);
    expect(t.api.getCellValue(2, 2)).toBe('=x');
    expect(t.api.getCellInput(1, 2)).toBe('=C1*A2');
    expect(t.scope.tableSheet?.allowsColumnDrag()).toBe(false);
    t.api.updateCells([{ area: 'body', rowIndex: 0, columnIndex: 0, value: 10 } as never]);
    expect(t.api.getCellValue(1, 2)).toBe(36);
    expect(t.api.getCellAddress(1, 2)).toBe('C2');
    expect(t.api.getCellByAddress('C2')).toEqual([1, 2]);
  });

  describe('review of stage 5', () => {
    it('#1/#2: calculated columns (008) read results; formulas reading a calculated column recalculate', async () => {
      const rows = sheetRows();
      const t = await mount({
        rows, columnDefs: [...columns(),
          ColumnDef.create({ property: 'calc', headerLabel: 'calc', width: px100, valueGetter: (r: Row) => Number(r.price) * 10 }),
          ColumnDef.create({ property: 'plus', headerLabel: 'plus', width: px100, formula: '[total] + 1' }),
        ],
      });
      expect(t.value(1, 6)).toBe(2599); // the 008 formula reads the result of D2
      rows[1].extra = '=F2+1';
      t.api.recalculate();
      expect(t.value(1, EXTRA)).toBe(12991);
      t.api.setCellInput(1, 'price', 1);
      expect(t.value(1, EXTRA)).toBe(11); // F2 = 10 now
      expect(t.value(1, 6)).toBe(3);
    });

    it("#3: a copied '= text stays text", async () => {
      const rows = sheetRows();
      rows[1].extra = "'=abc";
      const t = await mount({ rows });
      t.focus(1, EXTRA);
      const dt = clip(t.host, 'copy');
      t.focus(2, EXTRA);
      clip(t.host, 'paste', dt);
      expect(t.rows[2].extra).toBe("'=abc");
      expect(t.value(2, EXTRA)).toBe('=abc');
    });

    it('#4: a number typed or pasted over a formula is a number', async () => {
      const t = await mount();
      t.focus(1, TOTAL);
      await userEvent.keyboard('100{Enter}');
      expect(t.rows[1].total).toBe(100);
      t.focus(2, TOTAL);
      const dt = new DataTransfer();
      dt.setData('text/plain', '200');
      clip(t.host, 'paste', dt);
      expect(t.rows[2].total).toBe(200);
      expect(t.value(4, TOTAL)).toBe(100 + 200 + 250);
    });

    it('#5/#6: Excel – a field reference or syntax error exports the value; whole columns cover the data rows', async () => {
      const rows = sheetRows();
      rows[1].extra = '=[price]*2';
      rows[2].extra = '=SUM(';
      rows[3].extra = '=SUM(C:C)';
      const t = await mount({ rows });
      const download = vi.spyOn(t.scope.excelService, 'downloadExcel').mockResolvedValue(undefined);
      await t.api.downloadExcel('x.xlsx', '', { cellFormulas: true });
      const matrix = download.mock.calls[0][0];
      expect(matrix[2][EXTRA]).toBe(2598);
      expect(isFormulaError(matrix[3][EXTRA])).toBe(true);
      expect(matrix[4][EXTRA]).toEqual({ formula: 'SUM(C$2:C$6)', value: 15 });
    });

    it('#9: batch edit – a formula copied inside the table is marked with moved references', async () => {
      const t = await mount();
      t.api.startBatchEdit();
      t.focus(1, TOTAL);
      const dt = clip(t.host, 'copy');
      t.focus(2, EXTRA);
      clip(t.host, 'paste', dt);
      expect(t.api.commitBatchEdit()).toBe(true);
      expect(t.rows[2].extra).toBe('=C3*D3');
    });

    it('#11: updateCells writes a formula without editInputPipe', async () => {
      const pipe = vi.fn((v: unknown) => Number(v));
      const t = await mount({ columnDefs: columns({ extra: { editInputPipe: pipe } }) });
      t.api.updateCells([{ area: 'body', rowIndex: 1, columnIndex: EXTRA, value: '=D2*2' } as never]);
      expect(t.rows[1].extra).toBe('=D2*2');
      expect(t.value(1, EXTRA)).toBe(5196);
      expect(pipe).not.toHaveBeenCalled();
    });

    it('fill: right and left, several source rows, in a sorted view by physical distance', async () => {
      const rows = sheetRows();
      rows[1].extra = '=B2+C2';
      const t = await mount({ rows });
      t.api.fillRange(new CellRange(1, TOTAL, 2, TOTAL), 'down', 2); // D2:D3 → D4:D5 (cyclic)
      expect([t.rows[3].total, t.rows[4].total]).toEqual(['=B4*C4', '=B5*C5']);
      t.api.fillRange(new CellRange(1, QTY, 1, QTY), 'right', 0);
      t.api.fillRange(new CellRange(1, EXTRA, 1, EXTRA), 'left', 1); // E2 → D2
      expect(t.rows[1].total).toBe('=A2+B2');
      t.api.undo();
      t.api.sortByColumn('product', 'asc');
      const from = t.api.getCellByAddress('E2')![0];
      const to = from + 1;
      t.api.fillRange(new CellRange(from, EXTRA, from, EXTRA), 'down', 1);
      const address = t.api.getCellAddress(to, EXTRA)!;
      const row = Number(address.slice(1));
      expect(t.api.getCellInput(to, EXTRA)).toBe(`=B${row}+C${row}`);
    });
  });
});
