import { canScrollHorizontally } from "../rtl/rtl-util";
import type { TableScope } from "../table-scope";
import type { TableApi } from "../table-api";
import type { TableModelIf } from "../data/tablemodel/table-model.if";
import type { TableOptionsIf } from "../data/options/table-options.if";
import type { EventListenerIf } from "../event-listener.if";
import type { AreaModelIf } from "../data/tablemodel/areamodel/area-model.if";
import type { GeDetailEventSource } from "../data/common/event/ge-detail-event";
import type { DetailHeightType, MasterDetailOptionsIf } from "./master-detail-options.if";
import type { DetailRenderContextIf, DetailTableParamsIf } from "./detail-renderer.if";
import { MasterDetailOptions } from "./master-detail-options";
import { isAreaModelTree } from "../instanceof-workaround";
import { isDefaultGetRowId } from "../data/options/default-row-id";

/**
 * The part of a nested table the master/detail service needs (a {@link TableScope}).
 *
 * @category Internals
 * @since 1.1.97
 */
export interface NestedTableScopeIf {
  firstInit(): unknown;
  getApi(): TableApi;
  destroy(): void;
}

/**
 * Creates the {@link TableScope} of a nested table (given by `TableScope` – no import cycle).
 *
 * @category Internals
 * @since 1.1.97
 */
export type NestedTableScopeFactory = (
  host: HTMLDivElement,
  tableModel: TableModelIf,
  tableOptions: TableOptionsIf | undefined,
  eventListener: EventListenerIf | undefined
) => NestedTableScopeIf;

/** The DOM and resources of one rendered detail row. */
interface DetailContent {
  rowDiv: HTMLDivElement;
  cell: HTMLDivElement;
  /** the row object the content was rendered for */
  row: unknown;
  auto: boolean;
  cleanup?: () => void;
  abort: AbortController;
  tables: NestedTableScopeIf[];
  resizeObserver?: ResizeObserver;
  parked: boolean;
  top?: number;
  height?: number;
}

/** One expanded master row. */
interface DetailEntry {
  key: unknown;
  row: unknown;
  /** display index in the current row layout, -1 = not shown (filtered out) */
  rowIndex: number;
  measuredHeight?: number;
  content?: DetailContent;
  /** render pass in which the detail row was visible the last time (LRU) */
  lastSeen: number;
  renderCount: number;
}

const FOCUSABLE = "a[href], button, input, select, textarea, iframe, [contenteditable]:not([contenteditable='false']), [tabindex]";

/**
 * Master/detail of a table ({@link TableOptionsIf.masterDetail}): the expanded master rows, the detail layer and the
 * life cycle of the detail contents. Created by {@link TableScope} (`tableScope.masterDetailService`); use the
 * {@link TableApi} (`setDetailExpanded`, `toggleDetail` …).
 *
 * - **Layer**: one div `ge-table-detail-layer` in the host, over the body (full width, fixed columns included, without
 *   the scroll bars). It is never cleared by the virtual rendering and does not scroll horizontally.
 * - **Positions**: the heights of the detail rows are extras of the body {@link RowLayout} (behind their master row);
 *   `RenderScope` reports the detail rows in view after every render pass ({@link layoutVisible}).
 * - **Life cycle**: the content is created when the detail row becomes visible, hidden (not destroyed) when it scrolls
 *   out of view, destroyed when it is collapsed, beyond `maxRenderedDetails` or when the table is destroyed.
 * - **Events**: mouse, keyboard and pointer events from a detail row are ignored by the outer table
 *   ({@link isInLayer}); the mouse wheel over a detail row scrolls the outer table when nothing in the detail scrolls.
 *
 * @category Internals
 * @since 1.1.97
 */
export class MasterDetailService {

  /** The complete options (defaults + `tableOptions.masterDetail`). */
  readonly options: MasterDetailOptionsIf;

  private readonly active: boolean;
  private layer?: HTMLDivElement;
  private readonly entries = new Map<unknown, DetailEntry>();
  private byIndex = new Map<number, DetailEntry>();
  private visibleNow = new Set<DetailEntry>();
  private renderPass = 0;
  private renderedCount = 0;
  private toggleColumnIndex = -1;
  private resizeFrame = 0;
  private destroyed = false;

  constructor(
    private readonly scope: TableScope,
    private readonly createNestedScope: NestedTableScopeFactory
  ) {
    const given = scope.tableOptions?.masterDetail;
    this.options = MasterDetailOptions.create(given);
    const tree = isAreaModelTree(scope.tableModel.getBodyModel());
    if (given && tree) {
      console.warn("GuiExpert Table – masterDetail is ignored: it works only with flat body models (no tree, row grouping or pivot table).");
    }
    if (given && !given.detailRenderer) {
      console.warn("GuiExpert Table – masterDetail without a detailRenderer: the detail rows stay empty.");
    }
    this.active = !!given && !tree;
    if (this.active) {
      this.createLayer();
    }
  }

  /** True if master/detail is configured (and the body is flat). */
  isActive(): boolean {
    return this.active;
  }

  /** True if at least one master row is expanded. */
  hasExpanded(): boolean {
    return this.active && this.entries.size > 0;
  }

  /** The detail layer (`undefined` without master/detail). */
  getLayer(): HTMLDivElement | undefined {
    return this.layer;
  }

  /**
   * True if an event comes from a detail row (or a nested table in it) – the outer table ignores it.
   *
   * @param {Event} evt - a DOM event while it is dispatched
   * @returns {boolean} whether its path contains the detail layer
   */
  isInLayer(evt: Event): boolean {
    const layer = this.layer;
    if (!layer) {
      return false;
    }
    const path = evt.composedPath?.();
    if (path?.length) {
      return path.includes(layer);
    }
    return evt.target instanceof Node && layer.contains(evt.target);
  }

  // ---------------------------------------------------------------------------------------------- rows and keys

  /** The id of a master row: `options.getRowId`, `autoRestoreOptions.getRowId`, the row object or its index. */
  keyOf(row: unknown, rowIndex: number): unknown {
    if (row !== undefined && row !== null) {
      const stateRowId = this.scope.tableOptions?.autoRestoreOptions?.getRowId;
      // the default getRowId of AutoRestoreOptions (JSON fallback) is no id – the row object is better
      const getRowId = this.options.getRowId ?? (stateRowId && !isDefaultGetRowId(stateRowId) ? stateRowId : undefined);
      if (getRowId) {
        try {
          const id = (getRowId as (row: unknown, rowIndex?: number) => unknown)(row, rowIndex);
          if (id !== undefined && id !== null) {
            return id;
          }
        } catch (_e) {
          // an id function that cannot handle the row: fall back to the object
        }
      }
      if (typeof row === "object" || typeof row === "function") {
        return row;
      }
    }
    return rowIndex;
  }

  /**
   * True if the row at a display index can be expanded ({@link MasterDetailOptionsIf.isMaster}).
   *
   * @param {number} rowIndex - display index
   * @returns {boolean} whether it is a master row
   */
  isMasterAt(rowIndex: number): boolean {
    if (!this.active || rowIndex < 0) {
      return false;
    }
    const body = this.getBody();
    if (rowIndex >= body.getRowCount()) {
      return false;
    }
    const isMaster = this.options.isMaster;
    if (!isMaster) {
      return true;
    }
    try {
      return !!isMaster(body.getRowByIndex(rowIndex), rowIndex);
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  /**
   * True if the master row at a display index is expanded.
   *
   * @param {number} rowIndex - display index
   * @returns {boolean} whether its detail row is open
   */
  isExpandedAt(rowIndex: number): boolean {
    if (!this.hasExpanded() || rowIndex < 0) {
      return false;
    }
    return this.entries.has(this.keyOf(this.getBody().getRowByIndex(rowIndex), rowIndex));
  }

  /**
   * True if a row (display index or row object) is expanded.
   *
   * @param {number | object} rowOrIndex - display index or row object
   * @returns {boolean} whether its detail row is open
   */
  isExpanded(rowOrIndex: unknown): boolean {
    const [row, rowIndex] = this.resolve(rowOrIndex);
    return this.hasExpanded() && this.entries.has(this.keyOf(row, rowIndex));
  }

  /**
   * Expands or collapses a master row. The table repaints and reports the change ({@link TableScope}).
   *
   * @param {number | object} rowOrIndex - display index or row object
   * @param {boolean} expanded - the new state
   * @param {GeDetailEventSource} [source] - what changed it (for the event)
   * @returns {boolean} false if nothing changed (no master row, already in that state, no master/detail)
   */
  setExpanded(rowOrIndex: unknown, expanded: boolean, source: GeDetailEventSource = "api"): boolean {
    if (!this.active) {
      return false;
    }
    const [row, rowIndex] = this.resolve(rowOrIndex);
    const key = this.keyOf(row, rowIndex);
    if (expanded) {
      if (this.entries.has(key) || (row === undefined && rowIndex < 0)) {
        return false;
      }
      if (rowIndex >= 0 ? !this.isMasterAt(rowIndex) : !this.isMasterRow(row)) {
        return false;
      }
      const entry: DetailEntry = { key, row, rowIndex, lastSeen: 0, renderCount: 0 };
      this.entries.set(key, entry);
      // one row: the row layout gets one extra – no pass over all rows (2 million rows: no measurable delay)
      const incremental = rowIndex >= 0 && this.scope.setBodyRowExtra(rowIndex, this.heightOf(entry));
      if (incremental) {
        this.byIndex.set(rowIndex, entry);
      }
      this.scope.onDetailToggled(row, rowIndex, expanded, source, true, incremental);
    } else {
      const entry = this.entries.get(key);
      if (!entry) {
        return false;
      }
      this.destroyContent(entry);
      this.entries.delete(key);
      const incremental = entry.rowIndex >= 0 && this.byIndex.get(entry.rowIndex) === entry
        && this.scope.setBodyRowExtra(entry.rowIndex, 0);
      if (incremental) {
        this.byIndex.delete(entry.rowIndex);
      }
      this.scope.onDetailToggled(row, rowIndex, expanded, source, true, incremental);
    }
    return true;
  }

  /**
   * Expands all master rows that are shown (their contents are created only when they scroll into view).
   * No event per row.
   *
   * @returns {number} the number of rows that were expanded
   */
  expandAll(): number {
    if (!this.active) {
      return 0;
    }
    const body = this.getBody();
    const rowCount = body.getRowCount();
    let n = 0;
    for (let i = 0; i < rowCount; i++) {
      if (!this.isMasterAt(i)) {
        continue;
      }
      const row = body.getRowByIndex(i);
      const key = this.keyOf(row, i);
      if (!this.entries.has(key)) {
        this.entries.set(key, { key, row, rowIndex: i, lastSeen: 0, renderCount: 0 });
        n++;
      }
    }
    if (n) {
      this.scope.onDetailToggled(undefined, -1, true, "api", false);
    }
    return n;
  }

  /**
   * Collapses all detail rows (their contents are destroyed). No event per row.
   *
   * @returns {number} the number of rows that were collapsed
   */
  collapseAll(): number {
    const n = this.entries.size;
    if (!n) {
      return 0;
    }
    this.clearAll();
    this.scope.onDetailToggled(undefined, -1, false, "api", false);
    return n;
  }

  /** The expanded master rows (row objects; for models without row objects: `undefined`). */
  getExpandedRows(): unknown[] {
    return Array.from(this.entries.values(), entry => entry.row);
  }

  /**
   * Expands exactly these rows and collapses all others – the restore of the table state. Rows that are no master
   * rows are skipped. No event per row.
   *
   * @param {unknown[]} rows - row objects of the body model
   * @param {GeDetailEventSource} [source] - what changed it
   * @returns {boolean} true if something changed
   */
  setExpandedRows(rows: readonly unknown[], source: GeDetailEventSource = "api"): boolean {
    if (!this.active) {
      return false;
    }
    const wanted = new Map<unknown, unknown>();
    for (const row of rows) {
      wanted.set(this.keyOf(row, -1), row);
    }
    let changed = false;
    for (const [key, entry] of Array.from(this.entries)) {
      if (!wanted.has(key)) {
        this.destroyContent(entry);
        this.entries.delete(key);
        changed = true;
      }
    }
    for (const [key, row] of Array.from(wanted)) {
      if (!this.entries.has(key) && this.isMasterRow(row)) {
        this.entries.set(key, { key, row, rowIndex: -1, lastSeen: 0, renderCount: 0 });
        changed = true;
      }
    }
    if (changed) {
      this.scope.onDetailToggled(undefined, -1, true, source, false);
    }
    return changed;
  }

  /**
   * Destroys the content of a detail row and creates it again (e.g. after the row's data changed).
   *
   * @param {number | object} rowOrIndex - display index or row object
   * @returns {boolean} false if the row is not expanded
   */
  refresh(rowOrIndex: unknown): boolean {
    const [row, rowIndex] = this.resolve(rowOrIndex);
    const entry = this.entries.get(this.keyOf(row, rowIndex));
    if (!entry) {
      return false;
    }
    this.destroyContent(entry);
    this.scope.repaint();
    return true;
  }

  /**
   * The container of a detail row (the element `detailRenderer` renders into) – only while its content exists.
   *
   * @param {number | object} rowOrIndex - display index or row object
   * @returns {HTMLDivElement | undefined} the container
   */
  getDetailElement(rowOrIndex: unknown): HTMLDivElement | undefined {
    const [row, rowIndex] = this.resolve(rowOrIndex);
    return this.entries.get(this.keyOf(row, rowIndex))?.content?.cell;
  }

  /**
   * The display index of the master row a DOM node belongs to (a detail row or something in it).
   *
   * @param {Node} node - a node in the detail layer
   * @returns {number} the display index, -1 if none
   */
  getMasterRowIndexOf(node: Node | null): number {
    if (!node || !this.layer?.contains(node)) {
      return -1;
    }
    for (const entry of Array.from(this.entries.values())) {
      if (entry.content?.rowDiv.contains(node)) {
        return entry.rowIndex;
      }
    }
    return -1;
  }

  // ---------------------------------------------------------------------------------------------- layout

  /**
   * The display indices and heights of the expanded master rows that are shown – the extras of the body row layout.
   * Called by `RenderScope` when the row layout is built (after filtering, sorting, editing, a detail toggle …): one
   * pass over the shown rows. Removes expanded rows that no longer exist in the model (`getAllRows()`).
   *
   * @returns {{ rowIndices: number[], heights: number[] } | undefined} the extras, `undefined` without expanded rows
   */
  computeExtras(): { rowIndices: number[]; heights: number[] } | undefined {
    this.byIndex = new Map();
    if (!this.hasExpanded()) {
      return undefined;
    }
    const body = this.getBody();
    const rowCount = body.getRowCount();
    for (const entry of Array.from(this.entries.values())) {
      entry.rowIndex = -1;
    }
    const rowIndices: number[] = [];
    const heights: number[] = [];
    let matched = 0;
    const shown = (body as { getFilteredRows?: () => unknown[] }).getFilteredRows?.();
    const rowAt = Array.isArray(shown) && shown.length === rowCount
      ? (i: number) => shown[i]
      : (i: number) => body.getRowByIndex(i);
    for (let i = 0; i < rowCount && matched < this.entries.size; i++) {
      const row = rowAt(i);
      const entry = this.entries.get(this.keyOf(row, i));
      if (!entry || entry.rowIndex >= 0) {
        continue;
      }
      if (this.options.isMaster && !this.isMasterAt(i)) {
        continue; // no longer a master row (data changed): stays expanded, but without a detail row
      }
      matched++;
      entry.rowIndex = i;
      entry.row = row;
      this.byIndex.set(i, entry);
      rowIndices.push(i);
      heights.push(this.heightOf(entry));
    }
    if (matched < this.entries.size) {
      this.pruneRemovedRows(body);
    }
    return { rowIndices, heights };
  }

  /**
   * Called at the start of the body render pass: the column of the expand icon.
   */
  startRenderPass(): void {
    this.toggleColumnIndex = this.active ? this.computeToggleColumnIndex() : -1;
  }

  /**
   * Shows the detail rows in view (called by `RenderScope` after the body rows were rendered): creates missing
   * contents, sets their positions, hides the ones that left the view and destroys the oldest hidden contents beyond
   * {@link MasterDetailOptionsIf.maxRenderedDetails}.
   *
   * @param {number[]} triples - `rowIndex, top, height` of each detail row in view; `top` relative to the body top
   */
  layoutVisible(triples: number[]): void {
    if (!this.active || this.destroyed) {
      return;
    }
    this.renderPass++;
    const now = new Set<DetailEntry>();
    for (let k = 0; k + 2 < triples.length; k += 3) {
      const entry = this.byIndex.get(triples[k]);
      if (!entry) {
        continue;
      }
      if (entry.content && entry.content.row !== entry.row) {
        this.destroyContent(entry); // the master row was replaced by a new object with the same id
      }
      // created at its place: a nested table measures its host in firstInit()
      const content = entry.content ?? this.createContent(entry, triples[k + 1], triples[k + 2]);
      this.place(content, triples[k + 1], triples[k + 2]);
      entry.lastSeen = this.renderPass;
      now.add(entry);
    }
    for (const entry of Array.from(this.visibleNow)) {
      if (!now.has(entry) && entry.content) {
        this.park(entry.content, entry.rowIndex);
      }
    }
    this.visibleNow = now;
    this.enforceLimit();
    const role = now.size ? "rowgroup" : "presentation";
    if (this.layer && this.layer.getAttribute("role") !== role) {
      this.scope.getDomService().domService.setAttribute(this.layer, "role", role);
    }
  }

  /**
   * Position and size of the layer: the visible body including the fixed columns, without the scroll bars.
   *
   * @param {number} left - px in the host
   * @param {number} top - px in the host (below the header)
   * @param {number} width - px
   * @param {number} height - px
   */
  setBounds(left: number, top: number, width: number, height: number): void {
    const layer = this.layer;
    if (!layer) {
      return;
    }
    const style = layer.style;
    this.scope.getDomService().setStyle(layer, "left", `${left}px`); // from the start (right-to-left: "right")
    style.top = `${top}px`;
    style.width = `${Math.max(0, width)}px`;
    style.height = `${Math.max(0, height)}px`;
  }

  /**
   * Decorates a body cell of the toggle column of a master row with the expand icon (`ge-table-detail-toggle`).
   *
   * @param {HTMLDivElement} cell - the rendered cell
   * @param {number} rowIndex - display index
   * @param {number} columnIndex - model column index
   */
  decorateCell(cell: HTMLDivElement, rowIndex: number, columnIndex: number): void {
    if (columnIndex !== this.toggleColumnIndex || !this.isMasterAt(rowIndex)) {
      return;
    }
    const expanded = this.isExpandedAt(rowIndex);
    const dom = this.scope.getDomService();
    const ds = dom.domService;
    ds.addClass(cell, "ge-table-detail-toggle-cell");
    const toggle = ds.createElement<HTMLDivElement>("div");
    ds.addClass(toggle, "ge-table-detail-toggle");
    if (expanded) {
      ds.addClass(toggle, "ge-table-detail-toggle-expanded");
    }
    ds.setAttribute(toggle, "data-ge-action", "toggle-detail");
    ds.setAttribute(toggle, "data-area", "body");
    ds.setAttribute(toggle, "data-row-index", `${rowIndex}`);
    ds.setAttribute(toggle, "data-col-index", `${columnIndex}`);
    dom.setAriaHidden(toggle); // the row has aria-expanded, Enter toggles
    cell.insertBefore(toggle, cell.firstChild);
  }

  /**
   * Called when the table is destroyed: destroys all detail contents and removes the layer.
   */
  destroy(): void {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;
    if (this.resizeFrame) {
      cancelAnimationFrame(this.resizeFrame);
      this.resizeFrame = 0;
    }
    this.clearAll();
    this.layer?.remove();
    this.layer = undefined;
  }

  // ---------------------------------------------------------------------------------------------- internals

  private getBody(): AreaModelIf {
    return this.scope.tableModel.getBodyModel();
  }

  private getAllRows(body: AreaModelIf): unknown[] | undefined {
    const rows = (body as { getAllRows?: () => unknown[] }).getAllRows?.();
    return Array.isArray(rows) ? rows : undefined;
  }

  /** isMaster for a row that is not shown (filtered out) – the index is unknown (-1). */
  private isMasterRow(row: unknown): boolean {
    const isMaster = this.options.isMaster;
    try {
      return row !== undefined && (!isMaster || !!isMaster(row, -1));
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  /** `[row, rowIndex]` of a display index or a row object (index -1 if the row is not shown). */
  private resolve(rowOrIndex: unknown): [unknown, number] {
    const body = this.getBody();
    if (typeof rowOrIndex === "number") {
      if (rowOrIndex < 0 || rowOrIndex >= body.getRowCount()) {
        return [undefined, -1];
      }
      return [body.getRowByIndex(rowOrIndex), rowOrIndex];
    }
    const entry = this.entries.get(this.keyOf(rowOrIndex, -1));
    if (entry && entry.rowIndex >= 0 && body.getRowByIndex(entry.rowIndex) === rowOrIndex) {
      return [rowOrIndex, entry.rowIndex];
    }
    const shown = (body as { getFilteredRows?: () => unknown[] }).getFilteredRows?.();
    if (Array.isArray(shown) && shown.length === body.getRowCount()) {
      return [rowOrIndex, shown.indexOf(rowOrIndex)];
    }
    const rowCount = body.getRowCount();
    for (let i = 0; i < rowCount; i++) {
      if (body.getRowByIndex(i) === rowOrIndex) {
        return [rowOrIndex, i];
      }
    }
    return [rowOrIndex, -1];
  }

  private heightOf(entry: DetailEntry): number {
    const height = this.detailHeightOf(entry);
    if (height === "auto") {
      return entry.measuredHeight ?? this.options.estimatedDetailHeight;
    }
    return Math.max(0, height);
  }

  private detailHeightOf(entry: DetailEntry): DetailHeightType {
    const option = this.options.detailHeight;
    if (typeof option === "function") {
      try {
        const value = option(entry.row, entry.rowIndex);
        return value === "auto" || (typeof value === "number" && isFinite(value)) ? value : "auto";
      } catch (e) {
        console.error(e);
        return "auto";
      }
    }
    return option === "auto" || (typeof option === "number" && isFinite(option)) ? option : "auto";
  }

  private computeToggleColumnIndex(): number {
    const option = this.options.toggleColumn;
    const tableModel = this.scope.tableModel;
    if (typeof option === "number") {
      return option;
    }
    if (typeof option === "string") {
      return (tableModel.getColumnDefs?.() ?? []).findIndex(def => def.property === option);
    }
    // where a tree has its arrow: behind row numbers and the row checkbox column
    const offset = this.scope.getFirstDataColumnIndex();
    if (this.scope.tableOptions?.showCheckboxWihoutExtraColumn) {
      return offset;
    }
    return tableModel.isRowCheckboxVisible() ? offset + 1 : offset;
  }

  private pruneRemovedRows(body: AreaModelIf): void {
    const rows = this.getAllRows(body);
    if (!rows) {
      return; // without getAllRows() an unmatched row may only be filtered out
    }
    const keys = new Set<unknown>();
    rows.forEach((row, i) => keys.add(this.keyOf(row, i)));
    for (const [key, entry] of Array.from(this.entries)) {
      if (entry.rowIndex < 0 && !keys.has(key)) {
        this.destroyContent(entry);
        this.entries.delete(key);
      }
    }
  }

  private createLayer(): void {
    const scope = this.scope;
    const dom = scope.getDomService();
    const ds = dom.domService;
    const layer = ds.createElement<HTMLDivElement>("div");
    ds.addClass(layer, "ge-table-detail-layer");
    ds.setAttribute(layer, "id", scope.ariaIds.detailRowGroup());
    ds.setAttribute(layer, "role", "presentation"); // "rowgroup" as soon as a detail row is shown
    ds.appendChild(scope.hostElement, layer);
    this.layer = layer;

    const signal = scope.listenerAbortController.signal;
    layer.addEventListener("wheel", (evt: WheelEvent) => this.onWheel(evt), { passive: false, signal });
    scope.hostElement.addEventListener("keydown", (evt: KeyboardEvent) => this.onHostKeyDown(evt), { signal });
    scope.hostElement.addEventListener("focus", (evt: FocusEvent) => this.onHostFocus(evt), { signal });
  }

  private createContent(entry: DetailEntry, top: number, height: number): DetailContent {
    const scope = this.scope;
    const ds = scope.getDomService().domService;
    const rowDiv = ds.createElement<HTMLDivElement>("div");
    ds.addClass(rowDiv, "ge-table-detail-row");
    ds.setAttribute(rowDiv, "role", "row");
    const cell = ds.createElement<HTMLDivElement>("div");
    ds.addClass(cell, "ge-table-detail-cell");
    ds.setAttribute(cell, "role", "gridcell");
    ds.setAttribute(cell, "aria-colspan", `${Math.max(1, scope.getAriaGridInfo().colCount)}`);
    ds.appendChild(rowDiv, cell);
    const auto = this.detailHeightOf(entry) === "auto";
    if (auto) {
      ds.addClass(rowDiv, "ge-table-detail-row-auto");
    }
    ds.appendChild(this.layer!, rowDiv);

    const content: DetailContent = { rowDiv, cell, row: entry.row, auto, abort: new AbortController(), tables: [], parked: false };
    entry.content = content;
    this.place(content, top, height);
    this.renderedCount++;

    const recreated = entry.renderCount > 0;
    entry.renderCount++;
    const service = this;
    const context: DetailRenderContextIf = {
      row: entry.row,
      rowIndex: entry.rowIndex,
      tableApi: scope.getApi(),
      recreated,
      signal: content.abort.signal,
      createTable(params: DetailTableParamsIf): TableApi {
        return service.createNestedTable(content, auto, params);
      }
    };
    try {
      const renderer = this.options.detailRenderer;
      const cleanup = typeof renderer === "function"
        ? renderer(cell, entry.row, context)
        : renderer?.render(cell, entry.row, context);
      if (typeof cleanup === "function") {
        content.cleanup = cleanup;
      }
    } catch (e) {
      console.error(e); // an own renderer threw: the detail row stays (empty), the table keeps working
    }
    if (auto && typeof ResizeObserver !== "undefined") {
      content.resizeObserver = new ResizeObserver(records => this.onResize(entry, content, records));
      content.resizeObserver.observe(rowDiv); // border box of the row: its borders belong to the height
    }
    return content;
  }

  private createNestedTable(content: DetailContent, auto: boolean, params: DetailTableParamsIf): TableApi {
    const ds = this.scope.getDomService().domService;
    const host = ds.createElement<HTMLDivElement>("div");
    ds.addClass(host, "ge-table-detail-table");
    const height = params.height ?? (auto ? this.options.estimatedDetailHeight : "100%");
    host.style.height = typeof height === "number" ? `${height}px` : height;
    ds.appendChild(content.cell, host);
    const nested = this.createNestedScope(host, params.tableModel, params.tableOptions, params.eventListener);
    content.tables.push(nested);
    nested.firstInit();
    return nested.getApi();
  }

  private place(content: DetailContent, top: number, height: number): void {
    const style = content.rowDiv.style;
    if (content.parked) {
      content.parked = false;
      content.rowDiv.classList.remove("ge-table-detail-row-parked");
    }
    if (content.top !== top) {
      content.top = top;
      style.top = `${top}px`;
    }
    if (!content.auto && content.height !== height) {
      content.height = height;
      style.height = `${height}px`;
    }
  }

  private park(content: DetailContent, rowIndex = -1): void {
    if (!content.parked) {
      this.releaseFocus(content, rowIndex);
      content.parked = true;
      content.rowDiv.classList.add("ge-table-detail-row-parked");
    }
  }

  /** The focus is inside a detail row that is hidden or removed: the master table (row) takes it. */
  private releaseFocus(content: DetailContent, rowIndex: number): void {
    const active = content.rowDiv.ownerDocument?.activeElement;
    if (active && content.rowDiv.contains(active)) {
      this.scope.takeFocusFromDetail(rowIndex);
    }
  }

  private onResize(entry: DetailEntry, content: DetailContent, records: ResizeObserverEntry[]): void {
    if (content.parked || entry.content !== content || this.destroyed) {
      return;
    }
    const record = records[records.length - 1];
    const box = record?.borderBoxSize?.[0];
    const measured = box ? box.blockSize : (record?.target as HTMLElement | undefined)?.offsetHeight ?? 0;
    const height = Math.max(1, Math.ceil(measured));
    if (entry.measuredHeight === height) {
      return;
    }
    entry.measuredHeight = height;
    if (entry.rowIndex >= 0) {
      this.scope.getBodyRowLayout().setExtraHeight(entry.rowIndex, height);
    }
    if (!this.resizeFrame) {
      this.resizeFrame = requestAnimationFrame(() => {
        this.resizeFrame = 0;
        if (!this.destroyed) {
          this.scope.onDetailHeightChanged();
        }
      });
    }
  }

  private enforceLimit(): void {
    const max = Math.max(0, this.options.maxRenderedDetails);
    // visible contents are never destroyed: only hidden ones count (no sort of all entries per frame)
    if (this.renderedCount <= max || this.renderedCount <= this.visibleNow.size) {
      return;
    }
    const parked = Array.from(this.entries.values())
      .filter(entry => entry.content && !this.visibleNow.has(entry))
      .sort((a, b) => a.lastSeen - b.lastSeen);
    for (const entry of parked) {
      if (this.renderedCount <= max) {
        break;
      }
      this.destroyContent(entry);
    }
  }

  private destroyContent(entry: DetailEntry): void {
    const content = entry.content;
    if (!content) {
      return;
    }
    entry.content = undefined;
    this.renderedCount--;
    this.visibleNow.delete(entry);
    if (!this.destroyed) {
      this.releaseFocus(content, entry.rowIndex);
    }
    content.resizeObserver?.disconnect();
    try {
      content.cleanup?.();
    } catch (e) {
      console.error(e);
    }
    content.abort.abort();
    for (const table of content.tables) {
      try {
        table.destroy();
      } catch (e) {
        console.error(e);
      }
    }
    content.rowDiv.remove();
  }

  private clearAll(): void {
    for (const entry of Array.from(this.entries.values())) {
      this.destroyContent(entry);
    }
    this.entries.clear();
    this.byIndex.clear();
    this.visibleNow.clear();
  }

  /** The mouse wheel over a detail row: scrolls the outer table if nothing in the detail row takes the movement. */
  private onWheel(evt: WheelEvent): void {
    if (evt.defaultPrevented || evt.ctrlKey) {
      return;
    }
    const viewport = this.scope.scrollViewport;
    const unit = evt.deltaMode === 1 ? 16 : evt.deltaMode === 2 ? viewport.clientHeight : 1;
    const dy = evt.deltaY * unit;
    const dx = evt.deltaX * unit;
    if (this.canScrollInside(evt.target, dx, dy)) {
      return; // the detail (e.g. a nested table) scrolls itself
    }
    const top = viewport.scrollTop;
    const left = viewport.scrollLeft;
    if (dy) {
      viewport.scrollTop = top + dy * this.scope.getScrollerToContentRatioY();
    }
    if (dx) {
      viewport.scrollLeft = left + dx;
    }
    if (viewport.scrollTop !== top || viewport.scrollLeft !== left) {
      evt.preventDefault(); // the table scrolled – not the page
    }
  }

  private canScrollInside(target: EventTarget | null, dx: number, dy: number): boolean {
    let element = target instanceof Element ? target : null;
    while (element && element !== this.layer) {
      if (element instanceof HTMLElement) {
        const style = getComputedStyle(element);
        if (dy && /(auto|scroll)/.test(style.overflowY) && element.scrollHeight > element.clientHeight) {
          if (dy > 0 ? element.scrollTop + element.clientHeight < element.scrollHeight - 1 : element.scrollTop > 0) {
            return true;
          }
        }
        if (dx && /(auto|scroll)/.test(style.overflowX) && element.scrollWidth > element.clientWidth) {
          if (canScrollHorizontally(element, dx, style.direction === "rtl")) { // also right-to-left (1.1.98)
            return true;
          }
        }
      }
      element = element.parentElement;
    }
    return false;
  }

  /**
   * True if Tab on the master row `rowIndex` goes into its open detail row (a focusable element in it) – Excel-style
   * editing then leaves Tab to this service.
   *
   * @param {number} rowIndex - display row index of the focused cell
   * @returns {boolean} true with a tab target
   * @since 1.1.99
   */
  hasTabTarget(rowIndex: number): boolean {
    const content = this.byIndex.get(rowIndex)?.content;
    const entry = this.byIndex.get(rowIndex);
    return !!entry && !!content && !content.parked && this.visibleNow.has(entry) && !!this.findFocusable(content.cell);
  }

  /** Tab on a master row with an open detail row: the focus moves to the first focusable element in it. */
  private onHostKeyDown(evt: KeyboardEvent): void {
    if (evt.key !== "Tab" || evt.shiftKey || evt.altKey || evt.ctrlKey || evt.metaKey || evt.defaultPrevented
      || evt.target !== this.scope.hostElement || this.isInLayer(evt)) {
      return;
    }
    const focus = this.scope.focusModel()?.getFocus();
    const entry = focus ? this.byIndex.get(focus[0]) : undefined;
    const content = entry?.content;
    if (!content || content.parked || !this.visibleNow.has(entry)) {
      return;
    }
    const target = this.findFocusable(content.cell);
    if (target) {
      evt.preventDefault();
      target.focus();
    }
  }

  /** The host got the focus back from a detail row (Shift+Tab): its master row gets the focus. */
  private onHostFocus(evt: FocusEvent): void {
    const from = evt.relatedTarget instanceof Node ? evt.relatedTarget : null;
    const rowIndex = this.getMasterRowIndexOf(from);
    if (rowIndex >= 0) {
      this.scope.focusDetailMaster(rowIndex);
    }
  }

  private findFocusable(root: HTMLElement): HTMLElement | undefined {
    for (const element of Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE))) {
      const tabindex = element.getAttribute("tabindex");
      if ((tabindex !== null && Number(tabindex) < 0) || (element as HTMLInputElement).disabled) {
        continue;
      }
      if (element.getClientRects().length) {
        return element;
      }
    }
    return undefined;
  }
}
