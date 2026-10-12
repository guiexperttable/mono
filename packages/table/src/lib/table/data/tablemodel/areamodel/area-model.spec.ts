import { describe, it, expect } from 'vitest';
import { AreaModel, ColumnDef, SortItem, TableFactory, px100, px200 } from '@guiexpert/table';

/** The JSDoc example: a body with many rows and no array behind it. */
class LargeBodyModel extends AreaModel {
  constructor(private readonly rowCount: number = 2_000_000) {
    super();
    this.areaIdent = 'body';
  }

  override getRowCount(): number {
    return this.rowCount;
  }

  override getRowHeight(_rowIndex: number): number {
    return 34;
  }

  override getConstantRowHeight(): number {
    return 34;
  }

  override getValueAt(row: number, col: number): any {
    return col === 0 ? row + 1 : `cell ${row}/${col}`;
  }
}

/** Rows with different heights and no constant row height. */
class VariableHeightModel extends AreaModel {
  readonly heights = [10, 20, 30, 40];

  override getRowCount(): number {
    return this.heights.length;
  }

  override getRowHeight(rowIndex: number): number {
    return this.heights[rowIndex] ?? 0;
  }
}

/** Equal heights, but getConstantRowHeight() is not overridden. */
class EqualHeightsWithoutConstant extends AreaModel {
  override getRowCount(): number {
    return 100;
  }

  override getRowHeight(_rowIndex: number): number {
    return 25;
  }
}

/** The doSort JSDoc example. */
class SortableRows extends AreaModel {
  constructor(private readonly rows: any[][]) {
    super();
    this.areaIdent = 'body';
  }

  override getRowCount(): number {
    return this.rows.length;
  }

  override getValueAt(row: number, col: number): any {
    return this.rows[row]?.[col];
  }

  override doSort(sortItems: SortItem[]): boolean {
    if (!sortItems.length) return false;
    const { columnIndex, sortState } = sortItems[0]!;
    const direction = sortState === 'asc' ? 1 : -1;
    this.rows.sort((a, b) => (a[columnIndex] < b[columnIndex] ? -1 : a[columnIndex] > b[columnIndex] ? 1 : 0) * direction);
    return true;
  }
}

describe('AreaModel', () => {

  describe('defaults of the base class', () => {
    const model = new AreaModel();

    it('is a body model without row selection model', () => {
      expect(model.areaIdent).toBe('body');
      expect(model.rowSelectionModel).toBeUndefined();
    });

    it('has no rows and no values', () => {
      expect(model.getRowCount()).toBe(0);
      expect(model.getValueAt(0, 0)).toBeUndefined();
      expect(model.getTextValueAt(0, 0)).toBe('');
      expect(model.getRowByIndex(0)).toBeUndefined();
    });

    it('has row height 0 and no constant row height', () => {
      expect(model.getRowHeight(0)).toBe(0);
      expect(model.getConstantRowHeight()).toBeUndefined();
    });

    it('has no col- and rowspans', () => {
      expect(model.getColspanAt(0, 0)).toBe(0);
      expect(model.getRowspanAt(0, 0)).toBe(0);
      expect(model.getMaxColspan()).toBe(0);
      expect(model.getMaxRowspan()).toBe(0);
    });

    it('has no renderer, tooltip, custom classes or styles', () => {
      expect(model.getCellRenderer(0, 0)).toBeUndefined();
      expect(model.getTooltipAt(0, 0)).toBeUndefined();
      expect(model.getCustomClassesAt(0, 0)).toEqual([]);
      expect(model.getCustomStyleAt(0, 0)).toBeUndefined();
    });

    it('is neither editable, selectable, filterable nor checkable', () => {
      expect(model.isEditable(0, 0)).toBe(false);
      expect(model.isSelectable(0, 0)).toBe(false);
      expect(model.isFilterable()).toBe(false);
      expect(model.isRowCheckable(0)).toBe(false);
      expect(model.isRowChecked(0)).toBeUndefined();
    });

    it('does not sort or store values', () => {
      expect(model.doSort([new SortItem(0, 'asc')])).toBe(false);
      expect(model.setValue(0, 0, 'x')).toBe(false);
    });

    it('ignores sort(), externalFilterChanged(), changeColumnOrder(), setRowChecked() and init()', () => {
      expect(() => {
        model.sort((a, b) => a - b);
        model.externalFilterChanged(() => true);
        model.changeColumnOrder(0, 1);
        model.setRowChecked(0, true);
        model.init();
      }).not.toThrow();
    });

    it('getYPosByRowIndex is 0 for all rows when the model has no row heights', () => {
      expect(model.getYPosByRowIndex(0)).toBe(0);
      expect(model.getYPosByRowIndex(5)).toBe(0);
    });
  });

  describe('getYPosByRowIndex', () => {
    it('uses getConstantRowHeight() (O(1)) for constant row heights', () => {
      const model = new LargeBodyModel();
      expect(model.getYPosByRowIndex(0)).toBe(0);
      expect(model.getYPosByRowIndex(1)).toBe(34);
      expect(model.getYPosByRowIndex(1_999_999)).toBe(1_999_999 * 34);
    });

    it('does not iterate the row heights if a constant row height is given', () => {
      const model = new LargeBodyModel();
      let calls = 0;
      model.getRowHeight = () => {
        calls++;
        return 34;
      };
      model.getYPosByRowIndex(1_000_000);
      expect(calls).toBe(0);
    });

    it('sums up the heights of all rows above for variable row heights', () => {
      const model = new VariableHeightModel();
      expect(model.getYPosByRowIndex(0)).toBe(0);
      expect(model.getYPosByRowIndex(1)).toBe(10);
      expect(model.getYPosByRowIndex(2)).toBe(30);
      expect(model.getYPosByRowIndex(3)).toBe(60);
      expect(model.getYPosByRowIndex(4)).toBe(100);
    });

    it('sums up equal row heights if getConstantRowHeight() is not overridden', () => {
      const model = new EqualHeightsWithoutConstant();
      expect(model.getYPosByRowIndex(10)).toBe(250);
    });

    it('falls back to summing if getConstantRowHeight() returns 0', () => {
      const model = new VariableHeightModel();
      model.getConstantRowHeight = () => 0;
      expect(model.getYPosByRowIndex(2)).toBe(30);
    });

    it('is never 0 for rows below the first row with positive heights (regression: used to return 0)', () => {
      expect(new LargeBodyModel().getYPosByRowIndex(10)).toBeGreaterThan(0);
      expect(new VariableHeightModel().getYPosByRowIndex(2)).toBeGreaterThan(0);
    });
  });

  describe('subclass from the JSDoc example', () => {
    it('provides the computed values', () => {
      const model = new LargeBodyModel();
      expect(model.getRowCount()).toBe(2_000_000);
      expect(model.getValueAt(0, 0)).toBe(1);
      expect(model.getValueAt(41, 1)).toBe('cell 41/1');
    });

    it('can be used as body model of TableFactory.createTableModel', () => {
      const tableModel = TableFactory.createTableModel({
        bodyAreaModel: new LargeBodyModel(),
        columnDefs: [new ColumnDef('id', 'ID', px100), new ColumnDef('text', 'Text', px200)],
      });
      tableModel.init();
      expect(tableModel.getColumnCount()).toBe(2);
      expect(tableModel.getBodyModel().getRowCount()).toBe(2_000_000);
      expect(tableModel.getContentHeightInPixel()).toBe(2_000_000 * 34);
      expect(tableModel.getAreaModel('header').getValueAt(0, 1)).toBe('Text');
    });

    it('can implement doSort itself', () => {
      const model = new SortableRows([[3, 'c'], [1, 'a'], [2, 'b']]);
      expect(model.doSort([new SortItem(0, 'asc')])).toBe(true);
      expect([0, 1, 2].map(r => model.getValueAt(r, 1))).toEqual(['a', 'b', 'c']);
      expect(model.doSort([new SortItem(1, 'desc')])).toBe(true);
      expect([0, 1, 2].map(r => model.getValueAt(r, 0))).toEqual([3, 2, 1]);
      expect(model.doSort([])).toBe(false);
    });
  });
});
