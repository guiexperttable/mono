// Master/detail end to end in Chromium (prompts/011-master-detail.md, M1–M14).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import {
  AreaModel,
  AutoRestoreOptions,
  CellRange,
  ColumnDef,
  EventAdapter,
  FocusModel,
  SelectionModel,
  TableFactory,
  TreeFactory,
} from '@guiexpert/table';
import type {
  DetailRenderContextIf,
  GeDetailEvent,
  MasterDetailOptionsIf,
  TableApi,
  TableOptionsIf,
} from '@guiexpert/table';
import { destroyAllTables, mountTable, nextFrame, renderedRows, stylePx } from '../../../../test-utils/mount-table';
import { createItemModel, createOrderModel, createOrders, type Order } from '../../../../test-utils/master-detail-fixtures';
import { axeViolations } from '../../../../test-utils/axe';
import { memoryStorage } from '../../../../test-utils/memory-storage';

afterEach(() => {
  destroyAllTables();
  document.documentElement.removeAttribute('data-theme');
});

interface MountedMD {
  host: HTMLDivElement;
  api: TableApi;
  scope: ReturnType<typeof mountTable>['scope'];
  orders: Order[];
  listener: EventAdapter;
  fm: FocusModel;
  sm: SelectionModel;
}

function mountMD(
  masterDetail: Partial<MasterDetailOptionsIf<Order>>,
  opts: { count?: number; fixed?: number; tableOptions?: Partial<TableOptionsIf>; orders?: Order[]; width?: number; height?: number } = {}
): MountedMD {
  const orders = opts.orders ?? createOrders(opts.count ?? 200);
  const listener = new EventAdapter();
  const fm = new FocusModel('cell');
  const sm = new SelectionModel('range', 'multi');
  const { host, api, scope } = mountTable(createOrderModel(orders, opts.fixed ?? 1), {
    eventListener: listener,
    width: opts.width,
    height: opts.height,
    tableOptions: {
      getFocusModel: () => fm,
      getSelectionModel: () => sm,
      masterDetail,
      ...(opts.tableOptions ?? {}),
    },
  });
  return { host, api, scope, orders, listener, fm, sm };
}

/** The detail row divs in the layer (visible and parked). */
function detailRows(host: HTMLElement): HTMLElement[] {
  return Array.from(host.querySelectorAll<HTMLElement>('.ge-table-detail-layer > .ge-table-detail-row'));
}

function visibleDetailRows(host: HTMLElement): HTMLElement[] {
  return detailRows(host).filter(row => !row.classList.contains('ge-table-detail-row-parked'));
}

/** The row div of a body row in an area side. */
function rowDiv(host: HTMLElement, rowIndex: number, side: 'west' | 'center' | 'east' = 'center'): HTMLElement | undefined {
  return renderedRows(host, side).find(div => div.querySelector(`[data-row-index="${rowIndex}"]`));
}

function toggleOf(host: HTMLElement, rowIndex: number): HTMLElement | null {
  return host.querySelector<HTMLElement>(`.ge-table-detail-toggle[data-row-index="${rowIndex}"]`);
}

async function scrollTo(scope: MountedMD['scope'], top: number, left?: number) {
  scope.scrollViewport.scrollTop = top;
  if (left !== undefined) scope.scrollViewport.scrollLeft = left;
  scope.adjustAfterScrolling();
  await nextFrame();
}

const textRenderer = (el: HTMLDivElement, order: Order) => { el.textContent = `Order ${order.id}`; };

describe('master/detail – without the option', () => {
  it('creates no layer, no toggle, no aria-expanded (tables without details are unchanged)', async () => {
    const { host } = mountTable(createOrderModel(createOrders(50)));
    await nextFrame();
    expect(host.querySelector('.ge-table-detail-layer')).toBeNull();
    expect(host.querySelector('.ge-table-detail-toggle')).toBeNull();
    expect(host.querySelector('[aria-expanded]')).toBeNull();
    expect(host.getAttribute('aria-owns')).not.toContain('rg-detail');
  });
});

describe('master/detail – M1: expand an order', () => {

  it('a toggle in the first data column; a click opens the detail row with a nested table below the master', async () => {
    const t = mountMD({
      detailHeight: 180,
      detailRenderer: (_el, order, ctx) => { ctx.createTable({ tableModel: createItemModel(order) }); },
    });
    await nextFrame();
    const toggle = toggleOf(t.host, 0)!;
    expect(toggle).not.toBeNull();
    expect(toggle.closest('.ge-table-body-west')).not.toBeNull(); // column 0 = fixed west column
    expect(toggle.getAttribute('aria-hidden')).toBe('true');

    const rowHeight = t.scope.tableModel.getRowHeight('body', 0);
    const row1TopBefore = stylePx(rowDiv(t.host, 1)!, 'top');
    toggle.click();
    await nextFrame();

    expect(t.api.isDetailExpanded(0)).toBe(true);
    expect(t.api.isDetailExpanded(t.orders[0])).toBe(true);
    const rows = visibleDetailRows(t.host);
    expect(rows).toHaveLength(1);
    const detail = rows[0];
    expect(detail.querySelector('.ge-table-detail-table.ge-table .ge-table-body-center')).not.toBeNull(); // nested GuiExpert table
    expect(stylePx(detail, 'top')).toBe(rowHeight);
    expect(stylePx(detail, 'height')).toBe(180);
    // the row below moved down by the detail height
    expect(stylePx(rowDiv(t.host, 1)!, 'top')).toBe(row1TopBefore + 180);
    expect(stylePx(rowDiv(t.host, 1, 'west')!, 'top')).toBe(row1TopBefore + 180);
    expect(toggleOf(t.host, 0)!.classList).toContain('ge-table-detail-toggle-expanded');

    // full width: from the host's left edge (over the fixed west column) to the vertical scroll bar
    const layer = t.host.querySelector<HTMLElement>('.ge-table-detail-layer')!;
    const hostRect = t.host.getBoundingClientRect();
    const detailRect = detail.getBoundingClientRect();
    expect(Math.round(detailRect.left)).toBe(Math.round(hostRect.left + t.host.clientLeft));
    expect(Math.round(detailRect.width)).toBe(Math.round(layer.getBoundingClientRect().width));
    expect(layer.clientWidth).toBe(t.scope.tableModel.getPadding().left + t.scope.scrollViewport.clientWidth);
  });

  it('only rows of isMaster get a toggle; setDetailExpanded on another row does nothing', async () => {
    const t = mountMD({ isMaster: order => order.id % 2 === 1, detailRenderer: textRenderer });
    await nextFrame();
    expect(toggleOf(t.host, 0)).not.toBeNull();
    expect(toggleOf(t.host, 1)).toBeNull();
    expect(t.api.setDetailExpanded(1, true)).toBe(false);
    expect(t.api.setDetailExpanded(0, true)).toBe(true);
    expect(t.api.setDetailExpanded(0, true)).toBe(false); // already expanded
    expect(t.api.getExpandedDetailRows()).toEqual([t.orders[0]]);
  });

  it('toggleColumn as property; behind row numbers', async () => {
    const orders = createOrders(20);
    const model = TableFactory.createTableModel({
      rows: orders, rowNumbersVisible: true,
      columnDefs: [ColumnDef.create({ property: 'id' }), ColumnDef.create({ property: 'customer' })],
    });
    const { host, api } = mountTable(model, { tableOptions: { masterDetail: { detailRenderer: textRenderer } } });
    await nextFrame();
    expect(toggleOf(host, 0)!.getAttribute('data-col-index')).toBe('1'); // behind the row number column
    destroyAllTables();

    const t = mountMD({ toggleColumn: 'city', detailRenderer: textRenderer });
    await nextFrame();
    expect(toggleOf(t.host, 0)!.getAttribute('data-col-index')).toBe('2');
    expect(api).toBeDefined();
  });

  it('reports onDetailExpandedChanged with row, index and source', async () => {
    const t = mountMD({ detailRenderer: textRenderer });
    const events: GeDetailEvent[] = [];
    t.listener.onDetailExpandedChanged = evt => events.push(evt);
    await nextFrame();
    toggleOf(t.host, 2)!.click();
    t.api.toggleDetail(2);
    expect(events.map(e => [e.row, e.rowIndex, e.expanded, e.source])).toEqual([
      [t.orders[2], 2, true, 'mouse'],
      [t.orders[2], 2, false, 'api'],
    ]);
  });

  it('a renderer that throws leaves an empty detail row; the table keeps working', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const t = mountMD({ detailHeight: 60, detailRenderer: () => { throw new Error('boom'); } });
    t.api.setDetailExpanded(0, true);
    await nextFrame();
    expect(visibleDetailRows(t.host)).toHaveLength(1);
    expect(error).toHaveBeenCalled();
    t.api.setDetailExpanded(0, false);
    expect(detailRows(t.host)).toHaveLength(0);
  });
});

describe('master/detail – M2: horizontal scrolling', () => {
  it('the detail row stays where it is (it does not scroll with the columns)', async () => {
    const t = mountMD({ detailHeight: 120, detailRenderer: textRenderer }, { width: 400 });
    t.api.setDetailExpanded(0, true);
    await nextFrame();
    const detail = visibleDetailRows(t.host)[0];
    const leftBefore = detail.getBoundingClientRect().left;
    const cellLeftBefore = rowDiv(t.host, 0)!.querySelector<HTMLElement>('[data-col-index="2"]')?.getBoundingClientRect().left;
    await scrollTo(t.scope, 0, 150);
    expect(t.scope.scrollViewport.scrollLeft).toBeGreaterThan(0);
    expect(detail.getBoundingClientRect().left).toBe(leftBefore);
    const cellLeftAfter = rowDiv(t.host, 0)!.querySelector<HTMLElement>('[data-col-index="2"]')?.getBoundingClientRect().left;
    expect(cellLeftAfter).not.toBe(cellLeftBefore); // the cells did scroll
  });
});

describe('master/detail – M3/M4: vertical scrolling, life cycle', () => {

  it('100.000 masters, 50 open details: contents are created when shown, once – DOM and inner scroll position stay', async () => {
    const created: number[] = [];
    const apis = new Map<number, TableApi>();
    const t = mountMD({
      detailHeight: 160,
      detailRenderer: (_el, order, ctx) => {
        created.push(order.id);
        const many = Array.from({ length: 10 }, () => order.items).flat();
        apis.set(order.id, ctx.createTable({ tableModel: createItemModel({ ...order, items: many }) }));
      },
    }, { count: 100_000 });
    for (let k = 1; k < 50; k++) t.api.setDetailExpanded(k * 2000, true);
    t.api.setDetailExpanded(1, true);
    expect(t.api.getExpandedDetailRows()).toHaveLength(50);
    await nextFrame();
    expect(created).toEqual([2]);                     // only the detail row in view (row 1 = order 2)

    const element = t.api.getDetailElement(1)!;
    const innerViewport = element.querySelector<HTMLElement>('.ge-table-scroll-viewport')!;
    innerViewport.scrollTop = 40;
    await nextFrame();
    expect(innerViewport.scrollTop).toBe(40);

    t.scope.scrollToIndex(-1, 50_000);
    await nextFrame();
    expect(t.scope.getFirstVisibleRowIndex()).toBe(50_000);
    expect(created).toEqual([2, 50_001]);
    expect(element.closest('.ge-table-detail-row')!.classList).toContain('ge-table-detail-row-parked');

    t.scope.scrollToIndex(-1, 0);
    await nextFrame();
    expect(created).toEqual([2, 50_001]);             // not created again
    expect(t.api.getDetailElement(1)).toBe(element);  // the same DOM element
    expect(element.isConnected).toBe(true);
    expect(innerViewport.scrollTop).toBe(40);         // the scroll position in the detail table stayed
    expect(element.closest('.ge-table-detail-row')!.classList).not.toContain('ge-table-detail-row-parked');
  });

  it('beyond maxRenderedDetails the detail out of view the longest is destroyed and created again (recreated)', async () => {
    const contexts: DetailRenderContextIf<Order>[] = [];
    const cleanups: number[] = [];
    const t = mountMD({
      detailHeight: 100, maxRenderedDetails: 2,
      detailRenderer: (el, order, ctx) => {
        contexts.push(ctx);
        el.textContent = `Order ${order.id}`;
        return () => cleanups.push(order.id);
      },
    }, { count: 1000 });
    [0, 300, 600].forEach(i => t.api.setDetailExpanded(i, true));
    await nextFrame();
    t.scope.scrollToIndex(-1, 300);
    await nextFrame();
    t.scope.scrollToIndex(-1, 600);
    await nextFrame();
    expect(cleanups).toEqual([1]);                    // order 1 (row 0) was out of view the longest
    t.scope.scrollToIndex(-1, 0);
    await nextFrame();
    expect(contexts.map(c => [c.row.id, c.recreated])).toEqual([[1, false], [301, false], [601, false], [1, true]]);
    expect(cleanups).toEqual([1, 301]);
    expect(detailRows(t.host)).toHaveLength(2);
  });

  it('variable row heights + details: positions equal a plain summation', async () => {
    const orders = createOrders(300);
    class VarBody extends AreaModel {
      constructor() { super(); this.areaIdent = 'body'; }
      override getRowCount() { return orders.length; }
      override getRowHeight(r: number) { return r % 3 ? 30 : 50; }
      override getValueAt(r: number, c: number) { return c === 0 ? orders[r].id : orders[r].customer; }
      override getRowByIndex(r: number) { return orders[r]; }
    }
    const model = TableFactory.createTableModel({
      bodyAreaModel: new VarBody(), columnDefs: [ColumnDef.create({ property: 'id' }), ColumnDef.create({ property: 'customer' })]
    });
    const { host, api, scope } = mountTable(model, { tableOptions: { masterDetail: { detailHeight: 77, detailRenderer: textRenderer } } });
    [3, 10, 11, 150].forEach(i => api.setDetailExpanded(i, true));
    const top = (i: number) => {
      let y = 0;
      for (let r = 0; r < i; r++) y += (r % 3 ? 30 : 50) + ([3, 10, 11, 150].includes(r) ? 77 : 0);
      return y;
    };
    expect(scope.getBodyRowTop(12)).toBe(top(12));
    expect(scope.getBodyRowTop(200)).toBe(top(200));
    expect(scope.getBodyRowIndexAtY(top(10) + 50)).toBe(10);         // inside the detail of row 10 → row 10
    scope.scrollToIndex(-1, 151);
    await nextFrame();
    expect(scope.getFirstVisibleRowIndex()).toBe(151);
    await scrollTo(scope, 0);
    expect(stylePx(rowDiv(host, 5)!, 'top')).toBe(top(5));
  });
});

describe('master/detail – M5: collapse', () => {
  it('removes the detail row, calls the cleanup, aborts the signal and destroys the nested table', async () => {
    let signal: AbortSignal | undefined;
    let inner: TableApi | undefined;
    const cleanup = vi.fn();
    const t = mountMD({
      detailHeight: 150,
      detailRenderer: (_el, order, ctx) => {
        signal = ctx.signal;
        inner = ctx.createTable({ tableModel: createItemModel(order) });
        return cleanup;
      },
    });
    t.api.setDetailExpanded(0, true);
    await nextFrame();
    const destroy = vi.spyOn(inner!.getTableScope(), 'destroy');
    const contentHeight = t.scope.scrollViewport.scrollHeight;
    expect(t.api.setDetailExpanded(0, false)).toBe(true);
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(signal!.aborted).toBe(true);
    expect(destroy).toHaveBeenCalledTimes(1);
    expect(detailRows(t.host)).toHaveLength(0);
    expect(t.scope.scrollViewport.scrollHeight).toBe(contentHeight - 150);
    expect(toggleOf(t.host, 0)!.classList).not.toContain('ge-table-detail-toggle-expanded');
  });

  it('destroy() of the master table releases all details (no leaks); collapseAllDetails() too', async () => {
    const cleanup = vi.fn();
    const t = mountMD({ detailHeight: 50, detailRenderer: () => cleanup });
    [0, 1, 2].forEach(i => t.api.setDetailExpanded(i, true));
    await nextFrame();
    expect(t.api.collapseAllDetails()).toBe(3);
    expect(cleanup).toHaveBeenCalledTimes(3);
    [0, 1].forEach(i => t.api.setDetailExpanded(i, true));
    await nextFrame();
    t.api.destroy();
    expect(cleanup).toHaveBeenCalledTimes(5);
    expect(t.host.querySelector('.ge-table-detail-layer')).toBeNull();
  });

  it('expandAllDetails() opens every master row – contents only for the ones in view', async () => {
    const renderer = vi.fn(textRenderer);
    const t = mountMD({ detailHeight: 100, detailRenderer: renderer }, { count: 10_000 });
    expect(t.api.expandAllDetails()).toBe(10_000);
    await nextFrame();
    expect(renderer.mock.calls.length).toBeLessThan(10);
    expect(t.scope.scrollViewport.scrollHeight).toBeGreaterThan(10_000 * 100);
  });

  it('refreshDetail() creates the content again', async () => {
    const recreated: boolean[] = [];
    const t = mountMD({ detailHeight: 100, detailRenderer: (el, order, ctx) => { recreated.push(ctx.recreated); textRenderer(el, order); } });
    t.api.setDetailExpanded(0, true);
    await nextFrame();
    expect(t.api.refreshDetail(0)).toBe(true);
    await nextFrame();
    expect(recreated).toEqual([false, true]);
    expect(t.api.refreshDetail(5)).toBe(false);
  });
});

describe('master/detail – M6: sorting and filtering', () => {
  it('the detail row stays at its master row', async () => {
    const filter = { on: false };
    const t = mountMD({ detailHeight: 90, detailRenderer: textRenderer }, {
      count: 30,
      tableOptions: { externalFilterFunction: (order: Order) => !filter.on || order.id % 2 === 0 },
    });
    const master = t.orders[4];                       // order 5
    t.api.setDetailExpanded(4, true);
    t.scope.sortByColumn('total', 'desc');
    await nextFrame();
    let index = t.scope.tableModel.getBodyModel().getRowCount();
    for (let i = 0; i < index; i++) if (t.scope.tableModel.getBodyModel().getRowByIndex(i) === master) index = i;
    expect(t.api.isDetailExpanded(index)).toBe(true);
    const rowHeight = t.scope.tableModel.getRowHeight('body', 0);
    expect(t.scope.getBodyRowTop(index + 1) - t.scope.getBodyRowTop(index)).toBe(rowHeight + 90);

    filter.on = true;                                 // order 5 is filtered out: no detail row, stays expanded
    t.api.externalFilterChanged();
    await nextFrame();
    expect(visibleDetailRows(t.host)).toHaveLength(0);
    expect(t.api.isDetailExpanded(master)).toBe(true);
    filter.on = false;
    t.api.externalFilterChanged();
    await nextFrame();
    expect(t.api.getExpandedDetailRows()).toEqual([master]);
    expect(t.scope.getBodyRowLayout().getTotalHeight()).toBe(30 * rowHeight + 90);
  });

  it('setRows() with new objects: expanded rows with the same id stay expanded (content created again)', async () => {
    const renderer = vi.fn(textRenderer);
    const t = mountMD({ detailHeight: 80, detailRenderer: renderer, getRowId: order => order.id }, { count: 10 });
    t.api.setDetailExpanded(2, true);
    await nextFrame();
    const copies = t.orders.map(order => ({ ...order }));
    t.api.setRows(copies);
    t.api.repaintHard();
    await nextFrame();
    expect(t.api.isDetailExpanded(2)).toBe(true);
    expect(t.api.getExpandedDetailRows()[0]).toBe(copies[2]);
    expect(renderer).toHaveBeenCalledTimes(2);
    expect(renderer.mock.calls[1][1]).toBe(copies[2]);
  });

  it('rows removed from the model: their details are destroyed', async () => {
    const cleanup = vi.fn();
    const t = mountMD({ detailHeight: 80, detailRenderer: () => cleanup }, { count: 10 });
    t.api.setDetailExpanded(2, true);
    await nextFrame();
    t.api.setRows(t.orders.slice(3));
    t.api.repaintHard();
    await nextFrame();
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(t.api.getExpandedDetailRows()).toEqual([]);
  });
});

describe('master/detail – M7: height', () => {
  it('"auto": measured from the content, a change moves the rows below', async () => {
    let box: HTMLDivElement | undefined;
    const t = mountMD({
      detailRenderer: el => {
        box = document.createElement('div');
        box.style.height = '120px';
        el.appendChild(box);
      },
    });
    t.api.setDetailExpanded(0, true);
    await nextFrame();
    await vi.waitFor(() => expect(t.scope.getBodyRowLayout().getExtraHeight(0)).not.toBe(200)); // estimate replaced
    const detailDiv = t.api.getDetailElement(0)!.closest<HTMLElement>('.ge-table-detail-row')!;
    const measured = detailDiv.getBoundingClientRect().height;   // the borders of the row count (no overlap)
    expect(measured).toBeGreaterThanOrEqual(120);
    expect(t.scope.getBodyRowLayout().getExtraHeight(0)).toBe(Math.ceil(measured));
    const rowHeight = t.scope.tableModel.getRowHeight('body', 0);
    await vi.waitFor(() => expect(stylePx(rowDiv(t.host, 1)!, 'top')).toBe(rowHeight + Math.ceil(measured)));

    box!.style.height = '200px';
    await vi.waitFor(() => expect(stylePx(rowDiv(t.host, 1)!, 'top')).toBe(rowHeight + Math.ceil(measured) + 80));
  });

  it('estimatedDetailHeight before the first measurement; detailHeight as function', async () => {
    const t = mountMD({
      estimatedDetailHeight: 333,
      detailHeight: order => order.id === 1 ? 'auto' : 60,
      detailRenderer: textRenderer,
    });
    t.api.setDetailExpanded(5, true);
    expect(t.scope.getBodyRowLayout().getExtraHeight(5)).toBe(60);
    t.scope.scrollToIndex(-1, 100);                   // row 0 out of view: not measured yet
    t.api.setDetailExpanded(0, true);
    expect(t.scope.getBodyRowLayout().getExtraHeight(0)).toBe(333);
  });
});

describe('master/detail – M8: events from the detail stay in the detail', () => {
  it('clicks, keys and mouse down in the nested table do not reach the master table', async () => {
    let innerHost: HTMLElement | undefined;
    const t = mountMD({
      detailHeight: 200,
      detailRenderer: (el, order, ctx) => {
        ctx.createTable({ tableModel: createItemModel(order) });
        innerHost = el.querySelector<HTMLElement>('.ge-table-detail-table')!;
      },
    });
    const clicked = vi.spyOn(t.listener, 'onMouseClicked');
    const moved = vi.spyOn(t.listener, 'onMouseMoved');
    t.fm.setFocus(0, 1);
    t.api.setDetailExpanded(0, true);
    await nextFrame();
    const innerCell = innerHost!.querySelector<HTMLElement>('.ge-table-body-center [data-col-index="1"]')!;
    innerCell.click();
    innerCell.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    innerCell.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));
    innerCell.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    innerCell.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    await nextFrame();
    expect(clicked).not.toHaveBeenCalled();
    expect(moved).not.toHaveBeenCalled();
    expect(t.fm.getFocus()).toEqual([0, 1]);
    expect(t.sm.getRanges()).toEqual([]);

    innerHost!.focus();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Control>}a{/Control}');
    expect(t.fm.getFocus()).toEqual([0, 1]);          // the master table did not move its focus
    expect(t.sm.getRanges()).toEqual([]);
  });

  it('the mouse wheel over a detail row without own scrolling scrolls the master table', async () => {
    const t = mountMD({ detailHeight: 150, detailRenderer: textRenderer }, { count: 500 });
    t.api.setDetailExpanded(0, true);
    await nextFrame();
    const detail = visibleDetailRows(t.host)[0].querySelector('.ge-table-detail-cell')!;
    const evt = new WheelEvent('wheel', { deltaY: 120, bubbles: true, cancelable: true });
    detail.dispatchEvent(evt);
    expect(evt.defaultPrevented).toBe(true);
    expect(t.scope.scrollViewport.scrollTop).toBeGreaterThan(0);
  });

  it('the mouse wheel over a nested table scrolls the nested table first', async () => {
    let innerViewport: HTMLElement | undefined;
    const t = mountMD({
      detailHeight: 150,
      detailRenderer: (el, order, ctx) => {
        const many = Array.from({ length: 20 }, () => order.items).flat();
        ctx.createTable({ tableModel: createItemModel({ ...order, items: many }) });
        innerViewport = el.querySelector<HTMLElement>('.ge-table-scroll-viewport')!;
      },
    }, { count: 500 });
    t.api.setDetailExpanded(0, true);
    await nextFrame();
    const evt = new WheelEvent('wheel', { deltaY: 120, bubbles: true, cancelable: true });
    innerViewport!.dispatchEvent(evt);
    expect(t.scope.scrollViewport.scrollTop).toBe(0);   // the inner table can scroll: not forwarded
  });
});

describe('master/detail – M9: keyboard and screen readers', () => {

  it('master rows have aria-expanded; Enter toggles; announcements', async () => {
    const t = mountMD({ detailHeight: 80, detailRenderer: textRenderer });
    await nextFrame();
    expect(rowDiv(t.host, 0)!.getAttribute('aria-expanded')).toBe('false');
    expect(rowDiv(t.host, 0, 'west')!.getAttribute('aria-expanded')).toBe('false');
    t.host.focus();
    t.fm.setFocus(0, 2);
    await userEvent.keyboard('{Enter}');
    expect(t.api.isDetailExpanded(0)).toBe(true);
    await nextFrame();
    expect(rowDiv(t.host, 0)!.getAttribute('aria-expanded')).toBe('true');
    const live = document.getElementById(t.scope.ariaIds.liveRegion())!;
    await vi.waitFor(() => expect(live.textContent).toContain('Details expanded'));
    await userEvent.keyboard('{Enter}');
    expect(t.api.isDetailExpanded(0)).toBe(false);
  });

  it('the detail layer is a row group in aria-owns; detail row = row with one gridcell; axe finds nothing', async () => {
    const t = mountMD({
      detailHeight: 160,
      detailRenderer: (_el, order, ctx) => { ctx.createTable({ tableModel: createItemModel(order) }); },
    });
    t.api.setDetailExpanded(1, true);
    await nextFrame();
    const layer = t.host.querySelector<HTMLElement>('.ge-table-detail-layer')!;
    const owns = t.host.getAttribute('aria-owns')!.split(' ');
    expect(owns.indexOf(layer.id)).toBe(owns.indexOf(t.scope.ariaIds.rowGroup('body', 'east')) + 1);
    expect(layer.getAttribute('role')).toBe('rowgroup');
    const detail = visibleDetailRows(t.host)[0];
    expect(detail.getAttribute('role')).toBe('row');
    const cell = detail.querySelector('.ge-table-detail-cell')!;
    expect(cell.getAttribute('role')).toBe('gridcell');
    expect(cell.getAttribute('aria-colspan')).toBe('4');
    expect(t.host.getAttribute('role')).toBe('treegrid'); // rows with aria-expanded
    expect(await axeViolations(t.host)).toEqual([]);
  });

  it('Tab on a master row moves into its detail; Shift+Tab returns to the master row', async () => {
    let innerHost: HTMLElement | undefined;
    const t = mountMD({
      detailHeight: 200,
      detailRenderer: (el, order, ctx) => {
        ctx.createTable({ tableModel: createItemModel(order) });
        innerHost = el.querySelector<HTMLElement>('.ge-table-detail-table')!;
      },
    });
    t.api.setDetailExpanded(2, true);
    await nextFrame();
    t.host.focus();
    t.fm.setFocus(2, 1);
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement).toBe(innerHost);
    t.fm.setFocus(0, 1);                              // the master table moved meanwhile (e.g. by the mouse)
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
    expect(document.activeElement).toBe(t.host);
    expect(t.fm.getFocus()).toEqual([2, 1]);
  });
});

describe('master/detail – M10: scrollToIndex / ensureRowIsVisible', () => {
  it('land on the right row with open details above', async () => {
    const t = mountMD({ detailHeight: 300, detailRenderer: textRenderer }, { count: 2000 });
    for (let i = 0; i < 100; i += 3) t.api.setDetailExpanded(i, true);
    t.scope.scrollToIndex(-1, 120);
    await nextFrame();
    expect(t.scope.getFirstVisibleRowIndex()).toBe(120);
    await scrollTo(t.scope, 0);
    expect(t.scope.ensureRowIsVisible(60)).toBe(true);
    await nextFrame();
    expect(t.scope.getLastFullVisibleRowIndex()).toBe(60);  // the row is the last one, fully visible
    expect(t.scope.ensureRowIsVisible(60)).toBe(false);
    expect(t.scope.ensureRowIsVisible(10)).toBe(true);
    await nextFrame();
    expect(t.scope.getFirstFullVisibleRowIndex()).toBe(10);
  });
});

describe('master/detail – review findings', () => {

  it('a detail that fills the body: no row counts as visible, ensureRowIsVisible scrolls its master into view', async () => {
    const t = mountMD({ detailHeight: 3000, detailRenderer: textRenderer }, { count: 100 });
    t.api.setDetailExpanded(5, true);
    const rowHeight = t.scope.tableModel.getRowHeight('body', 0);
    t.scope.scrollToPixel(0, 6 * rowHeight + 500);     // inside the detail of row 5
    await nextFrame();
    expect(t.scope.getFirstFullVisibleRowIndex()).toBe(-1);
    expect(t.scope.getLastFullVisibleRowIndex()).toBe(-1);
    expect(t.scope.getDisplayedRowCount()).toBe(0);
    expect(t.scope.ensureRowIsVisible(5)).toBe(true);
    await nextFrame();
    expect(t.scope.getFirstFullVisibleRowIndex()).toBe(5);
  });

  it('updateCells with values only does not rebuild the row positions (no O(n) per live-data tick)', async () => {
    const t = mountMD({ detailHeight: 50, detailRenderer: textRenderer }, { count: 1000 });
    t.api.setDetailExpanded(999, true);
    t.scope.getBodyRowLayout();
    const keyOf = vi.spyOn(t.scope.masterDetailService!, 'keyOf');
    t.api.updateCells([{ area: 'body', rowIndex: 3, columnIndex: 1, value: 'Zed', cssClasses: {} }]);
    t.scope.getBodyRowLayout();
    expect(keyOf).not.toHaveBeenCalled();
    t.scope.sortByColumn('customer', 'asc');             // a structural change rebuilds
    t.scope.getBodyRowLayout();
    expect(keyOf).toHaveBeenCalled();
  });

  it('the focus inside a detail goes to the master row when the detail is collapsed', async () => {
    const t = mountMD({ detailHeight: 80, detailRenderer: el => { el.innerHTML = '<input class="in">'; } });
    t.api.setDetailExpanded(2, true);
    await nextFrame();
    t.host.querySelector<HTMLInputElement>('.in')!.focus();
    t.api.setDetailExpanded(2, false);
    expect(document.activeElement).toBe(t.host);
    expect(t.fm.getFocus()[0]).toBe(2);
  });

  it('the mouse over a detail row hides the hover row', async () => {
    const t = mountMD({ detailHeight: 80, detailRenderer: textRenderer }, { tableOptions: { hoverRowVisible: true } });
    t.api.setDetailExpanded(0, true);
    await nextFrame();
    const hover = t.host.querySelector<HTMLElement>('.ge-table-hover-row')!;
    hover.style.display = 'block';
    t.host.querySelector('.ge-table-detail-cell')!.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));
    expect(hover.style.display).toBe('none');
  });
});

describe('master/detail – M11: copy and Excel', () => {
  it('copy contains only the master rows', async () => {
    const t = mountMD({ detailHeight: 120, detailRenderer: textRenderer }, { count: 5 });
    t.api.setDetailExpanded(1, true);
    t.sm.addSelection(new CellRange(0, 0, 4, 1));
    const text = await t.scope.copyService.createContent(t.api.getTableModel(), t.sm, t.fm);
    expect(text).not.toContain('Order 2');
    expect(text.trim().split('\n')).toHaveLength(5);
  });
});

describe('master/detail – M12: table state', () => {
  it('expanded masters are stored by id and expanded again after a reload', async () => {
    const storage = memoryStorage();
    const autoRestoreOptions = {
      ...new AutoRestoreOptions<Order>(),
      getStorageKeyFn: () => 'md-',
      getRowId: (order: Order) => order.id,
      autoRestoreDetailState: true,
      storage,
    };
    const t = mountMD({ detailHeight: 70, detailRenderer: textRenderer }, { count: 50, tableOptions: { autoRestoreOptions, stateChangedDebounceDelay: 0 } });
    t.api.setDetailExpanded(3, true);
    t.api.setDetailExpanded(7, true);
    expect(t.api.getState(['details'])).toEqual({ version: 1, detailRowIds: [4, 8] });
    t.api.destroy();
    expect(JSON.parse(storage.getItem('md-tableState')!).detailRowIds).toEqual([4, 8]);

    const again = mountMD({ detailHeight: 70, detailRenderer: textRenderer }, { count: 50, tableOptions: { autoRestoreOptions } });
    expect(again.api.getExpandedDetailRows().map(order => order.id).sort()).toEqual([4, 8]);
    again.api.applyState({ version: 1, detailRowIds: [1] });
    expect(again.api.getExpandedDetailRows().map(order => order.id)).toEqual([1]);
  });
});

describe('master/detail – M14: look', () => {
  it('detail rows use the CSS variables (light and dark)', async () => {
    const t = mountMD({ detailHeight: 70, detailRenderer: textRenderer });
    t.api.setDetailExpanded(0, true);
    await nextFrame();
    const detail = visibleDetailRows(t.host)[0];
    const light = getComputedStyle(detail).backgroundColor;
    expect(light).toBe('rgb(244, 246, 249)');
    document.documentElement.setAttribute('data-theme', 'dark');
    expect(getComputedStyle(detail).backgroundColor).toBe('rgb(27, 31, 36)');
    expect(getComputedStyle(detail).borderTopStyle).toBe('solid');
  });
});

describe('master/detail – security and limits', () => {
  it('HTML in the data of a nested table is shown as text', async () => {
    const order = { ...createOrders(1)[0] };
    order.items = [{ sku: '<img src="x" onerror="window.__mdXss=1">', name: 'x', qty: 1, price: 1 }];
    const t = mountMD({
      detailHeight: 150,
      detailRenderer: (_el, o, ctx) => { ctx.createTable({ tableModel: createItemModel(o) }); },
    }, { orders: [order] });
    t.api.setDetailExpanded(0, true);
    await nextFrame();
    const cell = t.api.getDetailElement(0)!;
    expect(cell.querySelector('img')).toBeNull();
    expect(cell.textContent).toContain('<img src="x"');
    expect((window as { __mdXss?: number }).__mdXss).toBeUndefined();
  });

  it('a tree body: masterDetail is ignored with a warning', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const rows = TreeFactory.buildTreeRows([{ id: 1, name: 'a', children: [{ id: 2, name: 'b' }] }] as never[], 'children');
    const model = TableFactory.createTableModel({ rows, properties: ['id', 'name'] } as never);
    const { host, api } = mountTable(model, { tableOptions: { masterDetail: { detailRenderer: textRenderer } } });
    await nextFrame();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('masterDetail is ignored'));
    expect(host.querySelector('.ge-table-detail-layer')).toBeNull();
    expect(api.setDetailExpanded(0, true)).toBe(false);
  });

  it('row drag: a pointer over a detail row targets its master row ("after")', async () => {
    const t = mountMD({ detailHeight: 100, detailRenderer: textRenderer });
    t.api.setDetailExpanded(0, true);
    const rowHeight = t.scope.tableModel.getRowHeight('body', 0);
    expect(t.scope.getBodyRowIndexAtY(rowHeight + 50)).toBe(0);
    expect(t.scope.getBodyRowIndexAtY(rowHeight + 100)).toBe(1);
    expect(t.scope.getBodyRowTop(1)).toBe(rowHeight + 100);
  });
});
