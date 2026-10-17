import type { FormulaFunction } from "../formula/formula-options.if";
import type { CellFormulaOptionsIf } from "./cell-formula-options.if";

/**
 * The defaults of {@link CellFormulaOptionsIf} (cell formulas).
 *
 * @example
 * CellFormulaOptions.create(true)?.maxRangeCells;   // 10000000
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export class CellFormulaOptions implements CellFormulaOptionsIf {
  functions: Record<string, FormulaFunction> = {};
  isoDatesAsDates = true;
  maxRangeCells = 10_000_000;
  rejectInvalidFormulas = false;
  columns?: string[] = undefined;

  /**
   * The options of {@link TableOptionsIf.cellFormulas}: `undefined`/`false` = off, `true` = the defaults, an object =
   * the defaults overridden by its values (`undefined` keeps the default).
   *
   * @param {boolean | Partial<CellFormulaOptionsIf>} [option] - the option
   * @returns {CellFormulaOptionsIf | undefined} complete options, `undefined` if off
   */
  static create(option?: boolean | Partial<CellFormulaOptionsIf>): CellFormulaOptionsIf | undefined {
    if (!option) {
      return undefined;
    }
    const ret = new CellFormulaOptions();
    if (typeof option === "object") {
      for (const [key, value] of Object.entries(option)) {
        if (value !== undefined && key in ret) {
          (ret as unknown as Record<string, unknown>)[key] = value;
        }
      }
    }
    return ret;
  }
}
