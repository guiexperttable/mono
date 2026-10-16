// Row drag end to end in Chromium (prompt 009): drag handles, pointer drag (D1–D4), sorted/filtered (D5), multi-row
// (D6), tree (D7), row grouping (D8), keyboard (D9), outside the table (D11), range selection unchanged (D12),
// events (D13), HTML injection in the ghost, axe.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import {
  AreaModel,
  CellRange,
  ColumnDef,
  EventAdapter,
  getInsertBeforeIndex,
  moveArrayItems,
  FocusModel,
  LiveAnnouncer,
  PivotFactory,
  RowGroupFactory,
  SelectionModel,
  TableFactory,
  TreeFactory,
  TreeRow,
} from '@guiexpert/table';
import type { GeRowDragEvent, RowDropTargetIf, TableOptionsIf, TreeRowIf } from '@guiexpert/table';
import { destroyAllTables, getCellDiv, mountTable, nextFrame, renderedRows } from '../../../../test-utils/mount-table';
import { axeViolations } from '../../../../test-utils/axe';

interface Task { id: number; title: string; prio: number }

const createTasks = (n: number): Task[] => Array.from({ length: n }, (_, i) => ({ id: i, title: `Task ${i}`, prio: i % 3 }));

beforeEach(() => {
  LiveAnnouncer.defaultDelayInMs = 0;
  vi.spyOn(console, 'debug').mockImplementation(() => undefined);
});

afterEach(() => {
  destroyAllTables();
  vi.restoreAllMocks();
  LiveAnnouncer.defaultDelayInMs = 150;
  delete (window as unknown as { __geXss?: number }).__geXss;
});

interface MountRowDragOptions {
  rows?: Task[];
  tableOptions?: Partial<TableOptionsIf>;
  columnDefs?: ReturnType<typeof ColumnDef.create>[];
  height?: number;
}

async function mountRowDrag(opts: MountRowDragOptions = {}) {
  const tasks = opts.rows ?? createTasks(20);
  const fm = new FocusModel('cell');
  const sm = new SelectionModel('row', 'multi');
  const events: GeRowDragEvent[] = [];
  const listener = new EventAdapter();
  listener.onRowDragStart = e => events.push(e);
  listener.onRowDragMove = e => events.push(e);
  listener.onRowDragEnd = e => events.push(e);
  const columnDefs = opts.columnDefs ?? [
    ColumnDef.create({ property: 'title', headerLabel: 'Task', rowDrag: true }),
    ColumnDef.create({ property: 'prio', headerLabel: 'Prio', sortable: () => true }),
  ];
  const model = TableFactory.createTableModel({ rows: tasks, columnDefs });
  const table = mountTable(model, {
    eventListener: listener,
    height: opts.height,
    tableOptions: { getFocusModel: () => fm, getSelectionModel: () => sm, ...opts.tableOptions },
  });
  await nextFrame();
  return { ...table, tasks, fm, sm, events, listener, model };
}

const handle = (host: HTMLElement, rowIndex: number) =>
  getCellDiv(host, 'body', 'center', rowIndex, 0).querySelector<HTMLElement>('.ge-table-row-drag-handle')!;

/** Client point inside a body row: `fraction` 0 = top edge, 1 = bottom edge. */
function rowPoint(host: HTMLElement, rowIndex: number, fraction = 0.5): { x: number; y: number } {
  const r = getCellDiv(host, 'body', 'center', rowIndex, 1).getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height * fraction };
}

function pointer(target: EventTarget, type: string, x: number, y: number, init: PointerEventInit = {}): PointerEvent {
  const evt = new PointerEvent(type, {
    bubbles: true, cancelable: true, composed: true, clientX: x, clientY: y,
    pointerId: 1, pointerType: 'mouse', button: 0, buttons: type === 'pointerup' ? 0 : 1, isPrimary: true, ...init,
  });
  target.dispatchEvent(evt);
  return evt;
}

/** pointerdown on the handle, moves past the threshold, to (x, y). Returns the handle's down event. */
function startDrag(host: HTMLElement, rowIndex: number | HTMLElement, to: { x: number; y: number }, init: PointerEventInit = {}): PointerEvent {
  const h = typeof rowIndex === 'number' ? handle(host, rowIndex) : rowIndex;
  const r = h.getBoundingClientRect();
  const down = pointer(h, 'pointerdown', r.left + 4, r.top + 4, init);
  pointer(document, 'pointermove', r.left + 4, r.top + 14, init);
  pointer(document, 'pointermove', to.x, to.y, init);
  return down;
}

function drop(at: { x: number; y: number }, init: PointerEventInit = {}) {
  pointer(document, 'pointerup', at.x, at.y, init);
}

const titles = (tasks: Task[]) => tasks.map(t => t.id);
const liveText = () => document.querySelector('[role="status"][aria-live="polite"]')?.textContent ?? '';

describe('drag handle', () => {

  it('is rendered in the rowDrag column only, hidden for screen readers, with the keyboard shortcut on the cell', async () => {
    const { host } = await mountRowDrag();
    const h = handle(host, 0);
    expect(h).toBeTruthy();
    expect(h.getAttribute('data-ge-action')).toBe('drag-row');
    expect(h.getAttribute('aria-hidden')).toBe('true');
    const cell = getCellDiv(host, 'body', 'center', 0, 0);
    expect(cell.classList.contains('ge-table-row-drag-cell')).toBe(true);
    expect(cell.getAttribute('aria-keyshortcuts')).toBe('Control+Alt+ArrowUp Control+Alt+ArrowDown');
    expect(getCellDiv(host, 'body', 'center', 0, 1).querySelector('.ge-table-row-drag-handle')).toBeNull();
    expect(getComputedStyle(h).touchAction).toBe('none');
  });

  it('a function decides per row (locked rows have no handle)', async () => {
    const columnDefs = [
      ColumnDef.create({ property: 'title', headerLabel: 'Task', rowDrag: (row: Task) => row.id !== 1 }),
      ColumnDef.create({ property: 'prio', headerLabel: 'Prio' }),
    ];
    const { host } = await mountRowDrag({ columnDefs });
    expect(handle(host, 0)).toBeTruthy();
    expect(handle(host, 1)).toBeNull();
  });

  it('axe finds nothing', async () => {
    const { host } = await mountRowDrag();
    expect(await axeViolations(host)).toEqual([]);
  });
});

describe('pointer drag, managed (D1, D2, D13)', () => {

  it('D1: row 3 dropped between row 7 and 8 is row 7 – in the app\'s array, events start → move → end', async () => {
    const { host, tasks, events, fm } = await mountRowDrag();
    const to = rowPoint(host, 6, 0.8);
    startDrag(host, 2, to);
    drop(to);
    await nextFrame();
    expect(titles(tasks).slice(0, 8)).toEqual([0, 1, 3, 4, 5, 6, 2, 7]);
    expect(events.map(e => e.type)).toEqual(expect.arrayContaining(['start', 'move', 'end']));
    expect(events[0]).toMatchObject({ type: 'start', source: 'pointer', rowIndices: [2], managed: true });
    expect(events[0].rows[0].id).toBe(2);
    const end = events[events.length - 1];
    expect(end).toMatchObject({ type: 'end', target: { rowIndex: 6, position: 'after' }, toIndex: 6, moved: true, outside: false });
    expect(getCellDiv(host, 'body', 'center', 6, 0).textContent).toContain('Task 2');
    expect(fm.getFocus()[0]).toBe(6);
    await vi.waitFor(() => expect(liveText()).toBe('Row moved to position 7 of 20'));
  });

  it('upper half of a row = before it', async () => {
    const { host, tasks } = await mountRowDrag();
    const to = rowPoint(host, 1, 0.2);
    startDrag(host, 5, to);
    drop(to);
    expect(titles(tasks).slice(0, 4)).toEqual([0, 5, 1, 2]);
  });

  it('D2: ghost with the text of the row, drop marker, dimmed source row, grabbing – all gone after the drop', async () => {
    const { host } = await mountRowDrag();
    const to = rowPoint(host, 6, 0.8);
    startDrag(host, 2, to);
    const ghost = host.querySelector<HTMLElement>('.ge-table-row-drag-ghost')!;
    expect(ghost.textContent).toBe('Task 2');
    expect(ghost.getAttribute('aria-hidden')).toBe('true');
    const marker = host.querySelector<HTMLElement>('.ge-table-row-drop-indicator')!;
    expect(marker.style.display).toBe('block');
    const rowBottom = getCellDiv(host, 'body', 'center', 6, 1).getBoundingClientRect().bottom;
    expect(Math.abs(marker.getBoundingClientRect().top + 1 - rowBottom)).toBeLessThan(2);
    expect(host.classList.contains('ge-table-row-drag-active')).toBe(true);
    expect(getCellDiv(host, 'body', 'center', 2, 1).classList.contains('ge-table-row-dragging')).toBe(true);
    await vi.waitFor(() => expect(liveText()).toBe('Dragging 1 row. Press Escape to cancel.'));
    drop(to);
    expect(host.querySelector('.ge-table-row-drag-ghost')).toBeNull();
    expect(host.querySelector('.ge-table-row-drop-indicator')).toBeNull();
    expect(host.classList.contains('ge-table-row-drag-active')).toBe(false);
    expect(host.querySelector('.ge-table-row-dragging')).toBeNull();
  });

  it('move events only when the target changes', async () => {
    const { host, events } = await mountRowDrag();
    const to = rowPoint(host, 6, 0.8);
    startDrag(host, 2, to);
    const moves = events.filter(e => e.type === 'move').length;
    pointer(document, 'pointermove', to.x + 3, to.y);
    pointer(document, 'pointermove', to.x - 3, to.y);
    expect(events.filter(e => e.type === 'move')).toHaveLength(moves);
    pointer(document, 'pointermove', to.x, rowPoint(host, 4, 0.8).y);
    expect(events.filter(e => e.type === 'move')).toHaveLength(moves + 1);
    drop(to);
  });

  it('below the threshold it is a click – no events, nothing moved', async () => {
    const { host, tasks, events } = await mountRowDrag();
    const h = handle(host, 2);
    const r = h.getBoundingClientRect();
    pointer(h, 'pointerdown', r.left + 4, r.top + 4);
    pointer(document, 'pointermove', r.left + 5, r.top + 5);
    pointer(document, 'pointerup', r.left + 5, r.top + 5);
    expect(events).toEqual([]);
    expect(titles(tasks).slice(0, 4)).toEqual([0, 1, 2, 3]);
  });

  it('the pointerdown on the handle is prevented (no mouse events: no range selection, no text selection)', async () => {
    const { host } = await mountRowDrag();
    const down = startDrag(host, 2, rowPoint(host, 6));
    expect(down.defaultPrevented).toBe(true);
    drop(rowPoint(host, 6));
  });

  it('the click after a drag does not reach the table (focus stays on the moved row)', async () => {
    const { host, fm } = await mountRowDrag();
    const to = rowPoint(host, 6, 0.8);
    startDrag(host, 2, to);
    drop(to);
    getCellDiv(host, 'body', 'center', 0, 1).dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(fm.getFocus()[0]).toBe(6);
    await new Promise(r => setTimeout(r, 0));
    getCellDiv(host, 'body', 'center', 0, 1).dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 }));
    expect(fm.getFocus()[0]).toBe(0); // the next click counts again
  });

  it('a right button or a second pointer does not start a drag', async () => {
    const { host, events } = await mountRowDrag();
    const h = handle(host, 2);
    const r = h.getBoundingClientRect();
    pointer(h, 'pointerdown', r.left, r.top, { button: 2 });
    pointer(document, 'pointermove', r.left, r.top + 80, { button: 2 });
    expect(events).toEqual([]);
    startDrag(host, 2, rowPoint(host, 6));
    pointer(document, 'pointerup', 0, 0, { pointerId: 7 });   // another pointer: ignored
    expect(host.classList.contains('ge-table-row-drag-active')).toBe(true);
    drop(rowPoint(host, 6));
  });
});

describe('cancel (D4)', () => {

  it('Escape cancels: nothing moved, "cancel" event, ghost gone', async () => {
    const { host, tasks, events, api } = await mountRowDrag();
    startDrag(host, 2, rowPoint(host, 6, 0.8));
    expect(api.isRowDragging()).toBe(true);
    const esc = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    document.dispatchEvent(esc);
    expect(esc.defaultPrevented).toBe(true);
    expect(api.isRowDragging()).toBe(false);
    expect(events[events.length - 1]).toMatchObject({ type: 'cancel', target: undefined });
    expect(host.querySelector('.ge-table-row-drag-ghost')).toBeNull();
    drop(rowPoint(host, 6));
    expect(titles(tasks).slice(0, 4)).toEqual([0, 1, 2, 3]);
  });

  it('pointercancel (e.g. the browser took over a touch) and api.cancelRowDrag() cancel', async () => {
    const { host, events, api, tasks } = await mountRowDrag();
    startDrag(host, 2, rowPoint(host, 6));
    pointer(document, 'pointercancel', 0, 0);
    expect(events[events.length - 1].type).toBe('cancel');
    startDrag(host, 3, rowPoint(host, 6));
    api.cancelRowDrag();
    expect(events[events.length - 1].type).toBe('cancel');
    api.cancelRowDrag(); // no drag: nothing happens
    expect(titles(tasks).slice(0, 4)).toEqual([0, 1, 2, 3]);
  });

  it('destroy during a drag: "cancel" event, the document listeners are gone', async () => {
    const { host, events, destroy, tasks } = await mountRowDrag();
    startDrag(host, 2, rowPoint(host, 6));
    destroy();
    expect(events[events.length - 1].type).toBe('cancel');
    const count = events.length;
    pointer(document, 'pointermove', 10, 10);
    pointer(document, 'pointerup', 10, 10);
    expect(events).toHaveLength(count);
    expect(titles(tasks).slice(0, 4)).toEqual([0, 1, 2, 3]);
  });
});

describe('auto-scroll (D3)', () => {

  it('dragging to the bottom edge of a large table scrolls; the drop lands far below', async () => {
    const { host, tasks, scope } = await mountRowDrag({ rows: createTasks(100_000), height: 400 });
    const body = scope.getBodyViewport();
    const bottom = { x: body.left + 100, y: body.top + body.height - 3 };
    startDrag(host, 0, bottom);
    await vi.waitFor(() => expect(scope.scrollViewport.scrollTop).toBeGreaterThan(600), { timeout: 4000 });
    pointer(document, 'pointermove', bottom.x, body.top + body.height / 2);   // leave the zone: stops
    await nextFrame();
    const stopped = scope.scrollViewport.scrollTop;
    await nextFrame();
    expect(scope.scrollViewport.scrollTop).toBe(stopped);
    drop({ x: bottom.x, y: body.top + body.height / 2 });
    const newIndex = tasks.findIndex(t => t.id === 0);
    expect(newIndex).toBeGreaterThan(15);
    expect(newIndex).toBeLessThan(100_000);
  });

  it('speed grows towards the edge; the header counts as full speed upwards', async () => {
    const { host, scope } = await mountRowDrag({ rows: createTasks(2000), height: 400 });
    scope.scrollViewport.scrollTop = 20_000;
    await nextFrame();
    const body = scope.getBodyViewport();
    startDrag(host, renderedRows(host).length > 3 ? Number(renderedRows(host)[3].getAttribute('data-row-index')) : 0,
      { x: body.left + 50, y: body.top - 10 });
    await vi.waitFor(() => expect(scope.scrollViewport.scrollTop).toBeLessThan(19_500), { timeout: 4000 });
    drop({ x: body.left + 50, y: body.top + 50 });
  });
});

describe('sorted or filtered (D5)', () => {

  it('managed + sorted: handles disabled, no drag, an announcement; after removing the sort it works', async () => {
    const { host, events, api, tasks, model } = await mountRowDrag();
    api.sortByColumn(1, 'asc');
    await nextFrame();
    expect(handle(host, 0).classList.contains('ge-table-row-drag-handle-disabled')).toBe(true);
    startDrag(host, 2, rowPoint(host, 6));
    drop(rowPoint(host, 6));
    expect(events).toEqual([]);
    await vi.waitFor(() => expect(liveText()).toBe('Rows cannot be moved while the table is sorted or filtered'));
    model.getColumnDefs()![1].sortState = '';
    api.repaint();
    await nextFrame();
    expect(handle(host, 0).classList.contains('ge-table-row-drag-handle-disabled')).toBe(false);
    const to = rowPoint(host, 0, 0.1);
    startDrag(host, 2, to);                // sorted by prio: 0, 3, 6, … – display row 2 is task 6
    drop(to);
    expect(titles(tasks).slice(0, 4)).toEqual([6, 0, 3, 9]);   // the sorted order + the move is the new order
  });

  it('managed + filtered: no drag; a filter that keeps all rows does not block', async () => {
    const { host, events, api } = await mountRowDrag({ tableOptions: { externalFilterFunction: (t: Task) => t.prio !== 1 } });
    api.externalFilterChanged();
    await nextFrame();
    expect(handle(host, 0).classList.contains('ge-table-row-drag-handle-disabled')).toBe(true);
    startDrag(host, 1, rowPoint(host, 4));
    drop(rowPoint(host, 4));
    expect(events).toEqual([]);
  });

  it('unmanaged: sorted tables may be dragged – only events, nothing moved', async () => {
    const { host, events, api, tasks } = await mountRowDrag({ tableOptions: { rowDragOptions: { managed: false } } });
    api.sortByColumn(1, 'desc');
    await nextFrame();
    expect(handle(host, 0).classList.contains('ge-table-row-drag-handle-disabled')).toBe(false);
    const snapshot = titles(tasks);
    const to = rowPoint(host, 6, 0.8);
    startDrag(host, 2, to);
    drop(to);
    const end = events[events.length - 1];
    expect(end).toMatchObject({ type: 'end', managed: false, moved: false, toIndex: 6, target: { rowIndex: 6, position: 'after' } });
    expect(titles(tasks)).toEqual(snapshot);
  });
});

describe('veto and unmanaged moves (D13)', () => {

  it('preventDefault in onRowDragStart: no drag', async () => {
    const { host, listener, tasks } = await mountRowDrag();
    listener.onRowDragStart = e => e.preventDefault();
    startDrag(host, 2, rowPoint(host, 6));
    expect(host.querySelector('.ge-table-row-drag-ghost')).toBeNull();
    drop(rowPoint(host, 6));
    expect(titles(tasks).slice(0, 4)).toEqual([0, 1, 2, 3]);
  });

  it('preventDefault in onRowDragMove: invalid target – no marker, "no-drop" cursor, no move', async () => {
    const { host, listener, events, tasks } = await mountRowDrag();
    listener.onRowDragMove = e => { events.push(e); if (e.target?.rowIndex === 6) e.preventDefault(); };
    const to = rowPoint(host, 6, 0.8);
    startDrag(host, 2, to);
    expect(host.querySelector<HTMLElement>('.ge-table-row-drop-indicator')!.style.display).toBe('none');
    expect(host.classList.contains('ge-table-row-drag-invalid')).toBe(true);
    drop(to);
    expect(events[events.length - 1]).toMatchObject({ type: 'end', target: undefined, moved: false });
    expect(titles(tasks).slice(0, 4)).toEqual([0, 1, 2, 3]);
  });

  it('unmanaged: the app moves after the end event with api.moveRows', async () => {
    const { host, listener, tasks, api } = await mountRowDrag({ tableOptions: { rowDragOptions: { managed: false } } });
    listener.onRowDragEnd = e => { if (e.type === 'end' && e.target) api.moveRows(e.rowIndices, e.target); };
    const to = rowPoint(host, 6, 0.8);
    startDrag(host, 2, to);
    drop(to);
    expect(titles(tasks).slice(0, 8)).toEqual([0, 1, 3, 4, 5, 6, 2, 7]);
  });
});

describe('outside the table (D11)', () => {

  it('pointer outside: "outside" in the events, no target, nothing moved', async () => {
    const { host, events, tasks } = await mountRowDrag();
    const r = host.getBoundingClientRect();
    const outside = { x: r.right + 40, y: r.top + 50 };
    startDrag(host, 2, outside);
    expect(events[events.length - 1]).toMatchObject({ type: 'move', outside: true, target: undefined });
    expect(host.classList.contains('ge-table-row-drag-invalid')).toBe(false);
    drop(outside);
    const end = events[events.length - 1];
    expect(end).toMatchObject({ type: 'end', outside: true, target: undefined, moved: false });
    expect((end.originalEvent as PointerEvent).clientX).toBe(outside.x);
    expect(titles(tasks).slice(0, 4)).toEqual([0, 1, 2, 3]);
  });
});

describe('several rows (D6)', () => {

  it('grabbing a selected row drags all selected rows, they keep their order and stay selected', async () => {
    const { host, sm, tasks, events, api } = await mountRowDrag();
    api.repaint();
    sm.firstClick(1, 0);
    sm.togglePoint(3, 0);
    api.repaint();
    await nextFrame();
    const to = rowPoint(host, 6, 0.8);
    startDrag(host, 3, to);
    expect(host.querySelector('.ge-table-row-drag-ghost')!.textContent).toBe('Task 1 (+1)');
    drop(to);
    expect(titles(tasks).slice(0, 8)).toEqual([0, 2, 4, 5, 6, 1, 3, 7]);
    expect(events[0].rowIndices).toEqual([1, 3]);
    expect(events[events.length - 1].toIndex).toBe(5);
    expect(sm.getMergedRowIndices(20)).toEqual([5, 6]);
  });

  it('grabbing a row that is not selected drags only that row (selection cleared)', async () => {
    const { host, sm, tasks, api } = await mountRowDrag();
    sm.firstClick(1, 0);
    api.repaint();
    const to = rowPoint(host, 6, 0.8);
    startDrag(host, 3, to);
    drop(to);
    expect(titles(tasks).slice(0, 8)).toEqual([0, 1, 2, 4, 5, 6, 3, 7]);
    expect(sm.hasSelection()).toBe(false);
  });

  it('multiRow: false drags only the grabbed row', async () => {
    const { host, sm, events, api } = await mountRowDrag({ tableOptions: { rowDragOptions: { multiRow: false } } });
    sm.firstClick(1, 0);
    sm.togglePoint(3, 0);
    api.repaint();
    startDrag(host, 3, rowPoint(host, 6));
    expect(events[0].rowIndices).toEqual([3]);
    drop(rowPoint(host, 6));
  });
});

describe('tree (D7)', () => {
  interface Node { name: string }

  function tree(): TreeRowIf<Node>[] {
    const mk = (name: string, children?: TreeRowIf<Node>[]) => {
      const row = new TreeRow<Node>({ name }, true, children, undefined);
      children?.forEach(c => c.parent = row);
      return row;
    };
    const roots = [mk('a', [mk('a1'), mk('a2')]), mk('b'), mk('c', [mk('c1')])];
    const setDeep = (rows: TreeRowIf<Node>[], deep: number) => rows.forEach(r => { r.deep = deep; setDeep(r.children ?? [], deep + 1); });
    setDeep(roots, 0);
    return roots;
  }

  async function mountTree(tableOptions: Partial<TableOptionsIf> = {}) {
    const roots = tree();
    const events: GeRowDragEvent[] = [];
    const listener = new EventAdapter();
    listener.onRowDragEnd = e => events.push(e);
    listener.onRowDragMove = e => events.push(e);
    const model = TableFactory.createTableModel({
      rows: roots, columnDefs: [ColumnDef.create({ property: 'name', headerLabel: 'Name', rowDrag: true }),
        ColumnDef.create({ property: 'name', headerLabel: 'Again' })]
    });
    const table = mountTable(model, { eventListener: listener, tableOptions: { getFocusModel: () => new FocusModel('cell'), ...tableOptions } });
    await nextFrame();
    return { ...table, roots, events };
  }

  const shown = (host: HTMLElement) => renderedRows(host).map(r => r.querySelector('[data-col-index="1"]')?.textContent);

  it('middle of a row = inside (becomes its last child), marker as a frame', async () => {
    const { host, roots, events } = await mountTree();
    expect(shown(host)).toEqual(['a', 'a1', 'a2', 'b', 'c', 'c1']);
    const to = rowPoint(host, 3, 0.5);   // b
    startDrag(host, 4, to);              // c (with c1)
    expect(host.querySelector('.ge-table-row-drop-indicator')!.classList.contains('ge-table-row-drop-indicator-inside')).toBe(true);
    drop(to);
    await nextFrame();
    expect(roots.map(r => r.data.name)).toEqual(['a', 'b']);
    expect(roots[1].children!.map(r => r.data.name)).toEqual(['c']);
    expect(shown(host)).toEqual(['a', 'a1', 'a2', 'b', 'c', 'c1']);
    expect(events[events.length - 1]).toMatchObject({ type: 'end', moved: true, toIndex: 4, target: { rowIndex: 3, position: 'inside' } });
    expect(getCellDiv(host, 'body', 'center', 4, 0).classList.contains('ge-table-tree-deep-1')).toBe(true);
  });

  it('upper quarter = before (sibling), a child becomes a root', async () => {
    const { host, roots } = await mountTree();
    const to = rowPoint(host, 0, 0.1);
    startDrag(host, 2, to);   // a2
    drop(to);
    expect(roots.map(r => r.data.name)).toEqual(['a2', 'a', 'b', 'c']);
  });

  it('no cycle: a node over its own child is no valid target', async () => {
    const { host, roots, events } = await mountTree();
    const to = rowPoint(host, 1, 0.5);   // a1
    startDrag(host, 0, to);              // a
    expect(host.classList.contains('ge-table-row-drag-invalid')).toBe(true);
    drop(to);
    expect(events[events.length - 1]).toMatchObject({ type: 'end', target: undefined, moved: false });
    expect(roots.map(r => r.data.name)).toEqual(['a', 'b', 'c']);
  });

  it('treeDropInside: false – only before/after', async () => {
    const { host, roots } = await mountTree({ rowDragOptions: { treeDropInside: false } });
    const to = rowPoint(host, 3, 0.6);   // lower half of b → after b
    startDrag(host, 1, to);              // a1
    drop(to);
    expect(roots.map(r => r.data.name)).toEqual(['a', 'b', 'a1', 'c']);
  });
});

describe('row grouping (D8)', () => {

  function groupModel() {
    return RowGroupFactory.createTableModel({
      rows: createTasks(6), groupBy: ['prio'],
      columnDefs: [ColumnDef.create({ property: 'title', headerLabel: 'Task', rowDrag: true })],
      expanded: true,
    });
  }

  it('managed: no handles (the table does not move grouped rows) and one warning', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { host } = mountTable(groupModel());
    await nextFrame();
    expect(host.querySelector('.ge-table-row-drag-handle')).toBeNull();
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('unmanaged: detail rows have handles, group rows not; the events carry the app\'s objects', async () => {
    const events: GeRowDragEvent[] = [];
    const listener = new EventAdapter();
    listener.onRowDragStart = e => events.push(e);
    const { host } = mountTable(groupModel(), { eventListener: listener, tableOptions: { rowDragOptions: { managed: false } } });
    await nextFrame();
    const rows = renderedRows(host);
    const withHandle = rows.filter(r => r.querySelector('.ge-table-row-drag-handle'));
    expect(withHandle.length).toBe(6);
    const detailIndex = Number(withHandle[0].getAttribute('data-row-index'));
    startDrag(host, withHandle[0].querySelector<HTMLElement>('.ge-table-row-drag-handle')!, rowPoint(host, detailIndex + 2));
    expect(events[0].rows[0]).toHaveProperty('title');
    drop(rowPoint(host, detailIndex + 2));
  });
});

describe('keyboard (D9)', () => {

  it('Ctrl+Alt+Down / Up move the focused row, the focus follows, an announcement, events with source "keyboard"', async () => {
    const { host, fm, tasks, events } = await mountRowDrag();
    host.focus();
    fm.setFocus(2, 1);
    await userEvent.keyboard('{Control>}{Alt>}{ArrowDown}{/Alt}{/Control}');
    expect(titles(tasks).slice(0, 4)).toEqual([0, 1, 3, 2]);
    expect(fm.getFocus()).toEqual([3, 1]);
    await vi.waitFor(() => expect(liveText()).toBe('Row moved to position 4 of 20'));
    expect(events.map(e => e.type)).toEqual(['start', 'move', 'end']);
    expect(events[2]).toMatchObject({ source: 'keyboard', moved: true, toIndex: 3 });
    await userEvent.keyboard('{Control>}{Alt>}{ArrowUp}{ArrowUp}{ArrowUp}{ArrowUp}{/Alt}{/Control}');
    expect(titles(tasks).slice(0, 4)).toEqual([2, 0, 1, 3]);
    expect(fm.getFocus()).toEqual([0, 1]);   // first position: further keys do nothing
  });

  it('several selected rows move together; sorted: announcement, nothing moves', async () => {
    const { host, fm, sm, tasks, api } = await mountRowDrag();
    host.focus();
    sm.firstClick(1, 0);
    sm.togglePoint(2, 0);
    fm.setFocus(2, 0);
    api.triggerAction('MOVE_ROW_DOWN');
    expect(titles(tasks).slice(0, 4)).toEqual([0, 3, 1, 2]);
    expect(sm.getMergedRowIndices(20)).toEqual([2, 3]);
    api.sortByColumn(1, 'asc');
    const snapshot = titles(tasks);
    fm.setFocus(2, 0);
    expect(api.triggerAction('MOVE_ROW_DOWN')).toBe(true);
    expect(titles(tasks)).toEqual(snapshot);
    await vi.waitFor(() => expect(liveText()).toBe('Rows cannot be moved while the table is sorted or filtered'));
  });

  it('rows without a handle and tables without rowDrag ignore the keys', async () => {
    const columnDefs = [ColumnDef.create({ property: 'title', headerLabel: 'Task' })];
    const { fm, api, tasks } = await mountRowDrag({ columnDefs });
    fm.setFocus(2, 0);
    expect(api.triggerAction('MOVE_ROW_DOWN')).toBe(false);
    expect(titles(tasks).slice(0, 4)).toEqual([0, 1, 2, 3]);
  });

  it('tree: among the siblings', async () => {
    const roots = ['a', 'b', 'c'].map(name => new TreeRow({ name }, true, undefined, undefined));
    const fm = new FocusModel('cell');
    const model = TableFactory.createTableModel({ rows: roots, columnDefs: [ColumnDef.create({ property: 'name', rowDrag: true })] });
    const { api } = mountTable(model, { tableOptions: { getFocusModel: () => fm } });
    await nextFrame();
    fm.setFocus(0, 0);
    api.triggerAction('MOVE_ROW_DOWN');
    expect(roots.map(r => r.data.name)).toEqual(['b', 'a', 'c']);
    expect(fm.getFocus()[0]).toBe(1);
  });
});

describe('range selection unchanged (D12), api, injection', () => {

  it('dragging over normal cells still selects a range and fires no row drag events', async () => {
    const sm = new SelectionModel('range', 'multi');
    const { host, events } = await mountRowDrag({ tableOptions: { getSelectionModel: () => sm } });
    const from = getCellDiv(host, 'body', 'center', 1, 1);
    const to = getCellDiv(host, 'body', 'center', 4, 1);
    await userEvent.dragAndDrop(from, to);
    await nextFrame();
    expect(events).toEqual([]);
    expect(sm.getMergedRowIndices(20)).toEqual([1, 2, 3, 4]);
  });

  it('api.moveRows: number targets, no events; false for invalid input', async () => {
    const { api, tasks, events } = await mountRowDrag();
    expect(api.moveRows(0, 20)).toBe(true);                    // to the end
    expect(tasks[19].id).toBe(0);
    expect(api.moveRows([0, 1], 0)).toBe(false);               // in front of row 0: nothing to move
    expect(tasks[0].id).toBe(1);
    expect(api.moveRows(99, 0)).toBe(false);
    expect(api.moveRows(3, { rowIndex: 1, position: 'before' })).toBe(true);
    expect(tasks[1].id).toBe(4);
    expect(events).toEqual([]);
  });

  it('HTML in the data is shown as text in the ghost', async () => {
    const rows = createTasks(5);
    rows[1].title = '<img src="x" onerror="window.__geXss=1">';
    const { host } = await mountRowDrag({ rows });
    startDrag(host, 1, rowPoint(host, 3));
    const ghost = host.querySelector('.ge-table-row-drag-ghost')!;
    expect(ghost.querySelector('img')).toBeNull();
    expect(ghost.textContent).toBe(rows[1].title);
    drop(rowPoint(host, 3));
    expect((window as unknown as { __geXss?: number }).__geXss).toBeUndefined();
  });

  it('the row number column can be the handle (Excel feel)', async () => {
    const tasks = createTasks(10);
    const model = TableFactory.createTableModel({
      rows: tasks, properties: ['title', 'prio'], rowNumbersVisible: true,
    });
    model.getColumnDefs()![0].rowDrag = true;
    const { host } = mountTable(model, { tableOptions: { getFocusModel: () => new FocusModel('cell') } });
    await nextFrame();
    const numberCell = getCellDiv(host, 'body', 'west', 2, 0);
    const grip = numberCell.querySelector<HTMLElement>('.ge-table-row-drag-handle')!;
    expect(grip).toBeTruthy();
    expect(numberCell.textContent).toBe('3');
    const to = rowPoint(host, 6, 0.8);
    startDrag(host, grip, to);
    drop(to);
    expect(titles(tasks).slice(0, 8)).toEqual([0, 1, 3, 4, 5, 6, 2, 7]);
  });

  it('own ghost text', async () => {
    const { host } = await mountRowDrag({ tableOptions: { rowDragOptions: { ghostText: (rows: Task[]) => `${rows.length} task` } } });
    startDrag(host, 1, rowPoint(host, 3));
    expect(host.querySelector('.ge-table-row-drag-ghost')!.textContent).toBe('1 task');
    drop(rowPoint(host, 3));
  });

  it('touch works like the mouse (pointerType "touch")', async () => {
    const { host, tasks } = await mountRowDrag();
    const to = rowPoint(host, 6, 0.8);
    startDrag(host, 2, to, { pointerType: 'touch', pointerId: 5 });
    drop(to, { pointerType: 'touch', pointerId: 5 });
    expect(titles(tasks).slice(0, 8)).toEqual([0, 1, 3, 4, 5, 6, 2, 7]);
  });
});

describe('edge cases', () => {

  it('an own area model with only moveRows() (no canMoveRows) is moved by the table', async () => {
    class TasksBodyModel extends AreaModel {
      constructor(public tasks: string[]) { super(); }
      override getRowCount(): number { return this.tasks.length; }
      override getValueAt(rowIndex: number): any { return this.tasks[rowIndex]; }
      override getRowHeight(): number { return 34; }
      moveRows(rowIndices: number[], target: RowDropTargetIf): boolean {
        return moveArrayItems(this.tasks, rowIndices, getInsertBeforeIndex(target)) > -1;
      }
    }
    const body = new TasksBodyModel(['a', 'b', 'c', 'd', 'e']);
    const columnDefs = [ColumnDef.create({ property: 'x', headerLabel: 'Task', rowDrag: true })];
    const model = TableFactory.createTableModel({ bodyAreaModel: body, columnDefs, headerData: [['Task']] });
    const { host } = mountTable(model);
    await nextFrame();
    const grip = getCellDiv(host, 'body', 'center', 0, 0).querySelector<HTMLElement>('.ge-table-row-drag-handle')!;
    const r = getCellDiv(host, 'body', 'center', 3, 0).getBoundingClientRect();
    const to = { x: r.left + 40, y: r.top + r.height * 0.8 };
    startDrag(host, grip, to);
    drop(to);
    expect(body.tasks.join('')).toBe('bcdae');
  });

  it('managed without moveRows(): no handles, a warning; unmanaged: handles', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    class PlainBody extends AreaModel {
      override getRowCount(): number { return 3; }
      override getValueAt(rowIndex: number): any { return `r${rowIndex}`; }
      override getRowHeight(): number { return 34; }
    }
    const columnDefs = () => [ColumnDef.create({ property: 'x', headerLabel: 'X', rowDrag: true })];
    const a = mountTable(TableFactory.createTableModel({ bodyAreaModel: new PlainBody(), columnDefs: columnDefs(), headerData: [['X']] }));
    await nextFrame();
    expect(a.host.querySelector('.ge-table-row-drag-handle')).toBeNull();
    expect(warn).toHaveBeenCalled();
    const b = mountTable(TableFactory.createTableModel({ bodyAreaModel: new PlainBody(), columnDefs: columnDefs(), headerData: [['X']] }),
      { tableOptions: { rowDragOptions: { managed: false } } });
    await nextFrame();
    expect(b.host.querySelector('.ge-table-row-drag-handle')).toBeTruthy();
  });

  it('autoScrollZoneInPx: 0 – no auto-scroll', async () => {
    const { host, scope } = await mountRowDrag({ rows: createTasks(500), height: 300, tableOptions: { rowDragOptions: { autoScrollZoneInPx: 0 } } });
    const body = scope.getBodyViewport();
    const bottom = { x: body.left + 100, y: body.top + body.height - 2 };
    startDrag(host, 0, bottom);
    await nextFrame();
    await nextFrame();
    expect(scope.scrollViewport.scrollTop).toBe(0);
    drop(bottom);
  });

  it('pointer events of another pointer during a pending drag are ignored; Escape before the threshold ends it', async () => {
    const { host, events } = await mountRowDrag();
    const h = handle(host, 2);
    const r = h.getBoundingClientRect();
    pointer(h, 'pointerdown', r.left + 4, r.top + 4);
    pointer(document, 'pointermove', r.left + 4, r.top + 60, { pointerId: 9 });
    expect(events).toEqual([]);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    pointer(document, 'pointermove', r.left + 4, r.top + 60);
    expect(events).toEqual([]);
    expect(host.querySelector('.ge-table-row-drag-ghost')).toBeNull();
  });

  it('tree: lower quarter of a row = after it', async () => {
    const roots = ['a', 'b', 'c'].map(name => new TreeRow({ name }, true, undefined, undefined));
    const model = TableFactory.createTableModel({ rows: roots, columnDefs: [ColumnDef.create({ property: 'name', rowDrag: true }),
      ColumnDef.create({ property: 'name', headerLabel: 'again' })] });
    const { host } = mountTable(model);
    await nextFrame();
    const to = rowPoint(host, 1, 0.9);
    startDrag(host, 0, to);
    drop(to);
    expect(roots.map(r => r.data.name)).toEqual(['b', 'a', 'c']);
  });

  it('ghost without a text in the handle column: "Row n"', async () => {
    const rows = createTasks(5);
    rows[2].title = '';
    const { host } = await mountRowDrag({ rows });
    startDrag(host, 2, rowPoint(host, 4));
    expect(host.querySelector('.ge-table-row-drag-ghost')!.textContent).toBe('Row 3');
    drop(rowPoint(host, 4));
  });

  it('keyboard: no focus, while editing, first sibling up – nothing moves', async () => {
    const { fm, api, tasks, scope } = await mountRowDrag();
    expect(api.triggerAction('MOVE_ROW_DOWN')).toBe(false);          // no focus
    fm.setFocus(0, 0);
    expect(api.triggerAction('MOVE_ROW_UP')).toBe(true);             // first row: nothing to do
    expect(titles(tasks).slice(0, 2)).toEqual([0, 1]);
    vi.spyOn(scope, 'isEditing').mockReturnValue(true);
    expect(api.triggerAction('MOVE_ROW_DOWN')).toBe(false);
    expect(titles(tasks).slice(0, 2)).toEqual([0, 1]);
  });

  it('keyboard: preventDefault in start or move – nothing moves; unmanaged: events only', async () => {
    const { fm, api, tasks, listener } = await mountRowDrag();
    fm.setFocus(1, 0);
    listener.onRowDragStart = e => e.preventDefault();
    api.triggerAction('MOVE_ROW_DOWN');
    listener.onRowDragStart = () => undefined;
    listener.onRowDragMove = e => e.preventDefault();
    api.triggerAction('MOVE_ROW_DOWN');
    expect(titles(tasks).slice(0, 3)).toEqual([0, 1, 2]);
    const un = await mountRowDrag({ tableOptions: { rowDragOptions: { managed: false } } });
    const ends: GeRowDragEvent[] = [];
    un.listener.onRowDragEnd = e => ends.push(e);
    un.fm.setFocus(1, 0);
    un.api.triggerAction('MOVE_ROW_DOWN');
    expect(ends[0]).toMatchObject({ type: 'end', moved: false, target: { rowIndex: 2, position: 'after' }, toIndex: 2 });
    expect(titles(un.tasks).slice(0, 3)).toEqual([0, 1, 2]);
  });

  it('an own AriaTextsIf without the row drag texts uses the defaults', async () => {
    const { fm, api } = await mountRowDrag();
    (api.tableScope as unknown as { ariaTexts: object }).ariaTexts = { filtered: () => '' };
    fm.setFocus(1, 0);
    api.triggerAction('MOVE_ROW_DOWN');
    await vi.waitFor(() => expect(liveText()).toBe('Row moved to position 3 of 20'));
  });

  it('pivot tables never get handles (also unmanaged)', async () => {
    const model = PivotFactory.createTableModel({
      rows: [{ r: 'x', c: 'a', v: 1 }, { r: 'y', c: 'b', v: 2 }], rowFields: ['r'], columnFields: ['c'], values: ['v']
    });
    model.getColumnDefs()!.forEach(def => def.rowDrag = true);
    const { host } = mountTable(model, { tableOptions: { rowDragOptions: { managed: false } } });
    await nextFrame();
    expect(host.querySelector('.ge-table-row-drag-handle')).toBeNull();
  });

  it('other keys and a pointercancel of another pointer do not end a drag', async () => {
    const { host, api } = await mountRowDrag();
    startDrag(host, 2, rowPoint(host, 5));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
    pointer(document, 'pointercancel', 0, 0, { pointerId: 4 });
    expect(api.isRowDragging()).toBe(true);
    drop(rowPoint(host, 5));
    expect(api.isRowDragging()).toBe(false);
  });

  it('keyboard: the last row cannot move down', async () => {
    const { fm, api, tasks } = await mountRowDrag({ rows: createTasks(5) });
    fm.setFocus(4, 0);
    expect(api.triggerAction('MOVE_ROW_DOWN')).toBe(true);
    expect(titles(tasks)).toEqual([0, 1, 2, 3, 4]);
  });

  it('keyboard in a tree: a child moves among its siblings, not past the last one', async () => {
    interface Folder { name: string; children?: Folder[] }
    const roots = TreeFactory.buildTreeRows<Folder>([{ name: 'p', children: [{ name: 'c1' }, { name: 'c2' }] }, { name: 'q' }], { expanded: true });
    const fm = new FocusModel('cell');
    const model = TableFactory.createTableModel({ rows: roots, columnDefs: [ColumnDef.create({ property: 'name', rowDrag: true })] });
    const { api } = mountTable(model, { tableOptions: { getFocusModel: () => fm } });
    await nextFrame();
    fm.setFocus(1, 0);                                            // c1
    api.triggerAction('MOVE_ROW_DOWN');
    expect(roots[0].children!.map(r => r.data.name)).toEqual(['c2', 'c1']);
    expect(fm.getFocus()[0]).toBe(2);
    api.triggerAction('MOVE_ROW_DOWN');                           // c1 is the last child: stays
    expect(roots[0].children!.map(r => r.data.name)).toEqual(['c2', 'c1']);
    expect(roots.map(r => r.data.name)).toEqual(['p', 'q']);
  });

  it('auto-scroll at the end of the scroll range keeps the target', async () => {
    const { host, scope, events } = await mountRowDrag({ rows: createTasks(40), height: 300 });
    scope.scrollViewport.scrollTop = 100_000;
    await nextFrame();
    const body = scope.getBodyViewport();
    const rows = renderedRows(host);
    const lastIndex = Number(rows[rows.length - 1].getAttribute('data-row-index'));
    const bottom = { x: body.left + 100, y: body.top + body.height - 2 };
    startDrag(host, lastIndex - 3, bottom);
    await nextFrame();
    await nextFrame();
    drop(bottom);
    expect(events[events.length - 1]).toMatchObject({ type: 'end', moved: true, toIndex: 39 });
  });

  it('own texts for start and "not possible"', async () => {
    const { host, api } = await mountRowDrag({
      tableOptions: { ariaTexts: { rowDragStarted: () => 'Ziehen', rowMoveNotPossible: () => 'Gesperrt' } }
    });
    startDrag(host, 2, rowPoint(host, 4));
    await vi.waitFor(() => expect(liveText()).toBe('Ziehen'));
    drop(rowPoint(host, 4));
    api.sortByColumn(1, 'asc');
    await nextFrame();
    startDrag(host, 2, rowPoint(host, 4));
    drop(rowPoint(host, 4));
    await vi.waitFor(() => expect(liveText()).toBe('Gesperrt'));
  });

  // ---- regressions of the review (design § 7)

  it('listeners may cancel the drag in start and move – no stuck drag, no error', async () => {
    const { host, api, listener, events } = await mountRowDrag();
    listener.onRowDragStart = () => api.cancelRowDrag();
    startDrag(host, 2, rowPoint(host, 5));
    expect(api.isRowDragging()).toBe(false);
    expect(host.querySelector('.ge-table-row-drag-ghost')).toBeNull();
    drop(rowPoint(host, 5));
    listener.onRowDragStart = () => undefined;
    listener.onRowDragMove = () => api.cancelRowDrag();
    startDrag(host, 2, rowPoint(host, 5));
    expect(api.isRowDragging()).toBe(false);
    drop(rowPoint(host, 5));
    listener.onRowDragMove = () => undefined;
    const to = rowPoint(host, 6, 0.8);
    startDrag(host, 2, to);                                  // a new drag works again
    drop(to);
    expect(events[events.length - 1]).toMatchObject({ type: 'end', moved: true });
  });

  it('a drop where the rows are moves nothing (moved false), the selection stays', async () => {
    const { host, tasks, events, sm, api } = await mountRowDrag();
    sm.firstClick(5, 0);
    api.repaint();
    const to = rowPoint(host, 2, 0.8);                        // lower half of its own row
    startDrag(host, 2, to);
    drop(to);
    expect(events[events.length - 1]).toMatchObject({ type: 'end', moved: false, toIndex: 2 });
    expect(titles(tasks).slice(0, 4)).toEqual([0, 1, 2, 3]);
    expect(sm.getMergedRowIndices(20)).toEqual([5]);
  });

  it('api.moveRows refuses while a column is sorted (also unmanaged)', async () => {
    const { api, tasks } = await mountRowDrag({ tableOptions: { rowDragOptions: { managed: false } } });
    api.sortByColumn(1, 'asc');
    const snapshot = titles(tasks);
    expect(api.moveRows(2, 7)).toBe(false);
    expect(titles(tasks)).toEqual(snapshot);
  });

  it('no drag while an editor is open', async () => {
    const { host, api, events } = await mountRowDrag();
    vi.spyOn(api.tableScope, 'isEditing').mockReturnValue(true);
    const down = startDrag(host, 2, rowPoint(host, 5));
    expect(down.defaultPrevented).toBe(false);
    expect(events).toEqual([]);
  });

  it('a double click on a grip does not reach the table', async () => {
    const { host, listener } = await mountRowDrag();
    const clicked = vi.fn();
    listener.onMouseClicked = clicked;
    handle(host, 2).dispatchEvent(new MouseEvent('dblclick', { bubbles: true, detail: 2 }));
    expect(clicked).not.toHaveBeenCalled();
  });

  it('tree: the lower quarter of an expanded node = in front of its first child (where the marker is)', async () => {
    interface Folder { name: string; children?: Folder[] }
    const roots = TreeFactory.buildTreeRows<Folder>([{ name: 'p', children: [{ name: 'c1' }, { name: 'c2' }] }, { name: 'q' }], { expanded: true });
    const model = TableFactory.createTableModel({ rows: roots, columnDefs: [ColumnDef.create({ property: 'name', rowDrag: true }),
      ColumnDef.create({ property: 'name', headerLabel: 'again' })] });
    const { host } = mountTable(model);
    await nextFrame();
    const to = rowPoint(host, 0, 0.9);                        // p, lower quarter
    startDrag(host, 3, to);                                   // q
    drop(to);
    expect(roots.map(r => r.data.name)).toEqual(['p']);
    expect(roots[0].children!.map(r => r.data.name)).toEqual(['q', 'c1', 'c2']);
  });

  it('Escape is announced', async () => {
    const { host } = await mountRowDrag();
    startDrag(host, 2, rowPoint(host, 5));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await vi.waitFor(() => expect(liveText()).toBe('Drag cancelled'));
  });

  it('a big selection (200,000 of 1,000,000 rows) moves in one go and stays selected', async () => {
    const tasks = createTasks(1_000_000);
    const { fm, sm, api } = await mountRowDrag({ rows: tasks });
    sm.addSelection(new CellRange(0, 0, 199_999, 1));
    fm.setFocus(0, 0);
    expect(api.triggerAction('MOVE_ROW_DOWN')).toBe(true);
    expect(tasks[0].id).toBe(200_000);
    expect(tasks[1].id).toBe(0);
    expect(tasks.length).toBe(1_000_000);
    expect(sm.getRanges()).toHaveLength(1);
    expect(sm.isSelected(1, 0) && sm.isSelected(200_000, 0) && !sm.isSelected(0, 0)).toBe(true);
  });

  it('wheel scrolling during a drag updates the target', async () => {
    const { host, scope, events } = await mountRowDrag({ rows: createTasks(200), height: 400 });
    const to = rowPoint(host, 3, 0.8);
    startDrag(host, 1, to);
    const before = events.filter(e => e.type === 'move').length;
    scope.scrollViewport.scrollTop = 34 * 20;
    await vi.waitFor(() => expect(events.filter(e => e.type === 'move').length).toBeGreaterThan(before));
    drop(to);
    expect(events[events.length - 1].target!.rowIndex).toBeGreaterThan(15);
  });

  it('auto-scroll also moves a capped scroll height slowly (fractions are kept)', async () => {
    const { host, scope } = await mountRowDrag({ rows: createTasks(1_000_000), height: 400 });
    expect(scope.isScrollHeightCapped()).toBe(true);
    const body = scope.getBodyViewport();
    const slow = { x: body.left + 100, y: body.top + body.height - 35 };   // outer part of the zone: 1 px per frame
    startDrag(host, 0, slow);
    await vi.waitFor(() => expect(scope.scrollViewport.scrollTop).toBeGreaterThan(0), { timeout: 4000 });
    drop(slow);
  });
});
