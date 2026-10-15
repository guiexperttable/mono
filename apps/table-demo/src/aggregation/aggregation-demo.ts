// Totals demo (since 1.1.94): footerAggregates puts total rows under the table that follow the filter, the sorting
// and live updates; tableApi.getSelectionAggregates() feeds a status bar for the selected cells – both plain HTML.
import '../../../../packages/table/css/main.css';
import {
  ColumnDef,
  ColumnDefIf,
  EventAdapter,
  SelectionModel,
  SimpleDomService,
  TableApi,
  TableCellUpdateEvent,
  TableFactory,
  TableOptions,
  TableOptionsIf,
  TableScope,
  TrueFn,
  formatAggregateValue,
  px100,
  px120,
  px200,
} from '@guiexpert/table';
import type { AggregateFooterConfig } from '@guiexpert/table';

interface Order { id: number; customer: string; city: string; quantity: number; price: number; total: number }

const cities = ['Berlin', 'Hamburg', 'München', 'Köln', 'Leipzig', 'Bonn'];
function createOrders(count: number): Order[] {
  return Array.from({ length: count }, (_, i) => {
    const quantity = 1 + (i * 31) % 20;
    const price = Math.round(((i * 7919) % 10_000) / 10) / 10 + 1;
    return {
      id: 1000 + i,
      customer: `Customer ${(i * 7919) % 997}`,
      city: cities[i % cities.length],
      quantity,
      price,
      total: Math.round(quantity * price * 100) / 100,
    };
  });
}

const right = { headerClasses: ['ge-table-text-align-right'], bodyClasses: ['ge-table-text-align-right'], sortable: TrueFn };
const orderColumns = (): ColumnDefIf[] => [
  new ColumnDef('id', 'ID', px100),
  ColumnDef.create({ property: 'customer', headerLabel: 'Customer', width: px200, sortable: TrueFn }),
  ColumnDef.create({ property: 'city', headerLabel: 'City', width: px120, sortable: TrueFn }),
  ColumnDef.create({ property: 'quantity', headerLabel: 'Qty', width: px100, ...right }),
  ColumnDef.create({ property: 'price', headerLabel: 'Price', width: px100, ...right }),
  ColumnDef.create({ property: 'total', headerLabel: 'Total', width: px120, ...right }),
];

const FOOTERS: Record<string, AggregateFooterConfig<Order> | undefined> = {
  // #region footer
  sum: { quantity: 'sum', total: 'sum' },
  // #endregion footer
  two: [
    { label: 'Sum', aggregates: { quantity: 'sum', total: 'sum' } },
    { label: 'Average', aggregates: { quantity: 'avg', price: 'avg', total: 'avg' } },
  ],
  none: undefined,
};

const host = document.querySelector<HTMLDivElement>('.table-div')!;
const rowsSelect = document.querySelector<HTMLSelectElement>('#rows')!;
const footerSelect = document.querySelector<HTMLSelectElement>('#footer')!;
const filterInput = document.querySelector<HTMLInputElement>('#filter')!;
const liveInput = document.querySelector<HTMLInputElement>('#live')!;
const status = document.querySelector<HTMLElement>('#status')!;
let filterText = '';
let tableApi: TableApi | undefined;
let orders: Order[] = [];
let liveTimer: ReturnType<typeof setInterval> | undefined;

function showSelection(api: TableApi) {
  // #region status
  const a = api.getSelectionAggregates();
  status.textContent = a.capped ? 'Selection too large'
    : a.numericCount ? `Count ${a.count} · Sum ${formatAggregateValue(a.sum)} · Average ${formatAggregateValue(a.avg)}`
      + ` · Min ${formatAggregateValue(a.min)} · Max ${formatAggregateValue(a.max)}`
      : a.count ? `Count ${a.count}` : '';
  // #endregion status
  status.textContent ||= 'Select cells (drag, Shift/Ctrl-click, Ctrl+A) – count, sum and average appear here.';
}

function createTable() {
  tableApi?.destroy();
  orders = createOrders(Number(rowsSelect.value));
  // #region table
  const tableModel = TableFactory.createTableModel({
    rows: orders,
    columnDefs: orderColumns(),
    footerAggregates: FOOTERS[footerSelect.value],          // e.g. { quantity: "sum", total: "sum" }
  });
  // #endregion table
  const selectionModel = new SelectionModel('range', 'multi');
  const tableOptions: TableOptionsIf = {
    ...new TableOptions(),
    getSelectionModel: () => selectionModel,
    externalFilterFunction: (o: Order) => !filterText || `${o.customer} ${o.city}`.toLowerCase().includes(filterText),
  };
  const listener = new EventAdapter();
  listener.onSelectionChanged = () => tableApi && showSelection(tableApi);
  const tableScope = new TableScope(host, tableModel, new SimpleDomService(), tableOptions, listener);
  tableScope.firstInit();
  tableApi = tableScope.getApi();
  showSelection(tableApi);
}

/** Live prices: a few visible rows get a new price – updateCells() also recomputes the footer. */
function tick() {
  const api = tableApi;
  if (!api) return;
  const first = api.getFirstVisibleRowIndex();
  const last = api.getLastVisibleRowIndex();
  const body = api.getBodyModel();
  const priceColumn = 4, totalColumn = 5;
  const events: TableCellUpdateEvent[] = [];
  for (let i = 0; i < 4 && last >= first; i++) {
    const row = first + Math.floor(Math.random() * (last - first + 1));
    const order = body.getRowByIndex(row) as Order | undefined;
    if (!order) continue;
    order.price = Math.max(1, Math.round((order.price + (Math.random() - 0.5) * 10) * 10) / 10);
    order.total = Math.round(order.quantity * order.price * 100) / 100;
    events.push(new TableCellUpdateEvent('body', row, priceColumn, order.price, {}));
    events.push(new TableCellUpdateEvent('body', row, totalColumn, order.total, {}));
  }
  api.updateCells(events);
}

createTable();

rowsSelect.addEventListener('change', createTable);
footerSelect.addEventListener('change', createTable);
filterInput.addEventListener('input', () => {
  filterText = filterInput.value.trim().toLowerCase();
  tableApi?.externalFilterChanged();                         // the footer sums only the rows you see
});
liveInput.addEventListener('change', () => {
  clearInterval(liveTimer);
  liveTimer = liveInput.checked ? setInterval(tick, 400) : undefined;
});
document.querySelector<HTMLInputElement>('#dark')!.addEventListener('change', e => {
  document.documentElement.setAttribute('data-theme', (e.target as HTMLInputElement).checked ? 'dark' : 'light');
});
