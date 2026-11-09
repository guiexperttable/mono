import type { ColumnAutoWidthOptionsIf } from "./column-auto-width-options.if";

/**
 * The defaults of {@link ColumnAutoWidthOptionsIf}: double click on, all body rows up to 10 000, no own measurement.
 *
 * @example
 * const options = ColumnAutoWidthOptions.create({ maxRows: 1_000 });
 * console.log(options.doubleClick, options.maxRows); // true 1000
 *
 * @category Column drag
 * @since 1.1.110
 */
export class ColumnAutoWidthOptions implements ColumnAutoWidthOptionsIf {
  doubleClick = true;
  maxRows = 10_000;
  getWidth?: ColumnAutoWidthOptionsIf["getWidth"];

  /**
   * The defaults merged with `options` (`tableOptions.columnAutoWidth`).
   *
   * @param {Partial<ColumnAutoWidthOptionsIf>} [options] - own values
   * @returns {ColumnAutoWidthOptionsIf} complete options
   */
  static create(options?: Partial<ColumnAutoWidthOptionsIf>): ColumnAutoWidthOptionsIf {
    return { ...new ColumnAutoWidthOptions(), ...(options ?? {}) };
  }
}
