// The link between table model and formula engine (prompt 013 stage 5) – without DOM.
import { describe, expect, it, vi } from 'vitest';
import { ColumnDef, TableFactory, TableSheet, CellFormulaOptions, isFormulaError } from '@guiexpert/table';

const code = (v: unknown) => (isFormulaError(v) ? v.code : v);

function sheetOf(rows: object[], opts: Parameters<typeof TableFactory.createTableModel>[0] = {}) {
  const model = TableFactory.createTableModel({ rows, ...opts });
  const sheet = TableSheet.create(model, CellFormulaOptions.create(true)!)!;
  return { model, sheet, body: model.getBodyModel() };
}

describe('TableSheet', () => {
  it('row numbers and checkboxes are no data columns; nested properties, calculated columns', () => {
    const rows = [{ a: { x: 2 }, b: 3, c: '=A1*B1', d: null }, { a: null, b: 4, c: '=A2.x', d: '=D1' }];
    const { model, sheet, body } = sheetOf(rows, {
      rowNumbersVisible: true,
      columnDefs: [
        ColumnDef.create({ property: 'a.x' }), ColumnDef.create({ property: 'b' }), ColumnDef.create({ property: 'c' }),
        ColumnDef.create({ property: 'd' }), ColumnDef.create({ property: 'calc', valueGetter: (r: { b: number }) => r.b * 10 }),
      ],
    });
    expect(sheet.engineColumn(0)).toBeUndefined(); // the row numbers
    expect(sheet.address(0, 3)).toBe('C1');
    expect(body.getValueAt(0, 3)).toBe(6);
    expect(code(body.getValueAt(1, 3))).toBe('#NAME?'); // a.x has no "."-references
    expect(sheet.cellValue(0, 4)).toBe(30); // the calculated column as input
    expect(sheet.isFormulaColumnIndex(5)).toBe(false);
    expect(sheet.isFormulaProperty('calc')).toBe(false);
    expect(sheet.isFormulaProperty('nope')).toBe(false);
    expect(sheet.modelColumn(99)).toBe(-1);
    expect(sheet.physicalRow(-1)).toBeUndefined();
    expect(sheet.displayRow(5)).toBe(-1);
    expect(body.getValueAt(1, 4)).toBe(0); // =D1, D1 blank
    expect(model.getBodyModel().getInputValueAt?.(1, 4)).toBe('=D1');
  });

  it('whole columns and rows as precedents; a cell without formula; a non-formula target', () => {
    const rows = [{ a: 1, b: '=SUM(A:A)+SUM(2:2)' }, { a: 2, b: 3 }];
    const { sheet } = sheetOf(rows, { columnDefs: [ColumnDef.create({ property: 'a' }), ColumnDef.create({ property: 'b', cellFormulas: false })] });
    expect(sheet.precedents(0, 1)).toEqual([]); // b holds no formulas
    const { sheet: s2 } = sheetOf(rows, { columnDefs: [ColumnDef.create({ property: 'a' }), ColumnDef.create({ property: 'b' })] });
    expect(s2.precedents(0, 1)).toEqual(['A:A', '2:2']);
    expect(s2.precedents(9, 1)).toEqual([]);
    expect(s2.dependents(9, 0)).toEqual([]);
    expect(sheet.moveFormula('=A1', 0, 0, 1, 1)).toBeUndefined();
    expect(s2.copyOf(1, 0, 2, 2)).toBe(2);
    expect(s2.copyOf(9, 1, '=A1', 1)).toBe(1); // no such row
    expect(s2.syntaxError('=SUM(')).toBeTruthy();
    expect(s2.syntaxError('=SUM(1)')).toBeUndefined();
  });

  it('writes: unknown rows and columns are skipped; a new rows array rebuilds; destroy detaches', () => {
    const rows = [{ a: 1, b: '=A1*2' }];
    const { sheet, body } = sheetOf(rows);
    const spy = vi.spyOn(sheet.engine, 'inputsChanged');
    sheet.cellsWritten([{ row: { other: 1 }, rowIndex: 0, columnIndex: 0, property: 'a', oldValue: 1, newValue: 2 }]);
    expect(spy).not.toHaveBeenCalled();
    rows[0].a = 5;
    sheet.cellsWritten([{ row: rows[0], rowIndex: 0, columnIndex: 0, property: 'a', oldValue: 1, newValue: 5 }]);
    expect(body.getValueAt(0, 1)).toBe(10);
    rows.push({ a: 7, b: '=A2*2' });
    const rebuild = vi.spyOn(sheet.engine, 'rebuild');
    sheet.cellsWritten([]); // the length changed: rebuilt, nothing else
    expect(rebuild).toHaveBeenCalledTimes(1);
    sheet.recalculate();
    expect(rebuild).toHaveBeenCalledTimes(2);
    sheet.destroy();
    expect(body.getValueAt(0, 1)).toBe('=A1*2');
    sheet.destroy();
  });

  it('a tree body has no cell formulas', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const model = TableFactory.createTableModel({ bodyAreaModel: { getRowCount: () => 0 } as never, columnDefs: [] } as never);
    expect(TableSheet.create(model, CellFormulaOptions.create(true)!)).toBeUndefined();
    expect(warn).toHaveBeenCalled();
  });
});
