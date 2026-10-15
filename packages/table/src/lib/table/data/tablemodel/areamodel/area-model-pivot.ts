import { AreaModelTree } from "./area-model-tree";
import { TreeRow } from "../../common/tree-row";
import type { TreeRowIf } from "../../common/tree-row-if";
import type { ColumnDefIf } from "../column/column-def.if";
import type { CellRendererIf } from "../../../renderer/cell-render.if";
import type { FilterFunction } from "../../common/filter-function";
import type { SortItem } from "../../common/sort-item";
import type { RowGroupIf } from "../../../rowgroup/row-group.if";
import type { RowGroup } from "../../../rowgroup/row-group";
import type { PivotConfigIf } from "../../../pivot/pivot-config.if";
import type { PivotColumnInfoIf } from "../../../pivot/pivot-column-info.if";
import { PivotResult } from "../../../pivot/pivot-result";
import { RowGroupColumnDef } from "../../../rowgroup/row-group-column-def";
import type { RowGroupColumnOptionsIf } from "../../../rowgroup/row-group-column-options.if";
import { resolveRowGroupFields, type ResolvedRowGroupField, typedGroupKey } from "../../../rowgroup/row-group-internals";
import { formatAggregateValue } from "../../../aggregation/aggregate";
import { AggregateCellRenderer } from "../../../renderer/aggregate-cell-renderer";
import { isPivotColumnDef } from "../../../instanceof-workaround";
import { pivotSubtotalProperty, pivotTotalProperty, pivotValueProperty } from "../../../pivot/pivot-layout";
import { DEFAULT_TOTAL_LABEL } from "../../../pivot/pivot-internals";

const COUNT_FORMAT = new Intl.NumberFormat("en-US");

/**
 * The body of a pivot table: one row per row group (a tree for several row fields, with subtotals in the group rows),
 * one column per column key × value, plus subtotal and total columns. Created by {@link PivotFactory.createTableModel}
 * – the factory also builds the grouped header and the total row.
 *
 * It is a tree ({@link AreaModelTree}, `isAreaModelTree` is true): rows are tree rows with a {@link RowGroupIf} as
 * `data`; expanding, `tableApi.expandAll()`, keyboard, screen reader attributes and remembering expanded rows work as
 * in a tree table. The cells come from a {@link PivotResult} ({@link getResult}).
 *
 * - **Filter**: `externalFilterFunction` gets your **source objects** (as in a flat table and a row grouping) – it
 *   filters before the aggregation; all cells and totals follow. Rows without a matching source row disappear; the
 *   columns stay (they come from all rows).
 * - **Sorting**: by a value column → the rows of every level by that value (empty cells last); by the group column →
 *   by key. `tableApi.sort(fn)` compares two {@link RowGroupIf}.
 * - Cells are not editable. Changed source data: {@link TableApi.setPivotConfig} with new rows or `tableApi.repaint()` (same
 *   keys), new keys or fields: {@link TableApi.setPivotConfig}.
 *
 * @example
 * const tableModel = PivotFactory.createTableModel<Sale>({
 *   rows: sales, rowFields: ["region"], columnFields: ["monat"], values: ["umsatz"]
 * });
 * const pivotBody = tableModel.getPivotBody();
 * pivotBody.getValueAt(0, pivotBody.getColumnIndex(["Jan"]));   // 150 – Nord, Jan
 *
 * @see Training: [Pivot tables](https://gui.expert/training/pivot-tables/)
 *
 * @typeParam T - the row type
 * @since 1.1.94
 * @category Pivot
 */
export class AreaModelPivot<T = any> extends AreaModelTree<any> {

  /** Marker for {@link isAreaModelPivot} (works across copies of the core). `type` stays `"AreaModelTree"`. */
  readonly kind = "AreaModelPivot";

  private config: PivotConfigIf<T>;
  private sourceRows: T[];
  private result!: PivotResult<T>;
  private rowFields: ResolvedRowGroupField<T>[] = [];
  private groupColumnOptions: Partial<RowGroupColumnOptionsIf<T>>;
  private readonly textRenderer = new AggregateCellRenderer();
  private infoByProperty = new Map<string, PivotColumnInfoIf>();
  private userFilter?: FilterFunction<T>;
  private accepted?: Uint8Array;
  private dirty = false;
  private builds = 0;

  /**
   * @param {T[]} rows - the source rows (not changed)
   * @param {PivotConfigIf<T>} config - row fields, column fields, values
   * @param {Partial<RowGroupColumnOptionsIf<T>>} [groupColumn] - label options of the group column (`showCount`, `label`)
   * @param {number} [defaultRowHeight=34] - row height in px
   */
  constructor(rows: T[], config: PivotConfigIf<T>, groupColumn: Partial<RowGroupColumnOptionsIf<T>> = {}, defaultRowHeight: number = 34) {
    super("body", [], defaultRowHeight, []);
    this.sourceRows = rows ?? [];
    this.config = { ...config };
    this.groupColumnOptions = groupColumn;
    this.build(false);
  }

  // ---------------------------------------------------------------- data and configuration

  /**
   * The current configuration.
   *
   * @returns {PivotConfigIf<T>} a copy
   *
   * @example
   * pivotBody.getConfig().columnFields;   // ["monat"]
   */
  getConfig(): PivotConfigIf<T> {
    return { ...this.config };
  }

  /**
   * The pivot: row and column hierarchies and all values (also subtotals and totals) – for drill-down, own
   * evaluations or a chart next to the table.
   *
   * @returns {PivotResult<T>} the result (do not modify)
   *
   * @example
   * const result = pivotBody.getResult();
   * result.columnLeaves.map(c => c.label);   // ["Jan", "Feb"]
   * result.getValue();                       // 450
   */
  getResult(): PivotResult<T> {
    this.ensureComputed();
    return this.result;
  }

  /**
   * The rows the pivot is built from.
   *
   * @returns {T[]} the source rows (do not modify the array – use `tableApi.setPivotConfig({}, rows)`)
   *
   * @example
   * pivotBody.getSourceRows().length;   // 6
   */
  getSourceRows(): T[] {
    return this.sourceRows;
  }

  /**
   * Counts how often the pivot was built (start, new configuration, new rows).
   *
   * @returns {number} the number of builds
   *
   * @example
   * const before = pivotBody.getBuildCount();
   */
  getBuildCount(): number {
    return this.builds;
  }

  /**
   * Builds the pivot again (keys, rows) – {@link PivotTableModel.setPivotConfig} calls it, followed
   * by the new columns ({@link setColumnDefs}). Expanded rows whose path stays keep their state; the filter stays, the
   * sorting is reset.
   *
   * @param {PivotConfigIf<T>} config - the configuration
   * @param {T[]} [rows] - new source rows (default: the current ones)
   * @internal
   */
  configure(config: PivotConfigIf<T>, rows?: T[]): void {
    // throws for an invalid field or value – before anything changes
    const result = new PivotResult<T>(rows ?? this.sourceRows, config);
    this.config = { ...config };
    if (rows) this.sourceRows = rows;
    this.build(true, result);
  }

  /**
   * Sets the columns (group column, value columns) after a new layout. @internal
   *
   * @param {ColumnDefIf[]} columnDefs - all columns of the table
   */
  setColumnDefs(columnDefs: ColumnDefIf[]): void {
    this.columnDefs = columnDefs;
    this.properties.length = 0;
    for (const def of columnDefs) this.properties.push(def.property);
    this.infoByProperty = new Map();
    for (const def of columnDefs) {
      if (isPivotColumnDef(def)) this.infoByProperty.set(def.property, def.pivot);
    }
  }

  // ---------------------------------------------------------------- lookups

  /**
   * The property of a column (follows moved columns).
   *
   * @param {number} columnIndex - column index
   * @returns {string | undefined} the property, e.g. {@link RowGroupColumnDef.PROPERTY} for the group column
   *
   * @example
   * pivotBody.getPropertyAt(0);   // "RowGroupColumn"
   */
  getPropertyAt(columnIndex: number): string | undefined {
    return this.properties[columnIndex];
  }

  /**
   * The row group of a displayed row.
   *
   * @param {number} rowIndex - index of the displayed body row
   * @returns {RowGroupIf<T> | undefined} the group, undefined for the total row of a pivot without row fields
   *
   * @example
   * pivotBody.getRowGroup(0)?.path;   // ["Nord"]
   */
  getRowGroup(rowIndex: number): RowGroupIf<T> | undefined {
    const data = this.getRowByIndex(rowIndex)?.data;
    return data && data.type === "RowGroup" ? data as RowGroupIf<T> : undefined;
  }

  /**
   * What a column shows: a column key, a subtotal or a total, and which value.
   *
   * @param {number} columnIndex - column index
   * @returns {PivotColumnInfoIf | undefined} undefined for the group column (and row numbers)
   *
   * @example
   * pivotBody.getColumnInfo(1)?.column?.label;   // "Jan"
   */
  getColumnInfo(columnIndex: number): PivotColumnInfoIf | undefined {
    const property = this.properties[columnIndex];
    return property === undefined ? undefined : this.infoByProperty.get(property);
  }

  /**
   * The property of a value column – for `tableApi.getColumnIndex()`, `sortByColumn()`, `setColumnWidth()` …
   *
   * @param {unknown[]} columnPath - the column keys from the top column field down, e.g. `[2026, 1]`; `[]` = the total column
   * @param {number | string} [value=0] - the index or name of the value
   * @returns {string | undefined} the property, undefined if there is no such column
   *
   * @example
   * tableApi.sortByColumn(pivotBody.getColumnProperty([])!, "desc");   // rows by their total, largest first
   */
  getColumnProperty(columnPath: unknown[], value: number | string = 0): string | undefined {
    const result = this.result;
    const v = result.values[result.valueIndex(value)];
    if (!v) return undefined;
    if (!columnPath.length) {
      const total = pivotTotalProperty(v);
      return this.infoByProperty.has(total) ? total : undefined;
    }
    let groups = result.columnGroups;
    let found: RowGroup<T> | undefined;
    for (const key of columnPath) {
      const typed = typedGroupKey(key);
      found = groups.find(g => typedGroupKey(g.key) === typed);
      if (!found) return undefined;
      groups = found.children;
    }
    const property = found!.isLeaf() ? pivotValueProperty(found!, v) : pivotSubtotalProperty(found!, v);
    return this.infoByProperty.has(property) ? property : undefined;
  }

  /**
   * The index of a value column (see {@link getColumnProperty}).
   *
   * @param {unknown[]} columnPath - the column keys, `[]` = the total column
   * @param {number | string} [value=0] - the index or name of the value
   * @returns {number} the column index or -1
   *
   * @example
   * pivotBody.getColumnIndex(["Jan"]);   // 1
   */
  getColumnIndex(columnPath: unknown[], value: number | string = 0): number {
    const property = this.getColumnProperty(columnPath, value);
    return property === undefined ? -1 : this.properties.indexOf(property);
  }

  /**
   * The source rows behind a cell (drill-down): the rows of its row group and column key that the filter keeps.
   *
   * @param {number} rowIndex - index of the displayed body row
   * @param {number} columnIndex - column index (the group column: all rows of the row group)
   * @returns {T[]} a new array in source order
   *
   * @example
   * pivotBody.getCellSourceRows(0, 1).map(s => s.umsatz);   // [100, 50] – Nord, Jan
   */
  getCellSourceRows(rowIndex: number, columnIndex: number): T[] {
    const result = this.getResult();
    const row = this.getRowGroup(rowIndex);
    if (!row && this.rowFields.length) return [];
    const info = this.getColumnInfo(columnIndex);
    return result.getSourceRows(row, info?.kind === "total" ? undefined : info?.column);
  }

  // ---------------------------------------------------------------- cells

  override getValueAt(rowIndex: number, columnIndex: number): any {
    const treeRow = this.getRowByIndex(rowIndex);
    if (!treeRow) {
      return "";
    }
    const property = this.properties[columnIndex];
    const group = this.getRowGroup(rowIndex);
    if (property === RowGroupColumnDef.PROPERTY) {
      return group ? this.getGroupLabel(group) : this.config.totalLabel ?? DEFAULT_TOTAL_LABEL;
    }
    const info = property === undefined ? undefined : this.infoByProperty.get(property);
    if (!info) {
      return "";
    }
    if (group && group.children.length > 0 && this.config.subtotals === false) {
      return undefined; // a group row without subtotals
    }
    return this.getResult().getValue(group, info.column, info.valueIndex);
  }

  override getTextValueAt(rowIndex: number, columnIndex: number): string {
    const property = this.properties[columnIndex];
    const info = property === undefined ? undefined : this.infoByProperty.get(property);
    const value = this.getValueAt(rowIndex, columnIndex);
    if (!info) {
      return value === undefined || value === null ? "" : `${value}`;
    }
    if (value === undefined) {
      return this.isSubtotalSuppressed(rowIndex) ? "" : this.config.emptyText ?? "";
    }
    return info.value.format ? info.value.format(value) : formatAggregateValue(value);
  }

  /** Value columns: the {@link AggregateCellRenderer} (text node); the group column: none (label as text). */
  override getCellRenderer(_rowIndex: number, columnIndex: number): CellRendererIf | undefined {
    const property = this.properties[columnIndex];
    if (property !== undefined && this.infoByProperty.has(property)) {
      return this.textRenderer;
    }
    return undefined;
  }

  override getCustomClassesAt(rowIndex: number, columnIndex: number): string[] {
    const classes = super.getCustomClassesAt(rowIndex, columnIndex);
    const property = this.properties[columnIndex];
    const group = this.getRowGroup(rowIndex);
    const ret = [...classes, `ge-table-pivot-level-${group?.level ?? 0}`];
    const parentRow = !!group && group.children.length > 0;
    if (property === RowGroupColumnDef.PROPERTY) {
      ret.push("ge-table-pivot-label");
      if (parentRow) ret.push("ge-table-pivot-subtotal");
      return ret;
    }
    const info = property === undefined ? undefined : this.infoByProperty.get(property);
    if (!info) {
      return ret;
    }
    ret.push("ge-table-pivot-value");
    if (parentRow || info.kind === "subtotal") ret.push("ge-table-pivot-subtotal");
    if (info.kind === "total") ret.push("ge-table-pivot-total");
    if (this.getValueAt(rowIndex, columnIndex) === undefined) ret.push("ge-table-pivot-empty");
    return ret;
  }

  /**
   * True for the label cell of a row (the table gives it `role="rowheader"`).
   *
   * @param {number} rowIndex - index of the displayed body row
   * @param {number} columnIndex - column index
   * @returns {boolean} true for the group column
   */
  isRowHeaderCell(rowIndex: number, columnIndex: number): boolean {
    return this.properties[columnIndex] === RowGroupColumnDef.PROPERTY && !!this.getRowByIndex(rowIndex);
  }

  /** Pivot cells are computed – not editable. */
  override isEditable(_rowIndex: number, _columnIndex: number): boolean {
    return false;
  }

  /** Pivot cells are computed – `setValue` does nothing (`false`). */
  override setValue(_rowIndex: number, _columnIndex: number, _value: any): boolean {
    return false;
  }

  // ---------------------------------------------------------------- filter, sorting, invalidation

  /**
   * Filters the **source rows** before the aggregation: `predictFn` gets your objects (as in a flat table), index and
   * array of the source rows. All cells and totals follow; rows without a matching source row disappear. Usually
   * called by `tableApi.externalFilterChanged()` with `tableOptions.externalFilterFunction`.
   *
   * @param {FilterFunction<S>} predictFn - returns a truthy value for the rows to count
   *
   * @example
   * tableOptions.externalFilterFunction = (sale: Sale) => sale.produkt === "A";
   * tableApi.externalFilterChanged();   // Nord: Jan 100, Feb 120 · Süd: Jan 80, Feb 30
   */
  override externalFilterChanged<S>(predictFn: FilterFunction<S>): void {
    this.userFilter = predictFn as unknown as FilterFunction<T>;
    this.accepted = this.acceptedBy(this.userFilter);
    this.dirty = true;
    this.ensureComputed();
    const result = this.result;
    super.externalFilterChanged((row: TreeRowIf<any>) =>
      !row.children?.length && (!this.rowFields.length || result.getCount(row.data) > 0));
  }

  /**
   * Sorts the rows of every level: by a value column by its values (empty cells last, in both directions), by the
   * group column by key. A new pivot ({@link TableApi.setPivotConfig}) starts unsorted (the columns are different).
   *
   * @param {SortItem[]} sortItems - primary key first
   * @returns {boolean} false for an empty list
   *
   * @example
   * pivotBody.doSort([new SortItem(pivotBody.getColumnIndex([]), "desc")]);   // by the total, largest first
   * tableApi.repaint();
   */
  override doSort(sortItems: SortItem[]): boolean {
    if (!sortItems.length) {
      return false;
    }
    this.ensureComputed();
    const comparators = sortItems.map(({ columnIndex, sortState }) => {
      const f = sortState === "asc" ? 1 : sortState === "desc" ? -1 : 0;
      return this.createRowComparator(this.properties[columnIndex], f);
    });
    super.sort((a: TreeRowIf<any>, b: TreeRowIf<any>) => {
      for (const comparator of comparators) {
        const c = comparator(a, b);
        if (c) return c;
      }
      return 0;
    });
    return true;
  }

  /**
   * Sorts the rows of every level with your function – it gets two {@link RowGroupIf} (siblings).
   *
   * @param {(a: any, b: any) => number} compareFn - compares two row groups
   *
   * @example
   * tableApi.sort((a: RowGroupIf, b: RowGroupIf) => b.count - a.count);   // most source rows first
   */
  override sort(compareFn: (a: any, b: any) => number): void {
    super.sort((a: TreeRowIf<any>, b: TreeRowIf<any>) => compareFn(a.data, b.data));
  }

  /**
   * Computes the cells again on the next read – the table calls it after filter, sorting and `tableApi.repaint()`.
   *
   * @example
   * sales[0].umsatz = 999;   // changed outside the table
   * tableApi.repaint();      // calls invalidateDerivedValues() – all cells are computed again
   */
  invalidateDerivedValues(): void {
    this.dirty = true;
  }

  // ---------------------------------------------------------------- internals

  private isSubtotalSuppressed(rowIndex: number): boolean {
    const group = this.getRowGroup(rowIndex);
    return this.config.subtotals === false && !!group && group.children.length > 0;
  }

  /** The label of a row in the group column. */
  protected getGroupLabel(group: RowGroupIf<T>): string {
    const options = this.groupColumnOptions;
    if (options.label) {
      return `${options.label(group) ?? ""}`;
    }
    return options.showCount ? `${group.label} (${COUNT_FORMAT.format(group.count)})` : group.label;
  }

  private ensureComputed(): void {
    if (!this.dirty) {
      return;
    }
    this.dirty = false;
    if (this.userFilter && this.accepted?.length !== this.sourceRows.length) {
      this.accepted = this.acceptedBy(this.userFilter); // rows were added or removed in place: filter them, too
    }
    const accepted = this.accepted;
    this.result.compute(accepted ? (i => accepted[i] === 1) : undefined);
  }

  /** The filter result per source row (1 = counted). */
  private acceptedBy(predictFn: FilterFunction<T>): Uint8Array {
    const source = this.sourceRows;
    const accepted = new Uint8Array(source.length);
    for (let i = 0; i < source.length; i++) {
      accepted[i] = predictFn(source[i], i, source) ? 1 : 0;
    }
    return accepted;
  }

  private createRowComparator(property: string | undefined, f: number): (a: TreeRowIf<any>, b: TreeRowIf<any>) => number {
    if (!f || property === undefined) {
      return () => 0;
    }
    if (property === RowGroupColumnDef.PROPERTY) {
      return (a, b) => {
        const ga = a.data as RowGroup<T>;
        const gb = b.data as RowGroup<T>;
        const compare = this.rowFields[ga.level]?.compare;
        return compare ? f * compare(ga.key, gb.key) : 0;
      };
    }
    const info = this.infoByProperty.get(property);
    if (!info) {
      return () => 0;
    }
    const columnDef = this.columnDefs.find(def => def.property === property);
    return (a, b) => {
      const va = this.result.getValue(a.data, info.column, info.valueIndex);
      const vb = this.result.getValue(b.data, info.column, info.valueIndex);
      // empty cells last – in both directions
      if (va === undefined || vb === undefined) {
        return va === vb ? 0 : va === undefined ? 1 : -1;
      }
      if (columnDef?.sortComparator) {
        return f * columnDef.sortComparator(va, vb, a.data, b.data, f);
      }
      return this.sorterService.genericSortComparator(va, vb, f);
    };
  }

  /** (Re)builds the pivot and the tree rows; keeps the expanded state of known row groups and the filter (a new pivot is unsorted). */
  private build(keepState: boolean, result?: PivotResult<T>): void {
    const expandedById = new Map<string, boolean>();
    if (keepState) {
      const walk = (rows: TreeRowIf<any>[]) => rows.forEach(row => {
        if (row.data?.type === "RowGroup") expandedById.set((row.data as RowGroup<T>).id, row.expanded);
        if (row.children) walk(row.children);
      });
      walk(this.rows);
    }
    this.builds++;
    this.rowFields = resolveRowGroupFields(this.config.rowFields ?? []);
    // a filter is applied below (externalFilterChanged computes again with the new rows)
    this.result = result ?? new PivotResult<T>(this.sourceRows, this.config);
    this.dirty = false;

    const roots: TreeRowIf<any>[] = [];
    if (this.rowFields.length) {
      for (const group of this.result.rowGroups) {
        roots.push(this.createRow(group, undefined, expandedById));
      }
    } else {
      roots.push(new TreeRow<any>({ type: "PivotTotal" }, true, undefined, undefined, 0));
    }
    // `rows` is readonly: replace the content, keep the array
    this.rows.length = 0;
    for (const row of roots) this.rows.push(row);

    if (this.userFilter) {
      this.externalFilterChanged(this.userFilter); // computes and rebuilds the displayed rows
    } else {
      this.recalcVisibleTreeRows(false);
    }
  }

  private createRow(group: RowGroup<T>, parent: TreeRowIf<any> | undefined, expandedById: Map<string, boolean>): TreeRowIf<any> {
    const expanded = expandedById.get(group.id) ?? this.isExpandedByDefault(group);
    const children: TreeRowIf<any>[] | undefined = group.isLeaf() ? undefined : [];
    const row = new TreeRow<any>(group, expanded, children, parent, group.level);
    for (const child of group.children) {
      children!.push(this.createRow(child, row, expandedById));
    }
    return row;
  }

  private isExpandedByDefault(group: RowGroup<T>): boolean {
    const expanded = this.config.expanded ?? true;
    if (typeof expanded === "function") return !!expanded(group);
    if (typeof expanded === "number") return group.level < expanded;
    return expanded;
  }
}
