// AreaModelRowGroups without a browser (prompt 006, design § 2.3–2.12): R1–R5 on the model, filter, sorting,
// regrouping, editing (path only), checkboxes, cells, classes.
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  AreaModelRowGroups,
  AreaModelTree,
  ColumnDef,
  RowGroupColumnDef,
  SortItem,
  TreeCheckboxModel,
  isAreaModelRowGroups,
  isAreaModelTree,
  isGroupRow,
  TrueFn,
} from '@guiexpert/table';
import type { AggregatorIf, ColumnDefIf, RowGroupModelOptionsIf } from '@guiexpert/table';
import { createSales, R1, R2, R4, R5, type SaleRow } from '../../../../../../test-utils/grouping-fixtures';

afterEach(() => vi.restoreAllMocks());

const PROPS = ['region', 'produkt', 'monat', 'umsatz'];

function columns(): ColumnDefIf[] {
  return [new RowGroupColumnDef(), ...PROPS.map(p => ColumnDef.create({ property: p, headerLabel: p, editable: TrueFn }))];
}

function model(options: Partial<RowGroupModelOptionsIf<SaleRow>> = {}, rows: SaleRow[] = createSales()) {
  return new AreaModelRowGroups<SaleRow>(rows, columns(), { groupBy: ['region'], aggregations: { umsatz: 'sum' }, ...options });
}

/** The displayed rows as [group column, umsatz]. */
function view(m: AreaModelRowGroups<SaleRow>): [unknown, unknown][] {
  return Array.from({ length: m.getRowCount() }, (_, r) => [m.getValueAt(r, 0), m.getValueAt(r, 4)]);
}

describe('structure', () => {
  it('is a tree with markers', () => {
    const m = model();
    expect(isAreaModelTree(m)).toBe(true);
    expect(isAreaModelRowGroups(m)).toBe(true);
    expect(isAreaModelRowGroups(new AreaModelTree('body', [], 34))).toBe(false);
    expect(m).toBeInstanceOf(AreaModelTree);
    expect(m.areaIdent).toBe('body');
    expect(m.getConstantRowHeight()).toBe(34);
    expect(isGroupRow(m.getRowByIndex(0))).toBe(true);
    expect(isGroupRow(m.getRowByIndex(1))).toBe(false);
  });

  it('R1: group rows with label and sum, detail rows below', () => {
    expect(view(model())).toEqual([
      ['Nord (3)', 270], ['', 100], ['', 50], ['', 120],
      ['Süd (3)', 180], ['', 80], ['', 70], ['', 30],
    ]);
    const m = model();
    expect(m.getGroups().map(g => g.results['umsatz'])).toEqual(R1.groups.map(g => g.umsatz));
    expect(m.getTotals()).toEqual({ umsatz: R1.total });
  });

  it('R2: two levels', () => {
    const m = model({ groupBy: ['region', 'produkt'] });
    expect(view(m).filter(([label]) => label !== '')).toEqual([
      ['Nord (3)', R2.Nord.sum], ['A (2)', R2.Nord.A], ['B (1)', R2.Nord.B],
      ['Süd (3)', R2.Süd.sum], ['A (2)', R2.Süd.A], ['B (1)', R2.Süd.B],
    ]);
    expect(m.getRowCount()).toBe(12);
    expect(m.findGroup(['Süd', 'B'])?.results['umsatz']).toBe(70);
    expect(m.findGroup(['Ost'])).toBeUndefined();
  });

  it('cells of group rows: empty without aggregate, other columns of detail rows from the object', () => {
    const m = model();
    expect([1, 2, 3].map(c => m.getValueAt(0, c))).toEqual(['', '', '']);
    expect([1, 2, 3, 4].map(c => m.getValueAt(1, c))).toEqual(['Nord', 'A', 'Jan', 100]);
    expect(m.getValueAt(99, 0)).toBe('');
    expect(m.getTextValueAt(0, 2)).toBe('');
    expect(m.getTextValueAt(0, 0)).toBe('Nord (3)');
    expect(m.getTextValueAt(1, 4)).toBe('100');
  });

  it('formatted aggregate text, raw value', () => {
    const m = model({ groupBy: ['region'], aggregations: { umsatz: { aggregator: 'avg', format: v => `Ø ${v}` } } });
    expect(m.getValueAt(0, 4)).toBe(90);
    expect(m.getTextValueAt(0, 4)).toBe('Ø 90');
    const m2 = model({ aggregations: { umsatz: 'avg' } }, [...createSales(), { region: 'Nord', produkt: 'C', monat: 'Mär', umsatz: 1 }]);
    expect(m2.getTextValueAt(0, 4)).toBe('67.75');
  });

  it('renderers: aggregate renderer for aggregates, none for empty group cells and the group column', () => {
    const cols = columns();
    const bodyRenderer = { render: () => undefined };
    cols[2].rendererMap.body = bodyRenderer;
    const m = new AreaModelRowGroups<SaleRow>(createSales(), cols, { groupBy: ['region'], aggregations: { umsatz: 'sum' } });
    expect(m.getCellRenderer(0, 4)).toMatchObject({ type: 'AggregateCellRenderer' });
    expect(m.getCellRenderer(0, 2)).toBeUndefined();
    expect(m.getCellRenderer(0, 0)).toBeUndefined();
    expect(m.getCellRenderer(1, 0)).toBeUndefined();
    expect(m.getCellRenderer(1, 2)).toBe(bodyRenderer);
  });

  it('CSS classes of group rows by level', () => {
    const m = model({ groupBy: ['region', 'produkt'] });
    expect(m.getCustomClassesAt(0, 0)).toEqual(expect.arrayContaining(['ge-table-row-group', 'ge-table-row-group-level-0', 'ge-table-row-group-label']));
    expect(m.getCustomClassesAt(1, 4)).toEqual(expect.arrayContaining(['ge-table-row-group-level-1', 'ge-table-row-group-aggregate']));
    expect(m.getCustomClassesAt(2, 4)).not.toContain('ge-table-row-group');
    expect(m.isGroupLabelCell(0, 0)).toBe(true);
    expect(m.isGroupLabelCell(0, 1)).toBe(false);
    expect(m.isGroupLabelCell(2, 0)).toBe(false);
  });

  it('label options: own label, without count; empty label', () => {
    expect(model({ groupColumn: { showCount: false } }).getValueAt(0, 0)).toBe('Nord');
    expect(model({ groupColumn: { label: g => `${g.path.join('/')}: ${g.count}` } }).getValueAt(0, 0)).toBe('Nord: 3');
    const rows = [...createSales(), { region: '', produkt: 'X', monat: 'Jan', umsatz: 1 }];
    expect(model({ emptyLabel: 'none' }, rows).getValueAt(8, 0)).toBe('none (1)');
  });

  it('expanded: false, a level number, a function; expandToLevel', () => {
    expect(model({ expanded: false }).getRowCount()).toBe(2);
    const m = model({ groupBy: ['region', 'produkt'], expanded: 1 });
    expect(view(m).map(([l]) => l)).toEqual(['Nord (3)', 'A (2)', 'B (1)', 'Süd (3)', 'A (2)', 'B (1)']);
    expect(model({ expanded: g => g.key === 'Süd' }).getRowCount()).toBe(5);
    m.expandToLevel(0);
    expect(m.getRowCount()).toBe(2);
    m.expandToLevel(9);
    expect(m.getRowCount()).toBe(12);
    m.toggleExpandCollapseAll(false);
    expect(m.getRowCount()).toBe(2);
  });

  it('accessors: getRowGroup, getDetailRow, isGroupRowIndex, getSourceRows', () => {
    const m = model();
    expect(m.getRowGroup(0)?.label).toBe('Nord');
    expect(m.getRowGroup(1)).toBeUndefined();
    expect(m.getDetailRow(1)?.umsatz).toBe(100);
    expect(m.getDetailRow(0)).toBeUndefined();
    expect(m.isGroupRowIndex(4)).toBe(true);
    expect(m.getSourceRows()).toHaveLength(6);
  });

  it('no levels: the rows without groups, totals still work', () => {
    const m = model({ groupBy: [] });
    expect(m.getRowCount()).toBe(6);
    expect(m.getValueAt(0, 0)).toBe('');
    expect(m.getTotals()).toEqual({ umsatz: 450 });
    expect(m.getRowGroup(0)).toBeUndefined();
  });

  it('empty input', () => {
    const m = model({}, []);
    expect(m.getRowCount()).toBe(0);
    expect(m.getTotals()).toEqual({ umsatz: 0 });
  });

  it('does not change the rows', () => {
    const rows = createSales();
    const copy = structuredClone(rows);
    const m = model({ groupBy: ['region', 'produkt'] }, rows);
    m.doSort([new SortItem(4, 'desc')]);
    m.externalFilterChanged((s: SaleRow) => s.monat === 'Jan');
    m.getTotals();
    expect(rows).toEqual(copy);
  });
});

describe('filter (R4)', () => {
  it('the predicate gets the objects; aggregates and counts follow the filter', () => {
    const m = model();
    const seen: unknown[] = [];
    m.externalFilterChanged((s: SaleRow, i: number, all: SaleRow[]) => {
      seen.push([typeof s.umsatz, i, all.length]);
      return s.monat === 'Jan';
    });
    expect(seen).toHaveLength(6);
    expect(seen[5]).toEqual(['number', 5, 6]);
    expect(view(m)).toEqual([['Nord (2)', R4.Nord], ['', 100], ['', 50], ['Süd (1)', R4.Süd], ['', 80]]);
    expect(m.getTotals()).toEqual({ umsatz: R4.total });
    expect(m.getGroups()[0].getRows().map(r => r.umsatz)).toEqual([100, 50]);
  });

  it('groups without a match disappear; matches below collapsed groups are found', () => {
    const m = model({ groupBy: ['region', 'produkt'], expanded: false });
    m.externalFilterChanged((s: SaleRow) => s.umsatz === 70);
    expect(view(m)).toEqual([['Süd (1)', 70]]);
    m.toggleExpandCollapseAll(true);
    expect(view(m)).toEqual([['Süd (1)', 70], ['B (1)', 70], ['', 70]]);
    m.externalFilterChanged(() => true);
    expect(m.getTotals()).toEqual({ umsatz: 450 });
  });

  it('the filter survives regrouping and setRows', () => {
    const m = model();
    m.externalFilterChanged((s: SaleRow) => s.monat === 'Jan');
    m.setGroupBy(['produkt']);
    expect(view(m).filter(([l]) => l !== '')).toEqual([['A (2)', 180], ['B (1)', 50]]);
    m.setRows([...createSales(), { region: 'Ost', produkt: 'A', monat: 'Jan', umsatz: 5 }]);
    expect(m.getTotals()).toEqual({ umsatz: 235 });
  });
});

describe('sorting (R5)', () => {
  it('by an aggregated column: groups by aggregate, rows by value', () => {
    const m = model();
    m.doSort([new SortItem(4, 'desc')]);
    expect(m.getGroups().map(g => g.key)).toEqual(R5.groups);
    expect(view(m).slice(1, 4).map(([, v]) => v)).toEqual(R5.nordRows);
    m.doSort([new SortItem(4, 'asc')]);
    expect(m.getGroups().map(g => g.key)).toEqual(['Süd', 'Nord']);
    expect(view(m).slice(1, 4).map(([, v]) => v)).toEqual([30, 70, 80]);
  });

  it('by the group column: groups by key, rows unchanged', () => {
    const m = model();
    m.doSort([new SortItem(0, 'desc')]);
    expect(m.getGroups().map(g => g.key)).toEqual(['Süd', 'Nord']);
    expect(view(m).slice(1, 4).map(([, v]) => v)).toEqual([80, 70, 30]);
  });

  it('by the grouped column: that level by key; by another column: groups stay, rows sorted', () => {
    const m = model({ groupBy: ['region', 'produkt'] });
    m.doSort([new SortItem(2, 'desc')]);           // produkt
    expect(m.getGroups()[0].children.map(g => g.key)).toEqual(['B', 'A']);
    expect(m.getGroups().map(g => g.key)).toEqual(['Nord', 'Süd']);
    m.doSort([new SortItem(3, 'asc')]);            // monat (no aggregate): groups stay, rows sorted
    expect(m.getGroups()[0].children.map(g => g.key)).toEqual(['B', 'A']);
    expect(m.getDetailRow(2)?.monat).toBe('Jan');
    expect(m.doSort([])).toBe(false);
    m.doSort([new SortItem(4, '')]);               // no direction: nothing changes
    expect(m.getGroups()[0].children.map(g => g.key)).toEqual(['B', 'A']);
  });

  it('sort(fn) sorts the rows inside their groups with the objects', () => {
    const m = model();
    m.sort((a: SaleRow, b: SaleRow) => a.umsatz - b.umsatz);
    expect(view(m).map(([, v]) => v)).toEqual([270, 50, 100, 120, 180, 30, 70, 80]);
  });

  it('the sorting is applied again after regrouping', () => {
    const m = model();
    m.doSort([new SortItem(4, 'desc')]);
    m.setGroupBy(['produkt']);
    expect(m.getGroups().map(g => g.key)).toEqual(['A', 'B']);   // A 330 > B 120
    expect(m.getGroups()[0].getRows().length).toBe(4);
    expect(view(m).slice(1, 5).map(([, v]) => v)).toEqual([120, 100, 80, 30]);
    m.sort((a: SaleRow, b: SaleRow) => a.umsatz - b.umsatz);
    m.regroup();
    expect(view(m).slice(1, 5).map(([, v]) => v)).toEqual([30, 80, 100, 120]);
  });
});

describe('regrouping', () => {
  it('setGroupBy keeps the expanded state of unchanged paths', () => {
    const m = model({ groupBy: ['region', 'produkt'] });
    m.getRowByIndex(0)!.expanded = false; // Nord
    m.recalcVisibleTreeRows(false);
    m.setGroupBy(['region']);
    expect(view(m).map(([l]) => l)).toEqual(['Nord (3)', 'Süd (3)', '', '', '']);
    expect(m.getGroupBy()).toEqual(['region']);
    m.setGroupBy(['produkt', 'region']);
    expect(m.getRowCount()).toBe(12);       // new paths: default expanded
  });

  it('an invalid level throws before anything changes', () => {
    const m = model();
    expect(() => m.setGroupBy([{} as never])).toThrow();
    expect(m.getGroupBy()).toEqual(['region']);
  });
});

describe('editing', () => {
  function counting(): { agg: AggregatorIf<number, number>; add: ReturnType<typeof vi.fn> } {
    const add = vi.fn((s: number, v: unknown) => typeof v === 'number' ? s + v : s);
    return { add, agg: { name: 'countingSum', init: () => 0, add, merge: (a, b) => a + b, result: s => s } };
  }

  it('a value of a detail row: only the path to the root is computed again', () => {
    const { agg, add } = counting();
    const m = model({ groupBy: ['region', 'produkt'], aggregations: { umsatz: agg } });
    m.getTotals();
    expect(add).toHaveBeenCalledTimes(6);
    add.mockClear();
    expect(m.setValue(2, 4, 1000)).toBe(true);   // Nord › A › Jan 100 → 1000
    m.invalidateDerivedValues({ area: 'body', rowIndices: [2] });   // what the table passes
    expect(m.findGroup(['Nord', 'A'])?.results['umsatz']).toBe(1120);
    expect(m.findGroup(['Nord'])?.results['umsatz']).toBe(1170);
    expect(m.getTotals()).toEqual({ umsatz: 1350 });
    expect(add).toHaveBeenCalledTimes(2);        // the two rows of Nord › A
    add.mockClear();
    m.invalidateDerivedValues();                 // without hint: everything
    m.getTotals();
    expect(add).toHaveBeenCalledTimes(6);
  });

  it('group rows and the group column are not editable', () => {
    const m = model();
    expect(m.isEditable(0, 4)).toBe(false);
    expect(m.isEditable(1, 0)).toBe(false);
    expect(m.isEditable(1, 4)).toBe(true);
    expect(m.setValue(0, 4, 1)).toBe(false);
    expect(m.setValue(1, 0, 1)).toBe(false);
  });

  it('a grouped value: the row moves to its new group', () => {
    const rows = createSales();
    const m = model({}, rows);
    m.setValue(1, 1, 'Ost');                     // Nord A Jan 100 → region Ost
    expect(rows[0].region).toBe('Ost');
    expect(view(m).filter(([l]) => l !== '')).toEqual([['Nord (2)', 170], ['Ost (1)', 100], ['Süd (3)', 180]]);
  });

  it('an invalidation hint for a group row or another area computes everything', () => {
    const { agg, add } = counting();
    const m = model({ aggregations: { umsatz: agg } });
    m.getTotals();
    add.mockClear();
    m.invalidateDerivedValues({ area: 'body', rowIndices: [0] });
    m.getTotals();
    expect(add).toHaveBeenCalledTimes(6);
    add.mockClear();
    m.invalidateDerivedValues({ area: 'footer', rowIndices: [0] });
    m.getTotals();
    expect(add).toHaveBeenCalledTimes(6);
  });
});

describe('batch (updateCells)', () => {
  it('a moved row is regrouped once at the end – later calls still hit the rows they meant', () => {
    const rows = createSales();
    const m = model({}, rows);
    const builds = m.getBuildCount();
    const regrouped = m.batch(() => {
      m.setValue(1, 1, 'Süd');                   // Nord A Jan 100 → Süd (would move the rows below)
      m.setValue(2, 4, 999);                     // still Nord B Jan 50
    });
    expect(regrouped).toBe(true);
    expect(m.getBuildCount()).toBe(builds + 1);
    expect(rows[1].umsatz).toBe(999);
    expect(view(m).filter(([l]) => l !== '')).toEqual([['Nord (2)', 1119], ['Süd (4)', 280]]);
    expect(m.batch(() => m.setValue(1, 4, 1))).toBe(false);
  });

  it('first/last follow the displayed order of the rows after sorting', () => {
    const m = model({ aggregations: { umsatz: { aggregator: 'first' } } });
    expect(m.getGroups()[0].results['umsatz']).toBe(100);
    m.doSort([new SortItem(3, 'asc')]);          // monat: Feb before Jan
    expect(m.getGroups()[0].results['umsatz']).toBe(120);
    m.sort((a: SaleRow, b: SaleRow) => a.umsatz - b.umsatz);
    expect(m.getGroups()[0].results['umsatz']).toBe(50);
  });
});

describe('checkboxes', () => {
  it('checking a group checks its rows; checked rows survive regrouping', () => {
    const m = model({ groupBy: ['region', 'produkt'] });
    const cb = new TreeCheckboxModel(m.rows);
    m.rowSelectionModel = cb;
    m.setRowChecked(1, true);                    // Nord › A
    expect(m.getCheckedRows().map(r => r.umsatz)).toEqual([100, 120]);
    expect(m.isRowChecked(0)).toBe('semi');
    m.setGroupBy(['produkt']);
    expect(m.getCheckedRows().map(r => r.umsatz)).toEqual([100, 120]);
    expect(m.isRowChecked(0)).toBe('semi');      // A: 2 of 4
    m.setGroupBy(['monat', 'produkt']);
    const febA = m.findGroup(['Feb', 'A'])!;
    expect(febA.getRows().map(r => r.umsatz)).toEqual([120, 30]);
    m.setRows(createSales());                    // new objects: nothing checked
    expect(m.getCheckedRows()).toEqual([]);
  });

  it('a group whose rows are all checked is checked after regrouping', () => {
    const m = model();
    m.rowSelectionModel = new TreeCheckboxModel(m.rows);
    m.setRowChecked(0, true);                    // Nord
    m.setGroupBy(['region', 'produkt']);
    expect(m.isRowChecked(0)).toBe('full');
    expect(m.getRowByIndex(0)?.checked).toBe(true);
  });
});
