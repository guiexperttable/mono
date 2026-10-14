// Mouse selection end to end in a real browser: real clicks (userEvent → Chromium, with modifier keys) on body cells
// → MouseHandler → TableScope → SelectionService → focus/selection model → repaint.
// Regressions for: Ctrl/⌘-click cleared the selection instead of adding to it, deselected cells could never be selected
// again, Ctrl+A/Ctrl+C copied one cell, onFocusChanged fired twice per click, a click was not painted.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { CellRange, ColumnDef, EventAdapter, FocusModel, InputCellRenderer, SelectionModel, TableFactory, TrueFn } from '@guiexpert/table';
import type { CellRendererIf, ExtendedSelectionType, SelectionMode } from '@guiexpert/table';
import { createRows, destroyAllTables, mountTable, nextFrame } from '../../../../test-utils/mount-table';

type Modifier = 'Alt' | 'Control' | 'Meta' | 'Shift';

// Ctrl+click on macOS is a secondary click (contextmenu, no click event) – Mac users toggle with ⌘. The table
// treats both the same (ctrlKey || metaKey), so the specs click with ⌘ on macOS and with Ctrl elsewhere (CI: Linux).
const CTRL: Modifier = /Mac/i.test(navigator.platform) ? 'Meta' : 'Control';

afterEach(destroyAllTables);

/**
 * Waits until pending repaints are done: a repaint rebuilds the cell divs, and a cell div that is replaced while
 * Playwright clicks it is "detached" (the click would wait for it until the test times out).
 */
async function settle(): Promise<void> {
  await nextFrame();
  await new Promise(resolve => setTimeout(resolve, 5));
  await nextFrame();
}

async function mountSelectionTable(type: ExtendedSelectionType = 'range', mode: SelectionMode = 'multi', rowCount = 100) {
  const fm = new FocusModel('cell');
  const sm = new SelectionModel(type, mode);
  const listener = new EventAdapter();
  const onFocusChanged = vi.spyOn(listener, 'onFocusChanged');
  const columnDefs = [
    ColumnDef.create({ property: 'id', headerLabel: 'Id' }),
    ColumnDef.create({ property: 'name', headerLabel: 'Name', editable: TrueFn }),
    ColumnDef.create({ property: 'value', headerLabel: 'Value' }),
  ];
  const table = mountTable(TableFactory.createTableModel({ rows: createRows(rowCount), columnDefs }), {
    eventListener: listener,
    tableOptions: {
      getFocusModel: () => fm,
      getSelectionModel: () => sm,
      getEditRenderer: () => new InputCellRenderer(),
      resizeEventDebounceDelay: 1, // the initial resize repaint is over before the first click
    },
  });
  await settle();
  return { ...table, fm, sm, listener, onFocusChanged };
}

/** The rendered div of a body cell (center area). */
function cell(host: HTMLElement, row: number, col: number): HTMLElement {
  const ele = host.querySelector<HTMLElement>(
    `.ge-table-body-center .ge-table-col-div[data-row-index="${row}"][data-col-index="${col}"]`);
  if (!ele) throw new Error(`cell ${row}/${col} is not rendered`);
  return ele;
}

/** A real click on a body cell (optionally with modifier keys); waits for the repaint it causes. */
async function clickCell(host: HTMLElement, row: number, col: number, ...modifiers: Modifier[]): Promise<void> {
  await userEvent.click(cell(host, row, col), modifiers.length ? { modifiers } : undefined);
  await settle();
}

function selectedCells(sm: SelectionModel, rows = 6, cols = 3): string[] {
  const ret: string[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (sm.isSelected(r, c)) ret.push(`${r}/${c}`);
    }
  }
  return ret;
}

describe('selection with the mouse (real clicks in Chromium)', () => {

  it('a click focuses the cell and selects its row (type "row") – and paints it', async () => {
    const { host, fm, sm } = await mountSelectionTable('row', 'single');
    expect(host.querySelectorAll('.ge-table-focus-border').length).toBe(0);
    await userEvent.click(cell(host, 2, 1));
    expect(fm.getFocus()).toEqual([2, 1]);
    expect(sm.getMergedRowIndices()).toEqual([2]);
    // Regression: a click was never repainted – focus border and selection only appeared with the next scroll
    await vi.waitFor(() => {
      expect(host.querySelectorAll('.ge-table-focus-border').length).toBeGreaterThan(0);
      expect(host.querySelectorAll('.ge-table-body-center-selected-range').length).toBeGreaterThan(0);
    }, { timeout: 200 });
  });

  it('a plain click starts a new selection', async () => {
    const { host, sm } = await mountSelectionTable('row', 'multi');
    await clickCell(host, 1, 0);
    await clickCell(host, 3, 0, CTRL);
    expect(sm.getMergedRowIndices()).toEqual([1, 3]);
    await clickCell(host, 5, 2);
    expect(sm.getMergedRowIndices()).toEqual([5]);
  });

  it('shift-click selects the range from the previous click', async () => {
    const { host, sm } = await mountSelectionTable('range');
    await clickCell(host, 1, 0);
    await clickCell(host, 3, 1, 'Shift');
    expect(sm.getRanges()).toEqual([new CellRange(1, 0, 3, 1)]);
    expect(selectedCells(sm)).toEqual(['1/0', '1/1', '2/0', '2/1', '3/0', '3/1']);
  });

  // Regression: every click without shift cleared the selection, so ctrl-click could not add anything.
  it('ctrl-click adds a cell to the selection', async () => {
    const { host, sm } = await mountSelectionTable('range');
    await clickCell(host, 1, 0);
    await clickCell(host, 2, 1, 'Shift');
    await clickCell(host, 4, 2, CTRL);
    expect(selectedCells(sm)).toEqual(['1/0', '1/1', '2/0', '2/1', '4/2']);
  });

  it('meta-click (macOS ⌘) adds a cell as well', async () => {
    const { host, sm } = await mountSelectionTable('cell');
    await clickCell(host, 0, 0, 'Meta');
    await clickCell(host, 5, 1, 'Meta');
    expect(selectedCells(sm)).toEqual(['0/0', '5/1']);
  });

  it('ctrl-click on a selected cell removes it from the selection', async () => {
    const { host, sm } = await mountSelectionTable('range');
    sm.addSelection(new CellRange(0, 0, 1, 2));
    await clickCell(host, 1, 1, CTRL);
    expect(selectedCells(sm)).toEqual(['0/0', '0/1', '0/2', '1/0', '1/2']);
  });

  it('ctrl+alt-click removes a cell from the selection', async () => {
    const clear = vi.spyOn(console, 'clear');
    const { host, sm } = await mountSelectionTable('range');
    sm.addSelection(new CellRange(0, 0, 1, 2));
    await clickCell(host, 0, 2, CTRL, 'Alt');
    expect(selectedCells(sm)).toEqual(['0/0', '0/1', '1/0', '1/1', '1/2']);
    expect(clear).not.toHaveBeenCalled(); // Regression: Ctrl+Alt ran debug code (console.clear + console.info)
  });

  // Regression: a deselected cell stayed deselected forever (negative ranges were only removed by clear()).
  it('a cell removed with ctrl-click can be added again with ctrl-click', async () => {
    const { host, sm } = await mountSelectionTable('cell');
    await clickCell(host, 2, 1, CTRL);
    await clickCell(host, 3, 1, CTRL);
    await clickCell(host, 2, 1, CTRL);
    expect(selectedCells(sm)).toEqual(['3/1']);
    await clickCell(host, 3, 2, CTRL); // another cell in between: no double-click on 2/1
    await clickCell(host, 2, 1, CTRL);
    expect(selectedCells(sm)).toEqual(['2/1', '3/1', '3/2']);
  });

  // Regression: selectAll() only sets a flag – Ctrl+C copied the focused cell only.
  it('Ctrl+A then Ctrl+C copies the whole body', async () => {
    const { host, scope } = await mountSelectionTable('range', 'multi', 4);
    const copyContent = vi.spyOn(scope.copyService, 'copyContent').mockResolvedValue(undefined);
    await clickCell(host, 1, 1);
    host.focus();
    await userEvent.keyboard('{Control>}a{/Control}');
    await userEvent.keyboard('{Control>}c{/Control}');
    await vi.waitFor(() => expect(copyContent).toHaveBeenCalledWith(
      '0\tName 0\t0\n1\tName 1\t3\n2\tName 2\t6\n3\tName 3\t9'));
  });

  // Regression: MouseHandler cleared the focus before setting it (two events) and SelectionService reported it again.
  it('onFocusChanged fires once per click', async () => {
    const { host, onFocusChanged } = await mountSelectionTable('range');
    await clickCell(host, 1, 1);
    expect(onFocusChanged).toHaveBeenCalledTimes(1);
    await clickCell(host, 3, 0, CTRL);
    expect(onFocusChanged).toHaveBeenCalledTimes(2);
    await clickCell(host, 5, 2, 'Shift');
    expect(onFocusChanged).toHaveBeenCalledTimes(3);
  });

  it('a click on the focused cell fires no onFocusChanged', async () => {
    const { host, fm, onFocusChanged } = await mountSelectionTable('range');
    fm.setFocus(2, 2);
    onFocusChanged.mockClear();
    await clickCell(host, 2, 2);
    expect(onFocusChanged).not.toHaveBeenCalled();
  });

  it('a double-click still opens the editor with the keyboard focus (the click repaint is deferred)', async () => {
    const { host, scope } = await mountSelectionTable('row');
    await userEvent.dblClick(cell(host, 3, 1));
    await settle();
    expect(scope.isEditing()).toBe(true);
    const input = host.querySelector('input.ge-table-cell-editor-input');
    expect(input).not.toBeNull();
    expect(document.activeElement).toBe(input);
  });
});

// Regressions found in review: the repaint after a click re-created all visible cells – an <input> of a custom
// renderer lost the focus and the typed text; Ctrl+A in a default table (selection type "none") selected everything.
describe('click repaint and defaults', () => {

  /** A renderer with a real <input> in every cell of column 1 (like an inline form in a cell). */
  const inputRenderer: CellRendererIf = {
    render(cellDiv: HTMLDivElement, rowIndex: number) {
      const input = document.createElement('input');
      input.className = 'test-cell-input';
      input.value = 'v' + rowIndex;
      cellDiv.appendChild(input);
      return undefined;
    },
  };

  it('a click into an <input> of a custom renderer keeps its focus and the typed text', async () => {
    const fm = new FocusModel('cell');
    const sm = new SelectionModel('range', 'multi');
    const columnDefs = [
      ColumnDef.create({ property: 'id', headerLabel: 'Id' }),
      ColumnDef.create({ property: 'name', headerLabel: 'Name', bodyRenderer: inputRenderer }),
    ];
    const { host } = mountTable(TableFactory.createTableModel({ rows: createRows(20), columnDefs }), {
      tableOptions: { getFocusModel: () => fm, getSelectionModel: () => sm, resizeEventDebounceDelay: 1 },
    });
    await settle();
    const input = host.querySelector<HTMLInputElement>(
      '.ge-table-body-center .ge-table-col-div[data-row-index="0"][data-col-index="1"] input')!;
    await userEvent.click(input);
    await settle();
    expect(input.isConnected).toBe(true);
    expect(document.activeElement).toBe(input);
    await userEvent.keyboard('X');
    expect(input.value).toBe('v0X');
    expect(fm.getFocus()).toEqual([0, 1]); // the table still knows the focused cell
  });

  it('a click on a plain cell is still painted', async () => {
    const { host, fm } = await mountSelectionTable('range', 'multi');
    await clickCell(host, 3, 1);
    expect(fm.getFocus()).toEqual([3, 1]);
    expect(host.querySelectorAll('.ge-table-focus-border').length).toBeGreaterThan(0);
  });

  it('Ctrl+A in a table without selection model (type "none") selects nothing and copies no body', async () => {
    const { host, scope, api } = mountTable(TableFactory.createTableModel({ rows: createRows(50), properties: ['id', 'name'] }));
    await settle();
    const createContent = vi.spyOn(scope.copyService, 'createContent');
    host.focus();
    await userEvent.keyboard('{Control>}a{/Control}');
    expect(api.getSelectionModel()?.isAllSelected() ?? false).toBe(false);
    await userEvent.keyboard('{Control>}c{/Control}');
    await vi.waitFor(() => expect(createContent).toHaveBeenCalled());
    // no selection, no focused cell → nothing (before the fix: the whole body)
    await expect(createContent.mock.results[0]!.value).resolves.toBe('');
  });
});

// A repaint between mousedown and mouseup replaces the pressed cell element – the browser then sees no click / no
// double click on it (flaky double-click sorting/editing under load). The click repaint waits for the mouseup.
describe('click repaint and mouse button', () => {
  it('a pending click repaint is held back while the button is down and runs after mouseup', async () => {
    const { host, scope, fm } = await mountSelectionTable('range', 'multi');
    const repaint = vi.spyOn(scope, 'repaint');
    const target = cell(host, 3, 1);
    target.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));   // schedules the repaint (1 ms)
    expect(fm.getFocus()).toEqual([3, 1]);
    target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, detail: 2 })); // 2nd click starts at once
    await new Promise(resolve => setTimeout(resolve, 30));
    expect(repaint).not.toHaveBeenCalled();
    expect(target.isConnected).toBe(true);
    target.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, detail: 2 }));
    await vi.waitFor(() => expect(repaint).toHaveBeenCalled());
  });
});

describe('selection – open points of the first selection work (Okt. 2026)', () => {

  async function mountWithListener(type: ExtendedSelectionType, mode: SelectionMode = 'multi') {
    const table = await mountSelectionTable(type, mode);
    const selectionChanged = vi.spyOn(table.listener, 'onSelectionChanged');
    return { ...table, selectionChanged };
  }

  // Regression: firstClick() only knew "row" and "column" – a plain click selected nothing for type "cell".
  it('type "cell": a plain click selects the clicked cell (and only that one)', async () => {
    const { host, sm } = await mountSelectionTable('cell', 'multi');
    await clickCell(host, 2, 1);
    expect(selectedCells(sm)).toEqual(['2/1']);
    await clickCell(host, 4, 2);
    expect(selectedCells(sm)).toEqual(['4/2']);
  });

  // Regression: a click fired up to three onSelectionChanged events (clear(), the new range, the service itself).
  it('onSelectionChanged fires once per click', async () => {
    const { host, sm, selectionChanged } = await mountWithListener('row', 'multi');
    sm.addSelection(CellRange.singleRow(5));
    selectionChanged.mockClear();
    await clickCell(host, 2, 1);
    expect(selectionChanged).toHaveBeenCalledTimes(1);
    expect(selectionChanged).toHaveBeenCalledWith(sm);
    await clickCell(host, 3, 1, 'Shift');
    expect(selectionChanged).toHaveBeenCalledTimes(2);
  });

  // Regression: header (and footer) clicks were handled like body clicks – they cleared the selection and moved the
  // focus to the body cell with the same indices.
  it('a click on a header cell keeps selection and focus', async () => {
    const { host, sm, fm } = await mountSelectionTable('cell', 'multi');
    await clickCell(host, 3, 2);
    await userEvent.click(host.querySelector<HTMLElement>('.ge-table-header-center .ge-table-col-div[data-col-index="1"]')!);
    await settle();
    expect(selectedCells(sm)).toEqual(['3/2']);
    expect(fm.getFocus()).toEqual([3, 2]);
  });

  // Regression: the second click of a double click went through the selection again – with Ctrl the cell was
  // toggled on/off/on.
  it('a Ctrl+double click toggles the cell once', async () => {
    const { host, sm } = await mountSelectionTable('cell', 'multi');
    await userEvent.dblClick(cell(host, 2, 0), { modifiers: [CTRL] }); // column 0 is not editable
    await settle();
    expect(selectedCells(sm)).toEqual(['2/0']);
  });

  // Regression: hasSelection() stayed true after all selected cells were deselected (Copy produced empty cells).
  it('hasSelection() is false after the only selected cell is ctrl-clicked away', async () => {
    const { host, sm } = await mountSelectionTable('cell', 'multi');
    await clickCell(host, 1, 1);
    expect(sm.hasSelection()).toBe(true);
    await clickCell(host, 4, 2, CTRL);
    await clickCell(host, 1, 1, CTRL);
    expect(selectedCells(sm)).toEqual(['4/2']);
    await clickCell(host, 4, 2, CTRL);
    expect(selectedCells(sm)).toEqual([]);
    expect(sm.hasSelection()).toBe(false);
  });

  it('repeated shift-clicks change the rectangle from the same anchor', async () => {
    const { host, sm } = await mountSelectionTable('range', 'multi');
    await clickCell(host, 1, 0);
    await clickCell(host, 3, 1, 'Shift');
    await clickCell(host, 2, 2, 'Shift');
    expect(sm.getRanges()).toEqual([new CellRange(1, 0, 2, 2)]);
  });

  // Regression: a drag always cleared the selection – no second range with Ctrl+drag.
  it('Ctrl+drag adds a second range (type "range")', async () => {
    const { host, sm } = await mountSelectionTable('range', 'multi');
    await clickCell(host, 0, 0);
    await clickCell(host, 1, 1, 'Shift');
    // drag with mouse events, Ctrl held from mousedown on
    const fire = (row: number, col: number, type: string) => {
      const target = cell(host, row, col);
      const r = target.getBoundingClientRect();
      target.dispatchEvent(new MouseEvent(type, {
        bubbles: true, cancelable: true, clientX: r.left + 5, clientY: r.top + 5, ctrlKey: true, buttons: 1 }));
    };
    fire(3, 0, 'mousedown');
    fire(3, 1, 'mousemove');
    await nextFrame();
    fire(4, 2, 'mousemove');
    await nextFrame();
    fire(4, 2, 'mouseup');
    await settle();
    expect(selectedCells(sm)).toEqual(['0/0', '0/1', '1/0', '1/1', '3/0', '3/1', '3/2', '4/0', '4/1', '4/2']);
  });

  // Regression: setSelectionModel() did not register the table at the new model – its changes were not reported.
  it('setSelectionModel(): changes of the new model reach onSelectionChanged, the old one is detached', async () => {
    const { api, sm, selectionChanged } = await mountWithListener('cell');
    const newModel = new SelectionModel('row', 'multi');
    api.setSelectionModel(newModel);
    selectionChanged.mockClear();
    newModel.addSelection(CellRange.singleRow(2));
    expect(selectionChanged).toHaveBeenCalledWith(newModel);
    selectionChanged.mockClear();
    sm.addSelection(CellRange.singleCell(1, 1));
    expect(selectionChanged).not.toHaveBeenCalled();
  });
});
