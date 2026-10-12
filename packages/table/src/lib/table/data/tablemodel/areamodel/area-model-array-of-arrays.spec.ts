import { describe, it, expect } from 'vitest';
import { AreaModelArrayOfArrays, AreaObjectMap, ColumnDef, SortItem, px100 } from '@guiexpert/table';
import type { CellRendererIf } from '@guiexpert/table';

const data = (): (string | number)[][] => [
  [1, 'Berlin', 'DE'],
  [2, 'Paris', 'FR'],
  [3, 'Rome', 'IT'],
];

const create = (arr = data(), rowHeight = 30) => new AreaModelArrayOfArrays<string | number>('body', arr, rowHeight);

const column = (model: AreaModelArrayOfArrays<string | number>, c: number) =>
  Array.from({ length: model.getRowCount() }, (_, r) => model.getValueAt(r, c));

const stubRenderer = (): CellRendererIf => ({ render: () => undefined });

describe('AreaModelArrayOfArrays', () => {

  describe('constructor', () => {
    it('keeps the array and works on a shallow copy for filtering', () => {
      const arr = data();
      const model = create(arr);
      expect(model.arr).toBe(arr);
      expect(model.filteredArr).not.toBe(arr);
      expect(model.filteredArr[0]).toBe(arr[0]);
    });

    it('stores area ident and default row height', () => {
      const model = new AreaModelArrayOfArrays<string>('header', [['A']], 40);
      expect(model.areaIdent).toBe('header');
      expect(model.defaultRowHeight).toBe(40);
    });
  });

  describe('values', () => {
    it('getRowCount is the number of rows', () => {
      expect(create().getRowCount()).toBe(3);
      expect(create([]).getRowCount()).toBe(0);
    });

    it('getValueAt returns the value at [row][column]', () => {
      const model = create();
      expect(model.getValueAt(0, 0)).toBe(1);
      expect(model.getValueAt(1, 1)).toBe('Paris');
      expect(model.getValueAt(2, 2)).toBe('IT');
    });

    it('getValueAt returns undefined for a column out of range', () => {
      expect(create().getValueAt(0, 9)).toBeUndefined();
    });

    it('getValueAt throws for a row out of range', () => {
      // NOTE: AreaModelObjectArray returns '' for a row out of range, this model crashes (undefined[columnIndex]).
      expect(() => create().getValueAt(3, 0)).toThrow(TypeError);
    });

    it('getTextValueAt converts the value to a string', () => {
      expect(create().getTextValueAt(0, 0)).toBe('1');
    });

    it('getRowByIndex returns the row array', () => {
      const arr = data();
      expect(create(arr).getRowByIndex(1)).toBe(arr[1]);
    });

    it('supports several header rows', () => {
      const header = new AreaModelArrayOfArrays<string>('header', [['Group', ''], ['A', 'B']], 34);
      expect(header.getRowCount()).toBe(2);
      expect(header.getValueAt(1, 1)).toBe('B');
    });
  });

  describe('row heights', () => {
    it('getRowHeight is the default row height', () => {
      expect(create(data(), 25).getRowHeight(2)).toBe(25);
    });

    it('getConstantRowHeight is the default row height', () => {
      expect(create(data(), 25).getConstantRowHeight()).toBe(25);
    });

    it('getConstantRowHeight is undefined for a default row height <= 0', () => {
      expect(create(data(), 0).getConstantRowHeight()).toBeUndefined();
      expect(create(data(), -1).getConstantRowHeight()).toBeUndefined();
    });

    it('getConstantRowHeight is undefined if a subclass overrides getRowHeight', () => {
      class Taller extends AreaModelArrayOfArrays<number> {
        override getRowHeight(rowIndex: number): number {
          return rowIndex === 0 ? 60 : 30;
        }
      }
      expect(new Taller('body', [[1], [2]], 30).getConstantRowHeight()).toBeUndefined();
    });

    it('getYPosByRowIndex is rowIndex * defaultRowHeight', () => {
      const model = create(data(), 25);
      expect(model.getYPosByRowIndex(0)).toBe(0);
      expect(model.getYPosByRowIndex(2)).toBe(50);
    });
  });

  describe('externalFilterChanged', () => {
    it('filters the rows', () => {
      const model = create();
      model.externalFilterChanged((row: (string | number)[]) => row[2] !== 'FR');
      expect(model.getRowCount()).toBe(2);
      expect(column(model, 1)).toEqual(['Berlin', 'Rome']);
    });

    it('always filters the original array', () => {
      const model = create();
      model.externalFilterChanged(() => false);
      model.externalFilterChanged(() => true);
      expect(model.getRowCount()).toBe(3);
      expect(model.arr.length).toBe(3);
    });

    it('getRowByIndex works on the filtered rows', () => {
      const model = create();
      model.externalFilterChanged((row: (string | number)[]) => row[0] === 3);
      expect(model.getRowByIndex(0)).toEqual([3, 'Rome', 'IT']);
    });
  });

  describe('sorting', () => {
    it('does not support doSort (returns false, keeps the order)', () => {
      // NOTE: tables created from bodyData cannot be sorted by header double-click.
      const model = create();
      expect(model.doSort([new SortItem(1, 'desc')])).toBe(false);
      expect(column(model, 0)).toEqual([1, 2, 3]);
    });

    it('ignores sort(compareFn)', () => {
      const model = create();
      model.sort((a: number[], b: number[]) => b[0]! - a[0]!);
      expect(column(model, 0)).toEqual([1, 2, 3]);
    });
  });

  describe('setValue', () => {
    it('writes the value into the array', () => {
      const arr = data();
      const model = create(arr);
      expect(model.setValue(1, 1, 'Lyon')).toBe(true);
      expect(arr[1]![1]).toBe('Lyon');
      expect(model.getValueAt(1, 1)).toBe('Lyon');
    });

    it('pipes the value through ColumnDef.editInputPipe', () => {
      const model = new AreaModelArrayOfArrays<any>('body', data(), 30, [
        ColumnDef.create({ property: 'id', editInputPipe: (v: any) => Number(v) }),
      ]);
      model.setValue(0, 0, '42');
      expect(model.getValueAt(0, 0)).toBe(42);
    });

    // BUG: setValue writes into this.arr[rowIndex] although rowIndex is a view index of filteredArr (getValueAt/getRowByIndex use filteredArr).
    it.fails('writes into the displayed row while a filter is active', () => {
      const model = create();
      model.externalFilterChanged((row: (string | number)[]) => row[0] === 3); // only "Rome" is shown, as row 0
      model.setValue(0, 1, 'Roma');
      expect(model.getValueAt(0, 1)).toBe('Roma');
    });
  });

  describe('changeColumnOrder', () => {
    it('moves the values of every row', () => {
      const model = create();
      model.changeColumnOrder(2, 0);
      expect(model.getRowByIndex(0)).toEqual(['DE', 1, 'Berlin']);
      expect(model.getRowByIndex(2)).toEqual(['IT', 3, 'Rome']);
    });

    it('changes the row arrays given to the constructor (shared with the shallow copy)', () => {
      const arr = data();
      create(arr).changeColumnOrder(0, 1);
      expect(arr[0]).toEqual(['Berlin', 1, 'DE']);
    });

    it('moves the cell renderers', () => {
      const r = stubRenderer();
      const model = new AreaModelArrayOfArrays<any>('body', data(), 30, [
        new ColumnDef('a', 'A', px100, undefined, new AreaObjectMap<CellRendererIf>(undefined, r)),
        new ColumnDef('b', 'B'),
        new ColumnDef('c', 'C'),
      ]);
      model.changeColumnOrder(0, 2);
      expect(model.getCellRenderer(0, 2)).toBe(r);
      expect(model.getCellRenderer(0, 0)).toBeUndefined();
    });

    // BUG: only the rows of filteredArr are reordered – rows hidden by the filter keep the old column order.
    it.fails('also moves the values of rows that are currently filtered out', () => {
      const model = create();
      model.externalFilterChanged((row: (string | number)[]) => row[0] !== 2);
      model.changeColumnOrder(2, 0);
      model.externalFilterChanged(() => true);
      expect(model.getRowByIndex(1)).toEqual(['FR', 2, 'Paris']);
    });
  });

  describe('defaults inherited from AbstractAreaModel', () => {
    it('is filterable as body only', () => {
      expect(create().isFilterable()).toBe(true);
      expect(new AreaModelArrayOfArrays<string>('header', [['A']], 30).isFilterable()).toBe(false);
    });

    it('has no spans and is selectable', () => {
      const model = create();
      expect(model.getColspanAt(0, 0)).toBe(0);
      expect(model.getRowspanAt(0, 0)).toBe(0);
      expect(model.isSelectable(0, 0)).toBe(true);
    });

    it('is not editable without ColumnDef.editable', () => {
      expect(create().isEditable(0, 0)).toBe(false);
    });
  });
});
