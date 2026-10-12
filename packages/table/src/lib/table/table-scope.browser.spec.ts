import { afterEach, describe, expect, it } from 'vitest';
import { EleScope, TableFactory } from '@guiexpert/table';
import { createRows, destroyAllTables, mountTable, nextFrame, renderedRows } from '../../../test-utils/mount-table';

const ROWS = 2_000_000;

function mountLarge(rowCount = ROWS) {
  return mountTable(TableFactory.createTableModel({ rows: createRows(rowCount), properties: ['id', 'name', 'value'] }));
}

afterEach(destroyAllTables);

describe('TableScope – virtual scrolling (real browser)', () => {

  it('renders only the visible rows of 2,000,000', async () => {
    const { host, api } = mountLarge();
    await nextFrame();
    const n = renderedRows(host).length;
    expect(n).toBeGreaterThan(5);
    expect(n).toBeLessThan(40);
    expect(api.getDisplayedRowCount()).toBeGreaterThan(5);
  });

  it('scrollToIndex() jumps exactly to row 1,000,000', async () => {
    const { api } = mountLarge();
    await nextFrame();
    api.scrollToIndex(0, 1_000_000);
    await nextFrame();
    expect(api.getFirstVisibleRowIndex()).toBe(1_000_000);
  });

  // Regression (TODO.md): getLastVisibleRowIndex()/getLastFullVisibleRowIndex() returned -1 at the table end.
  it('getLastFullVisibleRowIndex() at the end of the table is the last row (not -1)', async () => {
    const { api } = mountLarge();
    await nextFrame();
    api.scrollToIndex(0, ROWS - 1);
    await nextFrame();
    expect(api.getLastFullVisibleRowIndex()).toBe(ROWS - 1);
  });

  // Regression (TODO.md): with very few rows the "last visible" index was -1 as well.
  it('getLastFullVisibleRowIndex() with fewer rows than the viewport', async () => {
    const { api } = mountLarge(3);
    await nextFrame();
    expect(api.getLastFullVisibleRowIndex()).toBe(2);
  });

  // Regression (TODO.md, branch fix/huge-scroll-height): scroll height is capped at EleScope.maxScrollHeightInPx.
  it('caps the scroll height at EleScope.maxScrollHeightInPx', async () => {
    const { host } = mountLarge();
    await nextFrame();
    const maxScrollHeight = Math.max(...Array.from(host.querySelectorAll<HTMLElement>('*'), e => e.scrollHeight));
    expect(maxScrollHeight).toBeGreaterThan(1_000_000);
    expect(maxScrollHeight).toBeLessThanOrEqual(EleScope.maxScrollHeightInPx);
  });

  // Regression (TODO.md): api.sort(fn) did not repaint (new order only visible after the next scroll).
  it('api.sort() repaints immediately', async () => {
    const { host, api } = mountLarge(100);
    await nextFrame();
    expect(renderedRows(host)[0].textContent).toContain('Name 0');
    api.sort((a: any, b: any) => b.id - a.id);
    await nextFrame();
    expect(renderedRows(host)[0].textContent).toContain('Name 99');
  });

  it('mount/destroy 50 times without errors', async () => {
    for (let i = 0; i < 50; i++) {
      const t = mountLarge(1000);
      t.destroy();
    }
    expect(document.querySelectorAll('.ge-table-row-div').length).toBe(0);
  });
});
