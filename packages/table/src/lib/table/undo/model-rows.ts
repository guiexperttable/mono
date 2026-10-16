import { isAreaModelTree } from "../instanceof-workaround";

interface RowSource {
  getAllRows?: () => unknown[];
  getSourceRows?: () => unknown[];
  arr?: unknown[];
  rows?: unknown[];
}

/**
 * The rows array of a body model (object array: `getAllRows`, row grouping: `getSourceRows`, array of arrays: `arr`,
 * tree: its root rows) – another array means `setRows` replaced the data.
 *
 * @param {unknown} body - the body area model
 * @returns {unknown[] | undefined} the array, `undefined` for models that can't tell
 * @internal
 */
export function rowsArrayOf(body: unknown): unknown[] | undefined {
  const model = body as RowSource;
  if (isAreaModelTree(body as never)) {
    return model.rows;
  }
  return model.getAllRows?.() ?? model.getSourceRows?.() ?? model.arr;
}

/**
 * All row objects of a body model, also filtered and collapsed ones (tree: the data of every node).
 *
 * @param {unknown} body - the body area model
 * @returns {Set<unknown> | null} the rows, `null` for models that can't tell
 * @internal
 */
export function allRowObjectsOf(body: unknown): Set<unknown> | null {
  if (isAreaModelTree(body as never)) {
    const keys = new Set<unknown>();
    const walk = (rows: unknown[] | undefined) => rows?.forEach(r => {
      const tr = r as { data?: unknown; children?: unknown[] };
      keys.add(tr.data ?? tr);
      walk(tr.children);
    });
    walk((body as RowSource).rows);
    return keys;
  }
  const rows = rowsArrayOf(body);
  return rows ? new Set(rows) : null;
}
