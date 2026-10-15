// Pivot demo (since 1.1.94): 50,000 orders – country › city × year › quarter, revenue and number of orders, year
// totals (years collapsible), total column and total row. The selects pivot again at runtime (tableApi.setPivotConfig –
// no new model), the filter works on the orders (before the aggregation), a click shows the orders behind a cell.
import '../../../../packages/table/css/main.css';
import {
  EventAdapter,
  GeMouseEvent,
  PivotFactory,
  SimpleDomService,
  TableApi,
  TableOptions,
  TableOptionsIf,
  TableScope,
  px120,
} from '@guiexpert/table';
import type { PivotValue, RowGroupField } from '@guiexpert/table';
import { generatePivotOrders, pivotQuarter, pivotYear } from '@guiexpert/demo-table-models';
import type { PivotOrderIf } from '@guiexpert/demo-table-models';

const host = document.querySelector<HTMLDivElement>('.table-div')!;
const rowSelect = document.querySelector<HTMLSelectElement>('#rows')!;
const columnSelect = document.querySelector<HTMLSelectElement>('#columns')!;
const valueSelect = document.querySelector<HTMLSelectElement>('#values')!;
const filterInput = document.querySelector<HTMLInputElement>('#filter')!;
const drill = document.querySelector<HTMLParagraphElement>('#drill')!;
let filterText = '';

const money = (v: unknown) => v === undefined ? '' : Math.round(v as number).toLocaleString('en-US');
const VALUES: Record<string, PivotValue<PivotOrderIf>[]> = {
  sum: [{ value: 'total', label: 'Revenue', format: money }, { value: 'id', aggregator: 'count', label: 'Orders' }],
  avg: [{ value: 'total', aggregator: 'avg', label: 'Ø Order', format: money }],
};

/** "year,quarter" → fields; year and quarter are functions of the order date. */
function fields(value: string): RowGroupField<PivotOrderIf>[] {
  return value ? value.split(',').map(f => f === 'year' ? pivotYear : f === 'quarter' ? pivotQuarter : f) : [];
}

// #region table
const orders = generatePivotOrders(50_000);
const tableModel = PivotFactory.createTableModel<PivotOrderIf>({
  rows: orders,
  rowFields: ['country', 'city'],
  columnFields: [
    { name: 'year', label: 'Year', value: o => Number(o.date.slice(0, 4)) },
    { name: 'quarter', label: 'Quarter', value: o => Math.ceil(Number(o.date.slice(5, 7)) / 3), format: q => `Q${q}` },
  ],
  values: VALUES.sum,
  expanded: 0,                                  // countries closed
  valueColumnWidth: px120,
});
// #endregion table

const listener = new EventAdapter();
listener.onMouseClicked = (evt: GeMouseEvent) => {
  if (evt.areaIdent !== 'body' || evt.rowIndex < 0) return;
  const body = tableModel.getPivotBody();
  const rows = body.getCellSourceRows(evt.rowIndex, evt.columnIndex);
  const label = body.getRowGroup(evt.rowIndex)?.label ?? 'Total';
  const column = body.getColumnInfo(evt.columnIndex)?.column?.label ?? 'all columns';
  drill.textContent = `${label}, ${column}: ${rows.length.toLocaleString('en-US')} orders`;
};

const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  hoverColumnVisible: false,
  externalFilterFunction: (o: PivotOrderIf) =>
    !filterText || `${o.country} ${o.city} ${o.product} ${o.category}`.toLowerCase().includes(filterText),
};
const tableScope = new TableScope(host, tableModel, new SimpleDomService(), tableOptions, listener);
tableScope.firstInit();
const tableApi: TableApi = tableScope.getApi();

// #region repivot
columnSelect.addEventListener('change', () => tableApi.setPivotConfig({ columnFields: fields(columnSelect.value) }));
rowSelect.addEventListener('change', () => tableApi.setPivotConfig({ rowFields: fields(rowSelect.value) }));
valueSelect.addEventListener('change', () => tableApi.setPivotConfig({ values: VALUES[valueSelect.value] }));
// #endregion repivot
document.querySelector('#expand')!.addEventListener('click', () => tableApi.expandAll());
document.querySelector('#collapse')!.addEventListener('click', () => tableApi.collapseAll());
filterInput.addEventListener('input', () => {
  filterText = filterInput.value.trim().toLowerCase();
  tableApi.externalFilterChanged();             // cells, subtotals and totals follow the filter
});
document.querySelector<HTMLInputElement>('#dark')!.addEventListener('change', e => {
  document.documentElement.setAttribute('data-theme', (e.target as HTMLInputElement).checked ? 'dark' : 'light');
});
