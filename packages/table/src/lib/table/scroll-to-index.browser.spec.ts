// TableApi.scrollToIndex(indexX, indexY) in a real browser: the column index scrolls horizontally.
// Regression (TODO.md "Gefunden beim Bau der Startseite"): indexX was ignored – TableScope.scrollToIndex always called
// scrollToPixel(0, py) and reset the horizontal position to 0 (also ensureRowIsVisible, i.e. every arrow key).
import { afterEach, describe, expect, it } from 'vitest';
import { AreaModel, ColumnDef, TableFactory, px100 } from '@guiexpert/table';
import { destroyAllTables, mountTable, nextFrame } from '../../../test-utils/mount-table';

/** Values computed on demand: "r<row>c<col>" – cheap even for millions of rows. */
class WideBody extends AreaModel {
  constructor(private readonly rowCount: number) {
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
    return `r${row}c${col}`;
  }
}

/** 60 columns × 100 px (6000 px) in an 800 px host. */
async function mountWide({ rows = 100, cols = 60, fixedLeft = 0, fixedRight = 0 } = {}) {
  const tableModel = TableFactory.createTableModel({
    bodyAreaModel: new WideBody(rows),
    columnDefs: Array.from({ length: cols }, (_, i) => new ColumnDef('c' + i, 'C' + i, px100)),
    fixedLeftColumnCount: fixedLeft,
    fixedRightColumnCount: fixedRight,
  });
  const table = mountTable(tableModel, { width: 800, height: 500 });
  await nextFrame();
  return table;
}

/** Left edge of the rendered body cells of a column, relative to the host (undefined: column not rendered). */
function bodyColumnLeft(host: HTMLElement, col: number, side = 'center'): number | undefined {
  const cell = host.querySelector<HTMLElement>(`.ge-table-body-${side} .ge-table-col-div[data-col-index="${col}"]`);
  return cell ? cell.getBoundingClientRect().left - host.getBoundingClientRect().left : undefined;
}

function scrollLeft(host: HTMLElement): number {
  return host.querySelector<HTMLElement>('.ge-table-scroll-viewport')!.scrollLeft;
}

afterEach(destroyAllTables);

describe('TableApi.scrollToIndex – column index (real browser)', () => {

  it('scrollToIndex(col, row) shows the column at the left edge of the viewport', async () => {
    const { host, api } = await mountWide();
    expect(bodyColumnLeft(host, 30)).toBeUndefined(); // far right, not rendered
    api.scrollToIndex(30, 0);
    await nextFrame();
    expect(scrollLeft(host)).toBeGreaterThan(0);
    expect(bodyColumnLeft(host, 30)).toBeCloseTo(0, 0);
    expect(bodyColumnLeft(host, 31)).toBeCloseTo(100, 0);
    expect(api.getFirstVisibleRowIndex()).toBe(0);
  });

  it('scrollToIndex(lastColumn, row) scrolls to the right end (the column is visible)', async () => {
    const { host, api } = await mountWide();
    api.scrollToIndex(59, 0);
    await nextFrame();
    const viewport = host.querySelector<HTMLElement>('.ge-table-scroll-viewport')!;
    expect(viewport.scrollLeft).toBeCloseTo(viewport.scrollWidth - viewport.clientWidth, 0);
    const left = bodyColumnLeft(host, 59)!;
    expect(left).toBeGreaterThan(600);
    expect(left).toBeLessThan(800);
  });

  it('scrollToIndex(0, row) scrolls back to the first column and still sets the row', async () => {
    const { host, api } = await mountWide();
    api.scrollToIndex(30, 0);
    await nextFrame();
    api.scrollToIndex(0, 50);
    await nextFrame();
    expect(scrollLeft(host)).toBe(0);
    expect(bodyColumnLeft(host, 0)).toBe(0);
    // NOTE: vertically unchanged: the scroll bar range is 1 px larger than the content range (wrapper height + 1),
    // so row 49 may still peek in by < 1 px – the first FULLY visible row is the requested one.
    expect(api.getFirstFullVisibleRowIndex()).toBe(50);
  });

  it('changing only the column keeps the vertical position', async () => {
    const { host, api } = await mountWide();
    api.scrollToIndex(0, 40);
    await nextFrame();
    const viewport = host.querySelector<HTMLElement>('.ge-table-scroll-viewport')!;
    const scrollTop = viewport.scrollTop;
    expect(api.getFirstVisibleRowIndex()).toBe(40);

    api.scrollToIndex(25, 40);
    await nextFrame();
    expect(viewport.scrollTop).toBe(scrollTop);
    expect(api.getFirstVisibleRowIndex()).toBe(40);
    expect(bodyColumnLeft(host, 25)).toBeCloseTo(0, 0);
  });

  it('-1 and fixed east columns keep the horizontal position, a fixed west column scrolls back to the start', async () => {
    const { host, api } = await mountWide({ fixedLeft: 1, fixedRight: 1 });
    api.scrollToIndex(30, 0);
    await nextFrame();
    // center starts right of the fixed west column (100 px)
    expect(bodyColumnLeft(host, 30)).toBeCloseTo(100, 0);
    const x = scrollLeft(host);
    expect(x).toBeGreaterThan(0);

    api.scrollToIndex(59, 20);  // east
    await nextFrame();
    expect(scrollLeft(host)).toBe(x);
    expect(api.getFirstVisibleRowIndex()).toBe(20);

    api.scrollToIndex(-1, 30);  // "keep"
    await nextFrame();
    expect(scrollLeft(host)).toBe(x);
    expect(api.getFirstVisibleRowIndex()).toBe(30);
    expect(bodyColumnLeft(host, 30)).toBeCloseTo(100, 0);

    api.scrollToIndex(1, 30);   // first center column → back to the start
    await nextFrame();
    expect(scrollLeft(host)).toBe(0);
  });

  it('ensureRowIsVisible() scrolls vertically only (the horizontal position is kept)', async () => {
    const { host, api } = await mountWide();
    api.scrollToIndex(30, 0);
    await nextFrame();
    const x = scrollLeft(host);

    expect(api.ensureRowIsVisible(80)).toBe(true);
    await nextFrame();
    expect(scrollLeft(host)).toBe(x);
    expect(api.getLastFullVisibleRowIndex()).toBeGreaterThanOrEqual(80);
    expect(bodyColumnLeft(host, 30)).toBeCloseTo(0, 0);

    expect(api.ensureRowIsVisible(2)).toBe(true);
    await nextFrame();
    expect(scrollLeft(host)).toBe(x);
    expect(api.getFirstVisibleRowIndex()).toBe(2);
  });

  it('works with a capped scroll height (2,000,000 rows): exact row and column', async () => {
    const { host, api } = await mountWide({ rows: 2_000_000 });
    api.scrollToIndex(30, 1_000_000);
    await nextFrame();
    expect(api.getFirstVisibleRowIndex()).toBe(1_000_000);
    expect(bodyColumnLeft(host, 30)).toBeCloseTo(0, 0);
  });

  // compatible with the old behaviour (indexX was ignored, x was always reset to 0): scrollToIndex(0, y) on a table
  // with a fixed column 0 still scrolls back to the start
  it('a fixed west column scrolls back to the start (x = 0)', async () => {
    const { host, api } = await mountWide({ fixedLeft: 1, fixedRight: 1 });
    api.scrollToIndex(30, 0);
    await nextFrame();
    expect(scrollLeft(host)).toBeGreaterThan(0);
    api.scrollToIndex(0, 10);
    await nextFrame();
    expect(scrollLeft(host)).toBe(0);
    expect(api.getFirstVisibleRowIndex()).toBe(10);
  });
});
