import { TreeRow } from "../../common/tree-row";
import { TreeRowService } from "../../../service/tree-row.service";
import { AbstractAreaModel } from "./abstract-area-model";
import { AreaIdent } from "../area-ident.type";
import { ColumnDefIf } from "../column/column-def.if";
import { FilterFunction } from "../../common/filter-function";
import { SorterService } from "../../../service/sorter.service";
import { SortItem } from "../../common/sort-item";
import {TreeRowIf} from "../../common/tree-row-if";
import type { CellRendererIf } from "../../../renderer/cell-render.if";
import type { DerivedValuesChangeIf } from "./derived-values-change.if";
import type { ShowValuesAsIf } from "../../../calc/show-values-as.type";
import { calculateShowValuesAs, sumOfNumbers } from "../../../calc/show-values-as";
import { isFormulaError } from "../../../formula/formula-error";

/**
 * Represents a  tree-based table model.
 * Extends the AbstractAreaModel class.
 *
 * The displayed rows always come from one pipeline: all tree rows (in their current, possibly sorted order)
 * → rows whose parents are all expanded → active filter. Everything that changes one of these inputs
 * ({@link recalcVisibleTreeRows} after an expand/collapse, {@link externalFilterChanged}, {@link doSort},
 * {@link toggleExpandCollapseAll}) runs the whole pipeline, so a filter survives expanding, collapsing and sorting.
 *
 * Filter semantics: the filter function receives the {@link TreeRowIf tree row} – your object is `row.data`.
 * It is called for **every** row, also for rows below collapsed parents. A row is shown if it or one of its
 * descendants matches (`row.keep`) and all its parents are expanded. So a match below a collapsed node keeps
 * that node visible (still collapsed); expanding it reveals the path to the match. The children of a matching
 * row are not kept automatically.
 *
 * @template S - The type of the row data.
 *
 * @example
 * // a tree table with a live search over the labels
 * const filter = { text: "" };
 * const tableOptions: TableOptionsIf = {
 *   ...new TableOptions(),
 *   externalFilterFunction: (row: TreeRowIf<OrderNode>) => row.data.label.toLowerCase().includes(filter.text)
 * };
 * const rows = TreeFactory.buildTreeRows<OrderNode>(nodes, { expanded: false });
 * const tableModel = TableFactory.createTableModel({ rows, columnDefs, tableOptions });
 * searchInput.addEventListener("input", () => {
 *   filter.text = searchInput.value.toLowerCase();
 *   tableApi.externalFilterChanged(); // parents of matches stay visible; expanding and sorting keep the filter
 * });
 *
 * @category Tree & checkboxes
 */
export class AreaModelTree<S> extends AbstractAreaModel<TreeRow<S>> {

  public type = 'AreaModelTree';

  protected readonly properties: string[];
  /** @internal */
  protected sorterService: SorterService = new SorterService();

  private readonly service = new TreeRowService();
  /** the displayed rows: all parents expanded and accepted by the filter */
  private filteredFlattenRows: TreeRowIf<S>[] = [];
  /** the visible rows (all parents expanded), not filtered */
  private flattenRows: TreeRowIf<S>[] = [];
  private lastPredictFn?: FilterFunction<any>;
  /** `row.keep` was set for the current filter (it depends on the filter and the data, not on expand/collapse). */
  private keepMarked = false;
  /** „Show values as“: shown value per row and property (cleared on filter, sorting and invalidation). */
  private showValuesCache = new Map<string, { total?: number; byRow: Map<TreeRowIf<any>, number | undefined> }>();

  constructor(
    public override areaIdent: AreaIdent,
    public readonly rows: TreeRowIf<S>[],
    public override  defaultRowHeight: number,
    protected override columnDefs: ColumnDefIf[] = []
  ) {
    super(areaIdent, columnDefs, defaultRowHeight);
    this.properties = columnDefs.map(def => def.property);
    this.refreshDisplayedRows();
  }

  override changeColumnOrder(sourceColumnIndex: number, targetColumnIndex: number): void {
    //  not this! this.arrayMove(this.columnDefs...)
    this.arrayMove(this.properties, sourceColumnIndex, targetColumnIndex);
    super.changeColumnOrder(sourceColumnIndex, targetColumnIndex);
  }

  /**
   * Rebuilds the displayed rows after the `expanded` state of rows has changed and applies the active filter
   * (see {@link externalFilterChanged}) again. The table calls it on every expand/collapse click. Call it
   * yourself after changing `row.expanded` from code, then repaint with `tableApi.repaintHard()`
   * (the row count changes).
   *
   * @example
   * // expand all first-level rows from code
   * const treeModel = tableModel.getBodyModel() as AreaModelTree<OrderNode>;
   * for (const row of treeModel.rows) row.expanded = true;
   * treeModel.recalcVisibleTreeRows();
   * tableApi.repaintHard();
   *
   * @param {boolean} [refilter=true] - run the filter function again (needed after the rows changed). `false` after a
   *        pure expand/collapse: whether a row matches does not depend on it (the table does this on every click –
   *        before, the filter ran over all nodes for each click).
   */
  recalcVisibleTreeRows(refilter: boolean = true) {
    this.refreshDisplayedRows(refilter);
  }

  /**
   * The displayed top-level rows: all of {@link rows}, with an active filter only the matching ones (or with a
   * matching descendant).
   *
   * @returns {TreeRowIf<S>[]} the top-level rows that are shown
   */
  getDisplayedRootRows(): TreeRowIf<S>[] {
    return this.lastPredictFn ? this.rows.filter(row => row.keep) : this.rows;
  }

  /**
   * True if the row has children that are shown when it is expanded – with an active filter only children that
   * match (or have a matching descendant) count. The arrow of a row without such children is hidden.
   *
   * @param {TreeRowIf<S>} row - a tree row of this model
   * @returns {boolean} true if the row has displayed children
   */
  hasDisplayedChildren(row: TreeRowIf<S>): boolean {
    if (!row.children?.length) {
      return false;
    }
    return !this.lastPredictFn || row.children.some(child => child.keep);
  }

  /**
   * The displayed children of a row (in display order): all children, with an active filter only those that match
   * (or have a matching descendant). They are on screen if the row is expanded.
   * Used for the screen reader attributes `aria-setsize` / `aria-posinset` of tree rows.
   *
   * @example
   * const treeModel = tableModel.getBodyModel() as AreaModelTree<OrderNode>;
   * const shown = treeModel.getDisplayedChildren(treeModel.rows[0]).length;
   *
   * @param {TreeRowIf<S>} row - a tree row of this model
   * @returns {TreeRowIf<S>[]} the displayed children (empty for a leaf)
   * @since 1.1.91
   */
  getDisplayedChildren(row: TreeRowIf<S>): TreeRowIf<S>[] {
    if (!row.children?.length) {
      return [];
    }
    return this.lastPredictFn ? row.children.filter(child => child.keep) : row.children;
  }

  /**
   * The leaves (rows without children) of the whole tree, depth-first in the current order – independent of the
   * expanded state. Used for totals: collapsing a node does not change them, and parent rows are not counted twice.
   *
   * @param {boolean} [filtered=true] - only the leaves the active filter keeps (`externalFilterChanged`); `false`: all
   * @returns {TreeRowIf<S>[]} a new array
   *
   * @example
   * const treeModel = tableModel.getBodyModel() as AreaModelTree<OrderNode>;
   * const total = aggregate(treeModel.getLeafRows(), row => row.data.total, "sum");
   *
   * @since 1.1.94
   */
  getLeafRows(filtered: boolean = true): TreeRowIf<S>[] {
    const keepAll = !filtered || !this.lastPredictFn;
    return this.collectAllRows(this.rows ?? [], [])
      .filter(row => !row.children?.length && (keepAll || row.keep));
  }

  /**
   * The displayed rows: all parents expanded and accepted by the active filter, in display order.
   *
   * @returns {TreeRowIf<S>[]} the displayed tree rows (do not modify the array)
   */
  getFilteredFlattenRows(): TreeRowIf<S>[] {
    return this.filteredFlattenRows;
  }

  getRowCount(): number {
    return this.filteredFlattenRows.length; // only visible rows (all parents expanded) are in the list
  }

  /**
   * The number of rows the tree shows without the external filter: all nodes whose parents are expanded
   * (collapsed children do not count). `0` only for a tree without rows.
   *
   * @returns {number} displayed rows before filtering
   *
   * @since 1.1.92
   */
  getUnfilteredRowCount(): number {
    return this.flattenRows.length;
  }

  getValueAt(rowIndex: number, columnIndex: number): any {
    const row = this.getRowByIndex(rowIndex);
    if (row) {
      const prop = this.properties[columnIndex];
      if (prop) {
        const value = this.getRawValueOfRow(row, prop);
        const showValuesAs = this.getColumnValues().getShowValuesAs(prop);
        return showValuesAs ? this.applyShowValuesAs(row, prop, value, showValuesAs) : value;
      }
    }
    return "";
  }

  /**
   * The value of a tree row for a property – before „Show values as“: the computed value of a calculated column,
   * otherwise the property (path) of `row.data`. Subclasses (row groups) return their aggregates for group rows.
   *
   * @param {TreeRowIf<S>} row - the tree row
   * @param {string} prop - the property of the column
   * @returns {any} the raw value
   * @since 1.1.95
   */
  protected getRawValueOfRow(row: TreeRowIf<S>, prop: string): any {
    if (this.getColumnValues().getter(prop)) {
      return this.getColumnValues().get(row.data, prop);
    }
    if (prop.includes(".")) {
      return this.getPropertyValue(row.data, prop.split("."));
    }
    // @ts-ignore
    return row.data[prop];
  }

  /**
   * The text of a cell: for a „Show values as“ column the formatted value (`"66.7%"`), for a formula error its code;
   * otherwise like before (`'' + value`).
   *
   * @param {number} rowIndex - the row
   * @param {number} columnIndex - the column
   * @returns {string} the text
   */
  override getTextValueAt(rowIndex: number, columnIndex: number): string {
    const value = this.getValueAt(rowIndex, columnIndex);
    return this.getCalculatedText(this.properties[columnIndex], value) ?? "" + value;
  }

  /** A „Show values as“ column without an own body renderer shows the formatted text. */
  override getCellRenderer(rowIndex: number, columnIndex: number): CellRendererIf | undefined {
    return super.getCellRenderer(rowIndex, columnIndex) ?? this.getCalculatedRenderer(this.properties[columnIndex]);
  }

  /** The message of a formula error as tooltip. */
  override getTooltipAt(rowIndex: number, columnIndex: number): any {
    const property = this.properties[columnIndex];
    if (property !== undefined && this.getColumnValues().isCalculated(property)) {
      const value = this.getValueAt(rowIndex, columnIndex);
      if (isFormulaError(value)) return value.message;
    }
    return super.getTooltipAt(rowIndex, columnIndex);
  }

  /**
   * Drops derived values: cached aggregates of formulas and „Show values as“ (called by the table on filter,
   * sorting, editing, `updateCells` and `api.repaint()`).
   *
   * @param {DerivedValuesChangeIf} [_change] - the changed rows (not used here)
   * @since 1.1.95
   */
  invalidateDerivedValues(_change?: DerivedValuesChangeIf): void {
    this.invalidateColumnValues();
    this.showValuesCache.clear();
  }

  /**
   * „Show values as“ of one tree row: percentages of the column total relate to the (filtered) leaf rows,
   * `percentOfParentTotal`, `runningTotal`, `differenceFromPrevious` and `rank` to the displayed siblings.
   */
  protected applyShowValuesAs(row: TreeRowIf<S>, property: string, value: unknown, options: ShowValuesAsIf): unknown {
    if (isFormulaError(value)) return value;
    let cache = this.showValuesCache.get(property);
    if (!cache) {
      cache = { byRow: new Map() };
      this.showValuesCache.set(property, cache);
    }
    switch (options.mode) {
      case "percentOfColumnTotal":
      case "percentOfGrandTotal": {
        if (cache.total === undefined) {
          cache.total = sumOfNumbers(this.getLeafRows(true).map(leaf => this.getRawValueOfRow(leaf, property)));
        }
        return typeof value === "number" && !Number.isNaN(value) && cache.total !== 0 ? value / cache.total : undefined;
      }
      case "percentOfRowTotal":
        return value; // only a pivot has row totals
      default: {
        if (!cache.byRow.has(row)) {
          const siblings = row.parent ? this.getDisplayedChildren(row.parent) : this.getDisplayedRootRows();
          const shown = calculateShowValuesAs(siblings.map(sibling => this.getRawValueOfRow(sibling, property)), options.mode);
          siblings.forEach((sibling, i) => cache!.byRow.set(sibling, shown[i]));
        }
        return cache.byRow.get(row);
      }
    }
  }

  protected override readPropertyPath(t: any, property: string): unknown {
    if (property.includes(".")) {
      return this.getPropertyValue(t, property.split("."));
    }
    return t[property];
  }

  protected override getAggregationSourceForValues(): { signal: unknown; length: number; rows: () => ArrayLike<unknown> } {
    return {
      signal: this.rows,
      length: this.rows.length,   // expanding/collapsing doesn't change the leaves; filter and edits invalidate
      rows: () => this.getLeafRows(true).map(row => row.data),
    };
  }

  getRowHeight(_rowIndex: number): number {
    return this.defaultRowHeight;
  }

  /**
   * All rows share `defaultRowHeight` – unless a subclass overrides `getRowHeight()`, then row heights may
   * vary and `undefined` is returned.
   *
   * @returns {number | undefined} The constant row height or `undefined`.
   */
  getConstantRowHeight(): number | undefined {
    const ownImpl = this.getRowHeight === AreaModelTree.prototype.getRowHeight;
    return ownImpl && this.defaultRowHeight > 0 ? this.defaultRowHeight : undefined;
  }

  override getCustomClassesAt(rowIndex: number, _columnIndex: number): string[] {
    const row = this.filteredFlattenRows[rowIndex];
    return this.addCalculatedClasses(["ge-table-tree-cell", "ge-table-tree-deep-" + row.deep],
      this.properties[_columnIndex], () => this.getValueAt(rowIndex, _columnIndex));
  }

  override getRowByIndex(idx: number): TreeRowIf<S> | undefined {
    return this.filteredFlattenRows[idx];
  }

  getValueByT(t: S, property: string):any {
    if (!t) return undefined;
    if (!property) return undefined;

    const values = this.getColumnValues();
    if (values.getter(property)) {
      return values.get(t, property); // a calculated column (since 1.1.95)
    }

    if (property.includes(".")) {
      return this.getPropertyValue(t, property.split("."));
    }
    // @ts-ignore
    return t[property];
  }

  /**
   * Filters the tree; the function is remembered and applied again on every expand/collapse
   * ({@link recalcVisibleTreeRows}), {@link toggleExpandCollapseAll} and {@link doSort}.
   *
   * The function is called once for **every** tree row in depth-first order – also for rows below collapsed
   * parents – with the {@link TreeRowIf tree row} (not your object: use `row.data`), the index of the row in
   * this depth-first list and the list itself. Shown are the rows that match or have a matching descendant
   * (`row.keep = true`) and whose parents are all expanded. A match below a collapsed node therefore keeps the
   * collapsed node visible. Usually called by `tableApi.externalFilterChanged()` with
   * `tableOptions.externalFilterFunction`.
   *
   * @param {FilterFunction<S>} predictFn - returns a truthy value for the rows to show
   *
   * @example
   * const treeModel = tableModel.getBodyModel() as AreaModelTree<OrderNode>;
   * treeModel.externalFilterChanged((row: TreeRowIf<OrderNode>) => row.data.total > 1000);
   * tableApi.repaintHard();
   *
   * // remove the filter
   * treeModel.externalFilterChanged(() => true);
   */
  externalFilterChanged<S>(predictFn: FilterFunction<S>): void {
    this.lastPredictFn = predictFn;
    this.showValuesCache.clear();
    this.invalidateColumnValues();
    this.refreshDisplayedRows(true);
  }

  /**
   * Sorts the rows of every level (children stay below their parent) and keeps the active filter. The first sort
   * item is the primary key, the following ones break ties. The `rows` array and the children arrays are reordered
   * in place, so the order survives expanding, collapsing and filtering. Sort state `""` keeps the current order.
   *
   * @param {SortItem[]} sortItems - primary key first; an empty list does nothing
   * @returns {boolean} `true` if the rows were sorted, `false` for an empty list
   *
   * @example
   * tableModel.getBodyModel().doSort([new SortItem(1, "desc")]);
   * tableApi.repaint();
   */
  override doSort(sortItems: SortItem[]): boolean {
    if (!sortItems.length) {
      return false; // nothing to sort – keep the current order (like the flat models)
    }
    const comparators = sortItems.map(({ columnIndex, sortState }) => {
      const f = sortState === "asc" ? 1 : sortState === "desc" ? -1 : 0;
      return this.genericTreeTableSortComparator(this.properties[columnIndex], f);
    });
    this.showValuesCache.clear();
    // primary key first (before: only the last item was used)
    this.treeSortWith(this.rows, (a, b) => {
      for (const comparator of comparators) {
        const c = comparator(a, b);
        if (c) return c;
      }
      return 0;
    });

    this.refreshDisplayedRows(false); // the order does not change which rows match the filter
    return true;
  }

  /**
   * Sorts the rows of every level with your own function (children stay below their parent) and keeps the active
   * filter. Used by `tableApi.sort(fn)` – before, sorting a tree with a function did nothing.
   *
   * @param {(a: TreeRowIf<S>, b: TreeRowIf<S>) => number} compareFn - compares two sibling rows – like the filter
   *        function it gets the tree rows: your objects are `a.data` / `b.data`
   *
   * @example
   * tableApi.sort((a, b) => a.data.total - b.data.total);   // sorts the siblings of every level by total
   */
  override sort(compareFn: (a: TreeRowIf<S>, b: TreeRowIf<S>) => number): void {
    this.showValuesCache.clear();
    this.treeSortWith(this.rows, compareFn);
    this.refreshDisplayedRows(false);
  }

  /**
   * Expands or collapses every row on every level and applies the active filter again.
   *
   * @param {boolean} expanded - `true` expands, `false` collapses all rows
   */
  toggleExpandCollapseAll(expanded: boolean) {
    this.expandAllRecursive(this.rows, expanded);
    this.refreshDisplayedRows(false);
  }

  setAllParentsOk(item: TreeRowIf<any>) {
    if (item.parent) {
      item.parent.keep = true;
      this.setAllParentsOk(item.parent);
    }
    return false;
  }

  override setValue(rowIndex: number, columnIndex: number, value: any): boolean {
    const editInputPipe = this.columnDefs[columnIndex]?.editInputPipe;
    if (editInputPipe) {
      value = editInputPipe(value, rowIndex, columnIndex);
    }
    const treeRow: TreeRowIf<S> | undefined = this.getRowByIndex(rowIndex);
    if (treeRow) {
      const row: S = treeRow.data;
      const columnDef = this.columnDefs[columnIndex];
      if (this.areaIdent === "body" && columnDef?.valueGetter) {
        return this.setCalculatedValue(row, columnDef, value); // a calculated column: only with a valueSetter
      }
      const property = this.columnDefs[columnIndex].property;
      if (property.includes(".")) {
        return this.setPropertyValue(row, property.split("."), value);
      }
      // @ts-ignore
      row[property] = value;
      return true;
    }
    return false;
  }

  protected genericTreeTableSortComparator(property: string, f: number) {
    // Find the column definition for the property
    const columnDef = this.columnDefs.find(def => def.property === property);
    const calculated = this.getColumnValues().isCalculated(property);
    const memo = calculated ? new Map<unknown, unknown>() : undefined;
    const read = (data: S): unknown => {
      if (!memo) return this.getValueByT(data, property);
      if (memo.has(data)) return memo.get(data);
      const v = this.getValueByT(data, property);
      const value = isFormulaError(v) ? undefined : v;
      memo.set(data, value);
      return value;
    };

    return (a: TreeRowIf<S>, b: TreeRowIf<S>) => {
      const va = read(a.data);
      const vb = read(b.data);
      if (calculated && (va === undefined || vb === undefined)) {
        return va === vb ? 0 : va === undefined ? 1 : -1; // empty values and formula errors last
      }

      // If the column has a custom sortComparator, use it
      if (columnDef?.sortComparator) {
        return f * columnDef.sortComparator(va, vb, a.data, b.data, f);
      }

      // Otherwise, use the default generic comparator
      return this.sorterService.genericSortComparator(va, vb, f);
    };
  }

  private expandAllRecursive(arr: TreeRowIf<S>[], expanded: boolean) {
    for (const row of arr) {
      row.expanded = expanded;
      if (row.children) {
        this.expandAllRecursive(row.children, expanded);
      }
    }
  }

  /**
   * The one pipeline behind the displayed rows: all rows (current order) → visible (all parents expanded)
   * → active filter.
   */
  private refreshDisplayedRows(refilter: boolean = true): void {
    this.flattenRows = this.service.flattenTree(this.rows ?? []);
    if (!this.lastPredictFn) {
      this.filteredFlattenRows = [...this.flattenRows];
      return;
    }
    if (refilter || !this.keepMarked) {
      this.markKeptRows(this.lastPredictFn);
      this.keepMarked = true;
    }
    this.filteredFlattenRows = this.flattenRows.filter(row => row.keep);
  }

  /**
   * Sets `keep` on every row (also below collapsed parents): true for matching rows and all their ancestors.
   */
  private markKeptRows(predictFn: FilterFunction<any>): void {
    const allRows = this.collectAllRows(this.rows ?? [], []);
    allRows.forEach(row => row.keep = false);
    allRows.forEach((row, index) => {
      if (predictFn(row, index, allRows)) {
        row.keep = true;
        // every kept row already has kept ancestors → stop at the first one
        for (let p = row.parent; p && !p.keep; p = p.parent) {
          p.keep = true;
        }
      }
    });
  }

  /** all rows depth-first, independent of the expanded state */
  private collectAllRows(rows: TreeRowIf<S>[], ret: TreeRowIf<S>[]): TreeRowIf<S>[] {
    for (const row of rows) {
      ret.push(row);
      if (row.children?.length) {
        this.collectAllRows(row.children, ret);
      }
    }
    return ret;
  }

  private getPropertyValue(o: any, props: string[]): any {
    const prop = props.shift();
    // @ts-ignore
    let o2 = o[prop];
    if (o2 && props.length) {
      return this.getPropertyValue(o2, props);
    }
    return o2;
  }

  private treeSortWith(rows: TreeRowIf<S>[], compareFn: (a: TreeRowIf<S>, b: TreeRowIf<S>) => number) {
    rows.sort(compareFn);
    for (const row of rows) {
      if (row.children) {
        this.treeSortWith(row.children, compareFn);
      }
    }
  }
}
