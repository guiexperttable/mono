import { ActionId } from "./action-id.type";

/**
 * Class representing a mapping of Windows shortcut keys to action IDs.
 *
 * Use 'meta' for the MacOS 'cmd' key.
 *
 * @category Keyboard
 */
export class WindowsShortcutActionIdMapping {

  get(): { [key: string]: ActionId } {
    return {
      "f2": "START_EDITING",

      "space": "TOGGLE_SELECTION",

      "ctrl+num_add": "SELECT_ALL",
      "ctrl+a": "SELECT_ALL",

      "ctrl+shift+a": "DESELECT_ALL",
      "ctrl+x": "DESELECT_ALL",
      "ctrl+num_subtract": "DESELECT_ALL",

      "meta -": "DESELECT_ALL",

      "arrowup": "NAVIGATE_UP",
      "arrowdown": "NAVIGATE_DOWN",
      "arrowleft": "NAVIGATE_LEFT",
      "arrowright": "NAVIGATE_RIGHT",

      "home": "NAVIGATE_ROW_START",
      "end": "NAVIGATE_ROW_END",
      "ctrl+home": "NAVIGATE_FIRST_CELL",
      "ctrl+end": "NAVIGATE_LAST_CELL",
      "pageup": "NAVIGATE_PAGE_UP",
      "pagedown": "NAVIGATE_PAGE_DOWN",
      "enter": "ACTIVATE_CELL",
      "ctrl+alt+up": "MOVE_ROW_UP",
      "ctrl+alt+down": "MOVE_ROW_DOWN",

      "meta+c": "COPY_2_CLIPBOARD",
      "ctrl+c": "COPY_2_CLIPBOARD",
    };
  }

}
