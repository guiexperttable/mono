/**
 * How {@link computeFillValues} continues the source values:
 * - `"auto"`: the default rules – one number is copied, several numbers continue as a linear series, dates and texts
 *   with a trailing number count up, everything else repeats;
 * - `"alternate"`: the other choice for numbers, dates and texts with a number (⌥/Alt or Ctrl while dragging the fill
 *   handle): one number counts up by 1, a series is copied;
 * - `"copy"`: always repeat the source values (Ctrl/⌘+D, Ctrl/⌘+R).
 *
 * @category Fill handle & batch edit
 * @since 1.1.96
 */
export type FillMode = "auto" | "alternate" | "copy";

/** ISO date without time: `2026-10-14`. */
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
/** A number written as text: `5`, `-1.25`. */
const NUMERIC_TEXT = /^-?\d+(\.\d+)?$/;
/** A text with a trailing number: `Item 9`, `A007`. */
const TEXT_NUMBER = /^(.*\D)(\d+)$/;
const DAY_IN_MS = 86_400_000;

/**
 * Computes the values of a fill (fill handle, Ctrl/⌘+D): `count` values that continue `sourceValues` – forward
 * (down/right) or backward (up/left: the value directly in front of the source first).
 *
 * | source | `"auto"` | `"alternate"` |
 * |---|---|---|
 * | one number `5` | 5, 5, 5 | 6, 7, 8 |
 * | numbers `1, 2` | 3, 4, 5 (linear; uneven steps: best-fit line) | 1, 2, 1 |
 * | date `2026-10-14` (`Date` or ISO text) | +1 day each; several dates a month apart: +1 month (month ends stay month ends) | copied |
 * | text with a trailing number `Item 9` | `Item 10`, `Item 11` (leading zeros stay) | copied |
 * | anything else | repeated: `A, B` → `A, B, A, B` | repeated |
 *
 * The type stays: a date text stays a text in the same format, a `Date` stays a `Date`, a number written as text
 * stays a text. Decimal noise is rounded (0.1, 0.2 → 0.3, not 0.30000000000000004).
 *
 * @param {unknown[]} sourceValues - the values of one line (column or row) of the source range, in display order
 * @param {number} count - the number of values to compute
 * @param {boolean} [backward=false] - fill up/left: the values in front of the source, nearest first
 * @param {FillMode} [mode="auto"] - see {@link FillMode}
 * @returns {unknown[]} `count` values, nearest to the source first
 *
 * @example
 * computeFillValues([1, 2], 3);                       // [3, 4, 5]
 * computeFillValues([5], 3);                          // [5, 5, 5]
 * computeFillValues([5], 3, false, "alternate");      // [6, 7, 8]
 * computeFillValues(["2026-10-14"], 2);               // ["2026-10-15", "2026-10-16"]
 * computeFillValues(["Item 9"], 2);                   // ["Item 10", "Item 11"]
 * computeFillValues([1, 2], 2, true);                 // [0, -1]  (filled upwards)
 *
 * @category Fill handle & batch edit
 * @since 1.1.96
 */
export function computeFillValues(sourceValues: unknown[], count: number, backward = false, mode: FillMode = "auto"): unknown[] {
  const n = sourceValues.length;
  if (count < 1 || n < 1) {
    return [];
  }
  const steps = Array.from({ length: count }, (_, i) => backward ? -(i + 1) : i + 1);
  const copy = () => steps.map(step => copyValue(sourceValues, step));
  if (mode === "copy") {
    return copy();
  }
  const series = createSeries(sourceValues, mode === "alternate");
  return series ? steps.map(series) : copy();
}

/**
 * `true` if {@link computeFillValues} continues the values as a series, `false` if it repeats them.
 *
 * @param {unknown[]} sourceValues - the values of one line of the source range
 * @param {FillMode} [mode="auto"] - see {@link FillMode}
 * @returns {boolean} whether the fill is a series
 *
 * @example
 * isFillSeries([5]);        // false – one number is copied
 * isFillSeries([1, 2]);     // true
 *
 * @category Fill handle & batch edit
 * @since 1.1.96
 */
export function isFillSeries(sourceValues: unknown[], mode: FillMode = "auto"): boolean {
  return mode !== "copy" && sourceValues.length > 0 && !!createSeries(sourceValues, mode === "alternate");
}

/**
 * The value at `step` positions after (`> 0`) or before (`< 0`) the source when the source pattern repeats.
 * `step` 1 = the value directly after the last source value.
 */
function copyValue(values: unknown[], step: number): unknown {
  const n = values.length;
  return step > 0 ? values[(step - 1) % n] : values[n - 1 - ((-step - 1) % n)];
}

/** A function step → value, or `undefined` if the values are repeated. */
type Series = (step: number) => unknown;

function createSeries(values: unknown[], alternate: boolean): Series | undefined {
  const single = values.length === 1;
  // one number is copied by default, several are a series; ⌥/Alt swaps that – for dates and texts with a number
  // the default is the series (also for one value)
  const numbersAsSeries = single ? alternate : !alternate;
  const othersAsSeries = !alternate;

  if (values.every(isNumber)) {
    return numbersAsSeries ? numberSeries(values as number[], v => v) : undefined;
  }
  if (values.every(v => typeof v === "string" && NUMERIC_TEXT.test(v))) {
    const texts = values as string[];
    if (texts.some(v => !Number.isSafeInteger(Math.trunc(Number(v))))) {
      return undefined;                                    // too big for a number: repeated, never rounded
    }
    const decimals = Math.max(...texts.map(v => v.split(".")[1]?.length ?? 0));
    // leading zeros keep the width of the integer part ("007" → "008"), like "A007" → "A008"
    const width = Math.max(...texts.map(v => {
      const int = v.replace("-", "").split(".")[0];
      return int.length > 1 && int.startsWith("0") ? int.length : 0;
    }));
    const format = (v: number) => {
      const text = v.toFixed(decimals);
      if (!width) return text;
      const negative = text.startsWith("-");
      const [int, frac] = text.replace("-", "").split(".");
      return (negative ? "-" : "") + int.padStart(width, "0") + (frac !== undefined ? "." + frac : "");
    };
    return numbersAsSeries ? numberSeries(texts.map(Number), format) : undefined;
  }
  if (values.every(isValidDate)) {
    return othersAsSeries ? dateSeries(values as Date[]) : undefined;
  }
  if (values.every(v => typeof v === "string" && ISO_DATE.test(v) && isValidDate(parseIsoDate(v)))) {
    return othersAsSeries ? isoDateSeries(values as string[]) : undefined;
  }
  if (values.every(v => typeof v === "string" && TEXT_NUMBER.test(v))) {
    return othersAsSeries ? textNumberSeries(values as string[]) : undefined;
  }
  return undefined;
}

function isNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function isValidDate(v: unknown): v is Date {
  return v instanceof Date && !isNaN(v.getTime());
}

/** Rounds away the binary noise of decimal steps (0.1 + 0.2). */
function roundNumber(x: number): number {
  const r = Number(x.toPrecision(15));
  return r === 0 ? 0 : r; // no -0
}

/**
 * A linear series: equal steps are continued exactly, uneven steps follow the best-fit line (least squares) – like a
 * spreadsheet. A single value counts up by 1.
 */
function numberSeries(values: number[], format: (v: number) => unknown): Series {
  const n = values.length;
  const last = values[n - 1];
  if (n === 1) {
    return step => format(roundNumber(last + step));
  }
  const step0 = values[1] - values[0];
  const even = values.every((v, i) => i === 0 || Math.abs((v - values[i - 1]) - step0) <= 1e-9 * Math.max(1, Math.abs(step0)));
  if (even) {
    return step => format(roundNumber(step > 0 ? last + step0 * step : values[0] + step0 * step));
  }
  const meanX = (n - 1) / 2;
  const meanY = values.reduce((a, b) => a + b, 0) / n;
  let cov = 0;
  let varX = 0;
  values.forEach((y, x) => {
    cov += (x - meanX) * (y - meanY);
    varX += (x - meanX) ** 2;
  });
  const slope = cov / varX;
  const intercept = meanY - slope * meanX;
  return step => {
    const x = step > 0 ? n - 1 + step : step;
    return format(roundNumber(intercept + slope * x));
  };
}

/** Calendar parts of a date – local for `Date` objects, UTC for ISO texts. */
interface DateParts {
  y: number;
  m: number;
  d: number;
}

function isMonthEnd(p: DateParts): boolean {
  return p.d === daysInMonth(p.y, p.m);
}

function daysInMonth(y: number, m: number): number {
  return utcDate(y, m + 1, 0).getUTCDate();
}

/** A UTC date – also for the years 0 … 99 (`Date.UTC` maps them to 1900 … 1999). */
function utcDate(y: number, m: number, d: number): Date {
  const date = new Date(0);
  date.setUTCFullYear(y, m, d);
  return date;
}

/** The month index (y × 12 + m) and the day number (days since 1970) of calendar parts. */
function monthNo(p: DateParts): number {
  return p.y * 12 + p.m;
}

function dayNo(p: DateParts): number {
  return Math.round(utcDate(p.y, p.m, p.d).getTime() / DAY_IN_MS);
}

/**
 * The step of a date series in months or days: months if all dates have the same day of the month (or are all month
 * ends) and are whole months apart, otherwise days. One date: +1 day.
 */
function dateStep(parts: DateParts[]): { months: number; days: number; monthEnd: boolean } {
  const n = parts.length;
  if (n === 1) {
    return { months: 0, days: 1, monthEnd: false };
  }
  const allMonthEnds = parts.every(isMonthEnd);
  const sameDay = parts.every(p => p.d === parts[0].d);
  const monthDiff = monthNo(parts[1]) - monthNo(parts[0]);
  if ((sameDay || allMonthEnds) && monthDiff !== 0
    && parts.every((p, i) => i === 0 || monthNo(p) - monthNo(parts[i - 1]) === monthDiff)) {
    return { months: monthDiff, days: 0, monthEnd: allMonthEnds && !sameDay };
  }
  const total = dayNo(parts[n - 1]) - dayNo(parts[0]);
  return { months: 0, days: Math.round(total / (n - 1)), monthEnd: false };
}

/** Calendar parts `step` steps after the last (or before the first) source date. */
function addSteps(parts: DateParts[], step: number, s: { months: number; days: number; monthEnd: boolean }): DateParts {
  const base = step > 0 ? parts[parts.length - 1] : parts[0];
  if (s.months) {
    const total = monthNo(base) + s.months * step;
    const y = Math.floor(total / 12);
    const m = total - y * 12;
    const dim = daysInMonth(y, m);
    return { y, m, d: s.monthEnd ? dim : Math.min(base.d, dim) };
  }
  const date = utcDate(base.y, base.m, base.d + s.days * step);
  return { y: date.getUTCFullYear(), m: date.getUTCMonth(), d: date.getUTCDate() };
}

function dateSeries(values: Date[]): Series {
  const parts = values.map(v => ({ y: v.getFullYear(), m: v.getMonth(), d: v.getDate() }));
  const s = dateStep(parts);
  return step => {
    const p = addSteps(parts, step, s);
    const base = values[step > 0 ? values.length - 1 : 0];
    // local calendar date, the time of day of the source stays
    return new Date(p.y, p.m, p.d, base.getHours(), base.getMinutes(), base.getSeconds(), base.getMilliseconds());
  };
}

function parseIsoDate(v: string): Date {
  const [, y, m, d] = ISO_DATE.exec(v)!;
  const date = utcDate(Number(y), Number(m) - 1, Number(d));
  // 2026-02-30 is no date (the date would roll over to March)
  return date.getUTCDate() === Number(d) && date.getUTCMonth() === Number(m) - 1 ? date : new Date(NaN);
}

function isoDateSeries(values: string[]): Series {
  const parts = values.map(v => {
    const date = parseIsoDate(v);
    return { y: date.getUTCFullYear(), m: date.getUTCMonth(), d: date.getUTCDate() };
  });
  const s = dateStep(parts);
  return step => {
    const p = addSteps(parts, step, s);
    return `${String(p.y).padStart(4, "0")}-${String(p.m + 1).padStart(2, "0")}-${String(p.d).padStart(2, "0")}`;
  };
}

/**
 * `Item 9` → `Item 10`: texts with the same prefix and a trailing number. Several values: the step from first to last
 * (copied if it is no whole number or the prefixes differ). Leading zeros keep the width (`A007` → `A008`); below 0 the
 * number counts up again (`Item 1` filled upwards: `Item 0`, `Item 1`, `Item 2`).
 */
function textNumberSeries(values: string[]): Series | undefined {
  const parsed = values.map(v => {
    const [, prefix, digits] = TEXT_NUMBER.exec(v)!;
    return { prefix, digits, num: Number(digits) };
  });
  const prefix = parsed[0].prefix;
  if (parsed.some(p => p.prefix !== prefix) || parsed.some(p => !Number.isSafeInteger(p.num))) {
    return undefined;
  }
  const n = parsed.length;
  const stepSize = n === 1 ? 1 : (parsed[n - 1].num - parsed[0].num) / (n - 1);
  if (!Number.isInteger(stepSize)) {
    return undefined;
  }
  const width = Math.max(...parsed.map(p => p.digits.length > 1 && p.digits.startsWith("0") ? p.digits.length : 0));
  return step => {
    const base = step > 0 ? parsed[n - 1].num : parsed[0].num;
    const num = Math.abs(base + stepSize * step);
    return prefix + String(num).padStart(width, "0");
  };
}
