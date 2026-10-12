import { TreeRow } from "../data/common/tree-row";
import { TreeRowIf } from "../data/common/tree-row-if";

/**
 * Expanded state of a new tree row: a fixed value for all rows, or a function per row
 * (e.g. `(_data, deep) => deep < 1` → only the top level is open).
 *
 * @category Tree & checkboxes
 */
export type TreeRowExpandedFn<T> = (data: T, deep: number) => boolean;

/**
 * Options for {@link TreeFactory.buildTreeRows}.
 *
 * @example
 * // start with every node collapsed
 * TreeFactory.buildTreeRows(data, { childrenProperty: "children", expanded: false });
 *
 * @example
 * // open the first level only
 * TreeFactory.buildTreeRows(data, { expanded: (_row, deep) => deep === 0 });
 *
 * @category Tree & checkboxes
 */
export interface TreeFactoryOptions<T> {
  /** Property that holds the child objects. Default: "children". */
  childrenProperty?: string;
  /** Expanded state of the rows. Default: true (everything open, as before). */
  expanded?: boolean | TreeRowExpandedFn<T>;
  /** Maximum depth. Default: 12. */
  deepMaxLimit?: number;
}

/**
 * Turns hierarchical data into {@link TreeRow tree rows} for a tree table. Pass the result as `rows`
 * to {@link TableFactory.createTableModel} – the factory then creates an {@link AreaModelTree}; the first
 * column shows the arrows.
 *
 * @example
 * interface Node { label: string; total: number; children?: Node[] }
 *
 * const rows = TreeFactory.buildTreeRows<Node>(nodes, {
 *   childrenProperty: "children",
 *   expanded: (row, deep) => deep === 0          // open only the first level
 * });
 * const tableModel = TableFactory.createTableModel({
 *   rows,
 *   columnDefs: [new ColumnDef("label", "Name", px300, bodyLeft), new ColumnDef("total", "Total", px120, allRight)]
 * });
 *
 * @see Training: [Tree table with checkboxes](https://gui.expert/training/tree-table/)
 *
 * @category Tree & checkboxes
 */
export class TreeFactory {

  /**
   * Builds tree rows (input for `TableFactory.createTableModel({ rows })`) from nested objects.
   *
   * @param data - the top-level objects
   * @param childrenPropertyOrOptions - name of the children property (default "children") or {@link TreeFactoryOptions}
   * @param deepMaxLimit - maximum depth (default 12; ignored when options are passed)
   * @param expanded - expanded state of the rows (default true; ignored when options are passed)
   *
   * @example
   * const rows = TreeFactory.buildTreeRows<OrderNode>(data, { childrenProperty: "children", expanded: false });
   */
  static buildTreeRows<T>(
    data: T[],
    childrenPropertyOrOptions: string | TreeFactoryOptions<T> = "children",
    deepMaxLimit: number = 12,
    expanded: boolean | TreeRowExpandedFn<T> = true): TreeRowIf<T>[] {

    const options: TreeFactoryOptions<T> = typeof childrenPropertyOrOptions === "string"
      ? { childrenProperty: childrenPropertyOrOptions, deepMaxLimit, expanded }
      : childrenPropertyOrOptions;
    const childrenProperty = options.childrenProperty ?? "children";
    const limit = options.deepMaxLimit ?? 12;
    const isExpanded = TreeFactory.toExpandedFn<T>(options.expanded ?? true);

    const ret: TreeRowIf<T>[] = [];
    for (const r of data) {
      const root = new TreeRow<T>(r, isExpanded(r, 0), [], undefined, 0);
      ret.push(TreeFactory.buildTreeRow<T>(r, childrenProperty, root, 0, limit, isExpanded));
    }
    return ret;
  }


  static buildTreeRow<T>(
    data: T,
    childrenProperty: string = "children",
    parent: TreeRowIf<T> = new TreeRow<T>(data, true, [], undefined, 0),
    deep: number = 0,
    deepMaxLimit: number = 12,
    expanded: boolean | TreeRowExpandedFn<T> = true): TreeRowIf<T> {

    if (deep > deepMaxLimit) {
      console.warn("Max deep limit reached: ", deep);
      return parent;
    }
    const isExpanded = TreeFactory.toExpandedFn<T>(expanded);
    // @ts-ignore
    const children: T[] | undefined = data[childrenProperty];
    if (children) {
      for (const r of children) {
        const tr = new TreeRow<T>(r, isExpanded(r, deep + 1), [], parent, deep + 1);
        parent.children?.push(tr);
        TreeFactory.buildTreeRow(r, childrenProperty, tr, deep + 1, deepMaxLimit, isExpanded);
      }
    }
    return parent;
  }

  private static toExpandedFn<T>(expanded: boolean | TreeRowExpandedFn<T>): TreeRowExpandedFn<T> {
    return typeof expanded === "function" ? expanded : () => expanded;
  }
}
