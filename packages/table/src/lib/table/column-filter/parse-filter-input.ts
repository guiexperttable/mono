import { parseDateText, parseLocaleNumber } from "../clipboard/input-pipes";
import type { ColumnFilterConditionIf, ColumnFilterIf } from "./column-filter.if";
import type { ColumnFilterOperator } from "./column-filter-operator.type";
import type { ColumnFilterTextsIf } from "./column-filter-options.if";
import { ColumnFilterTexts } from "./column-filter-options";
import type { ColumnFilterType } from "./column-filter-type.type";

const TRUE_WORDS = ["true", "yes", "1", "wahr", "ja"];
const FALSE_WORDS = ["false", "no", "0", "falsch", "nein"];

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatDateIso(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function splitOperatorPrefix(raw: string): { operator?: ColumnFilterOperator; rest: string } {
  const s = raw.trim();
  if (s.startsWith(">=")) return { operator: "greaterOrEqual", rest: s.slice(2).trim() };
  if (s.startsWith("<=")) return { operator: "lessOrEqual", rest: s.slice(2).trim() };
  if (s.startsWith("!=") || s.startsWith("<>")) return { operator: "notEquals", rest: s.slice(2).trim() };
  if (s.startsWith(">")) return { operator: "greaterThan", rest: s.slice(1).trim() };
  if (s.startsWith("<")) return { operator: "lessThan", rest: s.slice(1).trim() };
  if (s.startsWith("=")) return { operator: "equals", rest: s.slice(1).trim() };
  return { rest: s };
}

const MONTH_PATTERN = /^(\d{4})-(\d{1,2})$/;

/** A date, or a month (`2026-03`): its first day, as the end of a range its last day. */
function parseDateBound(text: string, end: boolean, locale?: string): Date | undefined {
  const m = MONTH_PATTERN.exec(text);
  if (m) {
    const year = Number(m[1]);
    const month = Number(m[2]);
    if (month < 1 || month > 12) {
      return undefined;
    }
    return end ? new Date(year, month, 0) : new Date(year, month - 1, 1);
  }
  return parseDateText(text, locale) ?? undefined;
}

/** Text columns: `=x`, `!=x` / `<>x`, `^start`, `end$`, otherwise `contains`. A lone operator is incomplete. */
function parseTextInput(trimmed: string): ColumnFilterConditionIf | null {
  let operator: ColumnFilterOperator = "contains";
  let value = trimmed;
  if (trimmed.startsWith("!=") || trimmed.startsWith("<>")) {
    operator = "notEquals";
    value = trimmed.slice(2).trim();
  } else if (trimmed.startsWith("=")) {
    operator = "equals";
    value = trimmed.slice(1).trim();
  } else if (trimmed.startsWith("^")) {
    operator = "startsWith";
    value = trimmed.slice(1).trim();
  } else if (trimmed.endsWith("$")) {
    operator = "endsWith";
    value = trimmed.slice(0, -1).trim();
  }
  return value ? { operator, value } : null;
}

/**
 * Parses text typed into a filter-row input into a {@link ColumnFilterConditionIf}.
 *
 * - Returns `undefined` for empty / whitespace input (clears the condition).
 * - Returns `null` when the input is incomplete or invalid for the column's type (e.g. `">"` or `"10.."` while
 *   typing) so the caller can wait without applying a broken filter.
 * - Every type: `""` = blank, `!=""` = not blank.
 * - Text columns: `contains`; `=x` equals, `!=x` / `<>x` not equal, `^x` starts with, `x$` ends with.
 * - Number columns: `>100`, `<=5`, `>=0`, `< -10`, `=7`, `!=3`/`<>3`, `10..20`, or plain number (`equals`), using
 *   the locale's decimal and group separators.
 * - Date columns: ISO (`2026-05-10`, `>2026-01-01`, `2026-01-01..2026-06-30`), a month (`2026-03` = the whole
 *   month, `2026-01..2026-03` = January to March) or locale short date (`16.10.2026`).
 * - Boolean columns: `true`/`false`/`yes`/`no`/`1`/`0`/`ja`/`nein`/`wahr`/`falsch`.
 *
 * @example
 * parseFilterInput(">100", "number");       // { operator: "greaterThan", value: 100 }
 * parseFilterInput("10..20", "number");     // { operator: "between", value: 10, valueTo: 20 }
 * parseFilterInput("emea", "text");         // { operator: "contains", value: "emea" }
 *
 * @category Sorting & filtering
 * @since 1.1.114
 */
export function parseFilterInput(
  raw: string,
  type: ColumnFilterType = "text",
  locale?: string,
): ColumnFilterConditionIf | undefined | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return undefined;
  }

  // `""` = blank, `!=""` / `<>""` = not blank – for every column type
  if (trimmed === '""') {
    return { operator: "blank" };
  }
  if (/^(!=|<>)\s*""$/.test(trimmed)) {
    return { operator: "notBlank" };
  }

  if (type === "text" || type === "set") {
    return parseTextInput(trimmed);
  }

  if (type === "boolean") {
    const low = trimmed.toLowerCase();
    if (TRUE_WORDS.includes(low)) {
      return { operator: "equals", value: true };
    }
    if (FALSE_WORDS.includes(low)) {
      return { operator: "equals", value: false };
    }
    return null;
  }

  if (type === "number") {
    const rangeIdx = trimmed.indexOf("..");
    if (rangeIdx !== -1) {
      const leftStr = trimmed.slice(0, rangeIdx).trim();
      const rightStr = trimmed.slice(rangeIdx + 2).trim();
      if (!leftStr || !rightStr) {
        return null;
      }
      const lo = parseLocaleNumber(leftStr, locale);
      const hi = parseLocaleNumber(rightStr, locale);
      if (lo === undefined || hi === undefined) {
        return null;
      }
      return { operator: "between", value: lo, valueTo: hi };
    }
    const { operator, rest } = splitOperatorPrefix(trimmed);
    if (!rest) {
      return null;
    }
    const num = parseLocaleNumber(rest, locale);
    if (num === undefined) {
      return null;
    }
    return { operator: operator ?? "equals", value: num };
  }

  if (type === "date") {
    const rangeIdx = trimmed.indexOf("..");
    if (rangeIdx !== -1) {
      const leftStr = trimmed.slice(0, rangeIdx).trim();
      const rightStr = trimmed.slice(rangeIdx + 2).trim();
      if (!leftStr || !rightStr) {
        return null;
      }
      const lo = parseDateBound(leftStr, false, locale);
      const hi = parseDateBound(rightStr, true, locale);
      if (!lo || !hi) {
        return null;
      }
      return { operator: "between", value: formatDateIso(lo), valueTo: formatDateIso(hi) };
    }
    const { operator, rest } = splitOperatorPrefix(trimmed);
    if (!rest) {
      return null;
    }
    if (MONTH_PATTERN.test(rest)) {
      // a month: "2026-03" = the whole month; ">2026-03" = after it, ">=2026-03" = from its first day …
      const first = parseDateBound(rest, false, locale);
      const last = parseDateBound(rest, true, locale);
      if (!first || !last) {
        return null;
      }
      if (operator === undefined || operator === "equals") {
        return { operator: "between", value: formatDateIso(first), valueTo: formatDateIso(last) };
      }
      if (operator === "notEquals") {
        return null; // "not in this month" needs two conditions
      }
      const bound = operator === "greaterThan" || operator === "lessOrEqual" ? last : first;
      return { operator, value: formatDateIso(bound) };
    }
    const date = parseDateText(rest, locale);
    if (!date) {
      return null;
    }
    return { operator: operator ?? "equals", value: formatDateIso(date) };
  }

  return { operator: "contains", value: trimmed };
}

function formatScalar(value: unknown, locale?: string): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? "" : formatDateIso(value);
  }
  if (typeof value === "number") {
    return formatFilterNumber(value, locale);
  }
  return String(value);
}

/**
 * Formats a number the way {@link parseFilterInput} reads it back in `locale`: no group separators, the decimal
 * separator of the locale (`1.5` → `"1,5"` in `"de-DE"`).
 *
 * @example
 * formatFilterNumber(1234.5, "de-DE"); // "1234,5"
 *
 * @category Sorting & filtering
 * @since 1.1.114
 */
export function formatFilterNumber(value: number, locale?: string): string {
  const text = String(value);
  if (!text.includes(".") || /e/i.test(text)) {
    return text;
  }
  let decimal = ".";
  try {
    const part = new Intl.NumberFormat(locale).formatToParts(1.5).find((p) => p.type === "decimal");
    decimal = part?.value ?? ".";
  } catch {
    // unknown locale: keep "."
  }
  return decimal === "." ? text : text.replace(".", decimal);
}

/**
 * Formats a {@link ColumnFilterIf} into the concise display string shown in a filter-row input.
 *
 * The text of a condition is one that {@link parseFilterInput} reads back to the same condition (`= EMEA`, `^Ac`,
 * `GmbH$`, `""`, numbers with the decimal separator of `locale`).
 *
 * @example
 * formatFilterCondition({ condition: { operator: "greaterThan", value: 40 } }); // "> 40"
 * formatFilterCondition({ values: ["EMEA", "APAC"] });                          // "(2 values)"
 *
 * @category Sorting & filtering
 * @since 1.1.114
 */
export function formatFilterCondition(
  filter: ColumnFilterIf | undefined,
  texts?: Partial<ColumnFilterTextsIf>,
  locale?: string,
): string {
  if (!filter) {
    return "";
  }
  const t = ColumnFilterTexts.create(texts);
  if (filter.values !== undefined && !filter.condition) {
    return t.selectedValuesCount(filter.values.length);
  }
  const c = filter.condition;
  if (!c) {
    return "";
  }
  const v = formatScalar(c.value, locale);
  let text: string;
  switch (c.operator) {
    case "contains":
      text = v;
      break;
    case "startsWith":
      text = `^${v}`;
      break;
    case "endsWith":
      text = `${v}$`;
      break;
    case "equals":
      text = `= ${v}`;
      break;
    case "notEquals":
      text = `!= ${v}`;
      break;
    case "lessThan":
      text = `< ${v}`;
      break;
    case "lessOrEqual":
      text = `<= ${v}`;
      break;
    case "greaterThan":
      text = `> ${v}`;
      break;
    case "greaterOrEqual":
      text = `>= ${v}`;
      break;
    case "between":
      text = `${v}..${formatScalar(c.valueTo, locale)}`;
      break;
    case "blank":
      text = '""';
      break;
    case "notBlank":
      text = '!=""';
      break;
    default:
      text = v;
  }
  if (filter.values !== undefined) {
    return `${text} ${t.selectedValuesCount(filter.values.length)}`;
  }
  return text;
}
