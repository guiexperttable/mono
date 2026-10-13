import { SizeIf } from "./size.if";
import { SizeUnitType } from './size-unit.type';

/**
 * A width with unit – used for {@link ColumnDefIf.width}, `minWidth` and `maxWidth`.
 * For pixel widths use the constants {@link px80}, {@link px100}, {@link px120} … (`px0` – `px500`).
 *
 * @example
 * new Size(37, "px");        // fixed
 * new Size(10, "%");         // 10 % of the table width (clamped by minWidth / maxWidth)
 * new Size(2, "weight");     // twice as much of the remaining space as a column with weight 1
 *
 * @category Columns
 */
export class Size implements SizeIf {
  constructor(
    public value: number = 100,
    public unit: SizeUnitType = "px"
  ) {
  }
}
