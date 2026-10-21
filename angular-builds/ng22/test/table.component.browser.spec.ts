// TableComponent (<guiexpert-table>, Angular 14 – 22+): smoke test in Angular 22 (zoneless and with Zone.js see
// zone.browser.spec.ts) – the first Angular test of the mono repo (TODO.md "Angular-Wrapper-Smoke-Test", prompt 015 S15).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TableComponent } from '@guiexpert/angular-table';
import { TableApi, TableOptions, TableScope } from '@guiexpert/table';
import type { GeMouseEvent, TableModelIf, TableOptionsIf } from '@guiexpert/table';
import { bodyCell, cellOf, createModel, isDestroyed, nextFrame, overlayKind, rowTexts, tableCount } from '../../../packages/table/test-utils/wrapper-test-utils';
import { destroyApps, mount } from './angular-test-utils';

const ZONELESS = [provideZonelessChangeDetection()];

@Component({
  selector: 'test-classic-host',
  imports: [TableComponent],
  template: `
    @if (show()) {
      <guiexpert-table style="display:block; height:280px"
        [tableModel]="model()" [tableOptions]="options()" [loading]="loading()" [debounceMouseClickDelay]="0"
        (tableReady)="ready.push($event)"
        (mouseClicked)="clicks.push($event)"
        (contextmenu)="contextmenus.push($event)" />
    }`,
})
class ClassicHost {
  readonly show = signal(true);
  readonly model = signal<TableModelIf>(createModel(5));
  readonly options = signal<TableOptionsIf>(new TableOptions());
  readonly loading = signal(false);
  readonly ready: TableApi[] = [];
  readonly clicks: GeMouseEvent[] = [];
  readonly contextmenus: unknown[] = [];
}

afterEach(() => {
  destroyApps();
  vi.restoreAllMocks();
});

describe('TableComponent (Angular 22, zoneless)', () => {

  it('S15: tableReady once, rows rendered', async () => {
    const { host, cmp } = await mount(ClassicHost, ZONELESS);
    expect(cmp.ready).toHaveLength(1);
    expect(cmp.ready[0]).toBeInstanceOf(TableApi);
    expect(tableCount(host)).toBe(1);
    expect(rowTexts(host)[0]).toContain('Row 0');
  });

  it('S15: a click reaches mouseClicked (debounce 0 = next macrotask)', async () => {
    const { host, cmp } = await mount(ClassicHost, ZONELESS);
    bodyCell(host, 2, 1).click();
    await vi.waitFor(() => expect(cmp.clicks).toHaveLength(1));
    expect(cellOf(cmp.clicks[0])).toEqual({ areaIdent: 'body', rowIndex: 2, columnIndex: 1 });
  });

  it('S15: a new model re-creates the table (destroy + tableReady again); removing it destroys it', async () => {
    const destroy = vi.spyOn(TableScope.prototype, 'destroy');
    const { host, cmp, stable } = await mount(ClassicHost, ZONELESS);
    const first = cmp.ready[0];
    cmp.model.set(createModel(3, 'New'));
    await stable();
    expect(isDestroyed(first)).toBe(true);
    expect(cmp.ready).toHaveLength(2);
    expect(rowTexts(host)[0]).toContain('New 0');
    cmp.show.set(false);
    await stable();
    expect(destroy).toHaveBeenCalledTimes(2);
    expect(tableCount(host)).toBe(0);
  });

  it('S15: loading shows the overlay without re-creating the table', async () => {
    const { host, cmp, stable } = await mount(ClassicHost, ZONELESS);
    cmp.loading.set(true);
    await stable();
    await nextFrame();
    expect(overlayKind(host)).toBe('loading');
    expect(cmp.ready).toHaveLength(1);
  });

  // BUG: Angular binds `(contextmenu)` on a component element to the output AND to the native DOM event; the core
  // listens on the same host element without stopping it – the handler runs twice, first with the native MouseEvent.
  // Kept for compatibility (renaming the output would be a breaking change); TableSignalComponent uses `contextMenu`.
  // Workaround: `if (evt instanceof MouseEvent) return;` (TODO.md, instructions Angular section 2).
  it.fails('S9: a right click reaches (contextmenu) once, as GeMouseEvent', async () => {
    const { host, cmp } = await mount(ClassicHost, ZONELESS);
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 1_000);  // past the 50 ms throttle after creating the table
    bodyCell(host, 3, 1).dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 }));
    expect(cmp.contextmenus).toHaveLength(1);
  });

  it('S9 (characterization): the handler gets the native MouseEvent first, then the GeMouseEvent', async () => {
    const { host, cmp } = await mount(ClassicHost, ZONELESS);
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 1_000);
    bodyCell(host, 3, 1).dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 }));
    expect(cmp.contextmenus).toHaveLength(2);
    expect(cmp.contextmenus[0]).toBeInstanceOf(MouseEvent);
    expect(cellOf(cmp.contextmenus[1] as GeMouseEvent)).toEqual({ areaIdent: 'body', rowIndex: 3, columnIndex: 1 });
  });
});
