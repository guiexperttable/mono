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
    this.tableScope.hostElement.addEventListener("input", this.onHostElementInput.bind(this),
      { signal: this.tableScope.listenerAbortController.signal });
    this.tableScope.hostElement.addEventListener("focusout", this.onHostElementFocusOut.bind(this),
      { signal: this.tableScope.listenerAbortController.signal });
  }

  /**
   * A restored in-cell editor (its text was put back after a repaint, see {@link RenderScope.setEditorDraft}) fires
   * no "change" for that text – it is committed when the focus leaves it (not when a repaint removes it).
   */
  private onHostElementFocusOut(event: FocusEvent) {
    const editor = event.target;
    if (editor instanceof HTMLInputElement && editor.isConnected && editor.getAttribute("data-ge-restored") === "true"
      && this.tableScope.getInCellEditorCell?.()) {
      this.commitInCellEditor(editor);
    }
  }

  private commitInCellEditor(editor: HTMLInputElement) {
    const rowIndex = Number(editor.getAttribute("data-row-index"));
    const columnIndex = Number(editor.getAttribute("data-col-index"));
    this.tableScope.updateModelValueAfterEdit("body", rowIndex, columnIndex, editor.value);
  }

  /** Text typed into the in-cell editor: remembered, so that a repaint (scrolling, live data) keeps it (since 1.1.99). */
  private onHostElementInput(event: Event) {
    const editor = event.target;
    if (!this.tableScope.isEditing() || !(editor instanceof HTMLInputElement || editor instanceof HTMLTextAreaElement)
      || editor.getAttribute("data-area") !== "body") {
      return;
    }
    const rowIndex = Number(editor.getAttribute("data-row-index"));
    const columnIndex = Number(editor.getAttribute("data-col-index"));
    this.tableScope.setEditorDraft(rowIndex, columnIndex, editor);
  }

  /** Escape in the cell editor cancels the editing: the old value stays, nothing is committed. */
  private onHostElementKeyDown(event: KeyboardEvent) {
    if (this.tableScope.isEventInDetail?.(event) || !this.tableScope.isEditing()) {
      return;
    }
    const target = event.target;
    if (event.key === "Enter" && !event.isComposing && event.keyCode !== 229 && target instanceof HTMLInputElement
      && target.getAttribute("data-area") === "body" && target.getAttribute("data-ge-restored") === "true") {
      event.preventDefault();
      this.commitInCellEditor(target); // a restored text fires no "change" (since 1.1.99)
      return;
    }
    if (event.key !== "Escape") {
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

      const cellEditor = htmpInputEle.classList.contains("ge-table-cell-editor-input")
        || htmpInputEle.classList.contains("ge-table-cell-editor-select");
      if (cellEditor && !this.tableScope.getInCellEditorCell?.()) {
        return; // the editor was closed already (committed on Enter / focus loss, or cancelled)
      }
      if (areaIdentStr && rowIndexStr && columnIndexStr) {
        const area: AreaIdent = getAreaIdentByString(areaIdentStr);
        const rowIndex = Number(rowIndexStr);
        const columnIndex = Number(columnIndexStr);
        this.tableScope.updateModelValueAfterEdit(area, rowIndex, columnIndex, htmpInputEle.value);
      }
    }
  }


}
