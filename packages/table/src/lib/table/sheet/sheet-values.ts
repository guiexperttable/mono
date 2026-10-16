import { FormulaError, isFormulaError } from "../formula/formula-error";

/**
 * A date in a cell formula: the Excel serial number (1900 date system: 1 = 1900-01-01, with Excel's 1900-02-29;
 * the fraction is the time of day). It counts as a number (arithmetic, `ISNUMBER`) and stays a date through `=A2`,
 * `IF`, lookups and date ± number; `MIN`/`MAX` and other arithmetic give a number (like Excel's values). The table
 * shows it as `Date`.
 *
 * @example
 * dateToSerial(new Date(2026, 9, 16));   // 46311
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export class SheetDate {
  /** Marker (works across copies of the core). */
  readonly type = "SheetDate";

  /** @param {number} serial - the Excel serial number */
  constructor(readonly serial: number) {
  }

  /** @returns {Date} the date (local time) */
  toDate(): Date {
    return serialToDate(this.serial);
  }
}

/**
 * True for a {@link SheetDate}.
 *
 * @param {unknown} v - any value
 * @returns {boolean} true for a sheet date
 *
 * @example
 * isSheetDate(new SheetDate(1));   // true
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export function isSheetDate(v: unknown): v is SheetDate {
  return !!v && typeof v === "object" && (v as { type?: unknown }).type === "SheetDate"
    && typeof (v as { serial?: unknown }).serial === "number";
}

const DAY_MS = 86_400_000;
/** 1899-12-30 (local): serial 0 for dates from 1900-03-01 on. */
const EPOCH = Date.UTC(1899, 11, 30);

/**
 * The Excel serial number of a date (local calendar date and time, no time zone shift – like Excel).
 *
 * @param {Date} date - a date
 * @returns {number} the serial number (`NaN` for an invalid date)
 *
 * @example
 * dateToSerial(new Date(1900, 0, 1));   // 1
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export function dateToSerial(date: Date): number {
  const t = date.getTime();
  if (Number.isNaN(t)) {
    return NaN;
  }
  const utc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(),
    date.getSeconds(), date.getMilliseconds());
  let serial = (utc - EPOCH) / DAY_MS;
  if (serial < 61) {
    serial -= 1; // before 1900-03-01: Excel counts the non-existent 1900-02-29
  }
  return serial;
}

/**
 * The date of an Excel serial number (local time); serial 60 (Excel's 1900-02-29) becomes 1900-03-01.
 *
 * @param {number} serial - the serial number
 * @returns {Date} the date
 *
 * @example
 * serialToDate(46311);   // 2026-10-16 00:00 local
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export function serialToDate(serial: number): Date {
  const s = serial < 60 ? serial + 1 : serial >= 60 && serial < 61 ? 61 + (serial - 60) : serial;
  const utc = new Date(EPOCH + Math.round(s * DAY_MS));
  return new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate(), utc.getUTCHours(), utc.getUTCMinutes(),
    utc.getUTCSeconds(), utc.getUTCMilliseconds());
}

/** The serial of a calendar date like Excel's DATE (months and days may overflow). */
export function serialOf(year: number, month: number, day: number): number {
  return dateToSerial(new Date(year, month - 1, day));
}

/** Year, month (1–12), day of a serial number. */
export function partsOfSerial(serial: number): { y: number; m: number; d: number } {
  if (Math.floor(serial) === 60) {
    return { y: 1900, m: 2, d: 29 }; // Excel's leap year bug
  }
  const date = serialToDate(Math.floor(serial));
  return { y: date.getFullYear(), m: date.getMonth() + 1, d: date.getDate() };
}

/**
 * A rectangle of cells passed to a function (`SUM(A1:B5)`): read lazily, row by row.
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export class FormulaRange {
  /** Marker (works across copies of the core). */
  readonly type = "FormulaRange";

  /**
   * @param {number} row - first row (0-based)
   * @param {number} col - first column
   * @param {number} rows - number of rows (cut at the rows of the data)
   * @param {number} cols - number of columns
   * @param {(row: number, col: number) => SheetValue} read - reads a cell (sheet coordinates)
   */
  constructor(readonly row: number, readonly col: number, readonly rows: number, readonly cols: number,
              private readonly read: (row: number, col: number) => SheetValue) {
  }

  /**
   * The value at a position inside the range.
   *
   * @param {number} r - row inside the range (0-based)
   * @param {number} c - column inside the range
   * @returns {SheetValue} the value (blank = `null`)
   */
  get(r: number, c: number): SheetValue {
    if (r < 0 || c < 0 || r >= this.rows || c >= this.cols) {
      return null; // outside the range: never read (it is no dependency of the formula)
    }
    return this.read(this.row + r, this.col + c);
  }

  /** @returns {SheetValue[]} all values, row by row */
  values(): SheetValue[] {
    const ret: SheetValue[] = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) ret.push(this.get(r, c));
    }
    return ret;
  }
}

/**
 * True for a {@link FormulaRange}.
 *
 * @param {unknown} v - any value
 * @returns {boolean} true for a range
 *
 * @example
 * if (isFormulaRange(arg)) console.log(arg.rows, arg.cols);
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export function isFormulaRange(v: unknown): v is FormulaRange {
  return !!v && typeof v === "object" && (v as { type?: unknown }).type === "FormulaRange";
}

/**
 * A value inside a cell formula: number, text, boolean, blank (`null`), error, date or – only as argument – a range.
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export type SheetValue = number | string | boolean | null | FormulaError | SheetDate | FormulaRange;

/** Rounds to 15 significant digits like Excel (`0.1 + 0.2` = `0.3`); -0 → 0. */
export function round15(n: number): number {
  if (n === 0 || !Number.isFinite(n)) return n === 0 ? 0 : n;
  const r = Number(n.toPrecision(15));
  return r === 0 ? 0 : r;
}

/** A number result: not finite → #NUM!, rounded to 15 digits. */
export function num(n: number): number | FormulaError {
  if (!Number.isFinite(n)) {
    return new FormulaError("#NUM!", "The result is not a finite number");
  }
  return round15(n);
}

const NUMBER_TEXT = /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?$/;

/** The serial number of ISO text (`2026-10-16`, with time), `undefined` if it is none. */
export function isoTextToSerial(text: string): number | undefined {
  const m = ISO_DATE.exec(text);
  if (!m) return undefined;
  const date = new Date(+m[1], +m[2] - 1, +m[3], +(m[4] ?? 0), +(m[5] ?? 0), +(m[6] ?? 0));
  if (date.getMonth() !== +m[2] - 1) return undefined;
  return dateToSerial(date);
}

/** Options the conversions need. */
export interface ValueOptions {
  isoDatesAsDates: boolean;
}

/** A value of the data as sheet value: `Date` → {@link SheetDate}, objects → #VALUE!, `NaN` → blank. */
export function fromCellData(v: unknown): SheetValue {
  if (v === null || v === undefined) return null;
  switch (typeof v) {
    case "number":
      return Number.isNaN(v) ? null : v;
    case "string":
      return v;
    case "boolean":
      return v;
    case "bigint":
      return Number(v);
  }
  if (isFormulaError(v) || isSheetDate(v)) return v;
  if (v instanceof Date) {
    const s = dateToSerial(v);
    return Number.isNaN(s) ? null : new SheetDate(s);
  }
  return new FormulaError("#VALUE!", "The cell holds no number, text or boolean");
}

/** A scalar (a range → #VALUE! – no implicit intersection). */
export function scalar(v: SheetValue): Exclude<SheetValue, FormulaRange> {
  if (isFormulaRange(v)) {
    if (v.rows === 1 && v.cols === 1) return scalar(v.get(0, 0));
    return new FormulaError("#VALUE!", "A range where one value is expected");
  }
  return v;
}

/** A value as number for arithmetic: blank 0, TRUE 1, numeric text, ISO date text (option), date serial. */
export function toNum(v: SheetValue, o: ValueOptions): number | FormulaError {
  const s = scalar(v);
  if (typeof s === "number") return s;
  if (s === null || s === "") return 0;
  if (typeof s === "boolean") return s ? 1 : 0;
  if (isSheetDate(s)) return s.serial;
  if (typeof s === "string") {
    const t = s.trim();
    if (NUMBER_TEXT.test(t)) {
      const n = Number(t);
      if (Number.isFinite(n)) return n;
    }
    if (t.endsWith("%") && NUMBER_TEXT.test(t.slice(0, -1).trim())) {
      return Number(t.slice(0, -1).trim()) / 100;
    }
    if (o.isoDatesAsDates) {
      const serial = isoTextToSerial(t);
      if (serial !== undefined) return serial;
    }
    return new FormulaError("#VALUE!", `"${s.length > 40 ? s.slice(0, 40) + "…" : s}" is not a number`);
  }
  return s; // error
}

/** A number as text like Excel's general format: 15 significant digits, exponent from 1E+21 on. */
export function numberToText(n: number): string {
  const r = round15(n);
  const abs = Math.abs(r);
  if (abs !== 0 && (abs >= 1e15 || abs < 1e-9)) {
    return r.toExponential().replace("e", "E");
  }
  return String(r);
}

/** A value as text: numbers in general format, TRUE/FALSE, a date as its serial number (like Excel). */
export function toStr(v: SheetValue): string | FormulaError {
  const s = scalar(v);
  if (typeof s === "string") return s;
  if (s === null) return "";
  if (typeof s === "number") return numberToText(s);
  if (typeof s === "boolean") return s ? "TRUE" : "FALSE";
  if (isSheetDate(s)) return numberToText(s.serial);
  return s;
}

/** A value as boolean: numbers ≠ 0, "TRUE"/"FALSE", blank FALSE. */
export function toBool(v: SheetValue): boolean | FormulaError {
  const s = scalar(v);
  if (typeof s === "boolean") return s;
  if (s === null || s === "") return false;
  if (typeof s === "number") return s !== 0;
  if (isSheetDate(s)) return s.serial !== 0;
  if (typeof s === "string") {
    const u = s.trim().toUpperCase();
    if (u === "TRUE") return true;
    if (u === "FALSE") return false;
    return new FormulaError("#VALUE!", `"${s.length > 40 ? s.slice(0, 40) + "…" : s}" is not TRUE or FALSE`);
  }
  return s;
}

/** The type order of Excel's comparison: number < text < boolean. */
function rank(v: SheetValue): number {
  if (typeof v === "string") return 1;
  if (typeof v === "boolean") return 2;
  return 0;
}

/**
 * Compares like Excel: numbers (and dates) numerically (15 digits), texts case-insensitively, different types by type
 * (number < text < boolean, `"3" = 3` is FALSE); blank is 0, `""` or FALSE – whatever the other side is.
 */
export function compareSheet(a: SheetValue, b: SheetValue): number | FormulaError {
  let x = scalar(a);
  let y = scalar(b);
  if (isFormulaError(x)) return x;
  if (isFormulaError(y)) return y;
  if (isSheetDate(x)) x = x.serial;
  if (isSheetDate(y)) y = y.serial;
  if (x === null && y === null) return 0;
  if (x === null) x = typeof y === "string" ? "" : typeof y === "boolean" ? false : 0;
  if (y === null) y = typeof x === "string" ? "" : typeof x === "boolean" ? false : 0;
  const rx = rank(x);
  const ry = rank(y);
  if (rx !== ry) return rx - ry;
  if (typeof x === "number" && typeof y === "number") {
    const d = round15(x) - round15(y);
    return d === 0 ? 0 : d < 0 ? -1 : 1;
  }
  if (typeof x === "string" && typeof y === "string") {
    const p = x.toLowerCase();
    const q = y.toLowerCase();
    return p < q ? -1 : p > q ? 1 : 0;
  }
  return (x ? 1 : 0) - (y ? 1 : 0);
}

/** True for blank and `""`. */
export function isEmpty(v: SheetValue): boolean {
  return v === null || v === "";
}

/** A sheet value for the table: SheetDate → Date, ranges → #VALUE!. */
export function toExternal(v: SheetValue): unknown {
  if (isSheetDate(v)) return v.toDate();
  if (isFormulaRange(v)) return scalar(v);
  return v;
}
