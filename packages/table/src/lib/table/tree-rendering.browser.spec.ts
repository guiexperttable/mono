// Tree tables (AreaModelTree) in a real browser: arrows, indentation, expand/collapse by mouse (arrow click,
// Alt+click, double click, "expand/collapse all" in the header), its persistence, and tree checkboxes.
// Filtering and sorting of trees is covered elsewhere and deliberately not touched here.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { CheckboxColumnDef, ColumnDef, EventAdapter, TableFactory, TreeFactory, px100, px200 } from '@guiexpert/table';
import type { ColumnDefIf, TableOptionsIf } from '@guiexpert/table';
import { destroyAllTables, getCellDiv, mountTable, nextFrame, renderedRows } from '../../../test-utils/mount-table';

const storageKeys: string[] = [];

afterEach(() => {
  destroyAllTables();
  vi.restoreAllMocks();
  storageKeys.splice(0).forEach(k => localStorage.removeItem(k + 'collapsedExpandedState'));
});

interface Node { id: number; name: string; children?: Node[] }

const data = (): Node[] => [
  { id: 1, name: 'A', children: [{ id: 11, name: 'A1', children: [{ id: 111, name: 'A1a' }] }, { id: 12, name: 'A2' }] },
  { id: 2, name: 'B', children: [{ id: 21, name: 'B1' }] },
  { id: 3, name: 'C' },
];

async function mountTree(opts: {
  expanded?: boolean; checkbox?: boolean; rowCheckboxVisible?: boolean; nodes?: Node[];
  tableOptions?: Partial<TableOptionsIf>; modelTableOptions?: Partial<TableOptionsIf>;
} = {}) {
  const listener = new EventAdapter();
  const checked: unknown[][] = [];
  listener.onCheckboxChanged = rows => checked.push(rows);
  const columnDefs: ColumnDefIf[] = [
    ColumnDef.create({ property: 'name', headerLabel: 'Name', width: px200 }),
    ColumnDef.create({ property: 'id', headerLabel: 'Id', width: px100 }),
  ];
  if (opts.checkbox) columnDefs.unshift(new CheckboxColumnDef());
  const rows = TreeFactory.buildTreeRows(opts.nodes ?? data(), { expanded: opts.expanded ?? true });
  const tableModel = TableFactory.createTableModel({
    rows, columnDefs, rowCheckboxVisible: opts.rowCheckboxVisible, tableOptions: opts.modelTableOptions as TableOptionsIf,
  });
  const table = mountTable(tableModel, { eventListener: listener, tableOptions: opts.tableOptions });
  await nextFrame();
  return { ...table, rows, checked };
}

/** Names of the visible rows (the arrow column is 0, or 1 with a checkbox column). */
const visibleNames = (host: HTMLElement, col = 0) =>
  renderedRows(host).map(r => r.querySelector(`[data-col-index="${col}"]`)!.textContent!.replace(/^>/, ''));

const arrow = (host: HTMLElement, row: number, col = 0) =>
  getCellDiv(host, 'body', 'center', row, col).querySelector<HTMLElement>('.ge-table-tree-arrow-div')!;

describe('tree rendering', () => {

  it('arrows for expanded, collapsed and leaf rows', async () => {
    const { host } = await mountTree({ nodes: [{ id: 1, name: 'A', children: [{ id: 11, name: 'A1', children: [{ id: 111, name: 'x' }] }] }] });
    // A expanded, A1 expanded, x leaf
    expect(arrow(host, 0).classList).toContain('gt-table-tree-arrow-expanded');
    expect(arrow(host, 0).style.transform).toContain('rotate(90deg)');
    expect(arrow(host, 2).classList).toContain('gt-table-tree-arrow-hidden');
    expect(arrow(host, 2).style.color).toBe('transparent');
    await userEvent.click(arrow(host, 1));
    expect(arrow(host, 1).classList).toContain('ge-table-tree-arrow-collapsed');
    expect(arrow(host, 1).textContent).toBe('>');
  });

  it('tree cells carry their depth; the arrow column is indented by depth', async () => {
    const { host } = await mountTree();
    expect(visibleNames(host)).toEqual(['A', 'A1', 'A1a', 'A2', 'B', 'B1', 'C']);
    const paddings = [0, 1, 2].map(r => {
      const cell = getCellDiv(host, 'body', 'center', r, 0);
      expect(cell.classList).toContain('ge-table-col-tree');
      expect(cell.classList).toContain('ge-table-tree-cell');
      expect(cell.classList).toContain('ge-table-tree-deep-' + r);
      return getComputedStyle(cell).paddingLeft;
    });
    expect(paddings).toEqual(['16px', '36px', '56px']);
    expect(getCellDiv(host, 'body', 'center', 0, 1).classList).not.toContain('ge-table-col-tree');
  });

  // BUG: css/table-tree.css declares ".ge-table-tree-deep-5" twice (116px and 136px) – the second one was meant
  // for depth 6. Depth 5 is indented like depth 6 should be, depth 6+ is not indented any further.
  it.fails('depth 5 is indented by 116 px', async () => {
    let node: Node = { id: 5, name: 'L5' };
    for (let deep = 4; deep >= 0; deep--) node = { id: deep, name: 'L' + deep, children: [node] };
    const { host } = await mountTree({ nodes: [node] });
    expect(getCellDiv(host, 'body', 'center', 5, 0).classList).toContain('ge-table-tree-deep-5');
    expect(getComputedStyle(getCellDiv(host, 'body', 'center', 5, 0)).paddingLeft).toBe('116px');
  });
});

describe('expand / collapse by mouse', () => {

  it('a click on the arrow collapses and expands the node', async () => {
    const { host, scope } = await mountTree();
    scope.mouseHandler.doubleClickDelay = 0; // two clicks on the same cell – not a double click
    await userEvent.click(arrow(host, 0));
    expect(visibleNames(host)).toEqual(['A', 'B', 'B1', 'C']);
    await userEvent.click(arrow(host, 0));
    expect(visibleNames(host)).toEqual(['A', 'A1', 'A1a', 'A2', 'B', 'B1', 'C']);
  });

  it('Alt + click anywhere in the arrow column toggles the node', async () => {
    const { host } = await mountTree();
    await userEvent.keyboard('{Alt>}');
    await userEvent.click(getCellDiv(host, 'body', 'center', 4, 0).querySelector('.ge-table-label-div')!);
    await userEvent.keyboard('{/Alt}');
    expect(visibleNames(host)).toEqual(['A', 'A1', 'A1a', 'A2', 'B', 'C']);
  });

  it('a click on the label (without Alt) does not toggle', async () => {
    const { host } = await mountTree();
    await userEvent.click(getCellDiv(host, 'body', 'center', 4, 0).querySelector('.ge-table-label-div')!);
    expect(visibleNames(host)).toHaveLength(7);
  });

  it('a double click in the arrow column toggles the node', async () => {
    const { host } = await mountTree();
    await userEvent.dblClick(getCellDiv(host, 'body', 'center', 1, 0).querySelector('.ge-table-label-div')!);
    expect(visibleNames(host)).toEqual(['A', 'A1', 'A2', 'B', 'B1', 'C']);
  });

  it('the header icon "↕" collapses and expands all nodes', async () => {
    const { host, scope } = await mountTree();
    scope.mouseHandler.doubleClickDelay = 0;
    const toggleAll = () => host.querySelector<HTMLElement>('.ge-table-header-center [data-ge-action="toggleExpandCollapseAll"]')!;
    expect(toggleAll().textContent).toBe('↕');
    expect(toggleAll().style.cursor).toBe('pointer');
    await userEvent.click(toggleAll());
    expect(visibleNames(host)).toEqual(['A', 'B', 'C']);
    await userEvent.click(toggleAll());
    expect(visibleNames(host)).toHaveLength(7);
  });

  it('treeOptions replace the arrows', async () => {
    const treeOptions = {
      arrowExpanded: { content: '▼', style: '', classes: ['my-open'] },
      arrowCollapsed: { content: '▶', style: '', classes: ['my-closed'] },
      arrowPlaceholder: { content: '·', style: '', classes: ['my-leaf'] },
      arrowExpandCollapseAll: { content: '±', style: 'color: red;', classes: [] },
    };
    const { host } = await mountTree({ tableOptions: { treeOptions } });
    expect(arrow(host, 0).textContent).toBe('▼');
    expect(arrow(host, 0).classList).toContain('my-open');
    expect(arrow(host, 2).textContent).toBe('·');
    const toggleAll = host.querySelector<HTMLElement>('[data-ge-action="toggleExpandCollapseAll"]')!;
    expect(toggleAll.textContent).toBe('±');
    expect(toggleAll.style.color).toBe('red');
  });
});

describe('autoRestoreCollapsedExpandedState', () => {

  function restoreOptions(): Partial<TableOptionsIf> {
    const key = 'ge-tree-test-' + Math.random().toString(36).slice(2);
    storageKeys.push(key);
    return {
      autoRestoreOptions: {
        autoRestoreSortingState: false, autoRestoreCollapsedExpandedState: true,
        getRowId: (row: Node) => row.id, getStorageKeyFn: () => key,
      },
    };
  }

  it('"collapse all" is restored after re-mounting', async () => {
    const tableOptions = restoreOptions();
    const first = await mountTree({ tableOptions });
    await userEvent.click(first.host.querySelector('[data-ge-action="toggleExpandCollapseAll"]')!);
    first.destroy();
    const second = await mountTree({ tableOptions });
    expect(visibleNames(second.host)).toEqual(['A', 'B', 'C']);
  });

  it('a table that starts collapsed remembers expanded nodes – and forgets them when collapsed again', async () => {
    const tableOptions = restoreOptions();
    const first = await mountTree({ tableOptions, expanded: false });
    first.scope.mouseHandler.doubleClickDelay = 0;
    expect(visibleNames(first.host)).toEqual(['A', 'B', 'C']);
    await userEvent.click(arrow(first.host, 1)); // expand B
    await userEvent.click(arrow(first.host, 0)); // expand A
    expect(visibleNames(first.host)).toEqual(['A', 'A1', 'A2', 'B', 'B1', 'C']);
    await userEvent.click(arrow(first.host, 3)); // collapse B again
    first.destroy();

    const second = await mountTree({ tableOptions, expanded: false });
    expect(visibleNames(second.host)).toEqual(['A', 'A1', 'A2', 'B', 'C']);
  });
});

describe('tree checkboxes (CheckboxColumnDef → TreeCheckboxModel)', () => {

  const box = (host: HTMLElement, row: number) =>
    getCellDiv(host, 'body', 'center', row, 0).querySelector<HTMLInputElement>('input.ge-table-row-checkbox')!;

  it('CheckboxColumnDef + rowCheckboxVisible: arrow in column 1, checking a parent checks its children', async () => {
    const { host, checked, rows } = await mountTree({ checkbox: true, rowCheckboxVisible: true });
    expect(arrow(host, 0, 1)).not.toBeNull();
    expect(visibleNames(host, 1)).toEqual(['A', 'A1', 'A1a', 'A2', 'B', 'B1', 'C']);
    await userEvent.click(box(host, 0));
    expect([0, 1, 2, 3, 4].map(r => box(host, r).checked)).toEqual([true, true, true, true, false]);
    expect(checked[0]).toHaveLength(4); // A, A1, A1a, A2
    expect(checked[0][0]).toBe(rows[0]);
  });

  it('CheckboxColumnDef without rowCheckboxVisible: the tree has no arrows', async () => {
    const { host } = await mountTree({ checkbox: true });
    // NOTE: the arrow column is derived from TableModel.isRowCheckboxVisible() (render-scope.ts:1070), not from the
    // CheckboxColumnDef – the arrow is drawn into column 0 and overwritten by the CheckboxCellRenderer.
    expect(host.querySelector('.ge-table-body-center .ge-table-tree-arrow-div')).toBeNull();
    expect(box(host, 0)).not.toBeNull();
  });

  it('a partly checked parent shows the "semi" mark', async () => {
    const { host } = await mountTree({ checkbox: true, rowCheckboxVisible: true });
    await userEvent.click(box(host, 5)); // B1 → B is fully checked (its only child)
    expect(box(host, 4).checked).toBe(true);
    await userEvent.click(box(host, 3)); // A2 → A is partly checked
    const parentCell = getCellDiv(host, 'body', 'center', 0, 0);
    expect(box(host, 0).checked).toBe(false);
    expect(parentCell.querySelector<HTMLElement>('span')!.style.opacity).toBe('0.4');
    expect(parentCell.textContent).toContain('✓');
  });

  it('showCheckboxWihoutExtraColumn renders the checkbox inside the arrow column', async () => {
    const options = { showCheckboxWihoutExtraColumn: true };
    const { host } = await mountTree({ tableOptions: options, modelTableOptions: options });
    const cell = getCellDiv(host, 'body', 'center', 1, 0);
    expect(cell.classList).toContain('ge-with-checkbox');
    expect(cell.querySelector('.ge-table-tree-arrow-div')).not.toBeNull();
    const input = cell.querySelector<HTMLInputElement>('input.ge-table-row-checkbox')!;
    expect(input.getAttribute('data-row-index')).toBe('1');
    await userEvent.click(input);
    expect(getCellDiv(host, 'body', 'center', 1, 0).querySelector<HTMLInputElement>('input')!.checked).toBe(true);
    expect(getCellDiv(host, 'body', 'center', 2, 0).querySelector<HTMLInputElement>('input')!.checked).toBe(true); // child A1a
  });

  it('showCheckboxWihoutExtraColumn only in the TableScope options: no checkboxes', async () => {
    const { host } = await mountTree({ tableOptions: { showCheckboxWihoutExtraColumn: true } });
    // NOTE: the TreeCheckboxModel is created by TableFactory.createTableModel({ tableOptions }) – the option has to be
    // passed to the factory AND to the table; with the table options only, the cells get the class but no checkbox.
    expect(getCellDiv(host, 'body', 'center', 1, 0).classList).toContain('ge-with-checkbox');
    expect(host.querySelector('.ge-table-body-center input')).toBeNull();
  });
});
