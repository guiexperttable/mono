import { describe, expect, it } from 'vitest';
import { TreeRow, TreeRowService } from '@guiexpert/table';
import type { TreeRowIf } from '@guiexpert/table';

/** Builds a tree: root A (children A1, A2 (child A2a)), root B. */
function tree(expanded: { a?: boolean; a2?: boolean } = {}) {
  const a = new TreeRow<string>('A', expanded.a ?? true, [], undefined, 0);
  const a1 = new TreeRow<string>('A1', true, undefined, a, 1);
  const a2 = new TreeRow<string>('A2', expanded.a2 ?? true, [], a, 1);
  const a2a = new TreeRow<string>('A2a', true, undefined, a2, 2);
  a.children = [a1, a2];
  a2.children = [a2a];
  const b = new TreeRow<string>('B', true, undefined, undefined, 0);
  return { roots: [a, b] as TreeRowIf<string>[], a, a1, a2, a2a, b };
}

const names = (rows: TreeRowIf<string>[]) => rows.map(r => r.data);

describe('TreeRowService', () => {
  const service = new TreeRowService();

  it('flattens a fully expanded tree depth-first', () => {
    expect(names(service.flattenTree(tree().roots))).toEqual(['A', 'A1', 'A2', 'A2a', 'B']);
  });

  it('leaves out the descendants of a collapsed row', () => {
    expect(names(service.flattenTree(tree({ a: false }).roots))).toEqual(['A', 'B']);
    expect(names(service.flattenTree(tree({ a2: false }).roots))).toEqual(['A', 'A1', 'A2', 'B']);
  });

  it('appends to the given result array', () => {
    const t = tree();
    const ret: TreeRowIf<string>[] = [t.b];
    const result = service.flattenTree([t.a], ret);
    expect(result).toBe(ret);
    expect(names(result)).toEqual(['B', 'A', 'A1', 'A2', 'A2a']);
  });

  it('returns [] for no rows', () => {
    expect(service.flattenTree([])).toEqual([]);
  });

  it('isVisible: roots are always visible, children only if all ancestors are expanded', () => {
    const t = tree({ a: false });
    expect(service.isVisible(t.a)).toBe(true);
    expect(service.isVisible(t.a1)).toBe(false);
    expect(service.isVisible(t.a2a)).toBe(false);

    const t2 = tree({ a2: false });
    expect(service.isVisible(t2.a2)).toBe(true);
    expect(service.isVisible(t2.a2a)).toBe(false);
  });
});
