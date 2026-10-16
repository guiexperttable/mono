import { CopiedFormula } from "../sheet/table-sheet";
import type { TableScope } from "../table-scope";
import type { ClipboardOptionsIf, PasteContextIf } from "./clipboard-options.if";
import type { CellValueChangeIf } from "../batch-edit/cell-value-change.if";
import type { CellChangeIf, CellChangeSource } from "../batch-edit/cell-change.if";
import { CellRange } from "../data/common/cell-range";
import { CopyService } from "../service/copy-service";
import { isRowNumberColumnDef, isTreeRow } from "../instanceof-workaround";
import { parseTsv, toTsv } from "./tsv";
import { parseHtmlTable, toHtmlTable, type HtmlTableCellIf } from "./clipboard-html";
import { computePastePlan, getPasteSize } from "./paste-plan";

/** What a copy produced: the texts, the values (for pasting inside the table) and where they came from. */
interface CopyResult {
  text: string;
  html?: string;
  /** Values per cell (rows × copied columns, a header row as texts). */
  values: unknown[][];
  /** The copied range (display rows, model columns). */
  range: CellRange;
  /** The copied columns (model indices). */
  columns: number[];
  /** The number of copied cells. */
  cellCount: number;
  /** Several ranges were selected – only the last one was copied. */
  lastRangeOnly: boolean;
  /** True if `processCopy` changed the texts (the values do not match them any more). */
  processed: boolean;
}

/** The last copy of this table: pasting the same text pastes the values (and moves cut cells). */
interface ClipboardMemory {
  text: string;
  values: unknown[][];
  cut?: {
    range: CellRange;
    columns: number[];
    /** The row objects of the cut rows – the cells are emptied where the rows are now (sorting, filter). */
    rows: unknown[];
  };
}

type ClipboardKind = "copy" | "cut" | "paste";

const normalize = (text: string) => text.replace(/\r\n?/g, "\n").replace(/\n$/, "");

/**
 * Copy, cut and paste like Excel ({@link TableOptionsIf.clipboard}): the `copy`, `cut` and `paste` events of the
 * browser (synchronous, no permission prompt). The keys (Ctrl/⌘+C, X, V) focus a hidden text field for the moment of
 * the key press, so that every browser – also Safari, which sends no clipboard events to a focused `div` – fires the
 * event; the focus returns to the table right after it. The Edit menu of the browser works on the focused table, too.
 * Created by {@link TableScope}: with the option (`tableScope.clipboardService`, keys and events), otherwise on
 * demand for the API ({@link TableApi.pasteText}, {@link TableApi.getSelectionAsText}).
 *
 * @category Internals
 * @since 1.1.99
 */
export class ClipboardService {

  private proxy?: HTMLTextAreaElement;
  private memory?: ClipboardMemory;
  private cutFrame?: HTMLDivElement;
  private restoreTimer?: ReturnType<typeof setTimeout>;
  private armedKind?: ClipboardKind;

  /**
   * @param {TableScope} tableScope - the table
   * @param {ClipboardOptionsIf} options - complete options
   * @param {boolean} listen - true: keys and clipboard events (the option is on); false: only the API
   */
  constructor(private readonly tableScope: TableScope, readonly options: ClipboardOptionsIf, listen: boolean) {
    const signal = tableScope.listenerAbortController.signal;
    if (listen) {
      const doc = tableScope.hostElement.ownerDocument;
      doc.addEventListener("copy", (evt: ClipboardEvent) => this.onClipboardEvent(evt, "copy"), { signal });
      doc.addEventListener("cut", (evt: ClipboardEvent) => this.onClipboardEvent(evt, "cut"), { signal });
      doc.addEventListener("paste", (evt: ClipboardEvent) => this.onClipboardEvent(evt, "paste"), { signal });
    }
    // also for the API (cutSelection without the option): Escape and another change remove the mark
    tableScope.hostElement.addEventListener("keydown", (evt: KeyboardEvent) => {
      if (evt.key === "Escape" && this.memory?.cut && evt.target === tableScope.hostElement && !tableScope.isEditing()) {
        this.cancelCut(); // Escape removes the marching ants (Excel); nothing else uses Escape on the grid
      }
    }, { signal });
    tableScope.subscribe({
      onModelChanged: evt => {
        if (evt.source !== "cut" && this.memory?.cut) {
          this.cancelCut(); // another change: the cut cells stay where they are (Excel)
        }
      },
    });
  }

  /** True while cut cells are marked (dashed frame). */
  isCutMarked(): boolean {
    return !!this.memory?.cut;
  }

  /**
   * Ctrl/⌘+C, X or V (from the shortcut mapping): focuses the hidden text field so that the browser fires its
   * clipboard event there. The key must not be consumed (`preventDefault`) – the caller returns `false`.
   *
   * @param {ClipboardKind} kind - the key
   * @returns {boolean} true if the event will be handled; false: not here (the editor is open, header focus, an own
   *          `CopyServiceIf` for copying)
   */
  arm(kind: ClipboardKind): boolean {
    const scope = this.tableScope;
    if (scope.isEditing() || scope.getHeaderFocus() || !scope.getActiveBodyCell()) {
      return false;
    }
    if (kind !== "paste" && !this.hasBuiltInCopyService()) {
      return false; // an own CopyServiceIf copies asynchronously (createContent) – the way before 1.1.99
    }
    if (kind !== "copy" && scope.isOverlayBlocking()) {
      return false; // "Loading…": no changes (like Delete)
    }
    const proxy = this.ensureProxy();
    proxy.value = " "; // Safari fires "copy" only with selected text
    proxy.select();
    proxy.focus({ preventScroll: true });
    this.armedKind = kind;
    clearTimeout(this.restoreTimer);
    // the browser fires the event right after the key – otherwise (it refused) the focus comes back anyway
    this.restoreTimer = setTimeout(() => this.restoreFocus(), 0);
    return true;
  }

  /**
   * The selected cells as tab-separated text, as Ctrl/⌘+C copies them (see {@link TableApi.getSelectionAsText}).
   *
   * @returns {string} the text; `""` without cells or with more than `CopyService.maxCopyCells`
   */
  getSelectionAsText(): string {
    return this.buildCopy(false)?.text ?? "";
  }

  /**
   * Copies (or cuts) the selected cells with the asynchronous clipboard API (`text/plain` and `text/html` with
   * `ClipboardItem`, otherwise `writeText`) – for buttons and menus (see {@link TableApi.copySelection}).
   *
   * @param {boolean} cut - true: mark the cells, they move on the next paste
   * @returns {Promise<void>} resolves when the clipboard was written
   */
  async writeSelection(cut: boolean): Promise<void> {
    const result = this.buildCopy(cut);
    if (!result) {
      return;
    }
    const clipboard = typeof navigator !== "undefined" ? navigator.clipboard : undefined;
    const ItemCtor = (globalThis as { ClipboardItem?: typeof ClipboardItem }).ClipboardItem;
    if (clipboard?.write && ItemCtor && result.html) {
      await clipboard.write([new ItemCtor({
        "text/plain": new Blob([result.text], { type: "text/plain" }),
        "text/html": new Blob([result.html], { type: "text/html" }),
      })]);
    } else if (clipboard?.writeText) {
      await clipboard.writeText(result.text);
    } else {
      return;
    }
    this.remember(result, cut); // only when the clipboard really has it (a refused write leaves no mark)
  }

  /**
   * Copy, cut or paste without a key (an `ActionId` from {@link TableApi.triggerAction}, e.g. a context menu): the
   * asynchronous clipboard API – the browser may ask for permission.
   *
   * @param {ClipboardKind} kind - what to do
   * @returns {Promise<void>} resolves when done (a refused permission is ignored)
   */
  async runWithoutKey(kind: ClipboardKind): Promise<void> {
    try {
      if (kind === "paste") {
        const text = await navigator.clipboard?.readText?.();
        if (text) this.paste(text);
      } else {
        await this.writeSelection(kind === "cut");
      }
    } catch (e) {
      console.warn("GuiExpert Table – clipboard:", e);
    }
  }

  /**
   * Pastes text (see {@link TableApi.pasteText}): parsed like the clipboard, from `target` or the selection.
   *
   * @param {string} text - tab-separated text
   * @param {string} [html] - `text/html` (used only without text)
   * @param {[number, number]} [target] - display row and model column of the first cell (no tiling)
   * @returns {CellChangeIf[]} the written (batch edit: newly pending) cells
   */
  paste(text: string, html?: string, target?: [number, number]): CellChangeIf[] {
    const scope = this.tableScope;
    const matrix = text ? parseTsv(text) : html ? parseHtmlTable(html) : [];
    if (!matrix.length || !matrix[0].length) {
      return [];
    }
    const memory = this.memory && text && normalize(text) === this.memory.text ? this.memory : undefined;
    const cut = memory?.cut;
    const body = scope.tableModel.getBodyModel();
    const rowCount = body.getRowCount();
    const shownColumns = this.getPasteColumns();
    // cut cells move once – no tiling (Excel)
    const anchor = this.getPasteAnchor(shownColumns, target);
    if (!anchor || !shownColumns.length) {
      return [];
    }
    const [anchorRow, anchorColumn] = anchor;
    const selection = cut ? undefined : anchor[2];
    const mCols = matrix[0].length;
    const startShown = shownColumns.indexOf(anchorColumn);
    const lastShown = shownColumns[Math.min(shownColumns.length - 1, startShown + mCols - 1)];
    // a batch edit marks texts (its commit writes them through editInputPipe); otherwise the copied values
    const batch = scope.isBatchEditActive();
    let values: unknown[][] = memory && !batch ? memory.values
      // a batch edit marks texts – formulas copied inside the table stay formulas (since 1.1.99)
      : memory ? matrix.map((row, r) => row.map((text, c) => memory.values[r]?.[c] instanceof CopiedFormula ? memory.values[r][c] : text))
        : matrix;
    let raw = !!memory && !batch;
    const process = this.options.processPaste;
    if (process) {
      const ctx: PasteContextIf = {
        text, html, matrix,
        target: new CellRange(anchorRow, anchorColumn, anchorRow + matrix.length - 1, lastShown),
        internal: !!memory,
      };
      const ret = process(ctx);
      if (ret === false) {
        return [];
      }
      if (Array.isArray(ret)) {
        values = ret;
        raw = false; // the app's values: through the column's editInputPipe and validate
      }
    }
    const max = this.options.maxPasteCells;
    const size = getPasteSize(values.length, values.reduce((m, r) => Math.max(m, r.length), 0), selection);
    if (size.rows * size.columns > max) {
      scope.announce(scope.getSheetTexts().pasteTooLarge(max));
      return [];
    }
    // rows are added for real writes only (a batch edit could be cancelled – the rows would stay)
    const canAddRows = this.options.pasteAddsRows && !!this.options.createRow && !batch && this.canAppendRows();
    const columnDefs = scope.tableModel.getColumnDefs?.() ?? [];
    const plan = computePastePlan({
      matrix: values, anchorRow, anchorColumn, shownColumns, rowCount, selection, canAddRows,
      isWritable: (r, c) => body.isEditable(r, c) && !isRowNumberColumnDef(columnDefs[c]),
    });
    if (plan.addRows) {
      this.appendRows(plan.addRows);
    }
    if (memory) {
      // formulas copied inside the table: their references move to the target (a cut formula moves unchanged)
      for (const cell of plan.cells) {
        cell.value = scope.resolvePastedValue(cell.value, cell.rowIndex, cell.columnIndex, !!cut);
      }
    }
    const changes: CellValueChangeIf[] = [];
    let source: CellChangeSource = "paste";
    if (cut) {
      // a cut moves only what arrives: a target that is read only, cut off or invalid keeps its source cell
      source = "cut";
      const position = new Map(shownColumns.map((c, i) => [c, i]));
      const moved: Array<[number, number]> = [];
      const targetKeys = new Set<string>();
      for (const { rowIndex, columnIndex, value } of plan.cells) {
        const v = raw ? value : this.convertPastedText(value, rowIndex, columnIndex);
        if (scope.checkPastedValue(rowIndex, columnIndex, v, raw)) {
          continue; // invalid: neither written nor moved
        }
        changes.push({ rowIndex, column: columnIndex, value: v });
        moved.push([rowIndex - anchorRow, position.get(columnIndex)! - startShown]);
        targetKeys.add(`${rowIndex}:${columnIndex}`);
      }
      for (const change of this.cutSourceChanges(cut, moved, targetKeys)) {
        changes.push(change);
      }
    } else {
      for (const { rowIndex, columnIndex, value } of plan.cells) {
        changes.push({ rowIndex, column: columnIndex, value: raw ? value : this.convertPastedText(value, rowIndex, columnIndex) });
      }
    }
    const written = changes.length ? scope.writePastedCells(changes, source, raw) : [];
    if (cut) {
      this.memory = undefined; // the cut cells moved – the clipboard content is used up (Excel)
      this.removeCutFrame();
    }
    if (plan.addRows) {
      scope.repaintHard();
    }
    let targetWritten = written.length;
    if (cut) {
      const keys = new Set(plan.cells.map(p => `${p.rowIndex}:${p.columnIndex}`));
      targetWritten = written.filter(c => keys.has(`${c.rowIndex}:${c.columnIndex}`)).length;
    }
    scope.selectBodyRange(plan.range);
    scope.announce(scope.getSheetTexts().cellsPasted(targetWritten,
      plan.skipped + plan.clipped + Math.max(0, plan.cells.length - targetWritten)));
    return written;
  }

  /** Removes the mark of cut cells (Escape, another change, {@link TableApi.cancelCut}); the clipboard keeps the text. */
  cancelCut(): void {
    if (this.memory?.cut) {
      this.memory = { ...this.memory, cut: undefined };
    }
    this.removeCutFrame();
  }

  /** Places the dashed frame of cut cells (after every render pass); removes it if the cut rows moved. */
  update(): void {
    const cut = this.memory?.cut;
    const frame = this.cutFrame;
    if (!cut || !frame) {
      return;
    }
    const scope = this.tableScope;
    const body = scope.tableModel.getBodyModel();
    const { range } = cut;
    if (range.r2 >= body.getRowCount() || this.rowObjectAt(range.r1) !== cut.rows[0]
      || this.rowObjectAt(range.r2) !== cut.rows[cut.rows.length - 1]) {
      this.removeCutFrame(); // sorted or filtered: the frame would mark other cells (the cut still moves the values)
      return;
    }
    const topLeft = scope.getBodyCellRectInHost(range.r1, range.c1);
    const bottomRight = scope.getBodyCellRectInHost(range.r2, range.c2);
    const top = Math.max(topLeft.top, topLeft.clipTop);
    const bottom = Math.min(bottomRight.top + bottomRight.height, bottomRight.clipBottom);
    const left = Math.max(topLeft.left, topLeft.clipLeft);
    const right = Math.min(bottomRight.left + bottomRight.width, bottomRight.clipRight);
    scope.getDomService().applyStyle(frame, {
      display: bottom > top && right > left ? "block" : "none",
      left: `${left}px`, // logical: right-to-left = "right"
      top: `${top}px`,
      width: `${Math.max(0, right - left)}px`,
      height: `${Math.max(0, bottom - top)}px`,
    });
  }

  /** Removes the hidden text field and the frame (table destroyed). */
  destroy(): void {
    clearTimeout(this.restoreTimer);
    this.proxy?.remove();
    this.proxy = undefined;
    this.removeCutFrame();
    this.memory = undefined;
  }

  // ------------------------------------------------------------------------------------------------ internals

  private onClipboardEvent(evt: ClipboardEvent, kind: ClipboardKind): void {
    const scope = this.tableScope;
    const host = scope.hostElement;
    // composedPath: a table in a shadow root – the document sees the event retargeted to the shadow host
    const origin = typeof evt.composedPath === "function" ? evt.composedPath()[0] : evt.target;
    const fromProxy = !!this.proxy && origin === this.proxy;
    if (!fromProxy && (activeElementOf(host) !== host || scope.isEditing() || scope.isEventInDetail?.(evt))) {
      return; // not for the table (the editor, a field of a cell renderer, the page)
    }
    if (!fromProxy && (scope.getHeaderFocus() || !scope.getActiveBodyCell())) {
      return;
    }
    if (kind !== "paste" && !this.hasBuiltInCopyService()) {
      return; // an own CopyServiceIf: COPY_2_CLIPBOARD copies (the way before 1.1.99)
    }
    const data = evt.clipboardData;
    try {
      if (!data) {
        return;
      }
      evt.preventDefault();
      if (kind !== "copy" && scope.isOverlayBlocking()) {
        return; // "Loading…": no changes
      }
      if (kind === "paste") {
        this.paste(data.getData("text/plain"), data.getData("text/html") || undefined);
      } else {
        const result = this.buildCopy(kind === "cut");
        if (result) {
          data.setData("text/plain", result.text);
          if (result.html) data.setData("text/html", result.html);
          this.remember(result, kind === "cut");
        }
      }
    } finally {
      if (fromProxy || this.armedKind) {
        this.restoreFocus();
      }
    }
  }

  private restoreFocus(): void {
    clearTimeout(this.restoreTimer);
    this.armedKind = undefined;
    const proxy = this.proxy;
    if (!proxy) {
      return;
    }
    proxy.value = "";
    if (activeElementOf(proxy) === proxy) {
      this.tableScope.hostElement.focus({ preventScroll: true });
    }
  }

  private ensureProxy(): HTMLTextAreaElement {
    if (!this.proxy || !this.proxy.isConnected) {
      const dom = this.tableScope.getDomService().domService;
      const proxy = dom.createElement<HTMLTextAreaElement>("textarea");
      dom.addClass(proxy, "ge-table-clipboard-proxy");
      dom.setAttribute(proxy, "aria-hidden", "true");
      dom.setAttribute(proxy, "tabindex", "-1");
      dom.setAttribute(proxy, "autocomplete", "off");
      dom.appendChild(this.tableScope.hostElement, proxy);
      this.proxy = proxy;
    }
    return this.proxy;
  }

  /** Stores the copy (pasting the same text pastes the values) and announces it; a cut gets its frame. */
  private remember(result: CopyResult, cut: boolean): void {
    const scope = this.tableScope;
    this.cancelCut();
    this.memory = result.processed ? undefined : {
      text: normalize(result.text),
      values: result.values,
      cut: cut ? { range: result.range, columns: result.columns, rows: this.rowObjectsOf(result.range) } : undefined,
    };
    if (this.memory?.cut) {
      this.showCutFrame();
    }
    const texts = scope.getSheetTexts();
    const message = cut ? texts.cutMarked(result.cellCount) : scope.ariaTexts.copied(result.cellCount);
    scope.announce(result.lastRangeOnly ? `${message}. ${texts.copiedLastRangeOnly()}` : message);
  }

  /** The cells of a copy: the last selected range (everything: the body), without selection the active cell. */
  private buildCopy(cut: boolean): CopyResult | undefined {
    const scope = this.tableScope;
    const model = scope.tableModel;
    const body = model.getBodyModel();
    const rowCount = body.getRowCount();
    const columnCount = model.getColumnCount();
    if (!rowCount || !columnCount) {
      return undefined;
    }
    const sm = scope.selectionModel();
    let range: CellRange | undefined;
    let lastRangeOnly = false;
    if (sm?.isAllSelected()) {
      range = new CellRange(0, 0, rowCount - 1, columnCount - 1);
    } else if (sm?.hasSelection() && sm.getRanges().length) {
      const ranges = sm.getRanges();
      const last = ranges[ranges.length - 1];
      lastRangeOnly = ranges.length > 1;
      range = new CellRange(Math.max(0, last.r1), Math.max(0, last.c1), Math.min(rowCount - 1, last.r2),
        Math.min(columnCount - 1, last.c2));
    } else {
      const cell = scope.getActiveBodyCell();
      range = cell ? CellRange.singleCell(cell[0], cell[1]) : undefined;
    }
    if (!range || range.r2 < range.r1 || range.c2 < range.c1) {
      return undefined;
    }
    const columns: number[] = [];
    for (let c = range.c1; c <= range.c2; c++) {
      const def = model.getColumnDef(c);
      if (def?.isVisible?.() === false || model.getColumnWidth(c) <= 0) continue; // hidden column
      if (isRowNumberColumnDef(def) && !def.options.exported) continue; // row numbers only with exported: true
      columns.push(c);
    }
    const cellCount = (range.r2 - range.r1 + 1) * columns.length;
    if (!columns.length) {
      return undefined;
    }
    if (cellCount > CopyService.maxCopyCells) {
      scope.announce(scope.getSheetTexts().copyTooLarge(CopyService.maxCopyCells));
      return undefined;
    }
    const raw = this.options.copyValue === "raw";
    const checkSelected = !!sm?.hasSelection() && !sm.isAllSelected();
    const texts: string[][] = [];
    const values: unknown[][] = [];
    const html: HtmlTableCellIf[][] = [];
    if (this.options.copyHeaders && !cut) { // cut cells move – a header row would be pasted as data
      const labels = columns.map(c => scope.getColumnAriaLabel(c));
      texts.push(labels);
      values.push(labels);
      html.push(labels.map(text => ({ text })));
    }
    for (let r = range.r1; r <= range.r2; r++) {
      const textRow: string[] = [];
      const valueRow: unknown[] = [];
      const htmlRow: HtmlTableCellIf[] = [];
      for (const c of columns) {
        const def = model.getColumnDef(c);
        let text: string;
        let value: unknown;
        if (checkSelected && !sm!.isSelected(r, c)) {
          text = ""; // deselected inside the range (Ctrl+click)
          value = "";
        } else if (isRowNumberColumnDef(def)) {
          text = def.getRowNumberText(r, body);
          value = text;
        } else {
          value = scope.getCopyValue(r, c); // a cell formula: the formula (pasted inside the table, since 1.1.99)
          const shown = value instanceof CopiedFormula ? value.value : value;
          // the shown text – a Date as ISO date (its default text is long and not readable by Excel), no "null"
          text = raw || shown === null || shown === undefined || shown instanceof Date ? rawText(shown) : body.getTextValueAt(r, c);
        }
        textRow.push(text);
        valueRow.push(value);
        const num = value instanceof CopiedFormula ? value.value : value;
        htmlRow.push(typeof num === "number" ? { text, num } : { text });
      }
      texts.push(textRow);
      values.push(valueRow);
      html.push(htmlRow);
    }
    let matrix = texts;
    let processed = false;
    if (this.options.processCopy) {
      const ret = this.options.processCopy({ ranges: [range], matrix: texts, cut });
      if (Array.isArray(ret)) {
        matrix = ret;
        processed = true;
      }
    }
    const text = toTsv(matrix);
    const htmlText = !this.options.html ? undefined
      : toHtmlTable(processed ? matrix.map(row => row.map(t => ({ text: t }))) : html);
    return { text, html: htmlText, values, range, columns, cellCount, lastRangeOnly, processed };
  }

  /** The visible data columns in display order (hidden and row number columns are skipped). */
  private getPasteColumns(): number[] {
    const model = this.tableScope.tableModel;
    const ret: number[] = [];
    const count = model.getColumnCount();
    for (let c = 0; c < count; c++) {
      const def = model.getColumnDef(c);
      if (model.getColumnWidth(c) > 0 && def?.isVisible?.() !== false && !isRowNumberColumnDef(def)) ret.push(c);
    }
    return ret;
  }

  /** Anchor (first row, first column) and the selected size (rows × shown columns) of a paste. */
  private getPasteAnchor(shownColumns: number[], target?: [number, number]):
    [number, number, { rows: number; columns: number } | undefined] | undefined {
    const scope = this.tableScope;
    const rowCount = scope.tableModel.getBodyModel().getRowCount();
    const firstShownFrom = (c: number) => shownColumns.find(x => x >= c);
    if (target) {
      const column = firstShownFrom(target[1]);
      return column === undefined || target[0] < 0 || target[0] >= rowCount ? undefined : [target[0], column, undefined];
    }
    const sm = scope.selectionModel();
    let range: CellRange | undefined;
    if (sm?.isAllSelected()) {
      range = new CellRange(0, 0, rowCount - 1, Number.MAX_SAFE_INTEGER);
    } else if (sm?.hasSelection() && sm.getRanges().length) {
      const ranges = sm.getRanges();
      range = ranges[ranges.length - 1];
    }
    if (range) {
      const r1 = Math.max(0, range.r1);
      const r2 = Math.min(rowCount - 1, range.r2);
      const column = firstShownFrom(Math.max(0, range.c1));
      if (column !== undefined && r2 >= r1) {
        const columns = shownColumns.filter(c => c >= range!.c1 && c <= range!.c2).length;
        return [r1, column, { rows: r2 - r1 + 1, columns }];
      }
    }
    const cell = scope.getActiveBodyCell();
    if (!cell) {
      return undefined;
    }
    const column = firstShownFrom(cell[1]);
    return column === undefined ? undefined : [cell[0], column, undefined];
  }

  /**
   * External text into a column without `editInputPipe`: converted like the editor of Excel-style editing – a
   * number into a number cell (or `editor: "number"`), `TRUE`/`FALSE` into a `true`/`false` cell, an ISO date into a
   * `Date` cell (or `editor: "date"` on a `Date`); everything else stays text. With a pipe the pipe converts.
   */
  private convertPastedText(value: unknown, rowIndex: number, columnIndex: number): unknown {
    if (typeof value !== "string") {
      return value;
    }
    const scope = this.tableScope;
    const def = scope.tableModel.getColumnDef(columnIndex);
    if (def?.editInputPipe) {
      return value;
    }
    const current = rowIndex < scope.tableModel.getBodyModel().getRowCount()
      ? scope.getTypedCellValue(rowIndex, columnIndex) : undefined;
    const text = value.trim();
    if (typeof current === "number" || def?.editor === "number") {
      return text !== "" && /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(text) ? Number(text) : value;
    }
    if (typeof current === "boolean") {
      const upper = text.toUpperCase();
      return upper === "TRUE" ? true : upper === "FALSE" ? false : value;
    }
    if (current instanceof Date) {
      const m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?$/.exec(text);
      if (!m) return value;
      return m[4] === undefined
        ? new Date(+m[1], +m[2] - 1, +m[3], current.getHours(), current.getMinutes(), current.getSeconds())
        : new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] ?? 0));
    }
    return value;
  }

  /**
   * The cut cells whose values arrived (`moved`: row and column offsets in the cut range) and that are not pasted over
   * themselves: emptied – where their rows are now (sorting, filter).
   */
  private cutSourceChanges(cut: NonNullable<ClipboardMemory["cut"]>, moved: Array<[number, number]>,
                           targetKeys: Set<string>): CellValueChangeIf[] {
    const scope = this.tableScope;
    const body = scope.tableModel.getBodyModel();
    const indexOf = this.rowIndexLookup(cut);
    const ret: CellValueChangeIf[] = [];
    for (const [dr, dc] of moved) {
      if (dr < 0 || dc < 0 || dr >= cut.rows.length || dc >= cut.columns.length) continue;
      const rowIndex = indexOf(dr);
      if (rowIndex < 0) continue; // filtered out meanwhile: the value is pasted, the hidden cell stays
      const columnIndex = cut.columns[dc];
      const def = scope.tableModel.getColumnDef(columnIndex);
      if (targetKeys.has(`${rowIndex}:${columnIndex}`) || isRowNumberColumnDef(def) || !body.isEditable(rowIndex, columnIndex)) {
        continue;
      }
      const empty = def?.emptyValue !== undefined ? def.emptyValue : (scope.getEditingOptions()?.emptyValue ?? "");
      ret.push({ rowIndex, column: columnIndex, value: empty });
    }
    return ret;
  }

  /**
   * The display index of the i-th cut row: at its old place – or, if the rows were sorted or filtered meanwhile,
   * looked up once by row object (models without row objects: the old place).
   */
  private rowIndexLookup(cut: NonNullable<ClipboardMemory["cut"]>): (i: number) => number {
    const rowCount = this.tableScope.tableModel.getBodyModel().getRowCount();
    const objects = cut.rows.every(row => row !== null && typeof row === "object");
    const unchanged = cut.rows.every((row, i) => this.rowObjectAt(cut.range.r1 + i) === row);
    if (!objects || unchanged) {
      return i => (cut.range.r1 + i < rowCount ? cut.range.r1 + i : -1);
    }
    const map = new Map<unknown, number>();
    for (let i = 0; i < rowCount; i++) map.set(this.rowObjectAt(i), i);
    return i => map.get(cut.rows[i]) ?? -1;
  }

  /** True for the table's own `CopyService` (an own `CopyServiceIf` or a subclass keeps the asynchronous way). */
  private hasBuiltInCopyService(): boolean {
    const service = this.tableScope.copyService;
    return !!service && Object.getPrototypeOf(service) === CopyService.prototype;
  }

  private rowObjectAt(rowIndex: number): unknown {
    const o = this.tableScope.tableModel.getBodyModel().getRowByIndex(rowIndex);
    return isTreeRow(o) ? (o as { data?: unknown }).data : o;
  }

  private rowObjectsOf(range: CellRange): unknown[] {
    const ret: unknown[] = [];
    for (let r = range.r1; r <= range.r2; r++) ret.push(this.rowObjectAt(r));
    return ret;
  }

  /** Rows can be added: an array of objects or arrays without grouping, tree or pivot (`getAllRows`). */
  private canAppendRows(): boolean {
    const body = this.tableScope.tableModel.getBodyModel() as unknown as { getAllRows?: () => unknown[]; getFilteredRows?: () => unknown[] };
    return typeof body.getAllRows === "function" && typeof body.getFilteredRows === "function"
      && !this.tableScope.isRowGroupingOrTree();
  }

  /** Adds `count` rows from `createRow` at the end (also at the end of the displayed rows). */
  private appendRows(count: number): void {
    const body = this.tableScope.tableModel.getBodyModel() as unknown as { getAllRows: () => unknown[]; getFilteredRows: () => unknown[] };
    const all = body.getAllRows();
    const shown = body.getFilteredRows();
    const start = shown.length;
    for (let i = 0; i < count; i++) {
      const row = this.options.createRow!(start + i);
      all.push(row);
      if (shown !== all) shown.push(row);
    }
    this.tableScope.rowsAppended();
  }

  private showCutFrame(): void {
    if (!this.cutFrame) {
      const dom = this.tableScope.getDomService();
      this.cutFrame = dom.setAriaHidden(dom.createDivWithClass("ge-table-cut-range", this.tableScope.hostElement));
    }
    this.update();
  }

  private removeCutFrame(): void {
    this.cutFrame?.remove();
    this.cutFrame = undefined;
  }
}

/** The focused element in the document or shadow root of `el`. */
function activeElementOf(el: Element): Element | null {
  const root = el.getRootNode() as Document | ShadowRoot;
  return root.activeElement ?? null;
}

/** The value of a cell as text for `copyValue: "raw"`: numbers without formatting, dates as ISO, TRUE/FALSE. */
function rawText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    const date = `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
    const time = value.getHours() || value.getMinutes() || value.getSeconds()
      ? `T${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}` : "";
    return date + time;
  }
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  if (typeof value === "object") return "";
  return String(value);
}
