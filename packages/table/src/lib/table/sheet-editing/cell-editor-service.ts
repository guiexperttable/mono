import type { TableScope } from "../table-scope";
import type { EditingOptionsIf } from "./editing-options.if";
import type { CellEditMode, CellEditorContextIf, CellEditorFactory, CellEditorIf, EditMove } from "./cell-editor.if";
import { TextCellEditor } from "./editors/text-cell-editor";
import { NumberCellEditor } from "./editors/number-cell-editor";
import { DateCellEditor } from "./editors/date-cell-editor";
import { GeEditEvent, type GeEditEventType } from "../data/common/event/ge-edit-event";
import { isRowNumberColumnDef, isTreeRow } from "../instanceof-workaround";
import { DEFAULT_GET_EDIT_RENDERER } from "../data/options/table-options";
import { editInputPipeForNumber } from "../renderer/edit/edit-input-pipe-for-number";
import { FormulaAssist } from "./formula-assist";

interface EditSession {
  rowIndex: number;
  columnIndex: number;
  /** The row object – the editor follows it when the rows are sorted or filtered while editing. */
  row: unknown;
  mode: CellEditMode;
  /** The start text – committing it unchanged writes nothing. */
  initialText: string;
  typed: boolean;
  /** The column definition – the editor follows it when columns move or change while editing. */
  columnDef: unknown;
  /** Opened by an IME or dead key: until the field gets input, committing writes nothing. */
  pendingInput: boolean;
  /** The field got input (an `input` or `change` event). */
  hadInput: boolean;
}

/** How a cell value becomes editor text. */
function toEditorText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
  }
  return String(value);
}

/**
 * Excel-style editing ({@link TableOptionsIf.editing}): **one** editor element above the edited cell (not inside
 * it – the cells are rebuilt on every render pass, the editor survives scrolling and repaints), typing to edit,
 * Enter/Tab/arrow keys commit and move, Escape cancels, a click elsewhere commits. Created by {@link TableScope}
 * only with the option (`tableScope.cellEditorService`).
 *
 * @category Internals
 * @since 1.1.99
 */
export class CellEditorService {

  private container?: HTMLDivElement;
  private editor?: CellEditorIf;
  private session?: EditSession;
  /** Formula input of a formula column (pointing, colors, suggestions – since 1.1.99, `cellFormulas`). */
  private assist?: FormulaAssist;
  /** The column the last Tab sequence started in (Enter goes back to it, like Excel). */
  private tabStartColumn = -1;
  private readonly editorId: string;
  /** An invalid value refused a click: its mousedown/click/dblclick must not move the focus either. */
  private blockClick = false;

  constructor(private readonly tableScope: TableScope, readonly options: EditingOptionsIf) {
    this.editorId = `${tableScope.ariaIds.prefix}-editor`;
    const signal = tableScope.listenerAbortController.signal;
    const host = tableScope.hostElement;
    // capture: typing must open the editor before the shortcut service sees the key
    host.addEventListener("keydown", (evt: KeyboardEvent) => this.onKeyDown(evt), { capture: true, signal });
    // a click elsewhere commits – before the mouse handler moves the focus
    host.addEventListener("pointerdown", (evt: PointerEvent) => this.onPointerDown(evt), { capture: true, signal });
    host.addEventListener("focusout", (evt: FocusEvent) => this.onFocusOut(evt), { signal });
    for (const type of ["mousedown", "mouseup", "click", "dblclick"]) {
      host.addEventListener(type, (evt: Event) => this.onBlockedMouse(evt), { capture: true, signal });
    }
  }

  /** True while the editor is open. */
  isOpen(): boolean {
    return !!this.session;
  }

  /**
   * The edited cell.
   *
   * @returns {[number, number] | undefined} display row and model column, `undefined` without editor
   */
  getCell(): [number, number] | undefined {
    return this.session ? [this.session.rowIndex, this.session.columnIndex] : undefined;
  }

  /**
   * The id of the editor element (and of the formula popups) if `(rowIndex, columnIndex)` is the edited cell – the cell gets `aria-owns` with it
   * (screen readers find the editor in the cell, not as a stray child of the grid).
   *
   * @param {number} rowIndex - display row index
   * @param {number} columnIndex - model column index
   * @returns {string | undefined} the id
   */
  getOwnedEditorId(rowIndex: number, columnIndex: number): string | undefined {
    const s = this.session;
    if (!s || s.rowIndex !== rowIndex || s.columnIndex !== columnIndex || !this.editor?.getFocusElement()) {
      return undefined;
    }
    // a formula: the suggestion list and the hint belong to the cell too
    return this.assist ? [this.editorId, ...this.assist.getOwnedIds()].join(" ") : this.editorId;
  }

  /**
   * True if this service edits the column (otherwise the column's own `getEditRenderer` – or an own
   * `tableOptions.getEditRenderer` of the app – edits inside the cell, as before 1.1.99).
   *
   * @param {number} columnIndex - model column index
   * @returns {boolean} true for the editor above the cell
   */
  handlesColumn(columnIndex: number): boolean {
    const def = this.tableScope.tableModel.getColumnDef(columnIndex);
    if (def?.editor) {
      return true;
    }
    if (def?.getEditRenderer) {
      return false;
    }
    const tableEditor = this.tableScope.tableOptions.getEditRenderer;
    return !tableEditor || tableEditor === DEFAULT_GET_EDIT_RENDERER;
  }

  /**
   * Opens the editor on a body cell.
   *
   * @param {number} rowIndex - display row index
   * @param {number} columnIndex - model column index
   * @param {{ mode?: CellEditMode, typedText?: string, textSelection?: "all" | "end" }} [opts] - "enter" with the typed
   *        character, or "edit" (F2: caret at the end)
   * @returns {boolean} true if the editor is open
   */
  start(rowIndex: number, columnIndex: number,
        opts: { mode?: CellEditMode; typedText?: string; textSelection?: "all" | "end"; imeStart?: boolean } = {}): boolean {
    const scope = this.tableScope;
    if (this.session) {
      if (this.session.rowIndex === rowIndex && this.session.columnIndex === columnIndex) {
        return true;
      }
      if (!this.commit("none")) {
        return false;
      }
    }
    const body = scope.tableModel.getBodyModel();
    if (rowIndex < 0 || columnIndex < 0 || rowIndex >= body.getRowCount()
      || columnIndex >= scope.tableModel.getColumnCount() || !body.isEditable(rowIndex, columnIndex)
      || isRowNumberColumnDef(scope.tableModel.getColumnDef(columnIndex)) || !scope.canStartEditing()) {
      return false;
    }
    const mode = opts.mode ?? "edit";
    const columnDef = scope.tableModel.getColumnDef(columnIndex);
    const value = scope.getShownCellValue(rowIndex, columnIndex);
    const rowObject = body.getRowByIndex(rowIndex);
    const row = isTreeRow(rowObject) ? (rowObject as { data?: unknown }).data : rowObject;
    const input = toEditorText(value);

    scope.ensureColumnIsVisible(columnIndex);
    scope.ensureRowIsVisible(rowIndex);

    const container = this.ensureContainer();
    const ctx: CellEditorContextIf = {
      rowIndex, columnIndex, row: rowObject, columnDef, value, input,
      typedText: opts.typedText,
      mode,
      textSelection: opts.textSelection ?? this.options.textSelection,
      direction: scope.isRtl() ? "rtl" : "ltr",
      ariaLabel: scope.getColumnAriaLabel(columnIndex),
      domService: scope.getDomService().domService,
      commit: (move?: EditMove) => { this.commit(move ?? "none"); },
      cancel: () => this.cancel(),
      inputChanged: () => {
        if (this.session) this.session.hadInput = true;
        this.fire("input");
      },
    };
    const editor = this.createEditor(ctx);
    this.editor = editor;
    const pendingInput = !!opts.imeStart;
    this.session = {
      rowIndex, columnIndex, row: row ?? rowObject, mode, initialText: input, typed: opts.typedText !== undefined && !pendingInput,
      columnDef, pendingInput, hadInput: false,
    };
    editor.open(container, ctx);
    const focusElement = editor.getFocusElement();
    if (focusElement) {
      scope.getDomService().domService.setAttribute(focusElement, "id", this.editorId);
    }
    const sheet = scope.tableSheet;
    if (sheet?.isFormulaColumnIndex(columnIndex) && focusElement?.tagName === "INPUT"
      && (focusElement as HTMLInputElement).type === "text") {
      this.assist = new FormulaAssist(scope, sheet, focusElement as HTMLInputElement, container,
        () => this.session ? [this.session.rowIndex, this.session.columnIndex] : [rowIndex, columnIndex],
        () => ctx.inputChanged(), this.editorId);
    }
    container.style.display = "block";
    this.update();
    editor.focus();
    this.fire("start");
    scope.announce(scope.getSheetTexts().editingStarted(scope.getColumnAriaLabel(columnIndex)));
    scope.repaint(); // the cell owns the editor now (aria-owns)
    editor.focus();
    return true;
  }

  /**
   * Writes the editor's value (through `editInputPipe` and `validate`; batch edit: marks it) and moves on.
   * An invalid value keeps the editor open (`aria-invalid`, the message is announced and the `title`).
   *
   * @param {EditMove} [move="none"] - where the active cell goes afterwards
   * @param {{ fillSelection?: boolean, deferRepaint?: boolean }} [opts] - Ctrl/⌘+Enter: into all selected cells;
   *        a mouse click: repaint after the click (a repaint between mousedown and click loses the click)
   * @returns {boolean} true if the editor closed
   */
  commit(move: EditMove = "none", opts: { fillSelection?: boolean; deferRepaint?: boolean; tab?: boolean } = {}): boolean {
    const session = this.session;
    const editor = this.editor;
    if (!session || !editor) {
      return true;
    }
    const scope = this.tableScope;
    const text = editor.getText?.() ?? String(editor.getValue() ?? "");
    const unchanged = (session.pendingInput && !session.hadInput) || (!session.typed && text === session.initialText);
    if (!unchanged || opts.fillSelection) {
      const value = editor.getValue();
      const cells = opts.fillSelection ? scope.getSelectedBodyCells(this.options.maxClearCells) : [];
      if (!cells) {
        scope.announce(scope.getSheetTexts().clearTooLarge(this.options.maxClearCells)); // too many cells: keep editing
        editor.focus();
        return false;
      }
      if (!cells.length) cells.push([session.rowIndex, session.columnIndex]);
      const result = scope.commitCellEditor(cells, value, !!opts.deferRepaint);
      if (result.invalid && !result.written) {
        const el = editor.getFocusElement();
        if (el) {
          const dom = scope.getDomService().domService;
          dom.setAttribute(el, "aria-invalid", "true");
          dom.setAttribute(el, "title", result.message ?? "");
        }
        editor.focus();
        return false;
      }
    }
    const { rowIndex, columnIndex } = session;
    // a stored formula with a syntax error shows #ERROR! – say why (Google Sheets)
    const sheet = scope.tableSheet;
    const formulaError = !unchanged && sheet?.isFormulaInput(columnIndex, text) ? sheet.syntaxError(text) : undefined;
    this.close("commit", text, !!opts.deferRepaint);
    if (formulaError) {
      scope.announce(scope.getFormulaErrorText(formulaError));
    }
    this.moveAfterCommit(rowIndex, columnIndex, move, !!opts.tab);
    return true;
  }

  /** Closes the editor without writing (Escape). */
  cancel(): void {
    if (!this.session) {
      return;
    }
    this.close("cancel");
  }

  /** Places the editor over its cell (called after every render pass) – also when the cell scrolled out of view. */
  update(): void {
    const session = this.session;
    const container = this.container;
    if (!session || !container) {
      return;
    }
    const scope = this.tableScope;
    if (!this.followColumn(session) || !this.followRow(session)) {
      this.close("cancel"); // the row or column is gone (filtered out, deleted)
      return;
    }
    const r = scope.getBodyCellRectInHost(session.rowIndex, session.columnIndex);
    const dom = scope.getDomService();
    dom.setStyle(container, "left", `${r.left}px`); // logical: right-to-left = "right"
    container.style.top = `${r.top}px`;
    container.style.width = `${Math.max(0, r.width)}px`;
    container.style.height = `${Math.max(0, r.height)}px`;
    // the visible part of the cell (body between header and footer, the fixed or scrollable columns); outside:
    // cut away with clip-path – the editor stays rendered and focused (text, caret, IME composition stay)
    const top = Math.max(0, r.clipTop - r.top);
    const bottom = Math.max(0, r.top + r.height - r.clipBottom);
    const start = Math.max(0, r.clipLeft - r.left);
    const end = Math.max(0, r.left + r.width - r.clipRight);
    const hidden = top + bottom >= r.height || start + end >= r.width;
    container.classList.toggle("ge-table-cell-editor-clipped", hidden);
    const [left, right] = scope.isRtl() ? [end, start] : [start, end];
    container.style.clipPath = hidden ? "inset(50%)" : (top || bottom || left || right)
      ? `inset(${top}px ${right}px ${bottom}px ${left}px)` : "";
    this.assist?.update();
    const active = container.ownerDocument.activeElement;
    if (active === scope.hostElement) {
      this.editor?.focus(); // e.g. the scroll bar was clicked: keep typing into the editor
    }
  }

  /** Removes the editor (table destroyed). */
  destroy(): void {
    this.assist?.destroy();
    this.assist = undefined;
    this.editor?.close();
    this.editor = undefined;
    this.session = undefined;
    this.container?.remove();
    this.container = undefined;
  }

  // ------------------------------------------------------------------------------------------------ internals

  private ensureContainer(): HTMLDivElement {
    if (!this.container || !this.container.isConnected) {
      const dom = this.tableScope.getDomService();
      this.container = dom.createDivWithClass("ge-table-cell-editor", this.tableScope.hostElement);
      dom.domService.setAttribute(this.container, "role", "presentation");
    }
    return this.container;
  }

  private createEditor(ctx: CellEditorContextIf): CellEditorIf {
    const option = ctx.columnDef?.editor;
    if (typeof option === "function") {
      return (option as CellEditorFactory)(ctx);
    }
    // a formula cell: by its result (typing 100 over =B2*C2 writes a number)
    const typed = this.tableScope.getTypedCellValue(ctx.rowIndex, ctx.columnIndex);
    const formula = typed !== ctx.value; // the input is a formula text: no date picker
    const kind = option ?? (
      typed instanceof Date && !formula ? "date"
        : typeof typed === "number" || ctx.columnDef?.editInputPipe === editInputPipeForNumber ? "number"
          : "text");
    if (kind === "number") return new NumberCellEditor();
    if (kind === "date") return new DateCellEditor();
    return new TextCellEditor();
  }

  /** The row moved (sorting, filter, inserted rows): the editor follows it; `false` if it is gone. */
  private followRow(session: EditSession): boolean {
    const body = this.tableScope.tableModel.getBodyModel();
    const at = (i: number) => {
      const o = body.getRowByIndex(i);
      return isTreeRow(o) ? (o as { data?: unknown }).data : o;
    };
    if (session.row === undefined || session.row === null || typeof session.row !== "object") {
      return session.rowIndex < body.getRowCount();
    }
    if (session.rowIndex < body.getRowCount() && at(session.rowIndex) === session.row) {
      return true;
    }
    if (session.rowIndex < body.getRowCount() && at(session.rowIndex) !== at(session.rowIndex)) {
      session.row = undefined; // a model with a new row object per call: follow the index
      return true;
    }
    const count = body.getRowCount();
    for (let i = 0; i < count; i++) {
      if (at(i) === session.row) {
        session.rowIndex = i;
        return true;
      }
    }
    return false;
  }

  /** The columns moved or changed (reordering, grouping, `setColumns`): the editor follows its column definition. */
  private followColumn(session: EditSession): boolean {
    const model = this.tableScope.tableModel;
    if (model.getColumnDef(session.columnIndex) === session.columnDef) {
      return true;
    }
    const count = model.getColumnCount();
    for (let c = 0; c < count; c++) {
      if (model.getColumnDef(c) === session.columnDef) {
        session.columnIndex = c;
        return true;
      }
    }
    return false;
  }

  private close(type: GeEditEventType, text?: string, deferRepaint = false): void {
    const session = this.session;
    const container = this.container;
    const hadFocus = !!container?.contains(container.ownerDocument.activeElement);
    this.assist?.destroy();
    this.assist = undefined;
    this.editor?.close();
    this.editor = undefined;
    if (container) {
      container.style.display = "none";
      container.style.clipPath = "";
    }
    this.session = undefined;
    if (session) {
      this.tableScope.getEventListener().onEditingChanged?.(
        new GeEditEvent(type, session.rowIndex, session.columnIndex, session.mode, text));
    }
    if (hadFocus) {
      this.tableScope.hostElement.focus({ preventScroll: true }); // keyboard navigation continues
    }
    if (type === "cancel" && !deferRepaint) {
      this.tableScope.repaint();
    }
  }

  private fire(type: GeEditEventType): void {
    const s = this.session;
    if (s) {
      this.tableScope.getEventListener().onEditingChanged?.(
        new GeEditEvent(type, s.rowIndex, s.columnIndex, s.mode, this.editor?.getText?.()));
    }
  }

  private moveAfterCommit(rowIndex: number, columnIndex: number, move: EditMove, tab: boolean): void {
    const scope = this.tableScope;
    if (move === "none") {
      return;
    }
    if (move === "right" || move === "left") {
      if (tab && this.tabStartColumn < 0) this.tabStartColumn = columnIndex; // Enter returns to it (Excel)
      if (!tab) this.tabStartColumn = -1;
      scope.moveActiveCell(rowIndex, columnIndex, 0, move === "right" ? 1 : -1);
      return;
    }
    const dRow = move === "down" ? 1 : -1;
    const targetColumn = move === "down" && this.tabStartColumn >= 0 ? this.tabStartColumn : columnIndex;
    this.tabStartColumn = -1;
    scope.moveActiveCell(rowIndex, targetColumn, dRow, 0);
  }

  private onPointerDown(evt: PointerEvent): void {
    const container = this.container;
    if (!this.session || !container || container.contains(evt.target as Node)) {
      return;
    }
    if (evt.target === this.tableScope.scrollViewport) {
      return; // the scroll bar: keep editing (Excel)
    }
    this.blockClick = false;
    if (this.assist?.onPointerDown(evt)) {
      // a formula: the click inserts the cell's reference (no commit, no selection change)
      evt.preventDefault();
      evt.stopPropagation();
      this.blockClick = true;
      return;
    }
    if (!this.commit("none", { deferRepaint: true })) {
      // an invalid value: stay in the cell – the mouse events of this click must not move the focus or selection
      evt.preventDefault();
      evt.stopPropagation();
      this.blockClick = true;
    }
  }

  private onBlockedMouse(evt: Event): void {
    if (!this.blockClick || this.container?.contains(evt.target as Node)) {
      return;
    }
    evt.preventDefault();
    evt.stopPropagation();
    if (evt.type === "click" || evt.type === "dblclick") {
      this.blockClick = evt.type === "click"; // a double click sends a second click and the dblclick
      if (evt.type === "click") setTimeout(() => (this.blockClick = false), 500);
    }
  }

  private onFocusOut(evt: FocusEvent): void {
    const container = this.container;
    const next = evt.relatedTarget as Node | null;
    if (!this.session || !container || !container.contains(evt.target as Node)) {
      return;
    }
    if (!next) {
      // no new focus: another window (keep editing – the focus comes back) or a click on the page (commit)
      const doc = container.ownerDocument;
      setTimeout(() => {
        const session = this.session;
        if (session && doc.hasFocus() && !this.tableScope.hostElement.contains(doc.activeElement)) {
          this.commit("none");
        }
      });
      return;
    }
    if (!this.tableScope.hostElement.contains(next)) {
      this.commit("none"); // the focus left the table
    }
  }

  private onKeyDown(evt: KeyboardEvent): void {
    const scope = this.tableScope;
    if (scope.isEventInDetail?.(evt)) {
      return;
    }
    const container = this.container;
    if (this.session && container && container.contains(evt.target as Node)) {
      this.onEditorKeyDown(evt);
      return;
    }
    if (this.session || evt.target !== scope.hostElement || !this.options.startOnType) {
      return;
    }
    this.onTypeToEdit(evt);
  }

  private isMac(): boolean {
    return typeof navigator !== "undefined" && /Mac/.test(navigator.platform);
  }

  /** A key on the focused table (no editor open): printable keys open the editor ("enter" mode). */
  private onTypeToEdit(evt: KeyboardEvent): void {
    const scope = this.tableScope;
    const altGraph = typeof evt.getModifierState === "function" && evt.getModifierState("AltGraph");
    if ((evt.ctrlKey || evt.metaKey) && !altGraph) {
      return;
    }
    if (evt.altKey && !altGraph && !this.isMac()) {
      return; // Alt+letter: menu and access keys (on macOS Option types characters)
    }
    const ime = evt.isComposing || evt.key === "Process" || evt.keyCode === 229;
    const dead = evt.key === "Dead";
    const printable = evt.key.length === 1 && !(evt.key === " " && (evt.shiftKey || evt.ctrlKey));
    if (!printable && !ime && !dead) {
      return;
    }
    const cell = scope.getActiveBodyCell();
    if (!cell || !scope.canStartEditing()) {
      return;
    }
    const [row, col] = cell;
    const body = scope.tableModel.getBodyModel();
    if (!body.isEditable(row, col) || isRowNumberColumnDef(scope.tableModel.getColumnDef(col))) {
      if (printable && evt.key !== " ") {
        scope.announce(scope.getSheetTexts().readOnlyCell());
      }
      return; // e.g. Space toggles a checkbox or selects the row of a row number
    }
    const value = scope.getShownCellValue(row, col);
    if (typeof value === "boolean") {
      if (evt.key === " ") {
        evt.preventDefault();
        evt.stopImmediatePropagation(); // the shortcut service (same element) must not toggle the selection
        scope.toggleBooleanCell(row, col);
      }
      return; // no editor for true/false
    }
    if (!this.handlesColumn(col)) {
      return; // an own in-cell editor: F2, Enter and double click open it
    }
    // stopImmediatePropagation: the shortcut service listens on the same element (Space would toggle the selection)
    if (printable) {
      evt.preventDefault();
      evt.stopImmediatePropagation();
      this.start(row, col, { mode: "enter", typedText: evt.key });
    } else {
      // IME or dead key: open empty and let the browser put the composition into the focused field
      evt.stopImmediatePropagation();
      this.start(row, col, { mode: "enter", typedText: "", imeStart: true });
    }
  }

  private onEditorKeyDown(evt: KeyboardEvent): void {
    const editor = this.editor;
    const session = this.session;
    if (!editor || !session) {
      return;
    }
    if (evt.isComposing || evt.key === "Process" || evt.keyCode === 229 || editor.isComposing?.()) {
      return; // the IME needs Enter and the arrow keys
    }
    const stop = () => {
      evt.preventDefault();
      evt.stopPropagation();
    };
    if (this.assist?.onKeyDown(evt, session.mode)) {
      stop(); // pointing, F4, the function list
      return;
    }
    if (editor.wantsKey?.(evt, session.mode)) {
      return;
    }
    const rtl = this.tableScope.isRtl();
    switch (evt.key) {
      case "Escape":
        stop();
        this.cancel();
        return;
      case "Enter": {
        if (evt.altKey) return;
        stop();
        if ((evt.ctrlKey || evt.metaKey) && this.options.ctrlEnterFillsSelection) {
          this.commit("none", { fillSelection: true });
          return;
        }
        const forward: EditMove = this.options.enterMoves === "right" ? "right"
          : this.options.enterMoves === "none" ? "none" : "down";
        const backward: EditMove = forward === "right" ? "left" : forward === "down" ? "up" : "none";
        this.commit(evt.shiftKey ? backward : forward);
        return;
      }
      case "Tab": {
        if (!this.options.tabMoves || evt.ctrlKey || evt.metaKey || evt.altKey) return;
        const dir = evt.shiftKey ? -1 : 1;
        if (this.tableScope.hasShownColumnBeside(session.columnIndex, dir)) {
          stop();
          this.commit(dir > 0 ? "right" : "left", { tab: true });
        } else if (this.commit("none")) {
          this.tabStartColumn = -1; // the browser moves the focus out of the table (no keyboard trap)
        } else {
          stop();
        }
        return;
      }
      case "F2":
        stop();
        session.mode = session.mode === "enter" ? "edit" : "enter";
        editor.setMode?.(session.mode);
        return;
      case "ArrowUp":
      case "ArrowDown":
      case "ArrowLeft":
      case "ArrowRight": {
        if (session.mode !== "enter" || !this.options.arrowKeysCommit || evt.ctrlKey || evt.metaKey || evt.altKey || evt.shiftKey) {
          return;
        }
        stop();
        let move: EditMove = evt.key === "ArrowUp" ? "up" : evt.key === "ArrowDown" ? "down"
          : evt.key === "ArrowLeft" ? "left" : "right";
        if (rtl && (move === "left" || move === "right")) {
          move = move === "left" ? "right" : "left"; // right-to-left: ← goes forward in reading direction
        }
        this.commit(move);
        return;
      }
      default:
        return;
    }
  }
}
