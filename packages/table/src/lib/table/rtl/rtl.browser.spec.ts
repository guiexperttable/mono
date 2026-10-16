// Right-to-left tables (tableOptions.direction, since 1.1.98) in a real browser: the reference cases R1–R15 of
// prompts/012-rtl.md. Positions are checked with getBoundingClientRect (what the user sees), not only inline styles.
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import {
  CellRange,
  ColumnDef,
  EventAdapter,
  FocusModel,
  SelectionModel,
  TableFactory,
  TreeFactory,
  px100,
  px200,
  px300,
} from '@guiexpert/table';
import type { ExcelExportOptionsIf, GeMouseEvent, TableModelIf, TableOptionsIf } from '@guiexpert/table';
import {
  areaRows,
  cellDiv,
  columnIndices,
  createRows,
  destroyAllTables,
  getCellDiv,
  mountTable,
  nextFrame,
  renderedRows,
  startPx,
  stylePx,
} from '../../../../test-utils/mount-table';
import { axeViolations } from '../../../../test-utils/axe';

afterEach(() => {
  destroyAllTables();
  document.documentElement.removeAttribute('dir');
});

const rtl: Partial<TableOptionsIf> = { direction: 'rtl' };

/** `columns` columns à 100 px ("H0" …), cell values "row/column". */
function wideModel(opts: { columns?: number; rows?: number; fixedLeft?: number; fixedRight?: number; footer?: boolean } = {}): TableModelIf {
  const columnCount = opts.columns ?? 30;
  const columnDefs = Array.from({ length: columnCount },
    (_, c) => ColumnDef.create({ property: 'c' + c, headerLabel: 'H' + c, width: px100 }));
  const rows = Array.from({ length: opts.rows ?? 50 },
    (_, r) => Object.fromEntries(columnDefs.map((cd, c) => [cd.property, `${r}/${c}`])));
  return TableFactory.createTableModel({
    rows,
    columnDefs,
    fixedLeftColumnCount: opts.fixedLeft ?? 0,
    fixedRightColumnCount: opts.fixedRight ?? 0,
    footerData: opts.footer ? [columnDefs.map((_, c) => 'F' + c)] : undefined,
  });
}

const abcModel = () => TableFactory.createTableModel({
  rows: createRows(20),
  columnDefs: [
    ColumnDef.create({ property: 'id', headerLabel: 'A', width: px100 }),
    ColumnDef.create({ property: 'name', headerLabel: 'B', width: px100 }),
    ColumnDef.create({ property: 'value', headerLabel: 'C', width: px100 }),
  ],
});

const rect = (el: Element) => el.getBoundingClientRect();
const near = (a: number, b: number, tolerance = 1.01) => expect(Math.abs(a - b)).toBeLessThanOrEqual(tolerance);

function fireMouse(target: Element, type: string, init: MouseEventInit = {}) {
  const r = target.getBoundingClientRect();
  target.dispatchEvent(new MouseEvent(type, {
    bubbles: true, cancelable: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, ...init,
  }));
}

function pointer(target: EventTarget, type: string, x: number, y: number, init: PointerEventInit = {}): PointerEvent {
  const evt = new PointerEvent(type, {
    bubbles: true, cancelable: true, composed: true, clientX: x, clientY: y,
    pointerId: 1, pointerType: 'mouse', button: 0, buttons: type === 'pointerup' ? 0 : 1, isPrimary: true, ...init,
  });
  target.dispatchEvent(evt);
  return evt;
}

function keydown(host: HTMLElement, key: string, init: KeyboardEventInit = {}) {
  host.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }));
}

describe('R1 – columns from right to left', () => {

  it('column A on the right, C on the left; header and body alike', async () => {
    const { host } = mountTable(abcModel(), { tableOptions: rtl });
    await nextFrame();
    expect(host.getAttribute('dir')).toBe('rtl');
    const hostRect = rect(host);
    for (const area of ['header', 'body'] as const) {
      const a = getCellDiv(host, area, 'center', 0, 0);
      const b = getCellDiv(host, area, 'center', 0, 1);
      const c = getCellDiv(host, area, 'center', 0, 2);
      near(rect(a).right, hostRect.right - host.clientLeft);
      expect(rect(b).right).toBeCloseTo(rect(a).left, 0);
      expect(rect(c).right).toBeCloseTo(rect(b).left, 0);
      // written as "right", never "left"
      expect(a.style.right).toBe('0px');
      expect(a.style.left).toBe('');
      expect(startPx(c)).toBe(200);
    }
  });

  it('the text of a cell is right-to-left (inherited from the host)', async () => {
    const { host } = mountTable(abcModel(), { tableOptions: rtl });
    await nextFrame();
    expect(getComputedStyle(getCellDiv(host, 'body', 'center', 0, 1)).direction).toBe('rtl');
  });
});

describe('R2 – fixed columns at start and end', () => {

  it('fixedLeftColumnCount = start (right), fixedRightColumnCount = end (left)', async () => {
    const { host } = mountTable(wideModel({ fixedLeft: 1, fixedRight: 1 }), {
      tableOptions: { ...rtl, fixedWestSeparatorBorderVisible: true, fixedEastSeparatorBorderVisible: true },
    });
    await nextFrame();
    const hostRect = rect(host);
    const west = getCellDiv(host, 'body', 'west', 0, 0);
    const east = getCellDiv(host, 'body', 'east', 0, 29);
    const center = getCellDiv(host, 'body', 'center', 0, 1);
    near(rect(west).right, hostRect.right);
    near(rect(east).left, hostRect.left);
    expect(rect(center).right).toBeLessThanOrEqual(rect(west).left + 0.5);
    // the separator lines between the fixed and the scrolled columns
    const westBorder = host.querySelector<HTMLElement>('.ge-table-west-fixed-column-border')!;
    const eastBorder = host.querySelector<HTMLElement>('.ge-table-east-fixed-column-border')!;
    near(rect(westBorder).right, rect(west).left);
    near(rect(eastBorder).right, rect(east).right + 1);
  });
});

describe('R3 – horizontal scrolling in reading direction', () => {

  it('at the start the first columns are visible on the right, scrollLeft 0', async () => {
    const { host, scope } = mountTable(wideModel(), { tableOptions: rtl });
    await nextFrame();
    expect(scope.scrollViewport.scrollLeft).toBe(0);
    expect(columnIndices(renderedRows(host)[0])[0]).toBe(0);
    near(rect(getCellDiv(host, 'body', 'center', 0, 0)).right, rect(scope.scrollViewport).right);
  });

  it('scrolling to the end shows the last column flush at the left edge – no gap', async () => {
    const { host, scope } = mountTable(wideModel(), { tableOptions: rtl });
    await nextFrame();
    const vp = scope.scrollViewport;
    const max = vp.scrollWidth - vp.clientWidth;
    scope.setViewportScrollLeft(max);
    expect(vp.scrollLeft).toBe(-max); // physical: negative to the left (CSSOM View)
    scope.adjustAfterScrolling();
    await nextFrame();
    expect(scope.getViewportScrollLeft()).toBe(max);
    const last = getCellDiv(host, 'body', 'center', 0, 29);
    // the vertical scroll bar is on the left in a right-to-left scroll container
    near(rect(last).left, rect(vp).left + vp.clientLeft);
    // every rendered row is contiguous and ends with the last column
    const cols = columnIndices(renderedRows(host)[0]);
    expect(cols[cols.length - 1]).toBe(29);
    cols.forEach((c, i) => expect(c).toBe(cols[0] + i));
  });

  it('scrolling with the scroll bar renders the columns of the new position', async () => {
    const { host, scope } = mountTable(wideModel({ footer: true }), { tableOptions: rtl });
    await nextFrame();
    scope.scrollViewport.scrollLeft = -1000;
    scope.adjustAfterScrolling();
    await nextFrame();
    const bodyCols = columnIndices(renderedRows(host)[0]);
    expect(bodyCols).toContain(12);
    expect(bodyCols).not.toContain(0);
    expect(columnIndices(areaRows(host, 'header')[0])).toEqual(bodyCols);
    expect(columnIndices(areaRows(host, 'footer')[0])).toEqual(bodyCols);
    // the cell at 1000 px from the start sits at the right edge of the viewport
    const cell = Array.from(renderedRows(host)[0].querySelectorAll<HTMLElement>(':scope > .ge-table-col-div'))
      .find(c => Math.abs(rect(c).right - (rect(scope.scrollViewport).right)) < 2);
    expect(cell?.getAttribute('data-col-index')).toBe('10');
  });

  it('scrollToIndex(x, y): the column becomes the first (rightmost) visible column', async () => {
    const { host, api, scope } = mountTable(wideModel({ fixedLeft: 1 }), { tableOptions: rtl });
    await nextFrame();
    api.scrollToIndex(10, 0);
    scope.adjustAfterScrolling();
    await nextFrame();
    const cell = getCellDiv(host, 'body', 'center', 0, 10);
    near(rect(cell).right, rect(scope.scrollViewport).right);
    expect(scope.scrollViewport.scrollLeft).toBeLessThan(0);
  });

  it('ensureColumnIsVisible scrolls in reading direction and back', async () => {
    const { host, api, scope } = mountTable(wideModel(), { tableOptions: rtl });
    await nextFrame();
    expect(api.ensureColumnIsVisible(20)).toBe(true);
    await nextFrame();
    const vp = scope.scrollViewport;
    const cell = getCellDiv(host, 'body', 'center', 0, 20);
    near(rect(cell).left, rect(vp).left + vp.clientLeft);
    expect(api.ensureColumnIsVisible(20)).toBe(false); // already visible
    expect(api.ensureColumnIsVisible(0)).toBe(true);
    await nextFrame();
    near(rect(getCellDiv(host, 'body', 'center', 0, 0)).right, rect(vp).right);
  });

  it('scrollToPixel(x, y): x counts from the start; onScroll reports it from the start', async () => {
    const scrolls: number[] = [];
    const listener = new EventAdapter();
    listener.onScroll = e => scrolls.push(e.scrollLeft);
    const { api, scope } = mountTable(wideModel(), { tableOptions: rtl, eventListener: listener });
    await nextFrame();
    api.scrollToPixel(300, 0);
    scope.adjustAfterScrolling();
    expect(scope.scrollViewport.scrollLeft).toBe(-300);
    expect(scrolls[scrolls.length - 1]).toBe(300);
  });
});

describe('R4 – resizing a column', () => {

  it('the handle is at the left edge of the header cell; dragging it to the left widens the column', async () => {
    const { host, scope } = mountTable(abcModel(), { tableOptions: rtl });
    await nextFrame();
    const handle = host.querySelector<HTMLElement>('.ge-table-header-center .ge-table-column-resize-handle[data-col-index="0"]')!;
    const header0 = getCellDiv(host, 'header', 'center', 0, 0);
    near(rect(handle).left, rect(header0).left);
    expect(handle.style.left).toBe('');

    const h = rect(handle);
    const y = h.top + h.height / 2;
    handle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: h.left + 1, clientY: y }));
    host.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: h.left - 29, clientY: y }));
    host.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: h.left - 29, clientY: y }));
    await nextFrame();
    expect(scope.tableModel.getColumnWidth(0)).toBe(130);
    expect(stylePx(getCellDiv(host, 'body', 'center', 0, 1), 'right')).toBe(130);
  });
});

describe('R5 – dragging a column', () => {

  it('the ghost column follows the pointer, the column moves', async () => {
    const { host, scope } = mountTable(abcModel(), { tableOptions: rtl });
    await nextFrame();
    const header0 = getCellDiv(host, 'header', 'center', 0, 0);
    fireMouse(header0, 'mousedown');
    const x = rect(header0).left + 30;
    fireMouse(header0, 'mousemove', { clientX: x });
    await nextFrame();
    const ghost = host.querySelector<HTMLElement>('.ge-table-dragging-column')!;
    expect(ghost.style.display).toBe('block');
    // its center is under the pointer
    near(rect(ghost).left + rect(ghost).width / 2, x);
    fireMouse(getCellDiv(host, 'header', 'center', 0, 2), 'mousemove');
    fireMouse(getCellDiv(host, 'header', 'center', 0, 2), 'mouseup');
    await nextFrame();
    expect(scope.tableModel.getColumnDefs()!.map(cd => cd.property)).toEqual(['name', 'value', 'id']);
    // the moved column is now the third from the right (the end of the row)
    const id = Array.from(host.querySelectorAll<HTMLElement>('.ge-table-header-center .ge-table-col-div'))
      .find(c => c.textContent === 'A')!;
    near(rect(id).right, rect(host).right - 200);
  });
});

describe('R6 – range selection and hover column', () => {

  it('dragging over cells selects the cells under the pointer', async () => {
    const sm = new SelectionModel('range', 'multi');
    const { host } = mountTable(abcModel(), { tableOptions: { ...rtl, getSelectionModel: () => sm } });
    await nextFrame();
    await userEvent.dragAndDrop(getCellDiv(host, 'body', 'center', 1, 0), getCellDiv(host, 'body', 'center', 3, 2));
    await nextFrame();
    expect(sm.isSelected(1, 0)).toBe(true);
    expect(sm.isSelected(3, 2)).toBe(true);
    expect(sm.isSelected(2, 1)).toBe(true);
    expect(sm.isSelected(4, 1)).toBe(false);
    const selected = host.querySelector<HTMLElement>('.ge-table-body-center-selected-range')!;
    const cellRect = rect(getCellDiv(host, 'body', 'center', 1, 0));
    const anySelectionOverCell = Array.from(host.querySelectorAll<HTMLElement>('.ge-table-body-center-selected-range'))
      .some(d => Math.abs(rect(d).left - cellRect.left) < 1 && Math.abs(rect(d).top - cellRect.top) < 1);
    expect(selected).not.toBeNull();
    expect(anySelectionOverCell).toBe(true);
  });

  it('the hover column lies over the hovered cell', async () => {
    const { host } = mountTable(abcModel(), { tableOptions: { ...rtl, hoverColumnVisible: true } });
    await nextFrame();
    const cell = getCellDiv(host, 'body', 'center', 2, 1);
    fireMouse(cell, 'mousemove');
    await nextFrame();
    const hover = host.querySelector<HTMLElement>('.ge-table-hover-column')!;
    expect(hover.style.display).toBe('block');
    near(rect(hover).left, rect(cell).left);
    near(rect(hover).width, rect(cell).width);
  });
});

describe('R7 – tree', () => {

  interface Node { name: string; children?: Node[] }

  function treeModel() {
    const data: Node[] = [{ name: 'root', children: [{ name: 'child', children: [{ name: 'leaf' }] }] }];
    const rows = TreeFactory.buildTreeRows(data, { expanded: true });
    return TableFactory.createTableModel({
      rows,
      columnDefs: [ColumnDef.create({ property: 'name', headerLabel: 'Name', width: px200 })],
    });
  }

  it('indent from the right, arrow on the right side of the cell', async () => {
    const { host } = mountTable(treeModel(), { tableOptions: rtl });
    await nextFrame();
    const rootCell = getCellDiv(host, 'body', 'center', 0, 0);
    const childCell = getCellDiv(host, 'body', 'center', 1, 0);
    expect(getComputedStyle(childCell).paddingRight).not.toBe('0px');
    expect(parseFloat(getComputedStyle(childCell).paddingRight)).toBeGreaterThan(parseFloat(getComputedStyle(rootCell).paddingRight));
    expect(getComputedStyle(childCell).paddingLeft).toBe('0px');
    const arrow = rootCell.querySelector<HTMLElement>('.ge-table-tree-arrow-div')!;
    const cellRect = rect(rootCell);
    expect(rect(arrow).left).toBeGreaterThan(cellRect.left + cellRect.width / 2);
    // the text is left of the arrow (behind it in reading direction)
    const range = document.createRange();
    range.selectNodeContents(rootCell.querySelector<HTMLElement>('.ge-table-label-div')!);
    expect(range.getBoundingClientRect().right).toBeLessThan(rect(arrow).left + rect(arrow).width / 2);
    // collapsed arrows are mirrored by the browser (">" in a right-to-left cell), the expanded one points down
    expect(getComputedStyle(arrow).transform).not.toBe('none');
  });
});

describe('R8 – arrow keys in reading direction', () => {

  it('→ moves to the previous (right) column, ← to the next', async () => {
    const fm = new FocusModel('cell');
    const { host } = mountTable(abcModel(), { tableOptions: { ...rtl, getFocusModel: () => fm } });
    await nextFrame();
    fm.setFocus(0, 1);
    keydown(host, 'ArrowLeft');
    expect(fm.getFocus()).toEqual([0, 2]);
    keydown(host, 'ArrowRight');
    keydown(host, 'ArrowRight');
    expect(fm.getFocus()).toEqual([0, 0]);
    keydown(host, 'ArrowDown');
    expect(fm.getFocus()).toEqual([1, 0]);
    // Home/End stay logical: start = first column
    keydown(host, 'End');
    expect(fm.getFocus()).toEqual([1, 2]);
    keydown(host, 'Home');
    expect(fm.getFocus()).toEqual([1, 0]);
  });

  it('left-to-right is unchanged', async () => {
    const fm = new FocusModel('cell');
    const { host } = mountTable(abcModel(), { tableOptions: { getFocusModel: () => fm } });
    await nextFrame();
    fm.setFocus(0, 1);
    keydown(host, 'ArrowLeft');
    expect(fm.getFocus()).toEqual([0, 0]);
  });
});

describe('R9 – text alignment', () => {

  it('"start" is right; ge-table-text-align-left/-right describe start and end', async () => {
    const model = TableFactory.createTableModel({
      rows: createRows(5),
      columnDefs: [
        ColumnDef.create({ property: 'name', headerLabel: 'Name', width: px100, bodyClasses: ['ge-table-text-align-left'] }),
        ColumnDef.create({ property: 'value', headerLabel: 'Value', width: px100, bodyClasses: ['ge-table-text-align-right'] }),
      ],
    });
    const { host } = mountTable(model, { tableOptions: rtl });
    await nextFrame();
    const text = getCellDiv(host, 'body', 'center', 1, 0);
    const number = getCellDiv(host, 'body', 'center', 1, 1);
    expect(getComputedStyle(text).textAlign).toBe('start');
    expect(getComputedStyle(number).textAlign).toBe('end');
    // rendered: the text hugs the right edge, the number the left edge of its cell
    const range = document.createRange();
    range.selectNodeContents(text.querySelector('.ge-table-label')!);
    expect(rect(text).right - range.getBoundingClientRect().right).toBeLessThan(15);
    range.selectNodeContents(number.querySelector('.ge-table-label')!);
    expect(range.getBoundingClientRect().left - rect(number).left).toBeLessThan(15);
  });
});

describe('R10 – header groups and spans', () => {

  it('a header group covers its columns', async () => {
    const model = TableFactory.createTableModel({
      rows: createRows(5),
      headerData: [['Group', null, 'C'], ['A', 'B', 'C']] as never,
      columnDefs: [
        ColumnDef.create({ property: 'id', width: px100 }),
        ColumnDef.create({ property: 'name', width: px100 }),
        ColumnDef.create({ property: 'value', width: px100 }),
      ],
    });
    const headerModel = model.getAreaModel('header');
    headerModel.getColspanAt = (r: number, c: number) => (r === 0 && c === 0 ? 2 : 1);
    const { host } = mountTable(model, { tableOptions: rtl });
    await nextFrame();
    const group = Array.from(host.querySelectorAll<HTMLElement>('.ge-table-header-center .ge-table-col-div'))
      .find(c => c.textContent === 'Group')!;
    const a = getCellDiv(host, 'header', 'center', 1, 0);
    const b = getCellDiv(host, 'header', 'center', 1, 1);
    near(rect(group).right, rect(a).right);
    near(rect(group).left, rect(b).left);
  });
});

describe('R11 – Excel', () => {

  it('a right-to-left table exports a right-to-left sheet', async () => {
    const calls: (ExcelExportOptionsIf | undefined)[] = [];
    const { api, scope } = mountTable(abcModel(), { tableOptions: rtl });
    (scope as unknown as { excelService: unknown }).excelService = {
      downloadExcel: (_m: unknown, _f: string, _a?: string, o?: ExcelExportOptionsIf) => { calls.push(o); },
    };
    await api.downloadExcel('x.xlsx');
    expect(calls).toEqual([{ rightToLeft: true }]);
  });
});

describe('R12 – mixed text', () => {

  it('Arabic, Latin and digits in one cell: complete, readable, nothing cut off', async () => {
    const text = 'الرياض Riyadh 2026 ١٢٣';
    const model = TableFactory.createTableModel({
      rows: [{ city: text }],
      columnDefs: [ColumnDef.create({ property: 'city', headerLabel: 'City', width: px300 })],
    });
    const { host } = mountTable(model, { tableOptions: rtl });
    await nextFrame();
    const label = getCellDiv(host, 'body', 'center', 0, 0).querySelector<HTMLElement>('.ge-table-label')!;
    expect(label.textContent).toBe(text);
    const cell = rect(getCellDiv(host, 'body', 'center', 0, 0));
    const range = document.createRange();
    range.selectNodeContents(label);
    const textRect = range.getBoundingClientRect();
    expect(textRect.left).toBeGreaterThanOrEqual(cell.left - 0.5);
    expect(textRect.right).toBeLessThanOrEqual(cell.right + 0.5);
  });
});

describe('R13 – features in right-to-left', () => {

  it('overlay covers the visible body', async () => {
    const { host, api } = mountTable(abcModel(), { tableOptions: rtl });
    await nextFrame();
    api.showLoadingOverlay();
    await nextFrame();
    const overlay = host.querySelector<HTMLElement>('.ge-table-overlay')!;
    near(rect(overlay).right, rect(host).right);
    expect(overlay.style.left).toBe('');
  });

  it('row numbers: the first column on the right', async () => {
    const model = TableFactory.createTableModel({ rows: createRows(30), properties: ['id', 'name'], rowNumbersVisible: true });
    const { host } = mountTable(model, { tableOptions: rtl });
    await nextFrame();
    const number = getCellDiv(host, 'body', 'west', 0, 0);
    near(rect(number).right, rect(host).right);
    expect(number.textContent).toBe('1');
  });

  it('row drag: the handle at the start (right) of the cell, the ghost beside the pointer', async () => {
    const model = TableFactory.createTableModel({
      rows: createRows(10),
      columnDefs: [
        ColumnDef.create({ property: 'name', headerLabel: 'Name', width: px200, rowDrag: true }),
        ColumnDef.create({ property: 'value', headerLabel: 'Value', width: px100 }),
      ],
    });
    const { host } = mountTable(model, { tableOptions: rtl });
    await nextFrame();
    const cell = getCellDiv(host, 'body', 'center', 1, 0);
    const handle = cell.querySelector<HTMLElement>('.ge-table-row-drag-handle')!;
    expect(rect(handle).right).toBeGreaterThan(rect(cell).right - 20);
    const h = rect(handle);
    pointer(handle, 'pointerdown', h.left + 4, h.top + 4);
    pointer(document, 'pointermove', h.left + 4, h.top + 14);
    const to = rect(getCellDiv(host, 'body', 'center', 5, 1));
    pointer(document, 'pointermove', to.left + 10, to.top + to.height / 2);
    const ghost = host.querySelector<HTMLElement>('.ge-table-row-drag-ghost')!;
    expect(rect(ghost).right).toBeLessThanOrEqual(to.left + 10 - 11);
    const indicator = host.querySelector<HTMLElement>('.ge-table-row-drop-indicator')!;
    near(rect(indicator).right, rect(host).right);
    pointer(document, 'pointerup', to.left + 10, to.top + to.height / 2);
  });

  it('fill handle: at the bottom end (left) corner; dragging to the left fills the next columns', async () => {
    const sm = new SelectionModel('range', 'multi');
    const rows = [{ a: 1, b: 0, c: 0 }, { a: 2, b: 0, c: 0 }];
    const model = TableFactory.createTableModel({
      rows,
      columnDefs: ['a', 'b', 'c'].map(p => ColumnDef.create({ property: p, headerLabel: p, width: px100, editable: () => true })),
    });
    const { host, api } = mountTable(model, { tableOptions: { ...rtl, fillHandle: true, getSelectionModel: () => sm } });
    await nextFrame();
    sm.addSelection(new CellRange(0, 0, 1, 0));
    api.repaint();
    await nextFrame();
    const fill = host.querySelector<HTMLElement>('.ge-table-fill-handle')!;
    const corner = rect(getCellDiv(host, 'body', 'center', 1, 0));
    const f = rect(fill);
    near(f.left + f.width / 2, corner.left, 1.5);
    near(f.top + f.height / 2, corner.bottom, 1.5);
    pointer(fill, 'pointerdown', f.left + 3, f.top + 3);
    pointer(document, 'pointermove', f.left - 3, f.top + 3);
    const target = rect(getCellDiv(host, 'body', 'center', 1, 2));
    pointer(document, 'pointermove', target.left + 50, target.top + 10);
    pointer(document, 'pointerup', target.left + 50, target.top + 10);
    await nextFrame();
    expect(rows.map(r => [r.a, r.b, r.c])).toEqual([[1, 1, 1], [2, 2, 2]]);
  });

  it('master/detail: the detail layer starts on the right; a nested table inherits right-to-left', async () => {
    const model = TableFactory.createTableModel({ rows: createRows(10), properties: ['id', 'name'] });
    const { host, api } = mountTable(model, {
      tableOptions: {
        ...rtl,
        masterDetail: {
          detailHeight: 120,
          detailRenderer: (_container, row, ctx) => {
            ctx.createTable({ tableModel: TableFactory.createTableModel({ rows: [{ x: (row as { id: number }).id }], properties: ['x'] }) });
          },
        },
      },
    });
    await nextFrame();
    api.setDetailExpanded(0, true);
    await nextFrame();
    await nextFrame();
    const layer = host.querySelector<HTMLElement>('.ge-table-detail-layer')!;
    near(rect(layer).right, rect(host).right);
    const nested = layer.querySelector<HTMLElement>('.ge-table')!;
    expect(nested.getAttribute('dir')).toBe('rtl');
  });
});

describe('R14 – direction "auto"', () => {

  it('<html dir="rtl"> + "auto" → right-to-left; the page direction alone changes nothing', async () => {
    document.documentElement.setAttribute('dir', 'rtl');
    const auto = mountTable(abcModel(), { tableOptions: { direction: 'auto' } });
    const plain = mountTable(abcModel());
    await nextFrame();
    expect(auto.api.getDirection()).toBe('rtl');
    expect(auto.host.getAttribute('dir')).toBe('rtl');
    expect(plain.api.getDirection()).toBe('ltr');
    expect(plain.host.getAttribute('dir')).toBe('ltr'); // a left-to-right table on a right-to-left page
    expect(getCellDiv(plain.host, 'body', 'center', 0, 0).style.left).toBe('0px');
    expect(plain.scope.scrollViewport.scrollLeft).toBe(0);
  });

  it('"auto" on a left-to-right page → left-to-right', async () => {
    const { api } = mountTable(abcModel(), { tableOptions: { direction: 'auto' } });
    expect(api.getDirection()).toBe('ltr');
  });
});

describe('R15 – left-to-right unchanged', () => {

  it('default: dir="ltr", positions written as "left"', async () => {
    const { host, api } = mountTable(abcModel());
    await nextFrame();
    expect(api.getDirection()).toBe('ltr');
    expect(host.getAttribute('dir')).toBe('ltr');
    const c = getCellDiv(host, 'body', 'center', 0, 2);
    expect(c.style.left).toBe('200px');
    expect(c.style.right).toBe('');
    expect(cellDiv(host, 'body', 'center', 0, 0)!.style.left).toBe('0px');
  });

  it('destroy() gives the host its dir attribute back', async () => {
    const host = document.createElement('div');
    host.setAttribute('dir', 'auto');
    const t1 = mountTable(abcModel(), { tableOptions: rtl });
    t1.host.setAttribute('data-x', '1');
    t1.api.destroy();
    expect(t1.host.hasAttribute('dir')).toBe(false);
    // an own value of the app is restored
    document.body.appendChild(host);
    host.style.cssText = 'position:relative;width:400px;height:300px';
    const { TableScope, SimpleDomService, TableOptions } = await import('@guiexpert/table');
    const scope = new TableScope(host, abcModel(), new SimpleDomService(), { ...new TableOptions(), direction: 'rtl' }, new EventAdapter());
    scope.firstInit();
    expect(host.getAttribute('dir')).toBe('rtl');
    scope.getApi().destroy();
    expect(host.getAttribute('dir')).toBe('auto');
    host.remove();
  });
});

describe('accessibility in right-to-left', () => {

  it('no axe violations', async () => {
    const fm = new FocusModel('cell');
    const { host } = mountTable(wideModel({ fixedLeft: 1, fixedRight: 1, footer: true }), { tableOptions: { ...rtl, getFocusModel: () => fm } });
    await nextFrame();
    fm.setFocus(0, 2);
    await nextFrame();
    expect(await axeViolations(host)).toEqual([]);
  });
});

describe('mouse events in right-to-left', () => {

  it('a click reports the clicked cell', async () => {
    const clicked: GeMouseEvent[] = [];
    const listener = new EventAdapter();
    listener.onMouseClicked = e => clicked.push(e);
    const { host } = mountTable(abcModel(), { tableOptions: rtl, eventListener: listener });
    await nextFrame();
    await userEvent.click(getCellDiv(host, 'body', 'center', 4, 2));
    expect(clicked[0].rowIndex).toBe(4);
    expect(clicked[0].columnIndex).toBe(2);
  });
});
