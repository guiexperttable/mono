

/**
 * A row of a tree table: your object (`data`) plus the tree state. Created by {@link TreeFactory.buildTreeRows}.
 *
 * @typeParam T - the type of your objects
 *
 * @example
 * // expand all first-level rows: change `expanded`, rebuild the displayed rows, repaint
 * const treeModel = tableModel.getBodyModel() as AreaModelTree<OrderNode>;
 * for (const row of treeModel.rows) row.expanded = true;
 * treeModel.recalcVisibleTreeRows(); // without it the table keeps showing the old rows
 * tableApi.repaintHard();
 *
 * @see Training: [Tree table with checkboxes](https://gui.expert/training/tree-table/)
 *
 * @category Tree & checkboxes
 */
export interface TreeRowIf<T> {
  /** Marker to recognise tree rows across package boundaries (see `isTreeRow()`). */
  type?:'TreeRow'|'';
  /** Your object. Column values are read from it (`columnDef.property`). */
  data: T;
  /** Are the children visible? */
  expanded: boolean;
  /** The child rows, undefined for leaves. */
  children: TreeRowIf<T>[] | undefined;
  /** The parent row, undefined on the top level. */
  parent: TreeRowIf<T> | undefined;
  /** Depth in the tree: 0 = top level. */
  deep: number;
  /** Checkbox state (with `showCheckboxWihoutExtraColumn` or a checkbox column). */
  checked: boolean;
  /** Internal, set by the filter: the row or one of its descendants matches (also below collapsed rows). */
  keep: boolean;
}
