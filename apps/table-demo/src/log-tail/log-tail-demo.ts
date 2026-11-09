// Live log demo (since 1.1.108): the shared LogTailController of demo-table-models feeds tableApi.appendRows –
// one call per animation frame, ring buffer of one million lines. Shows the last mouse and keyboard events, so you
// can see that clicks and keys arrive also at 5,000 lines per second.
import '../../../../packages/table/css/main.css';
import { EventAdapter, SimpleDomService, TableScope } from '@guiexpert/table';
import type { GeMouseEvent } from '@guiexpert/table';
import { createLogTailModelAndOptions, LogTailController } from '@guiexpert/demo-table-models';
import type { LogLineIf, LogTailStatsIf } from '@guiexpert/demo-table-models';

const host = document.querySelector<HTMLDivElement>('.table-div')!;
const statsLabel = document.querySelector<HTMLElement>('#stats')!;
const newBelowLabel = document.querySelector<HTMLElement>('#new-below')!;
const eventList = document.querySelector<HTMLOListElement>('#events')!;

/** The last 5 events, newest first (text only – never innerHTML with data). */
function showEvent(text: string) {
  const item = document.createElement('li');
  item.textContent = text;
  eventList.prepend(item);
  while (eventList.children.length > 5) eventList.lastElementChild!.remove();
}

// #region table
const { tableModel, tableOptions } = createLogTailModelAndOptions();
const listener = new EventAdapter();
listener.onMouseClicked = (evt: GeMouseEvent) => {
  const line = tableApi.getBodyModel().getRowByIndex(evt.rowIndex) as LogLineIf | undefined; // the row object
  showEvent(`click ×${evt.clickCount} ${evt.areaIdent} row ${evt.rowIndex}: #${line?.id ?? '–'} ${line?.text ?? ''}`);
};
const tableScope = new TableScope(host, tableModel, new SimpleDomService(), tableOptions, listener);
tableScope.firstInit();
const tableApi = tableScope.getApi();

const live = new LogTailController(tableApi, { rate: 500, maxRows: 1_000_000, onStats: showStats });
live.start();
// #endregion table

// keyboard events: the app listens on the host and reads the focus after the table handled the key
host.addEventListener('keydown', evt => {
  requestAnimationFrame(() => {
    const [row] = tableScope.focusModel()?.getFocus() ?? [-1];
    const line = tableApi.getBodyModel().getRowByIndex(row) as LogLineIf | undefined;
    showEvent(`key ${evt.key}${evt.shiftKey ? ' +Shift' : ''} → focus row ${row}: #${line?.id ?? '–'}`);
  });
});

function showStats(s: LogTailStatsIf) {
  statsLabel.textContent = `${s.totalLines.toLocaleString('en')} lines · ${s.rowCount.toLocaleString('en')} in the table · `
    + `${s.linesPerSecond.toLocaleString('en')} lines/s · ${s.fps} fps · ${s.msPerUpdate.toFixed(1)} ms per update`
    + (s.pending ? ` · ${s.pending.toLocaleString('en')} waiting` : '');
  newBelowLabel.textContent = s.newBelow ? `+${s.newBelow.toLocaleString('en')} new lines below` : '';
}

const freeze = document.querySelector<HTMLButtonElement>('#freeze')!;
const pause = document.querySelector<HTMLButtonElement>('#pause')!;
const run = document.querySelector<HTMLButtonElement>('#run')!;
freeze.addEventListener('click', () => {
  live.setFreezeScroll(!live.isFrozen());
  freeze.setAttribute('aria-pressed', String(live.isFrozen()));
});
document.querySelector('#end')!.addEventListener('click', () => {
  live.scrollToEnd();
  freeze.setAttribute('aria-pressed', 'false');
});
pause.addEventListener('click', () => {
  live.setIntakePaused(!live.isIntakePaused());
  pause.setAttribute('aria-pressed', String(live.isIntakePaused()));
});
run.addEventListener('click', () => {
  if (live.isRunning()) live.stop(); else live.start();
  run.setAttribute('aria-pressed', String(live.isRunning()));
  run.textContent = live.isRunning() ? 'Running' : 'Stopped';
});
document.querySelector<HTMLSelectElement>('#rate')!.addEventListener('change', e => {
  live.setRate(Number((e.target as HTMLSelectElement).value));
});
document.querySelector<HTMLInputElement>('#dark')!.addEventListener('change', e => {
  document.documentElement.setAttribute('data-theme', (e.target as HTMLInputElement).checked ? 'dark' : 'light');
});
