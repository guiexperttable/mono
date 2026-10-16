// Screen reader support (WAI-ARIA grid / treegrid) in a real browser – the reference cases A1–A13 of
// prompts/001-aria-screenreader.md, keyboard navigation of the grid pattern, the live region and axe-core.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import {
  AreaModel,
  AreaModelCellGroups,
  AreaModelObjectArrayWithColumndefs,
  CellgroupFactory,
  CheckboxColumnDef,
  ColumnDef,
  ConvenienceDomService,
  EventAdapter,
  FocusModel,
  LiveAnnouncer,
  MaleFemaleToIconCellRenderer,
  NumberCellProgressBarCellRenderer,
  SelectionModel,
  SimpleDomService,
  StarRatingCellRenderer,
  TableFactory,
  TableOptions,
  TableScope,
  TrueFalseCellRenderer,
  TreeFactory,
  TrueFn,
  px100,
  px120,
} from '@guiexpert/table';
import type { CellGroupIf, ColumnDefIf, TableOptionsIf, TreeRowIf } from '@guiexpert/table';
import {
  areaRows,
  createRows,
  destroyAllTables,
  getCellDiv,
  mountTable,
  nextFrame,
  renderedRows,
} from '../../../../test-utils/mount-table';
import { axeViolations } from '../../../../test-utils/axe';

const XSS = '"><img src=x onerror="window.__geXss=1">';

beforeEach(() => {
  LiveAnnouncer.defaultDelayInMs = 0; // announcements right away (the delay is for screen readers, not for tests)
  vi.spyOn(console, 'table').mockImplementation(() => undefined); // AreaModelCellGroups.init() prints its grid
  vi.spyOn(console, 'debug').mockImplementation(() => undefined); // ShortcutService on localhost
});

afterEach(() => {
  destroyAllTables();
  vi.restoreAllMocks();
  LiveAnnouncer.defaultDelayInMs = 150;
  document.documentElement.removeAttribute('data-theme');
  delete (window as unknown as { __geXss?: number }).__geXss;
});

function columnDefs(count = 3, extra: Partial<Parameters<typeof ColumnDef.create>[0]> = {}): ColumnDefIf[] {
  const labels = ['Id', 'Name', 'Value', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const properties = ['id', 'name', 'value', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
  return Array.from({ length: count }, (_, i) => ColumnDef.create({ property: properties[i], headerLabel: labels[i], width: px100, ...extra }));
}

async function mountGrid(opts: {
  rows?: number; columns?: number; tableOptions?: Partial<TableOptionsIf>; fixedLeft?: number; fixedRight?: number;
  sortable?: boolean; selection?: SelectionModel; width?: number;
} = {}) {
  const fm = new FocusModel('cell');
  const sm = opts.selection ?? new SelectionModel('none');
  const defs = columnDefs(opts.columns ?? 3, opts.sortable ? { sortable: TrueFn } : {});
  const rows = createRows(opts.rows ?? 1000).map(r => ({ ...r, d: 'd' + r.id, e: 'e', f: 'f', g: 'g', h: 'h', i: 'i', j: 'j' }));
  const model = TableFactory.createTableModel({
    rows, columnDefs: defs, fixedLeftColumnCount: opts.fixedLeft ?? 0, fixedRightColumnCount: opts.fixedRight ?? 0,
  });
  const table = mountTable(model, {
    width: opts.width,
    tableOptions: { getFocusModel: () => fm, getSelectionModel: () => sm, ...opts.tableOptions },
  });
  table.scope.mouseHandler.doubleClickDelay = 0;
  await nextFrame();
  return { ...table, fm, sm, model };
}

/** The element `aria-activedescendant` of the host points to (must exist and be inside the table). */
function activeCell(host: HTMLElement): HTMLElement | null {
  const id = host.getAttribute('aria-activedescendant');
  if (!id) return null;
  const el = document.getElementById(id);
  expect(el, `aria-activedescendant="${id}" points to a missing element`).not.toBeNull();
  expect(host.contains(el)).toBe(true);
  expect(el!.closest('[aria-hidden="true"]'), 'the active cell must not be hidden from screen readers').toBeNull();
  return el;
}

const liveText = (scope: { liveAnnouncer: LiveAnnouncer }) => scope.liveAnnouncer.getElement()?.textContent ?? '';

describe('A1 – the grid element', () => {

  it('has role grid, counts all rows (not only the rendered ones) and the columns, and a name', async () => {
    const { host } = await mountGrid({ rows: 1000, columns: 10, tableOptions: { ariaLabel: 'Orders' } });
    expect(host.getAttribute('role')).toBe('grid');
    expect(host.getAttribute('aria-rowcount')).toBe('1001');
    expect(host.getAttribute('aria-colcount')).toBe('10');
    expect(host.getAttribute('aria-label')).toBe('Orders');
    expect(renderedRows(host).length).toBeLessThan(40); // virtual scrolling
    expect(host.getAttribute('tabindex')).toBe('0');
  });

  it('aria-labelledby wins over aria-label; aria-describedby', async () => {
    const { host } = await mountGrid({ tableOptions: { ariaLabel: 'x', ariaLabelledBy: 'title', ariaDescribedBy: 'hint' } });
    expect(host.getAttribute('aria-labelledby')).toBe('title');
    expect(host.hasAttribute('aria-label')).toBe(false);
    expect(host.getAttribute('aria-describedby')).toBe('hint');
  });

  it('the counts follow filter, hidden columns, a hidden header', async () => {
    const { host, api } = await mountGrid({ rows: 100, tableOptions: { externalFilterFunction: (r: { id: number }) => r.id < 10 } });
    expect(host.getAttribute('aria-rowcount')).toBe('11'); // the initial filter
    api.setColumnVisible(1, false);
    expect(host.getAttribute('aria-colcount')).toBe('2');
    api.setHeaderVisible(false);
    expect(host.getAttribute('aria-rowcount')).toBe('10');
  });

  it('the header, body and footer rows are row groups in this order (aria-owns)', async () => {
    const { host } = await mountGrid();
    const owned = host.getAttribute('aria-owns')!.split(' ');
    expect(owned).toHaveLength(9);
    expect(owned.map(id => document.getElementById(id)!.closest('[data-area]')!.getAttribute('data-area')))
      .toEqual(['header', 'header', 'header', 'body', 'body', 'body', 'footer', 'footer', 'footer']);
    const headerCenter = document.getElementById(owned[1])!;
    expect(headerCenter.getAttribute('role')).toBe('rowgroup');
    expect(document.getElementById(owned[0])!.getAttribute('role')).toBe('presentation'); // no fixed columns: empty
    expect(document.getElementById(owned[7])!.getAttribute('role')).toBe('presentation'); // no footer rows
  });
});

describe('A2 – rows and cells', () => {

  it('rows have role row and aria-rowindex (1-based incl. header), cells role and aria-colindex', async () => {
    const { host } = await mountGrid();
    const headerRow = areaRows(host, 'header')[0];
    expect(headerRow.getAttribute('role')).toBe('row');
    expect(headerRow.getAttribute('aria-rowindex')).toBe('1');
    const header = getCellDiv(host, 'header', 'center', 0, 1);
    expect(header.getAttribute('role')).toBe('columnheader');
    expect(header.getAttribute('aria-colindex')).toBe('2');
    const row = renderedRows(host)[3];
    expect(row.getAttribute('role')).toBe('row');
    expect(row.getAttribute('aria-rowindex')).toBe('5'); // body row 3 → 1 header row + 3 + 1
    const cell = getCellDiv(host, 'body', 'center', 3, 2);
    expect(cell.getAttribute('role')).toBe('gridcell');
    expect(cell.getAttribute('aria-colindex')).toBe('3');
  });

  it('fixed columns: west, center and east row divs of a row share aria-rowindex, colindex counts over all sides', async () => {
    const { host } = await mountGrid({ columns: 5, fixedLeft: 1, fixedRight: 1 });
    const rows = ['west', 'center', 'east'].map(side => renderedRows(host, side as 'west')[2]);
    expect(rows.map(r => r.getAttribute('aria-rowindex'))).toEqual(['4', '4', '4']);
    expect(getCellDiv(host, 'body', 'west', 2, 0).getAttribute('aria-colindex')).toBe('1');
    expect(getCellDiv(host, 'body', 'center', 2, 1).getAttribute('aria-colindex')).toBe('2');
    expect(getCellDiv(host, 'body', 'east', 2, 4).getAttribute('aria-colindex')).toBe('5');
  });

  it('a hidden column is skipped by aria-colindex', async () => {
    const { host, api } = await mountGrid({ columns: 4 });
    api.setColumnVisible(1, false);
    expect(getCellDiv(host, 'body', 'center', 0, 2).getAttribute('aria-colindex')).toBe('2');
    expect(getCellDiv(host, 'header', 'center', 0, 3).getAttribute('aria-colindex')).toBe('3');
  });
});

describe('A3 – keyboard focus with aria-activedescendant', () => {

  it('points to the focused cell after every arrow key – always an existing element', async () => {
    const { host, fm } = await mountGrid();
    host.focus();
    expect(host.hasAttribute('aria-activedescendant')).toBe(false); // no focus cell yet
    await userEvent.keyboard('{ArrowDown}');
    let cell = activeCell(host)!;
    expect([cell.getAttribute('data-row-index'), cell.getAttribute('data-col-index')]).toEqual(['0', '0']);
    for (const key of ['{ArrowDown}', '{ArrowRight}', '{ArrowRight}', '{ArrowDown}', '{ArrowLeft}']) {
      await userEvent.keyboard(key);
      cell = activeCell(host)!;
      const [r, c] = fm.getFocus();
      expect(cell.getAttribute('data-row-index')).toBe(`${r}`);
      expect(cell.getAttribute('data-col-index')).toBe(`${c}`);
      expect(cell.getAttribute('role')).toBe('gridcell');
    }
    expect(fm.getFocus()).toEqual([2, 1]);
    expect(cell.id).toMatch(/^ge-t\d+-body-r2-c1$/);
  });

  it('after a scroll the focused cell is out of the DOM: no aria-activedescendant (never a dead reference)', async () => {
    const { host, fm, api } = await mountGrid();
    fm.setFocus(1, 1);
    api.repaint();
    expect(activeCell(host)).not.toBeNull();
    api.scrollToIndex(0, 500);
    await nextFrame();
    expect(host.hasAttribute('aria-activedescendant')).toBe(false);
    api.scrollToIndex(0, 0);
    await nextFrame();
    expect(activeCell(host)!.getAttribute('data-row-index')).toBe('1');
  });

  it('only the focused cell has an id; two tables have different ids', async () => {
    const a = await mountGrid({ rows: 20 });
    const b = await mountGrid({ rows: 20 });
    a.fm.setFocus(0, 0);
    b.fm.setFocus(0, 0);
    a.api.repaint();
    b.api.repaint();
    expect(a.host.querySelectorAll('.ge-table-col-div[id]')).toHaveLength(1);
    expect(a.host.getAttribute('aria-activedescendant')).not.toBe(b.host.getAttribute('aria-activedescendant'));
  });

  it('a host id becomes the id prefix', async () => {
    const fm = new FocusModel('cell');
    const host = document.createElement('div'); // mountTable() creates a host without id – mount by hand
    host.id = 'orders';
    host.style.cssText = 'position:relative;width:600px;height:300px';
    document.body.appendChild(host);
    const scope = new TableScope(host, TableFactory.createTableModel({ rows: createRows(5), columnDefs: columnDefs() }),
      new SimpleDomService(), { ...new TableOptions(), getFocusModel: () => fm }, new EventAdapter());
    scope.firstInit();
    fm.setFocus(2, 1);
    scope.repaint();
    expect(host.getAttribute('aria-activedescendant')).toBe('ge-orders-body-r2-c1');
    expect(host.getAttribute('aria-owns')).toContain('ge-orders-rg-body-center');
    scope.destroy();
    host.remove();
  });

  it('Tab into the table focuses the first cell (WAI-ARIA grid); a programmatic focus() does not', async () => {
    const before = document.createElement('button');
    before.textContent = 'before';
    document.body.prepend(before);
    try {
      const { host, fm, scope } = await mountGrid();
      const onFocusChanged = vi.spyOn(scope, 'onFocusChanged');
      host.focus();
      expect(fm.getFocus()).toEqual([-1, -1]);
      expect(onFocusChanged).not.toHaveBeenCalled(); // no side effect for apps that call host.focus()
      before.focus();
      await userEvent.tab();
      expect(document.activeElement).toBe(host);
      expect(fm.getFocus()).toEqual([0, 0]);
      expect(activeCell(host)!.getAttribute('data-row-index')).toBe('0');
      expect(onFocusChanged).toHaveBeenCalledTimes(1);
    } finally {
      before.remove();
    }
  });

  it('the table is one tab stop (the scroll viewport is not a second one)', async () => {
    const before = document.createElement('button');
    const after = document.createElement('button');
    document.body.prepend(before);
    const { host } = await mountGrid();
    document.body.appendChild(after);
    try {
      before.focus();
      await userEvent.tab();
      expect(document.activeElement).toBe(host);
      await userEvent.tab();
      expect(document.activeElement).toBe(after);
    } finally {
      before.remove();
      after.remove();
    }
  });

  it('a click into the body keeps the DOM focus on the grid (not on the scroll viewport)', async () => {
    const { host, scope } = await mountGrid();
    scope.scrollViewport.focus();
    expect(document.activeElement).toBe(host);
    await userEvent.click(getCellDiv(host, 'body', 'center', 2, 1));
    expect(document.activeElement).toBe(host);
  });
});

describe('A4 – two million rows', () => {

  class TwoMillion extends AreaModel {
    constructor() {
      super();
      this.areaIdent = 'body';
    }
    override getRowCount(): number { return 2_000_000; }
    override getRowHeight(): number { return 34; }
    override getConstantRowHeight(): number { return 34; }
    override getValueAt(row: number, col: number): unknown { return `${row}/${col}`; }
  }

  it('aria-rowindex in the middle and at the end', async () => {
    const tableModel = TableFactory.createTableModel({ bodyAreaModel: new TwoMillion(), columnDefs: columnDefs(2) });
    const { host, api } = mountTable(tableModel);
    await nextFrame();
    expect(host.getAttribute('aria-rowcount')).toBe('2000001');
    api.scrollToIndex(0, 1_000_000);
    await nextFrame();
    const middle = renderedRows(host).find(r => r.getAttribute('data-row-index') === '1000000')!;
    expect(middle.getAttribute('aria-rowindex')).toBe('1000002');
    api.scrollToIndex(0, 1_999_999);
    await nextFrame();
    const rows = renderedRows(host);
    const last = rows[rows.length - 1];
    expect(last.getAttribute('data-row-index')).toBe('1999999');
    expect(last.getAttribute('aria-rowindex')).toBe('2000001');
  });
});

describe('A5 – sorting', () => {

  it('aria-sort on the sorted header, "none" on the other sortable ones, an announcement', async () => {
    const { host, api, scope } = await mountGrid({ sortable: true });
    const header = (c: number) => getCellDiv(host, 'header', 'center', 0, c);
    expect([0, 1, 2].map(c => header(c).getAttribute('aria-sort'))).toEqual(['none', 'none', 'none']);
    api.sortByColumn('value', 'desc');
    expect(header(2).getAttribute('aria-sort')).toBe('descending');
    expect(header(0).getAttribute('aria-sort')).toBe('none');
    await vi.waitFor(() => expect(liveText(scope)).toBe('Sorted by Value, descending'));
    api.sortByColumn('id', 'asc');
    expect(header(0).getAttribute('aria-sort')).toBe('ascending');
    expect(header(2).getAttribute('aria-sort')).toBe('none');
  });

  it('a column that cannot be sorted has no aria-sort; the sort icon is hidden from screen readers', async () => {
    const { host, api } = await mountGrid();
    expect(getCellDiv(host, 'header', 'center', 0, 0).hasAttribute('aria-sort')).toBe(false);
    api.sortByColumn('id', 'asc'); // the model sorts – the icon appears
    const icon = host.querySelector('.ge-table-sorted-icon-div')!;
    expect(icon.getAttribute('aria-hidden')).toBe('true');
  });

  it('double click on a header sorts and announces it', async () => {
    const { host, scope } = await mountGrid({ sortable: true });
    await userEvent.dblClick(getCellDiv(host, 'header', 'center', 0, 1).querySelector('.ge-table-label')!);
    await vi.waitFor(() => expect(getCellDiv(host, 'header', 'center', 0, 1).getAttribute('aria-sort')).toBe('ascending'));
    await vi.waitFor(() => expect(liveText(scope)).toBe('Sorted by Name, ascending'));
  });
});

describe('A6 – tree (treegrid)', () => {

  interface Node { id: number; name: string; children?: Node[] }
  const data = (): Node[] => [
    { id: 1, name: 'Europe', children: [{ id: 11, name: 'Germany', children: [{ id: 111, name: 'Berlin' }] }, { id: 12, name: 'France' }] },
    { id: 2, name: 'Asia', children: [{ id: 21, name: 'Japan' }] },
    { id: 3, name: 'Africa' },
  ];

  async function mountTree(opts: { checkbox?: boolean; tableOptions?: Partial<TableOptionsIf> } = {}) {
    const fm = new FocusModel('cell');
    const defs: ColumnDefIf[] = [ColumnDef.create({ property: 'name', headerLabel: 'Name', width: px120 }), ColumnDef.create({ property: 'id', headerLabel: 'Id', width: px100 })];
    if (opts.checkbox) defs.unshift(new CheckboxColumnDef());
    const rows = TreeFactory.buildTreeRows(data(), { expanded: true });
    const table = mountTable(TableFactory.createTableModel({ rows, columnDefs: defs }), {
      tableOptions: { getFocusModel: () => fm, ...opts.tableOptions },
    });
    await nextFrame();
    return { ...table, rows, fm };
  }

  const rowAttrs = (row: HTMLElement) => ['aria-level', 'aria-setsize', 'aria-posinset', 'aria-expanded']
    .map(a => row.getAttribute(a));

  it('role treegrid; rows with level, set size, position, expanded', async () => {
    const { host } = await mountTree();
    expect(host.getAttribute('role')).toBe('treegrid');
    expect(renderedRows(host).map(rowAttrs)).toEqual([
      ['1', '3', '1', 'true'],   // Europe
      ['2', '2', '1', 'true'],   // Germany
      ['3', '1', '1', null],     // Berlin
      ['2', '2', '2', null],     // France
      ['1', '3', '2', 'true'],   // Asia
      ['2', '1', '1', null],     // Japan
      ['1', '3', '3', null],     // Africa
    ]);
    expect(host.querySelector('.ge-table-tree-arrow-div')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('collapse by Enter: aria-expanded false, the reused row divs lose stale attributes', async () => {
    const { host, fm } = await mountTree();
    host.focus();
    fm.setFocus(0, 0);
    await userEvent.keyboard('{Enter}');
    await nextFrame();
    expect(renderedRows(host).map(rowAttrs)).toEqual([
      ['1', '3', '1', 'false'],  // Europe (collapsed)
      ['1', '3', '2', 'true'],   // Asia
      ['2', '1', '1', null],     // Japan
      ['1', '3', '3', null],     // Africa
    ]);
    expect(host.getAttribute('aria-rowcount')).toBe('5');
    await userEvent.keyboard('{Enter}');
    await nextFrame();
    expect(renderedRows(host)).toHaveLength(7);
    expect(rowAttrs(renderedRows(host)[0])).toEqual(['1', '3', '1', 'true']);
  });

  it('after a filter the set sizes count only the shown siblings', async () => {
    const { host, api } = await mountTree({
      tableOptions: { externalFilterFunction: (row: TreeRowIf<Node>) => row.data.name === 'France' || row.data.name === 'Japan' },
    });
    api.externalFilterChanged();
    await nextFrame();
    expect(renderedRows(host).map(rowAttrs)).toEqual([
      ['1', '2', '1', 'true'],  // Europe (Africa filtered out)
      ['2', '1', '1', null],    // France (Germany filtered out)
      ['1', '2', '2', 'true'],  // Asia
      ['2', '1', '1', null],    // Japan
    ]);
  });

  it('A8: tree checkboxes have names; a partly checked parent is "mixed" (indeterminate)', async () => {
    const { host } = await mountTree({ checkbox: true });
    const box = (r: number) => getCellDiv(host, 'body', 'center', r, 0).querySelector<HTMLInputElement>('input')!;
    expect(box(2).getAttribute('aria-label')).toBe('Select row 3');
    expect(getCellDiv(host, 'header', 'center', 0, 0).querySelector('input')!.getAttribute('aria-label')).toBe('Select all rows');
    await userEvent.click(box(3)); // France → Europe partly checked
    await vi.waitFor(() => expect(box(0).indeterminate).toBe(true));
    expect(box(0).checked).toBe(false);
  });
});

describe('A7 – selection', () => {

  it('multi range selection: aria-multiselectable, aria-selected on cells (Ctrl+A)', async () => {
    const { host, scope } = await mountGrid({ selection: new SelectionModel('range', 'multi'), rows: 30 });
    expect(host.getAttribute('aria-multiselectable')).toBe('true');
    const cell = () => getCellDiv(host, 'body', 'center', 4, 1);
    expect(cell().getAttribute('aria-selected')).toBe('false');
    host.focus();
    await userEvent.keyboard('{Control>}a{/Control}');
    expect(cell().getAttribute('aria-selected')).toBe('true');
    await vi.waitFor(() => expect(liveText(scope)).toBe('All cells selected'));
    await userEvent.keyboard('{Control>}{Shift>}a{/Shift}{/Control}');
    expect(cell().getAttribute('aria-selected')).toBe('false');
    await vi.waitFor(() => expect(liveText(scope)).toBe('Selection cleared'));
  });

  it('a click selects a cell: aria-selected true on it only', async () => {
    const { host } = await mountGrid({ selection: new SelectionModel('cell', 'single'), rows: 30 });
    expect(host.hasAttribute('aria-multiselectable')).toBe(false);
    await userEvent.click(getCellDiv(host, 'body', 'center', 2, 1));
    await vi.waitFor(() => expect(getCellDiv(host, 'body', 'center', 2, 1).getAttribute('aria-selected')).toBe('true'));
    expect(getCellDiv(host, 'body', 'center', 2, 2).getAttribute('aria-selected')).toBe('false');
  });

  it('row selection: aria-selected on the rows, not on the cells', async () => {
    const { host } = await mountGrid({ selection: new SelectionModel('row', 'multi'), rows: 30 });
    await userEvent.click(getCellDiv(host, 'body', 'center', 3, 1));
    await vi.waitFor(() => expect(renderedRows(host)[3].getAttribute('aria-selected')).toBe('true'));
    expect(renderedRows(host)[2].getAttribute('aria-selected')).toBe('false');
    expect(getCellDiv(host, 'body', 'center', 3, 1).hasAttribute('aria-selected')).toBe(false);
  });

  it('no selection model: no aria-selected, no aria-multiselectable', async () => {
    const { host } = await mountGrid({ rows: 10 });
    expect(host.hasAttribute('aria-multiselectable')).toBe(false);
    expect(host.querySelectorAll('[aria-selected]')).toHaveLength(0);
  });

  it('the selection background divs are hidden from screen readers', async () => {
    const { host } = await mountGrid({ selection: new SelectionModel('range', 'multi'), rows: 10 });
    await userEvent.click(getCellDiv(host, 'body', 'center', 1, 1));
    await vi.waitFor(() => expect(host.querySelector('.ge-table-body-center-selected-range:not(.ge-table-col-div)')).not.toBeNull());
    host.querySelectorAll('.ge-table-body-center-selected-range:not(.ge-table-col-div)')
      .forEach(div => expect(div.getAttribute('aria-hidden')).toBe('true'));
  });
});

describe('A8 – checkboxes', () => {

  it('CheckboxColumnDef: named checkboxes, Enter toggles the checkbox of the focused row', async () => {
    const fm = new FocusModel('cell');
    const defs = [new CheckboxColumnDef(), ...columnDefs(2)] as ColumnDefIf[];
    const changed: unknown[][] = [];
    const listener = new EventAdapter();
    listener.onCheckboxChanged = rows => changed.push(rows);
    const { host } = mountTable(TableFactory.createTableModel({ rows: createRows(20), columnDefs: defs }), {
      eventListener: listener, tableOptions: { getFocusModel: () => fm },
    });
    await nextFrame();
    const box = (r: number) => getCellDiv(host, 'body', 'center', r, 0).querySelector<HTMLInputElement>('input')!;
    expect(box(4).getAttribute('aria-label')).toBe('Select row 5');
    host.focus();
    fm.setFocus(4, 0);
    await userEvent.keyboard('{Enter}');
    expect(changed[changed.length - 1]).toHaveLength(1);
    await vi.waitFor(() => expect(box(4).checked).toBe(true));
  });

  it('showCheckboxWihoutExtraColumn: the checkbox in the first column has a name', async () => {
    const options = { showCheckboxWihoutExtraColumn: true };
    const nodes = [{ name: 'A', children: [{ name: 'A1' }, { name: 'A2' }] }, { name: 'B' }];
    const tableModel = TableFactory.createTableModel({
      rows: TreeFactory.buildTreeRows(nodes, { expanded: true }),
      columnDefs: [ColumnDef.create({ property: 'name', headerLabel: 'Name' })], tableOptions: options as TableOptionsIf,
    });
    const { host } = mountTable(tableModel, { tableOptions: options });
    await nextFrame();
    const input = getCellDiv(host, 'body', 'center', 2, 0).querySelector<HTMLInputElement>('input.ge-table-row-checkbox');
    expect(input).not.toBeNull();
    expect(input!.getAttribute('aria-label')).toBe('Select row 3');
  });

  it('own texts (ariaTexts) – also German', async () => {
    const defs = [new CheckboxColumnDef(), ...columnDefs(2)] as ColumnDefIf[];
    const { host } = mountTable(TableFactory.createTableModel({ rows: createRows(5), columnDefs: defs }), {
      tableOptions: { ariaTexts: { selectRow: (n: number) => `Zeile ${n} auswählen`, selectAllRows: () => 'Alle auswählen' } },
    });
    await nextFrame();
    expect(getCellDiv(host, 'body', 'center', 0, 0).querySelector('input')!.getAttribute('aria-label')).toBe('Zeile 1 auswählen');
    expect(getCellDiv(host, 'header', 'center', 0, 0).querySelector('input')!.getAttribute('aria-label')).toBe('Alle auswählen');
  });
});

describe('A9 – spans and header groups', () => {

  interface Row { [key: string]: string | number }
  class SpanBody extends AreaModelObjectArrayWithColumndefs<Row> {
    override getColspanAt(rowIndex: number, columnIndex: number): number {
      return rowIndex === 2 && columnIndex === 1 ? 2 : 0;
    }
    override getRowspanAt(rowIndex: number, columnIndex: number): number {
      return rowIndex === 4 && columnIndex === 0 ? 3 : 0;
    }
  }

  it('span cells: aria-colspan / aria-rowspan, inside a row with the aria-rowindex of their first row', async () => {
    const defs = columnDefs(4);
    const rows: Row[] = Array.from({ length: 20 }, (_, r) => Object.fromEntries(defs.map((cd, c) => [cd.property, `${r}/${c}`])));
    const { host } = mountTable(TableFactory.createTableModel({ bodyAreaModel: new SpanBody('body', rows, defs, 34), columnDefs: defs }));
    await nextFrame();
    const colspan = getCellDiv(host, 'body', 'center', 2, 1);
    expect(colspan.getAttribute('aria-colspan')).toBe('2');
    expect(colspan.getAttribute('aria-colindex')).toBe('2');
    const spanRow = colspan.parentElement!;
    expect(spanRow.classList).toContain('ge-table-span-row');
    expect(spanRow.getAttribute('role')).toBe('row');
    expect(spanRow.getAttribute('aria-rowindex')).toBe('4');
    const rowspan = getCellDiv(host, 'body', 'center', 4, 0);
    expect(rowspan.getAttribute('aria-rowspan')).toBe('3');
    expect(rowspan.parentElement!.getAttribute('aria-rowindex')).toBe('6');
  });

  const groups = (label = 'Customer'): CellGroupIf[] => [
    { data: 'Order', children: [{ data: 'ID', property: 'id' }, { data: 'Date', property: 'date' }] },
    {
      data: label, toggle: true, children: [
        { data: 'Customer', property: 'customer', visibility: 'always' },
        { data: 'City', property: 'city' },
      ],
    },
  ];

  async function mountGroups(label?: string, tableOptions?: Partial<TableOptionsIf>) {
    const cellGroups = groups(label);
    const defs = CellgroupFactory.buildColumnDefs(CellgroupFactory.buildGroupExts(cellGroups));
    defs.forEach(cd => cd.width = px120);
    const rows = Array.from({ length: 20 }, (_, i) => ({ id: i, date: `2026-10-${10 + i}`, customer: 'C' + i, city: 'City ' + i }));
    const headerAreaModel = new AreaModelCellGroups('header', cellGroups, defs, 34);
    const bodyAreaModel = new AreaModelObjectArrayWithColumndefs('body', rows, defs, 34);
    const fm = new FocusModel('cell');
    const table = mountTable(TableFactory.createTableModel({ headerAreaModel, bodyAreaModel, columnDefs: defs }), {
      tableOptions: { getFocusModel: () => fm, ...tableOptions },
    });
    await nextFrame();
    return { ...table, fm };
  }

  it('group header cells span their columns; the toggle is a named button with aria-expanded', async () => {
    const { host } = await mountGroups();
    expect(host.getAttribute('aria-rowcount')).toBe('22'); // 2 header rows + 20
    const order = Array.from(host.querySelectorAll<HTMLElement>('.ge-table-header-center [role="columnheader"][data-row-index="0"][data-col-index="0"]'))
      .filter(e => !e.closest('[aria-hidden="true"]'));
    expect(order).toHaveLength(1); // the visual duplicate (drawn again on top) is hidden
    expect(order[0].getAttribute('aria-colspan')).toBe('2');
    const toggle = host.querySelector<HTMLElement>('.ge-table-toggle-icon-div')!;
    expect(toggle.getAttribute('role')).toBe('button');
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggle.getAttribute('aria-label')).toBe('Collapse group Customer');
    expect(renderedRows(host)[0].getAttribute('aria-rowindex')).toBe('3');
  });

  it('keyboard: arrow up into the header, Enter on the group toggles it', async () => {
    const { host, fm } = await mountGroups();
    host.focus();
    fm.setFocus(0, 2);
    await userEvent.keyboard('{ArrowUp}'); // → header row 1 ("Customer")
    await userEvent.keyboard('{ArrowUp}'); // → header row 0 (group "Customer")
    const cell = activeCell(host)!;
    expect(cell.getAttribute('role')).toBe('columnheader');
    expect([cell.getAttribute('data-row-index'), cell.getAttribute('data-col-index')]).toEqual(['0', '2']);
    expect(host.getAttribute('aria-colcount')).toBe('4');
    await userEvent.keyboard('{Enter}');
    await nextFrame();
    expect(host.getAttribute('aria-colcount')).toBe('3'); // "City" collapsed
    expect(host.querySelector('.ge-table-toggle-icon-div')!.getAttribute('aria-expanded')).toBe('false');
    expect(host.querySelector('.ge-table-toggle-icon-div')!.getAttribute('aria-label')).toBe('Expand group Customer');
    expect(activeCell(host)!.getAttribute('data-col-index')).toBe('2');
  });

  it('own group texts and HTML in a group label', async () => {
    const { host } = await mountGroups(XSS, {
      ariaTexts: { collapseGroup: (l: string) => `Gruppe ${l} zuklappen`, expandGroup: (l: string) => `Gruppe ${l} aufklappen` },
    });
    const toggle = host.querySelector<HTMLElement>('.ge-table-toggle-icon-div')!;
    expect(toggle.getAttribute('aria-label')).toBe(`Gruppe ${XSS} zuklappen`);
    expect(host.querySelector('img')).toBeNull();
  });
});

describe('header focus and grid keys (Home, End, Ctrl+Home/End, Page Up/Down, Enter)', () => {

  it('arrow up from the first row focuses the header; Enter sorts; arrow down returns to the body', async () => {
    const { host, fm, api, scope } = await mountGrid({ sortable: true, rows: 100 });
    host.focus();
    fm.setFocus(0, 1);
    await userEvent.keyboard('{ArrowUp}');
    expect(api.getHeaderFocus()).toEqual([0, 1]);
    expect(activeCell(host)!.getAttribute('role')).toBe('columnheader');
    expect(host.querySelectorAll('.ge-table-header-center .ge-table-focus-border')).toHaveLength(4);
    expect(host.querySelectorAll('.ge-table-body-center .ge-table-focus-border')).toHaveLength(0);
    await userEvent.keyboard('{ArrowRight}');
    expect(api.getHeaderFocus()).toEqual([0, 2]);
    await userEvent.keyboard('{Enter}');
    expect(getCellDiv(host, 'header', 'center', 0, 2).getAttribute('aria-sort')).toBe('ascending');
    await vi.waitFor(() => expect(liveText(scope)).toBe('Sorted by Value, ascending'));
    await userEvent.keyboard('{Enter}');
    expect(getCellDiv(host, 'header', 'center', 0, 2).getAttribute('aria-sort')).toBe('descending');
    await userEvent.keyboard('{ArrowUp}'); // the top header row: stays
    expect(api.getHeaderFocus()).toEqual([0, 2]);
    await userEvent.keyboard(' '); // space does not select the body cell behind the header
    await userEvent.keyboard('{ArrowDown}');
    expect(api.getHeaderFocus()).toBeUndefined();
    expect(fm.getFocus()).toEqual([0, 2]);
    expect(activeCell(host)!.getAttribute('role')).toBe('gridcell');
  });

  it('a mouse click ends the header focus', async () => {
    const { host, fm, api } = await mountGrid();
    host.focus();
    fm.setFocus(0, 0);
    await userEvent.keyboard('{ArrowUp}');
    expect(api.getHeaderFocus()).toBeDefined();
    await userEvent.click(getCellDiv(host, 'body', 'center', 3, 1));
    expect(api.getHeaderFocus()).toBeUndefined();
  });

  it('Home / End / Ctrl+Home / Ctrl+End / Page Down / Page Up', async () => {
    const { host, fm, api } = await mountGrid({ columns: 5, rows: 1000 });
    host.focus();
    fm.setFocus(5, 2);
    await userEvent.keyboard('{End}');
    expect(fm.getFocus()).toEqual([5, 4]);
    await userEvent.keyboard('{Home}');
    expect(fm.getFocus()).toEqual([5, 0]);
    await userEvent.keyboard('{Control>}{End}{/Control}');
    expect(fm.getFocus()).toEqual([999, 4]);
    expect(activeCell(host)!.getAttribute('aria-rowindex') ?? activeCell(host)!.parentElement!.getAttribute('aria-rowindex')).toBe('1001');
    await userEvent.keyboard('{Control>}{Home}{/Control}');
    expect(fm.getFocus()).toEqual([0, 0]);
    const page = api.getDisplayedRowCount() - 1;
    await userEvent.keyboard('{PageDown}');
    expect(fm.getFocus()).toEqual([page, 0]);
    await userEvent.keyboard('{PageDown}');
    expect(fm.getFocus()).toEqual([2 * page, 0]);
    expect(activeCell(host)).not.toBeNull(); // scrolled into view
    await userEvent.keyboard('{PageUp}');
    expect(fm.getFocus()).toEqual([page, 0]);
  });

  it('Home / End skip hidden columns', async () => {
    const { host, fm, api } = await mountGrid({ columns: 5 });
    api.setColumnVisible(0, false);
    api.setColumnVisible(4, false);
    host.focus();
    fm.setFocus(1, 2);
    await userEvent.keyboard('{Home}');
    expect(fm.getFocus()).toEqual([1, 1]);
    await userEvent.keyboard('{End}');
    expect(fm.getFocus()).toEqual([1, 3]);
  });

  it('Enter on a plain cell does nothing (not consumed – e.g. a form around the table may handle it)', async () => {
    const { host, fm } = await mountGrid();
    host.focus();
    fm.setFocus(1, 1);
    const evt = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true, cancelable: true });
    host.dispatchEvent(evt);
    expect(evt.defaultPrevented).toBe(false);
  });
});

describe('A10 – editor', () => {

  it('the editor input is named after the column; Escape returns the focus to the grid', async () => {
    const fm = new FocusModel('cell');
    const defs = columnDefs(3, { editable: TrueFn });
    const { host } = mountTable(TableFactory.createTableModel({ rows: createRows(10), columnDefs: defs }), {
      tableOptions: { getFocusModel: () => fm },
    });
    await nextFrame();
    host.focus();
    fm.setFocus(2, 1);
    await userEvent.keyboard('{F2}');
    const input = host.querySelector<HTMLInputElement>('input.ge-table-cell-editor-input')!;
    expect(input).not.toBeNull();
    expect(document.activeElement).toBe(input);
    expect(input.getAttribute('aria-label')).toBe('Name');
    expect(await axeViolations(host)).toEqual([]);
    await userEvent.keyboard('{Escape}');
    expect(document.activeElement).toBe(host);
    expect(activeCell(host)!.getAttribute('data-col-index')).toBe('1');
  });

  it('HTML in a column label is only text in aria-label', async () => {
    const fm = new FocusModel('cell');
    const defs = [ColumnDef.create({ property: 'name', headerLabel: XSS, editable: TrueFn, sortable: TrueFn })];
    const { host, scope, api } = mountTable(TableFactory.createTableModel({ rows: createRows(10), columnDefs: defs }), {
      tableOptions: { getFocusModel: () => fm },
    });
    await nextFrame();
    host.focus();
    fm.setFocus(0, 0);
    await userEvent.keyboard('{F2}');
    expect(host.querySelector('input')!.getAttribute('aria-label')).toBe(XSS);
    await userEvent.keyboard('{Escape}');
    api.sortByColumn(0, 'asc');
    await vi.waitFor(() => expect(liveText(scope)).toBe(`Sorted by ${XSS}, ascending`));
    expect(host.querySelector('img')).toBeNull();
    expect(scope.liveAnnouncer.getElement()!.querySelector('img')).toBeNull();
    expect((window as unknown as { __geXss?: number }).__geXss).toBeUndefined();
  });
});

describe('A11 – live region', () => {

  it('is a polite status region outside the grid (document.body), visually hidden', async () => {
    const { host, scope, api } = await mountGrid();
    api.announce('Orders loaded');
    const region = scope.liveAnnouncer.getElement()!;
    expect(region.parentElement).toBe(document.body);
    expect(host.contains(region)).toBe(false);
    expect([region.getAttribute('role'), region.getAttribute('aria-live'), region.getAttribute('aria-atomic')])
      .toEqual(['status', 'polite', 'true']);
    expect(region.getBoundingClientRect().width).toBeLessThanOrEqual(1);
    await vi.waitFor(() => expect(region.textContent).toBe('Orders loaded'));
  });

  it('announces the filter result (once, after typing has paused)', async () => {
    let max = 1000;
    const { scope, api } = await mountGrid({ tableOptions: { externalFilterFunction: (r: { id: number }) => r.id < max } });
    expect(liveText(scope)).toBe(''); // the initial filter is not announced
    max = 50;
    api.externalFilterChanged();
    max = 42;
    api.externalFilterChanged();
    await vi.waitFor(() => expect(liveText(scope)).toBe('42 rows'));
    max = 0;
    api.externalFilterChanged();
    await vi.waitFor(() => expect(liveText(scope)).toBe('No rows'));
  });

  it('announces copied cells (Ctrl+C and copyToClipboard)', async () => {
    const { host, scope, api, sm } = await mountGrid({ selection: new SelectionModel('range', 'multi'), rows: 20 });
    vi.spyOn(scope.copyService, 'copyContent').mockResolvedValue(undefined);
    host.focus();
    await userEvent.click(getCellDiv(host, 'body', 'center', 1, 0));
    await userEvent.click(getCellDiv(host, 'body', 'center', 4, 2), { modifiers: ['Shift'] });
    await vi.waitFor(() => expect(sm.getRanges().length).toBeGreaterThan(0));
    await userEvent.keyboard('{Control>}c{/Control}');
    await vi.waitFor(() => expect(liveText(scope)).toBe('12 cells copied'));
    scope.liveAnnouncer.getElement()!.textContent = '';
    await api.copyToClipboard();
    await vi.waitFor(() => expect(liveText(scope)).toBe('12 cells copied'));
  });

  it('own texts, the same message twice is announced again', async () => {
    const { scope, api } = await mountGrid({ tableOptions: { ariaTexts: { sorted: () => 'sortiert' } }, sortable: true });
    api.sortByColumn(0, 'asc');
    await vi.waitFor(() => expect(liveText(scope)).toBe('sortiert'));
    LiveAnnouncer.defaultDelayInMs = 20;
    api.sortByColumn(0, 'desc');
    expect(liveText(scope)).toBe(''); // emptied first, so screen readers notice the change
    await vi.waitFor(() => expect(liveText(scope)).toBe('sortiert'));
  });

  it('destroy() removes the live region and the ARIA attributes of the host', async () => {
    const { host, scope, api } = await mountGrid({ tableOptions: { ariaLabel: 'Orders' } });
    api.announce('x');
    const region = scope.liveAnnouncer.getElement()!;
    expect(region.isConnected).toBe(true);
    api.destroy();
    expect(region.isConnected).toBe(false);
    for (const attr of ['role', 'aria-label', 'aria-rowcount', 'aria-colcount', 'aria-owns', 'aria-activedescendant']) {
      expect(host.hasAttribute(attr), attr).toBe(false);
    }
    api.announce('after destroy'); // no error, nothing created
    expect(scope.liveAnnouncer.getElement()).toBeDefined(); // getElement() may create it lazily …
    scope.liveAnnouncer.destroy();                           // … and destroy() removes it again
  });
});

describe('A12 – decoration is hidden from screen readers', () => {

  it('borders, hover, drag ghost, resize handles, focus frame', async () => {
    const { host, fm, api } = await mountGrid({ rows: 20 });
    fm.setFocus(1, 1);
    api.repaint();
    const selectors = [
      '.ge-table-hover-row', '.ge-table-hover-column', '.ge-table-dragging-column', '.ge-table-header-border',
      '.ge-table-west-fixed-column-border', '.ge-table-east-fixed-column-border', '.ge-table-footer-border',
      '.ge-table-column-resize-handle', '.ge-table-focus-border', '.ge-table-body-center-vertical-border',
      '.ge-table-body-center-horizontal-border', '.ge-table-border',
    ];
    for (const selector of selectors) {
      const all = host.querySelectorAll(selector);
      expect(all.length, selector).toBeGreaterThan(0);
      all.forEach(e => expect(e.getAttribute('aria-hidden'), selector).toBe('true'));
    }
  });

  it('every child of a row is a cell or hidden', async () => {
    const { host, fm, api } = await mountGrid({ rows: 20, columns: 4, fixedLeft: 1, sortable: true });
    fm.setFocus(1, 1);
    api.sortByColumn(1, 'asc');
    host.querySelectorAll('[role="row"]').forEach(row => {
      Array.from(row.children).forEach(child => {
        const ok = ['gridcell', 'columnheader'].includes(child.getAttribute('role') ?? '') || child.getAttribute('aria-hidden') === 'true';
        expect(ok, child.outerHTML.slice(0, 120)).toBe(true);
      });
    });
  });
});

describe('A13 – visible focus', () => {

  it('the focus frame is 2 px wide and uses --ge-table-focus-outline-color if set', async () => {
    const { host, fm, api } = await mountGrid({ rows: 10 });
    fm.setFocus(1, 1);
    api.repaint();
    const frame = Array.from(host.querySelectorAll<HTMLElement>('.ge-table-focus-border'));
    expect(frame).toHaveLength(4);
    expect(parseFloat(frame[0].style.width)).toBe(ConvenienceDomService.focusBorderWidthInPx);
    expect(ConvenienceDomService.focusBorderWidthInPx).toBe(2);
    expect(getComputedStyle(frame[0]).backgroundColor).toBe('rgb(0, 0, 255)'); // --ge-table-focus-border (light)
    host.style.setProperty('--ge-table-focus-outline-color', 'rgb(200, 0, 100)');
    expect(getComputedStyle(frame[0]).backgroundColor).toBe('rgb(200, 0, 100)');
  });

  it('the keyboard focus ring of the grid', async () => {
    const before = document.createElement('button');
    document.body.prepend(before);
    try {
      const { host } = await mountGrid({ rows: 10 });
      before.focus();
      await userEvent.tab();
      const style = getComputedStyle(host);
      expect(style.outlineStyle).toBe('solid');
      expect(style.outlineWidth).toBe('2px');
    } finally {
      before.remove();
    }
  });
});

describe('renderers with a visual statement have a text alternative', () => {

  it('progress bar, stars, true/false, male/female', async () => {
    const defs = [
      ColumnDef.create({ property: 'p', headerLabel: 'Progress', bodyRenderer: new NumberCellProgressBarCellRenderer(), width: px100 }),
      ColumnDef.create({ property: 's', headerLabel: 'Stars', bodyRenderer: new StarRatingCellRenderer('s'), width: px100 }),
      ColumnDef.create({ property: 't', headerLabel: 'Active', bodyRenderer: new TrueFalseCellRenderer(), width: px100 }),
      ColumnDef.create({ property: 'g', headerLabel: 'Gender', bodyRenderer: new MaleFemaleToIconCellRenderer(), width: px100 }),
    ];
    const rows = [{ p: 75, s: 4, t: true, g: 'f' }, { p: 10, s: 1, t: false, g: 'm' }];
    const { host } = mountTable(TableFactory.createTableModel({ rows, columnDefs: defs }));
    await nextFrame();
    const img = (r: number, c: number) => getCellDiv(host, 'body', 'center', r, c).querySelector('[role="img"]')!.getAttribute('aria-label');
    expect([0, 1, 2, 3].map(c => img(0, c))).toEqual(['75 %', '4 stars', 'Yes', 'female']);
    expect([0, 1, 2, 3].map(c => img(1, c))).toEqual(['10 %', '1 star', 'No', 'male']);
    expect(await axeViolations(host)).toEqual([]);
  });

  it('own texts for the renderers', async () => {
    const defs = [
      ColumnDef.create({ property: 's', headerLabel: 'Sterne', bodyRenderer: new StarRatingCellRenderer('s', n => `${n} von 5 Sternen`), width: px100 }),
      ColumnDef.create({ property: 't', headerLabel: 'Aktiv', bodyRenderer: new TrueFalseCellRenderer({ true: 'ja', false: XSS }), width: px100 }),
    ];
    const { host } = mountTable(TableFactory.createTableModel({ rows: [{ s: 3, t: false }], columnDefs: defs }));
    await nextFrame();
    expect(getCellDiv(host, 'body', 'center', 0, 0).querySelector('[role="img"]')!.getAttribute('aria-label')).toBe('3 von 5 Sternen');
    expect(getCellDiv(host, 'body', 'center', 0, 1).querySelector('[role="img"]')!.getAttribute('aria-label')).toBe(XSS);
    expect(host.querySelector('img')).toBeNull();
  });

  it('a tooltip stays a title attribute (accessible description of the cell)', async () => {
    class TooltipBody extends AreaModelObjectArrayWithColumndefs<{ id: number; name: string; value: number }> {
      override getTooltipAt(rowIndex: number): string { return `Row ${rowIndex}`; }
    }
    const defs = columnDefs(2);
    const { host } = mountTable(TableFactory.createTableModel({ bodyAreaModel: new TooltipBody('body', createRows(3), defs, 34), columnDefs: defs }));
    await nextFrame();
    expect(getCellDiv(host, 'body', 'center', 1, 0).getAttribute('title')).toBe('Row 1');
  });
});

describe('axe-core: no violations (WCAG 2.1 A/AA + best practices)', () => {

  it('simple table, light and dark theme (A14 contrast)', async () => {
    const { host, fm, api } = await mountGrid({ rows: 50, tableOptions: { ariaLabel: 'Orders' }, sortable: true });
    fm.setFocus(1, 1);
    api.repaint();
    expect(await axeViolations(host)).toEqual([]);
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.style.background = '#111827';
    try {
      expect(await axeViolations(host)).toEqual([]);
    } finally {
      document.body.style.background = '';
    }
  });

  it('row drag (1.1.95): handles are hidden, the cell names the keyboard alternative, light and dark', async () => {
    const defs = [ColumnDef.create({ property: 'name', headerLabel: 'Name', rowDrag: true }), ...columnDefs(3).slice(2)];
    const { host } = mountTable(TableFactory.createTableModel({ rows: createRows(30), columnDefs: defs, rowNumbersVisible: true }),
      { tableOptions: { ariaLabel: 'Tasks' } });
    await nextFrame();
    const handle = host.querySelector('.ge-table-row-drag-handle')!;
    expect(handle.getAttribute('aria-hidden')).toBe('true');
    expect(handle.closest('[role="gridcell"]')!.getAttribute('aria-keyshortcuts')).toContain('Control+Alt+ArrowDown');
    expect(await axeViolations(host)).toEqual([]);
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.style.background = '#111827';
    try {
      expect(await axeViolations(host)).toEqual([]);
    } finally {
      document.body.style.background = '';
    }
  });

  it('fixed columns + selection + footer', async () => {
    const defs = columnDefs(6);
    const rows = createRows(40).map(r => ({ ...r, d: 1, e: 2, f: 3 }));
    const sm = new SelectionModel('range', 'multi');
    const { host } = mountTable(TableFactory.createTableModel({
      rows, columnDefs: defs, fixedLeftColumnCount: 1, fixedRightColumnCount: 1, footerData: [['Sum', '', '1', '2', '3', '4']],
    }), { tableOptions: { ariaLabel: 'Orders', getSelectionModel: () => sm } });
    await nextFrame();
    await userEvent.click(getCellDiv(host, 'body', 'center', 2, 2));
    expect(host.getAttribute('aria-rowcount')).toBe('42');
    expect(await axeViolations(host)).toEqual([]);
  });

  it('tree with checkboxes', async () => {
    interface Node { id: number; name: string; children?: Node[] }
    const nodes: Node[] = [{ id: 1, name: 'A', children: [{ id: 2, name: 'A1' }] }, { id: 3, name: 'B' }];
    const defs = [new CheckboxColumnDef(), ColumnDef.create({ property: 'name', headerLabel: 'Name' })] as ColumnDefIf[];
    const { host } = mountTable(TableFactory.createTableModel({ rows: TreeFactory.buildTreeRows(nodes, { expanded: true }), columnDefs: defs }),
      { tableOptions: { ariaLabel: 'Tree' } });
    await nextFrame();
    expect(await axeViolations(host)).toEqual([]);
  });

  it('header groups', async () => {
    const cellGroups: CellGroupIf[] = [
      { data: 'Order', children: [{ data: 'ID', property: 'id' }, { data: 'Date', property: 'date' }] },
      { data: 'Customer', toggle: true, children: [{ data: 'Name', property: 'customer', visibility: 'always' }, { data: 'City', property: 'city' }] },
    ];
    const defs = CellgroupFactory.buildColumnDefs(CellgroupFactory.buildGroupExts(cellGroups));
    const rows = Array.from({ length: 10 }, (_, i) => ({ id: i, date: '2026-10-14', customer: 'C' + i, city: 'X' }));
    const { host } = mountTable(TableFactory.createTableModel({
      headerAreaModel: new AreaModelCellGroups('header', cellGroups, defs, 34),
      bodyAreaModel: new AreaModelObjectArrayWithColumndefs('body', rows, defs, 34),
      columnDefs: defs,
    }), { tableOptions: { ariaLabel: 'Groups' } });
    await nextFrame();
    expect(await axeViolations(host)).toEqual([]);
  });
});

describe('edge cases of the keyboard model and the ARIA attributes', () => {

  it('header focus: Home/End, Left at the first column, Ctrl+End continues in the body, Enter on a column that cannot be sorted', async () => {
    const { host, fm, api } = await mountGrid({ columns: 4, rows: 50 });
    host.focus();
    fm.setFocus(0, 2);
    await userEvent.keyboard('{ArrowUp}');
    await userEvent.keyboard('{End}');
    expect(api.getHeaderFocus()).toEqual([0, 3]);
    await userEvent.keyboard('{ArrowRight}'); // the last column: stays
    expect(api.getHeaderFocus()).toEqual([0, 3]);
    await userEvent.keyboard('{Home}');
    expect(api.getHeaderFocus()).toEqual([0, 0]);
    await userEvent.keyboard('{ArrowLeft}'); // the first column: stays
    expect(api.getHeaderFocus()).toEqual([0, 0]);
    const evt = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true, cancelable: true });
    host.dispatchEvent(evt); // not sortable: nothing happens, the key is not consumed
    expect(evt.defaultPrevented).toBe(false);
    await userEvent.keyboard('{F2}'); // nothing to edit in the header
    expect(host.querySelector('input')).toBeNull();
    await userEvent.keyboard('{Control>}{End}{/Control}');
    expect(api.getHeaderFocus()).toBeUndefined();
    expect(fm.getFocus()).toEqual([49, 3]);
  });

  it('header groups: arrow down from the group row goes to the column row, then into the body', async () => {
    const cellGroups: CellGroupIf[] = [
      { data: 'Order', children: [{ data: 'ID', property: 'id' }, { data: 'Name', property: 'name' }] },
    ];
    const defs = CellgroupFactory.buildColumnDefs(CellgroupFactory.buildGroupExts(cellGroups));
    const fm = new FocusModel('cell');
    const { host, api } = mountTable(TableFactory.createTableModel({
      headerAreaModel: new AreaModelCellGroups('header', cellGroups, defs, 34),
      bodyAreaModel: new AreaModelObjectArrayWithColumndefs('body', createRows(10), defs, 34),
      columnDefs: defs,
    }), { tableOptions: { getFocusModel: () => fm } });
    await nextFrame();
    host.focus();
    fm.setFocus(0, 1);
    await userEvent.keyboard('{ArrowUp}');
    await userEvent.keyboard('{ArrowUp}');
    expect(api.getHeaderFocus()).toEqual([0, 0]); // the group cell spans both columns: its origin
    await userEvent.keyboard('{ArrowRight}'); // no column right of the span
    expect(api.getHeaderFocus()).toEqual([0, 0]);
    await userEvent.keyboard('{ArrowDown}');
    expect(api.getHeaderFocus()).toEqual([1, 0]);
    await userEvent.keyboard('{ArrowDown}');
    expect(api.getHeaderFocus()).toBeUndefined();
    expect(fm.getFocus()).toEqual([0, 0]);
  });

  it('no body rows: the header is reachable (Tab, arrow up); arrow down keeps the header focus', async () => {
    const before = document.createElement('button');
    document.body.prepend(before);
    try {
      const { host, fm, api } = await mountGrid({ rows: 0, sortable: true });
      host.focus();
      for (const key of ['{Home}', '{End}', '{PageDown}', '{Enter}']) {
        await userEvent.keyboard(key);
      }
      expect(fm.getFocus()).toEqual([-1, -1]);
      expect(api.getHeaderFocus()).toBeUndefined();
      await userEvent.keyboard('{ArrowUp}'); // programmatic focus: arrow up reaches the header
      expect(api.getHeaderFocus()).toEqual([0, 0]);
      await userEvent.keyboard('{ArrowDown}');
      expect(api.getHeaderFocus()).toEqual([0, 0]);
      await userEvent.click(before); // leaves the header focus
      await userEvent.tab();         // Tab into the empty table: the header cell gets the focus
      expect(api.getHeaderFocus()).toEqual([0, 0]);
      expect(activeCell(host)!.getAttribute('role')).toBe('columnheader');
      await userEvent.keyboard('{Enter}');
      expect(getCellDiv(host, 'header', 'center', 0, 0).getAttribute('aria-sort')).toBe('ascending');
    } finally {
      before.remove();
    }
  });

  it('hiding the header ends the header focus', async () => {
    const { host, fm, api } = await mountGrid({ rows: 10 });
    host.focus();
    fm.setFocus(0, 1);
    await userEvent.keyboard('{ArrowUp}');
    expect(api.getHeaderFocus()).toBeDefined();
    api.setHeaderVisible(false);
    expect(api.getHeaderFocus()).toBeUndefined();
    expect(activeCell(host)!.getAttribute('data-col-index')).toBe('1');
  });

  it('controls in cells are no tab stops of their own (checkboxes, buttons)', async () => {
    const defs = [new CheckboxColumnDef(), ...columnDefs(2)] as ColumnDefIf[];
    const { host } = mountTable(TableFactory.createTableModel({ rows: createRows(30), columnDefs: defs }));
    await nextFrame();
    const tabbable = Array.from(host.querySelectorAll<HTMLElement>('input, button, a[href], select, textarea, [tabindex]'))
      .filter(e => e.tabIndex >= 0);
    expect(tabbable).toEqual([]);
    expect(host.querySelectorAll('input.ge-table-row-checkbox').length).toBeGreaterThan(5);
  });

  it('a selection type changed at runtime removes aria-selected from the reused row divs', async () => {
    const sm = new SelectionModel('row', 'multi');
    const { host, api } = await mountGrid({ selection: sm, rows: 20 });
    expect(renderedRows(host)[0].getAttribute('aria-selected')).toBe('false');
    sm.selectionType = 'none';
    api.repaint();
    expect(host.querySelectorAll('[aria-selected]')).toHaveLength(0);
  });

  it('destroy() restores ARIA attributes the app had set on the host (e.g. an Angular host element)', async () => {
    const host = document.createElement('div');
    host.setAttribute('aria-label', 'Orders of the app');
    host.style.cssText = 'position:relative;width:400px;height:200px';
    document.body.appendChild(host);
    const scope = new TableScope(host, TableFactory.createTableModel({ rows: createRows(3), columnDefs: columnDefs() }),
      new SimpleDomService(), { ...new TableOptions() }, new EventAdapter());
    scope.firstInit();
    expect(host.getAttribute('role')).toBe('grid');
    expect(host.getAttribute('aria-label')).toBe('Orders of the app'); // no ariaLabel option: kept
    scope.destroy();
    expect(host.getAttribute('aria-label')).toBe('Orders of the app');
    expect(host.hasAttribute('role')).toBe(false);
    host.remove();
  });

  it('shortcutActionsDisabled: the scroll viewport stays keyboard-focusable (native scrolling)', async () => {
    const { scope } = await mountGrid({ tableOptions: { shortcutActionsDisabled: true } });
    expect(scope.scrollViewport.hasAttribute('tabindex')).toBe(false);
  });

  it('copy announcement counts the selected cells, not the copied rectangle', async () => {
    const { host, scope } = await mountGrid({ selection: new SelectionModel('cell', 'multi'), rows: 20 });
    vi.spyOn(scope.copyService, 'copyContent').mockResolvedValue(undefined);
    await userEvent.click(getCellDiv(host, 'body', 'center', 0, 0));
    await userEvent.click(getCellDiv(host, 'body', 'center', 5, 2), { modifiers: ['ControlOrMeta'] });
    host.focus();
    await userEvent.keyboard('{Control>}c{/Control}');
    await vi.waitFor(() => expect(liveText(scope)).toBe('2 cells copied'));
  });

  it('a hidden header: arrow up in the first row stays in the body', async () => {
    const { host, fm, api } = await mountGrid({ rows: 10 });
    api.setHeaderVisible(false);
    host.focus();
    fm.setFocus(0, 0);
    await userEvent.keyboard('{ArrowUp}');
    expect(api.getHeaderFocus()).toBeUndefined();
    expect(fm.getFocus()).toEqual([0, 0]);
  });

  it('Home/End without a focus cell start in the first row; Page Down without focus', async () => {
    const { host, fm } = await mountGrid({ rows: 100 });
    host.focus();
    await userEvent.keyboard('{End}');
    expect(fm.getFocus()).toEqual([0, 2]);
    fm.clear();
    await userEvent.keyboard('{PageDown}');
    expect(fm.getFocus()[1]).toBe(0);
  });

  it('while editing, the grid keys belong to the editor', async () => {
    const fm = new FocusModel('cell');
    const { host } = mountTable(TableFactory.createTableModel({ rows: createRows(10), columnDefs: columnDefs(3, { editable: TrueFn }) }), {
      tableOptions: { getFocusModel: () => fm },
    });
    await nextFrame();
    host.focus();
    fm.setFocus(1, 1);
    await userEvent.keyboard('{F2}');
    await userEvent.keyboard('{End}'); // moves the text cursor in the input, not the focus cell
    expect(fm.getFocus()).toEqual([1, 1]);
  });

  it('the focus inside a span cell makes the span cell the active descendant', async () => {
    interface Row { [key: string]: string | number }
    class RowspanBody extends AreaModelObjectArrayWithColumndefs<Row> {
      override getRowspanAt(rowIndex: number, columnIndex: number): number {
        return rowIndex === 4 && columnIndex === 0 ? 3 : 0;
      }
    }
    const defs = columnDefs(2);
    const rows: Row[] = Array.from({ length: 20 }, (_, r) => ({ id: r, name: 'n' + r }));
    const fm = new FocusModel('cell');
    const { host, api } = mountTable(TableFactory.createTableModel({ bodyAreaModel: new RowspanBody('body', rows, defs, 34), columnDefs: defs }), {
      tableOptions: { getFocusModel: () => fm },
    });
    await nextFrame();
    fm.setFocus(5, 0);
    api.repaint();
    const cell = activeCell(host)!;
    expect([cell.getAttribute('data-row-index'), cell.getAttribute('aria-rowspan')]).toEqual(['4', '3']);
  });

  it('a column without headerLabel: the editor is named after the header text resp. the property', async () => {
    const fm = new FocusModel('cell');
    const defs = [ColumnDef.create({ property: 'name', editable: TrueFn })];
    const { host, scope } = mountTable(TableFactory.createTableModel({ rows: createRows(3), columnDefs: defs }), {
      tableOptions: { getFocusModel: () => fm },
    });
    await nextFrame();
    expect(scope.getColumnAriaLabel(0)).toBe(getCellDiv(host, 'header', 'center', 0, 0).textContent!.trim() || 'name');
    expect(scope.getColumnAriaLabel(5)).toBe('Column 6');
  });

  it('a selection model getter that returns nothing: no aria-selected', async () => {
    const { host } = mountTable(TableFactory.createTableModel({ rows: createRows(5), columnDefs: columnDefs() }), {
      tableOptions: { getSelectionModel: () => undefined as unknown as SelectionModel },
    });
    await nextFrame();
    expect(host.querySelectorAll('[aria-selected]')).toHaveLength(0);
  });

  it('counts are available before the first render; a DOM service without removeAttribute works', async () => {
    interface Node { name: string; children?: Node[] }
    const nodes: Node[] = [{ name: 'A', children: [{ name: 'A1' }] }, { name: 'B' }];
    const domService = new SimpleDomService();
    (domService as unknown as { removeAttribute?: unknown }).removeAttribute = undefined; // an own DomServiceIf (before 1.1.91)
    const host = document.createElement('div');
    host.style.cssText = 'position:relative;width:400px;height:300px';
    document.body.appendChild(host);
    const fm = new FocusModel('cell');
    const scope = new TableScope(host, TableFactory.createTableModel({
      rows: TreeFactory.buildTreeRows(nodes, { expanded: true }), columnDefs: [ColumnDef.create({ property: 'name', headerLabel: 'Name' })],
    }), domService, { ...new TableOptions(), getFocusModel: () => fm }, new EventAdapter());
    try {
      expect(scope.getAriaGridInfo().rowCount).toBe(4); // header + A, A1, B
      scope.firstInit();
      await nextFrame();
      expect(renderedRows(host)[1].getAttribute('aria-level')).toBe('2');
      host.focus();
      fm.setFocus(0, 0);
      await userEvent.keyboard('{Enter}'); // collapse A: the row div of A1 is reused for B
      await nextFrame();
      expect(renderedRows(host)[1].hasAttribute('aria-expanded')).toBe(false);
      expect(renderedRows(host)[1].getAttribute('aria-level')).toBe('1');
    } finally {
      scope.destroy();
      host.remove();
    }
  });
});
