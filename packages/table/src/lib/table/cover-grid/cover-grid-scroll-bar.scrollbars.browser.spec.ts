// A cover grid next to a classic vertical scroll bar (project browser-scrollbars: 15 px bar).
// Host 990 px, tiles 165 px: 990 / 165 = 6 tiles, next to the bar only 975 / 165 = 5.
import { afterEach, expect, it } from 'vitest';
import { CoverGridFactory } from '@guiexpert/table';
import type { CellRendererIf, TableOptionsIf } from '@guiexpert/table';
import { destroyAllTables, mountTable } from '../../../../test-utils/mount-table';

const renderer: CellRendererIf = {
  render: (cellDiv, _r, _c, _a, _m, item) => {
    cellDiv.textContent = item === undefined ? '' : String(item);
    return undefined;
  },
};

afterEach(destroyAllTables);

function mountGrid(options: Partial<TableOptionsIf>) {
  const model = CoverGridFactory.createCoverGridModel(Array.from({ length: 1000 }, (_, i) => i), renderer, 165, 220);
  const table = mountTable(model, {
    width: 990,
    height: 600,
    tableOptions: { ...CoverGridFactory.createCoverGridDefaultOptions(220), autoRestoreOptions: undefined, ...options },
  });
  return { ...table, model };
}

it('coverGridFill: the tiles are laid out next to the bar from the first render – no horizontal scroll bar', () => {
  const grid = mountGrid({ coverGridFill: true });
  const viewport = grid.scope.scrollViewport;
  expect(viewport.offsetWidth - viewport.clientWidth).toBeGreaterThan(0);   // a classic bar is there
  expect(grid.model.getColumnCount()).toBe(Math.floor(grid.scope.getLayoutWidth() / 165));
  expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.clientWidth);
});

// Fixed in 1.1.117: without coverGridFill the first layout used the width without the bar (the bar appears only after
// the rows are laid out) – 6 tiles, 990 px content in 975 px, a horizontal scroll bar until the debounced
// ResizeObserver pass of the table (resizeEventDebounceDelay, 500 ms) computed 5. Now every cover grid counts as
// width-dependent (RenderScope.hasRelativeColumnWidths): corrected in the same layout.
it('without coverGridFill: the first render is laid out next to the bar as well', () => {
  const grid = mountGrid({});
  const viewport = grid.scope.scrollViewport;
  expect(grid.model.getColumnCount()).toBe(Math.floor(grid.scope.getLayoutWidth() / 165));
  expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.clientWidth);
});

// Review finding (prompt 027): tiles whose height follows the width can toggle the bar. Host 960 × 600, 10 items,
// tile 165 px, ratio 220 / 165 + 44: 960 px → 5 tiles of 192 × 300, 2 rows = 601 px > 600 → a bar; next to it
// 945 px → 189 × 296, 593 px → no bar any more. Before the fix every repaintHard flipped between the two layouts
// (a horizontal scroll bar every other time). Now the narrower layout stays: no horizontal bar, stable.
it('coverGridFill with aspectRatio: a layout that toggles the bar stays stable over repaintHard()', async () => {
  const model = CoverGridFactory.createCoverGridModel(Array.from({ length: 10 }, (_, i) => i), renderer, 165, 220);
  const table = mountTable(model, {
    width: 960,
    height: 600,
    tableOptions: {
      ...CoverGridFactory.createCoverGridDefaultOptions(220), autoRestoreOptions: undefined,
      coverGridFill: { tileWidth: 165, aspectRatio: 220 / 165, extraHeight: 44 },
    },
  });
  const viewport = table.scope.scrollViewport;
  const widths: number[] = [];
  for (let i = 0; i < 4; i++) {
    table.api.repaintHard();
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.clientWidth);   // never a horizontal bar
    widths.push(model.bodyModel.coverWidth);
  }
  expect(new Set(widths).size).toBe(1);   // no flipping
  expect(model.getContentWidthInPixel()).toBeLessThanOrEqual(viewport.clientWidth);
});
