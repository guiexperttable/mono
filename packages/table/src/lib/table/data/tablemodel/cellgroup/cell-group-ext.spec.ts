import { describe, it, expect } from 'vitest';
import { CellGroup, CellGroupExt, CellgroupFactory } from '@guiexpert/table';
import type { CellGroupIf } from '@guiexpert/table';

/**
 *  Customer (toggle)
 *  ├── Name      (always)
 *  ├── City      (normal)
 *  └── Summary   (inverted)
 */
const build = (closed = false) => {
  const groups: CellGroupIf[] = [{
    data: 'Customer', toggle: true, closed, children: [
      { data: 'Name', property: 'name', visibility: 'always' },
      { data: 'City', property: 'city' },
      { data: 'Summary', property: 'summary', visibility: 'inverted' },
    ],
  }];
  const [root] = CellgroupFactory.buildGroupExts(groups);
  const [name, city, summary] = root!.children!;
  return { root: root!, name: name!, city: city!, summary: summary! };
};

describe('CellGroupExt', () => {

  it('is a CellGroup', () => {
    expect(new CellGroupExt({ data: 'A' })).toBeInstanceOf(CellGroup);
  });

  it('copies the fields of the wrapped group and marks itself as CellGroupExt', () => {
    const ext = new CellGroupExt({ data: 'A', property: 'a', toggle: true, closed: true, visibility: 'inverted' }, 2, 3);
    expect(ext.impl).toBe('CellGroupExt');
    expect([ext.data, ext.property, ext.toggle, ext.closed, ext.visibility]).toEqual(['A', 'a', true, true, 'inverted']);
    expect(ext.rowIndex).toBe(2);
    expect(ext.childIndex).toBe(3);
  });

  it('defaults visibility to "normal" and closed to false', () => {
    const ext = new CellGroupExt({ data: 'A' });
    expect(ext.visibility).toBe('normal');
    expect(ext.closed).toBe(false);
    expect(ext.rowIndex).toBe(0);
    expect(ext.parent).toBeUndefined();
  });

  it('does not wrap the children itself (CellgroupFactory.buildGroupExts does)', () => {
    const ext = new CellGroupExt({ data: 'G', children: [{ data: 'A', property: 'a' }] });
    expect(ext.children).toBeUndefined();
  });

  it('toString returns the label', () => {
    expect(new CellGroupExt({ data: 'Label' }).toString()).toBe('Label');
    expect(`${new CellGroupExt({ data: 42 })}`).toBe('42');
  });

  it('ownColumn is true for nodes with a property', () => {
    const { root, city } = build();
    expect(root.ownColumn()).toBe(false);
    expect(city.ownColumn()).toBe(true);
  });

  describe('isVisible', () => {
    it('root nodes are always visible', () => {
      expect(build(false).root.isVisible()).toBe(true);
      expect(build(true).root.isVisible()).toBe(true);
    });

    it('expanded group: "always" and "normal" children are visible, "inverted" ones are not', () => {
      const { name, city, summary } = build(false);
      expect(name.isVisible()).toBe(true);
      expect(city.isVisible()).toBe(true);
      expect(summary.isVisible()).toBe(false);
    });

    it('collapsed group: "always" and "inverted" children are visible, "normal" ones are not', () => {
      const { name, city, summary } = build(true);
      expect(name.isVisible()).toBe(true);
      expect(city.isVisible()).toBe(false);
      expect(summary.isVisible()).toBe(true);
    });

    it('follows the visibility of the parent', () => {
      const [outer] = CellgroupFactory.buildGroupExts([{
        data: 'Outer', closed: true, children: [{ data: 'Inner', children: [{ data: 'Leaf', property: 'leaf', visibility: 'always' }] }],
      }]);
      const leaf = outer!.children![0]!.children![0]!;
      expect(leaf.isVisible()).toBe(false);
    });
  });

  describe('claimsSpace / getColumnCount', () => {
    it('visible leaves claim space, groups only when collapsed', () => {
      const open = build(false);
      expect(open.root.claimsSpace()).toBe(false);
      expect(open.city.claimsSpace()).toBe(true);
      expect(open.summary.claimsSpace()).toBe(false);
      const closed = build(true);
      expect(closed.root.claimsSpace()).toBe(true);
      expect(closed.city.claimsSpace()).toBe(false);
    });

    it('getColumnCount counts the nodes of the subtree that claim space', () => {
      expect(build(false).root.getColumnCount()).toBe(2); // Name, City
      expect(build(true).root.getColumnCount()).toBe(3); // Customer itself, Name, Summary
      expect(build(false).city.getColumnCount()).toBe(1);
      expect(build(false).summary.getColumnCount()).toBe(0);
    });
  });

  describe('getParentCount / getRowSpan', () => {
    it('getParentCount is the depth of the node', () => {
      const { root, city } = build();
      expect(root.getParentCount()).toBe(0);
      expect(city.getParentCount()).toBe(1);
    });

    it('getRowSpan of a node claiming space reaches down to the last row', () => {
      const { root, city } = build(true);
      expect(root.getRowSpan(root, 3)).toBe(3);
      expect(city.getRowSpan(city, 3)).toBe(1); // hidden → 1
      const open = build(false);
      expect(open.city.getRowSpan(open.city, 3)).toBe(2);
      expect(open.root.getRowSpan(open.root, 3)).toBe(1); // expanded group → 1
    });
  });

  describe('getColumnIndex', () => {
    it('is parent column index + child index', () => {
      const { root, name, summary } = build();
      expect(root.getColumnIndex()).toBe(0);
      expect(name.getColumnIndex()).toBe(0);
      expect(summary.getColumnIndex()).toBe(2);
    });

    // BUG (debatable – unfinished code, TODO in the source, only used by log()): root groups ignore their left
    // neighbours and all report column 0.
    it.fails('takes the columns of the left neighbour into account', () => {
      const [first, second] = CellgroupFactory.buildGroupExts([
        { data: 'A', children: [{ data: 'a1', property: 'a1' }, { data: 'a2', property: 'a2' }] },
        { data: 'B', children: [{ data: 'b1', property: 'b1' }] },
      ]);
      expect(first!.getColumnIndex()).toBe(0);
      expect(second!.getColumnIndex()).toBe(2);
    });
  });

  describe('log', () => {
    it('returns a one-line description of the node', () => {
      const { city } = build();
      const line = city.log(2);
      expect(line).toContain('City');
      expect(line).toContain('row:1');
      expect(line).toContain('isVisible:true');
      expect(line).toContain('claimsSpace:true');
      expect(line).not.toContain('\n');
    });
  });
});
