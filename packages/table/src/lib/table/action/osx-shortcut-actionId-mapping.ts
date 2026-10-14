import { ActionId } from "./action-id.type";

/**
 * Class representing the mapping of OS X shortcut actions to action IDs.
 *
 * Use 'meta' for the MacOS 'cmd' key.
 *
 * @class OsxShortcutActionIdMapping
 *
 * @category Keyboard
 */
export class OsxShortcutActionIdMapping {

  get(): { [key: string]: ActionId } {
    return {
      "f2": "START_EDITING",

      "space": "TOGGLE_SELECTION",

      "ctrl+num_add": "SELECT_ALL",
      "meta+a": "SELECT_ALL",
      "ctrl+a": "SELECT_ALL",

      "meta+x": "DESELECT_ALL",
      "meta+shift+a": "DESELECT_ALL",
      "ctrl+shift+a": "DESELECT_ALL",
      "ctrl+num_subtract": "DESELECT_ALL",
      "ctrl -": "DESELECT_ALL",

      "arrowup": "NAVIGATE_UP",
      "arrowdown": "NAVIGATE_DOWN",
      "arrowleft": "NAVIGATE_LEFT",
      "arrowright": "NAVIGATE_RIGHT",

      "home": "NAVIGATE_ROW_START",
      "end": "NAVIGATE_ROW_END",
      "meta+left": "NAVIGATE_ROW_START",
      "meta+right": "NAVIGATE_ROW_END",
      "ctrl+home": "NAVIGATE_FIRST_CELL",
      "ctrl+end": "NAVIGATE_LAST_CELL",
      "meta+up": "NAVIGATE_FIRST_CELL",
      "meta+down": "NAVIGATE_LAST_CELL",
      "pageup": "NAVIGATE_PAGE_UP",
      "pagedown": "NAVIGATE_PAGE_DOWN",
      "enter": "ACTIVATE_CELL",

      "meta+c": "COPY_2_CLIPBOARD",
      "ctrl+c": "COPY_2_CLIPBOARD",
    };
  }


}
