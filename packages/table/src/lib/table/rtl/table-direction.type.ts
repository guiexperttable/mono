/**
 * The writing direction of a table ({@link TableOptionsIf.direction}):
 *
 * - `"ltr"` (default): left to right – the first column on the left.
 * - `"rtl"`: right to left (Arabic, Hebrew, Persian, Urdu …) – the first column on the right, horizontal scrolling,
 *   fixed columns, tree indent, resize handles and arrow keys mirrored.
 * - `"auto"`: the direction of the page where the table is created (`dir="rtl"` on `<html>`, a parent element or the
 *   host itself → `"rtl"`).
 *
 * @example
 * const tableOptions: TableOptionsIf = { ...new TableOptions(), direction: "rtl" };
 *
 * @since 1.1.98
 * @category Options
 */
export type TableDirection = "ltr" | "rtl" | "auto";

/**
 * A resolved writing direction – what {@link TableApi.getDirection} returns (`"auto"` is already decided).
 *
 * @since 1.1.98
 * @category Options
 */
export type ResolvedTableDirection = "ltr" | "rtl";
