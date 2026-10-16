import type { ShortcutActionIdMapping } from "../action/shortcut-actionid-mapping.type";

/**
 * The keys of copy, cut and paste ({@link TableOptionsIf.clipboard}) – a layer over the system mapping that the table
 * only uses with the option; `tableOptions.shortcutActionIdMapping` still overrides it. Ctrl/⌘+X cuts (in the system
 * mapping it is `DESELECT_ALL`, which stays on Ctrl/⌘+Shift+A); Windows also knows Ctrl+Insert, Shift+Delete and
 * Shift+Insert.
 *
 * @param {boolean} mac - macOS keys (⌘)
 * @returns {ShortcutActionIdMapping} the layer
 *
 * @example
 * clipboardShortcutLayer(false)["ctrl+v"];   // "PASTE_FROM_CLIPBOARD"
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export function clipboardShortcutLayer(mac: boolean): ShortcutActionIdMapping {
  if (mac) {
    return {
      "meta+c": "COPY_2_CLIPBOARD",
      "meta+x": "CUT_2_CLIPBOARD",
      "meta+v": "PASTE_FROM_CLIPBOARD",
    };
  }
  return {
    "ctrl+c": "COPY_2_CLIPBOARD",
    "ctrl+x": "CUT_2_CLIPBOARD",
    "ctrl+v": "PASTE_FROM_CLIPBOARD",
    "ctrl+insert": "COPY_2_CLIPBOARD",
    "shift+delete": "CUT_2_CLIPBOARD",
    "shift+insert": "PASTE_FROM_CLIPBOARD",
  };
}
