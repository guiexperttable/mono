/**
 * One node of a grouped header ({@link AreaModelCellGroups}): a group with `children`, or a leaf with a `property`
 * (a leaf becomes a column).
 *
 * @example
 * const groups: CellGroupIf[] = [
 *   { data: "Order", children: [{ data: "ID", property: "id" }, { data: "Date", property: "date" }] },
 *   { data: "Customer", toggle: true, children: [
 *     { data: "Customer", property: "customer", visibility: "always" },   // stays visible when collapsed
 *     { data: "City", property: "city" }] }
 * ];
 * const columnDefs = CellgroupFactory.buildColumnDefs(CellgroupFactory.buildGroupExts(groups));
 * const header = new AreaModelCellGroups("header", groups, columnDefs, 34);
 *
 * @see Training: [Header models: multi-row and grouped](https://gui.expert/training/header-groups/)
 *
 * @category Header groups
 */
export interface CellGroupIf {

  /**
   * A stable id of the group, used to remember whether it is collapsed ({@link TableHeaderGroupStateIf},
   * {@link TableApi.setHeaderGroupCollapsed}). Default: the path of the labels, e.g. `"Customer"` or `"2026/Q1"`.
   * @since 1.1.92
   */
  id?: string;

  /** The label of the group or column. */
  data: any;
  /** Set on leaves only: the property shown in this column. */
  property?: string;
  /** Show a ❯ toggle so that the user can collapse / expand the group. */
  toggle?: boolean;
  /** Current state: collapsed. */
  closed?: boolean;
  /**
   * When is this child visible? `"always"` – also when the group is collapsed; `"inverted"` – only when collapsed
   * (e.g. a summary column); `"normal"` / undefined – only when expanded.
   */
  visibility?: "always" | "inverted" | "normal" | undefined;
  /** Sub-groups or columns. */
  children?: CellGroupIf[] | undefined;

  /** Internal: the implementation type of the node. */
  impl?:string;

}
