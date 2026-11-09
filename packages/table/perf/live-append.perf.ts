// Live data (prompt 019) in the performance checks of prompt 021: appendRows costs O(k) for k new rows – the same
// with 100,000 and 2,000,000 rows –, and real clicks during the updates all arrive.
import { afterEach, describe, expect, it } from 'vitest';
import { ColumnDef, DefaultRowHeights, EventAdapter, TableFactory, px100 } from '@guiexpert/table';
import type { GeMouseEvent, TableOptionsIf } from '@guiexpert/table';
import { destroyAllTables, getCellDiv, mountTable } from '../test-utils/mount-table';
import { realMouse } from '../test-utils/real-mouse';
import { expectScalesFlat, measure, nextFrame, report, summarize } from './measure';
import type { Measurement } from './measure';

afterEach(() => destroyAllTables());

interface Line { id: number; level: string; text: string }
const LEVELS = ['INFO', 'WARN', 'ERROR', 'DEBUG'];
let nextId = 0;
function lines(count: number): Line[] {
  const out: Line[] = new Array(count);
  for (let i = 0; i < count; i++) {
    const id = nextId++;
    out[i] = { id, level: LEVELS[id % 4], text: 'line ' + id };
  }
  return out;
}

async function mountLines(n: number, tableOptions: Partial<TableOptionsIf> = {}, listener = new EventAdapter()) {
  const model = TableFactory.createTableModel({
    rows: lines(n),
    columnDefs: ['id', 'level', 'text'].map(p => ColumnDef.create({ property: p, headerLabel: p, width: px100 })),
    defaultRowHeights: new DefaultRowHeights(34, 20, 34),
  });
  const t = mountTable(model, { width: 1000, height: 600, eventListener: listener,
    tableOptions: { resizeEventDebounceDelay: 10, ...tableOptions } });
  await nextFrame();
  await new Promise(resolve => setTimeout(resolve, 40));
  await nextFrame();
  return t;
}

const SMALL = 100_000;
const LARGE = 2_000_000;

describe('appendRows: the time per update does not grow with the row count', () => {

  it.for([
    ['unsorted, follow the end', {}, true],
    ['filtered (¾ shown), follow the end', { externalFilterFunction: (r: Line) => r.level !== 'DEBUG' }, true],
    ['unsorted, reader in the middle (no cell rebuilt)', {}, false],
  ] as const)('500 rows per update, ring buffer: %s', async ([label, options, toEnd], { task }) => {
    const result: Record<string, { n: number; m: Measurement }> = {};
    for (const [variant, n] of [['small', SMALL], ['large', LARGE]] as const) {
      const t = await mountLines(n, options as Partial<TableOptionsIf>);
      t.api.repaintHard({ py: toEnd ? Number.MAX_SAFE_INTEGER : 20 * 1_000 });
      await nextFrame();
      result[variant] = { n, m: await measure(() => {
        t.api.appendRows(lines(500), { maxRows: n, follow: toEnd ? 'auto' : false });
      }) };
      t.destroy();
    }
    report(task, 'appendRows 500/update ' + label, result);
    expectScalesFlat(result['small'].m, result['large'].m);
  });

  it('sorted (merged in, O(n + k)): reported for the trend, no ratio limit', async ({ task }) => {
    const result: Record<string, { n: number; m: Measurement }> = {};
    for (const [variant, n] of [['small', SMALL], ['large', LARGE]] as const) {
      const t = await mountLines(n);
      t.api.sortByColumn('level', 'asc');
      await nextFrame();
      result[variant] = { n, m: await measure(() => { t.api.appendRows(lines(500), { maxRows: n }); }, { runs: 11 }) };
      t.destroy();
    }
    report(task, 'appendRows 500/update sorted', result);
    expect(result['large'].m.median).toBeGreaterThan(0);
  });

  it('before 1.1.108: addRows + repaintHard (copies all rows) – reported for comparison', async ({ task }) => {
    const result: Record<string, { n: number; m: Measurement }> = {};
    for (const [variant, n] of [['small', SMALL], ['large', LARGE]] as const) {
      const t = await mountLines(n);
      result[variant] = { n, m: await measure(() => {
        t.api.addRows(lines(500));
        t.api.repaintHard({ py: Number.MAX_SAFE_INTEGER });
      }, { runs: 11 }) };
      t.destroy();
    }
    report(task, 'addRows + repaintHard 500/update (old way)', result);
    expect(result['large'].m.median).toBeGreaterThan(0);
  });
});

describe('live operation: real clicks between updates', () => {
  it('an update per frame, 20 real clicks: all arrive, time mouseup → onMouseClicked flat', async ({ task }) => {
    const result: Record<string, { n: number; m: Measurement }> = {};
    for (const [variant, n] of [['small', SMALL], ['large', LARGE]] as const) {
      const clicked: GeMouseEvent[] = [];
      const times: number[] = [];
      let start = 0;
      const listener = new EventAdapter();
      listener.onMouseClicked = e => { clicked.push(e); times.push(performance.now() - start); };
      const t = await mountLines(n, {}, listener);
      t.host.addEventListener('mouseup', () => { start = performance.now(); }, { capture: true });
      t.api.repaintHard({ py: 20 * 2_000 }); // a reader in the middle: clicks hit stable rows
      await nextFrame();
      let running = true;
      const tick = () => {
        if (!running) return;
        t.api.appendRows(lines(80), { maxRows: n, follow: false }); // ~5,000 rows/s at 60 fps
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      for (let i = 0; i < 20; i++) {
        // the ring buffer moves the indices: look the visible row up for every click
        const first = t.api.getFirstFullVisibleRowIndex();
        await realMouse.moveTo(getCellDiv(t.host, 'body', 'center', first + 2 + (i % 5), 1));
        await realMouse.click();
        await nextFrame();
      }
      running = false;
      await nextFrame();
      expect(clicked.length, `all clicks arrived (${variant})`).toBe(20);
      result[variant] = { n, m: summarize(times.slice(3)) };
      t.destroy();
    }
    report(task, 'live: real click → onMouseClicked during updates', result);
    expectScalesFlat(result['small'].m, result['large'].m);
  });
});

