// Spreadsheet mode (since 1.1.99): SpreadsheetFactory, FormulaBar, structure API and a context menu example (plain HTML).
import '../../../../packages/table/css/main.css';
import { CellRange, EventAdapter, FormulaBar, SimpleDomService, SpreadsheetFactory, TableScope } from '@guiexpert/table';
import type { GeMouseEvent, TableApi } from '@guiexpert/table';

const host = document.querySelector<HTMLDivElement>('.table-div')!;
const barHost = document.querySelector<HTMLDivElement>('.formula-bar')!;
const menu = document.querySelector<HTMLDivElement>('.menu')!;

// #region data
const budget: unknown[][] = [
  ['Item', 'Jan', 'Feb', 'Mar', 'Total'],
  ['Rent', 950, 950, 950, '=SUM(B2:D2)'],
  ['Food', 410, 385, 432, '=SUM(B3:D3)'],
  ['Transport', 89, 89, 120, '=SUM(B4:D4)'],
  ['Fun', 120, 60, 210, '=SUM(B5:D5)'],
  ['Sum', '=SUM(B2:B5)', '=SUM(C2:C5)', '=SUM(D2:D5)', '=SUM(E2:E5)'],
  ['Average', '=AVERAGE(B2:B5)', '=AVERAGE(C2:C5)', '=AVERAGE(D2:D5)', '=ROUND(AVERAGE(E2:E5),2)'],
];
// #endregion data

let scope: TableScope | undefined;
let api: TableApi | undefined;
let bar: FormulaBar | undefined;
let menuCell: [number, number] | undefined;

function create(data: unknown[][]) {
  bar?.destroy();
  scope?.destroy();
  // #region sheet
  const { tableModel, tableOptions } = SpreadsheetFactory.create({ data, rowCount: 200 });
  tableOptions.direction = (document.querySelector<HTMLInputElement>('#rtl')!.checked) ? 'rtl' : 'ltr';
  const listener = new EventAdapter();
  listener.onContextmenu = (evt: GeMouseEvent) => openMenu(evt);
  scope = new TableScope(host, tableModel, new SimpleDomService(), tableOptions, listener);
  scope.firstInit();
  api = scope.getApi();
  bar = new FormulaBar(barHost, api);
  // #endregion sheet
}

// #region menu
function openMenu(evt: GeMouseEvent) {
  if (evt.areaIdent !== 'body' || evt.rowIndex < 0 || evt.columnIndex < 1 || !evt.originalEvent) return;
  evt.originalEvent.preventDefault();
  menuCell = [evt.rowIndex, evt.columnIndex];
  api?.getTableScope().selectBodyRange(CellRange.singleCell(evt.rowIndex, evt.columnIndex));
  menu.style.left = `${evt.originalEvent.clientX}px`;
  menu.style.top = `${evt.originalEvent.clientY}px`;
  menu.style.display = 'flex';
  menu.querySelector<HTMLButtonElement>('button')!.focus();
}

function closeMenu() {
  menu.style.display = 'none';
  host.querySelector<HTMLElement>('[role="grid"]')?.focus();
  host.focus();
}

menu.addEventListener('click', async e => {
  const action = (e.target as HTMLElement).dataset['action'];
  const cell = menuCell;
  closeMenu();
  if (!api || !cell || !action) return;
  const address = api.getCellAddress(cell[0], cell[1])!;            // e.g. "C5"
  const row = Number(address.replace(/^[A-Z]+/, '')) - 1;           // the physical row
  const col = cell[1] - 1;                                            // the letter index (behind the row numbers)
  switch (action) {
    case 'cut': await api.cutSelection(); break;
    case 'copy': await api.copySelection(); break;
    case 'paste': api.pasteText(await navigator.clipboard.readText()); break;
    case 'insertRow': api.insertRows(row, 1); break;
    case 'deleteRow': api.deleteRows(row, 1); break;
    case 'insertColumn': api.insertColumns(col, 1); break;
    case 'deleteColumn': api.deleteColumns(col, 1); break;
  }
});
menu.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
document.addEventListener('pointerdown', e => { if (!menu.contains(e.target as Node)) menu.style.display = 'none'; });
// #endregion menu

create(budget);
document.querySelector('#rows')!.addEventListener('click', () => {
  const rows = api!.getTableScope().tableModel.getBodyModel().getRowCount();
  api!.insertRows(rows, 100);
});
document.querySelector('#save')!.addEventListener('click', () => {
  localStorage.setItem('ge-sheet-demo', JSON.stringify(api!.getSheetData()));
});
document.querySelector('#load')!.addEventListener('click', () => {
  const saved = localStorage.getItem('ge-sheet-demo');
  if (saved) create(JSON.parse(saved) as unknown[][]);
});
document.querySelector('#excel')!.addEventListener('click', () => api!.downloadExcel('budget.xlsx', '', { cellFormulas: true }));
document.querySelector('#undo')!.addEventListener('click', () => api!.undo());
document.querySelector<HTMLInputElement>('#dark')!.addEventListener('change', e => {
  document.documentElement.setAttribute('data-theme', (e.target as HTMLInputElement).checked ? 'dark' : 'light');
});
document.querySelector<HTMLInputElement>('#rtl')!.addEventListener('change', () => create(api!.getSheetData() ?? budget));
