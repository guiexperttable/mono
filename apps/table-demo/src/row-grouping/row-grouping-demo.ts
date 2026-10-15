// Row grouping demo (since 1.1.94): 50,000 orders grouped by country › city with sums, an average and a total row.
// The select regroups at runtime (tableApi.setRowGroupBy – no new model), the filter works on the orders.
import '../../../../packages/table/css/main.css';
import {
  EventAdapter,
  RowGroupFactory,
  SimpleDomService,
  TableApi,
  TableOptions,
  TableOptionsIf,
  TableScope,
} from '@guiexpert/table';
import type { RowGroupField } from '@guiexpert/table';
import { createSalesOrderColumnDefs, generateSalesOrders } from '@guiexpert/demo-table-models';
import type { SalesOrderIf } from '@guiexpert/demo-table-models';

const host = document.querySelector<HTMLDivElement>('.table-div')!;
const groupSelect = document.querySelector<HTMLSelectElement>('#groupBy')!;
const filterInput = document.querySelector<HTMLInputElement>('#filter')!;
let filterText = '';

/** "country,city" → levels; "year" shows a function as level (a computed key). */
function levels(value: string): RowGroupField<SalesOrderIf>[] {
  if (value === 'year') {
    return [{ name: 'year', label: 'Year', value: o => 2024 + (o.id % 3), order: 'desc' }];
  }
  return value ? value.split(',') : [];
}

// #region table
const orders = generateSalesOrders(50_000);
const tableModel = RowGroupFactory.createTableModel<SalesOrderIf>({
  rows: orders,
  columnDefs: createSalesOrderColumnDefs(),
  groupBy: ['country', 'city'],
  aggregations: { quantity: 'sum', price: 'avg', total: 'sum' },
  expanded: 1,                                  // countries open, cities closed
});
// #endregion table

const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  externalFilterFunction: (o: SalesOrderIf) =>
    !filterText || `${o.country} ${o.city} ${o.product} ${o.category}`.toLowerCase().includes(filterText),
};
const tableScope = new TableScope(host, tableModel, new SimpleDomService(), tableOptions, new EventAdapter());
tableScope.firstInit();
const tableApi: TableApi = tableScope.getApi();

// #region regroup
groupSelect.addEventListener('change', () => tableApi.setRowGroupBy(levels(groupSelect.value)));
// #endregion regroup
document.querySelector('#expand')!.addEventListener('click', () => tableApi.expandAll());
document.querySelector('#collapse')!.addEventListener('click', () => tableApi.collapseAll());
filterInput.addEventListener('input', () => {
  filterText = filterInput.value.trim().toLowerCase();
  tableApi.externalFilterChanged();             // groups, sums and the total row follow the filter
});
document.querySelector<HTMLInputElement>('#dark')!.addEventListener('change', e => {
  document.documentElement.setAttribute('data-theme', (e.target as HTMLInputElement).checked ? 'dark' : 'light');
});
