import { GeMouseEvent } from "../data/common/event/ge-mouse-event";
import { AriaTextsIf } from "../aria/aria-texts.if";
import { TableScope } from "../table-scope";
import { GetT } from "../data/common/get-t";
import { SelectionModelIf } from "./selection-model.if";
import { FocusModelIf } from "../focus/focus-model.if";
import { CellRange } from "../data/common/cell-range";
import { OnActionTriggeredIf } from "../action/on-action-triggered.if";
import { ActionId } from "../action/action-id.type";
import type { SelectionModel, SelectionSnapshot } from "./selection-model";
import { isRowNumberColumnDef } from "../instanceof-workaround";


/** @category Internals */
export class SelectionService implements OnActionTriggeredIf {

  getSelectionModel?: GetT<SelectionModelIf>;
  getFocusModel?: GetT<FocusModelIf>;
  protected previousEvt?: GeMouseEvent;
  /** A drag selection ends with a click on another cell – that click must not clear the new range. */
  protected ignoreNextClick = false;
  /** The ranges the anchor click (or the last shift-click) added – the next shift-click replaces them. */
  protected anchorRanges: CellRange[] = [];
  /** The selection before a Ctrl/⌘-drag – each drag frame replaces only the dragged rectangle. */
  protected dragSnapshot?: SelectionSnapshot;


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
    this.dragSnapshot = undefined;
  }

  /**
   * Selects a range by dragging the mouse over body cells (selection type "range").
   * The cell where the drag started stays the anchor, so a following shift-click extends from there.
   * With Ctrl/⌘ held at the start the dragged range is added to the existing selection, otherwise it replaces it.
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

    this.batch(() => {
      const additive = !!(startEvt.originalEvent?.ctrlKey || startEvt.originalEvent?.metaKey);
      if (additive && SelectionService.hasSnapshots(sm)) {
        // keep the selection from before the drag, replace only the rectangle of this drag
        this.dragSnapshot = this.dragSnapshot ?? sm.createSnapshot();
        sm.restoreSnapshot(this.dragSnapshot);
      } else {
        sm.clear();
      }
      sm.addSelection(this.createRangeByEvents(evt, startEvt));
      const fm = this.getFocusModel?.();
      if (fm && !fm.hasFocus(startEvt.rowIndex, startEvt.columnIndex)) {
        fm.setFocus(startEvt.rowIndex, startEvt.columnIndex); // fires onFocusChanged (TableScope listens to the model)
      }
      this.previousEvt = startEvt.clone();
      this.anchorRanges = [];
      this.ignoreNextClick = evt.rowIndex !== startEvt.rowIndex || evt.columnIndex !== startEvt.columnIndex;
      this.tableScope.onSelectionChanged(sm);
    });
    return true;
  }

  /**
   * A click on a body cell: moves the focus and changes the selection.
   * - plain click: new selection (the clicked cell, row or column – by selection type);
   * - Shift: the rectangle from the previous click (the anchor) to this cell replaces what that click had selected –
   *   repeated Shift-clicks change the rectangle, ranges added before the anchor stay;
   * - Ctrl/⌘: toggles the cell (row, column); Ctrl/⌘+Alt: deselects it.
   *
   * Header/footer clicks and the second click of a double click (`clickCount` 2) do not change selection or focus.
   * All changes of one click are reported as one `onSelectionChanged` event.
   *
   * @param {GeMouseEvent} evt - the click
   * @param {GeMouseEvent | undefined} _previousEvt - not used (the service keeps its own anchor)
   * @returns {boolean} true if focus or selection changed (repaint needed)
   */
  onMouseClicked(evt: GeMouseEvent, _previousEvt: GeMouseEvent | undefined): boolean {
    if (this.ignoreNextClick) {
      this.ignoreNextClick = false;
      return false;
    }
    if (evt.areaIdent === 'header' && evt.clickCount === 1 && this.isRowNumberColumn(evt.columnIndex)
      && evt.rowIndex === this.tableScope.tableModel.getAreaModel('header').getRowCount() - 1) {
      return this.selectAllByRowNumberHeader(); // the "#" corner, like in a spreadsheet
    }
    if (evt.areaIdent !== 'body' || evt.rowIndex < 0 || evt.columnIndex < 0 || evt.clickCount > 1) {
      return false; // header/footer (before: cleared the selection, focused a body cell), double click
    }
    let dirty = false;

    if (this.getSelectionModel && this.getFocusModel) {
      const sm = this.getSelectionModel();
      const fm = this.getFocusModel();
      if (sm && fm) {
        this.batch(() => {
          // Focus (the model fires onFocusChanged):
          if (!fm.hasFocus(evt.rowIndex, evt.columnIndex)) {
            fm.setFocus(evt.rowIndex, evt.columnIndex);
          }

          // Selection:
          const shiftKey = !!evt.originalEvent?.shiftKey;
          const ctrlKey = !!(evt.originalEvent?.ctrlKey || evt.originalEvent?.metaKey);
          const altKey = !!evt.originalEvent?.altKey;

          // a click on a row number with selection type "range": whole rows (since 1.1.93)
          const wholeRows = this.isRowNumberColumn(evt.columnIndex) && SelectionService.isRangeSelection(sm);

          if (shiftKey && this.previousEvt) {
            if (this.anchorRanges.length && SelectionService.hasSnapshots(sm)) {
              // what the anchor click (or the previous shift-click) selected is replaced by the new rectangle
              const current = sm.createSnapshot();
              sm.restoreSnapshot({ ...current, ranges: current.ranges.filter(r => !this.anchorRanges.includes(r)) });
            }
            const range = this.createRangeByEvents(evt, this.previousEvt);
            if (wholeRows) {
              range.c1 = 0;
              range.c2 = Number.MAX_SAFE_INTEGER;
            }
            sm.addSelection(range);
            this.anchorRanges = [range];
            this.tableScope.onSelectionChanged(sm);
            return; // the anchor stays: the next shift-click changes this rectangle again
          }

          // this click is the new anchor
          const before = sm.getRanges().slice();
          if (wholeRows) {
            this.clickRowNumber(sm, evt.rowIndex, evt.columnIndex, shiftKey, ctrlKey, altKey);
          } else if (ctrlKey && altKey) {
            sm.removeSelection(CellRange.singleCell(evt.rowIndex, evt.columnIndex));
          } else if (ctrlKey) {
            sm.togglePoint(evt.rowIndex, evt.columnIndex);
          } else {
            // no special key: a new selection (Shift without anchor: added to the existing selection)
            if (!shiftKey && sm.hasSelection()) {
              sm.clear();
            }
            sm.firstClick(evt.rowIndex, evt.columnIndex);
          }
          this.anchorRanges = sm.getRanges().filter(r => !before.includes(r));
          this.previousEvt = evt.clone();
          this.tableScope.onSelectionChanged(sm);
        });
        dirty = true;
      }
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
          this.announce(texts => texts.allSelected());
          return true;
        }
        if (actionId === "DESELECT_ALL") {
          sm.clear();
          this.tableScope.repaint();
          this.announce(texts => texts.selectionCleared());
          return true;
        }
        if (actionId === "TOGGLE_SELECTION" && this.tableScope.getHeaderFocus?.()) {
          return false; // a header cell has the focus – not the body cell behind it
        }
        if (actionId === "TOGGLE_SELECTION") {
          const [row, col] = fm.getFocus();
          if (this.isRowNumberColumn(col) && SelectionService.isRangeSelection(sm)) {
            this.clickRowNumber(sm, row, col, false, true, false); // like Ctrl/⌘-click on the number: the whole row
            this.tableScope.onSelectionChanged(sm);
            this.tableScope.repaint();
            return true;
          }
          sm.togglePoint(row, col);
          this.tableScope.repaint();
          return true;
        }
      }
    }
    return false;
  }


  /** True if the column is a row number column ({@link RowNumberColumnDef}). */
  private isRowNumberColumn(columnIndex: number): boolean {
    return columnIndex > -1 && isRowNumberColumnDef(this.tableScope.tableModel?.getColumnDef(columnIndex));
  }

  /** A click on the header cell of the row numbers: everything (selection types "row" and "range"). */
  private selectAllByRowNumberHeader(): boolean {
    const sm = this.getSelectionModel?.();
    const type = (sm as unknown as { selectionType?: string } | undefined)?.selectionType;
    if (!sm || (type !== 'row' && type !== 'range')) {
      return false;
    }
    this.batch(() => {
      sm.selectAll();
      this.tableScope.onSelectionChanged(sm);
    });
    this.announce(texts => texts.allSelected());
    return true;
  }

  /** Selection type "range", click on a row number: the whole row – new, toggled (Ctrl/⌘) or removed (Ctrl/⌘+Alt). */
  private clickRowNumber(sm: SelectionModelIf, rowIndex: number, numberColumn: number, shiftKey: boolean, ctrlKey: boolean, altKey: boolean): void {
    const row = new CellRange(rowIndex, 0, rowIndex, Number.MAX_SAFE_INTEGER);
    if (ctrlKey && altKey) {
      sm.removeSelection(row);
    } else if (ctrlKey) {
      if (sm.isSelected(rowIndex, numberColumn)) { // a selected row includes its number cell
        sm.removeSelection(row);
      } else {
        sm.addSelection(row);
      }
    } else {
      if (!shiftKey && sm.hasSelection()) {
        sm.clear();
      }
      sm.addSelection(row);
    }
  }

  private static isRangeSelection(sm: SelectionModelIf): boolean {
    return (sm as unknown as { selectionType?: string }).selectionType === 'range';
  }

  /** Speaks a message for screen readers – only if the selection model can select anything. */
  private announce(text: (texts: AriaTextsIf) => string): void {
    const sm = this.getSelectionModel?.() as unknown as { selectionType?: string } | undefined;
    if (sm?.selectionType !== "none" && this.tableScope.ariaTexts && typeof this.tableScope.announce === "function") {
      this.tableScope.announce(text(this.tableScope.ariaTexts));
    }
  }

  /** Runs `fn` so that all selection changes in it reach the table's listener as ONE onSelectionChanged event. */
  private batch(fn: () => void): void {
    if (typeof this.tableScope.holdSelectionEvents === 'function') {
      this.tableScope.holdSelectionEvents(fn);
    } else {
      fn();
    }
  }

  /** The built-in SelectionModel can save and restore its state; an own SelectionModelIf implementation may not. */
  private static hasSnapshots(sm: SelectionModelIf): sm is SelectionModelIf & {
    createSnapshot(): SelectionSnapshot;
    restoreSnapshot(snapshot: SelectionSnapshot): void;
  } {
    return typeof (sm as Partial<SelectionModel>).createSnapshot === 'function'
      && typeof (sm as Partial<SelectionModel>).restoreSnapshot === 'function';
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
