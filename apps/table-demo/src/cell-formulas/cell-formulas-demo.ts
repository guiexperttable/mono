// Cell formulas (since 1.1.99): "=B2*C2" in the data is calculated; editor, fill, paste, undo and Excel know formulas.
import '../../../../packages/table/css/main.css';
import {
  ColumnDef,
  EventAdapter,
  FocusModel,
  SelectionModel,
  SimpleDomService,
  TableFactory,
  TableOptions,
  TableScope,
  TrueFn,
  px100,
  px200,
} from '@guiexpert/table';
import type { FocusModelIf, TableOptionsIf } from '@guiexpert/table';

interface Line { product: string; price: unknown; qty: unknown; total: unknown; note: string }

const host = document.querySelector<HTMLDivElement>('.table-div')!;
const cellInfo = document.querySelector<HTMLSpanElement>('#cell')!;

// #region data
const lines: Line[] = [
  { product: 'Product', price: 'Price', qty: 'Qty', total: 'Total', note: 'Note' },
  { product: 'Laptop', price: 1299, qty: 2, total: '=B2*C2', note: '=IF(C2>5,"bulk","")' },
  { product: 'Monitor', price: 349, qty: 3, total: '=B3*C3', note: '' },
  { product: 'Mouse', price: 25, qty: 10, total: '=B4*C4', note: '' },
  { product: 'Dock', price: 189, qty: 1, total: '=B5*C5', note: '' },
  { product: 'Total', price: null, qty: '=SUM(C2:C5)', total: '=SUM(D2:D5)', note: '=TEXT(D6*1.19,"#,##0.00")&" incl. VAT"' },
];
// #endregion data

// #region options
const focusModel = new FocusModel('cell');
const tableModel = TableFactory.createTableModel({
  rows: lines,
  rowNumbersVisible: { mode: 'original' },
  columnDefs: [
    ColumnDef.create({ property: 'product', headerLabel: 'A', width: px200, editable: TrueFn, sortable: TrueFn }),
    ColumnDef.create({ property: 'price', headerLabel: 'B', width: px100, editable: TrueFn, sortable: TrueFn }),
    ColumnDef.create({ property: 'qty', headerLabel: 'C', width: px100, editable: TrueFn, sortable: TrueFn }),
    ColumnDef.create({ property: 'total', headerLabel: 'D', width: px100, editable: TrueFn, sortable: TrueFn }),
    ColumnDef.create({ property: 'note', headerLabel: 'E', width: px200, editable: TrueFn }),
  ],
});
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  getSelectionModel: () => new SelectionModel('range', 'multi'),
  getFocusModel: () => focusModel,
  editing: true,
  clipboard: true,
  fillHandle: true,
  undo: true,
  cellFormulas: true,
};
// #endregion options

const listener = new EventAdapter();
const scope = new TableScope(host, tableModel, new SimpleDomService(), tableOptions, listener);
scope.firstInit();
const api = scope.getApi();

// #region address
listener.onFocusChanged = (fm: FocusModelIf) => {
  const [row, col] = fm.getFocus();
  const address = api.getCellAddress(row, col);
  cellInfo.textContent = address ? `${address}: ${String(api.getCellInput(row, col) ?? '')}` : '';
};
// #endregion address

document.querySelector('#excel')!.addEventListener('click', () => api.downloadExcel('offer.xlsx', '', { cellFormulas: true }));
document.querySelector<HTMLInputElement>('#dark')!.addEventListener('change', e => {
  document.documentElement.setAttribute('data-theme', (e.target as HTMLInputElement).checked ? 'dark' : 'light');
});
