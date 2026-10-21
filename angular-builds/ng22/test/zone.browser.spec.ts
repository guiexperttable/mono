// Both components in an application WITH Zone.js (provideZoneChangeDetection) – prompt 015 S1/S7.
// Zone.js is loaded first (its own browser test file = its own iframe; the other specs run zoneless).
// The package is the devDependency `zone.js-for-tests` = zone.js 0.14.10 (alias in vitest.config.ts): the version that
// is already in the lockfile, so the peer resolution of the other Angular majors stays unchanged (CLAUDE.md §2).
import 'zone.js';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Component, computed, NgZone, provideZoneChangeDetection, signal } from '@angular/core';
import { TableComponent, TableSignalComponent } from '@guiexpert/angular-table';
import { TableApi, TableScope } from '@guiexpert/table';
import type { GeMouseEvent } from '@guiexpert/table';
import { bodyCell, createModel, rowTexts, tableCount } from '../../../packages/table/test-utils/wrapper-test-utils';
import { destroyApps, mount } from './angular-test-utils';

const ZONE = [provideZoneChangeDetection()];

@Component({
  selector: 'test-zone-host',
  imports: [TableSignalComponent, TableComponent],
  template: `
    <guiexpert-table-signal style="display:block; height:140px" [tableModel]="model" [debounceMouseClickDelay]="0"
      [(tableApi)]="api" (mouseClicked)="onClick($event)" />
    <guiexpert-table style="display:block; height:140px" [tableModel]="model2" (tableReady)="classic = $event" />
    <span class="ready">{{ ready() }}</span>
    <span class="clicks">{{ clicks() }}</span>`,
})
class ZoneHost {
  readonly model = createModel(4);
  readonly model2 = createModel(4, 'Classic');
  readonly api = signal<TableApi | undefined>(undefined);
  readonly ready = computed(() => !!this.api());
  readonly clicks = signal(0);
  readonly clicksInZone: boolean[] = [];
  classic?: TableApi;
  onClick(_evt: GeMouseEvent) {
    this.clicksInZone.push(NgZone.isInAngularZone());
    this.clicks.update(n => n + 1);
  }
}

afterEach(() => {
  destroyApps();
  vi.restoreAllMocks();
});

describe('with Zone.js', () => {
  it('S1: both tables render once (host sized), tableApi is set, the template follows', async () => {
    expect((globalThis as { Zone?: unknown }).Zone).toBeDefined();
    const heights: number[] = [];
    const firstInit = TableScope.prototype.firstInit;
    vi.spyOn(TableScope.prototype, 'firstInit').mockImplementation(function (this: TableScope) {
      heights.push(this.hostElement.getBoundingClientRect().height);
      return firstInit.call(this);
    });
    const { host, cmp } = await mount(ZoneHost, ZONE);
    expect(heights).toEqual([140, 140]);            // one build per table, both hosts in the DOM and sized
    expect(tableCount(host)).toBe(2);
    expect(cmp.api()).toBeInstanceOf(TableApi);
    expect(cmp.classic).toBeInstanceOf(TableApi);
    expect(rowTexts(host).join()).toContain('Classic 0');
    expect(host.querySelector('.ready')!.textContent).toBe('true');
  });

  it('S7: mouse events reach the handler outside the Angular zone; a signal written there updates the view', async () => {
    const { host, cmp } = await mount(ZoneHost, ZONE);
    const signalTable = host.querySelector('guiexpert-table-signal')!;
    bodyCell(signalTable, 1, 1).click();
    await vi.waitFor(() => expect(host.querySelector('.clicks')!.textContent).toBe('1'));
    expect(cmp.clicksInZone).toEqual([false]);
  });
});
