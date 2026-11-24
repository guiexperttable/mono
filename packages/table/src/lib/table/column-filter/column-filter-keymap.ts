import type { ShortcutActionIdMapping } from "../action/shortcut-actionid-mapping.type";

/**
 * Keyboard shortcuts for built-in column filtering ({@link TableOptionsIf.filterRow} /
 * {@link TableOptionsIf.columnFilterMenu}) – applied as a layer over the system mapping only when one of those
 * options is enabled; `tableOptions.shortcutActionIdMapping` still overrides it.
 *
 * @param {boolean} mac - macOS keys (`⌘+Shift+F` instead of `Ctrl+Shift+F`)
 * @returns {ShortcutActionIdMapping} the layer
 *
 * @example
 * columnFilterShortcutLayer(false)["ctrl+shift+f"]; // "FOCUS_COLUMN_FILTER"
 *
 * @category Sorting & filtering
 * @since 1.1.114
 */
export function columnFilterShortcutLayer(mac: boolean): ShortcutActionIdMapping {
  if (mac) {
    return {
      "meta+shift+f": "FOCUS_COLUMN_FILTER",
      "alt+arrowdown": "OPEN_COLUMN_FILTER_MENU",
    };
  }
  return {
    "ctrl+shift+f": "FOCUS_COLUMN_FILTER",
    "alt+arrowdown": "OPEN_COLUMN_FILTER_MENU",
  };
}
