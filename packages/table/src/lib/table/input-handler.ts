import { TableScope } from "./table-scope";
import { AreaIdent, getAreaIdentByString } from "./data/tablemodel/area-ident.type";

/**
 * Class representing an input handler for table input fields (HTMLSelectElement, HTMLTextAreaElement, HTMLInputElement).
 *
 * @class
 * @memberOf module:input
 *
 * @category Internals
 */
export class InputHandler {


  constructor(
    protected tableScope: TableScope
  ) {
    this.tableScope.hostElement.addEventListener("change", this.onHostElementChanged.bind(this),
      { signal: this.tableScope.listenerAbortController.signal });
    this.tableScope.hostElement.addEventListener("keydown", this.onHostElementKeyDown.bind(this),
      { signal: this.tableScope.listenerAbortController.signal });
  }

  /** Escape in the cell editor cancels the editing: the old value stays, nothing is committed. */
  private onHostElementKeyDown(event: KeyboardEvent) {
    if (this.tableScope.isEventInDetail?.(event) || event.key !== "Escape" || !this.tableScope.isEditing()) {
      return;
    }
    const editor = event.target;
    if ((editor instanceof HTMLInputElement || editor instanceof HTMLSelectElement || editor instanceof HTMLTextAreaElement)
      && editor.getAttribute("data-area") === "body") {
      event.preventDefault();  // e.g. a surrounding <dialog> must not close
      event.stopPropagation();
      this.tableScope.cancelEditing(editor);
    }
  }


  /**
   * Handles the onHostElementChanged event.
   * In case that the element is an input field, the tableScope.updateModelValueAfterEdit() method is triggered.
   *
   * @param {Event} event - The event object.
   *
   * @return {void}
   */
  private onHostElementChanged(event: Event) {
    if (this.tableScope.isEventInDetail?.(event)) {
      return; // an input in a detail row (master/detail) – not a cell editor of this table
    }
    if (event.target instanceof HTMLInputElement
      || event.target instanceof HTMLSelectElement
      || event.target instanceof HTMLTextAreaElement
    ) {
      const htmpInputEle = event.target;
      const areaIdentStr = htmpInputEle.getAttribute("data-area");
      const rowIndexStr = htmpInputEle.getAttribute("data-row-index");
      const columnIndexStr = htmpInputEle.getAttribute("data-col-index");

      if (areaIdentStr && rowIndexStr && columnIndexStr) {
        const area: AreaIdent = getAreaIdentByString(areaIdentStr);
        const rowIndex = Number(rowIndexStr);
        const columnIndex = Number(columnIndexStr);
        this.tableScope.updateModelValueAfterEdit(area, rowIndex, columnIndex, htmpInputEle.value);
      }
    }
  }


}
