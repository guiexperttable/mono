import type { UndoOptionsIf } from "./undo-options.if";

/**
 * The defaults of {@link UndoOptionsIf} (undo and redo, {@link TableOptionsIf.undo}).
 *
 * @example
 * const options = UndoOptions.create({ maxSteps: 20 });
 * options?.onConflict;   // "skip"
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export class UndoOptions implements UndoOptionsIf {
  maxSteps = 100;
  maxCells = 1_000_000;
  onConflict: "skip" | "overwrite" = "skip";
  recordApiChanges = false;

  /**
   * The options of {@link TableOptionsIf.undo}: `undefined`/`false` = off, `true` = the defaults, an object = the
   * defaults overridden by its values (`undefined` keeps the default).
   *
   * @param {boolean | Partial<UndoOptionsIf>} [option] - `tableOptions.undo`
   * @returns {UndoOptionsIf | undefined} complete options, `undefined` if undo is off
   */
  static create(option?: boolean | Partial<UndoOptionsIf>): UndoOptionsIf | undefined {
    if (!option) {
      return undefined;
    }
    const ret = new UndoOptions();
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
