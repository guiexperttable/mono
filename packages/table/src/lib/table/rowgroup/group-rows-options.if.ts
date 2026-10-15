/**
 * Options of {@link groupRows}.
 *
 * @example
 * const groups = groupRows(orders, ["country"], { emptyLabel: "(no country)" });
 *
 * @since 1.1.94
 * @category Row grouping
 */
export interface GroupRowsOptionsIf {
  /** The label of the group of empty keys (`null`, `undefined`, `""`). Default `"(empty)"`. */
  emptyLabel?: string;
}
