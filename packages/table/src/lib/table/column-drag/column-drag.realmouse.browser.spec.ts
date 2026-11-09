// Prompt 022: dragging columns – events (part A), locks per column (part B), double click on the resize handle (part C).
//
// REAL mouse input (Playwright page.mouse through test-utils/real-mouse.ts): the browser decides about click/dblclick,
// and the column drag runs through the MouseHandler frames like for a user. `pnpm test:browser:webkit` runs this file
// in WebKit too.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { ColumnDef, EventAdapter, RowNumberColumnDef, TableFactory, TrueFn, px100, px120 } from '@guiexpert/table';
import type {
  ColumnAutoWidthContextIf, ColumnDefIf, GeColumnMoveEvent, GeColumnResizeEvent, TableApi, TableOptionsIf,
} from '@guiexpert/table';
import { destroyAllTables, DIRECTIONS, getCellDiv, mountTable, nextFrame } from '../../../../test-utils/mount-table';
import { realMouse } from '../../../../test-utils/real-mouse';
import { axeViolations } from '../../../../test-utils/axe';

afterEach(async () => {
  destroyAllTables();
  vi.restoreAllMocks();
  await realMouse.move(0, 0);
});

type Direction = typeof DIRECTIONS[number];
const PROPS = ['a', 'b', 'c', 'd', 'e'];

interface DragRow { a: string; b: string; c: string; d: string; e: string; }

function createDragRows(count: number): DragRow[] {
  return Array.from({ length: count }, (_, i) => ({ a: `a${i}`, b: `b${i}`, c: `c${i}`, d: `d${i}`, e: `e${i}` }));
}

interface MountDragOpts {
  direction?: Direction;
  columnDefs?: ColumnDefIf[];
  rows?: DragRow[];
  fixedLeft?: number;
  fixedRight?: number;
  tableOptions?: Partial<TableOptionsIf>;
}

/** a | b | c | d | e (100 px each, sortable), records the column events and what the API says inside the handlers. */
async function mountDragTable(opts: MountDragOpts = {}) {
  const resizeStart: GeColumnResizeEvent[] = [];
  const resizeEnd: GeColumnResizeEvent[] = [];
  const moveStart: GeColumnMoveEvent[] = [];
  const moveEnd: GeColumnMoveEvent[] = [];
  const widthInEndHandler: number[] = [];
  const orderInEndHandler: string[][] = [];
  const draggingInStartHandler: boolean[] = [];
  const listener = new EventAdapter();
  let api: TableApi | undefined;
  listener.onColumnResizeStart = e => { resizeStart.push(e); draggingInStartHandler.push(api!.isColumnDragging()); };
  listener.onColumnResizeEnd = e => { resizeEnd.push(e); widthInEndHandler.push(api!.getTableModel().getColumnWidth(e.columnIndex)); };
  listener.onColumnMoveStart = e => { moveStart.push(e); draggingInStartHandler.push(api!.isColumnDragging()); };
  listener.onColumnMoveEnd = e => { moveEnd.push(e); orderInEndHandler.push(api!.getTableModel().getColumnDefs()!.map(d => d.property)); };
  const columnDefs = opts.columnDefs ?? PROPS.map(p => ColumnDef.create({ property: p, headerLabel: p.toUpperCase(), width: px100, sortable: TrueFn }));
  const rows = opts.rows ?? createDragRows(100);
  const model = TableFactory.createTableModel({
    rows, columnDefs, fixedLeftColumnCount: opts.fixedLeft ?? 0, fixedRightColumnCount: opts.fixedRight ?? 0,
  });
  const table = mountTable(model, {
    eventListener: listener, width: 800,
    tableOptions: { direction: opts.direction ?? 'ltr', ...(opts.tableOptions ?? {}) },
  });
  api = table.api;
  await nextFrame();
  const order = () => model.getColumnDefs()!.map(d => d.property);
  return { ...table, model, rows, resizeStart, resizeEnd, moveStart, moveEnd, widthInEndHandler, orderInEndHandler, draggingInStartHandler, order };
}

/** The side (west/center/east) a column is rendered in. */
function sideOf(model: { getFixedLeftColumnCount(): number; getFixedRightColumnCount(): number; getColumnCount(): number }, c: number) {
  if (c < model.getFixedLeftColumnCount()) return 'west' as const;
  if (c >= model.getColumnCount() - model.getFixedRightColumnCount()) return 'east' as const;
  return 'center' as const;
}

function handleOf(host: HTMLElement, c: number): HTMLElement | null {
  return host.querySelector<HTMLElement>(`.ge-table-column-resize-handle[data-col-index="${c}"]`);
}

function headerCell(t: { host: HTMLElement; model: Parameters<typeof sideOf>[0] }, c: number): HTMLElement {
  return getCellDiv(t.host, 'header', sideOf(t.model, c), 0, c);
}

function centre(element: Element): { x: number; y: number } {
  const r = element.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

/**
 * Presses at (x, y), moves to (x2, y2) in two halves (a frame in between, `between` runs there) and releases.
 * Waits until the end of the drag is handled (it runs in the next animation frame).
 */
async function dragFromTo(x: number, y: number, x2: number, y2: number, between?: () => void | Promise<void>) {
  await realMouse.move(x, y);
  await realMouse.down();
  await realMouse.move((x + x2) / 2, (y + y2) / 2, 3);
  await nextFrame();
  if (between) {
    await between();
    await nextFrame();
  }
  await realMouse.move(x2, y2, 3);
  await nextFrame();
  await realMouse.up();
  await nextFrame();
}

async function dragBy(element: Element, dx: number, between?: () => void | Promise<void>) {
  const { x, y } = centre(element);
  await dragFromTo(x, y, x + dx, y, between);
}

async function dragOnto(element: Element, target: Element, between?: () => void | Promise<void>) {
  const from = centre(element);
  const to = centre(target);
  await dragFromTo(from.x, from.y, to.x, to.y, between);
}

async function doubleClick(element: Element) {
  await realMouse.moveTo(element);
  await realMouse.click(1);
  await realMouse.click(2);
  await new Promise(resolve => setTimeout(resolve, 20));
  await nextFrame();
}

describe.each(DIRECTIONS)('column drag events (%s)', direction => {
  const wider = direction === 'rtl' ? -1 : 1; // right-to-left: the handle is on the left edge

  it('resizing: one start, one end with old and new width – the API already has the new width in the end handler', async () => {
    const t = await mountDragTable({ direction });
    await dragBy(handleOf(t.host, 1)!, 60 * wider);
    expect(t.resizeStart).toHaveLength(1);
    expect(t.resizeEnd).toHaveLength(1);
    expect(t.resizeStart[0]).toMatchObject({ type: 'start', source: 'mouse', columnIndex: 1, property: 'b', oldWidth: 100, newWidth: 100 });
    expect(t.resizeStart[0].columnDef?.property).toBe('b');
    expect(t.resizeEnd[0]).toMatchObject({ type: 'end', source: 'mouse', columnIndex: 1, property: 'b', oldWidth: 100, newWidth: 160 });
    expect(t.widthInEndHandler).toEqual([160]);
    expect(t.draggingInStartHandler).toEqual([true]);
    expect(t.api.isColumnDragging()).toBe(false);
    expect(t.moveStart).toHaveLength(0);
  });

  it('moving over three columns: one start, one end with from/to index and the new order – no events in between', async () => {
    const t = await mountDragTable({ direction });
    const spy = vi.spyOn(t.model, 'changeColumnOrder');
    await dragOnto(headerCell(t, 0), headerCell(t, 3));
    // the column is moved while dragging (step by step in Chromium; WebKit may coalesce the moves into one frame)
    expect(spy.mock.calls.length).toBeGreaterThan(0);
    expect(t.moveStart).toHaveLength(1);
    expect(t.moveEnd).toHaveLength(1);
    expect(t.moveStart[0]).toMatchObject({ type: 'start', fromIndex: 0, toIndex: 0, property: 'a' });
    expect(t.moveStart[0].columnOrder).toEqual(PROPS);
    expect(t.moveEnd[0]).toMatchObject({ type: 'end', fromIndex: 0, toIndex: 3, property: 'a', moved: true });
    expect(t.moveEnd[0].columnOrder).toEqual(['b', 'c', 'd', 'a', 'e']);
    expect(t.orderInEndHandler).toEqual([['b', 'c', 'd', 'a', 'e']]);
    expect(t.resizeStart).toHaveLength(0);
  });

  it('a mouseup outside of the table ends a resize and reports the end', async () => {
    const t = await mountDragTable({ direction });
    const { x, y } = centre(handleOf(t.host, 0)!);
    const outsideY = t.host.getBoundingClientRect().bottom + 40;
    await dragFromTo(x, y, x + 50 * wider, outsideY);
    expect(t.resizeEnd.map(e => [e.type, e.newWidth])).toEqual([['end', 150]]);
    expect(t.model.getColumnWidth(0)).toBe(150);
  });

  it('a mouseup outside of the table ends a move and reports the end', async () => {
    const t = await mountDragTable({ direction });
    const to = centre(headerCell(t, 2));
    const from = centre(headerCell(t, 0));
    await realMouse.move(from.x, from.y);
    await realMouse.down();
    await realMouse.move(to.x, to.y, 4);
    await nextFrame();
    await realMouse.move(to.x, t.host.getBoundingClientRect().bottom + 40, 2);
    await nextFrame();
    await realMouse.up();
    await nextFrame();
    expect(t.moveEnd).toHaveLength(1);
    expect(t.moveEnd[0]).toMatchObject({ type: 'end', fromIndex: 0, toIndex: 2 });
    expect(t.order()).toEqual(['b', 'c', 'a', 'd', 'e']);
    expect(t.host.querySelector<HTMLElement>('.ge-table-dragging-column')!.style.display).toBe('none');
  });

  it('Escape cancels a resize: the old width comes back, the end has type "cancel"', async () => {
    const t = await mountDragTable({ direction });
    const { x, y } = centre(handleOf(t.host, 1)!);
    await realMouse.move(x, y);
    await realMouse.down();
    await realMouse.move(x + 70 * wider, y, 4);
    await nextFrame();
    expect(t.model.getColumnWidth(1)).toBe(170);
    await userEvent.keyboard('{Escape}');
    expect(t.resizeEnd.map(e => [e.type, e.oldWidth, e.newWidth])).toEqual([['cancel', 100, 100]]);
    expect(t.model.getColumnWidth(1)).toBe(100);
    expect(t.api.isColumnDragging()).toBe(false);
    // the rest of this drag does nothing
    await realMouse.move(x + 120 * wider, y, 2);
    await nextFrame();
    await realMouse.up();
    await nextFrame();
    expect(t.model.getColumnWidth(1)).toBe(100);
    expect(t.resizeStart).toHaveLength(1);
    expect(t.resizeEnd).toHaveLength(1);
  });

  it('Escape cancels a move: the old order comes back', async () => {
    const t = await mountDragTable({ direction });
    const from = centre(headerCell(t, 0));
    const to = centre(headerCell(t, 3));
    await realMouse.move(from.x, from.y);
    await realMouse.down();
    await realMouse.move(to.x, to.y, 4);
    await nextFrame();
    expect(t.order()).not.toEqual(PROPS);
    await userEvent.keyboard('{Escape}');
    await nextFrame();
    expect(t.order()).toEqual(PROPS);
    expect(t.moveEnd.map(e => [e.type, e.fromIndex, e.toIndex, e.moved])).toEqual([['cancel', 0, 0, false]]);
    expect(t.host.querySelector<HTMLElement>('.ge-table-dragging-column')!.style.display).toBe('none');
    await realMouse.up();
    await nextFrame();
    expect(t.order()).toEqual(PROPS);
    expect(t.moveEnd).toHaveLength(1);
  });

  it('tableApi.cancelColumnDrag() cancels like Escape', async () => {
    const t = await mountDragTable({ direction });
    const { x, y } = centre(handleOf(t.host, 0)!);
    await realMouse.move(x, y);
    await realMouse.down();
    await realMouse.move(x + 40 * wider, y, 4);
    await nextFrame();
    expect(t.api.isColumnDragging()).toBe(true);
    t.api.cancelColumnDrag();
    expect(t.model.getColumnWidth(0)).toBe(100);
    expect(t.resizeEnd.map(e => e.type)).toEqual(['cancel']);
    await realMouse.up();
    await nextFrame();
    expect(t.resizeEnd).toHaveLength(1);
  });

  it('a press that moves less than 4 px is no drag: no events, nothing changes', async () => {
    const t = await mountDragTable({ direction });
    await dragBy(handleOf(t.host, 1)!, 2 * wider);
    await dragBy(headerCell(t, 1), 3);
    expect(t.model.getColumnWidth(1)).toBe(100);
    expect(t.order()).toEqual(PROPS);
    expect([t.resizeStart, t.resizeEnd, t.moveStart, t.moveEnd].map(a => a.length)).toEqual([0, 0, 0, 0]);
  });

  it('API calls report no column events', async () => {
    const t = await mountDragTable({ direction });
    t.api.setColumnWidth(0, 180);
    const state = t.api.getState(['columns']);
    state.columns = [...state.columns!].reverse();
    t.api.applyState(state, ['columns']);
    t.api.autoResizeColumns();
    t.api.autoResizeColumn('b');
    await nextFrame();
    expect([t.resizeStart, t.resizeEnd, t.moveStart, t.moveEnd].map(a => a.length)).toEqual([0, 0, 0, 0]);
  });

  it('the application renders while a column is resized (repaintHard, appendRows): result and events stay right', async () => {
    const t = await mountDragTable({ direction });
    await dragBy(handleOf(t.host, 2)!, 50 * wider, async () => {
      t.api.repaintHard({ py: 0 });
      t.api.appendRows(createDragRows(5));
      t.api.repaint();
    });
    expect(t.resizeStart).toHaveLength(1);
    expect(t.resizeEnd.map(e => [e.columnIndex, e.newWidth])).toEqual([[2, 150]]);
    expect(t.model.getColumnWidth(2)).toBe(150);
  });

  it('the application renders while a column is moved: the ghost stays, the order is right', async () => {
    const t = await mountDragTable({ direction });
    let ghostShown = false;
    await dragOnto(headerCell(t, 0), headerCell(t, 2), async () => {
      t.api.repaintHard({ py: 0 });
      t.api.appendRows(createDragRows(5));
      await nextFrame();
      ghostShown = t.host.querySelector<HTMLElement>('.ge-table-dragging-column')!.style.display === 'block';
    });
    expect(ghostShown).toBe(true);
    expect(t.moveStart).toHaveLength(1);
    expect(t.moveEnd).toHaveLength(1);
    expect(t.order()).toEqual(['b', 'c', 'a', 'd', 'e']);
  });

  // BUG (found in prompt 022): the start of a column drag was only reset at the end of a drag. A click on a handle
  // (no movement) left it set, and the next drag in the body resized that column instead of selecting.
  it('a click on a resize handle, then a drag in the body: no column changes', async () => {
    const t = await mountDragTable({ direction });
    await realMouse.moveTo(handleOf(t.host, 1)!);
    await realMouse.click();
    await nextFrame();
    const from = getCellDiv(t.host, 'body', 'center', 2, 0);
    const to = getCellDiv(t.host, 'body', 'center', 5, 3);
    await dragOnto(from, to);
    expect(PROPS.map((_, c) => t.model.getColumnWidth(c))).toEqual([100, 100, 100, 100, 100]);
    expect(t.order()).toEqual(PROPS);
    expect(t.resizeStart).toHaveLength(0);
  });
});

describe.each(DIRECTIONS)('locks per column (%s)', direction => {

  function lockedDefs(locks: { [property: string]: Partial<Pick<ColumnDefIf, 'resizable' | 'movable'>> }): ColumnDefIf[] {
    return PROPS.map(p => ColumnDef.create({ property: p, headerLabel: p.toUpperCase(), width: px100, ...(locks[p] ?? {}) }));
  }

  it('resizable: false – no resize handle for this column, the others keep theirs', async () => {
    const t = await mountDragTable({ direction, columnDefs: lockedDefs({ b: { resizable: false } }) });
    expect(handleOf(t.host, 1)).toBeNull();
    expect(handleOf(t.host, 0)).not.toBeNull();
    expect(handleOf(t.host, 2)).not.toBeNull();
    expect(ColumnDef.create({ property: 'x', resizable: false }).resizable).toBe(false);
  });

  it('movable: false – the header is not draggable, dragging it does nothing', async () => {
    const t = await mountDragTable({ direction, columnDefs: lockedDefs({ b: { movable: false } }) });
    expect(headerCell(t, 1).getAttribute('data-ge-action')).toBeNull();
    expect(headerCell(t, 2).getAttribute('data-ge-action')).toBe('drag-column');
    await dragOnto(headerCell(t, 1), headerCell(t, 3));
    expect(t.order()).toEqual(PROPS);
    expect(t.moveStart).toHaveLength(0);
  });

  it('a leading locked column: no column can be dropped in front of it', async () => {
    const t = await mountDragTable({ direction, columnDefs: lockedDefs({ a: { movable: false, resizable: false } }) });
    await dragOnto(headerCell(t, 3), headerCell(t, 0));
    expect(t.order()).toEqual(['a', 'd', 'b', 'c', 'e']);
    expect(t.moveEnd[0]).toMatchObject({ fromIndex: 3, toIndex: 1 });
  });

  it('a locked column in the middle keeps its place when another column is moved past it', async () => {
    const t = await mountDragTable({ direction, columnDefs: lockedDefs({ c: { movable: false } }) });
    await dragOnto(headerCell(t, 0), headerCell(t, 4));
    expect(t.order()).toEqual(['b', 'd', 'c', 'e', 'a']);
    expect(t.moveEnd[0]).toMatchObject({ fromIndex: 0, toIndex: 4 });
    await dragOnto(headerCell(t, 4), headerCell(t, 0));
    expect(t.order()).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  it('a mouse that jumps onto a locked column in one frame: the column moves as far as it can (no frame dependence)', async () => {
    const t = await mountDragTable({ direction, columnDefs: lockedDefs({ a: { movable: false } }) });
    const from = centre(headerCell(t, 4));
    const to = centre(headerCell(t, 0));
    await realMouse.move(from.x, from.y);
    await realMouse.down();
    await realMouse.move(to.x, to.y, 1);   // one step: no frame over the columns in between
    await nextFrame();
    await realMouse.up();
    await nextFrame();
    expect(t.order()).toEqual(['a', 'e', 'b', 'c', 'd']);
    expect(t.moveEnd[0]).toMatchObject({ fromIndex: 4, toIndex: 1 });
  });

  it('dropping onto a locked column does not move', async () => {
    const t = await mountDragTable({ direction, columnDefs: lockedDefs({ c: { movable: false } }) });
    await dragOnto(headerCell(t, 3), headerCell(t, 2));
    expect(t.order()).toEqual(PROPS);
    expect(t.moveEnd[0]).toMatchObject({ type: 'end', fromIndex: 3, toIndex: 3, moved: false });
  });

  it('a column stays in its area: no move across the border of fixed columns', async () => {
    const t = await mountDragTable({ direction, fixedLeft: 1, fixedRight: 1 });
    await dragOnto(headerCell(t, 1), headerCell(t, 0));   // center → west
    expect(t.order()).toEqual(PROPS);
    await dragOnto(headerCell(t, 0), headerCell(t, 2));   // west → center
    expect(t.order()).toEqual(PROPS);
    await dragOnto(headerCell(t, 1), headerCell(t, 4));   // center → east: the last center place
    expect(t.order()).toEqual(['a', 'c', 'd', 'b', 'e']);
  });

  it('applyState with another order keeps locked columns in their place', async () => {
    const t = await mountDragTable({ direction, columnDefs: lockedDefs({ a: { movable: false }, c: { movable: false } }) });
    t.api.applyState({ version: 1, columns: ['e', 'c', 'd', 'a', 'b'].map(property => ({ property })) }, ['columns']);
    await nextFrame();
    expect(t.order()).toEqual(['a', 'e', 'c', 'd', 'b']);
  });

  it('RowNumberColumnDef: locked by its flags', async () => {
    const def = new RowNumberColumnDef();
    expect([def.resizable, def.movable]).toEqual([false, false]);
  });

  it('locked columns: no axe violations', async () => {
    const t = await mountDragTable({ direction, columnDefs: lockedDefs({ a: { movable: false, resizable: false } }) });
    expect(await axeViolations(t.host)).toEqual([]);
  });
});

describe.each(DIRECTIONS)('double click on the resize handle (%s)', direction => {

  function longRows(count: number, longAt: number, text = 'a very very long text that does not fit') {
    const rows = createDragRows(count);
    rows[longAt].b = text;
    return rows;
  }

  it('fits the width to the content, reports start and end with source "dblclick" and does not sort', async () => {
    const t = await mountDragTable({ direction, rows: longRows(50, 3) });
    const expected = t.scope.calcAutoColumnWidths()[1];
    expect(expected).toBeGreaterThan(150);
    await doubleClick(handleOf(t.host, 1)!);
    expect(t.model.getColumnWidth(1)).toBe(expected);
    expect(t.resizeStart.map(e => [e.type, e.source])).toEqual([['start', 'dblclick']]);
    expect(t.resizeEnd.map(e => [e.type, e.source, e.oldWidth, e.newWidth])).toEqual([['end', 'dblclick', 100, expected]]);
    expect(t.model.getColumnDef(1)!.sortState).toBeFalsy();
    expect(getCellDiv(t.host, 'body', 'center', 0, 0).textContent).toBe('a0'); // unsorted
  });

  it('respects maxWidth', async () => {
    const columnDefs = PROPS.map(p => ColumnDef.create({ property: p, width: px100, maxWidth: p === 'b' ? px120 : undefined }));
    const t = await mountDragTable({ direction, columnDefs, rows: longRows(50, 3) });
    await doubleClick(handleOf(t.host, 1)!);
    expect(t.model.getColumnWidth(1)).toBe(120);
  });

  it('columnAutoWidth.getWidth wins over the default measurement', async () => {
    const contexts: ColumnAutoWidthContextIf[] = [];
    const defaults: number[] = [];
    const t = await mountDragTable({
      direction, rows: longRows(50, 3),
      tableOptions: {
        columnAutoWidth: {
          getWidth: ctx => {
            contexts.push(ctx);
            defaults.push(ctx.getDefaultWidth());
            return ctx.property === 'b' ? 222 : undefined;
          },
        },
      },
    });
    const expected = t.scope.calcAutoColumnWidths()[1];
    await doubleClick(handleOf(t.host, 1)!);
    expect(t.model.getColumnWidth(1)).toBe(222);
    expect(contexts[0]).toMatchObject({ columnIndex: 1, property: 'b', source: 'dblclick' });
    expect(defaults[0]).toBe(expected);
    expect(contexts[0].measureText('')).toBeGreaterThan(0); // the cell padding
    expect(contexts[0].measureText('WWWWWWWWWW')).toBeGreaterThan(contexts[0].measureText('i'));
    // undefined = default
    await doubleClick(handleOf(t.host, 2)!);
    expect(t.model.getColumnWidth(2)).toBe(t.scope.calcAutoColumnWidths()[2]);
  });

  it('columnAutoWidth.doubleClick = false: nothing happens (and nothing is sorted)', async () => {
    const t = await mountDragTable({ direction, rows: longRows(50, 3), tableOptions: { columnAutoWidth: { doubleClick: false } } });
    await doubleClick(handleOf(t.host, 1)!);
    expect(t.model.getColumnWidth(1)).toBe(100);
    expect(t.resizeEnd).toHaveLength(0);
    expect(t.model.getColumnDef(1)!.sortState).toBeFalsy();
  });
});

describe('tableApi.autoResizeColumn', () => {

  function rowsWithLongText(count: number, at: number) {
    const rows = createDragRows(count);
    rows[at].b = 'a very very very very long text far down in the table';
    return rows;
  }

  it('fits one column (index, property or ColumnDef) and returns the width', async () => {
    const t = await mountDragTable({ rows: rowsWithLongText(50, 10) });
    const expected = t.scope.calcAutoColumnWidths()[1];
    expect(t.api.autoResizeColumn(1)).toBe(expected);
    t.api.setColumnWidth(1, 100);
    expect(t.api.autoResizeColumn('b')).toBe(expected);
    t.api.setColumnWidth(1, 100);
    expect(t.api.autoResizeColumn(t.model.getColumnDef(1)!)).toBe(expected);
    expect(t.model.getColumnWidth(1)).toBe(expected);
    expect(t.model.getColumnWidth(0)).toBe(100); // the others stay
    expect(t.api.autoResizeColumn('unknown')).toBeUndefined();
  });

  it('resizable: false – not resized (autoResizeColumn and autoResizeColumns), setColumnWidth still works', async () => {
    const columnDefs = PROPS.map(p => ColumnDef.create({ property: p, width: px100, resizable: p !== 'b' }));
    const t = await mountDragTable({ columnDefs, rows: rowsWithLongText(50, 10) });
    expect(t.api.autoResizeColumn('b')).toBeUndefined();
    t.api.autoResizeColumns();
    expect(t.model.getColumnWidth(1)).toBe(100);
    t.api.setColumnWidth(1, 130);
    expect(t.model.getColumnWidth(1)).toBe(130);
  });

  it('up to maxRows (10 000) all body rows are measured', async () => {
    const t = await mountDragTable({ rows: rowsWithLongText(5_000, 4_000) });
    expect(t.api.autoResizeColumn('b')!).toBeGreaterThan(250);
  });

  it('above maxRows only the rendered rows are measured – scrolled there, the long text counts', async () => {
    const t = await mountDragTable({ rows: rowsWithLongText(20_000, 15_000) });
    expect(t.api.autoResizeColumn('b')!).toBeLessThan(150);
    t.api.scrollToIndex(0, 14_995);
    await nextFrame();
    expect(t.api.autoResizeColumn('b')!).toBeGreaterThan(250);
  });

  it('columnAutoWidth.maxRows lowers the limit', async () => {
    const t = await mountDragTable({ rows: rowsWithLongText(500, 400), tableOptions: { columnAutoWidth: { maxRows: 100 } } });
    expect(t.api.autoResizeColumn('b')!).toBeLessThan(150);
  });

  it('getWidth gets source "api" and its value is limited by minWidth/maxWidth', async () => {
    const sources: string[] = [];
    const columnDefs = PROPS.map(p => ColumnDef.create({ property: p, width: px100, maxWidth: px120 }));
    const t = await mountDragTable({
      columnDefs, tableOptions: { columnAutoWidth: { getWidth: ctx => { sources.push(ctx.source); return 500; } } },
    });
    expect(t.api.autoResizeColumn('a')).toBe(120);
    expect(sources).toEqual(['api']);
  });
});

describe('review findings (prompt 022)', () => {

  /** mousedown, mousemove, mouseup in ONE task: the end frame runs before any drag frame. */
  function dragInOneTask(host: HTMLElement, from: Element, to: Element) {
    const fire = (target: EventTarget, type: string, el: Element) => {
      const { x, y } = centre(el);
      target.dispatchEvent(new MouseEvent(type, { clientX: x, clientY: y, bubbles: true, cancelable: true, button: 0 }));
    };
    fire(from, 'mousedown', from);
    fire(to, 'mousemove', to);
    fire(to, 'mouseup', to);
    // the next press flushes the end of this drag before its drag frame ran (a busy machine, MouseHandler.flushDraggingEnd)
    const body = host.querySelector('.ge-table-body-center .ge-table-col-div')!;
    fire(body, 'mousedown', body);
    fire(body, 'mouseup', body);
  }

  it('a table without column definitions (bodyData): move with events, Escape restores the order', async () => {
    const ends: GeColumnMoveEvent[] = [];
    const listener = new EventAdapter();
    listener.onColumnMoveEnd = e => ends.push(e);
    const model = TableFactory.createTableModel({
      headerData: [['A', 'B', 'C']],
      bodyData: [['a0', 'b0', 'c0'], ['a1', 'b1', 'c1']],
    });
    const { host } = mountTable(model, { eventListener: listener });
    await nextFrame();
    const header = (c: number) => getCellDiv(host, 'header', 'center', 0, c);
    await dragOnto(header(0), header(2));
    expect(ends.map(e => [e.type, e.fromIndex, e.toIndex])).toEqual([['end', 0, 2]]);
    expect(getCellDiv(host, 'header', 'center', 0, 2).textContent).toBe('A');
    expect(model.getColumnDefs()).toHaveLength(0); // no undefined entries pushed into the empty list

    const from = centre(header(0));
    const to = centre(header(2));
    await realMouse.move(from.x, from.y);
    await realMouse.down();
    await realMouse.move(to.x, to.y, 4);
    await nextFrame();
    await userEvent.keyboard('{Escape}');
    await realMouse.up();
    await nextFrame();
    expect(['A', 'B', 'C'].map((_, c) => getCellDiv(host, 'header', 'center', 0, c).textContent)).toEqual(['B', 'C', 'A']);
    expect(ends.map(e => e.type)).toEqual(['end', 'cancel']);
  });

  it('cancelColumnDrag() in the start handler: nothing changes, start + cancel only', async () => {
    const t = await mountDragTable();
    const types: string[] = [];
    const unsubscribe = t.api.subscribe({
      onColumnResizeStart: () => { types.push('start'); t.api.cancelColumnDrag(); },
      onColumnResizeEnd: e => types.push(e.type),
      onColumnMoveStart: () => { types.push('move-start'); t.api.cancelColumnDrag(); },
      onColumnMoveEnd: e => types.push('move-' + e.type),
    });
    await dragBy(handleOf(t.host, 1)!, 60);
    expect(t.model.getColumnWidth(1)).toBe(100);
    await dragOnto(headerCell(t, 0), headerCell(t, 3));
    expect(t.order()).toEqual(PROPS);
    expect(t.host.querySelector<HTMLElement>('.ge-table-dragging-column')!.style.display).toBe('none');
    expect(types).toEqual(['start', 'cancel', 'move-start', 'move-cancel']);
    unsubscribe();
  });

  it('the end frame runs before any drag frame: the move is applied (like a resize)', async () => {
    const t = await mountDragTable();
    dragInOneTask(t.host, headerCell(t, 0), headerCell(t, 2));
    await nextFrame();
    expect(t.order()).toEqual(['b', 'c', 'a', 'd', 'e']);
    expect(t.moveEnd.map(e => [e.fromIndex, e.toIndex, e.moved])).toEqual([[0, 2, true]]);
  });

  it('row numbers in front: a fast drag onto "#" puts the column first (like before 1.1.110)', async () => {
    const columnDefs = [new RowNumberColumnDef(), ...PROPS.map(p => ColumnDef.create({ property: p, headerLabel: p.toUpperCase(), width: px100 }))];
    const t = await mountDragTable({ columnDefs, fixedLeft: 3 });
    const from = centre(headerCell(t, 2));
    const to = centre(headerCell(t, 0));
    await realMouse.move(from.x, from.y);
    await realMouse.down();
    await realMouse.move(to.x, to.y, 1);
    await nextFrame();
    await realMouse.up();
    await nextFrame();
    expect(t.order()).toEqual(['RowNumberColumn', 'b', 'a', 'c', 'd', 'e']);
  });

  it('isColumnDragging() is true in the handlers of a double click on the handle', async () => {
    const t = await mountDragTable();
    const dragging: boolean[] = [];
    t.api.subscribe({
      onColumnResizeStart: () => dragging.push(t.api.isColumnDragging()),
      onColumnResizeEnd: () => dragging.push(t.api.isColumnDragging()),
    });
    await doubleClick(handleOf(t.host, 1)!);
    expect(dragging).toEqual([true, true]);
    expect(t.api.isColumnDragging()).toBe(false);
  });

  it('autoResizeColumn(s) leave a hidden column hidden', async () => {
    const t = await mountDragTable();
    t.api.setColumnVisible('b', false);
    expect(t.api.autoResizeColumn('b')).toBeUndefined();
    t.api.autoResizeColumns();
    expect(t.api.isColumnVisible('b')).toBe(false);
    expect(t.model.getColumnWidth(1)).toBe(0);
  });
});
