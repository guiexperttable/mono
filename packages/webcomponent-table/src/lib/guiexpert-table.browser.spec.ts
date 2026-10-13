// Smoke test of the Web Component in Chromium: data → tableReady → rows → click → new data → disconnect/re-connect.
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { GeMouseEvent, TableApi, TableModelAndOptions, TableOptions, TableScope } from '@guiexpert/table';
import type { TableModelAndOptionsIf, TableModelIf } from '@guiexpert/table';
import { GuiexpertTable } from './guiexpert-table';
import {
  bodyCell, cellOf, createHost, createModel, isDestroyed, nextFrame, removeHosts, rowTexts, tableCount
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
});
