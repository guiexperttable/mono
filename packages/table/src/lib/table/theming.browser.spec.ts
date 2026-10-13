// Look & feel in a real browser: the --ge-table-* CSS variables of the core stylesheet (light/dark), CssVars
// themes, the border options of TableOptions and the default row heights.
import { afterEach, describe, expect, it } from 'vitest';
import { ColumnDef, CssVars, TableFactory, px100 } from '@guiexpert/table';
import type { TableOptionsIf } from '@guiexpert/table';
import {
  areaRows,
  createRows,
  destroyAllTables,
  mountTable,
  nextFrame,
  renderedRows,
  stylePx,
} from '../../../test-utils/mount-table';

const injectedStyles: HTMLStyleElement[] = [];

afterEach(() => {
  destroyAllTables();
  injectedStyles.splice(0).forEach(s => s.remove());
  document.documentElement.removeAttribute('data-theme');
});

function injectCss(css: string) {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
  injectedStyles.push(style);
}

/** 3 columns, 50 rows, a footer row, 1 fixed west column. */
async function mountStyledTable(tableOptions: Partial<TableOptionsIf> = {}, opts: { footer?: boolean; fixedLeft?: number } = {}) {
  const columnDefs = ['id', 'name', 'value'].map(p => ColumnDef.create({ property: p, headerLabel: p, width: px100 }));
  const model = TableFactory.createTableModel({
    rows: createRows(50),
    columnDefs,
    footerData: opts.footer === false ? undefined : [['f0', 'f1', 'f2']],
    fixedLeftColumnCount: opts.fixedLeft ?? 1,
    tableOptions: tableOptions as TableOptionsIf,
  });
  const table = mountTable(model, { tableOptions });
  await nextFrame();
  return table;
}

const bg = (el: Element) => getComputedStyle(el).backgroundColor;
const area = (host: HTMLElement, selector: string) => host.querySelector<HTMLElement>(selector)!;
const count = (host: HTMLElement, selector: string) => host.querySelectorAll(selector).length;

describe('CSS variables (--ge-table-*)', () => {

  it('the core stylesheet colours the areas with the light defaults', async () => {
    const { host } = await mountStyledTable();
    expect(bg(host)).toBe('rgb(255, 255, 255)');
    expect(bg(area(host, '.ge-table-header-center'))).toBe('rgba(233, 233, 233, 0.5)');
    expect(bg(area(host, '.ge-table-body-center'))).toBe('rgba(255, 255, 255, 0.5)');
    expect(bg(area(host, '.ge-table-body-west'))).toBe('rgba(233, 233, 233, 0.5)');
    expect(bg(area(host, '.ge-table-hover-row'))).toBe('rgba(0, 224, 255, 0.27)');
  });

  it('html[data-theme="dark"] switches to the dark variables of the core stylesheet', async () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    const { host } = await mountStyledTable();
    expect(bg(host)).toBe('rgb(17, 24, 39)'); // #111827
    expect(bg(area(host, '.ge-table-header-center'))).toBe('rgb(17, 24, 39)');
    expect(bg(area(host, '.ge-table-body-west'))).toBe('rgb(35, 39, 46)'); // #23272e
  });

  it('a CssVars theme (style element + data-theme) recolours the table', async () => {
    injectCss(CssVars.vars.combat);
    document.documentElement.setAttribute('data-theme', 'combat');
    const { host } = await mountStyledTable();
    expect(bg(host)).toBe('rgb(16, 16, 16)'); // #101010
    expect(bg(area(host, '.ge-table-header-center'))).toBe('rgb(16, 16, 16)');
    expect(getComputedStyle(area(host, '.ge-table-body-center')).color).toBe('rgb(182, 180, 180)'); // #b6b4b4
  });

  it('a variable set on the host element overrides the theme for this table only', async () => {
    const { host } = await mountStyledTable();
    host.style.setProperty('--ge-table-body-center-bg', 'rgb(1, 2, 3)');
    expect(bg(area(host, '.ge-table-body-center'))).toBe('rgb(1, 2, 3)');
    expect(bg(area(host, '.ge-table-header-center'))).toBe('rgba(233, 233, 233, 0.5)');
  });

  it('border and selection classes resolve their variables', async () => {
    const { host } = await mountStyledTable();
    host.style.setProperty('--ge-table-body-center-vertical-border', 'rgb(9, 9, 9)');
    const border = host.querySelector('.ge-table-body-center .ge-table-body-center-vertical-border')!;
    expect(bg(border)).toBe('rgb(9, 9, 9)');
  });
});

describe('border options (TableOptions)', () => {

  it('verticalBorderVisible / horizontalBorderVisible add one border div per cell with an area/side class', async () => {
    const { host } = await mountStyledTable();
    for (const areaIdent of ['header', 'body', 'footer']) {
      for (const side of ['west', 'center']) {
        const rowDiv = areaRows(host, areaIdent as 'header', side as 'center')[0];
        expect(rowDiv.querySelectorAll(`:scope > .ge-table-${areaIdent}-${side}-vertical-border`).length, `${areaIdent}/${side}`).toBeGreaterThan(0);
        expect(rowDiv.querySelectorAll(`:scope > .ge-table-${areaIdent}-${side}-horizontal-border`).length, `${areaIdent}/${side}`).toBeGreaterThan(0);
      }
    }
    const row = renderedRows(host)[3];
    const cells = row.querySelectorAll(':scope > .ge-table-col-div').length;
    expect(row.querySelectorAll(':scope > .ge-table-body-center-horizontal-border').length).toBe(cells);
    // + one closing vertical line at the right end of the row
    expect(row.querySelectorAll(':scope > .ge-table-body-center-vertical-border').length).toBe(cells + 1);
  });

  it('verticalBorderVisible = false / horizontalBorderVisible = false: no cell borders', async () => {
    const { host } = await mountStyledTable({ verticalBorderVisible: false, horizontalBorderVisible: false });
    expect(count(host, '[class*="-vertical-border"]:not(.ge-table-body-west-vertical-border)')).toBe(0);
    expect(count(host, '.ge-table-body-center .ge-table-row-div:not(:last-child) > .ge-table-body-center-horizontal-border')).toBe(0);
    // NOTE: the last row of every area still gets a bottom line, always with the class of the BODY/center border
    // (render-scope.ts:1172 addHorizontalBorder default class) – also in header and footer.
    const headerRow = areaRows(host, 'header')[0];
    expect(headerRow.querySelectorAll(':scope > .ge-table-body-center-horizontal-border').length).toBeGreaterThan(0);
  });

  it('the closing vertical line of header rows uses the body/center class', async () => {
    const { host } = await mountStyledTable();
    const headerRow = areaRows(host, 'header')[0];
    // NOTE: render-scope.ts:1056 addVerticalBorder() without class → "ge-table-body-center-vertical-border" in
    // header and footer rows, coloured with the body border variable.
    const last = headerRow.lastElementChild as HTMLElement;
    expect(last.className).toBe('ge-table-body-center-vertical-border');
  });

  it('headerSeparatorBorderVisible / footerSeparatorBorderVisible', async () => {
    const shown = (await mountStyledTable()).host;
    const header = area(shown, ':scope > .ge-table-header-border');
    expect(header.style.display).toBe('block');
    expect(stylePx(header, 'top')).toBe(34);
    const footer = area(shown, ':scope > .ge-table-footer-border');
    expect(footer.style.display).toBe('block');
    expect(stylePx(footer, 'top')).toBe(500 - 34);

    const hidden = (await mountStyledTable({ headerSeparatorBorderVisible: false, footerSeparatorBorderVisible: false })).host;
    expect(area(hidden, ':scope > .ge-table-header-border').style.display).toBe('none');
    expect(area(hidden, ':scope > .ge-table-footer-border').style.display).toBe('none');
  });

  it('no footer rows: no footer separator', async () => {
    const { host } = await mountStyledTable({}, { footer: false });
    expect(area(host, ':scope > .ge-table-footer-border').style.display).toBe('none');
    expect(stylePx(area(host, '.ge-table-footer-center'), 'height')).toBe(0);
  });

  it('tableTopBorderVisible / tableBottomBorderVisible draw a line at the top and bottom of the host', async () => {
    const shown = (await mountStyledTable()).host;
    const lines = Array.from(shown.querySelectorAll<HTMLElement>(':scope > .ge-table-border'));
    expect(lines.map(l => stylePx(l, 'top'))).toEqual([0, 499]);
    expect(lines.every(l => stylePx(l, 'width') === 800 && stylePx(l, 'height') === 1)).toBe(true);

    const hidden = (await mountStyledTable({ tableTopBorderVisible: false, tableBottomBorderVisible: false })).host;
    expect(hidden.querySelectorAll(':scope > .ge-table-border')).toHaveLength(0);
  });

  it('the table-level lines are replaced on every render pass, not accumulated', async () => {
    const { host, api } = await mountStyledTable();
    const before = host.childElementCount;
    api.repaint();
    api.repaint();
    expect(host.childElementCount).toBe(before);
  });
});

describe('layout options', () => {

  it('defaultRowHeights sets the heights of header, body and footer rows', async () => {
    const defaultRowHeights = { header: 50, body: 20, footer: 30 };
    const { host } = await mountStyledTable({ defaultRowHeights });
    expect(stylePx(area(host, '.ge-table-header-center'), 'height')).toBe(50);
    expect(stylePx(area(host, '.ge-table-footer-center'), 'height')).toBe(30);
    const rows = renderedRows(host);
    expect(rows.slice(0, 3).map(r => [stylePx(r, 'top'), stylePx(r, 'height')])).toEqual([[0, 20], [20, 20], [40, 20]]);
    expect(rows.length).toBe(Math.ceil((500 - 50 - 30) / 20) + 1);
  });

  it('overflowX / overflowY set the overflow of the scroll viewport', async () => {
    const { scope } = await mountStyledTable({ overflowX: 'scroll', overflowY: 'scroll' });
    expect(scope.scrollViewport.style.overflowX).toBe('scroll');
    expect(scope.scrollViewport.style.overflowY).toBe('scroll');
  });
});
