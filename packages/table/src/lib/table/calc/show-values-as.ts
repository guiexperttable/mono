import type { ShowValuesAs, ShowValuesAsConfig, ShowValuesAsIf } from "./show-values-as.type";
import { Aggregators } from "../aggregation/aggregators";
import { formatAggregateValue } from "../aggregation/aggregate";

const PERCENT_MODES: ReadonlySet<ShowValuesAs> = new Set<ShowValuesAs>([
  "percentOfColumnTotal", "percentOfGrandTotal", "percentOfParentTotal", "percentOfRowTotal",
]);

const PERCENT_FORMATS = new Map<number, Intl.NumberFormat>();
const RANK_FORMAT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/**
 * The full options of a „Show values as“ configuration – `undefined` for none or an unknown mode.
 *
 * @param {ShowValuesAsConfig | undefined} config - a mode or mode with options
 * @returns {ShowValuesAsIf | undefined} the options
 *
 * @example
 * resolveShowValuesAs("rank");   // { mode: "rank" }
 *
 * @since 1.1.95
 * @category Calculated columns & formulas
 */
export function resolveShowValuesAs(config: ShowValuesAsConfig | undefined | null): ShowValuesAsIf | undefined {
  if (!config) return undefined;
  const full: ShowValuesAsIf = typeof config === "string" ? { mode: config } : config;
  return SHOW_VALUES_AS_MODES.includes(full.mode) ? full : undefined;
}

/**
 * All modes of {@link ShowValuesAs}, e.g. for an own select box.
 *
 * @example
 * select.append(...SHOW_VALUES_AS_MODES.map(mode => new Option(mode, mode)));
 *
 * @since 1.1.95
 * @category Calculated columns & formulas
 */
export const SHOW_VALUES_AS_MODES: readonly ShowValuesAs[] = Object.freeze([
  "percentOfColumnTotal", "percentOfGrandTotal", "percentOfParentTotal", "percentOfRowTotal",
  "differenceFromPrevious", "runningTotal", "rank",
] as ShowValuesAs[]);

/**
 * True for the modes that show a share (a fraction, shown as percentage).
 *
 * @param {ShowValuesAs} mode - the mode
 * @returns {boolean} whether the shown value is a fraction
 *
 * @example
 * isPercentShowValuesAs("percentOfColumnTotal");   // true
 * isPercentShowValuesAs("rank");                   // false
 *
 * @since 1.1.95
 * @category Calculated columns & formulas
 */
export function isPercentShowValuesAs(mode: ShowValuesAs | undefined): boolean {
  return !!mode && PERCENT_MODES.has(mode);
}

/**
 * The text of a shown value: percentages with one decimal (`"66.7%"`), ranks without decimals, differences and
 * running totals like totals (`"1,234.5"`). Not a number → `""`.
 *
 * @param {unknown} value - the shown value (a fraction for percentages)
 * @param {ShowValuesAsConfig} config - the configuration of the column
 * @returns {string} the text
 *
 * @example
 * formatShowValuesAs(0.667, "percentOfColumnTotal");                          // "66.7%"
 * formatShowValuesAs(0.667, { mode: "percentOfColumnTotal", fractionDigits: 2 }); // "66.70%"
 *
 * @since 1.1.95
 * @category Calculated columns & formulas
 */
export function formatShowValuesAs(value: unknown, config: ShowValuesAsConfig): string {
  const options = resolveShowValuesAs(config);
  if (typeof value !== "number" || Number.isNaN(value) || !options) {
    return value === undefined || value === null ? "" : `${value}`;
  }
  if (options.format) {
    return `${options.format(value) ?? ""}`;
  }
  if (isPercentShowValuesAs(options.mode)) {
    const digits = clampDigits(options.fractionDigits ?? 1);
    let f = PERCENT_FORMATS.get(digits);
    if (!f) {
      f = new Intl.NumberFormat("en-US", { style: "percent", minimumFractionDigits: digits, maximumFractionDigits: digits });
      PERCENT_FORMATS.set(digits, f);
    }
    return f.format(value);
  }
  if (options.mode === "rank") {
    return RANK_FORMAT.format(value);
  }
  if (options.fractionDigits !== undefined) {
    const digits = clampDigits(options.fractionDigits);
    return new Intl.NumberFormat("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
  }
  return formatAggregateValue(value);
}

function clampDigits(digits: number): number {
  return Math.min(10, Math.max(0, Math.trunc(Number(digits) || 0)));
}

function isNumber(v: unknown): v is number {
  return typeof v === "number" && !Number.isNaN(v);
}

/**
 * The sum of the numbers of a list (Neumaier, like {@link Aggregators}.sum); other values are skipped.
 *
 * @param {ArrayLike<unknown>} values - the values
 * @returns {number} the sum, 0 for none
 *
 * @example
 * sumOfNumbers([1, "2", 3, undefined]);   // 4
 *
 * @since 1.1.95
 * @category Calculated columns & formulas
 */
export function sumOfNumbers(values: ArrayLike<unknown>): number {
  const sum = Aggregators.sum;
  let state = sum.init();
  for (let i = 0; i < values.length; i++) state = sum.add(state, values[i]);
  return (sum.result(state) as number | undefined) ?? 0;
}

/**
 * „Show values as“ over a list of values in display order – DOM-free, for own area models. Percentages are
 * fractions (`0.667`); the reference is the list itself (`percentOfRowTotal` is not applicable to a list: the values are
 * returned unchanged). Values that are no numbers → `undefined`.
 *
 * @param {ArrayLike<unknown>} values - the raw values in display order
 * @param {ShowValuesAs} mode - the mode
 * @returns {(number | undefined)[]} the shown values
 *
 * @example
 * calculateShowValuesAs([2598, 1047, 250], "percentOfColumnTotal");   // [0.667…, 0.268…, 0.064…]
 * calculateShowValuesAs([10, 20, 20, 5], "rank");                      // [3, 1, 1, 4]
 * calculateShowValuesAs([10, 20, 5], "runningTotal");                  // [10, 30, 35]
 * calculateShowValuesAs([10, 20, 5], "differenceFromPrevious");        // [undefined, 10, -15]
 *
 * @since 1.1.95
 * @category Calculated columns & formulas
 */
export function calculateShowValuesAs(values: ArrayLike<unknown>, mode: ShowValuesAs): (number | undefined)[] {
  const n = values.length;
  const ret: (number | undefined)[] = new Array(n);
  switch (mode) {
    case "percentOfColumnTotal":
    case "percentOfGrandTotal":
    case "percentOfParentTotal": {
      const total = sumOfNumbers(values);
      for (let i = 0; i < n; i++) ret[i] = shareOf(values[i], total);
      return ret;
    }
    case "runningTotal": {
      const sum = Aggregators.sum;
      let state = sum.init();
      for (let i = 0; i < n; i++) {
        const v = values[i];
        state = sum.add(state, v);
        ret[i] = isNumber(v) ? sum.result(state) as number : undefined;
      }
      return ret;
    }
    case "differenceFromPrevious":
      for (let i = 0; i < n; i++) {
        const v = values[i];
        const p = i > 0 ? values[i - 1] : undefined;
        ret[i] = isNumber(v) && isNumber(p) ? v - p : undefined;
      }
      return ret;
    case "rank": {
      const indices: number[] = [];
      for (let i = 0; i < n; i++) if (isNumber(values[i])) indices.push(i);
      indices.sort((a, b) => (values[b] as number) - (values[a] as number));
      let rank = 0;
      for (let k = 0; k < indices.length; k++) {
        if (k === 0 || values[indices[k]] !== values[indices[k - 1]]) rank = k + 1;
        ret[indices[k]] = rank;
      }
      return ret;
    }
    default:
      for (let i = 0; i < n; i++) ret[i] = isNumber(values[i]) ? values[i] as number : undefined;
      return ret;
  }
}


/** value / total – `undefined` for no number or a total of 0. */
function shareOf(value: unknown, total: number): number | undefined {
  return isNumber(value) && total !== 0 ? value / total : undefined;
}
