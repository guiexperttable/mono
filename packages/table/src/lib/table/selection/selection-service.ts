import { GeMouseEvent } from "../data/common/event/ge-mouse-event";
import { TableScope } from "../table-scope";
import { GetT } from "../data/common/get-t";
import { SelectionModelIf } from "./selection-model.if";
import { FocusModelIf } from "../focus/focus-model.if";
import { CellRange } from "../data/common/cell-range";
import { OnActionTriggeredIf } from "../action/on-action-triggered.if";
import { ActionId } from "../action/action-id.type";


/** @category Internals */
export class SelectionService implements OnActionTriggeredIf {

  getSelectionModel?: GetT<SelectionModelIf>;
  getFocusModel?: GetT<FocusModelIf>;
  protected previousEvt?: GeMouseEvent;
  /** A drag selection ends with a click on another cell – that click must not clear the new range. */
  protected ignoreNextClick = false;


  constructor(
    protected readonly tableScope: TableScope
  ) {
    // the table scope knows the models of this table (own defaults if the options don't set them)
    this.getSelectionModel = () => this.tableScope.selectionModel()!;
    this.getFocusModel = () => this.tableScope.focusModel()!;
  }


  /**
   * Called on mouse down: a new gesture starts.
   */
  onMouseDown(): void {
    this.ignoreNextClick = false;
  }

  /**
   * Selects a range by dragging the mouse over body cells (selection type "range").
   * The cell where the drag started stays the anchor, so a following shift-click extends from there.
   *
   * @param {GeMouseEvent} evt - the current mouse position
   * @param {GeMouseEvent} startEvt - the mouse down event that started the drag
   * @returns {boolean} true if the selection changed (repaint needed)
   */
  onMouseDragging(evt: GeMouseEvent, startEvt: GeMouseEvent | undefined): boolean {
    if (!startEvt || startEvt.action || startEvt.areaIdent !== 'body' || evt.areaIdent !== 'body') return false;
    if (startEvt.rowIndex < 0 || startEvt.columnIndex < 0 || evt.rowIndex < 0 || evt.columnIndex < 0) return false;
    const sm = this.getSelectionModel?.();
    if (!sm || !('selectionType' in sm) || sm.selectionType !== 'range') return false;

    sm.clear();
    sm.addSelection(this.createRangeByEvents(evt, startEvt));
    const fm = this.getFocusModel?.();
    if (fm && !fm.hasFocus(startEvt.rowIndex, startEvt.columnIndex)) {
      fm.setFocus(startEvt.rowIndex, startEvt.columnIndex); // fires onFocusChanged (TableScope listens to the model)
    }
    this.previousEvt = startEvt.clone();
    this.ignoreNextClick = evt.rowIndex !== startEvt.rowIndex || evt.columnIndex !== startEvt.columnIndex;
    this.tableScope.onSelectionChanged(sm);
    return true;
  }

  /**
   * Moves the focus to the clicked cell and changes the selection:
   *
   * - click: a new selection – the old one is cleared; type `"row"`/`"column"` selects the clicked row/column.
   * - Shift+click: adds the range from the previous click (the anchor) to this cell; the anchor is used up.
   * - ⌘/Ctrl+click: toggles the clicked cell (row/column for those types) and keeps the rest of the selection.
   *   In mode `"single"` the model keeps one range only, so a newly selected cell replaces the selection.
   * - ⌘/Ctrl+Alt+click: removes the clicked cell from the selection.
   *
   * Every click without Shift becomes the anchor of the next Shift+click.
   * `onFocusChanged` is fired by the focus model itself (TableScope listens to it) – once per focus change.
   *
   * @param {GeMouseEvent} evt - the click
   * @param {GeMouseEvent | undefined} _previousEvt - not used (the service keeps its own anchor)
   * @returns {boolean} true if focus or selection may have changed (repaint needed)
   */
  onMouseClicked(evt: GeMouseEvent, _previousEvt: GeMouseEvent | undefined): boolean {
    if (this.ignoreNextClick) {
      this.ignoreNextClick = false;
      return false;
    }
    let dirty = false;
    let deletePreviousEvent = false;

    if (this.getSelectionModel && this.getFocusModel) {
      const sm = this.getSelectionModel();
      const fm = this.getFocusModel();
      if (sm && fm) {

        // Focus (the model fires onFocusChanged):
        if (!fm.hasFocus(evt.rowIndex, evt.columnIndex)) {
          fm.setFocus(evt.rowIndex, evt.columnIndex);
          dirty = true;
        }

        // Selection:
        const shiftKey = !!evt.originalEvent?.shiftKey;
        const ctrlKey = !!(evt.originalEvent?.ctrlKey || evt.originalEvent?.metaKey);
        const altKey = !!evt.originalEvent?.altKey;

        if (shiftKey && this.previousEvt) {
          sm.addSelection(this.createRangeByEvents(evt, this.previousEvt));
          deletePreviousEvent = true;

        } else if (ctrlKey && altKey) {
          sm.removeSelection(CellRange.singleCell(evt.rowIndex, evt.columnIndex));

        } else if (ctrlKey) {
          sm.togglePoint(evt.rowIndex, evt.columnIndex);

        } else {
          // no special key (or Shift without anchor): a new selection.
          // for selection type  'row' and 'column' we have to select the current row (or column):
          if (!shiftKey && sm.hasSelection()) {
            sm.clear();
          }
          sm.firstClick(evt.rowIndex, evt.columnIndex);
        }
        dirty = true;
        this.tableScope.onSelectionChanged(sm);
      }
    }
    if (deletePreviousEvent) {
      this.previousEvt = undefined;
    } else {
      this.previousEvt = evt?.clone();
    }
    return dirty;
  }

  onActionTriggered(actionId: ActionId): boolean {
    if (this.getSelectionModel && this.getFocusModel) {
      const sm = this.getSelectionModel();
      const fm = this.getFocusModel();
      if (sm && fm) {
        if (actionId === "SELECT_ALL") {
          sm.selectAll();
          this.tableScope.repaint();
          return true;
        }
        if (actionId === "DESELECT_ALL") {
          sm.clear();
          this.tableScope.repaint();
          return true;
        }
        if (actionId === "TOGGLE_SELECTION") {
          const [row, col] = fm.getFocus();
          sm.togglePoint(row, col);
          this.tableScope.repaint();
          return true;
        }
      }
    }
    return false;
  }


  private createRangeByEvents(evt: GeMouseEvent, previousEvt?: GeMouseEvent) {
    if (!previousEvt) {
      previousEvt = evt;
    }
    const r1 = Math.min(evt.rowIndex, previousEvt?.rowIndex);
    const r2 = Math.max(evt.rowIndex, previousEvt?.rowIndex);
    const c1 = Math.min(evt.columnIndex, previousEvt?.columnIndex);
    const c2 = Math.max(evt.columnIndex, previousEvt?.columnIndex);
    return CellRange.create({
      rowIndex1: r1,
      columnIndex1: c1,
      rowIndex2: r2,
      columnIndex2: c2
    });
  }

}
