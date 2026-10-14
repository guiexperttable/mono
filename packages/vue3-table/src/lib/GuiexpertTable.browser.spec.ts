// Smoke test of the Vue 3 wrapper in Chromium: mount → tableReady → rows → click → new model → unmount.
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import { userEvent } from 'vitest/browser';
import { createApp, h, nextTick, shallowRef } from 'vue';
import type { App, ShallowRef } from 'vue';
import { TableApi, TableOptions, TableScope } from '@guiexpert/table';
import type { GeMouseEvent, TableModelIf, TableOptionsIf } from '@guiexpert/table';
import GuiexpertTable from './GuiexpertTable.vue';
import {
  bodyCell, cellOf, createHost, createModel, isDestroyed, nextFrame, overlayKind, removeHosts, rowTexts, tableCount
} from '../../../table/test-utils/wrapper-test-utils';

interface Mounted {
  host: HTMLDivElement;
  /** reactive props of the GuiexpertTable (assign a new object to re-render) */
  props: ShallowRef<Record<string, unknown>>;
  tableReady: Mock<(api: TableApi) => void>;
  mouseClicked: Mock<(evt: GeMouseEvent) => void>;
}

const apps: App[] = [];

function mount(props: { tableModel: TableModelIf; tableOptions?: TableOptionsIf; debounceMouseClickDelay?: number; loading?: boolean }): Mounted {
  const host = createHost();
  const tableReady = vi.fn<(api: TableApi) => void>();
  const mouseClicked = vi.fn<(evt: GeMouseEvent) => void>();
  const reactiveProps = shallowRef<Record<string, unknown>>({ ...props });
  const app = createApp({
    render: () => h(GuiexpertTable, { ...reactiveProps.value, onTableReady: tableReady, onMouseClicked: mouseClicked }),
  });
  app.mount(host);
  apps.push(app);
  return { host, props: reactiveProps, tableReady, mouseClicked };
}

afterEach(() => {
  while (apps.length) apps.pop()!.unmount();
  removeHosts();
  vi.restoreAllMocks();
});

describe('GuiexpertTable (Vue 3)', () => {

  it('emits tableReady once with a TableApi and renders the rows', async () => {
    const { host, tableReady } = mount({ tableModel: createModel(5) });
    await nextFrame();

    expect(tableReady).toHaveBeenCalledTimes(1);
    expect(tableReady.mock.calls[0][0]).toBeInstanceOf(TableApi);
    expect(tableCount(host)).toBe(1);
    expect(rowTexts(host)).toHaveLength(5);
    expect(rowTexts(host)[0]).toContain('Row 0');
  });

  it('debounceMouseClickDelay=0: a click on a body cell emits mouseClicked at once', async () => {
    const { host, mouseClicked } = mount({ tableModel: createModel(5), debounceMouseClickDelay: 0 });
    await nextFrame();

    await userEvent.click(bodyCell(host, 2, 1));

    expect(mouseClicked).toHaveBeenCalledTimes(1);
    expect(cellOf(mouseClicked.mock.calls[0][0])).toEqual({ areaIdent: 'body', rowIndex: 2, columnIndex: 1 });
  });

  it('default debounceMouseClickDelay (150 ms): mouseClicked comes delayed, a double click emits once (clickCount 2)', async () => {
    const { host, mouseClicked } = mount({ tableModel: createModel(5) });
    await nextFrame();

    bodyCell(host, 1, 1).click();
    expect(mouseClicked).not.toHaveBeenCalled();
    await vi.waitFor(() => expect(mouseClicked).toHaveBeenCalledTimes(1), { timeout: 1000 });
    expect(cellOf(mouseClicked.mock.calls[0][0])).toEqual({ areaIdent: 'body', rowIndex: 1, columnIndex: 1 });

    mouseClicked.mockClear();
    bodyCell(host, 1, 1).click();
    bodyCell(host, 1, 1).click();
    await vi.waitFor(() => expect(mouseClicked).toHaveBeenCalled(), { timeout: 1000 });
    await new Promise(resolve => setTimeout(resolve, 200));
    expect(mouseClicked).toHaveBeenCalledTimes(1);
    expect(mouseClicked.mock.calls[0][0].clickCount).toBe(2);
  });

  // Regression: inheritAttrs: false dropped class, style and other attributes of <GuiexpertTable>.
  it('class, style and attributes reach the root element', async () => {
    const host = createHost();
    const app = createApp({
      render: () => h(GuiexpertTable, { tableModel: createModel(5), class: 'my-table', style: { opacity: '0.5' }, 'data-test': 'x' }),
    });
    app.mount(host);
    apps.push(app);
    await nextFrame();
    const root = host.firstElementChild as HTMLElement;
    expect(root.classList).toContain('container-div');
    expect(root.classList).toContain('my-table');
    expect(root.style.opacity).toBe('0.5');
    expect(root.style.height).toBe('100%');
    expect(root.getAttribute('data-test')).toBe('x');
  });

  it('a new tableModel re-creates the table and destroys the old one', async () => {
    const destroy = vi.spyOn(TableScope.prototype, 'destroy');
    const tableOptions = new TableOptions();
    const { host, props, tableReady, mouseClicked } =
      mount({ tableModel: createModel(5), tableOptions, debounceMouseClickDelay: 0 });
    await nextFrame();

    props.value = { ...props.value, tableModel: createModel(3, 'New') };
    await nextTick();
    await nextFrame();

    expect(tableReady).toHaveBeenCalledTimes(2);
    const [[oldApi], [newApi]] = tableReady.mock.calls;
    expect(newApi).not.toBe(oldApi);
    expect(isDestroyed(oldApi)).toBe(true);
    expect(isDestroyed(newApi)).toBe(false);
    expect(destroy).toHaveBeenCalledTimes(1);
    expect(tableCount(host)).toBe(1);
    expect(rowTexts(host)).toHaveLength(3);
    expect(rowTexts(host)[0]).toContain('New 0');

    // the old table's listeners are gone: one click = one event
    await userEvent.click(bodyCell(host, 1, 1));
    expect(mouseClicked).toHaveBeenCalledTimes(1);
  });

  it('a new tableOptions object re-creates the table, a re-render with the same objects does not', async () => {
    const { props, tableReady } = mount({ tableModel: createModel(5), tableOptions: new TableOptions() });

    props.value = { ...props.value, debounceMouseClickDelay: 10 }; // re-render, same model and options
    await nextTick();
    expect(tableReady).toHaveBeenCalledTimes(1);

    props.value = { ...props.value, tableOptions: new TableOptions() };
    await nextTick();
    expect(tableReady).toHaveBeenCalledTimes(2);
    expect(isDestroyed(tableReady.mock.calls[0][0])).toBe(true);
  });

  it('tables without tableOptions do not share one default TableOptions object', () => {
    const a = mount({ tableModel: createModel(2) });
    const b = mount({ tableModel: createModel(2) });

    const optionsA = a.tableReady.mock.calls[0][0].tableScope.tableOptions;
    const optionsB = b.tableReady.mock.calls[0][0].tableScope.tableOptions;
    expect(optionsA).not.toBe(optionsB);
  });

  it('unmount destroys the table without errors', async () => {
    const consoleError = vi.spyOn(console, 'error');
    const consoleWarn = vi.spyOn(console, 'warn');
    const destroy = vi.spyOn(TableScope.prototype, 'destroy');
    const { host, tableReady } = mount({ tableModel: createModel(5) });
    await nextFrame();

    apps.pop()!.unmount();

    expect(destroy).toHaveBeenCalledTimes(1);
    expect(isDestroyed(tableReady.mock.calls[0][0])).toBe(true);
    expect(tableCount(host)).toBe(0);
    expect(consoleError).not.toHaveBeenCalled();
    expect(consoleWarn).not.toHaveBeenCalled();
  });

  it('the loading prop shows and hides the overlay without re-creating the table (since 1.1.92)', async () => {
    const tableModel = createModel(5);
    const tableOptions = new TableOptions();
    const { host, props, tableReady } = mount({ tableModel, tableOptions, loading: true });
    await nextFrame();
    expect(overlayKind(host)).toBe('loading');

    props.value = { tableModel, tableOptions, loading: false };
    await nextTick();
    expect(overlayKind(host)).toBe('none');
    props.value = { tableModel, tableOptions, loading: true };
    await nextTick();
    expect(overlayKind(host)).toBe('loading');
    expect(tableReady).toHaveBeenCalledTimes(1);

    props.value = { tableModel: createModel(2), tableOptions, loading: true }; // re-created, overlay stays
    await nextTick();
    expect(tableReady).toHaveBeenCalledTimes(2);
    expect(overlayKind(host)).toBe('loading');
  });
});
