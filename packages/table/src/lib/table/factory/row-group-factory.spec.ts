// RowGroupFactory (prompt 006, design § 2.2, 2.4, 2.6): columns, hidden grouped columns, header, footer, row numbers,
// checkbox column, fixed columns, layout after regrouping.
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import {
  AreaModelRowGroups,
  CheckboxColumnDef,
  ColumnDef,
  RowGroupColumnDef,
  RowGroupFactory,
  TableOptions,
  TreeCheckboxModel,
  isAreaModelAggregateFooter,
  isAreaModelRowGroups,
  isRowGroupColumnDef,
  isRowNumberColumnDef,
  px120,
} from '@guiexpert/table';
import type { ColumnDefIf, RowGroupField, RowGroupFieldIf, RowGroupIf, TableModelIf } from '@guiexpert/table';
import { createSales, type SaleRow } from '../../../../test-utils/grouping-fixtures';

afterEach(() => vi.restoreAllMocks());

function columns(): ColumnDefIf[] {
  return [new ColumnDef('region', 'Region'), new ColumnDef('produkt', 'Produkt'), new ColumnDef('monat', 'Monat'), new ColumnDef('umsatz', 'Umsatz')];
}

const props = (m: TableModelIf) => (m.getColumnDefs() ?? []).map(d => d.property);
const visible = (m: TableModelIf) => (m.getColumnDefs() ?? []).filter(d => d.isVisible?.() !== false).map(d => d.property);
const header = (m: TableModelIf) => Array.from({ length: m.getColumnCount() }, (_, c) => m.getAreaModel('header').getValueAt(0, c));

describe('RowGroupFactory.createTableModel', () => {
  it('R1: group column in front and fixed, grouped column hidden, header from the level, footer with the total', () => {
    const m = RowGroupFactory.createTableModel<SaleRow>({
      rows: createSales(), columnDefs: columns(), groupBy: ['region'], aggregations: { umsatz: 'sum' },
    });
    expect(props(m)).toEqual(['RowGroupColumn', 'region', 'produkt', 'monat', 'umsatz']);
    expect(visible(m)).toEqual(['RowGroupColumn', 'produkt', 'monat', 'umsatz']);
    expect(m.getFixedLeftColumnCount()).toBe(1);
    expect(header(m)[0]).toBe('Region');
    expect(isAreaModelRowGroups(m.getBodyModel())).toBe(true);
    const footer = m.getAreaModel('footer');
    expect(isAreaModelAggregateFooter(footer)).toBe(true);
    expect(footer.getValueAt(0, 4)).toBe(450);
    expect(footer.getValueAt(0, 0)).toBe('6 rows');
    expect(m.getBodyModel().getValueAt(0, 0)).toBe('Nord (3)');
  });

  it('R2: header "Region › Produkt", both grouped columns hidden; footer follows a filter (R4)', () => {
    const m = RowGroupFactory.createTableModel<SaleRow>({
      rows: createSales(), columnDefs: columns(), groupBy: ['region', 'produkt'], aggregations: { umsatz: 'sum' },
    });
    expect(header(m)[0]).toBe('Region › Produkt');
    expect(visible(m)).toEqual(['RowGroupColumn', 'monat', 'umsatz']);
    m.externalFilterChanged((s: SaleRow) => s.monat === 'Jan');
    m.getAreaModel('footer').invalidateDerivedValues?.();
    expect(m.getAreaModel('footer').getValueAt(0, 4)).toBe(230);
  });

  it('options: no footer, own footer, columns from the first row, keep grouped columns, own header, not fixed', () => {
    const none = RowGroupFactory.createTableModel({ rows: createSales(), groupBy: ['region'], aggregations: { umsatz: 'sum' }, footerAggregates: false });
    expect(isAreaModelAggregateFooter(none.getAreaModel('footer'))).toBe(false);
    expect(props(none)).toEqual(['RowGroupColumn', 'region', 'produkt', 'monat', 'umsatz']);
    expect(header(none)[1]).toBe('REGION');

    const own = RowGroupFactory.createTableModel({ rows: createSales(), groupBy: ['region'], aggregations: { umsatz: 'sum' },
      footerAggregates: [{ label: 'Max', aggregates: { umsatz: 'max' } }] });
    expect(own.getAreaModel('footer').getValueAt(0, 4)).toBe(120);

    const noAgg = RowGroupFactory.createTableModel({ rows: createSales(), groupBy: ['region'] });
    expect(isAreaModelAggregateFooter(noAgg.getAreaModel('footer'))).toBe(false);
    const forced = RowGroupFactory.createTableModel({ rows: createSales(), groupBy: ['region'], footerAggregates: true });
    expect(isAreaModelAggregateFooter(forced.getAreaModel('footer'))).toBe(false);

    const keep = RowGroupFactory.createTableModel({ rows: createSales(), columnDefs: columns(), groupBy: ['region'],
      hideGroupedColumns: false, groupColumn: { headerLabel: 'Gruppe', width: px120, fixed: false } });
    expect(visible(keep)).toContain('region');
    expect(header(keep)[0]).toBe('Gruppe');
    expect(keep.getFixedLeftColumnCount()).toBe(0);
    expect(keep.getColumnDefs()![0].width).toEqual(px120);

    const empty = RowGroupFactory.createTableModel({ rows: [], groupBy: [] });
    expect(props(empty)).toEqual(['RowGroupColumn']);
    expect(header(empty)[0]).toBe('Group');
  });

  it('accessor levels: header from label/name', () => {
    const m = RowGroupFactory.createTableModel<SaleRow>({ rows: createSales(), columnDefs: columns(),
      groupBy: [{ value: s => s.monat.length, name: 'len' }, { value: 'produkt', label: 'Product' }] });
    expect(header(m)[0]).toBe('len › Product');
    expect(visible(m)).not.toContain('produkt');
  });

  it('row numbers and a checkbox column come first; fixed columns are counted', () => {
    const m = RowGroupFactory.createTableModel<SaleRow>({
      rows: createSales(), columnDefs: [new CheckboxColumnDef(), ...columns()], groupBy: ['region'],
      rowNumbersVisible: true, fixedLeftColumnCount: 0,
    });
    const defs = m.getColumnDefs()!;
    expect(isRowNumberColumnDef(defs[0])).toBe(true);
    expect(defs[1].property).toBe('CheckboxColumn');
    expect(isRowGroupColumnDef(defs[2])).toBe(true);
    expect(m.getFixedLeftColumnCount()).toBe(3);
    expect(m.isRowCheckboxVisible()).toBe(true);
    expect(m.getBodyModel().rowSelectionModel).toBeInstanceOf(TreeCheckboxModel);

    const inline = RowGroupFactory.createTableModel<SaleRow>({ rows: createSales(), columnDefs: columns(), groupBy: ['region'],
      tableOptions: { ...new TableOptions(), showCheckboxWihoutExtraColumn: true } });
    expect(inline.getBodyModel().rowSelectionModel).toBeInstanceOf(TreeCheckboxModel);
    const withRowNumberAlready = RowGroupFactory.createTableModel<SaleRow>({ rows: createSales(),
      columnDefs: [defs[0], ...columns()], groupBy: ['region'], rowNumbersVisible: { headerLabel: 'Nr' } });
    expect(withRowNumberAlready.getColumnDefs()!.filter(isRowNumberColumnDef)).toHaveLength(1);
  });

  it('does not change the caller\'s column array', () => {
    const defs = columns();
    RowGroupFactory.createTableModel({ rows: createSales(), columnDefs: defs, groupBy: ['region'] });
    expect(defs).toHaveLength(4);
  });
});

describe('RowGroupFactory.updateLayout', () => {
  it('after setGroupBy: shows the columns that are no longer grouped, hides the new ones, follows the header', () => {
    const m = RowGroupFactory.createTableModel<SaleRow>({ rows: createSales(), columnDefs: columns(), groupBy: ['region'] });
    const body = m.getBodyModel() as AreaModelRowGroups<SaleRow>;
    body.setGroupBy(['produkt', 'monat']);
    expect(RowGroupFactory.updateLayout(m)).toBe(true);
    expect(visible(m)).toEqual(['RowGroupColumn', 'region', 'umsatz']);
    expect(header(m)[0]).toBe('Produkt › Monat');
    expect((m.getColumnDefs()![0] as RowGroupColumnDef).headerLabel).toBe('Produkt › Monat');
    body.setGroupBy([]);
    RowGroupFactory.updateLayout(m);
    expect(visible(m)).toEqual(['RowGroupColumn', 'region', 'produkt', 'monat', 'umsatz']);
    expect(header(m)[0]).toBe('Group');
  });

  it('a column hidden before stays hidden when the grouping changes', () => {
    const defs = columns();
    defs[1] = ColumnDef.create({ property: 'produkt', headerLabel: 'Produkt', isVisible: () => false });
    const m = RowGroupFactory.createTableModel<SaleRow>({ rows: createSales(), columnDefs: defs, groupBy: ['produkt'] });
    const body = m.getBodyModel() as AreaModelRowGroups<SaleRow>;
    expect(body.hiddenColumnProperties).toEqual([]);
    body.setGroupBy(['region']);
    RowGroupFactory.updateLayout(m);
    expect(visible(m)).toEqual(['RowGroupColumn', 'monat', 'umsatz']);
  });

  it('false for a flat table', () => {
    const m = RowGroupFactory.createTableModel({ rows: createSales(), groupBy: ['region'] });
    const flat = { ...m, getBodyModel: () => m.getAreaModel('footer') } as unknown as TableModelIf;
    expect(RowGroupFactory.updateLayout(flat)).toBe(false);
  });
});

describe('types (checked by test:types)', () => {
  it('functions get the row type; paths are strings', () => {
    // @ts-expect-error – SaleRow has no "nope"
    RowGroupFactory.createTableModel<SaleRow>({ rows: [], groupBy: [s => s.nope] });
    RowGroupFactory.createTableModel<SaleRow>({ rows: [], groupBy: ['region', s => s.monat.length, { value: s => s.produkt }],
      groupColumn: { label: (g: RowGroupIf<SaleRow>) => g.getRows()[0]?.region ?? '' } });
    expectTypeOf<RowGroupField<SaleRow>>().toEqualTypeOf<string | ((row: SaleRow) => unknown) | RowGroupFieldIf<SaleRow>>();
    expectTypeOf<RowGroupIf<SaleRow>['getRows']>().returns.toEqualTypeOf<SaleRow[]>();
  });
});
