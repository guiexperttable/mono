import type { ValueAccessor } from "./value-accessor.type";

/**
 * A function that reads a value from a row: a property path (`"address.city"`, missing parents → `undefined`) or the
 * given function itself.
 *
 * @param {ValueAccessor<T>} value - property path or function
 * @returns {(row: T) => unknown} the getter
 *
 * @example
 * const city = createValueGetter<{ address?: { city: string } }>("address.city");
 * city({ address: { city: "Kiel" } }); // "Kiel"
 * city({});                            // undefined
 *
 * @since 1.1.94
 * @category Aggregation
 */
export function createValueGetter<T = any>(value: ValueAccessor<T>): (row: T) => unknown {
  if (typeof value === "function") {
    return value;
  }
  const path = value.split(".");
  if (path.length === 1) {
    return (row: T) => (row === null || row === undefined) ? undefined : (row as Record<string, unknown>)[value];
  }
  return (row: T) => {
    let o: unknown = row;
    for (const key of path) {
      if (o === null || o === undefined) return undefined;
      o = (o as Record<string, unknown>)[key];
    }
    return o;
  };
}
