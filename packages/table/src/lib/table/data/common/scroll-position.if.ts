/**
 * A scroll position – the argument of {@link TableApi.repaintHard} (since 1.1.107): the rows are counted again and the
 * table shows this position in the same render pass. A missing axis keeps its position.
 *
 * - `px`: the horizontal scroll position from the start (0 = the first center column at the start; right-to-left
 *   measured from the right edge, see {@link TableOptionsIf.direction}) – the same as the first argument of
 *   {@link TableApi.scrollToPixel} (scroll bar pixels, not a column offset: for a column use `scrollToIndex`).
 * - `py`: a **content** position from the top of the first body row (with the heights of open detail rows above) – the same as the second
 *   argument of {@link TableApi.scrollToPixel}, also exact with a capped scroll height (more than
 *   {@link EleScope.maxScrollHeightInPx} px of rows).
 *
 * @example
 * // live tail: rows were appended – count them and show row 500,000 (20 px rows) at the top
 * tableApi.repaintHard({ py: 500_000 * 20 });
 *
 * @example
 * // only horizontally: back to the first column, the vertical position stays
 * tableApi.repaintHard({ px: 0 });
 *
 * @category Table & API
 * @since 1.1.107
 */
export interface ScrollPositionIf {
  /** Horizontal scroll position in px from the start (like `scrollToPixel`). Missing: the horizontal position stays. */
  px?: number;
  /** Vertical content position in px from the top of the first body row. Missing: the vertical position stays. */
  py?: number;
}
