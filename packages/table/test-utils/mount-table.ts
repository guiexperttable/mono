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
import type { AreaIdent, EventListenerIf, SideIdent, TableApi, TableModelIf, TableOptionsIf } from '@guiexpert/table';

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
  // registered before the first render: if a renderer throws in firstInit(), destroyAllTables() still cleans up
  mounted.push(table);
  scope.firstInit();
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

/** Row divs currently in the DOM of any area/side, e.g. `areaRows(host, 'header', 'west')`. */
export function areaRows(host: HTMLElement, area: AreaIdent, side: SideIdent = 'center'): HTMLElement[] {
  return Array.from(host.querySelectorAll<HTMLElement>(`.ge-table-${area}-${side} .ge-table-row-div`));
}

/**
 * The rendered cell div (`.ge-table-col-div`) of a cell, or `null` if it is not in the DOM (virtual scrolling).
 * Also finds col-/rowspan cells, which are drawn directly into the area (not into a row div).
 */
export function cellDiv(host: HTMLElement, area: AreaIdent, side: SideIdent, rowIndex: number, columnIndex: number): HTMLElement | null {
  return host.querySelector<HTMLElement>(
    `.ge-table-${area}-${side} .ge-table-col-div[data-row-index="${rowIndex}"][data-col-index="${columnIndex}"]`);
}

/** Like {@link cellDiv}, but fails if the cell is not rendered. */
export function getCellDiv(host: HTMLElement, area: AreaIdent, side: SideIdent, rowIndex: number, columnIndex: number): HTMLElement {
  const cell = cellDiv(host, area, side, rowIndex, columnIndex);
  if (!cell) throw new Error(`cell ${area}/${side} ${rowIndex}/${columnIndex} is not rendered`);
  return cell;
}

/** Column indices of the cell divs that are direct children of a row div (DOM order). */
export function columnIndices(rowDiv: HTMLElement): number[] {
  return Array.from(rowDiv.querySelectorAll<HTMLElement>(':scope > .ge-table-col-div'),
    e => Number(e.getAttribute('data-col-index')));
}

/** A pixel value of an inline style as number, e.g. `stylePx(cell, 'left')` → 100. */
export function stylePx(element: HTMLElement, property: 'left' | 'right' | 'top' | 'width' | 'height'): number {
  return parseFloat(element.style[property]);
}

/**
 * The position of an element from the **start** of its parent row/area – `style.left`, in a right-to-left table
 * (`dir="rtl"` on the host, since 1.1.98) `style.right`. Lets one expectation cover both directions.
 */
export function startPx(element: HTMLElement): number {
  const rtl = element.closest('.ge-table')?.getAttribute('dir') === 'rtl';
  return parseFloat(rtl ? element.style.right : element.style.left);
}

/** Both writing directions, for `describe.each(DIRECTIONS)`. */
export const DIRECTIONS = ['ltr', 'rtl'] as const;

/** Creates `count` simple row objects `{ id, name, value }`. */
export function createRows(count: number): { id: number; name: string; value: number }[] {
  return Array.from({ length: count }, (_, i) => ({ id: i, name: 'Name ' + i, value: i * 3 }));
}
