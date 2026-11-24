import type { GeFilterEventSource } from "../data/common/event/ge-filter-event";
import type { SideIdent } from "../data/side-ident.type";
import type { ColumnDefIf } from "../data/tablemodel/column/column-def.if";
import type { ConvenienceDomService } from "../service/convenience-dom.service";
import type { TableScope } from "../table-scope";
import type { ColumnFilterColumnOptionsIf, FilterRowOptionsIf } from "./column-filter-options.if";
import { formatFilterCondition, parseFilterInput } from "./parse-filter-input";

interface FilterRowCell {
  key: string;
  columnIndex: number;
  filterable: boolean;
  side: SideIdent;
  el: HTMLDivElement;
  input?: HTMLInputElement;
  clearBtn?: HTMLButtonElement;
  narrowBtn?: HTMLButtonElement;
  parked: boolean;
  lastLeft: number;
  lastWidth: number;
  lastColIndex: number;
  lastLabel: string;
  lastNarrow: boolean;
}

interface SideSlot {
  side: SideIdent;
  container: HTMLDivElement;
  row: HTMLDivElement;
  lastLeft: number;
  lastWidth: number;
  lastVisible: boolean;
}

const SVG_NS = "http://www.w3.org/2000/svg";

function getColumnPlaceholder(def: ColumnDefIf | undefined, fallback: string): string {
  if (def?.filter && typeof def.filter === "object") {
    const ph = (def.filter as Partial<ColumnFilterColumnOptionsIf>).placeholder;
    if (ph !== undefined) {
      return ph;
    }
  }
  return fallback;
}

function createFilterGlyphSvg(doc: Document): SVGSVGElement {
  const svg = doc.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 16 16");
  svg.setAttribute("width", "12");
  svg.setAttribute("height", "12");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  const path = doc.createElementNS(SVG_NS, "path");
  path.setAttribute("fill", "currentColor");
  path.setAttribute("d", "M2 3.25A.75.75 0 0 1 2.75 2.5h10.5a.75.75 0 0 1 .58 1.22L9.75 8.6v4.15a.75.75 0 0 1-1.17.62l-2-1.33a.75.75 0 0 1-.33-.62V8.6L2.17 3.72A.75.75 0 0 1 2 3.25Z");
  svg.appendChild(path);
  return svg;
}

/**
 * Persistent filter row below the column titles ({@link TableOptionsIf.filterRow}).
 *
 * Lives in its own `ge-table-filter-row-layer` inside the table host so virtual header re-renders (live data,
 * sorting, scrolling) never rebuild the `<input>` elements or lose focus, caret position or IME composition.
 * Only visible columns are kept in the DOM; a focused input that scrolls out of view is parked with
 * `clip-path: inset(100%)` instead of detached.
 *
 * @category Internals
 * @since 1.1.114
 */
export class FilterRowService {

  private visible: boolean;
  private readonly supported: boolean;
  private readonly dom: ConvenienceDomService;
  private readonly layer: HTMLDivElement;
  private readonly sides: Record<SideIdent, SideSlot>;
  private readonly cells = new Map<string, FilterRowCell>();
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();
  private readonly drafts = new Map<string, string>();
  private readonly abortController = new AbortController();

  private lastLayerTop = -1;
  private lastLayerWidth = -1;
  private lastLayerHeight = -1;
  private lastLayerVisible = false;
  private destroyed = false;

  constructor(
    private readonly scope: TableScope,
    readonly options: FilterRowOptionsIf,
  ) {
    this.dom = scope.getDomService();
    this.visible = options.visible;
    const filterable = scope.columnFilterService.isBodyFilterable();
    const managed = scope.columnFilterService.getOptions().managed;
    this.supported = filterable || !managed;
    if (!this.supported) {
      console.warn("GuiExpert Table – filterRow is ignored: the body area model is not filterable (set columnFilter: { managed: false } for server-side filtering).");
    }

    const host = scope.hostElement;
    this.layer = this.dom.applyStylePosistionAbsolute(
      this.dom.createDivWithClass("ge-table-filter-row-layer", host),
    );
    this.dom.setAttribute(this.layer, "role", "presentation");
    this.dom.applyDisplayNoneStyle(this.layer);

    this.sides = {
      west: this.createSideSlot("west"),
      center: this.createSideSlot("center"),
      east: this.createSideSlot("east"),
    };
  }

  /** Whether the filter row is currently shown (configured, supported, visible and header is visible). */
  isVisible(): boolean {
    return !this.destroyed && this.supported && this.visible && this.scope.tableModel.isHeaderVisibe();
  }

  /** Configured visibility flag (independent of `setHeaderVisible(false)`). */
  getVisibleOption(): boolean {
    return this.visible;
  }

  /** Extra height (px) reserved in `TableModel.recalcPadding()` below the header rows. */
  getReservedHeight(): number {
    return this.isVisible() ? this.options.height : 0;
  }

  /** Shows or hides the filter row without clearing active filters; returns `true` if visibility changed. */
  setVisible(visible: boolean): boolean {
    const next = Boolean(visible);
    if (this.visible === next) {
      return false;
    }
    this.visible = next;
    if (!next) {
      this.hideLayer();
    }
    return true;
  }

  /** True if a DOM event originated inside the filter row layer (used for event isolation without `stopPropagation`). */
  isInLayer(evt: Event): boolean {
    if (this.destroyed) {
      return false;
    }
    const path = evt.composedPath?.();
    if (path?.length) {
      return path.includes(this.layer);
    }
    return evt.target instanceof Node && this.layer.contains(evt.target);
  }

  /**
   * Positions the filter row layer and virtualizes visible column cells in the same frame as `RenderScope`.
   * Called from `TableScope.afterRenderPass()`.
   */
  update(): void {
    if (this.destroyed) {
      return;
    }
    if (!this.isVisible()) {
      this.hideLayer();
      return;
    }

    const model = this.scope.tableModel;
    const headerAreaHeight = this.getHeaderRowsHeight();
    const layoutWidth = this.scope.getLayoutWidth();
    const padding = model.getPadding();
    const westW = padding.left;
    const eastW = padding.right;
    const centerW = Math.max(0, layoutWidth - westW - eastW);
    const height = this.options.height;

    if (!this.lastLayerVisible) {
      this.dom.applyDisplayBlockStyle(this.layer);
      this.lastLayerVisible = true;
    }
    if (this.lastLayerTop !== headerAreaHeight || this.lastLayerWidth !== layoutWidth || this.lastLayerHeight !== height) {
      this.dom.applyStyle(this.layer, {
        top: `${headerAreaHeight}px`,
        left: "0px",
        width: `${layoutWidth}px`,
        height: `${height}px`,
      });
      this.lastLayerTop = headerAreaHeight;
      this.lastLayerWidth = layoutWidth;
      this.lastLayerHeight = height;
    }

    this.layoutSide(this.sides.west, 0, westW, westW > 0);
    this.layoutSide(this.sides.center, westW, centerW, centerW > 0);
    this.layoutSide(this.sides.east, layoutWidth - eastW, eastW, eastW > 0);

    const colCount = model.getColumnCount();
    const fixedLeft = model.getFixedLeftColumnCount();
    const fixedRight = model.getFixedRightColumnCount();
    const centerEnd = Math.max(fixedLeft, colCount - fixedRight);
    const ariaInfo = this.scope.getAriaGridInfo();
    const filterRowIdx = ariaInfo.filterRowIndex();
    const seen = new Set<string>();

    // West fixed columns
    let x = 0;
    for (let c = 0; c < fixedLeft && c < colCount; c++) {
      const w = model.getColumnWidth(c);
      if (w > 0) {
        this.mountOrUpdateCell("west", c, x, w, ariaInfo.colIndex(c), seen);
        x += w;
      }
    }

    // Center scrollable columns (virtualized)
    x = -this.scope.getContentScrollLeft();
    for (let c = fixedLeft; c < centerEnd; c++) {
      const w = model.getColumnWidth(c);
      if (w > 0) {
        if (x + w > 0 && x < centerW) {
          this.mountOrUpdateCell("center", c, x, w, ariaInfo.colIndex(c), seen);
        }
        x += w;
        if (x >= centerW) {
          break;
        }
      }
    }

    // East fixed columns
    x = 0;
    for (let c = centerEnd; c < colCount; c++) {
      const w = model.getColumnWidth(c);
      if (w > 0) {
        this.mountOrUpdateCell("east", c, x, w, ariaInfo.colIndex(c), seen);
        x += w;
      }
    }

    // Remove or park cells that are no longer visible
    const toDelete: string[] = [];
    this.cells.forEach((cell, key) => {
      if (seen.has(key)) {
        return;
      }
      if (this.isCellFocused(cell)) {
        this.parkCell(cell);
      } else {
        cell.el.remove();
        toDelete.push(key);
      }
    });
    for (let i = 0; i < toDelete.length; i++) {
      this.cells.delete(toDelete[i]);
    }

    this.updateSideRoles(filterRowIdx);
  }

  /**
   * Synchronizes mounted filter inputs after a filter state change.
   * Changes from `"row"` leave the currently focused input untouched so caret and live typing never jump.
   */
  syncFromFilters(source: GeFilterEventSource): void {
    if (this.destroyed) {
      return;
    }
    if (source !== "row") {
      this.clearAllTimers();
      this.drafts.clear();
    }
    const texts = this.scope.columnFilterService.getTexts();
    this.cells.forEach((cell) => {
      if (!cell.filterable || !cell.input) {
        return;
      }
      const filter = this.scope.columnFilterService.getColumnFilter(cell.key);
      const isValuesFilter = !!(filter?.values && filter.values.length > 0) || (filter?.values !== undefined && filter.values.length === 0);
      if (source !== "row" || !this.isCellFocused(cell)) {
        const formatted = filter ? formatFilterCondition(filter, texts, this.scope.columnFilterService.getOptions().locale) : "";
        if (cell.input.value !== formatted) {
          cell.input.value = formatted;
        }
      }
      this.applyCellFilterState(cell, filter !== undefined, isValuesFilter);
    });
  }

  /**
   * Focuses the filter input of the given column index (scrolling it into view first if needed).
   * Returns `false` if the filter row is hidden or the column is not filterable/visible.
   */
  focusColumn(columnIndex: number): boolean {
    if (!this.isVisible()) {
      return false;
    }
    const model = this.scope.tableModel;
    if (columnIndex < 0 || columnIndex >= model.getColumnCount()) {
      return false;
    }
    if (model.getColumnWidth(columnIndex) <= 0 || !this.scope.columnFilterService.isColumnFilterable(columnIndex)) {
      return false;
    }
    this.scope.ensureColumnIsVisible(columnIndex);
    // Ensure cell exists even if ensureColumnIsVisible did not trigger a render
    this.update();
    const key = this.columnKey(columnIndex);
    const cell = this.cells.get(key);
    if (!cell?.input) {
      return false;
    }
    cell.input.focus();
    return true;
  }

  /** Focuses the filter input of `columnIndex`, or falls back to the first shown filterable column. */
  focusActiveOrFirstColumn(preferredColumnIndex?: number): boolean {
    if (!this.isVisible()) {
      return false;
    }
    if (preferredColumnIndex !== undefined && this.focusColumn(preferredColumnIndex)) {
      return true;
    }
    const colCount = this.scope.tableModel.getColumnCount();
    for (let c = 0; c < colCount; c++) {
      if (this.scope.tableModel.getColumnWidth(c) > 0 && this.scope.columnFilterService.isColumnFilterable(c)) {
        return this.focusColumn(c);
      }
    }
    return false;
  }

  /** Releases all timers, event listeners and DOM nodes. */
  destroy(): void {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;
    this.clearAllTimers();
    this.drafts.clear();
    this.abortController.abort();
    this.cells.clear();
    this.layer.remove();
  }

  // ------------------------------------------------------------------ internals

  private createSideSlot(side: SideIdent): SideSlot {
    const container = this.dom.applyStylePosistionAbsolute(
      this.dom.createDivWithClass(`ge-table-filter-side ge-table-filter-side-${side}`, this.layer),
    );
    this.dom.setAttribute(container, "id", this.scope.ariaIds.filterRowGroup(side));
    this.dom.setAttribute(container, "role", "presentation");
    this.dom.applyStyle(container, { top: "0px", height: "100%", overflow: "hidden" });

    const row = this.dom.createDivWithClass("ge-table-filter-row", container);
    this.dom.setAttribute(row, "role", "presentation");
    this.dom.applyStyle(row, { position: "relative", width: "100%", height: "100%" });

    return { side, container, row, lastLeft: -1, lastWidth: -1, lastVisible: false };
  }

  private layoutSide(slot: SideSlot, left: number, width: number, visible: boolean): void {
    if (slot.lastVisible !== visible) {
      if (visible) {
        this.dom.applyDisplayBlockStyle(slot.container);
      } else {
        this.dom.applyDisplayNoneStyle(slot.container);
      }
      slot.lastVisible = visible;
    }
    if (visible && (slot.lastLeft !== left || slot.lastWidth !== width)) {
      this.dom.applyStyle(slot.container, { left: `${left}px`, width: `${width}px` });
      slot.lastLeft = left;
      slot.lastWidth = width;
    }
  }

  private hideLayer(): void {
    if (this.lastLayerVisible) {
      this.dom.applyDisplayNoneStyle(this.layer);
      this.lastLayerVisible = false;
    }
    for (const side of ["west", "center", "east"] as SideIdent[]) {
      const slot = this.sides[side];
      if (slot.container.getAttribute("role") !== "presentation") {
        this.dom.setAttribute(slot.container, "role", "presentation");
      }
      if (slot.row.getAttribute("role") !== "presentation") {
        this.dom.setAttribute(slot.row, "role", "presentation");
        this.dom.removeAttribute(slot.row, "aria-rowindex");
      }
    }
  }

  private updateSideRoles(filterRowIdx: number): void {
    const idxStr = `${filterRowIdx}`;
    for (const side of ["west", "center", "east"] as SideIdent[]) {
      const slot = this.sides[side];
      const hasCells = slot.lastVisible && slot.row.childElementCount > 0;
      if (hasCells) {
        if (slot.container.getAttribute("role") !== "rowgroup") {
          this.dom.setAttribute(slot.container, "role", "rowgroup");
        }
        if (slot.row.getAttribute("role") !== "row") {
          this.dom.setAttribute(slot.row, "role", "row");
        }
        if (slot.row.getAttribute("aria-rowindex") !== idxStr) {
          this.dom.setAttribute(slot.row, "aria-rowindex", idxStr);
        }
      } else {
        if (slot.container.getAttribute("role") !== "presentation") {
          this.dom.setAttribute(slot.container, "role", "presentation");
        }
        if (slot.row.getAttribute("role") !== "presentation") {
          this.dom.setAttribute(slot.row, "role", "presentation");
          this.dom.removeAttribute(slot.row, "aria-rowindex");
        }
      }
    }
  }

  private columnKey(columnIndex: number): string {
    const def = this.scope.tableModel.getColumnDef(columnIndex);
    return def?.property || `#${columnIndex}`;
  }

  private mountOrUpdateCell(
    side: SideIdent,
    columnIndex: number,
    left: number,
    width: number,
    ariaColIndex: number,
    seen: Set<string>,
  ): void {
    const key = this.columnKey(columnIndex);
    const filterable = this.scope.columnFilterService.isColumnFilterable(columnIndex);
    const label = this.scope.getColumnAriaLabel(columnIndex);
    const slot = this.sides[side];
    seen.add(key);

    let cell = this.cells.get(key);
    if (cell && cell.filterable !== filterable) {
      cell.el.remove();
      this.cells.delete(key);
      cell = undefined;
    }

    if (!cell) {
      cell = this.createCell(key, columnIndex, side, filterable, label, slot.row);
      this.cells.set(key, cell);
    } else if (cell.side !== side || cell.el.parentElement !== slot.row) {
      cell.side = side;
      this.dom.domService.appendChild(slot.row, cell.el);
    }

    cell.columnIndex = columnIndex;

    if (cell.parked) {
      cell.parked = false;
      this.dom.applyStyle(cell.el, { clipPath: "", pointerEvents: "" });
    }

    if (cell.lastLeft !== left || cell.lastWidth !== width) {
      this.dom.applyStyle(cell.el, { left: `${left}px`, width: `${width}px` });
      cell.lastLeft = left;
      cell.lastWidth = width;
    }

    if (cell.lastColIndex !== ariaColIndex) {
      this.dom.setAttribute(cell.el, "aria-colindex", `${ariaColIndex}`);
      this.dom.setAttribute(cell.el, "data-col-index", `${columnIndex}`);
      cell.lastColIndex = ariaColIndex;
    }

    if (cell.filterable) {
      const narrow = width < this.options.minInputWidthInPx;
      if (cell.lastNarrow !== narrow) {
        if (narrow) {
          this.dom.addClass("ge-table-filter-cell-narrow", cell.el);
        } else {
          this.dom.removeClass("ge-table-filter-cell-narrow", cell.el);
        }
        cell.lastNarrow = narrow;
      }
      if (cell.lastLabel !== label) {
        this.updateCellLabels(cell, label);
        cell.lastLabel = label;
      }
    }
  }

  private createCell(
    key: string,
    columnIndex: number,
    side: SideIdent,
    filterable: boolean,
    label: string,
    parentRow: HTMLDivElement,
  ): FilterRowCell {
    const doc = this.scope.hostElement.ownerDocument;
    const ds = this.dom.domService;
    const el = this.dom.applyStylePosistionAbsolute(
      this.dom.createDivWithClass(
        filterable ? "ge-table-filter-cell" : "ge-table-filter-cell ge-table-filter-cell-disabled",
        parentRow,
      ),
    );
    this.dom.setAttribute(el, "role", "gridcell");
    this.dom.setAttribute(el, "data-col-property", key);
    this.dom.setAttribute(el, "data-col-index", `${columnIndex}`);
    this.dom.applyStyle(el, { top: "0px", height: "100%" });

    const cell: FilterRowCell = {
      key,
      columnIndex,
      filterable,
      side,
      el,
      parked: false,
      lastLeft: Number.NaN,
      lastWidth: Number.NaN,
      lastColIndex: -1,
      lastLabel: label,
      lastNarrow: false,
    };

    if (!filterable) {
      return cell;
    }

    const texts = this.scope.columnFilterService.getTexts();
    const def = this.scope.tableModel.getColumnDef(columnIndex);
    const placeholder = getColumnPlaceholder(def, this.options.placeholder ?? texts.searchPlaceholder);
    const signal = this.abortController.signal;

    const input = ds.createElement<HTMLInputElement>("input");
    ds.setAttribute(input, "type", "text");
    ds.setAttribute(input, "tabindex", "-1");
    ds.setAttribute(input, "autocomplete", "off");
    ds.setAttribute(input, "autocorrect", "off");
    ds.setAttribute(input, "autocapitalize", "none");
    ds.setAttribute(input, "spellcheck", "false");
    if (placeholder) {
      ds.setAttribute(input, "placeholder", placeholder);
    }
    ds.addClass(input, "ge-table-filter-input");
    ds.appendChild(el, input);
    cell.input = input;

    const clearBtn = ds.createElement<HTMLButtonElement>("button");
    ds.setAttribute(clearBtn, "type", "button");
    ds.setAttribute(clearBtn, "tabindex", "-1");
    ds.addClass(clearBtn, "ge-table-filter-clear");
    const clearGlyph = ds.createElement<HTMLSpanElement>("span");
    ds.setAttribute(clearGlyph, "aria-hidden", "true");
    clearGlyph.textContent = "×";
    ds.appendChild(clearBtn, clearGlyph);
    clearBtn.hidden = true;
    ds.appendChild(el, clearBtn);
    cell.clearBtn = clearBtn;

    const narrowBtn = ds.createElement<HTMLButtonElement>("button");
    ds.setAttribute(narrowBtn, "type", "button");
    ds.setAttribute(narrowBtn, "tabindex", "-1");
    ds.addClass(narrowBtn, "ge-table-filter-narrow-btn");
    ds.appendChild(narrowBtn, createFilterGlyphSvg(doc) as unknown as HTMLElement);
    ds.appendChild(el, narrowBtn);
    cell.narrowBtn = narrowBtn;

    this.updateCellLabels(cell, label);

    // Initialize input value from pending draft or active filter
    const filter = this.scope.columnFilterService.getColumnFilter(key);
    const isValuesFilter = filter?.values !== undefined;
    if (this.drafts.has(key) && !isValuesFilter) {
      input.value = this.drafts.get(key) ?? "";
    } else if (filter) {
      input.value = formatFilterCondition(filter, texts, this.scope.columnFilterService.getOptions().locale);
    }
    this.applyCellFilterState(cell, filter !== undefined, isValuesFilter);

    // Event listeners (no stopPropagation – TableScope.isEventInFilterUI isolates events cleanly)
    input.addEventListener("focus", () => {
      this.scope.clearHeaderFocusForFilterRow();
    }, { signal });

    input.addEventListener("focusout", () => {
      if (cell.parked && !this.isCellFocused(cell)) {
        cell.el.remove();
        this.cells.delete(cell.key);
      }
    }, { signal });

    input.addEventListener("input", () => {
      if (input.readOnly) {
        return;
      }
      this.onInputChanged(cell);
    }, { signal });

    input.addEventListener("keydown", (evt: KeyboardEvent) => {
      this.onInputKeyDown(cell, evt);
    }, { signal });

    clearBtn.addEventListener("click", () => {
      this.clearCellFilter(cell, true);
    }, { signal });

    narrowBtn.addEventListener("click", () => {
      if (this.scope.columnFilterMenuService?.hasHeaderButtons()) {
        this.scope.toggleColumnFilterMenu(cell.columnIndex);
      } else {
        input.focus();
      }
    }, { signal });

    return cell;
  }

  private updateCellLabels(cell: FilterRowCell, columnLabel: string): void {
    const ds = this.dom.domService;
    const aria = this.scope.ariaTexts;
    const inputLabel = aria.filterInput ? aria.filterInput(columnLabel) : `Filter ${columnLabel}`;
    const clearLabel = aria.clearColumnFilter ? aria.clearColumnFilter(columnLabel) : `Clear filter for ${columnLabel}`;
    if (cell.input) {
      ds.setAttribute(cell.input, "aria-label", inputLabel);
    }
    if (cell.clearBtn) {
      ds.setAttribute(cell.clearBtn, "aria-label", clearLabel);
    }
    if (cell.narrowBtn) {
      ds.setAttribute(cell.narrowBtn, "aria-label", inputLabel);
    }
  }

  private getHeaderRowsHeight(): number {
    const model = this.scope.tableModel;
    const hm = model.getAreaModel("header");
    const count = hm?.getRowCount() ?? 0;
    let h = 0;
    for (let r = 0; r < count; r++) {
      h += model.getRowHeight("header", r);
    }
    return h > 0 ? h : Math.max(0, model.getPadding().top - this.options.height);
  }

  private applyCellFilterState(cell: FilterRowCell, active: boolean, readonlyValues: boolean): void {
    if (!cell.input) {
      return;
    }
    cell.input.readOnly = readonlyValues;
    if (readonlyValues) {
      this.dom.addClass("ge-table-filter-input-readonly", cell.input);
    } else {
      this.dom.removeClass("ge-table-filter-input-readonly", cell.input);
    }
    if (active) {
      this.dom.addClass("ge-table-filter-cell-active", cell.el);
    } else {
      this.dom.removeClass("ge-table-filter-cell-active", cell.el);
    }
    if (cell.clearBtn) {
      const showClear = this.options.clearButtonVisible && (active || cell.input.value.length > 0);
      cell.clearBtn.hidden = !showClear;
    }
  }

  private onInputChanged(cell: FilterRowCell): void {
    const input = cell.input;
    if (!input) {
      return;
    }
    const raw = input.value;
    this.drafts.set(cell.key, raw);
    this.applyCellFilterState(cell, this.scope.columnFilterService.isColumnFiltered(cell.key), false);

    this.cancelTimer(cell.key);
    if (this.options.debounce <= 0) {
      this.commitCellInput(cell);
    } else {
      const timer = setTimeout(() => {
        this.timers.delete(cell.key);
        this.commitCellInput(cell);
      }, this.options.debounce);
      this.timers.set(cell.key, timer);
    }
  }

  private onInputKeyDown(cell: FilterRowCell, evt: KeyboardEvent): void {
    const input = cell.input;
    if (!input) {
      return;
    }
    // A running IME composition owns every key (Enter confirms, arrows pick a candidate, Escape discards it)
    if (evt.isComposing || evt.keyCode === 229) {
      return;
    }
    if (evt.key === "Enter") {
      evt.preventDefault();
      this.cancelTimer(cell.key);
      if (!input.readOnly) {
        this.commitCellInput(cell);
      }
      return;
    }
    if (evt.key === "Escape") {
      evt.preventDefault();
      const hasContent = input.value.length > 0 || this.scope.columnFilterService.isColumnFiltered(cell.key);
      if (hasContent) {
        this.clearCellFilter(cell, true);
      } else {
        this.scope.focusHeaderFromFilterRow(cell.columnIndex);
      }
      return;
    }
    if ((evt.key === "Backspace" || evt.key === "Delete") && input.readOnly) {
      evt.preventDefault();
      this.clearCellFilter(cell, true);
      return;
    }
    if (evt.key === "ArrowUp") {
      evt.preventDefault();
      this.scope.focusHeaderFromFilterRow(cell.columnIndex);
      return;
    }
    if (evt.key === "ArrowDown") {
      evt.preventDefault();
      this.scope.focusBodyFromFilterRow(cell.columnIndex);
      return;
    }
    if (evt.key === "Tab") {
      const nextCol = this.findAdjacentFilterableColumn(cell.columnIndex, evt.shiftKey ? -1 : 1);
      if (nextCol >= 0) {
        evt.preventDefault();
        this.focusColumn(nextCol);
      }
      // At the first/last filterable column: do not preventDefault so Tab leaves the table (no keyboard trap)
    }
  }

  private commitCellInput(cell: FilterRowCell): void {
    if (this.destroyed) {
      return;
    }
    const raw = this.drafts.has(cell.key) ? (this.drafts.get(cell.key) ?? "") : (cell.input?.value ?? "");
    this.drafts.delete(cell.key);
    const svc = this.scope.columnFilterService;
    const resolved = svc.resolveColumn(cell.key);
    const colIdx = resolved?.columnIndex ?? cell.columnIndex;
    const colType = svc.getColumnFilterType(colIdx, cell.key, resolved?.columnDef);
    const locale = svc.getOptions().locale;
    const condition = parseFilterInput(raw, colType, locale);
    if (condition === null) {
      // incomplete or invalid (">", "1..", "abc" in a number column): the active filter stays until the text is valid
      if (cell.input) {
        this.drafts.set(cell.key, raw); // the text survives a rebuild of the cell
      }
      return;
    }
    if (condition) {
      svc.setColumnFilter(cell.key, { condition }, "row");
    } else {
      svc.setColumnFilter(cell.key, undefined, "row");
    }
  }

  private clearCellFilter(cell: FilterRowCell, refocus: boolean): void {
    this.cancelTimer(cell.key);
    this.drafts.delete(cell.key);
    if (cell.input) {
      cell.input.value = "";
      cell.input.readOnly = false;
    }
    this.applyCellFilterState(cell, false, false);
    this.scope.columnFilterService.setColumnFilter(cell.key, undefined, "row");
    if (refocus && cell.input && cell.input.isConnected) {
      cell.input.focus();
    }
  }

  private findAdjacentFilterableColumn(fromCol: number, dir: -1 | 1): number {
    const model = this.scope.tableModel;
    const count = model.getColumnCount();
    for (let c = fromCol + dir; c >= 0 && c < count; c += dir) {
      if (model.getColumnWidth(c) > 0 && this.scope.columnFilterService.isColumnFilterable(c)) {
        return c;
      }
    }
    return -1;
  }

  private isCellFocused(cell: FilterRowCell): boolean {
    const root = this.layer.getRootNode?.() as Document | ShadowRoot | undefined;
    const active = root && "activeElement" in root ? root.activeElement : this.scope.hostElement.ownerDocument?.activeElement;
    return !!active && cell.el.contains(active);
  }

  private parkCell(cell: FilterRowCell): void {
    if (!cell.parked) {
      cell.parked = true;
      this.dom.applyStyle(cell.el, { clipPath: "inset(100%)", pointerEvents: "none" });
    }
  }

  private cancelTimer(key: string): void {
    const t = this.timers.get(key);
    if (t !== undefined) {
      clearTimeout(t);
      this.timers.delete(key);
    }
  }

  private clearAllTimers(): void {
    this.timers.forEach((t) => clearTimeout(t));
    this.timers.clear();
  }
}
