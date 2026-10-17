import type { CellRange } from "../data/common/cell-range";
import type { CellChangeSource } from "../batch-edit/cell-change.if";
import type { TableScope } from "../table-scope";

/**
 * What an undo or redo did.
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export interface UndoResultIf {
  /** Cells written back. */
  readonly applied: number;
  /** Cells left out (row gone, no longer editable, changed by something else with `onConflict: "skip"`). */
  readonly skipped: number;
  /** The shown cells written back (display rows, model columns) – selected afterwards. */
  readonly range?: CellRange;
}

/**
 * One step of the undo history (command pattern): what the user did as one action – an edit, a fill, a paste.
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export interface UndoableIf {
  /** For buttons and announcements: `"Edit"`, `"Paste"`, `"Fill"` … */
  readonly label: string;
  /** What started the step. */
  readonly source: CellChangeSource;
  /** Cells the step holds (for `UndoOptionsIf.maxCells`). */
  readonly cellCount: number;
  /** Writes the old values back. */
  undo(scope: TableScope): UndoResultIf;
  /** Writes the new values again. */
  redo(scope: TableScope): UndoResultIf;
}
