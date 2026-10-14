// Smoke test of the Preact wrapper in Chromium: mount → tableReady → rows → click → new model → unmount.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'preact';
import type { VNode } from 'preact';
import { TableApi, TableOptions, TableScope } from '@guiexpert/table';
import type { GeMouseEvent } from '@guiexpert/table';
import { GuiexpertTable } from './GuiexpertTable';
import {
  bodyCell, cellOf, createHost, createModel, isDestroyed, nextFrame, overlayKind, removeHosts, rowTexts, tableCount
} from '../../table/test-utils/wrapper-test-utils';

let host: HTMLDivElement | undefined;

/** Preact renders synchronously: lifecycle methods have run when render() returns. */
function mount(ui: VNode): HTMLDivElement {
  host = createHost();
  render(ui, host);
  return host;
}

function rerender(ui: VNode) {
  render(ui, host!);
}

function unmount() {
  if (host) render(null, host);
  host = undefined;
}

afterEach(() => {
  unmount();
  removeHosts();
  vi.restoreAllMocks();
});

describe('GuiexpertTable (Preact)', () => {

  it('fires tableReady once with a TableApi and renders the rows', async () => {
    const tableReady = vi.fn<(api: TableApi) => void>();
    const host = mount(<GuiexpertTable tableModel={createModel(5)} tableReady={tableReady} />);
    await nextFrame();

    expect(tableReady).toHaveBeenCalledTimes(1);
    expect(tableReady.mock.calls[0][0]).toBeInstanceOf(TableApi);
    expect(tableCount(host)).toBe(1);
    expect(rowTexts(host)).toHaveLength(5);
    expect(rowTexts(host)[0]).toContain('Row 0');
  });

  it('a click on a body cell calls mouseClicked with row and column index', async () => {
    const mouseClicked = vi.fn<(evt: GeMouseEvent) => void>();
    const host = mount(<GuiexpertTable tableModel={createModel(5)} mouseClicked={mouseClicked} />);
    await nextFrame();

    await userEvent.click(bodyCell(host, 2, 1));

    expect(mouseClicked).toHaveBeenCalledTimes(1);
    expect(cellOf(mouseClicked.mock.calls[0][0])).toEqual({ areaIdent: 'body', rowIndex: 2, columnIndex: 1 });
  });

  it('a new tableModel re-creates the table and destroys the old one', async () => {
    const tableReady = vi.fn<(api: TableApi) => void>();
    const mouseClicked = vi.fn<(evt: GeMouseEvent) => void>();
    const destroy = vi.spyOn(TableScope.prototype, 'destroy');
    const tableOptions = new TableOptions();
    const host = mount(
      <GuiexpertTable tableModel={createModel(5)} tableOptions={tableOptions} tableReady={tableReady} mouseClicked={mouseClicked} />
    );
    await nextFrame();

    rerender(
      <GuiexpertTable tableModel={createModel(3, 'New')} tableOptions={tableOptions} tableReady={tableReady} mouseClicked={mouseClicked} />
    );
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

  it('a new tableOptions object re-creates the table, a re-render with the same objects does not', () => {
    const tableReady = vi.fn<(api: TableApi) => void>();
    const tableModel = createModel(5);
    const tableOptions = new TableOptions();
    mount(<GuiexpertTable tableModel={tableModel} tableOptions={tableOptions} tableReady={tableReady} />);

    // new callback, same model/options → no new table, the new callback is used
    const tableReady2 = vi.fn<(api: TableApi) => void>();
    rerender(<GuiexpertTable tableModel={tableModel} tableOptions={tableOptions} tableReady={tableReady2} />);
    expect(tableReady).toHaveBeenCalledTimes(1);
    expect(tableReady2).not.toHaveBeenCalled();

    rerender(<GuiexpertTable tableModel={tableModel} tableOptions={new TableOptions()} tableReady={tableReady2} />);
    expect(tableReady2).toHaveBeenCalledTimes(1);
    expect(isDestroyed(tableReady.mock.calls[0][0])).toBe(true);
  });

  it('callback props may change: the current one is called', async () => {
    const first = vi.fn<(evt: GeMouseEvent) => void>();
    const second = vi.fn<(evt: GeMouseEvent) => void>();
    const tableModel = createModel(5);
    const host = mount(<GuiexpertTable tableModel={tableModel} mouseClicked={first} />);
    await nextFrame();

    rerender(<GuiexpertTable tableModel={tableModel} mouseClicked={second} />);
    await userEvent.click(bodyCell(host, 0, 0));

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('unmount destroys the table without errors', async () => {
    const consoleError = vi.spyOn(console, 'error');
    const tableReady = vi.fn<(api: TableApi) => void>();
    const destroy = vi.spyOn(TableScope.prototype, 'destroy');
    const host = mount(<GuiexpertTable tableModel={createModel(5)} tableReady={tableReady} />);
    await nextFrame();

    unmount();

    expect(destroy).toHaveBeenCalledTimes(1);
    expect(isDestroyed(tableReady.mock.calls[0][0])).toBe(true);
    expect(tableCount(host)).toBe(0);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('the loading prop shows and hides the overlay without re-creating the table (since 1.1.91)', async () => {
    const tableReady = vi.fn<(api: TableApi) => void>();
    const tableModel = createModel(5);
    const tableOptions = new TableOptions();
    const host = mount(<GuiexpertTable tableModel={tableModel} tableOptions={tableOptions} tableReady={tableReady} loading />);
    await nextFrame();
    expect(overlayKind(host)).toBe('loading');

    rerender(<GuiexpertTable tableModel={tableModel} tableOptions={tableOptions} tableReady={tableReady} loading={false} />);
    expect(overlayKind(host)).toBe('none');
    rerender(<GuiexpertTable tableModel={tableModel} tableOptions={tableOptions} tableReady={tableReady} loading />);
    expect(overlayKind(host)).toBe('loading');
    expect(tableReady).toHaveBeenCalledTimes(1);

    rerender(<GuiexpertTable tableModel={createModel(2)} tableOptions={tableOptions} tableReady={tableReady} loading />);
    expect(tableReady).toHaveBeenCalledTimes(2);
    expect(overlayKind(host)).toBe('loading');
  });
});
