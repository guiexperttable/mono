// Master/detail: options, models without row objects, error handling, wheel and keyboard details.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { AreaModel, AutoRestoreOptions, ColumnDef, FocusModel, TableFactory } from '@guiexpert/table';
import type { DetailRendererIf, DetailRenderContextIf, TableOptionsIf } from '@guiexpert/table';
import { destroyAllTables, mountTable, nextFrame, stylePx } from '../../../../test-utils/mount-table';
import { createOrderModel, createOrders, type Order } from '../../../../test-utils/master-detail-fixtures';

afterEach(destroyAllTables);

const text = (el: HTMLDivElement, order: Order) => { el.textContent = `Order ${order.id}`; };

function mount(masterDetail: TableOptionsIf['masterDetail'], opts: { orders?: Order[]; tableOptions?: Partial<TableOptionsIf>; fixed?: number } = {}) {
  const orders = opts.orders ?? createOrders(100);
  const fm = new FocusModel('cell');
  const table = mountTable(createOrderModel(orders, opts.fixed ?? 1), { tableOptions: { getFocusModel: () => fm, masterDetail, ...(opts.tableOptions ?? {}) } });
  return { ...table, orders, fm };
}

function visibleDetails(host: HTMLElement): HTMLElement[] {
  return Array.from(host.querySelectorAll<HTMLElement>('.ge-table-detail-row:not(.ge-table-detail-row-parked)'));
}

class PlainBody extends AreaModel {
  // a model without row objects: the display index is the key
  constructor(private readonly count: number) { super(); this.areaIdent = 'body'; }
  override getRowCount() { return this.count; }
  override getRowHeight() { return 30; }
  override getConstantRowHeight() { return 30; }
  override getValueAt(r: number, c: number) { return `${r}/${c}`; }
}

describe('master/detail – options', () => {

  it('a DetailRendererIf object; a missing detailRenderer warns', async () => {
    const renderer: DetailRendererIf<Order> = { render: (el, order) => { el.textContent = `obj ${order.id}`; } };
    const t = mount({ detailHeight: 60, detailRenderer: renderer });
    t.api.setDetailExpanded(0, true);
    await nextFrame();
    expect(t.api.getDetailElement(0)!.textContent).toBe('obj 1');
    destroyAllTables();

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const empty = mount({ detailHeight: 60 });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('without a detailRenderer'));
    empty.api.setDetailExpanded(0, true);
    await nextFrame();
    expect(visibleDetails(empty.host)).toHaveLength(1);
  });

  it('toggleColumn as index; with a row checkbox column; showCheckboxWihoutExtraColumn', async () => {
    let t = mount({ toggleColumn: 3, detailRenderer: text });
    await nextFrame();
    expect(t.host.querySelector('.ge-table-detail-toggle')!.getAttribute('data-col-index')).toBe('3');
    destroyAllTables();

    const orders = createOrders(10);
    const model = TableFactory.createTableModel({ rows: orders, properties: ['id', 'customer'], rowCheckboxVisible: true });
    const withCheckbox = mountTable(model, { tableOptions: { masterDetail: { detailRenderer: text } } });
    await nextFrame();
    expect(withCheckbox.host.querySelector('.ge-table-detail-toggle')!.getAttribute('data-col-index')).toBe('1');
    destroyAllTables();

    t = mount({ detailRenderer: text }, { tableOptions: { showCheckboxWihoutExtraColumn: true } });
    await nextFrame();
    expect(t.host.querySelector('.ge-table-detail-toggle')!.getAttribute('data-col-index')).toBe('0');
  });

  it('isMaster and detailHeight that throw or return nonsense', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const t = mount({
      isMaster: order => { if (order.id === 3) throw new Error('isMaster'); return true; },
      detailHeight: order => { if (order.id === 1) throw new Error('height'); return order.id === 2 ? NaN : 40; },
      estimatedDetailHeight: 90,
      detailRenderer: text,
    });
    expect(t.api.setDetailExpanded(2, true)).toBe(false);   // isMaster threw
    expect(t.api.setDetailExpanded(0, true)).toBe(true);
    expect(t.api.setDetailExpanded(1, true)).toBe(true);
    expect(t.scope.getBodyRowLayout().getExtraHeight(0)).toBe(90); // threw → "auto" → estimate
    expect(t.scope.getBodyRowLayout().getExtraHeight(1)).toBe(90); // NaN → "auto"
    expect(error).toHaveBeenCalled();
    // a filtered-out row object: isMaster with index -1
    expect(t.api.setDetailExpanded(t.orders[2], true)).toBe(false);
  });

  it('a fixed detail height that is not a number counts as "auto"', async () => {
    const t = mount({ detailHeight: 'x' as never, estimatedDetailHeight: 55, detailRenderer: text });
    t.api.setDetailExpanded(0, true);
    expect(t.scope.getBodyRowLayout().getExtraHeight(0)).toBe(55);
  });

  it('getRowId of autoRestoreOptions is used, its default (JSON) is not', async () => {
    const own = mount({ detailRenderer: text }, {
      tableOptions: { autoRestoreOptions: { ...new AutoRestoreOptions<Order>(), getRowId: (o: Order) => `o${o.id}` } },
    });
    own.api.setDetailExpanded(0, true);
    expect(own.scope.masterDetailService!.keyOf(own.orders[0], 0)).toBe('o1');
    destroyAllTables();
    const def = mount({ detailRenderer: text }, { tableOptions: { autoRestoreOptions: new AutoRestoreOptions<Order>() } });
    expect(def.scope.masterDetailService!.keyOf(def.orders[0], 0)).toBe(def.orders[0]);
    expect(def.scope.masterDetailService!.keyOf(undefined, 4)).toBe(4);
    // an id function that throws: the row object
    destroyAllTables();
    const bad = mount({ detailRenderer: text, getRowId: () => { throw new Error('id'); } });
    expect(bad.scope.masterDetailService!.keyOf(bad.orders[1], 1)).toBe(bad.orders[1]);
  });

  it('createTable with an own height (px and CSS)', async () => {
    const t = mount({
      detailHeight: 'auto',
      detailRenderer: (_el, order, ctx) => {
        ctx.createTable({ tableModel: TableFactory.createTableModel({ rows: order.items, properties: ['sku'] }), height: order.id === 1 ? 140 : '10em' });
      },
    });
    t.api.setDetailExpanded(0, true);
    t.api.setDetailExpanded(1, true);
    await nextFrame();
    expect(t.api.getDetailElement(0)!.querySelector<HTMLElement>('.ge-table-detail-table')!.style.height).toBe('140px');
    expect(t.api.getDetailElement(1)!.querySelector<HTMLElement>('.ge-table-detail-table')!.style.height).toBe('10em');
  });
});

describe('master/detail – models without row objects', () => {
  it('the display index is the key; toggle by index works', async () => {
    const model = TableFactory.createTableModel({ bodyAreaModel: new PlainBody(500), columnDefs: [ColumnDef.create({ property: 'a' })] });
    const contexts: DetailRenderContextIf[] = [];
    const { api, host, scope } = mountTable(model, { tableOptions: { masterDetail: { detailHeight: 50, detailRenderer: (el, _row, ctx) => { contexts.push(ctx); el.textContent = `#${ctx.rowIndex}`; } } } });
    expect(api.setDetailExpanded(3, true)).toBe(true);
    expect(api.isDetailExpanded(3)).toBe(true);
    expect(api.setDetailExpanded(999, true)).toBe(false);   // out of range
    expect(api.isDetailExpanded(-1)).toBe(false);
    await nextFrame();
    expect(contexts[0].row).toBeUndefined();
    expect(host.querySelector('.ge-table-detail-cell')!.textContent).toBe('#3');
    expect(scope.getBodyRowTop(4)).toBe(4 * 30 + 50);
    expect(api.getExpandedDetailRows()).toEqual([undefined]);
    expect(api.toggleDetail(3)).toBe(true);
    expect(api.isDetailExpanded(3)).toBe(false);
  });

  it('a row object of a custom model is found by a scan', async () => {
    const rows = Array.from({ length: 50 }, (_, i) => ({ n: i }));
    class ObjBody extends PlainBody {
      override getRowByIndex(r: number) { return rows[r]; }
    }
    const model = TableFactory.createTableModel({ bodyAreaModel: new ObjBody(50), columnDefs: [ColumnDef.create({ property: 'a' })] });
    const { api } = mountTable(model, { tableOptions: { masterDetail: { detailHeight: 50, detailRenderer: () => undefined } } });
    expect(api.setDetailExpanded(rows[7], true)).toBe(true);
    expect(api.isDetailExpanded(7)).toBe(true);
    expect(api.isDetailExpanded({ n: 99 })).toBe(false);
    expect(api.setDetailExpanded({ n: 99 }, false)).toBe(false);
  });
});

describe('master/detail – wheel and keyboard details', () => {

  it('wheel: line mode, horizontal, ctrl (zoom) and at the end of the table', async () => {
    const t = mount({ detailHeight: 150, detailRenderer: text }, { orders: createOrders(300) });
    t.api.setDetailExpanded(0, true);
    await nextFrame();
    const cell = t.host.querySelector('.ge-table-detail-cell')!;
    cell.dispatchEvent(new WheelEvent('wheel', { deltaY: 3, deltaMode: 1, bubbles: true, cancelable: true }));
    expect(t.scope.scrollViewport.scrollTop).toBeGreaterThanOrEqual(40);
    const zoom = new WheelEvent('wheel', { deltaY: 100, ctrlKey: true, bubbles: true, cancelable: true });
    cell.dispatchEvent(zoom);
    expect(zoom.defaultPrevented).toBe(false);
    t.scope.scrollViewport.scrollTop = 0;
    const page = new WheelEvent('wheel', { deltaY: 1, deltaMode: 2, bubbles: true, cancelable: true });
    cell.dispatchEvent(page);
    expect(page.defaultPrevented).toBe(true);
    const up = new WheelEvent('wheel', { deltaY: -100000, bubbles: true, cancelable: true });
    t.scope.scrollViewport.scrollTop = 0;
    cell.dispatchEvent(up);
    expect(up.defaultPrevented).toBe(false);           // nothing to scroll: the page may scroll
  });

  it('wheel: a horizontally scrollable element in the detail takes horizontal movements', async () => {
    const t = mount({
      detailHeight: 120,
      detailRenderer: el => {
        const box = document.createElement('div');
        box.style.cssText = 'width:200px;height:60px;overflow:auto';
        box.innerHTML = '<div style="width:2000px;height:20px">wide</div>';
        el.appendChild(box);
      },
    });
    t.api.setDetailExpanded(0, true);
    await nextFrame();
    const box = t.api.getDetailElement(0)!.firstElementChild as HTMLElement;
    const evt = new WheelEvent('wheel', { deltaX: 50, bubbles: true, cancelable: true });
    box.firstElementChild!.dispatchEvent(evt);
    expect(evt.defaultPrevented).toBe(false);
    box.scrollLeft = 1800;
    const back = new WheelEvent('wheel', { deltaX: -50, bubbles: true, cancelable: true });
    box.dispatchEvent(back);
    expect(back.defaultPrevented).toBe(false);
  });

  it('Tab without a focusable element in the detail (or without detail) stays with the browser', async () => {
    const t = mount({ detailHeight: 80, detailRenderer: text });
    t.api.setDetailExpanded(1, true);
    await nextFrame();
    t.host.focus();
    t.fm.setFocus(1, 1);
    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    t.host.dispatchEvent(tab);
    expect(tab.defaultPrevented).toBe(false);
    t.fm.setFocus(5, 1);
    const tab2 = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    t.host.dispatchEvent(tab2);
    expect(tab2.defaultPrevented).toBe(false);
    const ctrlTab = new KeyboardEvent('keydown', { key: 'Tab', ctrlKey: true, bubbles: true, cancelable: true });
    t.host.dispatchEvent(ctrlTab);
    expect(ctrlTab.defaultPrevented).toBe(false);
  });

  it('Tab skips disabled and tabindex=-1 elements and enters the first focusable input', async () => {
    const t = mount({
      detailHeight: 80,
      detailRenderer: el => {
        el.innerHTML = '<button disabled>a</button><span tabindex="-1">b</span><input class="first">';
      },
    });
    t.api.setDetailExpanded(0, true);
    await nextFrame();
    t.host.focus();
    t.fm.setFocus(0, 1);
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement?.className).toBe('first');
    // keys in the input do not move the focus of the master table
    await userEvent.keyboard('{ArrowDown}x');
    expect(t.fm.getFocus()).toEqual([0, 1]);
    const input = document.activeElement as HTMLInputElement;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(t.api.isDetailExpanded(0)).toBe(true);
  });

  it('the host gets the focus from outside: no master row is focused', async () => {
    const t = mount({ detailHeight: 80, detailRenderer: text });
    const outside = document.createElement('button');
    document.body.appendChild(outside);
    outside.focus();
    t.fm.setFocus(3, 1);
    t.host.focus();
    expect(t.fm.getFocus()).toEqual([3, 1]);
    expect(t.scope.masterDetailService!.getMasterRowIndexOf(null)).toBe(-1);
    expect(t.scope.masterDetailService!.getMasterRowIndexOf(outside)).toBe(-1);
    outside.remove();
  });
});

describe('master/detail – life cycle details', () => {

  it('maxRenderedDetails 0: every detail out of view is destroyed at once', async () => {
    const cleanup = vi.fn();
    const t = mount({ detailHeight: 100, maxRenderedDetails: 0, detailRenderer: () => cleanup }, { orders: createOrders(500) });
    t.api.setDetailExpanded(0, true);
    await nextFrame();
    expect(cleanup).not.toHaveBeenCalled();         // in view: stays
    t.scope.scrollToIndex(-1, 300);
    await nextFrame();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('a cleanup or nested destroy that throws does not break the table; destroy twice is harmless', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const t = mount({
      detailHeight: 100,
      detailRenderer: (_el, order, ctx) => {
        const api = ctx.createTable({ tableModel: TableFactory.createTableModel({ rows: order.items, properties: ['sku'] }) });
        vi.spyOn(api.getTableScope(), 'destroy').mockImplementation(() => { throw new Error('nested'); });
        return () => { throw new Error('cleanup'); };
      },
    });
    t.api.setDetailExpanded(0, true);
    await nextFrame();
    expect(t.api.setDetailExpanded(0, false)).toBe(true);
    expect(error).toHaveBeenCalledTimes(2);
    t.scope.masterDetailService!.destroy();
    t.scope.masterDetailService!.destroy();
    expect(t.scope.masterDetailService!.getLayer()).toBeUndefined();
  });

  it('collapseAllDetails / expandAllDetails without anything to do return 0; refresh by row object', async () => {
    const t = mount({ detailHeight: 50, isMaster: () => false, detailRenderer: text });
    expect(t.api.collapseAllDetails()).toBe(0);
    expect(t.api.expandAllDetails()).toBe(0);
    expect(t.api.refreshDetail(t.orders[0])).toBe(false);
    expect(t.api.getDetailElement(0)).toBeUndefined();
  });

  it('a master that is no master any more (data changed) keeps its state but gets no detail row', async () => {
    const t = mount({ detailHeight: 50, isMaster: order => order.city !== 'nowhere', detailRenderer: text });
    t.api.setDetailExpanded(0, true);
    t.orders[0].city = 'nowhere';
    t.api.repaint();
    await nextFrame();
    expect(t.api.getExpandedDetailRows()).toEqual([t.orders[0]]);
    expect(t.scope.getBodyRowLayout().getExtraCount()).toBe(0);
    expect(visibleDetails(t.host)).toHaveLength(0);
  });

  it('auto height: a resize while parked is ignored; the estimate is replaced once visible', async () => {
    let box: HTMLDivElement | undefined;
    const t = mount({ detailRenderer: el => { box = document.createElement('div'); box.style.height = '90px'; el.appendChild(box); } },
      { orders: createOrders(500) });
    t.api.setDetailExpanded(0, true);
    await nextFrame();
    await vi.waitFor(() => expect(t.scope.getBodyRowLayout().getExtraHeight(0)).toBeLessThan(150));
    const measured = t.scope.getBodyRowLayout().getExtraHeight(0);
    t.scope.scrollToIndex(-1, 300);
    await nextFrame();
    box!.style.height = '300px';
    await nextFrame();
    await nextFrame();
    expect(t.scope.getBodyRowLayout().getExtraHeight(0)).toBe(measured);
    t.scope.scrollToIndex(-1, 0);
    await vi.waitFor(() => expect(t.scope.getBodyRowLayout().getExtraHeight(0)).toBeGreaterThan(300));
    const row1 = Array.from(t.host.querySelectorAll<HTMLElement>('.ge-table-body-center .ge-table-row-div'))
      .find(div => div.querySelector('[data-row-index="1"]'))!;
    await vi.waitFor(() => expect(stylePx(row1, 'top')).toBe(t.scope.getBodyRowTop(1)));
  });

  it('isMaster false for a shown row: no aria-expanded on a reused row div', async () => {
    const t = mount({ detailHeight: 50, isMaster: order => order.id <= 3, detailRenderer: text }, { orders: createOrders(400) });
    await nextFrame();
    t.scope.scrollToIndex(-1, 200);
    await nextFrame();
    const rows = Array.from(t.host.querySelectorAll('.ge-table-body-center .ge-table-row-div[role="row"]'));
    expect(rows.some(r => r.hasAttribute('aria-expanded'))).toBe(false);
  });
});

describe('master/detail – inactive service and rare paths', () => {

  it('isInLayer without dispatch, isMasterAt out of range, a node in the layer outside of every detail', async () => {
    const rows = [{ id: 1, name: 'a' }];
    const { scope } = mountTable(TableFactory.createTableModel({ rows, properties: ['id'] }), { tableOptions: { masterDetail: { detailRenderer: text } } });
    const service = scope.masterDetailService!;
    expect(service.isInLayer(new Event('x'))).toBe(false);          // not dispatched: no composed path
    expect(service.isMasterAt(999)).toBe(false);
    expect(service.getMasterRowIndexOf(service.getLayer()!)).toBe(-1);
  });

  it('isMaster that throws for a row that is not shown', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const t = mount({ isMaster: (_o, i) => { if (i < 0) throw new Error('x'); return true; }, detailRenderer: text });
    expect(t.api.setDetailExpanded({ id: -5 }, true)).toBe(false);
    expect(error).toHaveBeenCalled();
    expect(t.scope.masterDetailService!.setExpandedRows([{ id: -6 }])).toBe(false);
  });

  it('a custom model without getAllRows: an expanded row beyond the rows stays expanded', async () => {
    class Shrinking extends PlainBody {
      shown = 500;
      override getRowCount() { return this.shown; }
    }
    const body = new Shrinking(500);
    const model = TableFactory.createTableModel({ bodyAreaModel: body, columnDefs: [ColumnDef.create({ property: 'a' })] });
    const { api, scope } = mountTable(model, { tableOptions: { masterDetail: { detailHeight: 40, detailRenderer: () => undefined } } });
    api.setDetailExpanded(400, true);
    body.shown = 100;
    api.repaintHard();
    expect(scope.getBodyRowLayout().getExtraCount()).toBe(0);
    expect(api.getExpandedDetailRows()).toHaveLength(1);
  });

  it('a custom model with row objects: the row layout scans getRowByIndex', async () => {
    const rows = Array.from({ length: 50 }, (_, i) => ({ n: i }));
    class ObjBody extends PlainBody {
      override getRowByIndex(r: number) { return rows[r]; }
    }
    const model = TableFactory.createTableModel({ bodyAreaModel: new ObjBody(50), columnDefs: [ColumnDef.create({ property: 'a' })] });
    const { api, scope } = mountTable(model, { tableOptions: { masterDetail: { detailHeight: 50, detailRenderer: () => undefined } } });
    api.setDetailExpanded(rows[7], true);
    api.repaint();
    expect(scope.getBodyRowTop(8)).toBe(8 * 30 + 50);
  });

  it('the horizontal wheel over a detail scrolls the master table horizontally', async () => {
    const orders = createOrders(50);
    const table = mountTable(createOrderModel(orders), { width: 350, tableOptions: { masterDetail: { detailHeight: 100, detailRenderer: text } } });
    table.api.setDetailExpanded(0, true);
    await nextFrame();
    const evt = new WheelEvent('wheel', { deltaX: 60, bubbles: true, cancelable: true });
    table.host.querySelector('.ge-table-detail-cell')!.dispatchEvent(evt);
    expect(table.scope.scrollViewport.scrollLeft).toBeGreaterThan(0);
    expect(evt.defaultPrevented).toBe(true);
  });
});
