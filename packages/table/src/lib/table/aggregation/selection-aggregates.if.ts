/**
 * Count, sum, average, minimum and maximum of the selected body cells – for a status bar like in a spreadsheet
 * ({@link TableApi.getSelectionAggregates}).
 *
 * Counted are the selected cells of the visible data columns (row number and checkbox columns not); `numericCount`,
 * `sum`, `avg`, `min`, `max` use the cells whose value is a number.
 *
 * @example
 * const a: SelectionAggregatesIf = tableApi.getSelectionAggregates();
 * const text = a.capped ? "selection too large"
 *   : a.numericCount ? `Count ${a.count} · Sum ${formatAggregateValue(a.sum)} · Avg ${formatAggregateValue(a.avg)}`
 *   : a.count ? `Count ${a.count}` : "";
 *
 * @since 1.1.94
 * @category Aggregation
 */
export interface SelectionAggregatesIf {
  /** Number of selected cells. */
  count: number;
  /** Number of selected cells with a number. */
  numericCount: number;
  /** Sum of the numbers (`0` without numbers). */
  sum: number;
  /** Average of the numbers (`undefined` without numbers). */
  avg: number | undefined;
  /** Smallest number (`undefined` without numbers). */
  min: number | undefined;
  /** Largest number (`undefined` without numbers). */
  max: number | undefined;
  /**
   * `true` if the selection covers more than {@link SelectionAggregator.maxCells} cells: then nothing is computed
   * (all values 0 / `undefined`) – a partial sum would be wrong.
   */
  capped: boolean;
}
