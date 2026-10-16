// Excel-style editing (since 1.1.99): type into a cell, Enter/Tab commit and move on, Shift+arrows, Delete.
import '../../../../packages/table/css/main.css';
import {
  ColumnDef,
  EventAdapter,
  SelectCellEditor,
  SelectionModel,
  SimpleDomService,
  TableFactory,
  TableOptions,
  TableScope,
  TrueFn,
  editInputPipeForNumber,
  px100,
  px120,
  px200,
} from '@guiexpert/table';
import type { GeEditEvent, GeModelChangeEvent, TableApi, TableOptionsIf } from '@guiexpert/table';

interface Order { id: number; customer: string; product: string; qty: number; price: number; status: string; paid: boolean }

const host = document.querySelector<HTMLDivElement>('.table-div')!;
const cell = document.querySelector<HTMLSpanElement>('#cell')!;
const log = document.querySelector<HTMLPreElement>('#log')!;
const moveDown = document.querySelector<HTMLInputElement>('#moveDown')!;
const rtl = document.querySelector<HTMLInputElement>('#rtl')!;

const CUSTOMERS = ['Acme', 'Globex', 'Initech', 'Umbrella', 'Hooli', 'Stark'];
const PRODUCTS = ['Laptop', 'Monitor', 'Mouse', 'Keyboard', 'Dock', 'Headset'];
const orders: Order[] = Array.from({ length: 10_000 }, (_, i) => ({
  id: i + 1,
  customer: CUSTOMERS[i % CUSTOMERS.length],
  product: PRODUCTS[(i * 7) % PRODUCTS.length],
  qty: 1 + (i * 13) % 9,
  price: [1299, 349, 25, 79, 189, 99][(i * 7) % PRODUCTS.length],
  status: ['open', 'paid', 'void'][i % 3],
  paid: i % 3 === 1,
}));

let scope: TableScope | undefined;
let api: TableApi | undefined;

function write(line: string) {
  log.textContent = `${line}\n${log.textContent ?? ''}`.split('\n').slice(0, 6).join('\n');
}

function createTable() {
  scope?.destroy();
  // #region options
  const selectionModel = new SelectionModel('range', 'multi');
  const tableModel = TableFactory.createTableModel({
    rows: orders,
    columnDefs: [
      ColumnDef.create({ property: 'id', headerLabel: 'Id', width: px100 }),
      ColumnDef.create({ property: 'customer', headerLabel: 'Customer', width: px200, editable: TrueFn }),
      ColumnDef.create({ property: 'product', headerLabel: 'Product', width: px200, editable: TrueFn }),
      ColumnDef.create({ property: 'qty', headerLabel: 'Qty', width: px100, editable: TrueFn, editInputPipe: editInputPipeForNumber, emptyValue: 0 }),
      ColumnDef.create({ property: 'price', headerLabel: 'Price', width: px100, editable: TrueFn, emptyValue: 0 }),
      ColumnDef.create({ property: 'status', headerLabel: 'Status', width: px120, editable: TrueFn,
        editor: () => SelectCellEditor.create(['open', 'paid', 'void']) }),
      ColumnDef.create({ property: 'paid', headerLabel: 'Paid', width: px100, editable: TrueFn }),
    ],
  });
  const tableOptions: TableOptionsIf = {
    ...new TableOptions(),
    getSelectionModel: () => selectionModel,
    editing: { enterKey: moveDown.checked ? 'moveDown' : 'edit' },
    direction: rtl.checked ? 'rtl' : 'ltr',
  };
  // #endregion options
  const listener = new EventAdapter();
  listener.onModelChanged = (evt: GeModelChangeEvent) =>
    write(`${evt.source}: ${evt.changes?.map(c => `${c.property} ${JSON.stringify(c.oldValue)} → ${JSON.stringify(c.newValue)}`).join(', ')}`);
  scope = new TableScope(host, tableModel, new SimpleDomService(), tableOptions, listener);
  scope.firstInit();
  api = scope.getApi();
  // #region subscribe
  api.subscribe({
    onEditingChanged: (evt: GeEditEvent) => {
      cell.textContent = evt.type === 'start' || evt.type === 'input'
        ? `editing row ${evt.rowIndex + 1}: ${evt.input ?? ''}` : '–';
    },
  });
  // #endregion subscribe
}

createTable();
moveDown.addEventListener('change', createTable);
rtl.addEventListener('change', createTable);
document.querySelector<HTMLInputElement>('#dark')!.addEventListener('change', e => {
  document.documentElement.setAttribute('data-theme', (e.target as HTMLInputElement).checked ? 'dark' : 'light');
});
