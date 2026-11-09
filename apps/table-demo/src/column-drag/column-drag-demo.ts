// Dragging columns (since 1.1.110): the column events save the layout once per drag (no DOM listeners on the header,
// no setTimeout), "#" is locked (resizable: false, movable: false), a double click on a resize handle fits the width.
// "live" appends lines while you drag – the drag is not disturbed.
import '../../../../packages/table/css/main.css';
import {
  ColumnDef,
  EventAdapter,
  SimpleDomService,
  TableApi,
  TableFactory,
  TableOptions,
  TableOptionsIf,
  TableScope,
  px120,
  px60,
  px90,
  px500,
} from '@guiexpert/table';
import type { GeColumnMoveEvent, GeColumnResizeEvent, TableStateIf } from '@guiexpert/table';

interface LogLine { line: number; time: string; level: string; source: string; message: string }

const LEVELS = ['INFO', 'INFO', 'INFO', 'DEBUG', 'WARN', 'ERROR'];
const SOURCES = ['http', 'db', 'auth', 'cache', 'scheduler'];
const WORDS = ['request', 'served', 'in', 'ms', 'user', 'session', 'refreshed', 'query', 'took', 'retry', 'timeout',
  'connection', 'pool', 'exhausted', 'job', 'finished', 'with', 'warnings'];
const STORAGE_KEY = 'column-drag-demo-layout';

let next = 1;
function createLines(count: number): LogLine[] {
  const ret: LogLine[] = new Array(count);
  for (let i = 0; i < count; i++) {
    const n = next++;
    const words = 3 + (n * 7) % 12;
    let message = '';
    for (let w = 0; w < words; w++) message += (w ? ' ' : '') + WORDS[(n * 31 + w * 17) % WORDS.length];
    ret[i] = {
      line: n,
      time: new Date(Date.UTC(2026, 10, 9, 8, 0, 0) + n * 250).toISOString().substring(11, 23),
      level: LEVELS[(n * 13) % LEVELS.length],
      source: SOURCES[(n * 5) % SOURCES.length],
      message,
    };
  }
  return ret;
}

const host = document.querySelector<HTMLDivElement>('.table-div')!;
const rowsSelect = document.querySelector<HTMLSelectElement>('#rows')!;
const liveInput = document.querySelector<HTMLInputElement>('#live')!;
const log = document.querySelector<HTMLOListElement>('#log')!;
let tableApi: TableApi | undefined;
let liveTimer: ReturnType<typeof setInterval> | undefined;

function write(text: string) {
  const li = document.createElement('li');
  li.textContent = text; // event data only as text
  log.prepend(li);
  while (log.childElementCount > 200) log.lastElementChild!.remove();
}

function saveLayout() {
  if (!tableApi) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tableApi.getState(['columns'])));
}

function createTable() {
  tableApi?.destroy();
  next = 1;
  // #region model
  const tableModel = TableFactory.createTableModel({
    rows: createLines(Number(rowsSelect.value)),
    columnDefs: [
      ColumnDef.create({ property: 'line', headerLabel: '#', width: px60, resizable: false, movable: false,
        bodyClasses: ['ge-table-text-align-right'] }),
      ColumnDef.create({ property: 'time', headerLabel: 'Time', width: px120 }),
      ColumnDef.create({ property: 'level', headerLabel: 'Level', width: px90 }),
      ColumnDef.create({ property: 'source', headerLabel: 'Source', width: px90 }),
      ColumnDef.create({ property: 'message', headerLabel: 'Message', width: px500 }),
    ],
    fixedLeftColumnCount: 1,
  });
  // #endregion model

  // #region events
  const listener = new EventAdapter();
  listener.onColumnResizeStart = (evt: GeColumnResizeEvent) => write(`resize start  ${evt.property} ${evt.oldWidth}px (${evt.source})`);
  listener.onColumnResizeEnd = (evt: GeColumnResizeEvent) => {
    write(`resize ${evt.type.padEnd(6)} ${evt.property} ${evt.oldWidth} → ${evt.newWidth}px (${evt.source})`);
    if (evt.type === 'end') saveLayout();
  };
  listener.onColumnMoveStart = (evt: GeColumnMoveEvent) => write(`move start    ${evt.property} at ${evt.fromIndex}`);
  listener.onColumnMoveEnd = (evt: GeColumnMoveEvent) => {
    write(`move ${evt.type.padEnd(8)} ${evt.property} ${evt.fromIndex} → ${evt.toIndex}  [${evt.columnOrder.join(', ')}]`);
    if (evt.moved) saveLayout();
  };
  // #endregion events

  const tableOptions: TableOptionsIf = {
    ...new TableOptions(),
    columnAutoWidth: { maxRows: 10_000 }, // above: the double click measures the lines on screen
  };
  const scope = new TableScope(host, tableModel, new SimpleDomService(), tableOptions, listener);
  scope.firstInit();
  tableApi = scope.getApi();

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      tableApi.applyState(JSON.parse(saved) as TableStateIf, ['columns']); // no column events: API call
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}

function setLive(on: boolean) {
  clearInterval(liveTimer);
  liveTimer = on ? setInterval(() => tableApi?.appendRows(createLines(20), { follow: 'auto' }), 100) : undefined;
}

rowsSelect.addEventListener('change', createTable);
liveInput.addEventListener('change', () => setLive(liveInput.checked));
document.querySelector('#fit')!.addEventListener('click', () => {
  const width = tableApi?.autoResizeColumn('message');
  write(`autoResizeColumn("message") → ${width}px (no event)`);
  saveLayout();
});
document.querySelector('#reset')!.addEventListener('click', () => {
  localStorage.removeItem(STORAGE_KEY);
  createTable();
});
document.querySelector<HTMLInputElement>('#dark')!.addEventListener('change', e => {
  document.documentElement.dataset['theme'] = (e.target as HTMLInputElement).checked ? 'dark' : 'light';
});

createTable();
