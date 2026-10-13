// Cell renderers in a real browser: the DOM the built-in renderers produce, the arguments a custom CellRendererIf
// receives, renderer cleanup functions (RendererCleanupFnType), and the per-cell hooks of the area model
// (getCustomClassesAt / getCustomStyleAt / getTooltipAt).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import {
  ActionEvent,
  ActionsCellRenderer,
  AreaModelObjectArrayWithColumndefs,
  CellGroupExtCellRenderer,
  CheckboxBooleanPropertyCellRenderer,
  CheckboxColumnDef,
  ColumnDef,
  CrudAction,
  DateToIntlDDMMYYYYCellRenderer,
  DateToIsoCellRenderer,
  DateToLocaleDateCellRenderer,
  DateToTecCellRenderer,
  EventAdapter,
  MaleFemaleToIconCellRenderer,
  NumberCellProgressBarCellRenderer,
  NumberCellRenderer,
  PositiveAndNegativeNumberRenderer,
  ProgressBarCellRenderer,
  Renderer,
  SelectCellRenderer,
  SimpleArrayCellRenderer,
  SimpleDomService,
  StarRatingCellRenderer,
  TableFactory,
  TrueFalseCellRenderer,
  ValueLabel,
  px100,
  px200,
} from '@guiexpert/table';
import type { AreaIdent, AreaModelIf, CellGroupExt, CellRendererIf, ColumnDefIf, DomServiceIf } from '@guiexpert/table';
import {
  createRows,
  destroyAllTables,
  getCellDiv,
  mountTable,
  nextFrame,
  renderedRows,
} from '../../../../test-utils/mount-table';

afterEach(() => {
  destroyAllTables();
  vi.restoreAllMocks();
});

/** Mounts a one-row table: column 0 = id, column 1 = `v` with the renderer. Returns the cell div of `v`. */
async function renderCell(renderer: CellRendererIf, value: unknown, extra: Record<string, unknown> = {}) {
  const rows = [{ id: 0, v: value, ...extra }];
  const columnDefs = [
    ColumnDef.create({ property: 'id', width: px100 }),
    ColumnDef.create({ property: 'v', width: px200, bodyRenderer: renderer }),
  ];
  const table = mountTable(TableFactory.createTableModel({ rows, columnDefs }));
  await nextFrame();
  return { ...table, cell: getCellDiv(table.host, 'body', 'center', 0, 1), row: rows[0] };
}

const label = (cell: HTMLElement) => cell.querySelector('.ge-table-label')?.textContent?.trim();

describe('built-in cell renderers', () => {

  describe('NumberCellRenderer', () => {
    it('renders the number in a label', async () => {
      const { cell } = await renderCell(new NumberCellRenderer(), 42);
      expect(label(cell)).toBe('42');
      expect(cell.querySelector('.ge-table-label-div > .ge-table-label')).not.toBeNull();
      expect(cell.classList).not.toContain('ge-cell-error');
    });

    it('marks values outside [min, max] and strings with ge-cell-error', async () => {
      expect((await renderCell(new NumberCellRenderer(0, 100), 150)).cell.classList).toContain('ge-cell-error');
      expect((await renderCell(new NumberCellRenderer(0, 100), -1)).cell.classList).toContain('ge-cell-error');
      expect((await renderCell(new NumberCellRenderer(0, 100), 100)).cell.classList).not.toContain('ge-cell-error');
      // NOTE: a numeric string is an error as well (typeof check) – and the core CSS has no rule for ge-cell-error.
      expect((await renderCell(new NumberCellRenderer(), '12')).cell.classList).toContain('ge-cell-error');
    });

    // Regression: number-cell-renderer.ts `if (cellValue)` rendered the number 0 as an empty cell.
    it('renders the number 0', async () => {
      const { cell } = await renderCell(new NumberCellRenderer(), 0);
      expect(cell.textContent?.trim()).toBe('0');
    });
  });

  describe('PositiveAndNegativeNumberRenderer', () => {
    it('adds ge-positive-text-color / ge-negative-text-color', async () => {
      const pos = (await renderCell(new PositiveAndNegativeNumberRenderer(), 5)).cell;
      expect(label(pos)).toBe('5');
      expect(pos.classList).toContain('ge-positive-text-color');
      const neg = (await renderCell(new PositiveAndNegativeNumberRenderer(), -5)).cell;
      expect(label(neg)).toBe('-5');
      expect(neg.classList).toContain('ge-negative-text-color');
    });

    // Regression: positive-and-negative-number-renderer.ts had `data-row-index=${rowIndex}"` (opening quote missing,
    // the attribute value was `0"` → a click on the label div was reported with rowIndex NaN).
    it('the label div carries the row index', async () => {
      const { cell } = await renderCell(new PositiveAndNegativeNumberRenderer(), 5);
      expect(cell.querySelector('.ge-table-label-div')!.getAttribute('data-row-index')).toBe('0');
    });

    // Regression: positive-and-negative-number-renderer.ts `if (cellValue)` rendered the number 0 as an empty cell.
    it('renders the number 0', async () => {
      const { cell } = await renderCell(new PositiveAndNegativeNumberRenderer(), 0);
      expect(cell.textContent?.trim()).toBe('0');
    });
  });

  describe('progress bars', () => {
    it('NumberCellProgressBarCellRenderer: bar width = value / maxValue, optional % label as title', async () => {
      const { cell } = await renderCell(new NumberCellProgressBarCellRenderer(200, true), 50);
      expect(cell.classList).toContain('ge-progressbar-div');
      expect(cell.querySelector<HTMLElement>('.ge-table-progress-container > .ge-table-progress-bar')!.style.width).toBe('25%');
      expect(cell.querySelector('.ge-table-label-div')!.getAttribute('title')).toBe('25%');
      const noLabel = (await renderCell(new NumberCellProgressBarCellRenderer(), 30)).cell;
      expect(noLabel.querySelector<HTMLElement>('.ge-table-progress-bar')!.style.width).toBe('30%');
      expect(noLabel.querySelector('.ge-table-label-div')!.getAttribute('title')).toBe('');
    });

    it('ProgressBarCellRenderer reads the value from the row property', async () => {
      const { cell } = await renderCell(new ProgressBarCellRenderer('done', 10, true), 'ignored', { done: 7 });
      expect(cell.querySelector<HTMLElement>('.ge-table-progress-bar')!.style.width).toBe('70%');
      expect(cell.querySelector('.ge-table-label-div')!.getAttribute('title')).toBe('70%');
      // NOTE: progress-bar-cell-renderer.ts:30 adds the class of the star rating (ge-star-rating-div, yellow text),
      // not ge-progressbar-div like NumberCellProgressBarCellRenderer.
      expect(cell.classList).toContain('ge-star-rating-div');
    });
  });

  it('StarRatingCellRenderer renders one star per point of the row property', async () => {
    const { cell } = await renderCell(new StarRatingCellRenderer('stars'), 'ignored', { stars: 3 });
    expect(cell.classList).toContain('ge-star-rating-div');
    expect(label(cell)).toBe('★ ★ ★');
    expect(label((await renderCell(new StarRatingCellRenderer('stars'), 'x', { stars: 0 })).cell)).toBe('');
  });

  describe('date renderers', () => {
    const date = new Date(Date.UTC(2026, 9, 13, 8, 5, 3));

    it('DateToIntlDDMMYYYYCellRenderer: dd.mm.yyyy (de-DE), invalid values as they are', async () => {
      expect(label((await renderCell(new DateToIntlDDMMYYYYCellRenderer(), '2026-10-13')).cell)).toBe('13.10.2026');
      expect(label((await renderCell(new DateToIntlDDMMYYYYCellRenderer(), 'soon')).cell)).toBe('soon');
    });

    it('DateToIsoCellRenderer: ISO string', async () => {
      expect((await renderCell(new DateToIsoCellRenderer(), date.getTime())).cell.textContent).toBe('2026-10-13T08:05:03.000Z');
    });

    it('DateToTecCellRenderer: "yyyy-mm-dd hh:mm:ss" (UTC)', async () => {
      expect((await renderCell(new DateToTecCellRenderer(), date.toISOString())).cell.textContent).toBe('2026-10-13 08:05:03');
    });

    it('DateToLocaleDateCellRenderer: toLocaleDateString() of the browser', async () => {
      expect((await renderCell(new DateToLocaleDateCellRenderer(), date)).cell.textContent).toBe(date.toLocaleDateString());
    });

    it('empty values render an empty cell', async () => {
      for (const renderer of [new DateToIsoCellRenderer(), new DateToTecCellRenderer(), new DateToLocaleDateCellRenderer(), new DateToIntlDDMMYYYYCellRenderer()]) {
        expect((await renderCell(renderer, null)).cell.textContent?.trim()).toBe('');
      }
    });

    // BUG: date-to-iso-cell-renderer.ts / date-to-tec-cell-renderer.ts call toISOString() without try/catch (unlike
    // DateToIntlDDMMYYYYCellRenderer) – ONE invalid date throws a RangeError out of the render pass and the whole
    // table stays empty.
    it.fails('DateToIsoCellRenderer: an invalid date does not break the table', async () => {
      await renderCell(new DateToIsoCellRenderer(), 'not a date');
    });

    it.fails('DateToTecCellRenderer: an invalid date does not break the table', async () => {
      await renderCell(new DateToTecCellRenderer(), 'not a date');
    });
  });

  it('TrueFalseCellRenderer: ✅ / ❌ for booleans and "true"/"false", empty otherwise', async () => {
    for (const value of [true, 'true']) {
      const span = (await renderCell(new TrueFalseCellRenderer(), value)).cell.querySelector('span')!;
      expect(span.className).toBe('ge-true-text-color');
      expect(span.textContent).toBe('✅');
    }
    for (const value of [false, 'false']) {
      const span = (await renderCell(new TrueFalseCellRenderer(), value)).cell.querySelector('span')!;
      expect(span.className).toBe('ge-false-text-color');
      expect(span.textContent).toBe('❌');
    }
    expect((await renderCell(new TrueFalseCellRenderer(), 'maybe')).cell.textContent).toBe('');
  });

  it('MaleFemaleToIconCellRenderer: ♂ / ♀', async () => {
    expect((await renderCell(new MaleFemaleToIconCellRenderer(), 'male')).cell.textContent).toBe('♂');
    expect((await renderCell(new MaleFemaleToIconCellRenderer(), 'm')).cell.textContent).toBe('♂');
    expect((await renderCell(new MaleFemaleToIconCellRenderer(), 'female')).cell.textContent).toBe('♀');
    expect((await renderCell(new MaleFemaleToIconCellRenderer(), 'f')).cell.textContent).toBe('♀');
    expect((await renderCell(new MaleFemaleToIconCellRenderer(), 'x')).cell.textContent).toBe('');
  });

  it('SimpleArrayCellRenderer: comma separated values', async () => {
    expect(label((await renderCell(new SimpleArrayCellRenderer(), ['a', 'b', 'c'])).cell)).toBe('a, b, c');
    expect((await renderCell(new SimpleArrayCellRenderer(), [])).cell.textContent).toBe('');
  });

  it('Renderer.bodyRenderer() builds a renderer map for the body only', async () => {
    const columnDefs = [
      new ColumnDef('id', 'Id', px100, undefined, Renderer.bodyRenderer(new TrueFalseCellRenderer())),
    ];
    const { host } = mountTable(TableFactory.createTableModel({ rows: [{ id: true }], columnDefs }));
    await nextFrame();
    expect(getCellDiv(host, 'body', 'center', 0, 0).textContent).toBe('✅');
    expect(getCellDiv(host, 'header', 'center', 0, 0).textContent).toBe('Id');
  });

  it('the text of a value is set as text, not as HTML (default rendering without renderer)', async () => {
    const { cell } = await renderCell(undefined as unknown as CellRendererIf, '<b>bold</b>');
    expect(label(cell)).toBe('<b>bold</b>');
    expect(cell.querySelector('b')).toBeNull();
  });
});

describe('checkbox renderers', () => {

  it('CheckboxColumnDef: a click on a row checkbox checks the row and fires onCheckboxChanged', async () => {
    const listener = new EventAdapter();
    const changed: unknown[][] = [];
    listener.onCheckboxChanged = rows => changed.push(rows);
    const rows = createRows(10);
    const columnDefs = [new CheckboxColumnDef(), ColumnDef.create({ property: 'name', width: px100 })] as ColumnDefIf[];
    const { host } = mountTable(TableFactory.createTableModel({ rows, columnDefs }), { eventListener: listener });
    await nextFrame();
    const cell = getCellDiv(host, 'body', 'center', 2, 0);
    expect(cell.classList).toContain('ge-table-row-checkbox-div');
    const input = cell.querySelector<HTMLInputElement>('input.ge-table-row-checkbox')!;
    expect(input.checked).toBe(false);
    expect(input.getAttribute('data-input-type')).toBe('checkbox');

    await userEvent.click(input);
    expect(changed).toEqual([[rows[2]]]);
    expect(getCellDiv(host, 'body', 'center', 2, 0).querySelector<HTMLInputElement>('input')!.checked).toBe(true);
    expect(getCellDiv(host, 'body', 'center', 3, 0).querySelector<HTMLInputElement>('input')!.checked).toBe(false);

    await userEvent.click(getCellDiv(host, 'body', 'center', 4, 0).querySelector('input')!);
    expect(changed[1]).toEqual([rows[2], rows[4]]);
  });

  // BUG: mouse-handler.ts:89 – a second click on the same cell within doubleClickDelay (500 ms) is treated as part of
  // a double click and returns before the checkbox handling: the browser unchecks the input, the row stays checked
  // in the model and onCheckboxChanged is not fired (DOM and model disagree until the next repaint).
  it.fails('CheckboxColumnDef: a quick second click on the same checkbox unchecks the row', async () => {
    const listener = new EventAdapter();
    const changed: unknown[][] = [];
    listener.onCheckboxChanged = rows => changed.push(rows);
    const rows = createRows(10);
    const columnDefs = [new CheckboxColumnDef(), ColumnDef.create({ property: 'name', width: px100 })] as ColumnDefIf[];
    const { host, scope } = mountTable(TableFactory.createTableModel({ rows, columnDefs }), { eventListener: listener });
    scope.mouseHandler.doubleClickDelay = 60_000; // "quick" independent of the machine speed
    await nextFrame();
    await userEvent.click(getCellDiv(host, 'body', 'center', 2, 0).querySelector('input')!);
    await userEvent.click(getCellDiv(host, 'body', 'center', 2, 0).querySelector('input')!);
    expect(changed).toEqual([[rows[2]], []]);
  });

  // BUG: table-scope.ts:491 reads the checked rows from the model of the CLICKED area – a click on the header
  // checkbox of CheckboxColumnDef (rendered by CheckboxCellRenderer) checks nothing and reports [] although body
  // rows are checked.
  it.fails('CheckboxColumnDef: a click on the header checkbox reports the checked body rows', async () => {
    const listener = new EventAdapter();
    const changed: unknown[][] = [];
    listener.onCheckboxChanged = rows => changed.push(rows);
    const rows = createRows(10);
    const columnDefs = [new CheckboxColumnDef(), ColumnDef.create({ property: 'name', width: px100 })] as ColumnDefIf[];
    const { host } = mountTable(TableFactory.createTableModel({ rows, columnDefs }), { eventListener: listener });
    await nextFrame();
    await userEvent.click(getCellDiv(host, 'body', 'center', 2, 0).querySelector('input')!);
    await userEvent.click(getCellDiv(host, 'header', 'center', 0, 0).querySelector('input')!);
    expect(changed[changed.length - 1]).toContain(rows[2]);
  });

  it('CheckboxBooleanPropertyCellRenderer shows and toggles a boolean row property', async () => {
    const listener = new EventAdapter();
    const changed: unknown[][] = [];
    listener.onCheckboxChanged = rows => changed.push(rows);
    const rows = createRows(5).map(r => ({ ...r, active: r.id % 2 === 0 }));
    const columnDefs = [
      ColumnDef.create({ property: 'id', width: px100 }),
      ColumnDef.create({ property: 'active', width: px100, bodyRenderer: new CheckboxBooleanPropertyCellRenderer('active') }),
    ];
    const { host } = mountTable(TableFactory.createTableModel({ rows, columnDefs }), { eventListener: listener });
    await nextFrame();
    const box = (r: number) => getCellDiv(host, 'body', 'center', r, 1).querySelector<HTMLInputElement>('input.ge-input-checkbox')!;
    expect([0, 1, 2].map(r => box(r).checked)).toEqual([true, false, true]);
    expect(box(1).getAttribute('data-property-index')).toBe('active');

    await userEvent.click(box(1));
    expect(rows[1].active).toBe(true);
    expect(box(1).checked).toBe(true);
    // NOTE: the property checkbox carries data-input-type="checkbox" → the click is also handled as ROW checkbox
    // click (toggleRowCheckbox, repaint, onCheckboxChanged with the – empty – checked rows).
    expect(changed).toEqual([[]]);
  });

  it('CheckboxBooleanPropertyCellRenderer(…, readonly = true) does not change the property', async () => {
    const rows = createRows(3).map(r => ({ ...r, active: false }));
    const columnDefs = [
      ColumnDef.create({ property: 'id', width: px100 }),
      ColumnDef.create({ property: 'active', width: px100, bodyRenderer: new CheckboxBooleanPropertyCellRenderer('active', true, true) }),
    ];
    const { host } = mountTable(TableFactory.createTableModel({ rows, columnDefs }));
    await nextFrame();
    const input = getCellDiv(host, 'body', 'center', 1, 1).querySelector<HTMLInputElement>('input')!;
    expect(input.hasAttribute('readonly')).toBe(true);
    await userEvent.click(input);
    expect(rows[1].active).toBe(false);
    expect(getCellDiv(host, 'body', 'center', 1, 1).querySelector<HTMLInputElement>('input')!.checked).toBe(false);
  });
});

describe('ActionsCellRenderer', () => {

  async function mountActions() {
    const onActionEvent = vi.fn();
    const actions = [
      new CrudAction('VIEW', 'View', '', 'my-view', 'link'),
      new CrudAction('EDIT', 'Edit', '', 'my-edit', 'button'),
      new CrudAction('DELETE', 'Delete', '', '', 'button', false),
    ];
    const rows = createRows(5).map(r => ({ ...r, id: 100 + r.id }));
    const columnDefs = [
      ColumnDef.create({ property: 'name', width: px100 }),
      ColumnDef.create({ property: 'id', width: px200, bodyRenderer: new ActionsCellRenderer({ onActionEvent }, actions) }),
    ];
    const table = mountTable(TableFactory.createTableModel({ rows, columnDefs }));
    await nextFrame();
    return { ...table, onActionEvent };
  }

  it('renders a link or button per action with the id of the row', async () => {
    const { host } = await mountActions();
    const cell = getCellDiv(host, 'body', 'center', 3, 1);
    expect(cell.classList).toContain('ge-table-row-action-div');
    const link = cell.querySelector<HTMLAnchorElement>('a.ge-table-cell-action.ge-table-cell-link.my-view')!;
    expect(link.textContent!.trim()).toBe('View');
    expect(link.dataset).toMatchObject({ action: 'VIEW', id: '103', rowIndex: '3', colIndex: '1', area: 'body', listen: 'click' });
    const buttons = Array.from(cell.querySelectorAll<HTMLButtonElement>('button.ge-table-cell-button'));
    expect(buttons.map(b => b.textContent!.trim())).toEqual(['Edit', 'Delete']);
    expect(buttons[0].disabled).toBe(false);
    expect(buttons[1].disabled).toBe(true);
  });

  it('a click calls onActionEvent with an ActionEvent', async () => {
    const { host, onActionEvent } = await mountActions();
    await userEvent.click(getCellDiv(host, 'body', 'center', 3, 1).querySelector('button.my-edit')!);
    expect(onActionEvent).toHaveBeenCalledTimes(1);
    const evt: ActionEvent = onActionEvent.mock.calls[0][0];
    expect(evt).toBeInstanceOf(ActionEvent);
    expect(evt).toMatchObject({ action: 'EDIT', area: 'body', rowIndex: 3, columnIndex: 1 });
    // NOTE: the id is read back from the data-id attribute – always a string (here the number 103).
    expect(evt.id).toBe('103');
  });

  it('a cell value that is an array of CrudActions replaces the default actions', async () => {
    const own = [new CrudAction('OPEN', 'Open', '', 'my-open', 'button')];
    const { cell } = await renderCell(new ActionsCellRenderer({ onActionEvent: () => undefined }, [new CrudAction('VIEW', 'View')]), own);
    expect(Array.from(cell.querySelectorAll('.ge-table-cell-action'), e => e.textContent!.trim())).toEqual(['Open']);
  });
});

describe('HTML injection – renderers show data as text', () => {

  // would run JavaScript if it became markup (the <img> is never loaded: the tests check that it is not created)
  const XSS = '<img src="x" onerror="geXss = 1">';
  const noMarkup = (cell: HTMLElement) => expect(cell.querySelector('img')).toBeNull();

  it('NumberCellRenderer', async () => {
    const { cell } = await renderCell(new NumberCellRenderer(), XSS);
    noMarkup(cell);
    expect(label(cell)).toBe(XSS);
  });

  it('PositiveAndNegativeNumberRenderer', async () => {
    const { cell } = await renderCell(new PositiveAndNegativeNumberRenderer(), XSS);
    noMarkup(cell);
    expect(label(cell)).toBe(XSS);
  });

  it('DateToIntlDDMMYYYYCellRenderer (an invalid date is shown as it is)', async () => {
    const noDate = '<img src="x" onerror="geXss">'; // no digits – Chromium's Date parser reads "1" as the year 2001
    const { cell } = await renderCell(new DateToIntlDDMMYYYYCellRenderer(), noDate);
    noMarkup(cell);
    expect(label(cell)).toBe(noDate);
  });

  it('ActionsCellRenderer: an id with quotes stays one data-id attribute', async () => {
    const onActionEvent = vi.fn();
    const id = '7" data-evil="1';
    const { cell } = await renderCell(new ActionsCellRenderer({ onActionEvent }, [new CrudAction('VIEW', 'View', '', '', 'link')]), id);
    const link = cell.querySelector<HTMLElement>('[data-action="VIEW"]')!;
    expect(link.getAttribute('data-id')).toBe(id);
    expect(cell.querySelector('[data-evil]')).toBeNull();
    await userEvent.click(link);
    expect(onActionEvent.mock.calls[0][0].id).toBe(id);
  });

  it('SelectCellRenderer: option values and labels', () => {
    const cellDiv = document.createElement('div');
    const areaModel = { isEditable: () => true, getValueAt: () => 'a"b' } as unknown as AreaModelIf;
    new SelectCellRenderer([new ValueLabel('a"b', XSS), new ValueLabel('c', 'C')])
      .render(cellDiv, 0, 0, 'body', areaModel, undefined, new SimpleDomService());
    noMarkup(cellDiv);
    const options = Array.from(cellDiv.querySelectorAll('option'));
    expect(options.map(o => [o.value, o.textContent])).toEqual([['a"b', XSS], ['c', 'C']]);
    expect(options[0].selected).toBe(true);
  });

  it('CellGroupExtCellRenderer: the label of a header group', () => {
    const cellDiv = document.createElement('div');
    new CellGroupExtCellRenderer().render(cellDiv, 0, 0, 'header', {} as AreaModelIf,
      { data: XSS } as unknown as CellGroupExt, new SimpleDomService());
    noMarkup(cellDiv);
    expect(cellDiv.textContent).toBe(XSS);
  });
});

describe('custom CellRendererIf', () => {

  interface RenderCall {
    cellDiv: HTMLDivElement; rowIndex: number; columnIndex: number; areaIdent: AreaIdent;
    areaModel: AreaModelIf; cellValue: unknown; domService: DomServiceIf; inDom: boolean;
  }

  /** Records every render call; the cell shows `<value>`; returns a cleanup function per call. */
  function recordingRenderer() {
    const calls: RenderCall[] = [];
    const cleanups: string[] = [];
    const renderer: CellRendererIf = {
      render(cellDiv, rowIndex, columnIndex, areaIdent, areaModel, cellValue, domService) {
        calls.push({ cellDiv, rowIndex, columnIndex, areaIdent, areaModel, cellValue, domService, inDom: cellDiv.isConnected });
        cellDiv.textContent = `<${cellValue}>`;
        return () => cleanups.push(`${areaIdent} ${rowIndex}/${columnIndex}`);
      },
    };
    return { renderer, calls, cleanups };
  }

  async function mountWithRenderer(rowCount = 100) {
    const body = recordingRenderer();
    const header = recordingRenderer();
    const columnDefs = [
      ColumnDef.create({ property: 'id', headerLabel: 'Id', width: px100 }),
      ColumnDef.create({ property: 'name', headerLabel: 'Name', width: px100, bodyRenderer: body.renderer, headerRenderer: header.renderer }),
    ];
    const model = TableFactory.createTableModel({ rows: createRows(rowCount), columnDefs });
    const table = mountTable(model, { eventListener: new EventAdapter() });
    await nextFrame();
    return { ...table, model, body, header };
  }

  it('render() gets the cell div (already in the DOM), indices, area, area model, value and DOM service', async () => {
    const { host, model, body } = await mountWithRenderer();
    const call = body.calls.find(c => c.rowIndex === 2)!;
    expect(call.columnIndex).toBe(1);
    expect(call.areaIdent).toBe('body');
    expect(call.areaModel).toBe(model.getBodyModel());
    expect(call.cellValue).toBe('Name 2');
    expect(call.domService).toBeInstanceOf(SimpleDomService);
    expect(call.inDom).toBe(true);
    expect(call.cellDiv).toBe(getCellDiv(host, 'body', 'center', 2, 1));
    expect(call.cellDiv.classList).toContain('ge-table-col-div');
    expect(call.cellDiv.textContent).toBe('<Name 2>');
    // with a renderer the default label is not rendered
    expect(call.cellDiv.querySelector('.ge-table-label')).toBeNull();
  });

  it('is called only for the rendered (visible) rows', async () => {
    const { host, body } = await mountWithRenderer(10_000);
    const rows = renderedRows(host).length;
    expect(body.calls.length).toBe(rows);
    expect(Math.max(...body.calls.map(c => c.rowIndex))).toBeLessThan(rows);
  });

  it('the header renderer gets the header label', async () => {
    const { header } = await mountWithRenderer();
    expect(header.calls).toHaveLength(1);
    expect(header.calls[0]).toMatchObject({ rowIndex: 0, columnIndex: 1, areaIdent: 'header', cellValue: 'Name' });
  });

  it('the cleanup functions of an area are called before its next render', async () => {
    const { api, body, header } = await mountWithRenderer();
    const firstPass = body.calls.length;
    expect(body.cleanups).toHaveLength(0);
    api.repaint();
    expect(body.cleanups).toHaveLength(firstPass);
    expect(body.cleanups[0]).toBe('body 0/1');
    expect(header.cleanups).toEqual(['header 0/1']);
    expect(body.calls.length).toBe(2 * firstPass);
  });

  it('scrolling cleans up the cells of the old rows', async () => {
    const { api, body } = await mountWithRenderer(10_000);
    const firstPass = body.calls.length;
    api.scrollToIndex(0, 5_000);
    await nextFrame();
    expect(body.cleanups.length).toBeGreaterThanOrEqual(firstPass);
    expect(body.cleanups.slice(0, firstPass)).toEqual(body.calls.slice(0, firstPass).map(c => `body ${c.rowIndex}/1`));
    expect(body.calls.some(c => c.rowIndex === 5_000)).toBe(true);
  });

  it('destroy() calls the cleanup functions of the last render', async () => {
    const { destroy, body, header } = await mountWithRenderer();
    const rendered = body.calls.length;
    destroy();
    expect(body.cleanups).toHaveLength(rendered);
    expect(header.cleanups).toHaveLength(1);
  });

  it('updateCells() renders the new value with the renderer', async () => {
    const { host, api, body } = await mountWithRenderer();
    api.updateCells([{ area: 'body', rowIndex: 1, columnIndex: 1, value: 'Updated', cssClasses: { 'my-flash': true } }]);
    const cell = getCellDiv(host, 'body', 'center', 1, 1);
    expect(cell.textContent).toBe('<Updated>');
    expect(cell.classList).toContain('my-flash');
    expect(body.calls[body.calls.length - 1]).toMatchObject({ rowIndex: 1, cellValue: 'Updated' });
    // NOTE: the cleanup of the replaced cell content is not called now – only with the next render of the area.
    expect(body.cleanups).toHaveLength(0);
  });
});

describe('area model hooks: getCustomClassesAt / getCustomStyleAt / getTooltipAt, ColumnDef classes', () => {

  interface Row { id: number; name: string; value: number; selected?: boolean }

  class StyledBodyModel extends AreaModelObjectArrayWithColumndefs<Row> {
    override getCustomClassesAt(rowIndex: number, columnIndex: number): string[] {
      const ret = super.getCustomClassesAt(rowIndex, columnIndex);
      if (rowIndex % 2 === 1) ret.push('my-odd');
      return ret;
    }

    override getCustomStyleAt(_rowIndex: number, columnIndex: number) {
      return columnIndex === 2 ? { color: 'rgb(255, 0, 0)', 'font-weight': '700' } : undefined;
    }

    override getTooltipAt(rowIndex: number, columnIndex: number) {
      return columnIndex === 1 ? `Tip ${rowIndex}` : '';
    }
  }

  async function mountStyled() {
    const rows: Row[] = createRows(20);
    rows[3].selected = true;
    const columnDefs = [
      ColumnDef.create({ property: 'id', width: px100, bodyClasses: ['ge-table-text-align-right'], headerClasses: ['my-header'] }),
      ColumnDef.create({ property: 'name', width: px100 }),
      ColumnDef.create({ property: 'value', width: px100 }),
    ];
    const bodyAreaModel = new StyledBodyModel('body', rows, columnDefs, 34);
    const table = mountTable(TableFactory.createTableModel({ bodyAreaModel, columnDefs }));
    await nextFrame();
    return table;
  }

  it('custom classes, inline styles and tooltips are applied to the cell divs', async () => {
    const { host } = await mountStyled();
    expect(getCellDiv(host, 'body', 'center', 1, 0).classList).toContain('my-odd');
    expect(getCellDiv(host, 'body', 'center', 2, 0).classList).not.toContain('my-odd');
    const styled = getCellDiv(host, 'body', 'center', 4, 2);
    expect(styled.style.color).toBe('rgb(255, 0, 0)');
    expect(styled.style.fontWeight).toBe('700');
    expect(getCellDiv(host, 'body', 'center', 4, 1).style.color).toBe('');
    expect(getCellDiv(host, 'body', 'center', 4, 1).getAttribute('title')).toBe('Tip 4');
    expect(getCellDiv(host, 'body', 'center', 4, 0).hasAttribute('title')).toBe(false);
  });

  it('ColumnDef body/header classes are added to the cells of the column', async () => {
    const { host } = await mountStyled();
    expect(getCellDiv(host, 'body', 'center', 5, 0).classList).toContain('ge-table-text-align-right');
    expect(getCellDiv(host, 'body', 'center', 5, 1).classList).not.toContain('ge-table-text-align-right');
    expect(getCellDiv(host, 'header', 'center', 0, 0).classList).toContain('my-header');
  });

  it('AreaModelObjectArray marks selected rows (row.selected) and the "focused" row', async () => {
    const { host } = await mountStyled();
    expect(getCellDiv(host, 'body', 'center', 3, 1).classList).toContain('ge-selected-row');
    expect(getCellDiv(host, 'body', 'center', 4, 1).classList).not.toContain('ge-selected-row');
    // NOTE: area-model-object-array.ts – _focusedRowIndex starts with 0, so row 0 of every object-array table
    // carries ge-focused-row (unrelated to the FocusModel of the table).
    expect(getCellDiv(host, 'body', 'center', 0, 1).classList).toContain('ge-focused-row');
  });

  it('even/odd classes on rows (body center) and columns', async () => {
    const { host } = await mountStyled();
    const rows = renderedRows(host);
    expect(rows[0].classList).toContain('ge-table-row-even');
    expect(rows[1].classList).toContain('ge-table-row-odd');
    expect(getCellDiv(host, 'body', 'center', 0, 0).classList).toContain('ge-table-column-even');
    expect(getCellDiv(host, 'body', 'center', 0, 1).classList).toContain('ge-table-column-odd');
  });
});
