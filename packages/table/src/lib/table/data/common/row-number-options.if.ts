/**
 * How a {@link RowNumberColumnDef} counts:
 * - `"display"` (default): the position in the current view – 1, 2, 3 … also after sorting and filtering
 *   (like the row headers of a spreadsheet).
 * - `"original"`: the position in the unsorted, unfiltered rows (`getAllRows()` of the body model) – the number stays
 *   with its row. Body models without `getAllRows()` (tree, own area models) count like `"display"`.
 *
 * @since 1.1.93
 * @category Row numbers
 */
export type RowNumberMode = "display" | "original";

/**
 * Options of the row number column ({@link RowNumberColumnDef}). Pass any subset – to
 * `new RowNumberColumnDef({ … })` or as `rowNumbersVisible: { … }` to {@link TableFactory.createTableModel}.
 * Defaults: {@link RowNumberOptions}.
 *
 * @example
 * const tableModel = TableFactory.createTableModel({
 *   rows: orders,
 *   rowNumbersVisible: { mode: "original", format: n => n.toLocaleString("en-US"), exported: true }
 * });
 *
 * @since 1.1.93
 * @category Row numbers
 */
export interface RowNumberOptionsIf {
  /** `"display"` (default) or `"original"`, see {@link RowNumberMode}. */
  mode: RowNumberMode;
  /**
   * The text of a number. Default `String(n)` – no thousands separators (`"2000000"`).
   * The column width is measured with the text of the largest number, so the text should not get shorter for
   * larger numbers.
   *
   * @example
   * const options: Partial<RowNumberOptionsIf> = { format: n => n.toLocaleString("de-DE") }; // "2.000.000"
   */
  format: (rowNumber: number) => string;
  /** Text of the header cell. Default `"#"` (an empty header cell has no accessible name). */
  headerLabel: string;
  /** `true`: {@link TableApi.copyToClipboard} and {@link TableApi.downloadExcel} contain the numbers. Default `false`. */
  exported: boolean;
  /** The column is never narrower than this (px). Default 36. */
  minWidthInPx: number;
}
