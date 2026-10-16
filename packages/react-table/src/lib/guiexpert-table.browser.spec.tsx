// Smoke test of the React wrapper in Chromium: mount → tableReady → rows → click → new model → unmount.
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { StrictMode, useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { TableApi, TableOptions, TableScope } from '@guiexpert/table';
import type { GeBatchEditEvent, GeDetailEvent, GeModelChangeEvent, GeMouseEvent, GeRowDragEvent, GeStateChangeEvent } from '@guiexpert/table';
import { GuiexpertTable } from './guiexpert-table';
import { DetailComponentRendererWrapper } from './detail-component-renderer-wrapper';
import type { DetailComponentProps } from './detail-component-renderer-wrapper';
import {
  bodyCell, cellOf, clickDetailToggle, detailRowsOf, createFillModelAndOptions, dragFillHandle, createGroupedModel, createHost, createModel, createPivotModel, createRowDragModel, dragRow, groupLabels, isDestroyed, nextFrame, overlayKind, pivotTotals, removeHosts, rowTexts, tableCount
} from '../../../table/test-utils/wrapper-test-utils';

beforeAll(() => {
  // tells React that act() is used (no "not wrapped in act(...)" warnings)
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

let root: Root | undefined;

function mount(ui: ReactElement): HTMLDivElement {
  const host = createHost();
  root = createRoot(host);
  act(() => root!.render(ui));
  return host;
}

function rerender(ui: ReactElement) {
  act(() => root!.render(ui));
}

function unmount() {
  act(() => root?.unmount());
  root = undefined;
}

afterEach(() => {
  unmount();
  removeHosts();
  vi.restoreAllMocks();
});

describe('GuiexpertTable (React)', () => {

  it('master/detail: a React component as detail keeps its state while scrolling, is unmounted on collapse (since 1.1.97)', async () => {
    const unmounted = vi.fn();
    function Detail({ row }: DetailComponentProps<{ id: number }>) {
      const [clicks, setClicks] = useState(0);
      useEffect(() => () => unmounted(row.id), [row]);
      return <button className="md-btn" onClick={() => setClicks(c => c + 1)}>{`clicks ${clicks} of ${row.id}`}</button>;
    }
    const tableOptions = { ...new TableOptions(), masterDetail: { detailHeight: 60, detailRenderer: new DetailComponentRendererWrapper(Detail) } };
    const tableModel = createModel(300);
    const detailExpandedChanged = vi.fn<(evt: GeDetailEvent) => void>();
    let api: TableApi | undefined;
    const host = mount(<GuiexpertTable tableModel={tableModel} tableOptions={tableOptions} tableReady={a => { api = a; }}
                                       detailExpandedChanged={detailExpandedChanged} />);
    await nextFrame();
    act(() => clickDetailToggle(host, 0));
    await nextFrame();
    await vi.waitFor(() => expect(host.querySelector('.md-btn')?.textContent).toBe('clicks 0 of 0'));
    act(() => host.querySelector<HTMLButtonElement>('.md-btn')!.click());
    expect(host.querySelector('.md-btn')!.textContent).toBe('clicks 1 of 0');

    act(() => api!.scrollToIndex(0, 200));
    await nextFrame();
    expect(detailRowsOf(host)[0].classList).toContain('ge-table-detail-row-parked');
    act(() => api!.scrollToIndex(0, 0));
    await nextFrame();
    expect(host.querySelector('.md-btn')!.textContent).toBe('clicks 1 of 0');  // the state survived scrolling
    expect(unmounted).not.toHaveBeenCalled();

    act(() => { api!.setDetailExpanded(0, false); });
    await vi.waitFor(() => expect(unmounted).toHaveBeenCalledWith(0));
    expect(detailRowsOf(host)).toHaveLength(0);
    expect(detailExpandedChanged.mock.calls.map(c => [c[0].expanded, c[0].source])).toEqual([[true, 'mouse'], [false, 'api']]);
  });

  it('master/detail: unmounting the table unmounts the detail components', async () => {
    const unmounted = vi.fn();
    function Detail() {
      useEffect(() => () => unmounted(), []);
      return <span className="md-detail">detail</span>;
    }
    const tableOptions = { ...new TableOptions(), masterDetail: { detailHeight: 40, detailRenderer: new DetailComponentRendererWrapper(Detail) } };
    let api: TableApi | undefined;
    const host = mount(<GuiexpertTable tableModel={createModel(20)} tableOptions={tableOptions} tableReady={a => { api = a; }} />);
    await nextFrame();
    act(() => { api!.setDetailExpanded(1, true); });
    await nextFrame();
    await vi.waitFor(() => expect(host.querySelector('.md-detail')).not.toBeNull());
    unmount();
    await vi.waitFor(() => expect(unmounted).toHaveBeenCalledTimes(1));
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

  it('the table is a WAI-ARIA grid with a name from the options (screen readers, since 1.1.91)', async () => {
    const tableOptions = { ...new TableOptions(), ariaLabel: 'Orders' };
    const host = mount(<GuiexpertTable tableModel={createModel(5)} tableOptions={tableOptions} />);
    await nextFrame();

    const grid = host.querySelector('[role="grid"]')!;
    expect(grid).not.toBeNull();
    expect(grid.getAttribute('aria-label')).toBe('Orders');
    expect(grid.getAttribute('aria-rowcount')).toBe('6'); // header + 5 rows
    expect(grid.querySelectorAll('[role="row"]').length).toBeGreaterThan(1);
  });

  it('rowDragStart / rowDragMove / rowDragEnd are called, the row is moved (since 1.1.95)', async () => {
    const types: string[] = [];
    const rowDragEnd = vi.fn<(evt: GeRowDragEvent) => void>(e => { types.push(e.type); });
    const host = mount(<GuiexpertTable tableModel={createRowDragModel()} rowDragStart={e => types.push(e.type)}
                                       rowDragMove={e => types.push(e.type)} rowDragEnd={rowDragEnd} />);
    await nextFrame();
    dragRow(host, 1, 3);
    expect(types[0]).toBe('start');
    expect(types).toContain('move');
    expect(rowDragEnd).toHaveBeenCalledTimes(1);
    expect(rowDragEnd.mock.calls[0][0]).toMatchObject({ type: 'end', moved: true, toIndex: 3 });
    await nextFrame();
    expect(rowTexts(host)[3]).toContain('Row 1');
  });

  it('fill handle: one modelChanged with all filled cells; batch edit: batchEditChanged (since 1.1.96)', async () => {
    const modelChanged = vi.fn<(evt: GeModelChangeEvent) => void>();
    const { tableModel, tableOptions, rows } = createFillModelAndOptions();
    const host = mount(<GuiexpertTable tableModel={tableModel} tableOptions={tableOptions} modelChanged={modelChanged} />);
    await nextFrame();
    dragFillHandle(host, 4);
    expect(rows.map(r => r.qty)).toEqual([1, 2, 3, 4, 5]);
    expect(modelChanged).toHaveBeenCalledTimes(1);
    expect(modelChanged.mock.calls[0][0]).toMatchObject({ source: 'fill' });
    expect(modelChanged.mock.calls[0][0].cells).toHaveLength(3);
    unmount();

    const batch = createFillModelAndOptions(true);
    const batchEditChanged = vi.fn<(evt: GeBatchEditEvent) => void>();
    const host2 = mount(<GuiexpertTable tableModel={batch.tableModel} tableOptions={batch.tableOptions} batchEditChanged={batchEditChanged} />);
    await nextFrame();
    dragFillHandle(host2, 3);
    expect(batch.rows.map(r => r.qty)).toEqual([1, 2, 0, 0, 0]);
    expect(batchEditChanged).toHaveBeenCalledTimes(1);
    expect(batchEditChanged.mock.calls[0][0]).toMatchObject({ type: 'change', pendingCount: 2 });
  });

  it('stateChanged is called (debounced) after the state changed (since 1.1.92)', async () => {
    const stateChanged = vi.fn<(evt: GeStateChangeEvent) => void>();
    let api: TableApi | undefined;
    const tableOptions = { ...new TableOptions(), stateChangedDebounceDelay: 10 };
    mount(<GuiexpertTable tableModel={createModel(5)} tableOptions={tableOptions} tableReady={a => api = a} stateChanged={stateChanged} />);
    await nextFrame();
    api!.setColumnWidth(0, 222);
    await vi.waitFor(() => expect(stateChanged).toHaveBeenCalledTimes(1));
    expect(stateChanged.mock.calls[0][0].changedParts).toEqual(['columns']);
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

  it('a new tableOptions object re-creates the table, a re-render with the same objects does not', async () => {
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

  it('unmount destroys the table without errors', async () => {
    const consoleError = vi.spyOn(console, 'error');
    const tableReady = vi.fn<(api: TableApi) => void>();
    const destroy = vi.spyOn(TableScope.prototype, 'destroy');
    const host = mount(<GuiexpertTable tableModel={createModel(5)} tableReady={tableReady} />);
    await nextFrame();

    unmount();
    await new Promise(resolve => setTimeout(resolve, 10)); // cell renderers are unmounted deferred

    expect(destroy).toHaveBeenCalledTimes(1);
    expect(isDestroyed(tableReady.mock.calls[0][0])).toBe(true);
    expect(tableCount(host)).toBe(0);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('StrictMode (double effect run) leaves exactly one live table', async () => {
    const tableReady = vi.fn<(api: TableApi) => void>();
    const host = mount(<StrictMode><GuiexpertTable tableModel={createModel(5)} tableReady={tableReady} /></StrictMode>);
    await nextFrame();

    const apis = tableReady.mock.calls.map(([api]) => api);
    expect(apis.filter(api => !isDestroyed(api))).toHaveLength(1);
    expect(tableCount(host)).toBe(1);
    expect(rowTexts(host)).toHaveLength(5);
  });

  it('the loading prop shows and hides the overlay without re-creating the table (since 1.1.92)', async () => {
    const tableReady = vi.fn<(api: TableApi) => void>();
    const tableModel = createModel(5);
    const tableOptions = new TableOptions();
    const host = mount(<GuiexpertTable tableModel={tableModel} tableOptions={tableOptions} tableReady={tableReady} loading />);
    await nextFrame();
    expect(overlayKind(host)).toBe('loading');
    expect(tableReady.mock.calls[0][0].getOverlayState()).toBe('loading');

    rerender(<GuiexpertTable tableModel={tableModel} tableOptions={tableOptions} tableReady={tableReady} loading={false} />);
    expect(overlayKind(host)).toBe('none');
    rerender(<GuiexpertTable tableModel={tableModel} tableOptions={tableOptions} tableReady={tableReady} loading />);
    expect(overlayKind(host)).toBe('loading');
    expect(tableReady).toHaveBeenCalledTimes(1);

    // a new model re-creates the table – it still shows the overlay
    rerender(<GuiexpertTable tableModel={createModel(2)} tableOptions={tableOptions} tableReady={tableReady} loading />);
    expect(tableReady).toHaveBeenCalledTimes(2);
    expect(overlayKind(host)).toBe('loading');
  });

  it('an empty model shows "No rows to show" by itself (since 1.1.92)', async () => {
    const host = mount(<GuiexpertTable tableModel={createModel(0)} />);
    await nextFrame();
    expect(overlayKind(host)).toBe('noRows');
  });

  it('an overlay the app shows in tableReady is not hidden by the loading prop (since 1.1.92)', async () => {
    const host = mount(<GuiexpertTable tableModel={createModel(5)} tableReady={api => api.showLoadingOverlay()} />);
    await nextFrame();
    expect(overlayKind(host)).toBe('loading');
  });

  it('a row grouping: group rows render, setRowGroupBy regroups without a rebuild (since 1.1.94)', async () => {
    const tableReady = vi.fn<(api: TableApi) => void>();
    const destroy = vi.spyOn(TableScope.prototype, 'destroy');
    const host = mount(<GuiexpertTable tableModel={createGroupedModel()} tableReady={tableReady} />);
    await nextFrame();
    expect(groupLabels(host)).toEqual(['Nord (3)', 'Süd (3)']);
    const api = tableReady.mock.calls[0][0];
    act(() => { api.setRowGroupBy(['produkt']); });
    await nextFrame();
    expect(groupLabels(host)[0]).toBe('A (4)');
    expect(tableReady).toHaveBeenCalledTimes(1);
    expect(destroy).not.toHaveBeenCalled();
    rerender(<GuiexpertTable tableModel={createModel(3)} tableReady={tableReady} />);
    await nextFrame();
    expect(destroy).toHaveBeenCalledTimes(1);
    expect(tableReady).toHaveBeenCalledTimes(2);
  });

  it('a pivot table: rows and totals render, setPivotConfig pivots again without a rebuild (since 1.1.94)', async () => {
    const tableReady = vi.fn<(api: TableApi) => void>();
    const destroy = vi.spyOn(TableScope.prototype, 'destroy');
    const host = mount(<GuiexpertTable tableModel={createPivotModel()} tableReady={tableReady} />);
    await nextFrame();
    expect(groupLabels(host)).toEqual(['Nord', 'Süd']);
    expect(pivotTotals(host)).toEqual(['270', '180']);
    const api = tableReady.mock.calls[0][0];
    act(() => { api.setPivotConfig({ rowFields: ['produkt'] }); });
    await nextFrame();
    expect(groupLabels(host)).toEqual(['A', 'B']);
    expect(pivotTotals(host)).toEqual(['330', '120']);
    expect(tableReady).toHaveBeenCalledTimes(1);
    expect(destroy).not.toHaveBeenCalled();
    rerender(<GuiexpertTable tableModel={createModel(3)} tableReady={tableReady} />);
    await nextFrame();
    expect(destroy).toHaveBeenCalledTimes(1);
    expect(tableReady).toHaveBeenCalledTimes(2);
  });

  it('direction "rtl" reaches the core: dir="rtl" on the table, the first column on the right (since 1.1.98)', async () => {
    const tableReady = vi.fn<(api: TableApi) => void>();
    const tableOptions = { ...new TableOptions(), direction: 'rtl' as const };
    const host = mount(<GuiexpertTable tableModel={createModel(5)} tableOptions={tableOptions} tableReady={tableReady} />);
    await nextFrame();
    const table = host.querySelector<HTMLElement>('.ge-table')!;
    expect(table.getAttribute('dir')).toBe('rtl');
    expect(tableReady.mock.calls[0][0].getDirection()).toBe('rtl');
    const first = bodyCell(host, 0, 0)!;
    expect(first.style.right).toBe('0px');
    expect(Math.abs(first.getBoundingClientRect().right - table.getBoundingClientRect().right)).toBeLessThanOrEqual(1);
  });
});
