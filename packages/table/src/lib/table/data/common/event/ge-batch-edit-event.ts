import type { CellChangeIf } from "../../../batch-edit/cell-change.if";

/**
 * What happened in a batch edit: `"start"` ({@link TableApi.startBatchEdit}), `"change"` (values were marked or a
 * value was set back), `"commit"` (written), `"cancel"` (discarded).
 *
 * @category Fill handle & batch edit
 * @since 1.1.96
 */
export type GeBatchEditEventType = "start" | "change" | "commit" | "cancel";

/**
 * Reported by {@link EventListenerIf.onBatchEditChanged}: the pending changes of a batch edit changed – e.g. to enable
 * a "Save" button.
 *
 * @example
 * const listener = new EventAdapter();
 * listener.onBatchEditChanged = (evt: GeBatchEditEvent) => {
 *   saveButton.disabled = evt.pendingCount === 0 || evt.invalidCount > 0;
 *   discardButton.disabled = evt.pendingCount === 0;
 * };
 *
 * @category Fill handle & batch edit
 * @since 1.1.96
 */
export class GeBatchEditEvent {

  constructor(
    /** What happened. */
    public readonly type: GeBatchEditEventType,
    /** The cells of this step (`"commit"`: the written cells, `"cancel"`: the discarded ones). */
    public readonly changes: CellChangeIf[],
    /** The number of pending cells after this step. */
    public readonly pendingCount: number,
    /** The number of pending cells with an invalid value. */
    public readonly invalidCount: number,
    private readonly pendingProvider: () => CellChangeIf[] = () => []
  ) {
  }

  /** All pending changes after this step (computed when read – it scans the shown rows once). */
  get pendingChanges(): CellChangeIf[] {
    return this.pendingProvider();
  }
}
