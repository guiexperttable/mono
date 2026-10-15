import type { PivotValue, PivotValueIf, PivotValueInfoIf } from "./pivot-value.type";
import type { AggregatorIf } from "../aggregation/aggregator.if";
import { Aggregators, getAggregator } from "../aggregation/aggregators";
import { createValueGetter } from "../aggregation/create-value-getter";
import { resolveShowValuesAs } from "../calc/show-values-as";

// Not exported from index.ts: shared by PivotResult, AreaModelPivot and the pivot layout.

/** A value resolved for a pass over the rows. */
export interface ResolvedPivotValue<T = any> extends PivotValueInfoIf {
  /** undefined for `count` (the value does not matter) */
  readonly getValue?: (row: T) => unknown;
}

/** The default maximum number of column keys. */
export const DEFAULT_MAX_COLUMNS = 1000;

/** The default word for totals. */
export const DEFAULT_TOTAL_LABEL = "Total";

/** Resolves the values of a pivot configuration: aggregator, getter, unique name, label. */
export function resolvePivotValues<T>(values: PivotValue<T>[] | undefined): ResolvedPivotValue<T>[] {
  const list = values ?? [];
  if (!list.length) {
    throw new Error("Pivot: at least one value is needed (values: [\"amount\"]).");
  }
  const used = new Set<string>();
  return list.map((value, index) => {
    const full: PivotValueIf<T> = (typeof value === "string" || typeof value === "function") ? { value } : value;
    if (!full || (typeof full.value !== "string" && typeof full.value !== "function")) {
      throw new Error(`Pivot: value ${index} has no value (a property path or a function).`);
    }
    const aggregator: AggregatorIf = getAggregator(full.aggregator ?? "sum");
    const source = typeof full.value === "string" ? full.value : `value${index}`;
    let name = full.name ?? `${aggregator.name}(${source})`;
    if (used.has(name)) {
      let n = 2;
      while (used.has(`${name}#${n}`)) n++;
      name = `${name}#${n}`;
    }
    used.add(name);
    return {
      name,
      label: full.label ?? name,
      aggregator,
      format: full.format,
      showValuesAs: resolveShowValuesAs(full.showValuesAs),
      getValue: aggregator === Aggregators.count ? undefined : createValueGetter<T>(full.value),
    };
  });
}
