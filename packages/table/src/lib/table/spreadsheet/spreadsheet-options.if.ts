import type { EditingOptionsIf } from "../sheet-editing/editing-options.if";
import type { ClipboardOptionsIf } from "../clipboard/clipboard-options.if";
import type { UndoOptionsIf } from "../undo/undo-options.if";
import type { CellFormulaOptionsIf } from "../sheet/cell-formula-options.if";
import type { FillHandleOptionsIf } from "../fill/fill-handle-options.if";

/**
 * The preset `tableOptions.spreadsheet` ({@link TableOptionsIf.spreadsheet}): which parts it switches on. Each part
 * is `true` by default; `false` leaves it off, an object configures it. Options the table options set themselves win.
 *
 * @example
 * const tableOptions: TableOptionsIf = { ...new TableOptions(), spreadsheet: { cellFormulas: { columns: ["total"] } } };
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export interface SpreadsheetOptionsIf {
  /** Excel-style editing – the preset sets `defaultEditable: true` (columns without own `editable` are editable). */
  editing: boolean | Partial<EditingOptionsIf>;
  /** Copy, cut and paste. */
  clipboard: boolean | Partial<ClipboardOptionsIf>;
  /** Undo and redo. */
  undo: boolean | Partial<UndoOptionsIf>;
  /** Cell formulas (`=B2*C2`). */
  cellFormulas: boolean | Partial<CellFormulaOptionsIf>;
  /** The fill handle. */
  fillHandle: boolean | Partial<FillHandleOptionsIf>;
}
