import { describe, expect, it, vi } from 'vitest';
import { AreaModelTree, ColumnDef, TreeAriaInfo, TreeFactory } from '@guiexpert/table';
import type { TreeAriaModel, TreeRowIf } from '@guiexpert/table';

interface Node {
  name: string;
  children?: Node[];
}

/*
 * Europe
 * ├─ Germany
 * │  └─ Berlin
 * └─ France
 * Asia
 * └─ Japan
 * Africa
 */
function createModel(expanded = true) {
  const data: Node[] = [
    { name: 'Europe', children: [{ name: 'Germany', children: [{ name: 'Berlin' }] }, { name: 'France' }] },
    { name: 'Asia', children: [{ name: 'Japan' }] },
    { name: 'Africa' },
  ];
  const rows = TreeFactory.buildTreeRows<Node>(data, { expanded });
  const model = new AreaModelTree<Node>('body', rows, 20, [ColumnDef.create({ property: 'name' })]);
  return { model, rows, tree: model as unknown as TreeAriaModel };
}

const names = (model: AreaModelTree<Node>) => model.getFilteredFlattenRows().map(r => r.data.name);

describe('TreeAriaInfo', () => {

  it('A6: level, set size, position and expanded state of every displayed row', () => {
    const { model, tree } = createModel();
    const info = new TreeAriaInfo();
    expect(names(model)).toEqual(['Europe', 'Germany', 'Berlin', 'France', 'Asia', 'Japan', 'Africa']);
    expect([0, 1, 2, 3, 4, 5, 6].map(i => info.get(tree, i))).toEqual([
      { level: 1, setSize: 3, posInSet: 1, expanded: true },       // Europe
      { level: 2, setSize: 2, posInSet: 1, expanded: true },       // Germany
      { level: 3, setSize: 1, posInSet: 1, expanded: undefined },  // Berlin (leaf)
      { level: 2, setSize: 2, posInSet: 2, expanded: undefined },  // France
      { level: 1, setSize: 3, posInSet: 2, expanded: true },       // Asia
      { level: 2, setSize: 1, posInSet: 1, expanded: undefined },  // Japan
      { level: 1, setSize: 3, posInSet: 3, expanded: undefined },  // Africa
    ]);
  });

  it('a collapsed row has aria-expanded false', () => {
    const { tree } = createModel(false);
    const info = new TreeAriaInfo();
    expect(info.get(tree, 0)).toEqual({ level: 1, setSize: 3, posInSet: 1, expanded: false });
    expect(info.get(tree, 2)).toEqual({ level: 1, setSize: 3, posInSet: 3, expanded: undefined });
  });

  it('counts only the siblings that match the filter', () => {
    const { model, tree } = createModel();
    const info = new TreeAriaInfo();
    info.get(tree, 0); // fill the cache
    model.externalFilterChanged((row: TreeRowIf<Node>) => row.data.name === 'France' || row.data.name === 'Japan');
    expect(names(model)).toEqual(['Europe', 'France', 'Asia', 'Japan']);
    expect(info.get(tree, 0)).toEqual({ level: 1, setSize: 2, posInSet: 1, expanded: true });  // Africa filtered out
    expect(info.get(tree, 1)).toEqual({ level: 2, setSize: 1, posInSet: 1, expanded: undefined }); // Germany filtered out
    expect(info.get(tree, 2)).toEqual({ level: 1, setSize: 2, posInSet: 2, expanded: true });
  });

  it('forgets the positions when the displayed rows change (collapse, sort)', () => {
    const { model, rows, tree } = createModel();
    const info = new TreeAriaInfo();
    expect(info.get(tree, 4)?.posInSet).toBe(2); // Asia
    rows[0].expanded = false;
    model.recalcVisibleTreeRows();
    expect(names(model)).toEqual(['Europe', 'Asia', 'Japan', 'Africa']);
    expect(info.get(tree, 0)?.expanded).toBe(false);
    model.sort((a, b) => a.data.name.localeCompare(b.data.name));
    expect(names(model)).toEqual(['Africa', 'Asia', 'Japan', 'Europe']);
    expect(info.get(tree, 0)).toEqual({ level: 1, setSize: 3, posInSet: 1, expanded: undefined }); // Africa
    expect(info.get(tree, 1)?.posInSet).toBe(2); // Asia
    expect(info.get(tree, 3)?.posInSet).toBe(3); // Europe
  });

  it('computes the positions of a sibling group once (O(1) per rendered row)', () => {
    const { model, tree } = createModel();
    const spy = vi.spyOn(model, 'getDisplayedRootRows');
    const info = new TreeAriaInfo();
    info.get(tree, 0);
    info.get(tree, 4);
    info.get(tree, 6);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('returns undefined for a row that does not exist', () => {
    const { tree } = createModel();
    expect(new TreeAriaInfo().get(tree, 99)).toBeUndefined();
  });
});

describe('TreeAriaInfo with an own tree model', () => {

  it('a row without "deep" is level 1; an empty sibling list still gives set size 1', () => {
    const row = { data: {}, expanded: false, children: undefined, parent: undefined, checked: false, keep: true } as unknown as TreeRowIf<unknown>;
    const model: TreeAriaModel = {
      getRowByIndex: () => row,
      getFilteredFlattenRows: () => [row],
      getDisplayedRootRows: () => [],
      getDisplayedChildren: () => [],
      hasDisplayedChildren: () => false,
    };
    expect(new TreeAriaInfo().get(model, 0)).toEqual({ level: 1, setSize: 1, posInSet: 1, expanded: undefined });
  });
});

describe('AreaModelTree.getDisplayedChildren', () => {

  it('all children without a filter, only the matching ones with a filter', () => {
    const { model, rows } = createModel();
    const europe = rows[0];
    expect(model.getDisplayedChildren(europe).map(r => r.data.name)).toEqual(['Germany', 'France']);
    model.externalFilterChanged((row: TreeRowIf<Node>) => row.data.name === 'Berlin');
    expect(model.getDisplayedChildren(europe).map(r => r.data.name)).toEqual(['Germany']);
    expect(model.getDisplayedChildren(rows[2])).toEqual([]); // leaf
  });
});
