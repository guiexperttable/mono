import { StateStorageIf } from "./state-storage.if";
import { TableStateIf, TableSortStateIf, TableTreeStateIf } from "./table-state.if";

/** The keys before 1.1.92 (one per part, `<key><suffix>`). */
const LEGACY_SUFFIXES = ["sortingState", "scrollState", "collapsedExpandedState"] as const;

interface LegacyCollapsedExpanded {
  mode?: "collapsed" | "expanded";
  rowIds?: (string | number)[];
  allCollapsed?: boolean;
  allExpanded?: boolean;
}

function read<T>(storage: StateStorageIf, key: string): T | undefined {
  try {
    const json = storage.getItem(key);
    return json ? JSON.parse(json) as T : undefined;
  } catch (_e) {
    return undefined; // blocked or invalid JSON
  }
}

/**
 * Reads the state that tables before 1.1.92 stored under `<key>sortingState`, `<key>scrollState` and
 * `<key>collapsedExpandedState` and converts it to a {@link TableStateIf}. The stored sort items hold a column
 * INDEX – it is converted to the property of the column at that index in the default column order (the order a
 * table of the old version always started with).
 *
 * @param {StateStorageIf} storage - the storage
 * @param {string} key - the storage key of the table (`getStorageKeyFn()`)
 * @param {string[]} properties - the properties of the columns in the default order
 * @returns {TableStateIf | undefined} the state, `undefined` if nothing was stored
 *
 * @example
 * localStorage.setItem("orderssortingState", '[{"columnIndex":2,"sortState":"desc"}]');
 * readLegacyState(localStorage, "orders", ["id", "customer", "total"]);
 * // → { version: 1, sort: [{ property: "total", sortState: "desc" }] }
 *
 * @category Internals
 * @since 1.1.92
 */
export function readLegacyState(storage: StateStorageIf, key: string, properties: string[]): TableStateIf | undefined {
  const state: TableStateIf = { version: 1 };
  let found = false;

  const sortItems = read<{ columnIndex?: number; sortState?: string }[]>(storage, key + "sortingState");
  if (Array.isArray(sortItems)) {
    found = true;
    state.sort = sortItems
      .filter(item => item && typeof item.columnIndex === "number"
        && (item.sortState === "asc" || item.sortState === "desc"))
      .map(item => {
        const property = properties[item.columnIndex!];
        const sortState = item.sortState as "asc" | "desc";
        const entry: TableSortStateIf = property ? { property, sortState } : { columnIndex: item.columnIndex, sortState };
        return entry;
      });
  }

  const scroll = read<[number, number]>(storage, key + "scrollState");
  if (Array.isArray(scroll) && typeof scroll[0] === "number" && typeof scroll[1] === "number") {
    found = true;
    state.scroll = { left: scroll[0], top: scroll[1] };
  }

  const tree = read<LegacyCollapsedExpanded>(storage, key + "collapsedExpandedState");
  if (tree && typeof tree === "object") {
    found = true;
    let converted: TableTreeStateIf;
    if (tree.allExpanded) {
      converted = { collapsedRowIds: [] };
    } else if (tree.allCollapsed) {
      converted = { expandedRowIds: [] };
    } else if (tree.mode === "expanded") {
      converted = { expandedRowIds: tree.rowIds ?? [] };        // the ids are the expanded rows
    } else {
      converted = { collapsedRowIds: tree.rowIds ?? [] };       // the ids are the collapsed rows
    }
    state.tree = converted;
  }
  return found ? state : undefined;
}

/**
 * Removes the keys of tables before 1.1.92 (see {@link readLegacyState}).
 *
 * @param {StateStorageIf} storage - the storage
 * @param {string} key - the storage key of the table
 *
 * @example
 * removeLegacyState(localStorage, "orders");
 *
 * @category Internals
 * @since 1.1.92
 */
export function removeLegacyState(storage: StateStorageIf, key: string): void {
  for (const suffix of LEGACY_SUFFIXES) {
    try {
      storage.removeItem(key + suffix);
    } catch (_e) {
      // storage blocked
    }
  }
}
