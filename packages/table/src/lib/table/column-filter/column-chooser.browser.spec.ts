import { afterEach, describe, expect, it } from 'vitest';
import {
  CheckboxColumnDef,
  ColumnDef,
  RowNumberColumnDef,
  TableFactory,
  px100,
  px80,
  type ColumnDefIf,
} from '@guiexpert/table';
import { axeViolations } from '../../../../test-utils/axe';
import { destroyAllTables, mountTable, nextFrame } from '../../../../test-utils/mount-table';

function findChooser(): HTMLElement | null {
  return document.body.querySelector<HTMLElement>('.ge-table-column-chooser');
}

function getChooser(): HTMLElement {
  const el = findChooser();
  if (!el) throw new Error('Column chooser popup not found');
  return el;
}

afterEach(() => {
  destroyAllTables();
  document.querySelectorAll('button.test-chooser-anchor').forEach(b => b.remove());
});

describe('Column chooser (Etappe D, real browser)', () => {

  it('lists columns in display order (excluding RowNumber & Checkbox), toggles visibility and persists in state', async () => {
    const cols: ColumnDefIf[] = [
      new RowNumberColumnDef(),
      new CheckboxColumnDef(),
      ColumnDef.create({ property: 'id', headerLabel: 'ID', width: px80, hideable: false }),
      ColumnDef.create({ property: 'company', headerLabel: 'Company', width: px100 }),
      ColumnDef.create({ property: 'region', headerLabel: 'Region', width: px100 }),
    ];
    const rows = [{ id: 1, company: 'Acme', region: 'EMEA' }];
    const model = TableFactory.createTableModel({ rows, columnDefs: cols });
    const { api } = mountTable(model, { width: 500, height: 240 });

    const anchor = document.createElement('button');
    anchor.className = 'test-chooser-anchor';
    anchor.textContent = 'Columns';
    document.body.appendChild(anchor);

    api.showColumnChooser(anchor);
    const chooser = getChooser();
    expect(chooser.getAttribute('role')).toBe('dialog');
    expect(chooser.getAttribute('aria-label')).toBe('Choose columns');
    // Fewer than 8 columns -> no search input
    expect(chooser.querySelector('.ge-table-filter-menu-search')).toBeNull();

    const labels = Array.from(chooser.querySelectorAll<HTMLLabelElement>('.ge-table-column-chooser-row label')).map(l => l.textContent);
    expect(labels).toEqual(['ID', 'Company', 'Region']);

    // hideable: false -> ID checkbox is disabled
    const idCb = chooser.querySelector<HTMLInputElement>('input[data-col-property="id"]')!;
    expect(idCb.checked).toBe(true);
    expect(idCb.disabled).toBe(true);

    // Uncheck Region -> column hidden & reflected in state.columns
    const regionCb = chooser.querySelector<HTMLInputElement>('input[data-col-property="region"]')!;
    regionCb.click();
    expect(api.isColumnVisible('region')).toBe(false);
    expect(api.getState().columns?.find(c => c.property === 'region')?.visible).toBe(false);

    // Clicking anchor toggle closes chooser; Escape returns focus to anchor
    api.showColumnChooser(anchor);
    expect(findChooser()).toBeNull();

    api.showColumnChooser(anchor);
    getChooser().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    expect(findChooser()).toBeNull();
    expect(document.activeElement).toBe(anchor);
  });

  it('prevents hiding the last visible column (both individual toggle and Select all)', () => {
    const cols: ColumnDefIf[] = [
      ColumnDef.create({ property: 'a', headerLabel: 'A', width: px100 }),
      ColumnDef.create({ property: 'b', headerLabel: 'B', width: px100 }),
    ];
    const model = TableFactory.createTableModel({ rows: [{ a: 1, b: 2 }], columnDefs: cols });
    const { api } = mountTable(model, { width: 400, height: 220 });

    api.showColumnChooser();
    const chooser = getChooser();

    // Uncheck B -> A becomes the last visible column and is disabled!
    chooser.querySelector<HTMLInputElement>('input[data-col-property="b"]')!.click();
    expect(api.isColumnVisible('b')).toBe(false);
    expect(api.isColumnVisible('a')).toBe(true);
    expect(chooser.querySelector<HTMLInputElement>('input[data-col-property="a"]')!.disabled).toBe(true);

    // Re-check B via Select all -> both enabled again
    const selectAll = chooser.querySelector<HTMLInputElement>('.ge-table-filter-select-all input')!;
    selectAll.click();
    expect(api.isColumnVisible('a')).toBe(true);
    expect(api.isColumnVisible('b')).toBe(true);
    expect(chooser.querySelector<HTMLInputElement>('input[data-col-property="a"]')!.disabled).toBe(false);

    // Uncheck all via Select all -> keeps at least 1 visible column!
    selectAll.click();
    expect(api.isColumnVisible('a') || api.isColumnVisible('b')).toBe(true);

    api.hideColumnChooser();
    expect(findChooser()).toBeNull();
  });

  it('shows search input from >= 8 columns, supports RTL, prevents XSS, passes axe and cleans up on destroy()', async () => {
    const xss = '<img src=x onerror="window.__geChooserXss=1">';
    (window as unknown as Record<string, unknown>)['__geChooserXss'] = 0;

    const cols: ColumnDefIf[] = Array.from({ length: 10 }, (_, i) =>
      ColumnDef.create({ property: `c${i}`, headerLabel: i === 0 ? xss : `Column ${i}`, width: px80 }),
    );
    const row: Record<string, number> = {};
    for (let i = 0; i < 10; i++) row[`c${i}`] = i;

    const model = TableFactory.createTableModel({ rows: [row], columnDefs: cols });
    const { host, scope, api } = mountTable(model, {
      tableOptions: { direction: 'rtl', ariaLabel: 'Wide table' },
      width: 500,
      height: 240,
    });

    api.showColumnChooser();
    await nextFrame();
    const chooser = getChooser();
    expect(chooser.getAttribute('dir')).toBe('rtl');
    expect((window as unknown as Record<string, unknown>)['__geChooserXss']).toBe(0);

    // Search input appears (>= 8 columns) and filters list
    const search = chooser.querySelector<HTMLInputElement>('.ge-table-filter-menu-search')!;
    expect(search).not.toBeNull();
    search.value = 'Column 7';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    const matching = Array.from(chooser.querySelectorAll<HTMLLabelElement>('.ge-table-column-chooser-row label')).map(l => l.textContent);
    expect(matching).toEqual(['Column 7']);

    // Clear search & run axe on both table and open dialog
    search.value = '';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    expect(await axeViolations(host)).toEqual([]);
    expect(await axeViolations(chooser)).toEqual([]);

    // destroy() removes open chooser
    scope.destroy();
    expect(findChooser()).toBeNull();
  });
});
