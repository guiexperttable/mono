// Tree table + filter in a real browser: expand/collapse (arrow click and code) and sorting (header double click,
// api.sortByColumn(), api.reSort()) must keep the active filter (branch fix/tree-filter).
import { afterEach, describe, expect, it } from 'vitest';
import { AreaModelTree, AutoRestoreOptions, ColumnDef, TableFactory, TreeFactory, TrueFn, px100, px200 } from '@guiexpert/table';
import type { TableOptionsIf, TreeFactoryOptions, TreeRowIf } from '@guiexpert/table';
import { destroyAllTables, mountTable, nextFrame, renderedRows } from '../../../../../../test-utils/mount-table';

interface Place {
  name: string;
  people: number;
  children?: Place[];
}

/*
 * Europe 30   ├─ Germany 20 (Berlin 4, Hamburg 2)   └─ France 10 (Paris 3)
 * Asia 50     ├─ Japan 15 (Tokyo 14, Osaka 3)       └─ China 35 (Beijing 22)
 * America 40  └─ USA 40 (Boston 1)
 */
function places(): Place[] {
  return [
    {
      name: 'Europe', people: 30, children: [
        { name: 'Germany', people: 20, children: [{ name: 'Berlin', people: 4 }, { name: 'Hamburg', people: 2 }] },
        { name: 'France', people: 10, children: [{ name: 'Paris', people: 3 }] },
      ],
    },
    {
      name: 'Asia', people: 50, children: [
        { name: 'Japan', people: 15, children: [{ name: 'Tokyo', people: 14 }, { name: 'Osaka', people: 3 }] },
        { name: 'China', people: 35, children: [{ name: 'Beijing', people: 22 }] },
      ],
    },
    { name: 'America', people: 40, children: [{ name: 'USA', people: 40, children: [{ name: 'Boston', people: 1 }] }] },
  ];
}

/** "to" matches Tokyo and Boston */
const ALL_TO = ['Asia', 'Japan', 'Tokyo', 'America', 'USA', 'Boston'];

const STORAGE_KEY = 'ge-tree-filter-browser-spec';

function mountTree(opts: { treeOptions?: TreeFactoryOptions<Place>; tableOptions?: Partial<TableOptionsIf> } = {}) {
  const filter = { text: '' };
  const tableOptions: Partial<TableOptionsIf> = {
    externalFilterFunction: (row: TreeRowIf<Place>) => row.data.name.toLowerCase().includes(filter.text),
    ...opts.tableOptions,
  };
  const rows = TreeFactory.buildTreeRows<Place>(places(), opts.treeOptions ?? {});
  const tableModel = TableFactory.createTableModel({
    rows,
    columnDefs: [
      ColumnDef.create({ property: 'name', headerLabel: 'Name', width: px200, sortable: TrueFn }),
      ColumnDef.create({ property: 'people', headerLabel: 'People', width: px100, sortable: TrueFn }),
    ],
    tableOptions: tableOptions as TableOptionsIf,
  });
  const table = mountTable(tableModel, { tableOptions, height: 800 }); // tall enough for all 15 rows
  // two clicks on the same arrow within 500 ms would count as a double click
  table.scope.mouseHandler.doubleClickDelay = 0;
  const treeModel = tableModel.getBodyModel() as AreaModelTree<Place>;
  const setFilter = async (text: string) => {
    filter.text = text;
    table.api.externalFilterChanged();
    await nextFrame();
  };
  return { ...table, rows, treeModel, setFilter };
}

function label(rowDiv: HTMLElement): string {
  return rowDiv.querySelector('.ge-table-col-div-0 .ge-table-label-div')?.textContent?.trim() ?? '';
}

/** names in the first column of the rendered body rows, top to bottom */
function shown(host: HTMLElement): string[] {
  return renderedRows(host)
    .sort((a, b) => parseFloat(a.style.top) - parseFloat(b.style.top))
    .map(label);
}

async function clickArrow(host: HTMLElement, name: string) {
  const rowDiv = renderedRows(host).find(r => label(r) === name);
  const arrow = rowDiv?.querySelector<HTMLElement>('.ge-table-tree-arrow-div');
  if (!arrow) throw new Error('no arrow for ' + name);
  arrow.click();
  await nextFrame();
}

async function dblClickHeader(host: HTMLElement, columnIndex: number) {
  const cell = host.querySelector<HTMLElement>(`.ge-table-header-center .ge-table-col-div-${columnIndex}`);
  if (!cell) throw new Error('no header cell ' + columnIndex);
  cell.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }));
  await nextFrame();
}

function find(rows: TreeRowIf<Place>[], name: string): TreeRowIf<Place> {
  for (const r of rows) {
    if (r.data.name === name) return r;
    const hit = r.children?.length ? find(r.children, name) : undefined;
    if (hit) return hit;
  }
  return undefined as unknown as TreeRowIf<Place>;
}

function clearStorage() {
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith(STORAGE_KEY)) localStorage.removeItem(key);
  }
}

afterEach(() => {
  destroyAllTables();
  clearStorage();
});

describe('AreaModelTree + filter (real browser)', () => {

  it('shows the matches with their parents', async () => {
    const { host, setFilter } = mountTree();
    await nextFrame();
    expect(shown(host)).toHaveLength(15);
    await setFilter('to');
    expect(shown(host)).toEqual(ALL_TO);
  });

  it('applies a filter that is already set when the table is mounted', async () => {
    const filter = { text: 'to' };
    const { host } = mountTree({
      tableOptions: { externalFilterFunction: (row: TreeRowIf<Place>) => row.data.name.toLowerCase().includes(filter.text) },
    });
    await nextFrame();
    expect(shown(host)).toEqual(ALL_TO);
  });

  // Regression: collapsing/expanding a node (recalcVisibleTreeRows) dropped the filter → all rows were shown again.
  it('collapsing and expanding a node by clicking its arrow keeps the filter', async () => {
    const { host, api, setFilter } = mountTree();
    await setFilter('to');

    await clickArrow(host, 'Japan');
    expect(shown(host)).toEqual(['Asia', 'Japan', 'America', 'USA', 'Boston']);
    expect(api.getTableModel().getBodyModel().getRowCount()).toBe(5);

    await clickArrow(host, 'Japan');
    expect(shown(host)).toEqual(ALL_TO);

    await clickArrow(host, 'Asia');
    expect(shown(host)).toEqual(['Asia', 'America', 'USA', 'Boston']);
  });

  it('a filter finds rows below collapsed nodes; expanding reveals the path to the match', async () => {
    const { host, setFilter } = mountTree({ treeOptions: { expanded: false } });
    await nextFrame();
    expect(shown(host)).toEqual(['Europe', 'Asia', 'America']);

    await setFilter('to');
    expect(shown(host)).toEqual(['Asia', 'America']); // collapsed parents of Tokyo and Boston

    await clickArrow(host, 'Asia');
    expect(shown(host)).toEqual(['Asia', 'Japan', 'America']);
    await clickArrow(host, 'Japan');
    expect(shown(host)).toEqual(['Asia', 'Japan', 'Tokyo', 'America']);

    // Regression: a new filter after expanding found only the rows visible at filter time
    await setFilter('o');
    expect(shown(host)).toEqual(['Europe', 'Asia', 'Japan', 'Tokyo', 'Osaka', 'America']);
  });

  it('expanding/collapsing from code (row.expanded + recalcVisibleTreeRows, toggleExpandCollapseAll) keeps the filter', async () => {
    const { host, api, scope, rows, treeModel, setFilter } = mountTree();
    await setFilter('to');

    find(rows, 'Asia').expanded = false;
    treeModel.recalcVisibleTreeRows();
    api.repaintHard();
    await nextFrame();
    expect(shown(host)).toEqual(['Asia', 'America', 'USA', 'Boston']);

    scope.toggleExpandCollapseAll(false);
    await nextFrame();
    expect(shown(host)).toEqual(['Asia', 'America']);

    scope.toggleExpandCollapseAll(true);
    await nextFrame();
    expect(shown(host)).toEqual(ALL_TO);
  });

  it('sorting by header double click keeps the filter', async () => {
    const { host, setFilter } = mountTree();
    await setFilter('to');

    await dblClickHeader(host, 1); // people asc: America 40 < Asia 50
    expect(shown(host)).toEqual(['America', 'USA', 'Boston', 'Asia', 'Japan', 'Tokyo']);

    await dblClickHeader(host, 1); // people desc
    expect(shown(host)).toEqual(['Asia', 'Japan', 'Tokyo', 'America', 'USA', 'Boston']);

    // expand/collapse after sorting keeps filter and order
    await clickArrow(host, 'Japan');
    expect(shown(host)).toEqual(['Asia', 'Japan', 'America', 'USA', 'Boston']);
  });

  // Regression: doSort() dropped the filter, and externalFilterChanged() sorts again after filtering →
  // a filter on a sorted tree had no effect at all.
  it('a filter on a sorted tree takes effect and keeps the sort order', async () => {
    const { host, api, setFilter } = mountTree();
    await nextFrame();
    api.sortByColumn('name', 'asc');
    await nextFrame();
    expect(shown(host).slice(0, 3)).toEqual(['America', 'USA', 'Boston']);

    await setFilter('to');
    expect(shown(host)).toEqual(['America', 'USA', 'Boston', 'Asia', 'Japan', 'Tokyo']);

    api.sortByColumn('name', 'desc');
    await nextFrame();
    expect(shown(host)).toEqual(['Asia', 'Japan', 'Tokyo', 'America', 'USA', 'Boston']);

    await setFilter('');
    expect(shown(host)).toHaveLength(15);
    expect(shown(host).slice(0, 3)).toEqual(['Europe', 'Germany', 'Hamburg']);
  });

  // Regression: api.reSort() without stored sort items called doSort([]) → TypeError in the tree model.
  it('api.reSort() without autoRestoreSortingState does not throw and keeps filter and order', async () => {
    const { host, api, setFilter } = mountTree();
    await setFilter('to');
    api.sortByColumn('name', 'asc');
    await nextFrame();
    expect(() => api.reSort()).not.toThrow();
    await nextFrame();
    expect(shown(host)).toEqual(['America', 'USA', 'Boston', 'Asia', 'Japan', 'Tokyo']);
  });

  it('api.reSort() with stored sort items re-sorts changed data and keeps the filter', async () => {
    const { host, api, rows, setFilter } = mountTree({
      tableOptions: {
        autoRestoreOptions: { ...new AutoRestoreOptions<Place>(), getStorageKeyFn: () => STORAGE_KEY, autoRestoreSortingState: true },
      },
    });
    await setFilter('to');
    api.sortByColumn('people', 'desc');
    await nextFrame();
    expect(shown(host)).toEqual(['Asia', 'Japan', 'Tokyo', 'America', 'USA', 'Boston']);

    find(rows, 'America').data.people = 99; // data changed → re-sort
    api.reSort();
    await nextFrame();
    expect(shown(host)).toEqual(['America', 'USA', 'Boston', 'Asia', 'Japan', 'Tokyo']);
  });
});
