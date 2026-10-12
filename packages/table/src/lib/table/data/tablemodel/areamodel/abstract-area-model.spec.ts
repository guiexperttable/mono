import { describe, it, expect } from 'vitest';
import { AbstractAreaModel, AreaObjectMap, CheckboxModel, ColumnDef, SortItem, TrueFn } from '@guiexpert/table';
import type { CellRendererIf, ColumnDefIf, FilterFunction } from '@guiexpert/table';

/** Minimal concrete subclass – rows are objects, heights come from a list (or the default row height). */
class TestAreaModel extends AbstractAreaModel<any> {

  constructor(
    public rows: any[],
    columnDefs: ColumnDefIf[] = [],
    defaultRowHeight: number = -1,
    public heights: number[] = []
  ) {
    super('body', columnDefs, defaultRowHeight);
  }

  getRowCount(): number {
    return this.rows.length;
  }

  getValueAt(rowIndex: number, columnIndex: number): any {
    const property = this.columnDefs[columnIndex]?.property;
    return property ? this.rows[rowIndex]?.[property] : undefined;
  }

  getRowHeight(rowIndex: number): number {
    return this.heights[rowIndex] ?? this.defaultRowHeight;
  }

  override getRowByIndex(rowIndex: number): any {
    return this.rows[rowIndex];
  }

  externalFilterChanged<T>(_predictFn: FilterFunction<T>): void {
    // not needed here
  }

  /** exposes the protected helper */
  move(arr: any[], from: number, to: number) {
    return this.arrayMove(arr, from, to);
  }
}

const stubRenderer = (): CellRendererIf => ({ render: () => undefined });

describe('AbstractAreaModel', () => {

  describe('constructor', () => {
    it('defaults to defaultRowHeight -1 and no row selection model', () => {
      const model = new TestAreaModel([]);
      expect(model.defaultRowHeight).toBe(-1);
      expect(model.rowSelectionModel).toBeUndefined();
      expect(model.areaIdent).toBe('body');
    });
  });

  describe('defaults', () => {
    const model = new TestAreaModel([{ a: 1 }], [new ColumnDef('a', 'A')], 20);

    it('getColspanAt and getRowspanAt are 0', () => {
      expect(model.getColspanAt(0, 0)).toBe(0);
      expect(model.getRowspanAt(0, 0)).toBe(0);
    });

    it('getMaxColspan and getMaxRowspan are 31', () => {
      expect(model.getMaxColspan()).toBe(31);
      expect(model.getMaxRowspan()).toBe(31);
    });

    it('getTooltipAt is an empty string, getCustomStyleAt undefined, getCustomClassesAt empty', () => {
      expect(model.getTooltipAt(0, 0)).toBe('');
      expect(model.getCustomStyleAt(0, 0)).toBeUndefined();
      expect(model.getCustomClassesAt(0, 0)).toEqual([]);
    });

    it('rows are checkable and cells selectable', () => {
      expect(model.isRowCheckable(0)).toBe(true);
      expect(model.isSelectable(0, 0)).toBe(true);
    });

    it('doSort does nothing and returns false, sort() is ignored', () => {
      expect(model.doSort([new SortItem(0, 'asc')])).toBe(false);
      expect(() => model.sort((a, b) => a - b)).not.toThrow();
    });

    it('isFilterable is true only for the body area', () => {
      expect(model.isFilterable()).toBe(true);
      model.areaIdent = 'header';
      expect(model.isFilterable()).toBe(false);
      model.areaIdent = 'body';
    });

    it('getTextValueAt converts the value with String concatenation', () => {
      expect(model.getTextValueAt(0, 0)).toBe('1');
      expect(model.getTextValueAt(5, 0)).toBe('undefined');
    });
  });

  describe('getYPosByRowIndex', () => {
    it('is defaultRowHeight * rowIndex for a positive default row height', () => {
      const model = new TestAreaModel([{}, {}, {}], [], 25);
      expect(model.getYPosByRowIndex(0)).toBe(0);
      expect(model.getYPosByRowIndex(2)).toBe(50);
    });

    it('uses the y positions computed by init() for defaultRowHeight -1 (variable heights)', () => {
      const model = new TestAreaModel([{}, {}, {}], [], -1, [10, 20, 30]);
      model.init();
      expect(model.getYPosByRowIndex(0)).toBe(0);
      expect(model.getYPosByRowIndex(1)).toBe(10);
      expect(model.getYPosByRowIndex(2)).toBe(30);
      expect(model.getYPosByRowIndex(3)).toBe(60);
    });

    it('is undefined for defaultRowHeight -1 before init() was called', () => {
      // NOTE: without init() there are no y positions – callers get undefined instead of a number.
      const model = new TestAreaModel([{}, {}], [], -1, [10, 20]);
      expect(model.getYPosByRowIndex(1)).toBeUndefined();
    });

    it('init() computes the y positions only once', () => {
      // NOTE: rows added after init() get no y position (the cache is never invalidated).
      const model = new TestAreaModel([{}, {}], [], -1, [10, 20, 30]);
      model.init();
      model.rows.push({});
      model.init();
      expect(model.getYPosByRowIndex(2)).toBe(30);
      expect(model.getYPosByRowIndex(3)).toBeUndefined();
    });

    it('is undefined for defaultRowHeight 0 even after init()', () => {
      // NOTE: init() computes y positions only for exactly -1; 0 leaves the model without positions.
      const model = new TestAreaModel([{}, {}], [], 0, [10, 20]);
      model.init();
      expect(model.getYPosByRowIndex(1)).toBeUndefined();
    });
  });

  describe('getCellRenderer', () => {
    it('takes the renderer of the own area from ColumnDef.rendererMap', () => {
      const header = stubRenderer();
      const body = stubRenderer();
      const model = new TestAreaModel([], [
        new ColumnDef('a', 'A', undefined, undefined, new AreaObjectMap<CellRendererIf>(header, body)),
      ]);
      expect(model.getCellRenderer(0, 0)).toBe(body);
    });

    it('returns undefined for a column index out of range', () => {
      expect(new TestAreaModel([], [new ColumnDef('a', 'A')]).getCellRenderer(0, 3)).toBeUndefined();
    });
  });

  describe('changeColumnOrder', () => {
    it('moves only the cell renderers, not the column definitions', () => {
      const r0 = stubRenderer();
      const defs = [
        new ColumnDef('a', 'A', undefined, undefined, new AreaObjectMap<CellRendererIf>(undefined, r0)),
        new ColumnDef('b', 'B'),
      ];
      const model = new TestAreaModel([{ a: 1, b: 2 }], defs);
      model.changeColumnOrder(0, 1);
      expect(model.getCellRenderer(0, 1)).toBe(r0);
      expect(model.getCellRenderer(0, 0)).toBeUndefined();
      expect(model.getValueAt(0, 0)).toBe(1); // the column defs (and therefore the values) stay where they are
    });
  });

  describe('arrayMove (protected helper)', () => {
    const model = new TestAreaModel([]);

    it('moves an element forward', () => {
      expect(model.move(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd']);
    });

    it('moves an element backward', () => {
      expect(model.move(['a', 'b', 'c', 'd'], 3, 1)).toEqual(['a', 'd', 'b', 'c']);
    });

    it('works in place', () => {
      const arr = [1, 2, 3];
      expect(model.move(arr, 0, 2)).toBe(arr);
    });
  });

  describe('editing', () => {
    it('isEditable follows ColumnDef.editable and is false without it', () => {
      const model = new TestAreaModel([{}], [ColumnDef.create({ property: 'a', editable: TrueFn }), new ColumnDef('b', 'B')]);
      expect(model.isEditable(0, 0)).toBe(true);
      expect(model.isEditable(0, 1)).toBe(false);
      expect(model.isEditable(0, 2)).toBe(false);
    });

    it('setValue sets a simple property of the row', () => {
      const rows = [{ a: 1 }];
      const model = new TestAreaModel(rows, [new ColumnDef('a', 'A')]);
      expect(model.setValue(0, 0, 5)).toBe(true);
      expect(rows[0]!.a).toBe(5);
    });

    it('setValue sets a nested property', () => {
      const rows: any[] = [{ x: { y: { z: 1 } } }];
      const model = new TestAreaModel(rows, [new ColumnDef('x.y.z', 'Z')]);
      expect(model.setValue(0, 0, 9)).toBe(true);
      expect(rows[0].x.y.z).toBe(9);
    });

    it('setValue applies the editInputPipe with value, row and column index', () => {
      const rows: any[] = [{}, { a: 1 }];
      const model = new TestAreaModel(rows, [
        ColumnDef.create({ property: 'a', editInputPipe: (v: any, r: number, c: number) => `${v}@${r}/${c}` }),
      ]);
      model.setValue(1, 0, 'x');
      expect(rows[1].a).toBe('x@1/0');
    });
  });

  describe('row checkboxes', () => {
    it('isRowChecked/setRowChecked delegate to the rowSelectionModel with the row object', () => {
      const rows = [{ id: 1 }, { id: 2 }];
      const model = new TestAreaModel(rows);
      const checkboxModel = new CheckboxModel<any>();
      model.rowSelectionModel = checkboxModel;
      model.setRowChecked(1, true);
      expect(checkboxModel.getCheckedRows()).toEqual([rows[1]]);
      expect(model.isRowChecked(1)).toBe('full');
      expect(model.isRowChecked(0)).toBe('none');
    });

    it('without rowSelectionModel isRowChecked is undefined and setRowChecked is ignored', () => {
      const model = new TestAreaModel([{ id: 1 }]);
      model.setRowChecked(0, true);
      expect(model.isRowChecked(0)).toBeUndefined();
    });
  });
});
