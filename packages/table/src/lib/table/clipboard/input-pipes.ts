import type { editInputPipe } from "../renderer/edit/edit-input-pipe.if";

/** Decimal and group separator of a locale (`Intl`), `"."` and `","` without `Intl`. */
function separatorsOf(locale?: string): { decimal: string; group: string } {
  try {
    // typed by hand: the wrappers' type builds use an older lib (formatToParts of NumberFormat is ES2018)
    const format = new Intl.NumberFormat(locale) as unknown as { formatToParts(n: number): { type: string; value: string }[] };
    const parts = format.formatToParts(12345.6);
    return {
      decimal: parts.find(p => p.type === "decimal")?.value ?? ".",
      group: parts.find(p => p.type === "group")?.value ?? ",",
    };
  } catch {
    return { decimal: ".", group: "," };
  }
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** ISO 4217 codes the engine knows (`Intl.supportedValuesOf`), otherwise the common ones. */
let currencyCodes: Set<string> | undefined;

function isCurrencyCode(code: string): boolean {
  if (!currencyCodes) {
    let list: string[] = [];
    try {
      list = (Intl as unknown as { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf?.("currency") ?? [];
    } catch {
      list = [];
    }
    currencyCodes = new Set(list.length ? list
      : ["EUR", "USD", "GBP", "CHF", "JPY", "CNY", "CAD", "AUD", "SEK", "NOK", "DKK", "PLN", "CZK"]);
  }
  return currencyCodes.has(code);
}

/** Removes a currency sign or ISO code at the start ("€ 12", "EUR 12"); other capitals ("SKU 123") stay. */
function stripLeadingCurrency(s: string): string {
  return s.replace(/^\p{Sc}\s*/u, "").replace(/^([A-Z]{3})\s+/u, (m, code: string) => (isCurrencyCode(code) ? "" : m));
}

/**
 * Parses a number as people type and paste it: group separators of the locale (`1.234,56` in de-DE, `1,234.56` in
 * en-US, spaces where the locale groups with spaces), a leading `+`/`-` (also U+2212) or parentheses for negative
 * numbers, a percent sign (÷ 100), currency signs or ISO codes at the start or end (`€ 12`, `12 EUR`), exponent
 * notation. `undefined` if the text is no number (`"SKU 123"`, `"+49 123"` in en-US, `"(-5)"`).
 */
function parseLocaleNumber(text: string, locale?: string): number | undefined {
  let s = text.trim().replace(/[   ]/g, " ").replace(/−/g, "-");
  if (!s) {
    return undefined;
  }
  let negative = false;
  if (/^\(.*\)$/.test(s)) {
    negative = true;
    s = s.slice(1, -1).trim();
    if (/^[-+]/.test(s)) {
      return undefined; // "(-5)"
    }
  }
  let percent = false;
  s = stripLeadingCurrency(s);
  s = s.replace(/\s*%$/u, () => {
    percent = true;
    return "";
  });
  s = s.replace(/\s*\p{Sc}$/u, "").replace(/\s+([A-Z]{3})$/u, (m, code: string) => (isCurrencyCode(code) ? "" : m));
  if (s.startsWith("-") || s.startsWith("+")) {
    negative = negative !== s.startsWith("-");
    s = stripLeadingCurrency(s.slice(1).trim()); // "-€ 5"
  }
  const { decimal, group } = separatorsOf(locale);
  const groupChars = group.trim() === "" ? " " : group;
  s = s.replace(new RegExp(`[${escapeRegExp(groupChars)}](?=\\d{3}(\\D|$))`, "g"), "");
  if (decimal !== ".") {
    if (s.includes(".") && !/[eE]/.test(s)) {
      return undefined; // "1.5" in de-DE is no number (a group separator in the wrong place)
    }
    s = s.replace(decimal, ".");
  }
  if (!/^(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/.test(s)) {
    return undefined;
  }
  let n = Number(s);
  if (percent) n /= 100;
  return negative ? -n : n;
}

/**
 * An `editInputPipe` for numbers in the format of a locale, for the editor and for pasting: `"1.234,56"` (de-DE) and
 * `"1,234.56"` (en-US) → `1234.56`, `"12 %"` → `0.12`, `"€ 9,90"` → `9.9`, `"(5)"` → `-5`. Empty text stays `""`,
 * text that is no number stays as it is (a `validate` of the column can refuse it); numbers pass unchanged.
 *
 * @param {string} [locale] - BCP 47 tag, default: the browser's locale
 * @returns {editInputPipe} the pipe
 *
 * @example
 * ColumnDef.create({ property: "price", editable: TrueFn, editInputPipe: createNumberInputPipe("de-DE") });
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export function createNumberInputPipe(locale?: string): editInputPipe {
  return (input: unknown) => {
    if (typeof input !== "string") {
      return input;
    }
    if (input.trim() === "") {
      return "";
    }
    return parseLocaleNumber(input, locale) ?? input;
  };
}

/** Order of day, month and year in the short date of a locale, e.g. `["day", "month", "year"]` in de-DE. */
function dateOrderOf(locale?: string): string[] {
  try {
    return new Intl.DateTimeFormat(locale).formatToParts(new Date(2026, 10, 23))
      .filter(p => p.type === "day" || p.type === "month" || p.type === "year").map(p => p.type);
  } catch {
    return ["month", "day", "year"];
  }
}

/** A date from ISO text (`2026-10-16`, `2026-10-16T08:30[:00]`) or the short date of the locale (`16.10.2026`). */
function parseDateText(text: string, locale?: string): Date | undefined {
  const s = text.trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?$/.exec(s);
  if (iso) {
    return validDate(+iso[1], +iso[2], +iso[3], +(iso[4] ?? 0), +(iso[5] ?? 0), +(iso[6] ?? 0));
  }
  const m = /^(\d{1,4})([./-])(\d{1,2})\2(\d{1,4})(?:,? (\d{1,2}):(\d{2})(?::(\d{2}))?)?$/.exec(s);
  if (!m) {
    return undefined;
  }
  const order = dateOrderOf(locale);
  const parts = [m[1], m[3], m[4]];
  const value: Record<string, number> = {};
  for (let i = 0; i < 3; i++) {
    const kind = order[i];
    const digits = parts[i];
    if (kind === "year" ? digits.length !== 2 && digits.length !== 4 : digits.length > 2) {
      return undefined; // "1.2.3", a version number – no date
    }
    value[kind] = +digits;
  }
  let year = value["year"];
  if (year < 100) year += 2000;
  return validDate(year, value["month"], value["day"], +(m[5] ?? 0), +(m[6] ?? 0), +(m[7] ?? 0));
}

function validDate(y: number, mo: number, d: number, h: number, mi: number, se: number): Date | undefined {
  const date = new Date(y, mo - 1, d, h, mi, se);
  return date.getFullYear() === y && date.getMonth() === mo - 1 && date.getDate() === d ? date : undefined;
}

/**
 * An `editInputPipe` for dates: ISO text (`"2026-10-16"`, with time `"2026-10-16T08:30"`) or the short date of the
 * locale (`"16.10.2026"` in de-DE, `"10/16/2026"` in en-US) → `Date` (local time). Empty text stays `""`, other text as
 * it is; a `Date` passes unchanged.
 *
 * @param {string} [locale] - BCP 47 tag for the order of day and month, default: the browser's locale
 * @returns {editInputPipe} the pipe
 *
 * @example
 * ColumnDef.create({ property: "due", editable: TrueFn, editInputPipe: createDateInputPipe("de-DE") });
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export function createDateInputPipe(locale?: string): editInputPipe {
  return (input: unknown) => {
    if (typeof input !== "string") {
      return input;
    }
    if (input.trim() === "") {
      return "";
    }
    return parseDateText(input, locale) ?? input;
  };
}

const TRUE_WORDS = ["true", "yes", "1", "x", "wahr", "ja"];
const FALSE_WORDS = ["false", "no", "0", "falsch", "nein"];

/**
 * An `editInputPipe` for `true`/`false`: `"TRUE"`, `"yes"`, `"1"`, `"x"` (also German `WAHR`, `ja`) → `true`; `"FALSE"`,
 * `"no"`, `"0"` (`FALSCH`, `nein`) → `false`, ignoring case; empty text stays `""`, other text as it is.
 *
 * @example
 * ColumnDef.create({ property: "paid", editable: TrueFn, editInputPipe: booleanInputPipe });
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export const booleanInputPipe: editInputPipe = (input: unknown) => {
  if (typeof input !== "string") {
    return input;
  }
  const s = input.trim().toLowerCase();
  if (s === "") return "";
  if (TRUE_WORDS.includes(s)) return true;
  if (FALSE_WORDS.includes(s)) return false;
  return input;
};

/**
 * An `editInputPipe` that recognizes values like Excel: a number in the format of the locale (also `%` and currency
 * signs), a date (ISO or the short date of the locale), `TRUE`/`FALSE` (ignoring case) – otherwise text. Text that
 * starts with `=` or `'=` (formulas, see the spreadsheet mode) stays unchanged; so does a leading `'` (Excel: "keep
 * this as text") minus the quote.
 *
 * @param {string} [locale] - BCP 47 tag, default: the browser's locale
 * @returns {editInputPipe} the pipe
 *
 * @example
 * ColumnDef.create({ property: "b", editable: TrueFn, editInputPipe: sheetInputPipe("en-US") });
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export function sheetInputPipe(locale?: string): editInputPipe {
  return (input: unknown) => {
    if (typeof input !== "string") {
      return input;
    }
    if (input.startsWith("=") || input.startsWith("'=")) {
      return input;
    }
    if (input.startsWith("'")) {
      return input.slice(1);
    }
    const s = input.trim();
    if (s === "") return "";
    const upper = s.toUpperCase();
    if (upper === "TRUE") return true;
    if (upper === "FALSE") return false;
    const n = parseLocaleNumber(s, locale);
    if (n !== undefined) return n;
    return parseDateText(s, locale) ?? input;
  };
}
