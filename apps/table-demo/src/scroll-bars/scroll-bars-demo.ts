// Scroll bars that take space (since 1.1.104) – the manual counterpart of
// packages/table/src/lib/table/scroll-bars.scrollbars.browser.spec.ts.
import '../../../../packages/table/css/main.css';
import { ColumnDef, EventAdapter, SimpleDomService, Size, TableApi, TableFactory, TableOptions, TableScope } from '@guiexpert/table';
import type { TableDirection } from '@guiexpert/table';

type Row = Record<string, string>;

const host = document.querySelector<HTMLDivElement>('.table-div')!;
const log = document.querySelector<HTMLPreElement>('#log')!;
const $ = <T extends HTMLElement>(sel: string) => document.querySelector<T>(sel)!;
const classic = $<HTMLInputElement>('#classic');
const columnsSelect = $<HTMLSelectElement>('#columns');
const rowsSelect = $<HTMLSelectElement>('#rows');
const footer = $<HTMLInputElement>('#footer');
const fixed = $<HTMLInputElement>('#fixed');
const directionSelect = $<HTMLSelectElement>('#direction');

let tableApi: TableApi | undefined;
let rowCount = 0;
let rows: Row[] = [];

function columnCount(): number {
  return columnsSelect.value === 'px' ? 30 : 5;
}

function columnWidth(): Size {
  if (columnsSelect.value === 'percent') return new Size(20, '%');
  if (columnsSelect.value === 'weight') return new Size(1, 'weight');
  return new Size(120, 'px');
}

function createRows(from: number, count: number, total: number): Row[] {
  return Array.from({ length: count }, (_, i) => {
    const r = from + i;
    const row: Row = {};
    for (let c = 0; c < columnCount(); c++) {
      row['c' + c] = c === 0 ? `row ${r + 1}${r + 1 === total ? ' – last' : ''}` : `${r + 1}/${c + 1}`;
    }
    return row;
  });
}

function createTable() {
  tableApi?.destroy();
  rowCount = Number(rowsSelect.value);
  rows = createRows(0, rowCount, rowCount);
  const count = columnCount();
  const columnDefs = Array.from({ length: count }, (_, c) =>
    ColumnDef.create({ property: 'c' + c, headerLabel: c === count - 1 ? `col ${c + 1} – last` : `col ${c + 1}`,
      width: c === 0 && columnsSelect.value === 'px' ? new Size(160, 'px') : columnWidth() }));
  const tableModel = TableFactory.createTableModel({
    rows,
    columnDefs,
    fixedLeftColumnCount: fixed.checked ? 1 : 0,
    fixedRightColumnCount: fixed.checked ? 1 : 0,
    footerData: footer.checked ? [columnDefs.map((_, c) => c === 0 ? 'footer' : `Σ ${c + 1}`)] : undefined,
  });
  const tableOptions = {
    ...new TableOptions(),
    direction: directionSelect.value as TableDirection,
    fixedWestSeparatorBorderVisible: true,
    fixedEastSeparatorBorderVisible: true,
    footerSeparatorBorderVisible: true,
  };
  const listener = new EventAdapter();
  listener.onScroll = () => report();
  tableApi = new TableScope(host, tableModel, new SimpleDomService(), tableOptions, listener).firstInit().getApi();
  requestAnimationFrame(report);
}

function report() {
  const viewport = host.querySelector<HTMLElement>('.ge-table-scroll-viewport');
  if (!viewport || !tableApi) return;
  const barH = viewport.offsetHeight - viewport.clientHeight;
  const barV = viewport.offsetWidth - viewport.clientWidth;
  const widths = Array.from({ length: columnCount() }, (_, c) => tableApi!.getTableModel().getColumnWidth(c));
  log.textContent =
    `horizontal scroll bar: ${barH} px   vertical scroll bar: ${barV} px   (0 = none or overlay scroll bars)\n` +
    `rows: ${rowCount}\n` +
    `column widths: ${widths.slice(0, 6).join(', ')}${widths.length > 6 ? ', …' : ''}   sum ${widths.reduce((a, b) => a + b, 0)} px`;
}

function applyClassic() {
  document.documentElement.classList.toggle('classic-scrollbars', classic.checked);
}

classic.addEventListener('change', () => { applyClassic(); createTable(); });
[columnsSelect, rowsSelect, footer, fixed, directionSelect].forEach(el => el.addEventListener('change', createTable));
$('#add').addEventListener('click', () => {
  if (!tableApi) return;
  const total = rowCount + 500;
  rows.forEach(row => { row['c0'] = row['c0'].replace(' – last', ''); });
  rows = [...rows, ...createRows(rowCount, 500, total)];
  tableApi.setRows(rows);
  rowCount = total;
  tableApi.repaintHard();
  requestAnimationFrame(report);
});
$('#end').addEventListener('click', () => {
  const viewport = host.querySelector<HTMLElement>('.ge-table-scroll-viewport')!;
  viewport.scrollTo({ top: viewport.scrollHeight, left: directionSelect.value === 'rtl' ? -viewport.scrollWidth : viewport.scrollWidth });
});
window.addEventListener('resize', () => requestAnimationFrame(report));

applyClassic();
createTable();
