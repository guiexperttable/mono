// Cover grid (CoverGridTableModel) – books as tiles in a virtual grid.
// Model, books and renderer: packages/demo-table-models/src/lib/createCoverGridModel.ts (also used by the website
// showcase "covergrid").
import '../../../../packages/table/css/main.css';
import { EventAdapter, SimpleDomService, TableApi, TableScope } from '@guiexpert/table';
import { BOOK_SORTS, createCoverGridModelAndOptions, fitCoversToWidth, generateBooks } from '@guiexpert/demo-table-models';
import type { BookIf } from '@guiexpert/demo-table-models';
import type { CoverGridTableModel } from '@guiexpert/table';

const $ = <T extends HTMLElement>(sel: string) => document.querySelector<T>(sel)!;
const host = $<HTMLDivElement>('.table-div');
const status = $<HTMLDivElement>('#status');
const search = $<HTMLInputElement>('#search');
const sizeSelect = $<HTMLSelectElement>('#size');
const orderSelect = $<HTMLSelectElement>('#order');
const countSelect = $<HTMLSelectElement>('#count');
const stretch = $<HTMLInputElement>('#stretch');

let books: BookIf[] = [];
let tableApi: TableApi | undefined;
let tableModel: CoverGridTableModel<BookIf> | undefined;
let searchText = '';
let selected: BookIf | undefined;

const matches = (book: BookIf) =>
  !searchText || `${book.title} ${book.author} ${book.genre} ${book.year}`.toLowerCase().includes(searchText);

function size(): [number, number] {
  const [w, h] = sizeSelect.value.split('x').map(Number);
  return [w, h];
}

function createGrid() {
  tableApi?.destroy();
  books = generateBooks(Number(countSelect.value));
  const [coverWidth, coverHeight] = size();
  const grid = createCoverGridModelAndOptions(books, coverWidth, coverHeight, {
    filter: matches,
    isSelected: book => book === selected
  });
  const model = grid.tableModel;
  tableModel = model;

  const listener = new EventAdapter();
  listener.onMouseClicked = evt => {
    if (evt.areaIdent !== 'body' || evt.rowIndex < 0 || evt.columnIndex < 0) return;
    // the item under the mouse: row × columns + column of the filtered (and sorted) items
    const book = model.bodyModel.getValueAt(evt.rowIndex, evt.columnIndex);
    if (!book) return;
    selected = book;
    tableApi?.repaint();   // the renderer draws the frame
    report();
  };

  tableApi = new TableScope(host, model, new SimpleDomService(), grid.tableOptions, listener).firstInit().getApi();
  applySize();
  applyOrder();
  if (searchText) tableApi.externalFilterChanged();
  report();
}

function applyOrder() {
  tableApi?.sort(BOOK_SORTS[orderSelect.value as keyof typeof BOOK_SORTS]);
}

function report() {
  const columns = tableModel?.getColumnCount() ?? 0;
  const shown = books.filter(matches).length;
  const pick = selected ? `   Selected: ${selected.title} – ${selected.author} (${selected.year})` : '';
  status.textContent = `${shown.toLocaleString()} of ${books.length.toLocaleString()} books, ${columns} columns.${pick}`;
}

let searchTimer = 0;
search.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => {
    searchText = search.value.trim().toLowerCase();
    tableApi?.externalFilterChanged();   // filters, keeps the order, scrolls to the top
    report();
  }, 150);
});

// tile size: the column count is floor(width / coverWidth) – set the size, repaint, done (no new model)
function applySize() {
  if (!tableModel || !tableApi) return;
  const [coverWidth, coverHeight] = size();
  if (stretch.checked) {
    fitCoversToWidth(tableModel, coverWidth, coverHeight);   // wider tiles, no gap on the right
  } else {
    tableModel.bodyModel.coverWidth = coverWidth;
    tableModel.bodyModel.coverHeight = coverHeight;
  }
  tableApi.repaintHard();
  report();
}

sizeSelect.addEventListener('change', applySize);
stretch.addEventListener('change', applySize);
orderSelect.addEventListener('change', applyOrder);
countSelect.addEventListener('change', () => { selected = undefined; createGrid(); });
$('#top').addEventListener('click', () => tableApi?.scrollToPixel(0, 0));
// The table follows the width of its host by itself (own ResizeObserver, debounced by
// tableOptions.resizeEventDebounceDelay). We want the new width at once to fit the tiles: recalcColumnWidths() hands
// the width of the host to the model (bodyModel.width), applySize() fits the tiles and repaints.
let frame = 0;
new ResizeObserver(() => {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => {
    tableApi?.recalcColumnWidths();
    applySize();
  });
}).observe(host);

createGrid();
