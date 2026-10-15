import type { PivotConfigIf } from "./pivot-config.if";
import type { RowGroupIf } from "../rowgroup/row-group.if";
import type { RowGroup } from "../rowgroup/row-group";
import { groupRowsResolved } from "../rowgroup/group-rows-internals";
import { resolveRowGroupFields } from "../rowgroup/row-group-internals";
import { DEFAULT_MAX_COLUMNS, resolvePivotValues, type ResolvedPivotValue } from "./pivot-internals";
import type { PivotValueInfoIf } from "./pivot-value.type";

const DEFAULT_EMPTY_LABEL = "(empty)";

/** The aggregation states of one cell (row node × column node) and its number of rows. */
interface PivotCell {
  count: number;
  states: unknown[];
}

/** The cells of one row node by column node (`null` = the total over all columns). */
type CellMap<T> = Map<RowGroup<T> | null, PivotCell>;

/**
 * The result of a pivot ({@link pivotRows}, {@link AreaModelPivot.getResult}): the row and column hierarchies and the
 * aggregated value of every combination – cells, subtotals and totals. DOM-free; the table reads its cells from here.
 *
 * - `getValue(row, column)` – a cell; leave out `row` for the column total, `column` for the row total, both for the
 *   grand total. Groups of higher levels give subtotals.
 * - A combination without rows is `undefined` (not 0).
 * - Every cell is computed from the rows (leaf cells) or by merging aggregation **states** – an average of a region is
 *   the average of its rows, never the average of the product averages. Order of the merges: first along the columns
 *   (column groups), then along the rows (row groups, total row) – children in key order. This matters for
 *   `first`/`last` only: a row total adds its rows in source order, a column group merges its keys in key order, so
 *   the two may differ. Keys cut off by `maxColumns` still count in subtotals and totals.
 *
 * @example
 * const result = pivotRows(sales, { rowFields: ["region"], columnFields: ["monat"], values: ["umsatz"] });
 * const nord = result.rowGroups[0];                      // Nord
 * const jan = result.columnLeaves.find(c => c.key === "Jan");
 * result.getValue(nord, jan);   // 150
 * result.getValue(nord);        // 270 – the row total
 * result.getValue(undefined, jan);   // 230 – the column total
 * result.getValue();            // 450
 *
 * @typeParam T - the row type
 * @since 1.1.94
 * @category Pivot
 */
export class PivotResult<T = any> {

  /** The row groups of the top level (with sub-groups); empty without row fields. */
  readonly rowGroups: RowGroup<T>[];
  /** The column groups of the top level (with sub-groups); empty without column fields. */
  readonly columnGroups: RowGroup<T>[];
  /** The shown column keys of the lowest level in display order – at most {@link PivotConfigIf.maxColumns}. */
  readonly columnLeaves: RowGroup<T>[];
  /** The values (name, label, aggregator, format). */
  readonly values: readonly PivotValueInfoIf[];
  /** True if there were more column keys than {@link PivotConfigIf.maxColumns} (the rest is not shown as columns). */
  readonly truncated: boolean;

  /** the lowest column key (index into allColumnLeaves) of every source row, -1: no column fields */
  private readonly columnLeafOf: Int32Array;
  /** all column keys of the lowest level, also the ones cut off by maxColumns (they count in subtotals) */
  private readonly allColumnLeaves: RowGroup<T>[] = [];
  /** shown column groups (all levels) */
  private readonly shownColumns = new Set<RowGroup<T>>();
  /** non-leaf column groups (shown or not), deepest first */
  private readonly columnParentsPostOrder: RowGroup<T>[] = [];
  /** non-leaf row groups, deepest first */
  private readonly rowParentsPostOrder: RowGroup<T>[] = [];
  /** row leaves in display order */
  private readonly rowLeaves: RowGroup<T>[] = [];
  private cells = new Map<RowGroup<T> | null, CellMap<T>>();
  /** the values with their getters */
  private readonly resolved: readonly ResolvedPivotValue<T>[];
  private accept?: (sourceIndex: number) => boolean;

  /**
   * Groups the rows by the row and column fields and aggregates the values. Use {@link pivotRows}.
   *
   * @param {ArrayLike<T>} source - the rows (not changed)
   * @param {PivotConfigIf<T>} config - fields and values
   * @param {(sourceIndex: number) => boolean} [accept] - a filter: only rows it accepts count
   */
  constructor(
    /** @internal the source rows */
    readonly source: ArrayLike<T>,
    config: PivotConfigIf<T>,
    accept?: (sourceIndex: number) => boolean
  ) {
    this.resolved = resolvePivotValues(config.values);
    this.values = this.resolved;
    const emptyLabel = config.emptyLabel ?? DEFAULT_EMPTY_LABEL;
    this.rowGroups = groupRowsResolved(source, resolveRowGroupFields(config.rowFields ?? []), emptyLabel);
    this.columnGroups = groupRowsResolved(source, resolveRowGroupFields(config.columnFields ?? []), emptyLabel);

    // the column keys in display order, capped
    const maxColumns = Math.max(0, config.maxColumns ?? DEFAULT_MAX_COLUMNS);
    const allLeaves = this.allColumnLeaves;
    collectLeaves(this.columnGroups, allLeaves);
    this.truncated = allLeaves.length > maxColumns;
    if (this.truncated) {
      console.warn(`Pivot: ${allLeaves.length} column keys, only the first ${maxColumns} are shown (maxColumns). Totals and subtotals count all rows.`);
    }
    this.columnLeaves = this.truncated ? allLeaves.slice(0, maxColumns) : allLeaves;
    this.columnLeafOf = new Int32Array(source.length).fill(-1);
    allLeaves.forEach((leaf, k) => {
      for (const index of leaf.sourceIndices) this.columnLeafOf[index] = k;
    });
    for (const leaf of this.columnLeaves) {
      for (let g: RowGroup<T> | undefined = leaf; g && !this.shownColumns.has(g); g = g.parent) this.shownColumns.add(g);
    }
    postOrderParents(this.columnGroups, this.columnParentsPostOrder, () => true);
    postOrderParents(this.rowGroups, this.rowParentsPostOrder, () => true);
    collectLeaves(this.rowGroups, this.rowLeaves);
    this.compute(accept);
  }

  /**
   * Computes all cells again (same keys) – after a filter change or changed values.
   *
   * @param {(sourceIndex: number) => boolean} [accept] - a filter: only rows it accepts count
   *
   * @example
   * result.compute(i => sales[i].monat === "Jan");
   * result.getValue();   // 230
   */
  compute(accept?: (sourceIndex: number) => boolean): void {
    this.accept = accept;
    const cells = new Map<RowGroup<T> | null, CellMap<T>>();
    if (!this.rowGroups.length) {
      const all: number[] = [];
      for (let i = 0; i < this.source.length; i++) all.push(i);
      cells.set(null, this.leafCells(all));
    } else {
      for (const leaf of this.rowLeaves) {
        leaf.accept = accept;
        cells.set(leaf, this.leafCells(leaf.sourceIndices));
      }
      for (const group of this.rowParentsPostOrder) {
        const map: CellMap<T> = new Map();
        for (const child of group.children) this.mergeMap(map, cells.get(child)!);
        cells.set(group, map);
      }
      const totals: CellMap<T> = new Map();
      for (const group of this.rowGroups) this.mergeMap(totals, cells.get(group)!);
      cells.set(null, totals);
    }
    this.cells = cells;

    // counts and totals on the groups (labels, own code)
    const fill = (group: RowGroup<T>, cell: PivotCell | undefined) => {
      group.count = cell?.count ?? 0;
      const results: Record<string, unknown> = {};
      this.values.forEach((v, i) => results[v.name] = cell && cell.count ? v.aggregator.result(cell.states[i]) : undefined);
      group.results = results;
    };
    const walkRows = (groups: RowGroup<T>[]) => groups.forEach(g => {
      fill(g, cells.get(g)?.get(null));
      walkRows(g.children);
    });
    walkRows(this.rowGroups);
    const totals = cells.get(null)!;
    const walkColumns = (groups: RowGroup<T>[]) => groups.forEach(g => {
      if (g.isLeaf()) g.accept = accept;
      fill(g, totals.get(g));
      walkColumns(g.children);
    });
    walkColumns(this.columnGroups);
  }

  /**
   * The aggregated value of a cell, a subtotal or a total.
   *
   * @param {RowGroupIf<T>} [row] - a row group (any level); undefined = all rows (column totals)
   * @param {RowGroupIf<T>} [column] - a column key or column group (any level); undefined = all columns (row totals)
   * @param {number | string} [value=0] - the index or name of the value
   * @returns {unknown} the result, `undefined` if no row has this combination
   *
   * @example
   * result.getValue(result.rowGroups[0], undefined, "sum(umsatz)");   // the total of the first row group
   */
  getValue(row?: RowGroupIf<T>, column?: RowGroupIf<T>, value: number | string = 0): unknown {
    const index = this.valueIndex(value);
    const cell = this.cell(row, column);
    if (!cell || !cell.count || index < 0) {
      return undefined;
    }
    return this.values[index].aggregator.result(cell.states[index]);
  }

  /**
   * The number of rows of a cell, a subtotal or a total (after the filter).
   *
   * @param {RowGroupIf<T>} [row] - a row group; undefined = all rows
   * @param {RowGroupIf<T>} [column] - a column key or group; undefined = all columns
   * @returns {number} the row count, 0 for a combination without rows
   *
   * @example
   * result.getCount(result.rowGroups[0]);   // 3 – the rows of Nord
   */
  getCount(row?: RowGroupIf<T>, column?: RowGroupIf<T>): number {
    return this.cell(row, column)?.count ?? 0;
  }

  /**
   * The rows behind a cell (drill-down), after the filter, in source order.
   *
   * @param {RowGroupIf<T>} [row] - a row group; undefined = all rows
   * @param {RowGroupIf<T>} [column] - a column key or group; undefined = all columns
   * @returns {T[]} a new array
   *
   * @example
   * result.getSourceRows(nord, jan).map(s => s.umsatz);   // [100, 50]
   */
  getSourceRows(row?: RowGroupIf<T>, column?: RowGroupIf<T>): T[] {
    let indices: number[];
    if (row) {
      indices = (row as RowGroup<T>).collectIndices(false, []).sort((a, b) => a - b);
    } else {
      indices = [];
      for (let i = 0; i < this.source.length; i++) indices.push(i);
    }
    const accept = this.accept;
    let leaves: Set<number> | undefined;
    if (column) {
      leaves = new Set();
      const found: RowGroup<T>[] = [];
      collectLeaves([column as RowGroup<T>], found);
      for (const leaf of found) {
        const k = this.allColumnLeaves.indexOf(leaf);
        if (k >= 0) leaves.add(k);
      }
    }
    const ret: T[] = [];
    for (const i of indices) {
      if (accept && !accept(i)) continue;
      if (leaves && !leaves.has(this.columnLeafOf[i])) continue;
      ret.push(this.source[i]);
    }
    return ret;
  }

  /**
   * True if a column group is shown – false for groups whose keys were all cut off by `maxColumns`.
   *
   * @param {RowGroupIf<T>} column - a column group
   * @returns {boolean} true if it has at least one shown column key
   */
  isColumnShown(column: RowGroupIf<T>): boolean {
    return this.shownColumns.has(column as RowGroup<T>);
  }

  /** @internal the index of a value (by index or name), -1 if unknown */
  valueIndex(value: number | string): number {
    if (typeof value === "number") {
      return value >= 0 && value < this.values.length ? value : -1;
    }
    return this.values.findIndex(v => v.name === value);
  }

  private cell(row?: RowGroupIf<T>, column?: RowGroupIf<T>): PivotCell | undefined {
    return this.cells.get((row as RowGroup<T>) ?? null)?.get((column as RowGroup<T>) ?? null);
  }

  private newCell(): PivotCell {
    return { count: 0, states: this.values.map(v => v.aggregator.init()) };
  }

  /** One pass over the rows of a row leaf: the cells per column key and the row total, then the column groups. */
  private leafCells(indices: readonly number[]): CellMap<T> {
    const values = this.resolved;
    const n = values.length;
    const accept = this.accept;
    const source = this.source;
    const columnLeafOf = this.columnLeafOf;
    const byLeaf: (PivotCell | undefined)[] = new Array(this.allColumnLeaves.length);
    const total = this.newCell();
    const rowValues = new Array<unknown>(n);
    for (let j = 0; j < indices.length; j++) {
      const index = indices[j];
      if (accept && !accept(index)) continue;
      const row = source[index];
      const k = columnLeafOf[index];
      const cell = k >= 0 ? (byLeaf[k] ??= this.newCell()) : undefined;
      total.count++;
      for (let v = 0; v < n; v++) {
        const getValue = values[v].getValue;
        rowValues[v] = getValue ? getValue(row) : row;
        total.states[v] = values[v].aggregator.add(total.states[v], rowValues[v]);
      }
      if (cell) {
        cell.count++;
        for (let v = 0; v < n; v++) {
          cell.states[v] = values[v].aggregator.add(cell.states[v], rowValues[v]);
        }
      }
    }
    const map: CellMap<T> = new Map();
    for (let k = 0; k < byLeaf.length; k++) {
      const cell = byLeaf[k];
      if (cell) map.set(this.allColumnLeaves[k], cell);
    }
    // column groups: merge of their children (also the ones cut off by maxColumns), deepest first
    for (const group of this.columnParentsPostOrder) {
      let merged: PivotCell | undefined;
      for (const child of group.children) {
        const cell = map.get(child);
        if (!cell) continue;
        merged ??= this.newCell();
        this.mergeInto(merged, cell);
      }
      if (merged) map.set(group, merged);
    }
    map.set(null, total);
    return map;
  }

  private mergeInto(target: PivotCell, cell: PivotCell): void {
    target.count += cell.count;
    this.values.forEach((v, i) => target.states[i] = v.aggregator.merge(target.states[i], cell.states[i]));
  }

  private mergeMap(target: CellMap<T>, map: CellMap<T>): void {
    map.forEach((cell, key) => {
      let t = target.get(key);
      if (!t) {
        t = this.newCell();
        target.set(key, t);
      }
      this.mergeInto(t, cell);
    });
  }
}

/**
 * Pivots rows: groups them by the row fields and by the column fields and aggregates the values of every combination,
 * with subtotals and totals – the engine behind {@link PivotFactory} (DOM-free, also usable without a table). One pass
 * over the rows; empty combinations are `undefined`, averages are computed from sum and count.
 *
 * @param {ArrayLike<T>} rows - the rows (not changed)
 * @param {PivotConfigIf<T>} config - row fields, column fields, values (see {@link PivotConfigIf})
 * @param {(sourceIndex: number) => boolean} [accept] - a filter: only rows it accepts count (index into `rows`)
 * @returns {PivotResult<T>} the hierarchies and the values
 *
 * @example
 * // case 1: regions × months, sum of umsatz
 * const result = pivotRows(sales, { rowFields: ["region"], columnFields: ["monat"], values: ["umsatz"] });
 * result.rowGroups.map(r => `${r.label}: ${result.getValue(r)}`);   // ["Nord: 270", "Süd: 180"]
 * result.getValue();                                                // 450
 *
 * @example
 * // case 3: the average of a column total is the average of its rows
 * const avg = pivotRows(sales, { rowFields: ["region"], columnFields: ["monat"],
 *   values: [{ value: "umsatz", aggregator: "avg" }] });
 * const jan = avg.columnLeaves.find(c => c.key === "Jan");
 * avg.getValue(undefined, jan);   // 76.666… (230 / 3) – not 77.5, the mean of 75 and 80
 *
 * @since 1.1.94
 * @category Pivot
 */
export function pivotRows<T = any>(
  rows: ArrayLike<T>,
  config: PivotConfigIf<T>,
  accept?: (sourceIndex: number) => boolean): PivotResult<T> {
  return new PivotResult<T>(rows ?? [], config, accept);
}

function collectLeaves<T>(groups: RowGroup<T>[], ret: RowGroup<T>[]): void {
  for (const group of groups) {
    if (group.isLeaf()) ret.push(group);
    else collectLeaves(group.children, ret);
  }
}

function postOrderParents<T>(groups: RowGroup<T>[], ret: RowGroup<T>[], keep: (g: RowGroup<T>) => boolean): void {
  for (const group of groups) {
    if (group.isLeaf() || !keep(group)) continue;
    postOrderParents(group.children, ret, keep);
    ret.push(group);
  }
}
