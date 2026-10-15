/**
 * A group of a row grouping – the `data` of a group row in an {@link AreaModelRowGroups} and the result of
 * {@link groupRows}. Groups of the last level hold the rows; groups above hold sub-groups.
 *
 * @example
 * // the group of a clicked row
 * const group = model.getRowGroup(rowIndex);
 * if (group) console.log(group.path, group.count, group.results.umsatz);   // ["Nord", "A"], 2, 220
 *
 * @typeParam T - the row type
 * @since 1.1.94
 * @category Row grouping
 */
export interface RowGroupIf<T = any> {
  /** Marker for {@link isRowGroup} (works across copies of the core). */
  readonly type: "RowGroup";
  /** The key of the group, as the rows have it (`null` for the group of empty keys: `null`, `undefined`, `""`). */
  readonly key: unknown;
  /** The key as text (`format` of the level, otherwise the default text). */
  readonly label: string;
  /** The level, 0 = top. */
  readonly level: number;
  /** The name of the level ({@link RowGroupFieldIf.name}). */
  readonly field: string;
  /** The keys from the top level down to this group. */
  readonly path: readonly unknown[];
  /**
   * A stable id built from the level names and keys – the same data give the same id (persistence of expanded groups).
   * Keys that are objects or symbols get an id per page load only (they can't be stored).
   */
  readonly id: string;
  /** The parent group, undefined on the top level. */
  readonly parent: RowGroupIf<T> | undefined;
  /** The sub-groups, empty on the last level. */
  readonly children: RowGroupIf<T>[];
  /** The number of rows in the group (after the filter). */
  readonly count: number;
  /** The aggregates of the group by key (after the filter), e.g. `{ umsatz: 270 }`. */
  readonly results: Record<string, unknown>;

  /**
   * The rows of the group and of all sub-groups, in the order of the grouped view: sub-group by sub-group, the rows of a
   * group in source order – or sorted, after the table sorted them.
   *
   * @param {boolean} [filtered=true] - only the rows the filter keeps
   * @returns {T[]} a new array
   */
  getRows(filtered?: boolean): T[];
}
