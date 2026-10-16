import type { FillValueContextIf } from "./fill-value-context.if";

/**
 * Options of the fill handle ({@link TableOptionsIf.fillHandle}): the small square at the bottom right corner of the
 * selected range. Dragging it fills the neighbouring cells – copies values or continues series (1, 2, 3 …; dates;
 * `Item 1` → `Item 2`). Needs a {@link SelectionModel} of the type `"range"`.
 *
 * @example
 * const selectionModel = new SelectionModel("range", "multi");   // one model – not a new one per call
 * const tableOptions: TableOptionsIf = {
 *   ...new TableOptions(),
 *   getSelectionModel: () => selectionModel,
 *   fillHandle: { direction: "vertical" },
 * };
 *
 * @category Fill handle & batch edit
 * @since 1.1.96
 */
export interface FillHandleOptionsIf {

  /** Allowed directions: `"vertical"` (down/up), `"horizontal"` (right/left) or `"both"` (default). */
  direction: "vertical" | "horizontal" | "both";

  /**
   * Own fill function, called for every filled cell. Return the value – or `undefined` for the default
   * (`ctx.defaultValue`).
   */
  fillValue?: (ctx: FillValueContextIf) => unknown;

  /** At most this many cells are filled at once (default 100,000); a bigger fill is refused and announced. */
  maxCells: number;

  /** Distance in px the pointer has to move before a fill starts (default 3). */
  dragThresholdInPx: number;

  /** Width in px of the zone at the edges of the body that scrolls automatically (default 40). */
  autoScrollZoneInPx: number;

  /** Maximum auto-scroll speed in px per animation frame (default 24). */
  autoScrollMaxSpeedInPx: number;
}
