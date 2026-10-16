import { AutoRestoreOptionsIf } from "./auto-restore-options.if";
import { markDefaultGetRowId } from "./default-row-id";


/**
 * Defaults for {@link TableOptionsIf.autoRestoreOptions}: everything off. Spread it and switch on what the table
 * should remember in `localStorage` (one key per table) – see {@link AutoRestoreOptionsIf} for all flags.
 *
 * @example
 * const tableOptions: TableOptionsIf = {
 *   ...new TableOptions(),
 *   autoRestoreOptions: {
 *     ...new AutoRestoreOptions<Order>(),
 *     getStorageKeyFn: () => "orders-table",          // unique per table
 *     autoRestoreSortingState: true,
 *     autoRestoreScrollPosition: true,
 *     autoRestoreColumnLayout: true                     // widths, order, visibility (since 1.1.92)
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

  /** @since 1.1.92 */
  public autoRestoreColumnLayout = false;
  /** @since 1.1.92 */
  public autoRestoreHeaderGroupState = false;
  /** @since 1.1.92 */
  public autoRestoreCustomState = false;
  /** @since 1.1.97 */
  public autoRestoreDetailState = false;


  public getStorageKeyFn = undefined;


  /** @deprecated since 1.1.92 – never used by the table. */
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

  /**
   * Default: the property `id`, then `uuid`, then the JSON of the row. The table itself uses only `id` / `uuid` of
   * this default (since 1.1.92): rows without them are not stored – the JSON would write whole rows into the storage.
   */
  public getRowId = markDefaultGetRowId((row: T): string | number => {
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
    console.warn("autoRestoreOptions: getRowId() got no row – set an own getRowId (row, rowIndex) for models without row objects.");
    return -1;
  });

}
