// Prompt 024, part B: onCellActivated – "open a cell" by Enter or double click, in every table.
//
// It is reported only if the gesture did nothing else. Enter: row checkbox → master/detail → tree node →
// Excel-style editing (move down / edit) keep their job. Double click: the editor of an editable cell, a tree node
// and the resize handle keep theirs. (Cover grid: tile-navigation/cover-grid-keyboard.browser.spec.ts.)
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import {
  CheckboxColumnDef,
  ColumnDef,
  EventAdapter,
  InputCellRenderer,
  TableFactory,
  TreeFactory,
  TrueFn,
  px100,
} from '@guiexpert/table';
import type { AreaIdent, AreaModelIf, CellRendererIf, GeCellActivateEvent, GeMouseEvent, TableModelIf, TableOptionsIf } from '@guiexpert/table';
import { createRows, destroyAllTables, getCellDiv, mountTable, nextFrame } from '../../../test-utils/mount-table';
import { createOrderModel, createOrders } from '../../../test-utils/master-detail-fixtures';

afterEach(() => {
  destroyAllTables();
  vi.restoreAllMocks();
});

async function mount(model: TableModelIf, tableOptions: Partial<TableOptionsIf> = {}) {
  const activated: GeCellActivateEvent[] = [];
  const clicked: GeMouseEvent[] = [];
  const listener = new EventAdapter();
  listener.onCellActivated = e => activated.push(e);
  listener.onMouseClicked = e => clicked.push(e);
  const table = mountTable(model, { eventListener: listener, tableOptions });
  await nextFrame();
  table.host.focus();
  const fm = table.scope.focusModel()!;
  const cell = (row: number, col: number) => getCellDiv(table.host, 'body', 'center', row, col);
  return { ...table, activated, clicked, fm, cell };
}

/** id | name (editable on demand) | value */
function listModel(editable = false, rowCount = 50) {
  const rows = createRows(rowCount);
  const model = TableFactory.createTableModel({
    rows,
    columnDefs: [
      ColumnDef.create({ property: 'id', headerLabel: 'Id', width: px100, sortable: TrueFn }),
      ColumnDef.create({ property: 'name', headerLabel: 'Name', width: px100, editable: editable ? TrueFn : undefined }),
      ColumnDef.create({ property: 'value', headerLabel: 'Value', width: px100 }),
    ],
  });
  return { rows, model };
}

interface Node { id: number; name: string; children?: Node[] }

function treeModel() {
  const nodes: Node[] = [
    { id: 1, name: 'A', children: [{ id: 11, name: 'A1' }, { id: 12, name: 'A2' }] },
    { id: 2, name: 'B' },
  ];
  const rows = TreeFactory.buildTreeRows(nodes, { expanded: true });
  return TableFactory.createTableModel({
    rows,
    columnDefs: [
      ColumnDef.create({ property: 'name', headerLabel: 'Name', width: px100 }),
      ColumnDef.create({ property: 'id', headerLabel: 'Id', width: px100 }),
    ],
  });
}

/** id | a column whose renderer draws a button (odd rows) or an input (even rows) – controls of the app inside cells */
function controlsModel() {
  const controls: CellRendererIf = {
    render(cellDiv: HTMLDivElement, rowIndex: number, _c: number, _a: AreaIdent, _m: AreaModelIf, value: unknown) {
      const el = document.createElement(rowIndex % 2 ? 'button' : 'input');
      el.tabIndex = -1;
      if (el instanceof HTMLInputElement) {
        el.setAttribute('aria-label', 'note ' + rowIndex);
        el.style.width = '80px';
      } else {
        el.textContent = '+' + value;
      }
      cellDiv.append(el);
      return undefined;
    },
  };
  return TableFactory.createTableModel({
    rows: createRows(20),
    columnDefs: [
      ColumnDef.create({ property: 'id', headerLabel: 'Id', width: px100 }),
      ColumnDef.create({ property: 'value', headerLabel: 'Control', width: px100, bodyRenderer: controls }),
    ],
  });
}

describe('onCellActivated: Enter', () => {
  it('a plain list: Enter on the focused cell reports the row once', async () => {
    const { rows, model } = listModel();
    const t = await mount(model);
    t.fm.setFocus(3, 1);
    await userEvent.keyboard('{Enter}');
    expect(t.activated).toHaveLength(1);
    const evt = t.activated[0];
    expect([evt.areaIdent, evt.rowIndex, evt.columnIndex, evt.source]).toEqual(['body', 3, 1, 'keyboard']);
    expect(evt.row).toBe(rows[3]);
    expect(evt.value).toBe('Name 3');
    expect(evt.originalEvent).toBeInstanceOf(KeyboardEvent);
  });

  it('Enter is not consumed (as before): an element around the table sees it – unless the listener stops it', async () => {
    const t = await mount(listModel().model);
    const seenOutside: KeyboardEvent[] = [];
    const outside = (e: KeyboardEvent) => seenOutside.push(e);
    document.body.addEventListener('keydown', outside);
    try {
      const press = () => {
        const evt = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true, cancelable: true });
        t.host.dispatchEvent(evt);
        return evt.defaultPrevented;
      };
      expect(press()).toBe(false);          // no focused cell: nothing reported
      expect(t.activated).toHaveLength(0);
      t.fm.setFocus(0, 0);
      expect(press()).toBe(false);
      expect(t.activated).toHaveLength(1);
      expect(seenOutside).toHaveLength(2);
      // the app decides: stop the key in its handler
      t.api.subscribe({ onCellActivated: e => { e.originalEvent?.preventDefault(); e.originalEvent?.stopPropagation(); } });
      expect(press()).toBe(true);
      expect(seenOutside).toHaveLength(2);
    } finally {
      document.body.removeEventListener('keydown', outside);
    }
  });

  it('a subscriber of tableApi.subscribe() gets it, too', async () => {
    const t = await mount(listModel().model);
    const seen: GeCellActivateEvent[] = [];
    const unsubscribe = t.api.subscribe({ onCellActivated: e => seen.push(e) });
    t.fm.setFocus(1, 0);
    await userEvent.keyboard('{Enter}');
    unsubscribe();
    await userEvent.keyboard('{Enter}');
    expect(seen).toHaveLength(1);
    expect(t.activated).toHaveLength(2);
  });

  it('a row checkbox keeps Enter: toggled, nothing reported; other cells of the row report', async () => {
    const rows = createRows(10);
    const model = TableFactory.createTableModel({
      rows,
      rowCheckboxVisible: true,
      columnDefs: [new CheckboxColumnDef(), ColumnDef.create({ property: 'name', headerLabel: 'Name', width: px100 })],
    });
    const t = await mount(model);
    t.fm.setFocus(2, 0);
    await userEvent.keyboard('{Enter}');
    expect(model.getBodyModel().isRowChecked(2)).toBe('full');
    expect(t.activated).toHaveLength(0);
    t.fm.setFocus(2, 1);
    await userEvent.keyboard('{Enter}');
    expect(t.activated.map(e => e.row)).toEqual([rows[2]]);
  });

  it('a tree: Enter on a parent toggles it and reports nothing; Enter on a leaf reports', async () => {
    const model = treeModel();
    const t = await mount(model);
    t.fm.setFocus(0, 1);              // A (parent)
    await userEvent.keyboard('{Enter}');
    expect(model.getBodyModel().getRowCount()).toBe(2);   // A collapsed: A, B
    expect(t.activated).toHaveLength(0);
    t.fm.setFocus(1, 1);              // B (leaf)
    await userEvent.keyboard('{Enter}');
    expect(t.activated).toHaveLength(1);
    expect(t.activated[0].row.data.name).toBe('B');
  });

  it('master/detail: Enter toggles the detail row and reports nothing', async () => {
    const t = await mount(createOrderModel(createOrders(20)), {
      masterDetail: { detailHeight: 60, detailRenderer: (el: HTMLElement) => { el.textContent = 'detail'; } },
    });
    t.fm.setFocus(1, 1);
    await userEvent.keyboard('{Enter}');
    expect(t.api.isDetailExpanded(1)).toBe(true);
    expect(t.activated).toHaveLength(0);
  });

  it('Excel-style editing, enterKey "moveDown": Enter moves down and reports nothing', async () => {
    const t = await mount(listModel(true).model, { editing: { enterKey: 'moveDown' } });
    t.fm.setFocus(2, 2);
    await userEvent.keyboard('{Enter}');
    expect(t.fm.getFocus()).toEqual([3, 2]);
    expect(t.activated).toHaveLength(0);
  });

  it('Excel-style editing, enterKey "edit": an editable cell is edited, a read-only cell reports', async () => {
    const t = await mount(listModel(true).model, { editing: { enterKey: 'edit' } });
    t.fm.setFocus(2, 2);              // value: read-only
    await userEvent.keyboard('{Enter}');
    expect(t.activated).toHaveLength(1);
    expect(t.scope.isEditing()).toBe(false);
    t.fm.setFocus(2, 1);              // name: editable
    await userEvent.keyboard('{Enter}');
    expect(t.scope.isEditing()).toBe(true);
    expect(t.activated).toHaveLength(1);
  });

  it('a blocking loading overlay: nothing reported', async () => {
    const t = await mount(listModel().model);
    t.fm.setFocus(1, 1);
    t.api.showLoadingOverlay();
    await userEvent.keyboard('{Enter}');
    expect(t.activated).toHaveLength(0);
    t.api.hideOverlay();
    await userEvent.keyboard('{Enter}');
    expect(t.activated).toHaveLength(1);
  });

  it('the header has the focus: Enter sorts and reports nothing', async () => {
    const t = await mount(listModel().model);
    t.fm.setFocus(0, 0);
    await userEvent.keyboard('{ArrowUp}');   // into the header
    expect(t.scope.getHeaderFocus()).toEqual([0, 0]);
    await userEvent.keyboard('{Enter}');
    expect(t.activated).toHaveLength(0);
  });

  it('a held Enter key (auto repeat) reports once', async () => {
    const t = await mount(listModel().model);
    t.fm.setFocus(2, 0);
    const press = (repeat: boolean) =>
      t.host.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true, cancelable: true, repeat }));
    press(false);
    press(true);
    press(true);
    expect(t.activated).toHaveLength(1);
  });

  it('triggerAction("ACTIVATE_CELL") reports with source "api"', async () => {
    const { rows, model } = listModel();
    const t = await mount(model);
    t.fm.setFocus(4, 0);
    expect(t.api.triggerAction('ACTIVATE_CELL')).toBe(false);   // reported, but no key was consumed
    expect(t.activated.map(e => [e.source, e.row, e.originalEvent])).toEqual([['api', rows[4], undefined]]);
  });
});

describe('onCellActivated: double click', () => {
  it('a plain list: reported once, and onMouseClicked with clickCount 2 as before', async () => {
    const { rows, model } = listModel();
    const t = await mount(model);
    await userEvent.dblClick(t.cell(2, 1));
    await nextFrame();
    expect(t.activated).toHaveLength(1);
    const evt = t.activated[0];
    expect([evt.areaIdent, evt.rowIndex, evt.columnIndex, evt.source]).toEqual(['body', 2, 1, 'mouse']);
    expect(evt.row).toBe(rows[2]);
    expect(evt.originalEvent).toBeInstanceOf(MouseEvent);
    expect(t.clicked.map(e => e.clickCount)).toEqual([1, 2]);
  });

  it('a single click reports nothing', async () => {
    const t = await mount(listModel().model);
    await userEvent.click(t.cell(2, 1));
    await nextFrame();
    expect(t.activated).toHaveLength(0);
  });

  it('an editable cell: the editor opens, nothing reported; a read-only cell of the same table reports', async () => {
    const t = await mount(listModel(true).model, { getEditRenderer: () => new InputCellRenderer() });
    await userEvent.dblClick(t.cell(1, 1));
    await nextFrame();
    expect(t.scope.isEditing()).toBe(true);
    expect(t.activated).toHaveLength(0);
    await userEvent.keyboard('{Escape}');
    await nextFrame();
    await userEvent.dblClick(t.cell(3, 2));
    await nextFrame();
    expect(t.activated.map(e => [e.rowIndex, e.columnIndex])).toEqual([[3, 2]]);
  });

  it('a header cell: sorts, nothing reported', async () => {
    const t = await mount(listModel().model);
    const header = getCellDiv(t.host, 'header', 'center', 0, 0);
    await userEvent.dblClick(header);
    await nextFrame();
    expect(t.activated).toHaveLength(0);
  });

  it('the resize handle of a column: fits the width, nothing reported', async () => {
    const t = await mount(listModel().model);
    const handle = t.host.querySelector<HTMLElement>('.ge-table-column-resize-handle[data-col-index="1"]')!;
    await userEvent.dblClick(handle);
    await nextFrame();
    expect(t.activated).toHaveLength(0);
  });

  it('a tree: the arrow column toggles the node and reports nothing, another column reports', async () => {
    const model = treeModel();
    const t = await mount(model);
    await userEvent.dblClick(t.cell(0, 0));   // name column of A: toggles
    await nextFrame();
    expect(model.getBodyModel().getRowCount()).toBe(2);
    expect(t.activated).toHaveLength(0);
    await userEvent.dblClick(t.cell(1, 1));   // id column of B
    await nextFrame();
    expect(t.activated).toHaveLength(1);
    expect(t.activated[0].row.data.name).toBe('B');
  });

  it('a row checkbox: two toggles, nothing reported', async () => {
    const model = TableFactory.createTableModel({
      rows: createRows(10),
      rowCheckboxVisible: true,
      columnDefs: [new CheckboxColumnDef(), ColumnDef.create({ property: 'name', headerLabel: 'Name', width: px100 })],
    });
    const t = await mount(model);
    await userEvent.dblClick(t.cell(1, 0).querySelector('input')!);
    await nextFrame();
    expect(t.activated).toHaveLength(0);
  });

  it('a double click on a button, link or input inside a cell belongs to that control: nothing reported', async () => {
    const t = await mount(controlsModel());
    await userEvent.dblClick(t.cell(1, 1).querySelector('button')!);
    await nextFrame();
    await userEvent.dblClick(t.cell(2, 1).querySelector('input')!);
    await nextFrame();
    expect(t.activated).toHaveLength(0);
    await userEvent.dblClick(t.cell(1, 0));   // a plain cell of the same table
    await nextFrame();
    expect(t.activated.map(e => [e.rowIndex, e.columnIndex])).toEqual([[1, 0]]);
  });

  it('a blocking loading overlay: nothing reported', async () => {
    const t = await mount(listModel().model);
    t.api.showLoadingOverlay();
    await nextFrame();
    t.cell(1, 1).dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true, detail: 2 }));
    await nextFrame();
    expect(t.activated).toHaveLength(0);
  });
});

describe('focusFrame (all tables)', () => {
  const frames = (host: HTMLElement) => host.querySelectorAll('.ge-table-body-center .ge-table-focus-border');

  it('default ("always"): the frame is drawn after a click and after a key – as before', async () => {
    const t = await mount(listModel().model);
    await userEvent.click(t.cell(1, 1));
    await nextFrame();
    await nextFrame();
    expect(frames(t.host)).toHaveLength(4);
    await userEvent.keyboard('{ArrowDown}');
    await nextFrame();
    expect(frames(t.host)).toHaveLength(4);
  });

  it('"keyboard": hidden after a click, shown after a key, hidden again after a click', async () => {
    const t = await mount(listModel().model, { focusFrame: 'keyboard' });
    await userEvent.click(t.cell(1, 1));
    await nextFrame();
    await nextFrame();
    expect(t.fm.getFocus()).toEqual([1, 1]);
    expect(frames(t.host)).toHaveLength(0);
    await userEvent.keyboard('{ArrowDown}');
    await nextFrame();
    expect(frames(t.host)).toHaveLength(4);
    await userEvent.click(t.cell(4, 2));
    await nextFrame();
    await nextFrame();
    expect(frames(t.host)).toHaveLength(0);
  });

  it('"keyboard": the focused header cell has its frame (the header is reached by keys only)', async () => {
    const t = await mount(listModel().model, { focusFrame: 'keyboard' });
    t.fm.setFocus(0, 1);
    await userEvent.keyboard('{ArrowUp}');
    await nextFrame();
    expect(t.host.querySelectorAll('.ge-table-header-center .ge-table-focus-border')).toHaveLength(4);
  });

  it('"keyboard": typing into an input of a cell renderer keeps the input (no repaint for the frame)', async () => {
    const t = await mount(controlsModel(), { focusFrame: 'keyboard' });
    const input = t.cell(2, 1).querySelector('input')!;
    await userEvent.click(input);
    await userEvent.keyboard('abc');
    await nextFrame();
    await new Promise(resolve => setTimeout(resolve, 20));
    expect(input.isConnected).toBe(true);
    expect(input.value).toBe('abc');
    expect(document.activeElement).toBe(input);
  });

  it('"keyboard": a click into an input of a cell renderer after keys keeps the input and its focus', async () => {
    const t = await mount(controlsModel(), { focusFrame: 'keyboard' });
    t.fm.setFocus(0, 0);
    await userEvent.keyboard('{ArrowDown}');
    await nextFrame();
    const input = t.cell(2, 1).querySelector('input')!;
    await userEvent.click(input);
    await nextFrame();
    await new Promise(resolve => setTimeout(resolve, 20));
    expect(input.isConnected).toBe(true);
    expect(document.activeElement).toBe(input);
  });

  it('"never": no frame in body and header; arrow keys and aria-activedescendant still work', async () => {
    const t = await mount(listModel().model, { focusFrame: 'never' });
    await userEvent.click(t.cell(1, 1));
    await nextFrame();
    await nextFrame();
    await userEvent.keyboard('{ArrowDown}');
    await nextFrame();
    expect(t.fm.getFocus()).toEqual([2, 1]);
    expect(t.host.querySelectorAll('.ge-table-focus-border')).toHaveLength(0);
    const id = t.host.getAttribute('aria-activedescendant');
    expect(t.host.querySelector('#' + id)).toBe(t.cell(2, 1));
    await userEvent.keyboard('{ArrowUp}{ArrowUp}{ArrowUp}');
    await nextFrame();
    expect(t.scope.getHeaderFocus()).toEqual([0, 1]);
    expect(t.host.querySelectorAll('.ge-table-focus-border')).toHaveLength(0);
  });

  it('new FocusModel("none") does not hide the frame (use focusFrame: "never")', async () => {
    const { FocusModel } = await import('@guiexpert/table');
    const fm = new FocusModel('none');
    const t = await mount(listModel().model, { getFocusModel: () => fm });
    await userEvent.click(t.cell(1, 1));
    await nextFrame();
    await nextFrame();
    expect(frames(t.host)).toHaveLength(4);
  });
});
