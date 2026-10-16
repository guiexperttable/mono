import type { RowDragOptionsIf } from "./row-drag-options.if";

/**
 * The defaults of {@link RowDragOptionsIf}.
 *
 * @example
 * const options = RowDragOptions.create({ managed: false });
 * options.autoScrollZoneInPx;   // 40
 *
 * @category Row drag
 * @since 1.1.95
 */
export class RowDragOptions implements RowDragOptionsIf {
  managed = true;
  multiRow = true;
  treeDropInside = true;
  dragThresholdInPx = 4;
  autoScrollZoneInPx = 40;
  autoScrollMaxSpeedInPx = 24;
  ghostText?: (rows: any[]) => string = undefined;

  /**
   * The defaults, overridden by the given values (`undefined` keeps the default).
   *
   * @param {Partial<RowDragOptionsIf>} [options] - e.g. `tableOptions.rowDragOptions`
   * @returns {RowDragOptionsIf} complete options
   */
  static create(options?: Partial<RowDragOptionsIf>): RowDragOptionsIf {
    const ret = new RowDragOptions();
    for (const [key, value] of Object.entries(options ?? {})) {
      if (value !== undefined) {
        (ret as any)[key] = value;
      }
    }
    return ret;
  }
}
