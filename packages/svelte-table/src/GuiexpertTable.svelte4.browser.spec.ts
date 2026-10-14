// Smoke test of the Svelte wrapper compiled by Svelte 4 (project "svelte4": `svelte` is aliased to Svelte 4.2):
// new Component → tableReady → rows → click → $set (new model) → $destroy.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import * as svelte from 'svelte';
import { tick } from 'svelte';
import { GeMouseEvent, TableApi, TableOptions, TableScope } from '@guiexpert/table';
import GuiexpertTable from './GuiexpertTable.svelte';
import {
  bodyCell, cellOf, createHost, createModel, isDestroyed, nextFrame, overlayKind, removeHosts, rowTexts, tableCount
} from '../../table/test-utils/wrapper-test-utils';

// Svelte 4 component API (the class the Svelte 4 compiler generates)
interface Svelte4Component {
  $set(props: Record<string, unknown>): void;
  $on(type: string, callback: (e: CustomEvent) => void): () => void;
  $destroy(): void;
}
const Table = GuiexpertTable as unknown as new (options: { target: Element; props: Record<string, unknown> }) => Svelte4Component;

const components: Svelte4Component[] = [];

function create(props: Record<string, unknown>) {
  const host = createHost();
  const component = new Table({ target: host, props });
  components.push(component);
  return { host, component };
}

afterEach(() => {
  while (components.length) components.pop()!.$destroy();
  removeHosts();
  vi.restoreAllMocks();
});

describe('GuiexpertTable (Svelte 4)', () => {

  it('runs with Svelte 4', () => {
    // compiled components register their major version in window.__svelte.v ("svelte/internal/disclose-version")
    expect([...(window as unknown as { __svelte: { v: Set<string> } }).__svelte.v]).toEqual(['4']);
    expect('mount' in svelte).toBe(false); // Svelte 5 API absent
  });

  it('calls onTableReady once with a TableApi and renders the rows', async () => {
    const onTableReady = vi.fn<(api: TableApi) => void>();
    const { host } = create({ tableModel: createModel(5), onTableReady });
    await tick();
    await nextFrame();

    expect(onTableReady).toHaveBeenCalledTimes(1);
    expect(onTableReady.mock.calls[0][0]).toBeInstanceOf(TableApi);
    expect(tableCount(host)).toBe(1);
    expect(rowTexts(host)).toHaveLength(5);
    expect(rowTexts(host)[0]).toContain('Row 0');
  });

  it('a click on a body cell calls onMouseClicked and dispatches mouseClicked (on:mouseClicked)', async () => {
    const onMouseClicked = vi.fn<(evt: GeMouseEvent) => void>();
    const { host, component } = create({ tableModel: createModel(5), onMouseClicked });
    const mouseClickedEvent = vi.fn<(e: CustomEvent) => void>();
    component.$on('mouseClicked', mouseClickedEvent);
    await tick();
    await nextFrame();

    await userEvent.click(bodyCell(host, 2, 1));

    expect(onMouseClicked).toHaveBeenCalledTimes(1);
    expect(cellOf(onMouseClicked.mock.calls[0][0])).toEqual({ areaIdent: 'body', rowIndex: 2, columnIndex: 1 });
    expect(mouseClickedEvent).toHaveBeenCalledTimes(1);
    expect(mouseClickedEvent.mock.calls[0][0].detail).toBeInstanceOf(GeMouseEvent);
  });

  it('$set with a new tableModel / tableOptions re-creates the table and destroys the old one', async () => {
    const destroy = vi.spyOn(TableScope.prototype, 'destroy');
    const onTableReady = vi.fn<(api: TableApi) => void>();
    const onMouseClicked = vi.fn<(evt: GeMouseEvent) => void>();
    const { host, component } = create({ tableModel: createModel(5), tableOptions: new TableOptions(), onTableReady, onMouseClicked });
    const tableReadyEvent = vi.fn<(e: CustomEvent) => void>();
    component.$on('tableReady', tableReadyEvent);
    await tick();

    component.$set({ tableModel: createModel(3, 'New') });
    await tick();
    await nextFrame();

    expect(onTableReady).toHaveBeenCalledTimes(2);
    const [[oldApi], [newApi]] = onTableReady.mock.calls;
    expect(tableReadyEvent.mock.calls[0][0].detail).toBe(newApi);
    expect(isDestroyed(oldApi)).toBe(true);
    expect(isDestroyed(newApi)).toBe(false);
    expect(destroy).toHaveBeenCalledTimes(1);
    expect(tableCount(host)).toBe(1);
    expect(rowTexts(host)).toHaveLength(3);
    expect(rowTexts(host)[0]).toContain('New 0');

    // the old table's listeners are gone: one click = one event
    await userEvent.click(bodyCell(host, 1, 1));
    expect(onMouseClicked).toHaveBeenCalledTimes(1);

    component.$set({ tableOptions: new TableOptions() });
    await tick();
    expect(onTableReady).toHaveBeenCalledTimes(3);
    expect(isDestroyed(newApi)).toBe(true);
  });

  it('$destroy destroys the table without errors', async () => {
    const consoleError = vi.spyOn(console, 'error');
    const destroy = vi.spyOn(TableScope.prototype, 'destroy');
    const onTableReady = vi.fn<(api: TableApi) => void>();
    const { host, component } = create({ tableModel: createModel(5), onTableReady });
    await tick();

    components.pop();
    component.$destroy();

    expect(destroy).toHaveBeenCalledTimes(1);
    expect(isDestroyed(onTableReady.mock.calls[0][0])).toBe(true);
    expect(tableCount(host)).toBe(0);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('the loading prop shows and hides the overlay without re-creating the table (since 1.1.92)', async () => {
    const onTableReady = vi.fn<(api: TableApi) => void>();
    const { host, component } = create({ tableModel: createModel(5), onTableReady, loading: true });
    await tick();
    await nextFrame();
    expect(overlayKind(host)).toBe('loading');

    component.$set({ loading: false });
    await tick();
    expect(overlayKind(host)).toBe('none');
    component.$set({ loading: true });
    await tick();
    expect(overlayKind(host)).toBe('loading');
    expect(onTableReady).toHaveBeenCalledTimes(1);

    component.$set({ tableModel: createModel(2) }); // re-created, overlay stays
    await tick();
    expect(onTableReady).toHaveBeenCalledTimes(2);
    expect(overlayKind(host)).toBe('loading');
  });
});
