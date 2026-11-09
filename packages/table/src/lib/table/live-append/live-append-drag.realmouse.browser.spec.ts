// Live data while the mouse button is held (found by a flaky macOS run of log-tail.browser.spec.ts, release 1.1.111):
// a render replaces the cells under the pointer, Chromium sends a "fake" mousemove at the same coordinates, the
// MouseHandler took it for a drag and the drag frame read the row index from the REPLACED element. If appendRows had
// removed rows at the start in the meantime, that index pointed one update too far: the range selection moved the
// focus to another line and swallowed the click (ignoreNextClick).
import { afterEach, describe, expect, it } from 'vitest';
import { ColumnDef, EventAdapter, FocusModel, SelectionModel, TableFactory, px100 } from '@guiexpert/table';
import type { GeMouseEvent } from '@guiexpert/table';
import { destroyAllTables, DIRECTIONS, getCellDiv, mountTable, nextFrame } from '../../../../test-utils/mount-table';
import { realMouse } from '../../../../test-utils/real-mouse';

afterEach(async () => {
  destroyAllTables();
  await realMouse.move(0, 0);
});

interface Line { id: number; text: string }
let nextId = 0;
const createLines = (n: number): Line[] => Array.from({ length: n }, () => ({ id: nextId++, text: `line ${nextId}` }));

async function mountLive(direction: 'ltr' | 'rtl') {
  nextId = 0;
  const clicked: GeMouseEvent[] = [];
  const dragged: GeMouseEvent[] = [];
  const listener = new EventAdapter();
  listener.onMouseClicked = e => clicked.push(e);
  listener.onMouseDragging = e => dragged.push(e);
  listener.onMouseDraggingEnd = e => dragged.push(e);
  const selectionModel = new SelectionModel('range', 'multi');
  const focusModel = new FocusModel('cell');
  const rows = createLines(1_000);
  const tableModel = TableFactory.createTableModel({
    rows,
    columnDefs: ['id', 'text'].map(p => ColumnDef.create({ property: p, headerLabel: p, width: px100 })),
  });
  const t = mountTable(tableModel, {
    eventListener: listener, height: 400,
    tableOptions: { direction, getSelectionModel: () => selectionModel, getFocusModel: () => focusModel },
  });
  t.api.repaintHard({ py: Number.MAX_SAFE_INTEGER }); // at the end, like a live log: removals at the start are far away
  await nextFrame();
  const lineAt = (i: number) => t.api.getBodyModel().getRowByIndex(i) as Line;
  /** 100 new lines, 100 removed at the start (ring buffer full) – the indices of all lines drop by 100 */
  const update = () => t.api.appendRows(createLines(100), { follow: 'auto', maxRows: 1_000 });
  const focusedLine = () => lineAt(focusModel.getFocus()[0]);
  return { ...t, clicked, dragged, lineAt, update, focusedLine, selectionModel };
}

function centre(element: Element) {
  const r = element.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

describe.each(DIRECTIONS)('a held mouse button while rows are appended (%s)', direction => {

  it('a mousemove without movement (the browser after a render) is no drag – the click keeps its line', async () => {
    const t = await mountLive(direction);
    const index = t.api.getLastFullVisibleRowIndex() - 3;
    const pressed = t.lineAt(index);
    const cell = getCellDiv(t.host, 'body', 'center', index, 1);
    const { x, y } = centre(cell);
    await realMouse.move(x, y);
    await realMouse.down();
    t.update();                                   // a render replaces the pressed cell
    // the browser's mousemove at the unchanged position – on the element drawn there now, its frame is queued …
    document.elementFromPoint(x, y)!.dispatchEvent(new MouseEvent('mousemove', { clientX: x, clientY: y, bubbles: true, buttons: 1 }));
    t.update();                                   // … and another update runs before that frame
    await nextFrame();
    await realMouse.up();
    await new Promise(resolve => setTimeout(resolve, 20));
    await nextFrame();
    expect(t.clicked.map(e => t.lineAt(e.rowIndex).id)).toEqual([pressed.id]);
    expect(t.focusedLine().id).toBe(pressed.id);
    expect(t.dragged).toHaveLength(0); // a click, not a drag (before: onMouseDragging + onMouseDraggingEnd)
  });

  it('a real drag whose element was replaced by a render uses the line under the pointer, not the old index', async () => {
    const t = await mountLive(direction);
    const startIndex = t.api.getLastFullVisibleRowIndex() - 6;
    const start = getCellDiv(t.host, 'body', 'center', startIndex, 0);
    const target = getCellDiv(t.host, 'body', 'center', startIndex + 3, 1);
    const from = centre(start);
    const to = centre(target);
    await realMouse.move(from.x, from.y);
    await realMouse.down();
    // the mousemove of a real drag (synthetic: its frame must still be queued when the update runs) …
    target.dispatchEvent(new MouseEvent('mousemove', { clientX: to.x, clientY: to.y, bubbles: true, buttons: 1 }));
    t.update();                                   // … an update replaces the cells before it runs
    await nextFrame();
    // the line under the pointer is the one drawn there now
    const underPointer = document.elementFromPoint(to.x, to.y)!.closest<HTMLElement>('[data-row-index]')!;
    const lineUnderPointer = t.lineAt(Number(underPointer.getAttribute('data-row-index')));
    const startLine = t.lineAt(startIndex - 100);   // the update moved every index up by 100
    await realMouse.up();
    await nextFrame();
    const indexOf = (line: Line) => (t.api.getBodyModel() as unknown as { getAllRows(): Line[] }).getAllRows().indexOf(line);
    // the range reaches the line under the pointer; the focus stays at the anchor (like a spreadsheet)
    expect(t.selectionModel.isSelected(indexOf(lineUnderPointer), 1)).toBe(true);
    expect(t.focusedLine().id).toBe(startLine.id);
  });
});
