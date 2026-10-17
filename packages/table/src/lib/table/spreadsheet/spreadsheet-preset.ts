import type { TableOptionsIf } from "../data/options/table-options.if";
import type { SpreadsheetOptionsIf } from "./spreadsheet-options.if";

type PresetKey = keyof SpreadsheetOptionsIf;

/**
 * The value of one part of the preset `tableOptions.spreadsheet` for a table: the option itself if the options set it,
 * otherwise the preset's part (`true` by default, `editing` with `defaultEditable: true`). Without the preset: the
 * option. The options object is never changed (it may be shared by several tables or frozen).
 *
 * @param {TableOptionsIf} tableOptions - the options of a table
 * @param {PresetKey} key - `editing`, `clipboard`, `undo`, `cellFormulas` or `fillHandle`
 * @returns {unknown} the effective value
 *
 * @example
 * spreadsheetOption({ ...new TableOptions(), spreadsheet: true }, "undo");   // true
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export function spreadsheetOption<K extends PresetKey>(tableOptions: TableOptionsIf | undefined, key: K): TableOptionsIf[K] {
  const own = tableOptions?.[key];
  const preset = tableOptions?.spreadsheet;
  if (own !== undefined || !preset) {
    return own;
  }
  const part = typeof preset === "object" ? preset[key] : undefined;
  if (part === false) {
    return undefined;
  }
  if (key === "editing") {
    // columns without an own `editable` are editable
    return { defaultEditable: true, ...(typeof part === "object" ? part : {}) } as TableOptionsIf[K];
  }
  return (part ?? true) as TableOptionsIf[K];
}

/**
 * The options a table uses with the preset `tableOptions.spreadsheet`: a **copy** with every part of
 * {@link SpreadsheetOptionsIf} the options don't set themselves (`editing`, `clipboard`, `undo`, `cellFormulas`,
 * `fillHandle`). The table resolves the preset itself; use this to see the result.
 *
 * @param {TableOptionsIf} tableOptions - the options of a table
 * @returns {TableOptionsIf} a copy (the same object without the preset)
 *
 * @example
 * const options = applySpreadsheetPreset({ ...new TableOptions(), spreadsheet: true });
 * options.undo;   // true
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export function applySpreadsheetPreset(tableOptions: TableOptionsIf): TableOptionsIf {
  if (!tableOptions?.spreadsheet) {
    return tableOptions;
  }
  const ret: TableOptionsIf = { ...tableOptions };
  for (const key of ["editing", "clipboard", "undo", "cellFormulas", "fillHandle"] as const) {
    (ret as Record<PresetKey, unknown>)[key] = spreadsheetOption(tableOptions, key);
  }
  return ret;
}
