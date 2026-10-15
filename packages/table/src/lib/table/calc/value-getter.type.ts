import type { ValueGetterContextIf } from "./value-getter-context.if";

/**
 * Computes the value of a calculated column from the row (`ColumnDefIf.valueGetter`). The row is the data object
 * (in a tree the `TreeRow.data`). The data is not changed – sorting, filter (`tableApi.getRowValue`), copy, Excel and
 * totals use the computed value.
 *
 * Keep it fast and free of side effects: it runs for every visible cell on each render (values are not cached) and
 * once per row for sorting and totals.
 *
 * @example
 * const total: ValueGetter<Item> = row => row.price * row.quantity;
 * ColumnDef.create({ property: "total", headerLabel: "Total", valueGetter: total });
 *
 * @typeParam T - the row type
 * @since 1.1.95
 * @category Calculated columns & formulas
 */
export type ValueGetter<T = any> = (row: T, context: ValueGetterContextIf) => unknown;

/**
 * Writes an edited value of a calculated column back into the row (`ColumnDefIf.valueSetter`). Without a setter a
 * calculated column cannot be edited. Return `false` to reject the value.
 *
 * @example
 * // "total" is price × quantity – editing the total changes the price
 * const setTotal: ValueSetter<Item> = (row, value) => {
 *   const total = Number(value);
 *   if (!Number.isFinite(total) || !row.quantity) return false;
 *   row.price = total / row.quantity;
 * };
 *
 * @typeParam T - the row type
 * @since 1.1.95
 * @category Calculated columns & formulas
 */
export type ValueSetter<T = any> = (row: T, value: unknown) => boolean | void;
