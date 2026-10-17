import type { TableScope } from "../table-scope";
import type { UndoableIf, UndoResultIf } from "../undo/undoable.if";
import type { CellChangeIf, CellChangeSource } from "../batch-edit/cell-change.if";
import { AreaModelObjectArray } from "../data/tablemodel/areamodel/area-model-object-array";
import { AreaModelArrayOfArrays } from "../data/tablemodel/areamodel/area-model-array-of-arrays";
import { AreaModelSheet } from "./area-model-sheet";
import { isSpreadsheetTableModel } from "./spreadsheet-factory";
import { GeModelChangeEvent } from "../data/common/event/ge-model-change-event";
import type { AriaTextsIf } from "../aria/aria-texts.if";
import { AriaTexts } from "../aria/aria-texts";

/**
 * Rows or columns inserted or deleted at a **physical** position (row number − 1, column letter index).
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export interface StructureEditIf {
  readonly kind: "insertRows" | "deleteRows" | "insertColumns" | "deleteColumns";
  readonly at: number;
  readonly count: number;
}

const LABELS: Record<StructureEditIf["kind"], string> = {
  insertRows: "Insert rows", deleteRows: "Delete rows", insertColumns: "Insert columns", deleteColumns: "Delete columns",
};

/** What a structure change did – enough to take it back (no copy of the sheet). */
interface StructureDelta {
  /** Object/array rows: the inserted or deleted rows (redo inserts the same objects again). */
  rows?: unknown[];
  /** Sheet: the deleted rows with content. */
  sheetRows?: Array<[number, unknown[]]>;
  /** Sheet: the deleted cells of deleted columns. */
  sheetColumns?: Array<[unknown[], unknown[]]>;
  /** Sheet: the widths of the data columns before. */
  widths?: number[];
  /** Formula inputs that were rewritten: the row (object or array) and the old text. */
  inputs: Array<{ row: object; col: number; old: unknown }>;
}

/**
 * Inserts or deletes rows or columns with adjusted cell formulas (`=SUM(D2:D4)` → `=SUM(D2:D5)` after inserting a row
 * inside, a deleted reference → `#REF!`), as **one** undo step and one `onModelChanged` (source `"structure"`).
 * Rows: a spreadsheet, object rows (new objects from `clipboard.createRow`, otherwise `{}`; the app's array changes
 * **in place**) and arrays; columns: a spreadsheet only. Not while a batch edit collects changes. Sorting and filters
 * stay (the view is built again); the active cell stays inside the table.
 *
 * @param {TableScope} scope - the table
 * @param {StructureEditIf} edit - what to change
 * @param {{ record?: boolean, rows?: unknown[], source?: CellChangeSource }} [opts] - `record: false` = no undo step;
 *        `rows`: the rows to insert (redo); `source` of the event
 * @returns {boolean} true if changed
 *
 * @category Internals
 * @since 1.1.99
 */
export function applyStructureEdit(scope: TableScope, edit: StructureEditIf,
                                   opts: { record?: boolean; rows?: unknown[]; source?: CellChangeSource } = {}): boolean {
  const model = scope.tableModel;
  const body = model.getBodyModel();
  const columns = edit.kind === "insertColumns" || edit.kind === "deleteColumns";
  const sheetBody = body instanceof AreaModelSheet ? body : undefined;
  const flat = body instanceof AreaModelObjectArray || body instanceof AreaModelArrayOfArrays;
  if (!(edit.count >= 1) || !(edit.at >= 0) || (columns ? !sheetBody || !isSpreadsheetTableModel(model) : !sheetBody && !flat)
    || scope.isBatchEditActive()) {
    return false;
  }
  const size = columns ? sheetBody!.getSheetColumnCount() : sheetBody ? sheetBody.getUnfilteredRowCount() : rowsOf(body).length;
  const deleting = edit.kind === "deleteRows" || edit.kind === "deleteColumns";
  const count = deleting ? Math.min(edit.count, size - edit.at) : edit.count;
  if (edit.at > size || count < 1) {
    return false;
  }
  if (scope.cellEditorService?.isOpen() && !scope.cellEditorService.commit("none")) {
    return false;
  }
  const clipped: StructureEditIf = { ...edit, count };

  // the formulas before the change: their texts after it (positions after the change)
  const sheet = scope.tableSheet;
  sheet?.rowCount(); // in sync with the data
  const rewrites = sheet ? sheet.engine.adjustForStructureChange(clipped) : [];

  const delta = changeStructure(scope, clipped, opts.rows);

  const changes: CellChangeIf[] = [];
  if (sheet) {
    const rows = sheet.rowsArray();
    for (const { row, col, input } of rewrites) {
      const target = rows ? rows[row] : sheetBody?.getRowArray(row);
      const old = sheet.inputAt(row, col);
      if (target && typeof target === "object") {
        // undo writes the old text at the column the cell has after the undo (before the change)
        const before = clipped.kind === "insertColumns" ? (col >= clipped.at + count ? col - count : col)
          : clipped.kind === "deleteColumns" ? (col >= clipped.at ? col + count : col) : col;
        delta.inputs.push({ row: target, col: before, old });
      }
      sheet.writeInput(row, col, input);
      const columnIndex = sheet.modelColumn(col);
      changes.push({ row: target, rowIndex: sheet.displayRow(row), columnIndex,
        property: model.getColumnDef(columnIndex)?.property ?? "", oldValue: old, newValue: input });
    }
    sheet.recalculate();
  }
  scope.refreshAfterStructureChange(columns);
  if (opts.record !== false) {
    scope.undoService?.addStep(new StructureUndoable(clipped, delta));
  }
  scope.announce(structureText(scope, clipped));
  scope.getEventListener().onModelChanged?.(GeModelChangeEvent.createForChanges(changes, opts.source ?? "structure"));
  return true;
}

/** The change itself (no formulas, no view) and what it did. */
function changeStructure(scope: TableScope, edit: StructureEditIf, rowsToInsert?: unknown[]): StructureDelta {
  const model = scope.tableModel;
  const body = model.getBodyModel();
  const { at, count } = edit;
  const delta: StructureDelta = { inputs: [] };
  if (body instanceof AreaModelSheet) {
    if (edit.kind === "insertRows") body.insertRows(at, count);
    else if (edit.kind === "deleteRows") delta.sheetRows = body.deleteRows(at, count);
    else if (isSpreadsheetTableModel(model)) {
      const widths = model.getDataColumnWidths();
      delta.widths = [...widths];
      if (edit.kind === "insertColumns") {
        body.insertColumns(at, count);
        widths.splice(at, 0, ...new Array<number>(count).fill(NaN));
      } else {
        delta.sheetColumns = body.deleteColumns(at, count);
        widths.splice(at, count);
      }
      model.setDataColumns(body.getSheetColumnCount(), widths.map(w => (Number.isNaN(w) ? undefined : w)) as number[]);
    }
    return delta;
  }
  const rows = rowsOf(body);
  if (edit.kind === "insertRows") {
    const created = rowsToInsert ?? Array.from({ length: count }, (_, i) => newRow(scope, at + i));
    for (let i = 0; i < created.length; i++) rows.splice(at + i, 0, created[i]);
    delta.rows = created;
  } else {
    delta.rows = rows.splice(at, count);
  }
  resetRows(body, rows);
  return delta;
}

function rowsOf(body: unknown): unknown[] {
  return body instanceof AreaModelObjectArray ? body.getAllRows() : (body as AreaModelArrayOfArrays<unknown>).arr;
}

/** The view of the changed rows array (the same array, changed in place). */
function resetRows(body: unknown, rows: unknown[]): void {
  if (body instanceof AreaModelObjectArray) {
    body.setRows(rows);
  } else if (body instanceof AreaModelArrayOfArrays) {
    body.filteredArr = [...rows] as unknown[][];
  }
}

/** A new row: `clipboard.createRow` of the options or `{}` (objects), an empty array (arrays). */
function newRow(scope: TableScope, index: number): unknown {
  const body = scope.tableModel.getBodyModel();
  if (body instanceof AreaModelArrayOfArrays) {
    return new Array(scope.tableModel.getColumnCount()).fill("");
  }
  const create = scope.getClipboardService().options.createRow;
  return create ? create(index) : {};
}

function structureText(scope: TableScope, edit: StructureEditIf): string {
  const texts = scope.ariaTexts as Partial<AriaTextsIf>;
  const defaults = new AriaTexts();
  switch (edit.kind) {
    case "insertRows": return (texts.rowsInserted ?? defaults.rowsInserted).call(texts, edit.count);
    case "deleteRows": return (texts.rowsDeleted ?? defaults.rowsDeleted).call(texts, edit.count);
    case "insertColumns": return (texts.columnsInserted ?? defaults.columnsInserted).call(texts, edit.count);
    default: return (texts.columnsDeleted ?? defaults.columnsDeleted).call(texts, edit.count);
  }
}

/**
 * The undo step of a structure change: undo does the opposite with the same rows (row objects and arrays keep their
 * identity – earlier steps still find them), redo changes it again with the same new rows.
 */
class StructureUndoable implements UndoableIf {
  readonly label: string;
  readonly source: CellChangeSource = "structure";
  readonly cellCount: number;

  constructor(private readonly edit: StructureEditIf, private readonly delta: StructureDelta) {
    this.label = LABELS[edit.kind];
    this.cellCount = edit.count + delta.inputs.length + (delta.sheetRows?.reduce((n, [, row]) => n + row.length, 0) ?? 0)
      + (delta.sheetColumns?.reduce((n, [, cells]) => n + cells.length, 0) ?? 0);
  }

  undo(scope: TableScope): UndoResultIf {
    const model = scope.tableModel;
    const body = model.getBodyModel();
    const { at, count, kind } = this.edit;
    const delta = this.delta;
    if (body instanceof AreaModelSheet) {
      if (kind === "insertRows") body.deleteRows(at, count);
      else if (kind === "deleteRows") body.restoreRows(at, count, delta.sheetRows!);
      else if (isSpreadsheetTableModel(model)) {
        if (kind === "insertColumns") body.deleteColumns(at, count);
        else body.restoreColumns(at, count, delta.sheetColumns!);
        model.setDataColumns(body.getSheetColumnCount(), delta.widths);
      }
    } else {
      const rows = rowsOf(body);
      if (kind === "insertRows") rows.splice(at, count);
      else for (let i = 0; i < (delta.rows?.length ?? 0); i++) rows.splice(at + i, 0, delta.rows![i]);
      resetRows(body, rows);
    }
    for (const { row, col, old } of delta.inputs) scope.tableSheet?.writeInput(row, col, old);
    scope.tableSheet?.recalculate();
    scope.refreshAfterStructureChange(kind === "insertColumns" || kind === "deleteColumns");
    scope.getEventListener().onModelChanged?.(GeModelChangeEvent.createForChanges([], "undo"));
    return { applied: count, skipped: 0 };
  }

  redo(scope: TableScope): UndoResultIf {
    applyStructureEdit(scope, this.edit, { record: false, rows: this.edit.kind === "insertRows" ? this.delta.rows : undefined, source: "redo" });
    return { applied: this.edit.count, skipped: 0 };
  }
}
