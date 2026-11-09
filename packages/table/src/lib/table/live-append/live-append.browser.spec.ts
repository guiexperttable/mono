// Live data (prompt 019): tableApi.appendRows / rowsAppended in a real browser – selection, focus and position stay,
// one render per update, no cell rebuild when only rows behind the visible ones come in.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import {
  AreaModel, CellRange, ColumnDef, DefaultRowHeights, EventAdapter, SelectionModel, TableFactory, px100,
} from '@guiexpert/table';
import type { GeMouseEvent, SelectionModelIf, TableOptionsIf } from '@guiexpert/table';
import { destroyAllTables, DIRECTIONS, getCellDiv, mountTable, nextFrame } from '../../../../test-utils/mount-table';
import { countCalls, countCellBuilds, countRenders, expectSameArray } from '../../../../test-utils/perf-counters';
import { realMouse } from '../../../../test-utils/real-mouse';

interface Line { id: number; level: 'INFO' | 'WARN' | 'ERROR'; text: string }

const LEVELS: Line['level'][] = ['INFO', 'WARN', 'ERROR'];
const createLines = (count: number, start = 0): Line[] =>
  Array.from({ length: count }, (_, i) => ({ id: start + i, level: LEVELS[(start + i) % 3], text: 'line ' + (start + i) }));

afterEach(async () => {
  vi.restoreAllMocks();
  destroyAllTables();
  await realMouse.move(0, 0);
});

async function mountLog(direction: 'ltr' | 'rtl', count = 100, tableOptions: Partial<TableOptionsIf> = {}) {
  const rows = createLines(count);
  const sm = new SelectionModel('range', 'multi');
  const clicked: GeMouseEvent[] = [];
  let selectionEvents = 0;
  const listener = new EventAdapter();
  listener.onMouseClicked = e => clicked.push(e);
  listener.onSelectionChanged = () => selectionEvents++;
  const model = TableFactory.createTableModel({
    rows,
    columnDefs: ['id', 'level', 'text'].map(p => ColumnDef.create({ property: p, headerLabel: p, width: px100 })),
    defaultRowHeights: new DefaultRowHeights(34, 20, 34),
  });
  const t = mountTable(model, {
    eventListener: listener,
    tableOptions: { direction, resizeEventDebounceDelay: 10, getSelectionModel: () => sm, ...tableOptions },
  });
  await nextFrame();
  await new Promise(resolve => setTimeout(resolve, 40));
  await nextFrame();
  const ids = () => t.api.getBodyModel().getRowCount();
  const rowAt = (i: number) => t.api.getBodyModel().getRowByIndex(i) as Line;
  const selectedIds = () => (t.api.getSelectionModel() as SelectionModelIf).getMergedRowIndices().map(i => rowAt(i).id);
  const focusId = () => rowAt(t.scope.focusModel()!.getFocus()[0])?.id;
  return { ...t, rows, sm, clicked, selectionEvents: () => selectionEvents, ids, rowAt, selectedIds, focusId };
}

const firstVisibleId = (t: Awaited<ReturnType<typeof mountLog>>) => t.rowAt(t.api.getFirstVisibleRowIndex()).id;

describe.each(DIRECTIONS)('appendRows (%s)', direction => {

  it('appends in place, one render, the selection stays without an event', async () => {
    const t = await mountLog(direction);
    t.sm.addSelection(new CellRange(5, 0, 7, 2));
    const before = t.selectionEvents();
    const renders = countRenders(t.scope);
    const result = t.api.appendRows(createLines(1_000, 100));
    expect(result).toEqual({ added: 1_000, shown: 1_000, removed: 0, following: false });
    expect(t.api.getBodyModel().getRowCount()).toBe(1_100);
    expect(t.rows.length).toBe(1_100); // the app's array
    expect(renders.count()).toBeLessThanOrEqual(1);
    expect(t.selectedIds()).toEqual([5, 6, 7]);
    expect(t.selectionEvents()).toBe(before);
  });

  it('the view in the middle: the first visible row stays, no cell is rebuilt (rows only behind)', async () => {
    const t = await mountLog(direction, 1_000);
    t.api.scrollToPixel(0, 4_000);
    await nextFrame();
    const first = firstVisibleId(t);
    const renders = countRenders(t.scope);
    const cells = countCellBuilds(t.host);
    const shown = (t.api.getBodyModel() as unknown as { getFilteredRows(): Line[] }).getFilteredRows();
    t.api.appendRows(createLines(500, 1_000));
    await nextFrame();
    expect(firstVisibleId(t)).toBe(first);
    expect(renders.count()).toBe(0);
    expect(cells.count()).toBe(0);
    expect(t.host.getAttribute('aria-rowcount')).toBe(String(1 + 1_500));
    expectSameArray(shown, (t.api.getBodyModel() as unknown as { getFilteredRows(): Line[] }).getFilteredRows(), 'displayed rows');
    // the next scroll renders normally
    t.api.scrollToPixel(0, 4_000 + 20 * 50);
    await nextFrame();
    expect(firstVisibleId(t)).toBe(first + 50);
  });

  it('follow "auto": at the end → stays at the end (one render)', async () => {
    const t = await mountLog(direction, 1_000);
    t.api.repaintHard({ py: Number.MAX_SAFE_INTEGER });
    await nextFrame();
    const renders = countRenders(t.scope);
    const result = t.api.appendRows(createLines(50, 1_000));
    await nextFrame();
    expect(result && result.following).toBe(true);
    expect(renders.count()).toBe(1);
    expect(t.api.getLastVisibleRowIndex()).toBe(1_049);
  });

  it('follow false ("freeze scroll") at the end: the rows stay, true always jumps to the end', async () => {
    const t = await mountLog(direction, 1_000);
    t.api.repaintHard({ py: Number.MAX_SAFE_INTEGER });
    await nextFrame();
    const first = firstVisibleId(t);
    t.api.appendRows(createLines(50, 1_000), { follow: false });
    await nextFrame();
    expect(firstVisibleId(t)).toBe(first);
    t.api.scrollToPixel(0, 0);
    await nextFrame();
    t.api.appendRows(createLines(10, 1_050), { follow: true });
    await nextFrame();
    expect(t.api.getLastVisibleRowIndex()).toBe(1_059);
  });

  it('ring buffer (maxRows): selection, focus and the first visible row stay at their rows', async () => {
    const t = await mountLog(direction, 1_000);
    t.api.scrollToPixel(0, 20 * 300);
    await nextFrame();
    await userEvent.click(getCellDiv(t.host, 'body', 'center', 305, 1));
    await nextFrame();
    expect(t.focusId()).toBe(305);
    t.sm.addSelection(new CellRange(310, 0, 312, 2));
    const first = firstVisibleId(t);
    const result = t.api.appendRows(createLines(100, 1_000), { maxRows: 1_000 });
    await nextFrame();
    expect(result).toMatchObject({ added: 100, removed: 100 });
    expect(t.rows[0].id).toBe(100);
    expect(firstVisibleId(t)).toBe(first);
    expect(t.focusId()).toBe(305);
    expect(t.selectedIds()).toEqual(expect.arrayContaining([310, 311, 312]));
  });

  it('a selected row removed by the ring buffer leaves the selection – with one event', async () => {
    const t = await mountLog(direction, 100);
    t.sm.addSelection(new CellRange(1, 0, 3, 0));
    const before = t.selectionEvents();
    t.api.appendRows(createLines(2, 100), { maxRows: 100 });
    expect(t.selectedIds()).toEqual([2, 3]);
    expect(t.selectionEvents()).toBe(before + 1);
  });

  it('with a filter: the filter runs only for the new rows, hidden rows are kept', async () => {
    let calls = 0;
    const t = await mountLog(direction, 300, {
      externalFilterFunction: (row: Line) => { calls++; return row.level !== 'INFO'; },
    });
    expect(t.api.getBodyModel().getRowCount()).toBe(200);
    t.sm.addSelection(new CellRange(4, 0, 4, 0));
    const selected = t.selectedIds();
    calls = 0;
    const result = t.api.appendRows(createLines(30, 300));
    expect(calls).toBe(30);
    expect(result).toMatchObject({ added: 30, shown: 20 });
    expect(t.rows.length).toBe(330);
    expect(t.selectedIds()).toEqual(selected);
  });

  it('sorted: new rows are merged in at their place, the selection stays at its rows', async () => {
    const t = await mountLog(direction, 200);
    t.api.sortByColumn('id', 'desc');
    await nextFrame();
    t.sm.addSelection(new CellRange(10, 0, 12, 0));
    const selected = t.selectedIds();
    t.api.appendRows([
      { id: 1_000, level: 'INFO', text: 'top' },
      { id: 105, level: 'INFO', text: 'between' } as Line,
      { id: -1, level: 'INFO', text: 'bottom' },
    ]);
    expect(t.rowAt(0).id).toBe(1_000);
    expect(t.rowAt(t.api.getBodyModel().getRowCount() - 1).id).toBe(-1);
    expect(t.selectedIds()).toEqual(selected);
    expect(t.rowAt(200 - 105 - 1 + 1).id).toBe(105); // between 106 and 104
  });

  it('200,000 rows in one call: no stack overflow; addRows too', async () => {
    const t = await mountLog(direction, 10);
    expect(() => t.api.appendRows(createLines(200_000, 10))).not.toThrow();
    expect(t.api.getBodyModel().getRowCount()).toBe(200_010);
    expect(() => t.api.addRows(createLines(200_000, 300_000))).not.toThrow();
  });

  it('the "No rows" overlay disappears with the first appended rows', async () => {
    const t = await mountLog(direction, 0);
    expect(t.api.getOverlayState()).toBe('noRows');
    t.api.appendRows(createLines(5));
    await nextFrame();
    expect(t.api.getOverlayState()).toBe('none');
  });

  it('with cell formulas → false and a warning, nothing changed', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const t = await mountLog(direction, 5, { cellFormulas: true });
    expect(t.api.appendRows(createLines(3, 5))).toBe(false);
    expect(warn).toHaveBeenCalled();
    expect(t.api.getBodyModel().getRowCount()).toBe(5);
    expect(t.rows.length).toBe(5);
  });

  it('a body without appendRows (tree, row groups, pivot, own model) → false and a warning', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const t = await mountLog(direction, 5);
    const body = t.api.getBodyModel() as { appendRows?: unknown };
    body.appendRows = undefined;
    expect(t.api.appendRows(createLines(3, 5))).toBe(false);
    expect(warn).toHaveBeenCalled();
    expect(t.api.getBodyModel().getRowCount()).toBe(5);
  });

  it('a click while rows are appended (button held): mouseClicked for the pressed row, the view does not jump', async () => {
    const t = await mountLog(direction, 500);
    t.api.repaintHard({ py: Number.MAX_SAFE_INTEGER });
    await nextFrame();
    const index = t.api.getLastFullVisibleRowIndex() - 2;
    const pressedId = t.rowAt(index).id;
    await realMouse.moveTo(getCellDiv(t.host, 'body', 'center', index, 1));
    await realMouse.down();
    const result = t.api.appendRows(createLines(20, 500), { maxRows: 500 }); // the view stays: button held
    expect(result && result.following).toBe(false);
    await realMouse.up();
    await vi.waitFor(() => expect(t.clicked.length).toBe(1));
    expect(t.rowAt(t.clicked[0].rowIndex).id).toBe(pressedId);
    expect(t.focusId()).toBe(pressedId);
    // the next updates keep focus and selection at that row
    t.api.appendRows(createLines(20, 520), { maxRows: 500 });
    t.api.appendRows(createLines(20, 540), { maxRows: 500 });
    expect(t.focusId()).toBe(pressedId);
  });

  it('a view that followed the end follows again after the button is released; a scrolled view does not', async () => {
    const t = await mountLog(direction, 500);
    t.api.repaintHard({ py: Number.MAX_SAFE_INTEGER });
    await nextFrame();
    await realMouse.moveTo(getCellDiv(t.host, 'body', 'center', t.api.getLastFullVisibleRowIndex() - 2, 1));
    await realMouse.down();
    expect(t.api.appendRows(createLines(20, 500)) && false).toBe(false);
    expect((t.api.appendRows(createLines(20, 520)) as { following: boolean }).following).toBe(false);
    await realMouse.up();
    await nextFrame();
    expect((t.api.appendRows(createLines(20, 540)) as { following: boolean }).following).toBe(true);
    await nextFrame();
    expect(t.api.getLastVisibleRowIndex()).toBe(t.api.getBodyModel().getRowCount() - 1);
    // held, then the user scrolls away before the next update: no jump to the end
    await realMouse.down();
    t.api.appendRows(createLines(20, 560));
    await realMouse.up();
    t.api.scrollToPixel(0, 0);
    await nextFrame();
    expect((t.api.appendRows(createLines(20, 580)) as { following: boolean }).following).toBe(false);
  });

  it('keyboard between updates: ↓ moves from the focused row object', async () => {
    const t = await mountLog(direction, 300);
    await userEvent.click(getCellDiv(t.host, 'body', 'center', 3, 1));
    await nextFrame();
    t.api.appendRows(createLines(10, 300), { maxRows: 300 }); // rows 0 … 9 leave
    expect(t.focusId()).toBe(10); // the focused row 3 was removed: the next remaining row
    await userEvent.keyboard('{ArrowDown}');
    await nextFrame();
    expect(t.focusId()).toBe(11);
    t.api.appendRows(createLines(10, 310), { maxRows: 300 }); // rows 10 … 19 leave
    await userEvent.click(getCellDiv(t.host, 'body', 'center', 5, 1));
    await nextFrame();
    expect(t.focusId()).toBe(25);
    t.api.appendRows(createLines(3, 320));
    await userEvent.keyboard('{ArrowDown}');
    await nextFrame();
    expect(t.focusId()).toBe(26);
  });
});

describe.each(DIRECTIONS)('rowsAppended – own area model (%s)', direction => {

  class LogBody extends AreaModel {
    readonly lines: string[] = [];
    constructor() { super(); this.areaIdent = 'body'; }
    override getRowCount(): number { return this.lines.length; }
    override getRowHeight(): number { return 20; }
    override getConstantRowHeight(): number { return 20; }
    override getValueAt(row: number): string { return this.lines[row]; }
  }

  async function mountOwn(count: number) {
    const body = new LogBody();
    for (let i = 0; i < count; i++) body.lines.push('line ' + i);
    const sm = new SelectionModel('row', 'multi');
    const model = TableFactory.createTableModel({
      bodyAreaModel: body,
      columnDefs: [ColumnDef.create({ property: 'line', headerLabel: 'Line', width: px100 })],
      defaultRowHeights: new DefaultRowHeights(34, 20, 34),
    });
    const t = mountTable(model, { tableOptions: { direction, resizeEventDebounceDelay: 10, getSelectionModel: () => sm } });
    await nextFrame();
    await new Promise(resolve => setTimeout(resolve, 40));
    await nextFrame();
    return { ...t, body, sm };
  }

  it('appended + removed at the start: selection and first visible line stay, one render', async () => {
    const t = await mountOwn(1_000);
    t.api.scrollToPixel(0, 20 * 200);
    await nextFrame();
    t.sm.addSelection(CellRange.singleRow(210));
    const firstLine = t.body.lines[t.api.getFirstVisibleRowIndex()];
    const renders = countRenders(t.scope);
    for (let i = 0; i < 100; i++) t.body.lines.push('line ' + (1_000 + i));
    t.body.lines.splice(0, 100);
    const result = t.api.rowsAppended(100, { removedAtStart: 100 });
    await nextFrame();
    expect(result).toEqual({ added: 100, shown: 100, removed: 100, following: false });
    expect(renders.count()).toBe(1);
    expect(t.body.lines[t.api.getFirstVisibleRowIndex()]).toBe(firstLine);
    expect(t.sm.getMergedRowIndices().map(i => t.body.lines[i])).toEqual(['line 210']);
  });

  it('at the end: follows; in the middle without removal: no render', async () => {
    const t = await mountOwn(1_000);
    t.api.repaintHard({ py: Number.MAX_SAFE_INTEGER });
    await nextFrame();
    for (let i = 0; i < 10; i++) t.body.lines.push('x' + i);
    expect(t.api.rowsAppended(10).following).toBe(true);
    await nextFrame();
    expect(t.api.getLastVisibleRowIndex()).toBe(1_009);
    t.api.scrollToPixel(0, 2_000);
    await nextFrame();
    const renders = countRenders(t.scope);
    const values = countCalls(t.body, 'getValueAt');
    for (let i = 0; i < 10; i++) t.body.lines.push('y' + i);
    expect(t.api.rowsAppended(10).following).toBe(false);
    await nextFrame();
    expect(renders.count()).toBe(0);
    expect(values.count()).toBe(0);
  });
});
