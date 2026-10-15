// Row numbers (prompt 004, design prompts/004-zeilennummern.design.md): the column definition, the numbering
// ("display" / "original"), the widest text for the column width and the factory flag rowNumbersVisible.
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  AreaModelObjectArray,
  AreaModelTree,
  CheckboxColumnDef,
  ColumnDef,
  RowNumberCellRenderer,
  RowNumberColumnDef,
  RowNumberOptions,
  TableFactory,
  TreeCheckboxModel,
  TreeFactory,
  getLeadingRowNumberColumnCount,
  isCheckboxColumnDef,
  isRowNumberColumnDef,
} from '@guiexpert/table';
import type { AreaModelIf, ColumnDefIf } from '@guiexpert/table';

interface Order { id: number; total: number; }

function orders(count: number): Order[] {
  return Array.from({ length: count }, (_, i) => ({ id: i + 1, total: (i * 37) % 101 }));
}

function bodyOf(rows: Order[]): AreaModelObjectArray<Order> {
  return new AreaModelObjectArray<Order>('body', rows, 34, [
    new ColumnDef('id', 'ID'),
    new ColumnDef('total', 'Total'),
  ]);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('RowNumberColumnDef', () => {
  const def = new RowNumberColumnDef();

  it('is recognized by isRowNumberColumnDef (type marker, works across copies of the core)', () => {
    expect(def.type).toBe('RowNumberColumnDef');
    expect(isRowNumberColumnDef(def)).toBe(true);
    expect(isRowNumberColumnDef({ type: 'RowNumberColumnDef' })).toBe(true);
    expect(isRowNumberColumnDef({ property: 'RowNumberColumn' })).toBe(false);
    expect(isRowNumberColumnDef(new CheckboxColumnDef())).toBe(false);
    expect(isRowNumberColumnDef(undefined)).toBe(false);
    expect(isCheckboxColumnDef(def)).toBeFalsy();
  });

  it('has the property "RowNumberColumn", the header label "#" and is neither sortable nor editable', () => {
    expect(def.property).toBe('RowNumberColumn');
    expect(def.headerLabel).toBe('#');
    const asIf: ColumnDefIf = def;
    expect(asIf.sortable).toBeUndefined();
    expect(asIf.editable).toBeUndefined();
    expect(def.isVisible?.()).toBe(true);
  });

  it('has the defaults of RowNumberOptions', () => {
    expect(def.options).toEqual(new RowNumberOptions());
    expect(def.options.mode).toBe('display');
    expect(def.options.headerLabel).toBe('#');
    expect(def.options.exported).toBe(false);
    expect(def.options.minWidthInPx).toBe(36);
    expect(def.options.format(2_000_000)).toBe('2000000');
  });

  it('merges partial options', () => {
    const own = new RowNumberColumnDef({ mode: 'original', headerLabel: '', exported: true, minWidthInPx: 50 });
    expect(own.options.mode).toBe('original');
    expect(own.headerLabel).toBe('');
    expect(own.options.exported).toBe(true);
    expect(own.width.value).toBe(50);
    expect(own.width.unit).toBe('px');
    expect(own.options.format(7)).toBe('7');
  });

  it('starts with the minimum width (the table widens it to fit the numbers)', () => {
    expect(def.width.value).toBe(36);
    expect(def.width.unit).toBe('px');
  });

  it('renders the body with a RowNumberCellRenderer, header and footer as text', () => {
    expect(def.rendererMap.body).toBeInstanceOf(RowNumberCellRenderer);
    expect(def.rendererMap.header).toBeUndefined();
    expect(def.rendererMap.footer).toBeUndefined();
    expect(new RowNumberColumnDef().rendererMap.body).not.toBe(def.rendererMap.body);
  });

  it('has the CSS classes for the look (right aligned, tabular numbers)', () => {
    expect(def.classes.body).toEqual(['ge-table-row-number', 'ge-table-text-align-right']);
    expect(def.classes.header).toEqual(['ge-table-row-number-header', 'ge-table-text-align-right']);
    expect(def.classes.footer).toEqual(['ge-table-row-number-footer']);
  });
});

describe('RowNumberColumnDef – numbering', () => {

  it('"display" (default): the position in the current view, 1-based', () => {
    const body = bodyOf(orders(5));
    const def = new RowNumberColumnDef();
    expect([0, 1, 4].map(r => def.getRowNumber(r, body))).toEqual([1, 2, 5]);
  });

  it('"display": stays 1, 2, 3 … after sorting (N3) and filtering (N4)', () => {
    const body = bodyOf(orders(1000));
    const def = new RowNumberColumnDef();
    body.sort((a, b) => b.total - a.total);
    expect(def.getRowNumber(0, body)).toBe(1);
    body.externalFilterChanged((o: Order) => o.id % 24 === 0);
    expect(body.getRowCount()).toBe(41);
    expect(def.getRowNumber(40, body)).toBe(41);
    expect(def.getWidestText(body)).toBe('41');
  });

  it('"original": the position in getAllRows() – follows the row when sorted or filtered', () => {
    const body = bodyOf(orders(10));
    const def = new RowNumberColumnDef({ mode: 'original' });
    body.sort((a, b) => b.id - a.id); // 10, 9, …, 1
    expect(def.getRowNumber(0, body)).toBe(10);
    expect(def.getRowNumber(9, body)).toBe(1);
    body.externalFilterChanged((o: Order) => o.id > 7);   // 8, 9, 10 (in original order)
    expect([0, 1, 2].map(r => def.getRowNumber(r, body))).toEqual([8, 9, 10]);
    // the width fits the largest original number, not the filtered row count
    expect(def.getWidestText(body)).toBe('10');
  });

  it('"original": a new row array (setRows) or more rows are numbered again', () => {
    const rows = orders(3);
    const body = bodyOf(rows);
    const def = new RowNumberColumnDef({ mode: 'original' });
    expect(def.getRowNumber(2, body)).toBe(3);
    const fresh = [...orders(3)].reverse();
    body.setRows(fresh);
    expect(def.getRowNumber(0, body)).toBe(1);
    rows.length = 0;
    fresh.push({ id: 99, total: 0 }); // same array, one more row
    body.setRows(fresh);
    expect(def.getRowNumber(3, body)).toBe(4);
  });

  it('"original": rows sorted in place and set again (same array, same length) are numbered again', () => {
    const rows = orders(5);
    const body = bodyOf(rows);
    const def = new RowNumberColumnDef({ mode: 'original' });
    expect(def.getRowNumber(0, body)).toBe(1);
    rows.reverse();
    body.setRows(rows);
    expect(def.getRowNumber(0, body)).toBe(1);           // row id 5 is now the first of all rows
    expect(def.getRowNumber(4, body)).toBe(5);
  });

  it('"original": a row object replaced in place gets its position', () => {
    const rows = orders(5);
    const body = bodyOf(rows);
    const def = new RowNumberColumnDef({ mode: 'original' });
    expect(def.getRowNumber(2, body)).toBe(3);
    rows[2] = { id: 99, total: 0 };
    body.setRows(rows);
    body.sort((a, b) => b.id - a.id);                    // id 99 first in the view
    expect(def.getRowNumber(0, body)).toBe(3);
  });

  it('"original": models without getAllRows() (own AreaModel) count like "display"', () => {
    const own = { getRowCount: () => 3, getRowByIndex: (r: number) => ({ r }) } as unknown as AreaModelIf;
    const def = new RowNumberColumnDef({ mode: 'original' });
    expect(def.getRowNumber(2, own)).toBe(3);
    expect(def.getWidestText(own)).toBe('3');
  });

  it('"original": a row that is not (any longer) in getAllRows() falls back to the display position', () => {
    const body = bodyOf(orders(3));
    const def = new RowNumberColumnDef({ mode: 'original' });
    vi.spyOn(body, 'getRowByIndex').mockReturnValue({ id: -1, total: 0 });
    expect(def.getRowNumber(1, body)).toBe(2);
  });

  it('"original": a row object that occurs twice gets the number of its first position', () => {
    const shared = { id: 1, total: 1 };
    const body = bodyOf([shared, { id: 2, total: 2 }, shared]);
    const def = new RowNumberColumnDef({ mode: 'original' });
    expect(def.getRowNumber(2, body)).toBe(1);
  });

  it('"original": getAllRows() without getUnfilteredRowCount() – the width uses the length of all rows', () => {
    const rows = [{ r: 0 }, { r: 1 }, { r: 2 }];
    const own = {
      getRowCount: () => 1,
      getRowByIndex: () => rows[2],
      getAllRows: () => rows,
    } as unknown as AreaModelIf;
    const def = new RowNumberColumnDef({ mode: 'original' });
    expect(def.getWidestText(own)).toBe('3');
    expect(def.getRowNumber(0, own)).toBe(3);
  });

  it('"original": getAllRows() that returns no array counts like "display"', () => {
    const own = {
      getRowCount: () => 2,
      getRowByIndex: () => ({}),
      getAllRows: () => undefined,
      getUnfilteredRowCount: () => 2,
    } as unknown as AreaModelIf;
    expect(new RowNumberColumnDef({ mode: 'original' }).getRowNumber(1, own)).toBe(2);
  });

  it('formats the text with options.format', () => {
    const body = bodyOf(orders(1234));
    const def = new RowNumberColumnDef({ format: n => n.toLocaleString('en-US') });
    expect(def.getRowNumberText(1233, body)).toBe('1,234');
    expect(def.getWidestText(body)).toBe('1,234');
  });

  it('getWidestText() of an empty body is the text of 1 (the column does not collapse)', () => {
    expect(new RowNumberColumnDef().getWidestText(bodyOf([]))).toBe('1');
  });

  it('tree: counts the visible rows (N7), collapsing renumbers', () => {
    const roots = TreeFactory.buildTreeRows(
      [{ name: 'a', kids: [{ name: 'a1' }, { name: 'a2' }] }, { name: 'b', kids: [] }] as any[], 'kids');
    const tree = new AreaModelTree<any>('body', roots, 34, [new ColumnDef('name', 'Name')]);
    const def = new RowNumberColumnDef({ mode: 'original' }); // no getAllRows() → display
    expect(tree.getRowCount()).toBe(4);
    expect(def.getRowNumber(3, tree)).toBe(4);
    roots[0].expanded = false;
    tree.recalcVisibleTreeRows();
    expect(tree.getRowCount()).toBe(2);
    expect(def.getWidestText(tree)).toBe('2');
  });
});

describe('getLeadingRowNumberColumnCount()', () => {
  it('is 1 only if the first column is a RowNumberColumnDef', () => {
    expect(getLeadingRowNumberColumnCount([new RowNumberColumnDef(), new ColumnDef('id', 'ID')])).toBe(1);
    expect(getLeadingRowNumberColumnCount([new ColumnDef('id', 'ID'), new RowNumberColumnDef()])).toBe(0);
    expect(getLeadingRowNumberColumnCount([])).toBe(0);
    expect(getLeadingRowNumberColumnCount(undefined)).toBe(0);
  });
});

describe('TableFactory.createTableModel({ rowNumbersVisible })', () => {
  const columnDefs = () => [new ColumnDef('id', 'ID'), new ColumnDef('total', 'Total')];

  it('puts a RowNumberColumnDef in front and fixes it on the left (N1)', () => {
    const own = columnDefs();
    const model = TableFactory.createTableModel({ rows: orders(1000), columnDefs: own, rowNumbersVisible: true });
    expect(model.getColumnCount()).toBe(3);
    expect(isRowNumberColumnDef(model.getColumnDef(0))).toBe(true);
    expect(model.getFixedLeftColumnCount()).toBe(1);
    expect(model.getAreaModel('header').getValueAt(0, 0)).toBe('#');
    expect(model.getAreaModel('header').getValueAt(0, 1)).toBe('ID');
    expect(model.getBodyModel().getValueAt(0, 1)).toBe(1);
    expect(model.getBodyModel().getValueAt(0, 2)).toBe(0);
    expect(own.length).toBe(2); // the caller's array is not changed
  });

  it('counts the column in fixedLeftColumnCount', () => {
    const model = TableFactory.createTableModel({
      rows: orders(3), columnDefs: columnDefs(), fixedLeftColumnCount: 1, rowNumbersVisible: true
    });
    expect(model.getFixedLeftColumnCount()).toBe(2);
  });

  it('passes options to the column definition', () => {
    const model = TableFactory.createTableModel({
      rows: orders(3), properties: ['id'], rowNumbersVisible: { mode: 'original', headerLabel: 'Nr.' }
    });
    const def = model.getColumnDef(0) as RowNumberColumnDef;
    expect(def.options.mode).toBe('original');
    expect(model.getAreaModel('header').getValueAt(0, 0)).toBe('Nr.');
    expect(model.getBodyModel().getValueAt(1, 1)).toBe(2);
  });

  it('works with the keys of the first row (no columnDefs, no properties)', () => {
    const model = TableFactory.createTableModel({ rows: orders(2), rowNumbersVisible: true });
    expect(model.getColumnCount()).toBe(3);
    expect(model.getColumnDef(1)?.property).toBe('id');
  });

  it('false / undefined: no extra column', () => {
    expect(TableFactory.createTableModel({ rows: orders(2), rowNumbersVisible: false }).getColumnCount()).toBe(2);
    expect(TableFactory.createTableModel({ rows: orders(2) }).getColumnCount()).toBe(2);
  });

  it('does not add a second column if the columnDefs already start with one', () => {
    const model = TableFactory.createTableModel({
      rows: orders(2), columnDefs: [new RowNumberColumnDef(), ...columnDefs()], rowNumbersVisible: true,
      fixedLeftColumnCount: 1
    });
    expect(model.getColumnCount()).toBe(3);
    expect(model.getFixedLeftColumnCount()).toBe(1);
  });

  it('headerData / footerData get an empty cell in front', () => {
    const model = TableFactory.createTableModel({
      rows: orders(2), columnDefs: columnDefs(), rowNumbersVisible: true,
      headerData: [['Id', 'Sum']], footerData: [['', '42']]
    });
    expect(model.getAreaModel('header').getValueAt(0, 0)).toBe('#');
    expect(model.getAreaModel('header').getValueAt(0, 1)).toBe('Id');
    expect(model.getAreaModel('footer').getValueAt(0, 0)).toBe('');
    expect(model.getAreaModel('footer').getValueAt(0, 2)).toBe('42');
  });

  it('is ignored with a warning for bodyData or own area models (the columns would shift)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const csv = TableFactory.createTableModel({
      headerData: [['A', 'B']], bodyData: [[1, 2]], columnSizes: [80, 80], rowNumbersVisible: true
    });
    expect(csv.getColumnCount()).toBe(2);
    const own = TableFactory.createTableModel({
      bodyAreaModel: bodyOf(orders(2)), columnDefs: columnDefs(), rowNumbersVisible: true
    });
    expect(own.getColumnCount()).toBe(2);
    expect(warn).toHaveBeenCalledTimes(2);
    expect(String(warn.mock.calls[0][0])).toContain('rowNumbersVisible');
  });

  it('N5: number + checkbox column – the checkbox models are set up at index 1', () => {
    const model = TableFactory.createTableModel({
      rows: orders(3), columnDefs: [new CheckboxColumnDef(), ...columnDefs()], rowNumbersVisible: true
    });
    expect(isRowNumberColumnDef(model.getColumnDef(0))).toBe(true);
    expect(isCheckboxColumnDef(model.getColumnDef(1))).toBe(true);
    expect(model.getBodyModel().rowSelectionModel).toBeDefined();
    expect(model.getAreaModel('header').rowSelectionModel).toBeDefined();
    model.getBodyModel().setRowChecked(1, true);
    expect(model.getBodyModel().isRowChecked(1)).toBe('full');
  });

  it('N5 tree: the CheckboxColumnDef behind the number column gets a TreeCheckboxModel', () => {
    const roots = TreeFactory.buildTreeRows([{ name: 'a', kids: [{ name: 'a1' }] }] as any[], 'kids');
    const model = TableFactory.createTableModel({
      rows: roots, columnDefs: [new CheckboxColumnDef(), new ColumnDef('name', 'Name')], rowNumbersVisible: true
    });
    expect(model.getBodyModel().rowSelectionModel).toBeInstanceOf(TreeCheckboxModel);
  });

  it('TableModel recognizes a CheckboxColumnDef behind a RowNumberColumnDef (own column definitions)', () => {
    const model = TableFactory.createTableModel({
      rows: orders(3), columnDefs: [new RowNumberColumnDef(), new CheckboxColumnDef(), ...columnDefs()]
    });
    expect(model.getBodyModel().rowSelectionModel).toBeDefined();
    expect(model.getAreaModel('header').rowSelectionModel).toBeDefined();
  });
});

describe('TableFactory.buildByTypedRows with a RowNumberColumnDef', () => {
  it('tree: a CheckboxColumnDef behind the number column gets a TreeCheckboxModel', () => {
    const roots = TreeFactory.buildTreeRows([{ name: 'a', kids: [{ name: 'a1' }] }] as any[], 'kids');
    const model = TableFactory.buildByTypedRows(roots,
      [new RowNumberColumnDef(), new CheckboxColumnDef(), new ColumnDef('name', 'Name')]);
    expect(model.getBodyModel().rowSelectionModel).toBeInstanceOf(TreeCheckboxModel);
  });
});
