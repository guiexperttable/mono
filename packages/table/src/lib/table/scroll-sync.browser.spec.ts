// The frame between "the browser scrolled" and "the table rendered": browsers scroll on their own (compositor) thread –
// also while the scroll bar thumb is dragged – and show the scrolled viewport before the `scroll` event reaches the
// table. Until 1.1.105 the visible body content was positioned with `top = scrollTop` inside the scroll viewport: in
// such a frame it moved with the scroll delta (empty areas, jumping rows) and no longer lined up with the fixed
// west/east columns. Since 1.1.106 it is `position: sticky` – the browser keeps it in place by itself.
//
// The tests reproduce that frame: set scrollTop/scrollLeft and read the layout synchronously, before the scroll event
// (dispatched with the next frame) lets the table render.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ColumnDef, TableFactory, px100 } from '@guiexpert/table';
import type { TableModelIf } from '@guiexpert/table';
import {
  DIRECTIONS,
  destroyAllTables,
  mountTable as mountTableBase,
  nextFrame,
  renderedRows,
} from '../../../test-utils/mount-table';

afterEach(destroyAllTables);

let direction: 'ltr' | 'rtl' = 'ltr';
const mountTable = (model: TableModelIf) => mountTableBase(model, { tableOptions: { direction } });

/** 2,000 rows × 60 columns à 100 px, one fixed column at the start and one at the end. */
function model(): TableModelIf {
  const columnDefs = Array.from({ length: 60 },
    (_, c) => ColumnDef.create({ property: 'c' + c, headerLabel: 'H' + c, width: px100 }));
  const rows = Array.from({ length: 2_000 },
    (_, r) => Object.fromEntries(columnDefs.map((cd, c) => [cd.property, `${r}/${c}`])));
  return TableFactory.createTableModel({ rows, columnDefs, fixedLeftColumnCount: 1, fixedRightColumnCount: 1 });
}

const viewportOf = (host: HTMLElement) => host.querySelector<HTMLElement>('.ge-table-scroll-viewport')!;
const contentOf = (host: HTMLElement) => host.querySelector<HTMLElement>('.ge-table-scroll-content')!;

describe.each(DIRECTIONS)('%s', dir => {
  beforeEach(() => { direction = dir; });

  describe('scrolled, not rendered yet (compositor frame)', () => {

    it('the body content stays in the viewport while scrolling down', async () => {
      const { host } = mountTable(model());
      await nextFrame();
      const viewport = viewportOf(host);

      for (const scrollTop of [5_000, 40_000, 1_000, 60_000]) {
        viewport.scrollTop = scrollTop; // no scroll event yet
        expect(Math.round(contentOf(host).getBoundingClientRect().top))
          .toBe(Math.round(viewport.getBoundingClientRect().top));
        await nextFrame(); // the table renders the new position
      }
    });

    it('the center rows stay lined up with the fixed columns until the table renders', async () => {
      const { host } = mountTable(model());
      await nextFrame();
      const viewport = viewportOf(host);
      const topsOf = (side: 'west' | 'center' | 'east') =>
        renderedRows(host, side).slice(0, 5).map(row => Math.round(row.getBoundingClientRect().top));
      const before = topsOf('center');

      viewport.scrollTop = 20_000;

      expect(topsOf('west')).toEqual(before);
      expect(topsOf('center')).toEqual(before); // until 1.1.105: moved up by 20,000 px – out of sight
      expect(topsOf('east')).toEqual(before);

      await nextFrame();
      expect(topsOf('center')).toEqual(topsOf('west')); // rendered: the new rows, still lined up
    });

    it('the body content stays in the viewport while scrolling horizontally', async () => {
      const { host, api } = mountTable(model());
      await nextFrame();
      const viewport = viewportOf(host);
      // the start of the row: left, in right-to-left right (a classic vertical scroll bar sits at the end)
      const start = (el: HTMLElement) => {
        const rect = el.getBoundingClientRect();
        return Math.round(dir === 'rtl' ? rect.right : rect.left);
      };

      for (const x of [800, 3_000, 200]) {
        api.scrollToPixel(x, -1); // renders
        await nextFrame();
        // scroll 500 px further towards the end – without rendering
        viewport.scrollLeft += dir === 'rtl' ? -500 : 500;
        expect(start(contentOf(host))).toBe(start(viewport));
        await nextFrame();
      }
    });

    it('the body content is position: sticky (the browser keeps it in place without the table)', async () => {
      const { host } = mountTable(model());
      await nextFrame();
      const style = getComputedStyle(contentOf(host));
      expect(style.position).toBe('sticky');
      expect(style.top).toBe('0px');
      expect(dir === 'rtl' ? style.right : style.left).toBe('0px');
    });
  });
});
