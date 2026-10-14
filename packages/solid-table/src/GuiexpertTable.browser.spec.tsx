// Smoke test of the Solid wrapper in Chromium: mount → tableReady → rows → click → new model → unmount.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { createSignal } from 'solid-js';
import { render } from 'solid-js/web';
import { GeMouseEvent, TableApi, TableOptions, TableScope } from '@guiexpert/table';
import type { TableModelIf } from '@guiexpert/table';
import GuiexpertTable from './GuiexpertTable';
import type { GeMouseEventFn } from './GuiexpertTableProps';
import {
  bodyCell, cellOf, createHost, createModel, isDestroyed, nextFrame, overlayKind, removeHosts, rowTexts, tableCount
} from '../../table/test-utils/wrapper-test-utils';

const disposers: (() => void)[] = [];

/** Renders the table with signals for model, options and the click callback (Solid updates synchronously). */
function mount(tableModel: TableModelIf, tableOptions?: TableOptions) {
  const host = createHost();
  const tableReady = vi.fn<(api: TableApi) => void>();
  const [model, setModel] = createSignal(tableModel);
  const [options, setOptions] = createSignal(tableOptions);
  const [mouseClicked, setMouseClicked] = createSignal<GeMouseEventFn | undefined>(undefined);
  const dispose = render(() => (
    <GuiexpertTable tableModel={model()} tableOptions={options()} tableReady={tableReady} mouseClicked={mouseClicked()} />
  ), host);
  disposers.push(dispose);
  return { host, tableReady, setModel, setOptions, setMouseClicked, dispose };
}

afterEach(() => {
  while (disposers.length) disposers.pop()!();
  removeHosts();
  vi.restoreAllMocks();
});

describe('GuiexpertTable (Solid)', () => {

  it('calls tableReady once with a TableApi and renders the rows', async () => {
    const { host, tableReady } = mount(createModel(5));
    await nextFrame();

    expect(tableReady).toHaveBeenCalledTimes(1);
    expect(tableReady.mock.calls[0][0]).toBeInstanceOf(TableApi);
    expect(tableCount(host)).toBe(1);
    expect(rowTexts(host)).toHaveLength(5);
    expect(rowTexts(host)[0]).toContain('Row 0');
  });

  it('a click on a body cell calls mouseClicked with row and column index', async () => {
    const { host, setMouseClicked } = mount(createModel(5));
    const mouseClicked = vi.fn<GeMouseEventFn>();
    setMouseClicked(() => mouseClicked);
    await nextFrame();

    await userEvent.click(bodyCell(host, 2, 1));

    expect(mouseClicked).toHaveBeenCalledTimes(1);
    expect(cellOf(mouseClicked.mock.calls[0][0])).toEqual({ areaIdent: 'body', rowIndex: 2, columnIndex: 1 });
  });

  it('events are also dispatched as bubbling DOM CustomEvents (backward compatibility)', async () => {
    const host = createHost();
    const onTableReady = vi.fn<(e: Event) => void>();
    const onMouseClicked = vi.fn<(e: Event) => void>();
    host.addEventListener('tableReady', onTableReady);
    host.addEventListener('mouseClicked', onMouseClicked);
    disposers.push(render(() => <GuiexpertTable tableModel={createModel(5)} />, host));
    await nextFrame();

    bodyCell(host, 3, 0).click();

    expect(onTableReady).toHaveBeenCalledTimes(1);
    expect((onTableReady.mock.calls[0][0] as CustomEvent).detail).toBeInstanceOf(TableApi);
    expect(onMouseClicked).toHaveBeenCalledTimes(1);
    expect(cellOf((onMouseClicked.mock.calls[0][0] as CustomEvent).detail)).toEqual({ areaIdent: 'body', rowIndex: 3, columnIndex: 0 });
  });

  async function rightClick(contextmenu?: GeMouseEventFn): Promise<CustomEvent[]> {
    const host = createHost();
    const customEvents: CustomEvent[] = [];
    host.addEventListener('contextmenu', e => {
      if (e instanceof CustomEvent) customEvents.push(e);
    });
    disposers.push(render(() => <GuiexpertTable tableModel={createModel(5)} contextmenu={contextmenu} />, host));
    await nextFrame();
    await userEvent.click(bodyCell(host, 1, 1), { button: 'right' });
    return customEvents;
  }

  it('a right click calls the contextmenu callback', async () => {
    const contextmenu = vi.fn<GeMouseEventFn>();
    await rightClick(contextmenu);

    expect(contextmenu).toHaveBeenCalledTimes(1);
    expect(cellOf(contextmenu.mock.calls[0][0])).toEqual({ areaIdent: 'body', rowIndex: 1, columnIndex: 1 });
  });

  // Regression: the "contextmenu" CustomEvent never left the wrapper. It is dispatched on the div that is also the
  // TableScope host; the core's own "contextmenu" listener there took it for a second right click within 50 ms and
  // called stopImmediatePropagation() on it. MouseHandler.onContextmenu now ignores events that are no MouseEvent.
  it('a right click also dispatches a "contextmenu" CustomEvent', async () => {
    const customEvents = await rightClick();

    expect(customEvents).toHaveLength(1);
    expect(customEvents[0].detail).toBeInstanceOf(GeMouseEvent);
  });

  // Regression: the "scroll" CustomEvent bubbled – every table scroll reached window/document "scroll" listeners.
  it('the "scroll" CustomEvent does not bubble; the scroll callback is called', async () => {
    const host = createHost();
    const scroll = vi.fn();
    const bubbled = vi.fn();
    host.addEventListener('scroll', e => { if (e instanceof CustomEvent) bubbled(e); });
    disposers.push(render(() => <GuiexpertTable tableModel={createModel(200)} scroll={scroll} />, host));
    await nextFrame();
    host.querySelector<HTMLElement>('.ge-table-scroll-viewport')!.scrollTop = 500;
    await vi.waitFor(() => expect(scroll).toHaveBeenCalled());
    expect(bubbled).not.toHaveBeenCalled();
  });

  it('a new tableModel re-creates the table and destroys the old one', async () => {
    const destroy = vi.spyOn(TableScope.prototype, 'destroy');
    const { host, tableReady, setModel, setMouseClicked } = mount(createModel(5), new TableOptions());
    const mouseClicked = vi.fn<GeMouseEventFn>();
    setMouseClicked(() => mouseClicked);
    await nextFrame();

    setModel(createModel(3, 'New'));
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

  it('a new tableOptions object re-creates the table, a new callback does not', () => {
    const { tableReady, setOptions, setMouseClicked } = mount(createModel(5), new TableOptions());

    setMouseClicked(() => () => undefined);
    expect(tableReady).toHaveBeenCalledTimes(1);

    setOptions(new TableOptions());
    expect(tableReady).toHaveBeenCalledTimes(2);
    expect(isDestroyed(tableReady.mock.calls[0][0])).toBe(true);
  });

  it('dispose (unmount) destroys the table without errors', async () => {
    const consoleError = vi.spyOn(console, 'error');
    const destroy = vi.spyOn(TableScope.prototype, 'destroy');
    const { host, tableReady, dispose } = mount(createModel(5));
    await nextFrame();

    disposers.pop();
    dispose();

    expect(destroy).toHaveBeenCalledTimes(1);
    expect(isDestroyed(tableReady.mock.calls[0][0])).toBe(true);
    expect(tableCount(host)).toBe(0);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('the loading prop shows and hides the overlay without re-creating the table (since 1.1.91)', async () => {
    const host = createHost();
    const tableReady = vi.fn<(api: TableApi) => void>();
    const [model, setModel] = createSignal(createModel(5));
    const [loading, setLoading] = createSignal(true);
    disposers.push(render(() => (
      <GuiexpertTable tableModel={model()} tableReady={tableReady} loading={loading()} />
    ), host));
    await nextFrame();
    expect(overlayKind(host)).toBe('loading');

    setLoading(false);
    expect(overlayKind(host)).toBe('none');
    setLoading(true);
    expect(overlayKind(host)).toBe('loading');
    expect(tableReady).toHaveBeenCalledTimes(1);

    setModel(createModel(2)); // re-created table keeps the overlay
    expect(tableReady).toHaveBeenCalledTimes(2);
    expect(overlayKind(host)).toBe('loading');
  });
});
