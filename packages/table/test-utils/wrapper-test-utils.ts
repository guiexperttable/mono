// Shared helpers for the smoke tests of the framework wrappers (packages/<framework>-table/src/**/*.browser.spec.*).
//
// Every wrapper package has its own vitest.config.ts (browser mode + the framework's Vite plugin) with the alias
// `@guiexpert/table` → packages/table/src/index.ts. Wrapper code, specs and these helpers therefore share ONE
// instance of the core – `vi.spyOn(TableScope.prototype, 'destroy')` in a spec sees the wrapper's calls.
//
// Imports only `@guiexpert/table` (alias) and relative files – no `vitest` here: the wrapper's own Vitest must be
// used (CI installs only the wrapper packages, packages/table/node_modules is missing there).
// Lives outside src/ on purpose: it must not end up in any npm package.
import { PivotFactory, RowGroupFactory, TableFactory } from '@guiexpert/table';
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

/**
 * A row grouping (since 1.1.94): 6 sales grouped by `region` (Nord, Süd), sum of `umsatz`, total row in the footer.
 * Group column first: the first row reads "Nord (3)".
 */
export function createGroupedModel(): TableModelIf {
  return RowGroupFactory.createTableModel({
    rows: [
      { region: 'Nord', produkt: 'A', umsatz: 100 }, { region: 'Nord', produkt: 'B', umsatz: 50 },
      { region: 'Süd', produkt: 'A', umsatz: 80 }, { region: 'Nord', produkt: 'A', umsatz: 120 },
      { region: 'Süd', produkt: 'B', umsatz: 70 }, { region: 'Süd', produkt: 'A', umsatz: 30 },
    ],
    groupBy: ['region'],
    aggregations: { umsatz: 'sum' },
  });
}

/**
 * A pivot table (since 1.1.94): the 6 sales, rows `region`, columns `monat` (Jan, Feb), sum of `umsatz`, total column
 * fixed on the right, total row. Group column first: the rows read "Nord", "Süd".
 */
export function createPivotModel(): TableModelIf {
  return PivotFactory.createTableModel({
    rows: [
      { region: 'Nord', produkt: 'A', monat: 'Jan', umsatz: 100 }, { region: 'Nord', produkt: 'B', monat: 'Jan', umsatz: 50 },
      { region: 'Süd', produkt: 'A', monat: 'Jan', umsatz: 80 }, { region: 'Nord', produkt: 'A', monat: 'Feb', umsatz: 120 },
      { region: 'Süd', produkt: 'B', monat: 'Feb', umsatz: 70 }, { region: 'Süd', produkt: 'A', monat: 'Feb', umsatz: 30 },
    ],
    rowFields: ['region'],
    columnFields: [{ value: 'monat', order: 'insertion' }],
    values: ['umsatz'],
  });
}

/** The texts of the rendered total column (fixed on the right) of a pivot table. */
export function pivotTotals(container: Element): string[] {
  return Array.from(container.querySelectorAll<HTMLElement>('.ge-table-body-east .ge-table-label'), e => e.textContent ?? '');
}

/** The label texts of the rendered group column (fixed on the left, column 0). */
export function groupLabels(container: Element): string[] {
  return Array.from(container.querySelectorAll<HTMLElement>('.ge-table-body-west [data-col-index="0"] .ge-table-label-div'),
    e => e.textContent ?? '');
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
 * The overlay a table in `container` shows: "none", "loading", "noRows" or "noMatches" (since 1.1.92).
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

/**
 * Row drag (since 1.1.95): 5 rows `{ id, name: "Row <i>" }`, drag handle in the `name` column (index 0).
 */
export function createRowDragModel(rows = Array.from({ length: 5 }, (_, i) => ({ id: i, name: `Row ${i}` }))): TableModelIf {
  return TableFactory.createTableModel({ rows, properties: ['name', 'id'], rowDrag: true });
}

/**
 * Drags the row `fromRow` by its drag handle and drops it on the lower half of `toRow` (pointer events, like a mouse).
 * Managed tables move the row: `fromRow` lands behind `toRow`.
 */
export function dragRow(container: Element, fromRow: number, toRow: number): void {
  const handle = bodyCell(container, fromRow, 0).querySelector<HTMLElement>('.ge-table-row-drag-handle');
  if (!handle) {
    throw new Error(`row ${fromRow} has no drag handle`);
  }
  const start = handle.getBoundingClientRect();
  const target = bodyCell(container, toRow, 1).getBoundingClientRect();
  const fire = (el: EventTarget, type: string, x: number, y: number) => el.dispatchEvent(new PointerEvent(type, {
    bubbles: true, cancelable: true, composed: true, clientX: x, clientY: y, pointerId: 1, pointerType: 'mouse',
    button: 0, buttons: type === 'pointerup' ? 0 : 1, isPrimary: true,
  }));
  fire(handle, 'pointerdown', start.left + 4, start.top + 4);
  fire(document, 'pointermove', start.left + 4, start.top + 20);
  fire(document, 'pointermove', target.left + 10, target.top + target.height * 0.8);
  fire(document, 'pointerup', target.left + 10, target.top + target.height * 0.8);
}
