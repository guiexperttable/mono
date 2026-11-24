import { parseDateText, parseLocaleNumber } from "../clipboard/input-pipes";
import type { ColumnDefIf } from "../data/tablemodel/column/column-def.if";
import type { TableScope } from "../table-scope";
import type {
  ColumnFilterColumnOptionsIf,
  ColumnFilterMenuOptionsIf,
  ColumnFilterValueItemIf,
} from "./column-filter-options.if";
import type { ColumnFilterOperator } from "./column-filter-operator.type";
import type { ColumnFilterType } from "./column-filter-type.type";
import type { ColumnFilterConditionIf, ColumnFilterIf } from "./column-filter.if";
import { dateSetKey, filterValueKey, isBlankFilterValue } from "./compile-column-filters";
import { formatFilterNumber } from "./parse-filter-input";
import { FilterPopupShell, type FilterPopupCloseReason } from "./filter-popup-shell";

const SVG_NS = "http://www.w3.org/2000/svg";
const ITEM_ROW_HEIGHT = 28;
const ITEM_OVERSCAN = 4;

interface MenuValueEntry {
  key: string;
  value: unknown;
  label: string;
  count?: number;
}

const OPERATORS_BY_TYPE: Record<ColumnFilterType, readonly ColumnFilterOperator[]> = {
  text: ["contains", "startsWith", "endsWith", "equals", "notEquals", "blank", "notBlank"],
  number: ["equals", "notEquals", "greaterThan", "greaterOrEqual", "lessThan", "lessOrEqual", "between", "blank", "notBlank"],
  date: ["equals", "notEquals", "greaterThan", "greaterOrEqual", "lessThan", "lessOrEqual", "between", "blank", "notBlank"],
  boolean: ["equals", "notEquals", "blank", "notBlank"],
  set: [],
};

function createFunnelSvg(doc: Document): SVGSVGElement {
  const svg = doc.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 16 16");
  svg.setAttribute("width", "12");
  svg.setAttribute("height", "12");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  const path = doc.createElementNS(SVG_NS, "path");
  path.setAttribute("fill", "currentColor");
  path.setAttribute(
    "d",
    "M2 3.25A.75.75 0 0 1 2.75 2.5h10.5a.75.75 0 0 1 .58 1.22L9.75 8.6v4.15a.75.75 0 0 1-1.17.62l-2-1.33a.75.75 0 0 1-.33-.62V8.6L2.17 3.72A.75.75 0 0 1 2 3.25Z",
  );
  svg.appendChild(path);
  return svg;
}

function formatInputValue(value: unknown, colType: ColumnFilterType, locale?: string): string {
  if (value === undefined || value === null) {
    return "";
  }
  if (typeof value === "number") {
    return formatFilterNumber(value, locale); // what parseLocaleNumber reads back ("1,5" in de-DE)
  }
  if (colType === "date" && value instanceof Date && !Number.isNaN(value.getTime())) {
    const y = value.getFullYear();
    const m = `${value.getMonth() + 1}`.padStart(2, "0");
    const d = `${value.getDate()}`.padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return String(value);
}

function parseConditionValue(raw: string, colType: ColumnFilterType, locale?: string): unknown {
  const trimmed = raw.trim();
  if (!trimmed) {
    return undefined;
  }
  if (colType === "number") {
    const n = parseLocaleNumber(trimmed, locale);
    return Number.isNaN(n) ? undefined : n;
  }
  if (colType === "date") {
    const d = parseDateText(trimmed, locale);
    return d ?? undefined;
  }
  if (colType === "boolean") {
    const low = trimmed.toLowerCase();
    if (low === "true" || low === "1" || low === "yes") return true;
    if (low === "false" || low === "0" || low === "no") return false;
    return undefined;
  }
  return raw;
}

function getColumnFilterOptions(def: ColumnDefIf | undefined): Partial<ColumnFilterColumnOptionsIf> | undefined {
  return def?.filter && typeof def.filter === "object" ? def.filter : undefined;
}

/**
 * Per-column filter menu popup ({@link TableOptionsIf.columnFilterMenu}): renders the funnel button in every
 * filterable header cell and opens a top-layer {@link FilterPopupShell} with comparison operators, condition input(s)
 * and a searchable, virtualized distinct-values checkbox list.
 *
 * @category Internals
 * @since 1.1.114
 */
export class ColumnFilterMenuService {

  private readonly supported: boolean;
  private readonly popup: FilterPopupShell;
  private openProperty?: string;
  private openColumnIndex = -1;
  private searchTimer?: ReturnType<typeof setTimeout>;
  private loadGeneration = 0;
  private destroyed = false;

  constructor(
    private readonly scope: TableScope,
    readonly options: ColumnFilterMenuOptionsIf,
    private readonly showHeaderButtons: boolean = true,
  ) {
    const filterable = scope.columnFilterService.isBodyFilterable();
    const managed = scope.columnFilterService.getOptions().managed;
    this.supported = filterable || !managed;
    if (!this.supported) {
      console.warn(
        "GuiExpert Table – columnFilterMenu is ignored: the body area model is not filterable "
        + "(set columnFilter: { managed: false } for server-side filtering).",
      );
    }
    this.popup = new FilterPopupShell(scope);
  }

  /** Whether the filter menu feature is active for this table. */
  isActive(): boolean {
    return !this.destroyed && this.supported;
  }

  /** Whether header cells should render the funnel button (true when `tableOptions.columnFilterMenu` is enabled). */
  hasHeaderButtons(): boolean {
    return this.isActive() && this.showHeaderButtons;
  }

  /** Whether a column filter menu popup is currently open. */
  isOpen(): boolean {
    return this.popup.isOpen();
  }

  /** Column index whose menu is currently open, or `-1`. */
  getOpenColumnIndex(): number {
    return this.popup.isOpen() ? this.openColumnIndex : -1;
  }

  /** True if a DOM event originated inside the open filter menu popup. */
  isInPopup(evt: Event): boolean {
    return this.popup.isInPopup(evt);
  }

  /**
   * Appends the funnel button to a lowest-row header cell when the column is filterable.
   * Called from `RenderScope.renderCell()`.
   */
  decorateHeaderCell(cell: HTMLDivElement, rowIndex: number, columnIndex: number): void {
    if (!this.hasHeaderButtons()) {
      return;
    }
    if (!this.scope.columnFilterService.isColumnFilterable(columnIndex)) {
      return;
    }
    const ds = this.scope.getDomService().domService;
    const doc = cell.ownerDocument;
    const active = this.scope.columnFilterService.isColumnFiltered(columnIndex);
    const expanded = this.popup.isOpen() && this.openColumnIndex === columnIndex;
    const colLabel = this.scope.getColumnAriaLabel(columnIndex);
    const aria = this.scope.ariaTexts;
    const btnLabel = active
      ? (aria.filterColumnActive ? aria.filterColumnActive(colLabel) : `Filter menu for ${colLabel} (active)`)
      : (aria.filterColumn ? aria.filterColumn(colLabel) : `Filter menu for ${colLabel}`);

    const btn = ds.createElement<HTMLButtonElement>("button");
    ds.setAttribute(btn, "type", "button");
    ds.setAttribute(btn, "tabindex", "-1");
    ds.setAttribute(btn, "data-ge-action", "filter-column");
    ds.setAttribute(btn, "data-area", "header");
    ds.setAttribute(btn, "data-row-index", `${rowIndex}`);
    ds.setAttribute(btn, "data-col-index", `${columnIndex}`);
    ds.setAttribute(btn, "aria-haspopup", "dialog");
    ds.setAttribute(btn, "aria-expanded", expanded ? "true" : "false");
    ds.setAttribute(btn, "aria-label", btnLabel);
    ds.addClass(btn, "ge-table-column-filter-btn");
    if (active) {
      ds.addClass(btn, "ge-table-column-filter-active");
    }
    ds.appendChild(btn, createFunnelSvg(doc) as unknown as HTMLElement);
    ds.appendChild(cell, btn);
  }

  /** Toggles the filter menu for `column` (closes if already open for the same column). */
  toggle(column: number | string | ColumnDefIf): boolean {
    const resolved = this.scope.columnFilterService.resolveColumn(column);
    if (!resolved) {
      return false;
    }
    if (this.popup.isOpen() && this.openProperty === resolved.property) {
      this.close("api");
      return true;
    }
    return this.open(column);
  }

  /**
   * Opens the filter menu popup anchored to the given column's header cell / funnel button.
   * Returns `false` if the column does not exist, is hidden, or is not filterable.
   */
  open(column: number | string | ColumnDefIf): boolean {
    if (!this.isActive()) {
      return false;
    }
    const svc = this.scope.columnFilterService;
    const resolved = svc.resolveColumn(column);
    if (!resolved || resolved.columnIndex < 0) {
      return false;
    }
    const colIdx = resolved.columnIndex;
    if (this.scope.tableModel.getColumnWidth(colIdx) <= 0 || !svc.isColumnFilterable(colIdx)) {
      return false;
    }

    // Scroll column into view so its header cell is mounted in the DOM
    this.scope.ensureColumnIsVisible(colIdx);

    const anchorEl = this.findHeaderAnchor(colIdx);
    const anchorRect = anchorEl?.getBoundingClientRect() ?? this.fallbackAnchorRect(colIdx);
    const colLabel = this.scope.getColumnAriaLabel(colIdx);
    const aria = this.scope.ariaTexts;
    const dialogLabel = aria.filterMenuDialog ? aria.filterMenuDialog(colLabel) : `Filter ${colLabel}`;

    const prevCol = this.openColumnIndex;
    if (this.popup.isOpen()) {
      this.popup.close("api");
    }
    if (prevCol >= 0) {
      this.setHeaderButtonExpanded(prevCol, false);
    }

    this.openProperty = resolved.property;
    this.openColumnIndex = colIdx;
    this.setHeaderButtonExpanded(colIdx, true);

    const container = this.popup.open({
      ariaLabel: dialogLabel,
      className: "ge-table-column-filter-menu",
      anchorRect,
      triggerEl: anchorEl,
      // the header is rebuilt on every render: the funnel button of this column is the trigger, whichever element
      isTrigger: (el) => el.classList.contains("ge-table-column-filter-btn")
        && el.getAttribute("data-col-index") === `${colIdx}` && this.scope.hostElement.contains(el),
      onClose: (reason) => this.handleClosed(colIdx, reason),
    });

    const initialFocus = this.renderMenuContent(container, colIdx, resolved.property, resolved.columnDef, colLabel);
    this.popup.reposition(anchorRect);
    this.popup.focusInitial(initialFocus);
    return true;
  }

  /** Closes the currently open filter menu popup, if any. */
  close(reason: FilterPopupCloseReason = "api"): void {
    this.clearSearchTimer();
    this.loadGeneration++;
    this.popup.close(reason);
  }

  /** Releases timers, listeners and popup DOM. */
  destroy(): void {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;
    this.clearSearchTimer();
    this.loadGeneration++;
    this.popup.destroy();
    this.openProperty = undefined;
    this.openColumnIndex = -1;
  }

  // ------------------------------------------------------------------ internals

  private handleClosed(colIdx: number, reason: FilterPopupCloseReason): void {
    this.clearSearchTimer();
    this.loadGeneration++;
    this.openProperty = undefined;
    this.openColumnIndex = -1;
    this.setHeaderButtonExpanded(colIdx, false);
    // Return keyboard focus to the header cell when dismissed via keyboard or dialog buttons
    if (!this.destroyed && (reason === "escape" || reason === "action" || reason === "cancel")) {
      this.scope.focusHeaderFromFilterRow(colIdx);
    }
  }

  private findHeaderAnchor(columnIndex: number): HTMLElement | null {
    const host = this.scope.hostElement;
    const btn = host.querySelector<HTMLElement>(
      `.ge-table-header button.ge-table-column-filter-btn[data-col-index="${columnIndex}"]`,
    );
    if (btn) {
      return btn;
    }
    const headerRows = this.scope.tableModel.getAreaModel("header")?.getRowCount() ?? 1;
    const lastRow = Math.max(0, headerRows - 1);
    return (
      host.querySelector<HTMLElement>(
        `.ge-table-header .ge-table-col-div[data-row-index="${lastRow}"][data-col-index="${columnIndex}"]`,
      )
      ?? host.querySelector<HTMLElement>(`.ge-table-header .ge-table-col-div[data-col-index="${columnIndex}"]`)
    );
  }

  private fallbackAnchorRect(columnIndex: number): {
    left: number; right: number; top: number; bottom: number; width: number; height: number;
  } {
    const hostRect = this.scope.hostElement.getBoundingClientRect();
    const w = Math.max(40, this.scope.tableModel.getColumnWidth(columnIndex));
    const left = this.scope.isRtl() ? hostRect.right - w : hostRect.left;
    const top = hostRect.top;
    const height = this.scope.tableModel.getRowHeight("header", 0) || 34;
    return { left, right: left + w, top, bottom: top + height, width: w, height };
  }

  private setHeaderButtonExpanded(columnIndex: number, expanded: boolean): void {
    const btn = this.scope.hostElement.querySelector<HTMLElement>(
      `.ge-table-header button.ge-table-column-filter-btn[data-col-index="${columnIndex}"]`,
    );
    if (btn) {
      this.scope.getDomService().domService.setAttribute(btn, "aria-expanded", expanded ? "true" : "false");
    }
  }

  private renderMenuContent(
    container: HTMLDivElement,
    columnIndex: number,
    property: string,
    columnDef: ColumnDefIf | undefined,
    colLabel: string,
  ): HTMLElement | null {
    const ds = this.scope.getDomService().domService;
    const svc = this.scope.columnFilterService;
    const texts = svc.getTexts();
    const globalOpts = svc.getOptions();
    const colOpts = getColumnFilterOptions(columnDef);
    const colType = svc.getColumnFilterType(columnIndex, property, columnDef);
    const existing = svc.getColumnFilter(property);
    const maxValues = this.options.maxValues ?? globalOpts.maxValues;
    const idPrefix = `${this.scope.ariaIds.prefix}-fm-${columnIndex}`;

    let initialFocus: HTMLElement | null = null;

    // Header title
    const header = ds.createElement<HTMLDivElement>("div");
    ds.addClass(header, "ge-table-filter-menu-header");
    const title = ds.createElement<HTMLSpanElement>("span");
    ds.addClass(title, "ge-table-filter-menu-title");
    title.textContent = colLabel;
    ds.appendChild(header, title);
    ds.appendChild(container, header);

    // ------------------------------------------------------------------ Condition section
    const operators = OPERATORS_BY_TYPE[colType] ?? OPERATORS_BY_TYPE.text;
    const showCondition = this.options.showCondition && operators.length > 0;
    let opSelect: HTMLSelectElement | undefined;
    let valInput1: HTMLInputElement | HTMLSelectElement | undefined;
    let valInput2: HTMLInputElement | undefined;
    let andSpan: HTMLSpanElement | undefined;

    const readDraftCondition = (): ColumnFilterConditionIf | undefined => {
      if (!showCondition || !opSelect) {
        return existing?.condition;
      }
      const op = opSelect.value as ColumnFilterOperator;
      if (op === "blank" || op === "notBlank") {
        return { operator: op };
      }
      const raw1 = valInput1?.value ?? "";
      if (op === "between") {
        const raw2 = valInput2?.value ?? "";
        const v1 = parseConditionValue(raw1, colType, globalOpts.locale);
        const v2 = parseConditionValue(raw2, colType, globalOpts.locale);
        if (v1 === undefined && v2 === undefined) {
          return undefined;
        }
        if (v2 === undefined) {
          return { operator: "greaterOrEqual", value: v1 }; // one bound only: "from"
        }
        if (v1 === undefined) {
          return { operator: "lessOrEqual", value: v2 }; // "up to"
        }
        return { operator: "between", value: v1, valueTo: v2 };
      }
      const v1 = parseConditionValue(raw1, colType, globalOpts.locale);
      if (v1 === undefined) {
        return undefined;
      }
      return { operator: op, value: v1 };
    };

    const syncConditionInputs = (): void => {
      if (!opSelect) return;
      const op = opSelect.value as ColumnFilterOperator;
      const noInput = op === "blank" || op === "notBlank";
      const isBetween = op === "between";
      if (valInput1) {
        valInput1.hidden = noInput;
      }
      if (andSpan) {
        andSpan.hidden = !isBetween;
      }
      if (valInput2) {
        valInput2.hidden = !isBetween;
      }
    };

    // Forward declaration for applyOnChange callback
    let applyDraft: () => void = () => {};

    if (showCondition) {
      const condSection = ds.createElement<HTMLDivElement>("div");
      ds.addClass(condSection, "ge-table-filter-menu-condition");

      const select = ds.createElement<HTMLSelectElement>("select");
      ds.addClass(select, "ge-table-filter-menu-select");
      ds.setAttribute(select, "aria-label", colLabel);
      for (let i = 0; i < operators.length; i++) {
        const op = operators[i];
        const option = ds.createElement<HTMLOptionElement>("option");
        option.value = op;
        option.textContent = texts.operators[op] ?? op;
        ds.appendChild(select, option);
      }
      select.value = existing?.condition?.operator && operators.includes(existing.condition.operator)
        ? existing.condition.operator
        : operators[0];
      ds.appendChild(condSection, select);
      opSelect = select;

      const inputsRow = ds.createElement<HTMLDivElement>("div");
      ds.addClass(inputsRow, "ge-table-filter-menu-inputs");

      if (colType === "boolean") {
        const boolSelect = ds.createElement<HTMLSelectElement>("select");
        ds.addClass(boolSelect, "ge-table-filter-menu-input");
        ds.setAttribute(boolSelect, "aria-label", colLabel);
        for (const [val, txt] of [["", ""], ["true", "true"], ["false", "false"]] as const) {
          const opt = ds.createElement<HTMLOptionElement>("option");
          opt.value = val;
          opt.textContent = txt;
          ds.appendChild(boolSelect, opt);
        }
        boolSelect.value = formatInputValue(existing?.condition?.value, colType);
        ds.appendChild(inputsRow, boolSelect);
        valInput1 = boolSelect;
        boolSelect.addEventListener("change", () => {
          if (this.options.applyOnChange) applyDraft();
        });
      } else {
        const inp1 = ds.createElement<HTMLInputElement>("input");
        ds.setAttribute(inp1, "type", "text");
        ds.setAttribute(inp1, "autocomplete", "off");
        ds.setAttribute(inp1, "autocorrect", "off");
        ds.setAttribute(inp1, "autocapitalize", "none");
        ds.setAttribute(inp1, "spellcheck", "false");
        ds.setAttribute(inp1, "aria-label", colLabel);
        ds.setAttribute(inp1, "placeholder", colType === "date" ? "YYYY-MM-DD" : texts.searchPlaceholder);
        ds.addClass(inp1, "ge-table-filter-menu-input");
        inp1.value = formatInputValue(existing?.condition?.value, colType, globalOpts.locale);
        ds.appendChild(inputsRow, inp1);
        valInput1 = inp1;

        const andEl = ds.createElement<HTMLSpanElement>("span");
        ds.addClass(andEl, "ge-table-filter-menu-and");
        andEl.textContent = texts.andLabel;
        andEl.hidden = true;
        ds.appendChild(inputsRow, andEl);
        andSpan = andEl;

        const inp2 = ds.createElement<HTMLInputElement>("input");
        ds.setAttribute(inp2, "type", "text");
        ds.setAttribute(inp2, "autocomplete", "off");
        ds.setAttribute(inp2, "autocorrect", "off");
        ds.setAttribute(inp2, "autocapitalize", "none");
        ds.setAttribute(inp2, "spellcheck", "false");
        ds.setAttribute(inp2, "aria-label", `${colLabel} (${texts.andLabel})`);
        ds.setAttribute(inp2, "placeholder", colType === "date" ? "YYYY-MM-DD" : texts.searchPlaceholder);
        ds.addClass(inp2, "ge-table-filter-menu-input");
        inp2.value = formatInputValue(existing?.condition?.valueTo, colType, globalOpts.locale);
        inp2.hidden = true;
        ds.appendChild(inputsRow, inp2);
        valInput2 = inp2;

        const onCondEnter = (evt: KeyboardEvent) => {
          if (evt.key === "Enter" && !evt.isComposing && evt.keyCode !== 229) {
            evt.preventDefault();
            applyDraft();
            this.close("action");
          }
        };
        inp1.addEventListener("keydown", onCondEnter);
        inp2.addEventListener("keydown", onCondEnter);
        if (this.options.applyOnChange) {
          inp1.addEventListener("input", () => applyDraft());
          inp2.addEventListener("input", () => applyDraft());
        }
      }

      select.addEventListener("change", () => {
        syncConditionInputs();
        this.popup.reposition();
        if (this.options.applyOnChange) applyDraft();
      });

      syncConditionInputs();
      ds.appendChild(condSection, inputsRow);
      ds.appendChild(container, condSection);

      if (!initialFocus) {
        initialFocus = valInput1 && !valInput1.hidden ? valInput1 : select;
      }
    }

    // ------------------------------------------------------------------ Values section (virtualized checklist)
    const showValues = this.options.showValues;
    let baseItems: MenuValueEntry[] = [];
    let visibleItems: MenuValueEntry[] = [];
    let baseTruncated = false;
    let untouchedAll = existing?.values === undefined;
    const selectedKeys = new Set<string>();
    const valueByKey = new Map<string, unknown>();
    let getSearchText = (): string => "";
    // date columns: a Date and the ISO text of a saved state are the same value
    const keyOf = colType === "date"
      ? (v: unknown): string => {
        const k = dateSetKey(v);
        return typeof k === "number" ? `d:${k}` : filterValueKey(v);
      }
      : filterValueKey;

    if (existing?.values !== undefined) {
      for (let i = 0; i < existing.values.length; i++) {
        const raw = existing.values[i];
        const key = keyOf(raw);
        selectedKeys.add(key);
        valueByKey.set(key, raw);
      }
    }

    const toEntries = (rawItems: ColumnFilterValueItemIf[]): MenuValueEntry[] => {
      const out: MenuValueEntry[] = new Array(rawItems.length);
      for (let i = 0; i < rawItems.length; i++) {
        const it = rawItems[i];
        const key = keyOf(it.value);
        const label = it.label ?? (isBlankFilterValue(it.value) ? texts.blanks : String(it.value));
        valueByKey.set(key, it.value);
        if (untouchedAll) {
          selectedKeys.add(key);
        }
        out[i] = { key, value: it.value, label, count: it.count };
      }
      return out;
    };

    if (showValues) {
      const valuesSection = ds.createElement<HTMLDivElement>("div");
      ds.addClass(valuesSection, "ge-table-filter-menu-values");

      // Search input
      const searchInput = ds.createElement<HTMLInputElement>("input");
      ds.setAttribute(searchInput, "type", "search");
      ds.setAttribute(searchInput, "autocomplete", "off");
      ds.setAttribute(searchInput, "autocorrect", "off");
      ds.setAttribute(searchInput, "autocapitalize", "none");
      ds.setAttribute(searchInput, "spellcheck", "false");
      ds.setAttribute(searchInput, "placeholder", texts.searchValuesPlaceholder);
      ds.setAttribute(searchInput, "aria-label", texts.searchValuesPlaceholder);
      ds.addClass(searchInput, "ge-table-filter-menu-search");
      ds.appendChild(valuesSection, searchInput);

      // (Select all) checkbox row
      const selectAllRow = ds.createElement<HTMLDivElement>("div");
      ds.addClass(selectAllRow, "ge-table-filter-select-all");
      const selectAllCb = ds.createElement<HTMLInputElement>("input");
      const selectAllId = `${idPrefix}-all`;
      ds.setAttribute(selectAllCb, "type", "checkbox");
      ds.setAttribute(selectAllCb, "id", selectAllId);
      const selectAllLabel = ds.createElement<HTMLLabelElement>("label");
      ds.setAttribute(selectAllLabel, "for", selectAllId);
      selectAllLabel.textContent = texts.selectAll;
      ds.appendChild(selectAllRow, selectAllCb);
      ds.appendChild(selectAllRow, selectAllLabel);
      ds.appendChild(valuesSection, selectAllRow);

      // Truncation notice banner
      const notice = ds.createElement<HTMLDivElement>("div");
      ds.addClass(notice, "ge-table-filter-values-notice");
      notice.hidden = true;
      ds.appendChild(valuesSection, notice);

      // Virtualized checkbox list viewport
      const viewport = ds.createElement<HTMLDivElement>("div");
      ds.addClass(viewport, "ge-table-filter-values-viewport");
      ds.setAttribute(viewport, "role", "group");
      ds.setAttribute(viewport, "aria-label", colLabel);
      ds.setAttribute(viewport, "tabindex", "-1"); // takes the focus when the focused checkbox scrolls out of the window
      getSearchText = () => searchInput.value.trim();

      const spacer = ds.createElement<HTMLDivElement>("div");
      ds.addClass(spacer, "ge-table-filter-values-spacer");
      ds.appendChild(viewport, spacer);

      const emptyMsg = ds.createElement<HTMLDivElement>("div");
      ds.addClass(emptyMsg, "ge-table-filter-values-empty");
      emptyMsg.textContent = texts.noValues;
      emptyMsg.hidden = true;
      ds.appendChild(viewport, emptyMsg);

      ds.appendChild(valuesSection, viewport);
      ds.appendChild(container, valuesSection);

      const updateSelectAllState = (): void => {
        if (visibleItems.length === 0) {
          selectAllCb.checked = false;
          selectAllCb.indeterminate = false;
          return;
        }
        let checkedCount = 0;
        for (let i = 0; i < visibleItems.length; i++) {
          if (selectedKeys.has(visibleItems[i].key)) {
            checkedCount++;
          }
        }
        if (checkedCount === 0) {
          selectAllCb.checked = false;
          selectAllCb.indeterminate = false;
        } else if (checkedCount === visibleItems.length) {
          selectAllCb.checked = true;
          selectAllCb.indeterminate = false;
        } else {
          selectAllCb.checked = false;
          selectAllCb.indeterminate = true;
        }
      };

      const renderVirtualRows = (): void => {
        const total = visibleItems.length;
        spacer.style.height = `${total * ITEM_ROW_HEIGHT}px`;
        emptyMsg.hidden = total > 0;
        spacer.hidden = total === 0;
        if (total === 0) {
          spacer.textContent = "";
          return;
        }

        const viewH = viewport.clientHeight || 210;
        const scrollTop = viewport.scrollTop;
        const start = Math.max(0, Math.floor(scrollTop / ITEM_ROW_HEIGHT) - ITEM_OVERSCAN);
        const end = Math.min(total - 1, Math.ceil((scrollTop + viewH) / ITEM_ROW_HEIGHT) + ITEM_OVERSCAN);

        // Rebuild only the small visible window (~15-20 rows). The focused checkbox is rebuilt, too: remember it
        // (ids hang on the item index) and give the focus back – otherwise it falls to <body> and Escape/Tab are dead.
        const rootNode = spacer.getRootNode?.() as Document | ShadowRoot | undefined;
        const activeEl = rootNode && "activeElement" in rootNode ? rootNode.activeElement : null;
        const focusedId = activeEl && spacer.contains(activeEl) ? activeEl.id : undefined;
        let refocus: HTMLElement | undefined;
        spacer.textContent = "";
        const frag = container.ownerDocument.createDocumentFragment();
        for (let idx = start; idx <= end; idx++) {
          const item = visibleItems[idx];
          const row = ds.createElement<HTMLDivElement>("div");
          ds.addClass(row, "ge-table-filter-value-row");
          row.style.top = `${idx * ITEM_ROW_HEIGHT}px`;
          row.style.height = `${ITEM_ROW_HEIGHT}px`;

          const cb = ds.createElement<HTMLInputElement>("input");
          const cbId = `${idPrefix}-v-${idx}`;
          ds.setAttribute(cb, "type", "checkbox");
          ds.setAttribute(cb, "id", cbId);
          cb.checked = selectedKeys.has(item.key);
          if (focusedId !== undefined && cbId === focusedId) {
            refocus = cb;
          }
          cb.addEventListener("change", () => {
            untouchedAll = false;
            if (cb.checked) {
              selectedKeys.add(item.key);
            } else {
              selectedKeys.delete(item.key);
            }
            updateSelectAllState();
            if (this.options.applyOnChange) applyDraft();
          });

          const lbl = ds.createElement<HTMLLabelElement>("label");
          ds.setAttribute(lbl, "for", cbId);
          ds.addClass(lbl, "ge-table-filter-value-label");
          lbl.textContent = item.label;

          ds.appendChild(row, cb);
          ds.appendChild(row, lbl);

          if (item.count !== undefined) {
            const cnt = ds.createElement<HTMLSpanElement>("span");
            ds.addClass(cnt, "ge-table-filter-value-count");
            cnt.textContent = `${item.count}`;
            ds.appendChild(row, cnt);
          }
          frag.appendChild(row);
        }
        spacer.appendChild(frag);
        if (focusedId !== undefined) {
          (refocus ?? viewport).focus({ preventScroll: true });
        }
      };

      viewport.addEventListener("scroll", () => renderVirtualRows(), { passive: true });

      selectAllCb.addEventListener("change", () => {
        untouchedAll = false;
        const checkAll = selectAllCb.checked;
        for (let i = 0; i < visibleItems.length; i++) {
          if (checkAll) {
            selectedKeys.add(visibleItems[i].key);
          } else {
            selectedKeys.delete(visibleItems[i].key);
          }
        }
        updateSelectAllState();
        renderVirtualRows();
        if (this.options.applyOnChange) applyDraft();
      });

      const applyLoadedItems = (items: MenuValueEntry[], truncated: boolean, isBase: boolean): void => {
        if (isBase) {
          baseItems = items;
          baseTruncated = truncated;
        }
        visibleItems = items;
        notice.hidden = !truncated;
        if (truncated) {
          notice.textContent = texts.valuesTruncated(maxValues);
        }
        viewport.scrollTop = 0;
        updateSelectAllState();
        renderVirtualRows();
      };

      const loadValues = (search: string, isInitial: boolean): void => {
        const gen = ++this.loadGeneration;
        if (colOpts?.getValues) {
          const ctx = {
            columnIndex,
            columnDef,
            property,
            search,
            maxValues,
            otherFilters: svc.getOtherFilters(property),
          };
          const res = colOpts.getValues(ctx);
          if (res && typeof (res as Promise<ColumnFilterValueItemIf[]>).then === "function") {
            emptyMsg.textContent = "…";
            emptyMsg.hidden = false;
            spacer.hidden = true;
            (res as Promise<ColumnFilterValueItemIf[]>)
              .then((list) => {
                if (this.destroyed || !this.popup.isOpen() || gen !== this.loadGeneration) return;
                emptyMsg.textContent = texts.noValues;
                const safeList = Array.isArray(list) ? list : [];
                applyLoadedItems(toEntries(safeList), safeList.length >= maxValues, isInitial);
              })
              .catch(() => {
                if (this.destroyed || !this.popup.isOpen() || gen !== this.loadGeneration) return;
                emptyMsg.textContent = texts.noValues;
                applyLoadedItems([], false, isInitial);
              });
          } else {
            const safeList = Array.isArray(res) ? res : [];
            applyLoadedItems(toEntries(safeList), safeList.length >= maxValues, isInitial);
          }
          return;
        }

        // Built-in distinct collector
        if (!isInitial && !baseTruncated) {
          const needle = search.trim().toLowerCase();
          const filtered = needle
            ? baseItems.filter((it) => it.label.toLowerCase().includes(needle))
            : baseItems;
          applyLoadedItems(filtered, false, false);
          return;
        }

        const result = svc.collectColumnDistinctValues(columnIndex, {
          maxValues,
          search: search || undefined,
        });
        applyLoadedItems(toEntries(result.items), result.truncated, isInitial);
      };

      searchInput.addEventListener("input", () => {
        this.clearSearchTimer();
        const q = searchInput.value;
        if (!colOpts?.getValues && !baseTruncated) {
          loadValues(q, false);
        } else {
          this.searchTimer = setTimeout(() => {
            this.searchTimer = undefined;
            loadValues(q, false);
          }, 120);
        }
      });

      // Load initial distinct values synchronously (or kick off async getValues)
      loadValues("", true);
      if (!initialFocus) {
        initialFocus = searchInput;
      }
    }

    // ------------------------------------------------------------------ Commit builder
    const buildFilter = (): ColumnFilterIf | undefined => {
      const condition = readDraftCondition();
      let values: unknown[] | undefined = existing?.values;

      if (showValues) {
        const checkedOfSearch = getSearchText() && !untouchedAll
          ? visibleItems.filter((it) => selectedKeys.has(it.key))
          : [];
        if (untouchedAll) {
          values = undefined;
        } else if (checkedOfSearch.length > 0) {
          // like Excel: with a search the filter is what is checked in the search result
          // (nothing checked there = the search was used to exclude values: the selection as a whole counts, below)
          values = checkedOfSearch.map((it) => it.value);
        } else if (baseTruncated && !colOpts?.getValues) {
          // the list shows the first maxValues values only: values that were never listed keep their state from
          // before (all selected resp. the filter that was set) – one pass over the column instead of a wrong filter
          const initialAll = existing?.values === undefined;
          const all = svc.collectColumnDistinctValues(columnIndex, { maxValues: Number.POSITIVE_INFINITY }).items;
          const arr: unknown[] = [];
          for (let i = 0; i < all.length; i++) {
            const key = keyOf(all[i].value);
            if (selectedKeys.has(key) || (initialAll && !valueByKey.has(key))) {
              arr.push(all[i].value);
            }
          }
          values = arr.length === all.length ? undefined : arr;
        } else if (!baseTruncated && baseItems.length > 0 && selectedKeys.size === baseItems.length
          && baseItems.every((it) => selectedKeys.has(it.key))) {
          values = undefined;
        } else {
          const arr: unknown[] = [];
          selectedKeys.forEach((k) => {
            arr.push(valueByKey.get(k));
          });
          values = arr;
        }
      }

      if (!condition && values === undefined) {
        return undefined;
      }
      const out: ColumnFilterIf = {};
      if (condition) out.condition = condition;
      if (values !== undefined) out.values = values;
      return out;
    };

    applyDraft = () => {
      svc.setColumnFilter(property, buildFilter(), "menu");
    };

    // ------------------------------------------------------------------ Footer buttons
    const footer = ds.createElement<HTMLDivElement>("div");
    ds.addClass(footer, "ge-table-filter-menu-footer");

    const clearBtn = ds.createElement<HTMLButtonElement>("button");
    ds.setAttribute(clearBtn, "type", "button");
    ds.addClass(clearBtn, "ge-table-filter-btn");
    ds.addClass(clearBtn, "ge-table-filter-btn-clear");
    clearBtn.textContent = texts.clear;
    clearBtn.addEventListener("click", () => {
      svc.setColumnFilter(property, undefined, "menu");
      this.close("action");
    });

    const spacerBtns = ds.createElement<HTMLDivElement>("div");
    ds.addClass(spacerBtns, "ge-table-filter-menu-footer-actions");

    const cancelBtn = ds.createElement<HTMLButtonElement>("button");
    ds.setAttribute(cancelBtn, "type", "button");
    ds.addClass(cancelBtn, "ge-table-filter-btn");
    ds.addClass(cancelBtn, "ge-table-filter-btn-cancel");
    cancelBtn.textContent = texts.cancel;
    cancelBtn.addEventListener("click", () => {
      this.close("cancel");
    });

    const okBtn = ds.createElement<HTMLButtonElement>("button");
    ds.setAttribute(okBtn, "type", "button");
    ds.addClass(okBtn, "ge-table-filter-btn");
    ds.addClass(okBtn, "ge-table-filter-btn-primary");
    ds.addClass(okBtn, "ge-table-filter-btn-ok");
    okBtn.textContent = texts.ok;
    okBtn.addEventListener("click", () => {
      if (!this.options.applyOnChange) {
        applyDraft();
      }
      this.close("action");
    });

    ds.appendChild(footer, clearBtn);
    ds.appendChild(spacerBtns, cancelBtn);
    ds.appendChild(spacerBtns, okBtn);
    ds.appendChild(footer, spacerBtns);
    ds.appendChild(container, footer);

    return initialFocus;
  }

  private clearSearchTimer(): void {
    if (this.searchTimer !== undefined) {
      clearTimeout(this.searchTimer);
      this.searchTimer = undefined;
    }
  }
}
