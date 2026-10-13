import { describe, it, expect } from 'vitest';
import { AreaModelHidden, SortItem } from '@guiexpert/table';

describe('AreaModelHidden', () => {
  const model = new AreaModelHidden('header');

  it('defaults to the body area', () => {
    expect(new AreaModelHidden().areaIdent).toBe('body');
    expect(model.areaIdent).toBe('header');
  });

  it('has no rows, no height and empty values', () => {
    expect(model.getRowCount()).toBe(0);
    expect(model.getRowHeight(0)).toBe(0);
    expect(model.getYPosByRowIndex(10)).toBe(0);
    expect(model.getValueAt(0, 0)).toBe('');
    expect(model.getTextValueAt(0, 0)).toBe('');
    expect(model.getTooltipAt(0, 0)).toBe('');
    expect(model.getRowByIndex(0)).toBeUndefined();
  });

  it('has no spans, renderers, classes or styles', () => {
    expect(model.getColspanAt(0, 0)).toBe(0);
    expect(model.getRowspanAt(0, 0)).toBe(0);
    expect(model.getMaxColspan()).toBe(0);
    expect(model.getMaxRowspan()).toBe(0);
    expect(model.getCellRenderer(0, 0)).toBeUndefined();
    expect(model.getCustomClassesAt(0, 0)).toEqual([]);
    expect(model.getCustomStyleAt(0, 0)).toBeUndefined();
  });

  it('is neither filterable, sortable, editable, selectable nor checkable', () => {
    expect(model.isFilterable()).toBe(false);
    expect(model.doSort([new SortItem(0, 'asc')])).toBe(false);
    expect(model.isEditable(0, 0)).toBe(false);
    expect(model.setValue(0, 0, 'x')).toBe(false);
    expect(model.isSelectable(0, 0)).toBe(false);
    expect(model.isRowCheckable(0)).toBe(false);
    expect(model.isRowChecked(0)).toBeUndefined();
    expect(model.rowSelectionModel).toBeUndefined();
  });

  it('ignores all mutating calls', () => {
    expect(() => {
      model.init();
      model.sort((a: number, b: number) => a - b);
      model.externalFilterChanged(() => false);
      model.setRowChecked(0, true);
      model.changeColumnOrder(0, 1);
    }).not.toThrow();
    expect(model.getRowCount()).toBe(0);
  });
});
