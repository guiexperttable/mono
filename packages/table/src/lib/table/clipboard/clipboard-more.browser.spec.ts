// Copy, cut and paste: API, own CopyServiceIf, value conversion, edge cases (prompt 013 stage 2).
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CellRange,
  ColumnDef,
  CopyService,
  EventAdapter,
  FocusModel,
  RowNumberColumnDef,
  SelectionModel,
  SimpleDomService,
  TableFactory,
  TableOptions,
  TableScope,
  TrueFn,
  px100,
} from '@guiexpert/table';
import type { ColumnDefIf, CopyServiceIf, TableOptionsIf } from '@guiexpert/table';
import { destroyAllTables, mountTable, nextFrame } from '../../../../test-utils/mount-table';

afterEach(() => {
  destroyAllTables();
  vi.unstubAllGlobals();
});

interface Row { id: number; name: string; due: Date | string; done: boolean | string; qty: number | string }

function rowsOf(n = 6): Row[] {
  return Array.from({ length: n }, (_, i) => ({ id: i, name: `N${i}`, due: new Date(2026, 0, 1 + i, 9, 30), done: i % 2 === 0, qty: i }));
}

const columns = (): ColumnDefIf[] => [
  ColumnDef.create({ property: 'id', headerLabel: 'ID', width: px100 }),
  ColumnDef.create({ property: 'name', headerLabel: 'Name', width: px100, editable: TrueFn }),
  ColumnDef.create({ property: 'due', headerLabel: 'Due', width: px100, editable: TrueFn }),
  ColumnDef.create({ property: 'done', headerLabel: 'Done', width: px100, editable: TrueFn }),
  ColumnDef.create({ property: 'qty', headerLabel: 'Qty', width: px100, editable: TrueFn, editor: 'number' }),
];
const ID = 0, NAME = 1, DUE = 2, DONE = 3, QTY = 4;

async function mount(opts: { rows?: Row[]; tableOptions?: Partial<TableOptionsIf>; columnDefs?: ColumnDefIf[] } = {}) {
  const rows = opts.rows ?? rowsOf();
  const fm = new FocusModel('cell');
  const sm = new SelectionModel('range', 'multi');
  const t = mountTable(TableFactory.createTableModel({ rows, columnDefs: opts.columnDefs ?? columns() }), {
    tableOptions: { getFocusModel: () => fm, getSelectionModel: () => sm, clipboard: true, ...opts.tableOptions },
  });
  await nextFrame();
  t.host.focus();
  const select = (r1: number, c1: number, r2: number, c2: number) => {
    fm.setFocus(r1, c1);
    sm.clear();
    sm.addSelection(new CellRange(r1, c1, r2, c2));
    t.api.repaint();
    t.host.focus();
  };
  const focus = (r: number, c: number) => {
    fm.setFocus(r, c);
    sm.clear();
    t.api.repaint();
    t.host.focus();
  };
  return { ...t, rows, fm, sm, select, focus };
}

function fire(target: EventTarget, type: 'copy' | 'cut' | 'paste', data: Record<string, string> = {}, withData = true) {
  const dt = new DataTransfer();
  for (const [k, v] of Object.entries(data)) dt.setData(k, v);
  const evt = new ClipboardEvent(type, { clipboardData: withData ? dt : null, bubbles: true, cancelable: true });
  target.dispatchEvent(evt);
  return { evt, dt };
}

describe('API copySelection / cutSelection', () => {

  it('writes text and HTML with ClipboardItem; pasting it back pastes the values', async () => {
    const t = await mount();
    const write = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { ...navigator, platform: navigator.platform, clipboard: { write, writeText: vi.fn() } });
    t.select(0, DUE, 1, DUE);
    await t.api.copySelection();
    expect(write).toHaveBeenCalledTimes(1);
    const item = write.mock.calls[0][0][0] as ClipboardItem;
    expect(item.types).toEqual(['text/plain', 'text/html']);
    const text = await (await item.getType('text/plain')).text();
    t.focus(4, DUE);
    t.api.pasteText(text);
    expect(t.rows[4].due).toEqual(new Date(2026, 0, 1, 9, 30)); // the Date itself, not its text
  });

  it('without ClipboardItem (or html: false) writeText; nothing to copy: nothing written', async () => {
    const t = await mount({ tableOptions: { clipboard: { html: false } } });
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { ...navigator, platform: navigator.platform, clipboard: { writeText } });
    t.select(0, NAME, 0, NAME);
    await t.api.cutSelection();
    expect(writeText).toHaveBeenCalledWith('N0');
    expect(t.host.querySelector('.ge-table-cut-range')).not.toBeNull();
    t.api.cancelCut();
    expect(t.host.querySelector('.ge-table-cut-range')).toBeNull();
    t.api.setColumnVisible('name', false);
    writeText.mockClear();
    await t.api.copySelection(); // only a hidden column selected
    expect(writeText).not.toHaveBeenCalled();
  });

  it('without the option: the API creates a service on demand; cancelCut does nothing', async () => {
    const t = await mount({ tableOptions: { clipboard: undefined } });
    expect(t.scope.clipboardService).toBeUndefined();
    t.api.cancelCut();
    t.select(0, NAME, 0, NAME);
    expect(t.api.getSelectionAsText()).toBe('N0');
    expect(t.scope.clipboardService).toBeDefined();
    expect(fire(t.host, 'copy').evt.defaultPrevented).toBe(false); // no listeners
  });
});

describe('own CopyServiceIf, events without data', () => {

  it('an own CopyServiceIf keeps copying the old way (Ctrl+C), pasting works', async () => {
    const own: CopyServiceIf = {
      copyToClipboard: () => Promise.resolve(''),
      createContent: () => Promise.resolve('OWN'),
      copyContent: vi.fn().mockResolvedValue(undefined),
    };
    const host = document.createElement('div');
    host.style.cssText = 'position:relative;width:600px;height:300px';
    document.body.appendChild(host);
    const fm = new FocusModel('cell');
    const rows = rowsOf(3);
    const options: TableOptionsIf = { ...new TableOptions(), getFocusModel: () => fm, clipboard: true };
    const scope = new TableScope(host, TableFactory.createTableModel({ rows, columnDefs: columns() }), new SimpleDomService(),
      options, new EventAdapter(), own);
    scope.firstInit();
    try {
      fm.setFocus(0, NAME);
      host.focus();
      expect(scope.clipboardService!.arm('copy')).toBe(false);
      expect(fire(host, 'copy').evt.defaultPrevented).toBe(false);
      host.dispatchEvent(new KeyboardEvent('keydown', { key: 'c', code: 'KeyC', ctrlKey: true, bubbles: true, cancelable: true }));
      await new Promise(r => setTimeout(r, 0));
      expect(own.copyContent).toHaveBeenCalledWith('OWN');
      fire(host, 'paste', { 'text/plain': 'mine' });
      expect(rows[0].name).toBe('mine');
    } finally {
      scope.getApi().destroy();
      host.remove();
    }
  });

  it('a clipboard event without clipboardData is left alone', async () => {
    const t = await mount();
    t.focus(0, NAME);
    expect(fire(t.host, 'paste', {}, false).evt.defaultPrevented).toBe(false);
  });
});

describe('values', () => {

  it('copyValue "raw": dates as ISO (with time), invalid dates and objects empty, null empty', async () => {
    const rows = rowsOf(4);
    rows[1].due = new Date(2026, 0, 2);
    rows[2].due = new Date(NaN);
    (rows[3] as unknown as { due: unknown }).due = { any: 1 };
    (rows[0] as unknown as { name: null }).name = null;
    const t = await mount({ rows, tableOptions: { clipboard: { copyValue: 'raw' } } });
    t.select(0, NAME, 3, DUE);
    expect(t.api.getSelectionAsText()).toBe('\t2026-01-01T09:30:00\nN1\t2026-01-02\nN2\t\nN3\t');
  });

  it('external text: ISO date into a Date cell keeps the time; TRUE into a boolean cell; editor "number"', async () => {
    const rows = rowsOf(4);
    rows[2].qty = 'text';
    const t = await mount({ rows });
    t.focus(0, DUE);
    t.api.pasteText('2027-05-06\nnot a date');
    expect(t.rows[0].due).toEqual(new Date(2027, 4, 6, 9, 30));
    expect(t.rows[1].due).toBe('not a date');
    t.api.pasteText('false\nTRUE', [0, DONE]);
    expect([t.rows[0].done, t.rows[1].done]).toEqual([false, true]);
    t.api.pasteText('12', [2, QTY]);
    expect(t.rows[2].qty).toBe(12); // editor "number": a number although the cell held text
  });

  it('exported row numbers are copied; select-all paste starts at the first cell', async () => {
    const defs = [new RowNumberColumnDef({ exported: true }) as unknown as ColumnDefIf, ...columns()];
    const t = await mount({ rows: rowsOf(3), columnDefs: defs });
    t.select(0, 0, 1, 2);
    expect(t.api.getSelectionAsText()).toBe('1\t0\tN0\n2\t1\tN1');
    t.sm.selectAll();
    t.api.repaint();
    t.api.pasteText('only');
    expect(t.rows.map(r => r.id)).toEqual([0, 1, 2]);           // read only
    expect(t.rows.map(r => r.name)).toEqual(['only', 'only', 'only']);
  });

  it('a cut over read-only cells leaves them; a filtered-out cut row is not emptied', async () => {
    const t = await mount({ rows: rowsOf(6) });
    t.select(0, ID, 2, NAME);
    const { dt } = fire(t.host, 'cut');
    t.scope.tableOptions.externalFilterFunction = (r: Row) => r.id !== 1;
    t.api.externalFilterChanged();
    await nextFrame();
    t.focus(3, DUE); // display row 3 = id 4
    fire(t.host, 'paste', { 'text/plain': dt.getData('text/plain') });
    expect(t.rows.map(r => r.id)).toEqual([0, 1, 2, 3, 4, 5]);
    // id 1 is filtered out (not emptied); the third cut row was cut off at the last row – it stays (nothing moved)
    expect([t.rows[0].name, t.rows[1].name, t.rows[2].name]).toEqual(['', 'N1', 'N2']);
    expect([t.rows[4].due, t.rows[4].done, t.rows[5].due, t.rows[5].done]).toEqual([0, 'N0', 1, 'N1']); // id 1 (filtered out) is copied, not emptied
  });

  it('an empty table copies nothing; a table without editable cells pastes nothing', async () => {
    const t = await mount({ rows: [] });
    expect(t.api.getSelectionAsText()).toBe('');
    expect(t.api.pasteText('x')).toEqual([]);
  });

  it('the hidden text field is created once and removed on destroy', async () => {
    const t = await mount();
    t.focus(0, NAME);
    expect(t.scope.clipboardService!.arm('paste')).toBe(true);
    expect(t.scope.clipboardService!.arm('copy')).toBe(true);
    expect(t.host.querySelectorAll('.ge-table-clipboard-proxy')).toHaveLength(1);
    t.scope.clipboardService!.destroy();
    expect(t.host.querySelector('.ge-table-clipboard-proxy')).toBeNull();
    expect(CopyService.maxCopyCells).toBe(1_000_000);
  });
});

describe('review fixes (stage 2)', () => {

  it('a cut moves only what arrives: cut off, read-only or invalid targets keep their source', async () => {
    const t = await mount({ rows: rowsOf(6) });
    t.select(0, NAME, 2, NAME);
    let { dt } = fire(t.host, 'cut');
    t.focus(4, NAME); // rows 4, 5 – the third value is cut off
    fire(t.host, 'paste', { 'text/plain': dt.getData('text/plain') });
    expect(t.rows.map(r => r.name)).toEqual(['', '', 'N2', 'N3', 'N0', 'N1']);
    // onto the read-only id column: nothing moves
    t.select(2, NAME, 3, NAME);
    ({ dt } = fire(t.host, 'cut'));
    t.focus(0, ID);
    fire(t.host, 'paste', { 'text/plain': dt.getData('text/plain') });
    expect([t.rows[2].name, t.rows[3].name]).toEqual(['N2', 'N3']);
    // an invalid target keeps its source
    t.scope.tableModel.getColumnDef(QTY)!.validate = (v: unknown) => (v === 'N3' ? 'no' : undefined);
    t.select(2, NAME, 3, NAME);
    ({ dt } = fire(t.host, 'cut'));
    t.focus(2, QTY);
    fire(t.host, 'paste', { 'text/plain': dt.getData('text/plain') });
    expect([t.rows[2].name, t.rows[3].name, t.rows[2].qty, t.rows[3].qty]).toEqual(['', 'N3', 'N2', 3]);
  });

  it('a cut is not tiled over a selected range', async () => {
    const t = await mount();
    t.select(0, NAME, 0, NAME);
    const { dt } = fire(t.host, 'cut');
    t.select(2, NAME, 5, NAME);
    fire(t.host, 'paste', { 'text/plain': dt.getData('text/plain') });
    expect(t.rows.map(r => r.name)).toEqual(['', 'N1', 'N0', 'N3', 'N4', 'N5']);
  });

  it('a large cut (150 000 cells) moves without stack overflow, fast enough', async () => {
    const t = await mount({ rows: rowsOf(150_000) });
    t.select(0, NAME, 149_999, NAME);
    const { dt } = fire(t.host, 'cut');
    t.focus(0, QTY);
    const t0 = performance.now();
    fire(t.host, 'paste', { 'text/plain': dt.getData('text/plain') });
    expect(performance.now() - t0).toBeLessThan(3000);
    expect([t.rows[149_999].name, t.rows[149_999].qty]).toEqual(['', 'N149999']);
  });

  it('a model without row objects: the cut cells are emptied at their places', async () => {
    const t = await mount({ rows: rowsOf(4) });
    const body = t.scope.tableModel.getBodyModel();
    const original = body.getRowByIndex.bind(body);
    t.select(0, NAME, 2, NAME);
    body.getRowByIndex = () => undefined; // like an own AreaModel
    const { dt } = fire(t.host, 'cut');
    body.getRowByIndex = original;
    t.focus(0, QTY);
    fire(t.host, 'paste', { 'text/plain': dt.getData('text/plain') });
    expect(t.rows.map(r => r.name)).toEqual(['', '', '', 'N3']);
  });

  it('batch edit + an internal copy: texts are marked, the commit runs the pipe on texts', async () => {
    const t = await mount({ tableOptions: { batchEdit: true, clipboard: { pasteAddsRows: true, createRow: () => ({ id: -1, name: '', due: '', done: false, qty: 0 }) } } });
    t.scope.tableModel.getColumnDef(NAME)!.editInputPipe = (v: unknown) => String(v).toUpperCase();
    t.select(4, NAME, 5, NAME);
    const { dt } = fire(t.host, 'copy');
    t.focus(5, NAME); // the second value would need a new row – not in a batch edit
    fire(t.host, 'paste', { 'text/plain': dt.getData('text/plain') });
    expect(t.rows).toHaveLength(6);
    expect(t.api.commitBatchEdit()).toBe(true);
    expect(t.rows[5].name).toBe('N4');
  });

  it('copyHeaders: a cut has no header row', async () => {
    const t = await mount({ tableOptions: { clipboard: { copyHeaders: true } } });
    t.select(0, NAME, 1, NAME);
    expect(fire(t.host, 'copy').dt.getData('text/plain')).toBe('Name\nN0\nN1');
    expect(fire(t.host, 'cut').dt.getData('text/plain')).toBe('N0\nN1');
  });

  it('text copy: a Date as ISO date, null and undefined as ""; deselected cells empty', async () => {
    const rows = rowsOf(3);
    (rows[1] as unknown as { name: null }).name = null;
    (rows[2] as unknown as { name: undefined }).name = undefined;
    const t = await mount({ rows });
    t.select(0, NAME, 2, DUE);
    expect(t.api.getSelectionAsText()).toBe('N0\t2026-01-01T09:30:00\n\t2026-01-02T09:30:00\n\t2026-01-03T09:30:00');
    t.sm.removeSelection(new CellRange(1, DUE, 1, DUE)); // Ctrl+click: a deselected cell inside the range
    expect(t.sm.isSelected(1, DUE)).toBe(false);
    expect(t.api.getSelectionAsText().split('\n')[1]).toBe('\t');
  });

  it('a "Loading…" overlay blocks paste and cut (copy works)', async () => {
    const t = await mount();
    t.focus(0, NAME);
    t.api.showLoadingOverlay();
    fire(t.host, 'paste', { 'text/plain': 'x' });
    expect(t.rows[0].name).toBe('N0');
    expect(t.scope.clipboardService!.arm('paste')).toBe(false);
    expect(fire(t.host, 'copy').dt.getData('text/plain')).toBe('N0');
    t.api.hideOverlay();
  });

  it('triggerAction (a menu): the asynchronous clipboard API', async () => {
    const t = await mount();
    const writeText = vi.fn().mockResolvedValue(undefined);
    const readText = vi.fn().mockResolvedValue('menu');
    vi.stubGlobal('navigator', { ...navigator, platform: navigator.platform, clipboard: { writeText, readText } });
    t.focus(0, NAME);
    expect(t.api.triggerAction('COPY_2_CLIPBOARD')).toBe(true);
    await vi.waitFor(() => expect(writeText).toHaveBeenCalledWith('N0'));
    expect(t.api.triggerAction('PASTE_FROM_CLIPBOARD')).toBe(true);
    await vi.waitFor(() => expect(t.rows[0].name).toBe('menu'));
    expect(document.activeElement).not.toBe(t.host.querySelector('.ge-table-clipboard-proxy'));
    readText.mockRejectedValue(new Error('denied'));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    t.api.triggerAction('PASTE_FROM_CLIPBOARD');
    await vi.waitFor(() => expect(warn).toHaveBeenCalled());
    warn.mockRestore();
  });

  it('API cut without the option: another change removes the mark (no stale move)', async () => {
    const t = await mount({ tableOptions: { clipboard: undefined } });
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { ...navigator, platform: navigator.platform, clipboard: { writeText } });
    t.select(0, NAME, 0, NAME);
    await t.api.cutSelection();
    t.api.applyCellChanges([{ rowIndex: 0, column: NAME, value: 'EDITED' }]);
    t.api.pasteText('N0', [3, NAME]);
    expect([t.rows[0].name, t.rows[3].name]).toEqual(['EDITED', 'N0']);
  });

  it('a refused clipboard write leaves no cut mark', async () => {
    const t = await mount();
    vi.stubGlobal('navigator', { ...navigator, platform: navigator.platform, clipboard: { writeText: vi.fn().mockRejectedValue(new Error('no')) } });
    t.select(0, NAME, 0, NAME);
    await expect(t.api.cutSelection()).rejects.toThrow('no');
    expect(t.scope.clipboardService!.isCutMarked()).toBe(false);
    vi.stubGlobal('navigator', { ...navigator, platform: navigator.platform, clipboard: {} });
    await t.api.copySelection(); // no clipboard API at all: nothing happens
  });

  it('a subclass of CopyService keeps the old copy path', async () => {
    class MyCopy extends CopyService {
      override createContent() { return Promise.resolve('MINE'); }
    }
    const copy = new MyCopy();
    const copied = vi.spyOn(copy, 'copyContent').mockResolvedValue(undefined);
    const host = document.createElement('div');
    host.style.cssText = 'position:relative;width:600px;height:300px';
    document.body.appendChild(host);
    const fm = new FocusModel('cell');
    const scope = new TableScope(host, TableFactory.createTableModel({ rows: rowsOf(2), columnDefs: columns() }),
      new SimpleDomService(), { ...new TableOptions(), getFocusModel: () => fm, clipboard: true }, new EventAdapter(), copy);
    scope.firstInit();
    try {
      fm.setFocus(0, NAME);
      host.focus();
      host.dispatchEvent(new KeyboardEvent('keydown', { key: 'c', code: 'KeyC', ctrlKey: true, bubbles: true, cancelable: true }));
      await vi.waitFor(() => expect(copied).toHaveBeenCalledWith('MINE'));
      expect(scope.getApi().triggerAction('COPY_2_CLIPBOARD')).toBe(false); // the old path, not consumed
    } finally {
      scope.getApi().destroy();
      host.remove();
    }
  });

  it('a table in a shadow root: the event at the hidden field is handled, the focus comes back', async () => {
    const outer = document.createElement('div');
    document.body.appendChild(outer);
    const root = outer.attachShadow({ mode: 'open' });
    const host = document.createElement('div');
    host.style.cssText = 'position:relative;width:600px;height:300px';
    root.appendChild(host);
    const fm = new FocusModel('cell');
    const rows = rowsOf(2);
    const scope = new TableScope(host, TableFactory.createTableModel({ rows, columnDefs: columns() }),
      new SimpleDomService(), { ...new TableOptions(), getFocusModel: () => fm, clipboard: true }, new EventAdapter());
    scope.firstInit();
    try {
      fm.setFocus(0, NAME);
      host.focus();
      host.dispatchEvent(new KeyboardEvent('keydown', { key: 'c', code: 'KeyC', ctrlKey: true, bubbles: true, cancelable: true, composed: true }));
      const proxy = host.querySelector<HTMLTextAreaElement>('.ge-table-clipboard-proxy')!;
      expect(root.activeElement).toBe(proxy);
      const dt = new DataTransfer();
      proxy.dispatchEvent(new ClipboardEvent('copy', { clipboardData: dt, bubbles: true, cancelable: true, composed: true }));
      expect(dt.getData('text/plain')).toBe('N0');
      expect(root.activeElement).toBe(host);
      // the Edit menu on the focused table (no hidden field)
      const dt2 = new DataTransfer();
      dt2.setData('text/plain', 'shadow');
      host.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt2, bubbles: true, cancelable: true, composed: true }));
      expect(rows[0].name).toBe('shadow');
    } finally {
      scope.getApi().destroy();
      outer.remove();
    }
  });
});
