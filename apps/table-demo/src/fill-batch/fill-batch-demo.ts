// Fill handle and batch edit demo (since 1.1.96): a price list. Drag the fill handle (series or copy), Ctrl/⌘+D,
// edit cells – with batch edit the changes stay marked until "Save" (here: a pretend server call) or "Discard".
import '../../../../packages/table/css/main.css';
import {
  CellRange,
  EventAdapter,
  GeBatchEditEvent,
  GeModelChangeEvent,
  SimpleDomService,
  TableApi,
  TableScope,
} from '@guiexpert/table';
import { createPriceListModelAndOptions, generatePriceItems } from '@guiexpert/demo-table-models';
import type { PriceItemIf } from '@guiexpert/demo-table-models';

const host = document.querySelector<HTMLDivElement>('.table-div')!;
const log = document.querySelector<HTMLPreElement>('#log')!;
const status = document.querySelector<HTMLSpanElement>('#status')!;
const saveButton = document.querySelector<HTMLButtonElement>('#save')!;
const discardButton = document.querySelector<HTMLButtonElement>('#discard')!;
const batchBox = document.querySelector<HTMLInputElement>('#batch')!;

const items: PriceItemIf[] = generatePriceItems(40);
let tableScope: TableScope | undefined;
let tableApi: TableApi | undefined;

function write(line: string) {
  log.textContent = `${line}\n${log.textContent ?? ''}`.split('\n').slice(0, 6).join('\n');
}

function createTable() {
  tableScope?.destroy();
  const { tableModel, tableOptions } = createPriceListModelAndOptions(items, batchBox.checked);
  // #region events
  const listener = new EventAdapter();
  listener.onBatchEditChanged = (evt: GeBatchEditEvent) => {
    saveButton.disabled = evt.pendingCount === 0 || evt.invalidCount > 0;
    discardButton.disabled = evt.pendingCount === 0;
    status.textContent = evt.pendingCount
      ? `${evt.pendingCount} unsaved change(s)${evt.invalidCount ? `, ${evt.invalidCount} invalid` : ''}`
      : 'No unsaved changes';
  };
  listener.onModelChanged = (evt: GeModelChangeEvent) => {
    write(`${evt.source}: ${evt.changes?.length ?? evt.cells.length} cell(s) written`);
  };
  // #endregion events
  tableScope = new TableScope(host, tableModel, new SimpleDomService(), tableOptions, listener);
  tableScope.firstInit();
  tableApi = tableScope.getApi();
  // start with a selection, so the fill handle is visible right away
  tableApi.getSelectionModel()?.addSelection(new CellRange(0, 4, 1, 4));
  tableApi.repaint();
  saveButton.disabled = true;
  discardButton.disabled = true;
  status.textContent = batchBox.checked ? 'No unsaved changes' : 'Changes are written immediately';
}

// #region save
saveButton.addEventListener('click', async () => {
  const changes = tableApi!.getPendingChanges()
    .map(c => ({ sku: (c.row as PriceItemIf).sku, field: c.property, value: c.newValue }));
  await new Promise(resolve => setTimeout(resolve, 300));   // e.g. fetch('/api/prices', { method: 'PATCH', … })
  write(`saved: ${JSON.stringify(changes).slice(0, 120)}…`);
  tableApi!.commitBatchEdit();
});
discardButton.addEventListener('click', () => tableApi!.cancelBatchEdit());
// #endregion save

createTable();
batchBox.addEventListener('change', createTable);
document.querySelector<HTMLInputElement>('#dark')!.addEventListener('change', e => {
  document.documentElement.setAttribute('data-theme', (e.target as HTMLInputElement).checked ? 'dark' : 'light');
});
