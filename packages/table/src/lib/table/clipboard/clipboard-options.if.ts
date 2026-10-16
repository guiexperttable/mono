import type { CellRange } from "../data/common/cell-range";

/**
 * What the table copies ({@link ClipboardOptionsIf.processCopy}).
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export interface CopyContextIf {
  /** The copied range (body display rows, model columns) – with several selected ranges the last one. */
  readonly ranges: readonly CellRange[];
  /** Text per cell (rows × shown columns): as shown, or the value with `copyValue: "raw"`. */
  readonly matrix: string[][];
  /** True for Ctrl/⌘+X. */
  readonly cut: boolean;
}

/**
 * What is pasted ({@link ClipboardOptionsIf.processPaste}).
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export interface PasteContextIf {
  /** The `text/plain` content (`""` if there is only HTML). */
  readonly text: string;
  /** The `text/html` content, if any. */
  readonly html?: string;
  /** The parsed cells (rows of texts). */
  readonly matrix: string[][];
  /** The target before tiling and cutting off: anchor cell (display row, model column) and the matrix size. */
  readonly target: CellRange;
  /** True if the content was copied from this table (the values are pasted, not the shown texts). */
  readonly internal: boolean;
}

/**
 * Copy, cut and paste like Excel ({@link TableOptionsIf.clipboard}). `clipboard: true` uses the defaults of
 * {@link ClipboardOptions}; an object overrides single values.
 *
 * @example
 * const tableOptions: TableOptionsIf = {
 *   ...new TableOptions(),
 *   getSelectionModel: () => new SelectionModel("range", "multi"),
 *   editing: true,
 *   clipboard: { pasteAddsRows: true, createRow: () => ({ name: "", qty: 0 }) },
 * };
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export interface ClipboardOptionsIf {
  /** Copy the header labels as first row. Default `false`. */
  copyHeaders: boolean;
  /** `"text"`: the text as shown (default); `"raw"`: the value (a number without group separators, ISO dates). */
  copyValue: "text" | "raw";
  /** Also put an HTML `<table>` into the clipboard (`text/html`, numbers keep their value in Excel). Default `true`. */
  html: boolean;
  /** Pasting over the last row adds rows (`createRow` is needed for arrays of objects). Default `false`. */
  pasteAddsRows: boolean;
  /** Creates a new row for `pasteAddsRows` (the index is the display index it gets). */
  createRow?: (index: number) => unknown;
  /** Upper limit of pasted cells (after tiling); more are refused and announced. Default `1_000_000`. */
  maxPasteCells: number;
  /** Changes the copied cells (return a new matrix) – or only reads them. */
  processCopy?: (ctx: CopyContextIf) => string[][] | void;
  /** Changes the pasted cells (return new values), refuses the paste (`false`) – or only reads them. */
  processPaste?: (ctx: PasteContextIf) => unknown[][] | false | void;
}
