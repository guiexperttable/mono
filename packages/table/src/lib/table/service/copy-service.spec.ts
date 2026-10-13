import { afterEach, describe, expect, it, vi } from 'vitest';
import { CellRange, ColumnDef, CopyService, FocusModel, SelectionModel, TableFactory } from '@guiexpert/table';
import type { TableModelIf } from '@guiexpert/table';

interface Row {
  id: number;
  name: string;
  city: string | null;
}

const rows: Row[] = [
  { id: 1, name: 'Ann', city: 'Berlin' },
  { id: 2, name: 'Bob', city: 'Paris' },
  { id: 3, name: 'Cid', city: null },
];

function model(): TableModelIf {
  return TableFactory.createTableModel({ rows: rows.map(r => ({ ...r })), properties: ['id', 'name', 'city'] });
}

function rangeSelection(...ranges: CellRange[]): SelectionModel {
  const sm = new SelectionModel('range', 'multi');
  ranges.forEach(r => sm.addSelection(r));
  return sm;
}

function focusAt(row: number, col: number): FocusModel {
  const fm = new FocusModel('cell');
  fm.setFocus(row, col);
  return fm;
}

/** Stubs navigator.clipboard.writeText and returns the mock. */
function stubClipboard(impl: (text: string) => Promise<void> = () => Promise.resolve()) {
  const writeText = vi.fn(impl);
  vi.stubGlobal('navigator', { clipboard: { writeText } });
  return writeText;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('CopyService', () => {

  it('uses TAB between columns and LF between rows', () => {
    expect(CopyService.columnSeparatorChar).toBe('\t');
    expect(CopyService.rowSeparatorChar).toBe('\n');
  });

  describe('createContent', () => {

    it('copies a selected range as TAB/LF separated text', async () => {
      const sm = rangeSelection(new CellRange(0, 0, 1, 1));
      await expect(new CopyService().createContent(model(), sm, focusAt(0, 0))).resolves.toBe('1\tAnn\n2\tBob');
    });

    it('copies a single selected cell', async () => {
      const sm = rangeSelection(CellRange.singleCell(1, 2));
      await expect(new CopyService().createContent(model(), sm, focusAt(0, 0))).resolves.toBe('Paris');
    });

    it('prefers the selection over the focused cell', async () => {
      const sm = rangeSelection(CellRange.singleCell(0, 1));
      await expect(new CopyService().createContent(model(), sm, focusAt(2, 2))).resolves.toBe('Ann');
    });

    it('copies the bounding box of several ranges, leaving unselected cells empty', async () => {
      const sm = rangeSelection(CellRange.singleCell(0, 0), CellRange.singleCell(1, 2));
      await expect(new CopyService().createContent(model(), sm, focusAt(0, 0))).resolves.toBe('1\t\t\n\t\tParis');
    });

    it('copies whole selected rows, clipped to the real column count', async () => {
      const sm = new SelectionModel('row', 'multi');
      sm.addSelection(CellRange.singleRow(1)); // c2 = Number.MAX_SAFE_INTEGER
      await expect(new CopyService().createContent(model(), sm, focusAt(0, 0))).resolves.toBe('2\tBob\tParis');
    });

    it('copies a whole selected column, clipped to the row count', async () => {
      const sm = new SelectionModel('column', 'multi');
      sm.addSelection(CellRange.singleColumn(1)); // r2 = Number.MAX_SAFE_INTEGER
      await expect(new CopyService().createContent(model(), sm, focusAt(0, 0))).resolves.toBe('Ann\nBob\nCid');
    });

    it('leaves out cells of a "negative" range (deselected with togglePoint)', async () => {
      const sm = rangeSelection(new CellRange(0, 0, 0, 2));
      sm.togglePoint(0, 1);
      await expect(new CopyService().createContent(model(), sm, focusAt(0, 0))).resolves.toBe('1\t\tBerlin');
    });

    it('skips hidden columns (ColumnDef.isVisible() === false)', async () => {
      const tableModel = TableFactory.createTableModel({
        rows,
        columnDefs: [
          ColumnDef.create({ property: 'id', headerLabel: 'ID' }),
          ColumnDef.create({ property: 'name', headerLabel: 'Name', isVisible: () => false }),
          ColumnDef.create({ property: 'city', headerLabel: 'City' }),
        ],
      });
      const sm = rangeSelection(new CellRange(0, 0, 0, 2));
      await expect(new CopyService().createContent(tableModel, sm, focusAt(0, 0))).resolves.toBe('1\tBerlin');
    });

    it('writes null values as the text "null"', async () => {
      // NOTE: getTextValueAt() is `'' + value` → null/undefined become "null"/"undefined" in the clipboard.
      const sm = rangeSelection(CellRange.singleCell(2, 2));
      await expect(new CopyService().createContent(model(), sm, focusAt(0, 0))).resolves.toBe('null');
    });

    it('copies the focused cell when there is no selection', async () => {
      await expect(new CopyService().createContent(model(), new SelectionModel('range', 'multi'), focusAt(1, 1)))
        .resolves.toBe('Bob');
    });

    it('copies the focused cell when the selection model is undefined', async () => {
      await expect(new CopyService().createContent(model(), undefined as any, focusAt(2, 0))).resolves.toBe('3');
    });

    it('rejects with a message when there is neither selection nor focus model', async () => {
      await expect(new CopyService().createContent(model(), new SelectionModel('range'), undefined as any))
        .rejects.toBe('Cannot copy, neither selection nor focus defined.');
    });

    it('resolves with "" (instead of rejecting) for a focus model without focus (-1/-1)', async () => {
      // NOTE: an empty FocusModel still counts as "focus defined" – the promise resolves with an empty text.
      await expect(new CopyService().createContent(model(), new SelectionModel('range'), new FocusModel('cell')))
        .resolves.toBe('');
    });

    // Regression: selectAll() sets only a flag (no ranges) → mergeRanges() found nothing and only the focused cell
    // was copied.
    it('copies the whole body after selectAll() (Ctrl+A, Ctrl+C)', async () => {
      const sm = new SelectionModel('range', 'multi');
      sm.selectAll();
      const text = await new CopyService().createContent(model(), sm, focusAt(0, 0));
      // only rows/first row are asserted – independent of how null cells are written (see NOTE above)
      const lines = text.split('\n');
      expect(lines).toHaveLength(3);
      expect(lines[0]).toBe('1\tAnn\tBerlin');
    });

    it('after selectAll() ignores the focused cell and leaves removed cells empty', async () => {
      // (before the fix only the focused cell was copied)
      const sm = new SelectionModel('cell', 'multi');
      sm.selectAll();
      sm.removeSelection(CellRange.singleCell(1, 1));
      await expect(new CopyService().createContent(model(), sm, focusAt(1, 1))).resolves.toBe('1\tAnn\tBerlin\n2\t\tParis\n3\tCid\tnull');
    });

    it('after selectAll() copies the displayed rows only and skips hidden columns', async () => {
      const tableModel = TableFactory.createTableModel({
        rows,
        columnDefs: [
          ColumnDef.create({ property: 'id', headerLabel: 'ID' }),
          ColumnDef.create({ property: 'name', headerLabel: 'Name', isVisible: () => false }),
          ColumnDef.create({ property: 'city', headerLabel: 'City' }),
        ],
      });
      tableModel.getBodyModel().externalFilterChanged((r: Row) => r.id !== 2);
      const sm = new SelectionModel('range', 'multi');
      sm.selectAll();
      await expect(new CopyService().createContent(tableModel, sm, focusAt(0, 0))).resolves.toBe('1\tBerlin\n3\tnull');
    });

    describe('maxCopyCells', () => {
      const original = CopyService.maxCopyCells;
      afterEach(() => { CopyService.maxCopyCells = original; });

      it('defaults to 1,000,000 cells', () => {
        expect(CopyService.maxCopyCells).toBe(1_000_000);
      });

      it('rejects a selection with more cells (no huge string is built)', async () => {
        CopyService.maxCopyCells = 8;
        const sm = new SelectionModel('range', 'multi');
        sm.selectAll(); // 3 rows × 3 columns = 9 cells
        const tableModel = model();
        const getTextValueAt = vi.spyOn(tableModel.getBodyModel(), 'getTextValueAt');
        await expect(new CopyService().createContent(tableModel, sm, focusAt(0, 0)))
          .rejects.toBe('Cannot copy 9 cells – more than CopyService.maxCopyCells (8).');
        expect(getTextValueAt).not.toHaveBeenCalled();
      });

      it('copies a selection with exactly maxCopyCells cells', async () => {
        CopyService.maxCopyCells = 9;
        const sm = new SelectionModel('range', 'multi');
        sm.selectAll();
        await expect(new CopyService().createContent(model(), sm, focusAt(0, 0))).resolves.toContain('Ann');
      });
    });

    it('after selectAll() resolves with "" for an empty table', async () => {
      const tableModel = TableFactory.createTableModel({ rows: [], properties: ['a', 'b'] });
      const sm = new SelectionModel('range', 'multi');
      sm.selectAll();
      await expect(new CopyService().createContent(tableModel, sm, focusAt(0, 0))).resolves.toBe('');
    });
  });

  describe('copyContent', () => {

    it('writes the text with navigator.clipboard.writeText', async () => {
      const writeText = stubClipboard();
      await new CopyService().copyContent('a\tb');
      expect(writeText).toHaveBeenCalledWith('a\tb');
    });
  });

  describe('copyToClipboard', () => {

    it('writes the created content to the clipboard and resolves with it', async () => {
      const writeText = stubClipboard();
      const sm = rangeSelection(new CellRange(0, 1, 1, 2));
      await expect(new CopyService().copyToClipboard(model(), sm, focusAt(0, 0))).resolves.toBe('Ann\tBerlin\nBob\tParis');
      expect(writeText).toHaveBeenCalledTimes(1);
      expect(writeText).toHaveBeenCalledWith('Ann\tBerlin\nBob\tParis');
    });

    it('resolves with "" and does not touch the clipboard when there is nothing to copy', async () => {
      const writeText = stubClipboard();
      const tableModel = TableFactory.createTableModel({ rows: [{ a: '' }], properties: ['a'] });
      await expect(new CopyService().copyToClipboard(tableModel, new SelectionModel('range'), focusAt(0, 0))).resolves.toBe('');
      expect(writeText).not.toHaveBeenCalled();
    });

    it('rejects (without reason) when writing to the clipboard fails', async () => {
      stubClipboard(() => Promise.reject(new Error('denied')));
      const sm = rangeSelection(CellRange.singleCell(0, 0));
      await expect(new CopyService().copyToClipboard(model(), sm, focusAt(0, 0))).rejects.toBeUndefined();
    });

    it('rejects (without reason) when there is neither selection nor focus', async () => {
      const writeText = stubClipboard();
      await expect(new CopyService().copyToClipboard(model(), new SelectionModel('range'), undefined as any)).rejects.toBeUndefined();
      expect(writeText).not.toHaveBeenCalled();
    });
  });
});
