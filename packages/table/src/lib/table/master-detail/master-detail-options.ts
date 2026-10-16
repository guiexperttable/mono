import type { DetailHeightType, MasterDetailOptionsIf } from "./master-detail-options.if";
import type { DetailRendererIf, DetailRenderFnType } from "./detail-renderer.if";

/**
 * The defaults of {@link MasterDetailOptionsIf}.
 *
 * @example
 * const options = MasterDetailOptions.create({ detailRenderer: (el, row) => { el.textContent = String(row.id); } });
 * options.detailHeight;          // "auto"
 * options.maxRenderedDetails;    // 50
 *
 * @category Master/detail
 * @since 1.1.97
 */
export class MasterDetailOptions<T = any> implements MasterDetailOptionsIf<T> {
  detailRenderer: DetailRendererIf<T> | DetailRenderFnType<T> = () => undefined;
  isMaster?: (row: T, rowIndex: number) => boolean = undefined;
  detailHeight: DetailHeightType | ((row: T, rowIndex: number) => DetailHeightType) = "auto";
  estimatedDetailHeight = 200;
  toggleColumn?: number | string = undefined;
  maxRenderedDetails = 50;
  getRowId?: (row: T) => string | number = undefined;

  /**
   * The defaults, overridden by the given values (`undefined` keeps the default).
   *
   * @param {Partial<MasterDetailOptionsIf>} [options] - e.g. `tableOptions.masterDetail`
   * @returns {MasterDetailOptionsIf} complete options
   */
  static create<T = any>(options?: Partial<MasterDetailOptionsIf<T>>): MasterDetailOptionsIf<T> {
    const ret = new MasterDetailOptions<T>();
    for (const [key, value] of Object.entries(options ?? {})) {
      if (value !== undefined) {
        (ret as any)[key] = value;
      }
    }
    return ret;
  }
}
