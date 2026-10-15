// Internal (not exported from index.ts): marks the default getRowId of AutoRestoreOptions, so the table can tell it
// from an own getRowId. The table does not use its JSON fallback (that would store whole rows, e.g. e-mail addresses).

const defaults = new WeakSet<object>();

/** Marks a function as the default `getRowId` of {@link AutoRestoreOptions}. */
export function markDefaultGetRowId<F extends object>(fn: F): F {
  defaults.add(fn);
  return fn;
}

/** true for the default `getRowId` of {@link AutoRestoreOptions} (also after spreading the options). */
export function isDefaultGetRowId(fn: unknown): boolean {
  return typeof fn === "function" && defaults.has(fn);
}
