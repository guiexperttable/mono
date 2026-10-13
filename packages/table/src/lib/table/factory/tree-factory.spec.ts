import { afterEach, describe, it, expect, vi } from 'vitest';
import { TreeFactory, TreeRow, isTreeRow } from '@guiexpert/table';
import type { TreeRowIf } from '@guiexpert/table';

interface Node {
  name: string;
  children?: Node[];
  items?: Node[];
}

/*
 * a
 * ├─ a1
 * │  └─ a1x
 * └─ a2
 * b
 */
function nodes(): Node[] {
  return [
    { name: 'a', children: [{ name: 'a1', children: [{ name: 'a1x' }] }, { name: 'a2' }] },
    { name: 'b' },
  ];
}

/** depth-first list of all tree rows (independent of expanded) */
function all<T>(rows: TreeRowIf<T>[], ret: TreeRowIf<T>[] = []): TreeRowIf<T>[] {
  for (const r of rows) {
    ret.push(r);
    if (r.children) all(r.children, ret);
  }
  return ret;
}

function names(rows: TreeRowIf<Node>[]): string[] {
  return rows.map(r => r.data.name);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('TreeFactory', () => {

  describe('buildTreeRows – defaults', () => {
    it('returns one tree row per top-level object', () => {
      const data = nodes();
      const rows = TreeFactory.buildTreeRows(data);
      expect(rows).toHaveLength(2);
      expect(rows[0].data).toBe(data[0]);
      expect(rows[1].data).toBe(data[1]);
    });

    it('returns an empty array for empty data', () => {
      expect(TreeFactory.buildTreeRows<Node>([])).toEqual([]);
    });

    it('creates TreeRow instances recognised by isTreeRow()', () => {
      const rows = all(TreeFactory.buildTreeRows(nodes()));
      for (const r of rows) {
        expect(r).toBeInstanceOf(TreeRow);
        expect(r.type).toBe('TreeRow');
        expect(isTreeRow(r)).toBe(true);
      }
    });

    it('reads the children from the "children" property', () => {
      const rows = TreeFactory.buildTreeRows(nodes());
      expect(names(all(rows))).toEqual(['a', 'a1', 'a1x', 'a2', 'b']);
    });

    it('sets deep (0 = top level)', () => {
      const rows = all(TreeFactory.buildTreeRows(nodes()));
      expect(rows.map(r => [r.data.name, r.deep])).toEqual([['a', 0], ['a1', 1], ['a1x', 2], ['a2', 1], ['b', 0]]);
    });

    it('links parents (top level rows have no parent)', () => {
      const [a, b] = TreeFactory.buildTreeRows(nodes());
      const a1 = a.children![0];
      const a1x = a1.children![0];
      expect(a.parent).toBeUndefined();
      expect(b.parent).toBeUndefined();
      expect(a1.parent).toBe(a);
      expect(a1x.parent).toBe(a1);
    });

    it('expands every row', () => {
      const rows = all(TreeFactory.buildTreeRows(nodes()));
      expect(rows.every(r => r.expanded)).toBe(true);
    });

    it('starts unchecked and not kept', () => {
      const rows = all(TreeFactory.buildTreeRows(nodes()));
      expect(rows.every(r => !r.checked && !r.keep)).toBe(true);
    });

    it('gives leaves an empty children array', () => {
      const [, b] = TreeFactory.buildTreeRows(nodes());
      // NOTE: TreeRowIf documents children as "undefined for leaves", the factory creates [].
      expect(b.children).toEqual([]);
    });

    it('does not modify the input objects', () => {
      const data = nodes();
      const before = JSON.stringify(data);
      TreeFactory.buildTreeRows(data);
      expect(JSON.stringify(data)).toBe(before);
    });
  });

  describe('buildTreeRows – positional parameters', () => {
    it('uses another children property', () => {
      const data: Node[] = [{ name: 'r', items: [{ name: 'r1' }] }];
      expect(names(all(TreeFactory.buildTreeRows(data, 'items')))).toEqual(['r', 'r1']);
    });

    it('ignores "children" when another property is given', () => {
      expect(names(all(TreeFactory.buildTreeRows(nodes(), 'items')))).toEqual(['a', 'b']);
    });

    it('honours expanded = false', () => {
      const rows = all(TreeFactory.buildTreeRows(nodes(), 'children', 12, false));
      expect(rows.some(r => r.expanded)).toBe(false);
    });

    it('honours an expanded function', () => {
      const rows = all(TreeFactory.buildTreeRows<Node>(nodes(), 'children', 12, (_d, deep) => deep === 0));
      expect(rows.map(r => [r.data.name, r.expanded])).toEqual([['a', true], ['a1', false], ['a1x', false], ['a2', false], ['b', true]]);
    });
  });

  describe('buildTreeRows – options object', () => {
    it('starts collapsed with expanded: false', () => {
      const rows = all(TreeFactory.buildTreeRows<Node>(nodes(), { expanded: false }));
      expect(rows).toHaveLength(5);
      expect(rows.some(r => r.expanded)).toBe(false);
    });

    it('defaults childrenProperty to "children" and expanded to true', () => {
      const rows = all(TreeFactory.buildTreeRows<Node>(nodes(), {}));
      expect(names(rows)).toEqual(['a', 'a1', 'a1x', 'a2', 'b']);
      expect(rows.every(r => r.expanded)).toBe(true);
    });

    it('uses childrenProperty from the options', () => {
      const data: Node[] = [{ name: 'r', items: [{ name: 'r1' }] }];
      expect(names(all(TreeFactory.buildTreeRows<Node>(data, { childrenProperty: 'items' })))).toEqual(['r', 'r1']);
    });

    it('passes the object and its depth to the expanded function', () => {
      const data = nodes();
      const fn = vi.fn((_d: Node, deep: number) => deep < 1);
      TreeFactory.buildTreeRows<Node>(data, { expanded: fn });
      const calls = fn.mock.calls.map(([d, deep]) => [d.name, deep]);
      expect(calls).toEqual([['a', 0], ['a1', 1], ['a1x', 2], ['a2', 1], ['b', 0]]);
      expect(fn.mock.calls[0][0]).toBe(data[0]);
    });

    it('opens the first level only (JSDoc example)', () => {
      const rows = all(TreeFactory.buildTreeRows<Node>(nodes(), { expanded: (_row, deep) => deep === 0 }));
      expect(rows.filter(r => r.expanded).map(r => r.data.name)).toEqual(['a', 'b']);
    });

    it('ignores the positional deepMaxLimit/expanded arguments when options are passed', () => {
      vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const rows = all(TreeFactory.buildTreeRows<Node>(nodes(), {}, 0, false));
      expect(rows).toHaveLength(5);
      expect(rows.every(r => r.expanded)).toBe(true);
      expect(console.warn).not.toHaveBeenCalled();
    });
  });

  describe('deepMaxLimit', () => {
    function deepChain(levels: number): Node {
      let node: Node = { name: 'L' + levels };
      for (let i = levels - 1; i >= 0; i--) {
        node = { name: 'L' + i, children: [node] };
      }
      return node;
    }

    it('builds 13 levels (deep 0 … 12) with the default limit without warning', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const rows = all(TreeFactory.buildTreeRows([deepChain(12)]));
      expect(Math.max(...rows.map(r => r.deep))).toBe(12);
      expect(warn).not.toHaveBeenCalled();
    });

    it('stops at the limit and warns', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const rows = all(TreeFactory.buildTreeRows([deepChain(5)], { deepMaxLimit: 1 }));
      // Changed (fix/tree-filter): rows of depth limit + 1 were created and the warning named depth 2.
      expect(rows.map(r => r.deep)).toEqual([0, 1]);
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn).toHaveBeenCalledWith('Max deep limit reached: ', 1);
    });

    // Regression: off-by-one – deepMaxLimit is documented as "Maximum depth", but rows with deep = limit + 1 were created.
    it('creates no row deeper than deepMaxLimit', () => {
      vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const rows = all(TreeFactory.buildTreeRows([deepChain(5)], { deepMaxLimit: 1 }));
      expect(Math.max(...rows.map(r => r.deep))).toBeLessThanOrEqual(1);
    });

    it('deepMaxLimit 0 keeps the top level only', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const rows = all(TreeFactory.buildTreeRows(nodes(), { deepMaxLimit: 0 }));
      expect(names(rows)).toEqual(['a', 'b']);
      expect(warn).toHaveBeenCalledTimes(1); // "b" has no children → no warning for it
    });

    it('a tree exactly as deep as the limit is built completely without warning', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const rows = all(TreeFactory.buildTreeRows([deepChain(3)], { deepMaxLimit: 3 }));
      expect(rows.map(r => r.deep)).toEqual([0, 1, 2, 3]);
      expect(warn).not.toHaveBeenCalled();
    });

    it('honours the positional deepMaxLimit as well', () => {
      vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const rows = all(TreeFactory.buildTreeRows([deepChain(5)], 'children', 2));
      expect(rows.map(r => r.deep)).toEqual([0, 1, 2]);
    });
  });

  describe('buildTreeRow', () => {
    it('creates an expanded root row when no parent is given', () => {
      const data = nodes()[0];
      const root = TreeFactory.buildTreeRow(data);
      expect(root.data).toBe(data);
      expect(root.expanded).toBe(true);
      expect(root.deep).toBe(0);
      expect(root.parent).toBeUndefined();
      expect(names(all([root]))).toEqual(['a', 'a1', 'a1x', 'a2']);
    });

    it('appends the children to the given parent and returns it', () => {
      const data = nodes()[0];
      const parent = new TreeRow<Node>(data, false, [], undefined, 3);
      const ret = TreeFactory.buildTreeRow(data, 'children', parent, 3);
      expect(ret).toBe(parent);
      expect(parent.children!.map(c => [c.data.name, c.deep, c.parent === parent])).toEqual([['a1', 4, true], ['a2', 4, true]]);
    });
  });
});
