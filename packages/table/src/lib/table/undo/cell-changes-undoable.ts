import type { TableScope } from "../table-scope";
import type { CellChangeIf, CellChangeSource } from "../batch-edit/cell-change.if";
import type { UndoableIf, UndoResultIf } from "./undoable.if";
import type { ColumnDefIf } from "../data/tablemodel/column/column-def.if";
import { CellRange } from "../data/common/cell-range";
import { isSameCellValue } from "../batch-edit/pending-cell-changes";
import { writeRowValue } from "../batch-edit/write-row-value";
import { isTreeRow } from "../instanceof-workaround";
import { allRowObjectsOf } from "./model-rows";
import { hasDefaultEditable } from "../data/tablemodel/column/default-editable";

/** One cell of a step: where (row object, or index for models without objects) and the two values. */
interface CellEntry {
  row: unknown;
  rowIndex: number;
  columnIndex: number;
  property: string;
  oldValue: unknown;
  newValue: unknown;
}

/**
 * A step of written cells (an edit, a fill, a paste …): undo writes the old values back, redo the new ones. The cells
 * are found by row **object** and property – sorting and filtering in between don't matter; a row a filter hides is
 * written directly into its object (reported in the same event), a row that left the model is skipped. A cell that
 * no longer has the expected value is skipped (`onConflict: "skip"`) or overwritten.
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export class CellChangesUndoable implements UndoableIf {

  private readonly entries: CellEntry[];

  /**
   * @param {string} label - for buttons and announcements
   * @param {CellChangeSource} source - what started the step
   * @param {CellChangeIf[]} changes - the written cells (`GeModelChangeEvent.changes`)
   */
  constructor(readonly label: string, readonly source: CellChangeSource, changes: CellChangeIf[]) {
    this.entries = changes.map(c => ({
      row: c.row, rowIndex: c.rowIndex, columnIndex: c.columnIndex, property: c.property, oldValue: c.oldValue,
      newValue: c.newValue,
    }));
  }

  get cellCount(): number {
    return this.entries.length;
  }

  /**
   * Adds cells written by the same user action (an `onModelChanged` handler that derives values) to this step.
   *
   * @param {CellChangeIf[]} changes - the written cells
   */
  append(changes: CellChangeIf[]): void {
    for (const c of changes) {
      this.entries.push({ row: c.row, rowIndex: c.rowIndex, columnIndex: c.columnIndex, property: c.property,
        oldValue: c.oldValue, newValue: c.newValue });
    }
  }

  undo(scope: TableScope): UndoResultIf {
    return this.apply(scope, "undo");
  }

  redo(scope: TableScope): UndoResultIf {
    return this.apply(scope, "redo");
  }

  private apply(scope: TableScope, source: "undo" | "redo"): UndoResultIf {
    const model = scope.tableModel;
    const body = model.getBodyModel();
    const rowCount = body.getRowCount();
    const overwrite = scope.getUndoOptions()?.onConflict === "overwrite";
    const rowAt = (i: number) => {
      const o = body.getRowByIndex(i);
      return isTreeRow(o) ? (o as { data?: unknown }).data : o;
    };
    let indexOfRow: Map<unknown, number> | undefined;
    let allRows: Set<unknown> | undefined | null;
    const findRow = (e: CellEntry): number => {
      if (e.row === undefined || e.row === null || typeof e.row !== "object") {
        return e.rowIndex >= 0 && e.rowIndex < rowCount ? e.rowIndex : -1; // a model without row objects: the index
      }
      if (e.rowIndex >= 0 && e.rowIndex < rowCount && rowAt(e.rowIndex) === e.row) {
        return e.rowIndex;
      }
      if (!indexOfRow) {
        indexOfRow = new Map();
        for (let i = 0; i < rowCount; i++) indexOfRow.set(rowAt(i), i);
      }
      return indexOfRow.get(e.row) ?? -1;
    };
    const inModel = (row: unknown): boolean => {
      if (allRows === undefined) {
        allRows = allRowObjectsOf(body); // object arrays, arrays of arrays, row groupings, trees
      }
      return !!allRows && allRows.has(row);
    };
    const columnEditable = (def: ColumnDefIf | undefined): boolean => !!def && (hasDefaultEditable(def)
      ? !!(body as unknown as { defaultEditable?: boolean }).defaultEditable : !!def.editable?.());
    const cells: { rowIndex: number; columnIndex: number; value: unknown }[] = [];
    const hidden: CellChangeIf[] = [];
    let skipped = 0;
    // undo backwards (a cell written twice in one step gets its first old value), redo forwards
    const entries = source === "undo" ? [...this.entries].reverse() : this.entries;
    for (const e of entries) {
      const expected = source === "undo" ? e.newValue : e.oldValue;
      const target = source === "undo" ? e.oldValue : e.newValue;
      const columnIndex = findColumn(scope, e);
      if (columnIndex < 0) {
        skipped++;
        continue;
      }
      const rowIndex = findRow(e);
      if (rowIndex >= 0) {
        if (!body.isEditable(rowIndex, columnIndex)
          || (!overwrite && !isSameCellValue(body.getValueAt(rowIndex, columnIndex), expected))) {
          skipped++;
          continue;
        }
        cells.push({ rowIndex, columnIndex, value: target });
        continue;
      }
      // hidden by a filter (or a collapsed group): written into the object, reported in the same event
      const def = model.getColumnDef(columnIndex);
      const current = inModel(e.row) ? readRowValue(e.row, def, columnIndex, expected) : undefined;
      if (!inModel(e.row) || !columnEditable(def) || (!overwrite && !isSameCellValue(current, expected))
        || !writeRowValue(e.row, def, columnIndex, target)) {
        skipped++;
        continue;
      }
      hidden.push({ row: e.row, rowIndex: -1, columnIndex, property: e.property, oldValue: current, newValue: target });
    }
    const written = scope.writeUndoCells(cells, hidden, source);
    let range: CellRange | undefined;
    for (const c of written) {
      if (c.rowIndex < 0) continue;
      if (!range) {
        range = new CellRange(c.rowIndex, c.columnIndex, c.rowIndex, c.columnIndex);
      } else {
        range.r1 = Math.min(range.r1, c.rowIndex);
        range.r2 = Math.max(range.r2, c.rowIndex);
        range.c1 = Math.min(range.c1, c.columnIndex);
        range.c2 = Math.max(range.c2, c.columnIndex);
      }
    }
    return { applied: written.length, skipped: skipped + cells.length + hidden.length - written.length, range };
  }
}

/** The column of an entry: at its old index if the property still matches, otherwise searched by property. */
function findColumn(scope: TableScope, e: { columnIndex: number; property: string }): number {
  const model = scope.tableModel;
  const key = (c: number) => model.getColumnDef(c)?.property || `#${c}`;
  if (e.columnIndex >= 0 && e.columnIndex < model.getColumnCount() && key(e.columnIndex) === e.property) {
    return e.columnIndex;
  }
  const n = model.getColumnCount();
  for (let c = 0; c < n; c++) {
    if (key(c) === e.property) return c;
  }
  return -1;
}

/** The value of a row object that has no display index (hidden by a filter); calculated columns: `unknown` (no check). */
function readRowValue(row: unknown, def: ColumnDefIf | undefined, columnIndex: number, unknownValue: unknown): unknown {
  if (Array.isArray(row)) {
    return row[columnIndex];
  }
  if (!def?.property || row === null || typeof row !== "object") {
    return undefined;
  }
  if (def.valueGetter) {
    return unknownValue; // a calculated value needs the table context – not checked
  }
  let value: any = row;
  for (const part of def.property.split(".")) {
    value = value?.[part];
  }
  return value;
}
