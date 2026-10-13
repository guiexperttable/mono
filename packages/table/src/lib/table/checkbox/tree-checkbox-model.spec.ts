import { describe, it, expect } from 'vitest';
import { TreeCheckboxModel, TreeFactory } from '@guiexpert/table';
import type { TreeRowIf } from '@guiexpert/table';

interface Node {
  name: string;
  children?: Node[];
}

/*
 * R
 * ├─ C1
 * └─ C2
 *    ├─ G1
 *    └─ G2
 * S
 */
function tree() {
  const rows = TreeFactory.buildTreeRows<Node>([
    { name: 'R', children: [{ name: 'C1' }, { name: 'C2', children: [{ name: 'G1' }, { name: 'G2' }] }] },
    { name: 'S' },
  ]);
  const [R, S] = rows;
  const [C1, C2] = R.children!;
  const [G1, G2] = C2.children!;
  const cm = new TreeCheckboxModel<TreeRowIf<Node>>(rows);
  return { rows, cm, R, S, C1, C2, G1, G2 };
}

const names = (rows: TreeRowIf<Node>[]) => rows.map(r => r.data.name);

describe('TreeCheckboxModel', () => {

  it('starts without checked rows', () => {
    const { cm, R, G1 } = tree();
    expect(cm.getCheckedRows()).toEqual([]);
    expect(cm.isRowChecked(R)).toBe('none');
    expect(cm.isRowChecked(G1)).toBe('none');
  });

  it('works without root nodes', () => {
    expect(new TreeCheckboxModel().getCheckedRows()).toEqual([]);
  });

  describe('checkRow', () => {
    it('checking a parent checks all descendants', () => {
      const { cm, R } = tree();
      cm.checkRow(R, true);
      expect(names(cm.getCheckedRows())).toEqual(['R', 'C1', 'C2', 'G1', 'G2']);
      expect(cm.isRowChecked(R)).toBe('full');
    });

    it('unchecking a parent unchecks all descendants', () => {
      const { cm, R, C2 } = tree();
      cm.checkRow(R, true);
      cm.checkRow(C2, false);
      expect(names(cm.getCheckedRows())).toEqual(['C1']);
    });

    it('checking a leaf writes row.checked', () => {
      const { cm, S } = tree();
      cm.checkRow(S, true);
      expect(S.checked).toBe(true);
      expect(cm.isRowChecked(S)).toBe('full');
    });

    it('checking some children makes the parent "semi" (parent itself stays unchecked)', () => {
      const { cm, R, C1 } = tree();
      cm.checkRow(C1, true);
      expect(R.checked).toBe(false);
      expect(cm.isRowChecked(R)).toBe('semi');
      expect(names(cm.getCheckedRows())).toEqual(['C1']);
    });

    it('a checked grandchild makes parent and grandparent "semi"', () => {
      const { cm, R, C2, G1 } = tree();
      cm.checkRow(G1, true);
      expect(cm.isRowChecked(C2)).toBe('semi');
      expect(cm.isRowChecked(R)).toBe('semi');
    });

    it('checking all children checks the parent automatically', () => {
      const { cm, R, C2, G1, G2 } = tree();
      cm.checkRow(G1, true);
      cm.checkRow(G2, true);
      expect(C2.checked).toBe(true);
      expect(cm.isRowChecked(C2)).toBe('full');
      expect(cm.isRowChecked(R)).toBe('semi');
    });

    it('checking the last missing child checks all ancestors', () => {
      const { cm, R, C1, C2 } = tree();
      cm.checkRow(C2, true);
      expect(cm.isRowChecked(R)).toBe('semi');
      cm.checkRow(C1, true);
      expect(R.checked).toBe(true);
      expect(cm.isRowChecked(R)).toBe('full');
    });

    it('unchecking one child of a fully checked parent makes it "semi" again', () => {
      const { cm, R, C1, C2, G2 } = tree();
      cm.checkRow(R, true);
      cm.checkRow(G2, false);
      expect(C2.checked).toBe(false);
      expect(R.checked).toBe(false);
      expect(cm.isRowChecked(C2)).toBe('semi');
      expect(cm.isRowChecked(R)).toBe('semi');
      expect(cm.isRowChecked(C1)).toBe('full');
    });

    it('unchecking the last checked child makes the parent "none"', () => {
      const { cm, R, C1 } = tree();
      cm.checkRow(C1, true);
      cm.checkRow(C1, false);
      expect(cm.isRowChecked(R)).toBe('none');
    });

    it('does not touch sibling trees', () => {
      const { cm, R, S } = tree();
      cm.checkRow(R, true);
      expect(S.checked).toBe(false);
    });
  });

  describe('getCheckedRows', () => {
    it('lists checked rows depth-first, independent of the check order', () => {
      const { cm, S, G2, C1 } = tree();
      cm.checkRow(S, true);
      cm.checkRow(G2, true);
      cm.checkRow(C1, true);
      expect(names(cm.getCheckedRows())).toEqual(['C1', 'G2', 'S']);
    });

    it('includes rows below collapsed parents', () => {
      const { cm, R, C2, G1 } = tree();
      R.expanded = false;
      C2.expanded = false;
      cm.checkRow(G1, true);
      expect(names(cm.getCheckedRows())).toEqual(['G1']);
    });
  });

  describe('isRowChecked', () => {
    it('is "full" for a row with checked = true, regardless of its children', () => {
      const { cm, C2 } = tree();
      C2.checked = true;
      expect(cm.isRowChecked(C2)).toBe('full');
    });

    it('looks at all descendants: a checked child with an unchecked grandchild makes the root "semi"', () => {
      const { cm, R, C1, C2, G2 } = tree();
      C1.checked = true;
      C2.checked = true;
      G2.checked = true; // G1 stays unchecked
      expect(cm.isRowChecked(R)).toBe('semi');
    });

    it('is "none" for an unchecked parent whose children are all checked (not via checkRow)', () => {
      const { cm, C2, G1, G2 } = tree();
      G1.checked = true;
      G2.checked = true;
      // NOTE: the parent state is only derived when changed through checkRow(); otherwise an unchecked parent
      // with all children checked reports "none" (not "full" or "semi").
      expect(cm.isRowChecked(C2)).toBe('none');
    });
  });

  describe('addCheckedRows / setCheckedRows', () => {
    it('addCheckedRows() sets checked = true on exactly the given rows', () => {
      const { cm, C1, G1 } = tree();
      cm.addCheckedRows([C1, G1]);
      expect(names(cm.getCheckedRows())).toEqual(['C1', 'G1']);
    });

    it('addCheckedRows() neither cascades to children nor updates the parents', () => {
      const { cm, R, C2, G1 } = tree();
      cm.addCheckedRows([C2]);
      expect(G1.checked).toBe(false);
      expect(R.checked).toBe(false);
      expect(cm.isRowChecked(R)).toBe('semi');
    });

    it('setCheckedRows() only adds – previously checked rows stay checked', () => {
      const { cm, S, C1 } = tree();
      cm.checkRow(S, true);
      cm.setCheckedRows([C1]);
      // NOTE: CheckboxModel.setCheckedRows() replaces the checked rows, TreeCheckboxModel.setCheckedRows() just adds.
      expect(names(cm.getCheckedRows())).toEqual(['C1', 'S']);
    });
  });

  describe('checkAll', () => {
    it('unchecks all top-level rows when they have no children', () => {
      const rows = TreeFactory.buildTreeRows<Node>([{ name: 'X' }, { name: 'Y' }]);
      const cm = new TreeCheckboxModel<TreeRowIf<Node>>(rows);
      cm.checkRow(rows[0], true);
      cm.checkAll(rows);
      // NOTE: like CheckboxModel.checkAll(), it unchecks (the name suggests the opposite).
      expect(cm.getCheckedRows()).toEqual([]);
    });

    it('works with leaves whose children are undefined', () => {
      const rows = TreeFactory.buildTreeRows<Node>([{ name: 'X' }, { name: 'Y' }]);
      const cm = new TreeCheckboxModel<TreeRowIf<Node>>(rows);
      cm.checkRow(rows[0], true);
      rows.forEach(r => (r.children = undefined));
      cm.checkAll(rows);
      expect(cm.getCheckedRows()).toEqual([]);
    });

    // Regression: checkAll() recursed with this.checkAll(children), but iterated this.allRootNodes again instead of
    // the argument → endless recursion (RangeError: Maximum call stack size exceeded) as soon as a root had children.
    it('works for a tree with children', () => {
      const { cm, R } = tree();
      cm.checkRow(R, true);
      expect(() => cm.checkAll([R])).not.toThrow();
      expect(cm.getCheckedRows()).toEqual([]);
    });

    it('unchecks only the given rows with their descendants and updates their parents', () => {
      const { cm, R, S, C2 } = tree();
      cm.checkRow(R, true);
      cm.checkRow(S, true);
      cm.checkAll([C2]);
      expect(names(cm.getCheckedRows())).toEqual(['C1', 'S']);
      expect(R.checked).toBe(false);
      expect(cm.isRowChecked(R)).toBe('semi');
      expect(cm.isRowChecked(C2)).toBe('none');
    });

    it('unchecks the whole tree without argument', () => {
      const { cm, R, S, G1 } = tree();
      cm.checkRow(R, true);
      cm.checkRow(S, true);
      cm.checkAll();
      expect(cm.getCheckedRows()).toEqual([]);
      expect(cm.isRowChecked(G1)).toBe('none');
    });
  });
});
