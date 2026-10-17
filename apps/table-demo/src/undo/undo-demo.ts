// Undo and redo (since 1.1.99): Ctrl/⌘+Z for edits, fills, pastes, cuts and Delete; own buttons via undoStackChanged.
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
  px100,
  px200,
} from '@guiexpert/table';
import type { GeModelChangeEvent, GeUndoEvent, TableApi, TableOptionsIf } from '@guiexpert/table';

interface Order { id: number; product: string; qty: number; price: number }

const host = document.querySelector<HTMLDivElement>('.table-div')!;
const log = document.querySelector<HTMLPreElement>('#log')!;
const undoButton = document.querySelector<HTMLButtonElement>('#undo')!;
const redoButton = document.querySelector<HTMLButtonElement>('#redo')!;
const batch = document.querySelector<HTMLInputElement>('#batch')!;

const PRODUCTS = ['Laptop', 'Monitor', 'Mouse', 'Keyboard', 'Dock', 'Headset'];
const orders: Order[] = Array.from({ length: 500 }, (_, i) => ({
  id: i + 1, product: PRODUCTS[(i * 7) % PRODUCTS.length], qty: 1 + (i * 13) % 9, price: [1299, 349, 25, 79, 189, 99][(i * 7) % 6],
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
      ColumnDef.create({ property: 'id', headerLabel: 'Id', width: px100, sortable: TrueFn }),
      ColumnDef.create({ property: 'product', headerLabel: 'Product', width: px200, editable: TrueFn, sortable: TrueFn }),
      ColumnDef.create({ property: 'qty', headerLabel: 'Qty', width: px100, editable: TrueFn, sortable: TrueFn }),
      ColumnDef.create({ property: 'price', headerLabel: 'Price', width: px100, editable: TrueFn, sortable: TrueFn }),
    ],
  });
  const tableOptions: TableOptionsIf = {
    ...new TableOptions(),
    getSelectionModel: () => selectionModel,
    editing: true,
    clipboard: true,
    fillHandle: true,
    undo: true,
    batchEdit: batch.checked,
  };
  // #endregion options
  const listener = new EventAdapter();
  listener.onModelChanged = (evt: GeModelChangeEvent) => write(`${evt.source}: ${evt.changes?.length ?? 0} cells`);
  // #region buttons
  listener.onUndoStackChanged = (evt: GeUndoEvent) => {
    undoButton.disabled = !evt.canUndo;
    redoButton.disabled = !evt.canRedo;
    undoButton.textContent = evt.undoLabel ? `Undo ${evt.undoLabel}` : 'Undo';
    redoButton.textContent = evt.redoLabel ? `Redo ${evt.redoLabel}` : 'Redo';
  };
  // #endregion buttons
  scope = new TableScope(host, tableModel, new SimpleDomService(), tableOptions, listener);
  scope.firstInit();
  api = scope.getApi();
}

createTable();
batch.addEventListener('change', createTable);
undoButton.addEventListener('click', () => api?.undo());
redoButton.addEventListener('click', () => api?.redo());
document.querySelector('#commit')!.addEventListener('click', () => api?.commitBatchEdit());
document.querySelector<HTMLInputElement>('#dark')!.addEventListener('change', e => {
  document.documentElement.setAttribute('data-theme', (e.target as HTMLInputElement).checked ? 'dark' : 'light');
});
