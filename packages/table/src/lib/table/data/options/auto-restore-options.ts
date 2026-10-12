import { AutoRestoreOptionsIf } from "./auto-restore-options.if";


/**
 * Defaults for {@link TableOptionsIf.autoRestoreOptions}: everything off. Spread it and switch on what the table
 * should remember in `localStorage` (one key per table).
 *
 * @example
 * const tableOptions: TableOptionsIf = {
 *   ...new TableOptions(),
 *   autoRestoreOptions: {
 *     ...new AutoRestoreOptions<Order>(),
 *     getStorageKeyFn: () => "orders-table",          // unique per table
 *     autoRestoreSortingState: true,
 *     autoRestoreScrollPosition: true
 *   }
 * };
 *
 * @example
 * // trees: remember expanded nodes – needs a stable id per node
 * const treeOptions: TableOptionsIf = {
 *   ...new TableOptions(),
 *   autoRestoreOptions: {
 *     ...new AutoRestoreOptions<OrderNode>(),
 *     getStorageKeyFn: () => "order-tree",
 *     getRowId: (node: OrderNode) => node.id,
 *     autoRestoreCollapsedExpandedState: true
 *   }
 * };
 *
 * @see Training: [Remember the state](https://gui.expert/training/persist-state/)
 *
 * @category Options
 */
export class AutoRestoreOptions<T> implements AutoRestoreOptionsIf<T> {

  public autoRestoreSortingState = false;
  public autoRestoreCollapsedExpandedState = false;
  public autoRestoreScrollPosition = false;

  public autoRestoreCheckedState = false;
  public autoRestoreSelectedState = false;


  public getStorageKeyFn = undefined;


  public isSame = (r1: T, r2: T, options: AutoRestoreOptionsIf<T>) => {
    if (r1 && r2) {
      if (options.getRowId) {
        const id1 = options.getRowId(r1);
        const id2 = options.getRowId(r2);
        return id1 === id2;
      }
    }
    return false;
  };

  public getRowId = (row: T): string | number => {
    if (row) {
      // First try:
      for (const key of ["id", "uuid"]) {
        // @ts-ignore
        const id = row[key];
        if (id !== undefined && id !== null) {
          return id;
        }
      }

      // Second try:
      try {
        return JSON.stringify(row);
      } catch (e) {
        console.error(e);
      }
    }
    console.warn("One of following options set to true without a valid \"getRowId()\": autoRestoreExpandedState, autoRestoreCheckedState.");
    return -1;
  };

}
