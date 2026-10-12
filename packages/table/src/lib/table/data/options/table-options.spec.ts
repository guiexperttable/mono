import { describe, it, expect } from 'vitest';
import { HeaderGroupOptions, InputCellRenderer, SortedOptions, TableOptions, TreeOptions } from '@guiexpert/table';
import type { TableOptionsIf } from '@guiexpert/table';

describe('TableOptions', () => {
  const o = new TableOptions();

  it('shows all borders and separators by default', () => {
    expect(o.horizontalBorderVisible).toBe(true);
    expect(o.verticalBorderVisible).toBe(true);
    expect(o.headerSeparatorBorderVisible).toBe(true);
    expect(o.footerSeparatorBorderVisible).toBe(true);
    expect(o.fixedWestSeparatorBorderVisible).toBe(true);
    expect(o.fixedEastSeparatorBorderVisible).toBe(true);
    expect(o.tableTopBorderVisible).toBe(true);
    expect(o.tableBottomBorderVisible).toBe(true);
  });

  it('enables hover, column resizing and dragging by default', () => {
    expect(o.hoverRowVisible).toBe(true);
    expect(o.hoverColumnVisible).toBe(true);
    expect(o.columnsResizable).toBe(true);
    expect(o.columnsDraggable).toBe(true);
    expect(o.columnResizeHandleWidthInPx).toBe(4);
  });

  it('uses 34px rows and auto overflow', () => {
    expect(o.defaultRowHeights).toEqual({ header: 34, body: 34, footer: 34 });
    expect(o.overflowX).toBe('auto');
    expect(o.overflowY).toBe('auto');
  });

  it('has default sub options', () => {
    expect(o.treeOptions).toBeInstanceOf(TreeOptions);
    expect(o.headerGroupOptions).toBeInstanceOf(HeaderGroupOptions);
    expect(o.sortedOptions).toBeInstanceOf(SortedOptions);
  });

  it('sorts asc → desc, without external filter, selection or focus model', () => {
    expect(o.sortOrder).toEqual(['asc', 'desc']);
    expect(o.externalFilterFunction).toBeUndefined();
    expect(o.getSelectionModel).toBeUndefined();
    expect(o.getFocusModel).toBeUndefined();
    expect(o.shortcutActionsDisabled).toBe(false);
    expect(o.showCheckboxWihoutExtraColumn).toBe(false);
    expect(o.resizeEventDebounceDelay).toBe(500);
  });

  it('edits with an InputCellRenderer by default', () => {
    expect(o.getEditRenderer?.(0, 0)).toBeInstanceOf(InputCellRenderer);
  });

  it('can be extended with the spread pattern', () => {
    const custom: TableOptionsIf = { ...new TableOptions(), hoverColumnVisible: false };
    expect(custom.hoverColumnVisible).toBe(false);
    expect(custom.hoverRowVisible).toBe(true);
  });

  it('every instance has its own defaultRowHeights object', () => {
    expect(new TableOptions().defaultRowHeights).not.toBe(o.defaultRowHeights);
  });
});
