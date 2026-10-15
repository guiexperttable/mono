import type { TableScope } from "../table-scope";
import { ColumnDefIf } from "../data/tablemodel/column/column-def.if";
import { SizeIf } from "../data/common/size.if";
import { SortItem } from "../data/common/sort-item";
import { CellRange } from "../data/common/cell-range";
import { TreeRowIf } from "../data/common/tree-row-if";
import { AreaModelTree } from "../data/tablemodel/areamodel/area-model-tree";
import { AreaModelIf } from "../data/tablemodel/areamodel/area-model.if";
import { isApiColumnVisible } from "../data/tablemodel/column/column-visibility";
import { isDefaultGetRowId } from "../data/options/default-row-id";
import { AutoRestoreOptionsIf, GetRowIdFn } from "../data/options/auto-restore-options.if";
import { GeStateChangeEvent } from "../data/common/event/ge-state-change-event";
import { isAreaModelTree, isRowGroup, isTreeRow } from "../instanceof-workaround";
import { SelectionModelIf } from "../selection/selection-model.if";
import { SelectionSnapshot } from "../selection/selection-model";
import { ALL_TABLE_STATE_PARTS } from "./table-state-part";
import { StateStorageIf } from "./state-storage.if";
import { readLegacyState, removeLegacyState } from "./table-state-migration";
import {
  TableColumnStateIf,
  TableHeaderGroupStateIf,
  TableScrollStateIf,
  TableSelectionStateIf,
  TableSortStateIf,
  TableStateIf,
  TableStatePart,
  TableStateRangeIf,
  TableStateRowId,
  TableTreeStateIf
} from "./table-state.if";

/** The flag of {@link AutoRestoreOptionsIf} that stores a part. */
const PART_FLAGS: Record<TableStatePart, keyof AutoRestoreOptionsIf<unknown>> = {
  headerGroups: "autoRestoreHeaderGroupState",
  columns: "autoRestoreColumnLayout",
  tree: "autoRestoreCollapsedExpandedState",
  sort: "autoRestoreSortingState",
  checked: "autoRestoreCheckedState",
  selection: "autoRestoreSelectedState",
  scroll: "autoRestoreScrollPosition",
  custom: "autoRestoreCustomState"
};

/** The field of a {@link TableStateIf} that holds a part. */
const fieldOf = (part: TableStatePart): keyof TableStateIf => part === "checked" ? "checkedRowIds" : part;

/** The header model of grouped headers (duck typing – `instanceof` fails across package copies). */
interface ToggleGroupHeaderModel {
  getToggleGroupStates(): TableHeaderGroupStateIf[];
}

/** A selection model with snapshots ({@link SelectionModel}). */
type SnapshotSelectionModel = SelectionModelIf & {
  selectionType?: string;
  createSnapshot?: () => SelectionSnapshot;
  restoreSnapshot?: (snapshot: SelectionSnapshot) => void;
};

const MAX = Number.MAX_SAFE_INTEGER;

/**
 * Collects and applies the {@link TableStateIf} of one table, stores it ({@link AutoRestoreOptionsIf}) and reports
 * changes ({@link EventListenerIf.onStateChanged}). One instance per {@link TableScope} (`tableScope.stateService`);
 * use the methods of {@link TableApi} instead.
 *
 * Changes are only marked ({@link markDirty}); after {@link TableOptionsIf.stateChangedDebounceDelay} the dirty
 * parts are computed once, compared with the last reported state, stored with ONE storage write and reported with
 * ONE event – no storage access per scroll frame.
 *
 * @category Internals
 * @since 1.1.92
 */
export class TableStateService {

  /** Suffix of the storage key: `<key>tableState`. */
  static readonly STORAGE_SUFFIX = "tableState";

  /** Parts that need a pass over all rows: no baseline at the start, computed only when they are used. */
  private static readonly EXPENSIVE: readonly TableStatePart[] = ["tree", "checked", "selection"];

  /** The restore of the first `firstInit()` is running (or has not finished). */
  private restoring = false;
  private started = false;
  private destroyed = false;

  private readonly dirty = new Set<TableStatePart>();
  private timer?: ReturnType<typeof setTimeout>;
  /** JSON per part of the last reported (or restored) state. */
  private readonly lastReported = new Map<TableStatePart, string>();
  /** The last reported state – a flush recomputes only the dirty parts. */
  private reported: TableStateIf = { version: 1 };
  /** The scroll position of the last reported state (a number compare – no string prefixes). */
  private reportedScroll?: { left: number; top: number };
  /** The last stored JSON (no second write for the same state). */
  private lastPersisted?: string;
  /** The keys before 1.1.92 are removed with the first save of this table. */
  private legacyRemoved = false;

  /** Properties of the sorted columns, primary key first (the header shows only the sort states). */
  private sortPriority: string[] = [];
  /** The widths of the column definitions before anything was restored (a width is stored only if it changed). */
  private readonly initialWidths = new Map<ColumnDefIf, SizeIf>();
  /** The state right after the table was built – {@link resetState}. */
  private defaultState?: TableStateIf;
  /** The state applied at the start: stored state over `initialState`. */
  private startState: Partial<TableStateIf> = {};
  private custom: unknown = undefined;

  private warnedNoRowObject = false;
  private warnedNoId = false;

  constructor(private readonly scope: TableScope) {
    this.warnWithoutStorageKey();
  }

  // ------------------------------------------------------------------ start (firstInit)

  /**
   * First `firstInit()` only, before `tableModel.init()`: reads the start state and applies the header groups
   * (they decide which column definitions exist).
   */
  initBeforeModel(): void {
    if (this.started) {
      return;
    }
    this.started = true;
    this.restoring = true;
    this.startState = this.readStartState();
    this.defaultState = { version: 1 };
    this.computePart("headerGroups", this.defaultState);
    if (this.startState.headerGroups) {
      this.applyHeaderGroups(this.startState.headerGroups);
    }
  }

  /** After `tableModel.init()`: remembers the defaults, applies the column layout. */
  initAfterModel(): void {
    if (!this.restoring) {
      return;
    }
    for (const columnDef of this.columnDefs()) {
      this.initialWidths.set(columnDef, columnDef.width);
    }
    this.sortPriority = this.columnDefs().filter(cd => cd.sortState && cd.property).map(cd => cd.property);
    // the expensive parts (a pass over all rows) only if they are stored or given – resetState() restores them then
    const used = (part: TableStatePart) =>
      this.persistedParts().includes(part) || this.startState[fieldOf(part)] !== undefined;
    const defaults = this.getState(ALL_TABLE_STATE_PARTS.filter(part => part !== "headerGroups" && part !== "scroll"
      && part !== "custom" && (!TableStateService.EXPENSIVE.includes(part) || used(part))));
    this.defaultState = { ...this.defaultState, ...defaults, scroll: { left: 0, top: 0 } };
    if (this.startState.columns) {
      this.applyColumns(this.startState.columns, false);
    }
  }

  /** After the external filter: tree, sorting, checked rows, selection. */
  initAfterFilter(): void {
    if (!this.restoring) {
      return;
    }
    const start = this.startState;
    if (start.tree) this.applyTree(start.tree);
    if (start.sort) this.applySort(start.sort);
    if (start.checkedRowIds) this.applyChecked(start.checkedRowIds);
    if (start.selection) this.applySelection(start.selection);
    if ("custom" in start) this.custom = start.custom;
  }

  /** After the layout (scroll height known): scroll position; the restore is finished. */
  initAfterLayout(): void {
    if (!this.restoring) {
      return;
    }
    if (this.startState.scroll) {
      this.applyScroll(this.startState.scroll);
    }
    this.restoring = false;
    // baseline for the change detection – without the expensive parts (their first change is always reported)
    this.rememberAsReported(this.getState(ALL_TABLE_STATE_PARTS.filter(p => !TableStateService.EXPENSIVE.includes(p))));
  }

  // ------------------------------------------------------------------ public API (via TableApi)

  /**
   * The current state (all parts, or the given ones). Parts that do not apply to the table are left out (e.g. `tree`
   * without a tree, `columns` without column definitions).
   *
   * @param {TableStatePart[]} [parts] - the parts to read, default: all
   * @returns {TableStateIf} the state
   */
  getState(parts: readonly TableStatePart[] = ALL_TABLE_STATE_PARTS): TableStateIf {
    const state: TableStateIf = { version: 1 };
    for (const part of parts) {
      this.computePart(part, state);
    }
    return state;
  }

  /**
   * Applies the parts of a state (only the parts it contains, optionally only the given ones) and repaints.
   * Reports the change with `onStateChanged` and stores it.
   *
   * @param {Partial<TableStateIf>} state - the state
   * @param {TableStatePart[]} [parts] - only these parts
   */
  applyState(state: Partial<TableStateIf>, parts: readonly TableStatePart[] = ALL_TABLE_STATE_PARTS): void {
    if (!state || typeof state !== "object") {
      return;
    }
    const has = (part: TableStatePart) => parts.includes(part) && state[fieldOf(part)] !== undefined;
    const applied: TableStatePart[] = [];
    let recalcWidths = false;
    if (has("headerGroups") && this.applyHeaderGroups(state.headerGroups!)) {
      applied.push("headerGroups");
    }
    if (has("columns")) {
      recalcWidths = this.applyColumns(state.columns!, true);
      applied.push("columns");
    }
    if (has("tree")) {
      this.applyTree(state.tree!);
      applied.push("tree");
    }
    if (has("sort")) {
      this.applySort(state.sort!);
      applied.push("sort");
    }
    if (has("checked")) {
      this.applyChecked(state.checkedRowIds!);
      applied.push("checked");
    }
    if (has("selection")) {
      this.applySelection(state.selection!);
      applied.push("selection");
    }
    if (parts.includes("custom") && "custom" in state) {
      this.custom = state.custom;
      applied.push("custom");
    }
    if (applied.includes("headerGroups")) {
      this.scope.headerGroupsChanged();   // rebuilds the layout (new column definitions)
    } else if (recalcWidths) {
      this.scope.recalcColumnWidths();
    } else if (applied.length) {
      this.scope.tableModel.recalcHeightAndPadding();
      this.scope.recalcWrappers();
      this.scope.repaintHard();
    }
    if (has("scroll")) {
      this.applyScroll(state.scroll!);
      applied.push("scroll");
    }
    applied.forEach(part => this.markDirty(part));
  }

  /**
   * Back to the state right after the table was built (the code's column layout, sort icons, header groups, without
   * the restored state; tree, checked rows and selection when they are stored or were given as `initialState`),
   * scrolled to the top, custom data removed – and removes the stored state.
   */
  resetState(): void {
    if (!this.defaultState) {
      return;
    }
    this.applyState(this.defaultState);
    this.custom = undefined;
    this.markDirty("custom");
    this.flush();
    const key = this.storageKey();
    const storage = this.storage();
    if (key && storage) {
      try {
        storage.removeItem(key + TableStateService.STORAGE_SUFFIX);
        removeLegacyState(storage, key);
      } catch (_e) {
        // storage blocked
      }
    }
    this.lastPersisted = undefined;
  }

  /** Sets the part `custom` (data of the application). */
  setCustomState(custom: unknown): void {
    this.custom = custom;
    this.markDirty("custom");
  }

  /** The column was sorted by a header click / `sortByColumn` – it becomes the primary sort key. */
  sortedByColumn(property: string | undefined): void {
    this.sortPriority = property ? [property] : [];
    this.markDirty("sort");
  }

  /**
   * Marks a part as changed. After {@link TableOptionsIf.stateChangedDebounceDelay} the state is stored and
   * reported – only if it really changed. No effect before the table is built.
   *
   * @param {TableStatePart} part - the changed part
   */
  markDirty(part: TableStatePart): void {
    if (!this.started || this.restoring || this.destroyed) {
      return;
    }
    this.dirty.add(part);
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => this.flush(), this.scope.tableOptions.stateChangedDebounceDelay ?? 300);
  }

  /** Called after each render pass: marks the scroll position as changed if it changed. */
  rendered(): void {
    if (this.restoring || !this.started) {
      return;
    }
    const viewport = this.scope.scrollViewport;
    const last = this.reportedScroll;
    if (!last || last.left !== viewport.scrollLeft || last.top !== viewport.scrollTop) {
      this.markDirty("scroll");
    }
  }

  /**
   * Stores and reports the dirty parts now (normally called by the timer of {@link markDirty}).
   */
  flush(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
    if (!this.dirty.size || !this.started || this.restoring) {
      return;
    }
    // changes of the checked rows made by the app through the model are not reported – check them with every save
    if (this.persistedParts().includes("checked")) {
      this.dirty.add("checked");
    }
    const parts = ALL_TABLE_STATE_PARTS.filter(part => this.dirty.has(part));
    this.dirty.clear();
    try {
      const fresh = this.getState(parts);
      const changed = parts.filter(part => this.partJson(fresh, part) !== this.lastReported.get(part));
      if (!changed.length) {
        return;
      }
      const state: TableStateIf = { ...this.reported };
      for (const part of parts) {
        const field = fieldOf(part);
        if (fresh[field] === undefined) {
          delete state[field];
        } else {
          (state as unknown as Record<string, unknown>)[field] = fresh[field];
        }
        this.lastReported.set(part, this.partJson(fresh, part));
      }
      this.reported = state;
      if (fresh.scroll) this.reportedScroll = { left: fresh.scroll.left, top: fresh.scroll.top };
      this.persist(state);
      // a copy: the app may change it without changing what is stored next time
      this.scope.stateChanged(new GeStateChangeEvent(JSON.parse(JSON.stringify(state)) as TableStateIf, changed));
    } catch (e) {
      console.error("GuiExpert Table: the table state could not be stored or reported", e);
    }
  }

  /** Stops the timer and stores / reports a pending change (called by `TableScope.destroy()`). */
  destroy(): void {
    if (this.destroyed) {
      return;
    }
    if (this.started && !this.restoring && this.persistedParts().includes("checked")) {
      this.dirty.add("checked"); // checked rows changed by the app are stored at the latest now
    }
    try {
      this.flush();
    } finally {
      this.destroyed = true;
    }
  }

  // ------------------------------------------------------------------ storage

  private storageKey(): string | undefined {
    const fn = this.scope.tableOptions.autoRestoreOptions?.getStorageKeyFn;
    const key = fn ? fn() : undefined;
    return key || undefined;
  }

  private storage(): StateStorageIf | undefined {
    const own = this.scope.tableOptions.autoRestoreOptions?.storage;
    if (own) {
      return own;
    }
    try {
      return typeof localStorage === "undefined" ? undefined : localStorage;
    } catch (_e) {
      return undefined; // access denied (sandboxed iframe)
    }
  }

  /** The parts switched on in {@link AutoRestoreOptionsIf}. */
  private persistedParts(): TableStatePart[] {
    const options = this.scope.tableOptions.autoRestoreOptions;
    if (!options) {
      return [];
    }
    return ALL_TABLE_STATE_PARTS.filter(part => !!options[PART_FLAGS[part]]);
  }

  private warnWithoutStorageKey(): void {
    const options = this.scope.tableOptions.autoRestoreOptions;
    if (options && this.persistedParts().length && !this.storageKey()) {
      console.warn("GuiExpert Table: autoRestoreOptions are ignored without getStorageKeyFn (nothing is stored).");
    }
  }

  /** The stored state (or the one of the keys before 1.1.92) over `tableOptions.initialState`. */
  private readStartState(): Partial<TableStateIf> {
    const initial = this.scope.tableOptions.initialState ?? {};
    const parts = this.persistedParts();
    const key = this.storageKey();
    const storage = this.storage();
    if (!parts.length || !key || !storage) {
      return { ...initial };
    }
    let stored: Partial<TableStateIf> | undefined;
    try {
      const json = storage.getItem(key + TableStateService.STORAGE_SUFFIX);
      if (json) {
        const parsed = JSON.parse(json);
        if (parsed && typeof parsed === "object" && parsed.version === 1) {
          stored = parsed;
          this.lastPersisted = json;
        }
      }
    } catch (_e) {
      // storage blocked or invalid JSON – start without a stored state
    }
    if (!stored) {
      stored = readLegacyState(storage, key, this.columnDefs().map(cd => cd.property));
    }
    const ret: Partial<TableStateIf> = { ...initial };
    if (stored) {
      for (const part of parts) {
        const field = fieldOf(part);
        if (field in stored) {
          (ret as Record<string, unknown>)[field] = (stored as Record<string, unknown>)[field];
        }
      }
    }
    return ret;
  }

  private persist(state: TableStateIf): void {
    const parts = this.persistedParts();
    const key = this.storageKey();
    const storage = this.storage();
    if (!parts.length || !key || !storage) {
      return;
    }
    const subset: TableStateIf = { version: 1 };
    for (const part of parts) {
      const field = fieldOf(part);
      if (state[field] !== undefined) {
        (subset as unknown as Record<string, unknown>)[field] = state[field];
      }
    }
    const json = JSON.stringify(subset);
    if (json === this.lastPersisted) {
      return;
    }
    try {
      storage.setItem(key + TableStateService.STORAGE_SUFFIX, json);
      this.lastPersisted = json;
      if (!this.legacyRemoved) {
        removeLegacyState(storage, key);   // the keys before 1.1.92 – once, after the first successful save
        this.legacyRemoved = true;
      }
    } catch (_e) {
      // storage blocked (private mode, quota) – the table keeps working without persistence
    }
  }

  private rememberAsReported(state: TableStateIf): void {
    this.reported = state;
    if (state.scroll) this.reportedScroll = { left: state.scroll.left, top: state.scroll.top };
    for (const part of ALL_TABLE_STATE_PARTS) {
      if (fieldOf(part) in state) this.lastReported.set(part, this.partJson(state, part));
    }
  }

  private partJson(state: TableStateIf, part: TableStatePart): string {
    const value = state[fieldOf(part)];
    return value === undefined ? "" : JSON.stringify(value);
  }

  // ------------------------------------------------------------------ compute

  private computePart(part: TableStatePart, state: TableStateIf): void {
    switch (part) {
      case "headerGroups": {
        const groups = this.headerGroupModel()?.getToggleGroupStates();
        if (groups?.length) state.headerGroups = groups;
        break;
      }
      case "columns": {
        const columns = this.computeColumns();
        if (columns) state.columns = columns;
        break;
      }
      case "sort": {
        const sort = this.computeSort();
        if (sort) state.sort = sort;
        break;
      }
      case "scroll":
        state.scroll = this.computeScroll();
        break;
      case "tree": {
        const tree = this.computeTree();
        if (tree) state.tree = tree;
        break;
      }
      case "checked": {
        const checked = this.computeChecked();
        if (checked) state.checkedRowIds = checked;
        break;
      }
      case "selection": {
        const selection = this.computeSelection();
        if (selection) state.selection = selection;
        break;
      }
      case "custom":
        if (this.custom !== undefined) state.custom = this.custom;
        break;
    }
  }

  private computeColumns(): TableColumnStateIf[] | undefined {
    const defs = this.columnDefs();
    if (!defs.length) {
      return undefined;
    }
    const seen = new Set<string>();
    const ret: TableColumnStateIf[] = [];
    for (const def of defs) {
      if (!def.property || seen.has(def.property)) {
        continue;
      }
      seen.add(def.property);
      const column: TableColumnStateIf = { property: def.property };
      const initial = this.initialWidths.get(def);
      if (initial && def.width && (initial.value !== def.width.value || initial.unit !== def.width.unit)
        && def.width.unit === "px") {
        column.width = def.width.value;
      }
      column.visible = isApiColumnVisible(def);
      ret.push(column);
    }
    return ret;
  }

  private computeSort(): TableSortStateIf[] | undefined {
    const defs = this.columnDefs();
    if (!defs.length) {
      return undefined;
    }
    const rank = (cd: ColumnDefIf) => {
      const i = this.sortPriority.indexOf(cd.property);
      return i < 0 ? MAX : i;
    };
    return defs
      .filter(cd => cd.sortState && cd.property)
      .map((cd, index) => ({ cd, index }))
      .sort((a, b) => (rank(a.cd) - rank(b.cd)) || (a.index - b.index))
      .map(({ cd }) => ({ property: cd.property, sortState: cd.sortState! }));
  }

  private computeScroll(): TableScrollStateIf {
    const viewport = this.scope.scrollViewport;
    const scroll: TableScrollStateIf = { left: viewport.scrollLeft, top: viewport.scrollTop };
    const first = this.scope.getFirstVisibleRowIndex();
    if (first > -1 && this.body().getRowCount() > 0) {
      const id = this.idAt(first, this.warns("scroll"));
      if (id !== undefined) scroll.firstRowId = id;
    }
    return scroll;
  }

  private computeTree(): TableTreeStateIf | undefined {
    const body = this.body();
    if (!isAreaModelTree(body)) {
      return undefined;
    }
    const expanded: TableStateRowId[] = [];
    const collapsed: TableStateRowId[] = [];
    const warn = this.warns("tree");
    this.walkTree(body as AreaModelTree<unknown>, node => {
      if (node.children?.length) {
        const id = this.idOfRow(node, -1, warn);
        if (id !== undefined) (node.expanded ? expanded : collapsed).push(id);
      }
    });
    return expanded.length <= collapsed.length ? { expandedRowIds: expanded } : { collapsedRowIds: collapsed };
  }

  private computeChecked(): TableStateRowId[] | undefined {
    const model = this.body().rowSelectionModel;
    if (!model) {
      return undefined;
    }
    const warn = this.warns("checked");
    const ret: TableStateRowId[] = [];
    for (const row of model.getCheckedRows() ?? []) {
      const id = this.idOfRow(row, -1, warn);
      if (id !== undefined) ret.push(id);
    }
    return ret;
  }

  private computeSelection(): TableSelectionStateIf | undefined {
    const sm = this.scope.selectionModel() as SnapshotSelectionModel | undefined;
    if (!sm || !sm.selectionType || sm.selectionType === "none") {
      return undefined;
    }
    const snapshot: SelectionSnapshot = sm.createSnapshot
      ? sm.createSnapshot()
      : { ranges: sm.getRanges(), negativeRanges: [], allSelected: sm.isAllSelected() };
    const warn = this.warns("selection");
    const toState = (ranges: CellRange[]) => ranges
      .map(range => this.toStateRange(range, warn))
      .filter((range): range is TableStateRangeIf => !!range);
    const ret: TableSelectionStateIf = { ranges: toState(snapshot.ranges) };
    if (snapshot.negativeRanges.length) ret.negativeRanges = toState(snapshot.negativeRanges);
    if (snapshot.allSelected) ret.allSelected = true;
    return ret;
  }

  /**
   * A cell range → ids and properties. A range to the last row / column (`MAX_SAFE_INTEGER`) has no `toRowId` /
   * `toProperty` ("to the end"); a range over all rows / columns has neither.
   */
  private toStateRange(range: CellRange, warn: boolean): TableStateRangeIf | undefined {
    const ret: TableStateRangeIf = {};
    const r1 = Math.min(range.r1, range.r2);
    const r2 = Math.max(range.r1, range.r2);
    if (!(r1 <= 0 && r2 >= MAX)) {
      const from = this.idAt(r1, warn);
      if (from === undefined) return undefined;
      ret.fromRowId = from;
      if (r2 < MAX) {
        const to = this.idAt(r2, warn);
        if (to === undefined) return undefined;
        ret.toRowId = to;
      }
    }
    const c1 = Math.min(range.c1, range.c2);
    const c2 = Math.max(range.c1, range.c2);
    if (!(c1 <= 0 && c2 >= MAX)) {
      const defs = this.columnDefs();
      const from = defs[c1]?.property;
      if (!from) return undefined;
      ret.fromProperty = from;
      if (c2 < MAX) {
        const to = defs[c2]?.property;
        if (!to) return undefined;
        ret.toProperty = to;
      }
    }
    return ret;
  }

  // ------------------------------------------------------------------ apply

  /** @returns true if a group changed */
  private applyHeaderGroups(groups: TableHeaderGroupStateIf[]): boolean {
    const header = this.scope.tableModel.getAreaModel("header") as AreaModelIf & {
      setGroupClosed?(id: string, closed: boolean): ColumnDefIf[] | undefined;
      getToggleGroupStates?(): TableHeaderGroupStateIf[];
    };
    if (!header.setGroupClosed || !header.getToggleGroupStates || !Array.isArray(groups)) {
      return false;
    }
    const current = new Map(header.getToggleGroupStates().map(g => [g.id, g.closed]));
    let changed = false;
    for (const group of groups) {
      if (group && current.has(group.id) && current.get(group.id) !== !!group.closed) {
        const defs = header.setGroupClosed(group.id, !!group.closed);
        if (defs && "columnDefs" in this.scope.tableModel) {
          (this.scope.tableModel as { columnDefs: ColumnDefIf[] }).columnDefs = defs;
        }
        changed = true;
      }
    }
    return changed;
  }

  /**
   * Order, visibility and widths of the columns.
   *
   * @param {TableColumnStateIf[]} columns - the stored columns
   * @param {boolean} resetMissingWidths - columns without width get the width of the code back (applyState)
   * @returns true if the widths must be recalculated (a `%` or weight width came back)
   */
  private applyColumns(columns: TableColumnStateIf[], resetMissingWidths: boolean): boolean {
    const model = this.scope.tableModel;
    const defs = this.columnDefs();
    if (!defs.length || !Array.isArray(columns)) {
      return false;
    }
    const known = new Map<string, TableColumnStateIf>();
    for (const column of columns) {
      if (column && typeof column.property === "string" && !known.has(column.property)
        && defs.some(def => def.property === column.property)) {
        known.set(column.property, column);
      }
    }
    // order: the known columns in the stored order; every other column (e.g. new in the code) stays behind the
    // column it follows now (processed in the current order, so that column is already placed)
    const current = defs.map(def => def.property);
    const target = Array.from(known.keys());
    const placed = new Set<string>();
    current.forEach((property, i) => {
      if (known.has(property) && !placed.has(property)) {
        placed.add(property);
        return;
      }
      const at = i > 0 ? target.lastIndexOf(current[i - 1]) : -1;
      target.splice(at + 1, 0, property);
    });
    for (let i = 0; i < target.length; i++) {
      const now = model.getColumnDefs()!.map(def => def.property);
      const from = now.indexOf(target[i], i);
      if (from > i) {
        model.changeColumnOrder(from, i);   // keeps column sizes and the properties of the area models in sync
      }
    }
    let recalc = false;
    const ordered = this.columnDefs();
    ordered.forEach((def, index) => {
      const column = known.get(def.property);
      if (!column) {
        return;
      }
      if (typeof column.visible === "boolean" && isApiColumnVisible(def) !== column.visible) {
        model.setColumnVisible?.(index, column.visible);
      }
      if (typeof column.width === "number" && column.width >= 0) {
        model.setColumnWidth(index, column.width);
      } else if (resetMissingWidths) {
        const initial = this.initialWidths.get(def);
        if (initial && (initial.value !== def.width.value || initial.unit !== def.width.unit)) {
          if (initial.unit === "px") {
            model.setColumnWidth(index, initial.value);
          } else {
            recalc = true;
          }
          def.width = initial;
        }
      }
    });
    return recalc;
  }

  private applyTree(tree: TableTreeStateIf): void {
    const body = this.body();
    if (!isAreaModelTree(body) || !tree) {
      return;
    }
    const useExpanded = Array.isArray(tree.expandedRowIds);
    if (!useExpanded && !Array.isArray(tree.collapsedRowIds)) {
      return;
    }
    const ids = new Set<TableStateRowId>((useExpanded ? tree.expandedRowIds : tree.collapsedRowIds) ?? []);
    const amt = body as AreaModelTree<unknown>;
    this.walkTree(amt, node => {
      if (node.children?.length) {
        const id = this.idOfRow(node, -1, false);
        if (id !== undefined) node.expanded = useExpanded ? ids.has(id) : !ids.has(id);
      }
    });
    amt.recalcVisibleTreeRows(false);
  }

  private applySort(sort: TableSortStateIf[]): void {
    if (!Array.isArray(sort)) {
      return;
    }
    const defs = this.columnDefs();
    const items: SortItem[] = [];
    const priority: string[] = [];
    for (const entry of sort) {
      if (!entry || (entry.sortState !== "asc" && entry.sortState !== "desc")) continue;
      const index = typeof entry.property === "string"
        ? defs.findIndex(def => def.property === entry.property)
        : (typeof entry.columnIndex === "number" ? entry.columnIndex : -1);
      if (index < 0 || index >= this.scope.tableModel.getColumnCount() || items.some(i => i.columnIndex === index)) {
        continue;
      }
      items.push(new SortItem(index, entry.sortState));
      if (defs[index]?.property) priority.push(defs[index].property);
    }
    this.scope.applySortItems(items);
    this.sortPriority = priority;
  }

  private applyChecked(ids: TableStateRowId[]): void {
    const body = this.body();
    const model = body.rowSelectionModel;
    if (!model || !Array.isArray(ids)) {
      return;
    }
    const wanted = new Set<TableStateRowId>(ids);
    if (isAreaModelTree(body)) {
      const amt = body as AreaModelTree<unknown>;
      this.walkTree(amt, node => { node.checked = false; });
      this.walkTree(amt, node => {
        const id = this.idOfRow(node, -1, false);
        if (id !== undefined && wanted.has(id) && !node.checked) model.checkRow(node, true);
      });
      return;
    }
    const holder = body as AreaModelIf & { getAllRows?: () => unknown[] };
    const rows = holder.getAllRows
      ? holder.getAllRows()
      : Array.from({ length: body.getRowCount() }, (_, i) => body.getRowByIndex(i));
    model.setCheckedRows(rows.filter((row, i) => {
      const id = this.idOfRow(row, holder.getAllRows ? -1 : i, false);
      return id !== undefined && wanted.has(id);
    }));
  }

  private applySelection(selection: TableSelectionStateIf): void {
    const sm = this.scope.selectionModel() as SnapshotSelectionModel | undefined;
    if (!sm || !selection || !Array.isArray(selection.ranges)) {
      return;
    }
    const all = [...selection.ranges, ...(selection.negativeRanges ?? [])];
    const indexById = all.some(r => r && (r.fromRowId !== undefined || r.toRowId !== undefined))
      ? this.rowIndexMap()
      : new Map<TableStateRowId, number>();
    const defs = this.columnDefs();
    const toRange = (range: TableStateRangeIf): CellRange | undefined => {
      if (!range) return undefined;
      let r1 = 0, r2 = MAX, c1 = 0, c2 = MAX;
      if (range.fromRowId !== undefined || range.toRowId !== undefined) {
        const a = indexById.get((range.fromRowId ?? range.toRowId)!);
        // no toRowId: "to the last row"
        const b = range.toRowId === undefined ? MAX : indexById.get(range.toRowId);
        if (a === undefined || b === undefined) return undefined;
        r1 = Math.min(a, b);
        r2 = Math.max(a, b);
      }
      if (range.fromProperty !== undefined || range.toProperty !== undefined) {
        const a = defs.findIndex(def => def.property === (range.fromProperty ?? range.toProperty));
        const b = range.toProperty === undefined ? MAX : defs.findIndex(def => def.property === range.toProperty);
        if (a < 0 || b < 0) return undefined;
        c1 = Math.min(a, b);
        c2 = Math.max(a, b);
      }
      return new CellRange(r1, c1, r2, c2);
    };
    const toRanges = (ranges: TableStateRangeIf[] | undefined) =>
      (ranges ?? []).map(toRange).filter((range): range is CellRange => !!range);
    const snapshot: SelectionSnapshot = {
      ranges: toRanges(selection.ranges),
      negativeRanges: toRanges(selection.negativeRanges),
      allSelected: !!selection.allSelected
    };
    if (sm.restoreSnapshot) {
      sm.restoreSnapshot(snapshot);
    } else {
      sm.clear();
      snapshot.ranges.forEach(range => sm.addSelection(range));
    }
  }

  private applyScroll(scroll: TableScrollStateIf): void {
    if (!scroll || typeof scroll.top !== "number" || typeof scroll.left !== "number") {
      return;
    }
    this.scope.scrollViewport.scrollTo(scroll.left, scroll.top);
    this.scope.adjustAfterScrolling(); // render now: the first visible row is known
    if (scroll.firstRowId === undefined) {
      return;
    }
    const first = this.scope.getFirstVisibleRowIndex();
    if (first > -1 && this.idAt(first, false) === scroll.firstRowId) {
      return;
    }
    const index = this.rowIndexMap().get(scroll.firstRowId);
    if (index !== undefined) {
      this.scope.scrollToIndex(-1, index);
      this.scope.adjustAfterScrolling();
    }
  }

  // ------------------------------------------------------------------ helpers

  private columnDefs(): ColumnDefIf[] {
    return this.scope.tableModel.getColumnDefs() ?? [];
  }

  private body(): AreaModelIf {
    return this.scope.tableModel.getBodyModel();
  }

  private headerGroupModel(): ToggleGroupHeaderModel | undefined {
    const header = this.scope.tableModel.getAreaModel("header") as Partial<ToggleGroupHeaderModel>;
    return header && typeof header.getToggleGroupStates === "function" ? header as ToggleGroupHeaderModel : undefined;
  }

  /** Warn about rows without id only for parts that are stored (a `getState()` for an own use stays quiet). */
  private warns(part: TableStatePart): boolean {
    return this.persistedParts().includes(part);
  }

  /** The own `getRowId`, `undefined` for the default of {@link AutoRestoreOptions} (or none). */
  private ownGetRowId(): GetRowIdFn<unknown> | undefined {
    const fn = this.scope.tableOptions.autoRestoreOptions?.getRowId;
    return fn && !isDefaultGetRowId(fn) ? fn : undefined;
  }

  /** The id of the displayed row at `index`. */
  private idAt(index: number, warn: boolean): TableStateRowId | undefined {
    return this.idOfRow(this.body().getRowByIndex(index), index, warn);
  }

  /**
   * The id of a row (tree rows: of `row.data`): an own `getRowId`, otherwise the property `id` or `uuid`. Rows
   * without id are not stored – the JSON fallback of the default `getRowId` would write whole rows (personal data)
   * into the storage. Rows without an object get an id only from an own `getRowId` that declares the second
   * parameter (`(_row, rowIndex) => rowIndex`).
   */
  private idOfRow(row: unknown, index: number, warn: boolean): TableStateRowId | undefined {
    const own = this.ownGetRowId();
    if (row === undefined || row === null) {
      if (own && own.length >= 2 && index > -1) {
        return own(undefined, index);
      }
      if (warn && !this.warnedNoRowObject) {
        this.warnedNoRowObject = true;
        console.warn("GuiExpert Table: the body model has no row objects – these rows are not stored. "
          + "Set autoRestoreOptions.getRowId = (_row, rowIndex) => rowIndex to store them by index.");
      }
      return undefined;
    }
    const data = isTreeRow(row) ? (row as TreeRowIf<unknown>).data : row;
    if (isRowGroup(data)) {
      return data.id; // a group of a row grouping: its stable path id, independent of getRowId
    }
    if (own) {
      return own(data, index);
    }
    if (data && typeof data === "object") {
      for (const key of ["id", "uuid"]) {
        const id = (data as Record<string, unknown>)[key];
        if (typeof id === "string" || typeof id === "number") {
          return id;
        }
      }
    }
    if (warn && !this.warnedNoId) {
      this.warnedNoId = true;
      console.warn("GuiExpert Table: rows without 'id' or 'uuid' are not stored – set autoRestoreOptions.getRowId.");
    }
    return undefined;
  }

  /** id → displayed row index (one pass over the displayed rows). */
  private rowIndexMap(): Map<TableStateRowId, number> {
    const body = this.body();
    const ret = new Map<TableStateRowId, number>();
    const count = body.getRowCount();
    for (let i = 0; i < count; i++) {
      const id = this.idAt(i, false);
      if (id !== undefined && !ret.has(id)) ret.set(id, i);
    }
    return ret;
  }

  private walkTree(model: AreaModelTree<unknown>, fn: (node: TreeRowIf<unknown>) => void): void {
    const walk = (rows: TreeRowIf<unknown>[] | undefined) => rows?.forEach(row => {
      fn(row);
      walk(row.children);
    });
    walk(model.rows);
  }
}
