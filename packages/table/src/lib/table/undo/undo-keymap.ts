import type { ShortcutActionIdMapping } from "../action/shortcut-actionid-mapping.type";

/**
 * The keys of undo and redo ({@link TableOptionsIf.undo}) – a layer over the system mapping that the table only uses
 * with the option; `tableOptions.shortcutActionIdMapping` still overrides it. In an open editor the keys belong to
 * the editor (the browser's text undo).
 *
 * @param {boolean} mac - macOS keys (⌘+Z, ⌘+Shift+Z)
 * @returns {ShortcutActionIdMapping} the layer
 *
 * @example
 * undoShortcutLayer(false)["ctrl+y"];   // "REDO"
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export function undoShortcutLayer(mac: boolean): ShortcutActionIdMapping {
  if (mac) {
    return { "meta+z": "UNDO", "meta+shift+z": "REDO" };
  }
  return { "ctrl+z": "UNDO", "ctrl+y": "REDO", "ctrl+shift+z": "REDO" };
}
