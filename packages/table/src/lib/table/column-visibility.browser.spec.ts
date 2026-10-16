// TableApi.setColumnVisible / setHeaderVisible / setFooterVisible in a real browser (before: empty stubs, TODO.md).
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { CellRange, ColumnDef, FocusModel, SelectionModel, TableFactory, px100 } from '@guiexpert/table';
import type { TableModelIf } from '@guiexpert/table';
import { DIRECTIONS, createRows, destroyAllTables, mountTable as mountTableBase, nextFrame, renderedRows } from '../../../test-utils/mount-table';
import type { MountOptions } from '../../../test-utils/mount-table';

// Every test runs left-to-right and right-to-left (since 1.1.98): positions and scroll offsets are measured from the
// start of the row (right-to-left: from the right edge).
let direction: 'ltr' | 'rtl' = 'ltr';
const mountTable = (model: TableModelIf, opts: MountOptions = {}) =>
  mountTableBase(model, { ...opts, tableOptions: { direction, ...opts.tableOptions } });
/** x of a rect inside a box, measured from the box's start. */
const fromStart = (r: DOMRect, box: DOMRect) => direction === 'rtl' ? box.right - r.right : r.left - box.left;
/** The arrow key to the next / previous column in reading direction. */
const nextKey = () => direction === 'rtl' ? '{ArrowLeft}' : '{ArrowRight}';
const prevKey = () => direction === 'rtl' ? '{ArrowRight}' : '{ArrowLeft}';


/** id | name | value (3 × 100 px), 1000 rows, one footer row; optionally the first column fixed. */
async function mountThreeColumns(fixedLeftColumnCount = 0) {
  const tableModel = TableFactory.createTableModel({
    rows: createRows(1000),
    columnDefs: [new ColumnDef('id', 'Id', px100), new ColumnDef('name', 'Name', px100), new ColumnDef('value', 'Value', px100)],
    footerData: [['f-id', 'f-name', 'f-value']],
    fixedLeftColumnCount,
  });
  const sm = new SelectionModel('range', 'multi');
  const table = mountTable(tableModel, { width: 800, height: 500, tableOptions: { getSelectionModel: () => sm } });
  await nextFrame();
  return table;
}

function cells(host: HTMLElement, area: 'header' | 'body' | 'footer', col?: number): HTMLElement[] {
  const colSelector = col === undefined ? '' : `[data-col-index="${col}"]`;
  return Array.from(host.querySelectorAll<HTMLElement>(`.ge-table-col-div[data-area="${area}"]${colSelector}`));
}

/** Left edge and width of the first rendered cell of a column, relative to the host. */
function geo(host: HTMLElement, area: 'header' | 'body' | 'footer', col: number) {
  const rect = cells(host, area, col)[0]!.getBoundingClientRect();
  return { left: fromStart(rect, host.getBoundingClientRect()), width: rect.width };
}

function areaHeight(host: HTMLElement, area: 'header' | 'footer'): number {
  return host.querySelector<HTMLElement>(`.ge-table-${area}-center`)!.getBoundingClientRect().height;
}

afterEach(destroyAllTables);

describe.each(DIRECTIONS)('%s', dir => {
  beforeEach(() => { direction = dir; });

  describe('TableApi.setColumnVisible (real browser)', () => {

    it('hides a column in header, body and footer – the columns to the right move left', async () => {
      const { host, api } = await mountThreeColumns();
      expect(geo(host, 'body', 2).left).toBe(200);

      expect(api.setColumnVisible('name', false)).toBe(true);
      expect(api.isColumnVisible(1)).toBe(false);
      expect(cells(host, 'header', 1)).toHaveLength(0);
      expect(cells(host, 'body', 1)).toHaveLength(0);
      expect(cells(host, 'footer', 1)).toHaveLength(0);
      expect(geo(host, 'header', 2).left).toBe(100);
      expect(geo(host, 'body', 2).left).toBe(100);
      expect(geo(host, 'footer', 2).left).toBe(100);
      expect(cells(host, 'body', 2)[0]!.textContent).toBe('0');            // value of row 0, data unchanged
    });

    it('showing it again restores width and position (also a width changed by the user)', async () => {
      const { host, api } = await mountThreeColumns();
      api.setColumnWidth(1, 160);
      api.recalcWrappers();
      api.setColumnVisible(1, false);
      api.setColumnVisible(1, true);
      expect(api.isColumnVisible('name')).toBe(true);
      expect(geo(host, 'body', 1)).toEqual({ left: 100, width: 160 });
      expect(geo(host, 'header', 2).left).toBe(260);
      expect(cells(host, 'body', 1)[0]!.textContent).toBe('Name 0');
    });

    it('a hidden fixed column: the west area shrinks', async () => {
      const { host, api } = await mountThreeColumns(1);
      expect(geo(host, 'body', 1).left).toBe(100);
      api.setColumnVisible(0, false);
      expect(cells(host, 'body', 0)).toHaveLength(0);
      expect(geo(host, 'body', 1).left).toBe(0);
      api.setColumnVisible(0, true);
      expect(geo(host, 'body', 0).left).toBe(0);
      expect(geo(host, 'body', 1).left).toBe(100);
    });

    it('returns false for an unknown column and changes nothing', async () => {
      const { host, api } = await mountThreeColumns();
      expect(api.setColumnVisible(7, false)).toBe(false);
      expect(api.setColumnVisible('nope', false)).toBe(false);
      expect(api.isColumnVisible('nope')).toBe(false);
      expect(cells(host, 'body', 1).length).toBeGreaterThan(0);
    });

    it('the copied content skips the hidden column', async () => {
      const { api, scope } = await mountThreeColumns();
      const sm = api.getSelectionModel()!;
      const fm = scope.focusModel()!;
      sm.addSelection(new CellRange(0, 0, 1, 2));
      api.setColumnVisible('name', false);
      const text = await scope.copyService.createContent(api.getTableModel(), sm, fm);
      expect(text).toBe('0\t0\n1\t3');
    });
  });

  describe('TableApi.setHeaderVisible / setFooterVisible (real browser)', () => {

    it('hides the header: height 0, no header cells, the body moves up and shows more rows', async () => {
      const { host, api } = await mountThreeColumns();
      expect(api.isHeaderVisible()).toBe(true);
      expect(areaHeight(host, 'header')).toBe(34);
      const rowsBefore = renderedRows(host).length;
      const firstRowTop = renderedRows(host)[0]!.getBoundingClientRect().top;

      api.setHeaderVisible(false);
      expect(api.isHeaderVisible()).toBe(false);
      expect(areaHeight(host, 'header')).toBe(0);
      expect(cells(host, 'header')).toHaveLength(0);
      expect(renderedRows(host)[0]!.getBoundingClientRect().top).toBe(firstRowTop - 34);
      expect(renderedRows(host).length).toBeGreaterThanOrEqual(rowsBefore);
      expect(api.getLastFullVisibleRowIndex()).toBeGreaterThan(0);

      api.setHeaderVisible(true);
      expect(api.isHeaderVisible()).toBe(true);
      expect(areaHeight(host, 'header')).toBe(34);
      expect(cells(host, 'header', 1)[0]!.textContent).toContain('Name');
      expect(renderedRows(host)[0]!.getBoundingClientRect().top).toBe(firstRowTop);
    });

    it('hides the footer: height 0, no footer cells, the body gets taller', async () => {
      const { host, api } = await mountThreeColumns();
      expect(api.isFooterVisible()).toBe(true);
      expect(areaHeight(host, 'footer')).toBe(34);
      const lastFullBefore = api.getLastFullVisibleRowIndex();

      api.setFooterVisible(false);
      expect(api.isFooterVisible()).toBe(false);
      expect(areaHeight(host, 'footer')).toBe(0);
      expect(cells(host, 'footer')).toHaveLength(0);
      expect(api.getLastFullVisibleRowIndex()).toBe(lastFullBefore + 1);

      api.setFooterVisible(true);
      expect(areaHeight(host, 'footer')).toBe(34);
      expect(cells(host, 'footer', 1)[0]!.textContent).toBe('f-name');
      expect(api.getLastFullVisibleRowIndex()).toBe(lastFullBefore);
    });

    it('a table without footer rows: isFooterVisible() is false', async () => {
      const tableModel = TableFactory.createTableModel({ rows: createRows(10) });
      const { api } = mountTable(tableModel);
      await nextFrame();
      expect(api.isFooterVisible()).toBe(false);
      expect(api.isHeaderVisible()).toBe(true);
    });
  });

  /** `columnCount` columns of 100 px (c0 … cN), 1000 rows, a focus model; the host has the keyboard focus. */
  async function mountWideTable(columnCount: number, fixed: { left?: number, right?: number } = {}) {
    const columnDefs = Array.from({ length: columnCount }, (_, i) => new ColumnDef(`c${i}`, `C${i}`, px100));
    const rows = Array.from({ length: 1000 }, (_, r) =>
      Object.fromEntries(columnDefs.map((def, c) => [def.property, `${r}/${c}`])));
    const tableModel = TableFactory.createTableModel({
      rows, columnDefs, fixedLeftColumnCount: fixed.left ?? 0, fixedRightColumnCount: fixed.right ?? 0,
    });
    const fm = new FocusModel('cell');
    const table = mountTable(tableModel, { width: 800, height: 500, tableOptions: { getFocusModel: () => fm } });
    await nextFrame();
    table.host.focus();
    return { ...table, fm };
  }

  /** Left and right edge of the first rendered body cell of a column relative to the visible center area. */
  function centerEdges(host: HTMLElement, col: number) {
    const area = host.querySelector<HTMLElement>('.ge-table-body-center')!.getBoundingClientRect();
    const cell = cells(host, 'body', col)[0]!.getBoundingClientRect();
    const left = fromStart(cell, area);
    return { left, right: left + cell.width, areaWidth: area.width };
  }

  function expectFullyVisible(host: HTMLElement, col: number) {
    const { left, right, areaWidth } = centerEdges(host, col);
    expect(left).toBeGreaterThanOrEqual(-1);
    expect(right).toBeLessThanOrEqual(areaWidth + 1);
  }

  // Regression (TODO.md, column visibility): the arrow keys could land on a hidden column (width 0 – the focus was
  // invisible) and never scrolled horizontally – the focused cell could leave the viewport to the left or right.
  describe('keyboard navigation and hidden columns (real browser)', () => {

    it('ArrowRight / ArrowLeft skip hidden columns', async () => {
      const { api, fm } = await mountWideTable(4);
      api.setColumnVisible(1, false);
      api.setColumnVisible(2, false);
      fm.setFocus(0, 0);
      await userEvent.keyboard(nextKey());
      expect(fm.getFocus()).toEqual([0, 3]);
      await userEvent.keyboard(prevKey());
      expect(fm.getFocus()).toEqual([0, 0]);
    });

    it('stays on the last shown column if only hidden columns follow', async () => {
      const { api, fm } = await mountWideTable(4);
      api.setColumnVisible(3, false);
      fm.setFocus(0, 2);
      await userEvent.keyboard(nextKey());
      expect(fm.getFocus()).toEqual([0, 2]);
    });

    it('the first arrow key without a focus focuses the first shown column', async () => {
      const { api, fm } = await mountWideTable(4);
      api.setColumnVisible(0, false);
      await userEvent.keyboard('{ArrowDown}');
      expect(fm.getFocus()).toEqual([0, 1]);
    });

    it('ArrowRight scrolls the focused column into view, ArrowLeft back', async () => {
      const { host, fm } = await mountWideTable(20);
      fm.setFocus(0, 6);
      for (let i = 0; i < 6; i++) {
        await userEvent.keyboard(nextKey());
        await nextFrame();
        expectFullyVisible(host, fm.getFocus()[1]);
      }
      expect(fm.getFocus()).toEqual([0, 12]);
      expect(Math.abs(host.querySelector<HTMLElement>('.ge-table-scroll-viewport')!.scrollLeft)).toBeGreaterThan(0);
      fm.setFocus(0, 3);
      await userEvent.keyboard(prevKey());
      await nextFrame();
      expect(fm.getFocus()).toEqual([0, 2]);
      expectFullyVisible(host, 2);
    });
  });

  describe('TableApi.ensureColumnIsVisible (real browser)', () => {

    it('scrolls only if needed: a column on the right becomes the last, a column on the left the first visible one', async () => {
      const { host, api } = await mountWideTable(20);
      expect(api.ensureColumnIsVisible(3)).toBe(false);          // visible already
      expect(api.ensureColumnIsVisible(15)).toBe(true);
      await nextFrame();
      expectFullyVisible(host, 15);
      expect(centerEdges(host, 15).right).toBeGreaterThan(centerEdges(host, 15).areaWidth - 2); // the last one
      expect(api.ensureColumnIsVisible(15)).toBe(false);
      expect(api.ensureColumnIsVisible(4)).toBe(true);
      await nextFrame();
      expect(Math.abs(centerEdges(host, 4).left)).toBeLessThanOrEqual(1);                          // the first one
    });

    it('keeps the vertical position', async () => {
      const { api } = await mountWideTable(20);
      api.scrollToIndex(-1, 300);
      await nextFrame();
      const firstRow = api.getFirstVisibleRowIndex();
      api.ensureColumnIsVisible(18);
      await nextFrame();
      expect(api.getFirstVisibleRowIndex()).toBe(firstRow);
    });

    it('returns false for fixed, hidden and unknown columns', async () => {
      const { api } = await mountWideTable(20, { left: 1, right: 1 });
      expect(api.ensureColumnIsVisible(0)).toBe(false);
      expect(api.ensureColumnIsVisible(19)).toBe(false);
      expect(api.ensureColumnIsVisible(-1)).toBe(false);
      expect(api.ensureColumnIsVisible(99)).toBe(false);
      api.setColumnVisible(17, false);
      expect(api.ensureColumnIsVisible(17)).toBe(false);
      expect(api.ensureColumnIsVisible(16)).toBe(true);
    });
  });
});
