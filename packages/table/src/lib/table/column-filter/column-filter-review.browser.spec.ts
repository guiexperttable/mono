import { afterEach, describe, expect, it } from 'vitest';
import {
  ColumnDef,
  TableFactory,
  px100,
  px120,
  px80,
  type ColumnDefIf,
} from '@guiexpert/table';
import { destroyAllTables, mountTable, nextFrame } from '../../../../test-utils/mount-table';

/**
 * Findings of the final review of prompt 023 (column filters): each test was red before its fix.
 */

function getFilterInput(host: HTMLElement, property: string): HTMLInputElement {
  const el = host.querySelector<HTMLInputElement>(`.ge-table-filter-cell[data-col-property="${property}"] input.ge-table-filter-input`);
  if (!el) throw new Error(`Filter input for "${property}" not found`);
  return el;
}

function typeInInput(input: HTMLInputElement, value: string): void {
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function findPopup(): HTMLElement | null {
  return document.querySelector<HTMLElement>('.ge-table-filter-popup');
}

function getPopup(): HTMLElement {
  const el = findPopup();
  if (!el) throw new Error('Filter menu popup not found');
  return el;
}

function okButton(popup: HTMLElement): HTMLButtonElement {
  const buttons = Array.from(popup.querySelectorAll<HTMLButtonElement>('.ge-table-filter-menu-footer-actions button'));
  const ok = buttons.find(b => !b.classList.contains('ge-table-filter-btn-cancel'));
  if (!ok) throw new Error('OK button not found');
  return ok;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function frames(n: number): Promise<void> {
  for (let i = 0; i < n; i++) await nextFrame();
}

function wideModel(rowCount = 200) {
  const cols: ColumnDefIf[] = Array.from({ length: 100 }, (_, i) =>
    ColumnDef.create({ property: `c${i}`, headerLabel: `Col ${i}`, width: px100 }),
  );
  const rows = Array.from({ length: rowCount }, (_, r) => {
    const obj: Record<string, string> = {};
    for (let c = 0; c < 100; c++) obj[`c${c}`] = `r${r}_c${c}`;
    return obj;
  });
  return TableFactory.createTableModel({ rows, columnDefs: cols });
}

function itemRows(count: number) {
  return Array.from({ length: count }, (_, i) => ({ id: i, name: `Item ${String(i).padStart(5, '0')}` }));
}

function itemColumns(): ColumnDefIf[] {
  return [
    ColumnDef.create({ property: 'id', headerLabel: 'ID', width: px80 }),
    ColumnDef.create({ property: 'name', headerLabel: 'Name', width: px120 }),
  ];
}

afterEach(() => {
  destroyAllTables();
});

describe('Column filters: review findings (023)', () => {

  it('filter row: incomplete or invalid input keeps the active filter', async () => {
    const rows = [{ id: 1, seats: 50 }, { id: 2, seats: 120 }, { id: 3, seats: 8 }];
    const model = TableFactory.createTableModel({
      rows,
      columnDefs: [
        ColumnDef.create({ property: 'id', headerLabel: 'ID', width: px80 }),
        ColumnDef.create({ property: 'seats', headerLabel: 'Seats', width: px80 }),
      ],
    });
    const { host, api } = mountTable(model, { tableOptions: { filterRow: { debounce: 0 } }, width: 400, height: 260 });

    const input = getFilterInput(host, 'seats');
    input.focus();
    typeInInput(input, '>100');
    expect(model.getBodyModel().getRowCount()).toBe(1);

    for (const incomplete of ['>', '1..', 'abc']) {
      typeInInput(input, incomplete);
      expect(model.getBodyModel().getRowCount(), incomplete).toBe(1);
      expect(api.getColumnFilter('seats'), incomplete).toEqual({ condition: { operator: 'greaterThan', value: 100 } });
      expect(input.value, incomplete).toBe(incomplete);
    }

    typeInInput(input, '');
    expect(model.getBodyModel().getRowCount()).toBe(3);
  });

  it('filter row: the text shown for a filter of the menu or API can be confirmed with Enter', async () => {
    const rows = [{ region: 'EMEA' }, { region: 'EMEA 2' }, { region: 'APAC' }];
    const model = TableFactory.createTableModel({
      rows,
      columnDefs: [ColumnDef.create({ property: 'region', headerLabel: 'Region', width: px120 })],
    });
    const { host, api } = mountTable(model, { tableOptions: { filterRow: { debounce: 0 } }, width: 400, height: 260 });

    api.setColumnFilter('region', { condition: { operator: 'equals', value: 'EMEA' } });
    await nextFrame();
    expect(model.getBodyModel().getRowCount()).toBe(1);

    const input = getFilterInput(host, 'region');
    input.focus();
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    expect(model.getBodyModel().getRowCount()).toBe(1);
    expect(api.getColumnFilter('region')).toEqual({ condition: { operator: 'equals', value: 'EMEA' } });
  });

  it('filter row: keys of a running IME composition stay in the input', async () => {
    const model = TableFactory.createTableModel({
      rows: [{ name: 'a' }, { name: 'b' }],
      columnDefs: [ColumnDef.create({ property: 'name', headerLabel: 'Name', width: px120 })],
    });
    const { host, api } = mountTable(model, { tableOptions: { filterRow: { debounce: 0 } }, width: 400, height: 260 });
    const input = getFilterInput(host, 'name');
    input.focus();
    typeInInput(input, 'a');
    expect(api.isColumnFiltered('name')).toBe(true);

    for (const key of ['ArrowDown', 'ArrowUp', 'Escape', 'Tab']) {
      const evt = new KeyboardEvent('keydown', { key, isComposing: true, bubbles: true, cancelable: true });
      input.dispatchEvent(evt);
      expect(evt.defaultPrevented, key).toBe(false);
      expect(document.activeElement, key).toBe(input);
    }
    expect(api.isColumnFiltered('name')).toBe(true);
    expect(input.value).toBe('a');
  });

  it('a column filter keeps the horizontal scroll position (the vertical one goes to the top)', async () => {
    const model = wideModel();
    const { api } = mountTable(model, { tableOptions: { filterRow: { debounce: 0 } }, width: 500, height: 260 });
    api.scrollToPixel(3000, 400);
    await frames(2);
    const scope = api.getTableScope();
    expect(scope.getViewportScrollLeft()).toBe(3000);

    api.setColumnFilter('c32', { condition: { operator: 'contains', value: 'r1' } });
    await frames(2);
    expect(model.getBodyModel().getRowCount()).toBeLessThan(200);
    expect(scope.getViewportScrollLeft()).toBe(3000);
    expect(scope.scrollViewport.scrollTop).toBe(0);
  });

  it('filter menu: stays open when opening scrolls the column into view, and when the table scrolls vertically', async () => {
    const model = wideModel();
    const { api } = mountTable(model, { tableOptions: { columnFilterMenu: true }, width: 450, height: 260 });
    const scope = api.getTableScope();

    // column c4 (400 – 500 px) is cut off at the right edge: opening scrolls it into view
    expect(api.showColumnFilterMenu('c4')).toBe(true);
    await frames(3);
    await sleep(30);
    expect(findPopup()).not.toBeNull();

    // vertical scrolling (live tail, a filter that jumps to the top) does not move the header
    api.scrollToPixel(scope.getViewportScrollLeft(), 300);
    await frames(3);
    await sleep(30);
    expect(findPopup()).not.toBeNull();

    // horizontal scrolling moves the column away: the menu closes, the focus stays in the table
    api.scrollToPixel(2000, 300);
    await frames(3);
    await sleep(30);
    expect(findPopup()).toBeNull();
    expect(document.activeElement).not.toBe(document.body);
  });

  it('filter menu with applyOnChange: stays open while the table is scrolled down', async () => {
    const model = wideModel();
    const { api } = mountTable(model, {
      tableOptions: { columnFilterMenu: { applyOnChange: true } },
      width: 450,
      height: 260,
    });
    api.scrollToPixel(0, 600);
    await frames(2);
    expect(api.showColumnFilterMenu('c1')).toBe(true);
    const input = getPopup().querySelector<HTMLInputElement>('.ge-table-filter-menu-input')!;
    input.value = 'r1';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await frames(3);
    await sleep(30);
    expect(model.getBodyModel().getRowCount()).toBeLessThan(200);
    expect(findPopup()).not.toBeNull();
  });

  it('filter menu: a number with decimals survives opening and OK in a locale with a decimal comma', async () => {
    const rows = [{ v: 1.25 }, { v: 1.75 }, { v: 3 }];
    const model = TableFactory.createTableModel({
      rows,
      columnDefs: [ColumnDef.create({ property: 'v', headerLabel: 'V', width: px120 })],
    });
    const { api } = mountTable(model, {
      tableOptions: { columnFilterMenu: true, columnFilter: { locale: 'de-DE' } },
      width: 400,
      height: 260,
    });
    api.setColumnFilter('v', { condition: { operator: 'greaterThan', value: 1.5 } });
    expect(model.getBodyModel().getRowCount()).toBe(2);

    api.showColumnFilterMenu('v');
    const popup = getPopup();
    expect(popup.querySelector<HTMLInputElement>('.ge-table-filter-menu-input')!.value).toBe('1,5');
    okButton(popup).click();
    expect(api.getColumnFilter('v')?.condition).toEqual({ operator: 'greaterThan', value: 1.5 });
    expect(model.getBodyModel().getRowCount()).toBe(2);
  });

  it('filter menu: "between" with one bound filters from / up to that bound', async () => {
    const rows = [{ v: 1 }, { v: 5 }, { v: 9 }];
    const model = TableFactory.createTableModel({
      rows,
      columnDefs: [ColumnDef.create({ property: 'v', headerLabel: 'V', width: px120 })],
    });
    const { api } = mountTable(model, { tableOptions: { columnFilterMenu: true }, width: 400, height: 260 });
    api.showColumnFilterMenu('v');
    const popup = getPopup();
    const select = popup.querySelector<HTMLSelectElement>('.ge-table-filter-menu-select')!;
    select.value = 'between';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    const inputs = popup.querySelectorAll<HTMLInputElement>('.ge-table-filter-menu-input');
    inputs[0].value = '5';
    inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
    okButton(popup).click();
    expect(model.getBodyModel().getRowCount()).toBe(2); // 5 and 9
  });

  it('type detection skips leading blank rows and is renewed when rows are appended', async () => {
    const rows: { id: number; discount: number | null }[] = [];
    for (let i = 0; i < 150; i++) rows.push({ id: i, discount: null });
    for (let i = 0; i < 50; i++) rows.push({ id: 150 + i, discount: i });
    const columnDefs = () => [
      ColumnDef.create({ property: 'id', headerLabel: 'ID', width: px80 }),
      ColumnDef.create({ property: 'discount', headerLabel: 'Discount', width: px120 }),
    ];
    const model = TableFactory.createTableModel({ rows, columnDefs: columnDefs() });
    const { host } = mountTable(model, { tableOptions: { filterRow: { debounce: 0 } }, width: 400, height: 260 });
    typeInInput(getFilterInput(host, 'discount'), '>10');
    expect(model.getBodyModel().getRowCount()).toBe(39); // 11 … 49

    destroyAllTables();
    const emptyModel = TableFactory.createTableModel({ rows: [] as typeof rows, columnDefs: columnDefs() });
    const live = mountTable(emptyModel, { tableOptions: { filterRow: { debounce: 0 } }, width: 400, height: 260 });
    const svc = live.api.getTableScope().columnFilterService;
    expect(svc.getColumnFilterType(1, 'discount')).toBe('text'); // nothing to look at yet
    live.api.appendRows([{ id: 1, discount: 5 }, { id: 2, discount: 50 }]);
    expect(svc.getColumnFilterType(1, 'discount')).toBe('number');
    typeInInput(getFilterInput(live.host, 'discount'), '>10');
    expect(emptyModel.getBodyModel().getRowCount()).toBe(1);
  });

  it('value list: the focused checkbox keeps the focus while the list scrolls', async () => {
    const model = TableFactory.createTableModel({ rows: itemRows(2000), columnDefs: itemColumns() });
    const { api } = mountTable(model, {
      tableOptions: { columnFilterMenu: { showCondition: false } },
      width: 400,
      height: 300,
    });
    api.showColumnFilterMenu('name');
    const popup = getPopup();
    const viewport = popup.querySelector<HTMLElement>('.ge-table-filter-values-viewport')!;
    const checkbox = popup.querySelectorAll<HTMLInputElement>('.ge-table-filter-value-row input')[3];
    const id = checkbox.id;
    checkbox.focus();
    expect(document.activeElement).toBe(checkbox);

    viewport.scrollTop = 30; // the row is still in the rendered window
    viewport.dispatchEvent(new Event('scroll'));
    await nextFrame();
    expect((document.activeElement as HTMLElement).id).toBe(id);

    viewport.scrollTop = 20_000; // the row is gone: the focus stays inside the dialog
    viewport.dispatchEvent(new Event('scroll'));
    await nextFrame();
    expect(popup.contains(document.activeElement)).toBe(true);
    expect(document.activeElement).not.toBe(document.body);
  });

  it('capped value list: unchecking one value hides only that value', async () => {
    const model = TableFactory.createTableModel({ rows: itemRows(20_000), columnDefs: itemColumns() });
    const { api } = mountTable(model, {
      tableOptions: { columnFilterMenu: { maxValues: 500, showCondition: false } },
      width: 400,
      height: 300,
    });
    api.showColumnFilterMenu('name');
    const popup = getPopup();
    popup.querySelector<HTMLInputElement>('.ge-table-filter-value-row input')!.click(); // "Item 00000"
    okButton(popup).click();
    expect(model.getBodyModel().getRowCount()).toBe(19_999);
  });

  it('capped value list with a search: OK keeps exactly the checked values of the search result', async () => {
    const model = TableFactory.createTableModel({ rows: itemRows(20_000), columnDefs: itemColumns() });
    const { api } = mountTable(model, {
      tableOptions: { columnFilterMenu: { maxValues: 500, showCondition: false } },
      width: 400,
      height: 300,
    });
    api.showColumnFilterMenu('name');
    const popup = getPopup();
    const search = popup.querySelector<HTMLInputElement>('.ge-table-filter-menu-search')!;
    search.value = '1999';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    await sleep(160);

    const selectAll = popup.querySelector<HTMLInputElement>('.ge-table-filter-select-all input[type="checkbox"]')!;
    selectAll.click(); // uncheck all found values
    expect(selectAll.checked).toBe(false);
    const labels = Array.from(popup.querySelectorAll<HTMLLabelElement>('.ge-table-filter-value-label'));
    const wanted = labels.slice(0, 2).map(l => l.textContent);
    for (const label of labels.slice(0, 2)) {
      popup.querySelector<HTMLInputElement>(`#${label.getAttribute('for')}`)!.click();
    }
    okButton(popup).click();
    expect(api.getColumnFilter('name')?.values).toEqual(wanted);
    expect(model.getBodyModel().getRowCount()).toBe(2);
  });

  it('value list on a column of Date objects: other columns still list their values, the state can be applied again', async () => {
    const rows = [
      { name: 'a', created: new Date(2026, 0, 15, 10, 30) },
      { name: 'b', created: new Date(2026, 0, 15, 10, 30) },
      { name: 'c', created: new Date(2026, 1, 20, 8, 0) },
    ];
    const model = TableFactory.createTableModel({
      rows,
      columnDefs: [
        ColumnDef.create({ property: 'name', headerLabel: 'Name', width: px120 }),
        ColumnDef.create({ property: 'created', headerLabel: 'Created', width: px120 }),
      ],
    });
    const { api } = mountTable(model, { tableOptions: { columnFilterMenu: true }, width: 400, height: 260 });
    api.setColumnFilter('created', { values: [rows[0].created] });
    expect(model.getBodyModel().getRowCount()).toBe(2);

    const svc = api.getTableScope().columnFilterService;
    expect(svc.collectColumnDistinctValues('name').items.map(i => i.value)).toEqual(['a', 'b']);

    const state = JSON.parse(JSON.stringify(api.getState(['filters'])));
    api.clearColumnFilters();
    expect(model.getBodyModel().getRowCount()).toBe(3);
    api.applyState(state, ['filters']);
    expect(model.getBodyModel().getRowCount()).toBe(2);
  });
});
