// Findings of the independent review of prompt 019 (live append) – each was red before its fix.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ColumnDef, EventAdapter, TableFactory, TrueFn, px100 } from '@guiexpert/table';
import type { GeMouseEvent, TableOptionsIf } from '@guiexpert/table';
import { destroyAllTables, getCellDiv, mountTable, nextFrame } from '../../../../test-utils/mount-table';
import { countRenders } from '../../../../test-utils/perf-counters';
import { realMouse } from '../../../../test-utils/real-mouse';
import { SelectionModel } from '@guiexpert/table';

interface Line { id: number; note: string; v: number }
const lines = (count: number, start = 0): Line[] =>
  Array.from({ length: count }, (_, i) => ({ id: start + i, note: 'n' + (start + i), v: start + i }));

afterEach(async () => {
  vi.restoreAllMocks();
  destroyAllTables();
  await realMouse.move(0, 0);
});

async function mount(rows: Line[], tableOptions: Partial<TableOptionsIf> = {}, listener = new EventAdapter(),
                     extra: { rowCheckboxVisible?: boolean } = {}) {
  const model = TableFactory.createTableModel({
    rows,
    columnDefs: ['id', 'note', 'v'].map(p => ColumnDef.create({ property: p, headerLabel: p, width: px100, editable: TrueFn, sortable: TrueFn })),
    ...extra,
  });
  const t = mountTable(model, { eventListener: listener, tableOptions: { resizeEventDebounceDelay: 10, ...tableOptions } });
  await nextFrame();
  await new Promise(resolve => setTimeout(resolve, 40));
  await nextFrame();
  const lineAt = (i: number) => t.api.getBodyModel().getRowByIndex(i) as Line;
  return { ...t, rows, lineAt };
}

describe('live append – review findings', () => {
  it('#2 the in-cell editor (getEditRenderer) stays on its row when rows are sorted in above it', async () => {
    const t = await mount(lines(20));
    t.api.sortByColumn('v', 'asc');
    await nextFrame();
    expect(t.api.startEditing(5, 'note')).toBe(true);
    await nextFrame();
    expect(t.api.getEditingCell()).toEqual([5, t.api.getColumnIndex('note')]);
    t.api.appendRows([{ id: 100, note: 'x', v: -1 }]);           // sorted in at index 0
    expect(t.api.getEditingCell()).toEqual([6, t.api.getColumnIndex('note')]);
    t.api.appendRows(lines(2, 200), { maxRows: 20 });             // ring buffer: rows leave at the start
    const cell = t.api.getEditingCell();
    expect(cell && t.lineAt(cell[0]).id).toBe(5);
  });

  it('#2 the in-cell editor closes when its row leaves the ring buffer', async () => {
    const t = await mount(lines(20));
    t.api.startEditing(1, 'note');
    await nextFrame();
    t.api.appendRows(lines(5, 100), { maxRows: 20 });              // rows 0 … 4 leave
    expect(t.api.getEditingCell()).toBeUndefined();
  });

  it('#3 a mouseup outside the table (e.g. on an app context menu) does not freeze follow "auto"', async () => {
    const t = await mount(lines(500));
    t.api.repaintHard({ py: Number.MAX_SAFE_INTEGER });
    await nextFrame();
    const cell = getCellDiv(t.host, 'body', 'center', t.api.getLastFullVisibleRowIndex(), 1);
    cell.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0, clientX: 10, clientY: 10 }));
    document.body.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, button: 0, clientX: 900, clientY: 900 }));
    const result = t.api.appendRows(lines(10, 500));
    expect(result && result.following).toBe(true);
  });

  it('#4 drag-select while the ring buffer removes rows: the range starts at the pressed row object', async () => {
    const sm = new SelectionModel('range', 'multi');
    const t = await mount(lines(300), { getSelectionModel: () => sm });
    t.api.scrollToPixel(0, 34 * 50);
    await nextFrame();
    const first = t.api.getFirstFullVisibleRowIndex();
    const startId = t.lineAt(first + 2).id;
    await realMouse.moveTo(getCellDiv(t.host, 'body', 'center', first + 2, 1));
    await realMouse.down();
    await realMouse.moveTo(getCellDiv(t.host, 'body', 'center', first + 4, 1));
    await nextFrame();
    t.api.appendRows(lines(10, 300), { maxRows: 300 });             // 10 rows leave at the start, the view holds
    await nextFrame();
    const cellNow = t.host.querySelector<HTMLElement>(`.ge-table-body-center .ge-table-col-div[data-row-index="${first - 10 + 5}"][data-col-index="1"]`)!;
    await realMouse.moveTo(cellNow);
    await nextFrame();
    await realMouse.up();
    await nextFrame();
    const ids = sm.getMergedRowIndices(t.api.getBodyModel().getRowCount()).map(i => t.lineAt(i).id);
    expect(ids[0]).toBe(startId);
  });

  it('#6 col spans are rebuilt when the ring buffer keeps the row count', async () => {
    const t = await mount(lines(100));
    const body = t.api.getBodyModel() as unknown as { getColspanAt(r: number, c: number): number; getMaxColspan(): number };
    body.getColspanAt = (r: number, c: number) => c === 0 && (body as unknown as { getRowByIndex(i: number): Line }).getRowByIndex(r)?.id % 10 === 0 ? 2 : 1;
    const spanModel = (t.scope as unknown as { colAndRowspanModels: { body?: { init(): void; getRanges(): { r1: number }[] } } })
      .colAndRowspanModels.body!;
    spanModel.init();
    const spans = () => spanModel.getRanges().map(r => t.lineAt(r.r1).id % 10);
    expect(spans().length).toBe(10);
    expect(spans().every(m => m === 0)).toBe(true);
    t.api.appendRows(lines(3, 100), { maxRows: 100 });                // 3 in, 3 out: same row count
    expect(spans().length).toBeGreaterThan(0);
    expect(spans().every(m => m === 0)).toBe(true);
  });

  it('#7 with row checkboxes the header checkbox is drawn again (no no-render path)', async () => {
    const t = await mount(lines(500), {}, new EventAdapter(), { rowCheckboxVisible: true });
    t.api.scrollToPixel(0, 3_000);
    await nextFrame();
    const renders = countRenders(t.scope);
    t.api.appendRows(lines(10, 500));
    expect(renders.count()).toBe(1);
  });

  it('#7 Ctrl+click on macOS opens the context menu: no click is reported, even if a render replaced the cell', async () => {
    const clicked: GeMouseEvent[] = [];
    const listener = new EventAdapter();
    listener.onMouseClicked = e => clicked.push(e);
    const t = await mount(lines(50), {}, listener);
    const cell = getCellDiv(t.host, 'body', 'center', 3, 1);
    cell.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0, ctrlKey: true, clientX: 5, clientY: 5 }));
    cell.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, button: 0, ctrlKey: true, clientX: 5, clientY: 5 }));
    t.api.repaint();
    getCellDiv(t.host, 'body', 'center', 3, 1)
      .dispatchEvent(new MouseEvent('mouseup', { bubbles: true, button: 0, ctrlKey: true, clientX: 5, clientY: 5 }));
    await new Promise(resolve => setTimeout(resolve, 20));
    expect(clicked).toEqual([]);
  });
});
