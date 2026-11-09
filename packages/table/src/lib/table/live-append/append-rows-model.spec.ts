// AreaModelObjectArray.appendRows (prompt 019): in place, filter only the new rows, sorted merge, ring buffer.
import { describe, expect, it } from 'vitest';
import { AreaModelObjectArray, ColumnDef, SortItem, px100 } from '@guiexpert/table';

interface Line { id: number; level: string; v: number }

const columns = ['id', 'level', 'v'].map(p => new ColumnDef(p, p, px100));
const line = (id: number, v = id, level = 'INFO'): Line => ({ id, level, v });

function model(rows: Line[]) {
  return new AreaModelObjectArray<Line>('body', rows, 20, columns);
}
const ids = (m: AreaModelObjectArray<Line>) => m.getFilteredRows().map(r => r.id);

describe('AreaModelObjectArray.appendRows', () => {
  it('appends in place: your array and the displayed array stay the same objects', () => {
    const rows = [line(0), line(1)];
    const m = model(rows);
    const shownBefore = m.getFilteredRows();
    const r = m.appendRows([line(2), line(3)]);
    expect(m.getAllRows()).toBe(rows);
    expect(rows.map(x => x.id)).toEqual([0, 1, 2, 3]);
    expect(m.getFilteredRows()).toBe(shownBefore);
    expect(ids(m)).toEqual([0, 1, 2, 3]);
    expect(r).toMatchObject({ added: 2, shown: 2, removed: 0 });
    expect(Array.from(r.insertedPositions)).toEqual([2, 3]);
    expect(Array.from(r.removedPositions)).toEqual([]);
  });

  it('200,000 rows in one call: no stack overflow', () => {
    const m = model([]);
    const many = Array.from({ length: 200_000 }, (_, i) => line(i));
    expect(() => m.appendRows(many)).not.toThrow();
    expect(m.getRowCount()).toBe(200_000);
  });

  it('the filter runs only for the new rows; rejected rows are kept in the data', () => {
    const m = model([line(0, 0, 'INFO'), line(1, 1, 'ERROR')]);
    m.externalFilterChanged((r: Line) => r.level === 'ERROR');
    let calls = 0;
    const filter = (r: Line) => { calls++; return r.level === 'ERROR'; };
    const r = m.appendRows([line(2, 2, 'INFO'), line(3, 3, 'ERROR'), line(4, 4, 'ERROR')], { filter });
    expect(calls).toBe(3);
    expect(ids(m)).toEqual([1, 3, 4]);
    expect(m.getAllRows().length).toBe(5);
    expect(r).toMatchObject({ added: 3, shown: 2 });
    expect(Array.from(r.insertedPositions)).toEqual([1, 2]);
  });

  it('sorted: new rows are merged in, stable – behind equal old rows, equal new rows keep their order', () => {
    const m = model([line(0, 10), line(1, 20), line(2, 20), line(3, 30)]);
    const compare = m.createSortComparator([new SortItem(2, 'asc')])!;
    m.doSort([new SortItem(2, 'asc')]);
    let comparisons = 0;
    const counting = (a: Line, b: Line) => { comparisons++; return compare(a, b); };
    const r = m.appendRows([line(4, 20), line(5, 5), line(6, 40), line(7, 20)], { compare: counting });
    expect(ids(m)).toEqual([5, 0, 1, 2, 4, 7, 3, 6]);
    expect(Array.from(r.insertedPositions)).toEqual([0, 4, 5, 7]);
    // the same as sorting everything
    const all = [...m.getAllRows()].sort(compare).map(x => x.id);
    expect(ids(m)).toEqual(all);
    expect(comparisons).toBeLessThanOrEqual(4 * 2 + 4 + 8); // k log k + n + k, not n log n
  });

  it('sorted descending with sort items of several columns', () => {
    const m = model([line(0, 1, 'B'), line(1, 1, 'A'), line(2, 2, 'A')]);
    const items = [new SortItem(2, 'desc'), new SortItem(1, 'asc')];
    m.doSort(items);
    expect(ids(m)).toEqual([2, 1, 0]);
    m.appendRows([line(3, 1, 'AA'), line(4, 3, 'Z')], { compare: m.createSortComparator(items) });
    expect(ids(m)).toEqual([4, 2, 1, 3, 0]);
  });

  it('createSortComparator: undefined when nothing sorts', () => {
    const m = model([]);
    expect(m.createSortComparator([])).toBeUndefined();
    expect(m.createSortComparator([new SortItem(0, '')])).toBeUndefined();
  });

  it('ring buffer (maxRows): the oldest rows leave the data and the display, positions before the step', () => {
    const rows = Array.from({ length: 5 }, (_, i) => line(i));
    const m = model(rows);
    const r = m.appendRows([line(5), line(6), line(7)], { maxRows: 6 });
    expect(rows.map(x => x.id)).toEqual([2, 3, 4, 5, 6, 7]);
    expect(ids(m)).toEqual([2, 3, 4, 5, 6, 7]);
    expect(r).toMatchObject({ added: 3, removed: 2 });
    expect(Array.from(r.removedPositions)).toEqual([0, 1]);
    expect(Array.from(r.insertedPositions)).toEqual([3, 4, 5]);
  });

  it('ring buffer with a filter: only the shown removed rows have positions', () => {
    const m = model([line(0, 0, 'ERROR'), line(1, 1, 'INFO'), line(2, 2, 'ERROR'), line(3, 3, 'INFO')]);
    const filter = (r: Line) => r.level === 'ERROR';
    m.externalFilterChanged(filter);
    const r = m.appendRows([line(4, 4, 'ERROR')], { filter, maxRows: 3 });
    // maxRows 3: rows 0 and 1 leave (only row 0 was shown: position 0); kept 2, 3, 4 → shown 2, 4
    expect(m.getAllRows().map(x => x.id)).toEqual([2, 3, 4]);
    expect(ids(m)).toEqual([2, 4]);
    expect(Array.from(r.removedPositions)).toEqual([0]);
    expect(Array.from(r.insertedPositions)).toEqual([1]);
  });

  it('ring buffer while sorted: removed rows are found anywhere in the display', () => {
    const m = model([line(0, 30), line(1, 10), line(2, 20)]);
    const items = [new SortItem(2, 'asc')];
    m.doSort(items);
    expect(ids(m)).toEqual([1, 2, 0]);
    const r = m.appendRows([line(3, 15)], { compare: m.createSortComparator(items), maxRows: 3 });
    expect(ids(m)).toEqual([1, 3, 2]);
    expect(Array.from(r.removedPositions)).toEqual([2]);
    expect(Array.from(r.insertedPositions)).toEqual([1]);
  });

  it('ring buffer in blocks of 1 % of maxRows: one move of the array per many updates', () => {
    const rows = Array.from({ length: 1_000 }, (_, i) => line(i));
    const m = model(rows);
    const removed: number[] = [];
    for (let u = 0; u < 20; u++) {
      removed.push(m.appendRows([line(1_000 + u)], { maxRows: 1_000 }).removed);
    }
    expect(removed).toEqual([10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(rows.length).toBeLessThanOrEqual(1_000);
    expect(rows.length).toBeGreaterThanOrEqual(990);
    expect(rows[rows.length - 1].id).toBe(1_019);
  });

  it('more new rows than maxRows: only the last maxRows come in', () => {
    const m = model([line(0)]);
    const r = m.appendRows([line(1), line(2), line(3)], { maxRows: 2 });
    expect(ids(m)).toEqual([2, 3]);
    expect(r).toMatchObject({ added: 2, removed: 1 });
    expect(Array.from(r.removedPositions)).toEqual([0]);
    expect(Array.from(r.insertedPositions)).toEqual([0, 1]);
  });

  it('after a row drag the display order is the data order again (prefix removal)', () => {
    const m = model([line(0), line(1), line(2)]);
    m.doSort([new SortItem(0, 'desc')]);
    m.doSort([new SortItem(0, '')]);
    expect(m.moveRows([0], { rowIndex: 2, position: 'after' })).toBe(true);
    const order = ids(m);
    m.appendRows([line(3)], { maxRows: 3 });
    expect(ids(m)).toEqual([...order.slice(1), 3]);
  });

  it('review #1: rows merged in by a comparator although the display was in data order – later ring-buffer removals stay correct', () => {
    const rows = Array.from({ length: 50 }, (_, i) => line(i, 1_000 - i));      // data order ≠ sort order
    const m = model(rows);
    const compare = m.createSortComparator([new SortItem(2, 'asc')])!;          // the display was never sorted
    let next = 50;
    for (let u = 0; u < 30; u++) {
      const fresh = Array.from({ length: 10 }, () => line(next, next++));
      m.appendRows(fresh, { compare, maxRows: 50 });
    }
    const data = new Set(m.getAllRows());
    expect(m.getAllRows().length).toBeLessThanOrEqual(50);
    expect(m.getFilteredRows().every(r => data.has(r))).toBe(true);
    expect(m.getFilteredRows().length).toBe(m.getAllRows().length);
  });
});
