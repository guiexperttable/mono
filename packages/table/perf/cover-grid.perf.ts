// Cover grid (prompt 024) in the performance checks of prompt 021: the keyboard navigation of a grid of tiles is
// index arithmetic – one key costs the same with 1,000 and with 1,000,000 items. The focus follows the item with ONE
// search per change (sort, filter, resize) and none per key or scroll (counted in perf-invariants.browser.spec.ts).
import { afterEach, describe, it } from 'vitest';
import { CoverGridFactory } from '@guiexpert/table';
import type { AreaIdent, AreaModelIf, CellRendererIf } from '@guiexpert/table';
import { destroyAllTables, mountTable } from '../test-utils/mount-table';
import { expectScalesFlat, measure, nextFrame, report } from './measure';

afterEach(() => destroyAllTables());

const renderer: CellRendererIf = {
  render(cellDiv: HTMLDivElement, _r: number, _c: number, _a: AreaIdent, _m: AreaModelIf, item: unknown) {
    cellDiv.textContent = item === undefined ? '' : 'Item ' + item;
    return undefined;
  },
};

async function mountGrid(n: number) {
  const items = Array.from({ length: n }, (_, i) => i);
  const model = CoverGridFactory.createCoverGridModel(items, renderer, 150, 200);
  const t = mountTable(model, {
    width: 1000, height: 600,
    tableOptions: {
      ...CoverGridFactory.createCoverGridDefaultOptions(200),
      autoRestoreOptions: undefined,
      resizeEventDebounceDelay: 10,
    },
  });
  await nextFrame();
  await new Promise(resolve => setTimeout(resolve, 40));
  await nextFrame();
  const perRow = model.getColumnCount();
  // start in the middle: the row index grows with n
  const middle = Math.floor(n / 2);
  t.scope.focusModel()!.setFocus(Math.floor(middle / perRow), middle % perRow);
  t.api.ensureRowIsVisible(Math.floor(middle / perRow));
  await nextFrame();
  return t;
}

const SMALL = 1_000;
const LARGE = 1_000_000;

describe('cover grid: a key costs the same for any number of items', () => {

  it('next / previous item (one render each): 1,000 → 1,000,000 items', async ({ task }) => {
    const tSmall = await mountGrid(SMALL);
    const s = await measure(run => tSmall.api.triggerAction(run % 2 ? 'NAVIGATE_LEFT' : 'NAVIGATE_RIGHT'), { inner: 5 });
    tSmall.destroy();
    const tLarge = await mountGrid(LARGE);
    const l = await measure(run => tLarge.api.triggerAction(run % 2 ? 'NAVIGATE_LEFT' : 'NAVIGATE_RIGHT'), { inner: 5 });
    tLarge.destroy();
    report(task, 'cover grid: next/previous item', { small: { n: SMALL, m: s }, large: { n: LARGE, m: l } });
    expectScalesFlat(s, l);
  });

  it('a row down / up at the edge of the view (scrolls): 1,000 → 1,000,000 items', async ({ task }) => {
    const down = (t: Awaited<ReturnType<typeof mountGrid>>, run: number) => {
      // three rows down, three rows up: the view follows the focused item
      const action = Math.floor(run / 3) % 2 ? 'NAVIGATE_UP' : 'NAVIGATE_DOWN';
      t.api.triggerAction(action);
    };
    const tSmall = await mountGrid(SMALL);
    const s = await measure(run => down(tSmall, run), { inner: 3 });
    tSmall.destroy();
    const tLarge = await mountGrid(LARGE);
    const l = await measure(run => down(tLarge, run), { inner: 3 });
    tLarge.destroy();
    report(task, 'cover grid: row down/up with scrolling', { small: { n: SMALL, m: s }, large: { n: LARGE, m: l } });
    expectScalesFlat(s, l);
  });
});
