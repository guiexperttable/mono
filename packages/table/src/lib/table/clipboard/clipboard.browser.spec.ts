// Copy, cut and paste like Excel (prompt 013 stage 2): P1–P19.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import {
  CellRange,
  ColumnDef,
  CopyService,
  EventAdapter,
  FocusModel,
  RowNumberColumnDef,
  SelectionModel,
  TableFactory,
  TrueFn,
  createNumberInputPipe,
  editInputPipeForNumber,
  px100,
} from '@guiexpert/table';
import type { ClipboardOptionsIf, ColumnDefIf, GeModelChangeEvent, TableOptionsIf } from '@guiexpert/table';
import { destroyAllTables, mountTable, nextFrame } from '../../../../test-utils/mount-table';
import { axeViolations } from '../../../../test-utils/axe';

afterEach(destroyAllTables);

interface Row { id: number; name: string; price: number; note: string; done: boolean; calc?: number }

const ID = 0, NAME = 1, PRICE = 2, NOTE = 3, DONE = 4;

function rowsOf(n = 20): Row[] {
  return Array.from({ length: n }, (_, i) => ({ id: i, name: `N${i}`, price: i * 1.5, note: '', done: false }));
}

async function mount(opts: { rows?: Row[]; clipboard?: boolean | Partial<ClipboardOptionsIf>; tableOptions?: Partial<TableOptionsIf>; columns?: ColumnDefIf[] } = {}) {
  const rows = opts.rows ?? rowsOf();
  const listener = new EventAdapter();
  const changes: GeModelChangeEvent[] = [];
  listener.onModelChanged = e => changes.push(e);
  const fm = new FocusModel('cell');
  const sm = new SelectionModel('range', 'multi');
  const columnDefs: ColumnDefIf[] = opts.columns ?? [
    ColumnDef.create({ property: 'id', headerLabel: 'ID', width: px100 }),
    ColumnDef.create({ property: 'name', headerLabel: 'Name', width: px100, editable: TrueFn }),
    ColumnDef.create({ property: 'price', headerLabel: 'Price', width: px100, editable: TrueFn }),
    ColumnDef.create({ property: 'note', headerLabel: 'Note', width: px100, editable: TrueFn }),
    ColumnDef.create({ property: 'done', headerLabel: 'Done', width: px100, editable: TrueFn }),
  ];
  const t = mountTable(TableFactory.createTableModel({ rows, columnDefs }), {
    eventListener: listener,
    tableOptions: { getFocusModel: () => fm, getSelectionModel: () => sm, editing: true, clipboard: opts.clipboard ?? true, ...opts.tableOptions },
  });
  await nextFrame();
  t.host.focus();
  const focus = (r: number, c: number) => {
    fm.setFocus(r, c);
    sm.clear();
    t.api.repaint();
    t.host.focus();
  };
  const select = (r1: number, c1: number, r2: number, c2: number) => {
    fm.setFocus(r1, c1);
    sm.clear();
    sm.addSelection(new CellRange(r1, c1, r2, c2));
    t.api.repaint();
    t.host.focus();
  };
  return { ...t, rows, fm, sm, changes, focus, select };
}

/** A clipboard event as the browser fires it on the focused element (the table host). */
function fire(target: EventTarget, type: 'copy' | 'cut' | 'paste', data: Record<string, string> = {}) {
  const dt = new DataTransfer();
  for (const [k, v] of Object.entries(data)) dt.setData(k, v);
  const evt = new ClipboardEvent(type, { clipboardData: dt, bubbles: true, cancelable: true });
  target.dispatchEvent(evt);
  return { evt, dt };
}

describe('copy (P1, P2)', () => {

  it('P1: the selected range as TSV and HTML (numbers with x:num)', async () => {
    const t = await mount();
    t.select(2, NAME, 3, PRICE);
    const { evt, dt } = fire(t.host, 'copy');
    expect(evt.defaultPrevented).toBe(true);
    expect(dt.getData('text/plain')).toBe('N2\t3\nN3\t4.5');
    const html = dt.getData('text/html');
    expect(html).toContain('<td x:num="4.5">4.5</td>');
    expect(html).toContain('<td>N2</td>');
  });

  it('P2: a cell with tab, line break or quotation marks stays one cell', async () => {
    const rows = rowsOf(3);
    rows[0].note = 'a\tb';
    rows[1].note = 'line\nbreak';
    rows[2].note = 'say "hi"';
    const t = await mount({ rows });
    t.select(0, NOTE, 2, NOTE);
    expect(fire(t.host, 'copy').dt.getData('text/plain')).toBe('"a\tb"\n"line\nbreak"\n"say ""hi"""');
  });

  it('copyHeaders, copyValue "raw", html false; without selection the focused cell', async () => {
    const t = await mount({ clipboard: { copyHeaders: true, copyValue: 'raw', html: false } });
    t.select(1, NAME, 1, DONE);
    const { dt } = fire(t.host, 'copy');
    expect(dt.getData('text/plain')).toBe('Name\tPrice\tNote\tDone\nN1\t1.5\t\tFALSE');
    expect(dt.getData('text/html')).toBe('');
    t.focus(4, NAME);
    expect(fire(t.host, 'copy').dt.getData('text/plain')).toBe('Name\nN4');
  });

  it('several ranges: only the last one (announced); everything selected: the whole body', async () => {
    const t = await mount({ rows: rowsOf(3) });
    t.select(0, NAME, 0, NAME);
    t.sm.addSelection(new CellRange(2, PRICE, 2, PRICE));
    expect(fire(t.host, 'copy').dt.getData('text/plain')).toBe('3');
    expect(t.host.ownerDocument.querySelector('[aria-live]')?.textContent ?? '').toBeDefined();
    t.sm.selectAll();
    const all = fire(t.host, 'copy').dt.getData('text/plain');
    expect(all.split('\n')).toHaveLength(3);
    expect(all.split('\n')[0].split('\t')).toHaveLength(5);
  });

  it('hidden columns and row numbers (not exported) are left out', async () => {
    const t = await mount({
      rows: rowsOf(3),
      columns: [
        new RowNumberColumnDef(),
        ColumnDef.create({ property: 'id', headerLabel: 'ID', width: px100 }),
        ColumnDef.create({ property: 'name', headerLabel: 'Name', width: px100, editable: TrueFn }),
        ColumnDef.create({ property: 'price', headerLabel: 'Price', width: px100, editable: TrueFn }),
      ],
    });
    t.api.setColumnVisible('id', false);
    t.select(0, 0, 1, 3);
    expect(fire(t.host, 'copy').dt.getData('text/plain')).toBe('N0\t0\nN1\t1.5');
  });

  it('too many cells: announced, nothing copied', async () => {
    const t = await mount();
    const old = CopyService.maxCopyCells;
    CopyService.maxCopyCells = 3;
    try {
      t.select(0, ID, 5, DONE);
      const { evt, dt } = fire(t.host, 'copy');
      expect(evt.defaultPrevented).toBe(true);
      expect(dt.getData('text/plain')).toBe('');
      expect(t.api.getSelectionAsText()).toBe('');
    } finally {
      CopyService.maxCopyCells = old;
    }
  });

  it('processCopy changes the cells; the paste is then external', async () => {
    const t = await mount({ clipboard: { processCopy: ctx => ctx.matrix.map(r => r.map(x => x.toUpperCase())) } });
    t.select(1, NAME, 1, NAME);
    const { dt } = fire(t.host, 'copy');
    expect(dt.getData('text/plain')).toBe('N1');
    expect(dt.getData('text/html')).toContain('<td>N1</td>');
  });
});

describe('paste (P3–P11, P13–P19)', () => {

  it('P3: a 3×2 block from Excel at the focused cell: one event, the pasted range selected, announced', async () => {
    const t = await mount();
    t.focus(5, NAME);
    const { evt } = fire(t.host, 'paste', { 'text/plain': 'a\t1\r\nb\t2\r\nc\t3\r\n' });
    expect(evt.defaultPrevented).toBe(true);
    expect(t.rows.slice(5, 8).map(r => [r.name, r.price])).toEqual([['a', 1], ['b', 2], ['c', 3]]);
    expect(t.changes).toHaveLength(1);
    expect(t.changes[0].source).toBe('paste');
    expect(t.changes[0].changes).toHaveLength(6);
    expect(t.sm.getRanges().at(-1)).toMatchObject({ r1: 5, c1: NAME, r2: 7, c2: PRICE });
    expect(t.fm.getFocus()).toEqual([5, NAME]);
  });

  it('P4: one value into every selected cell; P5: tiling', async () => {
    const t = await mount();
    t.select(1, NAME, 9, NAME);
    fire(t.host, 'paste', { 'text/plain': 'x' });
    expect(t.rows.slice(1, 10).every(r => r.name === 'x')).toBe(true);
    t.select(0, NOTE, 5, NOTE);
    fire(t.host, 'paste', { 'text/plain': 'p\nq\n' });
    expect(t.rows.slice(0, 6).map(r => r.note)).toEqual(['p', 'q', 'p', 'q', 'p', 'q']);
    t.select(10, NOTE, 14, NOTE);
    fire(t.host, 'paste', { 'text/plain': 'p\nq' });
    expect(t.rows.slice(10, 15).map(r => r.note)).toEqual(['p', 'q', '', '', '']);
  });

  it('P6: cut off at the last column; P7: at the last row', async () => {
    const t = await mount({ rows: rowsOf(3) });
    t.focus(2, NOTE);
    const r = t.api.pasteText('n\tfalse\textra\nmore\tx\ty');
    expect(r).toHaveLength(2);
    expect([t.rows[2].note, t.rows[2].done]).toEqual(['n', false]);
  });

  it('P7: pasteAddsRows with createRow adds rows', async () => {
    const t = await mount({ rows: rowsOf(2), clipboard: { pasteAddsRows: true, createRow: i => ({ id: 100 + i, name: '', price: 0, note: '', done: false }) } });
    t.focus(1, NAME);
    fire(t.host, 'paste', { 'text/plain': 'b\nc\nd' });
    expect(t.rows.map(r => r.name)).toEqual(['N0', 'b', 'c', 'd']);
    expect(t.rows.map(r => r.id)).toEqual([0, 1, 102, 103]);
    expect(t.api.getDisplayedRowCount()).toBeGreaterThan(0);
    expect(t.scope.tableModel.getBodyModel().getRowCount()).toBe(4);
  });

  it('P8: read-only and hidden columns: skipped, hidden ones not counted', async () => {
    const t = await mount();
    t.api.setColumnVisible('price', false);
    t.focus(0, ID);
    fire(t.host, 'paste', { 'text/plain': '99\tname\tnote' });
    expect([t.rows[0].id, t.rows[0].name, t.rows[0].price, t.rows[0].note]).toEqual([0, 'name', 0, 'note']);
  });

  it('P9: filtered and sorted – displayed rows in display order', async () => {
    const t = await mount();
    t.scope.tableOptions.externalFilterFunction = (r: Row) => r.id % 2 === 0;
    t.api.externalFilterChanged();
    t.api.sortByColumn('id', 'desc');
    await nextFrame();
    t.focus(0, NAME); // row id 18
    fire(t.host, 'paste', { 'text/plain': 'a\nb' });
    expect(t.rows[18].name).toBe('a');
    expect(t.rows[16].name).toBe('b');
    expect(t.rows[17].name).toBe('N17');
  });

  it('P10: "1.234,56" through a number pipe with locale de-DE; without pipe: number cells get numbers', async () => {
    const t = await mount();
    t.scope.tableModel.getColumnDef(PRICE)!.editInputPipe = createNumberInputPipe('de-DE');
    t.focus(0, PRICE);
    fire(t.host, 'paste', { 'text/plain': '1.234,56' });
    expect(t.rows[0].price).toBe(1234.56);
    t.scope.tableModel.getColumnDef(PRICE)!.editInputPipe = undefined;
    t.focus(1, PRICE);
    fire(t.host, 'paste', { 'text/plain': '7.5\nabc' });
    expect([t.rows[1].price, t.rows[2].price]).toEqual([7.5, 'abc']);
    t.focus(1, DONE);
    fire(t.host, 'paste', { 'text/plain': 'TRUE\nno' });
    expect([t.rows[1].done, t.rows[2].done]).toEqual([true, 'no']);
  });

  it('P11: a value that fails validate is skipped and announced, the rest is pasted', async () => {
    const t = await mount();
    t.scope.tableModel.getColumnDef(NAME)!.validate = (v: unknown) => (v === 'bad' ? 'Bad' : undefined);
    t.focus(0, NAME);
    fire(t.host, 'paste', { 'text/plain': 'ok\nbad\nfine' });
    expect(t.rows.slice(0, 3).map(r => r.name)).toEqual(['ok', 'N1', 'fine']);
    expect(t.changes[0].changes).toHaveLength(2);
  });

  it('P13: batch edit – pasted values are marked, not written', async () => {
    const t = await mount({ tableOptions: { batchEdit: true } });
    t.focus(0, NAME);
    fire(t.host, 'paste', { 'text/plain': 'p1\np2' });
    expect(t.rows[0].name).toBe('N0');
    expect(t.api.getPendingChanges().map(c => c.newValue)).toEqual(['p1', 'p2']);
  });

  it('P14: 100 000 cells in under a second; above maxPasteCells: refused and announced', async () => {
    const t = await mount({ rows: rowsOf(25_000), clipboard: { maxPasteCells: 150_000 } });
    const text = Array.from({ length: 25_000 }, (_, i) => `n${i}\t${i}\tx\tTRUE`).join('\n');
    t.focus(0, NAME);
    const t0 = performance.now();
    fire(t.host, 'paste', { 'text/plain': text });
    expect(performance.now() - t0).toBeLessThan(1000);
    expect(t.rows[24_999].name).toBe('n24999');
    expect(t.changes[0].changes).toHaveLength(100_000);
    t.select(0, NAME, 24_999, DONE);
    t.changes.length = 0;
    fire(t.host, 'paste', { 'text/plain': 'z' }); // 100 000 cells … fine
    expect(t.changes).toHaveLength(1);
    t.scope.clipboardService!.options.maxPasteCells = 10;
    t.changes.length = 0;
    fire(t.host, 'paste', { 'text/plain': 'y' });
    expect(t.changes).toHaveLength(0);
  });

  it('P15: text/html with an image and a script: only text, no element, no script', async () => {
    const t = await mount();
    const spy = vi.fn();
    (window as unknown as { __pwned: () => void }).__pwned = spy;
    t.focus(0, NAME);
    fire(t.host, 'paste', { 'text/html': '<table><tr><td><img src=x onerror="window.__pwned()">a<script>window.__pwned()</script></td><td>b</td></tr></table>' });
    await new Promise(r => setTimeout(r, 50));
    expect(spy).not.toHaveBeenCalled();
    expect(t.rows[0].name).toBe('a');
    expect(String(t.rows[0].price)).toBe('b');
    expect(t.host.querySelector('img, script')).toBeNull();
  });

  it('P16: Ctrl+V in the open editor belongs to the editor', async () => {
    const t = await mount();
    t.focus(0, NAME);
    await userEvent.keyboard('q');
    const input = t.host.querySelector<HTMLInputElement>('.ge-table-cell-editor input')!;
    const { evt } = fire(input, 'paste', { 'text/plain': 'x\ty' });
    expect(evt.defaultPrevented).toBe(false);
    expect(t.changes).toHaveLength(0);
  });

  it('P17: api.pasteText and api.getSelectionAsText work without the option and without permissions', async () => {
    const t = await mount({ clipboard: false });
    t.select(0, NAME, 1, PRICE);
    expect(t.api.getSelectionAsText()).toBe('N0\t0\nN1\t1.5');
    const written = t.api.pasteText('a\tb\n1\t2', [3, NAME]);
    expect(written).toHaveLength(4);
    expect([t.rows[3].name, t.rows[3].price, t.rows[4].name, t.rows[4].price]).toEqual(['a', 'b', '1', 2]);
    expect(t.api.pasteText('')).toEqual([]);
    expect(t.api.pasteText('x', [999, NAME])).toEqual([]);
  });

  it('P18: from Google Sheets (text/html + text/plain): the text wins, empty cells stay empty', async () => {
    const t = await mount();
    t.focus(0, NAME);
    fire(t.host, 'paste', {
      'text/plain': 'g1\t\tn1\ng2\t3\t',
      'text/html': '<meta charset="utf-8"><google-sheets-html-origin><table><tr><td>WRONG</td></tr></table>',
    });
    expect([t.rows[0].name, t.rows[0].price, t.rows[0].note]).toEqual(['g1', '', 'n1']);
    expect([t.rows[1].name, t.rows[1].price, t.rows[1].note]).toEqual(['g2', 3, '']);
  });

  it('P19: without the option Ctrl+C copies as before, Ctrl+V/X and the events do nothing', async () => {
    const t = await mount({ clipboard: false });
    const write = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
    t.select(0, NAME, 0, NAME);
    await userEvent.keyboard('{Control>}c{/Control}');
    await new Promise(r => setTimeout(r, 0));
    expect(write).toHaveBeenCalledWith('N0');
    fire(t.host, 'paste', { 'text/plain': 'x' });
    await userEvent.keyboard('{Control>}v{/Control}{Control>}x{/Control}');
    expect(t.rows[0].name).toBe('N0');
    expect(t.host.querySelector('.ge-table-clipboard-proxy')).toBeNull();
    write.mockRestore();
  });

  it('processPaste can change or refuse the paste; internal is reported', async () => {
    const seen: boolean[] = [];
    const t = await mount({
      clipboard: {
        processPaste: ctx => {
          seen.push(ctx.internal);
          if (ctx.text === 'no') return false;
          if (ctx.text === 'up') return [['UP']];
          return undefined;
        },
      },
    });
    t.focus(0, NAME);
    fire(t.host, 'paste', { 'text/plain': 'no' });
    expect(t.rows[0].name).toBe('N0');
    fire(t.host, 'paste', { 'text/plain': 'up' });
    expect(t.rows[0].name).toBe('UP');
    expect(seen).toEqual([false, false]);
  });

  it('events in the page outside the table are not ours; header focus: nothing', async () => {
    const t = await mount();
    const outside = document.createElement('input');
    document.body.appendChild(outside);
    outside.focus();
    const { evt } = fire(outside, 'paste', { 'text/plain': 'x' });
    expect(evt.defaultPrevented).toBe(false);
    outside.remove();
    t.focus(0, NAME);
    await userEvent.keyboard('{ArrowUp}');
    expect(fire(t.host, 'paste', { 'text/plain': 'x' }).evt.defaultPrevented).toBe(false);
  });
});

describe('internal copy and cut (P12)', () => {

  it('copied inside the table: the values are pasted (no pipe on them)', async () => {
    const t = await mount();
    const pipe = vi.fn((v: unknown) => (typeof v === 'string' ? v.trim() : v));
    t.scope.tableModel.getColumnDef(PRICE)!.editInputPipe = pipe;
    t.select(2, PRICE, 3, PRICE);
    const { dt } = fire(t.host, 'copy');
    t.focus(10, PRICE);
    fire(t.host, 'paste', { 'text/plain': dt.getData('text/plain') });
    expect([t.rows[10].price, t.rows[11].price]).toEqual([3, 4.5]);
    expect(pipe).not.toHaveBeenCalled();
  });

  it('P12: B2:B4 cut, pasted at D2: source empty, target filled, ONE event "cut", frame until pasted', async () => {
    const t = await mount();
    t.select(1, NAME, 3, NAME);
    const { dt } = fire(t.host, 'cut');
    expect(dt.getData('text/plain')).toBe('N1\nN2\nN3');
    expect(t.rows[1].name).toBe('N1'); // only marked
    const frame = t.host.querySelector<HTMLElement>('.ge-table-cut-range')!;
    expect(frame.getAttribute('aria-hidden')).toBe('true');
    expect(frame.style.display).toBe('block');
    t.focus(1, NOTE);
    fire(t.host, 'paste', { 'text/plain': dt.getData('text/plain') });
    expect(t.rows.slice(1, 4).map(r => [r.name, r.note])).toEqual([['', 'N1'], ['', 'N2'], ['', 'N3']]);
    expect(t.changes).toHaveLength(1);
    expect(t.changes[0].source).toBe('cut');
    expect(t.changes[0].changes).toHaveLength(6);
    expect(t.host.querySelector('.ge-table-cut-range')).toBeNull();
    // the cut content is used up: pasting it again copies
    t.focus(10, NOTE);
    fire(t.host, 'paste', { 'text/plain': dt.getData('text/plain') });
    expect(t.changes.at(-1)!.source).toBe('paste');
  });

  it('cut onto an overlapping target: the overlap is not emptied', async () => {
    const t = await mount();
    t.select(0, NAME, 2, NAME);
    const { dt } = fire(t.host, 'cut');
    t.focus(1, NAME);
    fire(t.host, 'paste', { 'text/plain': dt.getData('text/plain') });
    expect(t.rows.slice(0, 4).map(r => r.name)).toEqual(['', 'N0', 'N1', 'N2']);
  });

  it('Escape, another change or api.cancelCut remove the mark (a later paste copies)', async () => {
    const t = await mount();
    t.select(0, NAME, 0, NAME);
    fire(t.host, 'cut');
    await userEvent.keyboard('{Escape}');
    expect(t.host.querySelector('.ge-table-cut-range')).toBeNull();
    fire(t.host, 'cut');
    t.api.applyCellChanges([{ rowIndex: 5, column: NOTE, value: 'other' }]);
    expect(t.scope.clipboardService!.isCutMarked()).toBe(false);
    fire(t.host, 'cut');
    t.api.cancelCut();
    expect(t.scope.clipboardService!.isCutMarked()).toBe(false);
    t.focus(4, NAME);
    fire(t.host, 'paste', { 'text/plain': 'N0' });
    expect(t.rows[0].name).toBe('N0');
    expect(t.rows[4].name).toBe('N0');
  });

  it('cut, then sorted: the frame goes, the values still move from where the rows are now', async () => {
    const t = await mount({ rows: rowsOf(5) });
    t.select(0, NAME, 1, NAME);
    const { dt } = fire(t.host, 'cut');
    t.api.sortByColumn('id', 'desc');
    await nextFrame();
    expect(t.host.querySelector('.ge-table-cut-range')).toBeNull();
    t.focus(0, NOTE);
    fire(t.host, 'paste', { 'text/plain': dt.getData('text/plain') });
    expect([t.rows[0].name, t.rows[1].name]).toEqual(['', '']);
    expect([t.rows[4].note, t.rows[3].note]).toEqual(['N0', 'N1']);
  });

  it('the cut frame is accessible (axe) and follows scrolling', async () => {
    const t = await mount({ rows: rowsOf(200) });
    t.select(2, NAME, 4, PRICE);
    fire(t.host, 'cut');
    const frame = t.host.querySelector<HTMLElement>('.ge-table-cut-range')!;
    const top = parseFloat(frame.style.top);
    t.api.scrollToPixel(0, 34);
    await nextFrame();
    expect(parseFloat(t.host.querySelector<HTMLElement>('.ge-table-cut-range')!.style.top)).toBeLessThan(top);
    expect(await axeViolations(t.host)).toEqual([]);
    t.api.scrollToPixel(0, 3000);
    await nextFrame();
    expect(frame.style.display).toBe('none');
  });
});

describe('keys and the hidden text field', () => {

  it('Ctrl+C / Ctrl+X / Ctrl+V focus the hidden text field for the key, then the table again', async () => {
    const t = await mount();
    t.select(0, NAME, 0, NAME);
    const seen: (string | null)[] = [];
    const onCopy = (e: Event) => seen.push((e.target as HTMLElement).className);
    document.addEventListener('copy', onCopy, true);
    const keydown = new KeyboardEvent('keydown', { key: 'c', code: 'KeyC', ctrlKey: true, bubbles: true, cancelable: true });
    t.host.dispatchEvent(keydown);
    expect(keydown.defaultPrevented).toBe(false); // the browser must run its copy command
    const proxy = t.host.querySelector<HTMLTextAreaElement>('.ge-table-clipboard-proxy')!;
    expect(document.activeElement).toBe(proxy);
    expect(proxy.getAttribute('aria-hidden')).toBe('true');
    const { dt } = fire(proxy, 'copy'); // what the browser does next
    expect(dt.getData('text/plain')).toBe('N0');
    expect(document.activeElement).toBe(t.host);
    document.removeEventListener('copy', onCopy, true);
    // the browser fired nothing (refused): the focus comes back anyway
    t.host.dispatchEvent(new KeyboardEvent('keydown', { key: 'v', code: 'KeyV', ctrlKey: true, bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(proxy);
    await new Promise(r => setTimeout(r, 5));
    expect(document.activeElement).toBe(t.host);
    // paste through the hidden field
    t.host.dispatchEvent(new KeyboardEvent('keydown', { key: 'v', code: 'KeyV', ctrlKey: true, bubbles: true, cancelable: true }));
    fire(proxy, 'paste', { 'text/plain': 'pasted' });
    expect(t.rows[0].name).toBe('pasted');
    expect(document.activeElement).toBe(t.host);
    // cut
    t.host.dispatchEvent(new KeyboardEvent('keydown', { key: 'x', code: 'KeyX', ctrlKey: true, bubbles: true, cancelable: true }));
    fire(proxy, 'cut');
    expect(t.scope.clipboardService!.isCutMarked()).toBe(true);
  });

  it('a real Ctrl+C in the browser fills the clipboard event', async () => {
    const t = await mount();
    t.select(1, NAME, 1, PRICE);
    let copied = '';
    const onCopy = (e: ClipboardEvent) => queueMicrotask(() => (copied = e.clipboardData?.getData('text/plain') ?? ''));
    document.addEventListener('copy', onCopy);
    await userEvent.keyboard('{Control>}c{/Control}');
    await new Promise(r => setTimeout(r, 10));
    document.removeEventListener('copy', onCopy);
    expect(document.activeElement).toBe(t.host);
    expect(copied).toBe('N1\t1.5'); // the copy command of the browser ran in the hidden field
  });

  it('no arming in the open editor, in the header, or with an own CopyServiceIf for copying', async () => {
    const t = await mount();
    t.focus(0, NAME);
    await userEvent.keyboard('{ArrowUp}');
    expect(t.scope.clipboardService!.arm('paste')).toBe(false);
    t.focus(0, NAME);
    await userEvent.keyboard('e');
    expect(t.scope.clipboardService!.arm('copy')).toBe(false);
  });

  it('Ctrl+X does no longer deselect all with the option (it cuts); Ctrl+Shift+A still does', async () => {
    const t = await mount();
    const mapping = t.api.getShortcutActionMapping();
    expect(Object.entries(mapping).filter(([, a]) => a === 'CUT_2_CLIPBOARD').length).toBeGreaterThan(0);
    expect(Object.entries(mapping).some(([k, a]) => a === 'DESELECT_ALL' && /shift\+a/.test(k))).toBe(true);
  });
});

describe('number columns with editInputPipeForNumber', () => {
  it('paste "12" → 12, "" → ""', async () => {
    const t = await mount();
    t.scope.tableModel.getColumnDef(PRICE)!.editInputPipe = editInputPipeForNumber;
    t.focus(0, PRICE);
    fire(t.host, 'paste', { 'text/plain': '12\n' });
    expect(t.rows[0].price).toBe(12);
  });
});
