import type { TableScope } from "../table-scope";
import type { CellChangeSource } from "../batch-edit/cell-change.if";
import type { PendingCellIf } from "../batch-edit/pending-cell-changes";
import type { UndoableIf, UndoResultIf } from "./undoable.if";
import { CellRange } from "../data/common/cell-range";
import { isSameCellValue } from "../batch-edit/pending-cell-changes";

/** One cell of a batch edit step: its pending entry before and after (none = not pending). */
export interface PendingSnapshotIf {
  rowKey: unknown;
  property: string;
  before?: PendingCellIf;
  after?: PendingCellIf;
}

/**
 * A step of a batch edit (values marked, not written): undo restores the pending state before the step, redo the one
 * after it. A cell whose pending value changed since then is skipped (`onConflict: "skip"`). Commit and cancel of the
 * batch edit empty the history.
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export class PendingChangesUndoable implements UndoableIf {

  /**
   * @param {string} label - for buttons and announcements
   * @param {CellChangeSource} source - what started the step
   * @param {PendingSnapshotIf[]} cells - the pending entries before and after
   */
  constructor(readonly label: string, readonly source: CellChangeSource, private readonly cells: PendingSnapshotIf[]) {
  }

  get cellCount(): number {
    return this.cells.length;
  }

  undo(scope: TableScope): UndoResultIf {
    return this.apply(scope, "undo");
  }

  redo(scope: TableScope): UndoResultIf {
    return this.apply(scope, "redo");
  }

  private apply(scope: TableScope, direction: "undo" | "redo"): UndoResultIf {
    const batch = scope.batchEditService;
    if (!batch) {
      return { applied: 0, skipped: this.cells.length };
    }
    const overwrite = scope.getUndoOptions()?.onConflict === "overwrite";
    const restore: { rowKey: unknown; property: string; entry?: PendingCellIf }[] = [];
    let skipped = 0;
    for (const cell of this.cells) {
      const expected = direction === "undo" ? cell.after : cell.before;
      const target = direction === "undo" ? cell.before : cell.after;
      const current = batch.getPendingEntry(cell.rowKey, cell.property);
      const same = !current && !expected ? true
        : !!current && !!expected && isSameCellValue(current.newValue, expected.newValue);
      if (!same && !overwrite) {
        skipped++;
        continue;
      }
      restore.push({ rowKey: cell.rowKey, property: cell.property, entry: target });
    }
    const changes = batch.restorePending(restore, false); // the undo announces itself
    let range: CellRange | undefined;
    for (const c of changes) {
      if (c.rowIndex < 0 || c.columnIndex < 0) continue;
      range = range
        ? new CellRange(Math.min(range.r1, c.rowIndex), Math.min(range.c1, c.columnIndex), Math.max(range.r2, c.rowIndex), Math.max(range.c2, c.columnIndex))
        : new CellRange(c.rowIndex, c.columnIndex, c.rowIndex, c.columnIndex);
    }
    scope.repaint();
    return { applied: changes.length, skipped, range };
  }
}
