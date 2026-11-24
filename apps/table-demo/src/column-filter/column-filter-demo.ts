import '../../../../packages/table/css/main.css';
import {
  AutoRestoreOptions,
  EventAdapter,
  GeFilterEvent,
  SimpleDomService,
  TableApi,
  TableScope,
} from '@guiexpert/table';
import { createColumnFilterModelAndOptions } from '@guiexpert/demo-table-models';

const shell = document.querySelector<HTMLDivElement>('#shell')!;
const host = document.querySelector<HTMLDivElement>('#table')!;
const rowsSelect = document.querySelector<HTMLSelectElement>('#rows')!;
const darkCheckbox = document.querySelector<HTMLInputElement>('#dark')!;
const rtlCheckbox = document.querySelector<HTMLInputElement>('#rtl')!;
const recordCountEl = document.querySelector<HTMLSpanElement>('#record-count')!;
const toggleFilterRowBtn = document.querySelector<HTMLButtonElement>('#toggle-filter-row')!;
const columnsBtn = document.querySelector<HTMLButtonElement>('#columns-btn')!;
const clearFiltersBtn = document.querySelector<HTMLButtonElement>('#clear-filters')!;
const fullscreenBtn = document.querySelector<HTMLButtonElement>('#fullscreen-btn')!;
const logEl = document.querySelector<HTMLOListElement>('#log')!;

let tableApi: TableApi | undefined;

function writeLog(text: string): void {
  const li = document.createElement('li');
  li.textContent = text;
  logEl.prepend(li);
  while (logEl.childElementCount > 150) {
    logEl.lastElementChild!.remove();
  }
}

function updateStatus(shown: number, total: number): void {
  recordCountEl.textContent = `Records: ${shown.toLocaleString('en-US')} / ${total.toLocaleString('en-US')}`;
}

function updateToggleButton(): void {
  const open = tableApi?.isFilterRowVisible() ?? false;
  toggleFilterRowBtn.textContent = open ? 'Hide filter row' : 'Show filter row';
}

function createTable(): void {
  tableApi?.destroy();
  const count = Number(rowsSelect.value);
  const t0 = performance.now();
  const { tableModel, tableOptions } = createColumnFilterModelAndOptions(count);

  tableOptions.direction = rtlCheckbox.checked ? 'rtl' : 'ltr';
  tableOptions.ariaLabel = 'SaaS accounts';
  tableOptions.autoRestoreOptions = {
    ...new AutoRestoreOptions(),
    getStorageKeyFn: () => 'demo-column-filter-v1',
    autoRestoreFilterState: true,
    autoRestoreColumnLayout: true,
  };

  const listener = new EventAdapter();
  listener.onFilterChanged = (evt: GeFilterEvent) => {
    updateStatus(evt.rowCount, evt.unfilteredRowCount);
    const activeKeys = Object.keys(evt.filters);
    writeLog(
      `filterChanged (${evt.source}) ${evt.property ?? 'all'} → ${evt.rowCount.toLocaleString('en-US')} / ${evt.unfilteredRowCount.toLocaleString('en-US')} [${activeKeys.join(', ') || 'none'}]`,
    );
  };

  const scope = new TableScope(host, tableModel, new SimpleDomService(), tableOptions, listener);
  scope.firstInit();
  tableApi = scope.getApi();

  const body = tableModel.getBodyModel();
  updateStatus(body.getRowCount(), body.getUnfilteredRowCount?.() ?? body.getRowCount());
  updateToggleButton();
  writeLog(`Built ${count.toLocaleString('en-US')} rows in ${(performance.now() - t0).toFixed(1)} ms`);
}

rowsSelect.addEventListener('change', createTable);
rtlCheckbox.addEventListener('change', createTable);
darkCheckbox.addEventListener('change', () => {
  document.documentElement.dataset['theme'] = darkCheckbox.checked ? 'dark' : 'light';
});

toggleFilterRowBtn.addEventListener('click', () => {
  if (!tableApi) return;
  tableApi.setFilterRowVisible(!tableApi.isFilterRowVisible());
  updateToggleButton();
});

columnsBtn.addEventListener('click', () => {
  tableApi?.showColumnChooser(columnsBtn);
});

clearFiltersBtn.addEventListener('click', () => {
  tableApi?.clearColumnFilters();
});

fullscreenBtn.addEventListener('click', () => {
  if (document.fullscreenElement) {
    void document.exitFullscreen();
  } else {
    void shell.requestFullscreen();
  }
});

createTable();
