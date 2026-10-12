import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  AreaModelCellGroups,
  CellGroupExt,
  CellGroupExtCellRenderer,
  CellgroupFactory,
  ColAndRowspanModel,
  ColumnDef,
  DefaultRowHeights,
  AreaModelHidden,
  SortItem,
  TableFactory,
  TableModel,
  px80,
} from '@guiexpert/table';
import type { CellGroupIf, MouseTargetData } from '@guiexpert/table';

/** The JSDoc example of CellGroupIf. */
const orderGroups = (): CellGroupIf[] => [
  { data: 'Order', children: [{ data: 'ID', property: 'id' }, { data: 'Date', property: 'date' }] },
  {
    data: 'Customer', toggle: true, children: [
      { data: 'Customer', property: 'customer', visibility: 'always' },
      { data: 'City', property: 'city' },
    ],
  },
];

const label = (cell: CellGroupExt | null | undefined) => cell === null ? 'null' : cell === undefined ? 'undef' : String(cell.data);

const grid = (m: AreaModelCellGroups) => m.arr.map(row => row.map(label));

const spans = (m: AreaModelCellGroups) =>
  m.arr.map((row, r) => row.map((_, c) => `${m.getColspanAt(r, c)}x${m.getRowspanAt(r, c)}`));

/** Lists all cells that are covered by the col-/rowspan of another (non-empty) cell. */
const overlappingCells = (m: AreaModelCellGroups): string[] => {
  const ret: string[] = [];
  m.arr.forEach((row, r) => row.forEach((cell, c) => {
    if (!cell) return;
    const cs = Math.max(1, m.getColspanAt(r, c));
    const rs = Math.max(1, m.getRowspanAt(r, c));
    for (let r2 = r; r2 < r + rs; r2++) {
      for (let c2 = c; c2 < c + cs; c2++) {
        if ((r2 !== r || c2 !== c) && m.arr[r2]?.[c2]) {
          ret.push(`${label(cell)}(${r},${c}) covers ${label(m.arr[r2]![c2])}(${r2},${c2})`);
        }
      }
    }
  }));
  return ret;
};

const toggleAt = (rowIdx: number, colIdx: number) => ({ rowIdx, colIdx } as MouseTargetData);

let tableSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  // the model prints its array with console.table on every init()
  tableSpy = vi.spyOn(console, 'table').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('AreaModelCellGroups', () => {

  describe('constructor / init', () => {
    it('builds a header grid with one row per group level', () => {
      const m = new AreaModelCellGroups('header', orderGroups(), [], 34);
      expect(m.getRowCount()).toBe(2);
      expect(grid(m)).toEqual([
        ['Order', 'null', 'Customer', 'null'],
        ['ID', 'Date', 'Customer', 'City'],
      ]);
    });

    it('prints the grid with console.table', () => {
      // NOTE: debug output in production code – every init() / toggle logs a table to the console.
      new AreaModelCellGroups('header', orderGroups(), [], 34);
      expect(tableSpy).toHaveBeenCalledOnce();
    });

    it('derives the column definitions from the leaves if none are given', () => {
      const m = new AreaModelCellGroups('header', orderGroups(), [], 34);
      expect(m.columnDefs.map(d => d.property)).toEqual(['id', 'date', 'customer', 'city']);
      expect(m.columnDefs.map(d => d.headerLabel)).toEqual(['ID', 'Date', 'Customer', 'City']);
    });

    it('keeps given column definitions', () => {
      const defs = [new ColumnDef('id', 'ID', px80)];
      const m = new AreaModelCellGroups('header', orderGroups(), defs, 34);
      expect(m.columnDefs).toBe(defs);
    });

    it('derives no column definitions for a non-header area', () => {
      const m = new AreaModelCellGroups('footer', orderGroups(), [], 34);
      expect(m.columnDefs).toEqual([]);
    });

    it('supports three levels', () => {
      const m = new AreaModelCellGroups('header', [{
        data: 'G', children: [{ data: 'AB', children: [{ data: 'A', property: 'a' }, { data: 'B', property: 'b' }] }, { data: 'C', property: 'c' }],
      }], [], 34);
      expect(grid(m)).toEqual([
        ['G', 'null', 'null'],
        ['AB', 'null', 'C'],
        ['A', 'B', 'null'],
      ]);
      expect(spans(m)).toEqual([
        ['3x1', '0x0', '0x0'],
        ['2x1', '0x0', '1x2'],
        ['1x1', '1x1', '0x0'],
      ]);
      expect(overlappingCells(m)).toEqual([]);
    });
  });

  describe('cells', () => {
    const m = () => new AreaModelCellGroups('header', orderGroups(), [], 34);

    it('getValueAt returns the CellGroupExt (or null for a spanned cell)', () => {
      const model = m();
      expect(model.getValueAt(0, 0)).toBeInstanceOf(CellGroupExt);
      expect(model.getValueAt(0, 0).data).toBe('Order');
      expect(model.getValueAt(0, 1)).toBeNull();
    });

    it('getTextValueAt returns the label (and "null" for spanned cells)', () => {
      const model = m();
      expect(model.getTextValueAt(1, 3)).toBe('City');
      expect(model.getTextValueAt(0, 1)).toBe('null');
    });

    it('groups span their visible columns, leaves span one cell', () => {
      expect(spans(m())).toEqual([
        ['2x1', '0x0', '2x1', '0x0'],
        ['1x1', '1x1', '1x1', '1x1'],
      ]);
    });

    it('spans do not overlap other cells', () => {
      expect(overlappingCells(m())).toEqual([]);
    });

    it('all cells are rendered by one CellGroupExtCellRenderer', () => {
      const model = m();
      expect(model.getCellRenderer(0, 0)).toBeInstanceOf(CellGroupExtCellRenderer);
      expect(model.getCellRenderer(1, 3)).toBe(model.getCellRenderer(0, 0));
    });

    it('getRowHeight is the default row height', () => {
      expect(m().getRowHeight(1)).toBe(34);
    });

    // BUG: getYPosByRowIndex is a stub (TODO) and returns 0 for every row.
    it.fails('getYPosByRowIndex is the sum of the heights of the rows above', () => {
      expect(m().getYPosByRowIndex(1)).toBe(34);
    });

    it('allows spans up to 12 and is marked as gamma cell model', () => {
      const model = m();
      expect(model.getMaxColspan()).toBe(12);
      expect(model.getMaxRowspan()).toBe(12);
      expect(model.gammaCells).toBe(true);
    });

    it('is read-only: not editable, selectable, filterable, sortable or checkable', () => {
      const model = m();
      expect(model.isEditable(0, 0)).toBe(false);
      expect(model.setValue(0, 0, 'x')).toBe(false);
      expect(model.isSelectable(0, 0)).toBe(false);
      expect(model.isFilterable()).toBe(false);
      expect(model.doSort([new SortItem(0, 'asc')])).toBe(false);
      expect(model.isRowCheckable(0)).toBe(false);
      expect(model.isRowChecked(0)).toBeUndefined();
      expect(model.getRowByIndex(0)).toBeUndefined();
      expect(model.getTooltipAt(0, 0)).toBe('');
      expect(model.getCustomClassesAt(0, 0)).toEqual([]);
      expect(model.getCustomStyleAt(0, 0)).toBeUndefined();
    });

    it('ignores sort, filter, column order and row checks', () => {
      const model = m();
      model.sort(() => 0);
      model.externalFilterChanged(() => false);
      model.changeColumnOrder(0, 3);
      model.setRowChecked(0, true);
      expect(grid(model)[1]).toEqual(['ID', 'Date', 'Customer', 'City']);
    });
  });

  describe('getAllLeafs / getMaxRowCount', () => {
    it('lists the leaves and counts the levels', () => {
      const m = new AreaModelCellGroups('header', orderGroups(), [], 34);
      expect(m.getAllLeafs().map(l => l.data)).toEqual(['ID', 'Date', 'Customer', 'City']);
      expect(m.getMaxRowCount()).toBe(2);
    });
  });

  describe('toggleHeaderGroup', () => {
    it('collapses a group with toggle and hides its "normal" children', () => {
      const m = new AreaModelCellGroups('header', orderGroups(), [], 34);
      const defs = m.toggleHeaderGroup(toggleAt(0, 2));
      expect(defs.map(d => `${d.property}:${d.isVisible?.()}`)).toEqual(['id:true', 'date:true', 'customer:true', 'city:false']);
      expect(m.getColspanAt(1, 3)).toBe(0);
      expect(tableSpy).toHaveBeenCalledTimes(2);
    });

    it('expands the group again on a second toggle', () => {
      const m = new AreaModelCellGroups('header', orderGroups(), [], 34);
      m.toggleHeaderGroup(toggleAt(0, 2));
      const defs = m.toggleHeaderGroup(toggleAt(0, 2));
      expect(defs.map(d => d.isVisible?.())).toEqual([true, true, true, true]);
    });

    it('keeps the existing ColumnDef objects (widths etc.) and only updates isVisible', () => {
      const defs = [new ColumnDef('id', 'ID', px80), new ColumnDef('date', 'Date'), new ColumnDef('customer', 'C'), new ColumnDef('city', 'City')];
      const m = new AreaModelCellGroups('header', orderGroups(), defs, 34);
      const merged = m.toggleHeaderGroup(toggleAt(0, 2));
      expect(merged[0]).toBe(defs[0]);
      expect(merged[0]!.width).toBe(px80);
      expect(defs[3]!.isVisible?.()).toBe(false);
      expect(m.columnDefs).toBe(merged);
    });

    it('does not collapse a group without toggle', () => {
      const m = new AreaModelCellGroups('header', orderGroups(), [], 34);
      const defs = m.toggleHeaderGroup(toggleAt(0, 0));
      expect(m.getValueAt(0, 0).closed).toBe(false);
      expect(defs.every(d => d.isVisible?.())).toBe(true);
    });

    it('updates the visibility of the TableModel columns (column width 0)', () => {
      const header = new AreaModelCellGroups('header', orderGroups(), [], 34);
      const tm = new TableModel(header, new AreaModelHidden(), new AreaModelHidden(), 0, 0, false, new DefaultRowHeights(), header.columnDefs);
      tm.init();
      expect(tm.getColumnWidth(3)).toBe(100);
      header.toggleHeaderGroup(toggleAt(0, 2));
      expect(tm.getColumnWidth(3)).toBe(0);
    });

    // BUG: the collapsed group gets rowspan 2 (it claims an own column) and covers the still visible "always" child in row 1.
    it.fails('a collapsed group does not cover its visible "always" child', () => {
      const m = new AreaModelCellGroups('header', orderGroups(), [], 34);
      m.toggleHeaderGroup(toggleAt(0, 2));
      // only the visible "always" child (row 1, column 2) matters here
      expect(overlappingCells(m).filter(s => s.endsWith('Customer(1,2)'))).toEqual([]);
    });
  });

  // BUG (debatable – CellGroupIf documents `property` as "set on leaves only"): a group with an own property AND
  // children spans 2x2 and covers its first child.
  it.fails('a group with an own column does not cover its children', () => {
    const m = new AreaModelCellGroups('header', [
      { data: 'P', property: 'p', children: [{ data: 'X', property: 'x' }] },
      { data: 'Q', property: 'q' },
    ], [], 34);
    expect(overlappingCells(m)).toEqual([]);
  });

  describe('usage with TableFactory and ColAndRowspanModel', () => {
    it('can be the header model of a table created from rows', () => {
      const header = new AreaModelCellGroups('header', orderGroups(), [], 34);
      const tm = TableFactory.createTableModel({
        headerAreaModel: header,
        rows: [{ id: 1, date: '2026-01-01', customer: 'ACME', city: 'Berlin' }],
        columnDefs: header.columnDefs,
      });
      expect(tm.getAreaModel('header')).toBe(header);
      expect(tm.getColumnCount()).toBe(4);
      expect(tm.getBodyModel().getValueAt(0, 3)).toBe('Berlin');
      tm.init();
      expect(tm.getPadding().top).toBe(2 * 34); // header height
    });

    it('ColAndRowspanModel finds the group ranges and marks them as gamma ranges', () => {
      const header = new AreaModelCellGroups('header', orderGroups(), [], 34);
      const tm = new TableModel(header, new AreaModelHidden(), new AreaModelHidden(), 0, 0, false, new DefaultRowHeights(), header.columnDefs);
      const spanModel = new ColAndRowspanModel(tm, header);
      spanModel.init();
      expect(spanModel.getRanges().map(r => [r.r1, r.c1, r.r2, r.c2, r.gammaRange])).toEqual([
        [0, 0, 0, 1, true],
        [0, 2, 0, 3, true],
      ]);
    });
  });

  it('CellgroupFactory.buildColumnDefs from the JSDoc example matches the derived definitions', () => {
    const fromExts = CellgroupFactory.buildColumnDefs(CellgroupFactory.buildGroupExts(orderGroups()));
    const m = new AreaModelCellGroups('header', orderGroups(), fromExts, 34);
    expect(m.columnDefs.map(d => d.property)).toEqual(['id', 'date', 'customer', 'city']);
  });
});
