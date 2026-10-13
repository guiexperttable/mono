
import {TreeRowIf} from "../data/common/tree-row-if";

/** @category Tree & checkboxes */
export class TreeRowService {

  flattenTree<T>(
    rows: TreeRowIf<T>[],
    ret: TreeRowIf<T>[] = []
  ): TreeRowIf<T>[] {

    for (const row of rows) {
      if (this.isVisible(row)) {
        ret.push(row);
        if (row.expanded && row.children?.length) {
          this.flattenVisibleChildren(row.children, ret);
        }
      }
    }
    return ret;
  }

  /** The children of a visible, expanded row are visible – collapsed subtrees are not walked at all
   *  (before, every node of the tree was visited and checked up to the root on every expand/collapse). */
  private flattenVisibleChildren<T>(rows: TreeRowIf<T>[], ret: TreeRowIf<T>[]): void {
    for (const row of rows) {
      ret.push(row);
      if (row.expanded && row.children?.length) {
        this.flattenVisibleChildren(row.children, ret);
      }
    }
  }

  isVisible(row: TreeRowIf<any>): boolean {
    if (!row.parent) {
      return true;
    }
    if (!row.parent.expanded) {
      return false;
    }
    return this.isVisible(row.parent);
  }

}
