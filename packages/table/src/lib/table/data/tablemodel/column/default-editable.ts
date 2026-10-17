import type { ColumnDefIf } from "./column-def.if";

/**
 * `editable` of a column that `ColumnDef.create()` got without `editable`: read only (Excel-style editing with
 * `defaultEditable` may edit it). An own `editable` set later – also `FalseFn` – replaces it.
 *
 * @returns {boolean} false
 * @internal
 */
export const DEFAULTED_EDITABLE = (): boolean => false;

/**
 * True if the column has no own `editable` (`undefined`, or the default of `ColumnDef.create`).
 *
 * @param {ColumnDefIf} def - the column
 * @returns {boolean} true without own `editable`
 * @internal
 */
export function hasDefaultEditable(def: ColumnDefIf): boolean {
  return def.editable === undefined || def.editable === DEFAULTED_EDITABLE;
}
