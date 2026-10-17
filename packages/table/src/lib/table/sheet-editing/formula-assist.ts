import type { TableScope } from "../table-scope";
import type { TableSheet } from "../sheet/table-sheet";
import type { CellEditMode } from "./cell-editor.if";
import { FORMULA_FUNCTION_INFO, type FormulaFunctionInfoIf } from "../sheet/sheet-function-info";
import { parseRangeAddress, toCellAddress } from "../sheet/cell-address";
import { AriaTexts } from "../aria/aria-texts";
import type { AriaTextsIf } from "../aria/aria-texts.if";
import {
  callAt, findReferences, functionPrefixAt, isInsertionPoint, signatureArguments, toggleAbsolute,
  type FormulaTextRefIf,
} from "./formula-text";

/** A reference inserted by pointing: where it stands in the text and which cells it names (display row, model column). */
interface PointerState {
  start: number;
  end: number;
  anchor: [number, number];
  cell: [number, number];
}

const COLORS = 8;
const MAX_SUGGESTIONS = 50;

/**
 * The formula input of the cell editor (prompt 013 stage 6, `tableOptions.cellFormulas`): pointing (arrow keys, Shift
 * + arrow keys, a click or a drag insert references while the caret stands at an insertion point), F4 (`$`), colored
 * references in the text (a mirror behind the transparent text of the input) with frames around the referenced cells,
 * function suggestions (an ARIA combobox with a listbox) and the argument hint (a tooltip). Created by the
 * {@link CellEditorService} for a text field in a formula column.
 *
 * @category Internals
 * @since 1.1.99
 */
export class FormulaAssist {

  private readonly mirror: HTMLDivElement;
  private readonly list: HTMLDivElement;
  private readonly hint: HTMLDivElement;
  private frames: HTMLDivElement[] = [];
  private suggestions: FormulaFunctionInfoIf[] = [];
  private active = 0;
  /** Escape closed the list: it stays closed until the text changes. */
  private listClosed = false;
  private pointer?: PointerState;
  private cellCache?: { signature: unknown[]; cells: Map<string, [number, number, number, number] | undefined> };
  private composing = false;
  private drag?: AbortController;
  private readonly abort = new AbortController();
  private readonly ids: { list: string; hint: string; option: (name: string) => string };
  private readonly functions: FormulaFunctionInfoIf[];

  constructor(
    private readonly scope: TableScope,
    private readonly sheet: TableSheet,
    private readonly input: HTMLInputElement,
    private readonly container: HTMLDivElement,
    private readonly editedCell: () => [number, number],
    private readonly changed: () => void,
    idPrefix: string,
  ) {
    // option ids by name: another list (=S → =SU) gives another active id – screen readers announce it
    this.ids = { list: `${idPrefix}-functions`, hint: `${idPrefix}-hint`, option: (name: string) => `${idPrefix}-fn-${name.replace(/[^A-Za-z0-9_-]/g, "_")}` };
    const own = Object.keys(sheet.options.functions ?? {}).map(name => name.toUpperCase());
    this.functions = [
      ...FORMULA_FUNCTION_INFO.filter(info => !own.includes(info.name)),
      ...own.map(name => ({ name, signature: `${name}(…)`, description: "", group: "Math" as const })),
    ].sort((a, b) => a.name.localeCompare(b.name));

    const dom = scope.getDomService().domService;
    this.mirror = dom.createElement<HTMLDivElement>("div");
    dom.addClass(this.mirror, "ge-table-formula-mirror");
    dom.setAttribute(this.mirror, "aria-hidden", "true");
    container.insertBefore(this.mirror, input);

    this.list = dom.createElement<HTMLDivElement>("div");
    dom.addClass(this.list, "ge-table-formula-list");
    dom.setAttribute(this.list, "id", this.ids.list);
    dom.setAttribute(this.list, "role", "listbox");
    dom.setAttribute(this.list, "aria-label", this.texts().functionSuggestions());
    this.list.style.display = "none";
    dom.appendChild(container, this.list);

    this.hint = dom.createElement<HTMLDivElement>("div");
    dom.addClass(this.hint, "ge-table-formula-hint");
    dom.setAttribute(this.hint, "id", this.ids.hint);
    dom.setAttribute(this.hint, "role", "tooltip");
    this.hint.style.display = "none";
    dom.appendChild(container, this.hint);

    const signal = this.abort.signal;
    input.addEventListener("input", () => this.onInput(), { signal });
    input.addEventListener("compositionstart", () => { this.composing = true; this.refresh(); }, { signal });
    input.addEventListener("compositionend", () => { this.composing = false; this.refresh(); }, { signal });
    input.addEventListener("keydown", () => requestAnimationFrame(() => this.syncScroll()), { signal });
    for (const type of ["keyup", "click", "select", "scroll"]) {
      input.addEventListener(type, () => this.refreshCaret(), { signal });
    }
    // a click on a suggestion takes it (pointerdown: before the input loses the focus)
    this.list.addEventListener("pointerdown", (evt: PointerEvent) => {
      evt.preventDefault();
      const option = (evt.target as Element).closest?.(".ge-table-formula-option");
      const index = option ? Number(option.getAttribute("data-index")) : -1;
      if (index >= 0) this.accept(index);
    }, { signal });
    this.refresh();
  }

  /**
   * A key in the editor: the suggestion list, F4 and pointing. True if it was used (the caller stops it).
   *
   * @param {KeyboardEvent} evt - the key
   * @param {CellEditMode} mode - "enter" (typing) or "edit" (F2: arrow keys move the caret)
   * @returns {boolean} true if handled
   */
  onKeyDown(evt: KeyboardEvent, mode: CellEditMode): boolean {
    const text = this.input.value;
    if (!text.startsWith("=")) {
      return false;
    }
    const plain = !evt.ctrlKey && !evt.metaKey && !evt.altKey;
    if (this.isListOpen() && plain) {
      switch (evt.key) {
        case "ArrowDown":
        case "ArrowUp":
          this.active = (this.active + (evt.key === "ArrowDown" ? 1 : -1) + this.suggestions.length) % this.suggestions.length;
          this.renderList();
          return true;
        case "Enter":
        case "Tab":
          if (evt.shiftKey) return false;
          this.accept(this.active);
          return true;
        case "Escape":
          this.listClosed = true; // a second Escape cancels the editor
          this.refresh();
          return true;
      }
    }
    if (evt.key === "F2") {
      this.pointer = undefined; // F2 switches the mode: the arrow keys move the caret now (or point anew)
      return false;
    }
    if (evt.key === "F4" && plain) {
      return this.toggleReferenceAtCaret();
    }
    const dirs: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    const dir = dirs[evt.key];
    if (!dir || !plain || !this.canPoint(mode)) {
      return false;
    }
    let [dRow, dCol] = dir;
    if (this.scope.isRtl()) dCol = -dCol; // right-to-left: ← goes forward
    const from = this.pointer?.cell ?? this.editedCell();
    const to = this.step(from, dRow, dCol);
    const anchor = evt.shiftKey ? (this.pointer?.anchor ?? from) : to;
    this.point(anchor, to);
    return true;
  }

  /**
   * A pointer press outside the editor: while pointing is possible, a body cell is inserted as reference (Shift: a
   * range from the last pointed cell) and dragging spans a range. True if it was used – the click then neither
   * commits nor moves the selection.
   *
   * @param {PointerEvent} evt - the press
   * @returns {boolean} true if handled
   */
  onPointerDown(evt: PointerEvent): boolean {
    if (evt.button !== 0 || !this.input.value.startsWith("=") || !this.canPoint("enter")) {
      return false; // only the primary button points
    }
    const cellDiv = (evt.target as Element | null)?.closest?.('.ge-table-col-div[data-area="body"]');
    const row = Number(cellDiv?.getAttribute("data-row-index"));
    const col = Number(cellDiv?.getAttribute("data-col-index"));
    if (!cellDiv || !(row >= 0) || !(col >= 0) || this.sheet.engineColumn(col) === undefined) {
      return false;
    }
    const cell: [number, number] = [row, col];
    const anchor = evt.shiftKey && this.pointer ? this.pointer.anchor : cell;
    this.point(anchor, cell, false);
    this.startDrag(anchor);
    return true;
  }

  /** @returns {string[]} the ids of the suggestion list and the hint (owned by the edited cell, `aria-owns`) */
  getOwnedIds(): string[] {
    return [this.ids.list, this.ids.hint];
  }

  /** Places the frames and the popups (after every render pass and on changes). */
  update(): void {
    this.renderFrames();
  }

  /** Removes everything (the editor closes). */
  destroy(): void {
    this.abort.abort();
    this.drag?.abort();
    this.mirror.remove();
    this.list.remove();
    this.hint.remove();
    for (const frame of this.frames) frame.remove();
    this.frames = [];
    this.input.classList.remove("ge-table-formula-input");
    for (const name of ["role", "aria-expanded", "aria-controls", "aria-autocomplete", "aria-activedescendant", "aria-describedby"]) {
      this.input.removeAttribute(name);
    }
  }

  // ------------------------------------------------------------------------------------------------ internals

  private texts(): Required<Pick<AriaTextsIf, "functionSuggestions" | "referenceInserted">> {
    const texts = (this.scope.ariaTexts ?? {}) as Partial<AriaTextsIf>;
    const defaults = new AriaTexts();
    return {
      functionSuggestions: () => (texts.functionSuggestions ?? defaults.functionSuggestions).call(texts),
      referenceInserted: (r: string) => (texts.referenceInserted ?? defaults.referenceInserted).call(texts, r),
    };
  }

  private onInput(): void {
    this.pointer = undefined; // typing ends pointing (Excel)
    this.listClosed = false;
    this.refresh();
  }

  private caret(): number {
    return this.input.selectionStart ?? this.input.value.length;
  }

  private collapsed(): boolean {
    return this.input.selectionStart === this.input.selectionEnd;
  }

  /** Pointing: right after an inserted reference, or (typing mode) at an insertion point. */
  private canPoint(mode: CellEditMode): boolean {
    const text = this.input.value;
    if (!this.collapsed() || this.composing) return false;
    const caret = this.caret();
    if (this.pointer && caret === this.pointer.end) return true;
    return mode === "enter" && isInsertionPoint(text, caret);
  }

  /** The next cell in a direction: rows clamped, columns over shown data columns. */
  private step(from: [number, number], dRow: number, dCol: number): [number, number] {
    const rowCount = this.scope.tableModel.getBodyModel().getRowCount();
    const row = Math.min(Math.max(0, from[0] + dRow), rowCount - 1);
    let col = from[1];
    if (dCol) {
      const next = this.scope.nextShownColumn(col, dCol);
      if (this.sheet.engineColumn(next) !== undefined) col = next;
    }
    return [row, col];
  }

  /** The reference text of a pointed range: one cell or the bounding range (physical rows, data columns). */
  private referenceText(anchor: [number, number], cell: [number, number]): string | undefined {
    const r1 = this.sheet.physicalRow(anchor[0]);
    const r2 = this.sheet.physicalRow(cell[0]);
    const c1 = this.sheet.engineColumn(anchor[1]);
    const c2 = this.sheet.engineColumn(cell[1]);
    if (r1 === undefined || r2 === undefined || c1 === undefined || c2 === undefined) return undefined;
    if (r1 !== r2 && !this.isContiguous(anchor[0], cell[0], r1, r2)) {
      return undefined; // sorted or filtered: the shown rows are not one range of the sheet
    }
    const from = toCellAddress(Math.min(r1, r2), Math.min(c1, c2));
    const to = toCellAddress(Math.max(r1, r2), Math.max(c1, c2));
    return from === to ? from : `${from}:${to}`;
  }

  /** True if the display rows d1…d2 are exactly the physical rows p1…p2 (in any order). */
  private isContiguous(d1: number, d2: number, p1: number, p2: number): boolean {
    if (Math.abs(d1 - d2) !== Math.abs(p1 - p2)) return false;
    const lo = Math.min(p1, p2);
    const hi = Math.max(p1, p2);
    for (let d = Math.min(d1, d2); d <= Math.max(d1, d2); d++) {
      const p = this.sheet.physicalRow(d);
      if (p === undefined || p < lo || p > hi) return false;
    }
    return true;
  }

  /** Inserts (or replaces the last pointed) reference at the caret. */
  private point(anchor: [number, number], cell: [number, number], announce = true): void {
    const ref = this.referenceText(anchor, cell);
    if (!ref) return;
    const text = this.input.value;
    const caret = this.caret();
    const replace = this.pointer && caret === this.pointer.end;
    const start = replace ? this.pointer!.start : caret;
    const end = replace ? this.pointer!.end : caret;
    this.input.value = text.slice(0, start) + ref + text.slice(end);
    const newEnd = start + ref.length;
    this.input.setSelectionRange(newEnd, newEnd);
    this.pointer = { start, end: newEnd, anchor, cell };
    this.scope.ensureRowIsVisible(cell[0]);
    this.scope.ensureColumnIsVisible(cell[1]);
    if (announce) this.scope.announce(this.texts().referenceInserted(ref));
    this.listClosed = false;
    this.refresh();
    this.changed();
  }

  private startDrag(anchor: [number, number]): void {
    this.drag?.abort();
    const drag = new AbortController();
    this.drag = drag;
    const doc = this.input.ownerDocument;
    const host = this.scope.hostElement;
    let last = this.pointer?.cell;
    doc.addEventListener("pointermove", (evt: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      const cell = this.scope.getBodyCellAtHostPoint(this.scope.clientXToHostX(evt.clientX), evt.clientY - rect.top - host.clientTop);
      if (cell[0] < 0 || this.sheet.engineColumn(cell[1]) === undefined) return;
      if (last && last[0] === cell[0] && last[1] === cell[1]) return;
      last = cell;
      this.point(anchor, cell, false);
    }, { signal: drag.signal });
    const end = () => {
      drag.abort();
      const text = this.pointer ? this.input.value.slice(this.pointer.start, this.pointer.end) : "";
      if (text) this.scope.announce(this.texts().referenceInserted(text)); // once, not per move
    };
    doc.addEventListener("pointerup", end, { signal: drag.signal });
    doc.addEventListener("pointercancel", end, { signal: drag.signal });
  }

  /** F4: the next `$` form of the reference at (or right before) the caret. */
  private toggleReferenceAtCaret(): boolean {
    const text = this.input.value;
    const caret = this.caret();
    const ref = findReferences(text).find(r => caret >= r.start && caret <= r.end);
    if (!ref) return false;
    const next = toggleAbsolute(ref.text);
    this.input.value = text.slice(0, ref.start) + next + text.slice(ref.end);
    const end = ref.start + next.length;
    this.input.setSelectionRange(end, end);
    if (this.pointer && this.pointer.start === ref.start) this.pointer.end = end;
    this.refresh();
    this.changed();
    return true;
  }

  private isListOpen(): boolean {
    return this.list.style.display !== "none" && this.suggestions.length > 0;
  }

  /** Takes a suggestion: the typed name becomes `NAME(`. */
  private accept(index: number): void {
    const info = this.suggestions[index];
    const prefix = functionPrefixAt(this.input.value, this.caret());
    if (!info || !prefix) return;
    const text = this.input.value;
    const insert = `${info.name}(`;
    this.input.value = text.slice(0, prefix.start) + insert + text.slice(prefix.start + prefix.prefix.length);
    const caret = prefix.start + insert.length;
    this.input.setSelectionRange(caret, caret);
    this.pointer = undefined;
    this.refresh();
    this.changed();
  }

  /** The caret moved: list and hint follow (no new colors needed). */
  private refreshCaret(): void {
    this.syncScroll();
    this.renderPopups();
  }

  private refresh(): void {
    this.renderMirror();
    this.renderFrames();
    this.renderPopups();
  }

  private syncScroll(): void {
    this.mirror.scrollLeft = this.input.scrollLeft;
  }

  /** The colors of the references: by first occurrence, the same reference the same color. */
  private colored(): Array<FormulaTextRefIf & { color: number }> {
    const colors = new Map<string, number>();
    return findReferences(this.input.value).map(ref => {
      let color = colors.get(ref.key);
      if (color === undefined) colors.set(ref.key, color = colors.size % COLORS);
      return { ...ref, color };
    });
  }

  private renderMirror(): void {
    const text = this.input.value;
    const show = text.startsWith("=") && !this.composing;
    const mirror = this.mirror;
    mirror.textContent = "";
    this.input.classList.toggle("ge-table-formula-input", show);
    mirror.style.display = show ? "" : "none";
    if (!show) return;
    const dom = this.scope.getDomService().domService;
    const line = dom.createElement<HTMLSpanElement>("span"); // one flex item: the text is laid out as one line
    mirror.appendChild(line);
    let at = 0;
    for (const ref of this.colored()) {
      if (ref.start > at) line.appendChild(dom.createText(text.slice(at, ref.start)));
      const span = dom.createElement<HTMLSpanElement>("span");
      dom.addClass(span, `ge-table-formula-ref-text-${ref.color}`);
      span.textContent = ref.text;
      line.appendChild(span);
      at = ref.end;
    }
    if (at < text.length) line.appendChild(dom.createText(text.slice(at)));
    this.syncScroll();
  }

  /** One frame per referenced cell or range that is shown (a reference to a hidden row has none). */
  private renderFrames(): void {
    const wanted: Array<{ color: number; rect: { left: number; top: number; width: number; height: number } }> = [];
    if (this.input.value.startsWith("=")) {
      const seen = new Set<string>();
      for (const ref of this.colored()) {
        if (seen.has(ref.key)) continue;
        seen.add(ref.key);
        const rect = this.frameRect(ref.text);
        if (rect) wanted.push({ color: ref.color, rect });
      }
    }
    const dom = this.scope.getDomService();
    while (this.frames.length > wanted.length) this.frames.pop()!.remove();
    while (this.frames.length < wanted.length) {
      const frame = dom.createDivWithClass("ge-table-formula-ref", this.scope.hostElement);
      dom.domService.setAttribute(frame, "aria-hidden", "true");
      this.frames.push(frame);
    }
    wanted.forEach(({ color, rect }, i) => {
      const frame = this.frames[i];
      frame.className = `ge-table-formula-ref ge-table-formula-ref-${color}`;
      dom.setStyle(frame, "left", `${rect.left}px`); // logical: right-to-left = "right"
      frame.style.top = `${rect.top}px`;
      frame.style.width = `${rect.width}px`;
      frame.style.height = `${rect.height}px`;
    });
  }

  /** The visible rectangle of a reference in host coordinates, `undefined` if nothing of it is shown. */
  private frameRect(text: string): { left: number; top: number; width: number; height: number } | undefined {
    const cells = this.frameCells(text);
    if (!cells) return undefined;
    const [r1, r2, c1, c2] = cells;
    const a = this.scope.getBodyCellRectInHost(Math.min(r1, r2), Math.min(c1, c2));
    const b = this.scope.getBodyCellRectInHost(Math.max(r1, r2), Math.max(c1, c2));
    const left = Math.max(Math.min(a.left, b.left), Math.min(a.clipLeft, b.clipLeft));
    const right = Math.min(Math.max(a.left + a.width, b.left + b.width), Math.max(a.clipRight, b.clipRight));
    const top = Math.max(a.top, a.clipTop);
    const bottom = Math.min(b.top + b.height, b.clipBottom);
    return right > left && bottom > top ? { left, top, width: right - left, height: bottom - top } : undefined;
  }

  /**
   * The display rows and model columns of a reference's corners – cached while the text, the row count and the
   * order stay (finding a display row may scan all rows of a sorted table; the frames are placed on every scroll).
   */
  private frameCells(text: string): [number, number, number, number] | undefined {
    const body = this.scope.tableModel.getBodyModel();
    const n = body.getRowCount();
    const signature = [this.input.value, n, n ? body.getRowByIndex(0) : undefined, n ? body.getRowByIndex(n - 1) : undefined];
    if (!this.cellCache || this.cellCache.signature.some((v, i) => v !== signature[i])) {
      this.cellCache = { signature, cells: new Map() };
    }
    const cache = this.cellCache.cells;
    if (cache.has(text)) return cache.get(text);
    const range = parseRangeAddress(text);
    let ret: [number, number, number, number] | undefined;
    if (range) {
      const r1 = range.wholeColumns ? 0 : this.sheet.displayRow(range.from.row);
      const r2 = range.wholeColumns ? n - 1 : this.sheet.displayRow(Math.min(range.to.row, this.sheetRows() - 1));
      const c1 = range.wholeRows ? this.firstDataColumn() : this.sheet.modelColumn(range.from.col);
      const c2 = range.wholeRows ? this.lastDataColumn() : this.sheet.modelColumn(range.to.col);
      ret = r1 < 0 || r2 < 0 || c1 < 0 || c2 < 0 ? undefined : [r1, r2, c1, c2];
    }
    cache.set(text, ret);
    return ret;
  }

  /** The number of physical rows (a range beyond them ends at the last one). */
  private sheetRows(): number {
    return this.sheet.rowCount();
  }

  private firstDataColumn(): number {
    for (let c = 0; c < this.scope.tableModel.getColumnCount(); c++) {
      if (this.sheet.engineColumn(c) !== undefined) return c;
    }
    return -1;
  }

  private lastDataColumn(): number {
    let last = -1;
    for (let c = 0; c < this.scope.tableModel.getColumnCount(); c++) {
      if (this.sheet.engineColumn(c) !== undefined) last = c;
    }
    return last;
  }

  /** The suggestion list (a function name is typed) or the argument hint (inside a call). */
  private renderPopups(): void {
    const dom = this.scope.getDomService().domService;
    const input = this.input;
    const text = input.value;
    const formula = text.startsWith("=");
    const caret = this.caret();
    const prefix = formula && this.collapsed() && !this.composing ? functionPrefixAt(text, caret) : undefined;
    const upper = prefix?.prefix.toUpperCase();
    const before = this.suggestions.map(s => s.name).join();
    this.suggestions = upper ? this.functions.filter(f => f.name.startsWith(upper)).slice(0, MAX_SUGGESTIONS) : [];
    if (this.suggestions.map(s => s.name).join() !== before) this.active = 0;
    const open = this.suggestions.length > 0 && !this.listClosed;
    // a combobox for the whole session (a role change while focused is missed by some screen readers)
    dom.setAttribute(input, "role", "combobox");
    dom.setAttribute(input, "aria-autocomplete", "list");
    dom.setAttribute(input, "aria-controls", this.ids.list);
    dom.setAttribute(input, "aria-expanded", String(open));
    this.list.style.display = open ? "" : "none";
    if (open) {
      this.renderList();
    } else {
      input.removeAttribute("aria-activedescendant");
    }
    // the hint: inside a call of a known function, while no list is open
    const call = formula && !open && !this.composing ? callAt(text, caret) : undefined;
    const info = call ? this.functions.find(f => f.name === call.name) : undefined;
    this.hint.textContent = "";
    if (!info) {
      this.hint.style.display = "none";
      input.removeAttribute("aria-describedby");
      return;
    }
    const args = signatureArguments(info.signature);
    const variadic = args[args.length - 1] === "…";
    const current = variadic && call!.argument >= args.length - 1 ? args.length - 2 : call!.argument;
    this.hint.appendChild(dom.createText(`${info.name}(`));
    args.forEach((arg, i) => {
      if (i) this.hint.appendChild(dom.createText(", "));
      if (i === current) {
        const b = dom.createElement<HTMLElement>("b");
        b.textContent = arg;
        this.hint.appendChild(b);
      } else {
        this.hint.appendChild(dom.createText(arg));
      }
    });
    this.hint.appendChild(dom.createText(")"));
    this.hint.style.display = "";
    dom.setAttribute(input, "aria-describedby", this.ids.hint);
  }

  private renderList(): void {
    const dom = this.scope.getDomService().domService;
    const list = this.list;
    list.textContent = "";
    this.suggestions.forEach((info, i) => {
      const option = dom.createElement<HTMLDivElement>("div");
      dom.addClass(option, "ge-table-formula-option");
      dom.setAttribute(option, "id", this.ids.option(info.name));
      dom.setAttribute(option, "role", "option");
      dom.setAttribute(option, "data-index", String(i));
      dom.setAttribute(option, "aria-selected", String(i === this.active));
      const name = dom.createElement<HTMLSpanElement>("span");
      dom.addClass(name, "ge-table-formula-option-name");
      name.textContent = info.name;
      option.appendChild(name);
      if (info.description) {
        const description = dom.createElement<HTMLSpanElement>("span");
        dom.addClass(description, "ge-table-formula-option-description");
        description.textContent = info.description;
        option.appendChild(description);
      }
      list.appendChild(option);
    });
    dom.setAttribute(this.input, "aria-activedescendant", this.ids.option(this.suggestions[this.active].name));
    const activeOption = list.children[this.active] as HTMLElement | undefined;
    activeOption?.scrollIntoView?.({ block: "nearest" });
  }
}
