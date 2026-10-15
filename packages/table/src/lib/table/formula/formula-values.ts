import { FormulaError, isFormulaError } from "./formula-error";
import type { FormulaValue } from "./formula-options.if";

// Not exported from index.ts: the type conversions of the evaluator and the functions.

/** A decimal number as text ("3", "-1.5", ".5", "1e3") – no hex, no "Infinity". */
const NUMBER_TEXT = /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i;

export function isBlank(v: FormulaValue): boolean {
  return v === null || v === "";
}

/** A value from the data (a field) as formula value: Date → ms, function/object → #VALUE!. */
export function fromData(v: unknown, name: string, trusted = false): FormulaValue {
  if (v === null || v === undefined) return null;
  switch (typeof v) {
    case "number":
      return Number.isNaN(v) ? null : v;
    case "string":
    case "boolean":
      return v;
    case "bigint":
      return Number(v);
  }
  // an error of another calculated column (trusted) – an object of the data that only looks like one is no value
  if (trusted && isFormulaError(v)) return v;
  if (v instanceof Date) {
    const t = v.getTime();
    return Number.isNaN(t) ? null : t;
  }
  return new FormulaError("#VALUE!", `[${name}] is not a number, text or boolean`);
}

export function toNumber(v: FormulaValue): number | FormulaError {
  if (typeof v === "number") return v;
  if (v === null || v === "") return 0;
  if (typeof v === "boolean") return v ? 1 : 0;
  if (typeof v === "string") {
    const s = v.trim();
    if (NUMBER_TEXT.test(s)) {
      const n = Number(s);
      if (Number.isFinite(n)) return n;
    }
    return new FormulaError("#VALUE!", `"${v.length > 40 ? v.slice(0, 40) + "…" : v}" is not a number`);
  }
  return v; // error
}

export function toText(v: FormulaValue): string | FormulaError {
  if (typeof v === "string") return v;
  if (v === null) return "";
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
  return v;
}

export function toBoolean(v: FormulaValue): boolean | FormulaError {
  if (typeof v === "boolean") return v;
  if (v === null || v === "") return false;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") {
    const u = v.trim().toUpperCase();
    if (u === "TRUE") return true;
    if (u === "FALSE") return false;
    return new FormulaError("#VALUE!", `"${v.length > 40 ? v.slice(0, 40) + "…" : v}" is not TRUE or FALSE`);
  }
  return v;
}

/** A number result: NaN / ±Infinity → #NUM!, -0 → 0. */
export function numberResult(n: number): number | FormulaError {
  if (!Number.isFinite(n)) {
    return new FormulaError("#NUM!", "The result is not a finite number");
  }
  return n === 0 ? 0 : n;
}

/** Compares two values: numbers numerically, texts case-insensitively, blank = 0 = "" = FALSE. */
export function compareValues(a: FormulaValue, b: FormulaValue): number | FormulaError {
  if (isFormulaError(a)) return a;
  if (isFormulaError(b)) return b;
  if (isBlank(a) && isBlank(b)) return 0;
  const textA = typeof a === "string" && !isBlank(a);
  const textB = typeof b === "string" && !isBlank(b);
  if (textA || textB) {
    if (textA && textB) {
      const x = (a as string).toLowerCase();
      const y = (b as string).toLowerCase();
      return x < y ? -1 : x > y ? 1 : 0;
    }
    // text and number: a numeric text compares as number, otherwise as text
    const na = toNumber(a);
    const nb = toNumber(b);
    if (!isFormulaError(na) && !isFormulaError(nb)) return na - nb;
    const ta = toText(a) as string;
    const tb = toText(b) as string;
    const x = ta.toLowerCase();
    const y = tb.toLowerCase();
    return x < y ? -1 : x > y ? 1 : 0;
  }
  const na = toNumber(a) as number;
  const nb = toNumber(b) as number;
  return na - nb;
}
