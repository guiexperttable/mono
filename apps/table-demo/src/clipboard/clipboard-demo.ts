// Copy, cut and paste like Excel (since 1.1.99): Ctrl/⌘+C/X/V, tiling, Excel and Google Sheets round trip.
import '../../../../packages/table/css/main.css';
import {
  ColumnDef,
  EventAdapter,
  SelectionModel,
  SimpleDomService,
  TableFactory,
  TableOptions,
  TableScope,
  TrueFn,
  createNumberInputPipe,
  px100,
  px120,
  px200,
} from '@guiexpert/table';
import type { GeModelChangeEvent, TableApi, TableOptionsIf } from '@guiexpert/table';

interface Order { id: number; product: string; qty: number; price: number; note: string }

const host = document.querySelector<HTMLDivElement>('.table-div')!;
const log = document.querySelector<HTMLPreElement>('#log')!;
const addRows = document.querySelector<HTMLInputElement>('#addRows')!;
const headers = document.querySelector<HTMLInputElement>('#headers')!;

const PRODUCTS = ['Laptop', 'Monitor', 'Mouse', 'Keyboard', 'Dock', 'Headset'];
const orders: Order[] = Array.from({ length: 200 }, (_, i) => ({
  id: i + 1,
  product: PRODUCTS[(i * 7) % PRODUCTS.length],
  qty: 1 + (i * 13) % 9,
  price: [1299, 349, 25, 79, 189, 99][(i * 7) % PRODUCTS.length],
  note: i === 2 ? 'two\nlines' : i === 3 ? 'say "hi"' : '',
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
      ColumnDef.create({ property: 'product', headerLabel: 'Product', width: px200, editable: TrueFn }),
      ColumnDef.create({ property: 'qty', headerLabel: 'Qty', width: px100, editable: TrueFn }),
      ColumnDef.create({ property: 'price', headerLabel: 'Price', width: px120, editable: TrueFn,
        editInputPipe: createNumberInputPipe() }),
      ColumnDef.create({ property: 'note', headerLabel: 'Note', width: px200, editable: TrueFn }),
    ],
  });
  const tableOptions: TableOptionsIf = {
    ...new TableOptions(),
    getSelectionModel: () => selectionModel,
    editing: true,
    clipboard: {
      copyHeaders: headers.checked,
      pasteAddsRows: addRows.checked,
      createRow: () => ({ id: orders.length + 1, product: '', qty: 0, price: 0, note: '' }),
    },
  };
  // #endregion options
  const listener = new EventAdapter();
  listener.onModelChanged = (evt: GeModelChangeEvent) =>
    write(`${evt.source}: ${evt.changes?.length ?? 0} cells`);
  scope = new TableScope(host, tableModel, new SimpleDomService(), tableOptions, listener);
  scope.firstInit();
  api = scope.getApi();
}

createTable();
addRows.addEventListener('change', createTable);
headers.addEventListener('change', createTable);
document.querySelector('#copy')!.addEventListener('click', () => api?.copySelection().then(() => write('copied (API)')));
document.querySelector('#cut')!.addEventListener('click', () => api?.cutSelection().then(() => write('cut (API)')));
document.querySelector('#paste')!.addEventListener('click', () => {
  api?.pasteText(document.querySelector<HTMLTextAreaElement>('#text')!.value);
});
document.querySelector<HTMLInputElement>('#dark')!.addEventListener('change', e => {
  document.documentElement.setAttribute('data-theme', (e.target as HTMLInputElement).checked ? 'dark' : 'light');
});
