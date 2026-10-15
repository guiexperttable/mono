import { RowNumberMode, RowNumberOptionsIf } from "./row-number-options.if";

/**
 * The default options of the row number column: numbers of the current view, no thousands separators, header `"#"`,
 * not exported, at least 36 px wide.
 *
 * @example
 * const columnDef = new RowNumberColumnDef({ ...new RowNumberOptions(), headerLabel: "" });
 *
 * @since 1.1.93
 * @category Row numbers
 */
export class RowNumberOptions implements RowNumberOptionsIf {
  mode: RowNumberMode = "display";
  format: (rowNumber: number) => string = defaultRowNumberFormat;
  headerLabel = "#";
  exported = false;
  minWidthInPx = 36;
}

/** `String(n)` – shared, so that two default option objects are equal. */
function defaultRowNumberFormat(rowNumber: number): string {
  return String(rowNumber);
}
