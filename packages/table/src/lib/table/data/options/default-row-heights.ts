import { DefaultRowHeightsIf } from "./default-row-heights.if";

/**
 * Row heights of header, body and footer in px – default 34 each. Used in {@link TableOptionsIf.defaultRowHeights}
 * and {@link CreateTableModelPara.defaultRowHeights}.
 *
 * @example
 * const tableOptions: TableOptionsIf = { ...new TableOptions(), defaultRowHeights: new DefaultRowHeights(40, 30, 36) };
 *
 * @category Options
 */
export class DefaultRowHeights implements DefaultRowHeightsIf {
  constructor(
    /** Height of header rows in px. */
    public header: number = 34,
    /** Height of body rows in px. */
    public body: number = 34,
    /** Height of footer rows in px. */
    public footer: number = 34
  ) {
  }
}
