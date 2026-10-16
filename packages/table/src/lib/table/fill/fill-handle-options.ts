import type { FillHandleOptionsIf } from "./fill-handle-options.if";
import type { FillValueContextIf } from "./fill-value-context.if";

/**
 * The defaults of {@link FillHandleOptionsIf}.
 *
 * @example
 * const options = FillHandleOptions.create(true);
 * options?.direction;   // "both"
 *
 * @category Fill handle & batch edit
 * @since 1.1.96
 */
export class FillHandleOptions implements FillHandleOptionsIf {
  direction: "vertical" | "horizontal" | "both" = "both";
  fillValue?: (ctx: FillValueContextIf) => unknown = undefined;
  maxCells = 100_000;
  dragThresholdInPx = 3;
  autoScrollZoneInPx = 40;
  autoScrollMaxSpeedInPx = 24;

  /**
   * The options of {@link TableOptionsIf.fillHandle}: `undefined`/`false` = no fill handle, `true` = the defaults, an
   * object = the defaults overridden by its values (`undefined` keeps the default).
   *
   * @param {boolean | Partial<FillHandleOptionsIf>} [option] - `tableOptions.fillHandle`
   * @returns {FillHandleOptionsIf | undefined} complete options, `undefined` if the fill handle is off
   */
  static create(option?: boolean | Partial<FillHandleOptionsIf>): FillHandleOptionsIf | undefined {
    if (!option) {
      return undefined;
    }
    const ret = new FillHandleOptions();
    if (typeof option === "object") {
      for (const [key, value] of Object.entries(option)) {
        if (value !== undefined) {
          (ret as any)[key] = value;
        }
      }
    }
    return ret;
  }
}
