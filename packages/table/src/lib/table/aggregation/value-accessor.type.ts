/**
 * Where an aggregation gets its value from a row: a property path (`"total"`, `"address.city"`) or a function
 * (computed values, numbers stored as text, …).
 *
 * @example
 * const byPath: ValueAccessor<Order> = "total";
 * const computed: ValueAccessor<Order> = order => order.quantity * order.price;
 *
 * @typeParam T - the row type
 * @since 1.1.94
 * @category Aggregation
 */
export type ValueAccessor<T = any> = string | ((row: T) => unknown);
