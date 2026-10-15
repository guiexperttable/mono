// Calculated columns, „Show values as“ and formulas in a real browser (prompt 008, design
// prompts/008-formeln-berechnete-spalten-show-values-as.design.md): rendering, header double click (F2), filter (F3),
// copy / Excel (F4, F12), footer (F5), editing a source column (F6), editing the calculated column (F7),
// setShowValuesAs, setColumnFormula, error cells (F14), HTML injection, ARIA.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import {
  ColumnDef,
  EventAdapter,
  FocusModel,
  SelectionModel,
  TableFactory,
  isFormulaError,
} from '@guiexpert/table';
import type { ColumnDefIf, GeModelChangeEvent, TableModelIf, TableOptionsIf } from '@guiexpert/table';
import { destroyAllTables, getCellDiv, mountTable, nextFrame } from '../../../../test-utils/mount-table';
import { axeViolations } from '../../../../test-utils/axe';
import { createItems, itemColumns, type Item } from '../../../../test-utils/calc-fixtures';

afterEach(() => {
  destroyAllTables();
  vi.restoreAllMocks();
});

/** A new column each time: sorting writes sortState into the column definition. */
const share = () => ColumnDef.create({ property: 'share', headerLabel: 'Share', valueGetter: (o: Item) => o.price * o.quantity, showValuesAs: 'percentOfColumnTotal' });

function itemModel(extra: ColumnDefIf[] = [], rows: Item[] = createItems()): TableModelIf {
  return TableFactory.createTableModel({ rows, columnDefs: itemColumns(extra), footerAggregates: { total: 'sum' } });
}

async function mount(tableModel: TableModelIf, tableOptions: Partial<TableOptionsIf> = {}) {
  const listener = new EventAdapter();
  const modelChanges: GeModelChangeEvent[] = [];
  listener.onModelChanged = e => modelChanges.push(e);
  const table = mountTable(tableModel, { tableOptions, eventListener: listener });
  await nextFrame();
  return { ...table, modelChanges };
}

const text = (el: HTMLElement) => (el.textContent ?? '').trim();
const bodyTexts = (host: HTMLElement, c: number, rows = 3) =>
  Array.from({ length: rows }, (_, r) => text(getCellDiv(host, 'body', 'center', r, c)));

describe('rendering', () => {
  it('F1 / F8 / F5: computed values, shares as percentages, footer sum(total)', async () => {
    const { host } = await mount(itemModel([share()]));
    expect(bodyTexts(host, 3)).toEqual(['2598', '1047', '250']);
    expect(bodyTexts(host, 4)).toEqual(['66.7%', '26.9%', '6.4%']);
    expect(text(getCellDiv(host, 'footer', 'center', 0, 3))).toBe('3,895');
    expect(getCellDiv(host, 'body', 'center', 0, 4).getAttribute('role')).toBe('gridcell');
    expect(await axeViolations(host)).toEqual([]);
  });

  it('F14: formula errors show their code, the CSS class ge-table-cell-error and the message as tooltip', async () => {
    const rows = [{ product: 'A', price: 10, quantity: 0 }, { product: 'B', price: 10, quantity: 2 }];
    const { host } = await mount(itemModel([ColumnDef.create({ property: 'unit', headerLabel: 'Unit', formula: '[price] / [quantity]' })], rows));
    const error = getCellDiv(host, 'body', 'center', 0, 4);
    expect(text(error)).toBe('#DIV/0!');
    expect(error.classList).toContain('ge-table-cell-error');
    expect(error.getAttribute('title')).toBe('Division by zero');
    const ok = getCellDiv(host, 'body', 'center', 1, 4);
    expect(text(ok)).toBe('5');
    expect(ok.classList).not.toContain('ge-table-cell-error');
    expect(await axeViolations(host)).toEqual([]);
  });

  it('HTML injection: data, results, own formats and error messages are text', async () => {
    const XSS = '<img src="x" onerror="geXss = 1">';
    const rows = [{ product: XSS, price: 1, quantity: 1 }];
    const { host } = await mount(itemModel([
      ColumnDef.create({ property: 'label', headerLabel: 'Label', formula: '[product] & "!"' }),
      ColumnDef.create({ property: 'fmt', headerLabel: 'Fmt', valueGetter: () => 1, showValuesAs: { mode: 'rank', format: () => XSS } }),
      ColumnDef.create({ property: 'err', headerLabel: 'Err', formula: `[${XSS.replace(']', '\\]')}]` }),
    ], rows));
    expect(host.querySelector('img')).toBeNull();
    expect(text(getCellDiv(host, 'body', 'center', 0, 4))).toBe(`${XSS}!`);
    expect(text(getCellDiv(host, 'body', 'center', 0, 5))).toBe(XSS);
    const err = getCellDiv(host, 'body', 'center', 0, 6);
    expect(text(err)).toBe('#NAME?');
    expect(err.getAttribute('title')).toContain('<img');   // an attribute value, never markup
  });
});

describe('interaction', () => {
  it('F2: a double click on the header of the calculated column sorts by it', async () => {
    const m = itemModel();
    const { host } = await mount(m);
    const header = getCellDiv(host, 'header', 'center', 0, 3).querySelector('span') ?? getCellDiv(host, 'header', 'center', 0, 3);
    header.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }));
    await vi.waitFor(() => expect(m.getColumnDef(3)?.sortState).toBeTruthy());
    await nextFrame();
    const asc = m.getColumnDef(3)?.sortState === 'asc';
    expect(bodyTexts(host, 0)).toEqual(asc ? ['Mouse', 'Monitor', 'Laptop'] : ['Laptop', 'Monitor', 'Mouse']);
  });

  it('F2 / F12: sortByColumn on a share column sorts by the raw value; the shares follow', async () => {
    const { host, api } = await mount(itemModel([share()]));
    api.sortByColumn('share', 'asc');
    await nextFrame();
    expect(bodyTexts(host, 0)).toEqual(['Mouse', 'Monitor', 'Laptop']);
    expect(bodyTexts(host, 4)).toEqual(['6.4%', '26.9%', '66.7%']);
  });

  it('F3 / F9: filter "total > 500" with api.getRowValue(); shares and footer relate to the filtered rows', async () => {
    const m = itemModel([share()]);
    const options: Partial<TableOptionsIf> = {};
    const { host, api } = await mount(m, options);
    api.getTableScope().tableOptions.externalFilterFunction = (row: Item) => Number(api.getRowValue(row, 'total')) > 500;
    api.externalFilterChanged();
    await nextFrame();
    expect(api.getBodyModel().getRowCount()).toBe(2);
    expect([0, 1].map(r => api.getBodyModel().getValueAt(r, 0))).toEqual(['Laptop', 'Monitor']);
    expect(bodyTexts(host, 0, 2)).toEqual(['Laptop', 'Monitor']);
    expect(bodyTexts(host, 4, 2)).toEqual(['71.3%', '28.7%']);
    expect(text(getCellDiv(host, 'footer', 'center', 0, 3))).toBe('3,645');
  });

  it('F6: editing price of Mouse to 30 (F2 + Enter) → total 300, footer 3,945', async () => {
    const fm = new FocusModel('cell');
    const m = itemModel([share()]);
    const { host, modelChanges } = await mount(m, { getFocusModel: () => fm });
    host.focus();
    fm.setFocus(2, 1);
    await userEvent.keyboard('{F2}');
    const input = host.querySelector<HTMLInputElement>('input.ge-table-cell-editor-input')!;
    input.value = '';
    await userEvent.keyboard('30{Enter}');
    await nextFrame();
    expect(modelChanges).toHaveLength(1);
    expect(text(getCellDiv(host, 'body', 'center', 2, 3))).toBe('300');
    expect(text(getCellDiv(host, 'footer', 'center', 0, 3))).toBe('3,945');
    expect(bodyTexts(host, 4)).toEqual(['65.9%', '26.5%', '7.6%']);
  });

  it('F6: updateCells() without repaint redraws the calculated and share cells of the body', async () => {
    const { host, api } = await mount(itemModel([share()]));
    api.updateCells([{ area: 'body', rowIndex: 2, columnIndex: 1, value: 30, cssClasses: {} }]);
    await nextFrame();
    expect(text(getCellDiv(host, 'body', 'center', 2, 3))).toBe('300');
    expect(bodyTexts(host, 4)).toEqual(['65.9%', '26.5%', '7.6%']);
    expect(text(getCellDiv(host, 'footer', 'center', 0, 3))).toBe('3,945');
  });

  it('F7: the calculated column opens no editor (editable: TrueFn is ignored without a valueSetter)', async () => {
    const fm = new FocusModel('cell');
    const { host, scope } = await mount(itemModel(), { getFocusModel: () => fm });
    host.focus();
    fm.setFocus(0, 3);
    await userEvent.keyboard('{F2}');
    expect(scope.isEditing()).toBe(false);
    await userEvent.dblClick(getCellDiv(host, 'body', 'center', 0, 3));
    expect(scope.isEditing()).toBe(false);
  });

  it('setShowValuesAs() switches the display without a new model; undefined = values again', async () => {
    const { host, api } = await mount(itemModel());
    expect(api.setShowValuesAs('total', 'runningTotal')).toBe(true);
    await nextFrame();
    expect(bodyTexts(host, 3)).toEqual(['2,598', '3,645', '3,895']);
    expect(api.getShowValuesAs('total')).toBe('runningTotal');
    expect(api.setShowValuesAs('total', 'rank')).toBe(true);
    await nextFrame();
    expect(bodyTexts(host, 3)).toEqual(['1', '2', '3']);
    expect(api.setShowValuesAs('total', undefined)).toBe(true);
    await nextFrame();
    expect(bodyTexts(host, 3)).toEqual(['2598', '1047', '250']);
    expect(api.setShowValuesAs('nope', 'rank')).toBe(false);
    expect(api.setShowValuesAs('total', 'nope' as never)).toBe(false);
  });

  it('setColumnFormula(): new formula, compile error returned and shown, no column → #NAME?', async () => {
    const { host, api } = await mount(itemModel([ColumnDef.create({ property: 'custom', headerLabel: 'Custom', formula: '[price]' })]));
    expect(bodyTexts(host, 4)).toEqual(['1299', '349', '25']);
    expect(api.setColumnFormula('custom', 'ROUND([total] * 1.19, 2)')).toBeUndefined();
    await nextFrame();
    expect(bodyTexts(host, 4)).toEqual(['3091.62', '1245.93', '297.5']);
    const error = api.setColumnFormula('custom', '[price] *');
    expect(error?.code).toBe('#ERROR!');
    await nextFrame();
    expect(bodyTexts(host, 4)).toEqual(['#ERROR!', '#ERROR!', '#ERROR!']);
    expect(api.setColumnFormula('nope', '1')?.code).toBe('#NAME?');
    expect(isFormulaError(api.getRowValue(createItems()[0], 'custom'))).toBe(true);
    expect(api.getTableModel().getColumnDef(4)?.formula).toBe('[price] *');
  });
});

describe('F4 / F12 – copy and Excel', () => {
  it('copy contains the computed values and the shares as shown', async () => {
    const selectionModel = new SelectionModel('row', 'multi');
    const { api, scope } = await mount(itemModel([share()]), { getSelectionModel: () => selectionModel });
    selectionModel.selectAll();
    expect(await scope.copyService.createContent(api.getTableModel(), selectionModel, new FocusModel('cell')))
      .toBe('Laptop\t1299\t2\t2598\t66.7%\nMonitor\t349\t3\t1047\t26.9%\nMouse\t25\t10\t250\t6.4%');
  });

  it('Excel: computed values as numbers, shares as numbers with a percent format, errors as text', async () => {
    const rows = [...createItems(), { product: 'Free', price: 0, quantity: 0 }];
    const { api, scope } = await mount(itemModel([share(), ColumnDef.create({ property: 'unit', headerLabel: 'Unit', formula: '[total] / [quantity]' })], rows));
    const download = vi.spyOn(scope.excelService, 'downloadExcel').mockResolvedValue(undefined);
    await api.downloadExcel('items.xlsx');
    const matrix = download.mock.calls[0][0] as unknown[][];
    expect(matrix[0]).toEqual(['Product', 'Price', 'Qty', 'Total', 'Share', 'Unit']);
    expect(matrix[1].slice(0, 4)).toEqual(['Laptop', 1299, 2, 2598]);
    expect(matrix[1][4]).toEqual({ value: 2598 / 3895, numberFormat: '0.0%' });
    expect(matrix[1][5]).toBe(1299);
    expect(`${matrix[4][5]}`).toBe('#DIV/0!');
    expect(matrix[4][4]).toEqual({ value: 0, numberFormat: '0.0%' }); // 0 of 3895: a share of 0 %
    expect(matrix.at(-1)?.[3]).toBe(3895); // the footer: raw total
  });

  it('a custom ExcelService without supportsNumberFormats gets plain numbers', async () => {
    const { api, scope } = await mount(itemModel([share()]));
    (scope.excelService as { supportsNumberFormats?: boolean }).supportsNumberFormats = false;
    const download = vi.spyOn(scope.excelService, 'downloadExcel').mockResolvedValue(undefined);
    await api.downloadExcel();
    expect((download.mock.calls[0][0] as unknown[][])[1][4]).toBeCloseTo(2598 / 3895, 12);
  });
});
