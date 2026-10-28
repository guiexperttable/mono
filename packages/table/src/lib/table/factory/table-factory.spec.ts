import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  AreaModel,
  AreaModelArrayOfArrays,
  AreaModelHidden,
  AreaModelObjectArray,
  AreaModelObjectArrayWithColumndefs,
  AreaModelTree,
  CheckboxColumnDef,
  CheckboxModel,
  ColumnDef,
  DefaultRowHeights,
  SelectionModel,
  TableFactory,
  TableModel,
  TableOptions,
  TreeCheckboxModel,
  TreeRow,
  isAreaModelTree,
  px50,
  px100,
  px200,
} from '@guiexpert/table';
import type { ColumnDefIf, TableModelIf, TableOptionsIf } from '@guiexpert/table';

interface Order {
  id: number;
  customer: string;
  total: number;
}

const orders = (): Order[] => [
  { id: 1, customer: 'Alice', total: 10 },
  { id: 2, customer: 'Bob', total: 20 },
  { id: 3, customer: 'Carol', total: 30 },
];

const orderDefs = (): ColumnDefIf[] => [
  new ColumnDef('id', 'ID', px50),
  new ColumnDef('customer', 'Customer', px200),
  new ColumnDef('total', 'Total', px100),
];

const headerLabels = (tm: TableModelIf, row = 0) => {
  const header = tm.getAreaModel('header');
  return Array.from({ length: tm.getColumnCount() }, (_, c) => header.getValueAt(row, c));
};

const bodyRow = (tm: TableModelIf, row: number) => {
  const body = tm.getAreaModel('body');
  return Array.from({ length: tm.getColumnCount() }, (_, c) => body.getValueAt(row, c));
};

/** A body model with its own row height (as AreaModel subclass with a defaultRowHeight field). */
class OwnBody extends AreaModel {
  defaultRowHeight = 50;

  override getRowCount(): number {
    return 4;
  }

  override getRowHeight(_rowIndex: number): number {
    return 50;
  }

  override getValueAt(row: number, col: number): any {
    return `${row}/${col}`;
  }
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('TableFactory', () => {

  describe('createTableModel', () => {

    describe('with rows', () => {
      it('derives the columns from the keys of the first row (upper case labels, 200px)', () => {
        const tm = TableFactory.createTableModel({ rows: orders() });
        expect(tm.getColumnCount()).toBe(3);
        expect(headerLabels(tm)).toEqual(['ID', 'CUSTOMER', 'TOTAL']);
        const defs = tm.getColumnDefs()!;
        expect(defs.map(d => d.property)).toEqual(['id', 'customer', 'total']);
        expect(defs.every(d => d.width.value === 200 && d.width.unit === 'px')).toBe(true);
      });

      it('creates an AreaModelObjectArrayWithColumndefs as body', () => {
        const tm = TableFactory.createTableModel({ rows: orders() });
        expect(tm.getBodyModel()).toBeInstanceOf(AreaModelObjectArrayWithColumndefs);
        expect(tm.getBodyModel().getRowCount()).toBe(3);
        expect(bodyRow(tm, 1)).toEqual([2, 'Bob', 20]);
      });

      it('creates a TableModel with header from the column labels and a hidden footer', () => {
        const tm = TableFactory.createTableModel({ rows: orders() });
        expect(tm).toBeInstanceOf(TableModel);
        expect(tm.getAreaModel('header')).toBeInstanceOf(AreaModelArrayOfArrays);
        expect(tm.getAreaModel('footer')).toBeInstanceOf(AreaModelHidden);
        expect(tm.isHeaderVisibe()).toBe(true);
        expect(tm.isFooterVisibe()).toBe(false);
      });

      it('uses only the given properties, in the given order', () => {
        const tm = TableFactory.createTableModel({ rows: orders(), properties: ['total', 'id'] });
        expect(tm.getColumnCount()).toBe(2);
        expect(headerLabels(tm)).toEqual(['TOTAL', 'ID']);
        expect(bodyRow(tm, 2)).toEqual([30, 3]);
      });

      it('supports nested property paths in properties', () => {
        const tm = TableFactory.createTableModel({
          rows: [{ id: 1, address: { city: 'Berlin' } }],
          properties: ['address.city'],
        });
        expect(headerLabels(tm)).toEqual(['ADDRESS.CITY']);
        expect(bodyRow(tm, 0)).toEqual(['Berlin']);
      });

      it('prefers columnDefs over properties', () => {
        const tm = TableFactory.createTableModel({ rows: orders(), properties: ['id'], columnDefs: orderDefs() });
        expect(tm.getColumnCount()).toBe(3);
        expect(headerLabels(tm)).toEqual(['ID', 'Customer', 'Total']);
      });

      it('keeps the given column definition objects', () => {
        const defs = orderDefs();
        const tm = TableFactory.createTableModel({ rows: orders(), columnDefs: defs });
        expect(tm.getColumnDefs()).toBe(defs);
        expect(tm.getColumnDef(1)).toBe(defs[1]);
      });

      it('uses the given rows array as getAllRows() of the body', () => {
        const rows = orders();
        const tm = TableFactory.createTableModel({ rows });
        expect((tm.getBodyModel() as AreaModelObjectArray<Order>).getAllRows()).toBe(rows);
      });

      it('creates an empty table without columns for an empty rows array', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const tm = TableFactory.createTableModel({ rows: [] });
        expect(tm.getColumnCount()).toBe(0);
        expect(tm.getBodyModel().getRowCount()).toBe(0);
        expect(tm.getAreaModel('header')).toBeInstanceOf(AreaModelHidden);
        expect(warn).toHaveBeenCalledWith('Property "columnCount" is missing and cannot be derived from other properties.');
      });

      it('creates an AreaModelTree body for tree rows', () => {
        const treeRows = [
          new TreeRow<Order>(orders()[0]!, true, [], undefined),
          new TreeRow<Order>(orders()[1]!, true, [], undefined),
        ];
        const tm = TableFactory.createTableModel({ rows: treeRows, columnDefs: orderDefs() });
        expect(tm.getBodyModel()).toBeInstanceOf(AreaModelTree);
        expect(isAreaModelTree(tm.getBodyModel())).toBe(true);
        expect(tm.getBodyModel().rowSelectionModel).toBeUndefined();
      });

      it('adds a TreeCheckboxModel to a tree body if the first column is a CheckboxColumnDef', () => {
        const treeRows = [new TreeRow<Order>(orders()[0]!, true, [], undefined)];
        const tm = TableFactory.createTableModel({ rows: treeRows, columnDefs: [new CheckboxColumnDef(), ...orderDefs()] });
        expect(tm.getBodyModel().rowSelectionModel).toBeInstanceOf(TreeCheckboxModel);
      });

      it('adds a TreeCheckboxModel to a tree body with tableOptions.showCheckboxWihoutExtraColumn', () => {
        const treeRows = [new TreeRow<Order>(orders()[0]!, true, [], undefined)];
        const tableOptions: TableOptionsIf = { ...new TableOptions(), showCheckboxWihoutExtraColumn: true };
        const tm = TableFactory.createTableModel({ rows: treeRows, columnDefs: orderDefs(), tableOptions });
        expect(tm.getBodyModel().rowSelectionModel).toBeInstanceOf(TreeCheckboxModel);
      });

      it('adds a CheckboxModel to a flat body if the first column is a CheckboxColumnDef', () => {
        const tm = TableFactory.createTableModel({ rows: orders(), columnDefs: [new CheckboxColumnDef(), ...orderDefs()] });
        expect(tm.getBodyModel().rowSelectionModel).toBeInstanceOf(CheckboxModel);
      });
    });

    describe('with bodyData / headerData / footerData', () => {
      it('creates array-of-arrays models for header, body and footer', () => {
        const tm = TableFactory.createTableModel({
          headerData: [['ID', 'City']],
          bodyData: [[1, 'Berlin'], [2, 'Paris']],
          footerData: [['', '2 rows']],
          columnSizes: [80, 160],
        });
        expect(tm.getAreaModel('header')).toBeInstanceOf(AreaModelArrayOfArrays);
        expect(tm.getAreaModel('body')).toBeInstanceOf(AreaModelArrayOfArrays);
        expect(tm.getAreaModel('footer')).toBeInstanceOf(AreaModelArrayOfArrays);
        expect(headerLabels(tm)).toEqual(['ID', 'City']);
        expect(bodyRow(tm, 1)).toEqual([2, 'Paris']);
        expect(tm.getAreaModel('footer').getValueAt(0, 1)).toBe('2 rows');
        expect(tm.isFooterVisibe()).toBe(true);
      });

      it('derives the column count from the first header row', () => {
        const tm = TableFactory.createTableModel({ headerData: [['A', 'B', 'C']], bodyData: [[1, 2, 3]] });
        expect(tm.getColumnCount()).toBe(3);
      });

      it('derives the column count from columnSizes if there is no header', () => {
        const tm = TableFactory.createTableModel({ bodyData: [[1, 2]], columnSizes: [10, 20] });
        expect(tm.getColumnCount()).toBe(2);
        expect(tm.getAreaModel('header')).toBeInstanceOf(AreaModelHidden);
        expect(tm.isHeaderVisibe()).toBe(false);
      });

      it('supports several header rows', () => {
        const tm = TableFactory.createTableModel({
          headerData: [['Group', ''], ['A', 'B']],
          bodyData: [[1, 2]],
          columnSizes: [50, 50],
        });
        expect(tm.getAreaModel('header').getRowCount()).toBe(2);
        expect(headerLabels(tm, 1)).toEqual(['A', 'B']);
        tm.init();
        expect(tm.getPadding().top).toBe(2 * 34); // header height
      });

      it('uses the column sizes as column widths', () => {
        const tm = TableFactory.createTableModel({ headerData: [['A', 'B']], bodyData: [[1, 2]], columnSizes: [80, 160] });
        tm.init();
        expect(tm.getColumnWidth(0)).toBe(80);
        expect(tm.getColumnWidth(1)).toBe(160);
        expect(tm.getContentWidthInPixel()).toBe(240);
      });

      it('has no column definitions', () => {
        const tm = TableFactory.createTableModel({ headerData: [['A']], bodyData: [[1]], columnSizes: [80] });
        expect(tm.getColumnDefs()).toEqual([]);
      });

      // Regression (fixed in 1.1.103): without columnSizes the widths were filled with overridingColumnWidth (-1).
      it('gives the columns a width of 100px when columnSizes is missing', () => {
        const tm = TableFactory.createTableModel({ headerData: [['A', 'B']], bodyData: [[1, 2]] });
        tm.init();
        expect(tm.getColumnWidth(0)).toBe(100);
        expect(tm.getColumnWidth(1)).toBe(100);
        expect(tm.getContentWidthInPixel()).toBe(200);
      });
    });

    describe('with own area models', () => {
      it('uses the given body model', () => {
        const body = new OwnBody();
        const tm = TableFactory.createTableModel({ bodyAreaModel: body, columnDefs: orderDefs() });
        expect(tm.getBodyModel()).toBe(body);
        expect(headerLabels(tm)).toEqual(['ID', 'Customer', 'Total']);
      });

      it('takes the row heights from the defaultRowHeight of the given area models', () => {
        const header = new AreaModelArrayOfArrays<string>('header', [['A']], 40);
        const footer = new AreaModelArrayOfArrays<string>('footer', [['F']], 22);
        const tm = TableFactory.createTableModel({
          headerAreaModel: header,
          bodyAreaModel: new OwnBody(),
          footerAreaModel: footer,
          columnCount: 1,
        }) as TableModel;
        expect(tm.defaultRowHeights.header).toBe(40);
        expect(tm.defaultRowHeights.body).toBe(50);
        expect(tm.defaultRowHeights.footer).toBe(22);
      });

      it('ignores a defaultRowHeight of -1 of the given area models', () => {
        const body = new AreaModelArrayOfArrays<number>('body', [[1]], -1);
        const tm = TableFactory.createTableModel({ bodyAreaModel: body, columnCount: 1 }) as TableModel;
        expect(tm.defaultRowHeights.body).toBe(34);
      });

      it('sets the area idents of the given models', () => {
        const header = new AreaModelHidden('body');
        const footer = new AreaModelHidden('body');
        TableFactory.createTableModel({ headerAreaModel: header, footerAreaModel: footer, bodyAreaModel: new OwnBody(), columnCount: 1 });
        expect(header.areaIdent).toBe('header');
        expect(footer.areaIdent).toBe('footer');
      });

      it('creates a hidden body without rows, bodyData and bodyAreaModel', () => {
        const tm = TableFactory.createTableModel({ columnDefs: orderDefs() });
        expect(tm.getBodyModel()).toBeInstanceOf(AreaModelHidden);
        expect(tm.getBodyModel().getRowCount()).toBe(0);
      });
    });

    describe('options', () => {
      it('uses 34px row heights by default', () => {
        const tm = TableFactory.createTableModel({ rows: orders() }) as TableModel;
        expect(tm.defaultRowHeights).toEqual(new DefaultRowHeights(34, 34, 34));
        expect(tm.getRowHeight('body', 0)).toBe(34);
      });

      it('uses the given defaultRowHeights for all areas', () => {
        const tm = TableFactory.createTableModel({
          rows: orders(),
          footerData: [['sum']],
          defaultRowHeights: new DefaultRowHeights(40, 30, 20),
        });
        expect(tm.getRowHeight('header', 0)).toBe(40);
        expect(tm.getRowHeight('body', 0)).toBe(30);
        expect(tm.getRowHeight('footer', 0)).toBe(20);
        tm.init();
        expect(tm.getContentHeightInPixel()).toBe(90);
        expect(tm.getPadding().top).toBe(40);
        expect(tm.getPadding().bottom).toBe(20);
      });

      it('takes defaultRowHeights from tableOptions if not given explicitly', () => {
        const tableOptions: TableOptionsIf = { ...new TableOptions(), defaultRowHeights: { header: 41, body: 31, footer: 21 } };
        const tm = TableFactory.createTableModel({ rows: orders(), tableOptions });
        expect(tm.getRowHeight('header', 0)).toBe(41);
        expect(tm.getRowHeight('body', 0)).toBe(31);
      });

      it('prefers explicit defaultRowHeights over tableOptions.defaultRowHeights', () => {
        const tableOptions: TableOptionsIf = { ...new TableOptions(), defaultRowHeights: { header: 41, body: 31, footer: 21 } };
        const tm = TableFactory.createTableModel({ rows: orders(), tableOptions, defaultRowHeights: new DefaultRowHeights(10, 11, 12) });
        expect(tm.getRowHeight('body', 0)).toBe(11);
      });

      it('passes fixedLeftColumnCount and fixedRightColumnCount', () => {
        const tm = TableFactory.createTableModel({ rows: orders(), fixedLeftColumnCount: 1, fixedRightColumnCount: 1 });
        expect(tm.getFixedLeftColumnCount()).toBe(1);
        expect(tm.getFixedRightColumnCount()).toBe(1);
      });

      it('has no fixed columns and no row checkbox by default', () => {
        const tm = TableFactory.createTableModel({ rows: orders() });
        expect(tm.getFixedLeftColumnCount()).toBe(0);
        expect(tm.getFixedRightColumnCount()).toBe(0);
        expect(tm.isRowCheckboxVisible()).toBe(false);
      });

      it('passes rowCheckboxVisible', () => {
        const tm = TableFactory.createTableModel({ rows: orders(), rowCheckboxVisible: true });
        expect(tm.isRowCheckboxVisible()).toBe(true);
      });

      it('takes getSelectionModel from tableOptions', () => {
        const sm = new SelectionModel('row', 'multi');
        const tableOptions: TableOptionsIf = { ...new TableOptions(), getSelectionModel: () => sm };
        const tm = TableFactory.createTableModel({ rows: orders(), tableOptions });
        expect(tm.getSelectionModel()).toBe(sm);
      });

      it('prefers an explicit getSelectionModel over tableOptions', () => {
        const sm1 = new SelectionModel('row', 'multi');
        const sm2 = new SelectionModel('cell', 'single');
        const tableOptions: TableOptionsIf = { ...new TableOptions(), getSelectionModel: () => sm1 };
        const tm = TableFactory.createTableModel({ rows: orders(), tableOptions, getSelectionModel: () => sm2 });
        expect(tm.getSelectionModel()).toBe(sm2);
      });

      it('has no selection model by default', () => {
        expect(TableFactory.createTableModel({ rows: orders() }).getSelectionModel()).toBeUndefined();
      });

      it('passes overridingColumnWidth', () => {
        const tm = TableFactory.createTableModel({ rows: orders(), overridingColumnWidth: 77 });
        tm.init();
        expect(tm.getColumnWidth(0)).toBe(77);
        expect(tm.getColumnWidth(2)).toBe(77);
      });

      it('passes parentSize (used for % widths on init)', () => {
        const tm = TableFactory.createTableModel({
          rows: orders(),
          columnDefs: [new ColumnDef('id', 'ID', { value: 50, unit: '%' })],
          parentSize: 1000,
        });
        tm.init();
        expect(tm.getColumnWidth(0)).toBe(500);
      });

      it('passes an explicit columnCount', () => {
        const tm = TableFactory.createTableModel({ bodyData: [[1, 2, 3]], columnCount: 2, columnSizes: [10, 10, 10] });
        expect(tm.getColumnCount()).toBe(2);
      });

      it('mutates the given parameter object (fills in derived values)', () => {
        // NOTE: the parameter object is completed in place – calling createTableModel twice with the same object
        // reuses the area models of the first call.
        const p = { rows: orders() } as Parameters<typeof TableFactory.createTableModel>[0];
        const tm1 = TableFactory.createTableModel(p);
        expect(p.columnDefs?.length).toBe(3);
        expect(p.bodyAreaModel).toBe(tm1.getBodyModel());
        const tm2 = TableFactory.createTableModel(p);
        expect(tm2.getBodyModel()).toBe(tm1.getBodyModel());
      });
    });
  });

  describe('createByObjectArray', () => {
    it('builds the header from the column definitions if no header rows are given', () => {
      const tm = TableFactory.createByObjectArray(orders(), undefined, undefined, 0, 0, false, new DefaultRowHeights(), orderDefs());
      expect(headerLabels(tm)).toEqual(['ID', 'Customer', 'Total']);
      expect(tm.getColumnCount()).toBe(3);
      expect(bodyRow(tm, 0)).toEqual([1, 'Alice', 10]);
      expect(tm.getBodyModel()).toBeInstanceOf(AreaModelObjectArrayWithColumndefs);
    });

    it('uses the given header and footer rows', () => {
      const tm = TableFactory.createByObjectArray(orders(), [['#', 'Who', 'Sum']], [['', '', '60']], 1, 1, true,
        new DefaultRowHeights(40, 30, 20), orderDefs());
      expect(headerLabels(tm)).toEqual(['#', 'Who', 'Sum']);
      expect(tm.getAreaModel('footer').getValueAt(0, 2)).toBe('60');
      expect(tm.getFixedLeftColumnCount()).toBe(1);
      expect(tm.getFixedRightColumnCount()).toBe(1);
      expect(tm.isRowCheckboxVisible()).toBe(true);
      expect(tm.getRowHeight('header', 0)).toBe(40);
      expect(tm.getRowHeight('body', 0)).toBe(30);
      expect(tm.getRowHeight('footer', 0)).toBe(20);
    });

    it('creates an empty (invisible) footer by default', () => {
      const tm = TableFactory.createByObjectArray(orders(), [], [], 0, 0, false, new DefaultRowHeights(), orderDefs());
      expect(tm.getAreaModel('footer').getRowCount()).toBe(0);
      expect(tm.isFooterVisibe()).toBe(false);
    });

    it('hides the header without header rows and without column definitions', () => {
      const tm = TableFactory.createByObjectArray(orders(), [], [], 0, 0, false, new DefaultRowHeights(), [], [10, 20]);
      expect(tm.getAreaModel('header')).toBeInstanceOf(AreaModelHidden);
      expect(tm.getColumnCount()).toBe(2);
    });

    it('createByObjectArrayParam fills in the defaults', () => {
      const tm = TableFactory.createByObjectArrayParam<Order>({ rows: orders(), columnDefs: orderDefs() });
      expect(headerLabels(tm)).toEqual(['ID', 'Customer', 'Total']);
      expect(tm.getFixedLeftColumnCount()).toBe(0);
      expect(tm.getFixedRightColumnCount()).toBe(0);
      expect(tm.isRowCheckboxVisible()).toBe(false);
      expect(tm.getRowHeight('body', 0)).toBe(34);
    });

    it('createByObjectArrayParam passes all parameters', () => {
      const tm = TableFactory.createByObjectArrayParam<Order>({
        rows: orders(),
        header: [['Name', 'Age']],
        footer: [['Avg', '35']],
        fixedLeftColumnCount: 1,
        fixedRightColumnCount: 0,
        rowCheckboxVisible: true,
        defaultRowHeights: new DefaultRowHeights(40, 50, 40),
        columnDefs: [new ColumnDef('customer', 'Name', px100), new ColumnDef('total', 'Age', px50)],
        columnSizes: [100, 50],
      });
      expect(headerLabels(tm)).toEqual(['Name', 'Age']);
      expect(tm.getAreaModel('footer').getValueAt(0, 1)).toBe('35');
      expect(bodyRow(tm, 1)).toEqual(['Bob', 20]);
      expect(tm.getFixedLeftColumnCount()).toBe(1);
      expect(tm.isRowCheckboxVisible()).toBe(true);
      expect(tm.getRowHeight('body', 0)).toBe(50);
    });
  });

  describe('buildByTypedRows', () => {
    it('builds a flat table with header labels from the column definitions', () => {
      const tm = TableFactory.buildByTypedRows<Order>(orders(), orderDefs());
      expect(tm.getColumnCount()).toBe(3);
      expect(headerLabels(tm)).toEqual(['ID', 'Customer', 'Total']);
      expect(bodyRow(tm, 2)).toEqual([3, 'Carol', 30]);
      expect(tm.getBodyModel()).toBeInstanceOf(AreaModelObjectArrayWithColumndefs);
      expect(tm.isFooterVisibe()).toBe(false);
    });

    it('takes the row heights from tableOptions.defaultRowHeights', () => {
      const tableOptions: TableOptionsIf = { ...new TableOptions(), defaultRowHeights: { header: 45, body: 25, footer: 15 } };
      const tm = TableFactory.buildByTypedRows<Order>(orders(), orderDefs(), tableOptions);
      expect(tm.getRowHeight('header', 0)).toBe(45);
      expect(tm.getRowHeight('body', 0)).toBe(25);
    });

    it('passes the fixed column counts', () => {
      const tm = TableFactory.buildByTypedRows<Order>(orders(), orderDefs(), new TableOptions(), 1, 2);
      expect(tm.getFixedLeftColumnCount()).toBe(1);
      expect(tm.getFixedRightColumnCount()).toBe(2);
    });

    it('ignores tableOptions.getSelectionModel', () => {
      // NOTE: unlike createTableModel, buildByTypedRows does not take the selection model from the options
      // (CrudTableModelFactory sets tableModel.getSelectionModel afterwards).
      const sm = new SelectionModel('row', 'multi');
      const tableOptions: TableOptionsIf = { ...new TableOptions(), getSelectionModel: () => sm };
      const tm = TableFactory.buildByTypedRows<Order>(orders(), orderDefs(), tableOptions);
      expect(tm.getSelectionModel()).toBeUndefined();
    });

    it('adds a CheckboxModel if the first column is a CheckboxColumnDef', () => {
      const tm = TableFactory.buildByTypedRows<Order>(orders(), [new CheckboxColumnDef(), ...orderDefs()]);
      expect(tm.getBodyModel().rowSelectionModel).toBeInstanceOf(CheckboxModel);
      expect(tm.getAreaModel('header').getValueAt(0, 0)).toBe('');
    });

    it('builds a tree table for tree rows', () => {
      const treeRows = [new TreeRow<Order>(orders()[0]!, true, [], undefined)];
      const tm = TableFactory.buildByTypedRows<TreeRow<Order>>(treeRows, orderDefs(), new TableOptions(), 1, 0);
      expect(tm.getBodyModel()).toBeInstanceOf(AreaModelTree);
      expect(tm.getBodyModel().rowSelectionModel).toBeUndefined();
      expect(headerLabels(tm)).toEqual(['ID', 'Customer', 'Total']);
      expect(tm.getFixedLeftColumnCount()).toBe(1);
      expect(tm.getColumnCount()).toBe(3);
    });

    it('adds a TreeCheckboxModel to a tree with a CheckboxColumnDef as first column', () => {
      const treeRows = [new TreeRow<Order>(orders()[0]!, true, [], undefined)];
      const tm = TableFactory.buildByTypedRows<TreeRow<Order>>(treeRows, [new CheckboxColumnDef(), ...orderDefs()]);
      expect(tm.getBodyModel().rowSelectionModel).toBeInstanceOf(TreeCheckboxModel);
    });

    it('builds an empty table for empty rows', () => {
      const tm = TableFactory.buildByTypedRows<Order>([], orderDefs());
      expect(tm.getBodyModel().getRowCount()).toBe(0);
      expect(tm.getColumnCount()).toBe(3);
    });

    // Fixed in 1.1.93 (row numbers): buildByTypedRows read columnDefs[0].property without a guard.
    it('does not throw for an empty list of column definitions', () => {
      expect(() => TableFactory.buildByTypedRows<Order>(orders(), [])).not.toThrow();
    });

    it('buildByTypedRowsParam fills in the defaults', () => {
      const tm = TableFactory.buildByTypedRowsParam<Order>({ rows: orders(), columnDefs: orderDefs() });
      expect(tm.getColumnCount()).toBe(3);
      expect(tm.getFixedLeftColumnCount()).toBe(0);
      expect(tm.getFixedRightColumnCount()).toBe(0);
      expect(tm.getRowHeight('body', 0)).toBe(34);
    });

    it('buildByTypedRowsParam passes all parameters', () => {
      const tableOptions: TableOptionsIf = { ...new TableOptions(), defaultRowHeights: { header: 20, body: 21, footer: 22 } };
      const tm = TableFactory.buildByTypedRowsParam<Order>({
        rows: orders(), columnDefs: orderDefs(), tableOptions, fixedLeftColumnCount: 1, fixedRightColumnCount: 1,
      });
      expect(tm.getFixedLeftColumnCount()).toBe(1);
      expect(tm.getFixedRightColumnCount()).toBe(1);
      expect(tm.getRowHeight('body', 0)).toBe(21);
    });
  });

  describe('createByAreaModels', () => {
    it('creates a TableModel from the given area models', () => {
      const header = new AreaModelArrayOfArrays<string>('header', [['A', 'B']], 30);
      const body = new AreaModelArrayOfArrays<number>('body', [[1, 2], [3, 4]], 30);
      const footer = new AreaModelArrayOfArrays<string>('footer', [['x', 'y']], 30);
      const tm = TableFactory.createByAreaModels(header, body, footer, 1, 0, true, new DefaultRowHeights(30, 30, 30), [], [50, 60], -1, 2);
      expect(tm).toBeInstanceOf(TableModel);
      expect(tm.getAreaModel('header')).toBe(header);
      expect(tm.getBodyModel()).toBe(body);
      expect(tm.getAreaModel('footer')).toBe(footer);
      expect(tm.getColumnCount()).toBe(2);
      expect(tm.getFixedLeftColumnCount()).toBe(1);
      expect(tm.isRowCheckboxVisible()).toBe(true);
      tm.init();
      expect(tm.getColumnWidth(1)).toBe(60);
    });

    it('createByAreaModelsParam uses hidden header/footer and defaults', () => {
      const body = new AreaModelArrayOfArrays<number>('body', [[1, 2]], 30);
      const tm = TableFactory.createByAreaModelsParam({ bodyAreaModel: body, columnSizes: [10, 20] }) as TableModel;
      expect(tm.getAreaModel('header')).toBeInstanceOf(AreaModelHidden);
      expect(tm.getAreaModel('footer')).toBeInstanceOf(AreaModelHidden);
      expect(tm.isHeaderVisibe()).toBe(false);
      expect(tm.getFixedLeftColumnCount()).toBe(0);
      expect(tm.getFixedRightColumnCount()).toBe(0);
      expect(tm.isRowCheckboxVisible()).toBe(false);
      expect(tm.defaultRowHeights).toEqual(new DefaultRowHeights());
      expect(tm.getColumnCount()).toBe(2); // derived from columnSizes
    });

    it('createByAreaModelsParam derives the column count from the column definitions', () => {
      const body = new AreaModelObjectArray<Order>('body', orders(), 30, orderDefs());
      const tm = TableFactory.createByAreaModelsParam({ bodyAreaModel: body, columnDefs: orderDefs() });
      expect(tm.getColumnCount()).toBe(3);
    });

    it('createByAreaModelsParam passes all parameters', () => {
      const body = new AreaModelArrayOfArrays<number>('body', [[1, 2, 3]], 30);
      const tm = TableFactory.createByAreaModelsParam({
        bodyAreaModel: body,
        fixedLeftColumnCount: 1,
        fixedRightColumnCount: 1,
        rowCheckboxVisible: true,
        defaultRowHeights: new DefaultRowHeights(10, 20, 30),
        columnSizes: [100, 100, 200],
        overridingColumnWidth: 150,
        columnCount: 3,
      });
      tm.init();
      expect(tm.getFixedLeftColumnCount()).toBe(1);
      expect(tm.getFixedRightColumnCount()).toBe(1);
      expect(tm.isRowCheckboxVisible()).toBe(true);
      expect(tm.getColumnWidth(2)).toBe(150);
      expect(tm.getXPosByColumnIndex(2)).toBe(300);
      expect(tm.getContentHeightInPixel()).toBe(20);
    });
  });
});
