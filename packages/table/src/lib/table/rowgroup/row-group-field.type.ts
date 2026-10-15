import type { ValueAccessor } from "../aggregation/value-accessor.type";

/**
 * The order of the groups of one level: ascending (`"asc"`, the default), descending, in the order the keys first
 * appear in the rows (`"insertion"`), or an own comparison of two keys. Empty keys (`null`, `undefined`, `""`) are
 * always last.
 *
 * @example
 * const months: RowGroupOrder = (a, b) => MONTHS.indexOf(a as string) - MONTHS.indexOf(b as string);
 *
 * @since 1.1.94
 * @category Row grouping
 */
export type RowGroupOrder = "asc" | "desc" | "insertion" | ((a: unknown, b: unknown) => number);

/**
 * One level of a row grouping in full form: where the key of a row comes from and how the groups of the level are
 * named and ordered. The short form is just the {@link ValueAccessor} (`"region"` or a function).
 *
 * @example
 * // year › month from a date, newest year first, month names as labels
 * const groupBy: RowGroupField<Order>[] = [
 *   { name: "year", label: "Year", value: o => new Date(o.date).getFullYear(), order: "desc" },
 *   { name: "month", label: "Month", value: o => new Date(o.date).getMonth(), format: m => MONTHS[m as number] }
 * ];
 *
 * @typeParam T - the row type
 * @since 1.1.94
 * @category Row grouping
 */
export interface RowGroupFieldIf<T = any> {
  /** The key of a row: a property path (`"region"`, `"address.city"`) or a function (computed keys). */
  value: ValueAccessor<T>;
  /**
   * The id of the level – part of the group ids that remember expanded groups ({@link RowGroupIf.id}).
   * Default: the property path; for a function `"level<N>"` (give functions a name if you switch between them).
   */
  name?: string;
  /** The name of the level, e.g. in the header of the group column. Default: the header label of the column with this property, otherwise the name. */
  label?: string;
  /** The text of a key in the group label. Default: the key as text, dates as date (en-US), empty keys `emptyLabel`. Text only – never HTML. */
  format?: (key: unknown) => string;
  /** The order of the groups of this level. Default `"asc"`. */
  order?: RowGroupOrder;
}

/**
 * One level of a row grouping: a property path (`"region"`), a function (`o => o.date.getFullYear()`) or the full form
 * {@link RowGroupFieldIf}.
 *
 * @example
 * const groupBy: RowGroupField<Sale>[] = ["region", s => s.produkt.toUpperCase()];
 *
 * @typeParam T - the row type
 * @since 1.1.94
 * @category Row grouping
 */
export type RowGroupField<T = any> = ValueAccessor<T> | RowGroupFieldIf<T>;
