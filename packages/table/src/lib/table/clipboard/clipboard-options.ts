import type { ClipboardOptionsIf, CopyContextIf, PasteContextIf } from "./clipboard-options.if";

/**
 * The defaults of {@link ClipboardOptionsIf} (copy, cut and paste, {@link TableOptionsIf.clipboard}).
 *
 * @example
 * const options = ClipboardOptions.create({ copyHeaders: true });
 * options?.html;   // true
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export class ClipboardOptions implements ClipboardOptionsIf {
  copyHeaders = false;
  copyValue: "text" | "raw" = "text";
  html = true;
  pasteAddsRows = false;
  createRow?: (index: number) => unknown = undefined;
  maxPasteCells = 1_000_000;
  processCopy?: (ctx: CopyContextIf) => string[][] | void = undefined;
  processPaste?: (ctx: PasteContextIf) => unknown[][] | false | void = undefined;

  /**
   * The options of {@link TableOptionsIf.clipboard}: `undefined`/`false` = off, `true` = the defaults, an object = the
   * defaults overridden by its values (`undefined` keeps the default).
   *
   * @param {boolean | Partial<ClipboardOptionsIf>} [option] - `tableOptions.clipboard`
   * @returns {ClipboardOptionsIf | undefined} complete options, `undefined` if the option is off
   */
  static create(option?: boolean | Partial<ClipboardOptionsIf>): ClipboardOptionsIf | undefined {
    if (!option) {
      return undefined;
    }
    const ret = new ClipboardOptions();
    if (typeof option === "object") {
      for (const [key, value] of Object.entries(option)) {
        if (value !== undefined) {
          (ret as unknown as Record<string, unknown>)[key] = value;
        }
      }
    }
    return ret;
  }
}
