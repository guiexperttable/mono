// Smoke test of the Svelte wrapper under Svelte 5 in Chromium: mount → tableReady → rows → click → new model → unmount.
// Covers both APIs: callback props (runes mode) and component events (`on:tableReady`, legacy class API).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { flushSync, mount, tick, unmount } from 'svelte';
import { createClassComponent } from 'svelte/legacy';
import { GeMouseEvent, TableApi, TableOptions, TableScope } from '@guiexpert/table';
import GuiexpertTable from './GuiexpertTable.svelte';
import RunesHost from '../test/RunesHost.svelte';
import {
  bodyCell, cellOf, createHost, createModel, isDestroyed, nextFrame, overlayKind, removeHosts, rowTexts, tableCount
} from '../../table/test-utils/wrapper-test-utils';

const cleanups: (() => void)[] = [];

afterEach(() => {
  while (cleanups.length) cleanups.pop()!();
  removeHosts();
  vi.restoreAllMocks();
});

describe('GuiexpertTable (Svelte 5)', () => {

  it('calls onTableReady and dispatches tableReady once with a TableApi, renders the rows', async () => {
    const host = createHost();
    const onTableReady = vi.fn<(api: TableApi) => void>();
    const tableReadyEvent = vi.fn<(e: CustomEvent<TableApi>) => void>();
    const instance = mount(GuiexpertTable, {
      target: host,
      props: { tableModel: createModel(5), onTableReady },
      events: { tableReady: tableReadyEvent }, // = on:tableReady
    });
    cleanups.push(() => unmount(instance));
    flushSync();
    await nextFrame();

    expect(onTableReady).toHaveBeenCalledTimes(1);
    expect(onTableReady.mock.calls[0][0]).toBeInstanceOf(TableApi);
    expect(tableReadyEvent).toHaveBeenCalledTimes(1);
    expect(tableReadyEvent.mock.calls[0][0].detail).toBe(onTableReady.mock.calls[0][0]);
    expect(tableCount(host)).toBe(1);
    expect(rowTexts(host)).toHaveLength(5);
    expect(rowTexts(host)[0]).toContain('Row 0');
  });

  it('a click on a body cell calls onMouseClicked and dispatches mouseClicked', async () => {
    const host = createHost();
    const onMouseClicked = vi.fn<(evt: GeMouseEvent) => void>();
    const mouseClickedEvent = vi.fn<(e: CustomEvent<GeMouseEvent>) => void>();
    const instance = mount(GuiexpertTable, {
      target: host,
      props: { tableModel: createModel(5), onMouseClicked },
      events: { mouseClicked: mouseClickedEvent },
    });
    cleanups.push(() => unmount(instance));
    flushSync();
    await nextFrame();

    await userEvent.click(bodyCell(host, 2, 1));

    expect(onMouseClicked).toHaveBeenCalledTimes(1);
    expect(cellOf(onMouseClicked.mock.calls[0][0])).toEqual({ areaIdent: 'body', rowIndex: 2, columnIndex: 1 });
    expect(mouseClickedEvent).toHaveBeenCalledTimes(1);
    expect(mouseClickedEvent.mock.calls[0][0].detail).toBeInstanceOf(GeMouseEvent);
  });

  it('runes-mode parent: a new tableModel re-creates the table and destroys the old one', async () => {
    const destroy = vi.spyOn(TableScope.prototype, 'destroy');
    const host = createHost();
    const onTableReady = vi.fn<(api: TableApi) => void>();
    const onMouseClicked = vi.fn<(evt: GeMouseEvent) => void>();
    const parent = mount(RunesHost, {
      target: host,
      props: { initialModel: createModel(5), initialOptions: new TableOptions(), onTableReady, onMouseClicked },
    });
    cleanups.push(() => unmount(parent));
    flushSync();
    await nextFrame();

    parent.setTableModel(createModel(3, 'New'));
    flushSync();
    await nextFrame();

    expect(onTableReady).toHaveBeenCalledTimes(2);
    const [[oldApi], [newApi]] = onTableReady.mock.calls;
    expect(isDestroyed(oldApi)).toBe(true);
    expect(isDestroyed(newApi)).toBe(false);
    expect(destroy).toHaveBeenCalledTimes(1);
    expect(tableCount(host)).toBe(1);
    expect(rowTexts(host)).toHaveLength(3);
    expect(rowTexts(host)[0]).toContain('New 0');

    // the old table's listeners are gone: one click = one event
    await userEvent.click(bodyCell(host, 1, 1));
    expect(onMouseClicked).toHaveBeenCalledTimes(1);

    parent.setTableOptions(new TableOptions());
    flushSync();
    expect(onTableReady).toHaveBeenCalledTimes(3);
    expect(isDestroyed(newApi)).toBe(true);
  });

  it('legacy class API ($set / $on / $destroy): new model → new table, $destroy → destroyed', async () => {
    const host = createHost();
    const onTableReady = vi.fn<(api: TableApi) => void>();
    const component = createClassComponent({
      component: GuiexpertTable,
      target: host,
      props: { tableModel: createModel(5), onTableReady },
    });
    const tableReadyEvent = vi.fn<(e: CustomEvent<TableApi>) => void>();
    component.$on('tableReady', tableReadyEvent);

    component.$set({ tableModel: createModel(2, 'New') });
    await tick();
    await nextFrame();

    expect(onTableReady).toHaveBeenCalledTimes(2);
    expect(tableReadyEvent).toHaveBeenCalledTimes(1);
    expect(tableReadyEvent.mock.calls[0][0].detail).toBe(onTableReady.mock.calls[1][0]);
    expect(isDestroyed(onTableReady.mock.calls[0][0])).toBe(true);
    expect(rowTexts(host)).toHaveLength(2);

    component.$destroy();
    expect(isDestroyed(onTableReady.mock.calls[1][0])).toBe(true);
  });

  it('unmount destroys the table without errors', async () => {
    const consoleError = vi.spyOn(console, 'error');
    const destroy = vi.spyOn(TableScope.prototype, 'destroy');
    const host = createHost();
    const onTableReady = vi.fn<(api: TableApi) => void>();
    const instance = mount(GuiexpertTable, { target: host, props: { tableModel: createModel(5), onTableReady } });
    flushSync();
    await nextFrame();

    unmount(instance);

    expect(destroy).toHaveBeenCalledTimes(1);
    expect(isDestroyed(onTableReady.mock.calls[0][0])).toBe(true);
    expect(tableCount(host)).toBe(0);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('the loading prop shows and hides the overlay without re-creating the table (since 1.1.92)', async () => {
    const host = createHost();
    const onTableReady = vi.fn<(api: TableApi) => void>();
    const component = createClassComponent({
      component: GuiexpertTable,
      target: host,
      props: { tableModel: createModel(5), onTableReady, loading: true },
    });
    cleanups.push(() => component.$destroy());
    flushSync();
    await nextFrame();
    expect(overlayKind(host)).toBe('loading');

    component.$set({ loading: false });
    flushSync();
    expect(overlayKind(host)).toBe('none');
    component.$set({ loading: true });
    flushSync();
    expect(overlayKind(host)).toBe('loading');
    expect(onTableReady).toHaveBeenCalledTimes(1);

    component.$set({ tableModel: createModel(2) });
    flushSync();
    expect(onTableReady).toHaveBeenCalledTimes(2);
    expect(overlayKind(host)).toBe('loading');
  });
});
