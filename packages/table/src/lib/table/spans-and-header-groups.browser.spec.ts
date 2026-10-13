// Col-/rowspan cells and header groups in a real browser. Big cells are skipped in the row divs and drawn once at
// the end of the render pass (RenderScope.drawBigCell) – also when they are partly scrolled out.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import {
  AreaModelCellGroups,
  AreaModelObjectArrayWithColumndefs,
  CellgroupFactory,
  ColumnDef,
  TableFactory,
  px100,
  px120,
} from '@guiexpert/table';
import type { CellGroupIf } from '@guiexpert/table';
import {
  areaRows,
  cellDiv,
  columnIndices,
  destroyAllTables,
  getCellDiv,
  mountTable,
  nextFrame,
  renderedRows,
  stylePx,
} from '../../../test-utils/mount-table';

afterEach(() => {
  destroyAllTables();
  vi.restoreAllMocks();
});

interface Row { [key: string]: string | number }

/** Body model with spans: (2,1) colspan 2 · (4,0) rowspan 3 · (1,3) colspan 4. */
class SpanBodyModel extends AreaModelObjectArrayWithColumndefs<Row> {
  override getColspanAt(rowIndex: number, columnIndex: number): number {
    if (rowIndex === 2 && columnIndex === 1) return 2;
    if (rowIndex === 1 && columnIndex === 3) return 4;
    return 0;
  }

  override getRowspanAt(rowIndex: number, columnIndex: number): number {
    return rowIndex === 4 && columnIndex === 0 ? 3 : 0;
  }
}

function mountSpanTable(opts: { columns?: number; rows?: number; fixedLeft?: number } = {}) {
  const columnDefs = Array.from({ length: opts.columns ?? 8 }, (_, c) => ColumnDef.create({ property: 'c' + c, width: px100 }));
  const rows: Row[] = Array.from({ length: opts.rows ?? 100 },
    (_, r) => Object.fromEntries(columnDefs.map((cd, c) => [cd.property, `${r}/${c}`])));
  const bodyAreaModel = new SpanBodyModel('body', rows, columnDefs, 34);
  return mountTable(TableFactory.createTableModel({ bodyAreaModel, columnDefs, fixedLeftColumnCount: opts.fixedLeft ?? 0 }));
}

/** All DOM elements of a cell (a cell may be drawn more than once). */
const allCellDivs = (host: HTMLElement, area: string, r: number, c: number) =>
  host.querySelectorAll<HTMLElement>(`.ge-table-${area}-center .ge-table-col-div[data-row-index="${r}"][data-col-index="${c}"], ` +
    `.ge-table-${area}-west .ge-table-col-div[data-row-index="${r}"][data-col-index="${c}"]`);

describe('col-/rowspan in the body (getColspanAt / getRowspanAt)', () => {

  it('a colspan cell is drawn once, as wide as its columns – the covered cells are skipped', async () => {
    const { host } = mountSpanTable();
    await nextFrame();
    expect(allCellDivs(host, 'body', 2, 1)).toHaveLength(1);
    const big = getCellDiv(host, 'body', 'center', 2, 1);
    expect(big.parentElement!.classList).not.toContain('ge-table-row-div'); // drawn into the area, not into the row
    expect(stylePx(big, 'width')).toBe(200);
    expect(stylePx(big, 'height')).toBe(34);
    expect(stylePx(big, 'left')).toBe(100);
    expect(stylePx(big, 'top')).toBe(2 * 34);
    expect(big.textContent).toBe('2/1');
    expect(cellDiv(host, 'body', 'center', 2, 2)).toBeNull();
    expect(columnIndices(renderedRows(host)[2])).toEqual([0, 3, 4, 5, 6, 7]);
  });

  it('a rowspan cell is drawn once, as high as its rows', async () => {
    const { host } = mountSpanTable();
    await nextFrame();
    expect(allCellDivs(host, 'body', 4, 0)).toHaveLength(1);
    const big = getCellDiv(host, 'body', 'center', 4, 0);
    expect(stylePx(big, 'height')).toBe(3 * 34);
    expect(stylePx(big, 'width')).toBe(100);
    expect(stylePx(big, 'top')).toBe(4 * 34);
    for (const r of [5, 6]) {
      expect(cellDiv(host, 'body', 'center', r, 0)).toBeNull();
      expect(columnIndices(renderedRows(host)[r])[0]).toBe(1);
    }
  });

  it('a rowspan cell whose first row is scrolled out is still drawn (bottom part visible)', async () => {
    const { host, api } = mountSpanTable();
    await nextFrame();
    api.scrollToPixel(0, 5 * 34);
    await nextFrame();
    expect(api.getFirstVisibleRowIndex()).toBe(5);
    expect(renderedRows(host)[0].getAttribute('data-row-index')).toBe('5');
    const big = getCellDiv(host, 'body', 'center', 4, 0);
    const row5Top = stylePx(renderedRows(host)[0], 'top');
    expect(stylePx(big, 'top')).toBe(row5Top - 34);
    expect(stylePx(big, 'top') + stylePx(big, 'height')).toBeGreaterThan(0);
  });

  it('a colspan cell whose first column is scrolled out horizontally is still drawn', async () => {
    const { host, api } = mountSpanTable({ columns: 40 });
    await nextFrame();
    api.scrollToPixel(450, 0);
    await nextFrame();
    const row1 = renderedRows(host)[1];
    expect(columnIndices(row1)).not.toContain(3);
    const big = getCellDiv(host, 'body', 'center', 1, 3);
    const nextCell = getCellDiv(host, 'body', 'center', 1, 7);
    expect(stylePx(big, 'width')).toBe(400);
    expect(stylePx(big, 'left') + 400).toBe(stylePx(nextCell, 'left'));
    expect(stylePx(big, 'left')).toBeLessThan(0);
  });

  it('a rowspan cell in a fixed west column is drawn in the west area', async () => {
    const { host } = mountSpanTable({ fixedLeft: 1 });
    await nextFrame();
    const big = getCellDiv(host, 'body', 'west', 4, 0);
    expect(stylePx(big, 'height')).toBe(3 * 34);
    expect(cellDiv(host, 'body', 'center', 4, 0)).toBeNull();
    expect(columnIndices(renderedRows(host, 'west')[5])).toEqual([]);
  });

  // BUG: the ColAndRowspanModels are built once in the RenderScope constructor (render-scope.ts:146) and never
  // rebuilt. After setRows() with fewer rows drawBigCell() still draws the old range of row 4 →
  // AreaModelObjectArray.getCustomClassesAt() reads `row.selected` of a missing row → TypeError, the repaint aborts.
  it.fails('setRows() with fewer rows + repaintHard() renders without the old span cells', async () => {
    const { host, api } = mountSpanTable();
    await nextFrame();
    api.setRows([{ c0: 'a' }, { c0: 'b' }, { c0: 'c' }]);
    expect(() => api.repaintHard()).not.toThrow();
    expect(renderedRows(host)).toHaveLength(3);
    expect(cellDiv(host, 'body', 'center', 4, 0)).toBeNull();
  });

  it('big cells far outside the viewport are drawn anyway', async () => {
    const { host, api } = mountSpanTable({ rows: 1000 });
    await nextFrame();
    api.scrollToIndex(0, 500);
    await nextFrame();
    // NOTE: render-scope.ts:799 draws EVERY col-/rowspan range in each render pass, visible or not
    // (fine for a few spans, O(spans) DOM nodes per scroll frame for many).
    const big = getCellDiv(host, 'body', 'center', 2, 1);
    expect(stylePx(big, 'top')).toBeLessThan(-400 * 34);
  });
});

describe('header groups (AreaModelCellGroups)', () => {

  beforeEach(() => {
    vi.spyOn(console, 'table').mockImplementation(() => undefined); // AreaModelCellGroups.init() prints its grid
  });

  const groups = (): CellGroupIf[] => [
    { data: 'Order', children: [{ data: 'ID', property: 'id' }, { data: 'Date', property: 'date' }] },
    {
      data: 'Customer', toggle: true, children: [
        { data: 'Customer', property: 'customer', visibility: 'always' },
        { data: 'City', property: 'city' },
      ],
    },
  ];

  async function mountGroupTable() {
    const cellGroups = groups();
    const columnDefs = CellgroupFactory.buildColumnDefs(CellgroupFactory.buildGroupExts(cellGroups));
    columnDefs.forEach(cd => cd.width = px120);
    const rows = Array.from({ length: 20 }, (_, i) => ({ id: i, date: `2026-10-${10 + i}`, customer: 'C' + i, city: 'City ' + i }));
    const headerAreaModel = new AreaModelCellGroups('header', cellGroups, columnDefs, 34);
    const bodyAreaModel = new AreaModelObjectArrayWithColumndefs('body', rows, columnDefs, 34);
    const table = mountTable(TableFactory.createTableModel({ headerAreaModel, bodyAreaModel, columnDefs }));
    await nextFrame();
    return table;
  }

  /** The top-most copy of a header cell (group cells are drawn twice, see below). */
  const lastHeaderCell = (host: HTMLElement, r: number, c: number) => {
    const all = allCellDivs(host, 'header', r, c);
    return all[all.length - 1];
  };

  it('renders one header row per group level with spanning group cells', async () => {
    const { host } = await mountGroupTable();
    expect(stylePx(host.querySelector<HTMLElement>('.ge-table-header-center')!, 'height')).toBe(68);
    expect(areaRows(host, 'header')).toHaveLength(2);
    const order = lastHeaderCell(host, 0, 0);
    expect(order.textContent).toBe('Order');
    expect([stylePx(order, 'left'), stylePx(order, 'width'), stylePx(order, 'height')]).toEqual([0, 240, 34]);
    const customer = lastHeaderCell(host, 0, 2);
    expect(customer.textContent!.trim()).toBe('Customer❯');
    expect([stylePx(customer, 'left'), stylePx(customer, 'width')]).toEqual([240, 240]);
    expect(Array.from(areaRows(host, 'header')[1].querySelectorAll('.ge-table-col-div'), e => e.textContent))
      .toEqual(['ID', 'Date', 'Customer', 'City']);
    // NOTE: group cells are drawn twice – in the row div (gammaCells, render-scope.ts:1015) and again by drawBigCell.
    expect(allCellDivs(host, 'header', 0, 0)).toHaveLength(2);
    expect(cellDiv(host, 'header', 'center', 0, 1)).toBeNull();
  });

  it('a toggleable group shows the expanded icon (HeaderGroupOptions)', async () => {
    const { host } = await mountGroupTable();
    const icon = lastHeaderCell(host, 0, 2).querySelector<HTMLElement>('.ge-table-toggle-icon-div')!;
    expect(icon.getAttribute('data-ge-action')).toBe('toggleHeaderGroup');
    expect(icon.textContent).toBe('❯');
    // NOTE: the default class is "gt-table-icon-expanded" (gt-, not ge-) – header-group-options.ts.
    expect(icon.classList).toContain('gt-table-icon-expanded');
    expect(lastHeaderCell(host, 0, 0).querySelector('.ge-table-toggle-icon-div')).toBeNull();
  });

  it('clicking the icon collapses the group: the child column disappears, widths are kept', async () => {
    const { host } = await mountGroupTable();
    await userEvent.click(lastHeaderCell(host, 0, 2).querySelector('.ge-table-toggle-icon-div')!);
    await nextFrame();
    expect(columnIndices(renderedRows(host)[0])).toEqual([0, 1, 2]);
    expect(renderedRows(host)[0].textContent).not.toContain('City');
    expect(Array.from(areaRows(host, 'header')[1].querySelectorAll('.ge-table-col-div'), e => e.textContent))
      .toEqual(['ID', 'Date', 'Customer']);
    expect(getCellDiv(host, 'body', 'center', 0, 2).style.width).toBe('120px'); // not reset to 100 px (TODO.md)
    const icon = lastHeaderCell(host, 0, 2).querySelector<HTMLElement>('.ge-table-toggle-icon-div')!;
    expect(icon.classList).toContain('ge-table-icon-collapsed');
    expect(icon.style.transform).toContain('rotate(180deg)');
  });

  it('clicking the icon again expands the group', async () => {
    const { host, scope } = await mountGroupTable();
    scope.mouseHandler.doubleClickDelay = 0; // otherwise the second click on the same cell counts as double click
    await userEvent.click(lastHeaderCell(host, 0, 2).querySelector('.ge-table-toggle-icon-div')!);
    await nextFrame();
    await userEvent.click(lastHeaderCell(host, 0, 2).querySelector('.ge-table-toggle-icon-div')!);
    await nextFrame();
    expect(columnIndices(renderedRows(host)[0])).toEqual([0, 1, 2, 3]);
    expect(getCellDiv(host, 'body', 'center', 0, 3).textContent).toBe('City 0');
  });
});
