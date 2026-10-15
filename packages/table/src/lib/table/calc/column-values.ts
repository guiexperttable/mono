import type { ColumnDefIf } from "../data/tablemodel/column/column-def.if";
import type { ValueGetter } from "./value-getter.type";
import type { ValueGetterContextIf } from "./value-getter-context.if";
import type { AggregatorRef } from "../aggregation/aggregator-name.type";
import type { ShowValuesAsIf } from "./show-values-as.type";
import { getAggregator } from "../aggregation/aggregators";
import { resolveShowValuesAs } from "./show-values-as";
import { FormulaError, isFormulaError } from "../formula/formula-error";

// Not exported from index.ts: the one place where an area model reads the value of a column (prompt 008, design § 2).

/** What an area model provides to its {@link ColumnValues}. */
export interface ColumnValuesOwner {
  /** The column definitions (read lazily – they may be replaced, e.g. by a pivot). */
  getColumnDefsForValues(): ColumnDefIf[];
  /** The value of a property path (the model's own semantics – unchanged behaviour for normal columns). */
  readPath(row: any, property: string): unknown;
  /** The rows of column aggregates (filtered, data objects) and a cheap signal that changes with them. */
  getAggregationSource(): { signal: unknown; length: number; rows: () => ArrayLike<unknown> };
}

/**
 * Resolves `valueGetter`s by property, detects cycles (`#CIRC!`), caches column aggregates.
 * Without calculated columns `get()` is one empty-map lookup plus the model's own path read.
 */
export class ColumnValues {

  private getters?: Map<string, ValueGetter>;
  private showValuesAs?: Map<string, ShowValuesAsIf>;
  private properties?: Set<string>;
  private defsLength = -1;
  /** property → rows whose value is being computed (a getter may read the same column of another row) */
  private readonly computing = new Map<string, Set<unknown>>();
  private readonly contexts = new Map<string, ValueGetterContextIf>();
  private aggregates = new Map<string, unknown>();
  private aggSignal: unknown = undefined;
  private aggLength = -1;

  constructor(private readonly owner: ColumnValuesOwner) {
  }

  /** Drops the getter lookup and the cached aggregates (`invalidateDerivedValues`). */
  invalidate(): void {
    this.getters = undefined;
    this.showValuesAs = undefined;
    this.properties = undefined;
    this.aggregates.clear();
  }

  /** The getter of a calculated column. */
  getter(property: string | undefined): ValueGetter | undefined {
    if (property === undefined) return undefined;
    return this.lookup().get(property);
  }

  hasGetters(): boolean {
    return this.lookup().size > 0;
  }

  isCalculated(property: string): boolean {
    return this.lookup().has(property);
  }

  hasColumn(property: string): boolean {
    this.lookup();
    return this.properties!.has(property);
  }

  /** The „Show values as“ options of a column. */
  getShowValuesAs(property: string | undefined): ShowValuesAsIf | undefined {
    if (property === undefined) return undefined;
    this.lookup();
    return this.showValuesAs!.get(property);
  }

  hasShowValuesAs(): boolean {
    this.lookup();
    return this.showValuesAs!.size > 0;
  }

  /** The value of a column for a row: its getter (cycle-safe, exceptions → `#VALUE!`) or the path. */
  get(row: any, property: string): unknown {
    const getter = this.lookup().get(property);
    if (!getter) {
      return this.owner.readPath(row, property);
    }
    if (row === undefined || row === null) {
      return undefined;
    }
    return this.call(getter, row, property);
  }

  /** An aggregate of a column over the filtered rows – cached. */
  aggregate(property: string, aggregator: AggregatorRef): unknown {
    if (this.computing.get(property)?.size) {
      return new FormulaError("#CIRC!", `Circular reference: the column "${property}" uses its own aggregate`);
    }
    const source = this.owner.getAggregationSource();
    if (source.signal !== this.aggSignal || source.length !== this.aggLength) {
      this.aggregates.clear();
      this.aggSignal = source.signal;
      this.aggLength = source.length;
    }
    const agg = getAggregator(aggregator);
    const key = `${agg.name}\u0000${property}`;
    if (this.aggregates.has(key)) {
      return this.aggregates.get(key);
    }
    const rows = source.rows();
    let state = agg.init();
    let result: unknown;
    for (let i = 0; i < rows.length; i++) {
      const v = this.get(rows[i], property);
      if (isFormulaError(v) && v.code === "#CIRC!") {
        result = v; // a value of the column depends on this aggregate: the aggregate is circular, too
        break;
      }
      state = agg.add(state, v);
    }
    if (result === undefined) {
      result = agg.result(state);
    }
    this.aggregates.set(key, result);
    return result;
  }

  /** The context passed to a getter. */
  context(property: string): ValueGetterContextIf {
    let ctx = this.contexts.get(property);
    if (!ctx) {
      ctx = {
        property,
        getValue: (row: any, p: string) => this.get(row, p),
        hasColumn: (p: string) => this.hasColumn(p),
        isCalculated: (p: string) => this.isCalculated(p),
        aggregate: (p: string, aggregator: AggregatorRef) => this.aggregate(p, aggregator),
      };
      this.contexts.set(property, ctx);
    }
    return ctx;
  }

  private call(getter: ValueGetter, row: any, property: string): unknown {
    let rows = this.computing.get(property);
    if (rows?.has(row)) {
      return new FormulaError("#CIRC!", `Circular reference: the column "${property}" depends on itself`);
    }
    if (!rows) {
      rows = new Set();
      this.computing.set(property, rows);
    }
    rows.add(row);
    try {
      return getter(row, this.context(property));
    } catch (e) {
      return new FormulaError("#VALUE!", `valueGetter of "${property}": ${e instanceof Error ? e.message.slice(0, 200) : "failed"}`);
    } finally {
      rows.delete(row);
    }
  }

  private lookup(): Map<string, ValueGetter> {
    const defs = this.owner.getColumnDefsForValues() ?? [];
    if (this.getters && this.defsLength === defs.length) {
      return this.getters;
    }
    const getters = new Map<string, ValueGetter>();
    const showValuesAs = new Map<string, ShowValuesAsIf>();
    const properties = new Set<string>();
    for (const def of defs) {
      if (!def) continue;
      properties.add(def.property);
      if (typeof def.valueGetter === "function") getters.set(def.property, def.valueGetter);
      const sva = resolveShowValuesAs(def.showValuesAs);
      if (sva) showValuesAs.set(def.property, sva);
    }
    this.getters = getters;
    this.showValuesAs = showValuesAs;
    this.properties = properties;
    this.defsLength = defs.length;
    return getters;
  }
}
