// Aggregation in a real browser (prompt 005, design prompts/005-aggregation-gesamtzeile.design.md):
// footer rendering (G7/G8), filter and sorting (G3), editing/updateCells/repaint (G9), cache while scrolling (G10),
// selection aggregates (G11), HTML injection (G12), Excel export, ARIA.
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  AreaModelAggregateFooter,
  CellRange,
  CheckboxColumnDef,
  ColumnDef,
  EventAdapter,
  GeModelChangeEvent,
  SelectionAggregator,
  SelectionModel,
  TableFactory,
  TrueFn,
  px40,
} from '@guiexpert/table';
import type {
  AggregateFooterConfig,
  AreaIdent,
  AreaModelIf,
  CellRendererIf,
  ColumnDefIf,
  DomServiceIf,
  ExtendedSelectionType,
  TableModelIf,
} from '@guiexpert/table';
import { cellDiv, createRows, destroyAllTables, getCellDiv, mountTable, nextFrame } from '../../../test-utils/mount-table';
import type { MountOptions } from '../../../test-utils/mount-table';
import { axeViolations } from '../../../test-utils/axe';
import { createSales, type SaleRow } from '../../../test-utils/grouping-fixtures';

afterEach(() => {
  destroyAllTables();
  vi.restoreAllMocks();
  SelectionAggregator.maxCells = 1_000_000;
});

function salesColumns(): ColumnDefIf[] {
  return [
    ColumnDef.create({ property: 'region', headerLabel: 'Region', sortable: TrueFn }),
    ColumnDef.create({ property: 'produkt', headerLabel: 'Produkt' }),
    ColumnDef.create({ property: 'monat', headerLabel: 'Monat' }),
    ColumnDef.create({ property: 'umsatz', headerLabel: 'Umsatz', sortable: TrueFn }),
  ];
}

function salesModel(footerAggregates: AggregateFooterConfig<SaleRow> = { umsatz: 'sum' },
                    rows: SaleRow[] = createSales()): TableModelIf {
  return TableFactory.createTableModel({ rows, columnDefs: salesColumns(), footerAggregates });
}

async function mount(tableModel: TableModelIf, opts: MountOptions = {}) {
  const table = mountTable(tableModel, opts);
  await nextFrame();
  return table;
}

/** Text of a rendered footer cell (center area). */
function footerText(host: HTMLElement, rowIndex: number, columnIndex: number): string {
  return getCellDiv(host, 'footer', 'center', rowIndex, columnIndex).textContent ?? '';
}

describe('G7/G8 – rendering', () => {
  it('label and formatted values; classes; the label cell is a rowheader', async () => {
    const { host } = await mount(salesModel([
      { label: 'Sum', aggregates: { umsatz: 'sum' } },
      { aggregates: { umsatz: 'avg', region: 'countDistinct' } },
    ]));
    expect([0, 1, 2, 3].map(c => footerText(host, 0, c))).toEqual(['Sum', '', '', '450']);
    expect([0, 1, 2, 3].map(c => footerText(host, 1, c))).toEqual(['2', '6 rows', '', '75']);
    const label = getCellDiv(host, 'footer', 'center', 0, 0);
    expect(label.classList).toContain('ge-table-footer-label');
    expect(label.getAttribute('role')).toBe('rowheader');
    const value = getCellDiv(host, 'footer', 'center', 0, 3);
    expect(value.classList).toContain('ge-table-footer-aggregate');
    expect(value.getAttribute('role')).toBe('gridcell');
    expect(getComputedStyle(value).textAlign).toMatch(/right|end/);
    expect(getCellDiv(host, 'footer', 'center', 0, 1).classList).not.toContain('ge-table-footer-aggregate');
  });

  it('a long label in a narrow column runs into the empty next cell instead of being cut off', async () => {
    const columns = salesColumns();
    columns[0] = ColumnDef.create({ property: 'region', headerLabel: 'Region', width: px40 });   // never mutate the shared px… sizes
    const { host } = await mount(TableFactory.createTableModel({ rows: createSales(), columnDefs: columns, footerAggregates: { umsatz: 'sum' } }));
    const labelCell = getCellDiv(host, 'footer', 'center', 0, 0);
    const labelDiv = labelCell.querySelector<HTMLElement>('.ge-table-label-div')!;
    expect(getComputedStyle(labelDiv).overflow).toBe('visible');
    const text = labelCell.querySelector<HTMLElement>('.ge-table-label')!;
    expect(text.scrollWidth).toBeGreaterThan(40);
    expect(getComputedStyle(labelCell).whiteSpace).toBe('nowrap');
  });

  it('a footer renderer of the column gets the raw value', async () => {
    const seen: unknown[] = [];
    const euro: CellRendererIf = {
      render(cell: HTMLDivElement, _r: number, _c: number, _a: AreaIdent, _m: AreaModelIf, value: unknown, dom: DomServiceIf) {
        seen.push(value);
        dom.appendChild(cell, dom.createText(`${(value as number).toFixed(2)} €`));
        return undefined;
      },
    };
    const columns = salesColumns();
    columns[3].rendererMap.footer = euro;
    const { host } = await mount(TableFactory.createTableModel({ rows: createSales(), columnDefs: columns, footerAggregates: { umsatz: 'avg' } }));
    expect(footerText(host, 0, 3)).toBe('75.00 €');
    expect(seen).toContain(75);
  });

  it('G12: a label from the data is text, not HTML', async () => {
    const evil = '<img src="x" onerror="window.__aggregationXss = 1">';
    const { host } = await mount(salesModel({ rows: [{ label: () => evil, aggregates: { umsatz: 'sum' } }] }));
    await nextFrame();
    expect(host.querySelector('.ge-table-footer img')).toBeNull();
    expect(footerText(host, 0, 0)).toBe(evil);
    expect((window as unknown as Record<string, unknown>)['__aggregationXss']).toBeUndefined();
  });

  it('G12: a text value (first) and an own format are text, too', async () => {
    const rows = createSales();
    rows[0].produkt = '<b>bold</b>';
    const { host } = await mount(salesModel({ produkt: 'first', umsatz: { aggregator: 'sum', format: () => '<i>x</i>' } }, rows));
    expect(host.querySelector('.ge-table-footer b, .ge-table-footer i')).toBeNull();
    expect(footerText(host, 0, 1)).toBe('<b>bold</b>');
    expect(footerText(host, 0, 3)).toBe('<i>x</i>');
  });

  it('an empty label renders no text', async () => {
    const { host } = await mount(salesModel([{ label: '', aggregates: { umsatz: 'sum' } }]));
    expect(getCellDiv(host, 'footer', 'center', 0, 0).querySelector('.ge-table-label')).toBeNull();
    expect(footerText(host, 0, 3)).toBe('450');
  });

  it('no axe violations', async () => {
    const { host } = await mount(salesModel([
      { label: 'Sum', aggregates: { umsatz: 'sum' } }, { label: 'Average', aggregates: { umsatz: 'avg' } },
    ]));
    expect(await axeViolations(host)).toEqual([]);
  });
});

describe('G3 – the footer follows filter and sorting', () => {
  it('externalFilterChanged(): January → 3 rows, 230; filter removed → 450', async () => {
    let month = 'Jan';
    const { host, api } = await mount(salesModel({ umsatz: 'sum' }), {
      tableOptions: { externalFilterFunction: (r: SaleRow) => !month || r.monat === month },
    });
    expect([footerText(host, 0, 0), footerText(host, 0, 3)]).toEqual(['3 rows', '230']);
    month = '';
    api.externalFilterChanged();
    expect([footerText(host, 0, 0), footerText(host, 0, 3)]).toEqual(['6 rows', '450']);
  });

  it('sorting by header (sortByColumn) and api.sort(): first/last follow the order', async () => {
    const { host, api } = await mount(salesModel({ rows: [{ aggregates: { umsatz: 'first', region: 'last' } }] }));
    expect(footerText(host, 0, 3)).toBe('100');
    api.sortByColumn('umsatz', 'asc');
    expect(footerText(host, 0, 3)).toBe('30');
    api.sort((a: SaleRow, b: SaleRow) => b.umsatz - a.umsatz);
    expect(footerText(host, 0, 3)).toBe('120');
    api.reSort();
    expect(footerText(host, 0, 3)).toBe('120');
  });
});

describe('G9 – changed values', () => {
  it('updateCells() without repaintAll redraws the footer cells', async () => {
    const { host, api } = await mount(salesModel());
    api.updateCells([{ area: 'body', rowIndex: 0, columnIndex: 3, value: 1100, cssClasses: {} }]);
    expect(getCellDiv(host, 'body', 'center', 0, 3).textContent).toBe('1100');
    expect(footerText(host, 0, 3)).toBe('1,450');
  });

  it('updateCells() with repaintAll', async () => {
    const { host, api } = await mount(salesModel());
    api.updateCells([{ area: 'body', rowIndex: 1, columnIndex: 3, value: 0, cssClasses: {} }], true);
    expect(footerText(host, 0, 3)).toBe('400');
  });

  it('editing: the footer has the new value; a value derived in onModelChanged counts after api.repaint()', async () => {
    const rows = createSales().map(r => ({ ...r, doppelt: r.umsatz * 2 }));
    type Row = typeof rows[number];
    const events = new EventAdapter();
    const columns = [...salesColumns(), new ColumnDef('doppelt', 'Doppelt')];
    const tableModel = TableFactory.createTableModel({
      rows, columnDefs: columns, footerAggregates: { umsatz: 'sum', doppelt: 'sum' },
    });
    const { host, api, scope } = await mount(tableModel, { eventListener: events });
    events.onModelChanged = (evt: GeModelChangeEvent) => {
      for (const cell of evt.cells) {
        const row = tableModel.getBodyModel().getRowByIndex(cell.rowIndex) as Row;
        row.umsatz = Number(row.umsatz);
        row.doppelt = row.umsatz * 2;   // derived value – changed after the table repainted
      }
      api.repaint();
    };
    scope.updateModelValueAfterEdit('body', 0, 3, '1100');
    await nextFrame();
    expect(footerText(host, 0, 3)).toBe('1,450');
    expect(footerText(host, 0, 4)).toBe('2,900');
  });

  it('a value changed in the row object directly: shown after api.repaint() (like the cells)', async () => {
    const rows = createSales();
    const { host, api } = await mount(salesModel({ umsatz: 'sum' }, rows));
    rows[2].umsatz = 1080;
    api.repaint();
    expect(footerText(host, 0, 3)).toBe('1,450');
    rows[2].umsatz = 80;
    api.repaintHard();
    expect(footerText(host, 0, 3)).toBe('450');
  });

  it('setRows() + repaintHard()', async () => {
    const { host, api } = await mount(salesModel());
    api.setRows(createSales().slice(0, 2));
    api.repaintHard();
    expect([footerText(host, 0, 0), footerText(host, 0, 3)]).toEqual(['2 rows', '150']);
  });
});

describe('G10 – the footer does not compute again while scrolling', () => {
  it('1,000,000 rows: one pass, scrolling and clicking repaints use the cache', async () => {
    const accessor = vi.fn((r: { value: number }) => r.value);
    const tableModel = TableFactory.createTableModel({
      rows: createRows(1_000_000),
      columnDefs: [new ColumnDef('id', 'Id'), new ColumnDef('name', 'Name'), new ColumnDef('value', 'Value')],
      footerAggregates: { value: { aggregator: 'sum', value: accessor } },
    });
    const { host, api, scope } = await mount(tableModel);
    expect(accessor).toHaveBeenCalledTimes(1_000_000);
    expect(footerText(host, 0, 2)).toBe((3 * 999_999 * 1_000_000 / 2).toLocaleString('en-US'));
    for (const row of [1000, 250_000, 999_990, 0]) {
      api.scrollToIndex(0, row);
      await nextFrame();
    }
    scope.repaint();   // internal repaint (click, hover …)
    await nextFrame();
    expect(accessor).toHaveBeenCalledTimes(1_000_000);
  });
});

describe('Excel export', () => {
  it('contains the footer rows: label as text, results as numbers', async () => {
    const { api, scope } = await mount(salesModel([
      { label: 'Sum', aggregates: { umsatz: 'sum' } }, { aggregates: { umsatz: 'avg' } },
    ]));
    const download = vi.spyOn(scope.excelService, 'downloadExcel').mockResolvedValue(undefined);
    await api.downloadExcel('sales.xlsx');
    const matrix = download.mock.calls[0][0] as unknown[][];
    expect(matrix.slice(-2)).toEqual([['Sum', '', '', 450], ['Average', '', '', 75]]);
  });
});

describe('G11 – getSelectionAggregates()', () => {
  async function mountSelection(type: ExtendedSelectionType, rows: SaleRow[] = createSales(), extra: Partial<Parameters<typeof TableFactory.createTableModel>[0]> = {}) {
    const selectionModel = new SelectionModel(type, 'multi');
    const tableModel = TableFactory.createTableModel({ rows, columnDefs: salesColumns(), ...extra });
    const table = await mount(tableModel, { tableOptions: { getSelectionModel: () => selectionModel } });
    return { ...table, selectionModel };
  }

  it('nothing selected → zeros', async () => {
    const { api } = await mountSelection('range');
    expect(api.getSelectionAggregates()).toEqual({ count: 0, numericCount: 0, sum: 0, avg: undefined, min: undefined, max: undefined, capped: false });
  });

  it('3 × 2 cells (monat, umsatz of rows 1–3): count 6, numbers 3', async () => {
    const { api, selectionModel } = await mountSelection('range');
    selectionModel.addSelection(new CellRange(1, 2, 3, 3));
    expect(api.getSelectionAggregates()).toEqual({ count: 6, numericCount: 3, sum: 250, avg: expect.closeTo(83.333, 3), min: 50, max: 120, capped: false });
  });

  it('two ranges and a toggled cell: only what is selected', async () => {
    const { api, selectionModel } = await mountSelection('range');
    selectionModel.addSelection(new CellRange(0, 3, 1, 3));
    selectionModel.addSelection(new CellRange(4, 3, 5, 3));
    selectionModel.togglePoint(5, 3);   // deselect 30
    expect(api.getSelectionAggregates()).toMatchObject({ count: 3, numericCount: 3, sum: 220, min: 50, max: 100 });
  });

  it('row selection: all visible columns of the rows; hidden columns and row numbers do not count', async () => {
    const { api, selectionModel } = await mountSelection('row', createSales(), { rowNumbersVisible: true });
    api.setColumnVisible('produkt', false);
    selectionModel.addSelection(new CellRange(0, 0, 1, 0));
    expect(api.getSelectionAggregates()).toMatchObject({ count: 6, numericCount: 2, sum: 150 });
  });

  it('select all: the displayed (filtered) rows', async () => {
    const { api, selectionModel } = await mountSelection('range');
    selectionModel.selectAll();
    expect(api.getSelectionAggregates()).toMatchObject({ count: 24, numericCount: 6, sum: 450, avg: 75 });
  });

  it('two single cells far apart are two cells – not capped (the cap counts cells, not the bounding box)', async () => {
    SelectionAggregator.maxCells = 10;
    const { api, selectionModel } = await mountSelection('range');
    selectionModel.addSelection(new CellRange(0, 3, 0, 3));
    selectionModel.addSelection(new CellRange(5, 0, 5, 0));
    selectionModel.addSelection(new CellRange(5, 3, 5, 3));
    selectionModel.addSelection(new CellRange(0, 3, 0, 3));   // twice: counted once
    expect(api.getSelectionAggregates()).toMatchObject({ count: 3, numericCount: 2, sum: 130, capped: false });
  });

  it('more cells than SelectionAggregator.maxCells: nothing computed, capped', async () => {
    SelectionAggregator.maxCells = 10;
    const { api, selectionModel } = await mountSelection('range');
    selectionModel.selectAll();
    expect(api.getSelectionAggregates()).toEqual({ count: 0, numericCount: 0, sum: 0, avg: undefined, min: undefined, max: undefined, capped: true });
  });

  it('only the row number column or rows outside the body: nothing counted', async () => {
    const { api, selectionModel } = await mountSelection('range', createSales(), { rowNumbersVisible: true });
    selectionModel.addSelection(new CellRange(0, 0, 3, 0));
    expect(api.getSelectionAggregates()).toMatchObject({ count: 0, capped: false });
    selectionModel.clear();
    selectionModel.addSelection(new CellRange(10, 1, 12, 4));
    expect(api.getSelectionAggregates()).toMatchObject({ count: 0, capped: false });
  });

  it('the checkbox column does not count', async () => {
    const { api, selectionModel } = await mountSelection('range', createSales(), {
      columnDefs: [new CheckboxColumnDef(), ...salesColumns()],
    });
    selectionModel.addSelection(new CellRange(0, 0, 0, 4));
    expect(api.getSelectionAggregates()).toMatchObject({ count: 4, numericCount: 1, sum: 100 });
  });

  it('without a selection model', async () => {
    const { api } = await mount(salesModel());
    expect(api.getSelectionAggregates().count).toBe(0);
  });

  it('a status bar in plain HTML: onSelectionChanged → text', async () => {
    const selectionModel = new SelectionModel('range', 'multi');
    const status = document.createElement('div');
    const events = new EventAdapter();
    const { api } = await mount(TableFactory.createTableModel({ rows: createSales(), columnDefs: salesColumns() }), {
      eventListener: events, tableOptions: { getSelectionModel: () => selectionModel },
    });
    events.onSelectionChanged = () => {
      const a = api.getSelectionAggregates();
      status.textContent = a.numericCount ? `Sum ${a.sum}` : '';
    };
    selectionModel.addEventSelectionChangedListener(events);
    selectionModel.addSelection(new CellRange(0, 3, 2, 3));
    expect(status.textContent).toBe('Sum 230');
  });
});

describe('own AreaModelAggregateFooter', () => {
  it('works as footerAreaModel and gets invalidated by the table', async () => {
    const columns = salesColumns();
    const tableModel = TableFactory.createTableModel({ rows: createSales(), columnDefs: columns });
    const footer = new AreaModelAggregateFooter(() => tableModel.getBodyModel(), columns, { umsatz: 'max' });
    const withFooter = TableFactory.createTableModel({
      bodyAreaModel: tableModel.getBodyModel(), columnDefs: columns, footerAreaModel: footer,
    });
    const invalidate = vi.spyOn(footer, 'invalidateDerivedValues');
    const { host, api } = await mount(withFooter);
    expect(footerText(host, 0, 3)).toBe('120');
    api.sortByColumn('umsatz', 'desc');
    expect(invalidate).toHaveBeenCalled();
    expect(cellDiv(host, 'footer', 'center', 0, 0)?.textContent).toBe('6 rows');
  });
});
