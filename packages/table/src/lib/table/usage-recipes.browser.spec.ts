// Characterization tests for the usage recipes in llms.txt (prompt 020): behaviour an AI assistant must know to write
// correct code – which index updateCells uses, how the app reacts to its own keys, how to get the selected rows.
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { CellRange, FocusModel, SelectionModel, TableCellUpdateEvent, TableFactory } from '@guiexpert/table';
import { createRows, destroyAllTables, getCellDiv, mountTable, nextFrame } from '../../../test-utils/mount-table';

afterEach(destroyAllTables);

type Row = { id: number; name: string; value: number };

describe('usage recipes (llms.txt)', () => {
  it('B4: updateCells takes the DISPLAYED row index (after sorting and filtering), not the index in your array', async () => {
    const rows = createRows(10);
    const t = mountTable(TableFactory.createTableModel({ rows, properties: ['id', 'name', 'value'] }), {
      tableOptions: { externalFilterFunction: (r: Row) => r.id % 2 === 0 },
    });
    t.api.externalFilterChanged();
    t.api.sortByColumn('id', 'desc');
    await nextFrame();
    const shown = t.api.getBodyModel().getRowByIndex(0) as Row;  // displayed row 0 = id 8
    expect(shown.id).toBe(8);
    t.api.updateCells([new TableCellUpdateEvent('body', 0, 1, 'changed')]);
    expect(rows[8].name).toBe('changed');                         // written into the displayed row's object
    expect(rows[0].name).toBe('Name 0');
  });

  it('B1: own keys – a keydown listener on the host sees every key; the focused cell comes from getActiveCell()', async () => {
    const rows = createRows(20);
    const focusModel = new FocusModel('cell');
    const t = mountTable(TableFactory.createTableModel({ rows, properties: ['id', 'name', 'value'] }), {
      tableOptions: { getFocusModel: () => focusModel },
    });
    await nextFrame();
    const seen: string[] = [];
    t.host.addEventListener('keydown', evt => {
      if (evt.key === 'Delete') {
        const cell = t.api.getActiveCell();          // [row, column] of the focused body cell
        if (cell) {
          const row = t.api.getBodyModel().getRowByIndex(cell[0]) as Row;
          seen.push('delete ' + row.id);
          t.api.removeRows([row]);
          t.api.repaintHard();
        }
      }
    });
    await userEvent.click(getCellDiv(t.host, 'body', 'center', 3, 1));
    await nextFrame();
    expect(focusModel.getFocus()).toEqual([3, 1]);
    await userEvent.keyboard('{Delete}');
    await nextFrame();
    expect(seen).toEqual(['delete 3']);
    expect(t.api.getBodyModel().getRowCount()).toBe(19);
  });

  it('B7: selected row objects = getMergedRowIndices() → getRowByIndex()', async () => {
    const sm = new SelectionModel('row', 'multi');
    const t = mountTable(TableFactory.createTableModel({ rows: createRows(20), properties: ['id', 'name'] }), {
      tableOptions: { getSelectionModel: () => sm },
    });
    await nextFrame();
    sm.addSelection(new CellRange(2, 0, 4, 0));
    const body = t.api.getBodyModel();
    const selected = sm.getMergedRowIndices(body.getRowCount()).map(i => body.getRowByIndex(i) as Row);
    expect(selected.map(r => r.id)).toEqual([2, 3, 4]);
  });

  it('the selection type defaults to "none": without getSelectionModel a click selects nothing', async () => {
    const t = mountTable(TableFactory.createTableModel({ rows: createRows(5), properties: ['id'] }));
    await nextFrame();
    await userEvent.click(getCellDiv(t.host, 'body', 'center', 1, 0));
    await nextFrame();
    expect(t.api.getSelectionModel()?.hasSelection() ?? false).toBe(false);
  });

  it('externalFilterChanged clears the selection and scrolls to the top (B3)', async () => {
    const sm = new SelectionModel('row', 'multi');
    let keep = true;
    const t = mountTable(TableFactory.createTableModel({ rows: createRows(1_000), properties: ['id'] }), {
      tableOptions: { getSelectionModel: () => sm, externalFilterFunction: () => keep },
    });
    await nextFrame();
    sm.addSelection(CellRange.singleRow(5));
    t.api.scrollToIndex(0, 500);
    await nextFrame();
    keep = true;
    t.api.externalFilterChanged();
    await nextFrame();
    expect(sm.hasSelection()).toBe(false);
    expect(t.api.getFirstVisibleRowIndex()).toBe(0);
  });
});
