// Mouse interaction end to end in a real browser (MouseHandler → TableScope → EventListenerIf):
// GeMouseEvent payloads, header sorting by double click, column resize and column drag & drop by dragging the
// header, hover row/column, context menu.
// Selection on click/ctrl-click/shift-click is covered elsewhere (selection-service) and deliberately not asserted.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { ColumnDef, EventAdapter, FalseFn, Icon, SortedOptions, TableFactory, TrueFn, px100, px150 } from '@guiexpert/table';
import type { ColumnDefIf, GeMouseEvent, SortState, TableOptionsIf } from '@guiexpert/table';
import {
  areaRows,
  createRows,
  destroyAllTables,
  getCellDiv,
  mountTable,
  nextFrame,
  renderedRows,
  stylePx,
} from '../../../test-utils/mount-table';

afterEach(() => {
  destroyAllTables();
  vi.restoreAllMocks();
});

interface MountOpts {
  rows?: number;
  fixedLeft?: number;
  columnDefs?: ColumnDefIf[];
  tableOptions?: Partial<TableOptionsIf>;
  footer?: boolean;
}

/** id | name | value (100 px each, all sortable), records all mouse events of the listener. */
async function mountMouseTable(opts: MountOpts = {}) {
  const listener = new EventAdapter();
  const clicked: GeMouseEvent[] = [];
  const moved: GeMouseEvent[] = [];
  const contextmenu: GeMouseEvent[] = [];
  const dragging: GeMouseEvent[] = [];
  const draggingEnd: GeMouseEvent[] = [];
  listener.onMouseClicked = e => clicked.push(e);
  listener.onMouseMoved = e => moved.push(e);
  listener.onContextmenu = e => contextmenu.push(e);
  listener.onMouseDragging = e => dragging.push(e);
  listener.onMouseDraggingEnd = e => draggingEnd.push(e);
  const columnDefs = opts.columnDefs ?? ['id', 'name', 'value'].map(p =>
    ColumnDef.create({ property: p, headerLabel: p.toUpperCase(), width: px100, sortable: TrueFn }));
  const model = TableFactory.createTableModel({
    rows: createRows(opts.rows ?? 100),
    columnDefs,
    fixedLeftColumnCount: opts.fixedLeft ?? 0,
    footerData: opts.footer ? [columnDefs.map(cd => 'F-' + cd.property)] : undefined,
  });
  const table = mountTable(model, { eventListener: listener, tableOptions: opts.tableOptions });
  await nextFrame();
  return { ...table, model, clicked, moved, contextmenu, dragging, draggingEnd };
}

const headerLabels = (host: HTMLElement) =>
  Array.from(areaRows(host, 'header')[0].querySelectorAll('.ge-table-label'), e => e.textContent);

const firstRowTexts = (host: HTMLElement, count = 3) =>
  renderedRows(host).slice(0, count).map(row => row.querySelector('[data-col-index="1"] .ge-table-label')?.textContent);

/** The left position of an element relative to the host (layout, not style). */
const leftInHost = (host: HTMLElement, el: Element) => el.getBoundingClientRect().left - host.getBoundingClientRect().left;
const topInHost = (host: HTMLElement, el: Element) => el.getBoundingClientRect().top - host.getBoundingClientRect().top;

function fireMouse(target: Element, type: string, init: MouseEventInit = {}) {
  const r = target.getBoundingClientRect();
  target.dispatchEvent(new MouseEvent(type, {
    bubbles: true, cancelable: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, ...init,
  }));
}

describe('onMouseClicked – GeMouseEvent', () => {

  it('click on a body cell: indices, area, side, positions', async () => {
    const { host, clicked } = await mountMouseTable({ fixedLeft: 1 });
    await userEvent.click(getCellDiv(host, 'body', 'center', 3, 2));
    expect(clicked).toHaveLength(1);
    const evt = clicked[0];
    expect(evt.rowIndex).toBe(3);
    expect(evt.columnIndex).toBe(2);
    expect(evt.areaIdent).toBe('body');
    expect(evt.sideIdent).toBe('center');
    expect(evt.clickCount).toBe(1);
    expect(evt.rowTop).toBe(3 * 34);
    expect(evt.columnLeft).toBe(200); // x position over all columns (west included)
    expect(evt.action).toBe('');
    expect(evt.originalEvent?.type).toBe('click');
  });

  it('click on a fixed west cell reports side "west"', async () => {
    const { host, clicked } = await mountMouseTable({ fixedLeft: 1 });
    await userEvent.click(getCellDiv(host, 'body', 'west', 5, 0));
    expect(clicked[0]).toMatchObject({ rowIndex: 5, columnIndex: 0, areaIdent: 'body', sideIdent: 'west', columnLeft: 0 });
  });

  it('click on a header cell reports area "header" and the action "drag-column"', async () => {
    const { host, clicked } = await mountMouseTable();
    await userEvent.click(getCellDiv(host, 'header', 'center', 0, 1));
    expect(clicked[0]).toMatchObject({ rowIndex: 0, columnIndex: 1, areaIdent: 'header', sideIdent: 'center', action: 'drag-column' });
  });

  // BUG: ele-scope.ts:162 – the scroll viewport (created after the footer areas) is as high as the table minus the
  // header (h - padding.top) and covers the footer: a real click on a footer cell hits the viewport and is reported as a
  // BODY click with rowIndex/columnIndex -1 (hover and onMouseMoved likewise). Only the body east area is lifted
  // above it (z-index in table-classes.css).
  it.fails('a click on a footer cell is reported as footer click', async () => {
    const { host, clicked } = await mountMouseTable({ footer: true });
    // force: Playwright would refuse the click because the cell is covered by another element
    await userEvent.click(getCellDiv(host, 'footer', 'center', 0, 2), { force: true });
    expect(clicked[0]).toMatchObject({ rowIndex: 0, columnIndex: 2, areaIdent: 'footer' });
  });

  it('click on a scrolled row reports the model row index', async () => {
    const { host, api, clicked } = await mountMouseTable({ rows: 10_000 });
    api.scrollToIndex(0, 5_000);
    await nextFrame();
    await userEvent.click(getCellDiv(host, 'body', 'center', 5_002, 0));
    expect(clicked[0]).toMatchObject({ rowIndex: 5_002, columnIndex: 0, rowTop: 5_002 * 34 });
  });

  it('two quick clicks on the same cell: clickCount 1, then 2 – on different cells: 1 and 1', async () => {
    const { host, scope, clicked } = await mountMouseTable();
    scope.mouseHandler.doubleClickDelay = 60_000; // deterministic, independent of the machine speed
    const cellA = getCellDiv(host, 'body', 'center', 1, 1);
    await userEvent.click(cellA);
    await userEvent.click(getCellDiv(host, 'body', 'center', 2, 1));
    await userEvent.click(getCellDiv(host, 'body', 'center', 2, 1));
    expect(clicked.map(e => [e.rowIndex, e.clickCount])).toEqual([[1, 1], [2, 1], [2, 2]]);
  });

  it('a double click on a body cell fires onMouseClicked three times', async () => {
    const { host, scope, clicked } = await mountMouseTable();
    scope.mouseHandler.doubleClickDelay = 60_000;
    await userEvent.dblClick(getCellDiv(host, 'body', 'center', 4, 0));
    // NOTE: click (1) + click (2, same cell within doubleClickDelay) + dblclick (2) – the double click is reported twice.
    expect(clicked.map(e => e.clickCount)).toEqual([1, 2, 2]);
    expect(clicked.map(e => e.originalEvent?.type)).toEqual(['click', 'click', 'dblclick']);
    expect(clicked.every(e => e.rowIndex === 4 && e.areaIdent === 'body')).toBe(true);
  });

  // BUG: mouse-handler.ts:167/201 – the dblclick handler sorts (repaint → the header cells are rebuilt) BEFORE it
  // publishes the event; the event target is then detached and table-scope.ts:317 finds no data-side ancestor →
  // areaIdent/sideIdent undefined, rowTop -1.
  it.fails('the double click that sorts a column is reported with area "header"', async () => {
    const { host, clicked } = await mountMouseTable();
    await userEvent.dblClick(getCellDiv(host, 'header', 'center', 0, 1));
    const dblclick = clicked.find(e => e.originalEvent?.type === 'dblclick')!;
    expect(dblclick.areaIdent).toBe('header');
  });

  it('Ctrl+Alt + mouse move clears the browser console (debug code)', async () => {
    const clear = vi.spyOn(console, 'clear').mockImplementation(() => undefined);
    vi.spyOn(console, 'info').mockImplementation(() => undefined);
    const { host } = await mountMouseTable();
    fireMouse(getCellDiv(host, 'body', 'center', 1, 1), 'mousemove', { ctrlKey: true, altKey: true });
    await nextFrame();
    // NOTE: table-scope.ts:331 debugOnce() – Ctrl+Alt on any mouse event (even a move) clears the user's console
    // and logs internals; Ctrl+Alt+click is also the "deselect cell" gesture.
    expect(clear).toHaveBeenCalled();
  });
});

describe('sorting by double click on the header (ColumnDef.sortable)', () => {

  const sortIcon = (host: HTMLElement, col: number) =>
    getCellDiv(host, 'header', 'center', 0, col).querySelector<HTMLElement>('.ge-table-sorted-icon-div');

  it('a single click does not sort', async () => {
    const { host } = await mountMouseTable();
    await userEvent.click(getCellDiv(host, 'header', 'center', 0, 1));
    await nextFrame();
    expect(firstRowTexts(host)).toEqual(['Name 0', 'Name 1', 'Name 2']);
    expect(sortIcon(host, 1)).toBeNull();
  });

  it('double click sorts ascending, the next one descending – with header icons', async () => {
    const { host, model } = await mountMouseTable();
    await userEvent.dblClick(getCellDiv(host, 'header', 'center', 0, 2));
    await nextFrame();
    expect(model.getColumnDef(2)!.sortState).toBe('asc');
    expect(sortIcon(host, 2)!.textContent).toBe('↑');
    expect(sortIcon(host, 2)!.classList).toContain('ge-header-sorted-asc');
    expect(renderedRows(host)[0].querySelector('[data-col-index="2"]')!.textContent).toBe('0');

    await userEvent.dblClick(getCellDiv(host, 'header', 'center', 0, 2));
    await nextFrame();
    expect(model.getColumnDef(2)!.sortState).toBe('desc');
    expect(sortIcon(host, 2)!.textContent).toBe('↓');
    expect(sortIcon(host, 2)!.classList).toContain('ge-header-sorted-desc');
    expect(renderedRows(host)[0].querySelector('[data-col-index="2"]')!.textContent).toBe(String(99 * 3));
  });

  it('sorts the text column as text and removes the icon of the previously sorted column', async () => {
    const { host, model } = await mountMouseTable();
    await userEvent.dblClick(getCellDiv(host, 'header', 'center', 0, 0));
    await nextFrame();
    expect(sortIcon(host, 0)).not.toBeNull();
    await userEvent.dblClick(getCellDiv(host, 'header', 'center', 0, 1));
    await nextFrame();
    expect(firstRowTexts(host)).toEqual(['Name 0', 'Name 1', 'Name 10']);
    expect(model.getColumnDef(0)!.sortState).toBe('');
    expect(sortIcon(host, 0)).toBeNull();
    expect(sortIcon(host, 1)!.textContent).toBe('↑');
  });

  it('a column without sortable is not sorted by a double click', async () => {
    const columnDefs = [
      ColumnDef.create({ property: 'id', width: px100 }),
      ColumnDef.create({ property: 'name', width: px100, sortable: FalseFn }),
    ];
    const { host, model } = await mountMouseTable({ columnDefs });
    await userEvent.dblClick(getCellDiv(host, 'header', 'center', 0, 1));
    await nextFrame();
    expect(model.getColumnDef(1)!.sortState).toBeUndefined();
    expect(firstRowTexts(host)).toEqual(['Name 0', 'Name 1', 'Name 2']);
  });

  it('uses the sortComparator and sortStatesOrder of the column', async () => {
    const byLastDigit = (a: number, b: number) => (a % 10) - (b % 10) || a - b;
    const columnDefs = [
      ColumnDef.create({ property: 'id', width: px100, sortable: TrueFn, sortComparator: byLastDigit, sortStatesOrder: ['desc', 'asc'] }),
      ColumnDef.create({ property: 'name', width: px100 }),
    ];
    const { host, model } = await mountMouseTable({ columnDefs, rows: 30 });
    await userEvent.dblClick(getCellDiv(host, 'header', 'center', 0, 0));
    await nextFrame();
    expect(model.getColumnDef(0)!.sortState).toBe('desc');
    const ids = renderedRows(host).slice(0, 4).map(r => r.querySelector('[data-col-index="0"]')!.textContent);
    expect(ids).toEqual(['29', '19', '9', '28']);
  });

  it('sortIconVisible = FalseFn sorts without an icon', async () => {
    const columnDefs = [
      ColumnDef.create({ property: 'id', width: px100 }),
      ColumnDef.create({ property: 'name', width: px100, sortable: TrueFn, sortIconVisible: FalseFn }),
    ];
    const { host, model } = await mountMouseTable({ columnDefs });
    await userEvent.dblClick(getCellDiv(host, 'header', 'center', 0, 1));
    await nextFrame();
    expect(model.getColumnDef(1)!.sortState).toBe('asc');
    expect(sortIcon(host, 1)).toBeNull();
    expect(firstRowTexts(host)).toEqual(['Name 0', 'Name 1', 'Name 10']);
  });

  it('tableOptions.sortedOptions replaces the icons', async () => {
    const sortedOptions = new SortedOptions(new Icon('A-Z', 'font-weight:bold;', ['my-asc']), new Icon('Z-A', '', ['my-desc']));
    const { host, api } = await mountMouseTable({ tableOptions: { sortedOptions } });
    api.sortByColumn('name', 'asc');
    const icon = sortIcon(host, 1)!;
    expect(icon.textContent).toBe('A-Z');
    expect(icon.classList).toContain('my-asc');
    expect(icon.style.fontWeight).toBe('bold');
  });

  it('a preset ColumnDef.sortState shows the icon but does not sort the rows', async () => {
    const sortState: SortState = 'desc';
    const columnDefs = [
      ColumnDef.create({ property: 'id', width: px100, sortable: TrueFn, sortState }),
      ColumnDef.create({ property: 'name', width: px100 }),
    ];
    const { host } = await mountMouseTable({ columnDefs });
    // NOTE: the header says "descending", the rows are in their original order (sorting happens only on a
    // double click, api.sortByColumn() or autoRestoreOptions).
    expect(sortIcon(host, 0)!.textContent).toBe('↓');
    expect(renderedRows(host)[0].querySelector('[data-col-index="0"]')!.textContent).toBe('0');
  });
});

describe('column resize by dragging the header edge (columnsResizable)', () => {

  const resizeHandle = (host: HTMLElement, col: number) =>
    host.querySelector<HTMLElement>(`.ge-table-header-center .ge-table-column-resize-handle[data-col-index="${col}"]`);

  it('renders a resize handle at the right edge of every header cell', async () => {
    const { host } = await mountMouseTable();
    const handles = Array.from(host.querySelectorAll<HTMLElement>('.ge-table-header-center .ge-table-column-resize-handle'));
    expect(handles.map(h => h.getAttribute('data-col-index'))).toEqual(['0', '1', '2']);
    const handle = handles[1];
    expect(handle.getAttribute('data-ge-action')).toBe('resize-column');
    expect(handle.style.cursor).toBe('col-resize');
    expect(stylePx(handle, 'width')).toBe(4); // TableOptions.columnResizeHandleWidthInPx
    expect(stylePx(handle, 'left')).toBe(100 + 100 - 4);
    expect(stylePx(handle, 'height')).toBe(34);
    expect(host.querySelector('.ge-table-body-center .ge-table-column-resize-handle')).toBeNull();
  });

  it('columnResizeHandleWidthInPx sets the handle width', async () => {
    const { host } = await mountMouseTable({ tableOptions: { columnResizeHandleWidthInPx: 10 } });
    const handle = resizeHandle(host, 0)!;
    expect(stylePx(handle, 'width')).toBe(10);
    expect(stylePx(handle, 'left')).toBe(90);
  });

  it('columnsResizable = false renders no handles', async () => {
    const { host } = await mountMouseTable({ tableOptions: { columnsResizable: false } });
    expect(host.querySelectorAll('.ge-table-column-resize-handle')).toHaveLength(0);
  });

  it('dragging the handle 52 px to the right widens the column by 52 px', async () => {
    const { host, model, dragging, draggingEnd } = await mountMouseTable();
    const handle = resizeHandle(host, 0)!; // centre at x = 98
    await userEvent.dragAndDrop(handle, getCellDiv(host, 'header', 'center', 0, 1), { targetPosition: { x: 50, y: 10 } });
    await nextFrame();
    expect(model.getColumnWidth(0)).toBe(152);
    expect(getCellDiv(host, 'body', 'center', 0, 0).style.width).toBe('152px');
    expect(getCellDiv(host, 'body', 'center', 0, 1).style.left).toBe('152px');
    expect(stylePx(resizeHandle(host, 0)!, 'left')).toBe(148);
    expect(stylePx(host.querySelector<HTMLElement>('.ge-table-scroll-content-wrapper')!, 'width')).toBe(352);
    expect(dragging.length).toBeGreaterThan(0);
    expect(draggingEnd).toHaveLength(1);
    expect(draggingEnd[0].draggingX).toBe(52);
  });

  it('dragging to the left narrows the column', async () => {
    const { host, model } = await mountMouseTable();
    await userEvent.dragAndDrop(resizeHandle(host, 1)!, getCellDiv(host, 'header', 'center', 0, 1), { targetPosition: { x: 40, y: 10 } });
    await nextFrame();
    expect(model.getColumnWidth(1)).toBe(100 - (198 - 140));
  });

  it('dragging ignores ColumnDef.maxWidth', async () => {
    const columnDefs = [
      ColumnDef.create({ property: 'id', width: px100, maxWidth: px150 }),
      ColumnDef.create({ property: 'name', width: px100 }),
      ColumnDef.create({ property: 'value', width: px100 }),
    ];
    const { host, model } = await mountMouseTable({ columnDefs });
    await userEvent.dragAndDrop(resizeHandle(host, 0)!, getCellDiv(host, 'header', 'center', 0, 2), { targetPosition: { x: 50, y: 10 } });
    await nextFrame();
    // NOTE: min/maxWidth only apply to % widths (table-model.ts recalcColumnWidths), not when dragging (TODO.md).
    expect(model.getColumnWidth(0)).toBe(252);
  });
});

describe('column drag & drop (columnsDraggable)', () => {

  it('dragging the header of column 0 onto column 2 moves the column', async () => {
    const { host, model } = await mountMouseTable();
    expect(headerLabels(host)).toEqual(['ID', 'NAME', 'VALUE']);
    await userEvent.dragAndDrop(getCellDiv(host, 'header', 'center', 0, 0), getCellDiv(host, 'header', 'center', 0, 2));
    await nextFrame();
    expect(headerLabels(host)).toEqual(['NAME', 'VALUE', 'ID']);
    expect(model.getColumnDefs()!.map(cd => cd.property)).toEqual(['name', 'value', 'id']);
    const row5 = renderedRows(host)[5];
    expect(Array.from(row5.querySelectorAll('.ge-table-label'), e => e.textContent)).toEqual(['Name 5', '15', '5']);
    // the ghost column and the drop zone are gone after the drop
    expect(host.querySelector<HTMLElement>('.ge-table-dragging-column')!.style.display).toBe('none');
    expect(host.querySelector('.ge-table-drop-zone')).toBeNull();
  });

  it('while dragging: ghost column with the dragged column, drop zone in the target column', async () => {
    const { host } = await mountMouseTable();
    const header0 = getCellDiv(host, 'header', 'center', 0, 0);
    fireMouse(header0, 'mousedown');
    fireMouse(header0, 'mousemove', { clientX: header0.getBoundingClientRect().left + 60 }); // still in column 0
    await nextFrame();
    const ghost = host.querySelector<HTMLElement>('.ge-table-dragging-column')!;
    expect(ghost.style.display).toBe('block');
    expect(stylePx(ghost, 'width')).toBe(100);
    expect(ghost.querySelector('[data-area="header"]')!.textContent).toBe('ID');
    expect(ghost.querySelector('[data-area="body"][data-row-index="0"]')!.textContent).toBe('0');

    fireMouse(getCellDiv(host, 'header', 'center', 0, 2), 'mousemove');
    await nextFrame();
    // the column is moved while dragging; the drop zone replaces its body cells
    expect(headerLabels(host)).toEqual(['NAME', 'VALUE', 'ID']);
    const dropZones = host.querySelectorAll<HTMLElement>('.ge-table-body-center .ge-table-drop-zone');
    expect(dropZones.length).toBe(renderedRows(host).length);
    expect(stylePx(dropZones[0], 'left')).toBe(200);
    expect(ghost.querySelector('[data-area="header"]')!.textContent).toBe('ID');

    fireMouse(getCellDiv(host, 'header', 'center', 0, 2), 'mouseup');
    await nextFrame();
    expect(ghost.style.display).toBe('none');
    expect(host.querySelector('.ge-table-drop-zone')).toBeNull();
  });

  // BUG: render-scope.ts:1433 renders EVERY body row of the column into the ghost (not only the visible ones) – a
  // header drag in a table with millions of rows creates millions of divs and freezes the page.
  it.fails('the ghost column renders only the visible rows', async () => {
    const { host } = await mountMouseTable({ rows: 2_000 });
    const header0 = getCellDiv(host, 'header', 'center', 0, 0);
    fireMouse(header0, 'mousedown');
    fireMouse(header0, 'mousemove', { clientX: header0.getBoundingClientRect().left + 60 });
    await nextFrame();
    const ghostCells = host.querySelectorAll('.ge-table-dragging-column [data-area="body"].ge-table-col-div').length;
    fireMouse(header0, 'mouseup');
    expect(ghostCells).toBeLessThanOrEqual(renderedRows(host).length);
  });

  // BUG: render-scope.ts:1385 sets the style 'overfllow' (typo) instead of overflow – the ghost (host height) is not
  // clipped, its rows spill out below the table while dragging.
  it.fails('the ghost column is clipped to the table height', async () => {
    const { host } = await mountMouseTable();
    const header0 = getCellDiv(host, 'header', 'center', 0, 0);
    fireMouse(header0, 'mousedown');
    fireMouse(header0, 'mousemove', { clientX: header0.getBoundingClientRect().left + 60 });
    await nextFrame();
    const ghost = host.querySelector<HTMLElement>('.ge-table-dragging-column')!;
    const overflow = getComputedStyle(ghost).overflowY;
    fireMouse(header0, 'mouseup');
    expect(overflow).not.toBe('visible');
  });

  it('the ghost column uses the renderers, classes and styles of the column', async () => {
    const columnDefs = [
      ColumnDef.create({
        property: 'id', headerLabel: 'ID', width: px100, bodyClasses: ['my-id'],
        bodyRenderer: { render: (cell, _r, _c, _a, _m, value) => { cell.textContent = `#${value}`; return undefined; } },
      }),
      ColumnDef.create({ property: 'name', width: px100 }),
    ];
    const { host } = await mountMouseTable({ columnDefs, rows: 5 });
    const header0 = getCellDiv(host, 'header', 'center', 0, 0);
    fireMouse(header0, 'mousedown');
    fireMouse(header0, 'mousemove', { clientX: header0.getBoundingClientRect().left + 60 });
    await nextFrame();
    const ghostCells = Array.from(host.querySelectorAll<HTMLElement>('.ge-table-dragging-column [data-area="body"].ge-table-col-div'));
    expect(ghostCells.map(c => c.textContent)).toEqual(['#0', '#1', '#2', '#3', '#4']);
    expect(ghostCells.every(c => c.classList.contains('my-id'))).toBe(true);
    fireMouse(header0, 'mouseup');
    await nextFrame();
  });

  // BUG: table-scope.ts:384/393 – the column is moved BEFORE the ghost is rendered with the START index; when the
  // first mouse move is already over another column (fast drag), the ghost shows the column that now sits at the
  // start index instead of the dragged one.
  it.fails('a fast drag shows the dragged column in the ghost', async () => {
    const { host } = await mountMouseTable();
    fireMouse(getCellDiv(host, 'header', 'center', 0, 0), 'mousedown');
    fireMouse(getCellDiv(host, 'header', 'center', 0, 1), 'mousemove');
    await nextFrame();
    const ghost = host.querySelector<HTMLElement>('.ge-table-dragging-column')!;
    expect(ghost.querySelector('[data-area="header"]')!.textContent).toBe('ID');
  });

  it('columnsDraggable = false keeps the column order', async () => {
    const { host, model } = await mountMouseTable({ tableOptions: { columnsDraggable: false } });
    await userEvent.dragAndDrop(getCellDiv(host, 'header', 'center', 0, 0), getCellDiv(host, 'header', 'center', 0, 2));
    await nextFrame();
    expect(headerLabels(host)).toEqual(['ID', 'NAME', 'VALUE']);
    expect(model.getColumnDefs()!.map(cd => cd.property)).toEqual(['id', 'name', 'value']);
  });
});

describe('hover row and column (hoverRowVisible / hoverColumnVisible)', () => {

  const hoverRow = (host: HTMLElement) => host.querySelector<HTMLElement>('.ge-table-hover-row')!;
  const hoverColumn = (host: HTMLElement) => host.querySelector<HTMLElement>('.ge-table-hover-column')!;

  it('hovering a body cell shows the hover row and column on that cell', async () => {
    const { host, moved } = await mountMouseTable({ fixedLeft: 1 });
    const cell = getCellDiv(host, 'body', 'center', 3, 2);
    await userEvent.hover(cell);
    await vi.waitFor(() => expect(hoverRow(host).style.display).toBe('block'));
    expect(stylePx(hoverRow(host), 'top')).toBe(topInHost(host, cell));
    expect(stylePx(hoverRow(host), 'height')).toBe(34);
    expect(stylePx(hoverRow(host), 'width')).toBe(host.clientWidth);
    expect(hoverColumn(host).style.display).toBe('block');
    expect(stylePx(hoverColumn(host), 'left')).toBe(leftInHost(host, cell));
    expect(stylePx(hoverColumn(host), 'width')).toBe(100);
    expect(stylePx(hoverColumn(host), 'height')).toBe(host.clientHeight);
    expect(moved[moved.length - 1]).toMatchObject({ rowIndex: 3, columnIndex: 2, areaIdent: 'body' });
  });

  it('the hover row follows the scroll position', async () => {
    const { host, api } = await mountMouseTable({ rows: 1000 });
    api.scrollToPixel(0, 34 * 300 + 10);
    await nextFrame();
    const cell = getCellDiv(host, 'body', 'center', 303, 1);
    await userEvent.hover(cell);
    await vi.waitFor(() => expect(hoverRow(host).style.display).toBe('block'));
    expect(stylePx(hoverRow(host), 'top')).toBe(topInHost(host, cell));
  });

  it('hoverRowVisible / hoverColumnVisible = false keep both hidden', async () => {
    const { host, moved } = await mountMouseTable({ tableOptions: { hoverRowVisible: false, hoverColumnVisible: false } });
    await userEvent.hover(getCellDiv(host, 'body', 'center', 3, 2));
    await vi.waitFor(() => expect(moved.length).toBeGreaterThan(0));
    expect(hoverRow(host).style.display).toBe('none');
    expect(hoverColumn(host).style.display).toBe('none');
  });

  it('a repaint hides the hover row and column', async () => {
    const { host, api } = await mountMouseTable();
    await userEvent.hover(getCellDiv(host, 'body', 'center', 3, 2));
    await vi.waitFor(() => expect(hoverRow(host).style.display).toBe('block'));
    api.repaint();
    expect(hoverRow(host).style.display).toBe('none');
    expect(hoverColumn(host).style.display).toBe('none');
  });

  // BUG: render-scope.ts:1253 adjustHoverRows() does not check the area – the header row 0 is drawn as hover row at
  // the position of BODY row 0 (top = header height).
  it.fails('hovering a header cell shows no hover row on the body', async () => {
    const { host, moved } = await mountMouseTable();
    await userEvent.hover(getCellDiv(host, 'header', 'center', 0, 1));
    await vi.waitFor(() => expect(moved.length).toBeGreaterThan(0));
    expect(hoverRow(host).style.display).toBe('none');
  });

  // BUG: render-scope.ts:1297 subtracts scrollLeft for every column – the hover column of a fixed (west) column
  // moves away from the column when the table is scrolled horizontally.
  it.fails('the hover column stays on a fixed west column after horizontal scrolling', async () => {
    const columnDefs = Array.from({ length: 20 }, (_, i) => ColumnDef.create({ property: i === 0 ? 'id' : 'p' + i, width: px100 }));
    const { host, api } = await mountMouseTable({ fixedLeft: 1, columnDefs });
    api.scrollToPixel(300, 0);
    await nextFrame();
    const cell = getCellDiv(host, 'body', 'west', 2, 0);
    await userEvent.hover(cell);
    await vi.waitFor(() => expect(hoverColumn(host).style.display).toBe('block'));
    expect(stylePx(hoverColumn(host), 'left')).toBe(leftInHost(host, cell));
  });
});

describe('context menu (onContextmenu)', () => {

  it('a right click reports the cell as GeMouseEvent', async () => {
    const { host, contextmenu } = await mountMouseTable();
    // NOTE: table-scope.ts:438 initialises the 50 ms throttle with the creation time – a context menu within the
    // first 50 ms after creating the table is swallowed. Let the clock run past it:
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 1_000);
    let defaultPrevented: boolean | undefined;
    host.addEventListener('contextmenu', e => { defaultPrevented = e.defaultPrevented; });
    await userEvent.click(getCellDiv(host, 'body', 'center', 2, 1), { button: 'right' });
    expect(contextmenu).toHaveLength(1);
    expect(contextmenu[0]).toMatchObject({ rowIndex: 2, columnIndex: 1, areaIdent: 'body', sideIdent: 'center' });
    expect(contextmenu[0].originalEvent?.type).toBe('contextmenu');
    expect(defaultPrevented).toBe(false); // the browser menu is not suppressed – that is up to the listener
  });

  it('a second context menu within 50 ms is swallowed', async () => {
    const { host, contextmenu } = await mountMouseTable();
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 1_000); // past the throttle of the creation time
    const cell = getCellDiv(host, 'body', 'center', 2, 1);
    fireMouse(cell, 'contextmenu');
    const second = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    cell.dispatchEvent(second);
    // NOTE: throttle in table-scope.ts:448 – the second event is not reported and its default is prevented.
    expect(contextmenu).toHaveLength(1);
    expect(second.defaultPrevented).toBe(true);
  });
});
