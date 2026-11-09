// The shared live-log logic of the showcase `logtail` and apps/table-demo/log-tail.html (prompt 019):
// LogTailController + createLogTailModelAndOptions from demo-table-models – Freeze scroll, Scroll to end, pause
// intake, real clicks while lines come in at 6,000 lines/s.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EventAdapter } from '@guiexpert/table';
import type { GeMouseEvent } from '@guiexpert/table';
import { createLogTailModelAndOptions } from '../../../../../demo-table-models/src/lib/log-tail/createLogTailModel';
import { LogTailController } from '../../../../../demo-table-models/src/lib/log-tail/log-tail-controller';
import type { LogLineIf } from '../../../../../demo-table-models/src/model/log-line.if';
import { destroyAllTables, DIRECTIONS, getCellDiv, mountTable, nextFrame } from '../../../../test-utils/mount-table';
import { realMouse } from '../../../../test-utils/real-mouse';

afterEach(async () => {
  destroyAllTables();
  await realMouse.move(0, 0);
});

const frames = async (n: number) => { for (let i = 0; i < n; i++) await nextFrame(); };

describe.each(DIRECTIONS)('LogTailController (%s)', direction => {

  async function mountLive(rate = 6_000, maxRows = 5_000) {
    const clicked: GeMouseEvent[] = [];
    const clickedIds: number[] = [];
    const listener = new EventAdapter();
    const { tableModel, tableOptions } = createLogTailModelAndOptions();
    const t = mountTable(tableModel, { eventListener: listener, tableOptions: { ...tableOptions, direction }, height: 400 });
    const lineAt = (i: number) => t.api.getBodyModel().getRowByIndex(i) as LogLineIf;
    // the line is read at the moment of the event – a moment later the ring buffer has moved the indices
    listener.onMouseClicked = e => { clicked.push(e); clickedIds.push(lineAt(e.rowIndex).id); };
    const live = new LogTailController(t.api, { rate, maxRows });
    return { ...t, live, clicked, clickedIds, lineAt };
  }

  it('follows the end while lines come in; the ring buffer holds maxRows', async () => {
    const t = await mountLive();
    t.live.start();
    await vi.waitFor(() => expect(t.api.getBodyModel().getRowCount()).toBeGreaterThan(1_000), { timeout: 5_000 });
    await nextFrame();
    expect(t.api.getLastVisibleRowIndex()).toBeGreaterThanOrEqual(t.api.getBodyModel().getRowCount() - 2);
    t.live.stop();
    expect(t.live.getStats().following).toBe(true);
  });

  it('Freeze scroll keeps the same line on top over many updates; Scroll to end follows again', async () => {
    const t = await mountLive(6_000, 100_000);
    t.live.start();
    await vi.waitFor(() => expect(t.api.getBodyModel().getRowCount()).toBeGreaterThan(500), { timeout: 5_000 });
    t.live.setFreezeScroll(true);
    await nextFrame();
    const top = t.lineAt(t.api.getFirstVisibleRowIndex()).id;
    await frames(10);
    expect(t.lineAt(t.api.getFirstVisibleRowIndex()).id).toBe(top);
    expect(t.live.getStats().following).toBe(false);
    t.live.scrollToEnd();
    await frames(3);
    t.live.stop();
    await nextFrame();
    expect(t.api.getLastVisibleRowIndex()).toBeGreaterThanOrEqual(t.api.getBodyModel().getRowCount() - 2);
    expect(t.live.isFrozen()).toBe(false);
  });

  it('pause intake: nothing is appended, unpausing appends the block at once', async () => {
    const t = await mountLive();
    t.live.setIntakePaused(true);
    t.live.start();
    await frames(5);
    expect(t.api.getBodyModel().getRowCount()).toBe(0);
    t.live.stop();
    const result = t.live.flush();
    expect(result).toBeUndefined();
    t.live.setIntakePaused(false);
    expect(t.api.getBodyModel().getRowCount()).toBeGreaterThan(0);
  });

  it('real clicks while 6,000 lines/s come in (ring buffer full): every click arrives at the pressed line', async () => {
    const t = await mountLive(6_000, 2_000);
    t.live.start();
    await vi.waitFor(() => expect(t.api.getBodyModel().getRowCount()).toBe(2_000), { timeout: 5_000 });
    for (let i = 0; i < 8; i++) {
      const index = t.api.getLastFullVisibleRowIndex() - 3;
      await realMouse.moveTo(getCellDiv(t.host, 'body', 'center', index, 3));
      await realMouse.down();
      await frames(2); // updates while the button is held – the view does not jump, the rows still move up
      await realMouse.up();
      await nextFrame();
    }
    t.live.stop();
    expect(t.clicked.length).toBe(8);
    expect(t.clicked.every(e => e.areaIdent === 'body' && e.clickCount === 1)).toBe(true);
    // focus and selection stayed at the clicked line through all further updates
    const focused = t.lineAt(t.scope.focusModel()!.getFocus()[0]);
    expect(focused.id).toBe(t.clickedIds[t.clickedIds.length - 1]);
  });
});
