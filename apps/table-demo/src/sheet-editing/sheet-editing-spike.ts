// Spike page (prompt 013, design § 2.10): which events does each browser deliver to a focused table?
import '../../../../packages/table/css/main.css';
import { ColumnDef, SelectionModel, SimpleDomService, TableFactory, TableOptions, TableScope, TrueFn, px200 } from '@guiexpert/table';

const host = document.querySelector<HTMLDivElement>('.table-div')!;
const events = document.querySelector<HTMLDivElement>('#events')!;
const result = document.querySelector<HTMLTextAreaElement>('#result')!;
document.querySelector('#ua')!.textContent = navigator.userAgent;

const rows = Array.from({ length: 200 }, (_, i) => ({ text: `Text ${i}`, number: i, name: `Name ${i}` }));
const scope = new TableScope(host, TableFactory.createTableModel({
  rows,
  columnDefs: ['text', 'number', 'name'].map(p => ColumnDef.create({ property: p, headerLabel: p, width: px200, editable: TrueFn })),
}), new SimpleDomService(), { ...new TableOptions(), getSelectionModel: () => new SelectionModel('range', 'multi'), editing: true }, undefined!);
scope.firstInit();

const describe = (t: EventTarget | null) => t instanceof HTMLElement
  ? `${t.tagName.toLowerCase()}${t.className ? '.' + String(t.className).split(' ')[0] : ''}` : String(t);
const log = (line: string) => {
  events.textContent = `${line}\n${events.textContent ?? ''}`.split('\n').slice(0, 200).join('\n');
};
for (const type of ['keydown', 'compositionstart', 'compositionupdate', 'compositionend', 'beforeinput', 'input', 'copy', 'cut', 'paste']) {
  document.addEventListener(type, (e: Event) => {
    const k = e as KeyboardEvent & InputEvent & CompositionEvent & ClipboardEvent;
    const detail = type === 'keydown' ? `key=${JSON.stringify(k.key)} code=${k.code} composing=${k.isComposing}`
      : type.startsWith('composition') ? `data=${JSON.stringify(k.data)}`
        : type === 'paste' ? `text=${JSON.stringify(k.clipboardData?.getData('text/plain')?.slice(0, 30))}`
          : type.endsWith('input') ? `data=${JSON.stringify(k.data)} type=${k.inputType}` : '';
    log(`${type.padEnd(17)} ${describe(e.target).padEnd(32)} focus=${describe(document.activeElement)} ${detail}`);
  }, { capture: true });
}

const CASES: Array<[string, string]> = [
  ['Latin: type "abc" + Enter', 'cell = abc, focus one row down'],
  ['German dead key: ^ then e', 'cell starts with ê (not "^e")'],
  ['AltGr (Windows): AltGr+Q', 'cell = @'],
  ['IME Japanese: ka + Space + Enter', 'cell = か (or 蚊), no stray "k"'],
  ['IME Chinese/Windows MS-IME', 'composed text only'],
  ['Tab in the last column', 'focus leaves the table'],
  ['Screen reader: type, Enter', 'editor announced with column name'],
  ['Ctrl/⌘+C on a cell', '"copy" event at the host (or nowhere?)'],
  ['Ctrl/⌘+V on a cell', '"paste" event at the host (or nowhere?)'],
  ['Edit → Paste (browser menu)', 'menu enabled? "paste" event?'],
];
const tbody = document.querySelector<HTMLTableSectionElement>('#checks')!;
const state: Record<string, string> = (() => {
  try { return JSON.parse(localStorage.getItem('ge-spike') ?? '{}'); } catch { return {}; }
})();
const update = () => {
  result.value = `${navigator.userAgent}\n` + CASES.map(([c]) => `${state[c] ?? '?'}  ${c}`).join('\n');
  try { localStorage.setItem('ge-spike', JSON.stringify(state)); } catch { /* private mode */ }
};
for (const [name, expected] of CASES) {
  const tr = document.createElement('tr');
  const td = (text: string) => { const el = document.createElement('td'); el.textContent = text; tr.appendChild(el); return el; };
  td(name); td(expected);
  const select = document.createElement('select');
  for (const v of ['?', 'ok', 'fail']) select.add(new Option(v, v, false, state[name] === v));
  select.addEventListener('change', () => { state[name] = select.value; update(); });
  td('').appendChild(select);
  tbody.appendChild(tr);
}
update();
