// Shared helpers for the smoke tests of the framework wrappers (packages/<framework>-table/src/**/*.browser.spec.*).
//
// Every wrapper package has its own vitest.config.ts (browser mode + the framework's Vite plugin) with the alias
// `@guiexpert/table` → packages/table/src/index.ts. Wrapper code, specs and these helpers therefore share ONE
// instance of the core – `vi.spyOn(TableScope.prototype, 'destroy')` in a spec sees the wrapper's calls.
//
// Imports only `@guiexpert/table` (alias) and relative files – no `vitest` here: the wrapper's own Vitest must be
// used (CI installs only the wrapper packages, packages/table/node_modules is missing there).
// Lives outside src/ on purpose: it must not end up in any npm package.
import { TableFactory } from '@guiexpert/table';
import type { GeMouseEvent, TableApi, TableModelIf } from '@guiexpert/table';
import { nextFrame, renderedRows } from './mount-table'; // also loads css/main.css

export { nextFrame, renderedRows };

/** A small table model: `rowCount` rows `{ id, name: "<label> <i>" }`, columns `id` and `name`. */
export function createModel(rowCount: number, label = 'Row'): TableModelIf {
  return TableFactory.createTableModel({
    rows: Array.from({ length: rowCount }, (_, i) => ({ id: i, name: `${label} ${i}` })),
    properties: ['id', 'name'],
  });
}

const hosts: HTMLElement[] = [];

/** A container with a fixed size (the table needs a height), appended to the body. Removed by {@link removeHosts}. */
export function createHost(height = 300, width = 600): HTMLDivElement {
  const host = document.createElement('div');
  host.style.cssText = `position:relative; width:${width}px; height:${height}px;`;
  document.body.appendChild(host);
  hosts.push(host);
  return host;
}

/** Use as `afterEach(removeHosts)` – after the framework has unmounted its component. */
export function removeHosts(): void {
  while (hosts.length) hosts.pop()!.remove();
}

/** The rendered body cell (scrollable center part) at row/column (model indices). */
export function bodyCell(container: Element, rowIndex: number, columnIndex: number): HTMLElement {
  const cell = container.querySelector<HTMLElement>(
    `.ge-table-body-center [data-area="body"][data-row-index="${rowIndex}"][data-col-index="${columnIndex}"]`
  );
  if (!cell) {
    throw new Error(`body cell ${rowIndex}/${columnIndex} is not rendered`);
  }
  return cell;
}

/** Text content of the rendered body rows (center part). */
export function rowTexts(container: HTMLElement): string[] {
  return renderedRows(container).map(row => row.textContent ?? '');
}

/** Number of table skeletons inside the container – exactly 1 while a table is shown, 0 after destroy. */
export function tableCount(container: Element): number {
  return container.querySelectorAll('.ge-table-scroll-viewport').length;
}

/** `true` once the table behind this API has been destroyed. */
export function isDestroyed(api: TableApi): boolean {
  return api.tableScope.isDestroyed();
}

/** Row/column/area of a mouse event – for `toEqual` checks. */
export function cellOf(evt: GeMouseEvent): { areaIdent: string | undefined; rowIndex: number; columnIndex: number } {
  return { areaIdent: evt.areaIdent, rowIndex: evt.rowIndex, columnIndex: evt.columnIndex };
}

/**
 * The overlay a table in `container` shows: "none", "loading", "noRows" or "noMatches" (since 1.1.91).
 * Reads the DOM (works without a TableApi, e.g. for the `loading` prop of the wrappers).
 */
export function overlayKind(container: Element): string {
  const overlay = container.querySelector<HTMLElement>('.ge-table-overlay');
  if (!overlay || overlay.style.display === 'none') return 'none';
  if (overlay.classList.contains('ge-table-overlay-loading')) return 'loading';
  if (overlay.classList.contains('ge-table-overlay-no-matches')) return 'noMatches';
  if (overlay.classList.contains('ge-table-overlay-no-rows')) return 'noRows';
  return 'none';
}
