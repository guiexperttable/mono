import type { ShowValuesAsConfig } from "./show-values-as.type";
import { isPercentShowValuesAs, resolveShowValuesAs } from "./show-values-as";

// Not exported from index.ts: shared by the area models, the pivot and the Excel export.

/** The Excel number format of a shown value (percentages: `0.0%`), `undefined` for the default. */
export function excelFormatOfShowValuesAs(config: ShowValuesAsConfig | undefined): string | undefined {
  const options = resolveShowValuesAs(config);
  if (!options || !isPercentShowValuesAs(options.mode)) return undefined;
  const digits = Math.min(10, Math.max(0, Math.trunc(Number(options.fractionDigits ?? 1) || 0)));
  return digits ? `0.${"0".repeat(digits)}%` : "0%";
}
