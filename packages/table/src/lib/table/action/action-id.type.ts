/**
 * An array of action identifiers.
 *
 * @type {ReadonlyArray<string>}
 *
 * @category Keyboard
 */
export const actionIds = [
  "COPY_2_CLIPBOARD",

  "START_EDITING",

  "TOGGLE_SELECTION",
  "SELECT_ALL",
  "DESELECT_ALL",

  "NAVIGATE_LEFT",
  "NAVIGATE_RIGHT",
  "NAVIGATE_UP",
  "NAVIGATE_DOWN",

  // since 1.1.91 (keyboard navigation of the WAI-ARIA grid pattern):
  "NAVIGATE_ROW_START",   // Home: first shown column of the row
  "NAVIGATE_ROW_END",     // End: last shown column of the row
  "NAVIGATE_FIRST_CELL",  // Ctrl+Home: first cell of the first row
  "NAVIGATE_LAST_CELL",   // Ctrl+End: last cell of the last row
  "NAVIGATE_PAGE_UP",     // Page Up: one page up
  "NAVIGATE_PAGE_DOWN",   // Page Down: one page down
  "ACTIVATE_CELL",        // Enter: toggle checkbox / tree node (body), header group / sort (header)

  // since 1.1.95 (row drag, keyboard alternative):
  "MOVE_ROW_UP",          // Ctrl+Alt+Up: move the focused row (or the selected rows) one position up
  "MOVE_ROW_DOWN",        // Ctrl+Alt+Down: one position down

  // since 1.1.96 (fill handle, keyboard alternative – used only with tableOptions.fillHandle and a selected range):
  "FILL_DOWN",            // Ctrl/⌘+D: the top row of the selected range is copied down (one row: the cell above)
  "FILL_RIGHT",           // Ctrl/⌘+R: the left column is copied right (one column: the cell left of it)
] as const;

/**
 * Represents an action ID.
 *
 * @typedef {string} ActionId
 * @memberof module:myModule
 * @see module:myModule.actionIds
 *
 * @category Keyboard
 */
export type ActionId = typeof actionIds[number];

