import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  AreaModel,
  CheckboxColumnDef,
  ColumnDef,
  EventAdapter,
  GeFilterEvent,
  RowNumberColumnDef,
  TableFactory,
  TableOptions,
  TrueFn,
  px100,
  px120,
  px80,
  type ColumnDefIf,
  type ColumnFilterValueItemIf,
} from '@guiexpert/table';
import { axeViolations } from '../../../../test-utils/axe';
import { destroyAllTables, mountTable, nextFrame } from '../../../../test-utils/mount-table';

interface Account {
  id: number;
  company: string;
  region: string;
  plan: string;
  seats: number;
  active: boolean;
}

function sampleAccounts(): Account[] {
  return [
    { id: 1, company: 'Acme GmbH', region: 'EMEA', plan: 'Pro', seats: 50, active: true },
    { id: 2, company: 'Beacon Inc', region: 'AMER', plan: 'Starter', seats: 12, active: true },
    { id: 3, company: 'Cobalt AG', region: 'EMEA', plan: 'Enterprise', seats: 120, active: true },
    { id: 4, company: 'Delta Ltd', region: 'APAC', plan: 'Pro', seats: 35, active: false },
    { id: 5, company: 'Echo SAS', region: 'EMEA', plan: 'Starter', seats: 8, active: false },
  ];
}

function accountColumns(): ColumnDefIf[] {
  return [
    ColumnDef.create({ property: 'id', headerLabel: 'ID', width: px80, sortable: TrueFn }),
    ColumnDef.create({ property: 'company', headerLabel: 'Company', width: px120, sortable: TrueFn }),
    ColumnDef.create({ property: 'region', headerLabel: 'Region', width: px100, sortable: TrueFn }),
    ColumnDef.create({ property: 'plan', headerLabel: 'Plan', width: px100, sortable: TrueFn }),
    ColumnDef.create({ property: 'seats', headerLabel: 'Seats', width: px80, sortable: TrueFn }),
    ColumnDef.create({ property: 'active', headerLabel: 'Active', width: px80, sortable: TrueFn }),
  ];
}

function getFunnelButton(host: HTMLElement, colIndex: number): HTMLButtonElement {
  const btn = host.querySelector<HTMLButtonElement>(`.ge-table-header button.ge-table-column-filter-btn[data-col-index="${colIndex}"]`);
  if (!btn) throw new Error(`Funnel button for column ${colIndex} not found`);
  return btn;
}

function findPopup(host: HTMLElement): HTMLElement | null {
  return host.querySelector<HTMLElement>('.ge-table-filter-popup') ?? document.body.querySelector<HTMLElement>('.ge-table-filter-popup');
}

function getPopup(host: HTMLElement): HTMLElement {
  const el = findPopup(host);
  if (!el) throw new Error('Filter menu popup not found');
  return el;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

afterEach(() => {
  destroyAllTables();
});

describe('Column filter menu (Etappe C, real browser)', () => {

  it('without columnFilterMenu no funnel buttons are rendered (bit-identical)', () => {
    const model = TableFactory.createTableModel({ rows: sampleAccounts(), columnDefs: accountColumns() });
    const { host } = mountTable(model, { width: 640, height: 300 });
    expect(host.querySelectorAll('.ge-table-column-filter-btn').length).toBe(0);
  });

  it('renders funnel buttons only on filterable columns and clicking/dblclicking does not sort or drag', async () => {
    const cols: ColumnDefIf[] = [
      new RowNumberColumnDef(),
      new CheckboxColumnDef(),
      ColumnDef.create({ property: 'company', headerLabel: 'Company', width: px120, filter: false, sortable: TrueFn }),
      ColumnDef.create({ property: 'region', headerLabel: 'Region', width: px100, sortable: TrueFn }),
      ColumnDef.create({ property: 'plan', headerLabel: 'Plan', width: px100, sortable: TrueFn }),
    ];
    const model = TableFactory.createTableModel({ rows: sampleAccounts(), columnDefs: cols });
    const { host } = mountTable(model, {
      tableOptions: { columnFilterMenu: true },
      width: 640,
      height: 300,
    });

    // Only region (col 3) and plan (col 4) have funnel buttons
    expect(host.querySelectorAll('.ge-table-column-filter-btn').length).toBe(2);
    const regionBtn = getFunnelButton(host, 3);
    expect(regionBtn.getAttribute('aria-haspopup')).toBe('dialog');
    expect(regionBtn.getAttribute('aria-expanded')).toBe('false');

    // Click opens menu, does not sort
    regionBtn.click();
    expect(regionBtn.getAttribute('aria-expanded')).toBe('true');
    const popup = getPopup(host);
    expect(popup.getAttribute('role')).toBe('dialog');
    expect(popup.getAttribute('aria-label')).toBe('Filter Region');
    expect(model.getColumnDef(3)?.sortState).toBeFalsy();

    // Double click on funnel button must NOT sort
    regionBtn.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }));
    expect(model.getColumnDef(3)?.sortState).toBeFalsy();

    // Clicking funnel button again toggles it closed
    regionBtn.click();
    expect(findPopup(host)).toBeNull();
    expect(regionBtn.getAttribute('aria-expanded')).toBe('false');
  });

  it('value checklist, (Select all) tri-state, OK/Cancel/Clear and sync with filter row', async () => {
    const events: GeFilterEvent[] = [];
    const eventListener = new EventAdapter();
    eventListener.onFilterChanged = (e) => events.push(e);

    const model = TableFactory.createTableModel({ rows: sampleAccounts(), columnDefs: accountColumns() });
    const { host, api } = mountTable(model, {
      tableOptions: { filterRow: true, columnFilterMenu: true },
      eventListener,
      width: 640,
      height: 320,
    });

    // Open Region (col 2) menu
    getFunnelButton(host, 2).click();
    let popup = getPopup(host);

    const selectAll = popup.querySelector<HTMLInputElement>('.ge-table-filter-select-all input[type="checkbox"]')!;
    expect(selectAll.checked).toBe(true);
    expect(selectAll.indeterminate).toBe(false);

    // Uncheck AMER
    const labels = Array.from(popup.querySelectorAll<HTMLLabelElement>('.ge-table-filter-value-label'));
    expect(labels.map(l => l.textContent)).toEqual(['AMER', 'APAC', 'EMEA']);
    const amerCb = popup.querySelector<HTMLInputElement>(`#${labels[0].getAttribute('for')}`)!;
    amerCb.click();
    expect(selectAll.indeterminate).toBe(true);

    // Cancel discards draft
    popup.querySelector<HTMLButtonElement>('.ge-table-filter-btn-cancel')!.click();
    expect(model.getBodyModel().getRowCount()).toBe(5);
    expect(events.length).toBe(0);

    // Re-open, uncheck AMER and click OK
    getFunnelButton(host, 2).click();
    popup = getPopup(host);
    const amerLabel = Array.from(popup.querySelectorAll<HTMLLabelElement>('.ge-table-filter-value-label'))[0];
    popup.querySelector<HTMLInputElement>(`#${amerLabel.getAttribute('for')}`)!.click();
    popup.querySelector<HTMLButtonElement>('.ge-table-filter-btn-ok')!.click();

    expect(model.getBodyModel().getRowCount()).toBe(4); // EMEA (3) + APAC (1)
    expect(events.length).toBe(1);
    expect(events[0].source).toBe('menu');
    expect(events[0].property).toBe('region');

    // Header funnel button is highlighted as active and filter row shows "(2 values)"
    const activeBtn = getFunnelButton(host, 2);
    expect(activeBtn.classList.contains('ge-table-column-filter-active')).toBe(true);
    expect(activeBtn.getAttribute('aria-label')).toBe('Filter menu for Region (active)');
    const rowInput = host.querySelector<HTMLInputElement>('.ge-table-filter-cell[data-col-property="region"] input')!;
    expect(rowInput.readOnly).toBe(true);
    expect(rowInput.value).toBe('(2 values)');

    // Re-open and click Clear
    api.showColumnFilterMenu('region');
    popup = getPopup(host);
    popup.querySelector<HTMLButtonElement>('.ge-table-filter-btn-clear')!.click();
    expect(model.getBodyModel().getRowCount()).toBe(5);
    expect(getFunnelButton(host, 2).classList.contains('ge-table-column-filter-active')).toBe(false);
    expect(rowInput.readOnly).toBe(false);
    expect(rowInput.value).toBe('');
  });

  it('supports condition operators (between with 2 inputs, blank with 0 inputs) and applyOnChange', async () => {
    const model = TableFactory.createTableModel({ rows: sampleAccounts(), columnDefs: accountColumns() });
    const { host, api } = mountTable(model, {
      tableOptions: { columnFilterMenu: { applyOnChange: true } },
      width: 640,
      height: 320,
    });

    // Open Seats (col 4, number)
    expect(api.showColumnFilterMenu('seats')).toBe(true);
    const popup = getPopup(host);
    const select = popup.querySelector<HTMLSelectElement>('.ge-table-filter-menu-select')!;
    const inputs = popup.querySelectorAll<HTMLInputElement>('.ge-table-filter-menu-input');
    expect(inputs.length).toBe(2);
    expect(inputs[0].hidden).toBe(false);
    expect(inputs[1].hidden).toBe(true);

    // Switch to "between": both inputs become visible
    select.value = 'between';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    expect(inputs[0].hidden).toBe(false);
    expect(inputs[1].hidden).toBe(false);

    // applyOnChange filters immediately as values are entered
    inputs[0].value = '10';
    inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
    inputs[1].value = '60';
    inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
    expect(model.getBodyModel().getRowCount()).toBe(3); // 50, 12, 35

    // Switch to "blank": both inputs hide
    select.value = 'blank';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    expect(inputs[0].hidden).toBe(true);
    expect(inputs[1].hidden).toBe(true);
    expect(model.getBodyModel().getRowCount()).toBe(0);

    api.hideColumnFilterMenu();
    expect(findPopup(host)).toBeNull();
  });

  it('cascades distinct values across columns (Excel behavior)', () => {
    const model = TableFactory.createTableModel({ rows: sampleAccounts(), columnDefs: accountColumns() });
    const { host, api } = mountTable(model, {
      tableOptions: { columnFilterMenu: true },
      width: 640,
      height: 320,
    });

    // Filter Region = EMEA
    api.setColumnFilter('region', { values: ['EMEA'] });

    // Company menu should show ONLY EMEA companies
    api.showColumnFilterMenu('company');
    let popup = getPopup(host);
    let labels = Array.from(popup.querySelectorAll<HTMLLabelElement>('.ge-table-filter-value-label')).map(l => l.textContent);
    expect(labels).toEqual(['Acme GmbH', 'Cobalt AG', 'Echo SAS']);

    // Region menu itself still shows ALL regions
    api.showColumnFilterMenu('region');
    popup = getPopup(host);
    labels = Array.from(popup.querySelectorAll<HTMLLabelElement>('.ge-table-filter-value-label')).map(l => l.textContent);
    expect(labels).toEqual(['AMER', 'APAC', 'EMEA']);
  });

  it('virtualizes 20,000 distinct values, shows truncation banner and re-scans on search', async () => {
    const rows = Array.from({ length: 20_000 }, (_, i) => ({ id: i, name: `Item ${String(i).padStart(5, '0')}` }));
    const cols = [
      ColumnDef.create({ property: 'id', headerLabel: 'ID', width: px80 }),
      ColumnDef.create({ property: 'name', headerLabel: 'Name', width: px120 }),
    ];
    const model = TableFactory.createTableModel({ rows, columnDefs: cols });
    const { host, api } = mountTable(model, {
      tableOptions: { columnFilterMenu: { maxValues: 500, showCondition: false } },
      width: 400,
      height: 300,
    });

    api.showColumnFilterMenu('name');
    const popup = getPopup(host);

    // Virtualized: far fewer than 500 DOM rows rendered
    const renderedRows = popup.querySelectorAll('.ge-table-filter-value-row');
    expect(renderedRows.length).toBeGreaterThan(0);
    expect(renderedRows.length).toBeLessThan(25);

    // Truncation banner visible
    const notice = popup.querySelector<HTMLElement>('.ge-table-filter-values-notice')!;
    expect(notice.hidden).toBe(false);
    expect(notice.textContent).toContain('500');

    // Search re-scans all 20,000 source rows and finds "Item 19995" (beyond initial 500 cap!)
    const search = popup.querySelector<HTMLInputElement>('.ge-table-filter-menu-search')!;
    search.value = '19995';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    await sleep(160);

    const labels = Array.from(popup.querySelectorAll<HTMLLabelElement>('.ge-table-filter-value-label')).map(l => l.textContent);
    expect(labels).toEqual(['Item 19995']);
    expect(notice.hidden).toBe(true);
  });

  it('supports async ColumnDef.filter.getValues and discards stale responses', async () => {
    let resolveFirst!: (items: ColumnFilterValueItemIf[]) => void;
    let resolveSecond!: (items: ColumnFilterValueItemIf[]) => void;
    let calls = 0;

    const cols: ColumnDefIf[] = [
      ColumnDef.create({
        property: 'region',
        headerLabel: 'Region',
        width: px120,
        filter: {
          getValues: () => {
            calls++;
            return new Promise((res) => {
              if (calls === 1) resolveFirst = res;
              else resolveSecond = res;
            });
          },
        },
      }),
    ];
    const model = TableFactory.createTableModel({ rows: sampleAccounts(), columnDefs: cols });
    const { host, api } = mountTable(model, {
      tableOptions: { columnFilterMenu: { showCondition: false } },
      width: 300,
      height: 260,
    });

    api.showColumnFilterMenu('region');
    const popup = getPopup(host);
    const search = popup.querySelector<HTMLInputElement>('.ge-table-filter-menu-search')!;
    search.value = 'eu';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    await sleep(150);
    expect(calls).toBe(2);

    // Second resolves BEFORE first; late first response must be ignored!
    resolveSecond([{ value: 'EMEA', label: 'Europe (EMEA)', count: 3 }]);
    await sleep(10);
    resolveFirst([{ value: 'STALE', label: 'Stale Value', count: 99 }]);
    await sleep(10);

    const labels = Array.from(popup.querySelectorAll<HTMLLabelElement>('.ge-table-filter-value-label')).map(l => l.textContent);
    expect(labels).toEqual(['Europe (EMEA)']);
    expect(popup.querySelector('.ge-table-filter-value-count')?.textContent).toBe('3');
  });

  it('top-layer popover stays in viewport in LTR & RTL, traps focus, returns focus on Escape, ignores internal scroll, closes on outside click, stays on vertical table scroll', async () => {
    const rows = Array.from({ length: 40 }, (_, i) => ({ id: i, region: `R${i}` }));
    const cols = [
      ColumnDef.create({ property: 'id', headerLabel: 'ID', width: px120 }),
      ColumnDef.create({ property: 'region', headerLabel: 'Region', width: px120 }),
    ];
    const model = TableFactory.createTableModel({ rows, columnDefs: cols });
    const { host, scope, api } = mountTable(model, {
      tableOptions: { columnFilterMenu: true, direction: 'rtl', ariaLabel: 'RTL Grid' },
      width: 320,
      height: 260,
    });

    // Open via keyboard Alt+ArrowDown (OPEN_COLUMN_FILTER_MENU) from header focus
    scope.focusHeaderFromFilterRow(1);
    expect(scope.onActionTriggered('OPEN_COLUMN_FILTER_MENU')).toBe(true);
    const popup = getPopup(host);
    expect(popup.getAttribute('dir')).toBe('rtl');

    // Within viewport bounds
    const rect = popup.getBoundingClientRect();
    expect(rect.left).toBeGreaterThanOrEqual(0);
    expect(rect.right).toBeLessThanOrEqual(window.innerWidth);
    expect(rect.top).toBeGreaterThanOrEqual(0);
    expect(rect.bottom).toBeLessThanOrEqual(window.innerHeight);

    // Focus trap: Shift+Tab on first focusable wraps to last focusable (OK button)
    const okBtn = popup.querySelector<HTMLButtonElement>('.ge-table-filter-btn-ok')!;
    const firstSelect = popup.querySelector<HTMLSelectElement>('.ge-table-filter-menu-select')!;
    firstSelect.focus();
    const shiftTab = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true });
    firstSelect.dispatchEvent(shiftTab);
    expect(shiftTab.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(okBtn);

    // Scrolling the popup's own virtual values list does NOT close the popup
    const listViewport = popup.querySelector<HTMLElement>('.ge-table-filter-values-viewport')!;
    listViewport.scrollTop = 100;
    listViewport.dispatchEvent(new Event('scroll'));
    expect(findPopup(host)).not.toBeNull();

    // Dragging pointer from inside popup to outside does NOT close
    popup.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    document.body.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    expect(findPopup(host)).not.toBeNull();

    // Escape closes and returns focus to host/header
    popup.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    expect(findPopup(host)).toBeNull();
    expect(document.activeElement).toBe(host);
    expect(scope.getHeaderFocus()).toEqual([0, 1]);

    // Outside click (pointerdown + pointerup outside) closes popup
    api.showColumnFilterMenu('region');
    expect(getPopup(host)).not.toBeNull();
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    document.body.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    expect(findPopup(host)).toBeNull();

    // Vertical scrolling of the table keeps the popup (the header does not move; live tail, filter → first row).
    // Horizontal scrolling closes it: column-filter-review.browser.spec.ts
    api.showColumnFilterMenu('region');
    expect(getPopup(host)).not.toBeNull();
    scope.scrollViewport.scrollTop = 50;
    scope.scrollViewport.dispatchEvent(new Event('scroll'));
    expect(findPopup(host)).not.toBeNull();
    api.hideColumnFilterMenu();
    expect(findPopup(host)).toBeNull();
  });

  it('passes axe with 0 violations (closed and open), prevents XSS, and cleans up on destroy()', async () => {
    const xss = '<img src=x onerror="window.__geMenuXss=1">';
    (window as unknown as Record<string, unknown>)['__geMenuXss'] = 0;

    const cols = [
      ColumnDef.create({ property: 'company', headerLabel: xss, width: px120 }),
      ColumnDef.create({ property: 'region', headerLabel: 'Region', width: px100 }),
    ];
    const rows = [
      { company: xss, region: 'EMEA' },
      { company: 'Safe Co', region: 'AMER' },
    ];
    const model = TableFactory.createTableModel({ rows, columnDefs: cols });
    const { host, scope, api } = mountTable(model, {
      tableOptions: { columnFilterMenu: true, ariaLabel: 'Accounts' },
      width: 400,
      height: 260,
    });

    // axe while closed
    expect(await axeViolations(host)).toEqual([]);

    // Open menu on XSS column
    api.showColumnFilterMenu('company');
    await nextFrame();
    const popup = getPopup(host);
    expect(popup.textContent).toContain(xss);
    expect((window as unknown as Record<string, unknown>)['__geMenuXss']).toBe(0);

    // axe while open (check both host grid and the open dialog popup!)
    expect(await axeViolations(host)).toEqual([]);
    expect(await axeViolations(popup)).toEqual([]);

    // destroy() removes open popup cleanly with no leaks
    scope.destroy();
    expect(host.querySelector('.ge-table-filter-popup')).toBeNull();
    expect(document.body.querySelector('.ge-table-filter-popup')).toBeNull();
  });

  it('non-filterable body: warns once with managed: true, works with managed: false', () => {
    class StaticBody extends AreaModel {
      override isFilterable(): boolean { return false; }
      override getRowCount(): number { return 2; }
      override getValueAt(r: number, c: number): unknown { return `R${r}C${c}`; }
    }
    const cols = [ColumnDef.create({ property: 'a', headerLabel: 'A', width: px100 })];

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const m1 = TableFactory.createTableModel({ bodyAreaModel: new StaticBody(), columnDefs: cols });
      const t1 = mountTable(m1, { tableOptions: { columnFilterMenu: true }, width: 300, height: 200 });
      expect(t1.host.querySelectorAll('.ge-table-column-filter-btn').length).toBe(0);
      expect(t1.api.showColumnFilterMenu('a')).toBe(false);
      expect(warn).toHaveBeenCalledTimes(1);
    } finally {
      warn.mockRestore();
    }

    const events: GeFilterEvent[] = [];
    const eventListener = new EventAdapter();
    eventListener.onFilterChanged = (e) => events.push(e);
    const m2 = TableFactory.createTableModel({ bodyAreaModel: new StaticBody(), columnDefs: cols });
    const t2 = mountTable(m2, {
      tableOptions: { columnFilterMenu: true, columnFilter: { managed: false } },
      eventListener,
      width: 300,
      height: 200,
    });
    expect(t2.host.querySelectorAll('.ge-table-column-filter-btn').length).toBe(1);
    t2.api.showColumnFilterMenu('a');
    const popup = getPopup(t2.host);
    const inp = popup.querySelector<HTMLInputElement>('.ge-table-filter-menu-input')!;
    inp.value = 'server-val';
    popup.querySelector<HTMLButtonElement>('.ge-table-filter-btn-ok')!.click();
    expect(events.length).toBe(1);
    expect(events[0].filters['a']?.condition?.value).toBe('server-val');
  });
});
