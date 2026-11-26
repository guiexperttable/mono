// Prompt 028: a press whose mouseup never reaches the page – a native drag out of the window (Tauri / Electron
// `startDrag`), an HTML5 drag, `pointercancel`, a system dialog. Before 1.1.119 the table stayed "pressed": no hover,
// range selection and column drags followed the pointer without a button, the next mousedown was ignored and live
// data stopped following.
//
// REAL mouse input (Playwright page.mouse through test-utils/real-mouse.ts): every move after the lost mouseup is a
// real mousemove with `buttons: 0`. `pnpm test:browser:webkit` runs this file in WebKit too (the app that found the
// bug runs in WKWebView).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ColumnDef, EventAdapter, FocusModel, SelectionModel, TableFactory, TrueFn, px100 } from '@guiexpert/table';
import type {
  GeColumnMoveEvent, GeColumnResizeEvent, GeMouseEvent, TableApi, TableOptionsIf,
} from '@guiexpert/table';
import { destroyAllTables, DIRECTIONS, getCellDiv, mountTable, nextFrame } from '../../../test-utils/mount-table';
import { countRenders } from '../../../test-utils/perf-counters';
import { realMouse } from '../../../test-utils/real-mouse';

afterEach(async () => {
  destroyAllTables();
  vi.restoreAllMocks();
  await realMouse.up();          // a test that failed half way must not leave the button down for the next one
  await realMouse.move(0, 0);
});

type Direction = typeof DIRECTIONS[number];
const PROPS = ['a', 'b', 'c', 'd', 'e'];

interface PressRow { a: string; b: string; c: string; d: string; e: string; }

function createPressRows(count: number, offset = 0): PressRow[] {
  return Array.from({ length: count }, (_, k) => {
    const i = k + offset;
    return { a: `a${i}`, b: `b${i}`, c: `c${i}`, d: `d${i}`, e: `e${i}` };
  });
}

interface MountPressOpts {
  direction?: Direction;
  rows?: PressRow[];
  range?: boolean;
  height?: number;
  tableOptions?: Partial<TableOptionsIf>;
  /** called in onMouseDragging (the app starts its native drag there) */
  onDragging?: (api: TableApi) => void;
  /** called in onColumnMoveStart */
  onMoveStart?: (api: TableApi) => void;
}

/** a | b | c | d | e (100 px each, sortable, 800 px wide host) – records the mouse and the column events. */
async function mountPressTable(opts: MountPressOpts = {}) {
  const clicked: GeMouseEvent[] = [];
  const moved: GeMouseEvent[] = [];
  const dragging: GeMouseEvent[] = [];
  const draggingEnd: GeMouseEvent[] = [];
  const resizeStart: GeColumnResizeEvent[] = [];
  const resizeEnd: GeColumnResizeEvent[] = [];
  const moveStart: GeColumnMoveEvent[] = [];
  const moveEnd: GeColumnMoveEvent[] = [];
  let api: TableApi | undefined;
  const listener = new EventAdapter();
  listener.onMouseClicked = e => clicked.push(e);
  listener.onMouseMoved = e => moved.push(e);
  listener.onMouseDragging = e => { dragging.push(e); opts.onDragging?.(api!); };
  listener.onMouseDraggingEnd = e => draggingEnd.push(e);
  listener.onColumnResizeStart = e => resizeStart.push(e);
  listener.onColumnResizeEnd = e => resizeEnd.push(e);
  listener.onColumnMoveStart = e => { moveStart.push(e); opts.onMoveStart?.(api!); };
  listener.onColumnMoveEnd = e => moveEnd.push(e);
  const selectionModel = new SelectionModel(opts.range ? 'range' : 'none', 'multi');
  const focusModel = new FocusModel('cell');
  const rows = opts.rows ?? createPressRows(100);
  const model = TableFactory.createTableModel({
    rows,
    columnDefs: PROPS.map(p => ColumnDef.create({ property: p, headerLabel: p.toUpperCase(), width: px100, sortable: TrueFn })),
  });
  const table = mountTable(model, {
    eventListener: listener, width: 800, height: opts.height ?? 500,
    tableOptions: {
      direction: opts.direction ?? 'ltr',
      getSelectionModel: () => selectionModel, getFocusModel: () => focusModel,
      ...(opts.tableOptions ?? {}),
    },
  });
  api = table.api;
  await nextFrame();
  const order = () => model.getColumnDefs()!.map(d => d.property);
  const widths = () => PROPS.map((_, c) => model.getColumnWidth(c));
  const isDown = () => table.scope.mouseHandler.isButtonDown();
  return {
    ...table, model, rows, selectionModel, focusModel, order, widths, isDown,
    clicked, moved, dragging, draggingEnd, resizeStart, resizeEnd, moveStart, moveEnd,
  };
}

type PressTable = Awaited<ReturnType<typeof mountPressTable>>;

const body = (t: PressTable, row: number, col: number) => getCellDiv(t.host, 'body', 'center', row, col);
const header = (t: PressTable, col: number) => getCellDiv(t.host, 'header', 'center', 0, col);
const handleOf = (t: PressTable, col: number) =>
  t.host.querySelector<HTMLElement>(`.ge-table-column-resize-handle[data-col-index="${col}"]`)!;
const dropZones = (t: PressTable) => t.host.querySelectorAll('.ge-table-drop-zone').length;
const ghostVisible = (t: PressTable) => {
  const ghost = t.host.querySelector<HTMLElement>('.ge-table-dragging-column');
  return !!ghost && ghost.style.display !== 'none' && ghost.style.display !== '';
};

function centre(element: Element): { x: number; y: number } {
  const r = element.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

/**
 * Releases the real button, but the page never sees it: like a native drag that took the mouse (no mouseup at the host
 * and none at the document, no click).
 */
async function loseMouseUp() {
  const swallow = (e: Event) => e.stopImmediatePropagation();
  const types = ['mouseup', 'click', 'dblclick'];
  types.forEach(type => window.addEventListener(type, swallow, { capture: true }));
  try {
    await realMouse.up();
    await new Promise(resolve => setTimeout(resolve, 0));
  } finally {
    types.forEach(type => window.removeEventListener(type, swallow, { capture: true }));
  }
}

/** Presses on `from`, drags to `to` (real moves with the button held), frames run. The button stays down. */
async function pressAndDrag(from: Element, to: Element, steps = 4) {
  const a = centre(from);
  const b = centre(to);
  await realMouse.move(a.x, a.y);
  await realMouse.down();
  await realMouse.move(b.x, b.y, steps);
  await nextFrame();
}

/** Presses on the element and drags by dx (the button stays down). */
async function pressAndDragBy(element: Element, dx: number, steps = 4) {
  const { x, y } = centre(element);
  await realMouse.move(x, y);
  await realMouse.down();
  await realMouse.move(x + dx, y, steps);
  await nextFrame();
}

describe.each(DIRECTIONS)('part A – a press without mouseup ends by itself (%s)', direction => {
  const wider = direction === 'rtl' ? -1 : 1; // right-to-left: the resize handle is on the left edge

  it('1: body press, mouseup lost, the pointer comes back: not pressed any more, hover works, one dragging end, no click', async () => {
    const t = await mountPressTable({ direction });
    await pressAndDrag(body(t, 2, 1), body(t, 5, 2));
    expect(t.isDown()).toBe(true);
    expect(t.dragging.length).toBeGreaterThan(0);
    await loseMouseUp();
    await nextFrame();
    expect(t.isDown()).toBe(true);            // nothing told the table yet (no event at all)
    expect(t.draggingEnd).toHaveLength(0);
    const draggingBefore = t.dragging.length;
    t.moved.length = 0;

    await realMouse.moveTo(body(t, 7, 3));    // the first movement without the button
    await nextFrame();
    expect(t.isDown()).toBe(false);
    expect(t.draggingEnd).toHaveLength(1);
    expect(t.dragging).toHaveLength(draggingBefore);
    // … and it is handled as a normal hover
    expect(t.moved.length).toBeGreaterThan(0);
    expect(t.moved[t.moved.length - 1]).toMatchObject({ areaIdent: 'body', rowIndex: 7, columnIndex: 3 });
    const hoverRow = t.host.querySelector<HTMLElement>('.ge-table-hover-row')!;
    expect(hoverRow.style.display).not.toBe('none');

    await realMouse.moveTo(body(t, 3, 1));
    await nextFrame();
    expect(t.moved[t.moved.length - 1]).toMatchObject({ areaIdent: 'body', rowIndex: 3, columnIndex: 1 });
    expect(t.dragging).toHaveLength(draggingBefore);
    expect(t.draggingEnd).toHaveLength(1);
    expect(t.clicked).toHaveLength(0);
  });

  it('1b: a press without any movement, mouseup lost: no dragging end (there was no drag), no click', async () => {
    const t = await mountPressTable({ direction });
    await realMouse.moveTo(body(t, 2, 1));
    await realMouse.down();
    await loseMouseUp();
    expect(t.isDown()).toBe(true);
    await realMouse.moveTo(body(t, 6, 2));
    await nextFrame();
    await new Promise(resolve => setTimeout(resolve, 20)); // a report of a "lost click" would come in a timeout
    expect(t.isDown()).toBe(false);
    expect(t.dragging).toHaveLength(0);
    expect(t.draggingEnd).toHaveLength(0);
    expect(t.clicked).toHaveLength(0);
  });

  it('2: the case of the app – click on a header, press in the body, mouseup lost, moves without the button: no column moves', async () => {
    const t = await mountPressTable({ direction });
    await realMouse.moveTo(header(t, 3));       // a quiet click on a movable header (no movement)
    await realMouse.click();
    await new Promise(resolve => setTimeout(resolve, 20));
    await nextFrame();
    t.clicked.length = 0;

    await pressAndDrag(body(t, 2, 0), body(t, 2, 2));  // the app drags a row with its own pointer events …
    await loseMouseUp();                               // … and hands it over to the system: no mouseup
    for (const col of [0, 1, 2, 3, 4]) {               // the pointer comes back, no button
      await realMouse.moveTo(body(t, 4, col));
      await nextFrame();
    }
    expect(t.order()).toEqual(PROPS);
    expect(dropZones(t)).toBe(0);
    expect(ghostVisible(t)).toBe(false);
    expect(t.moveStart).toHaveLength(0);
    expect(t.moveEnd).toHaveLength(0);
    expect(t.widths()).toEqual([100, 100, 100, 100, 100]);
    expect(t.isDown()).toBe(false);
  });

  // Regression for "bug 2" of the report (fixed in 1.1.110, prompt 022 – tested there for the resize handle only):
  // a click on a header left its column action set, and the next drag in the body moved that column.
  it('3: a click on a header, then a normal drag in the body: no column changes', async () => {
    const t = await mountPressTable({ direction });
    await realMouse.moveTo(header(t, 3));
    await realMouse.click();
    await new Promise(resolve => setTimeout(resolve, 20));
    await nextFrame();
    await pressAndDrag(body(t, 2, 0), body(t, 5, 4));
    expect(dropZones(t)).toBe(0);
    await realMouse.up();
    await nextFrame();
    expect(t.order()).toEqual(PROPS);
    expect(t.widths()).toEqual([100, 100, 100, 100, 100]);
    expect(dropZones(t)).toBe(0);
    expect(t.moveStart).toHaveLength(0);
    expect(t.moveEnd).toHaveLength(0);
  });

  it('4: a column is being moved, mouseup lost: the first move without the button cancels it (old order, type "cancel")', async () => {
    const t = await mountPressTable({ direction });
    await pressAndDrag(header(t, 1), header(t, 3));
    expect(t.moveStart).toHaveLength(1);
    expect(t.order()).toEqual(['a', 'c', 'd', 'b', 'e']);   // moved while dragging
    expect(t.api.isColumnDragging()).toBe(true);
    await loseMouseUp();
    await nextFrame();
    expect(t.api.isColumnDragging()).toBe(true);            // still "dragging" – no event arrived

    await realMouse.moveTo(body(t, 3, 0));
    await nextFrame();
    expect(t.api.isColumnDragging()).toBe(false);
    expect(t.order()).toEqual(PROPS);
    expect(t.moveEnd).toHaveLength(1);
    expect(t.moveEnd[0]).toMatchObject({ type: 'cancel', property: 'b', fromIndex: 1, toIndex: 1 });
    expect(ghostVisible(t)).toBe(false);
    expect(dropZones(t)).toBe(0);
    expect(t.draggingEnd).toHaveLength(1);

    for (const col of [4, 2, 0]) {                          // more moves: nothing follows the pointer
      await realMouse.moveTo(header(t, col));
      await nextFrame();
    }
    expect(t.order()).toEqual(PROPS);
    expect(t.moveEnd).toHaveLength(1);
    expect(t.moveStart).toHaveLength(1);
    expect(dropZones(t)).toBe(0);
  });

  it('5: a column is being resized, mouseup lost: the first move without the button cancels it (old width, one end)', async () => {
    const t = await mountPressTable({ direction });
    await pressAndDragBy(handleOf(t, 1), 60 * wider);
    expect(t.resizeStart).toHaveLength(1);
    expect(t.model.getColumnWidth(1)).toBe(160);
    await loseMouseUp();
    await nextFrame();

    const p = centre(body(t, 3, 0));
    await realMouse.move(p.x, p.y);
    await nextFrame();
    expect(t.api.isColumnDragging()).toBe(false);
    expect(t.widths()).toEqual([100, 100, 100, 100, 100]);
    expect(t.resizeEnd).toHaveLength(1);
    expect(t.resizeEnd[0]).toMatchObject({ type: 'cancel', columnIndex: 1, oldWidth: 100, newWidth: 100 });

    await realMouse.move(p.x + 150 * wider, p.y, 3);        // more moves do not change a width
    await nextFrame();
    await realMouse.move(p.x + 20 * wider, p.y, 3);
    await nextFrame();
    expect(t.widths()).toEqual([100, 100, 100, 100, 100]);
    expect(t.resizeEnd).toHaveLength(1);
  });

  it('6: range selection, mouseup lost: moves without the button do not extend the selection (it stays as it is)', async () => {
    const t = await mountPressTable({ direction, range: true });
    await pressAndDrag(body(t, 2, 1), body(t, 4, 2));
    expect(t.selectionModel.isSelected(4, 2)).toBe(true);
    await loseMouseUp();
    await realMouse.moveTo(body(t, 8, 4));
    await nextFrame();
    await realMouse.moveTo(body(t, 9, 3));
    await nextFrame();
    expect(t.selectionModel.isSelected(2, 1)).toBe(true);
    expect(t.selectionModel.isSelected(4, 2)).toBe(true);   // what was selected stays
    expect(t.selectionModel.isSelected(8, 4)).toBe(false);
    expect(t.selectionModel.isSelected(9, 3)).toBe(false);
    expect(t.selectionModel.isSelected(6, 2)).toBe(false);
  });

  it('7: the next press counts again – a column resize right after the lost mouseup works', async () => {
    const t = await mountPressTable({ direction });
    await pressAndDrag(body(t, 2, 1), body(t, 5, 2));
    await loseMouseUp();

    await pressAndDragBy(handleOf(t, 2), 50 * wider);
    await realMouse.up();
    await nextFrame();
    expect(t.widths()).toEqual([100, 100, 150, 100, 100]);
    expect(t.resizeStart).toHaveLength(1);
    expect(t.resizeEnd).toHaveLength(1);
    expect(t.resizeEnd[0]).toMatchObject({ type: 'end', columnIndex: 2, oldWidth: 100, newWidth: 150 });
    expect(t.isDown()).toBe(false);
  });

  it('7b: a new press at the same place, without any movement in between, ends the stale press first', async () => {
    const t = await mountPressTable({ direction });
    await pressAndDrag(header(t, 1), header(t, 3));
    expect(t.order()).toEqual(['a', 'c', 'd', 'b', 'e']);
    await loseMouseUp();
    await realMouse.down();                                  // the same button again: the old press can't be held
    await nextFrame();
    expect(t.order()).toEqual(PROPS);                        // the stale move was cancelled
    expect(t.moveEnd).toHaveLength(1);
    expect(t.moveEnd[0].type).toBe('cancel');
    expect(t.isDown()).toBe(true);                           // the new press
    await realMouse.up();
    await new Promise(resolve => setTimeout(resolve, 20));
    await nextFrame();
    expect(t.isDown()).toBe(false);
    expect(t.order()).toEqual(PROPS);
    expect(t.moveEnd).toHaveLength(1);
    // cancelling the stale move rendered: the pressed header element is gone and the browser sends no click – the
    // table reports the click of the new press itself (the press was read before the stale one ended)
    expect(t.clicked).toHaveLength(1);
    expect(t.clicked[0].areaIdent).toBe('header');
  });

  it('7c: a press somewhere else in the page (same button) ends the stale press of the table, too', async () => {
    const t = await mountPressTable({ direction });
    await pressAndDrag(header(t, 1), header(t, 3));
    await loseMouseUp();
    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0, buttons: 1 }));
    expect(t.isDown()).toBe(false);
    expect(t.order()).toEqual(PROPS);
    expect(t.moveEnd.map(e => e.type)).toEqual(['cancel']);
  });

  it('8: live data follows again after the lost mouseup (appendRows with follow "auto")', async () => {
    const t = await mountPressTable({ direction, rows: createPressRows(500), height: 400 });
    t.api.repaintHard({ py: Number.MAX_SAFE_INTEGER });      // at the end, like a live log
    await nextFrame();
    const last = t.api.getLastFullVisibleRowIndex();
    await pressAndDrag(body(t, last - 4, 1), body(t, last - 2, 2));
    await loseMouseUp();
    await realMouse.moveTo(body(t, last - 6, 3));            // one movement without the button
    await nextFrame();
    const result = t.api.appendRows(createPressRows(20, 500), { follow: 'auto' });
    await nextFrame();
    expect(result && result.following).toBe(true);
    expect(t.api.getLastFullVisibleRowIndex()).toBe(519);
  });

  it('9: pointercancel during a press ends it', async () => {
    const t = await mountPressTable({ direction });
    await pressAndDrag(header(t, 1), header(t, 3));
    expect(t.api.isColumnDragging()).toBe(true);
    // a finger of a hybrid device: touch sends its mouse events only after the touch ended – not this press
    document.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true, pointerId: 7, pointerType: 'touch' }));
    expect(t.isDown()).toBe(true);
    document.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true, pointerId: 1, pointerType: 'mouse' }));
    expect(t.isDown()).toBe(false);
    expect(t.api.isColumnDragging()).toBe(false);
    expect(t.order()).toEqual(PROPS);
    expect(t.moveEnd.map(e => e.type)).toEqual(['cancel']);
    expect(t.draggingEnd).toHaveLength(1);
    await loseMouseUp();
  });

  it('9b: an HTML5 drag that starts during a press (dragstart, no mouseup follows) ends it – a prevented one does not', async () => {
    const t = await mountPressTable({ direction });
    await pressAndDrag(body(t, 2, 1), body(t, 4, 2));
    // a handler of the app at the window (the last one on the path) prevents the drag: the mouse stays with the page
    const noDrag = (e: Event) => e.preventDefault();
    window.addEventListener('dragstart', noDrag);
    body(t, 4, 2).dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true }));
    window.removeEventListener('dragstart', noDrag);
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(t.isDown()).toBe(true);
    body(t, 4, 2).dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true }));
    await vi.waitFor(() => expect(t.isDown()).toBe(false));
    expect(t.draggingEnd).toHaveLength(1);
    await loseMouseUp();
  });

  it('9c: the window loses the focus during a press (a system dialog): the press ends', async () => {
    const t = await mountPressTable({ direction });
    await pressAndDragBy(handleOf(t, 1), 60 * wider);
    expect(t.model.getColumnWidth(1)).toBe(160);
    const hasFocus = vi.spyOn(document, 'hasFocus').mockReturnValue(true);
    window.dispatchEvent(new Event('blur'));                 // the focus went into an iframe of this page
    expect(t.isDown()).toBe(true);
    expect(t.model.getColumnWidth(1)).toBe(160);
    hasFocus.mockReturnValue(false);
    window.dispatchEvent(new Event('blur'));                 // another window, a system dialog
    expect(t.isDown()).toBe(false);
    expect(t.widths()).toEqual([100, 100, 100, 100, 100]);
    expect(t.resizeEnd.map(e => e.type)).toEqual(['cancel']);
    await loseMouseUp();
  });

  it('10: no false alarm – a resize with the button held, out of the host and back, works as before', async () => {
    const t = await mountPressTable({ direction });
    const { x, y } = centre(handleOf(t, 1));
    await realMouse.move(x, y);
    await realMouse.down();
    await realMouse.move(x + 30 * wider, y, 3);
    await nextFrame();
    await realMouse.move(x + 30 * wider, 700, 4);            // below the host (500 px high), button held
    await nextFrame();
    await realMouse.move(900, 700, 3);                       // next to it
    await nextFrame();
    expect(t.isDown()).toBe(true);
    expect(t.resizeEnd).toHaveLength(0);
    await realMouse.move(x + 70 * wider, y, 4);              // back
    await nextFrame();
    await realMouse.up();
    await nextFrame();
    expect(t.model.getColumnWidth(1)).toBe(170);
    expect(t.resizeEnd).toHaveLength(1);
    expect(t.resizeEnd[0]).toMatchObject({ type: 'end', oldWidth: 100, newWidth: 170 });
    expect(t.isDown()).toBe(false);
  });

  it('10b: no false alarm – a column move and a range selection out of the host and back', async () => {
    const t = await mountPressTable({ direction, range: true });
    const from = centre(header(t, 1));
    const to = centre(header(t, 3));
    await realMouse.move(from.x, from.y);
    await realMouse.down();
    await realMouse.move((from.x + to.x) / 2, from.y, 3);
    await nextFrame();
    await realMouse.move((from.x + to.x) / 2, 700, 3);       // out
    await nextFrame();
    await realMouse.move(to.x, to.y, 4);                     // back
    await nextFrame();
    await realMouse.up();
    await nextFrame();
    expect(t.order()).toEqual(['a', 'c', 'd', 'b', 'e']);
    expect(t.moveEnd.map(e => e.type)).toEqual(['end']);

    const a = centre(body(t, 2, 1));
    const b = centre(body(t, 5, 3));
    await realMouse.move(a.x, a.y);
    await realMouse.down();
    await realMouse.move(a.x, 700, 3);                       // out
    await nextFrame();
    await realMouse.move(b.x, b.y, 4);                       // back
    await nextFrame();
    expect(t.isDown()).toBe(true);
    await realMouse.up();
    await nextFrame();
    expect(t.selectionModel.isSelected(2, 1)).toBe(true);
    expect(t.selectionModel.isSelected(5, 3)).toBe(true);
    expect(t.selectionModel.isSelected(6, 3)).toBe(false);
  });

  it('11: the button of the press counts – a right-button press with "buttons: 2" is held, "buttons: 0" is not', async () => {
    const t = await mountPressTable({ direction });
    const cell = body(t, 2, 1);
    const { x, y } = centre(cell);
    const fire = (target: EventTarget, type: string, dx: number, init: MouseEventInit) => target.dispatchEvent(
      new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x + dx, clientY: y, ...init }));
    fire(cell, 'mousedown', 0, { button: 2, buttons: 2 });
    fire(cell, 'mousemove', 20, { buttons: 2 });
    expect(t.isDown()).toBe(true);
    fire(cell, 'mousemove', 30, { buttons: 3 });             // the left button in addition: still held
    expect(t.isDown()).toBe(true);
    fire(cell, 'mousemove', 40, { buttons: 1 });             // only another button: the right one is up
    expect(t.isDown()).toBe(false);

    fire(cell, 'mousedown', 0, { button: 1, buttons: 4 });   // middle button
    fire(cell, 'mousemove', 20, { buttons: 4 });
    expect(t.isDown()).toBe(true);
    fire(cell, 'mousemove', 30, { buttons: 0 });
    expect(t.isDown()).toBe(false);
    await nextFrame();

    // a stale right-button press (its mouseup was lost), then the left button goes down: the right one is not held
    t.dragging.length = 0;
    t.draggingEnd.length = 0;
    fire(cell, 'mousedown', 0, { button: 2, buttons: 2 });
    fire(cell, 'mousemove', 20, { buttons: 2 });
    await nextFrame();
    expect(t.dragging).toHaveLength(1);
    fire(cell, 'mousedown', 0, { button: 0, buttons: 1 });
    expect(t.draggingEnd).toHaveLength(1);                   // the stale press ended …
    expect(t.isDown()).toBe(true);                           // … and the new one counts
    fire(cell, 'mouseup', 0, { button: 0, buttons: 0 });
    expect(t.isDown()).toBe(false);
    await nextFrame();
    expect(t.draggingEnd).toHaveLength(1);
  });

  it('a press that ends before its first drag frame ran: no onMouseDragging afterwards, no end without a start', async () => {
    const t = await mountPressTable({ direction, range: true });
    const a = centre(body(t, 2, 1));
    const b = centre(body(t, 5, 3));
    const fire = (target: Element, type: string, p: { x: number; y: number }, buttons: number) => target.dispatchEvent(
      new MouseEvent(type, { bubbles: true, cancelable: true, clientX: p.x, clientY: p.y, button: 0, buttons }));
    fire(body(t, 2, 1), 'mousedown', a, 1);
    fire(body(t, 5, 3), 'mousemove', b, 1);                  // its drag frame is queued …
    t.api.releaseMouse();                                    // … and the press ends in the same task
    await nextFrame();
    expect(t.dragging).toHaveLength(0);                      // the queued frame is outdated
    expect(t.draggingEnd).toHaveLength(0);                   // no end without a reported drag
    expect(t.selectionModel.isSelected(5, 3)).toBe(false);
    expect(t.selectionModel.isSelected(2, 1)).toBe(false);
  });

  it('a lost press that ends renders nothing by itself (one comparison per mousemove, no layout)', async () => {
    const t = await mountPressTable({ direction });
    await realMouse.moveTo(body(t, 2, 1));
    await nextFrame();
    await new Promise(resolve => setTimeout(resolve, 20));
    await pressAndDrag(body(t, 2, 1), body(t, 5, 2));
    await loseMouseUp();
    await nextFrame();
    const renders = countRenders(t.scope);
    await realMouse.moveTo(body(t, 7, 3));
    await nextFrame();
    expect(t.isDown()).toBe(false);
    expect(renders.count()).toBe(0);
    renders.stop();
  });
});

describe.each(DIRECTIONS)('part B – tableApi.releaseMouse() / isMouseDown() (%s)', direction => {
  const wider = direction === 'rtl' ? -1 : 1;

  it('12: releaseMouse() after a lost mouseup, without any mouse movement: column move cancelled, not pressed', async () => {
    const t = await mountPressTable({ direction });
    expect(t.api.isMouseDown()).toBe(false);
    await pressAndDrag(header(t, 1), header(t, 3));
    await loseMouseUp();
    expect(t.api.isMouseDown()).toBe(true);
    t.api.releaseMouse();
    expect(t.api.isMouseDown()).toBe(false);
    expect(t.api.isColumnDragging()).toBe(false);
    expect(t.order()).toEqual(PROPS);
    expect(t.moveEnd.map(e => e.type)).toEqual(['cancel']);
    expect(ghostVisible(t)).toBe(false);
    expect(t.draggingEnd).toHaveLength(1);
    await nextFrame();
    expect(dropZones(t)).toBe(0);
  });

  it('12b: releaseMouse() during a resize: old width, one end with type "cancel"', async () => {
    const t = await mountPressTable({ direction });
    await pressAndDragBy(handleOf(t, 1), 60 * wider);
    await loseMouseUp();
    t.api.releaseMouse();
    expect(t.widths()).toEqual([100, 100, 100, 100, 100]);
    expect(t.resizeEnd.map(e => e.type)).toEqual(['cancel']);
    expect(t.api.isMouseDown()).toBe(false);
  });

  it('12c: releaseMouse() and live data follows at once (no mouse movement needed)', async () => {
    const t = await mountPressTable({ direction, rows: createPressRows(500), height: 400 });
    t.api.repaintHard({ py: Number.MAX_SAFE_INTEGER });
    await nextFrame();
    const last = t.api.getLastFullVisibleRowIndex();
    await realMouse.moveTo(body(t, last - 4, 1));
    await realMouse.down();
    await loseMouseUp();
    const held = t.api.appendRows(createPressRows(10, 500), { follow: 'auto' });
    expect(held && held.following).toBe(false);              // pressed: the rows under the pointer stay
    t.api.releaseMouse();
    const result = t.api.appendRows(createPressRows(10, 510), { follow: 'auto' });
    await nextFrame();
    expect(result && result.following).toBe(true);
    expect(t.api.getLastFullVisibleRowIndex()).toBe(519);
  });

  it('13: releaseMouse() without a press does nothing; a real mouseup after releaseMouse() reports nothing twice', async () => {
    const t = await mountPressTable({ direction });
    const renders = countRenders(t.scope);
    t.api.releaseMouse();
    await nextFrame();
    expect(renders.count()).toBe(0);
    renders.stop();
    expect(t.draggingEnd).toHaveLength(0);
    expect(t.moveEnd).toHaveLength(0);
    expect(t.resizeEnd).toHaveLength(0);

    await pressAndDrag(header(t, 1), header(t, 3));          // the button is really held
    t.api.releaseMouse();
    t.api.releaseMouse();                                    // twice: the second call finds no press
    expect(t.moveEnd.map(e => e.type)).toEqual(['cancel']);
    expect(t.draggingEnd).toHaveLength(1);
    await realMouse.up();                                    // the real mouseup arrives after all
    await nextFrame();
    expect(t.moveEnd).toHaveLength(1);
    expect(t.draggingEnd).toHaveLength(1);
    expect(t.order()).toEqual(PROPS);
    expect(t.api.isMouseDown()).toBe(false);
  });

  it('14: releaseMouse() inside onMouseDragging (the app starts its native drag there): no error, clean state', async () => {
    const errors: unknown[] = [];
    const onError = (e: ErrorEvent) => errors.push(e.error ?? e.message);
    window.addEventListener('error', onError);
    const t = await mountPressTable({ direction, range: true, onDragging: api => api.releaseMouse() });
    await pressAndDrag(body(t, 2, 1), body(t, 5, 3));
    await nextFrame();
    expect(t.api.isMouseDown()).toBe(false);
    expect(t.dragging).toHaveLength(1);                      // the first report ended the press
    expect(t.draggingEnd).toHaveLength(1);
    expect(t.selectionModel.isSelected(5, 3)).toBe(false);   // no selection drag after the release …
    expect(t.selectionModel.isSelected(2, 1)).toBe(false);   // … not even for the frame that reported the drag
    await loseMouseUp();
    await realMouse.moveTo(body(t, 8, 4));
    await nextFrame();
    expect(t.dragging).toHaveLength(1);
    expect(t.draggingEnd).toHaveLength(1);
    window.removeEventListener('error', onError);
    expect(errors).toEqual([]);
  });

  it('14b: releaseMouse() inside onColumnMoveStart: the move is cancelled before it moved anything', async () => {
    const errors: unknown[] = [];
    const onError = (e: ErrorEvent) => errors.push(e.error ?? e.message);
    window.addEventListener('error', onError);
    const t = await mountPressTable({ direction, onMoveStart: api => api.releaseMouse() });
    await pressAndDrag(header(t, 1), header(t, 3));
    await nextFrame();
    expect(t.api.isMouseDown()).toBe(false);
    expect(t.api.isColumnDragging()).toBe(false);
    expect(t.order()).toEqual(PROPS);
    expect(t.moveStart).toHaveLength(1);
    expect(t.moveEnd.map(e => e.type)).toEqual(['cancel']);
    expect(dropZones(t)).toBe(0);
    expect(ghostVisible(t)).toBe(false);
    await realMouse.up();
    await nextFrame();
    expect(t.order()).toEqual(PROPS);
    expect(t.moveEnd).toHaveLength(1);
    window.removeEventListener('error', onError);
    expect(errors).toEqual([]);
  });

  it('15: a destroyed table – releaseMouse() does not throw, isMouseDown() is false', async () => {
    const t = await mountPressTable({ direction });
    await pressAndDrag(header(t, 1), header(t, 3));
    const ends = t.moveEnd.length;
    t.destroy();
    expect(() => t.api.releaseMouse()).not.toThrow();
    expect(t.api.isMouseDown()).toBe(false);
    document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, buttons: 0 })); // no listener of the press is left
    await realMouse.up();
    await nextFrame();
    expect(t.moveEnd).toHaveLength(ends);                    // the table is gone: no event
    expect(t.draggingEnd).toHaveLength(0);
  });
});
