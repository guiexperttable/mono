/**
 * Data type used for comparing values of a filtered column ({@link ColumnDefIf.filter}).
 * Without an explicit type the table infers it from the first non-blank values ({@link inferColumnFilterType}).
 *
 * @example
 * const kind: ColumnFilterType = "number";
 *
 * @category Sorting & filtering
 * @since 1.1.114
 */
export type ColumnFilterType = "text" | "number" | "date" | "boolean" | "set";
