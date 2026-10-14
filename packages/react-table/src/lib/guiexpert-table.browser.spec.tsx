// Smoke test of the React wrapper in Chromium: mount → tableReady → rows → click → new model → unmount.
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { StrictMode } from 'react';
import type { ReactElement } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { TableApi, TableOptions, TableScope } from '@guiexpert/table';
import type { GeMouseEvent } from '@guiexpert/table';
import { GuiexpertTable } from './guiexpert-table';
import {
  bodyCell, cellOf, createHost, createModel, isDestroyed, nextFrame, removeHosts, rowTexts, tableCount
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
});
