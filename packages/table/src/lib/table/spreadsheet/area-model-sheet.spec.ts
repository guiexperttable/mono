// The sparse body of a spreadsheet (prompt 013 stage 7).
import { describe, expect, it } from 'vitest';
import { AreaModelSheet, SortItem } from '@guiexpert/table';

function model(data: unknown[][] = [['a', 3], [], ['c', 1], ['', null]], rows = 6, cols = 3) {
  return new AreaModelSheet('body', data, rows, cols, 30, [], 1);
}

describe('AreaModelSheet', () => {
  it('sparse cells, offset columns, empty cells as ""', () => {
    const m = model();
    expect(m.getRowCount()).toBe(6);
    expect(m.getValueAt(0, 1)).toBe('a');
    expect(m.getValueAt(0, 2)).toBe(3);
    expect(m.getValueAt(1, 1)).toBe('');
    expect(m.getValueAt(5, 3)).toBe('');
    expect(m.getTextValueAt(0, 2)).toBe('3');
    expect(m.getInputValueAt(3, 1)).toBe('');
    expect(m.getRowByIndex(1)).toBeUndefined(); // empty rows have no object
    expect(m.getRowByIndex(0)).toEqual(['a', 3]);
    expect(m.getPhysicalRowOfArray(m.getRowByIndex(2))).toBe(2);
    expect(m.getSheetColumnCount()).toBe(3);
    expect(m.getConstantRowHeight()).toBe(30);
    expect(m.getRowHeight(0)).toBe(30);
    expect(new AreaModelSheet('body', [], 2, 2, -1).getConstantRowHeight()).toBeUndefined();
  });

  it('setValue creates rows; empty values never create one; the row number column is read only', () => {
    const m = model();
    expect(m.setValue(4, 1, 'x')).toBe(true);
    expect(m.getCell(4, 0)).toBe('x');
    expect(m.setValue(5, 1, '')).toBe(true);
    expect(m.getRowByIndex(5)).toBeUndefined();
    expect(m.setValue(0, 0, 'no')).toBe(false);
    expect(m.setValue(99, 1, 'no')).toBe(false);
    expect(m.getSheetData()).toEqual([['a', 3], ['', ''], ['c', 1], ['', ''], ['x', '']]);
    const cells: unknown[] = [];
    m.forEachCell((r, c, v) => cells.push([r, c, v]));
    expect(cells).toContainEqual([4, 0, 'x']);
    expect(new AreaModelSheet('body', [], 2, 2, 30).getSheetData()).toEqual([]);
  });

  it('filter and sort as a permutation; physical ↔ display', () => {
    const m = model([['b', 2], ['a', 3], ['c', 1], ['', '#'], ['d', '']], 6, 2);
    m.externalFilterChanged((row: unknown) => (row as unknown[])[0] !== 'a');
    expect(m.getRowCount()).toBe(5);
    expect(m.getPhysicalRowIndex(1)).toBe(2);
    expect(m.getDisplayRowIndex(1)).toBe(-1);
    expect(m.getDisplayRowIndex(2)).toBe(1);
    m.doSort([new SortItem(2, 'asc')]);
    expect([0, 1, 2].map(i => m.getValueAt(i, 2))).toEqual([1, 2, '#']); // text after numbers, empty last
    expect(m.getValueAt(4, 2)).toBe('');
    m.doSort([new SortItem(2, 'desc')]);
    expect(m.getValueAt(0, 2)).toBe('#');
    m.doSort([]);
    expect(m.getPhysicalRowIndex(1)).toBe(2); // physical order, still filtered
    m.externalFilterChanged(() => true);
    expect(m.getRowCount()).toBe(6);
    expect(m.getDisplayRowIndex(5)).toBe(5);
    expect(m.getDisplayRowIndex(6)).toBe(-1);
    m.doSort([new SortItem(1, 'asc')]);
    m.doSort([]);
    expect(m.getPhysicalRowIndex(3)).toBe(3); // unsorted: no permutation
  });

  it('insert and delete rows and columns; deleted rows and columns come back with the same arrays', () => {
    const m = model([['a', 1], ['b', 2], ['c', 3]], 4, 2);
    const b = m.getRowArray(1)!;
    const v = m.version;
    m.insertRows(1, 2);
    expect(m.getUnfilteredRowCount()).toBe(6);
    expect(m.getCell(3, 0)).toBe('b');
    expect(m.getPhysicalRowOfArray(b)).toBe(3);
    const removed = m.deleteRows(0, 2);
    expect(removed).toEqual([[0, ['a', 1]]]);
    expect(m.getCell(1, 0)).toBe('b');
    m.restoreRows(0, 2, removed);
    expect(m.getCell(0, 0)).toBe('a');
    expect(m.getRowArray(3)).toBe(b);
    m.insertColumns(1, 1);
    expect(m.getCell(3, 2)).toBe(2);
    expect(m.getSheetColumnCount()).toBe(3);
    const cols = m.deleteColumns(0, 2);
    expect(m.getCell(3, 0)).toBe(2);
    m.restoreColumns(0, 2, cols);
    expect(m.getCell(3, 0)).toBe('b');
    expect(m.getRowArray(3)).toBe(b);
    expect(m.version).toBeGreaterThan(v);
    expect(m.getContentExtent()).toEqual([4, 3]);
    m.setSheetData([['z']], 1, 1);
    expect(m.getUnfilteredRowCount()).toBe(1);
    expect(m.getSheetData()).toEqual([['z']]);
    expect(new AreaModelSheet('body', [], 2, 2, 30).getContentExtent()).toEqual([-1, -1]);
  });
});
