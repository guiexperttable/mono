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

  // since 1.1.99 (Excel-style editing – used only with tableOptions.editing):
  "NAVIGATE_NEXT_CELL",          // Tab: commit and next shown column (not used in the last column: the focus leaves)
  "NAVIGATE_PREVIOUS_CELL",      // Shift+Tab
  "EXTEND_SELECTION_UP",         // Shift+↑: the selected range grows from the active cell
  "EXTEND_SELECTION_DOWN",       // Shift+↓
  "EXTEND_SELECTION_LEFT",       // Shift+←
  "EXTEND_SELECTION_RIGHT",      // Shift+→
  "EXTEND_SELECTION_ROW_START",  // Shift+Home
  "EXTEND_SELECTION_ROW_END",    // Shift+End
  "EXTEND_SELECTION_PAGE_UP",    // Shift+Page Up
  "EXTEND_SELECTION_PAGE_DOWN",  // Shift+Page Down
  "NAVIGATE_DATA_EDGE_UP",       // Ctrl+↑ (macOS ⌘+↑): edge of the data block
  "NAVIGATE_DATA_EDGE_DOWN",     // Ctrl+↓
  "NAVIGATE_DATA_EDGE_LEFT",     // Ctrl+←
  "NAVIGATE_DATA_EDGE_RIGHT",    // Ctrl+→
  "EXTEND_TO_DATA_EDGE_UP",      // Ctrl+Shift+↑ (macOS ⌘+Shift+↑)
  "EXTEND_TO_DATA_EDGE_DOWN",    // Ctrl+Shift+↓
  "EXTEND_TO_DATA_EDGE_LEFT",    // Ctrl+Shift+←
  "EXTEND_TO_DATA_EDGE_RIGHT",   // Ctrl+Shift+→
  "SELECT_ROW",                  // Shift+Space: the rows of the active cell
  "SELECT_COLUMN",               // Ctrl+Space: the columns of the active cell
  "CLEAR_CELLS",                 // Delete: clear the selected cells
  "CLEAR_AND_EDIT",              // Backspace: clear the active cell and open the editor (a range: like Delete)
  // copy, cut and paste (tableOptions.clipboard, since 1.1.99)
  "CUT_2_CLIPBOARD",             // Ctrl/⌘+X: copy and mark the cells, they move on the next paste
  "PASTE_FROM_CLIPBOARD",        // Ctrl/⌘+V: paste from the anchor (tiled over a selected range)
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

