import { describe, it, expect } from 'vitest';
import { AreaModelHidden, CoverGridBodyModel, CoverGridTableModel, Padding, SortItem } from '@guiexpert/table';
import type { CellRendererIf, TableScope } from '@guiexpert/table';

const renderer: CellRendererIf = { render: () => undefined };

/** 5 items, width 400, cover 200 x 300 → 2 columns, 3 rows */
const create = (paddingTop = 0) => {
  const body = new CoverGridBodyModel<number>([5, 3, 1, 4, 2], renderer, 200, 300, 400, paddingTop);
  return { body, tm: new CoverGridTableModel<number>(body, paddingTop) };
};

describe('CoverGridTableModel', () => {

  it('has the body model as body and hidden header and footer', () => {
    const { body, tm } = create();
    expect(tm.getBodyModel()).toBe(body);
    expect(tm.getAreaModel('body')).toBe(body);
    expect(tm.getAreaModel('header')).toBeInstanceOf(AreaModelHidden);
    expect(tm.getAreaModel('footer')).toBeInstanceOf(AreaModelHidden);
    expect(tm.isHeaderVisibe()).toBe(false);
    expect(tm.isFooterVisibe()).toBe(false);
  });

  it('has no fixed columns, no row checkbox, no column definitions, nothing sortable', () => {
    const { tm } = create();
    expect(tm.getFixedLeftColumnCount()).toBe(0);
    expect(tm.getFixedRightColumnCount()).toBe(0);
    expect(tm.isRowCheckboxVisible()).toBe(false);
    expect(tm.getColumnDef(0)).toBeUndefined();
    expect(tm.getColumnDefs()).toBeUndefined();
    expect(tm.getColumnProperty(0)).toBe('');
    expect(tm.isSortable(0)).toBe(false);
    expect(tm.getSelectionModel()).toBeUndefined();
  });

  describe('geometry', () => {
    it('column count and widths come from the body model', () => {
      const { tm } = create();
      expect(tm.getColumnCount()).toBe(2);
      expect(tm.getColumnWidth(0)).toBe(200);
      expect(tm.getColumnWidth(1)).toBe(200);
      expect(tm.getXPosByColumnIndex(1)).toBe(200);
    });

    it('setParentWidth changes the column count', () => {
      const { body, tm } = create();
      tm.setParentWidth(1000);
      expect(body.width).toBe(1000);
      expect(tm.getColumnCount()).toBe(5);
    });

    it('setColumnWidth sets the cover width (for all columns)', () => {
      const { body, tm } = create();
      tm.setColumnWidth(0, 100);
      expect(body.coverWidth).toBe(100);
      expect(tm.getColumnWidth(1)).toBe(100);
      expect(tm.getColumnCount()).toBe(4);
    });

    it('content size is derived from rows/columns and cover size', () => {
      const { tm } = create();
      expect(tm.getContentHeightInPixel()).toBe(3 * 300);
      expect(tm.getContentWidthInPixel()).toBe(2 * 200);
    });

    it('content height includes the top padding', () => {
      const { tm } = create(20);
      expect(tm.getContentHeightInPixel()).toBe(20 + 3 * 300);
    });

    it('getRowHeight uses the body model for every area', () => {
      // NOTE: also for header/footer, which are hidden (height 0).
      const { tm } = create(20);
      expect(tm.getRowHeight('body', 0)).toBe(320);
      expect(tm.getRowHeight('header', 1)).toBe(300);
    });

    it('has no padding', () => {
      expect(create().tm.getPadding()).toEqual(new Padding(0, 0, 0, 0));
    });

    it('init, recalcSize, recalcPadding, recalcHeightAndPadding and changeColumnOrder change nothing', () => {
      const { tm } = create();
      tm.init();
      tm.recalcSize(2000);
      tm.recalcPadding();
      tm.recalcHeightAndPadding();
      tm.changeColumnOrder(0, 1);
      expect(tm.getColumnCount()).toBe(2);
      expect(tm.getContentHeightInPixel()).toBe(900);
    });
  });

  describe('delegation to the body model', () => {
    it('externalFilterChanged filters the covers', () => {
      const { body, tm } = create();
      tm.externalFilterChanged((n: number) => n > 2);
      expect(body.filteredItems).toEqual([5, 3, 4]);
    });

    it('doSort sorts the covers', () => {
      const { body, tm } = create();
      expect(tm.doSort([new SortItem(0, 'asc')])).toBe(true);
      expect(body.filteredItems).toEqual([1, 2, 3, 4, 5]);
    });

    it('sort(compareFn) sorts the covers', () => {
      const { body, tm } = create();
      tm.sort((a: number, b: number) => b - a);
      expect(body.filteredItems).toEqual([5, 4, 3, 2, 1]);
    });

    it('getBodyRowByIndex returns undefined (the body model has no row objects)', () => {
      expect(create().tm.getBodyRowByIndex(0)).toBeUndefined();
    });
  });

  it('stores the table scope', () => {
    const { tm } = create();
    expect(tm.getTableScope()).toBeUndefined();
    const scope = {} as TableScope;
    tm.setTableScope(scope);
    expect(tm.getTableScope()).toBe(scope);
  });
});
