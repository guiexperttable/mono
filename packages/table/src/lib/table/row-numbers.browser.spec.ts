// Row numbers in a real browser (prompt 004, design prompts/004-zeilennummern.design.md): reference cases N1–N11 –
// rendering, width, sorting/filtering, checkbox column, selection, tree, export, drag/resize, ARIA, header/footer.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import {
  AreaModel,
  CheckboxColumnDef,
  CheckboxModel,
  ColumnDef,
  EventAdapter,
  FocusModel,
  GeMouseEvent,
  RowNumberColumnDef,
  SelectionModel,
  Size,
  TableFactory,
  TreeFactory,
  TrueFn,
  isRowNumberColumnDef,
} from '@guiexpert/table';
import type { ColumnDefIf, ExtendedSelectionType, RowNumberOptionsIf, TableModelIf } from '@guiexpert/table';
import {
  cellDiv,
  createRows,
  destroyAllTables,
  getCellDiv,
  mountTable,
  nextFrame,
  stylePx,
} from '../../../test-utils/mount-table';
import type { MountOptions } from '../../../test-utils/mount-table';
import { axeViolations } from '../../../test-utils/axe';

afterEach(destroyAllTables);

const CTRL = /Mac/i.test(navigator.platform) ? 'Meta' : 'Control';

/** Waits until pending (debounced) repaints are done – a replaced cell can't be clicked. */
async function settle(): Promise<void> {
  await nextFrame();
  await new Promise(resolve => setTimeout(resolve, 5));
  await nextFrame();
}

function columnDefs(): ColumnDefIf[] {
  return [
    ColumnDef.create({ property: 'id', headerLabel: 'Id' }),
    ColumnDef.create({ property: 'name', headerLabel: 'Name' }),
    ColumnDef.create({ property: 'value', headerLabel: 'Value', sortable: TrueFn }),
  ];
}

function numberedModel(rowCount: number, rowNumbersVisible: boolean | Partial<RowNumberOptionsIf> = true): TableModelIf {
  return TableFactory.createTableModel({ rows: createRows(rowCount), columnDefs: columnDefs(), rowNumbersVisible });
}

async function mount(tableModel: TableModelIf, opts: MountOptions = {}) {
  const table = mountTable(tableModel, {
    ...opts,
    tableOptions: { resizeEventDebounceDelay: 1, ...(opts.tableOptions ?? {}) },
  });
  await settle();
  return table;
}

/** Text of the number cell of a body row (west area, column 0), or undefined if not rendered. */
function numberText(host: HTMLElement, rowIndex: number): string | undefined {
  return cellDiv(host, 'body', 'west', rowIndex, 0)?.textContent ?? undefined;
}

/** The texts of all rendered number cells, top to bottom. */
function renderedNumbers(host: HTMLElement): string[] {
  return Array.from(host.querySelectorAll<HTMLElement>('.ge-table-body-west .ge-table-col-div[data-col-index="0"]'))
    .sort((a, b) => Number(a.dataset['rowIndex']) - Number(b.dataset['rowIndex']))
    .map(e => e.textContent ?? '');
}

function numberColumnWidth(host: HTMLElement): number {
  return stylePx(getCellDiv(host, 'header', 'west', 0, 0), 'width');
}

/** 2 million rows without 2 million objects. */
class LargeBodyModel extends AreaModel {
  constructor(private readonly rowCount: number) {
    super();
    this.areaIdent = 'body';
  }
  override getRowCount(): number { return this.rowCount; }
  override getRowHeight(): number { return 34; }
  override getConstantRowHeight(): number { return 34; }
  override getValueAt(row: number, col: number): any { return `cell ${row}/${col}`; }
}

describe('N1 – 1,000 rows', () => {
  it('a fixed column on the left, header "#", numbers 1 … 1000', async () => {
    const { host, api } = await mount(numberedModel(1000));
    expect(getCellDiv(host, 'header', 'west', 0, 0).textContent).toBe('#');
    expect(renderedNumbers(host).slice(0, 3)).toEqual(['1', '2', '3']);
    // the data columns start in the center area with index 1
    expect(getCellDiv(host, 'body', 'center', 0, 1).textContent).toBe('0');
    api.scrollToIndex(-1, 999);
    await settle();
    expect(numberText(host, 999)).toBe('1000');
  });

  it('the width fits "1000" – wider than for 9 rows, narrower than a normal column', async () => {
    const small = await mount(numberedModel(9));
    const narrow = numberColumnWidth(small.host);
    small.destroy();
    const { host } = await mount(numberedModel(1000));
    const wide = numberColumnWidth(host);
    expect(narrow).toBeGreaterThanOrEqual(36);
    expect(wide).toBeGreaterThan(narrow);
    expect(wide).toBeLessThan(100);
    const label = host.querySelector<HTMLElement>('.ge-table-body-west .ge-table-row-number .ge-table-label')!;
    expect(label.scrollWidth).toBeLessThanOrEqual(label.clientWidth); // "1000" is not cut off
  });

  it('the number cells are right aligned with tabular digits', async () => {
    const { host } = await mount(numberedModel(20));
    const cell = getCellDiv(host, 'body', 'west', 0, 0);
    expect(cell.classList.contains('ge-table-row-number')).toBe(true);
    const style = getComputedStyle(cell.querySelector('.ge-table-label')!);
    expect(style.fontVariantNumeric).toContain('tabular-nums');
    expect(getComputedStyle(cell).textAlign).toBe('right');
  });
});

describe('N2 – 2 million rows', () => {
  it('the width fits "2000000", the last row shows 2000000', async () => {
    const def = new RowNumberColumnDef();
    const model = TableFactory.createTableModel({
      bodyAreaModel: new LargeBodyModel(2_000_000),
      headerData: [['#', 'A', 'B']],
      columnDefs: [def, new ColumnDef('a', 'A'), new ColumnDef('b', 'B')],
      fixedLeftColumnCount: 1,
    });
    const { host, api } = await mount(model);
    expect(numberText(host, 0)).toBe('1');
    expect(numberColumnWidth(host)).toBeGreaterThan(50);
    api.scrollToIndex(-1, 1_999_999);
    await settle();
    expect(numberText(host, 1_999_999)).toBe('2000000');
    // a handful of rows in the DOM – the column does not break virtual scrolling
    expect(renderedNumbers(host).length).toBeLessThan(30);
  });
});

describe('N3/N4 – sorting and filtering', () => {
  it('"display": numbers follow the view after sorting (1, 2, 3 …)', async () => {
    const { host, api } = await mount(numberedModel(50));
    api.sort((a: any, b: any) => b.value - a.value);
    await settle();
    expect(renderedNumbers(host).slice(0, 3)).toEqual(['1', '2', '3']);
    expect(getCellDiv(host, 'body', 'center', 0, 1).textContent).toBe('49'); // largest value first
  });

  it('"original": numbers stay with their rows after sorting', async () => {
    const { host, api } = await mount(numberedModel(50, { mode: 'original' }));
    api.sort((a: any, b: any) => b.value - a.value);
    await settle();
    expect(renderedNumbers(host).slice(0, 3)).toEqual(['50', '49', '48']);
  });

  it('"display": 42 of 1,000 rows after filtering → 1 … 42, the column gets narrower again', async () => {
    const filter = { keep: (_r: any) => true };
    const { host, api } = await mount(numberedModel(1000), {
      tableOptions: { externalFilterFunction: (row: any) => filter.keep(row) },
    });
    const before = numberColumnWidth(host);
    filter.keep = (row: any) => row.id < 42;
    api.externalFilterChanged();
    await settle();
    expect(api.getTableModel().getBodyModel().getRowCount()).toBe(42);
    api.scrollToIndex(-1, 41);
    await settle();
    expect(numberText(host, 41)).toBe('42');
    expect(numberColumnWidth(host)).toBeLessThan(before);
  });

  it('"original": the filtered rows keep their original numbers', async () => {
    const filter = { keep: (_r: any) => true };
    const { host, api } = await mount(numberedModel(1000, { mode: 'original' }), {
      tableOptions: { externalFilterFunction: (row: any) => filter.keep(row) },
    });
    filter.keep = (row: any) => row.id >= 500;
    api.externalFilterChanged();
    await settle();
    expect(renderedNumbers(host)[0]).toBe('501');
  });

  it('the width grows when rows are added (setRows)', async () => {
    const model = numberedModel(9);
    const { host, api } = await mount(model);
    const before = numberColumnWidth(host);
    api.setRows(createRows(100_000));
    api.repaintHard(); // the row count changed
    await settle();
    expect(numberColumnWidth(host)).toBeGreaterThan(before);
    // the data columns moved to the right with it
    expect(stylePx(host.querySelector<HTMLElement>('.ge-table-scroll-viewport')!, 'left'))
      .toBeCloseTo(numberColumnWidth(host), 0);
  });
});

describe('width and other column widths (review)', () => {
  it('overridingColumnWidth: the other columns keep the uniform width', async () => {
    const model = TableFactory.createTableModel({
      rows: createRows(50), columnDefs: columnDefs(), rowNumbersVisible: true, overridingColumnWidth: 120,
    });
    const { host } = await mount(model);
    expect(stylePx(getCellDiv(host, 'body', 'center', 0, 1), 'width')).toBe(120);
    expect(numberText(host, 0)).toBe('1');
  });

  it('weight columns are shared again when the number column gets wider (no horizontal scroll bar)', async () => {
    const model = TableFactory.createTableModel({
      rows: createRows(9), rowNumbersVisible: true,
      columnDefs: [
        ColumnDef.create({ property: 'id', headerLabel: 'Id', width: new Size(1, 'weight') }),
        ColumnDef.create({ property: 'name', headerLabel: 'Name', width: new Size(1, 'weight') }),
      ],
    });
    const { host, api } = await mount(model);
    api.setRows(createRows(2_000_000));
    api.repaintHard();
    await settle();
    const viewport = host.querySelector<HTMLElement>('.ge-table-scroll-viewport')!;
    expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.clientWidth + 1);
    expect(numberColumnWidth(host)).toBeGreaterThan(50);
  });

  it('the width uses the font of the number cells (a bigger font → a wider column)', async () => {
    const style = document.createElement('style');
    style.textContent = '.big .ge-table-row-number .ge-table-label { font-size: 28px; }';
    document.head.appendChild(style);
    try {
      const normal = await mount(numberedModel(100_000));
      const before = numberColumnWidth(normal.host);
      normal.destroy();
      const big = mountTable(numberedModel(100_000), { tableOptions: { resizeEventDebounceDelay: 1 } });
      big.host.classList.add('big');
      big.api.repaintHard();
      await settle();
      big.api.repaint();
      await settle();
      expect(numberColumnWidth(big.host)).toBeGreaterThan(before + 20);
      const label = big.host.querySelector<HTMLElement>('.ge-table-body-west .ge-table-row-number .ge-table-label')!;
      expect(label.scrollWidth).toBeLessThanOrEqual(label.clientWidth);
    } finally {
      style.remove();
    }
  });
});

describe('N5 – row numbers and checkbox column', () => {
  it('order: number, checkbox, data – a click on the checkbox in column 1 checks the row', async () => {
    const listener = new EventAdapter();
    const onCheckboxChanged = vi.spyOn(listener, 'onCheckboxChanged');
    const model = TableFactory.createTableModel({
      rows: createRows(20), columnDefs: [new CheckboxColumnDef(), ...columnDefs()], rowNumbersVisible: true,
    });
    const { host } = await mount(model, { eventListener: listener });
    expect(model.getFixedLeftColumnCount()).toBe(1);
    expect(numberText(host, 2)).toBe('3');
    const checkbox = getCellDiv(host, 'body', 'center', 2, 1).querySelector<HTMLInputElement>('input[type=checkbox]');
    expect(checkbox).not.toBeNull();
    await userEvent.click(checkbox!);
    await settle();
    expect(model.getBodyModel().isRowChecked(2)).toBe('full');
    expect(onCheckboxChanged).toHaveBeenCalled();
    // the header checkbox sits in column 1, too
    expect(getCellDiv(host, 'header', 'center', 0, 1).querySelector('input[type=checkbox]')).not.toBeNull();
  });

  it('mouse events report the model column index (click in column 2 hits column 2)', async () => {
    const listener = new EventAdapter();
    const onMouseClicked = vi.spyOn(listener, 'onMouseClicked');
    const model = TableFactory.createTableModel({
      rows: createRows(20), columnDefs: [new CheckboxColumnDef(), ...columnDefs()], rowNumbersVisible: true,
    });
    const { host } = await mount(model, { eventListener: listener });
    await userEvent.click(getCellDiv(host, 'body', 'center', 4, 2));
    await vi.waitFor(() => expect(onMouseClicked).toHaveBeenCalled());
    const event = onMouseClicked.mock.calls.at(-1)![0];
    expect(event.columnIndex).toBe(2);
    expect(event.rowIndex).toBe(4);
    expect(model.getColumnDef(event.columnIndex)?.property).toBe('id');
  });

  it('showCheckboxWihoutExtraColumn: the checkbox is drawn into the first data column', async () => {
    const model = TableFactory.createTableModel({
      rows: createRows(5), columnDefs: columnDefs(), rowNumbersVisible: true,
    });
    model.getBodyModel().rowSelectionModel = new CheckboxModel();
    const { host } = await mount(model, { tableOptions: { showCheckboxWihoutExtraColumn: true } });
    expect(getCellDiv(host, 'body', 'west', 0, 0).querySelector('input')).toBeNull();
    expect(getCellDiv(host, 'body', 'center', 0, 1).querySelector('input[type=checkbox]')).not.toBeNull();
  });
});

describe('N6 – a click on a number selects the row', () => {
  async function mountSelection(type: ExtendedSelectionType) {
    const sm = new SelectionModel(type, 'multi');
    const fm = new FocusModel('cell');
    const table = await mount(numberedModel(30), {
      tableOptions: { getSelectionModel: () => sm, getFocusModel: () => fm },
    });
    return { ...table, sm, fm };
  }

  async function clickNumber(host: HTMLElement, row: number, ...modifiers: string[]) {
    await userEvent.click(getCellDiv(host, 'body', 'west', row, 0), modifiers.length ? { modifiers: modifiers as any } : undefined);
    await settle();
  }

  it('selection type "range": the whole row', async () => {
    const { host, sm } = await mountSelection('range');
    await clickNumber(host, 3);
    expect(sm.isSelected(3, 1)).toBe(true);
    expect(sm.isSelected(3, 3)).toBe(true);
    expect(sm.isSelected(2, 1)).toBe(false);
  });

  it('"range": Shift-click extends to a block of rows, Ctrl/⌘ toggles a row', async () => {
    const { host, sm } = await mountSelection('range');
    await clickNumber(host, 2);
    await clickNumber(host, 5, 'Shift');
    expect([1, 2, 3, 4, 5, 6].map(r => sm.isSelected(r, 2))).toEqual([false, true, true, true, true, false]);
    await clickNumber(host, 4, CTRL);
    expect(sm.isSelected(4, 2)).toBe(false);
    expect(sm.isSelected(3, 2)).toBe(true);
    await clickNumber(host, 10, CTRL);
    expect(sm.isSelected(10, 3)).toBe(true);
    expect(sm.isSelected(2, 2)).toBe(true);
  });

  it('selection type "row": the row (like any cell of it), Shift extends', async () => {
    const { host, sm } = await mountSelection('row');
    await clickNumber(host, 1);
    await clickNumber(host, 3, 'Shift');
    expect([0, 1, 2, 3, 4].map(r => sm.isSelected(r, 3))).toEqual([false, true, true, true, false]);
  });

  it('a click on the "#" header cell selects all', async () => {
    const { host, sm } = await mountSelection('range');
    await userEvent.click(getCellDiv(host, 'header', 'west', 0, 0));
    await settle();
    expect(sm.isSelected(0, 1)).toBe(true);
    expect(sm.isSelected(29, 3)).toBe(true);
  });

  it('"range": Space (TOGGLE_SELECTION) on a focused number toggles the whole row', async () => {
    const { host, sm } = await mountSelection('range');
    await clickNumber(host, 6);
    await clickNumber(host, 6, CTRL); // deselected again, the focus stays on the number
    expect(sm.isSelected(6, 3)).toBe(false);
    host.focus();
    await userEvent.keyboard(' ');
    expect(sm.isSelected(6, 3)).toBe(true);
    await userEvent.keyboard(' ');
    expect(sm.isSelected(6, 3)).toBe(false);
  });

  it('two header rows: only the lowest "#" cell selects all', async () => {
    const sm = new SelectionModel('range', 'multi');
    const model = TableFactory.createTableModel({
      rows: createRows(10), columnDefs: columnDefs(), rowNumbersVisible: true,
      headerData: [['Order', '', ''], ['Id', 'Name', 'Value']],
    });
    const { host } = await mount(model, { tableOptions: { getSelectionModel: () => sm, getFocusModel: () => new FocusModel('cell') } });
    expect(getCellDiv(host, 'header', 'west', 0, 0).textContent).toBe('');
    await userEvent.click(getCellDiv(host, 'header', 'west', 0, 0));
    await settle();
    expect(sm.hasSelection()).toBe(false);
    await userEvent.click(getCellDiv(host, 'header', 'west', 1, 0));
    await settle();
    expect(sm.isSelected(9, 3)).toBe(true);
  });

  it('selection type "cell": the number cell gets the focus, nothing else changes', async () => {
    const { host, sm, fm } = await mountSelection('cell');
    await clickNumber(host, 2);
    expect(fm.getFocus()).toEqual([2, 0]);
    expect(sm.isSelected(2, 1)).toBe(false);
  });
});

describe('N7 – tree', () => {
  function treeModel(): TableModelIf {
    const roots = TreeFactory.buildTreeRows([
      { name: 'Europe', kids: [{ name: 'Berlin' }, { name: 'Paris' }] },
      { name: 'Asia', kids: [{ name: 'Tokyo' }] },
    ] as any[], 'kids');
    return TableFactory.createTableModel({
      rows: roots, columnDefs: [new ColumnDef('name', 'Name')], rowNumbersVisible: true,
    });
  }

  it('numbers the visible rows; the tree arrow sits in the first data column', async () => {
    const { host } = await mount(treeModel());
    expect(renderedNumbers(host)).toEqual(['1', '2', '3', '4', '5']);
    expect(getCellDiv(host, 'body', 'west', 0, 0).querySelector('.ge-table-tree-arrow-div')).toBeNull();
    expect(getCellDiv(host, 'body', 'center', 0, 1).querySelector('.ge-table-tree-arrow-div')).not.toBeNull();
  });

  it('the numbers stay right aligned in a tree (review: tree cell classes made them left aligned)', async () => {
    const { host } = await mount(treeModel());
    const cell = getCellDiv(host, 'body', 'west', 1, 0);
    expect(getComputedStyle(cell).textAlign).toBe('right');
    expect(getComputedStyle(cell.querySelector('.ge-table-label-div')!).display).toBe('block');
  });

  it('collapsing a node renumbers the rows below', async () => {
    const { host } = await mount(treeModel());
    const arrow = getCellDiv(host, 'body', 'center', 0, 1).querySelector<HTMLElement>('.ge-table-tree-arrow-div')!;
    await userEvent.click(arrow);
    await settle();
    expect(renderedNumbers(host)).toEqual(['1', '2', '3']);
    expect(getCellDiv(host, 'body', 'center', 1, 1).textContent).toContain('Asia');
  });
});

describe('N8 – copy and Excel', () => {
  async function mountForExport(options: Partial<RowNumberOptionsIf> = {}) {
    const sm = new SelectionModel('row', 'multi');
    const fm = new FocusModel('cell');
    const table = await mount(numberedModel(3, options), {
      tableOptions: { getSelectionModel: () => sm, getFocusModel: () => fm },
    });
    return { ...table, sm, fm };
  }

  it('copy leaves the number column out by default', async () => {
    const { scope, api, sm, fm } = await mountForExport();
    sm.selectAll();
    expect(await scope.copyService.createContent(api.getTableModel(), sm, fm))
      .toBe('0\tName 0\t0\n1\tName 1\t3\n2\tName 2\t6');
  });

  it('copy with exported: true contains the numbers', async () => {
    const { scope, api, sm, fm } = await mountForExport({ exported: true, mode: 'display' });
    sm.selectAll();
    expect(await scope.copyService.createContent(api.getTableModel(), sm, fm))
      .toBe('1\t0\tName 0\t0\n2\t1\tName 1\t3\n3\t2\tName 2\t6');
  });

  it('copy without selection: the focused number cell copies its number (review: was "undefined")', async () => {
    const { scope, api, sm, fm } = await mountForExport();
    sm.clear();
    fm.setFocus(2, 0);
    expect(await scope.copyService.createContent(api.getTableModel(), sm, fm)).toBe('3');
  });

  it('Excel leaves the number column out by default', async () => {
    const { scope, api } = await mountForExport();
    const download = vi.spyOn(scope.excelService, 'downloadExcel').mockResolvedValue(undefined);
    await api.downloadExcel();
    const matrix = download.mock.calls[0][0];
    expect(matrix[0]).toEqual(['Id', 'Name', 'Value']);
    expect(matrix[1]).toEqual([0, 'Name 0', 0]);
  });

  it('Excel with exported: true and the default format: numbers, not texts', async () => {
    const { scope, api } = await mountForExport({ exported: true });
    const download = vi.spyOn(scope.excelService, 'downloadExcel').mockResolvedValue(undefined);
    await api.downloadExcel();
    expect(download.mock.calls[0][0][2][0]).toBe(2);
  });

  it('Excel with exported: true: header "#", the numbers of the view', async () => {
    const { scope, api } = await mountForExport({ exported: true, format: n => `${n}.` });
    const download = vi.spyOn(scope.excelService, 'downloadExcel').mockResolvedValue(undefined);
    api.sort((a: any, b: any) => b.value - a.value);
    await api.downloadExcel();
    const matrix = download.mock.calls[0][0];
    expect(matrix[0]).toEqual(['#', 'Id', 'Name', 'Value']);
    expect(matrix[1]).toEqual(['1.', 2, 'Name 2', 6]);
    expect(matrix[3]).toEqual(['3.', 0, 'Name 0', 0]);
  });
});

describe('N9 – not movable, not sortable, not resizable', () => {
  function mouseEvent(columnIndex: number, action = ''): GeMouseEvent {
    const e = new GeMouseEvent();
    e.areaIdent = 'header';
    e.sideIdent = 'center';
    e.rowIndex = 0;
    e.columnIndex = columnIndex;
    e.action = action;
    return e;
  }

  it('no resize handle and no drag action on the number header cell', async () => {
    const { host } = await mount(numberedModel(10), { tableOptions: { columnsResizable: true, columnsDraggable: true } });
    const numberHeader = getCellDiv(host, 'header', 'west', 0, 0);
    expect(numberHeader.getAttribute('data-ge-action')).toBeNull();
    expect(host.querySelector('.ge-table-header-west [data-ge-action="resize-column"][data-col-index="0"]')).toBeNull();
    expect(getCellDiv(host, 'header', 'center', 0, 1).getAttribute('data-ge-action')).toBe('drag-column');
  });

  it('no column can be dragged in front of the number column', async () => {
    const { scope, api } = await mount(numberedModel(10), { tableOptions: { columnsDraggable: true } });
    const start = mouseEvent(2, 'drag-column');
    scope.onMouseDown(start);
    scope.mouseDraggingOnFrame(mouseEvent(0), start);
    scope.mouseDraggingEndOnFrame(mouseEvent(0));
    const model = api.getTableModel();
    expect(isRowNumberColumnDef(model.getColumnDef(0))).toBe(true);
    expect(model.getColumnDef(1)?.property).toBe('name'); // moved to the first data column
    expect(model.getColumnDef(2)?.property).toBe('id');
  });

  it('a double click on the "#" header does not sort', async () => {
    const { host, api } = await mount(numberedModel(10));
    await userEvent.dblClick(getCellDiv(host, 'header', 'west', 0, 0));
    await settle();
    expect(api.getTableModel().getColumnDef(0)?.sortState ?? '').toBe('');
    expect(getCellDiv(host, 'body', 'center', 0, 1).textContent).toBe('0');
  });

  it('autoResizeColumns() keeps the width of the number column', async () => {
    const { host, api } = await mount(numberedModel(1000));
    const before = numberColumnWidth(host);
    api.autoResizeColumns();
    await settle();
    expect(numberColumnWidth(host)).toBe(before);
  });
});

describe('N10 – screen readers', () => {
  it('number cells are row headers; axe finds nothing', async () => {
    const { host } = await mount(numberedModel(20), {
      tableOptions: { ariaLabel: 'Orders' } as any,
    });
    const cell = getCellDiv(host, 'body', 'west', 0, 0);
    expect(cell.getAttribute('role')).toBe('rowheader');
    expect(getCellDiv(host, 'body', 'center', 0, 1).getAttribute('role')).toBe('gridcell');
    expect(getCellDiv(host, 'header', 'west', 0, 0).getAttribute('role')).toBe('columnheader');
    expect(cell.getAttribute('aria-colindex')).toBe('1');
    expect(await axeViolations(host)).toEqual([]);
  });
});

describe('N11 – header and footer', () => {
  it('own header label ("" allowed), empty footer cell', async () => {
    const model = TableFactory.createTableModel({
      rows: createRows(5), columnDefs: columnDefs(), rowNumbersVisible: { headerLabel: 'No.' },
      footerData: [['Σ', '', '30']],
    });
    const { host } = await mount(model);
    expect(getCellDiv(host, 'header', 'west', 0, 0).textContent).toBe('No.');
    expect(getCellDiv(host, 'footer', 'west', 0, 0).textContent).toBe('');
    expect(getCellDiv(host, 'footer', 'center', 0, 1).textContent).toBe('Σ');
  });
});

describe('format and HTML injection', () => {
  it('format() output is shown as text, never as HTML', async () => {
    const { host } = await mount(numberedModel(3, { format: n => `<img src="x" onerror="window.__rn=${n}">` }));
    expect(host.querySelector('img')).toBeNull();
    expect(numberText(host, 0)).toBe('<img src="x" onerror="window.__rn=1">');
    expect((window as any).__rn).toBeUndefined();
  });

  it('thousands separators with format()', async () => {
    const { host, api } = await mount(numberedModel(1500, { format: n => n.toLocaleString('en-US') }));
    api.scrollToIndex(-1, 1499);
    await settle();
    expect(numberText(host, 1499)).toBe('1,500');
  });
});

describe('TableApi.getColumnIndex()', () => {
  it('finds a column by property – the number column shifts all indices by one', async () => {
    const { api } = await mount(numberedModel(3));
    expect(api.getColumnIndex('id')).toBe(1);
    expect(api.getColumnIndex('value')).toBe(3);
    expect(api.getColumnIndex('RowNumberColumn')).toBe(0);
    expect(api.getColumnIndex('nope')).toBe(-1);
  });
});

describe('own area models', () => {
  it('a RowNumberColumnDef works with an AreaModel without renderers (the column definition renders)', async () => {
    const model = TableFactory.createTableModel({
      bodyAreaModel: new LargeBodyModel(100),
      headerData: [['#', 'A']],
      columnDefs: [new RowNumberColumnDef(), new ColumnDef('a', 'A')],
      fixedLeftColumnCount: 1,
    });
    const { host } = await mount(model);
    expect(numberText(host, 4)).toBe('5');
    expect(getCellDiv(host, 'body', 'center', 4, 1).textContent).toBe('cell 4/1');
  });
});
