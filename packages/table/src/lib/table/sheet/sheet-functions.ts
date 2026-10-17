import { FormulaError, isFormulaError } from "../formula/formula-error";
import { roundHalfAwayFromZero } from "../formula/functions";
import {
  compareSheet,
  FormulaRange,
  isEmpty,
  isFormulaRange,
  isoTextToSerial,
  isSheetDate,
  num,
  numberToText,
  partsOfSerial,
  round15,
  scalar,
  serialOf,
  SheetDate,
  type SheetValue,
  toBool,
  toNum,
  toStr,
  type ValueOptions,
} from "./sheet-values";

// Not exported from index.ts: FORMULA_FUNCTION_INFO (sheet-function-info.ts) is the public list.

/** What a function of a cell formula may use besides its arguments. */
export interface SheetFnContext extends ValueOptions {
  /** The serial number of now (TODAY, NOW). */
  now(): number;
  /** A random number 0 … 1 (RAND). */
  random(): number;
}

/** A built-in function of cell formulas. */
export interface SheetFunctionSpec {
  readonly min: number;
  readonly max: number;
  /** Recomputed on every recalculation (TODAY, NOW, RAND). */
  readonly volatile?: boolean;
  /** Gets error arguments (ISERROR …) instead of returning the first one. */
  readonly acceptsErrors?: boolean;
  /** Arguments evaluated on demand (IF, IFERROR …). */
  readonly lazy?: (args: Array<() => SheetValue>, ctx: SheetFnContext) => SheetValue;
  readonly fn?: (args: SheetValue[], ctx: SheetFnContext) => SheetValue;
}

const NA = () => new FormulaError("#N/A", "Not found");
const VALUE = (message: string) => new FormulaError("#VALUE!", message);
const NUM = (message: string) => new FormulaError("#NUM!", message);
const DIV0 = (message: string) => new FormulaError("#DIV/0!", message);

/** Every value of the arguments: ranges cell by cell (with a flag), scalars as they are. */
/**
 * Visits every value of the arguments (ranges cell by cell, `inRange` = from a range) until `fn` returns something
 * other than `undefined` – that value is returned (an early error). A callback, not a generator: the core compiles
 * without `downlevelIteration`.
 */
function each<T>(args: SheetValue[], fn: (v: SheetValue, inRange: boolean) => T | undefined): T | undefined {
  for (const a of args) {
    if (isFormulaRange(a)) {
      for (let r = 0; r < a.rows; r++) {
        for (let c = 0; c < a.cols; c++) {
          const ret = fn(a.get(r, c), true);
          if (ret !== undefined) return ret;
        }
      }
    } else {
      const ret = fn(a, false);
      if (ret !== undefined) return ret;
    }
  }
  return undefined;
}

/**
 * The numbers of SUM, AVERAGE, MIN, MAX, PRODUCT: in ranges numbers and dates only (text and booleans are skipped);
 * direct arguments: numbers, numeric text, booleans – other text is #VALUE!. Errors propagate.
 */
function numbers(args: SheetValue[], o: ValueOptions): number[] | FormulaError {
  const ret: number[] = [];
  for (const a of args) {
    if (isFormulaRange(a)) {
      // the hot path of SUM(A:A): plain loops, no generator
      for (let r = 0; r < a.rows; r++) {
        for (let c = 0; c < a.cols; c++) {
          const v = a.get(r, c);
          if (typeof v === "number") ret.push(v);
          else if (v !== null && typeof v === "object") {
            if (isFormulaError(v)) return v;
            if (isSheetDate(v)) ret.push(v.serial);
          }
        }
      }
    } else if (isFormulaError(a)) {
      return a;
    } else if (typeof a === "number") {
      ret.push(a);
    } else if (isSheetDate(a)) {
      ret.push(a.serial);
    } else if (a !== null) {
      const n = toNum(a, o);
      if (isFormulaError(n)) return n;
      ret.push(n);
    }
  }
  return ret;
}

function n1(v: SheetValue, o: ValueOptions): number | FormulaError {
  return toNum(v, o);
}

/** Numbers of all arguments, the first error otherwise. */
function nums(args: SheetValue[], o: ValueOptions): number[] | FormulaError {
  const ret: number[] = [];
  for (const a of args) {
    const n = toNum(a, o);
    if (isFormulaError(n)) return n;
    ret.push(n);
  }
  return ret;
}

function text1(v: SheetValue): string | FormulaError {
  return toStr(v);
}

/** Rounds like ROUNDUP (away from zero) / ROUNDDOWN (toward zero). */
function roundDirected(x: number, digits: number, up: boolean): number {
  const f = Math.pow(10, Math.trunc(digits));
  const shifted = round15(Math.abs(x) * f);
  const r = (up ? Math.ceil(shifted) : Math.floor(shifted)) / f;
  return x < 0 ? -r : r;
}

/** A criterion of SUMIF/COUNTIF: `5`, `">5"`, `"<>x"`, `"M*"`, `""` (blank). */
export function makeCriterion(criterion: SheetValue, o: ValueOptions): (v: SheetValue) => boolean {
  const c = scalar(criterion);
  if (isFormulaError(c)) return () => false;
  const numeric = (v: SheetValue): number | undefined => {
    if (typeof v === "number") return v;
    if (isSheetDate(v)) return v.serial;
    if (typeof v === "string" && v.trim() !== "") {
      const n = toNum(v, o);
      return isFormulaError(n) ? undefined : n;
    }
    return undefined;
  };
  if (typeof c === "number" || isSheetDate(c)) {
    const target = isSheetDate(c) ? c.serial : c;
    return v => numeric(v) === target;
  }
  if (typeof c === "boolean") {
    return v => v === c;
  }
  const s = c === null ? "" : c;
  const m = /^(<=|>=|<>|<|>|=)?(.*)$/s.exec(s)!;
  const op = m[1] ?? "";
  const rest = m[2];
  if (rest === "" && (op === "" || op === "=")) {
    return v => isEmpty(v);
  }
  if (rest === "" && op === "<>") {
    return v => !isEmpty(v);
  }
  const restNum = numeric(rest);
  if (restNum !== undefined && !(op === "" && !/^[\s\d.+-]/.test(rest))) {
    return v => {
      const x = numeric(v);
      if (x === undefined) return op === "<>";
      const d = round15(x) - round15(restNum);
      switch (op) {
        case "<": return d < 0;
        case "<=": return d <= 0;
        case ">": return d > 0;
        case ">=": return d >= 0;
        case "<>": return d !== 0;
        default: return d === 0;
      }
    };
  }
  if (op === "" || op === "=" || op === "<>") {
    const matches = wildcardMatcher(rest);
    return v => {
      // a blank cell is no text: "*" does not count it (Excel), "<>x" does
      const t = typeof v === "string" ? v : typeof v === "boolean" ? (v ? "TRUE" : "FALSE") : undefined;
      const match = t !== undefined && t !== "" && matches(t);
      return op === "<>" ? !match : match;
    };
  }
  const low = rest.toLowerCase();
  return v => {
    if (typeof v !== "string") return false;
    const t = v.toLowerCase();
    switch (op) {
      case "<": return t < low;
      case "<=": return t <= low;
      case ">": return t > low;
      default: return t >= low;
    }
  };
}

/** A token of a wildcard pattern. */
type GlobToken = { kind: "char"; ch: string } | { kind: "any" } | { kind: "star" };

/** `*` and `?` as wildcards (`~*` = a star), lower case. */
function compileGlob(pattern: string): GlobToken[] {
  const ret: GlobToken[] = [];
  for (let i = 0; i < pattern.length; i++) {
    const ch = pattern[i];
    if (ch === "~" && (pattern[i + 1] === "*" || pattern[i + 1] === "?" || pattern[i + 1] === "~")) {
      ret.push({ kind: "char", ch: pattern[++i] });
    } else if (ch === "*") {
      if (ret[ret.length - 1]?.kind !== "star") ret.push({ kind: "star" });
    } else if (ch === "?") {
      ret.push({ kind: "any" });
    } else {
      ret.push({ kind: "char", ch: ch.toLowerCase() });
    }
  }
  return ret;
}

/**
 * True if the whole text matches the tokens – linear backtracking over the last star (no regular expression: a
 * pattern with many stars cannot hang the page).
 */
function globMatch(tokens: GlobToken[], text: string, from = 0): boolean {
  const s = text.toLowerCase();
  let i = 0;
  let j = from;
  let star = -1;
  let mark = 0;
  while (j < s.length) {
    const t = tokens[i];
    if (t && (t.kind === "any" || (t.kind === "char" && t.ch === s[j]))) {
      i++;
      j++;
    } else if (t && t.kind === "star") {
      star = i++;
      mark = j;
    } else if (star >= 0) {
      i = star + 1;
      j = ++mark;
    } else {
      return false;
    }
  }
  while (i < tokens.length && tokens[i].kind === "star") i++;
  return i === tokens.length;
}

/** A case-insensitive whole-text matcher with wildcards. */
function wildcardMatcher(pattern: string): (text: string) => boolean {
  const tokens = compileGlob(pattern);
  return text => globMatch(tokens, text);
}

function hasWildcard(s: string): boolean {
  return /(^|[^~])[*?]/.test(s);
}

/** A range argument (a scalar counts as 1×1). */
function asRange(v: SheetValue): FormulaRange {
  if (isFormulaRange(v)) return v;
  return new FormulaRange(0, 0, 1, 1, () => v);
}

/** SUMIF/COUNTIF/AVERAGEIF over several (range, criterion) pairs. */
function conditional(pairs: Array<[SheetValue, SheetValue]>, valueRange: FormulaRange | undefined, o: ValueOptions,
                     each: (v: SheetValue) => FormulaError | void): FormulaError | undefined {
  const ranges = pairs.map(([r]) => asRange(r));
  const tests = pairs.map(([, c]) => makeCriterion(c, o));
  const first = ranges[0];
  for (const r of ranges) {
    if (r.rows !== first.rows || r.cols !== first.cols) return VALUE("The ranges have different sizes");
  }
  // the sum range has the size of the criteria range (the compiler resizes it, so the graph knows its cells)
  for (let r = 0; r < first.rows; r++) {
    for (let c = 0; c < first.cols; c++) {
      let ok = true;
      for (let i = 0; i < ranges.length && ok; i++) {
        const v = ranges[i].get(r, c);
        ok = !isFormulaError(v) && tests[i](v);
      }
      if (ok) {
        const e = each(valueRange ? valueRange.get(r, c) : ranges[0].get(r, c));
        if (e) return e;
      }
    }
  }
  return undefined;
}

/** Equality for lookups: numbers/dates numerically, texts case-insensitively (wildcards in exact text lookups). */
function lookupMatcher(value: SheetValue, wildcards: boolean): (v: SheetValue) => boolean {
  const s = scalar(value);
  if (typeof s === "string" && wildcards && hasWildcard(s)) {
    const matches = wildcardMatcher(s);
    return v => typeof v === "string" && matches(v);
  }
  return v => !isFormulaError(v) && v !== null && compareSheet(v, s) === 0;
}

/** One row or column of a range, read on demand (lookups never copy the key column). */
interface Vec {
  readonly length: number;
  get(i: number): SheetValue;
}

/** Excel's sort order of types: numbers (and dates) < text < booleans; blanks and errors have none. */
function typeRank(v: SheetValue): number {
  return typeof v === "string" ? 1 : typeof v === "boolean" ? 2 : 0;
}

/** Approximate lookup in ascending data: the last position whose value is ≤ the value (stops at a larger one). */
function approximate(values: Vec, value: SheetValue, descending = false): number {
  const s = scalar(value);
  const rank = typeRank(s);
  let found = -1;
  for (let i = 0; i < values.length; i++) {
    const v = values.get(i);
    if (v === null || isFormulaError(v) || typeRank(v) !== rank) continue; // other types are skipped (like Excel)
    const c = compareSheet(v, s);
    if (isFormulaError(c)) continue;
    if (descending ? c >= 0 : c <= 0) found = i;
    else break;
  }
  return found;
}

function findIndex(values: Vec, match: (v: SheetValue) => boolean): number {
  for (let i = 0; i < values.length; i++) if (match(values.get(i))) return i;
  return -1;
}

function column(range: FormulaRange, c: number): Vec {
  return { length: range.rows, get: r => range.get(r, c) };
}

function row(range: FormulaRange, r: number): Vec {
  return { length: range.cols, get: c => range.get(r, c) };
}

/** A 1-D range (one row or one column). */
function vector(v: SheetValue): Vec | FormulaError {
  const range = asRange(v);
  if (range.rows === 1) return row(range, 0);
  if (range.cols === 1) return column(range, 0);
  return VALUE("A range of one row or one column is needed");
}

/** The date serial of a value (dates, numbers, ISO text). */
function serialArg(v: SheetValue, o: ValueOptions): number | FormulaError {
  const s = scalar(v);
  if (typeof s === "string") {
    const iso = isoTextToSerial(s.trim());
    if (iso !== undefined) return iso;
  }
  const n = toNum(s, o);
  if (isFormulaError(n)) return n;
  return n < 0 ? NUM("A negative date") : n;
}

function dateResult(serial: number): SheetValue {
  if (!Number.isFinite(serial) || serial < 0 || serial > 2958465) return NUM("The date is out of range");
  return new SheetDate(serial);
}

/** TEXT(value, format) – a subset: 0, 0.00, #,##0(.00), 0%, 0.0%, yyyy-mm-dd, dd.mm.yyyy, mm/dd/yyyy. */
function formatText(value: SheetValue, format: string, o: ValueOptions): SheetValue {
  const f = format.trim();
  const s = scalar(value);
  if (typeof s === "string" && isoTextToSerial(s.trim()) === undefined && isFormulaError(toNum(s, o))) {
    return s; // Excel: TEXT("abc"; "0.00") = "abc"
  }
  if (/^(yyyy|dd|mm)[-./](mm|dd)[-./](yyyy|dd)$/i.test(f)) {
    const serial = serialArg(value, o);
    if (isFormulaError(serial)) return serial;
    const { y, m, d } = partsOfSerial(serial);
    const pad = (n: number) => String(n).padStart(2, "0");
    return f.toLowerCase().replace("yyyy", String(y)).replace(/mm/, pad(m)).replace("dd", pad(d));
  }
  const m = /^(#,##)?0(\.(0+))?(%)?$/.exec(f);
  if (!m) {
    return VALUE(`TEXT: the format "${f}" is not supported`);
  }
  let n = toNum(value, o);
  if (isFormulaError(n)) return n;
  if (m[4]) n *= 100;
  const decimals = m[3]?.length ?? 0;
  const rounded = roundHalfAwayFromZero(n, decimals);
  let text = Math.abs(rounded).toFixed(decimals);
  if (m[1]) {
    const [int, frac] = text.split(".");
    text = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (frac ? "." + frac : "");
  }
  return (rounded < 0 ? "-" : "") + text + (m[4] ? "%" : "");
}

function datedif(start: number, end: number, unit: string): SheetValue {
  if (start > end) return NUM("The start date is after the end date");
  const a = partsOfSerial(start);
  const b = partsOfSerial(end);
  switch (unit.toUpperCase()) {
    case "D":
      return Math.floor(end) - Math.floor(start);
    case "M": {
      let months = (b.y - a.y) * 12 + (b.m - a.m);
      if (b.d < a.d) months--;
      return months;
    }
    case "Y": {
      let years = b.y - a.y;
      if (b.m < a.m || (b.m === a.m && b.d < a.d)) years--;
      return years;
    }
    case "YM":
      return ((b.m - a.m) + 12 - (b.d < a.d ? 1 : 0)) % 12;
    case "MD":
      return b.d >= a.d ? b.d - a.d : Math.floor(end) - serialOf(b.y, b.m - 1, a.d);
    case "YD": {
      let start2 = serialOf(b.y, a.m, a.d);
      if (start2 > Math.floor(end)) start2 = serialOf(b.y - 1, a.m, a.d);
      return Math.floor(end) - start2;
    }
    default:
      return NUM(`DATEDIF unit "${unit}" is not supported (d, m, y, ym, md, yd)`);
  }
}

const mathFn = (f: (x: number) => number | FormulaError): SheetFunctionSpec => ({
  min: 1, max: 1, fn: (a, o) => {
    const x = n1(a[0], o);
    if (isFormulaError(x)) return x;
    const r = f(x);
    return isFormulaError(r) ? r : num(r);
  },
});

const textFn = (f: (t: string) => SheetValue): SheetFunctionSpec => ({
  min: 1, max: 1, fn: a => {
    const t = text1(a[0]);
    return isFormulaError(t) ? t : f(t);
  },
});

/** The built-in functions of cell formulas (Excel signatures and semantics). */
export const SHEET_FUNCTIONS: Record<string, SheetFunctionSpec> = {
  // ------------------------------------------------------------------------------------------------ math
  SUM: { min: 1, max: 255, fn: (a, o) => { const ns = numbers(a, o); return isFormulaError(ns) ? ns : num(ns.reduce((s, x) => s + x, 0)); } },
  PRODUCT: { min: 1, max: 255, fn: (a, o) => { const ns = numbers(a, o); return isFormulaError(ns) ? ns : num(ns.length ? ns.reduce((s, x) => s * x, 1) : 0); } },
  AVERAGE: {
    min: 1, max: 255, fn: (a, o) => {
      const ns = numbers(a, o);
      if (isFormulaError(ns)) return ns;
      return ns.length ? num(ns.reduce((s, x) => s + x, 0) / ns.length) : DIV0("AVERAGE of no numbers");
    },
  },
  MIN: { min: 1, max: 255, fn: (a, o) => { const ns = numbers(a, o); return isFormulaError(ns) ? ns : ns.length ? ns.reduce((m, x) => Math.min(m, x), Infinity) : 0; } },
  MAX: { min: 1, max: 255, fn: (a, o) => { const ns = numbers(a, o); return isFormulaError(ns) ? ns : ns.length ? ns.reduce((m, x) => Math.max(m, x), -Infinity) : 0; } },
  COUNT: {
    min: 1, max: 255, fn: (a, o) => {
      let n = 0;
      each(a, (v, inRange) => {
        if (typeof v === "number" || isSheetDate(v)) n++;
        else if (!inRange && (typeof v === "boolean" || (typeof v === "string" && !isFormulaError(toNum(v, o))))) n++;
      });
      return n;
    },
  },
  COUNTA: {
    min: 1, max: 255, fn: a => {
      let n = 0;
      each(a, v => { if (v !== null) n++; }); // "" from a formula counts (like Excel)
      return n;
    },
  },
  COUNTBLANK: { min: 1, max: 1, fn: a => { let n = 0; each(a, v => { if (isEmpty(v)) n++; }); return n; } },
  SUMPRODUCT: {
    min: 1, max: 255, fn: a => {
      const ranges = a.map(asRange);
      const first = ranges[0];
      if (ranges.some(r => r.rows !== first.rows || r.cols !== first.cols)) return VALUE("SUMPRODUCT: the ranges have different sizes");
      let sum = 0;
      for (let r = 0; r < first.rows; r++) {
        for (let c = 0; c < first.cols; c++) {
          let p = 1;
          for (const range of ranges) {
            const v = range.get(r, c);
            if (isFormulaError(v)) return v;
            p *= typeof v === "number" ? v : isSheetDate(v) ? v.serial : 0;
          }
          sum += p;
        }
      }
      return num(sum);
    },
  },
  ROUND: { min: 2, max: 2, fn: (a, o) => { const x = nums(a, o); return isFormulaError(x) ? x : num(roundHalfAwayFromZero(x[0], x[1])); } },
  ROUNDUP: { min: 2, max: 2, fn: (a, o) => { const x = nums(a, o); return isFormulaError(x) ? x : num(roundDirected(x[0], x[1], true)); } },
  ROUNDDOWN: { min: 2, max: 2, fn: (a, o) => { const x = nums(a, o); return isFormulaError(x) ? x : num(roundDirected(x[0], x[1], false)); } },
  INT: mathFn(x => Math.floor(round15(x))),
  ABS: mathFn(Math.abs),
  SQRT: mathFn(x => (x < 0 ? NUM("SQRT of a negative number") : Math.sqrt(x))),
  MOD: {
    min: 2, max: 2, fn: (a, o) => {
      const x = nums(a, o);
      if (isFormulaError(x)) return x;
      if (x[1] === 0) return DIV0("MOD by zero");
      return num(x[0] - x[1] * Math.floor(round15(x[0] / x[1])));
    },
  },
  POWER: {
    min: 2, max: 2, fn: (a, o) => {
      const x = nums(a, o);
      if (isFormulaError(x)) return x;
      if (x[0] === 0 && x[1] === 0) return NUM("0^0");
      if (x[0] === 0 && x[1] < 0) return DIV0("0 to a negative power");
      return num(Math.pow(x[0], x[1]));
    },
  },
  FLOOR: {
    min: 2, max: 2, fn: (a, o) => {
      const x = nums(a, o);
      if (isFormulaError(x)) return x;
      const [v, s] = x;
      if (s === 0) return v === 0 ? 0 : DIV0("FLOOR with significance 0");
      if (v > 0 && s < 0) return NUM("FLOOR: a positive number with a negative significance");
      return num(Math.floor(round15(v / s)) * s);
    },
  },
  CEILING: {
    min: 2, max: 2, fn: (a, o) => {
      const x = nums(a, o);
      if (isFormulaError(x)) return x;
      const [v, s] = x;
      if (s === 0) return 0;
      if (v > 0 && s < 0) return NUM("CEILING: a positive number with a negative significance");
      return num(Math.ceil(round15(v / s)) * s);
    },
  },
  RAND: { min: 0, max: 0, volatile: true, fn: (_a, ctx) => ctx.random() },
  RANDBETWEEN: {
    min: 2, max: 2, volatile: true, fn: (a, ctx) => {
      const x = nums(a, ctx);
      if (isFormulaError(x)) return x;
      const lo = Math.ceil(x[0]);
      const hi = Math.floor(x[1]);
      if (lo > hi) return NUM("RANDBETWEEN: bottom is greater than top");
      return lo + Math.floor(ctx.random() * (hi - lo + 1));
    },
  },
  // ------------------------------------------------------------------------------------------------ conditional
  SUMIF: {
    min: 2, max: 3, fn: (a, o) => {
      let sum = 0;
      const e = conditional([[a[0], a[1]]], a[2] !== undefined ? asRange(a[2]) : undefined, o, v => {
        if (isFormulaError(v)) return v;
        if (typeof v === "number") sum += v;
        else if (isSheetDate(v)) sum += v.serial;
        return undefined;
      });
      return e ?? num(sum);
    },
  },
  SUMIFS: {
    min: 3, max: 255, fn: (a, o) => {
      if ((a.length - 1) % 2) return VALUE("SUMIFS needs pairs of range and criterion");
      const pairs: Array<[SheetValue, SheetValue]> = [];
      for (let i = 1; i < a.length; i += 2) pairs.push([a[i], a[i + 1]]);
      let sum = 0;
      const e = conditional(pairs, asRange(a[0]), o, v => {
        if (isFormulaError(v)) return v;
        if (typeof v === "number") sum += v;
        else if (isSheetDate(v)) sum += v.serial;
        return undefined;
      });
      return e ?? num(sum);
    },
  },
  COUNTIF: {
    min: 2, max: 2, fn: (a, o) => {
      let n = 0;
      const e = conditional([[a[0], a[1]]], undefined, o, () => { n++; });
      return e ?? n;
    },
  },
  COUNTIFS: {
    min: 2, max: 254, fn: (a, o) => {
      if (a.length % 2) return VALUE("COUNTIFS needs pairs of range and criterion");
      const pairs: Array<[SheetValue, SheetValue]> = [];
      for (let i = 0; i < a.length; i += 2) pairs.push([a[i], a[i + 1]]);
      let n = 0;
      const e = conditional(pairs, undefined, o, () => { n++; });
      return e ?? n;
    },
  },
  AVERAGEIF: {
    min: 2, max: 3, fn: (a, o) => {
      let sum = 0;
      let n = 0;
      const e = conditional([[a[0], a[1]]], a[2] !== undefined ? asRange(a[2]) : undefined, o, v => {
        if (isFormulaError(v)) return v;
        if (typeof v === "number" || isSheetDate(v)) {
          sum += typeof v === "number" ? v : v.serial;
          n++;
        }
        return undefined;
      });
      return e ?? (n ? num(sum / n) : DIV0("AVERAGEIF: no matching numbers"));
    },
  },
  AVERAGEIFS: {
    min: 3, max: 255, fn: (a, o) => {
      if ((a.length - 1) % 2) return VALUE("AVERAGEIFS needs pairs of range and criterion");
      const pairs: Array<[SheetValue, SheetValue]> = [];
      for (let i = 1; i < a.length; i += 2) pairs.push([a[i], a[i + 1]]);
      let sum = 0;
      let n = 0;
      const e = conditional(pairs, asRange(a[0]), o, v => {
        if (isFormulaError(v)) return v;
        if (typeof v === "number" || isSheetDate(v)) {
          sum += typeof v === "number" ? v : v.serial;
          n++;
        }
        return undefined;
      });
      return e ?? (n ? num(sum / n) : DIV0("AVERAGEIFS: no matching numbers"));
    },
  },
  // ------------------------------------------------------------------------------------------------ logic
  IF: {
    min: 2, max: 3, lazy: ([c, a, b]) => {
      const cond = toBool(c());
      if (isFormulaError(cond)) return cond;
      return cond ? a() : b ? b() : false;
    },
  },
  IFS: {
    min: 2, max: 254, lazy: args => {
      if (args.length % 2) return VALUE("IFS needs pairs of condition and value");
      for (let i = 0; i < args.length; i += 2) {
        const cond = toBool(args[i]());
        if (isFormulaError(cond)) return cond;
        if (cond) return args[i + 1]();
      }
      return NA();
    },
  },
  IFERROR: { min: 2, max: 2, lazy: ([v, alt]) => { const x = scalar(v()); return isFormulaError(x) ? alt() : x; } },
  IFNA: { min: 2, max: 2, lazy: ([v, alt]) => { const x = scalar(v()); return isFormulaError(x) && x.code === "#N/A" ? alt() : x; } },
  AND: { min: 1, max: 255, fn: a => logical(a, bs => bs.every(Boolean)) },
  OR: { min: 1, max: 255, fn: a => logical(a, bs => bs.some(Boolean)) },
  XOR: { min: 1, max: 255, fn: a => logical(a, bs => bs.filter(Boolean).length % 2 === 1) },
  NOT: { min: 1, max: 1, fn: a => { const b = toBool(a[0]); return isFormulaError(b) ? b : !b; } },
  SWITCH: {
    min: 3, max: 254, lazy: args => {
      const value = scalar(args[0]());
      if (isFormulaError(value)) return value;
      const pairs = args.length - 1;
      for (let i = 1; i + 1 < args.length; i += 2) {
        const v = scalar(args[i]());
        if (isFormulaError(v)) return v;
        if (compareSheet(value, v) === 0) return args[i + 1]();
      }
      return pairs % 2 === 1 ? args[args.length - 1]() : NA();
    },
  },
  // ------------------------------------------------------------------------------------------------ lookup
  VLOOKUP: { min: 3, max: 4, fn: (a, o) => hvlookup(a, o, true) },
  HLOOKUP: { min: 3, max: 4, fn: (a, o) => hvlookup(a, o, false) },
  XLOOKUP: {
    min: 3, max: 4, fn: a => {
      const keys = vector(a[1]);
      if (isFormulaError(keys)) return keys;
      const results = asRange(a[2]);
      const vertical = asRange(a[1]).cols === 1 && asRange(a[1]).rows > 1;
      if ((vertical ? results.rows : results.cols) !== keys.length) {
        return VALUE("XLOOKUP: the result range must have the size of the lookup range");
      }
      const i = findIndex(keys, lookupMatcher(a[0], false));
      if (i < 0) return a.length > 3 ? a[3] : NA();
      if (results.rows === 1 && results.cols === 1) return results.get(0, 0);
      if (vertical) {
        return results.cols === 1 ? results.get(i, 0) : new FormulaRange(results.row + i, results.col, 1, results.cols, (r, c) => results.get(r - results.row, c - results.col));
      }
      return results.rows === 1 ? results.get(0, i) : new FormulaRange(results.row, results.col + i, results.rows, 1, (r, c) => results.get(r - results.row, c - results.col));
    },
  },
  INDEX: {
    min: 2, max: 3, fn: (a, o) => {
      const range = asRange(a[0]);
      const rn = toNum(a[1], o);
      if (isFormulaError(rn)) return rn;
      let cn: number | FormulaError = a.length > 2 ? toNum(a[2], o) : 0;
      if (isFormulaError(cn)) return cn;
      let r = Math.trunc(rn);
      let c = Math.trunc(cn);
      if (a.length === 2 && range.rows === 1) {
        c = r;
        r = 1;
      } else if (a.length === 2 && range.cols === 1) {
        c = 1;
      }
      if (r < 0 || c < 0 || r > range.rows || c > range.cols) return new FormulaError("#REF!", "INDEX outside the range");
      if (r === 0 && c === 0) return range;
      if (r === 0) return new FormulaRange(range.row, range.col + c - 1, range.rows, 1, (x, y) => range.get(x - range.row, y - range.col));
      if (c === 0) return new FormulaRange(range.row + r - 1, range.col, 1, range.cols, (x, y) => range.get(x - range.row, y - range.col));
      return range.get(r - 1, c - 1);
    },
  },
  MATCH: {
    min: 2, max: 3, fn: (a, o) => {
      const values = vector(a[1]);
      if (isFormulaError(values)) return values;
      const type = a.length > 2 ? toNum(a[2], o) : 1;
      if (isFormulaError(type)) return type;
      const lookup = scalar(a[0]);
      if (isFormulaError(lookup)) return lookup;
      let i: number;
      if (type === 0) {
        i = findIndex(values, lookupMatcher(lookup, true));
      } else {
        i = approximate(values, lookup, type < 0);
      }
      return i < 0 ? NA() : i + 1;
    },
  },
  // ------------------------------------------------------------------------------------------------ text
  CONCAT: {
    min: 1, max: 255, fn: a => {
      let s = "";
      const error = each(a, v => {
        const t = toStr(v);
        if (isFormulaError(t)) return t;
        s += t;
        return undefined;
      });
      return error ?? s;
    },
  },
  TEXTJOIN: {
    min: 3, max: 255, fn: a => {
      const delimiter = toStr(a[0]);
      if (isFormulaError(delimiter)) return delimiter;
      const ignore = toBool(a[1]);
      if (isFormulaError(ignore)) return ignore;
      const parts: string[] = [];
      const error = each(a.slice(2), v => {
        const t = toStr(v);
        if (isFormulaError(t)) return t;
        if (!ignore || t !== "") parts.push(t);
        return undefined;
      });
      return error ?? parts.join(delimiter);
    },
  },
  LEFT: { min: 1, max: 2, fn: (a, o) => leftRight(a, o, true) },
  RIGHT: { min: 1, max: 2, fn: (a, o) => leftRight(a, o, false) },
  MID: {
    min: 3, max: 3, fn: (a, o) => {
      const t = toStr(a[0]);
      if (isFormulaError(t)) return t;
      const x = nums(a.slice(1), o);
      if (isFormulaError(x)) return x;
      const [start, n] = [Math.trunc(x[0]), Math.trunc(x[1])];
      if (start < 1 || n < 0) return VALUE("MID: start must be ≥ 1 and the length ≥ 0");
      return t.substr(start - 1, n);
    },
  },
  LEN: textFn(t => t.length),
  FIND: { min: 2, max: 3, fn: (a, o) => findOrSearch(a, o, false) },
  SEARCH: { min: 2, max: 3, fn: (a, o) => findOrSearch(a, o, true) },
  SUBSTITUTE: {
    min: 3, max: 4, fn: (a, o) => {
      const t = toStr(a[0]);
      if (isFormulaError(t)) return t;
      const from = toStr(a[1]);
      if (isFormulaError(from)) return from;
      const to = toStr(a[2]);
      if (isFormulaError(to)) return to;
      if (from === "") return t;
      if (a.length < 4) return t.split(from).join(to);
      const nth = toNum(a[3], o);
      if (isFormulaError(nth)) return nth;
      if (nth < 1) return VALUE("SUBSTITUTE: the instance must be ≥ 1");
      let index = -1;
      for (let i = 0; i < Math.trunc(nth); i++) {
        index = t.indexOf(from, index + 1);
        if (index < 0) return t;
      }
      return t.slice(0, index) + to + t.slice(index + from.length);
    },
  },
  UPPER: textFn(t => t.toUpperCase()),
  LOWER: textFn(t => t.toLowerCase()),
  TRIM: textFn(t => t.replace(/ +/g, " ").trim()),
  VALUE: {
    min: 1, max: 1, fn: (a, o) => {
      const v = scalar(a[0]);
      if (typeof v === "boolean") return VALUE("VALUE of a boolean");
      if (typeof v === "string") {
        const iso = isoTextToSerial(v.trim());
        if (iso !== undefined) return iso;
      }
      const n = toNum(v, { isoDatesAsDates: o.isoDatesAsDates });
      return isFormulaError(n) ? n : num(n);
    },
  },
  TEXT: {
    min: 2, max: 2, fn: (a, o) => {
      const f = toStr(a[1]);
      return isFormulaError(f) ? f : formatText(a[0], f, o);
    },
  },
  // ------------------------------------------------------------------------------------------------ date
  TODAY: { min: 0, max: 0, volatile: true, fn: (_a, ctx) => new SheetDate(Math.floor(ctx.now())) },
  NOW: { min: 0, max: 0, volatile: true, fn: (_a, ctx) => new SheetDate(ctx.now()) },
  DATE: {
    min: 3, max: 3, fn: (a, o) => {
      const x = nums(a, o);
      if (isFormulaError(x)) return x;
      let y = Math.trunc(x[0]);
      if (y < 0 || y > 9999) return NUM("DATE: year out of range");
      if (y < 1900) y += 1900;
      // from the first of the month: days count over Excel's 1900-02-29 (DATE(1900,2,29) = 60)
      return dateResult(serialOf(y, Math.trunc(x[1]), 1) + Math.trunc(x[2]) - 1);
    },
  },
  YEAR: { min: 1, max: 1, fn: (a, o) => { const s = serialArg(a[0], o); return isFormulaError(s) ? s : partsOfSerial(s).y; } },
  MONTH: { min: 1, max: 1, fn: (a, o) => { const s = serialArg(a[0], o); return isFormulaError(s) ? s : partsOfSerial(s).m; } },
  DAY: { min: 1, max: 1, fn: (a, o) => { const s = serialArg(a[0], o); return isFormulaError(s) ? s : partsOfSerial(s).d; } },
  WEEKDAY: {
    min: 1, max: 2, fn: (a, o) => {
      const s = serialArg(a[0], o);
      if (isFormulaError(s)) return s;
      const t = a.length > 1 ? toNum(a[1], o) : 1;
      if (isFormulaError(t)) return t;
      const type = Math.trunc(t);
      const sunday0 = ((Math.floor(s) - 1) % 7 + 7) % 7; // 0 = Sunday (serial 1 is a Sunday in Excel)
      const monday0 = (sunday0 + 6) % 7;
      if (type === 1) return sunday0 + 1;
      if (type === 2) return monday0 + 1;
      if (type === 3) return monday0;
      if (type >= 11 && type <= 17) return ((monday0 - (type - 11)) % 7 + 7) % 7 + 1; // 11 = Monday … 17 = Sunday is 1
      return NUM("WEEKDAY: type must be 1, 2, 3 or 11–17");
    },
  },
  EOMONTH: {
    min: 2, max: 2, fn: (a, o) => {
      const s = serialArg(a[0], o);
      if (isFormulaError(s)) return s;
      const months = toNum(a[1], o);
      if (isFormulaError(months)) return months;
      const { y, m } = partsOfSerial(s);
      return dateResult(serialOf(y, m + Math.trunc(months) + 1, 0));
    },
  },
  DATEDIF: {
    min: 3, max: 3, fn: (a, o) => {
      const s = serialArg(a[0], o);
      if (isFormulaError(s)) return s;
      const e = serialArg(a[1], o);
      if (isFormulaError(e)) return e;
      const unit = toStr(a[2]);
      return isFormulaError(unit) ? unit : datedif(s, e, unit);
    },
  },
  // ------------------------------------------------------------------------------------------------ info
  ISBLANK: { min: 1, max: 1, acceptsErrors: true, fn: a => scalar(a[0]) === null },
  ISNUMBER: { min: 1, max: 1, acceptsErrors: true, fn: a => { const v = scalar(a[0]); return typeof v === "number" || isSheetDate(v); } },
  ISTEXT: { min: 1, max: 1, acceptsErrors: true, fn: a => typeof scalar(a[0]) === "string" },
  ISERROR: { min: 1, max: 1, acceptsErrors: true, fn: a => isFormulaError(scalar(a[0])) },
  ISNA: { min: 1, max: 1, acceptsErrors: true, fn: a => { const v = scalar(a[0]); return isFormulaError(v) && v.code === "#N/A"; } },
  NA: { min: 0, max: 0, fn: () => NA() },
};

/** AND/OR/XOR: booleans and numbers; text and blanks in ranges are skipped; no logical value at all → #VALUE!. */
function logical(args: SheetValue[], f: (bs: boolean[]) => boolean): SheetValue {
  const bs: boolean[] = [];
  const error = each<FormulaError>(args, (v, inRange) => {
    if (isFormulaError(v)) return v;
    if (typeof v === "boolean") bs.push(v);
    else if (typeof v === "number") bs.push(v !== 0);
    else if (isSheetDate(v)) bs.push(v.serial !== 0);
    else if (!inRange && typeof v === "string") {
      const b = toBool(v);
      if (isFormulaError(b)) return b;
      bs.push(b);
    }
    return undefined;
  });
  if (error) return error;
  return bs.length ? f(bs) : VALUE("No logical values");
}

function hvlookup(a: SheetValue[], o: ValueOptions, vertical: boolean): SheetValue {
  const table = asRange(a[1]);
  const index = toNum(a[2], o);
  if (isFormulaError(index)) return index;
  // 4th argument: TRUE/omitted = approximate; FALSE, 0 or blank (`VLOOKUP(x,t,2,)`) = exact
  const approx = a.length > 3 ? (a[3] === null ? false : toBool(a[3])) : true;
  if (isFormulaError(approx)) return approx;
  const i = Math.trunc(index);
  if (i < 1) return VALUE("The index must be ≥ 1");
  if (i > (vertical ? table.cols : table.rows)) return new FormulaError("#REF!", "The index is beyond the table");
  const keys = vertical ? column(table, 0) : row(table, 0);
  const lookup = scalar(a[0]);
  if (isFormulaError(lookup)) return lookup;
  const pos = approx ? approximate(keys, lookup) : findIndex(keys, lookupMatcher(lookup, true));
  if (pos < 0) return NA();
  return vertical ? table.get(pos, i - 1) : table.get(i - 1, pos);
}

function leftRight(a: SheetValue[], o: ValueOptions, left: boolean): SheetValue {
  const t = toStr(a[0]);
  if (isFormulaError(t)) return t;
  const n = a.length > 1 ? toNum(a[1], o) : 1;
  if (isFormulaError(n)) return n;
  if (n < 0) return VALUE("The number of characters must be ≥ 0");
  const k = Math.trunc(n);
  return left ? t.slice(0, k) : k === 0 ? "" : t.slice(-k);
}

function findOrSearch(a: SheetValue[], o: ValueOptions, search: boolean): SheetValue {
  const what = toStr(a[0]);
  if (isFormulaError(what)) return what;
  const within = toStr(a[1]);
  if (isFormulaError(within)) return within;
  const start = a.length > 2 ? toNum(a[2], o) : 1;
  if (isFormulaError(start)) return start;
  const from = Math.trunc(start);
  if (from < 1 || from > within.length + 1) return VALUE("The start is outside the text");
  if (!search) {
    const i = within.indexOf(what, from - 1);
    return i < 0 ? VALUE(`"${what}" not found`) : i + 1;
  }
  const i = searchGlob(compileGlob(what), within, from - 1);
  return i < 0 ? VALUE(`"${what}" not found`) : i + 1;
}

/**
 * The first position ≥ `from` where the pattern matches the text from there on (SEARCH: the pattern plus an implicit
 * trailing `*`), or -1. Linear in the text, not quadratic: the pattern is split into its star-free head and the rest
 * (from the first star on). Whether the rest matches from position k is monotone in k – a leading star absorbs any
 * extra characters – so the last such k is found once by binary search; then only the head is compared per position.
 */
function searchGlob(pattern: GlobToken[], text: string, from: number): number {
  const tokens: GlobToken[] = pattern.concat({ kind: "star" });
  const headLength = tokens.findIndex(t => t.kind === "star");
  const rest = tokens.slice(headLength);
  let lo = from + headLength;
  let hi = text.length;
  if (lo > hi || !globMatch(rest, text, lo)) return -1;
  while (lo < hi) { // the last k in [lo, hi] where the rest still matches
    const mid = Math.ceil((lo + hi) / 2);
    if (globMatch(rest, text, mid)) lo = mid;
    else hi = mid - 1;
  }
  const lastRestStart = lo;
  const lower = text.toLowerCase();
  for (let i = from; i + headLength <= lastRestStart; i++) {
    let k = 0;
    while (k < headLength) {
      const t = tokens[k] as { kind: "char"; ch: string } | { kind: "any" };
      if (t.kind === "char" && t.ch !== lower[i + k]) break;
      k++;
    }
    if (k === headLength) return i;
  }
  return -1;
}

/** The text of a number for messages and TEXT. */
export { numberToText };
