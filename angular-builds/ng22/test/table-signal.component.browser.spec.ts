// TableSignalComponent (<guiexpert-table-signal>, Angular 22+, since 1.1.100) – zoneless.
// Reference cases S1–S12 of prompts/015-angular-signal-table.design.md (Zone.js: zone.browser.spec.ts).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Component, computed, effect, inject, PLATFORM_ID, provideZonelessChangeDetection, signal } from '@angular/core';
import { DetailRenderWrapperFactory, TableSignalComponent } from '@guiexpert/angular-table';
import type { DetailComponentRendererIf } from '@guiexpert/angular-table';
import { TableApi, TableOptions, TableScope } from '@guiexpert/table';
import type { DetailRenderContextIf, GeMouseEvent, GeScrollEvent, GeStateChangeEvent, SelectionModelIf, TableModelIf, TableOptionsIf } from '@guiexpert/table';
import { bodyCell, cellOf, clickDetailToggle, createModel, createRowDragModel, detailRowsOf, dragRow, isDestroyed, nextFrame, overlayKind, rowTexts, tableCount } from '../../../packages/table/test-utils/wrapper-test-utils';
import { destroyApps, mount } from './angular-test-utils';

const ZONELESS = [provideZonelessChangeDetection()];

@Component({
  selector: 'test-host',
  imports: [TableSignalComponent],
  template: `
    @if (show()) {
      <guiexpert-table-signal style="display:block; height:280px"
        [tableModel]="model()" [tableOptions]="options()" [loading]="loading()" [debounceMouseClickDelay]="delay()"
        [(tableApi)]="api"
        (tableApiChange)="apiChanges.push($event)"
        (mouseClicked)="onClick($event)"
        (contextMenu)="contextMenus.push($event)"
        (scroll)="scrolls.push($event)"
        (selectionChanged)="selections.push($event)"
        (stateChanged)="states.push($event)" />
    }
    <span class="ready">{{ isReady() }}</span>
    <span class="clicks">{{ clickCount() }}</span>`,
})
class SignalHost {
  readonly show = signal(true);
  readonly model = signal<TableModelIf | undefined>(createModel(5));
  readonly options = signal<TableOptionsIf>(new TableOptions());
  readonly loading = signal(false);
  readonly delay = signal(150);
  readonly api = signal<TableApi | undefined>(undefined);
  readonly isReady = computed(() => !!this.api());
  readonly clickCount = signal(0);

  readonly apiLog: (TableApi | undefined)[] = [];
  readonly apiChanges: (TableApi | undefined)[] = [];
  readonly clicks: GeMouseEvent[] = [];
  readonly contextMenus: unknown[] = [];
  readonly scrolls: GeScrollEvent[] = [];
  readonly selections: SelectionModelIf[] = [];
  readonly states: GeStateChangeEvent[] = [];

  constructor() {
    effect(() => this.apiLog.push(this.api()));
  }

  onClick(evt: GeMouseEvent) {
    this.clicks.push(evt);
    this.clickCount.update(n => n + 1);   // a signal write – schedules change detection (zoneless)
  }
}

afterEach(() => {
  destroyApps();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('TableSignalComponent (Angular 22, zoneless)', () => {

  it('S1: renders the table, sets tableApi once, a computed in the template follows, (tableApiChange) once', async () => {
    const heights: number[] = [];
    const firstInit = TableScope.prototype.firstInit;
    vi.spyOn(TableScope.prototype, 'firstInit').mockImplementation(function (this: TableScope) {
      heights.push(this.hostElement.getBoundingClientRect().height);
      return firstInit.call(this);
    });
    const { host, cmp } = await mount(SignalHost, ZONELESS);

    expect(tableCount(host)).toBe(1);
    expect(rowTexts(host)).toHaveLength(5);
    expect(cmp.api()).toBeInstanceOf(TableApi);
    expect(cmp.apiChanges).toEqual([cmp.api()]);
    expect(heights).toEqual([280]);                       // built once, host already in the DOM and sized
    expect(cmp.apiLog.filter(a => a !== undefined)).toHaveLength(1);
    expect(host.querySelector('.ready')!.textContent).toBe('true');
  });

  it('S2: a new model re-creates the table; tableApi switches directly to the new API (no undefined in between)', async () => {
    const destroy = vi.spyOn(TableScope.prototype, 'destroy');
    const { host, cmp, stable } = await mount(SignalHost, ZONELESS);
    const first = cmp.api()!;
    const logBefore = cmp.apiLog.length;

    cmp.model.set(createModel(3, 'New'));
    await stable();

    expect(destroy).toHaveBeenCalledTimes(1);
    expect(isDestroyed(first)).toBe(true);
    expect(cmp.api()).toBeInstanceOf(TableApi);
    expect(cmp.api()).not.toBe(first);
    expect(rowTexts(host)[0]).toContain('New 0');
    expect(tableCount(host)).toBe(1);
    expect(cmp.apiLog.slice(logBefore)).toEqual([cmp.api()]);   // one effect run with the new API
    expect(cmp.apiChanges).toEqual([first, cmp.api()]);
  });

  it('S3: new options re-create the table', async () => {
    const { host, cmp, stable } = await mount(SignalHost, ZONELESS);
    const first = cmp.api()!;
    cmp.options.set({ ...new TableOptions(), ariaLabel: 'Orders' });
    await stable();
    expect(cmp.api()).not.toBe(first);
    expect(host.querySelector('[role="grid"]')!.getAttribute('aria-label')).toBe('Orders');
  });

  it('a model of undefined: no table, tableApi undefined; the model arrives later → table', async () => {
    const { host, cmp, stable } = await mount(SignalHost, ZONELESS);
    cmp.model.set(undefined);
    await stable();
    expect(tableCount(host)).toBe(0);
    expect(cmp.api()).toBeUndefined();
    cmp.model.set(createModel(2));
    await stable();
    expect(tableCount(host)).toBe(1);
    expect(cmp.api()).toBeInstanceOf(TableApi);
  });

  it('S4: loading shows / hides the overlay without re-creating the table; an own overlay of the app stays', async () => {
    const { host, cmp, stable } = await mount(SignalHost, ZONELESS);
    const api = cmp.api()!;
    cmp.loading.set(true);
    await stable();
    await nextFrame();
    expect(overlayKind(host)).toBe('loading');
    cmp.loading.set(false);
    await stable();
    await nextFrame();
    expect(overlayKind(host)).toBe('none');
    expect(cmp.api()).toBe(api);

    api.showNoRowsOverlay('mine');           // shown by the app, not by the input
    cmp.delay.set(10);                       // another input changes – loading stays false
    await stable();
    await nextFrame();
    expect(overlayKind(host)).toBe('noRows');
  });

  it('S5: a new model while loading keeps showing the overlay', async () => {
    const { host, cmp, stable } = await mount(SignalHost, ZONELESS);
    cmp.loading.set(true);
    await stable();
    cmp.model.set(createModel(4));
    await stable();
    await nextFrame();
    expect(overlayKind(host)).toBe('loading');
  });

  it('S6: removing the component destroys the table once, tableApi → undefined, a pending stateChanged arrives, no NG0953', async () => {
    const warn = vi.spyOn(console, 'warn');
    const destroy = vi.spyOn(TableScope.prototype, 'destroy');
    const { host, cmp, stable } = await mount(SignalHost, ZONELESS);
    const api = cmp.api()!;
    api.setCustomState({ filter: 'x' });     // pending state change (debounced 300 ms) – reported by destroy()

    cmp.show.set(false);
    await stable();

    expect(destroy).toHaveBeenCalledTimes(1);
    expect(isDestroyed(api)).toBe(true);
    expect(cmp.api()).toBeUndefined();
    expect(cmp.apiChanges[cmp.apiChanges.length - 1]).toBeUndefined();
    expect(tableCount(host)).toBe(0);
    expect(cmp.states).toHaveLength(1);
    expect(cmp.states[0].state.custom).toEqual({ filter: 'x' });
    expect(warn.mock.calls.flat().join(' ')).not.toContain('NG0953');
  });

  it('S6: a click pending in the debounce timer is dropped when the component is removed', async () => {
    const { host, cmp, stable } = await mount(SignalHost, ZONELESS);
    vi.useFakeTimers();
    bodyCell(host, 1, 1).click();
    cmp.show.set(false);
    await stable();
    vi.advanceTimersByTime(500);
    expect(cmp.clicks).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('S7: mouseClicked is debounced (150 ms); a signal written in the handler updates the view (zoneless)', async () => {
    const { host, cmp } = await mount(SignalHost, ZONELESS);
    vi.useFakeTimers();
    bodyCell(host, 2, 1).click();
    expect(cmp.clicks).toHaveLength(0);
    vi.advanceTimersByTime(150);
    expect(cmp.clicks).toHaveLength(1);
    expect(cellOf(cmp.clicks[0])).toEqual({ areaIdent: 'body', rowIndex: 2, columnIndex: 1 });
    vi.useRealTimers();
    await vi.waitFor(() => expect(host.querySelector('.clicks')!.textContent).toBe('1'));
  });

  it('S7: debounceMouseClickDelay 0 emits synchronously', async () => {
    const { host, cmp, stable } = await mount(SignalHost, ZONELESS);
    cmp.delay.set(0);
    await stable();
    bodyCell(host, 0, 0).click();
    expect(cmp.clicks).toHaveLength(1);
  });

  it('S8: selectionChanged comes with the selection model of the table', async () => {
    const { host, cmp } = await mount(SignalHost, ZONELESS);
    bodyCell(host, 1, 0).dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 }));
    bodyCell(host, 1, 0).dispatchEvent(new MouseEvent('mouseup', { bubbles: true, button: 0 }));
    bodyCell(host, 1, 0).click();
    await vi.waitFor(() => expect(cmp.selections.length).toBeGreaterThan(0));
    expect(cmp.selections[0]).toBe(cmp.api()!.tableScope.selectionModel());
  });

  it('S9: a right click reaches (contextMenu) exactly once, as GeMouseEvent', async () => {
    const { host, cmp } = await mount(SignalHost, ZONELESS);
    // the core swallows a context menu within 50 ms after creating the table (see mouse-handler.browser.spec.ts)
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 1_000);
    bodyCell(host, 3, 1).dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 }));
    expect(cmp.contextMenus).toHaveLength(1);
    expect(cmp.contextMenus[0]).not.toBeInstanceOf(MouseEvent);
    expect(cellOf(cmp.contextMenus[0] as GeMouseEvent)).toEqual({ areaIdent: 'body', rowIndex: 3, columnIndex: 1 });
  });

  it('S9: (scroll) comes exactly once per scroll event of the table – as GeScrollEvent, no native event of the host', async () => {
    const { cmp, stable } = await mount(SignalHost, ZONELESS);
    cmp.model.set(createModel(200));
    await stable();
    const listener = (cmp.api()!.tableScope as unknown as { eventListener: { onScroll(e: GeScrollEvent): void } }).eventListener;
    let fromCore = 0;
    const onScroll = listener.onScroll.bind(listener);
    listener.onScroll = (e: GeScrollEvent) => { fromCore++; onScroll(e); };
    cmp.scrolls.length = 0;
    cmp.api()!.scrollToIndex(0, 100);
    await vi.waitFor(() => expect(cmp.scrolls.length).toBeGreaterThan(0));
    await nextFrame();
    expect(cmp.scrolls).toHaveLength(fromCore);
    expect(cmp.scrolls.every(e => !(e instanceof Event))).toBe(true);
  });

  it('S10: on the server (PLATFORM_ID "server") no table is created and nothing fails', async () => {
    const createSpy = vi.spyOn(TableScope.prototype, 'firstInit');
    const { host, cmp } = await mount(SignalHost, [...ZONELESS, { provide: PLATFORM_ID, useValue: 'server' }]);
    expect(createSpy).not.toHaveBeenCalled();
    expect(tableCount(host)).toBe(0);
    expect(cmp.api()).toBeUndefined();
  });

  it('S11: a tableApi written from outside is replaced by the real API (one warning)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { cmp, stable } = await mount(SignalHost, ZONELESS);
    const real = cmp.api()!;
    cmp.api.set({} as TableApi);
    await stable();
    expect(cmp.api()).toBe(real);
    cmp.api.set(undefined);
    await stable();
    expect(cmp.api()).toBe(real);
    expect(warn.mock.calls.filter(c => String(c[0]).includes('tableApi is set by the table'))).toHaveLength(1);
  });
});

@Component({
  selector: 'test-two-tables',
  imports: [TableSignalComponent],
  template: `
    <guiexpert-table-signal style="display:block; height:140px" [tableModel]="m1" [(tableApi)]="a1" />
    <guiexpert-table-signal style="display:block; height:140px" [tableModel]="m2" [(tableApi)]="a2" />`,
})
class TwoTablesHost {
  readonly m1 = createModel(3, 'One');
  readonly m2 = createModel(3, 'Two');
  readonly a1 = signal<TableApi | undefined>(undefined);
  readonly a2 = signal<TableApi | undefined>(undefined);
}

describe('TableSignalComponent: several tables', () => {
  it('S12: two tables on one page are independent; the stylesheet is added once', async () => {
    const tableStyles = () => Array.from(document.head.querySelectorAll('style')).filter(s => s.textContent?.includes('.ge-table-overlay'));
    const before = tableStyles().length;     // an earlier test application may have left its style element
    const { host, cmp } = await mount(TwoTablesHost, ZONELESS);
    expect(tableCount(host)).toBe(2);
    expect(cmp.a1()).not.toBe(cmp.a2());
    expect(rowTexts(host).join()).toContain('One 0');
    expect(rowTexts(host).join()).toContain('Two 0');
    expect(tableStyles().length - before).toBe(1);
  });
});

/** listener method of the core → output of TableSignalComponent */
const FORWARDED: [string, string][] = [
  ['onMouseClicked', 'mouseClicked'], ['onMouseMoved', 'mouseMoved'], ['onMouseDragging', 'mouseDragging'],
  ['onMouseDraggingEnd', 'mouseDraggingEnded'], ['onContextmenu', 'contextMenu'], ['onScroll', 'scroll'],
  ['onModelChanged', 'modelChanged'], ['onSelectionChanged', 'selectionChanged'], ['onFocusChanged', 'focusChanged'],
  ['onCheckboxChanged', 'checkboxChanged'], ['onStateChanged', 'stateChanged'], ['onRowDragStart', 'rowDragStart'],
  ['onRowDragMove', 'rowDragMove'], ['onRowDragEnd', 'rowDragEnd'], ['onBatchEditChanged', 'batchEditChanged'],
  ['onDetailExpandedChanged', 'detailExpandedChanged'], ['onEditingChanged', 'editingChanged'],
  ['onUndoStackChanged', 'undoStackChanged'],
];

@Component({
  selector: 'test-all-outputs',
  imports: [TableSignalComponent],
  template: `
    <guiexpert-table-signal style="display:block; height:280px" [tableModel]="model" [debounceMouseClickDelay]="0"
      [(tableApi)]="api"
      (mouseClicked)="got('mouseClicked', $event)" (mouseMoved)="got('mouseMoved', $event)"
      (mouseDragging)="got('mouseDragging', $event)" (mouseDraggingEnded)="got('mouseDraggingEnded', $event)"
      (contextMenu)="got('contextMenu', $event)" (scroll)="got('scroll', $event)"
      (modelChanged)="got('modelChanged', $event)" (selectionChanged)="got('selectionChanged', $event)"
      (focusChanged)="got('focusChanged', $event)" (checkboxChanged)="got('checkboxChanged', $event)"
      (stateChanged)="got('stateChanged', $event)" (rowDragStart)="got('rowDragStart', $event)"
      (rowDragMove)="got('rowDragMove', $event)" (rowDragEnd)="got('rowDragEnd', $event)"
      (batchEditChanged)="got('batchEditChanged', $event)" (detailExpandedChanged)="got('detailExpandedChanged', $event)"
      (editingChanged)="got('editingChanged', $event)" (undoStackChanged)="got('undoStackChanged', $event)" />`,
})
class AllOutputsHost {
  readonly model = createRowDragModel();
  readonly api = signal<TableApi | undefined>(undefined);
  readonly received: [string, unknown][] = [];
  got(name: string, evt: unknown) {
    this.received.push([name, evt]);
  }
}

describe('TableSignalComponent: outputs', () => {

  it('has no tableReady output – the API comes as the signal tableApi', () => {
    const outputs = (TableSignalComponent as unknown as { ɵcmp: { outputs: Record<string, string> } }).ɵcmp.outputs;
    expect(Object.keys(outputs)).not.toContain('tableReady');
    expect(Object.keys(outputs)).toContain('tableApiChange');
  });

  it('S8: every event of the core reaches its output with the same event object', async () => {
    const { cmp } = await mount(AllOutputsHost, ZONELESS);
    // the listener the table calls (behind the subscribe() hub of the core)
    const listener = (cmp.api()!.tableScope as unknown as { eventListener: Record<string, (e: unknown) => void> }).eventListener;
    for (const [method, outputName] of FORWARDED) {
      cmp.received.length = 0;
      const evt = { probe: method };
      listener[method](evt);
      expect(cmp.received, method).toEqual([[outputName, evt]]);
    }
  });

  it('S8: a real row drag reports rowDragStart, rowDragMove and rowDragEnd', async () => {
    const { host, cmp } = await mount(AllOutputsHost, ZONELESS);
    dragRow(host, 1, 3);
    const names = cmp.received.map(r => r[0]).filter(n => n.startsWith('rowDrag'));
    expect(names[0]).toBe('rowDragStart');
    expect(names).toContain('rowDragMove');
    expect(names[names.length - 1]).toBe('rowDragEnd');
    expect(cmp.received.find(r => r[0] === 'rowDragEnd')![1]).toMatchObject({ type: 'end', moved: true, toIndex: 3 });
  });
});

@Component({
  selector: 'test-detail',
  template: `<span class="ng-detail">detail of {{ id() }}</span>`,
})
class OrderDetail implements DetailComponentRendererIf<{ id: number }> {
  static destroyed = 0;
  readonly id = signal(-1);
  setDetail(row: { id: number }, _ctx: DetailRenderContextIf<{ id: number }>) {
    this.id.set(row.id);
  }
  ngOnDestroy() {
    OrderDetail.destroyed++;
  }
}

@Component({
  selector: 'test-detail-host',
  imports: [TableSignalComponent],
  template: `
    <guiexpert-table-signal style="display:block; height:280px" [tableModel]="model" [tableOptions]="options"
      [(tableApi)]="api" />`,
})
class DetailHost {
  readonly model = createModel(20);
  readonly options: TableOptionsIf = {
    ...new TableOptions(),
    masterDetail: { detailHeight: 40, detailRenderer: inject(DetailRenderWrapperFactory).create(OrderDetail) },
  };
  readonly api = signal<TableApi | undefined>(undefined);
}

describe('TableSignalComponent: master/detail with an Angular component', () => {
  it('S12: DetailRenderWrapperFactory works – the detail component is created and destroyed with the row', async () => {
    OrderDetail.destroyed = 0;
    const { host, cmp } = await mount(DetailHost, ZONELESS);
    clickDetailToggle(host, 1);
    await vi.waitFor(() => expect(host.querySelector('.ng-detail')?.textContent).toBe('detail of 1'));
    expect(detailRowsOf(host)).toHaveLength(1);
    cmp.api()!.setDetailExpanded(1, false);
    await vi.waitFor(() => expect(OrderDetail.destroyed).toBe(1));
    expect(detailRowsOf(host)).toHaveLength(0);
  });
});
