import type { ColumnDefIf } from "../data/tablemodel/column/column-def.if";
import { isApiColumnVisible } from "../data/tablemodel/column/column-visibility";
import { isCheckboxColumnDef, isRowNumberColumnDef } from "../instanceof-workaround";
import type { TableScope } from "../table-scope";
import { FilterPopupShell, type FilterPopupCloseReason } from "./filter-popup-shell";

interface ChooserColumnItem {
  columnIndex: number;
  columnDef: ColumnDefIf;
  label: string;
  property: string;
  hideable: boolean;
}

const SEARCH_THRESHOLD = 8;

/**
 * Column visibility chooser popup ({@link TableApi.showColumnChooser} / {@link TableApi.hideColumnChooser}).
 *
 * Reuses {@link FilterPopupShell} (`popover="manual"` with fallback), lists columns in current display order
 * (excluding {@link RowNumberColumnDef} and {@link CheckboxColumnDef}), respects {@link ColumnDefIf.hideable},
 * prevents hiding the last visible column, and persists changes through `TableScope.setColumnVisible` (`"columns"` state).
 *
 * @category Internals
 * @since 1.1.114
 */
export class ColumnChooserService {

  private readonly popup: FilterPopupShell;
  private lastAnchor?: HTMLElement;
  private destroyed = false;

  constructor(private readonly scope: TableScope) {
    this.popup = new FilterPopupShell(scope);
  }

  isOpen(): boolean {
    return this.popup.isOpen();
  }

  isInPopup(evt: Event): boolean {
    return this.popup.isInPopup(evt);
  }

  /**
   * Opens the column chooser popup anchored to `anchor` (or the inline-end header edge of the table if omitted).
   * Calling `open` with the same anchor while already open toggles it closed.
   */
  open(anchor?: HTMLElement): void {
    if (this.destroyed) {
      return;
    }
    if (this.popup.isOpen() && anchor && this.lastAnchor === anchor) {
      this.close("api");
      return;
    }
    this.lastAnchor = anchor;

    const anchorRect = anchor
      ? anchor.getBoundingClientRect()
      : this.defaultAnchorRect();

    const aria = this.scope.ariaTexts;
    const dialogLabel = aria.columnChooserDialog ? aria.columnChooserDialog() : "Choose columns";

    const container = this.popup.open({
      ariaLabel: dialogLabel,
      className: "ge-table-column-chooser",
      anchorRect,
      triggerEl: anchor,
      onClose: (reason) => this.handleClosed(anchor, reason),
    });

    const initialFocus = this.renderContent(container);
    this.popup.reposition(anchorRect);
    this.popup.focusInitial(initialFocus);
  }

  close(reason: FilterPopupCloseReason = "api"): void {
    this.popup.close(reason);
  }

  destroy(): void {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;
    this.lastAnchor = undefined;
    this.popup.destroy();
  }

  // ------------------------------------------------------------------ internals

  private handleClosed(anchor: HTMLElement | undefined, reason: FilterPopupCloseReason): void {
    this.lastAnchor = undefined;
    if (!this.destroyed && (reason === "escape" || reason === "action" || reason === "cancel")) {
      if (anchor && anchor.isConnected) {
        anchor.focus({ preventScroll: true });
      } else {
        this.scope.hostElement.focus({ preventScroll: true });
      }
    }
  }

  private defaultAnchorRect(): {
    left: number; right: number; top: number; bottom: number; width: number; height: number;
  } {
    const rect = this.scope.hostElement.getBoundingClientRect();
    const headerH = this.scope.tableModel.getPadding().top || 34;
    if (this.scope.isRtl()) {
      return { left: rect.left, right: rect.left + 1, top: rect.top, bottom: rect.top + headerH, width: 1, height: headerH };
    }
    return { left: rect.right - 1, right: rect.right, top: rect.top, bottom: rect.top + headerH, width: 1, height: headerH };
  }

  private collectColumns(): ChooserColumnItem[] {
    const model = this.scope.tableModel;
    const count = model.getColumnCount();
    const out: ChooserColumnItem[] = [];
    for (let c = 0; c < count; c++) {
      const def = model.getColumnDef(c);
      if (!def || isRowNumberColumnDef(def) || isCheckboxColumnDef(def)) {
        continue;
      }
      out.push({
        columnIndex: c,
        columnDef: def,
        label: this.scope.getColumnAriaLabel(c),
        property: def.property || `#${c}`,
        hideable: def.hideable !== false,
      });
    }
    return out;
  }

  private renderContent(container: HTMLDivElement): HTMLElement | null {
    const ds = this.scope.getDomService().domService;
    const texts = this.scope.columnFilterService.getTexts();
    const items = this.collectColumns();
    const idPrefix = `${this.scope.ariaIds.prefix}-cc`;

    let initialFocus: HTMLElement | null = null;

    // Header
    const header = ds.createElement<HTMLDivElement>("div");
    ds.addClass(header, "ge-table-filter-menu-header");
    const title = ds.createElement<HTMLSpanElement>("span");
    ds.addClass(title, "ge-table-filter-menu-title");
    title.textContent = texts.columnsTitle;
    ds.appendChild(header, title);
    ds.appendChild(container, header);

    const body = ds.createElement<HTMLDivElement>("div");
    ds.addClass(body, "ge-table-filter-menu-values");

    // Search input (shown from >= 8 columns)
    let searchQuery = "";
    let searchInput: HTMLInputElement | undefined;
    if (items.length >= SEARCH_THRESHOLD) {
      searchInput = ds.createElement<HTMLInputElement>("input");
      ds.setAttribute(searchInput, "type", "search");
      ds.setAttribute(searchInput, "autocomplete", "off");
      ds.setAttribute(searchInput, "autocorrect", "off");
      ds.setAttribute(searchInput, "autocapitalize", "none");
      ds.setAttribute(searchInput, "spellcheck", "false");
      ds.setAttribute(searchInput, "placeholder", texts.searchColumnsPlaceholder);
      ds.setAttribute(searchInput, "aria-label", texts.searchColumnsPlaceholder);
      ds.addClass(searchInput, "ge-table-filter-menu-search");
      ds.appendChild(body, searchInput);
      initialFocus = searchInput;
    }

    // (Select all) row
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
    ds.appendChild(body, selectAllRow);

    // Column list container
    const listEl = ds.createElement<HTMLDivElement>("div");
    ds.addClass(listEl, "ge-table-column-chooser-list");
    ds.setAttribute(listEl, "role", "group");
    ds.setAttribute(listEl, "aria-label", texts.columnsTitle);
    ds.appendChild(body, listEl);
    ds.appendChild(container, body);

    const getVisibleItems = (): ChooserColumnItem[] => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return items;
      return items.filter((it) => it.label.toLowerCase().includes(q) || it.property.toLowerCase().includes(q));
    };

    const countTotalVisible = (): number => {
      let n = 0;
      for (let i = 0; i < items.length; i++) {
        if (isApiColumnVisible(items[i].columnDef)) {
          n++;
        }
      }
      return n;
    };

    const renderList = (): void => {
      const visible = getVisibleItems();
      const totalShown = countTotalVisible();

      // Update (Select all) tri-state
      let checkedInView = 0;
      for (let i = 0; i < visible.length; i++) {
        if (isApiColumnVisible(visible[i].columnDef)) {
          checkedInView++;
        }
      }
      if (visible.length === 0 || checkedInView === 0) {
        selectAllCb.checked = false;
        selectAllCb.indeterminate = false;
      } else if (checkedInView === visible.length) {
        selectAllCb.checked = true;
        selectAllCb.indeterminate = false;
      } else {
        selectAllCb.checked = false;
        selectAllCb.indeterminate = true;
      }

      listEl.textContent = "";
      if (visible.length === 0) {
        const empty = ds.createElement<HTMLDivElement>("div");
        ds.addClass(empty, "ge-table-filter-values-empty");
        empty.textContent = texts.noValues;
        ds.appendChild(listEl, empty);
        return;
      }

      const frag = container.ownerDocument.createDocumentFragment();
      for (let i = 0; i < visible.length; i++) {
        const it = visible[i];
        const checked = isApiColumnVisible(it.columnDef);
        const isLastVisible = checked && totalShown <= 1;
        const locked = !it.hideable || isLastVisible;

        const row = ds.createElement<HTMLDivElement>("div");
        ds.addClass(row, "ge-table-column-chooser-row");

        const cb = ds.createElement<HTMLInputElement>("input");
        const cbId = `${idPrefix}-c-${i}`;
        ds.setAttribute(cb, "type", "checkbox");
        ds.setAttribute(cb, "id", cbId);
        ds.setAttribute(cb, "data-col-property", it.property);
        cb.checked = checked;
        cb.disabled = locked;
        cb.addEventListener("change", () => {
          if (!cb.checked && countTotalVisible() <= 1) {
            cb.checked = true;
            return;
          }
          this.scope.setColumnVisible(it.columnDef, cb.checked);
          renderList();
        });

        const lbl = ds.createElement<HTMLLabelElement>("label");
        ds.setAttribute(lbl, "for", cbId);
        ds.addClass(lbl, "ge-table-filter-value-label");
        lbl.textContent = it.label;

        ds.appendChild(row, cb);
        ds.appendChild(row, lbl);
        frag.appendChild(row);

        if (!initialFocus && !cb.disabled) {
          initialFocus = cb;
        }
      }
      listEl.appendChild(frag);
    };

    selectAllCb.addEventListener("change", () => {
      const visible = getVisibleItems();
      const target = selectAllCb.checked;
      if (target) {
        for (let i = 0; i < visible.length; i++) {
          if (!isApiColumnVisible(visible[i].columnDef)) {
            this.scope.setColumnVisible(visible[i].columnDef, true);
          }
        }
      } else {
        // Hide hideable columns in view while always keeping at least one visible column overall
        for (let i = visible.length - 1; i >= 0; i--) {
          const it = visible[i];
          if (!it.hideable || !isApiColumnVisible(it.columnDef)) {
            continue;
          }
          if (countTotalVisible() <= 1) {
            break;
          }
          this.scope.setColumnVisible(it.columnDef, false);
        }
      }
      renderList();
    });

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        searchQuery = searchInput!.value;
        renderList();
      });
    }

    renderList();
    return initialFocus ?? selectAllCb;
  }
}
