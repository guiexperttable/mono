import { describe, it, expect, vi } from 'vitest';
import {
  AreaModel,
  AreaModelArrayOfArrays,
  AreaModelHidden,
  AreaModelObjectArray,
  CheckboxColumnDef,
  CheckboxModel,
  ColumnDef,
  DefaultRowHeights,
  FalseFn,
  Padding,
  SelectionModel,
  Size,
  SortItem,
  TableFactory,
  TableModel,
  TrueFn,
  px50,
  px100,
  px200,
} from '@guiexpert/table';
import type { ColumnDefIf, TableScope } from '@guiexpert/table';

interface Row {
  id: number;
  name: string;
  age: number;
  city: string;
  zip: string;
}

const rows = (): Row[] => [
  { id: 1, name: 'John', age: 30, city: 'Berlin', zip: '10115' },
  { id: 2, name: 'Jane', age: 25, city: 'Paris', zip: '75001' },
  { id: 3, name: 'Bob', age: 40, city: 'Rome', zip: '00100' },
];

/** five columns: 50 + 100 + 200 + 100 + 50 = 500 px */
const defs = (): ColumnDefIf[] => [
  new ColumnDef('id', 'ID', px50),
  new ColumnDef('name', 'Name', px100),
  new ColumnDef('age', 'Age', px200),
  new ColumnDef('city', 'City', px100),
  new ColumnDef('zip', 'Zip', px50),
];

const create = (p: { fixedLeftColumnCount?: number, fixedRightColumnCount?: number, columnDefs?: ColumnDefIf[], footerData?: string[][] } = {}) => {
  const columnDefs = p.columnDefs ?? defs();
  const header = new AreaModelArrayOfArrays<string>('header', [columnDefs.map(d => d.headerLabel)], 40, columnDefs);
  const body = new AreaModelObjectArray<Row>('body', rows(), 30, columnDefs);
  const footer = p.footerData
    ? new AreaModelArrayOfArrays<string>('footer', p.footerData, 20, columnDefs)
    : new AreaModelHidden('footer');
  return new TableModel(header, body, footer, p.fixedLeftColumnCount ?? 0, p.fixedRightColumnCount ?? 0, false,
    new DefaultRowHeights(40, 30, 20), columnDefs);
};

/** plain ColumnDefIf object – ColumnDef's constructor would reset minWidth / maxWidth for non-px widths */
const plainDef = (property: string, width: Size, minWidth: Size, maxWidth: Size): ColumnDefIf => ({
  property, headerLabel: property, width, minWidth, maxWidth, rendererMap: {}, classes: {},
});

const widths = (tm: TableModel) => Array.from({ length: tm.getColumnCount() }, (_, i) => tm.getColumnWidth(i));

class VariableHeightBody extends AreaModel {
  override getRowCount(): number {
    return 3;
  }

  override getRowHeight(rowIndex: number): number {
    return [10, 20, 30][rowIndex] ?? 0;
  }
}

describe('TableModel', () => {

  describe('constructor', () => {
    it('sets the area idents of the three area models', () => {
      const h = new AreaModelHidden('body');
      const b = new AreaModelHidden('footer');
      const f = new AreaModelHidden('header');
      new TableModel(h, b, f);
      expect([h.areaIdent, b.areaIdent, f.areaIdent]).toEqual(['header', 'body', 'footer']);
    });

    it('has sensible defaults', () => {
      const tm = new TableModel(new AreaModelHidden(), new AreaModelHidden(), new AreaModelHidden());
      expect(tm.getColumnCount()).toBe(0);
      expect(tm.getFixedLeftColumnCount()).toBe(0);
      expect(tm.getFixedRightColumnCount()).toBe(0);
      expect(tm.isRowCheckboxVisible()).toBe(false);
      expect(tm.defaultRowHeights).toEqual(new DefaultRowHeights(34, 34, 34));
      expect(tm.getColumnDefs()).toEqual([]);
      expect(tm.getSelectionModel()).toBeUndefined();
      expect(tm.getTableScope()).toBeUndefined();
      expect(tm.getPadding()).toEqual(new Padding(0, 0, 0, 0));
      expect(tm.getContentHeightInPixel()).toBe(0);
      expect(tm.getContentWidthInPixel()).toBe(0);
    });

    it('adds a CheckboxModel to the body if the first column is a CheckboxColumnDef', () => {
      const body = new AreaModelObjectArray<Row>('body', rows(), 30, []);
      new TableModel(new AreaModelHidden(), body, new AreaModelHidden(), 0, 0, false, new DefaultRowHeights(), [new CheckboxColumnDef(), ...defs()]);
      expect(body.rowSelectionModel).toBeInstanceOf(CheckboxModel);
    });

    it('keeps an existing rowSelectionModel of the body', () => {
      const body = new AreaModelObjectArray<Row>('body', rows(), 30, []);
      const existing = new CheckboxModel<Row>();
      body.rowSelectionModel = existing;
      new TableModel(new AreaModelHidden(), body, new AreaModelHidden(), 0, 0, false, new DefaultRowHeights(), [new CheckboxColumnDef()]);
      expect(body.rowSelectionModel).toBe(existing);
    });

    it('adds no CheckboxModel if the CheckboxColumnDef is not the first column', () => {
      const body = new AreaModelObjectArray<Row>('body', rows(), 30, []);
      new TableModel(new AreaModelHidden(), body, new AreaModelHidden(), 0, 0, false, new DefaultRowHeights(), [...defs(), new CheckboxColumnDef()]);
      expect(body.rowSelectionModel).toBeUndefined();
    });

    it('passes the getSelectionModel function', () => {
      const sm = new SelectionModel('cell', 'single');
      const tm = new TableModel(new AreaModelHidden(), new AreaModelHidden(), new AreaModelHidden(),
        0, 0, false, new DefaultRowHeights(), [], [], -1, 0, 400, () => sm);
      expect(tm.getSelectionModel()).toBe(sm);
    });
  });

  describe('getColumnCount', () => {
    it('is the number of column definitions', () => {
      expect(create().getColumnCount()).toBe(5);
    });

    it('is the number of column sizes without column definitions', () => {
      const tm = new TableModel(new AreaModelHidden(), new AreaModelHidden(), new AreaModelHidden(), 0, 0, false,
        new DefaultRowHeights(), [], [10, 20, 30]);
      expect(tm.getColumnCount()).toBe(3);
    });

    it('prefers an explicit column count', () => {
      const tm = new TableModel(new AreaModelHidden(), new AreaModelHidden(), new AreaModelHidden(), 0, 0, false,
        new DefaultRowHeights(), defs(), [], -1, 2);
      expect(tm.getColumnCount()).toBe(2);
    });
  });

  describe('column widths', () => {
    it('are 0 before init()', () => {
      expect(create().getColumnWidth(0)).toBe(0);
    });

    it('take px widths from the column definitions on init()', () => {
      const tm = create();
      tm.init();
      expect(widths(tm)).toEqual([50, 100, 200, 100, 50]);
    });

    it('are 0 for an index out of range', () => {
      const tm = create();
      tm.init();
      expect(tm.getColumnWidth(-1)).toBe(0);
      expect(tm.getColumnWidth(5)).toBe(0);
    });

    it('are 0 for a column whose isVisible() returns false', () => {
      const columnDefs = defs();
      columnDefs[1]!.isVisible = FalseFn;
      const tm = create({ columnDefs });
      tm.init();
      expect(widths(tm)).toEqual([50, 0, 200, 100, 50]);
      expect(tm.getContentWidthInPixel()).toBe(400);
    });

    it('follow ColumnDef.visible (the default isVisible of the constructor)', () => {
      const columnDefs = defs();
      const tm = create({ columnDefs });
      tm.init();
      (columnDefs[2] as ColumnDef).visible = false;
      expect(tm.getColumnWidth(2)).toBe(0);
    });

    it('px widths are 0 for a client width of 0', () => {
      // NOTE: recalcSize(0) sets every px column to width 0 (px values are only used for a truthy client width).
      const tm = create();
      tm.recalcSize(0);
      expect(widths(tm)).toEqual([0, 0, 0, 0, 0]);
    });

    describe('% widths', () => {
      it('are a percentage of the client width (floored)', () => {
        const tm = create({ columnDefs: [new ColumnDef('a', 'A', new Size(25, '%')), new ColumnDef('b', 'B', new Size(33.3, '%'))] });
        tm.recalcSize(1000);
        expect(widths(tm)).toEqual([250, 333]);
      });

      it('use the parent size (default 400) on init()', () => {
        const tm = create({ columnDefs: [new ColumnDef('a', 'A', new Size(50, '%'))] });
        tm.init();
        expect(tm.getColumnWidth(0)).toBe(200);
      });

      it('use the width given with setParentWidth() on init()', () => {
        const tm = create({ columnDefs: [new ColumnDef('a', 'A', new Size(50, '%'))] });
        tm.setParentWidth(1000);
        tm.init();
        expect(tm.getColumnWidth(0)).toBe(500);
      });

      it('are raised to minWidth (px)', () => {
        const tm = create({ columnDefs: [plainDef('a', new Size(10, '%'), new Size(200, 'px'), new Size(500, 'px'))] });
        tm.recalcSize(1000);
        expect(tm.getColumnWidth(0)).toBe(200);
      });

      it('are limited to maxWidth (px)', () => {
        const tm = create({ columnDefs: [plainDef('a', new Size(50, '%'), new Size(0, 'px'), new Size(300, 'px'))] });
        tm.recalcSize(1000);
        expect(tm.getColumnWidth(0)).toBe(300);
      });

      it('are limited to a maxWidth given in %', () => {
        const tm = create({ columnDefs: [plainDef('a', new Size(50, '%'), new Size(0, 'px'), new Size(20, '%'))] });
        tm.recalcSize(1000);
        expect(tm.getColumnWidth(0)).toBe(200);
      });

      it('ignore minWidth and maxWidth of a ColumnDef instance (its constructor resets them for non-px widths)', () => {
        // see column-def.spec.ts – the limits only work with plain ColumnDefIf objects.
        // Pins the BUG of column-def.spec.ts ('keeps an explicit minWidth and maxWidth for a % width'):
        // once that is fixed, this test fails – then expect 200 here.
        const tm = create({ columnDefs: [ColumnDef.create({ property: 'a', width: new Size(10, '%'), minWidth: new Size(200, 'px') })] });
        tm.recalcSize(1000);
        expect(tm.getColumnWidth(0)).toBe(100);
      });
    });

    describe('weight widths', () => {
      it('share the remaining width according to their weights', () => {
        const tm = create({
          columnDefs: [
            new ColumnDef('a', 'A', px100),
            new ColumnDef('b', 'B', new Size(1, 'weight')),
            new ColumnDef('c', 'C', new Size(3, 'weight')),
          ],
        });
        tm.recalcSize(500);
        expect(widths(tm)).toEqual([100, 100, 300]);
      });

      it('take the % columns into account', () => {
        const tm = create({
          columnDefs: [new ColumnDef('a', 'A', new Size(50, '%')), new ColumnDef('b', 'B', new Size(1, 'weight'))],
        });
        tm.recalcSize(800);
        expect(widths(tm)).toEqual([400, 400]);
      });

      it('may be fractional', () => {
        const tm = create({
          columnDefs: [new ColumnDef('a', 'A', new Size(1, 'weight')), new ColumnDef('b', 'B', new Size(2, 'weight'))],
        });
        tm.recalcSize(100);
        expect(tm.getColumnWidth(0)).toBeCloseTo(100 / 3);
        expect(tm.getColumnWidth(1)).toBeCloseTo(200 / 3);
      });

      it('are 0 if there is no remaining width', () => {
        const tm = create({
          columnDefs: [new ColumnDef('a', 'A', px200), new ColumnDef('b', 'B', new Size(1, 'weight'))],
        });
        tm.recalcSize(150);
        expect(widths(tm)).toEqual([200, 0]);
      });

      // Regression: hidden columns kept their share – a hidden px column still took its width away from the weight
      // columns, a hidden weight column its part of the weights (the shown columns did not fill the table).
      it('are shared among the shown columns only (setColumnVisible)', () => {
        const tm = create({
          columnDefs: [
            new ColumnDef('a', 'A', px100),
            new ColumnDef('b', 'B', new Size(1, 'weight')),
            new ColumnDef('c', 'C', new Size(3, 'weight')),
          ],
        });
        tm.recalcSize(500);
        tm.setColumnVisible('a', false);
        expect(widths(tm)).toEqual([0, 125, 375]);
        tm.setColumnVisible('c', false);
        expect(widths(tm)).toEqual([0, 500, 0]);
        tm.setColumnVisible('a', true);
        tm.setColumnVisible('c', true);
        expect(widths(tm)).toEqual([100, 100, 300]);
      });
    });

    describe('overridingColumnWidth', () => {
      const createOverriding = () => new TableModel(new AreaModelHidden(), new AreaModelHidden(), new AreaModelHidden(),
        0, 0, false, new DefaultRowHeights(), [], [], 80, 4);

      it('is the width of every column', () => {
        const tm = createOverriding();
        tm.init();
        expect([0, 1, 2, 3].map(i => tm.getColumnWidth(i))).toEqual([80, 80, 80, 80]);
      });

      it('defines the x positions', () => {
        const tm = createOverriding();
        tm.init();
        expect(tm.getXPosByColumnIndex(3)).toBe(240);
      });

      it('setColumnWidth changes the width of all columns', () => {
        // NOTE: with an overriding column width, setColumnWidth(i, w) resizes every column, not only column i.
        const tm = createOverriding();
        tm.init();
        tm.setColumnWidth(1, 50);
        expect([0, 1, 2, 3].map(i => tm.getColumnWidth(i))).toEqual([50, 50, 50, 50]);
      });
    });
  });

  describe('setColumnWidth', () => {
    it('sets the width of one column and recalculates the content width', () => {
      const tm = create();
      tm.init();
      tm.setColumnWidth(1, 150);
      expect(tm.getColumnWidth(1)).toBe(150);
      expect(tm.getContentWidthInPixel()).toBe(550);
    });

    it('uses 0 for negative widths', () => {
      const tm = create();
      tm.init();
      tm.setColumnWidth(1, -20);
      expect(tm.getColumnWidth(1)).toBe(0);
    });

    it('ignores an index out of range', () => {
      const tm = create();
      tm.init();
      tm.setColumnWidth(10, 999);
      expect(widths(tm)).toEqual([50, 100, 200, 100, 50]);
    });

    // Regression: recalcSize() rebuilds all widths from the column definitions – a width set with setColumnWidth()
    // was lost (every host resize). Now setColumnWidth() also stores it in the ColumnDef.
    it('survives the next recalcSize() (stored in the ColumnDef)', () => {
      const tm = create();
      tm.init();
      tm.setColumnWidth(1, 150);
      tm.recalcSize(400);
      expect(tm.getColumnWidth(1)).toBe(150);
      expect(tm.getColumnDefs()![1]!.width).toMatchObject({ value: 150, unit: 'px' });
    });

    // Regression: setColumnWidth did not recalculate the cached x positions – getXPosByColumnIndex was stale until
    // init()/changeColumnOrder() (GeMouseEvent.columnLeft too).
    it('updates getXPosByColumnIndex of the following columns', () => {
      const tm = create();
      tm.init();
      tm.setColumnWidth(0, 10);
      expect(tm.getXPosByColumnIndex(1)).toBe(10);
    });
  });

  describe('getXPosByColumnIndex', () => {
    it('is the sum of the widths of all columns to the left', () => {
      const tm = create();
      tm.init();
      expect([0, 1, 2, 3, 4, 5].map(i => tm.getXPosByColumnIndex(i))).toEqual([0, 50, 150, 350, 450, 500]);
    });

    it('is 0 for column 0 even before init()', () => {
      expect(create().getXPosByColumnIndex(0)).toBe(0);
    });

    it('is undefined for other columns before init()', () => {
      // NOTE: the x positions are only computed in init() / changeColumnOrder().
      expect(create().getXPosByColumnIndex(2)).toBeUndefined();
    });
  });

  describe('sides (west / center / east)', () => {
    it('getSideStartAndEndColumnIndex without fixed columns', () => {
      const tm = create();
      expect(tm.getSideStartAndEndColumnIndex('west')).toEqual([0, -1]);
      expect(tm.getSideStartAndEndColumnIndex('center')).toEqual([0, 4]);
      expect(tm.getSideStartAndEndColumnIndex('east')).toEqual([5, 4]);
    });

    it('getSideStartAndEndColumnIndex with fixed columns', () => {
      const tm = create({ fixedLeftColumnCount: 1, fixedRightColumnCount: 2 });
      expect(tm.getSideStartAndEndColumnIndex('west')).toEqual([0, 0]);
      expect(tm.getSideStartAndEndColumnIndex('center')).toEqual([1, 2]);
      expect(tm.getSideStartAndEndColumnIndex('east')).toEqual([3, 4]);
    });

    it('getSideAreaWidth sums the widths of the columns of a side', () => {
      const tm = create({ fixedLeftColumnCount: 1, fixedRightColumnCount: 2 });
      tm.init();
      expect(tm.getSideAreaWidth('west')).toBe(50);
      expect(tm.getSideAreaWidth('center')).toBe(300);
      expect(tm.getSideAreaWidth('east')).toBe(150);
    });

    it('getSideAreaWidth is 0 for sides without columns', () => {
      const tm = create();
      tm.init();
      expect(tm.getSideAreaWidth('west')).toBe(0);
      expect(tm.getSideAreaWidth('east')).toBe(0);
      expect(tm.getSideAreaWidth('center')).toBe(500);
    });

    it('the content width is the width of the center side', () => {
      const tm = create({ fixedLeftColumnCount: 1, fixedRightColumnCount: 2 });
      tm.init();
      expect(tm.getContentWidthInPixel()).toBe(300);
    });

    it('the padding holds header/footer height and west/east width', () => {
      const tm = create({ fixedLeftColumnCount: 1, fixedRightColumnCount: 2, footerData: [['a'], ['b']] });
      tm.init();
      expect(tm.getPadding()).toEqual(new Padding(40, 150, 40, 50));
    });
  });

  describe('heights', () => {
    it('getAreaHeight is row count * default row height of the area', () => {
      const tm = create({ footerData: [['sum']] });
      expect(tm.getAreaHeight('header')).toBe(40);
      expect(tm.getAreaHeight('body')).toBe(90);
      expect(tm.getAreaHeight('footer')).toBe(20);
    });

    it('getAreaHeight is 0 for a hidden area', () => {
      expect(create().getAreaHeight('footer')).toBe(0);
    });

    it('getAreaHeight sums the row heights if the default row height of the area is 0', () => {
      const tm = new TableModel(new AreaModelHidden(), new VariableHeightBody(), new AreaModelHidden(), 0, 0, false,
        new DefaultRowHeights(34, 0, 34), [], [10]);
      expect(tm.getAreaHeight('body')).toBe(60);
    });

    it('getAreaHeight uses the default row height of the table model, not the row heights of the area model', () => {
      // NOTE: an area model with its own row height (here 30) is measured with TableModel.defaultRowHeights (here 99).
      const body = new AreaModelObjectArray<Row>('body', rows(), 30, defs());
      const tm = new TableModel(new AreaModelHidden(), body, new AreaModelHidden(), 0, 0, false, new DefaultRowHeights(34, 99, 34), defs());
      expect(tm.getAreaHeight('body')).toBe(3 * 99);
      expect(tm.getRowHeight('body', 0)).toBe(30);
    });

    // BUG: TableModel.getAreaHeight ignores getRowHeight() whenever defaultRowHeights.body is set (34 by default, also via TableFactory),
    // so the scroll height of a body with variable row heights is wrong (ele-scope.ts expects "sum of rows height").
    it.fails('getContentHeightInPixel is the sum of the body row heights for variable row heights', () => {
      const tm = TableFactory.createTableModel({ bodyAreaModel: new VariableHeightBody(), columnSizes: [100] });
      tm.init();
      expect(tm.getContentHeightInPixel()).toBe(60);
    });

    it('getContentHeightInPixel is the body height after init()', () => {
      const tm = create();
      expect(tm.getContentHeightInPixel()).toBe(0);
      tm.init();
      expect(tm.getContentHeightInPixel()).toBe(90);
    });

    it('getRowHeight delegates to the area model', () => {
      const tm = create({ footerData: [['x']] });
      expect(tm.getRowHeight('header', 0)).toBe(40);
      expect(tm.getRowHeight('body', 2)).toBe(30);
      expect(tm.getRowHeight('footer', 0)).toBe(20);
    });

    it('recalcHeightAndPadding follows the filtered row count', () => {
      const tm = create();
      tm.init();
      tm.externalFilterChanged((r: Row) => r.age > 26);
      tm.recalcHeightAndPadding();
      expect(tm.getContentHeightInPixel()).toBe(60);
    });
  });

  describe('init', () => {
    it('calls init() of all three area models', () => {
      const h = new AreaModelHidden();
      const b = new AreaModelHidden();
      const f = new AreaModelHidden();
      const spies = [vi.spyOn(h, 'init'), vi.spyOn(b, 'init'), vi.spyOn(f, 'init')];
      new TableModel(h, b, f).init();
      spies.forEach(s => expect(s).toHaveBeenCalledOnce());
    });
  });

  describe('area models', () => {
    it('getAreaModel returns header, body and footer model', () => {
      const tm = create();
      expect(tm.getAreaModel('header')).toBe(tm.headerAreaModel);
      expect(tm.getAreaModel('body')).toBe(tm.bodyAreaModel);
      expect(tm.getAreaModel('footer')).toBe(tm.footerAreaModel);
      expect(tm.getModel('body')).toBe(tm.bodyAreaModel);
      expect(tm.getBodyModel()).toBe(tm.bodyAreaModel);
    });

    it('getAreaModel throws for an unknown ident', () => {
      expect(() => create().getAreaModel('side' as any)).toThrow('Wrong ident.');
    });

    it('isHeaderVisibe / isFooterVisibe depend on the row count of the area', () => {
      const tm = create();
      expect(tm.isHeaderVisibe()).toBe(true);
      expect(tm.isFooterVisibe()).toBe(false);
      expect(create({ footerData: [['x']] }).isFooterVisibe()).toBe(true);
      const noHeader = new TableModel(new AreaModelHidden(), new AreaModelHidden(), new AreaModelHidden());
      expect(noHeader.isHeaderVisibe()).toBe(false);
    });

    it('getBodyRowByIndex returns the row object of the body', () => {
      expect(create().getBodyRowByIndex(1).name).toBe('Jane');
    });
  });

  describe('column definitions', () => {
    it('getColumnDef returns the definition or undefined out of range', () => {
      const columnDefs = defs();
      const tm = create({ columnDefs });
      expect(tm.getColumnDef(2)).toBe(columnDefs[2]);
      expect(tm.getColumnDef(5)).toBeUndefined();
    });

    it('getColumnProperty returns the property of the column', () => {
      expect(create().getColumnProperty(3)).toBe('city');
    });

    // BUG: the guard only checks `!this.columnDefs` – with the default [] it throws a TypeError instead of returning ''.
    it.fails('getColumnProperty returns an empty string without column definitions', () => {
      const tm = TableFactory.createTableModel({ bodyData: [[1, 2]], columnSizes: [10, 10] });
      expect(tm.getColumnProperty(0)).toBe('');
    });

    it('isSortable evaluates ColumnDef.sortable', () => {
      const tm = create({
        columnDefs: [
          ColumnDef.create({ property: 'id', sortable: TrueFn }),
          ColumnDef.create({ property: 'name', sortable: FalseFn }),
          new ColumnDef('age', 'Age'),
        ],
      });
      expect(tm.isSortable(0)).toBe(true);
      expect(tm.isSortable(1)).toBe(false);
      expect(tm.isSortable(2)).toBe(false);
      expect(tm.isSortable(3)).toBe(false);
    });
  });

  describe('sorting and filtering', () => {
    it('doSort sorts the body model', () => {
      const tm = create();
      expect(tm.doSort([new SortItem(2, 'desc')])).toBe(true);
      expect(tm.getBodyRowByIndex(0).name).toBe('Bob');
    });

    it('doSort returns false for a body model that cannot sort', () => {
      const tm = TableFactory.createTableModel({ bodyData: [[2], [1]], columnSizes: [10] });
      expect(tm.doSort([new SortItem(0, 'asc')])).toBe(false);
      expect(tm.getBodyModel().getValueAt(0, 0)).toBe(2);
    });

    it('sort(compareFn) sorts the body model', () => {
      const tm = create();
      tm.sort((a: Row, b: Row) => a.name.localeCompare(b.name));
      expect(tm.getBodyRowByIndex(0).name).toBe('Bob');
    });

    it('externalFilterChanged filters the body model', () => {
      const tm = create();
      tm.externalFilterChanged((r: Row) => r.city !== 'Paris');
      expect(tm.getBodyModel().getRowCount()).toBe(2);
    });
  });

  describe('changeColumnOrder', () => {
    it('moves the column definitions', () => {
      const tm = create();
      tm.changeColumnOrder(0, 2);
      expect(tm.getColumnDefs()!.map(d => d.property)).toEqual(['name', 'age', 'id', 'city', 'zip']);
    });

    it('moves the body values', () => {
      const tm = create();
      tm.changeColumnOrder(0, 2);
      const body = tm.getBodyModel();
      expect([0, 1, 2, 3, 4].map(c => body.getValueAt(0, c))).toEqual(['John', 30, 1, 'Berlin', '10115']);
    });

    it('moves the header labels', () => {
      const tm = create();
      tm.changeColumnOrder(4, 0);
      const header = tm.getAreaModel('header');
      expect([0, 1, 2, 3, 4].map(c => header.getValueAt(0, c))).toEqual(['Zip', 'ID', 'Name', 'Age', 'City']);
    });

    it('moves the column widths and recalculates the x positions', () => {
      const tm = create();
      tm.init();
      tm.changeColumnOrder(2, 0);
      expect(widths(tm)).toEqual([200, 50, 100, 100, 50]);
      expect(tm.getXPosByColumnIndex(1)).toBe(200);
    });

    it('getColumnProperty follows the new order', () => {
      const tm = create();
      tm.changeColumnOrder(1, 0);
      expect(tm.getColumnProperty(0)).toBe('name');
    });
  });

  // TableApi.setColumnVisible / setHeaderVisible / setFooterVisible were empty stubs (TODO.md, CLAUDE.md §3.6).
  describe('setColumnVisible / isColumnVisible', () => {
    it('hides a column by index: width 0, content width, padding and x positions follow', () => {
      const tm = create({ fixedLeftColumnCount: 1 });
      tm.init();
      expect(tm.getContentWidthInPixel()).toBe(450);
      expect(tm.setColumnVisible(1, false)).toBe(true);
      expect(widths(tm)).toEqual([50, 0, 200, 100, 50]);
      expect(tm.isColumnVisible(1)).toBe(false);
      expect(tm.getContentWidthInPixel()).toBe(350);
      expect(tm.getXPosByColumnIndex(2)).toBe(50);
      expect(tm.getXPosByColumnIndex(3)).toBe(250);
    });

    it('showing again restores the previous width (also a width set with setColumnWidth)', () => {
      const tm = create();
      tm.init();
      tm.setColumnWidth(2, 333);
      tm.setColumnVisible(2, false);
      expect(tm.getColumnWidth(2)).toBe(0);
      tm.setColumnVisible(2, true);
      expect(tm.getColumnWidth(2)).toBe(333);
      expect(tm.isColumnVisible(2)).toBe(true);
      expect(tm.getContentWidthInPixel()).toBe(50 + 100 + 333 + 100 + 50);
    });

    it('accepts a property or a column definition', () => {
      const columnDefs = defs();
      const tm = create({ columnDefs });
      tm.init();
      expect(tm.setColumnVisible('city', false)).toBe(true);
      expect(tm.isColumnVisible('city')).toBe(false);
      expect(tm.isColumnVisible(3)).toBe(false);
      expect(tm.setColumnVisible(columnDefs[0]!, false)).toBe(true);
      expect(tm.isColumnVisible(columnDefs[0]!)).toBe(false);
      expect(widths(tm)).toEqual([0, 100, 200, 0, 50]);
    });

    it('returns false for unknown columns', () => {
      const tm = create();
      tm.init();
      expect(tm.setColumnVisible(5, false)).toBe(false);
      expect(tm.setColumnVisible(-1, false)).toBe(false);
      expect(tm.setColumnVisible('nope', false)).toBe(false);
      expect(tm.setColumnVisible(new ColumnDef('id', 'ID', px50), false)).toBe(false); // not part of the model
      expect(widths(tm)).toEqual([50, 100, 200, 100, 50]);
      expect(tm.isColumnVisible(5)).toBe(false);
      expect(tm.isColumnVisible('nope')).toBe(false);
    });

    it('sets ColumnDefIf.isVisible – also for ColumnDef.create() definitions – and keeps ColumnDef.visible in sync', () => {
      const created = ColumnDef.create({ property: 'id', headerLabel: 'ID', width: px50 });
      const constructed = new ColumnDef('name', 'Name', px100);
      const tm = create({ columnDefs: [created, constructed] });
      tm.init();
      tm.setColumnVisible(0, false);
      tm.setColumnVisible(1, false);
      expect(created.isVisible?.()).toBe(false);
      expect(constructed.isVisible()).toBe(false);
      expect(constructed.visible).toBe(false);
      tm.setColumnVisible(1, true);
      expect(constructed.visible).toBe(true);
      expect(constructed.isVisible()).toBe(true);
    });

    it('shows a column that was defined as hidden (isVisible: FalseFn)', () => {
      const columnDefs = defs();
      columnDefs[4]!.isVisible = FalseFn;
      const tm = create({ columnDefs });
      tm.init();
      expect(tm.isColumnVisible('zip')).toBe(false);
      tm.setColumnVisible('zip', true);
      expect(tm.getColumnWidth(4)).toBe(50);
    });

    it('a hidden column keeps its definition, data and position when other columns are moved', () => {
      const tm = create();
      tm.init();
      tm.setColumnVisible('age', false);
      tm.changeColumnOrder(0, 4); // id → end: name, age, city, zip, id
      expect(tm.getColumnProperty(1)).toBe('age');
      expect(tm.isColumnVisible(1)).toBe(false);
      expect(tm.getBodyModel().getValueAt(0, 1)).toBe(30);
      tm.setColumnVisible('age', true);
      expect(widths(tm)).toEqual([100, 200, 100, 50, 50]);
    });

    it('a hidden fixed column shrinks the west area', () => {
      const tm = create({ fixedLeftColumnCount: 2 });
      tm.init();
      expect(tm.getPadding().left).toBe(150);
      tm.setColumnVisible(0, false);
      expect(tm.getPadding().left).toBe(100);
    });

    it('columns without a column definition are always visible and cannot be hidden', () => {
      const tm = TableFactory.createTableModel({ bodyData: [[1, 2]], columnSizes: [80, 90] }) as TableModel;
      tm.init();
      expect(tm.isColumnVisible(1)).toBe(true);
      expect(tm.setColumnVisible(1, false)).toBe(false);
      expect(tm.isColumnVisible(2)).toBe(false);
    });
  });

  describe('setHeaderVisible / setFooterVisible', () => {
    it('a hidden header has the height 0 – its rows stay in the model', () => {
      const tm = create({ footerData: [['f']] });
      tm.init();
      expect(tm.getPadding()).toEqual(new Padding(40, 0, 20, 0));
      tm.setHeaderVisible(false);
      expect(tm.isHeaderVisibe()).toBe(false);
      expect(tm.getPadding()).toEqual(new Padding(0, 0, 20, 0));
      expect(tm.getAreaModel('header').getRowCount()).toBe(1);
      expect(tm.getAreaModel('header').getValueAt(0, 1)).toBe('Name');
      tm.setHeaderVisible(true);
      expect(tm.isHeaderVisibe()).toBe(true);
      expect(tm.getPadding()).toEqual(new Padding(40, 0, 20, 0));
    });

    it('a hidden footer has the height 0', () => {
      const tm = create({ footerData: [['f'], ['g']] });
      tm.init();
      tm.setFooterVisible(false);
      expect(tm.isFooterVisibe()).toBe(false);
      expect(tm.getPadding().bottom).toBe(0);
      expect(tm.getAreaModel('footer').getRowCount()).toBe(2);
      tm.setFooterVisible(true);
      expect(tm.getPadding().bottom).toBe(40);
    });

    it('stays hidden after init() / recalcHeightAndPadding() (repaintHard, filter, recalcColumnWidths)', () => {
      const tm = create({ footerData: [['f']] });
      tm.setHeaderVisible(false);
      tm.setFooterVisible(false);
      tm.init();
      tm.recalcHeightAndPadding();
      expect(tm.getPadding()).toEqual(new Padding(0, 0, 0, 0));
    });

    it('an area without rows stays invisible after setFooterVisible(true)', () => {
      const tm = create();
      tm.setFooterVisible(true);
      expect(tm.isFooterVisibe()).toBe(false);
    });

    it('the body height does not change', () => {
      const tm = create({ footerData: [['f']] });
      tm.init();
      const contentHeight = tm.getContentHeightInPixel();
      tm.setHeaderVisible(false);
      tm.setFooterVisible(false);
      expect(tm.getContentHeightInPixel()).toBe(contentHeight);
    });
  });

  describe('table scope', () => {
    it('stores the table scope', () => {
      const tm = create();
      const scope = { fake: true } as unknown as TableScope;
      tm.setTableScope(scope);
      expect(tm.getTableScope()).toBe(scope);
    });
  });
});
