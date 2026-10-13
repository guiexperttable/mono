import { describe, it, expect, vi } from 'vitest';
import {
  AreaModelTree,
  ColumnDef,
  SortItem,
  TreeCheckboxModel,
  TreeFactory,
  isAreaModelTree,
} from '@guiexpert/table';
import type { ColumnDefIf, TreeRowIf } from '@guiexpert/table';

interface Node {
  name: string;
  size: number;
  meta?: { code: string };
  children?: Node[];
}

/*
 * B   size 1   (meta.code "b")
 * ├─ B2   10
 * └─ B1   20
 * A   size 2
 * └─ A1   5
 *    └─ A1x 50
 * C   size 3
 */
function data(): Node[] {
  return [
    { name: 'B', size: 1, meta: { code: 'b' }, children: [{ name: 'B2', size: 10 }, { name: 'B1', size: 20 }] },
    { name: 'A', size: 2, children: [{ name: 'A1', size: 5, children: [{ name: 'A1x', size: 50 }] }] },
    { name: 'C', size: 3 },
  ];
}

type ColumnParams = Parameters<typeof ColumnDef.create>[0];

/** columns: 0 = name, 1 = size, 2 = meta.code */
function columnDefs(extra: { name?: ColumnParams; size?: ColumnParams } = {}): ColumnDefIf[] {
  return [
    ColumnDef.create({ ...extra.name, property: 'name' }),
    ColumnDef.create({ ...extra.size, property: 'size' }),
    ColumnDef.create({ property: 'meta.code' }),
  ];
}

function createModel(opts: { expanded?: boolean; defs?: ColumnDefIf[]; rowHeight?: number } = {}) {
  const rows = TreeFactory.buildTreeRows<Node>(data(), { expanded: opts.expanded ?? true });
  const model = new AreaModelTree<Node>('body', rows, opts.rowHeight ?? 20, opts.defs ?? columnDefs());
  return { model, rows };
}

/** names of the displayed rows */
function shown(model: AreaModelTree<Node>): string[] {
  const ret: string[] = [];
  for (let i = 0; i < model.getRowCount(); i++) {
    ret.push(model.getValueAt(i, 0));
  }
  return ret;
}

/** all tree rows depth-first, independent of expanded */
function flatten(rows: TreeRowIf<Node>[], ret: TreeRowIf<Node>[] = []): TreeRowIf<Node>[] {
  for (const r of rows) {
    ret.push(r);
    if (r.children) flatten(r.children, ret);
  }
  return ret;
}

function find(rows: TreeRowIf<Node>[], name: string): TreeRowIf<Node> {
  const hit = flatten(rows).find(r => r.data.name === name);
  if (!hit) throw new Error('not found: ' + name);
  return hit;
}

const byName = (name: string) => (r: TreeRowIf<Node>) => r.data.name === name;

describe('AreaModelTree', () => {

  describe('identity', () => {
    it('is marked as "AreaModelTree" (isAreaModelTree)', () => {
      const { model } = createModel();
      expect(model.type).toBe('AreaModelTree');
      expect(isAreaModelTree(model)).toBe(true);
    });

    it('keeps the given rows and area ident', () => {
      const { model, rows } = createModel();
      expect(model.rows).toBe(rows);
      expect(model.areaIdent).toBe('body');
    });

    it('is filterable as body area', () => {
      expect(createModel().model.isFilterable()).toBe(true);
    });
  });

  describe('getRowCount / getValueAt (expanded)', () => {
    it('counts all rows when everything is expanded', () => {
      expect(createModel().model.getRowCount()).toBe(7);
    });

    it('shows the rows depth-first', () => {
      expect(shown(createModel().model)).toEqual(['B', 'B2', 'B1', 'A', 'A1', 'A1x', 'C']);
    });

    it('reads the column property of the row object', () => {
      const { model } = createModel();
      expect(model.getValueAt(1, 0)).toBe('B2');
      expect(model.getValueAt(1, 1)).toBe(10);
    });

    it('reads nested properties ("meta.code")', () => {
      const { model } = createModel();
      expect(model.getValueAt(0, 2)).toBe('b');
    });

    it('returns undefined for a nested property whose parent object is missing', () => {
      const { model } = createModel();
      expect(model.getValueAt(3, 2)).toBeUndefined();
    });

    it('returns "" for an unknown column', () => {
      expect(createModel().model.getValueAt(0, 9)).toBe('');
    });

    it('returns "" for a row index out of range', () => {
      const { model } = createModel();
      expect(model.getValueAt(99, 0)).toBe('');
      expect(model.getValueAt(-1, 0)).toBe('');
    });

    it('getTextValueAt() converts the value to a string', () => {
      expect(createModel().model.getTextValueAt(1, 1)).toBe('10');
    });

    it('getRowByIndex() returns the displayed tree row', () => {
      const { model, rows } = createModel();
      expect(model.getRowByIndex(0)).toBe(rows[0]);
      expect(model.getRowByIndex(1)).toBe(rows[0].children![0]);
      expect(model.getRowByIndex(7)).toBeUndefined();
    });

    it('getFilteredFlattenRows() returns the displayed tree rows', () => {
      const { model } = createModel();
      expect(model.getFilteredFlattenRows().map(r => r.data.name)).toEqual(['B', 'B2', 'B1', 'A', 'A1', 'A1x', 'C']);
    });
  });

  describe('collapsed', () => {
    it('shows only the top level when built collapsed', () => {
      const { model } = createModel({ expanded: false });
      expect(model.getRowCount()).toBe(3);
      expect(shown(model)).toEqual(['B', 'A', 'C']);
    });

    it('expanding one node + recalcVisibleTreeRows() shows its children', () => {
      const { model, rows } = createModel({ expanded: false });
      find(rows, 'A').expanded = true;
      model.recalcVisibleTreeRows();
      // A1 itself is still collapsed → A1x stays hidden
      expect(shown(model)).toEqual(['B', 'A', 'A1', 'C']);
    });

    it('collapsing one node + recalcVisibleTreeRows() hides all its descendants', () => {
      const { model, rows } = createModel();
      find(rows, 'A').expanded = false;
      model.recalcVisibleTreeRows();
      expect(shown(model)).toEqual(['B', 'B2', 'B1', 'A', 'C']);
    });

    it('getRowCount() already drops collapsed rows before recalcVisibleTreeRows(), getRowByIndex() does not', () => {
      const { model, rows } = createModel();
      find(rows, 'A').expanded = false;
      // NOTE: getRowCount() checks visibility itself, while getRowByIndex()/getValueAt() use the stale list
      // until recalcVisibleTreeRows() is called – count and content disagree in between.
      expect(model.getRowCount()).toBe(5);
      expect(model.getValueAt(4, 0)).toBe('A1');
      model.recalcVisibleTreeRows();
      expect(model.getValueAt(4, 0)).toBe('C');
    });
  });

  describe('toggleExpandCollapseAll', () => {
    it('false collapses every row on every level', () => {
      const { model, rows } = createModel();
      model.toggleExpandCollapseAll(false);
      expect(shown(model)).toEqual(['B', 'A', 'C']);
      expect(find(rows, 'A1').expanded).toBe(false);
    });

    it('true expands every row on every level', () => {
      const { model, rows } = createModel({ expanded: false });
      model.toggleExpandCollapseAll(true);
      expect(model.getRowCount()).toBe(7);
      expect(find(rows, 'A1').expanded).toBe(true);
    });

    it('re-applies an active filter', () => {
      const { model } = createModel({ expanded: false });
      model.externalFilterChanged(byName('A1x'));
      expect(shown(model)).toEqual(['A']);
      model.toggleExpandCollapseAll(true);
      expect(shown(model)).toEqual(['A', 'A1', 'A1x']);
      model.toggleExpandCollapseAll(false);
      expect(shown(model)).toEqual(['A']);
    });
  });

  describe('externalFilterChanged', () => {
    it('keeps the matching rows and all their parents', () => {
      const { model } = createModel();
      model.externalFilterChanged(byName('A1x'));
      expect(shown(model)).toEqual(['A', 'A1', 'A1x']);
    });

    it('does not keep the children of a matching parent', () => {
      const { model } = createModel();
      model.externalFilterChanged(byName('B'));
      expect(shown(model)).toEqual(['B']);
    });

    it('sets keep = true on matching rows and their parents only', () => {
      const { model, rows } = createModel();
      model.externalFilterChanged(byName('A1x'));
      expect(['A', 'A1', 'A1x'].map(n => find(rows, n).keep)).toEqual([true, true, true]);
      expect(['B', 'B1', 'B2', 'C'].map(n => find(rows, n).keep)).toEqual([false, false, false, false]);
    });

    it('calls the predicate with the tree row (not the row object), index and array', () => {
      const { model, rows } = createModel();
      const predicate = vi.fn(() => true);
      model.externalFilterChanged(predicate);
      // NOTE: flat area models pass the row object T, the tree passes the TreeRow wrapper – a shared
      // externalFilterFunction has to handle both (r.data.x vs r.x).
      expect(predicate).toHaveBeenCalledTimes(7);
      const [row, index, array] = predicate.mock.calls[0] as unknown as [TreeRowIf<Node>, number, TreeRowIf<Node>[]];
      expect(row).toBe(rows[0]);
      expect(index).toBe(0);
      expect(array).toHaveLength(7);
    });

    it('a predicate that accepts everything shows all rows again', () => {
      const { model } = createModel();
      model.externalFilterChanged(byName('C'));
      model.externalFilterChanged(() => true);
      expect(model.getRowCount()).toBe(7);
    });

    it('a predicate that matches nothing shows no rows', () => {
      const { model } = createModel();
      model.externalFilterChanged(() => false);
      expect(model.getRowCount()).toBe(0);
    });

    it('looks into collapsed nodes: a match below a collapsed parent keeps its (collapsed) ancestors visible', () => {
      const { model, rows } = createModel({ expanded: false });
      model.externalFilterChanged(byName('A1x'));
      // Changed (fix/tree-filter): before, only the visible rows were filtered and this showed no row at all.
      expect(shown(model)).toEqual(['A']);
      expect(find(rows, 'A').expanded).toBe(false); // the filter does not change the expanded state
      expect(['A', 'A1', 'A1x'].map(n => find(rows, n).keep)).toEqual([true, true, true]);
    });

    it('expanding the kept ancestors step by step reveals the path to the match', () => {
      const { model, rows } = createModel({ expanded: false });
      model.externalFilterChanged(byName('A1x'));
      find(rows, 'A').expanded = true;
      model.recalcVisibleTreeRows();
      expect(shown(model)).toEqual(['A', 'A1']);
      find(rows, 'A1').expanded = true;
      model.recalcVisibleTreeRows();
      expect(shown(model)).toEqual(['A', 'A1', 'A1x']);
    });

    it('calls the predicate for every row, also below collapsed parents (index/array = all rows depth-first)', () => {
      const { model, rows } = createModel({ expanded: false });
      const predicate = vi.fn(() => true);
      model.externalFilterChanged(predicate);
      expect(predicate).toHaveBeenCalledTimes(7);
      const calls = predicate.mock.calls as unknown as [TreeRowIf<Node>, number, TreeRowIf<Node>[]][];
      expect(calls.map(([r, i]) => [r.data.name, i])).toEqual(
        [['B', 0], ['B2', 1], ['B1', 2], ['A', 3], ['A1', 4], ['A1x', 5], ['C', 6]]);
      expect(calls[0][2]).toEqual(flatten(rows));
      // collapsed rows stay collapsed: only the top level is displayed
      expect(shown(model)).toEqual(['B', 'A', 'C']);
    });

    // Regression: recalcVisibleTreeRows() (called on every expand/collapse click) rebuilt the rows without the filter.
    it('keeps an active filter when a node is collapsed and recalcVisibleTreeRows() is called', () => {
      const { model, rows } = createModel();
      model.externalFilterChanged(byName('A1x'));
      find(rows, 'B').expanded = false;
      model.recalcVisibleTreeRows();
      expect(shown(model)).toEqual(['A', 'A1', 'A1x']);
    });

    it('keeps an active filter when a kept node is collapsed and expanded again', () => {
      const { model, rows } = createModel();
      model.externalFilterChanged(byName('A1x'));
      find(rows, 'A').expanded = false;
      model.recalcVisibleTreeRows();
      expect(shown(model)).toEqual(['A']);
      find(rows, 'A').expanded = true;
      model.recalcVisibleTreeRows();
      expect(shown(model)).toEqual(['A', 'A1', 'A1x']);
    });

    // Regression: recalcVisibleTreeRows() did not update the internal flattenRows, so a later filter missed rows
    // that became visible by expanding a node.
    it('finds rows that became visible by expanding a node', () => {
      const { model, rows } = createModel({ expanded: false });
      find(rows, 'A').expanded = true;
      model.recalcVisibleTreeRows();
      model.externalFilterChanged(byName('A1'));
      expect(shown(model)).toEqual(['A', 'A1']);
    });

    it('the displayed rows always match getRowCount() and getFilteredFlattenRows()', () => {
      const { model, rows } = createModel();
      model.externalFilterChanged((r: TreeRowIf<Node>) => r.data.size >= 10);
      find(rows, 'A1').expanded = false;
      model.recalcVisibleTreeRows();
      expect(model.getFilteredFlattenRows().map(r => r.data.name)).toEqual(['B', 'B2', 'B1', 'A', 'A1']);
      expect(model.getRowCount()).toBe(5);
      expect(shown(model)).toEqual(['B', 'B2', 'B1', 'A', 'A1']);
    });
  });

  describe('setAllParentsOk', () => {
    it('marks every ancestor as kept and returns false', () => {
      const { model, rows } = createModel();
      const a1x = find(rows, 'A1x');
      // NOTE: the method always returns false (return value has no meaning).
      expect(model.setAllParentsOk(a1x)).toBe(false);
      expect(find(rows, 'A1').keep).toBe(true);
      expect(find(rows, 'A').keep).toBe(true);
      expect(a1x.keep).toBe(false);
    });

    it('does nothing for a top-level row', () => {
      const { model, rows } = createModel();
      model.setAllParentsOk(rows[0]);
      expect(rows.some(r => r.keep)).toBe(false);
    });
  });

  describe('doSort', () => {
    it('sorts every level ascending, children stay below their parent', () => {
      const { model } = createModel();
      expect(model.doSort([new SortItem(0, 'asc')])).toBe(true);
      expect(shown(model)).toEqual(['A', 'A1', 'A1x', 'B', 'B1', 'B2', 'C']);
    });

    it('sorts descending', () => {
      const { model } = createModel();
      model.doSort([new SortItem(0, 'desc')]);
      expect(shown(model)).toEqual(['C', 'B', 'B2', 'B1', 'A', 'A1', 'A1x']);
    });

    it('sorts numbers numerically', () => {
      const { model } = createModel();
      model.doSort([new SortItem(1, 'desc')]);
      expect(shown(model)).toEqual(['C', 'A', 'A1', 'A1x', 'B', 'B1', 'B2']);
    });

    it('uses only the last sort item', () => {
      const { model } = createModel();
      model.doSort([new SortItem(0, 'asc'), new SortItem(1, 'desc')]);
      // NOTE: multi-column sorting is not supported by the tree; earlier items are ignored.
      expect(shown(model)).toEqual(['C', 'A', 'A1', 'A1x', 'B', 'B1', 'B2']);
    });

    it('sortState "" keeps the current order (does not restore the original order)', () => {
      const { model } = createModel();
      model.doSort([new SortItem(0, 'asc')]);
      model.doSort([new SortItem(0, '')]);
      // NOTE: "unsorted" leaves the last sort order in place – the original order is lost.
      expect(shown(model)).toEqual(['A', 'A1', 'A1x', 'B', 'B1', 'B2', 'C']);
    });

    it('reorders the public rows array in place', () => {
      const { model, rows } = createModel();
      model.doSort([new SortItem(0, 'asc')]);
      expect(rows.map(r => r.data.name)).toEqual(['A', 'B', 'C']);
      expect(model.rows).toBe(rows);
    });

    it('keeps collapsed nodes collapsed', () => {
      const { model, rows } = createModel();
      find(rows, 'A').expanded = false;
      model.recalcVisibleTreeRows();
      model.doSort([new SortItem(0, 'asc')]);
      expect(shown(model)).toEqual(['A', 'B', 'B1', 'B2', 'C']);
    });

    it('uses the sortComparator of the column (multiplied by the direction)', () => {
      const reverse = vi.fn((a: string, b: string) => b.localeCompare(a));
      const { model } = createModel({ defs: columnDefs({ name: { sortComparator: reverse } }) });
      model.doSort([new SortItem(0, 'asc')]);
      expect(shown(model)).toEqual(['C', 'B', 'B2', 'B1', 'A', 'A1', 'A1x']);
      model.doSort([new SortItem(0, 'desc')]);
      expect(shown(model)).toEqual(['A', 'A1', 'A1x', 'B', 'B1', 'B2', 'C']);
    });

    it('passes values, row objects and direction to the sortComparator', () => {
      const cmp = vi.fn((_va: unknown, _vb: unknown, _ra?: unknown, _rb?: unknown, _f?: number) => 0);
      const { model, rows } = createModel({ defs: columnDefs({ size: { sortComparator: cmp } }) });
      model.doSort([new SortItem(1, 'desc')]);
      expect(cmp).toHaveBeenCalled();
      const [va, vb, ra, rb, f] = cmp.mock.calls[0];
      expect(typeof va).toBe('number');
      expect(typeof vb).toBe('number');
      const datas = flatten(rows).map(r => r.data);
      expect(datas).toContain(ra);
      expect(datas).toContain(rb);
      expect(f).toBe(-1);
    });

    // Regression: doSort() rebuilt the displayed rows from all visible rows and dropped the active filter.
    it('keeps an active filter', () => {
      const { model } = createModel();
      model.externalFilterChanged(byName('A1x'));
      model.doSort([new SortItem(0, 'asc')]);
      expect(shown(model)).toEqual(['A', 'A1', 'A1x']);
    });

    it('keeps an active filter and sorts the kept rows', () => {
      const { model } = createModel();
      model.externalFilterChanged((r: TreeRowIf<Node>) => r.data.size >= 10);
      model.doSort([new SortItem(1, 'desc')]);
      expect(shown(model)).toEqual(['A', 'A1', 'A1x', 'B', 'B1', 'B2']);
      model.doSort([new SortItem(0, 'asc')]);
      expect(shown(model)).toEqual(['A', 'A1', 'A1x', 'B', 'B1', 'B2']);
      model.doSort([new SortItem(0, 'desc')]);
      expect(shown(model)).toEqual(['B', 'B2', 'B1', 'A', 'A1', 'A1x']);
    });

    it('filter → sort → collapse/expand keeps filter and order', () => {
      const { model, rows } = createModel();
      model.externalFilterChanged((r: TreeRowIf<Node>) => r.data.size >= 10);
      model.doSort([new SortItem(0, 'asc')]);
      find(rows, 'B').expanded = false;
      model.recalcVisibleTreeRows();
      expect(shown(model)).toEqual(['A', 'A1', 'A1x', 'B']);
      find(rows, 'B').expanded = true;
      model.recalcVisibleTreeRows();
      expect(shown(model)).toEqual(['A', 'A1', 'A1x', 'B', 'B1', 'B2']);
    });

    it('a filter set after sorting keeps the sort order', () => {
      const { model } = createModel();
      model.doSort([new SortItem(0, 'asc')]);
      model.externalFilterChanged((r: TreeRowIf<Node>) => r.data.size >= 10);
      expect(shown(model)).toEqual(['A', 'A1', 'A1x', 'B', 'B1', 'B2']);
    });

    // Regression: doSort([]) crashed (destructured sortItems[-1]); reachable via api.reSort().
    it('accepts an empty sort item list', () => {
      const { model } = createModel();
      expect(() => model.doSort([])).not.toThrow();
    });

    it('an empty sort item list keeps the current order and filter and returns false', () => {
      const { model } = createModel();
      model.doSort([new SortItem(0, 'asc')]);
      model.externalFilterChanged((r: TreeRowIf<Node>) => r.data.size >= 10);
      expect(model.doSort([])).toBe(false);
      expect(shown(model)).toEqual(['A', 'A1', 'A1x', 'B', 'B1', 'B2']);
    });
  });

  describe('row heights', () => {
    it('getRowHeight() returns the default row height for every row', () => {
      const { model } = createModel({ rowHeight: 25 });
      expect(model.getRowHeight(0)).toBe(25);
      expect(model.getRowHeight(6)).toBe(25);
    });

    it('getConstantRowHeight() returns the default row height', () => {
      expect(createModel({ rowHeight: 25 }).model.getConstantRowHeight()).toBe(25);
    });

    it('getConstantRowHeight() is undefined for a non-positive default row height', () => {
      expect(createModel({ rowHeight: 0 }).model.getConstantRowHeight()).toBeUndefined();
      expect(createModel({ rowHeight: -1 }).model.getConstantRowHeight()).toBeUndefined();
    });

    it('getConstantRowHeight() is undefined when a subclass overrides getRowHeight()', () => {
      class VaryingTree extends AreaModelTree<Node> {
        override getRowHeight(rowIndex: number): number {
          return rowIndex === 0 ? 40 : 20;
        }
      }
      const rows = TreeFactory.buildTreeRows<Node>(data());
      expect(new VaryingTree('body', rows, 20, columnDefs()).getConstantRowHeight()).toBeUndefined();
    });

    it('getYPosByRowIndex() multiplies the default row height', () => {
      expect(createModel({ rowHeight: 20 }).model.getYPosByRowIndex(3)).toBe(60);
    });
  });

  describe('getCustomClassesAt', () => {
    it('adds the tree cell class and the depth class', () => {
      const { model } = createModel();
      expect(model.getCustomClassesAt(0, 0)).toEqual(['ge-table-tree-cell', 'ge-table-tree-deep-0']);
      expect(model.getCustomClassesAt(5, 1)).toEqual(['ge-table-tree-cell', 'ge-table-tree-deep-2']);
    });
  });

  describe('getValueByT', () => {
    it('reads simple and nested properties of a row object', () => {
      const { model } = createModel();
      const t: Node = { name: 'x', size: 1, meta: { code: 'm' } };
      expect(model.getValueByT(t, 'name')).toBe('x');
      expect(model.getValueByT(t, 'meta.code')).toBe('m');
    });

    it('returns undefined without object or property', () => {
      const { model } = createModel();
      expect(model.getValueByT(undefined as unknown as Node, 'name')).toBeUndefined();
      expect(model.getValueByT({ name: 'x', size: 1 }, '')).toBeUndefined();
    });
  });

  describe('setValue', () => {
    it('writes into the row object of the displayed row', () => {
      const { model, rows } = createModel();
      expect(model.setValue(1, 0, 'B2-new')).toBe(true);
      expect(rows[0].children![0].data.name).toBe('B2-new');
      expect(model.getValueAt(1, 0)).toBe('B2-new');
    });

    it('writes nested properties', () => {
      const { model, rows } = createModel();
      expect(model.setValue(0, 2, 'z')).toBe(true);
      expect(rows[0].data.meta?.code).toBe('z');
    });

    it('runs the editInputPipe of the column first', () => {
      const pipe = vi.fn((input: unknown) => Number(input) * 2);
      const { model } = createModel({ defs: columnDefs({ size: { editInputPipe: pipe } }) });
      model.setValue(0, 1, '21');
      expect(pipe).toHaveBeenCalledWith('21', 0, 1);
      expect(model.getValueAt(0, 1)).toBe(42);
    });

    it('returns false for a row index out of range', () => {
      expect(createModel().model.setValue(99, 0, 'x')).toBe(false);
    });
  });

  describe('changeColumnOrder', () => {
    it('moves the property so that getValueAt() follows the new column order', () => {
      const { model } = createModel();
      model.changeColumnOrder(0, 1);
      expect(model.getValueAt(0, 0)).toBe(1);
      expect(model.getValueAt(0, 1)).toBe('B');
    });
  });

  describe('checkbox integration (rowSelectionModel)', () => {
    it('setRowChecked()/isRowChecked() delegate to the TreeCheckboxModel with the tree row', () => {
      const { model, rows } = createModel();
      model.rowSelectionModel = new TreeCheckboxModel(rows);
      model.setRowChecked(0, true);
      expect(model.isRowChecked(0)).toBe('full');
      expect(model.isRowChecked(1)).toBe('full');
      expect(model.isRowChecked(3)).toBe('none');
      expect(rows[0].children!.every(c => c.checked)).toBe(true);
    });

    it('isRowChecked() is undefined without rowSelectionModel', () => {
      expect(createModel().model.isRowChecked(0)).toBeUndefined();
    });
  });
});
