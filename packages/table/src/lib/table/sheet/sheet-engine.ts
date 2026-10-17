import type { FormulaFunction } from "../formula/formula-options.if";
import { FormulaError, isFormulaError } from "../formula/formula-error";
import { CellRange } from "../data/common/cell-range";
import { cellKey, type CompiledCellFormula, compileCellFormula, type RangeRef, type SheetCompileEnv } from "./sheet-compiler";
import { SHEET_MAX_COLUMNS, SHEET_MAX_ROWS } from "./cell-address";
import { dateToSerial, fromCellData, isSheetDate, type SheetValue, toExternal } from "./sheet-values";
import { adjustFormula, type SheetStructureEditIf } from "./shift-formula";
import type { CellFormulaOptionsIf } from "./cell-formula-options.if";
import { CellFormulaOptions } from "./cell-formula-options";

/**
 * The data a {@link SheetEngine} computes on: inputs by **physical** row and column (0-based) – values or formula texts
 * (`"=B2*C2"`). The table has adapters for its models; `SheetEngine.fromArrays` uses a 2-D array.
 *
 * @example
 * const source: SheetDataSourceIf = {
 *   getRowCount: () => data.length,
 *   getColumnCount: () => 4,
 *   getInput: (row, col) => data[row][col],
 * };
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export interface SheetDataSourceIf {
  getRowCount(): number;
  getColumnCount(): number;
  /** The input of a cell: a value or a formula text with `=`. */
  getInput(row: number, col: number): unknown;
  /** False for a column whose `=…` texts are plain text (`ColumnDef.cellFormulas: false`). Default: true. */
  isFormulaColumn?(col: number): boolean;
  /** The column of a data field for `[field]` in a cell formula, -1 if it is none. */
  getFieldColumn?(field: string): number;
  /**
   * Optional, for sparse data (a sheet with a million empty rows): calls `fn` for every cell that may hold an input –
   * `rebuild()` then reads only these instead of rows × columns.
   */
  forEachInput?(fn: (row: number, col: number, input: unknown) => void): void;
}

/**
 * What a (re)calculation did.
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export interface SheetRecalcResultIf {
  /** Formula cells whose result changed (row, column). */
  readonly changedCells: ReadonlyArray<readonly [number, number]>;
  /** Formula cells evaluated. */
  readonly evaluated: number;
}

/** A formula cell in the graph. */
interface FormulaCell {
  row: number;
  col: number;
  source: string;
  compiled: CompiledCellFormula;
  value: SheetValue;
  rangeKeys: string[];
}

/** A range read by formulas – one node for all formulas that read it (`SUM(A:A)` is one node, not a million edges). */
interface RangeNode extends RangeRef {
  key: string;
  dependents: Set<number>;
}

/** Ranges wider than this are checked for every changed cell instead of being indexed per column. */
const WIDE = 64;

/**
 * True for a formula input: text starting with `=` (more than `=`). `'=…` is text.
 *
 * @param {unknown} input - a cell input
 * @returns {boolean} true for a formula text
 *
 * @example
 * isFormulaText("=B2*C2");   // true
 * isFormulaText("'=1+1");    // false – text "=1+1"
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export function isFormulaText(input: unknown): input is string {
  return typeof input === "string" && input.length > 1 && input[0] === "=";
}

/**
 * The spreadsheet engine of cell formulas (DOM-free): compiles the formula texts of the data (`"=SUM(D2:D4)"`), keeps a
 * dependency graph (single cells and range nodes) and recalculates **only the dependent cells** after a change – in
 * topological order (Kahn), cycles (Tarjan) become `#CIRC!`. No `eval`, no `new Function`. Volatile functions (`TODAY`,
 * `NOW`, `RAND`, `RANDBETWEEN`) are recomputed on every recalculation.
 *
 * @example
 * const engine = SheetEngine.fromArrays([
 *   ["Laptop", 1299, 2, "=B1*C1"],
 *   ["Mouse", 25, 10, "=B2*C2"],
 *   [null, null, null, "=SUM(D1:D2)"],
 * ]);
 * engine.getValue(2, 3);   // 2848
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export class SheetEngine {

  readonly options: CellFormulaOptionsIf;
  private readonly formulas = new Map<number, FormulaCell>();
  private readonly singleDependents = new Map<number, Set<number>>();
  private readonly rangeNodes = new Map<string, RangeNode>();
  private readonly rangesByColumn = new Map<number, RangeNode[]>();
  private readonly wideRanges: RangeNode[] = [];
  private readonly volatileCells = new Set<number>();
  /** Formula cells per column – a read in a column without formulas skips the map lookup. */
  private readonly formulaColumns = new Map<number, number>();
  private readonly env: SheetCompileEnv;
  private readonly fieldColumns = new Map<string, number>();

  /**
   * @param {SheetDataSourceIf} source - the data
   * @param {Partial<CellFormulaOptionsIf> & { now?: () => Date, random?: () => number }} [options] - own functions
   *        and limits; `now`/`random` for tests
   */
  constructor(private readonly source: SheetDataSourceIf,
              options: Partial<CellFormulaOptionsIf> & { now?: () => Date; random?: () => number } = {}) {
    this.options = CellFormulaOptions.create(options) ?? new CellFormulaOptions();
    const functions = new Map<string, FormulaFunction>();
    for (const [name, fn] of Object.entries(this.options.functions ?? {})) {
      if (typeof fn === "function") functions.set(name.toUpperCase(), fn);
    }
    const now = options.now ?? (() => new Date());
    const random = options.random ?? Math.random;
    const isoDatesAsDates = this.options.isoDatesAsDates;
    this.env = {
      read: (row, col) => this.read(row, col),
      rowCount: () => this.source.getRowCount(),
      fieldColumn: name => this.fieldColumn(name),
      functions,
      maxRangeCells: this.options.maxRangeCells,
      fn: { isoDatesAsDates, now: () => dateToSerial(now()), random },
    };
  }

  /**
   * An engine over a 2-D array (rows of cells) – without a table.
   *
   * @param {unknown[][]} data - the cells; formula texts start with `=`
   * @param {Partial<CellFormulaOptionsIf>} [options] - own functions and limits
   * @returns {SheetEngine} the engine, already calculated
   *
   * @example
   * SheetEngine.fromArrays([[1, 2, "=A1+B1"]]).getValue(0, 2);   // 3
   */
  static fromArrays(data: unknown[][], options?: Partial<CellFormulaOptionsIf>): SheetEngine {
    const engine = new SheetEngine({
      getRowCount: () => data.length,
      getColumnCount: () => data.reduce((max, r) => Math.max(max, r?.length ?? 0), 0),
      getInput: (row, col) => data[row]?.[col],
    }, options);
    engine.rebuild();
    return engine;
  }

  /**
   * Reads all inputs again and calculates every formula (start, `setRows`, other columns).
   *
   * @returns {SheetRecalcResultIf} what was calculated
   */
  rebuild(): SheetRecalcResultIf {
    this.formulas.clear();
    this.singleDependents.clear();
    this.rangeNodes.clear();
    this.rangesByColumn.clear();
    this.wideRanges.length = 0;
    this.volatileCells.clear();
    this.fieldColumns.clear();
    this.formulaColumns.clear();
    const rows = Math.min(this.source.getRowCount(), SHEET_MAX_ROWS);
    const cols = Math.min(this.source.getColumnCount(), SHEET_MAX_COLUMNS);
    const seeds: number[] = [];
    const source = this.source;
    if (source.forEachInput) {
      source.forEachInput((r, c, input) => {
        if (r < rows && c < cols && isFormulaText(input) && (!source.isFormulaColumn || source.isFormulaColumn(c))) {
          this.add(r, c, input, null);
          seeds.push(cellKey(r, c));
        }
      });
      return this.recalc(seeds, true);
    }
    for (let c = 0; c < cols; c++) {
      if (source.isFormulaColumn && !source.isFormulaColumn(c)) continue;
      for (let r = 0; r < rows; r++) {
        const input = source.getInput(r, c);
        if (isFormulaText(input)) {
          this.add(r, c, input, null);
          seeds.push(cellKey(r, c));
        }
      }
    }
    return this.recalc(seeds, true);
  }

  /**
   * The inputs of cells changed (written by the table): formulas are compiled again, the dependent cells recalculated.
   *
   * @param {ReadonlyArray<readonly [number, number]>} cells - physical row and column of each changed cell
   * @returns {SheetRecalcResultIf} what was recalculated
   */
  inputsChanged(cells: ReadonlyArray<readonly [number, number]>): SheetRecalcResultIf {
    const seeds: number[] = [];
    for (const [r, c] of cells) {
      const key = cellKey(r, c);
      const old = this.formulas.get(key);
      const input = this.source.getInput(r, c);
      const formula = isFormulaText(input) && (!this.source.isFormulaColumn || this.source.isFormulaColumn(c));
      if (old && formula && old.source === input) {
        seeds.push(key);
        continue;
      }
      if (old) {
        this.remove(old);
      }
      if (formula) {
        this.add(r, c, input, old ? old.value : this.dataValue(r, c));
      }
      seeds.push(key);
    }
    for (const key of this.volatileCells) seeds.push(key);
    return this.recalc(seeds, false);
  }

  /**
   * Recalculates the volatile formulas (`TODAY`, `NOW`, `RAND`) and their dependents.
   *
   * @returns {SheetRecalcResultIf} what was recalculated
   */
  recalculate(): SheetRecalcResultIf {
    return this.recalc([...this.volatileCells], false);
  }

  /**
   * The value of a cell: the result of its formula or its data value (`Date` for dates, a {@link FormulaError} for an
   * error, `'=…` without the quote).
   *
   * @param {number} row - physical row (0-based)
   * @param {number} col - column (0-based)
   * @returns {unknown} the value
   */
  getValue(row: number, col: number): unknown {
    return toExternal(this.read(row, col));
  }

  /**
   * True if the cell holds a formula.
   *
   * @param {number} row - physical row
   * @param {number} col - column
   * @returns {boolean} true for a formula cell
   */
  isFormula(row: number, col: number): boolean {
    return this.formulas.has(cellKey(row, col));
  }

  /** @returns {number} the number of formula cells */
  getFormulaCount(): number {
    return this.formulas.size;
  }

  /**
   * Evaluates a formula once (not stored), e.g. for a formula bar preview.
   *
   * @param {string} source - the formula (`"=SUM(D2:D4)"`, the `=` is optional)
   * @param {[number, number]} [at] - the cell it is evaluated in (for `[field]`)
   * @returns {unknown} the result
   *
   * @example
   * engine.evaluate("=SUM(D2:D4)");   // 3895
   */
  evaluate(source: string, at?: readonly [number, number]): unknown {
    const text = source.trim().startsWith("=") ? source : `=${source}`;
    return toExternal(compileCellFormula(text, at?.[0] ?? 0, this.env).evaluate());
  }

  /**
   * The cells and ranges a formula reads.
   *
   * @param {number} row - physical row
   * @param {number} col - column
   * @returns {CellRange[]} its precedents (empty for a value cell)
   */
  getPrecedents(row: number, col: number): CellRange[] {
    const cell = this.formulas.get(cellKey(row, col));
    if (!cell) return [];
    const ret = cell.compiled.singles.map(k => CellRange.singleCell(Math.floor(k / SHEET_MAX_COLUMNS), k % SHEET_MAX_COLUMNS));
    for (const r of cell.compiled.ranges) ret.push(new CellRange(r.r1, r.c1, r.r2, r.c2));
    return ret;
  }

  /**
   * The formula cells that read a cell directly.
   *
   * @param {number} row - physical row
   * @param {number} col - column
   * @returns {Array<[number, number]>} row and column of each dependent
   */
  getDependents(row: number, col: number): Array<[number, number]> {
    const seen = new Set<number>();
    this.forEachDependent(cellKey(row, col), row, col, d => seen.add(d));
    return [...seen].map(k => [Math.floor(k / SHEET_MAX_COLUMNS), k % SHEET_MAX_COLUMNS]);
  }

  /**
   * The new formula texts after rows or columns were inserted or deleted (or cells moved) – the caller writes them
   * (the engine only reads the data). Cells are given at their position **after** the edit.
   *
   * @param {SheetStructureEditIf} edit - what changed
   * @returns {Array<{ row: number, col: number, input: string }>} changed formula texts
   */
  adjustForStructureChange(edit: SheetStructureEditIf): Array<{ row: number; col: number; input: string }> {
    const ret: Array<{ row: number; col: number; input: string }> = [];
    for (const cell of this.formulas.values()) {
      const position = newPosition(cell.row, cell.col, edit);
      if (!position) continue; // the cell itself was deleted
      const adjusted = "=" + adjustFormula(cell.source.slice(1), edit);
      if (adjusted !== cell.source) {
        ret.push({ row: position[0], col: position[1], input: adjusted });
      }
    }
    return ret;
  }

  // ------------------------------------------------------------------------------------------------ internals

  private read(row: number, col: number): SheetValue {
    if (this.formulaColumns.has(col)) {
      const cell = this.formulas.get(cellKey(row, col));
      if (cell) return cell.value;
    }
    return this.dataValue(row, col);
  }

  /** A value cell: `""` is blank (a cleared cell), `'=…` is the text `=…`. */
  private dataValue(row: number, col: number): SheetValue {
    if (row >= this.source.getRowCount()) return null;
    const input = this.source.getInput(row, col);
    if (input === "") return null;
    if (typeof input === "string" && input.startsWith("'=")) return input.slice(1);
    return fromCellData(input);
  }

  private fieldColumn(name: string): number {
    let col = this.fieldColumns.get(name);
    if (col === undefined) {
      col = this.source.getFieldColumn?.(name) ?? -1;
      this.fieldColumns.set(name, col);
    }
    return col;
  }

  private add(row: number, col: number, source: string, value: SheetValue): void {
    const key = cellKey(row, col);
    const compiled = compileCellFormula(source, row, this.env);
    const cell: FormulaCell = { row, col, source, compiled, value, rangeKeys: [] };
    this.formulas.set(key, cell);
    this.formulaColumns.set(col, (this.formulaColumns.get(col) ?? 0) + 1);
    for (const s of compiled.singles) {
      let set = this.singleDependents.get(s);
      if (!set) {
        set = new Set();
        this.singleDependents.set(s, set);
      }
      set.add(key);
    }
    for (const r of compiled.ranges) {
      const rk = `${r.r1}:${r.c1}:${r.r2}:${r.c2}`;
      let node = this.rangeNodes.get(rk);
      if (!node) {
        node = { ...r, key: rk, dependents: new Set() };
        this.rangeNodes.set(rk, node);
        if (r.c2 - r.c1 + 1 > WIDE) {
          this.wideRanges.push(node);
        } else {
          for (let c = r.c1; c <= r.c2; c++) {
            let list = this.rangesByColumn.get(c);
            if (!list) {
              list = [];
              this.rangesByColumn.set(c, list);
            }
            insertByEndRow(list, node);
          }
        }
      }
      node.dependents.add(key);
      cell.rangeKeys.push(rk);
    }
    if (compiled.volatile) {
      this.volatileCells.add(key);
    }
  }

  private remove(cell: FormulaCell): void {
    const key = cellKey(cell.row, cell.col);
    this.formulas.delete(key);
    const n = this.formulaColumns.get(cell.col)! - 1;
    if (n) this.formulaColumns.set(cell.col, n);
    else this.formulaColumns.delete(cell.col);
    this.volatileCells.delete(key);
    for (const s of cell.compiled.singles) {
      const set = this.singleDependents.get(s);
      set?.delete(key);
      if (set && !set.size) this.singleDependents.delete(s);
    }
    for (const rk of cell.rangeKeys) {
      const node = this.rangeNodes.get(rk);
      if (!node) continue;
      node.dependents.delete(key);
      if (node.dependents.size) continue;
      this.rangeNodes.delete(rk);
      if (node.c2 - node.c1 + 1 > WIDE) {
        this.wideRanges.splice(this.wideRanges.indexOf(node), 1);
      } else {
        for (let c = node.c1; c <= node.c2; c++) {
          const list = this.rangesByColumn.get(c)!;
          list.splice(list.indexOf(node), 1);
          if (!list.length) this.rangesByColumn.delete(c);
        }
      }
    }
  }

  /** Calls `fn` for every formula that reads the cell (single references and ranges; a formula may come twice). */
  private forEachDependent(key: number, row: number, col: number, fn: (dependent: number) => void): void {
    const singles = this.singleDependents.get(key);
    if (singles) {
      for (const d of singles) fn(d);
    }
    const list = this.rangesByColumn.get(col);
    if (list) {
      for (const node of list) { // sorted by r2 descending: stop at the first range that ends above the row
        if (node.r2 < row) break;
        if (row >= node.r1) {
          for (const d of node.dependents) fn(d);
        }
      }
    }
    for (const node of this.wideRanges) {
      if (row >= node.r1 && row <= node.r2 && col >= node.c1 && col <= node.c2) {
        for (const d of node.dependents) fn(d);
      }
    }
  }

  private dependentsOfKey(key: number, fn: (dependent: number) => void): void {
    this.forEachDependent(key, Math.floor(key / SHEET_MAX_COLUMNS), key % SHEET_MAX_COLUMNS, fn);
  }

  /**
   * Recalculates the formulas reachable from the seeds: BFS over the dependents → Kahn (topological) → the rest are
   * cycles (Tarjan → #CIRC!) and cells behind them (a second Kahn pass, they inherit the error). Iterative – a chain
   * of 100 000 cells does not overflow the stack. The dependents of a cell are looked up once per recalculation.
   *
   * Cost: the graph part is linear in the dependents; the evaluation reads every cell of every range again – a
   * running sum `=SUM($B$2:B2)` copied down n rows is O(n²) per change (as in Excel; `=C1+B2` is linear).
   */
  private recalc(seeds: number[], all: boolean): SheetRecalcResultIf {
    const successors = new Map<number, number[]>();
    const dependentsOf = (k: number): number[] => {
      let list = successors.get(k);
      if (!list) {
        const l: number[] = [];
        this.dependentsOfKey(k, d => l.push(d));
        successors.set(k, list = l);
      }
      return list;
    };
    const dirty = new Set<number>();
    const visited = new Set<number>(seeds);
    const queue = [...seeds];
    for (let i = 0; i < queue.length; i++) {
      const k = queue[i];
      if (this.formulas.has(k)) dirty.add(k);
      if (all) continue; // a rebuild evaluates every formula anyway
      for (const d of dependentsOf(k)) {
        if (!visited.has(d)) {
          visited.add(d);
          queue.push(d);
        }
      }
    }
    const changed: Array<[number, number]> = [];
    let evaluated = 0;
    const evaluate = (k: number) => {
      const cell = this.formulas.get(k)!;
      const before = cell.value;
      cell.value = cell.compiled.evaluate();
      evaluated++;
      if (!sameValue(before, cell.value)) changed.push([cell.row, cell.col]);
    };
    const done = new Set<number>();
    const kahn = (nodes: Set<number>) => {
      const indegree = new Map<number, number>();
      for (const k of nodes) indegree.set(k, 0);
      for (const k of nodes) {
        for (const d of dependentsOf(k)) {
          if (nodes.has(d)) indegree.set(d, indegree.get(d)! + 1);
        }
      }
      const ready: number[] = [];
      for (const [k, n] of indegree) if (n === 0) ready.push(k);
      for (let i = 0; i < ready.length; i++) {
        const k = ready[i];
        evaluate(k);
        done.add(k);
        for (const d of dependentsOf(k)) {
          if (!nodes.has(d) || done.has(d)) continue;
          const n = indegree.get(d)! - 1;
          indegree.set(d, n);
          if (n === 0) ready.push(d);
        }
      }
    };
    kahn(dirty);
    if (done.size < dirty.size) {
      const rest = new Set([...dirty].filter(k => !done.has(k)));
      const circ = new FormulaError("#CIRC!", "Circular reference");
      for (const k of this.cycles(rest, dependentsOf)) {
        const cell = this.formulas.get(k)!;
        const before = cell.value;
        cell.value = circ;
        evaluated++;
        if (!sameValue(before, circ)) changed.push([cell.row, cell.col]);
        done.add(k);
        rest.delete(k);
      }
      kahn(rest);
    }
    return { changedCells: changed, evaluated };
  }

  /** The cells of `nodes` that lie on a cycle (strongly connected components > 1 or a self reference) – iterative Tarjan. */
  private cycles(nodes: Set<number>, dependentsOf: (k: number) => number[]): number[] {
    const index = new Map<number, number>();
    const low = new Map<number, number>();
    const onStack = new Set<number>();
    const stack: number[] = [];
    const ret: number[] = [];
    let counter = 0;
    const successors = (k: number): number[] => dependentsOf(k).filter(d => nodes.has(d));
    for (const start of nodes) {
      if (index.has(start)) continue;
      const work: Array<{ k: number; next: number[]; i: number }> = [];
      const visit = (k: number) => {
        index.set(k, counter);
        low.set(k, counter);
        counter++;
        stack.push(k);
        onStack.add(k);
        work.push({ k, next: successors(k), i: 0 });
      };
      visit(start);
      while (work.length) {
        const frame = work[work.length - 1];
        if (frame.i < frame.next.length) {
          const d = frame.next[frame.i++];
          if (!index.has(d)) {
            visit(d);
          } else if (onStack.has(d)) {
            low.set(frame.k, Math.min(low.get(frame.k)!, index.get(d)!));
          }
          continue;
        }
        work.pop();
        if (work.length) {
          const parent = work[work.length - 1].k;
          low.set(parent, Math.min(low.get(parent)!, low.get(frame.k)!));
        }
        if (low.get(frame.k) === index.get(frame.k)) {
          const component: number[] = [];
          let k: number;
          do {
            k = stack.pop()!;
            onStack.delete(k);
            component.push(k);
          } while (k !== frame.k);
          if (component.length > 1 || frame.next.includes(frame.k)) {
            ret.push(...component);
          }
        }
      }
    }
    return ret;
  }
}

/** Same result (no repaint needed). */
function sameValue(a: SheetValue, b: SheetValue): boolean {
  if (Object.is(a, b)) return true;
  if (isFormulaError(a) && isFormulaError(b)) return a.code === b.code && a.message === b.message;
  if (isSheetDate(a) && isSheetDate(b)) return a.serial === b.serial;
  return false;
}

/** Where a cell is after a structure edit; `undefined` if it was deleted. */
function newPosition(row: number, col: number, edit: SheetStructureEditIf): [number, number] | undefined {
  switch (edit.kind) {
    case "insertRows":
      return [row >= edit.at ? row + edit.count : row, col];
    case "deleteRows":
      if (row >= edit.at && row < edit.at + edit.count) return undefined;
      return [row >= edit.at + edit.count ? row - edit.count : row, col];
    case "insertColumns":
      return [row, col >= edit.at ? col + edit.count : col];
    case "deleteColumns":
      if (col >= edit.at && col < edit.at + edit.count) return undefined;
      return [row, col >= edit.at + edit.count ? col - edit.count : col];
    case "moveCells": {
      const { from, to } = edit;
      if (row >= from.r1 && row <= from.r2 && col >= from.c1 && col <= from.c2) {
        return [row + to[0] - from.r1, col + to[1] - from.c1];
      }
      return [row, col];
    }
  }
}

/** Inserts a range node into a column list sorted by end row descending (binary search). */
function insertByEndRow(list: RangeNode[], node: RangeNode): void {
  let lo = 0;
  let hi = list.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (list[mid].r2 >= node.r2) lo = mid + 1;
    else hi = mid;
  }
  list.splice(lo, 0, node);
}
