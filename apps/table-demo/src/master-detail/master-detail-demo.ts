// Master/detail demo (since 1.1.97): 100.000 orders, an expanded order shows its items as a nested GuiExpert table –
// or (select "notes form") a small form whose height is measured ("auto").
import '../../../../packages/table/css/main.css';
import { EventAdapter, GeDetailEvent, SimpleDomService, TableApi, TableScope } from '@guiexpert/table';
import type { DetailRenderFnType } from '@guiexpert/table';
import { createMasterDetailModelAndOptions, createOrderItemsModel, generateMasterOrders } from '@guiexpert/demo-table-models';
import type { MasterOrderIf } from '@guiexpert/demo-table-models';

const host = document.querySelector<HTMLDivElement>('.table-div')!;
const log = document.querySelector<HTMLPreElement>('#log')!;
const kind = document.querySelector<HTMLSelectElement>('#kind')!;
const orders = generateMasterOrders(100_000);
let tableScope: TableScope | undefined;
let tableApi: TableApi | undefined;

function write(line: string) {
  log.textContent = `${line}\n${log.textContent ?? ''}`.split('\n').slice(0, 6).join('\n');
}

// #region notes
/** A small form as detail: textContent / value only – no HTML from the data. */
const notesForm: DetailRenderFnType<MasterOrderIf> = (container, order, ctx) => {
  const form = document.createElement('div');
  form.className = 'notes';
  const title = document.createElement('strong');
  title.textContent = `${order.orderNo} · ${order.customer} · ${order.items.length} item(s)`;
  const notes = document.createElement('textarea');
  notes.placeholder = 'Notes for this order…';
  const save = document.createElement('button');
  save.textContent = 'Save note';
  save.addEventListener('click', () => write(`note for ${order.orderNo}: ${notes.value}`), { signal: ctx.signal });
  form.append(title, notes, save);
  container.appendChild(form);
};
// #endregion notes

function createTable() {
  tableScope?.destroy();
  const { tableModel, tableOptions } = kind.value === 'notes'
    ? createMasterDetailModelAndOptions(orders, { detailHeight: 'auto', detailRenderer: notesForm })
    : createMasterDetailModelAndOptions(orders, {
      detailRenderer: (_el, order: MasterOrderIf, ctx) => { ctx.createTable({ tableModel: createOrderItemsModel(order) }); }
    });
  const listener = new EventAdapter();
  listener.onDetailExpandedChanged = (evt: GeDetailEvent<MasterOrderIf>) =>
    write(`${evt.row.orderNo} ${evt.expanded ? 'expanded' : 'collapsed'} (${evt.source})`);
  tableScope = new TableScope(host, tableModel, new SimpleDomService(), tableOptions, listener);
  tableScope.firstInit();
  tableApi = tableScope.getApi();
  tableApi.setDetailExpanded(1, true);   // one open order to start with
}

document.querySelector<HTMLButtonElement>('#expand')!.addEventListener('click', () => {
  for (let i = 0; i < 50; i++) tableApi!.setDetailExpanded(i, true);
});
document.querySelector<HTMLButtonElement>('#collapse')!.addEventListener('click', () => write(`${tableApi!.collapseAllDetails()} collapsed`));
kind.addEventListener('change', createTable);
document.querySelector<HTMLInputElement>('#dark')!.addEventListener('change', e => {
  document.documentElement.setAttribute('data-theme', (e.target as HTMLInputElement).checked ? 'dark' : 'light');
});
createTable();
