// Row drag demo (since 1.1.95): a priority list (managed or events only) and a tree. Drag the grip in the "Task" column,
// select several rows first to move them together, Escape cancels, Ctrl+Alt+↑/↓ moves the focused row.
import '../../../../packages/table/css/main.css';
import {
  ColumnDef,
  EventAdapter,
  GeRowDragEvent,
  SimpleDomService,
  TableApi,
  TableFactory,
  TableOptions,
  TableScope,
  TreeFactory,
  px300,
} from '@guiexpert/table';
import { createRowDragModelAndOptions, generateTasks } from '@guiexpert/demo-table-models';
import type { TaskIf } from '@guiexpert/demo-table-models';

const host = document.querySelector<HTMLDivElement>('.table-div')!;
const log = document.querySelector<HTMLPreElement>('#log')!;
const managedBox = document.querySelector<HTMLInputElement>('#managed')!;

let tasks: TaskIf[] = generateTasks(20, true);
let tableScope: TableScope | undefined;
let tableApi: TableApi | undefined;

function write(line: string) {
  log.textContent = `${line}\n${log.textContent ?? ''}`.split('\n').slice(0, 6).join('\n');
}

function createTable() {
  tableScope?.destroy();
  const { tableModel, tableOptions } = createRowDragModelAndOptions(tasks, { managed: managedBox.checked });
  // #region events
  const listener = new EventAdapter();
  listener.onRowDragEnd = (evt: GeRowDragEvent<TaskIf>) => {
    if (evt.type === 'cancel') {
      write('cancelled');
    } else if (evt.outside) {
      write(`dropped outside the table: ${evt.rows.map(t => t.title).join(', ')}`);
    } else if (evt.moved) {
      write(`${evt.rows.map(t => t.title).join(', ')} → position ${evt.toIndex + 1} (${evt.source})`);
    } else if (evt.target) {
      // events only: the app decides – here it simply agrees
      write(`app moves ${evt.rows.length} row(s) to position ${evt.toIndex + 1}`);
      tableApi?.moveRows(evt.rowIndices, evt.target);
    }
  };
  // #endregion events
  tableScope = new TableScope(host, tableModel, new SimpleDomService(), tableOptions, listener);
  tableScope.firstInit();
  tableApi = tableScope.getApi();
}

createTable();
managedBox.addEventListener('change', createTable);
document.querySelector('#sort')!.addEventListener('click', () => {
  tableApi?.sortByColumn(4, 'desc');               // managed: the grips are dimmed while sorted
  write('sorted – managed drag is blocked until the sort is removed (Reset)');
});
document.querySelector('#reset')!.addEventListener('click', () => {
  tasks = generateTasks(20, true);
  log.textContent = '';
  createTable();
});

// Tree: before/after = sibling, middle = child; a node never moves into its own children.
interface Folder { name: string; children?: Folder[] }
const folders: Folder[] = [
  { name: 'Inbox', children: [{ name: 'Invoices' }, { name: 'Newsletters' }] },
  { name: 'Projects', children: [{ name: 'Table', children: [{ name: 'Row drag' }, { name: 'RTL' }] }, { name: 'Website' }] },
  { name: 'Archive' },
];
const treeModel = TableFactory.createTableModel({
  rows: TreeFactory.buildTreeRows(folders, { expanded: true }),
  columnDefs: [ColumnDef.create({ property: 'name', headerLabel: 'Folder', width: px300, rowDrag: true })]
});
new TableScope(document.querySelector<HTMLDivElement>('.tree-div')!, treeModel, new SimpleDomService(),
  new TableOptions(), new EventAdapter()).firstInit();

document.querySelector<HTMLInputElement>('#dark')!.addEventListener('change', e => {
  document.documentElement.setAttribute('data-theme', (e.target as HTMLInputElement).checked ? 'dark' : 'light');
});
