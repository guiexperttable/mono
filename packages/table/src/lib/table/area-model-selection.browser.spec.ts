// Selection on an own AreaModel subclass in a real browser.
// Regression (TODO.md "Gefunden beim Bau der Startseite"): AreaModel.isSelectable() returned false, so a range selection
// on an own model was in the SelectionModel but never drawn (AbstractAreaModel / all factory models: true).
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { AreaModel, CellRange, ColumnDef, SelectionModel, TableFactory, px100 } from '@guiexpert/table';
import { destroyAllTables, mountTable, nextFrame } from '../../../test-utils/mount-table';

class OwnBody extends AreaModel {
  constructor() {
    super();
    this.areaIdent = 'body';
  }

  override getRowCount(): number {
    return 1000;
  }

  override getRowHeight(_rowIndex: number): number {
    return 34;
  }

  override getValueAt(row: number, col: number): any {
    return `r${row}c${col}`;
  }
}

/** Same model, but the first column never shows a selection (the JSDoc example of AreaModel.isSelectable). */
class OwnBodyWithoutFirstColumn extends OwnBody {
  override isSelectable(_rowIndex: number, columnIndex: number): boolean {
    return columnIndex > 0;
  }
}

async function mountOwnModel(body: AreaModel = new OwnBody()) {
  const sm = new SelectionModel('range', 'multi');
  const tableModel = TableFactory.createTableModel({
    bodyAreaModel: body,
    columnDefs: Array.from({ length: 5 }, (_, i) => new ColumnDef('c' + i, 'C' + i, px100)),
  });
  const table = mountTable(tableModel, { tableOptions: { getSelectionModel: () => sm } });
  await nextFrame();
  return { ...table, sm };
}

/** "row/col" of all body cells that are drawn as selected. */
function selectedCells(host: HTMLElement): string[] {
  return Array.from(host.querySelectorAll<HTMLElement>('.ge-table-col-div.ge-table-body-center-selected-range'))
    .map(c => `${c.dataset['rowIndex']}/${c.dataset['colIndex']}`)
    .sort();
}

function bodyCell(host: HTMLElement, row: number, col: number): HTMLElement {
  return host.querySelector<HTMLElement>(
    `.ge-table-body-center .ge-table-col-div[data-row-index="${row}"][data-col-index="${col}"]`)!;
}

afterEach(destroyAllTables);

describe('selection on an own AreaModel (real browser)', () => {

  it('draws a range of the selection model', async () => {
    const { host, api, sm } = await mountOwnModel();
    sm.addSelection(new CellRange(1, 1, 3, 2));
    api.repaint();
    expect(selectedCells(host)).toEqual(['1/1', '1/2', '2/1', '2/2', '3/1', '3/2']);
    // plus one background div per selected cell
    expect(host.querySelectorAll('.ge-table-body-center-selected-range:not(.ge-table-col-div)').length).toBe(6);
  });

  it('draws a range selected by dragging the mouse', async () => {
    const { host, sm } = await mountOwnModel();
    await userEvent.dragAndDrop(bodyCell(host, 2, 0), bodyCell(host, 4, 1));
    await nextFrame();
    expect(sm.getRanges().length).toBeGreaterThan(0);
    expect(selectedCells(host)).toEqual(['2/0', '2/1', '3/0', '3/1', '4/0', '4/1']);
  });

  it('an overridden isSelectable() still excludes cells', async () => {
    const { host, api, sm } = await mountOwnModel(new OwnBodyWithoutFirstColumn());
    sm.addSelection(new CellRange(0, 0, 1, 1));
    api.repaint();
    expect(selectedCells(host)).toEqual(['0/1', '1/1']);
  });
});
