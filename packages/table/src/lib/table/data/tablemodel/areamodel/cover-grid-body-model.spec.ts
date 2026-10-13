import { describe, it, expect } from 'vitest';
import { CoverGridBodyModel, SortItem } from '@guiexpert/table';
import type { CellRendererIf } from '@guiexpert/table';

const renderer: CellRendererIf = { render: () => undefined };

const letters = () => ['c', 'a', 'e', 'b', 'd'];

/** width 400 / coverWidth 200 → 2 covers per row */
const create = (items: string[] = letters(), firstRowPaddingTop = 0) =>
  new CoverGridBodyModel<string>(items, renderer, 200, 300, 400, firstRowPaddingTop);

const allValues = (m: CoverGridBodyModel<string>) => {
  const ret: (string | undefined)[] = [];
  for (let r = 0; r < m.getRowCount(); r++) {
    for (let c = 0; c < m.getColumnCount(); c++) {
      ret.push(m.getValueAt(r, c));
    }
  }
  return ret;
};

describe('CoverGridBodyModel', () => {

  describe('constructor', () => {
    it('has default cover size 200 x 300, width 0 and no padding', () => {
      const m = new CoverGridBodyModel<string>(letters(), renderer);
      expect([m.coverWidth, m.coverHeight, m.width, m.firstRowPaddingTop]).toEqual([200, 300, 0, 0]);
      expect(m.areaIdent).toBe('body');
      expect(m.rowSelectionModel).toBeUndefined();
    });

    it('works directly on the given items array (no copy)', () => {
      // NOTE: unlike AreaModelObjectArray there is no copy – doSort()/sort() reorder the caller's array.
      const items = letters();
      const m = create(items);
      expect(m.filteredItems).toBe(items);
      m.sort((a, b) => a.localeCompare(b));
      expect(items).toEqual(['a', 'b', 'c', 'd', 'e']);
    });
  });

  describe('grid geometry', () => {
    it('getColumnCount is the number of covers that fit into the width', () => {
      const m = create();
      expect(m.getColumnCount()).toBe(2);
      m.setParentWidth(650);
      expect(m.width).toBe(650);
      expect(m.getColumnCount()).toBe(3);
    });

    it('getColumnCount is 1 for width 0', () => {
      const m = create();
      m.setParentWidth(0);
      expect(m.getColumnCount()).toBe(1);
    });

    // BUG: a width smaller than one cover gives 0 columns – getRowCount() then divides by 0 (Infinity rows).
    it.fails('has at least one column if the width is smaller than one cover', () => {
      const m = create();
      m.setParentWidth(150);
      expect(m.getColumnCount()).toBe(1);
      expect(m.getRowCount()).toBe(5);
    });

    it('getRowCount for a partly filled last row', () => {
      expect(create(letters()).getRowCount()).toBe(3); // 5 items, 2 per row
    });

    it('getRowCount is 0 without items', () => {
      expect(create([]).getRowCount()).toBe(0);
    });

    // BUG: Math.floor(n / columns) + 1 adds an empty row when the item count is a multiple of the column count (should be Math.ceil).
    it.fails('getRowCount has no empty last row if all rows are full', () => {
      expect(create(['a', 'b', 'c', 'd']).getRowCount()).toBe(2);
    });

    it('getValueAt maps (row, column) to item index row * columns + column', () => {
      const m = create();
      expect(m.getValueAt(0, 0)).toBe('c');
      expect(m.getValueAt(0, 1)).toBe('a');
      expect(m.getValueAt(1, 0)).toBe('e');
      expect(m.getValueAt(2, 0)).toBe('d');
      expect(m.getValueAt(2, 1)).toBeUndefined();
    });

    it('getRowHeight is the cover height (+ padding for the first row)', () => {
      expect(create().getRowHeight(0)).toBe(300);
      const padded = create(letters(), 20);
      expect(padded.getRowHeight(0)).toBe(320);
      expect(padded.getRowHeight(1)).toBe(300);
    });

    it('getYPosByRowIndex is rowIndex * coverHeight (+ padding)', () => {
      expect(create().getYPosByRowIndex(2)).toBe(600);
      const padded = create(letters(), 20);
      expect(padded.getYPosByRowIndex(1)).toBe(320);
      expect(padded.getYPosByRowIndex(2)).toBe(620);
    });

    it('getYPosByRowIndex(0) is the padding, not 0', () => {
      // NOTE: the padding belongs to row 0 (getRowHeight(0) includes it), but its y position is reported below the padding.
      expect(create(letters(), 20).getYPosByRowIndex(0)).toBe(20);
    });
  });

  describe('filter and sort', () => {
    it('externalFilterChanged filters the items', () => {
      const m = create();
      m.externalFilterChanged((s: string) => s !== 'a' && s !== 'b');
      expect(m.filteredItems).toEqual(['c', 'e', 'd']);
      expect(m.getRowCount()).toBe(2);
      expect(m.getValueAt(1, 0)).toBe('d');
    });

    it('externalFilterChanged always filters all items', () => {
      const m = create();
      m.externalFilterChanged(() => false);
      m.externalFilterChanged(() => true);
      expect(m.filteredItems.length).toBe(5);
    });

    it('doSort compares the items themselves (column index is ignored)', () => {
      const m = create();
      expect(m.doSort([new SortItem(5, 'asc')])).toBe(true);
      expect(allValues(m).filter(v => v !== undefined)).toEqual(['a', 'b', 'c', 'd', 'e']);
      m.doSort([new SortItem(0, 'desc')]);
      expect(m.filteredItems).toEqual(['e', 'd', 'c', 'b', 'a']);
    });

    it('doSort keeps the order of object items', () => {
      // NOTE: the generic comparator compares "[object Object]" strings – object covers cannot be sorted with doSort().
      const items = [{ t: 'b' }, { t: 'a' }];
      const m = new CoverGridBodyModel<{ t: string }>(items, renderer);
      m.doSort([new SortItem(0, 'asc')]);
      expect(m.filteredItems.map(i => i.t)).toEqual(['b', 'a']);
    });

    it('sort(compareFn) sorts with a custom comparator', () => {
      const items = [{ t: 'b' }, { t: 'a' }];
      const m = new CoverGridBodyModel<{ t: string }>(items, renderer);
      m.sort((x, y) => x.t.localeCompare(y.t));
      expect(m.filteredItems.map(i => i.t)).toEqual(['a', 'b']);
    });

    it('is filterable', () => {
      expect(create().isFilterable()).toBe(true);
    });
  });

  describe('other methods', () => {
    const m = create();

    it('returns the cell renderer for every cell', () => {
      expect(m.getCellRenderer(0, 0)).toBe(renderer);
      expect(m.getCellRenderer(5, 9)).toBe(renderer);
    });

    it('has empty texts and tooltips and no row objects', () => {
      expect(m.getTextValueAt(0, 0)).toBe('');
      expect(m.getTooltipAt(0, 0)).toBe('');
      expect(m.getRowByIndex(0)).toBeUndefined();
    });

    it('has no spans, classes or styles; allows spans up to 31', () => {
      expect(m.getColspanAt(0, 0)).toBe(0);
      expect(m.getRowspanAt(0, 0)).toBe(0);
      expect(m.getCustomClassesAt(0, 0)).toEqual([]);
      expect(m.getCustomStyleAt(0, 0)).toBeUndefined();
      expect(m.getMaxColspan()).toBe(31);
      expect(m.getMaxRowspan()).toBe(31);
    });

    it('rows are checkable but never checked, cells are not selectable or editable', () => {
      expect(m.isRowCheckable(0)).toBe(true);
      expect(m.isRowChecked(0)).toBeUndefined();
      expect(m.isSelectable(0, 0)).toBe(false);
      expect(m.isEditable(0, 0)).toBe(false);
    });

    it('setValue returns true without storing anything', () => {
      // NOTE: reports success although nothing is written.
      expect(m.setValue(0, 0, 'x')).toBe(true);
      expect(m.getValueAt(0, 0)).toBe('c');
    });

    it('ignores init, setRowChecked and changeColumnOrder', () => {
      m.init();
      m.setRowChecked(0, true);
      m.changeColumnOrder(0, 1);
      expect(m.getValueAt(0, 0)).toBe('c');
    });
  });
});
