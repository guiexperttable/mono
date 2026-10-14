// Overlays demo: an empty table → "No rows to show", loading with a CSS spinner, a refresh over existing rows and
// "No matching rows" for a filter without hits. No library, no image – the spinner is CSS.
import '../../../../packages/table/css/main.css';
import {
  EventAdapter,
  SimpleDomService,
  TableApi,
  TableFactory,
  TableOptions,
  TableOptionsIf,
  TableScope,
} from '@guiexpert/table';

interface Order { id: number; customer: string; city: string; total: number }

const cities = ['Berlin', 'Hamburg', 'München', 'Köln', 'Leipzig', 'Bonn'];
const allOrders: Order[] = Array.from({ length: 5_000 }, (_, i) => ({
  id: 1000 + i,
  customer: `Customer ${(i * 7919) % 997}`,
  city: cities[i % cities.length],
  total: Math.round(((i * 7919) % 100_000) / 10) / 10,
}));

/** Stands in for `fetch("/api/orders")`: answers after `ms`. */
const fakeFetch = (rows: Order[], ms = 1000) => new Promise<Order[]>(resolve => setTimeout(() => resolve(rows), ms));

const host = document.querySelector<HTMLDivElement>('.table-div')!;
const filterInput = document.querySelector<HTMLInputElement>('#filter')!;
const blockInput = document.querySelector<HTMLInputElement>('#block')!;
const stateLabel = document.querySelector<HTMLElement>('#state')!;
let filterText = '';
let tableApi: TableApi;

function createTable() {
  tableApi?.destroy();
  // #region table
  const tableModel = TableFactory.createTableModel({ rows: [] as Order[], properties: ['id', 'customer', 'city', 'total'] });
  const tableOptions: TableOptionsIf = {
    ...new TableOptions(),
    externalFilterFunction: (row: Order) => !filterText || row.customer.includes(filterText),
    overlayOptions: { noRowsText: 'No orders yet', blockInteractionWhileLoading: blockInput.checked },
  };
  const tableScope = new TableScope(host, tableModel, new SimpleDomService(), tableOptions, new EventAdapter());
  tableScope.firstInit();
  tableApi = tableScope.getApi();
  // #endregion table
  showState();
}

// #region load
async function load(answer: Order[]) {
  tableApi.showLoadingOverlay();            // spinner + "Loading…"
  try {
    const orders = await fakeFetch(answer); // fetch("/api/orders")
    tableApi.setRows(orders);
    tableApi.repaintHard();
  } finally {
    tableApi.hideOverlay();                 // 0 rows → "No orders yet" by itself
  }
}
// #endregion load

function showState() {
  stateLabel.textContent = tableApi.getOverlayState();
}

createTable();
setInterval(showState, 100);

document.querySelector('#load')!.addEventListener('click', () => load(allOrders));
document.querySelector('#load-empty')!.addEventListener('click', () => load([]));
document.querySelector('#refresh')!.addEventListener('click', () => load(allOrders.slice().reverse()));
filterInput.addEventListener('input', () => {
  filterText = filterInput.value.trim();
  tableApi.externalFilterChanged();        // nothing found → "No matching rows"
});
blockInput.addEventListener('change', createTable);
document.querySelector<HTMLInputElement>('#dark')!.addEventListener('change', e => {
  document.documentElement.setAttribute('data-theme', (e.target as HTMLInputElement).checked ? 'dark' : 'light');
});
