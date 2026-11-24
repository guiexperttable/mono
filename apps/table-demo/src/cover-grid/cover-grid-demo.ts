// Cover grid (CoverGridTableModel) – books as tiles in a virtual grid.
// Model, books and renderer: packages/demo-table-models/src/lib/createCoverGridModel.ts (also used by the website
// showcase "covergrid").
import '../../../../packages/table/css/main.css';
import { EventAdapter, SimpleDomService, TableApi, TableScope } from '@guiexpert/table';
import { BOOK_SORTS, createCoverGridModelAndOptions, generateBooks } from '@guiexpert/demo-table-models';
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
let opened: BookIf | undefined;

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
  // fill: tableOptions.coverGridFill (since 1.1.117) – the tiles stretch to the width, also at once on a resize
  const grid = createCoverGridModelAndOptions(books, coverWidth, coverHeight, {
    filter: matches,
    isSelected: book => book === selected,
    fill: stretch.checked
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

  // "open": Enter on the focused book and a double click report the same event (since 1.1.115)
  listener.onCellActivated = evt => {
    opened = evt.value as BookIf;
    selected = opened;
    tableApi?.repaint();
    report(evt.source);
  };

  tableApi = new TableScope(host, model, new SimpleDomService(), grid.tableOptions, listener).firstInit().getApi();
  applyOrder();
  if (searchText) tableApi.externalFilterChanged();
  report();
}

function applyOrder() {
  tableApi?.sort(BOOK_SORTS[orderSelect.value as keyof typeof BOOK_SORTS]);
}

function report(openedBy?: string) {
  const columns = tableModel?.getColumnCount() ?? 0;
  const shown = books.filter(matches).length;
  const pick = selected ? `   Selected: ${selected.title} – ${selected.author} (${selected.year})` : '';
  const open = opened ? `   Opened: ${opened.title}${openedBy ? ` (${openedBy})` : ''}` : '';
  status.textContent = `${shown.toLocaleString()} of ${books.length.toLocaleString()} books, ${columns} columns.${pick}${open}`;
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

// tile size: no new model. Filled: the wanted width and the ratio – one render, the top book stays (since 1.1.117).
// Not filled: columns = floor(width / coverWidth), a gap on the right.
function applySize() {
  if (!tableModel || !tableApi) return;
  const [coverWidth, coverHeight] = size();
  if (stretch.checked) {
    tableApi.setCoverGridFill({ tileWidth: coverWidth, aspectRatio: coverHeight / coverWidth });
  } else {
    tableApi.setCoverGridFill(false);
    tableModel.bodyModel.coverWidth = coverWidth;
    tableModel.bodyModel.coverHeight = coverHeight;
    tableApi.repaintHard();
  }
  report();
}

sizeSelect.addEventListener('change', applySize);
stretch.addEventListener('change', applySize);
orderSelect.addEventListener('change', applyOrder);
countSelect.addEventListener('change', () => { selected = undefined; opened = undefined; createGrid(); });
$('#top').addEventListener('click', () => tableApi?.scrollToPixel(0, 0));
// The table follows the width of its host by itself (with coverGridFill in the same frame) – this observer only
// updates the column count in the status line.
new ResizeObserver(() => requestAnimationFrame(() => report())).observe(host);

createGrid();
