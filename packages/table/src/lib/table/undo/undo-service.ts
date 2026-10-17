import type { TableScope } from "../table-scope";
import type { UndoOptionsIf } from "./undo-options.if";
import type { UndoableIf, UndoResultIf } from "./undoable.if";
import type { CellChangeIf, CellChangeSource } from "../batch-edit/cell-change.if";
import { UndoStack } from "./undo-stack";
import { CellChangesUndoable } from "./cell-changes-undoable";
import { PendingChangesUndoable, type PendingSnapshotIf } from "./pending-changes-undoable";
import { GeUndoEvent } from "../data/common/event/ge-undo-event";
import { CellRange } from "../data/common/cell-range";
import { rowsArrayOf } from "./model-rows";

const LABELS: Partial<Record<CellChangeSource, string>> = {
  edit: "Edit", fill: "Fill", paste: "Paste", cut: "Cut", clear: "Clear", api: "Change",
};

/** Several steps as one (see {@link TableApi.batchUndoable}): undone in reverse order. */
class GroupUndoable implements UndoableIf {
  readonly source: CellChangeSource;

  constructor(readonly label: string, private readonly steps: UndoableIf[]) {
    this.source = steps[0].source;
  }

  get cellCount(): number {
    return this.steps.reduce((n, s) => n + s.cellCount, 0);
  }

  undo(scope: TableScope): UndoResultIf {
    return merge([...this.steps].reverse().map(s => s.undo(scope)));
  }

  redo(scope: TableScope): UndoResultIf {
    return merge(this.steps.map(s => s.redo(scope)));
  }
}

function merge(results: UndoResultIf[]): UndoResultIf {
  let range: CellRange | undefined;
  for (const r of results) {
    if (!r.range) continue;
    range = !range ? r.range : new CellRange(Math.min(range.r1, r.range.r1), Math.min(range.c1, r.range.c1),
      Math.max(range.r2, r.range.r2), Math.max(range.c2, r.range.c2));
  }
  return {
    applied: results.reduce((n, r) => n + r.applied, 0),
    skipped: results.reduce((n, r) => n + r.skipped, 0),
    range,
  };
}

/**
 * Undo and redo ({@link TableOptionsIf.undo}, `tableScope.undoService`, only with the option): records every change
 * that goes through the table's one write path (editor, fill handle, paste, cut, Delete; `api.applyCellChanges` only
 * with `recordApiChanges` or `{ undoable: true }`) as one step, and marked values of a batch edit. Not recorded:
 * `updateCells`, `setRows` (the history is emptied when the rows array is replaced), sorting, filter, row drag.
 *
 * @category Internals
 * @since 1.1.99
 */
export class UndoService {

  private readonly stack: UndoStack<UndoableIf>;
  private group?: { label: string; steps: UndoableIf[]; depth: number };
  /** An undo or redo is running: its writes (also of event handlers) are not recorded. */
  private running = false;
  /** The step whose `onModelChanged` is being reported: writes of handlers are added to it. */
  private folding?: UndoableIf;
  private foldDepth = 0;
  /** The rows array when the first step was recorded – another array (`setRows`) empties the history. */
  private rowsRef?: unknown[];

  /**
   * @param {TableScope} tableScope - the table
   * @param {UndoOptionsIf} options - complete options
   */
  constructor(private readonly tableScope: TableScope, readonly options: UndoOptionsIf) {
    this.stack = new UndoStack(options.maxSteps, options.maxCells);
  }

  /**
   * Records an own step (e.g. inserting rows) – not while an undo or redo runs.
   *
   * @param {UndoableIf} step - the step
   * @since 1.1.99
   */
  addStep(step: UndoableIf): void {
    if (!this.running) {
      this.add(step);
    }
  }

  /**
   * Records written cells as a step (called by the table's write path).
   *
   * @param {CellChangeIf[]} changes - the written cells
   * @param {CellChangeSource} source - what wrote them
   * @param {boolean} [undoable] - `api.applyCellChanges(…, { undoable })`: overrides `recordApiChanges`
   */
  record(changes: CellChangeIf[], source: CellChangeSource, undoable?: boolean): void {
    if (this.running || source === "undo" || source === "redo" || !changes.length || undoable === false) {
      return;
    }
    if (this.folding instanceof CellChangesUndoable && source !== "commit") {
      this.folding.append(changes); // a handler of the step's onModelChanged derived values: the same step
      this.lastRecorded = this.folding;
      return;
    }
    if (source === "commit") {
      this.clear();
      return;
    }
    if (source === "api" && !(undoable ?? this.options.recordApiChanges)) {
      return;
    }
    const step = new CellChangesUndoable(LABELS[source] ?? "Change", source, changes);
    this.lastRecorded = step;
    this.add(step);
  }

  /** The step recorded last (for {@link beginFold}). */
  private lastRecorded?: UndoableIf;

  /**
   * The table reports the write that was just recorded (`onModelChanged`): writes of handlers until {@link endFold}
   * belong to the same step.
   */
  beginFold(): void {
    if (this.foldDepth++ === 0) {
      this.folding = this.lastRecorded;
    }
  }

  /** End of {@link beginFold}. */
  endFold(): void {
    if (--this.foldDepth <= 0) {
      this.foldDepth = 0;
      this.folding = undefined;
      this.lastRecorded = undefined;
    }
  }

  /**
   * Records marked values of a batch edit as a step (called by the table).
   *
   * @param {PendingSnapshotIf[]} cells - pending entries before and after
   * @param {CellChangeSource} source - what marked them
   * @param {boolean} [undoable] - as in {@link record}
   */
  recordPending(cells: PendingSnapshotIf[], source: CellChangeSource, undoable?: boolean): void {
    if (this.running || !cells.length || undoable === false
      || (source === "api" && !(undoable ?? this.options.recordApiChanges))) {
      return;
    }
    this.add(new PendingChangesUndoable(LABELS[source] ?? "Change", source, cells));
  }

  /**
   * Records everything `fn` changes as one step (see {@link TableApi.batchUndoable}).
   *
   * @param {string} label - the label of the step
   * @param {() => T} fn - the changes
   * @returns {T} what `fn` returns
   */
  batch<T>(label: string, fn: () => T): T {
    if (this.group) {
      this.group.depth++;
    } else {
      this.group = { label, steps: [], depth: 1 };
    }
    let failed = true;
    try {
      const ret = fn();
      failed = false;
      return ret;
    } finally {
      const group = this.group!;
      if (--group.depth === 0) {
        this.group = undefined;
        if (group.steps.length && !failed) { // fn threw: no half step
          this.add(group.steps.length === 1 && group.steps[0].label === group.label ? group.steps[0]
            : new GroupUndoable(group.label, group.steps));
        }
      }
    }
  }

  /**
   * Undoes the last step: writes the old values back (source `"undo"`), selects the cells, announces it.
   *
   * @returns {boolean} true if a step was undone
   */
  undo(): boolean {
    return this.run("undo");
  }

  /**
   * Redoes the last undone step (source `"redo"`).
   *
   * @returns {boolean} true if a step was redone
   */
  redo(): boolean {
    return this.run("redo");
  }

  /** @returns {boolean} true if there is a step to undo */
  canUndo(): boolean {
    this.checkRows(false);
    return this.stack.canUndo();
  }

  /** @returns {boolean} true if there is a step to redo */
  canRedo(): boolean {
    this.checkRows(false);
    return this.stack.canRedo();
  }

  /** @returns {GeUndoEvent} the state of the history (for buttons) */
  getState(): GeUndoEvent {
    this.checkRows(false);
    return new GeUndoEvent(this.stack.canUndo(), this.stack.canRedo(), this.stack.peekUndo()?.label,
      this.stack.peekRedo()?.label, this.stack.size());
  }

  /** Empties the history (batch commit/cancel, {@link TableApi.clearUndoHistory}). */
  clear(silent = false): void {
    const had = this.stack.canUndo() || this.stack.canRedo();
    this.stack.clear();
    this.rowsRef = undefined;
    this.lastRecorded = undefined;
    if (this.group) {
      this.group.steps.length = 0; // steps collected in batchUndoable are gone too (e.g. a batch commit inside)
    }
    if (had && !silent) {
      this.fire();
    }
  }

  // ------------------------------------------------------------------------------------------------ internals

  private add(step: UndoableIf): void {
    if (this.group) {
      this.group.steps.push(step);
      return;
    }
    this.checkRows();
    this.rowsRef ??= this.currentRows();
    if (!this.stack.push(step)) {
      const scope = this.tableScope;
      scope.announce(scope.getUndoTexts().undoHistoryCleared(this.options.maxCells));
    }
    this.fire();
  }

  private run(kind: "undo" | "redo"): boolean {
    const scope = this.tableScope;
    if (scope.isEditing() || this.group) {
      return false; // the editor has its own text undo; inside batchUndoable no undo
    }
    this.checkRows();
    const step = kind === "undo" ? this.stack.undo() : this.stack.redo();
    const texts = scope.getUndoTexts();
    if (!step) {
      scope.announce(kind === "undo" ? texts.nothingToUndo() : texts.nothingToRedo());
      return false;
    }
    let result: UndoResultIf;
    this.running = true;
    try {
      result = kind === "undo" ? step.undo(scope) : step.redo(scope);
    } finally {
      this.running = false;
    }
    if (result.range) {
      scope.selectBodyRange(result.range);
      scope.ensureColumnIsVisible(result.range.c1);
      scope.ensureRowIsVisible(result.range.r1);
    }
    const message = kind === "undo" ? texts.undone(step.label, result.applied) : texts.redone(step.label, result.applied);
    scope.announce(result.skipped ? `${message}. ${texts.undoSkipped(result.skipped)}` : message);
    this.fire();
    return true;
  }

  /**
   * `setRows` (or `api.addRows`/`removeRows`, which build a new array) replaced the rows array: the steps point to rows
   * that may be gone – the history is emptied (silently when asked by a getter; the next change reports it).
   */
  private checkRows(fire = true): void {
    if (this.rowsRef && this.currentRows() !== this.rowsRef) {
      this.clear(!fire);
    }
  }

  private currentRows(): unknown[] | undefined {
    return rowsArrayOf(this.tableScope.tableModel.getBodyModel());
  }

  private fire(): void {
    this.tableScope.getEventListener().onUndoStackChanged?.(this.getState());
  }
}
