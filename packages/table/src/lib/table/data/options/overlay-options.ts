import { OverlayOptionsIf } from "./overlay-options.if";
import { GeOverlayKind } from "../../overlay/ge-overlay-kind.type";

/**
 * The defaults of {@link OverlayOptionsIf}: English texts, an automatic "No rows to show", a loading overlay that
 * blocks the body and appears right away.
 *
 * @example
 * const overlayOptions = OverlayOptions.create({ noRowsText: "Keine Daten" });
 * console.log(overlayOptions.loadingText); // "Loading…"
 *
 * @since 1.1.92
 * @category Overlays
 */
export class OverlayOptions implements OverlayOptionsIf {

  loadingText = "Loading…";
  noRowsText = "No rows to show";
  noMatchesText = "No matching rows";
  autoNoRows = true;
  blockInteractionWhileLoading = true;
  loadingDelayInMs = 0;
  getOverlayElement?: (kind: GeOverlayKind, text: string) => HTMLElement | undefined = undefined;

  /**
   * The defaults with the given fields on top (`undefined` fields keep their default).
   *
   * @param {Partial<OverlayOptionsIf>} [partial] - e.g. `tableOptions.overlayOptions`
   * @returns {OverlayOptions} a new object
   */
  static create(partial?: Partial<OverlayOptionsIf>): OverlayOptions {
    const ret = new OverlayOptions();
    if (partial) {
      for (const key of Object.keys(partial) as (keyof OverlayOptionsIf)[]) {
        if (partial[key] !== undefined) {
          (ret as unknown as Record<string, unknown>)[key] = partial[key];
        }
      }
    }
    return ret;
  }
}
