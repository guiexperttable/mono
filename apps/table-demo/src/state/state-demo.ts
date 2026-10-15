// Remember the state (since 1.1.92): widths, column order (drag the header), hidden columns, sorting, scroll
// position and selected rows survive a reload – one localStorage key, by property and row id, never by index.
// The panel on the right shows the state that onStateChanged reports (what you would send to your server).
import '../../../../packages/table/css/main.css';
import {
  AutoRestoreOptions,
  ColumnDef,
  EventAdapter,
  GeStateChangeEvent,
  SelectionModel,
  SimpleDomService,
  TableApi,
  TableFactory,
  TableOptions,
  TableOptionsIf,
  TableScope,
  TrueFn,
  px100,
  px120,
  px80,
} from '@guiexpert/table';

interface Order { id: number; customer: string; city: string; total: number }

const cities = ['Berlin', 'Hamburg', 'München', 'Köln', 'Leipzig', 'Bonn'];
const orders: Order[] = Array.from({ length: 10_000 }, (_, i) => ({
  id: 1000 + i,
  customer: `Customer ${(i * 7919) % 997}`,
  city: cities[i % cities.length],
  total: Math.round(((i * 7919) % 100_000) / 10) / 10,
}));

const host = document.querySelector<HTMLDivElement>('.table-div')!;
const statePanel = document.querySelector<HTMLElement>('#state')!;
const cityInput = document.querySelector<HTMLInputElement>('#city')!;
let tableApi: TableApi;

const showState = () => statePanel.textContent = JSON.stringify(tableApi.getState(), null, 2);

function createTable() {
  tableApi?.destroy();
  const columnDefs = [
    ColumnDef.create({ property: 'id', headerLabel: 'ID', width: px80, sortable: TrueFn }),
    ColumnDef.create({ property: 'customer', headerLabel: 'Customer', width: px120, sortable: TrueFn }),
    ColumnDef.create({ property: 'city', headerLabel: 'City', width: px120, sortable: TrueFn }),
    ColumnDef.create({ property: 'total', headerLabel: 'Total', width: px100, sortable: TrueFn }),
  ];
  const selectionModel = new SelectionModel('row', 'multi');
  // #region options
  const tableOptions: TableOptionsIf = {
    ...new TableOptions(),
    getSelectionModel: () => selectionModel,
    autoRestoreOptions: {
      ...new AutoRestoreOptions<Order>(),
      getStorageKeyFn: () => 'orders',            // localStorage["orderstableState"]
      getRowId: (order: Order) => order.id,
      autoRestoreColumnLayout: true,              // widths, order, visibility
      autoRestoreSortingState: true,
      autoRestoreScrollPosition: true,
      autoRestoreSelectedState: true,
    },
  };
  // #endregion options
  const listener = new EventAdapter();
  // #region event
  listener.onStateChanged = (evt: GeStateChangeEvent) => {
    statePanel.textContent = JSON.stringify(evt.state, null, 2);   // or: fetch("/api/prefs", { method: "PUT", … })
  };
  // #endregion event
  const tableModel = TableFactory.createTableModel({ rows: orders, columnDefs });
  tableApi = new TableScope(host, tableModel, new SimpleDomService(), tableOptions, listener).firstInit().getApi();
  cityInput.checked = tableApi.isColumnVisible('city');
  showState();
}

createTable();

cityInput.addEventListener('change', () => tableApi.setColumnVisible('city', cityInput.checked));
document.querySelector('#reload')!.addEventListener('click', createTable);
document.querySelector('#reset')!.addEventListener('click', () => {
  tableApi.resetState();                         // the layout of the code, localStorage entry removed
  cityInput.checked = true;
  showState();
});
document.querySelector<HTMLInputElement>('#dark')!.addEventListener('change', e => {
  document.documentElement.setAttribute('data-theme', (e.target as HTMLInputElement).checked ? 'dark' : 'light');
});
