// Accessibility demo: a WAI-ARIA grid with a visible title, own (German) announcement texts and a visible copy of
// everything the screen reader hears. The table needs no extra code for roles, focus or keyboard.
import '../../../../packages/table/css/main.css';
import {
  AriaTextsIf,
  ColumnDef,
  EventAdapter,
  SelectionModel,
  SimpleDomService,
  SortState,
  StarRatingCellRenderer,
  TableApi,
  TableFactory,
  TableOptions,
  TableOptionsIf,
  TableScope,
  TrueFn,
  px100,
  px120,
  px200,
} from '@guiexpert/table';

interface Order { id: number; customer: string; city: string; rating: number; total: number }

const cities = ['Berlin', 'Hamburg', 'München', 'Köln', 'Leipzig', 'Bonn'];
const orders: Order[] = Array.from({ length: 10_000 }, (_, i) => ({
  id: 1000 + i,
  customer: `Customer ${(i * 7919) % 997}`,
  city: cities[i % cities.length],
  rating: 1 + (i * 31) % 5,
  total: Math.round(((i * 7919) % 100_000) / 10) / 10,
}));

const german: Partial<AriaTextsIf> = {
  sorted: (column: string, state: SortState) =>
    state ? `Sortiert nach ${column}, ${state === 'asc' ? 'aufsteigend' : 'absteigend'}` : `Sortierung von ${column} entfernt`,
  filtered: (rowCount: number) => rowCount === 1 ? '1 Zeile' : `${rowCount} Zeilen`,
  copied: (cellCount: number) => cellCount === 1 ? '1 Zelle kopiert' : `${cellCount} Zellen kopiert`,
  allSelected: () => 'Alle Zellen ausgewählt',
  selectionCleared: () => 'Auswahl aufgehoben',
};

let filterText = '';
let scope: TableScope | undefined;
let api: TableApi | undefined;

function createTable(language: 'en' | 'de') {
  scope?.destroy();
  // #region aria-options
  const columnDefs = [
    ColumnDef.create({ property: 'id', headerLabel: 'Order', width: px100, sortable: TrueFn }),
    ColumnDef.create({ property: 'customer', headerLabel: 'Customer', width: px200, sortable: TrueFn }),
    ColumnDef.create({ property: 'city', headerLabel: 'City', width: px120, sortable: TrueFn }),
    ColumnDef.create({ property: 'rating', headerLabel: 'Rating', width: px120, bodyRenderer: new StarRatingCellRenderer('rating') }),
    ColumnDef.create({ property: 'total', headerLabel: 'Total', width: px120, sortable: TrueFn }),
  ];
  const selectionModel = new SelectionModel('range', 'multi');
  const tableOptions: TableOptionsIf = {
    ...new TableOptions(),
    ariaLabelledBy: 'orders-title',            // the visible heading names the grid
    ariaDescribedBy: 'orders-hint',            // the key legend describes it
    ariaTexts: language === 'de' ? german : undefined,
    getSelectionModel: () => selectionModel,
    externalFilterFunction: (order: Order) => !filterText || order.customer.includes(filterText),
  };
  // #endregion aria-options
  const tableModel = TableFactory.createTableModel({ rows: orders, columnDefs, tableOptions });
  const host = document.querySelector<HTMLDivElement>('.table-div')!;
  scope = new TableScope(host, tableModel, new SimpleDomService(), tableOptions, new EventAdapter());
  scope.firstInit();
  api = scope.getApi();
  mirrorLiveRegion(scope);
}

/** Shows what the screen reader hears – a copy of the live region (only for the demo/video). */
function mirrorLiveRegion(tableScope: TableScope) {
  api!.announce(document.documentElement.lang === 'de' ? 'Tabelle bereit' : 'Table ready'); // creates the live region
  const region = tableScope.liveAnnouncer.getElement();
  const log = document.querySelector<HTMLOListElement>('#log')!;
  if (!region) return;
  new MutationObserver(() => {
    const text = region.textContent ?? '';
    if (!text) return;
    const li = document.createElement('li');
    li.textContent = text;
    log.prepend(li);
    while (log.children.length > 6) log.lastElementChild!.remove();
  }).observe(region, { childList: true, characterData: true, subtree: true });
}

document.querySelector<HTMLInputElement>('#filter')!.addEventListener('input', e => {
  filterText = (e.target as HTMLInputElement).value;
  api?.externalFilterChanged();
});
document.querySelector<HTMLSelectElement>('#language')!.addEventListener('change', e => {
  const language = (e.target as HTMLSelectElement).value as 'en' | 'de';
  document.documentElement.lang = language;
  createTable(language);
});
document.querySelector<HTMLInputElement>('#dark')!.addEventListener('change', e => {
  document.documentElement.setAttribute('data-theme', (e.target as HTMLInputElement).checked ? 'dark' : 'light');
});

createTable('en');
