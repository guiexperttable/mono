import { TreeRow } from "../data/common/tree-row";
import type { TreeRowIf } from "../data/common/tree-row-if";

// Not exported from index.ts: the tree row of a source row in an AreaModelRowGroups.

/** A detail row: a tree row with the index of its object in the source rows. */
export class RowGroupDetailRow<T> extends TreeRow<T> {
  constructor(data: T, parent: TreeRowIf<any> | undefined, deep: number, readonly sourceIndex: number) {
    super(data, false, undefined, parent, deep);
  }
}

