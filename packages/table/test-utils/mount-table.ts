// Helpers for browser tests (*.browser.spec.ts): mount a real table into the document of the test browser.
//
//   afterEach(destroyAllTables);
//
//   it('…', async () => {
//     const { api, host } = mountTable(TableFactory.createTableModel({ rows, properties: ['id', 'name'] }));
//     await nextFrame();
//     expect(renderedRows(host).length).toBeLessThan(40);
//   });
//
// Lives outside src/ on purpose: it must not end up in the npm package.
import '../css/main.css';
import { EventAdapter, SimpleDomService, TableOptions, TableScope } from '@guiexpert/table';
import type { EventListenerIf, SideIdent, TableApi, TableModelIf, TableOptionsIf } from '@guiexpert/table';

export interface MountedTable {
  host: HTMLDivElement;
  scope: TableScope;
  api: TableApi;
  /** Calls `api.destroy()` and removes the host div. Safe to call twice. */
  destroy(): void;
}

export interface MountOptions {
  /** Merged into `new TableOptions()`. */
  tableOptions?: Partial<TableOptionsIf>;
  eventListener?: EventListenerIf;
  /** Size of the host div in px (default 800 × 500). */
  width?: number;
  height?: number;
}

const mounted: MountedTable[] = [];

export function mountTable(tableModel: TableModelIf, opts: MountOptions = {}): MountedTable {
  const host = document.createElement('div');
  host.style.cssText = `position:relative; width:${opts.width ?? 800}px; height:${opts.height ?? 500}px;`;
  document.body.appendChild(host);

  const tableOptions: TableOptionsIf = { ...new TableOptions(), ...(opts.tableOptions ?? {}) };
  const scope = new TableScope(host, tableModel, new SimpleDomService(), tableOptions, opts.eventListener ?? new EventAdapter());
  scope.firstInit();
  const api = scope.getApi();

  let destroyed = false;
  const table: MountedTable = {
    host, scope, api,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      api.destroy();
      host.remove();
    },
  };
  mounted.push(table);
  return table;
}

/** Use as `afterEach(destroyAllTables)`. */
export function destroyAllTables(): void {
  while (mounted.length) mounted.pop()!.destroy();
}

/** Waits two animation frames (the table renders asynchronously after scroll/resize). */
export function nextFrame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

/** Row divs currently in the DOM of a body area (default: the scrollable center part). */
export function renderedRows(host: HTMLElement, side: SideIdent = 'center'): HTMLElement[] {
  return Array.from(host.querySelectorAll<HTMLElement>(`.ge-table-body-${side} .ge-table-row-div`));
}

/** Creates `count` simple row objects `{ id, name, value }`. */
export function createRows(count: number): { id: number; name: string; value: number }[] {
  return Array.from({ length: count }, (_, i) => ({ id: i, name: 'Name ' + i, value: i * 3 }));
}
