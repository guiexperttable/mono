import { TreeRow } from "../../common/tree-row";
import { TreeRowService } from "../../../service/tree-row.service";
import { AbstractAreaModel } from "./abstract-area-model";
import { AreaIdent } from "../area-ident.type";
import { ColumnDefIf } from "../column/column-def.if";
import { FilterFunction } from "../../common/filter-function";
import { SorterService } from "../../../service/sorter.service";
import { SortItem } from "../../common/sort-item";
import {TreeRowIf} from "../../common/tree-row-if";

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
   */
  recalcVisibleTreeRows() {
    this.refreshDisplayedRows();
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
    let n = 0;
    for (const r of this.filteredFlattenRows) {
      if (this.service.isVisible(r)) {
        n++;
      }
    }
    return n;
  }

  getValueAt(rowIndex: number, columnIndex: number): any {
    const row = this.getRowByIndex(rowIndex);
    if (row) {
      const prop = this.properties[columnIndex];
      if (prop) {
        if (prop.includes(".")) {
          return this.getPropertyValue(row.data, prop.split("."));
        }
        // @ts-ignore
        return row.data[prop];
      }
    }
    return "";
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
    return ["ge-table-tree-cell", "ge-table-tree-deep-" + row.deep];
  }

  override getRowByIndex(idx: number): TreeRowIf<S> | undefined {
    return this.filteredFlattenRows[idx];
  }

  getValueByT(t: S, property: string):any {
    if (!t) return undefined;
    if (!property) return undefined;

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
    this.refreshDisplayedRows();
  }

  /**
   * Sorts the rows of every level (children stay below their parent) by the **last** sort item and keeps the
   * active filter. The `rows` array and the children arrays are reordered in place, so the order survives
   * expanding, collapsing and filtering. Sort state `""` keeps the current order.
   *
   * @param {SortItem[]} sortItems - only the last item is used; an empty list does nothing
   * @returns {boolean} `true` if the rows were sorted, `false` for an empty list
   *
   * @example
   * tableModel.getBodyModel().doSort([new SortItem(1, "desc")]);
   * tableApi.repaint();
   */
  override doSort(sortItems: SortItem[]): boolean {
    const sortItem = sortItems[sortItems.length - 1];
    if (!sortItem) {
      return false; // nothing to sort – keep the current order (like the flat models)
    }
    const { columnIndex, sortState } = sortItem;
    const f = sortState === "asc" ? 1 :
      sortState === "desc" ? -1 : 0;

    const property = this.properties[columnIndex];
    this.treeSort(this.rows, property, f);

    this.refreshDisplayedRows();
    return true;
  }

  /**
   * Expands or collapses every row on every level and applies the active filter again.
   *
   * @param {boolean} expanded - `true` expands, `false` collapses all rows
   */
  toggleExpandCollapseAll(expanded: boolean) {
    this.expandAllRecursive(this.rows, expanded);
    this.refreshDisplayedRows();
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

    return (a: TreeRowIf<S>, b: TreeRowIf<S>) => {
      const va = this.getValueByT(a.data, property);
      const vb = this.getValueByT(b.data, property);

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
  private refreshDisplayedRows(): void {
    this.flattenRows = this.service.flattenTree(this.rows ?? []);
    if (!this.lastPredictFn) {
      this.filteredFlattenRows = [...this.flattenRows];
      return;
    }
    this.markKeptRows(this.lastPredictFn);
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

  private treeSort(rows: TreeRowIf<S>[], property: string, f: number) {
    rows.sort(this.genericTreeTableSortComparator(property, f));
    for (const row of rows) {
      if (row.children) {
        this.treeSort(row.children, property, f);
      }
    }
  }
}
