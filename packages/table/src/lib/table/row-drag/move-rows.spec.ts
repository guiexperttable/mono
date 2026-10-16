import { describe, expect, it, vi } from 'vitest';
import {
  AreaModelArrayOfArrays,
  AreaModelObjectArray,
  AreaModelTree,
  AriaTexts,
  calcMoveToIndex,
  canMoveTreeRows,
  findRowIndexAtY,
  ColumnDef,
  GeRowDragEvent,
  getInsertBeforeIndex,
  getTopmostTreeRows,
  moveArrayItems,
  moveTreeRows,
  normalizeRowIndices,
  RowDragOptions,
  RowGroupFactory,
  RowNumberColumnDef,
  TableFactory,
  TreeRow,
} from '@guiexpert/table';
import type { RowDropTargetIf, TreeRowIf } from '@guiexpert/table';

const letters = () => ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];

/** Independent reference: remove the items, insert them in front of the item that was at `insertBefore`. */
function referenceMove(list: string[], indices: number[], insertBefore: number): string[] {
  const moving = indices.map(i => list[i]);
  const anchor = list.slice(insertBefore).find(x => !moving.includes(x));
  const rest = list.filter(x => !moving.includes(x));
  const at = anchor === undefined ? rest.length : rest.indexOf(anchor);
  return [...rest.slice(0, at), ...moving, ...rest.slice(at)];
}

describe('moveArrayItems / calcMoveToIndex', () => {

  it('D1: row 3 dropped between row 7 and 8 is row 7 afterwards', () => {
    const list = letters();
    const target: RowDropTargetIf = { rowIndex: 6, position: 'after' };
    expect(calcMoveToIndex([2], target)).toBe(6);
    expect(moveArrayItems(list, [2], getInsertBeforeIndex(target))).toBe(6);
    expect(list).toEqual(['a', 'b', 'd', 'e', 'f', 'g', 'c', 'h', 'i', 'j']);
  });

  it('moves up', () => {
    const list = letters();
    expect(moveArrayItems(list, [5], 1)).toBe(1);
    expect(list.join('')).toBe('afbcdeghij');
  });

  it('several rows keep their order (D6), also with gaps', () => {
    const list = letters();
    expect(moveArrayItems(list, [1, 3, 4], 8)).toBe(5);
    expect(list.join('')).toBe('acfghbdeij');
  });

  it('a target inside or next to the moved rows changes nothing', () => {
    for (const insertBefore of [2, 3, 4, 5]) {
      const list = letters();
      expect(moveArrayItems(list, [2, 3, 4], insertBefore)).toBe(2);
      expect(list).toEqual(letters());
    }
  });

  it('agrees with an independent reference for all single and double moves', () => {
    const n = 6;
    const base = letters().slice(0, n);
    for (let a = 0; a < n; a++) {
      for (let b = a; b < n; b++) {
        const indices = a === b ? [a] : [a, b];
        for (let before = 0; before <= n; before++) {
          const list = [...base];
          const expected = referenceMove(base, indices, before);
          const newIndex = moveArrayItems(list, indices, before);
          expect(list).toEqual(expected);
          expect(newIndex).toBe(expected.indexOf(base[indices[0]]));
          const target: RowDropTargetIf = before < n ? { rowIndex: before, position: 'before' } : { rowIndex: n - 1, position: 'after' };
          expect(calcMoveToIndex(indices, target)).toBe(newIndex);
        }
      }
    }
  });

  it('boundaries: start, end, invalid indices, nothing', () => {
    const list = letters();
    expect(moveArrayItems(list, [9], 0)).toBe(0);
    expect(list[0]).toBe('j');
    expect(moveArrayItems(list, [0], 99)).toBe(9);           // clamped to the end
    expect(list[9]).toBe('j');
    expect(moveArrayItems(list, [-1, 42], 0)).toBe(-1);
    expect(moveArrayItems(list, [], 0)).toBe(-1);
    expect(calcMoveToIndex([], { rowIndex: 0, position: 'before' })).toBe(-1);
    expect(list.length).toBe(10);
  });

  it('normalizeRowIndices sorts, removes doubles and out-of-range values', () => {
    expect(normalizeRowIndices([5, 2, 2, 99, -1, 1.5], 10)).toEqual([2, 5]);
  });

  it('getInsertBeforeIndex: "inside" counts like "after" for flat lists', () => {
    expect(getInsertBeforeIndex({ rowIndex: 3, position: 'before' })).toBe(3);
    expect(getInsertBeforeIndex({ rowIndex: 3, position: 'after' })).toBe(4);
    expect(getInsertBeforeIndex({ rowIndex: 3, position: 'inside' })).toBe(4);
  });
});

describe('flat area models', () => {
  const rows = () => letters().map((name, id) => ({ id, name }));

  it('AreaModelObjectArray moves in display order and writes the order back in place', () => {
    const data = rows();
    const model = new AreaModelObjectArray('body', data, 30, [new ColumnDef('name', 'Name')]);
    expect(model.canMoveRows([2], { rowIndex: 6, position: 'after' })).toBe(true);
    expect(model.moveRows([2], { rowIndex: 6, position: 'after' })).toBe(true);
    expect(model.getFilteredRows().map(r => r.name).join('')).toBe('abdefgchij');
    expect(data.map(r => r.name).join('')).toBe('abdefgchij');      // the app's array, in place
    expect(model.getAllRows()).toBe(data);
  });

  it('AreaModelObjectArray: a sorted display order becomes the order of all rows', () => {
    const data = rows();
    const model = new AreaModelObjectArray('body', data, 30, [new ColumnDef('name', 'Name')]);
    model.sort((a, b) => b.id - a.id);                                  // j … a
    model.moveRows([0], { rowIndex: 9, position: 'after' });            // j to the end
    expect(data.map(r => r.name).join('')).toBe('ihgfedcbaj');
  });

  it('AreaModelObjectArray: not while a filter hides rows, not "inside", not outside the rows', () => {
    const model = new AreaModelObjectArray('body', rows(), 30, [new ColumnDef('name', 'Name')]);
    expect(model.canMoveRows([0], { rowIndex: 1, position: 'inside' })).toBe(false);
    expect(model.canMoveRows([0], { rowIndex: 10, position: 'before' })).toBe(false);
    expect(model.canMoveRows([42], { rowIndex: 1, position: 'before' })).toBe(false);
    model.externalFilterChanged((r: { id: number }) => r.id > 2);
    expect(model.canMoveRows([0], { rowIndex: 3, position: 'after' })).toBe(false);
    expect(model.moveRows([0], { rowIndex: 3, position: 'after' })).toBe(false);
    model.externalFilterChanged(() => true);                          // a filter that keeps all rows does not block
    expect(model.moveRows([0], { rowIndex: 3, position: 'after' })).toBe(true);
  });

  it('AreaModelArrayOfArrays moves in place', () => {
    const arr = [['a'], ['b'], ['c']];
    const model = new AreaModelArrayOfArrays('body', arr, 30);
    expect(model.moveRows([0], { rowIndex: 2, position: 'after' })).toBe(true);
    expect(arr.map(r => r[0]).join('')).toBe('bca');
    expect(model.getValueAt(2, 0)).toBe('a');
    model.externalFilterChanged((r: string[]) => r[0] !== 'b');
    expect(model.canMoveRows([0], { rowIndex: 1, position: 'before' })).toBe(false);
  });
});

describe('trees (D7)', () => {
  interface Node { name: string }

  /** a (a1, a2 (a2x)), b, c (c1) – all expanded */
  function buildTree(): { roots: TreeRowIf<Node>[]; byName: Map<string, TreeRowIf<Node>> } {
    const byName = new Map<string, TreeRowIf<Node>>();
    const node = (name: string, parent?: TreeRowIf<Node>, children: string[] = []): TreeRowIf<Node> => {
      const row = new TreeRow<Node>({ name }, true, [], parent, parent ? parent.deep + 1 : 0);
      byName.set(name, row);
      row.children = children.length ? [] : undefined;
      return row;
    };
    const a = node('a', undefined, ['x']);
    const a1 = node('a1', a);
    const a2 = node('a2', a, ['x']);
    const a2x = node('a2x', a2);
    a2.children = [a2x];
    a.children = [a1, a2];
    const b = node('b');
    const c = node('c', undefined, ['x']);
    const c1 = node('c1', c);
    c.children = [c1];
    return { roots: [a, b, c], byName };
  }

  const names = (rows: TreeRowIf<Node>[]): string => rows.map(r => r.data.name).join(',');

  it('before/after = siblings of the target row, children travel along, deep follows', () => {
    const { roots, byName } = buildTree();
    expect(moveTreeRows(roots, [byName.get('a2')!], byName.get('c1')!, 'after')).toBe(true);
    expect(names(roots)).toBe('a,b,c');
    expect(names(byName.get('c')!.children!)).toBe('c1,a2');
    expect(byName.get('a2')!.parent).toBe(byName.get('c'));
    expect(byName.get('a2x')!.deep).toBe(2);
    expect(names(byName.get('a')!.children!)).toBe('a1');
  });

  it('"inside" = last child, the target is expanded; a leaf gets a children array', () => {
    const { roots, byName } = buildTree();
    const b = byName.get('b')!;
    b.expanded = false;
    expect(moveTreeRows(roots, [byName.get('c')!], b, 'inside')).toBe(true);
    expect(names(roots)).toBe('a,b');
    expect(names(b.children!)).toBe('c');
    expect(b.expanded).toBe(true);
    expect(byName.get('c1')!.deep).toBe(2);
  });

  it('a child moves to the top level', () => {
    const { roots, byName } = buildTree();
    expect(moveTreeRows(roots, [byName.get('a2x')!], byName.get('a')!, 'before')).toBe(true);
    expect(names(roots)).toBe('a2x,a,b,c');
    expect(byName.get('a2x')!.parent).toBeUndefined();
    expect(byName.get('a2x')!.deep).toBe(0);
  });

  it('cycle protection: no node into itself or its descendants', () => {
    const { roots, byName } = buildTree();
    const a = byName.get('a')!;
    expect(canMoveTreeRows([a], byName.get('a2x'))).toBe(false);
    expect(canMoveTreeRows([a], a)).toBe(false);
    expect(canMoveTreeRows([a], undefined)).toBe(false);
    expect(canMoveTreeRows([], byName.get('b'))).toBe(false);
    expect(moveTreeRows(roots, [a], byName.get('a2')!, 'inside')).toBe(false);
    expect(names(roots)).toBe('a,b,c');
  });

  it('a dragged child of a dragged parent travels with the parent (not twice)', () => {
    const { byName } = buildTree();
    const rows = [byName.get('a')!, byName.get('a1')!, byName.get('b')!];
    expect(names(getTopmostTreeRows(rows))).toBe('a,b');
  });

  it('AreaModelTree.moveRows works on display indices and refreshes the displayed rows', () => {
    const { roots } = buildTree();
    const model = new AreaModelTree<Node>('body', roots, 30, [new ColumnDef('name', 'Name')]);
    const shown = () => names(model.getFilteredFlattenRows());
    expect(shown()).toBe('a,a1,a2,a2x,b,c,c1');
    expect(model.canMoveRows([0], { rowIndex: 3, position: 'inside' })).toBe(false);   // a into a2x: cycle
    expect(model.moveRows([4], { rowIndex: 0, position: 'before' })).toBe(true);       // b to the top
    expect(shown()).toBe('b,a,a1,a2,a2x,c,c1');
    expect(model.moveRows([1, 2], { rowIndex: 6, position: 'inside' })).toBe(true);    // a (with a1) into c1
    expect(shown()).toBe('b,c,c1,a,a1,a2,a2x');
    model.externalFilterChanged((row: TreeRowIf<Node>) => row.data.name !== 'b');
    expect(model.canMoveRows([0], { rowIndex: 1, position: 'before' })).toBe(false);   // filtered
  });

  it('row grouping never moves rows itself (D8)', () => {
    const tableModel = RowGroupFactory.createTableModel({
      rows: [{ r: 'x', v: 1 }, { r: 'y', v: 2 }], groupBy: ['r'], columnDefs: [new ColumnDef('v', 'V')]
    });
    const body = tableModel.getBodyModel();
    expect(body.canMoveRows?.([1], { rowIndex: 0, position: 'before' })).toBe(false);
    expect(body.moveRows?.([1], { rowIndex: 0, position: 'before' })).toBe(false);
  });
});

describe('options, event, texts, column definition, factory', () => {

  it('RowDragOptions.create keeps defaults for missing and undefined values', () => {
    const o = RowDragOptions.create({ managed: false, autoScrollZoneInPx: undefined });
    expect(o).toMatchObject({ managed: false, multiRow: true, treeDropInside: true, dragThresholdInPx: 4,
      autoScrollZoneInPx: 40, autoScrollMaxSpeedInPx: 24 });
    expect(RowDragOptions.create().managed).toBe(true);
  });

  it('GeRowDragEvent: preventDefault', () => {
    const evt = new GeRowDragEvent('start', 'pointer', [{ id: 1 }], [0], undefined, -1, false, true);
    expect(evt.defaultPrevented).toBe(false);
    evt.preventDefault();
    expect(evt.defaultPrevented).toBe(true);
    expect(evt.moved).toBe(false);
  });

  it('AriaTexts: English defaults, own texts win', () => {
    const t = new AriaTexts();
    expect(t.rowDragStarted(1)).toBe('Dragging 1 row. Press Escape to cancel.');
    expect(t.rowDragStarted(3)).toBe('Dragging 3 rows. Press Escape to cancel.');
    expect(t.rowMoved(7, 20)).toBe('Row moved to position 7 of 20');
    expect(t.rowMoveNotPossible()).toBe('Rows cannot be moved while the table is sorted or filtered');
    expect(t.rowDragCancelled()).toBe('Drag cancelled');
    expect(AriaTexts.create({ rowMoved: (p: number) => `Zeile ${p}` }).rowMoved!(2, 3)).toBe('Zeile 2');
  });

  it('ColumnDef.create takes rowDrag', () => {
    expect(ColumnDef.create({ property: 'a', rowDrag: true }).rowDrag).toBe(true);
    const fn = (row: { locked: boolean }) => !row.locked;
    expect(ColumnDef.create({ property: 'a', rowDrag: fn }).rowDrag).toBe(fn);
    expect(ColumnDef.create({ property: 'a' }).rowDrag).toBeUndefined();
  });

  it('TableFactory: rowDrag sets the handle on the first data column (behind row numbers)', () => {
    const tableModel = TableFactory.createTableModel({
      rows: [{ title: 'x', prio: 1 }], properties: ['title', 'prio'], rowDrag: true, rowNumbersVisible: true
    });
    const defs = tableModel.getColumnDefs()!;
    expect(defs[0]).toBeInstanceOf(RowNumberColumnDef);
    expect(defs[0].rowDrag).toBeUndefined();
    expect(defs[1].rowDrag).toBe(true);
    expect(defs[2].rowDrag).toBeUndefined();
  });

  it('TableFactory: an own rowDrag function is kept', () => {
    const fn = vi.fn(() => true);
    const def = ColumnDef.create({ property: 'title', rowDrag: fn });
    const tableModel = TableFactory.createTableModel({ rows: [{ title: 'x' }], columnDefs: [def], rowDrag: true });
    expect(tableModel.getColumnDefs()![0].rowDrag).toBe(fn);
  });
});

describe('findRowIndexAtY', () => {

  it('constant heights: direct, clamped to the rows', () => {
    expect(findRowIndexAtY(0, 10, i => i * 30, 30)).toBe(0);
    expect(findRowIndexAtY(89, 10, i => i * 30, 30)).toBe(2);
    expect(findRowIndexAtY(-50, 10, i => i * 30, 30)).toBe(0);
    expect(findRowIndexAtY(10_000, 10, i => i * 30, 30)).toBe(9);
  });

  it('variable heights: binary search agrees with a linear search', () => {
    const heights = Array.from({ length: 200 }, (_, i) => 20 + (i * 37) % 41);
    const tops = heights.reduce<number[]>((acc, h, i) => { acc.push(i ? acc[i - 1] + heights[i - 1] : 0); return acc; }, []);
    const linear = (y: number) => { let r = 0; while (r + 1 < tops.length && tops[r + 1] <= y) r++; return r; };
    for (let y = -10; y < tops[199] + 100; y += 7) {
      expect(findRowIndexAtY(y, 200, i => tops[i])).toBe(linear(y));
    }
  });

  it('no rows: -1', () => {
    expect(findRowIndexAtY(10, 0, () => 0)).toBe(-1);
  });
});
