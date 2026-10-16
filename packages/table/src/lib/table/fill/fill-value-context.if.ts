import type { FillDirection } from "./fill-direction.type";

/**
 * What an own fill function ({@link FillHandleOptionsIf.fillValue}) gets for each filled cell.
 *
 * @example
 * const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
 * const fillValue = (ctx: FillValueContextIf) => {
 *   const last = ctx.sourceValues[ctx.sourceValues.length - 1];
 *   const i = weekdays.indexOf(String(last));
 *   return i < 0 || ctx.copy ? undefined : weekdays[(((i + ctx.step) % 7) + 7) % 7];   // undefined = default
 * };
 *
 * @category Fill handle & batch edit
 * @since 1.1.96
 */
export interface FillValueContextIf {
  /** The values of the source line (the column when filling down/up, the row when filling right/left), as shown. */
  sourceValues: unknown[];
  /** 1, 2, 3 … after the source (down/right), −1, −2 … in front of it (up/left). */
  step: number;
  /** The direction of the fill. */
  direction: FillDirection;
  /** Display index of the filled cell's row. */
  rowIndex: number;
  /** Model index of the filled cell's column. */
  columnIndex: number;
  /** The property of the column (`""` without a column definition). */
  property: string;
  /** The row object of the filled cell (`undefined` for own area models without row objects). */
  row: unknown;
  /** The value the table would use (series or copy). */
  defaultValue: unknown;
  /** `true` if the values are copied (⌥/Alt on a series, Ctrl/⌘+D, Ctrl/⌘+R). */
  copy: boolean;
}
