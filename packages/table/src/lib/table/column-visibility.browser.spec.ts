// TableApi.setColumnVisible / setHeaderVisible / setFooterVisible in a real browser (before: empty stubs, TODO.md).
import { afterEach, describe, expect, it } from 'vitest';
import { CellRange, ColumnDef, SelectionModel, TableFactory, px100 } from '@guiexpert/table';
import { createRows, destroyAllTables, mountTable, nextFrame, renderedRows } from '../../../test-utils/mount-table';

/** id | name | value (3 × 100 px), 1000 rows, one footer row; optionally the first column fixed. */
async function mountThreeColumns(fixedLeftColumnCount = 0) {
  const tableModel = TableFactory.createTableModel({
    rows: createRows(1000),
    columnDefs: [new ColumnDef('id', 'Id', px100), new ColumnDef('name', 'Name', px100), new ColumnDef('value', 'Value', px100)],
    footerData: [['f-id', 'f-name', 'f-value']],
    fixedLeftColumnCount,
  });
  const sm = new SelectionModel('range', 'multi');
  const table = mountTable(tableModel, { width: 800, height: 500, tableOptions: { getSelectionModel: () => sm } });
  await nextFrame();
  return table;
}

function cells(host: HTMLElement, area: 'header' | 'body' | 'footer', col?: number): HTMLElement[] {
  const colSelector = col === undefined ? '' : `[data-col-index="${col}"]`;
  return Array.from(host.querySelectorAll<HTMLElement>(`.ge-table-col-div[data-area="${area}"]${colSelector}`));
}

/** Left edge and width of the first rendered cell of a column, relative to the host. */
function geo(host: HTMLElement, area: 'header' | 'body' | 'footer', col: number) {
  const rect = cells(host, area, col)[0]!.getBoundingClientRect();
  return { left: rect.left - host.getBoundingClientRect().left, width: rect.width };
}

function areaHeight(host: HTMLElement, area: 'header' | 'footer'): number {
  return host.querySelector<HTMLElement>(`.ge-table-${area}-center`)!.getBoundingClientRect().height;
}

afterEach(destroyAllTables);

describe('TableApi.setColumnVisible (real browser)', () => {

  it('hides a column in header, body and footer – the columns to the right move left', async () => {
    const { host, api } = await mountThreeColumns();
    expect(geo(host, 'body', 2).left).toBe(200);

    expect(api.setColumnVisible('name', false)).toBe(true);
    expect(api.isColumnVisible(1)).toBe(false);
    expect(cells(host, 'header', 1)).toHaveLength(0);
    expect(cells(host, 'body', 1)).toHaveLength(0);
    expect(cells(host, 'footer', 1)).toHaveLength(0);
    expect(geo(host, 'header', 2).left).toBe(100);
    expect(geo(host, 'body', 2).left).toBe(100);
    expect(geo(host, 'footer', 2).left).toBe(100);
    expect(cells(host, 'body', 2)[0]!.textContent).toBe('0');            // value of row 0, data unchanged
  });

  it('showing it again restores width and position (also a width changed by the user)', async () => {
    const { host, api } = await mountThreeColumns();
    api.setColumnWidth(1, 160);
    api.recalcWrappers();
    api.setColumnVisible(1, false);
    api.setColumnVisible(1, true);
    expect(api.isColumnVisible('name')).toBe(true);
    expect(geo(host, 'body', 1)).toEqual({ left: 100, width: 160 });
    expect(geo(host, 'header', 2).left).toBe(260);
    expect(cells(host, 'body', 1)[0]!.textContent).toBe('Name 0');
  });

  it('a hidden fixed column: the west area shrinks', async () => {
    const { host, api } = await mountThreeColumns(1);
    expect(geo(host, 'body', 1).left).toBe(100);
    api.setColumnVisible(0, false);
    expect(cells(host, 'body', 0)).toHaveLength(0);
    expect(geo(host, 'body', 1).left).toBe(0);
    api.setColumnVisible(0, true);
    expect(geo(host, 'body', 0).left).toBe(0);
    expect(geo(host, 'body', 1).left).toBe(100);
  });

  it('returns false for an unknown column and changes nothing', async () => {
    const { host, api } = await mountThreeColumns();
    expect(api.setColumnVisible(7, false)).toBe(false);
    expect(api.setColumnVisible('nope', false)).toBe(false);
    expect(api.isColumnVisible('nope')).toBe(false);
    expect(cells(host, 'body', 1).length).toBeGreaterThan(0);
  });

  it('the copied content skips the hidden column', async () => {
    const { api, scope } = await mountThreeColumns();
    const sm = api.getSelectionModel()!;
    const fm = scope.focusModel()!;
    sm.addSelection(new CellRange(0, 0, 1, 2));
    api.setColumnVisible('name', false);
    const text = await scope.copyService.createContent(api.getTableModel(), sm, fm);
    expect(text).toBe('0\t0\n1\t3');
  });
});

describe('TableApi.setHeaderVisible / setFooterVisible (real browser)', () => {

  it('hides the header: height 0, no header cells, the body moves up and shows more rows', async () => {
    const { host, api } = await mountThreeColumns();
    expect(api.isHeaderVisible()).toBe(true);
    expect(areaHeight(host, 'header')).toBe(34);
    const rowsBefore = renderedRows(host).length;
    const firstRowTop = renderedRows(host)[0]!.getBoundingClientRect().top;

    api.setHeaderVisible(false);
    expect(api.isHeaderVisible()).toBe(false);
    expect(areaHeight(host, 'header')).toBe(0);
    expect(cells(host, 'header')).toHaveLength(0);
    expect(renderedRows(host)[0]!.getBoundingClientRect().top).toBe(firstRowTop - 34);
    expect(renderedRows(host).length).toBeGreaterThanOrEqual(rowsBefore);
    expect(api.getLastFullVisibleRowIndex()).toBeGreaterThan(0);

    api.setHeaderVisible(true);
    expect(api.isHeaderVisible()).toBe(true);
    expect(areaHeight(host, 'header')).toBe(34);
    expect(cells(host, 'header', 1)[0]!.textContent).toContain('Name');
    expect(renderedRows(host)[0]!.getBoundingClientRect().top).toBe(firstRowTop);
  });

  it('hides the footer: height 0, no footer cells, the body gets taller', async () => {
    const { host, api } = await mountThreeColumns();
    expect(api.isFooterVisible()).toBe(true);
    expect(areaHeight(host, 'footer')).toBe(34);
    const lastFullBefore = api.getLastFullVisibleRowIndex();

    api.setFooterVisible(false);
    expect(api.isFooterVisible()).toBe(false);
    expect(areaHeight(host, 'footer')).toBe(0);
    expect(cells(host, 'footer')).toHaveLength(0);
    expect(api.getLastFullVisibleRowIndex()).toBe(lastFullBefore + 1);

    api.setFooterVisible(true);
    expect(areaHeight(host, 'footer')).toBe(34);
    expect(cells(host, 'footer', 1)[0]!.textContent).toBe('f-name');
    expect(api.getLastFullVisibleRowIndex()).toBe(lastFullBefore);
  });

  it('a table without footer rows: isFooterVisible() is false', async () => {
    const tableModel = TableFactory.createTableModel({ rows: createRows(10) });
    const { api } = mountTable(tableModel);
    await nextFrame();
    expect(api.isFooterVisible()).toBe(false);
    expect(api.isHeaderVisible()).toBe(true);
  });
});
