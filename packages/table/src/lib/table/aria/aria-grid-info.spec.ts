import { describe, expect, it } from 'vitest';
import { AreaModel, AriaGridInfo, ColumnDef, FalseFn, TableFactory } from '@guiexpert/table';

function createModel(rowCount: number, columnCount = 10) {
  const columnDefs = Array.from({ length: columnCount }, (_, i) => ColumnDef.create({ property: 'c' + i, headerLabel: 'C' + i }));
  const rows = Array.from({ length: rowCount }, (_, r) => Object.fromEntries(columnDefs.map((cd, c) => [cd.property, r * 100 + c])));
  return TableFactory.createTableModel({ rows, columnDefs });
}

describe('AriaGridInfo', () => {

  it('A1: counts header + all body rows and the columns', () => {
    const tableModel = createModel(1000);
    tableModel.init(); // computes the column widths (the table does it before the first render)
    const info = AriaGridInfo.create(tableModel);
    expect(info.headerRowCount).toBe(1);
    expect(info.bodyRowCount).toBe(1000);
    expect(info.footerRowCount).toBe(0);
    expect(info.rowCount).toBe(1001);
    expect(info.colCount).toBe(10);
  });

  it('A2: numbers rows 1-based over header → body → footer', () => {
    const info = new AriaGridInfo(2, 100, 1, [1, 2, 3]);
    expect(info.rowIndex('header', 0)).toBe(1);
    expect(info.rowIndex('header', 1)).toBe(2);
    expect(info.rowIndex('body', 0)).toBe(3);
    expect(info.rowIndex('body', 99)).toBe(102);
    expect(info.rowIndex('footer', 0)).toBe(103);
    expect(info.rowCount).toBe(103);
  });

  it('A4: two million rows – the last body row', () => {
    class Large extends AreaModel {
      constructor() {
        super();
        this.areaIdent = 'body';
      }
      override getRowCount(): number { return 2_000_000; }
    }
    const tableModel = TableFactory.createTableModel({
      bodyAreaModel: new Large(),
      columnDefs: [ColumnDef.create({ property: 'a', headerLabel: 'A' })],
    });
    const info = AriaGridInfo.create(tableModel);
    expect(info.rowCount).toBe(2_000_001);
    expect(info.rowIndex('body', 1_999_999)).toBe(2_000_001);
  });

  it('a hidden header and footer count 0 rows', () => {
    const tableModel = createModel(10);
    tableModel.setHeaderVisible!(false);
    const info = AriaGridInfo.create(tableModel);
    expect(info.headerRowCount).toBe(0);
    expect(info.rowCount).toBe(10);
    expect(info.rowIndex('body', 0)).toBe(1);
  });

  it('hidden columns are not counted, the following columns move up', () => {
    const tableModel = createModel(3, 5);
    tableModel.setColumnVisible!(1, false);
    tableModel.setColumnVisible!('c3', false);
    tableModel.init();
    const info = AriaGridInfo.create(tableModel);
    expect(info.colCount).toBe(3);
    expect([0, 1, 2, 3, 4].map(c => info.colIndex(c))).toEqual([1, 0, 2, 0, 3]);
    expect(info.colIndex(99)).toBe(0); // unknown column
  });

  it('a column hidden by its column definition (isVisible) is not counted', () => {
    const columnDefs = [
      ColumnDef.create({ property: 'a', headerLabel: 'A' }),
      ColumnDef.create({ property: 'b', headerLabel: 'B', isVisible: FalseFn }),
    ];
    const tableModel = TableFactory.createTableModel({ rows: [{ a: 1, b: 2 }], columnDefs });
    tableModel.init();
    expect(AriaGridInfo.create(tableModel).colCount).toBe(1);
  });

  it('colSpan counts only the shown columns of a span', () => {
    const info = new AriaGridInfo(1, 1, 0, [1, 0, 2, 3]);
    expect(info.colSpan(0, 3)).toBe(2); // columns 0..2, column 1 hidden
    expect(info.colSpan(1, 1)).toBe(1); // at least 1
    expect(info.colSpan(2, 5)).toBe(2); // beyond the last column
  });

  it('an unknown body row count gives aria-rowcount -1', () => {
    const info = new AriaGridInfo(1, -1, 0, [1]);
    expect(info.rowCount).toBe(-1);
    expect(info.rowIndex('footer', 0)).toBe(2); // footer right after the header
  });

  it('a table model without header/footer/body area models counts 0', () => {
    const info = AriaGridInfo.create({
      getAreaModel: () => undefined as never,
      isHeaderVisibe: () => true,
      isFooterVisibe: () => true,
      getColumnCount: () => 2,
      getColumnWidth: () => 50,
    });
    expect([info.headerRowCount, info.bodyRowCount, info.footerRowCount, info.rowCount, info.colCount]).toEqual([0, 0, 0, 0, 2]);
  });
});
