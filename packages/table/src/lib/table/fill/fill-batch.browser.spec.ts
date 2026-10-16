// Fill handle and batch edit end to end in Chromium (prompt 010): handle position (fixed columns, scrolling), pointer
// fill H1–H8 (series, copy, ⌥/Alt, not editable cells, editInputPipe, sorted/filtered view, auto-scroll, Escape), one
// event (H9), keyboard Ctrl+D / Ctrl+R, batch edit B1–B8, validation, HTML injection, axe.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AreaModel,
  CellRange,
  RowGroupFactory,
  isAreaModelRowGroups,
  ColumnDef,
  EventAdapter,
  FocusModel,
  LiveAnnouncer,
  SelectionModel,
  TableFactory,
  TrueFn,
  editInputPipeForNumber,
  px100,
} from '@guiexpert/table';
import type {
  ColumnDefIf, GeBatchEditEvent, GeModelChangeEvent, TableOptionsIf, TableModelIf, TreeRowIf,
} from '@guiexpert/table';
import { destroyAllTables, getCellDiv, mountTable, nextFrame } from '../../../../test-utils/mount-table';
import { axeViolations } from '../../../../test-utils/axe';

interface Item { id: number; qty: number | string; name: string; day: string; price: number }

const createItems = (n: number): Item[] => Array.from({ length: n }, (_, i) => ({
  id: i, qty: i === 0 ? 5 : i, name: `Item ${i}`, day: '2026-10-14', price: 10 + i,
}));

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

const defaultColumns = (): ColumnDefIf[] => [
  ColumnDef.create({ property: 'id', headerLabel: 'Id', width: px100 }),                                   // 0: not editable
  ColumnDef.create({ property: 'qty', headerLabel: 'Qty', width: px100, editable: TrueFn }),               // 1
  ColumnDef.create({ property: 'name', headerLabel: 'Name', width: px100, editable: TrueFn }),             // 2
  ColumnDef.create({ property: 'day', headerLabel: 'Day', width: px100, editable: TrueFn }),               // 3
  ColumnDef.create({ property: 'price', headerLabel: 'Price', width: px100, editable: TrueFn,
    editInputPipe: editInputPipeForNumber }),                                                                // 4
];

interface MountOpts {
  items?: Item[];
  columnDefs?: ColumnDefIf[];
  tableOptions?: Partial<TableOptionsIf>;
  model?: TableModelIf;
  height?: number;
  width?: number;
}

async function mountFill(opts: MountOpts = {}) {
  const items = opts.items ?? createItems(30);
  const sm = new SelectionModel('range', 'multi');
  const fm = new FocusModel('cell');
  const modelEvents: GeModelChangeEvent[] = [];
  const batchEvents: GeBatchEditEvent[] = [];
  const listener = new EventAdapter();
  listener.onModelChanged = e => modelEvents.push(e);
  listener.onBatchEditChanged = e => batchEvents.push(e);
  const model = opts.model ?? TableFactory.createTableModel({ rows: items, columnDefs: opts.columnDefs ?? defaultColumns() });
  const table = mountTable(model, {
    eventListener: listener,
    height: opts.height,
    width: opts.width,
    tableOptions: { getSelectionModel: () => sm, getFocusModel: () => fm, fillHandle: true, ...opts.tableOptions },
  });
  await nextFrame();
  return { ...table, items, sm, fm, modelEvents, batchEvents, model };
}

function select(t: { sm: SelectionModel; api: { repaint(): void } }, r1: number, c1: number, r2: number, c2: number) {
  t.sm.clear();
  t.sm.addSelection(new CellRange(r1, c1, r2, c2));
  t.api.repaint();
}

const fillHandle = (host: HTMLElement) => host.querySelector<HTMLElement>('.ge-table-fill-handle');
const preview = (host: HTMLElement) => host.querySelector<HTMLElement>('.ge-table-fill-preview');
const liveText = () => document.querySelector('[role="status"][aria-live="polite"]')?.textContent ?? '';

function pointer(target: EventTarget, type: string, x: number, y: number, init: PointerEventInit = {}): PointerEvent {
  const evt = new PointerEvent(type, {
    bubbles: true, cancelable: true, composed: true, clientX: x, clientY: y,
    pointerId: 1, pointerType: 'mouse', button: 0, buttons: type === 'pointerup' ? 0 : 1, isPrimary: true, ...init,
  });
  target.dispatchEvent(evt);
  return evt;
}

function center(el: Element): { x: number; y: number } {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

/** Drags the fill handle to the center of a body cell (center area) and drops it there. */
function dragHandleTo(host: HTMLElement, rowIndex: number, columnIndex: number, init: PointerEventInit = {}, drop = true) {
  const h = fillHandle(host)!;
  const start = center(h);
  pointer(h, 'pointerdown', start.x, start.y, init);
  pointer(document, 'pointermove', start.x + 2, start.y + 6, init);
  const to = center(getCellDiv(host, 'body', 'center', rowIndex, columnIndex));
  pointer(document, 'pointermove', to.x, to.y, init);
  if (drop) pointer(document, 'pointerup', to.x, to.y, init);
  return to;
}

function keydown(host: HTMLElement, key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const evt = new KeyboardEvent('keydown', { key, code: `Key${key.toUpperCase()}`, bubbles: true, cancelable: true, ...init });
  host.dispatchEvent(evt);
  return evt;
}

const qtys = (items: Item[]) => items.map(i => i.qty);

describe('fill handle', () => {

  it('sits on the bottom right corner of the last range, hidden for screen readers', async () => {
    const t = await mountFill();
    expect(fillHandle(t.host)).toBeNull(); // nothing selected yet
    select(t, 1, 1, 2, 2);
    const h = fillHandle(t.host)!;
    expect(h.style.display).toBe('block');
    expect(h.getAttribute('aria-hidden')).toBe('true');
    expect(h.getAttribute('data-ge-action')).toBe('fill-handle');
    const cell = getCellDiv(t.host, 'body', 'center', 2, 2).getBoundingClientRect();
    const hc = center(h);
    expect(Math.abs(hc.x - cell.right)).toBeLessThanOrEqual(1.5);
    expect(Math.abs(hc.y - cell.bottom)).toBeLessThanOrEqual(1.5);
    expect(t.host.getAttribute('aria-keyshortcuts')).toBe('Control+D Control+R');
  });

  it('several ranges: only the last one has the handle', async () => {
    const t = await mountFill();
    t.sm.addSelection(new CellRange(0, 1, 0, 1));
    t.sm.addSelection(new CellRange(4, 2, 5, 3));
    t.api.repaint();
    const cell = getCellDiv(t.host, 'body', 'center', 5, 3).getBoundingClientRect();
    expect(Math.abs(center(fillHandle(t.host)!).x - cell.right)).toBeLessThanOrEqual(1.5);
  });

  it('follows scrolling and hides when the corner is scrolled out', async () => {
    const t = await mountFill({ items: createItems(200) });
    select(t, 1, 1, 1, 1);
    t.api.scrollToIndex(-1, 1);
    await nextFrame();
    const cell = getCellDiv(t.host, 'body', 'center', 1, 1).getBoundingClientRect();
    expect(Math.abs(center(fillHandle(t.host)!).y - cell.bottom)).toBeLessThanOrEqual(1.5);
    t.api.scrollToIndex(-1, 100);
    await nextFrame();
    expect(fillHandle(t.host)!.style.display).toBe('none');
  });

  it('fixed west columns: the handle of a west cell stays while the center scrolls horizontally', async () => {
    const columnDefs = Array.from({ length: 20 }, (_, i) => ColumnDef.create({
      property: i === 0 ? 'qty' : `c${i}`, headerLabel: `C${i}`, width: px100, editable: TrueFn,
    }));
    const model = TableFactory.createTableModel({ rows: createItems(10), columnDefs, fixedLeftColumnCount: 1 });
    const t = await mountFill({ model });
    select(t, 0, 0, 0, 0);
    const before = center(fillHandle(t.host)!);
    t.api.scrollToPixel(600, 0);
    await nextFrame();
    const after = center(fillHandle(t.host)!);
    expect(after.x).toBeCloseTo(before.x, 0);
    const cell = getCellDiv(t.host, 'body', 'west', 0, 0).getBoundingClientRect();
    expect(Math.abs(after.x - cell.right)).toBeLessThanOrEqual(1.5);
    // a center column scrolled out to the left: no handle
    select(t, 0, 2, 0, 2);
    t.api.scrollToPixel(1200, 0);
    await nextFrame();
    expect(fillHandle(t.host)!.style.display).toBe('none');
  });

  it('no handle: without fillHandle option, with selection type "cell", while editing', async () => {
    const t = await mountFill({ tableOptions: { fillHandle: undefined } });
    select(t, 1, 1, 1, 1);
    expect(fillHandle(t.host)).toBeNull();
    expect(t.host.hasAttribute('aria-keyshortcuts')).toBe(false);

    const t2 = await mountFill({ tableOptions: { getSelectionModel: () => new SelectionModel('cell', 'single') } });
    t2.api.getSelectionModel()?.addSelection(new CellRange(1, 1, 1, 1));
    t2.api.repaint();
    expect(fillHandle(t2.host)?.style.display ?? 'none').toBe('none');

    const t3 = await mountFill();
    select(t3, 1, 1, 1, 1);
    t3.scope.initRenderEditor(1, 1);
    await nextFrame();
    expect(fillHandle(t3.host)!.style.display).toBe('none');
  });

  it('H1: one number dragged 3 rows down is copied – one onModelChanged with all cells (H9)', async () => {
    const t = await mountFill();
    select(t, 0, 1, 0, 1);       // qty 5
    dragHandleTo(t.host, 3, 1);
    expect(qtys(t.items).slice(0, 5)).toEqual([5, 5, 5, 5, 4]);
    expect(t.modelEvents).toHaveLength(1);
    const evt = t.modelEvents[0];
    expect(evt.source).toBe('fill');
    expect(evt.cells.map(c => [c.rowIndex, c.columnIndex])).toEqual([[1, 1], [2, 1], [3, 1]]);
    expect(evt.changes!.map(c => [c.property, c.oldValue, c.newValue])).toEqual([['qty', 1, 5], ['qty', 2, 5], ['qty', 3, 5]]);
    expect(evt.changes![0].row).toBe(t.items[1]);
    // the selection is source + filled cells (like a spreadsheet)
    expect(t.sm.getRanges()).toEqual([new CellRange(0, 1, 3, 1)]);
    await vi.waitFor(() => expect(liveText()).toBe('3 cells filled'));
  });

  it('H2: 1, 2 continue as 3, 4, 5; with ⌥/Alt they are copied', async () => {
    const t = await mountFill();
    t.items[0].qty = 1;
    t.items[1].qty = 2;
    t.api.repaint();
    select(t, 0, 1, 1, 1);
    dragHandleTo(t.host, 4, 1);
    expect(qtys(t.items).slice(0, 6)).toEqual([1, 2, 3, 4, 5, 5]);

    select(t, 0, 1, 1, 1);
    dragHandleTo(t.host, 4, 1, { altKey: true });
    expect(qtys(t.items).slice(0, 6)).toEqual([1, 2, 1, 2, 1, 5]);
  });

  it('H3 + H4: dates count by days in their format, "Item 9" → "Item 10"', async () => {
    const t = await mountFill();
    t.items[0].name = 'Item 9';
    t.api.repaint();
    select(t, 0, 2, 0, 3);
    dragHandleTo(t.host, 2, 3);
    expect(t.items.slice(0, 3).map(i => i.name)).toEqual(['Item 9', 'Item 10', 'Item 11']);
    expect(t.items.slice(0, 3).map(i => i.day)).toEqual(['2026-10-14', '2026-10-15', '2026-10-16']);
  });

  it('fills to the right and up; the axis follows the pointer', async () => {
    const t = await mountFill();
    t.items[5].qty = 'Item 1';
    t.api.repaint();
    select(t, 5, 1, 5, 1);
    dragHandleTo(t.host, 5, 3);   // right: name, day
    expect([t.items[5].name, t.items[5].day]).toEqual(['Item 2', 'Item 3']);
    select(t, 5, 1, 5, 1);
    dragHandleTo(t.host, 3, 1);   // up
    expect([t.items[3].qty, t.items[4].qty]).toEqual(['Item 1', 'Item 0']);
  });

  it('direction "vertical": dragging right fills nothing', async () => {
    const t = await mountFill({ tableOptions: { fillHandle: { direction: 'vertical' } } });
    select(t, 1, 1, 1, 1);
    dragHandleTo(t.host, 1, 3);
    expect(t.modelEvents).toHaveLength(0);
    expect(t.host.getAttribute('aria-keyshortcuts')).toBe('Control+D');
  });

  it('H5: not editable cells (editable false, calculated column without valueSetter) are skipped', async () => {
    const columnDefs = [
      ...defaultColumns(),
      ColumnDef.create({ property: 'total', headerLabel: 'Total', width: px100, editable: TrueFn,
        valueGetter: (row: Item) => row.price * 2 }),                                                    // 5
    ];
    const t = await mountFill({ columnDefs });
    select(t, 0, 0, 0, 1);         // id (not editable) + qty
    dragHandleTo(t.host, 2, 1);
    expect(t.items.slice(0, 3).map(i => i.id)).toEqual([0, 1, 2]);
    expect(qtys(t.items).slice(0, 3)).toEqual([5, 5, 5]);
    expect(t.modelEvents[0].cells.every(c => c.columnIndex === 1)).toBe(true);

    select(t, 0, 5, 0, 5);
    dragHandleTo(t.host, 2, 5);
    expect(t.modelEvents).toHaveLength(1); // nothing written
    expect(t.items[1]).not.toHaveProperty('total');
  });

  it('H6: values run through editInputPipe', async () => {
    const t = await mountFill();
    t.api.applyCellChanges([{ rowIndex: 0, column: 'price', value: '7' }]);
    expect(t.items[0].price).toBe(7);
    select(t, 0, 4, 0, 4);
    dragHandleTo(t.host, 2, 4);
    expect(t.items.slice(0, 3).map(i => i.price)).toEqual([7, 7, 7]);
  });

  it('H7: sorted and filtered – the shown rows in display order are filled', async () => {
    const t = await mountFill({ tableOptions: { externalFilterFunction: (row: Item) => row.id % 2 === 0 } });
    t.api.externalFilterChanged();
    t.api.sortByColumn('id', 'desc');
    await nextFrame();
    // shown: 28, 26, 24 …
    select(t, 0, 2, 0, 2);
    dragHandleTo(t.host, 2, 2);
    expect([t.items[28].name, t.items[26].name, t.items[24].name, t.items[27].name])
      .toEqual(['Item 28', 'Item 29', 'Item 30', 'Item 27']);
  });

  it('H8: dragging below the body scrolls automatically; Escape cancels without changes', async () => {
    const t = await mountFill({ items: createItems(10_000), height: 300 });
    select(t, 0, 1, 0, 1);
    const h = fillHandle(t.host)!;
    const start = center(h);
    pointer(h, 'pointerdown', start.x, start.y);
    pointer(document, 'pointermove', start.x, start.y + 8);
    const hostRect = t.host.getBoundingClientRect();
    pointer(document, 'pointermove', start.x, hostRect.bottom + 30);
    expect(t.api.isFilling()).toBe(true);
    expect(t.host.classList.contains('ge-table-fill-active')).toBe(true);
    expect(preview(t.host)!.getAttribute('aria-hidden')).toBe('true');
    await vi.waitFor(() => expect(t.scope.scrollViewport.scrollTop).toBeGreaterThan(200));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    expect(t.api.isFilling()).toBe(false);
    expect(preview(t.host)).toBeNull();
    expect(t.host.classList.contains('ge-table-fill-active')).toBe(false);
    pointer(document, 'pointerup', start.x, hostRect.bottom + 30);
    expect(t.modelEvents).toHaveLength(0);
    expect(qtys(t.items).slice(0, 3)).toEqual([5, 1, 2]);
  });

  it('dropping back on the source fills nothing; a click on the handle keeps the selection', async () => {
    const t = await mountFill();
    select(t, 2, 1, 2, 1);
    const h = fillHandle(t.host)!;
    const p = center(h);
    pointer(h, 'pointerdown', p.x, p.y);
    pointer(document, 'pointerup', p.x, p.y);
    h.click();
    expect(t.sm.getRanges()).toEqual([new CellRange(2, 1, 2, 1)]);
    dragHandleTo(t.host, 2, 1);
    expect(t.modelEvents).toHaveLength(0);
  });

  it('a range selection by dragging over cells still works (the handle uses pointer events)', async () => {
    const t = await mountFill();
    select(t, 0, 1, 0, 1);
    const c = getCellDiv(t.host, 'body', 'center', 4, 2);
    const p = center(c);
    c.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: p.x, clientY: p.y, button: 0 }));
    expect(t.modelEvents).toHaveLength(0);
  });

  it('maxCells: a bigger fill is refused and announced', async () => {
    const t = await mountFill({ tableOptions: { fillHandle: { maxCells: 2 } } });
    select(t, 0, 1, 0, 1);
    dragHandleTo(t.host, 5, 1);
    expect(t.modelEvents).toHaveLength(0);
    await vi.waitFor(() => expect(liveText()).toBe('Too many cells to fill (at most 2)'));
    expect(t.api.fillRange(new CellRange(0, 1, 0, 1), 'down', 2)).toBe(2);
  });

  it('an own fillValue function', async () => {
    const t = await mountFill({ tableOptions: { fillHandle: { fillValue: ctx => ctx.property === 'name' ? `#${ctx.step}` : undefined } } });
    select(t, 0, 1, 0, 2);
    dragHandleTo(t.host, 2, 2);
    expect(t.items.slice(1, 3).map(i => [i.qty, i.name])).toEqual([[5, '#1'], [5, '#2']]);
  });

  it('HTML in a filled value stays text', async () => {
    const t = await mountFill();
    t.items[0].name = '<img src="x" onerror="window.__geXss=1">';
    t.api.repaint();
    select(t, 0, 2, 0, 2);
    dragHandleTo(t.host, 1, 2);
    await nextFrame();
    const cell = getCellDiv(t.host, 'body', 'center', 1, 2);
    expect(cell.querySelector('img')).toBeNull();
    expect(cell.textContent).toContain('<img');
    expect((window as unknown as { __geXss?: number }).__geXss).toBeUndefined();
  });

  it('axe finds nothing with a handle and a preview', async () => {
    const t = await mountFill();
    select(t, 1, 1, 2, 2);
    dragHandleTo(t.host, 4, 2, {}, false);
    expect(preview(t.host)).not.toBeNull();
    expect(await axeViolations(t.host)).toEqual([]);
    t.api.cancelFill();
  });

  it('destroy removes handle and preview', async () => {
    const t = await mountFill();
    select(t, 1, 1, 1, 1);
    dragHandleTo(t.host, 3, 1, {}, false);
    t.api.destroy();
    expect(fillHandle(t.host)).toBeNull();
    expect(preview(t.host)).toBeNull();
  });
});

describe('keyboard: Ctrl+D, Ctrl+R', () => {

  it('Ctrl+D copies the top row of the range down (a series is copied, not continued)', async () => {
    const t = await mountFill();
    select(t, 1, 1, 3, 2);
    const evt = keydown(t.host, 'd', { ctrlKey: true });
    expect(evt.defaultPrevented).toBe(true);
    expect(t.items.slice(1, 4).map(i => [i.qty, i.name])).toEqual([[1, 'Item 1'], [1, 'Item 1'], [1, 'Item 1']]);
    expect(t.modelEvents).toHaveLength(1);
  });

  it('Ctrl+D on one row copies the cell above; Ctrl+R on one column the cell left of it', async () => {
    const t = await mountFill();
    select(t, 2, 2, 2, 2);
    keydown(t.host, 'd', { ctrlKey: true });
    expect(t.items[2].name).toBe('Item 1');
    expect(t.sm.getRanges()).toEqual([new CellRange(2, 2, 2, 2)]);
    select(t, 4, 3, 4, 3);
    keydown(t.host, 'r', { ctrlKey: true });
    expect(t.items[4].day).toBe('Item 4');
  });

  it('without fill handle or range the browser keeps its key (bookmark, reload)', async () => {
    const t = await mountFill({ tableOptions: { fillHandle: false } });
    select(t, 1, 1, 2, 1);
    expect(keydown(t.host, 'd', { ctrlKey: true }).defaultPrevented).toBe(false);
    const t2 = await mountFill();
    expect(keydown(t2.host, 'r', { ctrlKey: true }).defaultPrevented).toBe(false);
  });
});

describe('batch edit', () => {

  it('B1 + B2: edited cells are marked, the data stays; getPendingChanges lists row, property, old and new value', async () => {
    const t = await mountFill({ tableOptions: { batchEdit: true } });
    expect(t.api.isBatchEditing()).toBe(true);
    t.api.applyCellChanges([
      { rowIndex: 0, column: 'name', value: 'A' },
      { rowIndex: 1, column: 'price', value: '99' },
      { rowIndex: 2, column: 2, value: 'C' },
    ]);
    await nextFrame();
    expect(t.items[0].name).toBe('Item 0');
    expect(t.items[1].price).toBe(11);
    expect(t.modelEvents).toHaveLength(0);
    const cell = getCellDiv(t.host, 'body', 'center', 0, 2);
    expect(cell.textContent).toBe('A');
    expect(cell.classList.contains('ge-table-cell-pending')).toBe(true);
    expect(getCellDiv(t.host, 'body', 'center', 1, 4).textContent).toBe('99');
    expect(t.api.hasPendingChanges()).toBe(true);
    const pending = t.api.getPendingChanges();
    expect(pending.map(c => [c.row, c.rowIndex, c.columnIndex, c.property, c.oldValue, c.newValue])).toEqual([
      [t.items[0], 0, 2, 'name', 'Item 0', 'A'],
      [t.items[1], 1, 4, 'price', 11, 99],   // after the editInputPipe
      [t.items[2], 2, 2, 'name', 'Item 2', 'C'],
    ]);
    expect(t.batchEvents.map(e => [e.type, e.changes.length, e.pendingCount])).toEqual([['change', 3, 3]]);
    await vi.waitFor(() => expect(liveText()).toBe('3 changes not saved'));
  });

  it('B3: commit writes all values – one onModelChanged, the marks are gone', async () => {
    const t = await mountFill({ tableOptions: { batchEdit: true } });
    t.api.applyCellChanges([{ rowIndex: 0, column: 'name', value: 'A' }, { rowIndex: 1, column: 'price', value: '99' }]);
    expect(t.api.commitBatchEdit()).toBe(true);
    expect(t.items[0].name).toBe('A');
    expect(t.items[1].price).toBe(99);   // the pipe ran once
    expect(t.modelEvents).toHaveLength(1);
    expect(t.modelEvents[0].source).toBe('commit');
    expect(t.modelEvents[0].changes!.map(c => [c.property, c.oldValue, c.newValue])).toEqual([['name', 'Item 0', 'A'], ['price', 11, 99]]);
    await nextFrame();
    expect(t.host.querySelector('.ge-table-cell-pending')).toBeNull();
    expect(t.api.hasPendingChanges()).toBe(false);
    expect(t.api.isBatchEditing()).toBe(true);   // tableOptions.batchEdit: always on
    expect(t.batchEvents.at(-1)!.type).toBe('commit');
    await vi.waitFor(() => expect(liveText()).toBe('2 changes saved'));
  });

  it('B4: cancel discards everything; startBatchEdit ends with cancel', async () => {
    const t = await mountFill();
    expect(t.api.isBatchEditing()).toBe(false);
    expect(t.api.startBatchEdit()).toBe(true);
    expect(t.api.startBatchEdit()).toBe(false);
    t.api.applyCellChanges([{ rowIndex: 0, column: 'name', value: 'A' }]);
    await nextFrame();
    expect(getCellDiv(t.host, 'body', 'center', 0, 2).textContent).toBe('A');
    t.api.cancelBatchEdit();
    await nextFrame();
    expect(getCellDiv(t.host, 'body', 'center', 0, 2).textContent).toBe('Item 0');
    expect(t.items[0].name).toBe('Item 0');
    expect(t.api.isBatchEditing()).toBe(false);
    expect(t.batchEvents.map(e => e.type)).toEqual(['start', 'change', 'cancel']);
    expect(t.batchEvents[2].changes.map(c => c.newValue)).toEqual(['A']);
    // after the cancel values are written directly again
    t.api.applyCellChanges([{ rowIndex: 0, column: 'name', value: 'B' }]);
    expect(t.items[0].name).toBe('B');
  });

  it('B5: sorting and filtering keep the changes on their rows', async () => {
    const t = await mountFill({ tableOptions: { batchEdit: true } });
    t.api.applyCellChanges([{ rowIndex: 3, column: 'name', value: 'three' }]);
    t.api.sortByColumn('id', 'desc');
    await nextFrame();
    const index = t.api.getPendingChanges()[0].rowIndex;
    expect(index).toBe(26);
    t.api.scrollToIndex(-1, 20);
    await nextFrame();
    expect(getCellDiv(t.host, 'body', 'center', 26, 2).textContent).toBe('three');
    expect(getCellDiv(t.host, 'body', 'center', 25, 2).textContent).toBe('Item 4');

    t.scope.tableOptions.externalFilterFunction = (row: Item) => row.id !== 3;
    t.api.externalFilterChanged();
    expect(t.api.getPendingChanges()[0].rowIndex).toBe(-1);   // hidden by the filter
    expect(t.api.commitBatchEdit()).toBe(true);
    expect(t.items[3].name).toBe('three');                      // written into the hidden row
    expect(t.modelEvents[0].changes![0]).toMatchObject({ row: t.items[3], rowIndex: -1, property: 'name' });
  });

  it('B6: the fill handle marks values in a batch edit (using pending source values)', async () => {
    const t = await mountFill({ tableOptions: { batchEdit: true } });
    t.api.applyCellChanges([{ rowIndex: 0, column: 'qty', value: 1 }, { rowIndex: 1, column: 'qty', value: 2 }]);
    select(t, 0, 1, 1, 1);
    dragHandleTo(t.host, 3, 1);
    expect(qtys(t.items).slice(0, 4)).toEqual([5, 1, 2, 3]);   // unchanged data
    expect(t.api.getPendingChanges().map(c => [c.rowIndex, c.newValue])).toEqual([[0, 1], [1, 2], [2, 3], [3, 4]]);
    expect(t.modelEvents).toHaveLength(0);
  });

  it('B7: invalid values are marked with the message and block the commit', async () => {
    const columnDefs = defaultColumns();
    columnDefs[4].validate = (v: unknown) => typeof v === 'number' && v >= 0 ? undefined : 'A price is a number ≥ 0';
    const t = await mountFill({ columnDefs, tableOptions: { batchEdit: true } });
    t.api.applyCellChanges([{ rowIndex: 0, column: 'price', value: '-3' }, { rowIndex: 1, column: 'name', value: 'ok' }]);
    await nextFrame();
    const cell = getCellDiv(t.host, 'body', 'center', 0, 4);
    expect(cell.classList.contains('ge-table-cell-invalid')).toBe(true);
    expect(cell.getAttribute('title')).toBe('A price is a number ≥ 0');
    expect(cell.getAttribute('aria-invalid')).toBe('true');
    expect(t.api.getPendingChanges()[0].error).toBe('A price is a number ≥ 0');
    expect(t.batchEvents[0].invalidCount).toBe(1);
    expect(t.api.commitBatchEdit()).toBe(false);
    expect(t.items[1].name).toBe('Item 1');
    await vi.waitFor(() => expect(liveText()).toBe('1 invalid value – nothing saved'));
    t.api.applyCellChanges([{ rowIndex: 0, column: 'price', value: '3' }]);
    expect(t.api.commitBatchEdit()).toBe(true);
    expect([t.items[0].price, t.items[1].name]).toEqual([3, 'ok']);
  });

  it('B7 option: blockCommitOnInvalid false writes invalid values too', async () => {
    const columnDefs = defaultColumns();
    columnDefs[2].validate = () => 'never valid';
    const t = await mountFill({ columnDefs, tableOptions: { batchEdit: { blockCommitOnInvalid: false } } });
    t.api.applyCellChanges([{ rowIndex: 0, column: 'name', value: 'x' }]);
    expect(t.api.commitBatchEdit()).toBe(true);
    expect(t.items[0].name).toBe('x');
  });

  it('without batch edit an invalid value is not written (and announced)', async () => {
    const columnDefs = defaultColumns();
    columnDefs[2].validate = (v: unknown) => String(v).length > 3 ? 'At most 3 characters' : undefined;
    const t = await mountFill({ columnDefs });
    const written = t.api.applyCellChanges([{ rowIndex: 0, column: 'name', value: 'long text' }, { rowIndex: 1, column: 'name', value: 'abc' }]);
    expect(written.map(c => c.newValue)).toEqual(['abc']);
    expect(t.items[0].name).toBe('Item 0');
    await vi.waitFor(() => expect(liveText()).toBe('Invalid value: At most 3 characters'));
  });

  it('B8: back to the original value is no change anymore', async () => {
    const t = await mountFill({ tableOptions: { batchEdit: true } });
    t.api.applyCellChanges([{ rowIndex: 0, column: 'price', value: '20' }]);
    t.api.applyCellChanges([{ rowIndex: 0, column: 'price', value: '30' }]);
    expect(t.api.getPendingChanges()[0]).toMatchObject({ oldValue: 10, newValue: 30 });
    t.api.applyCellChanges([{ rowIndex: 0, column: 'price', value: '10' }]);
    expect(t.api.hasPendingChanges()).toBe(false);
    await nextFrame();
    expect(getCellDiv(t.host, 'body', 'center', 0, 4).classList.contains('ge-table-cell-pending')).toBe(false);
    expect(t.batchEvents.at(-1)!.pendingCount).toBe(0);
    await vi.waitFor(() => expect(liveText()).toBe('No unsaved changes'));
  });

  it('the cell editor marks instead of writing; the editor shows the pending value', async () => {
    const t = await mountFill({ tableOptions: { batchEdit: true } });
    t.scope.updateModelValueAfterEdit('body', 0, 2, 'edited');
    expect(t.items[0].name).toBe('Item 0');
    expect(t.api.getPendingChanges()[0].newValue).toBe('edited');
    t.scope.initRenderEditor(0, 2);
    await nextFrame();
    expect(t.host.querySelector<HTMLInputElement>('input.ge-table-cell-editor-input')!.value).toBe('edited');
  });

  it('a commit without pending values ends a started batch edit', async () => {
    const t = await mountFill();
    t.api.startBatchEdit();
    expect(t.api.commitBatchEdit()).toBe(true);
    expect(t.api.isBatchEditing()).toBe(false);
    expect(t.modelEvents).toHaveLength(0);
  });

  it('tree: the data of the tree row is the key; commit writes into it', async () => {
    const roots = [{ name: 'A', qty: 1, children: [{ name: 'A1', qty: 2 }] }];
    const columnDefs = [
      ColumnDef.create({ property: 'name', headerLabel: 'Name', width: px100, editable: TrueFn }),
      ColumnDef.create({ property: 'qty', headerLabel: 'Qty', width: px100, editable: TrueFn }),
    ];
    const { TreeFactory } = await import('@guiexpert/table');
    const treeRows = TreeFactory.buildTreeRows(roots, 'children');
    const model = TableFactory.createTableModel({ rows: treeRows, columnDefs });
    const t = await mountFill({ model, tableOptions: { batchEdit: true } });
    t.api.applyCellChanges([{ rowIndex: 1, column: 'qty', value: 7 }]);
    const [change] = t.api.getPendingChanges();
    expect(change.row).toBe(roots[0].children[0]);
    expect((t.model.getBodyModel().getRowByIndex(1) as TreeRowIf<typeof roots[0]>).data.qty).toBe(2);
    t.api.commitBatchEdit();
    expect(roots[0].children[0].qty).toBe(7);
  });

  it('HTML in a pending value stays text', async () => {
    const t = await mountFill({ tableOptions: { batchEdit: true } });
    t.api.applyCellChanges([{ rowIndex: 0, column: 'name', value: '<img src="x" onerror="window.__geXss=1">' }]);
    await nextFrame();
    const cell = getCellDiv(t.host, 'body', 'center', 0, 2);
    expect(cell.querySelector('img')).toBeNull();
    expect((window as unknown as { __geXss?: number }).__geXss).toBeUndefined();
  });

  it('axe finds nothing with pending and invalid cells', async () => {
    const columnDefs = defaultColumns();
    columnDefs[2].validate = () => 'bad';
    const t = await mountFill({ columnDefs, tableOptions: { batchEdit: true } });
    t.api.applyCellChanges([{ rowIndex: 0, column: 'name', value: 'x' }, { rowIndex: 1, column: 'qty', value: 3 }]);
    await nextFrame();
    expect(await axeViolations(t.host)).toEqual([]);
  });
});

describe('editing and onModelChanged (compatibility)', () => {

  it('the editor still reports one event per edit with createSingle cells – plus changes and source', async () => {
    const t = await mountFill();
    t.scope.updateModelValueAfterEdit('body', 2, 2, 'new');
    expect(t.items[2].name).toBe('new');
    expect(t.modelEvents).toHaveLength(1);
    expect(t.modelEvents[0].cells).toEqual([{ rowIndex: 2, columnIndex: 2 }]);
    expect(t.modelEvents[0].source).toBe('edit');
    expect(t.modelEvents[0].changes![0]).toMatchObject({ oldValue: 'Item 2', newValue: 'new', property: 'name' });
  });

  it('applyCellChanges ignores rows and columns out of range and unknown properties', async () => {
    const t = await mountFill();
    expect(t.api.applyCellChanges([
      { rowIndex: -1, column: 1, value: 1 }, { rowIndex: 999, column: 1, value: 1 },
      { rowIndex: 0, column: 'nope', value: 1 }, { rowIndex: 0, column: 99, value: 1 },
    ])).toEqual([]);
    expect(t.modelEvents).toHaveLength(0);
  });
});

describe('batch edit – special rows and columns', () => {

  it('commit of hidden rows: property path and calculated column with valueSetter are written into the objects', async () => {
    interface Deep extends Item { meta: { note: string } }
    const items = createItems(10).map(i => ({ ...i, meta: { note: `n${i.id}` } })) as Deep[];
    const columnDefs = [
      ColumnDef.create({ property: 'id', headerLabel: 'Id', width: px100 }),
      ColumnDef.create({ property: 'meta.note', headerLabel: 'Note', width: px100, editable: TrueFn }),
      ColumnDef.create({ property: 'double', headerLabel: 'Double', width: px100, editable: TrueFn,
        valueGetter: (r: Deep) => r.price * 2, valueSetter: (r: Deep, v: unknown) => { r.price = Number(v) / 2; } }),
      ColumnDef.create({ property: 'ro', headerLabel: 'Calc', width: px100, editable: TrueFn,
        valueGetter: (r: Deep) => r.id }),
    ];
    const t = await mountFill({ model: TableFactory.createTableModel({ rows: items, columnDefs }),
      tableOptions: { batchEdit: true } });
    t.api.applyCellChanges([{ rowIndex: 3, column: 'meta.note', value: 'deep' }, { rowIndex: 3, column: 'double', value: 100 }]);
    expect(t.api.getPendingChanges()).toHaveLength(2);
    t.scope.tableOptions.externalFilterFunction = (row: Deep) => row.id !== 3;
    t.api.externalFilterChanged();
    expect(t.api.commitBatchEdit()).toBe(true);
    expect(items[3].meta.note).toBe('deep');
    expect(items[3].price).toBe(50);
    expect(t.modelEvents[0].changes!.map(c => c.rowIndex)).toEqual([-1, -1]);
  });

  it('an own AreaModel without row objects: the row index is the key', async () => {
    const data = [[1, 2], [3, 4], [5, 6]];
    class OwnBody extends AreaModel {
      constructor() { super(); this.areaIdent = 'body'; }
      override getRowCount(): number { return data.length; }
      override getRowHeight(): number { return 30; }
      override getValueAt(r: number, c: number): any { return data[r]?.[c]; }
      override isEditable(): boolean { return true; }
      override setValue(r: number, c: number, v: any): boolean { data[r][c] = v; return true; }
    }
    const model = TableFactory.createTableModel({
      bodyAreaModel: new OwnBody(),
      columnDefs: [new ColumnDef('', 'A', px100), new ColumnDef('', 'B', px100)],
    });
    const t = await mountFill({ model, tableOptions: { batchEdit: true } });
    t.api.applyCellChanges([{ rowIndex: 1, column: 1, value: 40 }]);
    const [change] = t.api.getPendingChanges();
    expect(change).toMatchObject({ row: undefined, rowIndex: 1, columnIndex: 1, property: '#1', oldValue: 4, newValue: 40 });
    await nextFrame();
    expect(getCellDiv(t.host, 'body', 'center', 1, 1).textContent).toBe('40');
    t.api.commitBatchEdit();
    expect(data[1][1]).toBe(40);
  });

  it('cancel without a batch edit does nothing', async () => {
    const t = await mountFill();
    t.api.cancelBatchEdit();
    expect(t.batchEvents).toHaveLength(0);
    expect(t.api.getPendingChanges()).toEqual([]);
    expect(t.api.hasPendingChanges()).toBe(false);
  });
});

describe('fill handle – pointer details', () => {

  it('pointercancel ends the fill; another pointer and the right button are ignored', async () => {
    const t = await mountFill();
    select(t, 0, 1, 0, 1);
    const h = fillHandle(t.host)!;
    const p = center(h);
    pointer(h, 'pointerdown', p.x, p.y, { button: 2 });
    pointer(document, 'pointermove', p.x, p.y + 40, { button: 2 });
    expect(t.api.isFilling()).toBe(false);
    pointer(h, 'pointerdown', p.x, p.y);
    pointer(document, 'pointermove', p.x, p.y + 40, { pointerId: 7 });
    expect(t.api.isFilling()).toBe(false);
    pointer(document, 'pointermove', p.x, p.y + 40);
    expect(t.api.isFilling()).toBe(true);
    pointer(document, 'pointercancel', p.x, p.y + 40, { pointerId: 7 });
    expect(t.api.isFilling()).toBe(true);
    pointer(document, 'pointercancel', p.x, p.y + 40);
    expect(t.api.isFilling()).toBe(false);
    expect(t.modelEvents).toHaveLength(0);
  });

  it('touch works like the mouse; a double click on the handle does not reach the table', async () => {
    const t = await mountFill();
    select(t, 0, 1, 0, 1);
    const dbl = vi.fn();
    t.host.addEventListener('dblclick', dbl);
    fillHandle(t.host)!.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    expect(dbl).not.toHaveBeenCalled();
    dragHandleTo(t.host, 2, 1, { pointerType: 'touch' });
    expect(qtys(t.items).slice(0, 3)).toEqual([5, 5, 5]);
  });

  it('no fill while editing; the handle of a hidden last column sits on the last shown one', async () => {
    const t = await mountFill();
    select(t, 0, 1, 0, 3);
    t.api.setColumnVisible('day', false);
    await nextFrame();
    const cell = getCellDiv(t.host, 'body', 'center', 0, 2).getBoundingClientRect();
    expect(Math.abs(center(fillHandle(t.host)!).x - cell.right)).toBeLessThanOrEqual(1.5);
    t.api.setColumnVisible('day', true);
    t.scope.initRenderEditor(5, 2);
    const h = fillHandle(t.host)!;
    h.style.display = 'block';
    const p = center(h);
    pointer(h, 'pointerdown', p.x, p.y);
    pointer(document, 'pointermove', p.x, p.y + 60);
    expect(t.api.isFilling()).toBe(false);
  });

  it('dragging right of the table scrolls horizontally', async () => {
    const columnDefs = Array.from({ length: 30 }, (_, i) => ColumnDef.create({
      property: `c${i}`, headerLabel: `C${i}`, width: px100, editable: TrueFn,
    }));
    const rows = Array.from({ length: 5 }, () => Object.fromEntries(columnDefs.map((d, i) => [d.property, i])));
    const t = await mountFill({ model: TableFactory.createTableModel({ rows, columnDefs }) });
    select(t, 0, 1, 0, 1);
    const h = fillHandle(t.host)!;
    const p = center(h);
    pointer(h, 'pointerdown', p.x, p.y);
    pointer(document, 'pointermove', p.x + 10, p.y);
    const r = t.host.getBoundingClientRect();
    pointer(document, 'pointermove', r.right - 5, p.y);
    await vi.waitFor(() => expect(t.scope.scrollViewport.scrollLeft).toBeGreaterThan(100));
    pointer(document, 'pointermove', r.left + 250, p.y);   // back inside: the auto-scroll stops
    pointer(document, 'pointerup', r.left + 250, p.y);
    expect(t.modelEvents.length).toBeLessThanOrEqual(1);
  });
});

describe('review fixes', () => {

  it('0 survives editInputPipeForNumber: 2, 1 filled down gives 0, -1', async () => {
    const t = await mountFill();
    t.api.applyCellChanges([{ rowIndex: 0, column: 'price', value: 2 }, { rowIndex: 1, column: 'price', value: 1 }]);
    select(t, 0, 4, 1, 4);
    dragHandleTo(t.host, 3, 4);
    expect(t.items.slice(0, 4).map(i => i.price)).toEqual([2, 1, 0, -1]);
  });

  it('commit: rows hidden by a filter are in changes, not in cells (cells are display indices)', async () => {
    const t = await mountFill({ tableOptions: { batchEdit: true } });
    t.api.applyCellChanges([{ rowIndex: 3, column: 'name', value: 'x' }, { rowIndex: 4, column: 'name', value: 'y' }]);
    t.scope.tableOptions.externalFilterFunction = (row: Item) => row.id !== 3;
    t.api.externalFilterChanged();
    t.api.commitBatchEdit();
    const evt = t.modelEvents[0];
    expect(evt.changes!.map(c => c.rowIndex)).toEqual([3, -1]);
    expect(evt.cells.map(c => c.rowIndex)).toEqual([3]);
  });

  it('row grouping: a committed hidden row moves to its new group', async () => {
    const rows = [{ region: 'Nord', name: 'a' }, { region: 'Nord', name: 'b' }, { region: 'Süd', name: 'c' }];
    const model = RowGroupFactory.createTableModel({
      rows, groupBy: ['region'], hideGroupedColumns: false,
      columnDefs: [ColumnDef.create({ property: 'region', headerLabel: 'Region', editable: TrueFn }),
        ColumnDef.create({ property: 'name', headerLabel: 'Name', editable: TrueFn })],
    });
    const t = await mountFill({ model, tableOptions: { batchEdit: true } });
    const body = t.model.getBodyModel();
    const indexOf = (o: unknown) => Array.from({ length: body.getRowCount() }, (_, i) => i)
      .find(i => (body.getRowByIndex(i) as { data?: unknown })?.data === o)!;
    const regionColumn = t.api.getColumnIndex('region');
    t.api.applyCellChanges([{ rowIndex: indexOf(rows[0]), column: regionColumn, value: 'Süd' }]);
    t.scope.tableOptions.externalFilterFunction = (row: { name: string }) => row.name !== 'a';
    t.api.externalFilterChanged();
    expect(t.api.commitBatchEdit()).toBe(true);
    expect(rows[0].region).toBe('Süd');
    expect(isAreaModelRowGroups(body) && body.getGroupBy()).toBeTruthy();
    t.scope.tableOptions.externalFilterFunction = () => true;
    t.api.externalFilterChanged();
    const groups = Array.from({ length: body.getRowCount() }, (_, i) => (body.getRowByIndex(i) as { data?: { label?: string; count?: number } })?.data)
      .filter(d => d && d.label !== undefined && d.count !== undefined).map(d => `${d!.label} ${d!.count}`);
    expect(groups).toEqual(['Nord 1', 'Süd 2']);
  });

  it('setRows drops pending values of replaced rows (no orphan blocks the commit)', async () => {
    const columnDefs = defaultColumns();
    columnDefs[2].validate = (v: unknown) => v === 'bad' ? 'bad' : undefined;
    const t = await mountFill({ columnDefs, tableOptions: { batchEdit: true } });
    t.api.applyCellChanges([{ rowIndex: 0, column: 'name', value: 'bad' }]);
    expect(t.api.commitBatchEdit()).toBe(false);
    t.api.setRows(createItems(5));
    expect(t.api.hasPendingChanges()).toBe(false);
    expect(t.api.getPendingChanges()).toEqual([]);
    expect(t.api.commitBatchEdit()).toBe(true);
  });

  it('switching the fill handle off at runtime removes handle and aria-keyshortcuts', async () => {
    const t = await mountFill();
    select(t, 0, 1, 0, 1);
    expect(t.host.getAttribute('aria-keyshortcuts')).toBe('Control+D Control+R');
    t.scope.tableOptions.fillHandle = false;
    t.api.repaint();
    expect(fillHandle(t.host)).toBeNull();
    expect(t.host.hasAttribute('aria-keyshortcuts')).toBe(false);
  });

  it('a blocking loading overlay that appears during the drag: nothing is filled', async () => {
    const t = await mountFill();
    select(t, 0, 1, 0, 1);
    const to = dragHandleTo(t.host, 3, 1, {}, false);
    t.api.showLoadingOverlay();
    pointer(document, 'pointerup', to.x, to.y);
    expect(t.modelEvents).toHaveLength(0);
  });

  it('Ctrl+D on one row: one selection event with the unchanged range', async () => {
    const sel: unknown[] = [];
    const t = await mountFill();
    select(t, 2, 2, 2, 2);
    t.scope.getEventListener().onSelectionChanged = sm => sel.push(sm.getRanges().map(r => [r.r1, r.c1, r.r2, r.c2]));
    keydown(t.host, 'd', { ctrlKey: true });
    expect(sel).toEqual([[[2, 2, 2, 2]]]);
  });
});
