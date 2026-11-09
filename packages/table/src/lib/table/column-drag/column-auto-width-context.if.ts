import type { ColumnDefIf } from "../data/tablemodel/column/column-def.if";

/**
 * What {@link ColumnAutoWidthOptionsIf.getWidth} gets to measure a column itself.
 *
 * @category Column drag
 * @since 1.1.110
 */
export interface ColumnAutoWidthContextIf {
  /** Model index of the column. */
  columnIndex: number;
  /** The column definition (`undefined` for a table model without column definitions). */
  columnDef: ColumnDefIf | undefined;
  /** The property of the column. */
  property: string | undefined;
  /** A double click on the resize handle, or a call of {@link TableApi.autoResizeColumn} / {@link TableApi.autoResizeColumns}. */
  source: "dblclick" | "api";
  /** First body row drawn now (display index). */
  firstRenderedRow: number;
  /** Last body row drawn now (display index, `-1` without rows). */
  lastRenderedRow: number;
  /**
   * Width in px a cell needs for this text: measured with the font of a rendered cell label, plus its padding (the
   * same measurement as the default).
   */
  measureText(text: string): number;
  /** The default measurement of this column (header, footer, body rows up to {@link ColumnAutoWidthOptionsIf.maxRows}). */
  getDefaultWidth(): number;
}
