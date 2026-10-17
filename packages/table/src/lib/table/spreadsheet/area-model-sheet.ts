import { AbstractAreaModel } from "../data/tablemodel/areamodel/abstract-area-model";
import type { AreaIdent } from "../data/tablemodel/area-ident.type";
import type { ColumnDefIf } from "../data/tablemodel/column/column-def.if";
import type { FilterFunction } from "../data/common/filter-function";
import type { SortItem } from "../data/common/sort-item";
import { compareSheet } from "../sheet/sheet-values";
import { isFormulaError } from "../formula/formula-error";

/**
 * The body of a spreadsheet ({@link SpreadsheetFactory}): **sparse** – only rows with content exist (a sheet with a
 * million empty rows costs nothing), row `n` = physical row `n` (cell formulas), sorting and filtering as a
 * permutation (display → physical) only while they apply. Cells are stored by data column (`A` = 0); the model columns
 * in front (row numbers) are left out with `columnOffset`.
 *
 * @example
 * const body = new AreaModelSheet("body", [["Laptop", 1299], ["Mouse", 25]], 100, 26, 30, columnDefs, 1);
 * body.getSheetData();   // [["Laptop", 1299], ["Mouse", 25]]
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export class AreaModelSheet extends AbstractAreaModel<unknown[]> {

  /** Increases with every structural change (rows/columns inserted or deleted, data replaced). */
  version = 0;
  private rows = new Map<number, unknown[]>();
  private physicalOfArray = new Map<unknown[], number>();
  private perm?: Int32Array;
  private inverse?: Map<number, number>;

  constructor(
    areaIdent: AreaIdent,
    data: unknown[][],
    private rowCount: number,
    private columnCount: number,
    defaultRowHeight: number,
    columnDefs: ColumnDefIf[] = [],
    readonly columnOffset = 0,
  ) {
    super(areaIdent, columnDefs, defaultRowHeight);
    this.setSheetData(data, rowCount, columnCount);
  }

  // ------------------------------------------------------------------------------------------------ cells

  /**
   * Replaces all cells (sorting and filters end).
   *
   * @param {unknown[][]} data - rows × data columns
   * @param {number} [rowCount] - at least the rows of `data`
   * @param {number} [columnCount] - at least the longest row
   */
  setSheetData(data: unknown[][], rowCount = this.rowCount, columnCount = this.columnCount): void {
    this.rows.clear();
    this.physicalOfArray.clear();
    data.forEach((row, r) => {
      if (row && row.some(v => v !== undefined && v !== null && v !== "")) {
        const copy = [...row];
        this.rows.set(r, copy);
        this.physicalOfArray.set(copy, r);
      }
    });
    this.rowCount = Math.max(rowCount, data.length);
    this.columnCount = Math.max(columnCount, data.reduce((m, row) => Math.max(m, row?.length ?? 0), 0));
    this.perm = undefined;
    this.inverse = undefined;
    this.version++;
  }

  /**
   * The cells as rows × columns, up to the last row and column with content (empty cells `""`) – e.g. to save them.
   *
   * @returns {unknown[][]} the data
   */
  getSheetData(): unknown[][] {
    let lastRow = -1;
    let lastCol = -1;
    this.rows.forEach((row, r) => {
      for (let c = row.length - 1; c >= 0; c--) {
        if (!isEmpty(row[c])) {
          lastRow = Math.max(lastRow, r);
          lastCol = Math.max(lastCol, c);
          break;
        }
      }
    });
    const ret: unknown[][] = [];
    for (let r = 0; r <= lastRow; r++) {
      const row = this.rows.get(r);
      ret.push(Array.from({ length: lastCol + 1 }, (_, c) => (row && !isEmpty(row[c]) ? row[c] : "")));
    }
    return ret;
  }

  /** @returns {unknown} the input of a cell by physical row and data column (`undefined` if empty) */
  getCell(row: number, col: number): unknown {
    return this.rows.get(row)?.[col];
  }

  /**
   * Writes the input of a cell by physical row and data column (the row is created on demand).
   *
   * @param {number} row - physical row
   * @param {number} col - data column
   * @param {unknown} value - the input
   */
  setCell(row: number, col: number, value: unknown): void {
    let cells = this.rows.get(row);
    if (!cells) {
      if (isEmpty(value)) return;
      cells = [];
      this.rows.set(row, cells);
      this.physicalOfArray.set(cells, row);
    }
    cells[col] = value;
  }

  /** @returns {unknown[] | undefined} the row array of a physical row (`undefined` for an empty row) */
  getRowArray(row: number): unknown[] | undefined {
    return this.rows.get(row);
  }

  /** Calls `fn` for every stored cell (the sparse rows only). */
  forEachCell(fn: (row: number, col: number, value: unknown) => void): void {
    this.rows.forEach((cells, r) => cells.forEach((v, c) => fn(r, c, v)));
  }

  /** @returns {number | undefined} the physical row of a row array of this model */
  getPhysicalRowOfArray(row: unknown): number | undefined {
    return this.physicalOfArray.get(row as unknown[]);
  }

  /** @returns {number} the number of data columns */
  getSheetColumnCount(): number {
    return this.columnCount;
  }

  /**
   * New column definitions (inserted or deleted columns).
   *
   * @param {ColumnDefIf[]} columnDefs - all columns of the table
   */
  setColumnDefs(columnDefs: ColumnDefIf[]): void {
    this.columnDefs = columnDefs;
    this.cellRenderers = columnDefs.map(def => def.rendererMap?.[this.areaIdent]);
  }

  // ------------------------------------------------------------------------------------------------ AreaModelIf

  getRowCount(): number {
    return this.perm ? this.perm.length : this.rowCount;
  }

  /** @returns {number} all rows, without sorting and filters */
  getUnfilteredRowCount(): number {
    return this.rowCount;
  }

  /**
   * The physical row (= row number − 1) of a display row – row numbers in `"original"` mode and cell formulas use it.
   *
   * @param {number} rowIndex - display index
   * @returns {number} the physical row
   */
  getPhysicalRowIndex(rowIndex: number): number {
    return this.perm ? this.perm[rowIndex] : rowIndex;
  }

  /**
   * The display row of a physical row, `-1` if a filter hides it.
   *
   * @param {number} physicalRow - the physical row
   * @returns {number} the display index
   */
  getDisplayRowIndex(physicalRow: number): number {
    if (!this.perm) return physicalRow < this.rowCount ? physicalRow : -1;
    if (!this.inverse) {
      this.inverse = new Map();
      this.perm.forEach((p, d) => this.inverse!.set(p, d));
    }
    return this.inverse.get(physicalRow) ?? -1;
  }

  getValueAt(rowIndex: number, columnIndex: number): any {
    const row = this.rows.get(this.getPhysicalRowIndex(rowIndex));
    const value = row?.[columnIndex - this.columnOffset];
    if (value === undefined || value === null) return "";
    // cell formulas: "=B2*C2" → its result
    return this.sheetCells && typeof value === "string" ? this.sheetCells.valueAt(row, columnIndex, value) : value;
  }

  /**
   * The input of a cell – the formula text of a formula, otherwise the value (`""` for an empty cell).
   *
   * @param {number} rowIndex - display index
   * @param {number} columnIndex - model column
   * @returns {unknown} the input
   */
  getInputValueAt(rowIndex: number, columnIndex: number): unknown {
    return this.rows.get(this.getPhysicalRowIndex(rowIndex))?.[columnIndex - this.columnOffset] ?? "";
  }

  override getTextValueAt(rowIndex: number, columnIndex: number): string {
    const value = this.getValueAt(rowIndex, columnIndex);
    return isFormulaError(value) ? value.code : String(value);
  }

  override setValue(rowIndex: number, columnIndex: number, value: any): boolean {
    const pipe = this.columnDefs[columnIndex]?.editInputPipe;
    if (pipe) {
      value = pipe(value, rowIndex, columnIndex);
    }
    if (columnIndex < this.columnOffset || rowIndex < 0 || rowIndex >= this.getRowCount()) {
      return false;
    }
    this.setCell(this.getPhysicalRowIndex(rowIndex), columnIndex - this.columnOffset, value);
    return true;
  }

  /** The row array of a display row – `undefined` for an empty row (no object is created by reading). */
  override getRowByIndex(rowIndex: number): any {
    return this.rows.get(this.getPhysicalRowIndex(rowIndex));
  }

  getRowHeight(_rowIndex: number): number {
    return this.defaultRowHeight;
  }

  /** @returns {number | undefined} the constant row height */
  getConstantRowHeight(): number | undefined {
    return this.defaultRowHeight > 0 ? this.defaultRowHeight : undefined;
  }

  /**
   * A sheet has no merged cells: the table skips the span scan (rows × columns calls on every init).
   *
   * @returns {number} 1
   */
  override getMaxColspan(): number {
    return 1;
  }

  /** @returns {number} 1 – no merged cells (see {@link getMaxColspan}) */
  override getMaxRowspan(): number {
    return 1;
  }

  /** A filter: the predicate gets the row as array of inputs (`[]` for an empty row). */
  externalFilterChanged(predictFn: FilterFunction<any>): void {
    const shown: number[] = [];
    for (let r = 0; r < this.rowCount; r++) {
      if (predictFn(this.rows.get(r) ?? [], r, [])) shown.push(r);
    }
    this.perm = shown.length === this.rowCount ? undefined : Int32Array.from(shown);
    this.inverse = undefined;
  }

  /** Sorts the shown rows by the values of columns (empty cells last). */
  override doSort(sortItems: SortItem[]): boolean {
    const items = sortItems.filter(i => i.sortState === "asc" || i.sortState === "desc");
    const order = this.perm ? Array.from(this.perm) : Array.from({ length: this.rowCount }, (_, i) => i);
    order.sort((a, b) => {
      for (const { columnIndex, sortState } of items) {
        const va = this.valueOfPhysical(a, columnIndex);
        const vb = this.valueOfPhysical(b, columnIndex);
        const ea = va === "" || isFormulaError(va);
        const eb = vb === "" || isFormulaError(vb);
        if (ea || eb) {
          if (ea !== eb) return ea ? 1 : -1;
          continue;
        }
        const c = compareSheet(va as never, vb as never);
        const n = typeof c === "number" ? c : 0;
        if (n) return sortState === "asc" ? n : -n;
      }
      return a - b; // stable: the physical order
    });
    if (!items.length && order.length === this.rowCount) {
      this.perm = undefined; // unsorted, unfiltered: no permutation
      this.inverse = undefined;
      return true;
    }
    this.perm = Int32Array.from(order);
    this.inverse = undefined;
    return true;
  }

  // ------------------------------------------------------------------------------------------------ structure

  /**
   * Inserts empty rows before a physical row (sorting and filters end).
   *
   * @param {number} at - physical row
   * @param {number} count - rows
   */
  insertRows(at: number, count: number): void {
    this.shiftRows(at, count);
    this.rowCount += count;
  }

  /**
   * Deletes rows (sorting and filters end).
   *
   * @param {number} at - first physical row
   * @param {number} count - rows
   * @returns {Array<[number, unknown[]]>} the deleted rows with content (offset from `at`, the row array) – for undo
   */
  deleteRows(at: number, count: number): Array<[number, unknown[]]> {
    const removed: Array<[number, unknown[]]> = [];
    for (let r = at; r < at + count; r++) {
      const row = this.rows.get(r);
      if (row) {
        removed.push([r - at, row]);
        this.physicalOfArray.delete(row);
        this.rows.delete(r);
      }
    }
    this.shiftRows(at + count, -count);
    this.rowCount = Math.max(0, this.rowCount - count);
    return removed;
  }

  /**
   * Inserts rows again that {@link deleteRows} removed (undo): the same row arrays at their places.
   *
   * @param {number} at - first physical row
   * @param {number} count - rows
   * @param {Array<[number, unknown[]]>} removed - what `deleteRows` returned
   */
  restoreRows(at: number, count: number, removed: ReadonlyArray<readonly [number, unknown[]]>): void {
    this.insertRows(at, count);
    for (const [offset, row] of removed) {
      this.rows.set(at + offset, row);
      this.physicalOfArray.set(row, at + offset);
    }
  }

  /**
   * Inserts empty data columns before a data column.
   *
   * @param {number} at - data column
   * @param {number} count - columns
   */
  insertColumns(at: number, count: number): void {
    this.rows.forEach(row => {
      if (row.length > at) row.splice(at, 0, ...new Array(count));
    });
    this.columnCount += count;
    this.changed();
  }

  /**
   * Deletes data columns.
   *
   * @param {number} at - first data column
   * @param {number} count - columns
   * @returns {Array<[unknown[], unknown[]]>} per row with content in the columns: the row array and its removed cells
   */
  deleteColumns(at: number, count: number): Array<[unknown[], unknown[]]> {
    const removed: Array<[unknown[], unknown[]]> = [];
    this.rows.forEach(row => {
      const cells = row.splice(at, count);
      if (cells.some(v => !isEmpty(v))) removed.push([row, cells]);
    });
    this.columnCount = Math.max(0, this.columnCount - count);
    this.changed();
    return removed;
  }

  /**
   * Inserts columns again that {@link deleteColumns} removed (undo).
   *
   * @param {number} at - first data column
   * @param {number} count - columns
   * @param {Array<[unknown[], unknown[]]>} removed - what `deleteColumns` returned
   */
  restoreColumns(at: number, count: number, removed: ReadonlyArray<readonly [unknown[], unknown[]]>): void {
    this.insertColumns(at, count);
    for (const [row, cells] of removed) {
      cells.forEach((v, i) => { row[at + i] = v; });
    }
  }

  /**
   * The extent of the content in the current view: the last display row and model column with a value (the Excel
   * export leaves out the empty rest). `[-1, -1]` for an empty sheet.
   *
   * @returns {[number, number]} last display row and last model column
   */
  getContentExtent(): [number, number] {
    let lastRow = -1;
    let lastCol = -1;
    this.rows.forEach((row, r) => {
      let last = -1;
      for (let c = row.length - 1; c >= 0; c--) {
        if (!isEmpty(row[c])) {
          last = c;
          break;
        }
      }
      if (last < 0) return;
      const d = this.getDisplayRowIndex(r);
      if (d < 0) return;
      lastRow = Math.max(lastRow, d);
      lastCol = Math.max(lastCol, last + this.columnOffset);
    });
    return [lastRow, lastCol];
  }

  // ------------------------------------------------------------------------------------------------ internals

  private valueOfPhysical(p: number, c: number): unknown {
    const row = this.rows.get(p);
    const value = row?.[c - this.columnOffset];
    if (value === undefined || value === null) return "";
    return this.sheetCells && typeof value === "string" ? this.sheetCells.valueAt(row, c, value) : value;
  }

  private shiftRows(from: number, delta: number): void {
    const moved = Array.from(this.rows).filter(([r]) => r >= from).sort((a, b) => (delta > 0 ? b[0] - a[0] : a[0] - b[0]));
    for (const [r] of moved) this.rows.delete(r);
    for (const [r, row] of moved) {
      this.rows.set(r + delta, row);
      this.physicalOfArray.set(row, r + delta);
    }
    this.changed();
  }

  private changed(): void {
    this.perm = undefined;
    this.inverse = undefined;
    this.version++;
  }
}

function isEmpty(v: unknown): boolean {
  return v === undefined || v === null || v === "";
}
