import { AreaModelTree } from "./area-model-tree";
import { TreeRow } from "../../common/tree-row";
import type { TreeRowIf } from "../../common/tree-row-if";
import type { ColumnDefIf } from "../column/column-def.if";
import type { CellRendererIf } from "../../../renderer/cell-render.if";
import type { FilterFunction } from "../../common/filter-function";
import type { SortItem } from "../../common/sort-item";
import type { DerivedValuesChangeIf } from "./derived-values-change.if";
import type { RowGroupField } from "../../../rowgroup/row-group-field.type";
import type { RowGroupModelOptionsIf } from "../../../rowgroup/row-group-model-options.if";
import { RowGroup } from "../../../rowgroup/row-group";
import { RowGroupColumnDef } from "../../../rowgroup/row-group-column-def";
import { RowGroupDetailRow } from "../../../rowgroup/row-group-detail-row";
import {
  aggregateRowGroupsResolved,
  computeLeaf,
  groupRowsResolved,
  mergeChildren,
  totalsOf
} from "../../../rowgroup/group-rows-internals";
import { resolveRowGroupFields, type ResolvedRowGroupField, typedGroupKey } from "../../../rowgroup/row-group-internals";
import { aggregateStates, resolveAggregateSpec, type ResolvedAggregateSpec } from "../../../aggregation/aggregate-internals";
import { formatAggregateValue } from "../../../aggregation/aggregate";
import { AggregateCellRenderer } from "../../../renderer/aggregate-cell-renderer";
import { isRowGroup } from "../../../instanceof-workaround";

const COUNT_FORMAT = new Intl.NumberFormat("en-US");

/** The last sorting, applied again after regrouping. */
type LastSort = { items: SortItem[] } | { compareFn: (a: any, b: any) => number };

/**
 * The body of a row grouping: flat rows grouped by one or more levels, each group a row with an arrow, a label
 * (`"Nord (3)"`) and aggregates per column (sum, average, …); below it the sub-groups or the original rows. Usually
 * created by {@link RowGroupFactory.createTableModel}, which also adds the group column, hides the grouped columns and
 * adds a total row.
 *
 * It is a tree ({@link AreaModelTree}, `isAreaModelTree` is true): group rows are {@link TreeRowIf tree rows} with a
 * {@link RowGroupIf} as `data`, detail rows hold your objects. Expanding, `tableApi.expandAll()`, keyboard, screen
 * reader attributes and remembering expanded groups (`autoRestoreOptions`) work as in a tree table.
 *
 * - **Filter**: `externalFilterFunction` gets your object (as in a flat table) – never a group. Groups without a match
 *   disappear; aggregates and counts follow the filter.
 * - **Sorting**: by an aggregated column → groups by aggregate, rows by value; by the group column → groups by key;
 *   `tableApi.sort(fn)` sorts the rows inside their groups with `fn(a, b)` on your objects.
 * - **Editing**: group rows are not editable. A changed value recomputes only the groups of that row; a changed
 *   grouped value moves the row to its new group.
 * - **Regrouping**: {@link TableApi.setRowGroupBy} (or {@link setGroupBy} + `tableApi.repaintHard()`) – expanded
 *   groups, filter, sorting and checked rows stay.
 * - Aggregates are computed when a group row is read after a change – once, not per repaint or scroll frame.
 *
 * @example
 * const tableModel = RowGroupFactory.createTableModel<Sale>({
 *   rows: sales, columnDefs, groupBy: ["region", "produkt"], aggregations: { umsatz: "sum" }
 * });
 * const body = tableModel.getBodyModel() as AreaModelRowGroups<Sale>;
 * body.getGroups().map(g => g.results.umsatz);   // [270, 180]
 *
 * @see Training: [Row grouping](https://gui.expert/training/row-grouping/)
 *
 * @typeParam T - the row type
 * @since 1.1.94
 * @category Row grouping
 */
export class AreaModelRowGroups<T = any> extends AreaModelTree<any> {

  /** Marker for {@link isAreaModelRowGroups} (works across copies of the core). `type` stays `"AreaModelTree"`. */
  readonly kind = "AreaModelRowGroups";

  /** The options (groupBy as set by {@link setGroupBy}). */
  readonly options: RowGroupModelOptionsIf<T>;

  /** Properties of the columns the factory hid for the current grouping. @internal */
  hiddenColumnProperties: string[] = [];

  private sourceRows: T[];
  private fields: ResolvedRowGroupField<T>[] = [];
  private groups: RowGroup<T>[] = [];
  private readonly specs: ResolvedAggregateSpec<T>[];
  private readonly specByKey: Map<string, ResolvedAggregateSpec<T>>;
  private readonly textRenderer = new AggregateCellRenderer();
  /** the tree row of every group by id */
  private groupRowById = new Map<string, TreeRowIf<any>>();
  /** the tree row of every source row by source index */
  private detailRows: RowGroupDetailRow<T>[] = [];
  /** the filter of the user (gets the objects) and its result per source index */
  private userFilter?: FilterFunction<T>;
  private accepted?: Uint8Array;
  private allDirty = true;
  private readonly dirtyLeaves = new Set<RowGroup<T>>();
  private totals: Record<string, unknown> = {};
  private lastSort?: LastSort;
  private batchDepth = 0;
  private regroupPending = false;
  private builds = 0;

  /**
   * @param {T[]} rows - the rows (not changed by the model)
   * @param {ColumnDefIf[]} columnDefs - the columns of the table, usually with a {@link RowGroupColumnDef}
   * @param {RowGroupModelOptionsIf<T>} options - levels, aggregations, expanded state …
   * @param {number} [defaultRowHeight=34] - row height in px
   */
  constructor(
    rows: T[],
    columnDefs: ColumnDefIf[],
    options: RowGroupModelOptionsIf<T>,
    defaultRowHeight: number = 34
  ) {
    super("body", [], defaultRowHeight, columnDefs);
    this.sourceRows = rows ?? [];
    this.options = { ...options, groupBy: [...(options.groupBy ?? [])] };
    const aggregations = options.aggregations ?? {};
    this.specs = Object.keys(aggregations).map(key => resolveAggregateSpec<T>(key, aggregations[key]));
    this.specByKey = new Map(this.specs.map(spec => [spec.key, spec]));
    this.fields = resolveRowGroupFields(this.options.groupBy);
    this.build(false);
  }

  // ---------------------------------------------------------------- data and grouping

  /**
   * The rows the groups are built from.
   *
   * @returns {T[]} the source rows (do not modify the array – use {@link setRows})
   *
   * @example
   * const all = body.getSourceRows().length;
   */
  getSourceRows(): T[] {
    return this.sourceRows;
  }

  /**
   * Replaces the rows and groups them again (expanded groups, filter and sorting stay). Repaint with
   * `tableApi.repaintHard()` – the row count changes.
   *
   * @param {T[]} rows - the new rows
   *
   * @example
   * body.setRows(await loadSales());
   * tableApi.repaintHard();
   */
  setRows(rows: T[]): void {
    this.sourceRows = rows ?? [];
    this.build(true);
  }

  /**
   * The current levels.
   *
   * @returns {RowGroupField<T>[]} a copy of the levels
   *
   * @example
   * body.getGroupBy();   // ["region", "produkt"]
   */
  getGroupBy(): RowGroupField<T>[] {
    return [...this.options.groupBy];
  }

  /**
   * Groups the rows by other levels. Expanded groups whose path stays keep their state; filter, sorting and checked
   * rows stay. An empty list shows the rows without groups. Prefer {@link TableApi.setRowGroupBy}: it also shows and
   * hides the grouped columns and repaints.
   *
   * @param {RowGroupField<T>[]} groupBy - the new levels, top first
   *
   * @example
   * body.setGroupBy(["produkt"]);
   * tableApi.repaintHard();
   */
  setGroupBy(groupBy: RowGroupField<T>[]): void {
    const fields = resolveRowGroupFields(groupBy ?? []); // throws for an invalid level – before anything changes
    this.options.groupBy = [...(groupBy ?? [])];
    this.fields = fields;
    this.build(true);
  }

  /**
   * Builds the groups again from the current rows – after grouped values were changed outside the table (inside the
   * table, editing a grouped value moves the row by itself). Repaint with `tableApi.repaintHard()`.
   *
   * @example
   * sales[0].region = "Süd";   // a live update of a grouped value
   * body.regroup();
   * tableApi.repaintHard();
   */
  regroup(): void {
    this.build(true);
  }

  /**
   * The groups of the top level (with sub-groups, counts and aggregates).
   *
   * @returns {RowGroup<T>[]} the groups in display order (do not modify)
   *
   * @example
   * body.getGroups().map(g => `${g.label}: ${g.results.umsatz}`);   // ["Nord: 270", "Süd: 180"]
   */
  getGroups(): RowGroup<T>[] {
    this.ensureAggregates();
    return this.groups;
  }

  /**
   * The group with the given keys.
   *
   * @param {unknown[]} path - the keys from the top level down, e.g. `["Nord", "A"]`
   * @returns {RowGroup<T> | undefined} the group, undefined if there is none
   *
   * @example
   * body.findGroup(["Nord", "A"])?.results.umsatz;   // 220
   */
  findGroup(path: unknown[]): RowGroup<T> | undefined {
    this.ensureAggregates();
    let groups = this.groups;
    let found: RowGroup<T> | undefined;
    for (const key of path) {
      const typed = typedGroupKey(key);
      found = groups.find(g => typedGroupKey(g.key) === typed);
      if (!found) return undefined;
      groups = found.children;
    }
    return found;
  }

  /**
   * The group of a displayed row.
   *
   * @param {number} rowIndex - index of the displayed body row
   * @returns {RowGroup<T> | undefined} the group of a group row, undefined for a detail row
   *
   * @example
   * const group = body.getRowGroup(0);   // the first group (if the first row is a group row)
   */
  getRowGroup(rowIndex: number): RowGroup<T> | undefined {
    const data = this.getRowByIndex(rowIndex)?.data;
    if (isRowGroup(data)) {
      this.ensureAggregates();
      return data as RowGroup<T>;
    }
    return undefined;
  }

  /**
   * Your object of a displayed detail row.
   *
   * @param {number} rowIndex - index of the displayed body row
   * @returns {T | undefined} the object, undefined for a group row
   *
   * @example
   * const sale = body.getDetailRow(1);
   */
  getDetailRow(rowIndex: number): T | undefined {
    const row = this.getRowByIndex(rowIndex);
    return row && !isRowGroup(row.data) ? row.data as T : undefined;
  }

  /**
   * True if the displayed row is a group row.
   *
   * @param {number} rowIndex - index of the displayed body row
   * @returns {boolean} true for a group row
   *
   * @example
   * const bold = body.isGroupRowIndex(rowIndex);
   */
  isGroupRowIndex(rowIndex: number): boolean {
    return isRowGroup(this.getRowByIndex(rowIndex)?.data);
  }

  /**
   * The aggregates over all rows the filter keeps (the same as the total row).
   *
   * @returns {Record<string, unknown>} key → result
   *
   * @example
   * body.getTotals().umsatz;   // 450
   */
  getTotals(): Record<string, unknown> {
    this.ensureAggregates();
    return this.totals;
  }

  /**
   * The checked objects (detail rows) – with a checkbox column or `showCheckboxWihoutExtraColumn`.
   *
   * @returns {T[]} the checked objects in source order
   *
   * @example
   * const selected = body.getCheckedRows();
   */
  getCheckedRows(): T[] {
    const ret: T[] = [];
    this.detailRows.forEach(row => {
      if (row.checked) ret.push(row.data);
    });
    return ret;
  }

  /**
   * Expands the groups above a level and collapses the others: `0` collapses all, `1` opens the top level, a large
   * number opens all. Repaint with `tableApi.repaintHard()`.
   *
   * @param {number} level - the number of open levels
   *
   * @example
   * body.expandToLevel(1);
   * tableApi.repaintHard();
   */
  expandToLevel(level: number): void {
    this.groupRowById.forEach(row => row.expanded = (row.data as RowGroup<T>).level < level);
    this.recalcVisibleTreeRows(false);
  }

  /**
   * Counts how often the groups were built (start, {@link setRows}, {@link setGroupBy}, {@link regroup}, an edited
   * grouped value). The table compares it before and after an edit to know that the rows moved (→ hard repaint).
   *
   * @returns {number} the number of builds
   *
   * @example
   * const before = body.getBuildCount();
   * body.setValue(1, 1, "Ost");
   * const moved = body.getBuildCount() !== before;   // true: "region" is grouped
   */
  getBuildCount(): number {
    return this.builds;
  }

  /**
   * Runs several `setValue` calls as one change: a row whose grouped value changes moves only at the end, so the row
   * indices of the other calls stay valid (`tableApi.updateCells()` uses it).
   *
   * @param {() => void} fn - the changes
   * @returns {boolean} true if the groups were built again at the end
   *
   * @example
   * const moved = body.batch(() => {
   *   body.setValue(1, 1, "Süd");      // region – moves the row
   *   body.setValue(2, 4, 999);        // still the row that was at index 2
   * });
   */
  batch(fn: () => void): boolean {
    this.batchDepth++;
    try {
      fn();
    } finally {
      this.batchDepth--;
    }
    if (this.batchDepth || !this.regroupPending) {
      return false;
    }
    this.regroupPending = false;
    this.build(true);
    return true;
  }

  // ---------------------------------------------------------------- cells

  override getValueAt(rowIndex: number, columnIndex: number): any {
    const row = this.getRowByIndex(rowIndex);
    if (!row) {
      return "";
    }
    const property = this.properties[columnIndex];
    if (isRowGroup(row.data)) {
      this.ensureAggregates();
      const group = row.data as RowGroup<T>;
      if (property === RowGroupColumnDef.PROPERTY) {
        return this.getGroupLabel(group);
      }
      return property !== undefined && this.specByKey.has(property) ? group.results[property] : "";
    }
    return property === RowGroupColumnDef.PROPERTY ? "" : super.getValueAt(rowIndex, columnIndex);
  }

  override getTextValueAt(rowIndex: number, columnIndex: number): string {
    const row = this.getRowByIndex(rowIndex);
    const property = this.properties[columnIndex];
    if (row && isRowGroup(row.data) && property !== RowGroupColumnDef.PROPERTY) {
      const spec = property !== undefined ? this.specByKey.get(property) : undefined;
      if (!spec) return "";
      const value = this.getValueAt(rowIndex, columnIndex);
      return spec.format ? spec.format(value) : formatAggregateValue(value);
    }
    const value = this.getValueAt(rowIndex, columnIndex);
    return value === undefined || value === null ? "" : `${value}`;
  }

  /** Group rows: the {@link AggregateCellRenderer} for aggregates, no renderer otherwise; detail rows: the column's. */
  override getCellRenderer(rowIndex: number, columnIndex: number): CellRendererIf | undefined {
    const row = this.getRowByIndex(rowIndex);
    const property = this.properties[columnIndex];
    if (row && isRowGroup(row.data)) {
      return property !== undefined && this.specByKey.has(property) ? this.textRenderer : undefined;
    }
    return property === RowGroupColumnDef.PROPERTY ? undefined : super.getCellRenderer(rowIndex, columnIndex);
  }

  override getCustomClassesAt(rowIndex: number, columnIndex: number): string[] {
    const classes = super.getCustomClassesAt(rowIndex, columnIndex);
    const row = this.getRowByIndex(rowIndex);
    if (!row || !isRowGroup(row.data)) {
      return classes;
    }
    const property = this.properties[columnIndex];
    const level = (row.data as RowGroup<T>).level;
    const ret = [...classes, "ge-table-row-group", `ge-table-row-group-level-${level}`];
    if (property === RowGroupColumnDef.PROPERTY) {
      ret.push("ge-table-row-group-label");
    } else if (property !== undefined && this.specByKey.has(property)) {
      ret.push("ge-table-row-group-aggregate");
    }
    return ret;
  }

  /**
   * True for the label cell of a group row (the table gives it `role="rowheader"`).
   *
   * @param {number} rowIndex - index of the displayed body row
   * @param {number} columnIndex - column index
   * @returns {boolean} true for the group label
   */
  isGroupLabelCell(rowIndex: number, columnIndex: number): boolean {
    return this.properties[columnIndex] === RowGroupColumnDef.PROPERTY && this.isGroupRowIndex(rowIndex);
  }

  /** Group rows and the group column are not editable. */
  override isEditable(rowIndex: number, columnIndex: number): boolean {
    if (this.properties[columnIndex] === RowGroupColumnDef.PROPERTY || this.isGroupRowIndex(rowIndex)) {
      return false;
    }
    return super.isEditable(rowIndex, columnIndex);
  }

  /**
   * Sets a value of a detail row (group rows: `false`). Only the groups of that row are computed again; if a grouped
   * value changed, the row moves to its new group (the row count may change).
   */
  override setValue(rowIndex: number, columnIndex: number, value: any): boolean {
    const row = this.getRowByIndex(rowIndex);
    if (!(row instanceof RowGroupDetailRow) || this.properties[columnIndex] === RowGroupColumnDef.PROPERTY) {
      return false;
    }
    const keysBefore = this.keysOf(row.data);
    const ok = super.setValue(rowIndex, columnIndex, value);
    if (!ok) {
      return false;
    }
    const keysAfter = this.keysOf(row.data);
    if (keysBefore.some((key, i) => typedGroupKey(key) !== typedGroupKey(keysAfter[i]))) {
      if (this.batchDepth) {
        this.regroupPending = true;  // a batch (updateCells): rebuild once at its end – the other row indices stay valid
      } else {
        this.build(true);            // the row moves to its new group
      }
    } else {
      this.markRowDirty(row);
    }
    return true;
  }

  // ---------------------------------------------------------------- filter, sorting, invalidation

  /**
   * Filters the rows: `predictFn` gets **your objects** (as in a flat table), index and array of the source rows –
   * never a group. Groups without a matching row disappear (also below collapsed groups); counts and aggregates follow
   * the filter. Usually called by `tableApi.externalFilterChanged()` with `tableOptions.externalFilterFunction`.
   *
   * @param {FilterFunction<S>} predictFn - returns a truthy value for the rows to show
   *
   * @example
   * tableOptions.externalFilterFunction = (sale: Sale) => sale.monat === "Jan";
   * tableApi.externalFilterChanged();   // Nord (2) 150 · Süd (1) 80
   */
  override externalFilterChanged<S>(predictFn: FilterFunction<S>): void {
    this.userFilter = predictFn as unknown as FilterFunction<T>;
    const source = this.sourceRows;
    const accepted = new Uint8Array(source.length);
    for (let i = 0; i < source.length; i++) {
      accepted[i] = predictFn(source[i] as unknown as S, i, source as unknown as S[]) ? 1 : 0;
    }
    this.accepted = accepted;
    this.allDirty = true;
    super.externalFilterChanged((row: TreeRowIf<any>) => row instanceof RowGroupDetailRow && accepted[row.sourceIndex] === 1);
  }

  /**
   * Sorts groups and rows (see the class description); the order is applied again after regrouping.
   *
   * @param {SortItem[]} sortItems - primary key first
   * @returns {boolean} false for an empty list
   *
   * @example
   * body.doSort([new SortItem(tableApi.getColumnIndex("umsatz"), "desc")]);   // groups by sum, rows by value
   * tableApi.repaint();
   */
  override doSort(sortItems: SortItem[]): boolean {
    if (!sortItems.length) {
      return false;
    }
    this.lastSort = { items: [...sortItems] };
    this.ensureAggregates(); // groups are compared by their (filtered) aggregates
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
    this.syncGroupOrder();
    this.allDirty = true; // the order of the rows matters for "first"/"last"
    return true;
  }

  /**
   * Sorts the rows inside their groups with your function – it gets your objects, as in a flat table. The groups keep
   * their order. Used by `tableApi.sort(fn)`.
   *
   * @param {(a: any, b: any) => number} compareFn - compares two of your objects
   *
   * @example
   * tableApi.sort((a: Sale, b: Sale) => b.umsatz - a.umsatz);
   */
  override sort(compareFn: (a: any, b: any) => number): void {
    this.lastSort = { compareFn };
    super.sort((a: TreeRowIf<any>, b: TreeRowIf<any>) =>
      a instanceof RowGroupDetailRow && b instanceof RowGroupDetailRow ? compareFn(a.data, b.data) : 0);
    this.syncGroupOrder();
    this.allDirty = true;
  }

  /**
   * Drops the computed aggregates; with `change` (an edit or `updateCells`) only those of the groups of the changed rows.
   * The table calls it; the next read computes them again.
   *
   * @param {DerivedValuesChangeIf} [change] - the changed rows
   *
   * @example
   * sales[0].umsatz = 999;        // changed outside the table
   * tableApi.repaint();           // calls invalidateDerivedValues() – all groups are computed again
   */
  invalidateDerivedValues(change?: DerivedValuesChangeIf): void {
    if (change?.area === "body" && Array.isArray(change.rowIndices)) {
      for (const rowIndex of change.rowIndices) {
        const row = this.getRowByIndex(rowIndex);
        if (row instanceof RowGroupDetailRow) {
          this.markRowDirty(row);
        } else {
          this.allDirty = true;
        }
      }
      return;
    }
    this.allDirty = true;
  }

  // ---------------------------------------------------------------- internals

  /** After sorting the tree rows: the groups (`getGroups()`, `children`) in display order. */
  private syncGroupOrder(): void {
    const groupsOf = (rows: TreeRowIf<any>[] | undefined): RowGroup<T>[] =>
      (rows ?? []).filter(row => isRowGroup(row.data)).map(row => {
        const group = row.data as RowGroup<T>;
        if (group.isLeaf()) {
          // the rows of a group in display order: "first"/"last" follow the view (as in the total row)
          const indices = (row.children ?? []).map(child => (child as RowGroupDetailRow<T>).sourceIndex);
          group.sourceIndices.length = 0;
          for (const index of indices) group.sourceIndices.push(index);
        } else {
          const children = groupsOf(row.children);
          group.children.length = 0;
          group.children.push(...children);
        }
        return group;
      });
    this.groups = groupsOf(this.rows);
  }

  /** The label of a group row in the group column. */
  protected getGroupLabel(group: RowGroup<T>): string {
    const columnOptions = this.options.groupColumn;
    if (columnOptions?.label) {
      return `${columnOptions.label(group) ?? ""}`;
    }
    return columnOptions?.showCount === false ? group.label : `${group.label} (${COUNT_FORMAT.format(group.count)})`;
  }

  /** Computes what is missing: everything after a change of data/filter/grouping, otherwise the dirty paths. */
  protected ensureAggregates(): void {
    if (!this.allDirty && !this.dirtyLeaves.size) {
      return;
    }
    const accept = this.accepted ? ((accepted: Uint8Array) => (i: number) => accepted[i] === 1)(this.accepted) : undefined;
    if (!this.fields.length) {
      if (this.allDirty || this.dirtyLeaves.size) {
        // no levels: only the totals, over the (filtered) rows
        const rows = accept ? this.sourceRows.filter((_, i) => accept(i)) : this.sourceRows;
        const states = aggregateStates(rows, this.specs);
        this.totals = {};
        this.specs.forEach((spec, i) => this.totals[spec.key] = spec.aggregator.result(states[i]));
        this.allDirty = false;
        this.dirtyLeaves.clear();
      }
      return;
    }
    if (this.allDirty) {
      this.totals = aggregateRowGroupsResolved(this.groups, this.specs, accept);
      this.allDirty = false;
      this.dirtyLeaves.clear();
      return;
    }
    if (!this.dirtyLeaves.size) {
      return;
    }
    const parents = new Set<RowGroup<T>>();
    this.dirtyLeaves.forEach(leaf => {
      computeLeaf(leaf, this.specs, accept);
      for (let p = leaf.parent; p; p = p.parent) parents.add(p);
    });
    this.dirtyLeaves.clear();
    // deepest first: a parent merges its children after they are up to date
    Array.from(parents).sort((a, b) => b.level - a.level).forEach(group => mergeChildren(group, this.specs));
    this.totals = totalsOf(this.groups, this.specs);
  }

  private markRowDirty(row: RowGroupDetailRow<T>): void {
    const leaf = row.parent?.data;
    if (isRowGroup(leaf)) {
      this.dirtyLeaves.add(leaf as unknown as RowGroup<T>);
    } else {
      this.allDirty = true; // no grouping: only the totals – computed again
    }
  }

  private keysOf(row: T): unknown[] {
    return this.fields.map(field => field.getKey(row));
  }

  /** A comparator of two sibling rows for one sort column. */
  private createRowComparator(property: string | undefined, f: number): (a: TreeRowIf<any>, b: TreeRowIf<any>) => number {
    if (!f || property === undefined) {
      return () => 0;
    }
    const detailComparator = this.genericTreeTableSortComparator(property, f);
    const aggregated = this.specByKey.has(property);
    const groupColumn = property === RowGroupColumnDef.PROPERTY;
    return (a, b) => {
      const ga = isRowGroup(a.data);
      const gb = isRowGroup(b.data);
      if (ga && gb) {
        const groupA = a.data as RowGroup<T>;
        const groupB = b.data as RowGroup<T>;
        if (aggregated) {
          return this.sorterService.genericSortComparator(groupA.results[property], groupB.results[property], f);
        }
        const field = this.fields[groupA.level];
        if (groupColumn || field?.path === property) {
          const compare = field?.compare;
          return compare ? f * compare(groupA.key, groupB.key) : 0;
        }
        return 0;
      }
      if (!ga && !gb && !groupColumn) {
        return detailComparator(a, b);
      }
      return 0;
    };
  }

  /**
   * (Re)builds groups and tree rows from the source rows, keeps the expanded state of known groups, the checked
   * detail rows, the filter and the sorting.
   */
  private build(keepState: boolean): void {
    const expandedById = new Map<string, boolean>();
    const checked = new Set<T>();
    if (keepState) {
      this.groupRowById.forEach((row, id) => expandedById.set(id, row.expanded));
      this.detailRows.forEach(row => row.checked && checked.add(row.data));
    }
    this.builds++;
    const emptyLabel = this.options.emptyLabel ?? "(empty)";
    this.groups = groupRowsResolved(this.sourceRows, this.fields, emptyLabel);
    this.groupRowById = new Map();
    this.detailRows = new Array(this.sourceRows.length);
    const roots: TreeRowIf<any>[] = [];
    if (this.fields.length) {
      for (const group of this.groups) {
        roots.push(this.createGroupRow(group, undefined, expandedById));
      }
    } else {
      for (let i = 0; i < this.sourceRows.length; i++) {
        roots.push(this.detailRows[i] = new RowGroupDetailRow<T>(this.sourceRows[i], undefined, 0, i));
      }
    }
    // `rows` is readonly (and the footer watches the array): replace the content, keep the array
    this.rows.length = 0;
    for (const row of roots) this.rows.push(row);

    if (checked.size) {
      // checked objects stay checked; a group is checked if all its rows are (as TreeCheckboxModel does it)
      this.detailRows.forEach(row => row.checked = checked.has(row.data));
      this.rows.forEach(row => updateCheckedGroups(row));
    }
    this.allDirty = true;
    this.dirtyLeaves.clear();
    if (this.userFilter) {
      this.externalFilterChanged(this.userFilter); // also rebuilds the displayed rows
    } else {
      this.recalcVisibleTreeRows(false);
    }
    const lastSort = this.lastSort;
    if (lastSort && "items" in lastSort) {
      this.doSort(lastSort.items);
    } else if (lastSort) {
      this.sort(lastSort.compareFn);
    }
  }

  private createGroupRow(group: RowGroup<T>, parent: TreeRowIf<any> | undefined, expandedById: Map<string, boolean>): TreeRowIf<any> {
    const id = group.id;
    const expanded = expandedById.get(id) ?? this.isExpandedByDefault(group);
    const row = new TreeRow<any>(group, expanded, [], parent, group.level);
    this.groupRowById.set(id, row);
    if (group.isLeaf()) {
      const deep = group.level + 1;
      for (const index of group.sourceIndices) {
        const detail = new RowGroupDetailRow<T>(this.sourceRows[index], row, deep, index);
        this.detailRows[index] = detail;
        row.children!.push(detail);
      }
    } else {
      for (const child of group.children) {
        row.children!.push(this.createGroupRow(child, row, expandedById));
      }
    }
    return row;
  }

  private isExpandedByDefault(group: RowGroup<T>): boolean {
    const expanded = this.options.expanded ?? true;
    if (typeof expanded === "function") return !!expanded(group);
    if (typeof expanded === "number") return group.level < expanded;
    return expanded;
  }
}

/** Post-order: a group row is checked if it has children and all of them are checked. */
function updateCheckedGroups(row: TreeRowIf<any>): boolean {
  if (!row.children?.length) {
    return row.checked;
  }
  let all = true;
  for (const child of row.children) {
    if (!updateCheckedGroups(child)) all = false;
  }
  row.checked = all;
  return all;
}
