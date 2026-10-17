import type { EditingOptionsIf } from "./editing-options.if";

/**
 * The defaults of {@link EditingOptionsIf} (Excel-style editing, {@link TableOptionsIf.editing}).
 *
 * @example
 * const options = EditingOptions.create(true);
 * options?.enterKey;   // "edit"
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export class EditingOptions implements EditingOptionsIf {
  startOnType = true;
  enterKey: "edit" | "moveDown" = "edit";
  enterMoves: "down" | "right" | "none" = "down";
  tabMoves = true;
  arrowKeysCommit = true;
  textSelection: "all" | "end" = "all";
  clearKeys = true;
  ctrlEnterFillsSelection = true;
  collapseSelectionOnNavigate = true;
  emptyValue: unknown = "";
  defaultEditable = false;
  maxClearCells = 1_000_000;

  /**
   * The options of {@link TableOptionsIf.editing}: `undefined`/`false` = off, `true` = the defaults, an object = the
   * defaults overridden by its values (`undefined` keeps the default).
   *
   * @param {boolean | Partial<EditingOptionsIf>} [option] - `tableOptions.editing`
   * @returns {EditingOptionsIf | undefined} complete options, `undefined` if Excel-style editing is off
   */
  static create(option?: boolean | Partial<EditingOptionsIf>): EditingOptionsIf | undefined {
    if (!option) {
      return undefined;
    }
    const ret = new EditingOptions();
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
