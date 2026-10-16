// Smoke test of the Web Component in Chromium: data → tableReady → rows → click → new data → disconnect/re-connect.
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { GeBatchEditEvent, GeModelChangeEvent, GeMouseEvent, GeRowDragEvent, GeStateChangeEvent, TableApi, TableModelAndOptions, TableOptions, TableScope } from '@guiexpert/table';
import type { TableModelAndOptionsIf, TableModelIf } from '@guiexpert/table';
import { GuiexpertTable } from './guiexpert-table';
import {
  bodyCell, cellOf, createFillModelAndOptions, dragFillHandle, createGroupedModel, createHost, createModel, createPivotModel, createRowDragModel, dragRow, groupLabels, isDestroyed, nextFrame, overlayKind, pivotTotals, removeHosts, rowTexts, tableCount
} from '../../../table/test-utils/wrapper-test-utils';

const TAG = 'ge-test-table';

beforeAll(() => {
  // the package does not register the element itself
  customElements.define(TAG, GuiexpertTable);
});

afterEach(() => {
  removeHosts();
  vi.restoreAllMocks();
});

/** Creates the element (as documented: `display:block` + 100 % of a container with a height) and records its events. */
function createTableElement(connected = true) {
  const host = createHost();
  const el = document.createElement(TAG) as GuiexpertTable;
  el.style.cssText = 'display:block; width:100%; height:100%;';
  const events = { tableReady: [] as TableApi[], mouseClicked: [] as GeMouseEvent[], contextmenu: [] as GeMouseEvent[] };
  el.addEventListener('tableReady', e => events.tableReady.push((e as CustomEvent<TableApi>).detail));
  el.addEventListener('mouseClicked', e => events.mouseClicked.push((e as CustomEvent<GeMouseEvent>).detail));
  el.addEventListener('contextmenu', e => {
    if (e instanceof CustomEvent) events.contextmenu.push(e.detail);
  });
  if (connected) host.appendChild(el);
  return { host, el, events };
}

function data(tableModel: TableModelIf, tableOptions = new TableOptions()): TableModelAndOptionsIf {
  return new TableModelAndOptions(tableModel, tableOptions);
}

describe('GuiexpertTable (Web Component)', () => {

  it('el.data = … dispatches tableReady once with a TableApi and renders the rows', async () => {
    const { el, events } = createTableElement();
    el.data = data(createModel(5));
    await nextFrame();

    expect(events.tableReady).toHaveLength(1);
    expect(events.tableReady[0]).toBeInstanceOf(TableApi);
    expect(tableCount(el)).toBe(1);
    expect(rowTexts(el)).toHaveLength(5);
    expect(rowTexts(el)[0]).toContain('Row 0');
  });

  it('the table is a WAI-ARIA grid with a name from the options (screen readers, since 1.1.91)', async () => {
    const { el } = createTableElement();
    el.data = data(createModel(5), { ...new TableOptions(), ariaLabel: 'Orders' });
    await nextFrame();

    const grid = el.querySelector('[role="grid"]')!;
    expect(grid).not.toBeNull();
    expect(grid.getAttribute('aria-label')).toBe('Orders');
    expect(grid.getAttribute('aria-rowcount')).toBe('6');
    el.remove(); // destroy() (deferred): the grid attributes are removed with the table
    await nextFrame();
    expect(el.querySelector('[role="grid"]')).toBeNull();
  });

  // Regression: the "scroll" CustomEvent bubbled – every table scroll reached window/document "scroll" listeners.
  it('"scroll" is dispatched on the element and does not bubble', async () => {
    const { host, el } = createTableElement();
    const onElement = vi.fn();
    const bubbled = vi.fn();
    el.addEventListener('scroll', e => { if (e instanceof CustomEvent) onElement(e.detail); });
    host.addEventListener('scroll', e => { if (e instanceof CustomEvent) bubbled(e); });
    el.data = data(createModel(200));
    await nextFrame();
    el.querySelector<HTMLElement>('.ge-table-scroll-viewport')!.scrollTop = 500;
    await vi.waitFor(() => expect(onElement).toHaveBeenCalled());
    expect(bubbled).not.toHaveBeenCalled();
  });

  it('"rowDragStart", "rowDragMove", "rowDragEnd" are dispatched (bubbling), the row is moved (since 1.1.95)', async () => {
    const { host, el } = createTableElement();
    const received: GeRowDragEvent[] = [];
    for (const name of ['rowDragStart', 'rowDragMove', 'rowDragEnd']) {
      host.addEventListener(name, e => received.push((e as CustomEvent<GeRowDragEvent>).detail));
    }
    el.data = data(createRowDragModel());
    await nextFrame();
    dragRow(el, 1, 3);
    expect(received[0]).toBeInstanceOf(GeRowDragEvent);
    expect(received[0].type).toBe('start');
    expect(received.map(e => e.type)).toContain('move');
    expect(received[received.length - 1]).toMatchObject({ type: 'end', moved: true, toIndex: 3 });
    await nextFrame();
    expect(rowTexts(el)[3]).toContain('Row 1');
  });

  it('fill handle and batch edit: "modelChanged" once with all cells, "batchEditChanged" (since 1.1.96)', async () => {
    const { host, el } = createTableElement();
    const changes: GeModelChangeEvent[] = [];
    host.addEventListener('modelChanged', e => changes.push((e as CustomEvent<GeModelChangeEvent>).detail));
    const plain = createFillModelAndOptions();
    el.data = data(plain.tableModel, plain.tableOptions);
    await nextFrame();
    dragFillHandle(el, 4);
    expect(plain.rows.map(r => r.qty)).toEqual([1, 2, 3, 4, 5]);
    expect(changes).toHaveLength(1);
    expect(changes[0].cells).toHaveLength(3);

    const batch = createFillModelAndOptions(true);
    const batchEvents: GeBatchEditEvent[] = [];
    host.addEventListener('batchEditChanged', e => batchEvents.push((e as CustomEvent<GeBatchEditEvent>).detail));
    el.data = data(batch.tableModel, batch.tableOptions);
    await nextFrame();
    dragFillHandle(el, 2);
    expect(batchEvents).toHaveLength(1);
    expect(batchEvents[0]).toBeInstanceOf(GeBatchEditEvent);
    expect(batch.rows[2].qty).toBe(0);
  });

  it('"stateChanged" is dispatched (bubbling) after the state changed (since 1.1.92)', async () => {
    const { host, el, events } = createTableElement();
    const received: GeStateChangeEvent[] = [];
    host.addEventListener('stateChanged', e => received.push((e as CustomEvent<GeStateChangeEvent>).detail));
    el.data = data(createModel(5), { ...new TableOptions(), stateChangedDebounceDelay: 10 });
    await nextFrame();
    events.tableReady[0].setColumnWidth(0, 222);
    await vi.waitFor(() => expect(received).toHaveLength(1));
    expect(received[0]).toBeInstanceOf(GeStateChangeEvent);
    expect(received[0].changedParts).toEqual(['columns']);
  });

  it('a click on a body cell dispatches mouseClicked with row and column index', async () => {
    const { el, events } = createTableElement();
    el.data = data(createModel(5));
    await nextFrame();

    await userEvent.click(bodyCell(el, 2, 1));

    expect(events.mouseClicked).toHaveLength(1);
    expect(cellOf(events.mouseClicked[0])).toEqual({ areaIdent: 'body', rowIndex: 2, columnIndex: 1 });
  });

  it('a right click dispatches a "contextmenu" CustomEvent with the GeMouseEvent', async () => {
    const { el, events } = createTableElement();
    el.data = data(createModel(5));
    await nextFrame();

    await userEvent.click(bodyCell(el, 1, 1), { button: 'right' });

    expect(events.contextmenu).toHaveLength(1);
    expect(cellOf(events.contextmenu[0])).toEqual({ areaIdent: 'body', rowIndex: 1, columnIndex: 1 });
  });

  // review: a bubbling "contextmenu" CustomEvent (clientX undefined) reached page-level context-menu handlers
  it('the "contextmenu" CustomEvent does not bubble to document (only the native event does)', async () => {
    const { el } = createTableElement();
    el.data = data(createModel(5));
    await nextFrame();
    const seen: string[] = [];
    const onDocument = (e: Event) => seen.push(e.constructor.name);
    document.addEventListener('contextmenu', onDocument);
    try {
      await userEvent.click(bodyCell(el, 1, 1), { button: 'right' });
    } finally {
      document.removeEventListener('contextmenu', onDocument);
    }
    expect(seen.length).toBeGreaterThan(0);
    expect(seen).not.toContain('CustomEvent');
  });

  it('new data re-creates the table and destroys the old one', async () => {
    const destroy = vi.spyOn(TableScope.prototype, 'destroy');
    const { el, events } = createTableElement();
    el.data = data(createModel(5));
    await nextFrame();

    el.data = data(createModel(3, 'New'));
    await nextFrame();

    expect(events.tableReady).toHaveLength(2);
    const [oldApi, newApi] = events.tableReady;
    expect(isDestroyed(oldApi)).toBe(true);
    expect(isDestroyed(newApi)).toBe(false);
    expect(destroy).toHaveBeenCalledTimes(1);
    expect(tableCount(el)).toBe(1);
    expect(rowTexts(el)).toHaveLength(3);
    expect(rowTexts(el)[0]).toContain('New 0');

    // the old table's listeners are gone: one click = one event
    await userEvent.click(bodyCell(el, 1, 1));
    expect(events.mouseClicked).toHaveLength(1);
  });

  it('setData() works like the data property', async () => {
    const { el, events } = createTableElement();
    el.setData(data(createModel(4)));
    await nextFrame();

    expect(events.tableReady).toHaveLength(1);
    expect(el.data?.tableModel).toBe(events.tableReady[0].tableScope.tableModel);
    expect(rowTexts(el)).toHaveLength(4);
  });

  it('data without tableOptions uses the default options', async () => {
    const { el, events } = createTableElement();
    el.data = { tableModel: createModel(5) } as TableModelAndOptionsIf;
    await nextFrame();

    expect(events.tableReady).toHaveLength(1);
    expect(rowTexts(el)).toHaveLength(5);
  });

  it('data set before the element is connected: the table is created on connect', async () => {
    const { host, el, events } = createTableElement(false);
    el.data = data(createModel(5));
    host.appendChild(el);
    await nextFrame();

    expect(events.tableReady).toHaveLength(1);
    expect(tableCount(el)).toBe(1);
    expect(rowTexts(el)).toHaveLength(5);
  });

  it('removing the element destroys the table, inserting it again re-creates it', async () => {
    const destroy = vi.spyOn(TableScope.prototype, 'destroy');
    const { host, el, events } = createTableElement();
    el.data = data(createModel(5));
    await nextFrame();

    el.remove();
    await nextFrame();
    expect(destroy).toHaveBeenCalledTimes(1);
    expect(isDestroyed(events.tableReady[0])).toBe(true);
    expect(tableCount(el)).toBe(0);

    host.appendChild(el);
    await nextFrame();
    expect(events.tableReady).toHaveLength(2);
    expect(isDestroyed(events.tableReady[1])).toBe(false);
    expect(tableCount(el)).toBe(1);
    expect(rowTexts(el)).toHaveLength(5);
  });

  it('moving the element (remove + insert in one task) keeps the table', async () => {
    const { el, events } = createTableElement();
    el.data = data(createModel(5));
    await nextFrame();

    createHost().appendChild(el);
    await nextFrame();

    expect(events.tableReady).toHaveLength(1);
    expect(isDestroyed(events.tableReady[0])).toBe(false);
    expect(rowTexts(el)).toHaveLength(5);
  });

  // review: data set while the element was removed and re-inserted in the same task was lost (old table stayed)
  it('new data set while the element is removed and re-inserted in one task is shown', async () => {
    const { host, el, events } = createTableElement();
    el.data = data(createModel(5));
    await nextFrame();
    const firstApi = events.tableReady[0];

    el.remove();
    el.data = data(createModel(3));
    host.appendChild(el);
    await nextFrame();

    expect(isDestroyed(firstApi)).toBe(true);
    expect(tableCount(el)).toBe(1);
    expect(rowTexts(el)).toHaveLength(3);
  });

  it('a data property set before customElements.define() is picked up on upgrade', async () => {
    const host = createHost();
    const tag = 'ge-test-table-late';
    const el = document.createElement(tag) as GuiexpertTable;
    el.style.cssText = 'display:block; width:100%; height:100%;';
    host.appendChild(el);
    (el as { data?: TableModelAndOptionsIf }).data = data(createModel(5)); // plain property: not upgraded yet

    customElements.define(tag, class extends GuiexpertTable {});
    await nextFrame();

    expect(tableCount(el)).toBe(1);
    expect(rowTexts(el)).toHaveLength(5);
  });

  it('el.loading shows and hides the overlay without re-creating the table (since 1.1.92)', async () => {
    const { el, events } = createTableElement();
    el.loading = true; // before data: applied when the table is created
    el.data = data(createModel(5));
    await nextFrame();
    expect(overlayKind(el)).toBe('loading');
    expect(events.tableReady[0].getOverlayState()).toBe('loading');

    el.loading = false;
    expect(overlayKind(el)).toBe('none');
    el.loading = true;
    expect(overlayKind(el)).toBe('loading');
    expect(events.tableReady).toHaveLength(1);

    el.data = data(createModel(2)); // new table keeps the overlay
    expect(events.tableReady).toHaveLength(2);
    expect(overlayKind(el)).toBe('loading');
  });

  it('the boolean attribute loading works like the property (since 1.1.92)', async () => {
    const { el } = createTableElement();
    el.data = data(createModel(5));
    el.setAttribute('loading', '');
    expect(el.loading).toBe(true);
    expect(overlayKind(el)).toBe('loading');
    el.removeAttribute('loading');
    expect(el.loading).toBe(false);
    expect(overlayKind(el)).toBe('none');
  });

  it('a row grouping: group rows render, setRowGroupBy regroups without a rebuild (since 1.1.94)', async () => {
    const { el, events } = createTableElement();
    const destroy = vi.spyOn(TableScope.prototype, 'destroy');
    el.data = data(createGroupedModel());
    await nextFrame();
    expect(groupLabels(el)).toEqual(['Nord (3)', 'Süd (3)']);
    events.tableReady[0].setRowGroupBy(['produkt']);
    await nextFrame();
    expect(groupLabels(el)[0]).toBe('A (4)');
    expect(events.tableReady).toHaveLength(1);
    el.data = data(createModel(3));
    await nextFrame();
    expect(destroy).toHaveBeenCalledTimes(1);
    expect(events.tableReady).toHaveLength(2);
  });

  it('a pivot table: rows and totals render, setPivotConfig pivots again without a rebuild (since 1.1.94)', async () => {
    const { el, events } = createTableElement();
    const destroy = vi.spyOn(TableScope.prototype, 'destroy');
    el.data = data(createPivotModel());
    await nextFrame();
    expect(groupLabels(el)).toEqual(['Nord', 'Süd']);
    expect(pivotTotals(el)).toEqual(['270', '180']);
    events.tableReady[0].setPivotConfig({ rowFields: ['produkt'] });
    await nextFrame();
    expect(groupLabels(el)).toEqual(['A', 'B']);
    expect(events.tableReady).toHaveLength(1);
    expect(destroy).not.toHaveBeenCalled();
    el.data = data(createModel(3));
    await nextFrame();
    expect(destroy).toHaveBeenCalledTimes(1);
    expect(events.tableReady).toHaveLength(2);
  });
});
