// Row numbers demo (since 1.1.93): one flag puts a fixed "#" column in front. Switch the row count (the width
// follows the largest number), the numbering ("display" / "original"), separators, a checkbox column; sort and filter
// to see how the numbers behave. Selection type "range": a click on a number selects the whole row.
import '../../../../packages/table/css/main.css';
import {
  CheckboxColumnDef,
  ColumnDef,
  ColumnDefIf,
  EventAdapter,
  FocusModel,
  SelectionModel,
  SimpleDomService,
  TableApi,
  TableFactory,
  TableOptions,
  TableOptionsIf,
  TableScope,
  px100,
  px120,
  px200,
} from '@guiexpert/table';
import type { RowNumberMode } from '@guiexpert/table';

interface Order { id: number; customer: string; city: string; total: number }

const cities = ['Berlin', 'Hamburg', 'München', 'Köln', 'Leipzig', 'Bonn'];
function createOrders(count: number): Order[] {
  return Array.from({ length: count }, (_, i) => ({
    id: 1000 + i,
    customer: `Customer ${(i * 7919) % 997}`,
    city: cities[i % cities.length],
    total: Math.round(((i * 7919) % 100_000) / 10) / 10,
  }));
}

const host = document.querySelector<HTMLDivElement>('.table-div')!;
const rowsSelect = document.querySelector<HTMLSelectElement>('#rows')!;
const modeSelect = document.querySelector<HTMLSelectElement>('#mode')!;
const separatorsInput = document.querySelector<HTMLInputElement>('#separators')!;
const checkboxInput = document.querySelector<HTMLInputElement>('#checkbox')!;
const filterInput = document.querySelector<HTMLInputElement>('#filter')!;
const selectedLabel = document.querySelector<HTMLElement>('#selected')!;
let filterText = '';
let tableApi: TableApi | undefined;

const orderColumns = (): ColumnDefIf[] => [
  new ColumnDef('id', 'ID', px100),
  new ColumnDef('customer', 'Customer', px200),
  new ColumnDef('city', 'City', px120),
  ColumnDef.create({ property: 'total', headerLabel: 'Total', width: px120, bodyClasses: ['ge-table-text-align-right'] }),
];

function createTable() {
  tableApi?.destroy();
  const orders = createOrders(Number(rowsSelect.value));
  const columnDefs = checkboxInput.checked ? [new CheckboxColumnDef(), ...orderColumns()] : orderColumns();
  // #region table
  const tableModel = TableFactory.createTableModel({
    rows: orders,
    columnDefs,
    rowNumbersVisible: {                                   // or simply: rowNumbersVisible: true
      mode: modeSelect.value as RowNumberMode,
      format: separatorsInput.checked ? n => n.toLocaleString('en-US') : String,
    },
  });
  // #endregion table
  const selectionModel = new SelectionModel('range', 'multi');
  const tableOptions: TableOptionsIf = {
    ...new TableOptions(),
    getSelectionModel: () => selectionModel,
    getFocusModel: () => new FocusModel('cell'),
    externalFilterFunction: (row: Order) => !filterText || row.customer.includes(filterText),
  };
  const listener = new EventAdapter();
  listener.onSelectionChanged = () => {
    selectedLabel.textContent = String(selectionModel.getMergedRowIndices(tableModel.getBodyModel().getRowCount()).length);
  };
  const tableScope = new TableScope(host, tableModel, new SimpleDomService(), tableOptions, listener);
  tableScope.firstInit();
  tableApi = tableScope.getApi();
  selectedLabel.textContent = '0';
}

createTable();

rowsSelect.addEventListener('change', createTable);
modeSelect.addEventListener('change', createTable);
separatorsInput.addEventListener('change', createTable);
checkboxInput.addEventListener('change', createTable);
document.querySelector('#sort')!.addEventListener('click', () => {
  tableApi?.sort((a: Order, b: Order) => b.total - a.total);
});
filterInput.addEventListener('input', () => {
  filterText = filterInput.value.trim();
  tableApi?.externalFilterChanged();                       // the "#" column gets narrower with fewer rows
});
document.querySelector<HTMLInputElement>('#dark')!.addEventListener('change', e => {
  document.documentElement.setAttribute('data-theme', (e.target as HTMLInputElement).checked ? 'dark' : 'light');
});
