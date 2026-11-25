// The mouse wheel over FIXED columns (west/east) scrolls the table like over the middle (found by the E2E smoke tests,
// prompt 026: `apps/table-demo/row-numbers.html`, `vue3-multi-demo /multisize`).
//
// The fixed body areas are siblings of the scroll viewport (absolutely positioned above it) – the browser sends the
// wheel to them, not to the viewport, and nothing scrolled: a user with the pointer over the row numbers or a pinned
// column could not scroll with the wheel.
//
// REAL wheel input (Playwright page.mouse.wheel through test-utils/real-mouse.ts): a synthetic WheelEvent never scrolls.
import { afterEach, describe, expect, it } from 'vitest';
import { ColumnDef, TableFactory, px100 } from '@guiexpert/table';
import { createRows, destroyAllTables, DIRECTIONS, getCellDiv, mountTable, nextFrame } from '../../../test-utils/mount-table';
import { realMouse } from '../../../test-utils/real-mouse';

afterEach(async () => {
  destroyAllTables();
  await realMouse.move(0, 0);
});

const PROPS = ['id', 'name', 'value', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];

async function mountFixed(direction: 'ltr' | 'rtl', rowCount = 1000) {
  const rows = createRows(rowCount).map(r => ({ ...r, a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9 }));
  const model = TableFactory.createTableModel({
    rows,
    columnDefs: PROPS.map(p => ColumnDef.create({ property: p, headerLabel: p, width: px100 })),
    fixedLeftColumnCount: 1,
    fixedRightColumnCount: 1,
  });
  const table = mountTable(model, { tableOptions: { direction } });
  await nextFrame();
  const viewport = table.scope.scrollViewport;
  return { ...table, viewport };
}

/** Waits until the scroll event of the wheel is through and the table rendered. */
async function settle() {
  await new Promise(resolve => setTimeout(resolve, 50));
  await nextFrame();
  await nextFrame();
}

const lastColumn = PROPS.length - 1;

describe.each(DIRECTIONS)('mouse wheel over fixed columns (%s)', direction => {

  it('over the middle: scrolls (reference)', async () => {
    const t = await mountFixed(direction);
    await realMouse.moveTo(getCellDiv(t.host, 'body', 'center', 3, 2));
    await realMouse.wheel(0, 300);
    await settle();
    expect(t.viewport.scrollTop).toBeGreaterThan(0);
  });

  it.each([['west', 0], ['east', lastColumn]] as const)('over the %s body area: scrolls down and renders other rows', async (side, col) => {
    const t = await mountFixed(direction);
    await realMouse.moveTo(getCellDiv(t.host, 'body', side, 3, col));
    await realMouse.wheel(0, 300);
    await settle();
    expect(t.viewport.scrollTop).toBeGreaterThan(0);
    expect(t.api.getFirstVisibleRowIndex()).toBeGreaterThan(0);
    // the fixed column follows: its first rendered row is no longer row 0
    expect(t.host.querySelector(`.ge-table-body-${side} [data-row-index="0"]`)).toBeNull();
  });

  it('over the west body area: horizontal wheel scrolls the middle columns', async () => {
    const t = await mountFixed(direction);
    await realMouse.moveTo(getCellDiv(t.host, 'body', 'west', 3, 0));
    await realMouse.wheel(direction === 'rtl' ? -200 : 200, 0);   // towards the end of the row
    await settle();
    expect(Math.abs(t.viewport.scrollLeft)).toBeGreaterThan(0);
  });

  it('at the end of the table the wheel over a fixed column is not consumed (the page may scroll)', async () => {
    const t = await mountFixed(direction, 3);   // nothing to scroll
    const cell = getCellDiv(t.host, 'body', 'west', 1, 0);
    let prevented: boolean | undefined;
    cell.addEventListener('wheel', e => { setTimeout(() => { prevented = e.defaultPrevented; }); });
    await realMouse.moveTo(cell);
    await realMouse.wheel(0, 300);
    await settle();
    expect(t.viewport.scrollTop).toBe(0);
    expect(prevented).toBe(false);
  });
});
