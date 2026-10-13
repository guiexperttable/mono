// Mouse selection end to end in a real browser: real clicks (userEvent → Chromium, with modifier keys) on body cells
// → MouseHandler → TableScope → SelectionService → focus/selection model → repaint.
// Regressions for: Ctrl/⌘-click cleared the selection instead of adding to it, deselected cells could never be selected
// again, Ctrl+A/Ctrl+C copied one cell, onFocusChanged fired twice per click, a click was not painted.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { CellRange, ColumnDef, EventAdapter, FocusModel, InputCellRenderer, SelectionModel, TableFactory, TrueFn } from '@guiexpert/table';
import type { ExtendedSelectionType, SelectionMode } from '@guiexpert/table';
import { createRows, destroyAllTables, mountTable, nextFrame } from '../../../../test-utils/mount-table';

type Modifier = 'Alt' | 'Control' | 'Meta' | 'Shift';

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
  return { ...table, fm, sm, onFocusChanged };
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
    await clickCell(host, 3, 0, 'Control');
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
    await clickCell(host, 4, 2, 'Control');
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
    await clickCell(host, 1, 1, 'Control');
    expect(selectedCells(sm)).toEqual(['0/0', '0/1', '0/2', '1/0', '1/2']);
  });

  it('ctrl+alt-click removes a cell from the selection', async () => {
    // TableScope dumps debug info on ctrl+alt clicks (console.clear + console.info) – keep the test output clean
    const clear = vi.spyOn(console, 'clear').mockImplementation(() => undefined);
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    try {
      const { host, sm } = await mountSelectionTable('range');
      sm.addSelection(new CellRange(0, 0, 1, 2));
      await clickCell(host, 0, 2, 'Control', 'Alt');
      expect(selectedCells(sm)).toEqual(['0/0', '0/1', '1/0', '1/1', '1/2']);
    } finally {
      clear.mockRestore();
      info.mockRestore();
    }
  });

  // Regression: a deselected cell stayed deselected forever (negative ranges were only removed by clear()).
  it('a cell removed with ctrl-click can be added again with ctrl-click', async () => {
    const { host, sm } = await mountSelectionTable('cell');
    await clickCell(host, 2, 1, 'Control');
    await clickCell(host, 3, 1, 'Control');
    await clickCell(host, 2, 1, 'Control');
    expect(selectedCells(sm)).toEqual(['3/1']);
    await clickCell(host, 3, 2, 'Control'); // another cell in between: no double-click on 2/1
    await clickCell(host, 2, 1, 'Control');
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
    await clickCell(host, 3, 0, 'Control');
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
