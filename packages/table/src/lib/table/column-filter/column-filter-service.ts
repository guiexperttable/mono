import { createValueGetter } from "../aggregation/create-value-getter";
import type { FilterFunction } from "../data/common/filter-function";
import { GeFilterEvent, type GeFilterEventSource } from "../data/common/event/ge-filter-event";
import type { ColumnDefIf } from "../data/tablemodel/column/column-def.if";
import type { TreeRowIf } from "../data/common/tree-row-if";
import {
  isAreaModelPivot,
  isAreaModelRowGroups,
  isAreaModelTree,
  isCheckboxColumnDef,
  isPivotColumnDef,
  isRowGroupColumnDef,
  isRowNumberColumnDef,
  isTreeRow,
} from "../instanceof-workaround";
import type { TableScope } from "../table-scope";
import type {
  ColumnFilterColumnOption,
  ColumnFilterColumnOptionsIf,
  ColumnFilterOptionsIf,
  ColumnFilterTextsIf,
} from "./column-filter-options.if";
import { ColumnFilterOptions, ColumnFilterTexts } from "./column-filter-options";
import type { ColumnFilterType } from "./column-filter-type.type";
import type { ColumnFilterIf, ColumnFiltersMap } from "./column-filter.if";
import {
  collectDistinctValues,
  type CollectDistinctValuesOptionsIf,
  type DistinctValuesResultIf,
} from "./collect-distinct-values";
import {
  compileColumnFilterPredicate,
  isBlankFilterValue,
  type ColumnFilterResolverIf,
} from "./compile-column-filters";
import {
  areColumnFiltersEqual,
  deserializeColumnFilters,
  normalizeColumnFilter,
  serializeColumnFilters,
} from "./column-filter-state";
import { inferColumnFilterType } from "./infer-column-filter-type";

interface SheetLikeBody {
  columnOffset?: number;
  getSheetColumnCount?: () => number;
  getRowByIndex?: (r: number) => unknown;
  sheetCells?: { valueAt(row: unknown, col: number, raw: string): unknown };
}

interface ArrayOfArraysLikeBody {
  arr?: unknown[][];
}

interface ObjectArrayLikeBody {
  getAllRows?: () => unknown[];
}

interface SourceRowsLikeBody {
  getSourceRows?: () => unknown[];
}

interface TreeLikeBody {
  rows?: TreeRowIf<unknown>[];
}

const INDEX_KEY_RE = /^#(\d+)$/;

function extractColumnFilterOpts(opt: ColumnFilterColumnOption | undefined): Partial<ColumnFilterColumnOptionsIf> | undefined {
  if (opt && typeof opt === "object") {
    return opt;
  }
  return undefined;
}

function extractExplicitType(opt: ColumnFilterColumnOption | undefined): ColumnFilterType | undefined {
  if (typeof opt === "string") {
    return opt;
  }
  if (opt && typeof opt === "object") {
    return opt.type;
  }
  return undefined;
}

/**
 * Manages built-in column filters for one {@link TableScope} (`tableScope.columnFilterService`):
 * holds the active {@link ColumnFiltersMap}, compiles them into a single row predicate combined with
 * `tableOptions.externalFilterFunction`, caches inferred column types, updates the table state and fires
 * {@link EventListenerIf.onFilterChanged}.
 *
 * @category Internals
 * @since 1.1.114
 */
export class ColumnFilterService {

  private filters: ColumnFiltersMap = {};
  private readonly typeCache = new Map<string, ColumnFilterType>();
  private warnedNonFilterable = false;
  private cachedCompiled?: { filters: ColumnFiltersMap; fn: ((row: unknown) => boolean) | undefined };

  constructor(private readonly scope: TableScope) {}

  getOptions(): ColumnFilterOptionsIf {
    return ColumnFilterOptions.create(this.scope.tableOptions.columnFilter);
  }

  getTexts(): ColumnFilterTextsIf {
    return ColumnFilterTexts.create(this.scope.tableOptions.columnFilterTexts);
  }

  /** True if the column at `columnIndex` can be filtered by the user (filter row / filter menu). */
  isColumnFilterable(columnIndex: number): boolean {
    const model = this.scope.tableModel;
    if (columnIndex < 0 || columnIndex >= model.getColumnCount()) {
      return false;
    }
    const def = model.getColumnDef(columnIndex);
    if (def?.filter === false) {
      return false;
    }
    if (def?.filter === undefined) {
      if (
        isRowNumberColumnDef(def)
        || isCheckboxColumnDef(def)
        || isRowGroupColumnDef(def)
        || isPivotColumnDef(def)
      ) {
        return false;
      }
    }
    return true;
  }

  /** True if at least one column filter is active. */
  hasActiveFilters(): boolean {
    return Object.keys(this.filters).length > 0;
  }

  /** True if the body model supports client-side filtering. */
  isBodyFilterable(): boolean {
    return this.scope.tableModel.getBodyModel().isFilterable();
  }

  /** Resolves a column index, property string, `#<index>` key, or `ColumnDefIf`. */
  resolveColumn(column: number | string | ColumnDefIf): { property: string; columnIndex: number; columnDef?: ColumnDefIf } | undefined {
    const model = this.scope.tableModel;
    const defs = model.getColumnDefs();
    const count = model.getColumnCount();

    if (typeof column === "number") {
      if (column < 0 || column >= count) {
        return undefined;
      }
      const def = model.getColumnDef(column);
      const property = def?.property || `#${column}`;
      return { property, columnIndex: column, columnDef: def };
    }

    if (typeof column === "string") {
      if (!column) {
        return undefined;
      }
      if (defs) {
        for (let i = 0; i < defs.length; i++) {
          if (defs[i]?.property === column) {
            return { property: column, columnIndex: i, columnDef: defs[i] };
          }
        }
      }
      const m = INDEX_KEY_RE.exec(column);
      if (m) {
        const idx = Number(m[1]);
        if (idx >= 0 && idx < count) {
          const def = model.getColumnDef(idx);
          return { property: def?.property || `#${idx}`, columnIndex: idx, columnDef: def };
        }
      }
      // Allow source properties on Pivot / RowGroups even when not in columnDefs
      if (isAreaModelPivot(model.getBodyModel()) || isAreaModelRowGroups(model.getBodyModel())) {
        return { property: column, columnIndex: -1, columnDef: undefined };
      }
      return undefined;
    }

    if (column && typeof column === "object") {
      if (defs) {
        const idx = defs.indexOf(column);
        if (idx >= 0) {
          return { property: column.property || `#${idx}`, columnIndex: idx, columnDef: column };
        }
        if (column.property) {
          const byProp = defs.findIndex(d => d.property === column.property);
          if (byProp >= 0) {
            return { property: column.property, columnIndex: byProp, columnDef: defs[byProp] };
          }
        }
      }
      if (column.property) {
        return { property: column.property, columnIndex: -1, columnDef: column };
      }
    }
    return undefined;
  }

  /** Gets the filter of one column (copy), or `undefined` if unfiltered. */
  getColumnFilter(column: number | string | ColumnDefIf): ColumnFilterIf | undefined {
    const res = this.resolveColumn(column);
    if (!res) {
      return undefined;
    }
    const f = this.filters[res.property];
    return f ? normalizeColumnFilter(f) : undefined;
  }

  /** Returns a shallow/serialized copy of all active column filters. */
  getColumnFilters(): ColumnFiltersMap {
    return serializeColumnFilters(this.filters);
  }

  /** True if the column has an active filter. */
  isColumnFiltered(column: number | string | ColumnDefIf): boolean {
    const res = this.resolveColumn(column);
    return !!res && this.filters[res.property] !== undefined;
  }

  /** Sets or clears the filter of a single column, runs 1 filter pass + 1 render + 1 `onFilterChanged`. */
  setColumnFilter(
    column: number | string | ColumnDefIf,
    filter: ColumnFilterIf | undefined,
    source: GeFilterEventSource = "api",
  ): void {
    const res = this.resolveColumn(column);
    if (!res) {
      return;
    }
    const norm = normalizeColumnFilter(filter);
    const next: ColumnFiltersMap = { ...this.filters };
    if (norm) {
      next[res.property] = norm;
    } else {
      delete next[res.property];
    }
    this.commitFilters(next, res.property, source);
  }

  /** Replaces all column filters in one batch (1 filter pass, 1 render, 1 `onFilterChanged`). */
  setColumnFilters(filters: ColumnFiltersMap, source: GeFilterEventSource = "api"): void {
    const next: ColumnFiltersMap = {};
    const keys = Object.keys(filters ?? {});
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const res = this.resolveColumn(key);
      if (!res) {
        continue;
      }
      const norm = normalizeColumnFilter(filters[key]);
      if (norm) {
        next[res.property] = norm;
      }
    }
    this.commitFilters(next, undefined, source);
  }

  /** Clears all active column filters. */
  clearColumnFilters(source: GeFilterEventSource = "api"): void {
    if (!this.hasActiveFilters()) {
      return;
    }
    this.commitFilters({}, undefined, source);
  }

  /**
   * Restores filters from {@link TableStateService} (during `firstInit()` or `applyState()`).
   * Unknown column properties are ignored. Returns `true` if the filter set changed.
   */
  applyStateFilters(raw: unknown, runFilterNow: boolean): boolean {
    const valid = this.validPropertySet();
    const restored = deserializeColumnFilters(raw, valid);
    const changed = !areColumnFiltersEqual(this.filters, restored);
    this.filters = restored;
    this.cachedCompiled = undefined;
    if (runFilterNow && changed) {
      this.runManagedFilter(false, false);
      this.scope.onColumnFiltersChanged("state");
      this.emitFilterEvent(undefined, "state");
    } else if (changed) {
      this.scope.onColumnFiltersChanged("state");
    }
    return changed;
  }

  /**
   * Returns the effective {@link FilterFunction} combining `tableOptions.externalFilterFunction` and all active
   * column filters with AND. When no column filters are active (or `managed: false`), returns
   * `tableOptions.externalFilterFunction` directly (bit-identical to before 1.1.114).
   */
  getEffectiveFilterFunction(): FilterFunction<any> | undefined {
    const external = this.scope.tableOptions.externalFilterFunction;
    if (!this.hasActiveFilters() || !this.getOptions().managed) {
      return external;
    }
    const colFn = this.getCompiledColumnPredicate();
    if (!colFn) {
      return external;
    }
    if (!external) {
      return (row: unknown) => colFn(row);
    }
    return (row: any, index: number, array: any[]) => Boolean(external(row, index, array)) && colFn(row);
  }

  /** Clears cached column types (called after `setRows` or model changes). */
  invalidateTypeCache(): void {
    this.typeCache.clear();
    this.cachedCompiled = undefined;
  }

  /** Called by `TableApi.setRows()`: invalidates cached types and re-applies active column filters to the new rows. */
  onRowsReplaced(): void {
    this.invalidateTypeCache();
    if (this.hasActiveFilters() && this.getOptions().managed && this.isBodyFilterable()) {
      const fn = this.getEffectiveFilterFunction();
      if (fn) {
        this.scope.reapplyFilterAfterSetRows(fn);
      }
    }
  }

  /** Returns the effective {@link ColumnFilterType} of a column (explicit or inferred and cached). */
  getColumnFilterType(columnIndex: number, property: string, columnDef?: ColumnDefIf): ColumnFilterType {
    const explicit = extractExplicitType(columnDef?.filter);
    if (explicit) {
      return explicit;
    }
    const cached = this.typeCache.get(property);
    if (cached) {
      return cached;
    }
    // the first 100 non-blank values decide; blank rows at the start are skipped (looked at: up to 10 000 rows)
    const sample = this.collectSampleRows(10_000);
    const getter = this.buildValueGetter(property, columnIndex, columnDef);
    const inferred = inferColumnFilterType(sample, getter, 100);
    let hasValue = false;
    for (let i = 0; i < sample.length && !hasValue; i++) {
      hasValue = !isBlankFilterValue(getter(sample[i]));
    }
    if (hasValue) {
      this.typeCache.set(property, inferred); // without any value the answer is a guess: ask again next time
    }
    return inferred;
  }

  /**
   * Collects distinct values of one column over all source rows filtered by all **other** active filters
   * (Excel-style cascading values for the filter menu).
   */
  collectColumnDistinctValues(
    column: number | string | ColumnDefIf,
    options: CollectDistinctValuesOptionsIf = {},
  ): DistinctValuesResultIf {
    const res = this.resolveColumn(column);
    if (!res) {
      return { items: [], truncated: false };
    }
    const opts = this.getOptions();
    const texts = this.getTexts();
    const getter = this.buildValueGetter(res.property, res.columnIndex, res.columnDef);
    const otherPredicate = this.buildOtherFiltersPredicate(res.property);
    const allRows = this.getAllRowsForDistinct();
    const rows = otherPredicate ? allRows.filter((row, idx, arr) => otherPredicate(row, idx, arr)) : allRows;
    return collectDistinctValues(rows, getter, {
      maxValues: options.maxValues ?? opts.maxValues,
      search: options.search,
      blanksLabel: options.blanksLabel ?? texts.blanks,
      formatValue: options.formatValue,
    });
  }

  /** Snapshot of all filters excluding `excludeProperty`. */
  getOtherFilters(excludeProperty: string): ColumnFiltersMap {
    const out: ColumnFiltersMap = {};
    const keys = Object.keys(this.filters);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (k !== excludeProperty) {
        out[k] = this.filters[k]; // the filters as set (not serialized: Date values stay Date objects)
      }
    }
    return out;
  }

  // ------------------------------------------------------------------ internals

  private commitFilters(next: ColumnFiltersMap, property: string | undefined, source: GeFilterEventSource): void {
    const opts = this.getOptions();
    if (opts.managed && !this.isBodyFilterable()) {
      if (!this.warnedNonFilterable) {
        this.warnedNonFilterable = true;
        console.warn(
          "GuiExpert Table – columnFilter: body area model is not filterable (isFilterable() returned false). "
          + "Set tableOptions.columnFilter = { managed: false } for server-side filtering.",
        );
      }
      return;
    }

    const hadFilters = this.hasActiveFilters();
    const equal = areColumnFiltersEqual(this.filters, next);
    if (equal && (!hadFilters || Object.keys(next).length > 0)) {
      return;
    }

    this.filters = next;
    this.cachedCompiled = undefined;

    if (opts.managed) {
      this.runManagedFilter(true, true);
    }

    this.scope.onColumnFiltersChanged(source);
    this.scope.stateService.markDirty("filters");
    this.emitFilterEvent(property, source);
  }

  private runManagedFilter(clearSelection: boolean, repaintNow: boolean): void {
    const effective = this.getEffectiveFilterFunction();
    // When the last column filter is cleared without an externalFilterFunction, restore all rows with () => true.
    const predictFn: FilterFunction<any> = effective ?? (() => true);
    this.scope.applyFilterFunction(predictFn, clearSelection, repaintNow, true);
  }

  private emitFilterEvent(property: string | undefined, source: GeFilterEventSource): void {
    const body = this.scope.tableModel.getBodyModel();
    const rowCount = body.getRowCount();
    const unfilteredRowCount = body.getUnfilteredRowCount?.() ?? rowCount;
    const evt = new GeFilterEvent(
      serializeColumnFilters(this.filters),
      property,
      source,
      rowCount,
      unfilteredRowCount,
    );
    this.scope.getEventListener().onFilterChanged?.(evt);
  }

  private validPropertySet(): Set<string> | undefined {
    const body = this.scope.tableModel.getBodyModel();
    if (isAreaModelPivot(body) || isAreaModelRowGroups(body)) {
      return undefined; // source properties may not appear in columnDefs
    }
    const defs = this.scope.tableModel.getColumnDefs();
    const count = this.scope.tableModel.getColumnCount();
    const set = new Set<string>();
    if (defs && defs.length > 0) {
      for (let i = 0; i < defs.length; i++) {
        if (defs[i]?.property) {
          set.add(defs[i].property);
        } else {
          set.add(`#${i}`);
        }
      }
      return set;
    }
    for (let i = 0; i < count; i++) {
      set.add(`#${i}`);
    }
    return set;
  }

  private getCompiledColumnPredicate(): ((row: unknown) => boolean) | undefined {
    if (this.cachedCompiled && this.cachedCompiled.filters === this.filters) {
      return this.cachedCompiled.fn;
    }
    const fn = this.compileForFilters(this.filters);
    this.cachedCompiled = { filters: this.filters, fn };
    return fn;
  }

  private buildOtherFiltersPredicate(excludeProperty: string): FilterFunction<any> | undefined {
    const external = this.scope.tableOptions.externalFilterFunction;
    const otherFilters = this.getOtherFilters(excludeProperty);
    const otherFn = Object.keys(otherFilters).length > 0 ? this.compileForFilters(otherFilters) : undefined;
    if (!otherFn) {
      return external;
    }
    if (!external) {
      return (row: unknown) => otherFn(row);
    }
    return (row: any, idx: number, arr: any[]) => Boolean(external(row, idx, arr)) && otherFn(row);
  }

  private compileForFilters(filters: ColumnFiltersMap): ((row: unknown) => boolean) | undefined {
    const keys = Object.keys(filters);
    if (keys.length === 0) {
      return undefined;
    }
    const opts = this.getOptions();
    const resolvers: ColumnFilterResolverIf[] = [];
    for (let i = 0; i < keys.length; i++) {
      const prop = keys[i];
      const res = this.resolveColumn(prop);
      if (!res) {
        continue;
      }
      const colOpts = extractColumnFilterOpts(res.columnDef?.filter);
      const type = this.getColumnFilterType(res.columnIndex, res.property, res.columnDef);
      const getValue = this.buildValueGetter(res.property, res.columnIndex, res.columnDef);
      resolvers.push({
        property: prop,
        type,
        getValue,
        caseSensitive: colOpts?.caseSensitive ?? opts.caseSensitive,
      });
    }
    return compileColumnFilterPredicate(filters, resolvers, { caseSensitive: opts.caseSensitive });
  }

  private buildValueGetter(property: string, columnIndex: number, columnDef?: ColumnDefIf): (row: any) => unknown {
    const colOpts = extractColumnFilterOpts(columnDef?.filter);
    if (colOpts?.valueGetter) {
      return colOpts.valueGetter;
    }

    const body = this.scope.tableModel.getBodyModel();

    // Spreadsheet (AreaModelSheet): row is the sparse input array; formulas evaluated via sheetCells
    const sheetBody = body as unknown as SheetLikeBody;
    if (typeof sheetBody.getSheetColumnCount === "function") {
      const dataCol = columnIndex - (sheetBody.columnOffset ?? 0);
      const sheetCells = sheetBody.sheetCells;
      if (sheetCells) {
        return (row: unknown) => {
          const raw = Array.isArray(row) ? row[dataCol] : undefined;
          if (raw === undefined || raw === null) return "";
          return typeof raw === "string" ? sheetCells.valueAt(row, columnIndex, raw) : raw;
        };
      }
      return (row: unknown) => (Array.isArray(row) ? row[dataCol] : undefined);
    }

    // Array of arrays (bodyData)
    const arrBody = body as unknown as ArrayOfArraysLikeBody;
    if (Array.isArray(arrBody.arr) && columnIndex >= 0) {
      const sheetCells = sheetBody.sheetCells;
      if (sheetCells) {
        return (row: unknown) => {
          const raw = Array.isArray(row) ? row[columnIndex] : undefined;
          return typeof raw === "string" ? sheetCells.valueAt(row, columnIndex, raw) : raw;
        };
      }
      return (row: unknown) => (Array.isArray(row) ? row[columnIndex] : undefined);
    }

    // Pivot: externalFilterChanged receives source objects T
    if (isAreaModelPivot(body)) {
      return createValueGetter(property);
    }

    // Calculated column / cell formulas / Tree / RowGroups: delegate to body.getRowValue when needed
    const hasDerived =
      columnDef?.valueGetter !== undefined
      || (body.isCalculatedProperty?.(property) ?? false)
      || Boolean(sheetBody.sheetCells);

    if (hasDerived && body.getRowValue) {
      const getRowValue = body.getRowValue.bind(body);
      return (row: any) => getRowValue(row, property);
    }

    // Tree: externalFilterChanged receives TreeRowIf<S>
    if (isAreaModelTree(body) && !isAreaModelRowGroups(body)) {
      const read = createValueGetter(property);
      return (row: any) => read(isTreeRow(row) ? row.data : row);
    }

    // Fast path for plain objects (AreaModelObjectArray, AreaModelRowGroups):
    // single-segment property → direct lookup, nested → pre-split path getter
    if (!property.includes(".")) {
      return (row: any) => (row == null ? undefined : row[property]);
    }
    return createValueGetter(property);
  }

  private collectSampleRows(limit: number): unknown[] {
    const body = this.scope.tableModel.getBodyModel();

    const sourceBody = body as unknown as SourceRowsLikeBody;
    if (typeof sourceBody.getSourceRows === "function") {
      return sourceBody.getSourceRows().slice(0, limit);
    }

    const objBody = body as unknown as ObjectArrayLikeBody;
    if (typeof objBody.getAllRows === "function") {
      return objBody.getAllRows().slice(0, limit);
    }

    const arrBody = body as unknown as ArrayOfArraysLikeBody;
    if (Array.isArray(arrBody.arr)) {
      return arrBody.arr.slice(0, limit);
    }

    const sheetBody = body as unknown as SheetLikeBody;
    if (typeof sheetBody.getSheetColumnCount === "function") {
      const out: unknown[] = [];
      const total = body.getRowCount();
      for (let i = 0; i < total && out.length < limit; i++) {
        const r = body.getRowByIndex(i);
        if (r !== undefined) {
          out.push(r);
        }
      }
      return out;
    }

    const treeBody = body as unknown as TreeLikeBody;
    if (isAreaModelTree(body) && Array.isArray(treeBody.rows)) {
      const out: unknown[] = [];
      const walk = (nodes: TreeRowIf<unknown>[]) => {
        for (let i = 0; i < nodes.length && out.length < limit; i++) {
          out.push(nodes[i]);
          if (nodes[i].children?.length) {
            walk(nodes[i].children!);
          }
        }
      };
      walk(treeBody.rows);
      return out;
    }

    const out: unknown[] = [];
    const total = Math.min(body.getRowCount(), limit);
    for (let i = 0; i < total; i++) {
      out.push(body.getRowByIndex(i));
    }
    return out;
  }

  private getAllRowsForDistinct(): unknown[] {
    const body = this.scope.tableModel.getBodyModel();

    const sourceBody = body as unknown as SourceRowsLikeBody;
    if (typeof sourceBody.getSourceRows === "function") {
      return sourceBody.getSourceRows();
    }

    const objBody = body as unknown as ObjectArrayLikeBody;
    if (typeof objBody.getAllRows === "function") {
      return objBody.getAllRows();
    }

    const arrBody = body as unknown as ArrayOfArraysLikeBody;
    if (Array.isArray(arrBody.arr)) {
      return arrBody.arr;
    }

    const treeBody = body as unknown as TreeLikeBody;
    if (isAreaModelTree(body) && Array.isArray(treeBody.rows)) {
      const out: unknown[] = [];
      const walk = (nodes: TreeRowIf<unknown>[]) => {
        for (let i = 0; i < nodes.length; i++) {
          out.push(nodes[i]);
          if (nodes[i].children?.length) {
            walk(nodes[i].children!);
          }
        }
      };
      walk(treeBody.rows);
      return out;
    }

    const total = body.getUnfilteredRowCount?.() ?? body.getRowCount();
    const out: unknown[] = [];
    for (let i = 0; i < total; i++) {
      out.push(body.getRowByIndex(i));
    }
    return out;
  }
}
