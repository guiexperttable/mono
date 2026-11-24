import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  AreaModel,
  AreaModelCellGroups,
  AutoRestoreOptions,
  CheckboxColumnDef,
  ColumnDef,
  EventAdapter,
  FocusModel,
  GeFilterEvent,
  RowNumberColumnDef,
  SelectionModel,
  Size,
  TableFactory,
  TableOptions,
  TrueFn,
  px100,
  px120,
  px80,
  type CellGroupIf,
  type ColumnDefIf,
  type TableOptionsIf,
} from '@guiexpert/table';
import { axeViolations } from '../../../../test-utils/axe';
import { memoryStorage } from '../../../../test-utils/memory-storage';
import { destroyAllTables, mountTable, nextFrame } from '../../../../test-utils/mount-table';
import { countRenders } from '../../../../test-utils/perf-counters';

interface Account {
  id: number;
  company: string;
  region: string;
  seats: number;
  mrr: number;
  created: string;
  active: boolean;
}

function sampleAccounts(): Account[] {
  return [
    { id: 1, company: 'Acme GmbH', region: 'EMEA', seats: 50, mrr: 5000.5, created: '2026-01-15', active: true },
    { id: 2, company: 'Beacon Inc', region: 'AMER', seats: 12, mrr: 600.25, created: '2026-02-20', active: true },
    { id: 3, company: 'Cobalt AG', region: 'EMEA', seats: 120, mrr: 18000, created: '2026-03-10', active: true },
    { id: 4, company: 'Delta Ltd', region: 'APAC', seats: 35, mrr: 3500, created: '2026-04-05', active: false },
    { id: 5, company: 'Echo SAS', region: 'EMEA', seats: 8, mrr: 400, created: '2026-05-18', active: false },
  ];
}

function accountColumns(): ColumnDefIf[] {
  return [
    ColumnDef.create({ property: 'id', headerLabel: 'ID', width: px80, sortable: TrueFn }),
    ColumnDef.create({ property: 'company', headerLabel: 'Company', width: px120, sortable: TrueFn }),
    ColumnDef.create({ property: 'region', headerLabel: 'Region', width: px100, sortable: TrueFn }),
    ColumnDef.create({ property: 'seats', headerLabel: 'Seats', width: px80, sortable: TrueFn }),
    ColumnDef.create({ property: 'mrr', headerLabel: 'MRR', width: px100, sortable: TrueFn }),
    ColumnDef.create({ property: 'created', headerLabel: 'Created', width: px120, sortable: TrueFn }),
    ColumnDef.create({ property: 'active', headerLabel: 'Active', width: px80, sortable: TrueFn }),
  ];
}

function getFilterInput(host: HTMLElement, property: string): HTMLInputElement {
  const el = host.querySelector<HTMLInputElement>(`.ge-table-filter-cell[data-col-property="${property}"] input.ge-table-filter-input`);
  if (!el) throw new Error(`Filter input for "${property}" not found`);
  return el;
}

function getClearButton(host: HTMLElement, property: string): HTMLButtonElement {
  const el = host.querySelector<HTMLButtonElement>(`.ge-table-filter-cell[data-col-property="${property}"] button.ge-table-filter-clear`);
  if (!el) throw new Error(`Clear button for "${property}" not found`);
  return el;
}

function typeInInput(input: HTMLInputElement, value: string): void {
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

afterEach(() => {
  destroyAllTables();
});

describe('Filter row (Etappe B, real browser)', () => {

  it('without filterRow option the DOM, padding.top and state remain bit-identical', async () => {
    const model = TableFactory.createTableModel({ rows: sampleAccounts(), columnDefs: accountColumns() });
    const { host, api } = mountTable(model, { width: 720, height: 320 });

    expect(host.querySelector('.ge-table-filter-row-layer')).toBeNull();
    expect(model.getPadding().top).toBe(34);
    expect(api.isFilterRowVisible()).toBe(false);
    expect(host.getAttribute('aria-rowcount')).toBe('6'); // 1 header + 5 body
    expect(host.getAttribute('aria-owns')).not.toContain('-rg-filter-');
    expect(api.getState().filterRowVisible).toBeUndefined();
  });

  it('debounced typing, Enter (IME-safe), Escape and Clear button filter rows cleanly', async () => {
    const events: GeFilterEvent[] = [];
    const eventListener = new EventAdapter();
    eventListener.onFilterChanged = (e) => events.push(e);

    const model = TableFactory.createTableModel({ rows: sampleAccounts(), columnDefs: accountColumns() });
    const { host, api } = mountTable(model, {
      tableOptions: { filterRow: { debounce: 60 } },
      eventListener,
      width: 720,
      height: 320,
    });

    expect(api.isFilterRowVisible()).toBe(true);
    expect(model.getPadding().top).toBe(68); // 34 header + 34 filterRow
    expect(host.getAttribute('aria-rowcount')).toBe('7'); // 1 header + 1 filter + 5 body

    const regionInput = getFilterInput(host, 'region');
    regionInput.focus();
    typeInInput(regionInput, 'emea');
    // Debounce has not fired yet
    expect(model.getBodyModel().getRowCount()).toBe(5);
    await sleep(90);
    expect(model.getBodyModel().getRowCount()).toBe(3);
    expect(events[events.length - 1]?.source).toBe('row');
    expect(events[events.length - 1]?.property).toBe('region');

    // Clear button appears and clears filter
    const clearBtn = getClearButton(host, 'region');
    expect(clearBtn.hidden).toBe(false);
    clearBtn.click();
    expect(regionInput.value).toBe('');
    expect(model.getBodyModel().getRowCount()).toBe(5);
    expect(clearBtn.hidden).toBe(true);

    // Enter applies immediately without waiting for debounce, but ignores isComposing IME events
    typeInInput(regionInput, 'apac');
    const imeEnter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    Object.defineProperty(imeEnter, 'isComposing', { value: true });
    regionInput.dispatchEvent(imeEnter);
    expect(model.getBodyModel().getRowCount()).toBe(5); // ignored while composing!

    regionInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    expect(model.getBodyModel().getRowCount()).toBe(1);

    // Escape clears active input & filter; second Escape returns focus to header
    regionInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    expect(regionInput.value).toBe('');
    expect(model.getBodyModel().getRowCount()).toBe(5);
    expect(document.activeElement).toBe(regionInput);

    regionInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(host);
  });

  it('supports number (>100, 10..60, locale), date, boolean syntax and skips non-filterable columns', async () => {
    const cols: ColumnDefIf[] = [
      new RowNumberColumnDef(),
      new CheckboxColumnDef(),
      ColumnDef.create({ property: 'company', headerLabel: 'Company', width: px120, filter: false }),
      ColumnDef.create({ property: 'seats', headerLabel: 'Seats', width: px80 }),
      ColumnDef.create({ property: 'mrr', headerLabel: 'MRR', width: px100 }),
      ColumnDef.create({ property: 'created', headerLabel: 'Created', width: px120 }),
      ColumnDef.create({ property: 'active', headerLabel: 'Active', width: px80 }),
    ];
    const model = TableFactory.createTableModel({ rows: sampleAccounts(), columnDefs: cols });
    const { host } = mountTable(model, {
      tableOptions: { filterRow: { debounce: 0 }, columnFilter: { locale: 'de-DE' } },
      width: 720,
      height: 320,
    });

    // RowNumber, Checkbox, and filter: false have disabled cells with no input
    expect(host.querySelector('.ge-table-filter-cell[data-col-property="company"] input')).toBeNull();
    expect(host.querySelectorAll('.ge-table-filter-cell-disabled').length).toBe(3);

    // Number range 10..60
    const seatsInput = getFilterInput(host, 'seats');
    typeInInput(seatsInput, '10..60');
    expect(model.getBodyModel().getRowCount()).toBe(3); // 50, 12, 35

    // Locale number > 3500,5 (de-DE comma decimal)
    typeInInput(seatsInput, '');
    const mrrInput = getFilterInput(host, 'mrr');
    typeInInput(mrrInput, '> 3500,5');
    expect(model.getBodyModel().getRowCount()).toBe(2); // 5000.5, 18000

    // Date range
    typeInInput(mrrInput, '');
    const createdInput = getFilterInput(host, 'created');
    typeInInput(createdInput, '2026-02-01..2026-04-30');
    expect(model.getBodyModel().getRowCount()).toBe(3); // Feb, Mar, Apr

    // Boolean
    typeInInput(createdInput, '');
    const activeInput = getFilterInput(host, 'active');
    typeInInput(activeInput, 'false');
    expect(model.getBodyModel().getRowCount()).toBe(2);
  });

  it('preserves input DOM identity, focus and caret across appendRows (16 ms), sorting, resize and reorder', async () => {
    const model = TableFactory.createTableModel({ rows: sampleAccounts(), columnDefs: accountColumns() });
    const { host, api, scope } = mountTable(model, {
      tableOptions: { filterRow: { debounce: 0 } },
      width: 720,
      height: 320,
    });

    const companyInput = getFilterInput(host, 'company');
    companyInput.focus();
    typeInInput(companyInput, 'acme');
    companyInput.setSelectionRange(2, 2);
    expect(document.activeElement).toBe(companyInput);

    // Observe DOM mutations on filter row layer: no input should be detached/rebuilt while typing or appending
    let inputMutations = 0;
    const observer = new MutationObserver((records) => {
      for (const r of records) {
        r.addedNodes.forEach(n => { if (n instanceof Element && (n.matches('input') || n.querySelector('input'))) inputMutations++; });
        r.removedNodes.forEach(n => { if (n instanceof Element && (n.matches('input') || n.querySelector('input'))) inputMutations++; });
      }
    });
    const layer = host.querySelector('.ge-table-filter-row-layer')!;
    observer.observe(layer, { childList: true, subtree: true });

    // Rapid 16 ms live append loop
    for (let i = 0; i < 5; i++) {
      api.appendRows([
        { id: 100 + i, company: `Acme Live ${i}`, region: 'EMEA', seats: 10 + i, mrr: 1000, created: '2026-06-01', active: true },
      ]);
      await sleep(16);
      expect(document.activeElement).toBe(companyInput);
      expect(getFilterInput(host, 'company')).toBe(companyInput);
      expect(companyInput.selectionStart).toBe(2);
    }
    expect(model.getBodyModel().getRowCount()).toBe(6); // original Acme + 5 live Acme

    // Sorting preserves focus & DOM node
    api.sortByColumn('seats', 'desc');
    await nextFrame();
    expect(document.activeElement).toBe(companyInput);
    expect(getFilterInput(host, 'company')).toBe(companyInput);

    // Column resize updates cell width and keeps DOM node + focus
    api.setColumnWidth(1, 180);
    api.repaint();
    await nextFrame();
    expect(document.activeElement).toBe(companyInput);
    expect(getFilterInput(host, 'company')).toBe(companyInput);
    const cellRect = companyInput.closest('.ge-table-filter-cell')!.getBoundingClientRect();
    expect(Math.round(cellRect.width)).toBe(180);

    // Column reorder moves the input to the new position and keeps DOM node + focus
    model.changeColumnOrder(1, 3);
    api.repaint();
    await nextFrame();
    expect(document.activeElement).toBe(companyInput);
    expect(getFilterInput(host, 'company')).toBe(companyInput);
    const movedHeader = host.querySelector<HTMLElement>('.ge-table-header .ge-table-col-div[data-col-index="3"]')!;
    const movedFilter = companyInput.closest<HTMLElement>('.ge-table-filter-cell')!;
    expect(Math.abs(movedHeader.getBoundingClientRect().left - movedFilter.getBoundingClientRect().left)).toBeLessThanOrEqual(1);

    observer.disconnect();
    expect(inputMutations).toBe(0);
  });

  it('virtualizes 100 columns and parks a focused scrolled-out input via clip-path without losing focus', async () => {
    const cols: ColumnDefIf[] = Array.from({ length: 100 }, (_, i) =>
      ColumnDef.create({ property: `c${i}`, headerLabel: `Col ${i}`, width: px100 }),
    );
    const rows = Array.from({ length: 10 }, (_, r) => {
      const obj: Record<string, string | number> = {};
      for (let c = 0; c < 100; c++) obj[`c${c}`] = `r${r}_c${c}`;
      return obj;
    });
    const model = TableFactory.createTableModel({ rows, columnDefs: cols });
    const { host, api } = mountTable(model, {
      tableOptions: { filterRow: { debounce: 0 } },
      width: 500,
      height: 260,
    });

    // Only visible columns are mounted (far fewer than 100)
    const mountedCount = host.querySelectorAll('.ge-table-filter-cell').length;
    expect(mountedCount).toBeGreaterThan(0);
    expect(mountedCount).toBeLessThan(15);

    // Focus c0, type a value, then scroll far right so c0 is out of view
    const c0Input = getFilterInput(host, 'c0');
    c0Input.focus();
    typeInInput(c0Input, 'r3_');
    c0Input.setSelectionRange(2, 2);
    expect(model.getBodyModel().getRowCount()).toBe(1);

    api.scrollToPixel(3000, 0);
    await nextFrame();

    // c0 stays in DOM, parked with clip-path, keeping focus and caret!
    expect(document.activeElement).toBe(c0Input);
    expect(c0Input.selectionStart).toBe(2);
    const c0Cell = c0Input.closest<HTMLElement>('.ge-table-filter-cell')!;
    expect(c0Cell.style.clipPath).toContain('inset(100%)');

    // Scroll back to 0: c0 is un-parked and value is intact
    api.scrollToPixel(0, 0);
    await nextFrame();
    expect(c0Cell.style.clipPath).toBe('');
    expect(getFilterInput(host, 'c0').value).toBe('r3_');
  });

  it('isolates keyboard and mouse events inside filter inputs from table editor, selection and sorting', async () => {
    const selectionModel = new SelectionModel('range', 'multi');
    const model = TableFactory.createTableModel({ rows: sampleAccounts(), columnDefs: accountColumns() });
    const { host, scope } = mountTable(model, {
      tableOptions: {
        filterRow: { debounce: 0 },
        editing: { defaultEditable: true },
        getSelectionModel: () => selectionModel,
      },
      width: 720,
      height: 320,
    });

    const input = getFilterInput(host, 'company');
    input.focus();
    input.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 }));
    input.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, button: 0 }));
    input.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    input.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));

    // Clicking/dblclicking input must NOT sort or select cells
    expect(model.getColumnDef(1)?.sortState).toBeFalsy();
    expect(selectionModel.getRanges().length).toBe(0);

    // Typing & Ctrl+A inside input must NOT open cell editor or select all table cells
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', ctrlKey: true, bubbles: true }));
    expect(scope.isEditing()).toBe(false);
    expect(selectionModel.getRanges().length).toBe(0);
  });

  it('setFilterRowVisible toggles visibility in 1 render while keeping filters, and setHeaderVisible(false) hides it', async () => {
    const model = TableFactory.createTableModel({ rows: sampleAccounts(), columnDefs: accountColumns() });
    const { host, api, scope } = mountTable(model, {
      tableOptions: { filterRow: true },
      width: 720,
      height: 320,
    });

    api.setColumnFilter('region', { condition: { operator: 'equals', value: 'EMEA' } });
    expect(model.getBodyModel().getRowCount()).toBe(3);
    expect(getFilterInput(host, 'region').value).toBe('= EMEA');

    const renders = countRenders(scope);
    api.setFilterRowVisible(false);
    expect(renders.count()).toBe(1);
    expect(api.isFilterRowVisible()).toBe(false);
    expect(model.getPadding().top).toBe(34);
    expect(model.getBodyModel().getRowCount()).toBe(3); // filter stays active!
    expect(host.getAttribute('aria-rowcount')).toBe('4'); // 1 header + 3 body

    api.setFilterRowVisible(true);
    expect(api.isFilterRowVisible()).toBe(true);
    expect(model.getPadding().top).toBe(68);
    expect(getFilterInput(host, 'region').value).toBe('= EMEA');

    // Hiding header hides the filter row too
    api.setHeaderVisible(false);
    expect(api.isFilterRowVisible()).toBe(false);
    expect(model.getPadding().top).toBe(0);
    expect(host.querySelector<HTMLElement>('.ge-table-filter-row-layer')!.style.display).toBe('none');

    api.setHeaderVisible(true);
    expect(api.isFilterRowVisible()).toBe(true);
    expect(model.getPadding().top).toBe(68);
  });

  it('persists and restores filterRowVisible alongside filters in TableState', async () => {
    const storage = memoryStorage();
    const makeOpts = (): Partial<TableOptionsIf> => ({
      filterRow: true,
      autoRestoreOptions: {
        ...new AutoRestoreOptions(),
        getStorageKeyFn: () => 'filter-row-state-test',
        storage,
        autoRestoreFilterState: true,
      },
      stateChangedDebounceDelay: 10,
    });

    const m1 = TableFactory.createTableModel({ rows: sampleAccounts(), columnDefs: accountColumns() });
    const t1 = mountTable(m1, { tableOptions: makeOpts(), width: 720, height: 320 });
    t1.api.setColumnFilter('region', { condition: { operator: 'equals', value: 'EMEA' } });
    t1.api.setFilterRowVisible(false);
    expect(t1.api.getState().filterRowVisible).toBe(false);
    t1.scope.destroy(); // flushes storage

    const m2 = TableFactory.createTableModel({ rows: sampleAccounts(), columnDefs: accountColumns() });
    const t2 = mountTable(m2, { tableOptions: makeOpts(), width: 720, height: 320 });
    expect(t2.api.isFilterRowVisible()).toBe(false);
    expect(m2.getBodyModel().getRowCount()).toBe(3);

    t2.api.applyState({ filterRowVisible: true, filters: {} });
    expect(t2.api.isFilterRowVisible()).toBe(true);
    expect(m2.getBodyModel().getRowCount()).toBe(5);
  });

  it('shows readonly "(N values)" display for set filters and allows clearing via Clear button or Escape', async () => {
    const model = TableFactory.createTableModel({ rows: sampleAccounts(), columnDefs: accountColumns() });
    const { host, api } = mountTable(model, {
      tableOptions: { filterRow: true },
      width: 720,
      height: 320,
    });

    api.setColumnFilter('region', { values: ['EMEA', 'APAC'] });
    const regionInput = getFilterInput(host, 'region');
    expect(regionInput.readOnly).toBe(true);
    expect(regionInput.value).toBe('(2 values)');
    expect(regionInput.classList.contains('ge-table-filter-input-readonly')).toBe(true);
    expect(getClearButton(host, 'region').hidden).toBe(false);

    // Clearing via × restores editable input
    getClearButton(host, 'region').click();
    expect(regionInput.readOnly).toBe(false);
    expect(regionInput.value).toBe('');
    expect(model.getBodyModel().getRowCount()).toBe(5);
  });

  it('aligns filter cells with header cells in RTL and with fixed west/east columns and header groups', async () => {
    // 1. RTL with fixed west (1) and fixed east (1)
    const modelRtl = TableFactory.createTableModel({
      rows: sampleAccounts(),
      columnDefs: accountColumns(),
      fixedLeftColumnCount: 1,
      fixedRightColumnCount: 1,
    });
    const rtl = mountTable(modelRtl, {
      tableOptions: { filterRow: true, direction: 'rtl' },
      width: 520,
      height: 280,
    });

    for (const [colIdx, prop] of [[0, 'id'], [1, 'company'], [6, 'active']] as const) {
      const headerCell = rtl.host.querySelector<HTMLElement>(`.ge-table-header .ge-table-col-div[data-col-index="${colIdx}"]`);
      const filterCell = rtl.host.querySelector<HTMLElement>(`.ge-table-filter-cell[data-col-property="${prop}"]`);
      expect(headerCell).not.toBeNull();
      expect(filterCell).not.toBeNull();
      const hr = headerCell!.getBoundingClientRect();
      const fr = filterCell!.getBoundingClientRect();
      expect(Math.abs(hr.left - fr.left)).toBeLessThanOrEqual(1);
      expect(Math.abs(hr.width - fr.width)).toBeLessThanOrEqual(1);
      expect(Math.abs(fr.top - hr.bottom)).toBeLessThanOrEqual(1);
    }

    // 2. Multi-row grouped header (2 header rows = 68 px)
    const groups: CellGroupIf[] = [
      {
        data: 'Account',
        children: [
          { data: 'ID', property: 'id' },
          { data: 'Company', property: 'company' },
        ],
      },
      {
        data: 'Metrics',
        children: [
          { data: 'Seats', property: 'seats' },
          { data: 'MRR', property: 'mrr' },
        ],
      },
    ];
    const cols = accountColumns().slice(0, 4);
    const headerModel = new AreaModelCellGroups('header', groups, cols, 34);
    const modelGrouped = TableFactory.createTableModel({
      rows: sampleAccounts(),
      columnDefs: cols,
      headerAreaModel: headerModel,
    });
    const grouped = mountTable(modelGrouped, {
      tableOptions: { filterRow: true },
      width: 500,
      height: 280,
    });
    expect(modelGrouped.getPadding().top).toBe(102); // 2 * 34 header + 34 filterRow
    const filterRow = grouped.host.querySelector<HTMLElement>('.ge-table-filter-side-center .ge-table-filter-row')!;
    expect(filterRow.getAttribute('aria-rowindex')).toBe('3');
    const firstBodyRow = grouped.host.querySelector<HTMLElement>('.ge-table-body-center .ge-table-row-div[data-row-index="0"]')!;
    expect(firstBodyRow.getAttribute('aria-rowindex')).toBe('4');
  });

  it('supports keyboard navigation (1 Tab stop, Header Down -> Filter -> Up/Down/Tab, Ctrl+Shift+F)', async () => {
    const cols: ColumnDefIf[] = [
      new RowNumberColumnDef(),
      ColumnDef.create({ property: 'company', headerLabel: 'Company', width: px120 }),
      ColumnDef.create({ property: 'region', headerLabel: 'Region', width: px100 }),
    ];
    const fm = new FocusModel('cell');
    const model = TableFactory.createTableModel({ rows: sampleAccounts(), columnDefs: cols });
    const { host, scope } = mountTable(model, {
      tableOptions: { filterRow: true, getFocusModel: () => fm },
      width: 500,
      height: 260,
    });

    // Table keeps 1 Tab stop: all inputs & buttons inside filter row have tabindex="-1"
    const tabbables = host.querySelectorAll('.ge-table-filter-row-layer [tabindex]:not([tabindex="-1"])');
    expect(tabbables.length).toBe(0);

    // Trigger FOCUS_COLUMN_FILTER (Ctrl+Shift+F)
    host.focus();
    const consumed = scope.onActionTriggered('FOCUS_COLUMN_FILTER');
    expect(consumed).toBe(true);
    const companyInput = getFilterInput(host, 'company');
    const regionInput = getFilterInput(host, 'region');
    expect(document.activeElement).toBe(companyInput);

    // Tab moves to next filterable column (region)
    const tabNext = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    companyInput.dispatchEvent(tabNext);
    expect(tabNext.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(regionInput);

    // Tab on the LAST filterable column does NOT preventDefault (no keyboard trap!)
    const tabOut = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    regionInput.dispatchEvent(tabOut);
    expect(tabOut.defaultPrevented).toBe(false);

    // Shift+Tab moves back to company
    const shiftTab = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true });
    regionInput.dispatchEvent(shiftTab);
    expect(shiftTab.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(companyInput);

    // ArrowUp returns to header cell (host focused, headerFocus set), ArrowDown re-enters filter input
    companyInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(host);
    expect(scope.getHeaderFocus()).toEqual([0, 1]);

    scope.onActionTriggered('NAVIGATE_DOWN');
    expect(document.activeElement).toBe(companyInput);

    // ArrowDown from filter input moves to body row 0
    companyInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(host);
    expect(scope.getHeaderFocus()).toBeUndefined();
    expect(fm.getFocus()).toEqual([0, 1]);
  });

  it('handles narrow columns, XSS payloads safely, passes axe with 0 violations, and cleans up timers on destroy()', async () => {
    const xss = '<img src=x onerror="window.__geFilterRowXss=1">';
    (window as unknown as Record<string, unknown>)['__geFilterRowXss'] = 0;

    const cols: ColumnDefIf[] = [
      ColumnDef.create({ property: 'id', headerLabel: 'ID', width: new Size(34, 'px') }), // narrow < 44
      ColumnDef.create({ property: 'company', headerLabel: xss, width: px120 }),
      ColumnDef.create({ property: 'region', headerLabel: 'Region', width: px100 }),
    ];
    const rows = [
      { id: 1, company: xss, region: 'EMEA' },
      { id: 2, company: 'Safe Co', region: 'AMER' },
    ];
    const events: GeFilterEvent[] = [];
    const eventListener = new EventAdapter();
    eventListener.onFilterChanged = (e) => events.push(e);

    const model = TableFactory.createTableModel({ rows, columnDefs: cols, fixedLeftColumnCount: 1 });
    const { host, scope, api } = mountTable(model, {
      tableOptions: {
        ariaLabel: 'Accounts table',
        filterRow: { debounce: 80, minInputWidthInPx: 44 },
      },
      eventListener,
      width: 420,
      height: 240,
    });

    // Narrow column renders narrow class + compact button
    const narrowCell = host.querySelector<HTMLElement>('.ge-table-filter-cell[data-col-property="id"]')!;
    expect(narrowCell.classList.contains('ge-table-filter-cell-narrow')).toBe(true);
    const narrowBtn = narrowCell.querySelector<HTMLButtonElement>('.ge-table-filter-narrow-btn')!;
    narrowBtn.click();
    expect(document.activeElement).toBe(getFilterInput(host, 'id'));

    // XSS check in label, cell and filter input
    const companyInput = getFilterInput(host, 'company');
    expect(companyInput.getAttribute('aria-label')).toContain(xss);
    typeInInput(companyInput, xss);
    companyInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect((window as unknown as Record<string, unknown>)['__geFilterRowXss']).toBe(0);
    expect(model.getBodyModel().getRowCount()).toBe(1);

    // axe accessibility check (with active filter + clear button + fixed west + narrow column)
    const violations = await axeViolations(host);
    expect(violations).toEqual([]);

    // Pending debounce timer is cancelled on destroy()
    api.clearColumnFilters();
    const countBefore = events.length;
    typeInInput(getFilterInput(host, 'region'), 'emea');
    scope.destroy();
    await sleep(120);
    expect(events.length).toBe(countBefore);
    expect(host.querySelector('.ge-table-filter-row-layer')).toBeNull();
  });

  it('non-filterable body: warns once and hides filter row when managed, shows filter row when managed: false', async () => {
    class StaticBody extends AreaModel {
      override isFilterable(): boolean { return false; }
      override getRowCount(): number { return 2; }
      override getValueAt(r: number, c: number): unknown { return `R${r}C${c}`; }
    }
    const cols = [ColumnDef.create({ property: 'a', headerLabel: 'A', width: px100 })];

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const mManaged = TableFactory.createTableModel({ bodyAreaModel: new StaticBody(), columnDefs: cols });
      const t1 = mountTable(mManaged, { tableOptions: { filterRow: true }, width: 300, height: 200 });
      expect(t1.api.isFilterRowVisible()).toBe(false);
      expect(mManaged.getPadding().top).toBe(34);
      expect(warn).toHaveBeenCalledTimes(1);
    } finally {
      warn.mockRestore();
    }

    // Server-side mode (managed: false): filter row works and emits onFilterChanged
    const events: GeFilterEvent[] = [];
    const eventListener = new EventAdapter();
    eventListener.onFilterChanged = (e) => events.push(e);
    const mServer = TableFactory.createTableModel({ bodyAreaModel: new StaticBody(), columnDefs: cols });
    const t2 = mountTable(mServer, {
      tableOptions: {
        filterRow: { debounce: 0 },
        columnFilter: { managed: false },
      },
      eventListener,
      width: 300,
      height: 200,
    });

    expect(t2.api.isFilterRowVisible()).toBe(true);
    typeInInput(getFilterInput(t2.host, 'a'), 'hello');
    expect(events.length).toBe(1);
    expect(events[0].filters['a']?.condition?.value).toBe('hello');
    expect(events[0].source).toBe('row');
  });
});
