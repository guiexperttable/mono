
import { StateStorageIf } from "../../state/state-storage.if";

/**
 * `IsSameFn` compares two rows with the help of {@link AutoRestoreOptionsIf.getRowId}.
 *
 * @deprecated since 1.1.92 – never used by the table; rows are compared by {@link AutoRestoreOptionsIf.getRowId}.
 *
 * @typeparam T - The type of the rows.
 * @category Options
 */
export type IsSameFn<T> = (r1: T, r2: T, optionsIf: AutoRestoreOptionsIf<T>) => boolean;


/**
 * Returns a unique, stable id for a row – used to remember expanded tree nodes, checked and selected rows and the
 * first visible row ({@link AutoRestoreOptionsIf}, {@link TableStateIf}).
 *
 * Tree tables get the object of the node (`treeRow.data`). Models without row objects (e.g. an own `AreaModel`
 * that computes its values) get `undefined` and the displayed row index – declare the second parameter to support
 * them: `(_row, rowIndex) => rowIndex`.
 *
 * @example
 * const getRowId: GetRowIdFn<Order> = (order: Order) => order.id;
 *
 * @typeparam T - The type of the rows.
 * @category Options
 */
export type GetRowIdFn<T> = ((row: T, rowIndex?: number) => string | number);

/**
 * Returns the storage key of a table – one key per table, e.g. `() => "orders"`. The state is stored under
 * `<key>tableState`.
 *
 * @category Options
 */
export type GetStorageKeyFn = (() => string);


/**
 * What a table remembers between page loads, and where. Everything is off by default ({@link AutoRestoreOptions});
 * nothing is stored without {@link getStorageKeyFn} (the table warns once if a flag is set without it).
 *
 * The state is stored as one JSON value under `<key>tableState` in {@link storage} (default `localStorage`) –
 * the same format as {@link TableApi.getState}. Columns are stored by property and rows by {@link getRowId}, so a
 * moved column or new data never hits the wrong column or row. The stored state holds no cell values, but row ids
 * can be personal data (e.g. an e-mail address as id) – prefer technical ids. The tree, checked rows, the selection
 * and the first visible row need row ids; tree, checked and selected rows are computed only when their flag is set.
 *
 * | Flag | Remembers | since |
 * |---|---|---|
 * | {@link autoRestoreSortingState} | sorted columns | |
 * | {@link autoRestoreScrollPosition} | scroll position | |
 * | {@link autoRestoreCollapsedExpandedState} | expanded tree nodes | |
 * | {@link autoRestoreColumnLayout} | width, order, visibility of the columns | 1.1.92 |
 * | {@link autoRestoreHeaderGroupState} | collapsed header groups | 1.1.92 |
 * | {@link autoRestoreCheckedState} | checked rows | 1.1.92 (declared before, without effect) |
 * | {@link autoRestoreSelectedState} | selection | 1.1.92 (declared before, without effect) |
 * | {@link autoRestoreCustomState} | your data ({@link TableApi.setCustomState}) | 1.1.92 |
 *
 * Before 1.1.92 sorting, scroll position and tree were stored under three keys (`<key>sortingState`,
 * `<key>scrollState`, `<key>collapsedExpandedState`); they are read once and removed with the next save.
 *
 * @example
 * const tableOptions: TableOptionsIf = {
 *   ...new TableOptions(),
 *   autoRestoreOptions: {
 *     ...new AutoRestoreOptions<Order>(),
 *     getStorageKeyFn: () => "orders",
 *     getRowId: (order: Order) => order.id,
 *     autoRestoreColumnLayout: true,
 *     autoRestoreSortingState: true,
 *     autoRestoreCheckedState: true
 *   }
 * };
 *
 * @typeparam T - The type of the rows.
 * @see Training: [Remember the state](https://gui.expert/training/persist-state/)
 *
 * @category Options
 */
export interface AutoRestoreOptionsIf<T> {

  /** Remember the sorted columns (by property). */
  autoRestoreSortingState: boolean;
  /** Remember expanded and collapsed nodes of a tree table (by {@link getRowId}). */
  autoRestoreCollapsedExpandedState?: boolean;
  /** Remember the scroll position (and the id of the first visible row). */
  autoRestoreScrollPosition?: boolean;

  /** Remember the checked rows (by {@link getRowId}). Since 1.1.92 (before: declared without effect). */
  autoRestoreCheckedState?: boolean;
  /**
   * Remember the selection: rows by {@link getRowId}, columns by property. Restored in the current row order.
   * Since 1.1.92 (before: declared without effect).
   */
  autoRestoreSelectedState?: boolean;

  /**
   * Remember width, order and visibility of the columns (by property). Widths are stored only for columns that were
   * resized, so `%` and weight columns stay responsive.
   * @since 1.1.92
   */
  autoRestoreColumnLayout?: boolean;
  /**
   * Remember collapsed and expanded header groups ({@link CellGroupIf.toggle}).
   * @since 1.1.92
   */
  autoRestoreHeaderGroupState?: boolean;
  /**
   * Remember the data set with {@link TableApi.setCustomState} (e.g. a filter text).
   * @since 1.1.92
   */
  autoRestoreCustomState?: boolean;

  /**
   * A unique, stable id per row (tree: per node). With the default of {@link AutoRestoreOptions} the table uses the
   * property `id`, then `uuid`; rows without them are not stored (since 1.1.92 – the JSON of the row would write
   * personal data into the storage; the table warns once).
   */
  getRowId?: undefined | GetRowIdFn<T>;
  /** The storage key of this table, e.g. `() => "orders"`. Without it nothing is stored. */
  getStorageKeyFn?: undefined | GetStorageKeyFn;
  /**
   * @deprecated since 1.1.92 – never used; rows are compared by {@link getRowId}.
   */
  isSame?: undefined | IsSameFn<T>;

  /**
   * Where the state is stored. Default: `localStorage`; `sessionStorage` or an own {@link StateStorageIf} also work.
   * @since 1.1.92
   */
  storage?: StateStorageIf;

}
