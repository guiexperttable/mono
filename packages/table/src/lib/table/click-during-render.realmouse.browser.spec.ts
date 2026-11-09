// Prompt 018: a click survives a render that the APPLICATION triggers through the API while the mouse button is held
// (live tail: repaint()/repaintHard()/scrollToPixel() up to ten times per second).
//
// The browser sends "click" only when mousedown and mouseup hit the same element. A render rebuilds the visible cells,
// the pressed cell is detached, and no "click" (and no "dblclick") comes – mouseClicked and the focus were lost.
// The MouseHandler now reports the click itself for the cell of the mousedown (row object, not row index).
//
// REAL mouse input (Playwright page.mouse through test-utils/real-mouse.ts): synthetic events would bypass the
// browser's own decision. `pnpm test:browser:webkit` runs this file in WebKit too.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ColumnDef, EventAdapter, TableFactory, px100 } from '@guiexpert/table';
import type { GeMouseEvent, TableOptionsIf } from '@guiexpert/table';
import { createRows, destroyAllTables, DIRECTIONS, getCellDiv, mountTable, nextFrame } from '../../../test-utils/mount-table';
import { realMouse } from '../../../test-utils/real-mouse';

afterEach(async () => {
  destroyAllTables();
  vi.restoreAllMocks();
  await realMouse.move(0, 0); // the next test starts without a hovered cell
});

async function mountClickTable(direction: 'ltr' | 'rtl', rowCount = 1000, tableOptions: Partial<TableOptionsIf> = {}) {
  const clicked: GeMouseEvent[] = [];
  const dragging: GeMouseEvent[] = [];
  const draggingEnd: GeMouseEvent[] = [];
  const listener = new EventAdapter();
  listener.onMouseClicked = e => clicked.push(e);
  listener.onMouseDragging = e => dragging.push(e);
  listener.onMouseDraggingEnd = e => draggingEnd.push(e);
  const rows = createRows(rowCount);
  const model = TableFactory.createTableModel({
    rows,
    columnDefs: ['id', 'name', 'value'].map(p => ColumnDef.create({ property: p, headerLabel: p, width: px100 })),
  });
  const table = mountTable(model, { eventListener: listener, tableOptions: { direction, ...tableOptions } });
  await nextFrame();
  const focus = () => table.scope.focusModel()?.getFocus();
  return { ...table, rows, clicked, dragging, draggingEnd, focus };
}

/** Body cell (center) of a row/column. */
function bodyCell(host: HTMLElement, row: number, col: number) {
  return getCellDiv(host, 'body', 'center', row, col);
}

/** Waits until the click handling of the last mouseup is through (native click or the handler's own report). */
async function settle() {
  await new Promise(resolve => setTimeout(resolve, 20));
  await nextFrame();
}

describe.each(DIRECTIONS)('a click survives a render through the API (%s)', direction => {

  it('without a render: exactly one mouseClicked (the native click), focus on the cell', async () => {
    const t = await mountClickTable(direction);
    await realMouse.moveTo(bodyCell(t.host, 3, 1));
    await realMouse.click();
    await settle();
    expect(t.clicked.map(e => [e.rowIndex, e.columnIndex, e.clickCount])).toEqual([[3, 1, 1]]);
    expect(t.focus()).toEqual([3, 1]);
  });

  it('api.repaint() between mousedown and mouseup: one mouseClicked for the pressed cell, focus on it', async () => {
    const t = await mountClickTable(direction);
    const cell = bodyCell(t.host, 4, 2);
    await realMouse.moveTo(cell);
    await realMouse.down();
    t.api.repaint();
    expect(cell.isConnected).toBe(false); // the render replaced the pressed cell – no native click
    await realMouse.up();
    await settle();
    expect(t.clicked.map(e => [e.rowIndex, e.columnIndex, e.clickCount, e.areaIdent])).toEqual([[4, 2, 1, 'body']]);
    expect(t.clicked[0].sideIdent).toBe('center');
    expect(t.focus()).toEqual([4, 2]);
  });

  it('repaintHard({ py }) between mousedown and mouseup', async () => {
    const t = await mountClickTable(direction);
    await realMouse.moveTo(bodyCell(t.host, 5, 0));
    await realMouse.down();
    t.api.repaintHard({ py: 0 });
    await realMouse.up();
    await settle();
    expect(t.clicked.map(e => [e.rowIndex, e.columnIndex])).toEqual([[5, 0]]);
    expect(t.focus()).toEqual([5, 0]);
  });

  it('scrollToPixel() between mousedown and mouseup (content does not move)', async () => {
    const t = await mountClickTable(direction);
    await realMouse.moveTo(bodyCell(t.host, 2, 1));
    await realMouse.down();
    t.api.scrollToPixel(0, 0);
    t.api.repaint();
    await realMouse.up();
    await settle();
    expect(t.clicked.map(e => [e.rowIndex, e.columnIndex])).toEqual([[2, 1]]);
  });

  it('rows appended + repaintHard() between mousedown and mouseup', async () => {
    const t = await mountClickTable(direction, 100);
    await realMouse.moveTo(bodyCell(t.host, 6, 1));
    await realMouse.down();
    t.api.addRows(createRows(50).map(r => ({ ...r, id: r.id + 100 })));
    t.api.repaintHard();
    await realMouse.up();
    await settle();
    expect(t.clicked.map(e => [e.rowIndex, e.columnIndex])).toEqual([[6, 1]]);
    expect(t.focus()).toEqual([6, 1]);
  });

  it('follow ("tail -f"): the content slides under the pointer – the click goes to the PRESSED row', async () => {
    const t = await mountClickTable(direction, 1000);
    t.api.repaintHard({ py: Number.MAX_SAFE_INTEGER });
    await nextFrame();
    const lastIndex = 999;
    const cell = bodyCell(t.host, lastIndex - 2, 1);
    await realMouse.moveTo(cell);
    await realMouse.down();
    t.api.addRows(createRows(5).map(r => ({ ...r, id: r.id + 1000 })));
    t.api.repaintHard({ py: Number.MAX_SAFE_INTEGER }); // follow: the rows move up by 5
    await realMouse.up(); // same screen point – a different row is under the pointer now
    await settle();
    expect(t.clicked.map(e => [e.rowIndex, e.columnIndex])).toEqual([[lastIndex - 2, 1]]);
    expect(t.focus()).toEqual([lastIndex - 2, 1]);
  });

  it('a double click with a render between the two clicks: clickCount 2 exactly once', async () => {
    const t = await mountClickTable(direction);
    await realMouse.moveTo(bodyCell(t.host, 7, 1));
    await realMouse.click(1);
    t.api.repaint();
    await realMouse.click(2);
    await settle();
    expect(t.clicked.map(e => [e.rowIndex, e.clickCount])).toEqual([[7, 1], [7, 2]]);
  });

  it('a double click with a render while the second click is pressed: clickCount 2 exactly once', async () => {
    const t = await mountClickTable(direction);
    await realMouse.moveTo(bodyCell(t.host, 8, 1));
    await realMouse.click(1);
    await realMouse.down(2);
    t.api.repaint();
    await realMouse.up(2);
    await settle();
    expect(t.clicked.map(e => [e.rowIndex, e.clickCount])).toEqual([[8, 1], [8, 2]]);
  });

  it('a double click on an editable cell opens the editor although the second press was rendered over', async () => {
    const clicked: GeMouseEvent[] = [];
    const listener = new EventAdapter();
    listener.onMouseClicked = e => clicked.push(e);
    const model = TableFactory.createTableModel({
      rows: createRows(100),
      columnDefs: ['id', 'name'].map(p => ColumnDef.create({ property: p, headerLabel: p, width: px100, editable: () => true })),
    });
    const t = mountTable(model, { eventListener: listener, tableOptions: { direction } });
    await nextFrame();
    await realMouse.moveTo(bodyCell(t.host, 3, 1));
    await realMouse.click(1);
    await realMouse.down(2);
    t.api.repaint();
    await realMouse.up(2);
    await settle();
    expect(t.api.isEditing()).toBe(true);
    expect(clicked.map(e => e.clickCount)).toEqual([1, 2]);
  });

  it('dragging beyond the threshold with a render: no click, dragging events as before', async () => {
    const t = await mountClickTable(direction);
    const cell = bodyCell(t.host, 3, 1);
    await realMouse.moveTo(cell);
    await realMouse.down();
    t.api.repaint();
    await realMouse.moveTo(cell, 0, 40);
    await nextFrame();
    await realMouse.up();
    await settle();
    expect(t.clicked).toEqual([]);
    expect(t.dragging.length).toBeGreaterThan(0);
    expect(t.draggingEnd.length).toBe(1);
  });

  it('a click in the header with a render while pressed is reported for the header cell', async () => {
    const t = await mountClickTable(direction);
    const header = getCellDiv(t.host, 'header', 'center', 0, 1);
    await realMouse.moveTo(header);
    await realMouse.down();
    t.api.repaint();
    await realMouse.up();
    await settle();
    expect(t.clicked.map(e => [e.areaIdent, e.rowIndex, e.columnIndex])).toEqual([['header', 0, 1]]);
  });

  it('several renders while pressed and an unchanged pointer: still one click', async () => {
    const t = await mountClickTable(direction);
    await realMouse.moveTo(bodyCell(t.host, 9, 2));
    await realMouse.down();
    for (let i = 0; i < 5; i++) {
      t.api.repaintHard();
      await nextFrame();
    }
    await realMouse.up();
    await settle();
    expect(t.clicked.map(e => [e.rowIndex, e.columnIndex])).toEqual([[9, 2]]);
  });

  it('the pressed row was removed during the press: no click for a different row', async () => {
    const t = await mountClickTable(direction, 20);
    await realMouse.moveTo(bodyCell(t.host, 2, 1));
    await realMouse.down();
    t.api.setRows(createRows(20).map(r => ({ ...r }))); // all new objects: the pressed row is gone
    t.api.repaintHard();
    await realMouse.up();
    await settle();
    expect(t.clicked).toEqual([]);
  });
});
