// Formula input in the cell editor (prompt 013 stage 6): S13–S16 – pointing, F4, colored references, suggestions.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { ColumnDef, EventAdapter, FocusModel, SelectionModel, TableFactory, TrueFn, px100 } from '@guiexpert/table';
import type { CellFormulaOptionsIf, GeEditEvent, TableOptionsIf } from '@guiexpert/table';
import { destroyAllTables, getCellDiv, mountTable, nextFrame } from '../../../../test-utils/mount-table';
import { axeViolations } from '../../../../test-utils/axe';

afterEach(destroyAllTables);

interface Row { product: string; price: unknown; qty: unknown; total: unknown; note?: unknown }
const PRICE = 1, QTY = 2, TOTAL = 3, NOTE = 4;

function rows(): Row[] {
  return [
    { product: 'Product', price: 'Price', qty: 'Qty', total: 'Total', note: '' },
    { product: 'Laptop', price: 1299, qty: 2, total: '=B2*C2', note: '' },
    { product: 'Monitor', price: 349, qty: 3, total: '=B3*C3', note: '' },
    { product: 'Mouse', price: 25, qty: 10, total: '=B4*C4', note: '' },
    { product: '', price: null, qty: null, total: '=SUM(D2:D4)', note: '' },
  ];
}

async function mount(opts: { cellFormulas?: boolean | Partial<CellFormulaOptionsIf>; tableOptions?: Partial<TableOptionsIf>; rowNumbers?: boolean } = {}) {
  const data = rows();
  const fm = new FocusModel('cell');
  const sm = new SelectionModel('range', 'multi');
  const listener = new EventAdapter();
  const edits: GeEditEvent[] = [];
  listener.onEditingChanged = e => edits.push(e);
  const t = mountTable(TableFactory.createTableModel({
    rows: data,
    rowNumbersVisible: !!opts.rowNumbers,
    columnDefs: (['product', 'price', 'qty', 'total', 'note'] as const).map(property =>
      ColumnDef.create({ property, headerLabel: property, width: px100, editable: TrueFn })),
  }), {
    eventListener: listener,
    tableOptions: {
      getFocusModel: () => fm, getSelectionModel: () => sm, editing: true, undo: true,
      cellFormulas: opts.cellFormulas ?? true, ...opts.tableOptions,
    },
  });
  await nextFrame();
  const focus = (r: number, c: number) => {
    fm.setFocus(r, c);
    t.api.repaint();
    t.host.focus();
  };
  const input = () => t.host.querySelector<HTMLInputElement>('.ge-table-cell-editor input')!;
  return { ...t, rows: data, fm, sm, focus, input, edits };
}

describe('formula input', () => {

  it('S14: = and arrow keys insert a reference, Shift+arrows span a range, F4 makes it absolute', async () => {
    const t = await mount();
    t.focus(1, NOTE);
    await userEvent.keyboard('=');
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}{ArrowLeft}'); // E2 → B2
    expect(t.input().value).toBe('=B2');
    await userEvent.keyboard('{Shift>}{ArrowDown}{ArrowDown}{/Shift}');
    expect(t.input().value).toBe('=B2:B4');
    await userEvent.keyboard('{F4}');
    expect(t.input().value).toBe('=$B$2:$B$4');
    expect(t.edits.at(-1)).toMatchObject({ type: 'input', input: '=$B$2:$B$4' });
    await userEvent.keyboard('*2'); // any other key ends pointing: the arrow keys commit again
    await userEvent.keyboard('{ArrowDown}');
    expect(t.rows[1].note).toBe('=$B$2:$B$4*2');
    expect(t.fm.getFocus()).toEqual([2, NOTE]);
  });

  it('S14: a click on a cell inserts its reference (no commit), dragging spans a range', async () => {
    const t = await mount();
    t.focus(4, NOTE);
    await userEvent.keyboard('=SUM(');
    const b2 = getCellDiv(t.host, 'body', 'center', 1, PRICE);
    const rect = b2.getBoundingClientRect();
    b2.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: rect.left + 5, clientY: rect.top + 5, pointerId: 1 }));
    expect(t.input().value).toBe('=SUM(B2');
    const b4 = getCellDiv(t.host, 'body', 'center', 3, QTY).getBoundingClientRect();
    document.dispatchEvent(new PointerEvent('pointermove', { clientX: b4.left + 5, clientY: b4.top + 5, pointerId: 1 }));
    expect(t.input().value).toBe('=SUM(B2:C4');
    document.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1 }));
    document.dispatchEvent(new PointerEvent('pointermove', { clientX: rect.left + 5, clientY: rect.top + 5, pointerId: 1 }));
    expect(t.input().value).toBe('=SUM(B2:C4'); // the drag ended
    expect(t.api.isEditing()).toBe(true);
    await userEvent.keyboard('){Enter}');
    expect(t.api.getCellValue(4, NOTE)).toBe(1299 + 349 + 25 + 2 + 3 + 10);
    // not at an insertion point: a click commits as before
    t.focus(1, NOTE);
    await userEvent.keyboard('=1+B2');
    getCellDiv(t.host, 'body', 'center', 1, PRICE).dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: rect.left + 5, clientY: rect.top + 5, pointerId: 1 }));
    expect(t.rows[1].note).toBe('=1+B2');
  });

  it('S15: three references in three colors – text and frames', async () => {
    const t = await mount();
    t.focus(1, NOTE);
    await userEvent.keyboard('=B2+C3*B2-D4:D5');
    await nextFrame();
    const mirror = t.host.querySelector('.ge-table-formula-mirror')!;
    const spans = [...mirror.querySelectorAll('span span')].map(s => [s.textContent, s.className]);
    expect(spans).toEqual([
      ['B2', 'ge-table-formula-ref-text-0'], ['C3', 'ge-table-formula-ref-text-1'], ['B2', 'ge-table-formula-ref-text-0'],
      ['D4:D5', 'ge-table-formula-ref-text-2'],
    ]);
    expect(mirror.textContent).toBe('=B2+C3*B2-D4:D5');
    expect(t.input().classList.contains('ge-table-formula-input')).toBe(true);
    const frames = [...t.host.querySelectorAll<HTMLElement>('.ge-table-formula-ref')];
    expect(frames.map(f => f.className)).toEqual([
      'ge-table-formula-ref ge-table-formula-ref-0', 'ge-table-formula-ref ge-table-formula-ref-1',
      'ge-table-formula-ref ge-table-formula-ref-2',
    ]);
    const b2 = getCellDiv(t.host, 'body', 'center', 1, PRICE).getBoundingClientRect();
    const frame = frames[0].getBoundingClientRect();
    const b2Host = t.scope.getBodyCellRectInHost(1, PRICE);
    expect([frames[0].style.left, frames[0].style.top, frames[0].style.width]).toEqual([`${b2Host.left}px`, `${b2Host.top}px`, `${b2Host.width}px`]);
    void frame;
    expect(frames.every(f => f.getAttribute('aria-hidden') === 'true')).toBe(true);
    expect(parseFloat(frames[2].style.height)).toBe(b2Host.height * 2); // D4:D5
    // text: no colors; Escape removes everything
    await userEvent.keyboard('{Escape}');
    expect(t.host.querySelector('.ge-table-formula-mirror')).toBeNull();
    expect(t.host.querySelectorAll('.ge-table-formula-ref')).toHaveLength(0);
  });

  it('S16: =SU shows SUBSTITUTE, SUM, SUMIF …; Tab takes SUM(; the hint shows the arguments', async () => {
    const t = await mount();
    t.focus(1, NOTE);
    await userEvent.keyboard('=SU');
    const input = t.input();
    const list = t.host.querySelector<HTMLElement>('.ge-table-formula-list')!;
    const names = [...list.querySelectorAll('.ge-table-formula-option-name')].map(n => n.textContent);
    expect(names.slice(0, 3)).toEqual(['SUBSTITUTE', 'SUM', 'SUMIF']);
    expect(input.getAttribute('role')).toBe('combobox');
    expect(input.getAttribute('aria-expanded')).toBe('true');
    expect(input.getAttribute('aria-controls')).toBe(list.id);
    expect(list.getAttribute('role')).toBe('listbox');
    expect(input.getAttribute('aria-activedescendant')).toBe(list.children[0].id);
    await userEvent.keyboard('{ArrowDown}');
    expect(input.getAttribute('aria-activedescendant')).toBe(list.children[1].id);
    expect(list.children[1].getAttribute('aria-selected')).toBe('true');
    await userEvent.keyboard('{Tab}');
    expect(input.value).toBe('=SUM(');
    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(t.api.isEditing()).toBe(true);
    const hint = t.host.querySelector<HTMLElement>('.ge-table-formula-hint')!;
    expect(hint.textContent).toBe('SUM(number1, [number2], …)');
    expect(hint.querySelector('b')?.textContent).toBe('number1');
    expect(input.getAttribute('aria-describedby')).toBe(hint.id);
    await userEvent.keyboard('1,2,');
    expect(hint.querySelector('b')?.textContent).toBe('[number2]'); // variadic: the last named argument
    expect(await axeViolations(t.host)).toEqual([]);
    expect(t.host.querySelector(`[aria-owns~="${hint.id}"]`)?.getAttribute('role')).toBe('gridcell');
    // Escape closes the list first, the second Escape cancels
    await userEvent.keyboard('3)+IF');
    expect(list.style.display).toBe('');
    await userEvent.keyboard('{Escape}');
    expect(list.style.display).toBe('none');
    expect(t.api.isEditing()).toBe(true);
    await userEvent.keyboard('{Escape}');
    expect(t.api.isEditing()).toBe(false);
  });

  it('a suggestion by click; Enter takes it; own functions are listed', async () => {
    const t = await mount({ cellFormulas: { functions: { SUMMIT: () => 42 } } });
    t.focus(1, NOTE);
    await userEvent.keyboard('=summ');
    const list = t.host.querySelector<HTMLElement>('.ge-table-formula-list')!;
    expect([...list.querySelectorAll('.ge-table-formula-option-name')].map(n => n.textContent)).toEqual(['SUMMIT']);
    list.children[0].dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    expect(t.input().value).toBe('=SUMMIT(');
    await userEvent.keyboard('{Backspace}{Backspace}');
    expect(t.input().value).toBe('=SUMMI');
    await userEvent.keyboard('{Enter}');
    expect(t.input().value).toBe('=SUMMIT(');
    await userEvent.keyboard('){Enter}');
    expect(t.api.getCellValue(1, NOTE)).toBe(42);
  });

  it('a syntax error is stored and announced; rejectInvalidFormulas keeps the editor open (aria-invalid)', async () => {
    const t = await mount();
    const announce = vi.spyOn(t.scope, 'announce');
    t.focus(1, NOTE);
    await userEvent.keyboard('=SUM({Enter}');
    expect(t.rows[1].note).toBe('=SUM(');
    expect(announce).toHaveBeenCalledWith(expect.stringContaining('Formula error'));
    const r = await mount({ cellFormulas: { rejectInvalidFormulas: true } });
    r.focus(1, NOTE);
    await userEvent.keyboard('=1+{Enter}');
    expect(r.api.isEditing()).toBe(true);
    expect(r.input().getAttribute('aria-invalid')).toBe('true');
    expect(r.rows[1].note).toBe('');
  });

  it('S13: F2 on a formula – edit mode: arrow keys move the caret; F2 toggles to pointing', async () => {
    const t = await mount();
    t.focus(1, TOTAL);
    await userEvent.keyboard('{F2}');
    expect(t.input().value).toBe('=B2*C2');
    await userEvent.keyboard('{ArrowLeft}');
    expect(t.input().value).toBe('=B2*C2');
    expect(t.input().selectionStart).toBe(5);
    await userEvent.keyboard('{End}+');
    await userEvent.keyboard('{F2}{ArrowDown}'); // now "enter" mode at an insertion point
    expect(t.input().value).toBe('=B2*C2+D3');
    await userEvent.keyboard('{Escape}');
    expect(t.rows[1].total).toBe('=B2*C2');
  });

  it('right-to-left: the arrow keys point in reading direction', async () => {
    const t = await mount({ tableOptions: { direction: 'rtl' } });
    t.focus(0, PRICE);
    await userEvent.keyboard('={ArrowUp}{ArrowLeft}'); // rtl: ← goes forward (to C)
    expect(t.input().value).toBe('=C1');
    await userEvent.keyboard('{Escape}');
  });

  it('no assist without cellFormulas or in a column without formulas', async () => {
    const t = await mount({ cellFormulas: false });
    t.focus(1, NOTE);
    await userEvent.keyboard('=');
    expect(t.host.querySelector('.ge-table-formula-mirror')).toBeNull();
    await userEvent.keyboard('{ArrowDown}'); // commits as before
    expect(t.rows[1].note).toBe('=');
    const c = await mount({ cellFormulas: { columns: ['total'] } });
    c.focus(1, NOTE);
    await userEvent.keyboard('=');
    expect(c.host.querySelector('.ge-table-formula-mirror')).toBeNull();
  });

  it('edge cases: text without =, composition, list keys, Shift+click, F4 without reference, selection', async () => {
    const t = await mount({ rowNumbers: true, tableOptions: { ariaTexts: { functionSuggestions: () => 'Funktionen' } } });
    const N = 1; // the row number column comes first
    t.focus(1, NOTE + N);
    await userEvent.keyboard('ab{F4}');
    expect(t.input().value).toBe('ab');
    await userEvent.keyboard('{Escape}');
    t.focus(1, NOTE + N);
    await userEvent.keyboard('=');
    const input = t.input();
    expect(input.getAttribute('role')).toBe('combobox');
    await userEvent.keyboard('{Backspace}x');
    expect(input.getAttribute('role')).toBe('combobox'); // for the whole session
    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(t.host.querySelector<HTMLElement>('.ge-table-formula-mirror')!.style.display).toBe('none');
    await userEvent.keyboard('{Backspace}=');
    input.dispatchEvent(new CompositionEvent('compositionstart'));
    expect(input.classList.contains('ge-table-formula-input')).toBe(false);
    input.dispatchEvent(new CompositionEvent('compositionend'));
    expect(input.classList.contains('ge-table-formula-input')).toBe(true);
    // F4 without a reference, then pointing to the start of the row: the row numbers are no data column
    await userEvent.keyboard('{F4}');
    expect(input.value).toBe('=');
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}');
    expect(input.value).toBe('=A2');
    await userEvent.keyboard('{F4}{F4}');
    expect(input.value).toBe('=A$2');
    await userEvent.keyboard('{ArrowRight}'); // still pointing: replaces the reference
    expect(input.value).toBe('=B2');
    // a click on a row number inserts nothing (and commits)
    const list = t.host.querySelector<HTMLElement>('.ge-table-formula-list')!;
    expect(list.getAttribute('aria-label')).toBe('Funktionen');
    await userEvent.keyboard('+i');
    await userEvent.keyboard('{ArrowUp}');
    expect(input.getAttribute('aria-activedescendant')).toBe(list.children[list.children.length - 1].id);
    list.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); // not on an option
    expect(input.value).toBe('=B2+i');
    await userEvent.keyboard('{Shift>}{Enter}{/Shift}'); // Shift+Enter: commits upwards, not the suggestion
    expect(t.rows[1].note).toBe('=B2+i');
    // Shift+click spans from the last pointed cell; a click on a row number or the same cell twice
    t.focus(4, NOTE + N);
    await userEvent.keyboard('=');
    const cellAt = (r: number, c: number) => getCellDiv(t.host, 'body', c === 0 ? 'west' : 'center', r, c);
    const down = (el: HTMLElement, shiftKey = false) => {
      const rect = el.getBoundingClientRect();
      el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, shiftKey, clientX: rect.left + 3, clientY: rect.top + 3, pointerId: 1 }));
      document.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1 }));
    };
    down(cellAt(1, PRICE + N));
    down(cellAt(2, QTY + N), true);
    expect(t.input().value).toBe('=B2:C3');
    const before = t.input().value;
    const rect = cellAt(1, PRICE + N).getBoundingClientRect();
    cellAt(1, PRICE + N).dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: rect.left + 3, clientY: rect.top + 3, pointerId: 1 }));
    const rn = t.host.querySelector<HTMLElement>('.ge-table-row-number')!.getBoundingClientRect();
    document.dispatchEvent(new PointerEvent('pointermove', { clientX: rn.left + 3, clientY: rect.top + 3, pointerId: 1 }));
    document.dispatchEvent(new PointerEvent('pointermove', { clientX: rect.left + 3, clientY: rect.top + 3, pointerId: 1 }));
    document.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1 }));
    expect(t.input().value).toBe(before.replace('B2:C3', 'B2'));
    // a selection: no pointing (the arrow commits in enter mode)
    t.input().setSelectionRange(0, 1);
    await userEvent.keyboard('{Escape}');
    // whole columns and rows, a reference outside the data: frames only for what is shown
    t.focus(1, NOTE + N);
    await userEvent.keyboard('=SUM(A:A)+SUM(2:2)+Z9+A99');
    await nextFrame();
    expect(t.host.querySelectorAll('.ge-table-formula-ref')).toHaveLength(2);
    const down2 = getCellDiv(t.host, 'body', 'west', 1, 0);
    expect(down2).toBeTruthy();
    await userEvent.keyboard('{Escape}');
  });

  it('review: F2 leaves pointing; a sorted range must be one range of the sheet; only the primary button points', async () => {
    const t = await mount();
    t.focus(4, NOTE);
    await userEvent.keyboard('=SUM({ArrowUp}');
    expect(t.input().value).toBe('=SUM(E4');
    await userEvent.keyboard('{F2}{ArrowLeft}');
    expect(t.input().value).toBe('=SUM(E4'); // the caret moved
    expect(t.input().selectionStart).toBe(6);
    await userEvent.keyboard('{Escape}');
    // right click: no reference
    t.focus(4, NOTE);
    await userEvent.keyboard('=');
    const b2 = getCellDiv(t.host, 'body', 'center', 1, PRICE);
    const r = b2.getBoundingClientRect();
    b2.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 2, clientX: r.left + 3, clientY: r.top + 3 }));
    expect(t.rows[4].note).toBe('='); // not pointed: committed like any other click
    // sorted: price desc → display rows 1, 2, 3 are physical 1 (1299), 2 (349), 3 (25); qty desc makes them 3, 2, 1
    t.api.sortByColumn('qty', 'desc');
    await nextFrame();
    const order = [0, 1, 2, 3, 4].map(i => t.api.getCellAddress(i, 'qty'));
    const d10 = order.indexOf('C4'); // qty 10
    t.focus(d10, NOTE);
    await userEvent.keyboard('={ArrowLeft}{ArrowLeft}');
    const first = t.input().value;
    await userEvent.keyboard('{Shift>}{ArrowDown}{/Shift}');
    const second = t.input().value;
    const contiguous = Math.abs(Number(order[d10 + 1]!.slice(1)) - 4) === 1;
    expect(second === first).toBe(!contiguous);
    await userEvent.keyboard('{Escape}');
  });
});
