// Stage 2 (prompt 021): the same operation with a small and a large n – the ratio of the medians must stay flat.
// The absolute times go into perf/results/latest.json (stage 3, trend against perf/baseline.json, a warning only).
import { afterEach, describe, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { EventAdapter, TableCellUpdateEvent } from '@guiexpert/table';
import { destroyAllTables, getCellDiv } from '../test-utils/mount-table';
import { realMouse } from '../test-utils/real-mouse';
import { expectScalesFlat, measure, nextFrame, report, summarize } from './measure';
import type { Measurement } from './measure';
import { mountBig, ROW_HEIGHT } from './perf-models';
import type { PerfTable } from './perf-models';

afterEach(() => destroyAllTables());

/**
 * Renders a scroll position synchronously (what the scroll event does), alternating between two positions in the
 * middle of the content – the row index grows with n, so work that grows with the index (not only with n) shows, too.
 */
function scrollRender(t: PerfTable, run: number) {
  const middle = Math.floor((t.viewport.scrollHeight - t.viewport.clientHeight) / 2);
  t.viewport.scrollTop = run % 2 ? middle : middle + 3 * ROW_HEIGHT;
  t.scope.onViewportScroll();
}

async function measureBoth(small: number, large: number,
                           build: (n: number) => Promise<PerfTable>,
                           op: (t: PerfTable, run: number) => unknown,
                           options: Parameters<typeof measure>[1] = {}): Promise<{ s: Measurement; l: Measurement }> {
  const tSmall = await build(small);
  const s = await measure(run => op(tSmall, run), options);
  tSmall.destroy();
  const tLarge = await build(large);
  const l = await measure(run => op(tLarge, run), options);
  tLarge.destroy();
  return { s, l };
}

describe('the work per step does not grow with the row count', () => {

  it('scroll render, constant row height: 10,000 → 10,000,000 rows', async ({ task }) => {
    const [small, large] = [10_000, 10_000_000];
    const { s, l } = await measureBoth(small, large, n => mountBig(n), (t, run) => scrollRender(t, run),
      { inner: 5 });
    report(task, 'scroll render, constant height', { small: { n: small, m: s }, large: { n: large, m: l } });
    expectScalesFlat(s, l);
  });

  it('scroll render, variable row heights (row layout): 10,000 → 2,000,000 rows', async ({ task }) => {
    const [small, large] = [10_000, 2_000_000];
    const { s, l } = await measureBoth(small, large, n => mountBig(n, { variable: true }),
      (t, run) => scrollRender(t, run), { inner: 5 });
    report(task, 'scroll render, variable heights', { small: { n: small, m: s }, large: { n: large, m: l } });
    expectScalesFlat(s, l);
  });

  it('repaintHard({ py }) with a growing body (live tail): 100,000 → 10,000,000 rows', async ({ task }) => {
    const [small, large] = [100_000, 10_000_000];
    const { s, l } = await measureBoth(small, large, n => mountBig(n), t => {
      t.body.rowCount += 500;
      t.api.repaintHard({ py: Number.MAX_SAFE_INTEGER });
    });
    report(task, 'repaintHard({ py }) live tail', { small: { n: small, m: s }, large: { n: large, m: l } });
    expectScalesFlat(s, l);
  });

  it('updateCells (50 cells): 10,000 → 10,000,000 rows', async ({ task }) => {
    const [small, large] = [10_000, 10_000_000];
    const events = Array.from({ length: 50 }, (_, i) => i);
    const { s, l } = await measureBoth(small, large, n => mountBig(n), (t, run) => {
      t.api.updateCells(events.map(i => new TableCellUpdateEvent('body', i % 25, i % 5, 'v' + run)));
    }, { inner: 10 }); // ~1 ms each: 10 per run, otherwise the median jumps between frames (bimodal 1.1 / 2.3 ms)
    report(task, 'updateCells 50 cells', { small: { n: small, m: s }, large: { n: large, m: l } });
    expectScalesFlat(s, l);
  });

  it('scrollToIndex far away / ensureRowIsVisible: 10,000 → 10,000,000 rows', async ({ task }) => {
    const [small, large] = [10_000, 10_000_000];
    const { s, l } = await measureBoth(small, large, n => mountBig(n), (t, run) => {
      const n = t.body.rowCount;
      if (run % 2) {
        t.api.scrollToIndex(0, Math.floor(n * 0.9));
      } else {
        t.api.ensureRowIsVisible(Math.floor(n * 0.1));
      }
    });
    report(task, 'scrollToIndex / ensureRowIsVisible', { small: { n: small, m: s }, large: { n: large, m: l } });
    expectScalesFlat(s, l);
  });

  it('horizontal: scroll render with 100 → 10,000 columns', async ({ task }) => {
    const [small, large] = [100, 10_000];
    const { s, l } = await measureBoth(small, large, n => mountBig(1_000, { columns: n }), (t, run) => {
      t.scope.setViewportScrollLeft(run % 2 ? 3_000 : 3_300);
      t.scope.onViewportScroll();
    }, { inner: 5 });
    report(task, 'horizontal scroll render, columns', { small: { n: small, m: s }, large: { n: large, m: l } });
    expectScalesFlat(s, l);
  });

  // prompt 022: fitting one column (double click on the resize handle) measures only the rows drawn now above
  // columnAutoWidth.maxRows (10,000) – before, autoResizeColumns read every row of every column
  it('autoResizeColumn (double click on the handle): 100,000 → 10,000,000 rows', async ({ task }) => {
    const [small, large] = [100_000, 10_000_000];
    const { s, l } = await measureBoth(small, large, n => mountBig(n), (t, run) => {
      t.api.autoResizeColumn(run % 3);
    }, { inner: 5 });
    report(task, 'autoResizeColumn', { small: { n: small, m: s }, large: { n: large, m: l } });
    expectScalesFlat(s, l);
  });
});

describe('real input: time from the browser event to the table event', () => {

  /** Mounts a table that records the time from a capture listener on the host to the table event. */
  async function mountTimed(n: number, kind: 'click' | 'key') {
    const listener = new EventAdapter();
    let start = 0;
    const times: number[] = [];
    if (kind === 'click') {
      listener.onMouseClicked = () => times.push(performance.now() - start);
    } else {
      listener.onFocusChanged = () => times.push(performance.now() - start);
    }
    const t = await mountBig(n, { eventListener: listener });
    // from mouseup (not mousedown: the round trip of the Playwright command between down and up is not the table's)
    const startEvent = kind === 'click' ? 'mouseup' : 'keydown';
    t.host.addEventListener(startEvent, () => { start = performance.now(); }, { capture: true });
    return { t, times };
  }

  it('a real click → onMouseClicked: 10,000 → 10,000,000 rows', async ({ task }) => {
    const result: Record<string, { n: number; m: Measurement }> = {};
    for (const [label, n] of [['small', 10_000], ['large', 10_000_000]] as const) {
      const { t, times } = await mountTimed(n, 'click');
      t.api.ensureRowIsVisible(Math.floor(n / 2));
      await nextFrame();
      const first = t.api.getFirstFullVisibleRowIndex();
      for (let i = 0; i < 26; i++) {
        await realMouse.moveTo(getCellDiv(t.host, 'body', 'center', first + (i % 5), 1));
        await realMouse.click();
        await nextFrame();
      }
      result[label] = { n, m: summarize(times.slice(5)) }; // the first 5 = warm-up
      t.destroy();
    }
    report(task, 'real click → onMouseClicked', result);
    expectScalesFlat(result['small'].m, result['large'].m);
  });

  it('a real key ↓/↑ → onFocusChanged: 10,000 → 10,000,000 rows', async ({ task }) => {
    const result: Record<string, { n: number; m: Measurement }> = {};
    for (const [label, n] of [['small', 10_000], ['large', 10_000_000]] as const) {
      const { t, times } = await mountTimed(n, 'key');
      t.api.ensureRowIsVisible(Math.floor(n / 2));
      await nextFrame();
      await userEvent.click(getCellDiv(t.host, 'body', 'center', t.api.getFirstFullVisibleRowIndex() + 3, 1));
      await nextFrame();
      times.length = 0;
      for (let i = 0; i < 26; i++) {
        await userEvent.keyboard(i % 2 ? '{ArrowUp}' : '{ArrowDown}');
        await nextFrame();
      }
      result[label] = { n, m: summarize(times.slice(5)) };
      t.destroy();
    }
    report(task, 'real key → onFocusChanged', result);
    expectScalesFlat(result['small'].m, result['large'].m);
  });
});
