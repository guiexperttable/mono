import type { TableModelIf } from "../data/tablemodel/table-model.if";
import type { ColumnDefIf } from "../data/tablemodel/column/column-def.if";
import type { CellChangeIf } from "../batch-edit/cell-change.if";
import { AreaModelObjectArray } from "../data/tablemodel/areamodel/area-model-object-array";
import { AreaModelArrayOfArrays } from "../data/tablemodel/areamodel/area-model-array-of-arrays";
import { isCheckboxColumnDef, isRowNumberColumnDef } from "../instanceof-workaround";
import { parseFormula } from "../formula/parser";
import type { SheetCellsIf } from "./sheet-cells.if";
import type { CellFormulaOptionsIf } from "./cell-formula-options.if";
import { isFormulaText, SheetEngine } from "./sheet-engine";
import { shiftFormula } from "./shift-formula";
import { columnLetter, parseCellAddress, SHEET_MAX_COLUMNS, SHEET_MAX_ROWS, toCellAddress } from "./cell-address";

type FlatBody = AreaModelObjectArray<any> | AreaModelArrayOfArrays<any>;

/**
 * A formula copied inside the table (copy and paste): the input and where it came from – pasted, its relative
 * references move by the distance (Excel). `value` is pasted where formulas are not allowed.
 *
 * @internal
 */
export class CopiedFormula {
  constructor(readonly input: string, readonly row: number, readonly col: number, readonly value: unknown) {
  }
}

/**
 * The cell formulas of a table ({@link TableOptionsIf.cellFormulas}): connects the body model with a
 * {@link SheetEngine}. Rows are the physical rows (`getAllRows()` / the array), columns the data columns (row number
 * and checkbox columns don't count). The body asks it for the value of every text input (`SheetCellsIf`); the table
 * reports every write (`cellsWritten`). A new rows array (`setRows`), another row count or other columns rebuild
 * the engine.
 *
 * @category Internals
 * @since 1.1.99
 */
export class TableSheet implements SheetCellsIf {

  readonly engine: SheetEngine;

  private dataColumns: number[] = [];
  private engineColumns = new Map<number, number>();
  private properties: string[] = [];
  private propertyColumns = new Map<string, number>();
  private formulaColumns: boolean[] = [];
  /** Engine columns of calculated columns (`valueGetter`): their inputs change with every write of the row. */
  private calculatedColumns: number[] = [];
  private rowIndex = new Map<unknown, number>();
  private rowsRef?: unknown;
  private rowsLength = -1;
  private columnDefsRef?: unknown;
  private columnCount = -1;
  private syncing = false;

  private constructor(
    private readonly tableModel: TableModelIf,
    private readonly body: FlatBody,
    readonly options: CellFormulaOptionsIf,
  ) {
    this.engine = new SheetEngine({
      getRowCount: () => this.rows().length,
      getColumnCount: () => this.dataColumns.length,
      getInput: (r, c) => this.readInput(r, c),
      isFormulaColumn: c => this.formulaColumns[c],
      getFieldColumn: f => this.propertyColumns.get(f) ?? -1,
    }, options);
  }

  /**
   * The cell formulas of a table model – `undefined` (with a warning) for a body that is not flat.
   *
   * @param {TableModelIf} tableModel - the model
   * @param {CellFormulaOptionsIf} options - complete options
   * @returns {TableSheet | undefined} the sheet, attached to the body
   */
  static create(tableModel: TableModelIf, options: CellFormulaOptionsIf): TableSheet | undefined {
    const body = tableModel.getBodyModel();
    if (!(body instanceof AreaModelObjectArray) && !(body instanceof AreaModelArrayOfArrays)) {
      console.warn("GuiExpert Table – cellFormulas: only a flat body (an object array or an array of arrays) "
        + "has cell formulas; a tree, a row grouping or a pivot table has none.");
      return undefined;
    }
    const sheet = new TableSheet(tableModel, body, options);
    sheet.sync();
    body.sheetCells = sheet;
    return sheet;
  }

  /** Detaches the sheet from the body (table destroyed). */
  destroy(): void {
    if (this.body.sheetCells === this) {
      this.body.sheetCells = undefined;
    }
  }

  // ------------------------------------------------------------------------------------------------ SheetCellsIf

  valueAt(row: unknown, columnIndex: number, input: string): unknown {
    return this.valueOf(row, this.columnOf(columnIndex), input);
  }

  valueOfProperty(row: unknown, property: string, input: string): unknown {
    return this.valueOf(row, this.propertyColumns.get(property), input);
  }

  isFormulaProperty(property: string): boolean {
    const c = this.propertyColumns.get(property);
    return c !== undefined && this.formulaColumns[c];
  }

  isFormulaColumnIndex(columnIndex: number): boolean {
    const c = this.columnOf(columnIndex);
    return c !== undefined && this.formulaColumns[c];
  }

  // ------------------------------------------------------------------------------------------------ the table

  /**
   * True if a written value is a formula: text with `=` in a formula column (it skips `editInputPipe` and `validate`).
   *
   * @param {number} columnIndex - model column
   * @param {unknown} value - the written value
   * @returns {boolean} true for a formula
   */
  isFormulaInput(columnIndex: number, value: unknown): value is string {
    return isFormulaText(value) && this.isFormulaColumnIndex(columnIndex);
  }

  /**
   * The message of a syntax error of a formula, `undefined` if it parses.
   *
   * @param {string} input - the formula text (with `=`)
   * @returns {string | undefined} the message
   */
  syntaxError(input: string): string | undefined {
    try {
      parseFormula(input.slice(1), true);
      return undefined;
    } catch (e) {
      return e instanceof Error ? e.message : String(e);
    }
  }

  /**
   * Cells were written (their inputs changed): the engine compiles their formulas again and recalculates the
   * dependent cells – before the table repaints.
   *
   * @param {CellChangeIf[]} changes - the written cells (row object or display index, model column)
   */
  cellsWritten(changes: readonly CellChangeIf[]): void {
    if (this.sync()) {
      return; // rebuilt: everything is new
    }
    const cells: Array<[number, number]> = [];
    const rows = new Set<number>();
    for (const change of changes) {
      const c = this.columnOf(change.columnIndex);
      const r = change.row !== undefined && change.row !== null && typeof change.row === "object"
        ? this.rowIndex.get(change.row) : this.physicalRow(change.rowIndex);
      if (c !== undefined && r !== undefined) cells.push([r, c]);
      if (r !== undefined) rows.add(r);
    }
    // a calculated column (valueGetter) of a written row may have a new value – formulas reading it recalculate
    for (const r of rows) {
      for (const c of this.calculatedColumns) cells.push([r, c]);
    }
    if (cells.length) {
      this.engine.inputsChanged(cells);
    }
  }

  /**
   * Recalculates everything (data changed outside the table) – {@link TableApi.recalculate}.
   */
  recalculate(): void {
    if (!this.sync()) {
      this.engine.rebuild();
    }
  }

  /**
   * The value of a cell by physical row and engine column (the rows are checked first).
   *
   * @param {number} row - physical row
   * @param {number} col - engine column
   * @returns {unknown} the value
   */
  cellValue(row: number, col: number): unknown {
    this.sync();
    return this.engine.getValue(row, col);
  }

  /**
   * Calculates a formula once against the sheet.
   *
   * @param {string} source - the formula
   * @returns {unknown} the result
   */
  evaluate(source: string): unknown {
    this.sync();
    return this.engine.evaluate(source);
  }

  /**
   * The physical row of a display row (`undefined` if there is none).
   *
   * @param {number} displayRow - display index
   * @returns {number | undefined} the row in `getAllRows()` / the array
   */
  physicalRow(displayRow: number): number | undefined {
    this.sync();
    if (displayRow < 0 || displayRow >= this.body.getRowCount()) return undefined;
    return this.rowIndex.get(this.body.getRowByIndex(displayRow));
  }

  /**
   * The display row of a physical row, `-1` if a filter hides it.
   *
   * @param {number} physicalRow - the row in `getAllRows()` / the array
   * @returns {number} the display index
   */
  displayRow(physicalRow: number): number {
    this.sync();
    const row = this.rows()[physicalRow];
    if (row === undefined) return -1;
    const n = this.body.getRowCount();
    for (let i = 0; i < n; i++) {
      if (this.body.getRowByIndex(i) === row) return i;
    }
    return -1;
  }

  /** @returns {number | undefined} the engine column (A = 0) of a model column */
  engineColumn(columnIndex: number): number | undefined {
    this.sync();
    return this.columnOf(columnIndex);
  }

  /** @returns {number} the model column of an engine column, `-1` if there is none */
  modelColumn(engineColumn: number): number {
    this.sync();
    if (this.body instanceof AreaModelArrayOfArrays) {
      return this.dataColumns[engineColumn] ?? -1;
    }
    const property = this.properties[engineColumn];
    if (property === undefined) return -1;
    const n = this.tableModel.getColumnCount();
    for (let i = 0; i < n; i++) {
      if (this.tableModel.getColumnDef(i)?.property === property && this.columnOf(i) === engineColumn) return i;
    }
    return -1;
  }

  /**
   * The address of a cell (`"B3"`), `undefined` for a row number or checkbox column.
   *
   * @param {number} displayRow - display index
   * @param {number} columnIndex - model column
   * @returns {string | undefined} the address
   */
  address(displayRow: number, columnIndex: number): string | undefined {
    const r = this.physicalRow(displayRow);
    const c = this.columnOf(columnIndex);
    return r === undefined || c === undefined ? undefined : toCellAddress(r, c);
  }

  /**
   * The cell of an address: display row (`-1` if a filter hides it) and model column; `undefined` if invalid.
   *
   * @param {string} address - `"B3"`, `"$B$3"`
   * @returns {[number, number] | undefined} display row and model column
   */
  cellOfAddress(address: string): [number, number] | undefined {
    const a = parseCellAddress(address);
    if (!a) return undefined;
    const col = this.modelColumn(a.col);
    if (col < 0 || a.row >= this.rows().length) return undefined;
    return [this.displayRow(a.row), col];
  }

  /**
   * A formula moved from one cell to another (fill handle, paste): relative references move by the physical distance.
   *
   * @param {string} input - the formula (with `=`)
   * @param {number} fromRow - physical row of the source
   * @param {number} fromCol - engine column of the source
   * @param {number} toDisplayRow - display row of the target
   * @param {number} toColumnIndex - model column of the target
   * @returns {string | undefined} the moved formula, `undefined` if the target holds no formulas
   */
  moveFormula(input: string, fromRow: number, fromCol: number, toDisplayRow: number, toColumnIndex: number): string | undefined {
    const r = this.physicalRow(toDisplayRow);
    const c = this.columnOf(toColumnIndex);
    if (r === undefined || c === undefined || !this.formulaColumns[c]) return undefined;
    return "=" + shiftFormula(input.slice(1), r - fromRow, c - fromCol);
  }

  /**
   * The copy of a cell inside the table: a {@link CopiedFormula} for a formula cell, otherwise `value`.
   *
   * @param {number} displayRow - display index
   * @param {number} columnIndex - model column
   * @param {unknown} input - the cell's input
   * @param {unknown} value - the cell's value
   * @returns {unknown} the copy
   */
  copyOf(displayRow: number, columnIndex: number, input: unknown, value: unknown): unknown {
    if (typeof input === "string" && input.startsWith("'=") && this.isFormulaColumnIndex(columnIndex)) {
      return input; // the text "=…" stays text when pasted
    }
    if (!this.isFormulaInput(columnIndex, input)) return value;
    const r = this.physicalRow(displayRow);
    const c = this.columnOf(columnIndex)!;
    return r === undefined ? value : new CopiedFormula(input, r, c, value);
  }

  /**
   * The cells and ranges a formula reads, as addresses (`["B2", "C2", "D2:D4", "A:A"]`).
   *
   * @param {number} displayRow - display index
   * @param {number} columnIndex - model column
   * @returns {string[]} the addresses (empty for a value cell)
   */
  precedents(displayRow: number, columnIndex: number): string[] {
    const r = this.physicalRow(displayRow);
    const c = this.columnOf(columnIndex);
    if (r === undefined || c === undefined) return [];
    return this.engine.getPrecedents(r, c).map(range => {
      if (range.r1 === 0 && range.r2 >= SHEET_MAX_ROWS - 1) return `${columnLetter(range.c1)}:${columnLetter(range.c2)}`;
      if (range.c1 === 0 && range.c2 >= SHEET_MAX_COLUMNS - 1) return `${range.r1 + 1}:${range.r2 + 1}`;
      const from = toCellAddress(range.r1, range.c1);
      return range.r1 === range.r2 && range.c1 === range.c2 ? from : `${from}:${toCellAddress(range.r2, range.c2)}`;
    });
  }

  /**
   * The formula cells that read a cell directly (display row, model column; hidden rows left out).
   *
   * @param {number} displayRow - display index
   * @param {number} columnIndex - model column
   * @returns {Array<[number, number]>} the dependents
   */
  dependents(displayRow: number, columnIndex: number): Array<[number, number]> {
    const r = this.physicalRow(displayRow);
    const c = this.columnOf(columnIndex);
    if (r === undefined || c === undefined) return [];
    const dependents = this.engine.getDependents(r, c);
    if (!dependents.length) return [];
    // one lookup each (not O(rows) per dependent)
    const display = new Map<unknown, number>();
    const n = this.body.getRowCount();
    for (let i = 0; i < n; i++) display.set(this.body.getRowByIndex(i), i);
    const columns = new Map<number, number>();
    const rows = this.rows();
    const ret: Array<[number, number]> = [];
    for (const [dr, dc] of dependents) {
      let mc = columns.get(dc);
      if (mc === undefined) columns.set(dc, mc = this.modelColumn(dc));
      const d = display.get(rows[dr]);
      if (d !== undefined && mc >= 0) ret.push([d, mc]);
    }
    return ret;
  }

  /**
   * False for arrays (moving a column moves the data of every row – the references would point elsewhere); object
   * rows: the column letter belongs to the property and moves with it.
   *
   * @returns {boolean} true if columns may be dragged
   */
  allowsColumnDrag(): boolean {
    return this.body instanceof AreaModelObjectArray;
  }

  // ------------------------------------------------------------------------------------------------ internals

  /** The engine column of a model column: arrays by position, objects by the property (dragged columns keep it). */
  private columnOf(columnIndex: number): number | undefined {
    if (this.body instanceof AreaModelArrayOfArrays) {
      return this.engineColumns.get(columnIndex);
    }
    const def = this.tableModel.getColumnDef(columnIndex);
    if (!def || isRowNumberColumnDef(def) || isCheckboxColumnDef(def)) return undefined;
    return this.propertyColumns.get(def.property);
  }

  private valueOf(row: unknown, c: number | undefined, input: string): unknown {
    if (c === undefined || !this.formulaColumns[c]) return input;
    if (input.startsWith("'=")) return input.slice(1); // '= is text
    if (!isFormulaText(input) || this.syncing) return input;
    this.sync();
    const r = this.rowIndex.get(row);
    return r === undefined ? input : this.engine.getValue(r, c);
  }

  private rows(): unknown[] {
    return this.body instanceof AreaModelObjectArray ? this.body.getAllRows() : this.body.arr;
  }

  private readInput(r: number, c: number): unknown {
    const row = this.rows()[r];
    if (row === undefined || row === null) return undefined;
    if (this.body instanceof AreaModelArrayOfArrays) {
      return (row as unknown[])[this.dataColumns[c]];
    }
    const property = this.properties[c];
    if (this.body.isCalculatedProperty(property) && !this.formulaColumns[c]) {
      return this.body.getRowValue(row, property); // a calculated column (valueGetter)
    }
    let o: any = row;
    for (const key of property.split(".")) {
      if (o === null || o === undefined) return undefined;
      o = o[key];
    }
    return o;
  }

  /** Rebuilds rows, columns and the engine if the rows array, its length or the columns changed. */
  private sync(): boolean {
    if (this.syncing) return false;
    const rows = this.rows();
    const defs = this.tableModel.getColumnDefs?.() ?? [];
    const columnCount = this.tableModel.getColumnCount();
    if (rows === this.rowsRef && rows.length === this.rowsLength && defs === this.columnDefsRef
      && columnCount === this.columnCount) {
      return false;
    }
    this.syncing = true;
    try {
      if (defs !== this.columnDefsRef || columnCount !== this.columnCount) {
        this.buildColumns(defs, columnCount);
      }
      this.rowsRef = rows;
      this.rowsLength = rows.length;
      this.rowIndex = new Map();
      for (let i = rows.length - 1; i >= 0; i--) this.rowIndex.set(rows[i], i); // the first occurrence wins
      this.engine.rebuild();
    } finally {
      this.syncing = false;
    }
    return true;
  }

  private buildColumns(defs: ColumnDefIf[], columnCount: number): void {
    this.columnDefsRef = defs;
    this.columnCount = columnCount;
    this.dataColumns = [];
    this.properties = [];
    this.formulaColumns = [];
    this.calculatedColumns = [];
    this.engineColumns.clear();
    this.propertyColumns.clear();
    const only = this.options.columns;
    for (let i = 0; i < columnCount; i++) {
      const def = defs[i] ?? this.tableModel.getColumnDef(i);
      if (isRowNumberColumnDef(def) || isCheckboxColumnDef(def)) continue;
      const c = this.dataColumns.length;
      const property = def?.property ?? "";
      this.dataColumns.push(i);
      this.properties.push(property);
      this.engineColumns.set(i, c);
      if (property && !this.propertyColumns.has(property)) this.propertyColumns.set(property, c);
      const calculated = !!def?.valueGetter;
      if (calculated) this.calculatedColumns.push(c);
      this.formulaColumns.push(!calculated && def?.cellFormulas !== false && (!only || only.includes(property)));
    }
  }
}
