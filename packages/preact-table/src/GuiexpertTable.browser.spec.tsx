// Smoke test of the Preact wrapper in Chromium: mount → tableReady → rows → click → new model → unmount.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'preact';
import type { VNode } from 'preact';
import { TableApi, TableOptions, TableScope } from '@guiexpert/table';
import type { GeMouseEvent } from '@guiexpert/table';
import { GuiexpertTable } from './GuiexpertTable';
import { DetailComponentRendererWrapper } from './DetailComponentRendererWrapper';
import type { DetailComponentProps } from './DetailComponentRendererWrapper';
import { useEffect, useState } from 'preact/hooks';
import {
  bodyCell, cellOf, clickDetailToggle, createHost, detailRowsOf, createModel, isDestroyed, nextFrame, overlayKind, removeHosts, rowTexts, tableCount
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

  it('master/detail: a Preact component as detail keeps its state while scrolling, is unmounted on collapse (since 1.1.97)', async () => {
    const unmounted = vi.fn();
    function Detail({ row }: DetailComponentProps<{ id: number }>) {
      const [clicks, setClicks] = useState(0);
      useEffect(() => () => unmounted(row.id), []);
      return <button className="md-btn" onClick={() => setClicks(c => c + 1)}>{`clicks ${clicks} of ${row.id}`}</button>;
    }
    const tableOptions = { ...new TableOptions(), masterDetail: { detailHeight: 60, detailRenderer: new DetailComponentRendererWrapper(Detail) } };
    let api: TableApi | undefined;
    const detailExpandedChanged = vi.fn();
    const host = mount(<GuiexpertTable tableModel={createModel(300)} tableOptions={tableOptions} tableReady={a => { api = a; }} detailExpandedChanged={detailExpandedChanged} />);
    await nextFrame();
    clickDetailToggle(host, 0);
    await nextFrame();
    host.querySelector<HTMLButtonElement>('.md-btn')!.click();
    await vi.waitFor(() => expect(host.querySelector('.md-btn')!.textContent).toBe('clicks 1 of 0'));
    api!.scrollToIndex(0, 200);
    await nextFrame();
    api!.scrollToIndex(0, 0);
    await nextFrame();
    expect(host.querySelector('.md-btn')!.textContent).toBe('clicks 1 of 0');
    api!.setDetailExpanded(0, false);
    await vi.waitFor(() => expect(unmounted).toHaveBeenCalledWith(0));
    expect(detailRowsOf(host)).toHaveLength(0);
    expect(detailExpandedChanged).toHaveBeenCalledTimes(2);
  });

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

  it('the loading prop shows and hides the overlay without re-creating the table (since 1.1.92)', async () => {
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
