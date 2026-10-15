/**
 * Where {@link AutoRestoreOptionsIf} stores the state of a table ({@link AutoRestoreOptionsIf.storage}). A synchronous
 * key-value store with the method names of the Web Storage API – `localStorage` (default) and `sessionStorage`
 * fit directly.
 *
 * The table reads the state while it is built, so the storage must answer synchronously. To keep the state on a
 * server, load it before you create the table and pass it as {@link TableOptionsIf.initialState}; save it in
 * {@link EventListenerIf.onStateChanged}.
 *
 * @example
 * const tableOptions: TableOptionsIf = {
 *   ...new TableOptions(),
 *   autoRestoreOptions: {
 *     ...new AutoRestoreOptions<Order>(),
 *     getStorageKeyFn: () => "orders",
 *     storage: sessionStorage,            // forget the layout when the tab is closed
 *     autoRestoreColumnLayout: true
 *   }
 * };
 *
 * @example
 * // an own storage, e.g. a prefix for all keys
 * const prefixed: StateStorageIf = {
 *   getItem: key => localStorage.getItem("my-app/" + key),
 *   setItem: (key, value) => localStorage.setItem("my-app/" + key, value),
 *   removeItem: key => localStorage.removeItem("my-app/" + key)
 * };
 *
 * @category State
 * @since 1.1.92
 */
export interface StateStorageIf {
  /** The stored string or `null`. */
  getItem(key: string): string | null;
  /** Stores a string. May throw (quota) – the table catches it. */
  setItem(key: string, value: string): void;
  /** Removes a key. */
  removeItem(key: string): void;
}
