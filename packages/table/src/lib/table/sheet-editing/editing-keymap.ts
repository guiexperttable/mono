import type { ShortcutActionIdMapping } from "../action/shortcut-actionid-mapping.type";

/**
 * The keys of Excel-style editing ({@link TableOptionsIf.editing}) – a layer over the system mapping that the
 * table only uses with the option; `tableOptions.shortcutActionIdMapping` still overrides it. Typing, F2, Enter,
 * Escape and Ctrl/⌘+Enter are handled by the editor itself.
 *
 * @param {boolean} mac - macOS keys (⌘ instead of Ctrl for the data edge – ⌃+arrows belong to macOS Spaces)
 * @returns {ShortcutActionIdMapping} the layer
 *
 * @example
 * editingShortcutLayer(false)["ctrl+down"];   // "NAVIGATE_DATA_EDGE_DOWN"
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export function editingShortcutLayer(mac: boolean): ShortcutActionIdMapping {
  const edge = mac ? "meta" : "ctrl";
  return {
    "tab": "NAVIGATE_NEXT_CELL",
    "shift+tab": "NAVIGATE_PREVIOUS_CELL",
    "shift+arrowup": "EXTEND_SELECTION_UP",
    "shift+arrowdown": "EXTEND_SELECTION_DOWN",
    "shift+arrowleft": "EXTEND_SELECTION_LEFT",
    "shift+arrowright": "EXTEND_SELECTION_RIGHT",
    "shift+home": "EXTEND_SELECTION_ROW_START",
    "shift+end": "EXTEND_SELECTION_ROW_END",
    "shift+pageup": "EXTEND_SELECTION_PAGE_UP",
    "shift+pagedown": "EXTEND_SELECTION_PAGE_DOWN",
    [`${edge}+arrowup`]: "NAVIGATE_DATA_EDGE_UP",
    [`${edge}+arrowdown`]: "NAVIGATE_DATA_EDGE_DOWN",
    [`${edge}+arrowleft`]: "NAVIGATE_DATA_EDGE_LEFT",
    [`${edge}+arrowright`]: "NAVIGATE_DATA_EDGE_RIGHT",
    [`${edge}+shift+arrowup`]: "EXTEND_TO_DATA_EDGE_UP",
    [`${edge}+shift+arrowdown`]: "EXTEND_TO_DATA_EDGE_DOWN",
    [`${edge}+shift+arrowleft`]: "EXTEND_TO_DATA_EDGE_LEFT",
    [`${edge}+shift+arrowright`]: "EXTEND_TO_DATA_EDGE_RIGHT",
    "shift+space": "SELECT_ROW",
    "ctrl+space": "SELECT_COLUMN",
    "delete": "CLEAR_CELLS",
    "backspace": "CLEAR_AND_EDIT",
  };
}
