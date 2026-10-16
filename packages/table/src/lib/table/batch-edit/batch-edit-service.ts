import type { TableScope } from "../table-scope";
import type { CellChangeIf } from "./cell-change.if";
import type { BatchEditOptionsIf } from "./batch-edit-options.if";
import { BatchEditOptions } from "./batch-edit-options";
import { PendingCellChanges, PendingCellIf } from "./pending-cell-changes";
import { GeBatchEditEvent, GeBatchEditEventType } from "../data/common/event/ge-batch-edit-event";
import { isAreaModelRowGroups, isAreaModelTree, isTreeRow } from "../instanceof-workaround";
import { writeRowValue } from "./write-row-value";

/** A value to mark as pending – prepared by {@link TableScope.applyCellChanges}. */
export interface PendingInputIf {
  rowIndex: number;
  columnIndex: number;
  /** after the editInputPipe */
  value: unknown;
  /** as entered */
  rawValue: unknown;
  error?: string;
}

/**
 * Batch edit of one table (`tableScope.batchEditService`): collects changes instead of writing them, shows them
 * (`ge-table-cell-pending`) and writes them on commit. Use {@link TableApi.startBatchEdit},
 * {@link TableApi.commitBatchEdit}, {@link TableApi.cancelBatchEdit} and {@link TableApi.getPendingChanges}.
 *
 * The pending values belong to the row **objects** – sorting and filtering keep them on their rows. They are shown, but
 * sorting, filtering, totals, copy and the Excel export use the written data (like ag-Grid).
 *
 * @category Internals
 * @since 1.1.96
 */
export class BatchEditService {

  private readonly pending = new PendingCellChanges();
  private started = false;

  constructor(private readonly tableScope: TableScope) {
  }

  /** The options of this table ({@link TableOptionsIf.batchEdit} + defaults). */
  get options(): BatchEditOptionsIf {
    return BatchEditOptions.create(this.tableScope.tableOptions.batchEdit);
  }

  /** `tableOptions.batchEdit` is set: changes are always collected. */
  isPermanent(): boolean {
    return !!this.tableScope.tableOptions.batchEdit;
  }

  /** True while changes are collected (started, or {@link isPermanent}). */
  isActive(): boolean {
    return this.started || this.isPermanent();
  }

  /** True if values are pending. */
  hasPending(): boolean {
    return !this.pending.isEmpty();
  }

  /**
   * Starts collecting changes (until commit or cancel).
   *
   * @returns {boolean} false if a batch edit is already running
   */
  start(): boolean {
    if (this.isActive()) {
      return false;
    }
    this.started = true;
    this.fire("start", []);
    return true;
  }

  /** The key of a shown row: its object (tree: the data), the index for models without objects. */
  rowKeyOf(rowIndex: number): unknown {
    const row = this.tableScope.tableModel.getBodyModel().getRowByIndex(rowIndex);
    if (row === undefined || row === null) {
      return rowIndex;
    }
    return isTreeRow(row) ? (row as { data: unknown }).data ?? row : row;
  }

  /** The key of a column: its property, `#<index>` without one. */
  propertyOf(columnIndex: number): string {
    return this.tableScope.tableModel.getColumnDef(columnIndex)?.property || `#${columnIndex}`;
  }

  /**
   * The pending value of a shown body cell – asked for every rendered cell (one map lookup, nothing while empty).
   *
   * @param {number} rowIndex - display index
   * @param {number} columnIndex - model index
   * @returns {PendingCellIf | undefined} the entry
   */
  getPendingAt(rowIndex: number, columnIndex: number): PendingCellIf | undefined {
    if (this.pending.isEmpty()) {
      return undefined;
    }
    return this.pending.get(this.rowKeyOf(rowIndex), this.propertyOf(columnIndex));
  }

  /**
   * The value a body cell shows: the pending value, otherwise the model value.
   *
   * @param {number} rowIndex - display index
   * @param {number} columnIndex - model index
   * @returns {unknown} the shown value
   */
  getShownValue(rowIndex: number, columnIndex: number): unknown {
    const entry = this.getPendingAt(rowIndex, columnIndex);
    return entry ? entry.newValue : this.tableScope.getCellInput(rowIndex, columnIndex);
  }

  /**
   * Marks values as pending (B1, B6, B8) and reports the step (`onBatchEditChanged`, announcement). The caller repaints.
   *
   * @param {PendingInputIf[]} inputs - cells with piped and raw value
   * @returns {CellChangeIf[]} the cells whose pending state changed
   */
  addPending(inputs: PendingInputIf[]): CellChangeIf[] {
    const changes: CellChangeIf[] = [];
    for (const input of inputs) {
      const rowKey = this.rowKeyOf(input.rowIndex);
      const property = this.propertyOf(input.columnIndex);
      const modelValue = this.tableScope.getCellInput(input.rowIndex, input.columnIndex); // a formula: its text
      const result = this.pending.set(rowKey, property, modelValue, input.value, input.rawValue, input.error);
      if (result !== "unchanged") {
        const entry = this.pending.get(rowKey, property);
        changes.push({
          row: typeof rowKey === "number" ? undefined : rowKey,
          rowIndex: input.rowIndex,
          columnIndex: input.columnIndex,
          property,
          oldValue: entry ? entry.oldValue : modelValue,
          newValue: input.value,
          ...(input.error ? { error: input.error } : {})
        });
      }
    }
    if (changes.length) {
      this.fire("change", changes);
      this.tableScope.announce(this.texts().pendingChanges(this.pending.size()));
    }
    return changes;
  }

  /**
   * The pending entry of a cell by row key and property (undo of a batch edit step).
   *
   * @param {unknown} rowKey - row object (index for models without objects)
   * @param {string} property - the property of the column
   * @returns {PendingCellIf | undefined} the entry
   * @since 1.1.99
   */
  getPendingEntry(rowKey: unknown, property: string): PendingCellIf | undefined {
    return this.pending.get(rowKey, property);
  }

  /**
   * Puts pending entries back (undo/redo of a batch edit step): an entry is set as it was, none removes the cell's
   * pending value. Reports `onBatchEditChanged` "change"; the caller repaints.
   *
   * @param {{ rowKey: unknown, property: string, entry?: PendingCellIf }[]} cells - the cells
   * @returns {CellChangeIf[]} the cells with their display index (`-1` if not shown)
   * @since 1.1.99
   */
  restorePending(cells: { rowKey: unknown; property: string; entry?: PendingCellIf }[], announce = true): CellChangeIf[] {
    for (const cell of cells) {
      if (cell.entry) {
        this.pending.put(cell.entry);
      } else {
        this.pending.remove(cell.rowKey, cell.property);
      }
    }
    if (!cells.length) {
      return [];
    }
    const body = this.tableScope.tableModel.getBodyModel();
    const keys = new Set(cells.map(c => c.rowKey));
    const indexOfRow = new Map<unknown, number>();
    const n = body.getRowCount();
    for (let i = 0; i < n && indexOfRow.size < keys.size; i++) {
      const key = this.rowKeyOf(i);
      if (keys.has(key) && !indexOfRow.has(key)) indexOfRow.set(key, i);
    }
    const changes: CellChangeIf[] = cells.map(cell => {
      const rowIndex = typeof cell.rowKey === "number" ? cell.rowKey : indexOfRow.get(cell.rowKey) ?? -1;
      const columnIndex = this.findColumnIndex(cell.property);
      const modelValue = rowIndex >= 0 && columnIndex >= 0 ? this.tableScope.getCellInput(rowIndex, columnIndex) : undefined;
      return {
        row: typeof cell.rowKey === "number" ? undefined : cell.rowKey,
        rowIndex,
        columnIndex,
        property: cell.property,
        oldValue: cell.entry ? cell.entry.oldValue : modelValue,
        newValue: cell.entry ? cell.entry.newValue : modelValue,
      };
    });
    this.fire("change", changes);
    if (announce) {
      this.tableScope.announce(this.texts().pendingChanges(this.pending.size()));
    }
    return changes;
  }

  /**
   * All pending changes with the current display indices (one scan of the shown rows).
   *
   * @returns {CellChangeIf[]} the pending cells
   */
  getPendingChanges(): CellChangeIf[] {
    this.pruneOrphans();
    if (this.pending.isEmpty()) {
      return [];
    }
    const indexOfRow = this.createRowIndexMap();
    return this.pending.entries().map(entry => this.toChange(entry, indexOfRow));
  }

  /**
   * Writes the pending values (B3): shown rows through `setValue` (the pipe runs once, row groupings regroup), rows a
   * filter hides directly into their objects. One `onModelChanged` with all cells, then `onBatchEditChanged` "commit".
   *
   * @returns {boolean} false if invalid values block the commit ({@link BatchEditOptionsIf.blockCommitOnInvalid})
   */
  commit(): boolean {
    const scope = this.tableScope;
    this.pruneOrphans();
    const invalid = this.pending.invalidCount();
    if (invalid && this.options.blockCommitOnInvalid) {
      scope.announce(this.texts().commitBlocked(invalid));
      return false;
    }
    const entries = this.pending.entries();
    const indexOfRow = entries.length ? this.createRowIndexMap() : new Map<unknown, number>();
    const tableModel = scope.tableModel;
    const shown: { rowIndex: number; columnIndex: number; value: unknown }[] = [];
    const hidden: CellChangeIf[] = [];
    for (const entry of entries) {
      const columnIndex = this.findColumnIndex(entry.property);
      if (columnIndex < 0) {
        continue; // the column no longer exists
      }
      const rowIndex = typeof entry.rowKey === "number" ? entry.rowKey : indexOfRow.get(entry.rowKey) ?? -1;
      if (rowIndex > -1) {
        shown.push({ rowIndex, columnIndex, value: entry.rawValue });
      } else if (writeRowValue(entry.rowKey, tableModel.getColumnDef(columnIndex), columnIndex, entry.newValue)) {
        const change = this.toChange(entry, indexOfRow);
        delete change.error;
        hidden.push(change);
      }
    }
    this.pending.clear();
    if (!this.isPermanent()) {
      this.started = false;
    }
    scope.undoService?.clear(); // the pending steps no longer exist (since 1.1.99)
    const written = scope.writeCells(shown, "commit", { extraChanges: hidden, skipValidation: true });
    const body = tableModel.getBodyModel();
    if (hidden.length && isAreaModelRowGroups(body)) {
      body.regroup();          // rows written past setValue (hidden by a filter) may belong to another group now
      scope.invalidateAggregates();
      scope.repaintHard();
    }
    this.fire("commit", written);
    scope.announce(this.texts().changesCommitted(written.length));
    return true;
  }

  /** Discards the pending values (B4) and ends a started batch edit. */
  cancel(): void {
    const discarded = this.getPendingChanges();
    const wasActive = this.started;
    this.pending.clear();
    this.tableScope.undoService?.clear(); // the pending steps no longer exist (since 1.1.99)
    if (!this.isPermanent()) {
      this.started = false;
    }
    this.tableScope.repaint();
    if (discarded.length || wasActive) {
      this.fire("cancel", discarded);
      this.tableScope.announce(this.texts().changesDiscarded());
    }
  }

  /**
   * Forgets pending values of rows that are no longer in the model (`setRows`, a reloaded tree): they would never be
   * shown, block a commit with an invalid value and be written into stale objects. Only for models whose rows are known
   * (object arrays, trees, row groupings); others keep their entries.
   *
   * @returns {number} the number of removed entries
   */
  pruneOrphans(): number {
    if (this.pending.isEmpty()) {
      return 0;
    }
    const known = this.collectRowKeys();
    if (!known) {
      return 0;
    }
    let removed = 0;
    for (const entry of this.pending.entries()) {
      if (typeof entry.rowKey !== "number" && !known.has(entry.rowKey)) {
        this.pending.remove(entry.rowKey, entry.property);
        removed++;
      }
    }
    return removed;
  }

  /** All row keys of the body (also filtered and collapsed rows) – `undefined` if the model can't tell. */
  private collectRowKeys(): Set<unknown> | undefined {
    const body = this.tableScope.tableModel.getBodyModel() as unknown as { getAllRows?: () => unknown[]; rows?: unknown[] };
    if (isAreaModelTree(body as never)) {
      const keys = new Set<unknown>();
      const walk = (rows: unknown[] | undefined) => rows?.forEach(r => {
        const tr = r as { data?: unknown; children?: unknown[] };
        keys.add(tr.data ?? tr);
        walk(tr.children);
      });
      walk(body.rows);
      return keys;
    }
    return typeof body.getAllRows === "function" ? new Set(body.getAllRows()) : undefined;
  }

  private toChange(entry: PendingCellIf, indexOfRow: Map<unknown, number>): CellChangeIf {
    const rowIndex = typeof entry.rowKey === "number" ? entry.rowKey : indexOfRow.get(entry.rowKey) ?? -1;
    return {
      row: typeof entry.rowKey === "number" ? undefined : entry.rowKey,
      rowIndex,
      columnIndex: this.findColumnIndex(entry.property),
      property: entry.property,
      oldValue: entry.oldValue,
      newValue: entry.newValue,
      ...(entry.error ? { error: entry.error } : {})
    };
  }

  private findColumnIndex(property: string): number {
    const tableModel = this.tableScope.tableModel;
    const n = tableModel.getColumnCount();
    for (let c = 0; c < n; c++) {
      if (this.propertyOf(c) === property) {
        return c;
      }
    }
    return -1;
  }

  /** Row key → display index, for the rows with pending values only. */
  private createRowIndexMap(): Map<unknown, number> {
    const ret = new Map<unknown, number>();
    const n = this.tableScope.tableModel.getBodyModel().getRowCount();
    for (let i = 0; i < n; i++) {
      const key = this.rowKeyOf(i);
      if (this.pending.hasRow(key) && !ret.has(key)) {
        ret.set(key, i);
      }
    }
    return ret;
  }

  private fire(type: GeBatchEditEventType, changes: CellChangeIf[]): void {
    const evt = new GeBatchEditEvent(type, changes, this.pending.size(), this.pending.invalidCount(),
      () => this.getPendingChanges());
    this.tableScope.getEventListener().onBatchEditChanged?.(evt);
  }

  private texts() {
    return this.tableScope.getEditTexts();
  }
}
