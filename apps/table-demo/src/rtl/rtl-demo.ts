// Right-to-left demo (since 1.1.98): Arabic data, the city fixed at the start (right), the total at the end (left),
// a total row. Switch the direction: the wrappers would rebuild the table for a new options object – here we do it.
import '../../../../packages/table/css/main.css';
import { EventAdapter, SimpleDomService, TableApi, TableScope } from '@guiexpert/table';
import type { TableDirection } from '@guiexpert/table';
import { createRtlCitiesModelAndOptions, generateRtlCitySales } from '@guiexpert/demo-table-models';

const host = document.querySelector<HTMLDivElement>('.table-div')!;
const log = document.querySelector<HTMLPreElement>('#log')!;
const directionSelect = document.querySelector<HTMLSelectElement>('#direction')!;
const rows = generateRtlCitySales(2_000);
let tableApi: TableApi | undefined;

function createTable() {
  tableApi?.destroy();
  // #region table
  const { tableModel, tableOptions } = createRtlCitiesModelAndOptions(directionSelect.value as TableDirection, rows);
  const listener = new EventAdapter();
  listener.onScroll = evt => { log.textContent = `scrollLeft from the start: ${Math.round(evt.scrollLeft)} px`; };
  tableApi = new TableScope(host, tableModel, new SimpleDomService(), tableOptions, listener).firstInit().getApi();
  // #endregion table
  log.textContent = `getDirection(): ${tableApi.getDirection()}`;
}

directionSelect.addEventListener('change', createTable);
document.querySelector('#excel')!.addEventListener('click', () => void tableApi?.downloadExcel('sales.xlsx'));
document.querySelector<HTMLInputElement>('#dark')!.addEventListener('change', e => {
  document.documentElement.setAttribute('data-theme', (e.target as HTMLInputElement).checked ? 'dark' : 'light');
});
createTable();
