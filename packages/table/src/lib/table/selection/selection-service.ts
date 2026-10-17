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
import { isCheckboxColumnDef, isRowNumberColumnDef } from "../instanceof-workaround";


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
  /** The cell a Shift+click or Shift+arrow range starts at (the last click, or the active cell). @since 1.1.99 */
  protected anchor?: [number, number];
  /** The moving corner of the range of Shift+arrows (Excel); `undefined` = the anchor. @since 1.1.99 */
  protected extent?: [number, number];


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
      this.anchor = [startEvt.rowIndex, startEvt.columnIndex];
      this.extent = [evt.rowIndex, evt.columnIndex];
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
    if (evt.areaIdent === 'header' && evt.clickCount === 1 && evt.columnIndex > -1 && this.isColumnLetterCell(evt)) {
      return this.clickColumnLetter(evt); // a column letter (since 1.1.99): the whole column
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

          if (shiftKey && (this.anchor || this.previousEvt)) {
            if (this.anchorRanges.length && SelectionService.hasSnapshots(sm)) {
              // what the anchor click (or the previous shift-click) selected is replaced by the new rectangle
              const current = sm.createSnapshot();
              sm.restoreSnapshot({ ...current, ranges: current.ranges.filter(r => !this.anchorRanges.includes(r)) });
            }
            // from the anchor: the last click – or, since 1.1.99, the active cell set by the keyboard
            const [ar, ac] = this.anchor ?? [this.previousEvt!.rowIndex, this.previousEvt!.columnIndex];
            const range = SelectionService.rangeBetween(evt.rowIndex, evt.columnIndex, ar, ac);
            this.extent = [evt.rowIndex, evt.columnIndex];
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
          this.anchor = [evt.rowIndex, evt.columnIndex];
          this.letterAnchor = undefined; // Shift+click on a letter spans from the active cell's column again
          this.extent = undefined;
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


  /**
   * The cell a Shift+click or Shift+arrow range starts at: the last clicked cell or the active cell set by the
   * keyboard ({@link collapseTo}).
   *
   * @returns {[number, number] | undefined} row and column, `undefined` before the first click/keyboard move
   * @since 1.1.99
   */
  getAnchor(): [number, number] | undefined {
    return this.anchor ? [this.anchor[0], this.anchor[1]] : undefined;
  }

  /**
   * The moving corner of the range Shift+arrows grow (the anchor if there is none).
   *
   * @returns {[number, number] | undefined} row and column
   * @since 1.1.99
   */
  getExtent(): [number, number] | undefined {
    const fm = this.getFocusModel?.();
    const [fr, fc] = fm ? fm.getFocus() : [-1, -1];
    const e = this.extent ?? this.anchor;
    const a = this.anchor;
    if (fr >= 0 && fc >= 0 && !(a && a[0] === fr && a[1] === fc) && !(e && e[0] === fr && e[1] === fc)) {
      return [fr, fc]; // the focus moved by code: a new range starts at it
    }
    return e ? [e[0], e[1]] : undefined;
  }

  /**
   * Excel-style editing: the active cell moved (arrow keys, Tab, Enter) – the selection becomes this one cell and it
   * is the new anchor. Selection types other than `"range"`/`"cell"` only get the anchor.
   *
   * @param {number} rowIndex - display row index
   * @param {number} columnIndex - model column index
   * @since 1.1.99
   */
  collapseTo(rowIndex: number, columnIndex: number): void {
    const sm = this.getSelectionModel?.();
    this.anchor = [rowIndex, columnIndex];
    this.extent = undefined;
    this.anchorRanges = [];
    const type = (sm as unknown as { selectionType?: string } | undefined)?.selectionType;
    if (!sm || (type !== 'range' && type !== 'cell')) {
      return;
    }
    this.batch(() => {
      const ranges = sm.getRanges();
      const single = ranges.length === 1 && ranges[0].r1 === rowIndex && ranges[0].r2 === rowIndex
        && ranges[0].c1 === columnIndex && ranges[0].c2 === columnIndex && !sm.isAllSelected();
      if (!single) {
        sm.clear();
        sm.addSelection(CellRange.singleCell(rowIndex, columnIndex));
        this.tableScope.onSelectionChanged(sm);
      }
      this.anchorRanges = sm.getRanges().slice();
    });
  }

  /**
   * Excel-style editing (Shift+arrows): the last range is spanned from the anchor to `(rowIndex, columnIndex)`;
   * other ranges (Ctrl/⌘-clicks) stay. Only for the selection type `"range"`.
   *
   * @param {number} rowIndex - the new moving corner (display row index)
   * @param {number} columnIndex - model column index
   * @returns {CellRange | undefined} the new range, `undefined` without a range selection
   * @since 1.1.99
   */
  extendTo(rowIndex: number, columnIndex: number): CellRange | undefined {
    const sm = this.getSelectionModel?.();
    if (!sm || !SelectionService.isRangeSelection(sm)) {
      return undefined;
    }
    // the anchor is the active cell: a focus set by code (or the API) starts a new range there – unless the focus is
    // the moving corner itself (after a Shift+click)
    const fm = this.getFocusModel?.();
    const [fr, fc] = fm ? fm.getFocus() : [-1, -1];
    const extent = this.extent ?? this.anchor;
    const focusIsAnchorOrExtent = (this.anchor && this.anchor[0] === fr && this.anchor[1] === fc)
      || (extent && extent[0] === fr && extent[1] === fc);
    if ((!this.anchor || !focusIsAnchorOrExtent) && fr >= 0 && fc >= 0) {
      this.anchor = [fr, fc];
      this.extent = undefined;
      this.anchorRanges = [];
    }
    if (!this.anchor) {
      return undefined;
    }
    const range = SelectionService.rangeBetween(rowIndex, columnIndex, this.anchor[0], this.anchor[1]);
    this.batch(() => {
      if (SelectionService.hasSnapshots(sm)) {
        const current = sm.createSnapshot();
        sm.restoreSnapshot({ ...current, ranges: current.ranges.filter(r => !this.anchorRanges.includes(r)) });
      } else {
        sm.clear();
      }
      sm.addSelection(range);
      this.anchorRanges = [range];
      this.extent = [rowIndex, columnIndex];
      this.tableScope.onSelectionChanged(sm);
    });
    return range;
  }

  private static rangeBetween(r: number, c: number, ar: number, ac: number): CellRange {
    return new CellRange(Math.min(r, ar), Math.min(c, ac), Math.max(r, ar), Math.max(c, ac));
  }

  /** True if the column is a row number column ({@link RowNumberColumnDef}). */
  private isRowNumberColumn(columnIndex: number): boolean {
    return columnIndex > -1 && isRowNumberColumnDef(this.tableScope.tableModel?.getColumnDef(columnIndex));
  }

  /** True for a cell of a header row with column letters (spreadsheet) – not over row numbers. */
  private isColumnLetterCell(evt: GeMouseEvent): boolean {
    const header = this.tableScope.tableModel.getAreaModel('header') as { isColumnLetterRow?: (r: number) => boolean };
    return !!header.isColumnLetterRow?.(evt.rowIndex) && !this.isRowNumberColumn(evt.columnIndex)
      && !isCheckboxColumnDef(this.tableScope.tableModel.getColumnDef(evt.columnIndex));
  }

  /**
   * A click on a column letter (selection type "range"): the whole column – Shift: the columns from the last letter
   * (or the active cell), Ctrl/⌘: added. The active cell goes into the column.
   */
  private clickColumnLetter(evt: GeMouseEvent): boolean {
    const sm = this.getSelectionModel?.();
    const fm = this.getFocusModel?.();
    if (!sm || !SelectionService.isRangeSelection(sm)) {
      return false;
    }
    const col = evt.columnIndex;
    const shiftKey = !!evt.originalEvent?.shiftKey;
    const ctrlKey = !!(evt.originalEvent?.ctrlKey || evt.originalEvent?.metaKey);
    this.batch(() => {
      const from = shiftKey ? (this.letterAnchor ?? fm?.getFocus()[1] ?? col) : col;
      const range = new CellRange(0, Math.min(from, col), Number.MAX_SAFE_INTEGER, Math.max(from, col));
      if (!ctrlKey && sm.hasSelection()) {
        sm.clear();
      }
      sm.addSelection(range);
      if (!shiftKey) {
        this.letterAnchor = col;
      }
      if (fm) {
        const row = Math.max(0, fm.getFocus()[0]);
        fm.setFocus(row, col);
      }
      this.anchor = [0, col];
      this.extent = undefined;
      this.tableScope.onSelectionChanged(sm);
    });
    return true;
  }

  /** The column of the last click on a letter (Shift+click spans from it). */
  private letterAnchor?: number;

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
