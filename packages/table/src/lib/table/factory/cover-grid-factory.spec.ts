import { describe, it, expect } from 'vitest';
import { CoverGridBodyModel, CoverGridFactory, CoverGridTableModel, TableOptions } from '@guiexpert/table';
import type { CellRendererIf } from '@guiexpert/table';

const renderer: CellRendererIf = { render: () => undefined };

describe('CoverGridFactory', () => {

  describe('createCoverGridModel', () => {
    it('creates a CoverGridTableModel with a configured CoverGridBodyModel', () => {
      const items = ['a', 'b', 'c'];
      const tm = CoverGridFactory.createCoverGridModel(items, renderer, 120, 180, 500, 10);
      expect(tm).toBeInstanceOf(CoverGridTableModel);
      expect(tm.bodyModel).toBeInstanceOf(CoverGridBodyModel);
      expect(tm.bodyModel.items).toBe(items);
      expect(tm.bodyModel.cellRenderer).toBe(renderer);
      expect(tm.bodyModel.coverWidth).toBe(120);
      expect(tm.bodyModel.coverHeight).toBe(180);
      expect(tm.bodyModel.width).toBe(500);
      expect(tm.bodyModel.firstRowPaddingTop).toBe(10);
      expect(tm.paddingTop).toBe(10);
      expect(tm.getColumnCount()).toBe(4);
    });

    it('uses 200 x 300 covers, width 0 and no padding by default', () => {
      const tm = CoverGridFactory.createCoverGridModel([1, 2], renderer);
      expect([tm.bodyModel.coverWidth, tm.bodyModel.coverHeight, tm.bodyModel.width, tm.bodyModel.firstRowPaddingTop])
        .toEqual([200, 300, 0, 0]);
      expect(tm.paddingTop).toBe(0);
      expect(tm.getColumnCount()).toBe(1);
    });
  });

  describe('createCoverGrisDefaultOptions (sic)', () => {
    const options = CoverGridFactory.createCoverGrisDefaultOptions(250);

    it('hides all borders and separators', () => {
      expect(options.horizontalBorderVisible).toBe(false);
      expect(options.verticalBorderVisible).toBe(false);
      expect(options.footerSeparatorBorderVisible).toBe(false);
      expect(options.headerSeparatorBorderVisible).toBe(false);
      expect(options.fixedEastSeparatorBorderVisible).toBe(false);
      expect(options.fixedWestSeparatorBorderVisible).toBe(false);
      expect(options.tableTopBorderVisible).toBe(false);
      expect(options.tableBottomBorderVisible).toBe(false);
    });

    it('switches off the row and column hover', () => {
      expect(options.hoverRowVisible).toBe(false);
      expect(options.hoverColumnVisible).toBe(false);
    });

    it('uses the given body row height and height 0 for header and footer', () => {
      expect(options.defaultRowHeights).toEqual({ header: 0, body: 250, footer: 0 });
    });

    it('restores only the scroll position, with storage key "CoverGrid"', () => {
      const restore = options.autoRestoreOptions!;
      expect(restore.autoRestoreScrollPosition).toBe(true);
      expect(restore.autoRestoreSortingState).toBe(false);
      expect(restore.autoRestoreCollapsedExpandedState).toBe(false);
      expect(restore.autoRestoreSelectedState).toBe(false);
      expect(restore.getStorageKeyFn?.()).toBe('CoverGrid');
    });

    it('uses a given storage key function', () => {
      const restore = CoverGridFactory.createCoverGrisDefaultOptions(100, () => 'my-key').autoRestoreOptions!;
      expect(restore.getStorageKeyFn?.()).toBe('my-key');
    });

    it('keeps the other TableOptions defaults', () => {
      const defaults = new TableOptions();
      expect(options.columnsResizable).toBe(defaults.columnsResizable);
      expect(options.sortOrder).toEqual(defaults.sortOrder);
      expect(options.overflowY).toBe(defaults.overflowY);
    });
  });
});
