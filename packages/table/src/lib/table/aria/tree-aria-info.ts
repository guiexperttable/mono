import { TreeRowIf } from "../data/common/tree-row-if";

/**
 * The part of {@link AreaModelTree} that {@link TreeAriaInfo} reads.
 *
 * @since 1.1.91
 * @category Accessibility
 */
export interface TreeAriaModel {
  getRowByIndex(rowIndex: number): TreeRowIf<unknown> | undefined;
  getFilteredFlattenRows(): TreeRowIf<unknown>[];
  getDisplayedRootRows(): TreeRowIf<unknown>[];
  getDisplayedChildren(row: TreeRowIf<unknown>): TreeRowIf<unknown>[];
  hasDisplayedChildren(row: TreeRowIf<unknown>): boolean;
}

/**
 * The screen reader attributes of one tree row (`role="treegrid"`), see {@link TreeAriaInfo}.
 *
 * @since 1.1.91
 * @category Accessibility
 */
export interface TreeAriaRowInfo {
  /** `aria-level`: 1 for top-level rows. */
  level: number;
  /** `aria-setsize`: number of displayed siblings (including the row). */
  setSize: number;
  /** `aria-posinset`: 1-based position among the displayed siblings. */
  posInSet: number;
  /** `aria-expanded`: `true`/`false` for rows with displayed children, `undefined` for leaves. */
  expanded?: boolean;
}

/**
 * Computes `aria-level`, `aria-setsize`, `aria-posinset` and `aria-expanded` of the rows of a tree body
 * ({@link AreaModelTree}). Sizes and positions count the **displayed** siblings, i.e. with an active filter only
 * the matching ones. The positions of a group of siblings are computed once and cached until the displayed rows
 * change (expand, collapse, filter, sort) – so the cost per rendered row is O(1), also with a million siblings.
 *
 * @example
 * const info = new TreeAriaInfo();
 * const attrs = info.get(tableModel.getBodyModel() as AreaModelTree<OrderNode>, 0);
 * // → { level: 1, setSize: 3, posInSet: 1, expanded: true }
 *
 * @since 1.1.91
 * @category Accessibility
 */
export class TreeAriaInfo {

  private displayedRows?: TreeRowIf<unknown>[];
  private positions = new WeakMap<object, Map<TreeRowIf<unknown>, number>>();
  private sizes = new WeakMap<object, number>();

  /**
   * The ARIA attributes of a displayed row.
   *
   * @param {TreeAriaModel} model - the tree body model (an {@link AreaModelTree})
   * @param {number} rowIndex - index of the displayed row
   * @returns {TreeAriaRowInfo | undefined} undefined if there is no such row
   */
  get(model: TreeAriaModel, rowIndex: number): TreeAriaRowInfo | undefined {
    const row = model.getRowByIndex(rowIndex);
    if (!row) {
      return undefined;
    }
    const displayed = model.getFilteredFlattenRows();
    if (displayed !== this.displayedRows) {
      // the displayed rows changed (a new array after every expand, collapse, filter or sort): forget the positions
      this.displayedRows = displayed;
      this.positions = new WeakMap();
      this.sizes = new WeakMap();
    }
    const groupKey: object = row.parent ?? model;
    let positions = this.positions.get(groupKey);
    if (!positions) {
      const siblings = row.parent ? model.getDisplayedChildren(row.parent) : model.getDisplayedRootRows();
      positions = new Map();
      siblings.forEach((sibling, i) => positions!.set(sibling, i + 1));
      this.positions.set(groupKey, positions);
      this.sizes.set(groupKey, siblings.length);
    }
    const hasChildren = model.hasDisplayedChildren(row);
    return {
      level: (row.deep ?? 0) + 1,
      setSize: Math.max(1, this.sizes.get(groupKey) ?? 1),
      posInSet: positions.get(row) ?? 1,
      expanded: hasChildren ? !!row.expanded : undefined,
    };
  }
}
