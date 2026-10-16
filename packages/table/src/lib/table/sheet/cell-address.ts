/** Rows of a sheet (like Excel): 1 … 1 048 576. */
export const SHEET_MAX_ROWS = 1_048_576;

/** Columns of a sheet (like Excel): A … XFD = 16 384. */
export const SHEET_MAX_COLUMNS = 16_384;

/**
 * The letters of a column (0-based): 0 → `"A"`, 25 → `"Z"`, 26 → `"AA"`, 16 383 → `"XFD"`.
 *
 * @param {number} columnIndex - 0-based column
 * @returns {string} the letters (`""` for an index outside 0 … 16 383)
 *
 * @example
 * columnLetter(27);   // "AB"
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export function columnLetter(columnIndex: number): string {
  if (!Number.isInteger(columnIndex) || columnIndex < 0 || columnIndex >= SHEET_MAX_COLUMNS) {
    return "";
  }
  let s = "";
  let n = columnIndex + 1;
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

/**
 * The 0-based column of letters: `"A"` → 0, `"ab"` → 27 (case does not matter).
 *
 * @param {string} letters - column letters
 * @returns {number} the column, `-1` if invalid or beyond `XFD`
 *
 * @example
 * columnIndexOfLetter("XFD");   // 16383
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export function columnIndexOfLetter(letters: string): number {
  if (!/^[A-Za-z]{1,3}$/.test(letters)) {
    return -1;
  }
  let n = 0;
  for (const ch of letters.toUpperCase()) {
    n = n * 26 + (ch.charCodeAt(0) - 64);
  }
  return n - 1 < SHEET_MAX_COLUMNS ? n - 1 : -1;
}

/**
 * A parsed cell address: 0-based row and column, `$` = absolute.
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export interface CellAddressIf {
  row: number;
  col: number;
  absRow: boolean;
  absCol: boolean;
}

/**
 * The address of a cell: `toCellAddress(2, 1)` → `"B3"`, with `$` for absolute parts.
 *
 * @param {number} row - 0-based row
 * @param {number} col - 0-based column
 * @param {{ absRow?: boolean, absCol?: boolean }} [abs] - `$` before the row / column
 * @returns {string} the address, `"#REF!"` outside the sheet
 *
 * @example
 * toCellAddress(0, 5, { absRow: true, absCol: true });   // "$F$1"
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export function toCellAddress(row: number, col: number, abs: { absRow?: boolean; absCol?: boolean } = {}): string {
  const letters = columnLetter(col);
  if (!letters || !Number.isInteger(row) || row < 0 || row >= SHEET_MAX_ROWS) {
    return "#REF!";
  }
  return `${abs.absCol ? "$" : ""}${letters}${abs.absRow ? "$" : ""}${row + 1}`;
}

/**
 * Parses a cell address like `"B3"`, `"$B$3"`, `"b$3"`.
 *
 * @param {string} address - the address
 * @returns {CellAddressIf | undefined} row, column (0-based) and the absolute parts; `undefined` if invalid
 *
 * @example
 * parseCellAddress("$B3");   // { row: 2, col: 1, absRow: false, absCol: true }
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export function parseCellAddress(address: string): CellAddressIf | undefined {
  const m = /^(\$?)([A-Za-z]{1,3})(\$?)([1-9]\d{0,6})$/.exec(address.trim());
  if (!m) {
    return undefined;
  }
  const col = columnIndexOfLetter(m[2]);
  const row = Number(m[4]) - 1;
  if (col < 0 || row >= SHEET_MAX_ROWS) {
    return undefined;
  }
  return { row, col, absRow: m[3] === "$", absCol: m[1] === "$" };
}

/**
 * A parsed range: first and last cell (0-based, inclusive). A whole column (`"A:A"`) has the rows 0 … 1 048 575 and
 * `wholeColumns: true`, a whole row (`"3:3"`) the columns 0 … 16 383 and `wholeRows: true`.
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export interface RangeAddressIf {
  from: CellAddressIf;
  to: CellAddressIf;
  wholeColumns?: boolean;
  wholeRows?: boolean;
}

/**
 * Parses a range like `"A1:B5"`, `"$A$1:B5"`, `"A:A"`, `"B:D"`, `"3:3"` or a single cell `"C7"`. The corners are
 * sorted (`"B5:A1"` = `"A1:B5"`).
 *
 * @param {string} address - the range
 * @returns {RangeAddressIf | undefined} the range; `undefined` if invalid
 *
 * @example
 * parseRangeAddress("A:A")?.to.row;   // 1048575
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export function parseRangeAddress(address: string): RangeAddressIf | undefined {
  const text = address.trim();
  const parts = text.split(":");
  if (parts.length === 1) {
    const cell = parseCellAddress(text);
    return cell ? { from: cell, to: { ...cell } } : undefined;
  }
  if (parts.length !== 2) {
    return undefined;
  }
  const a = parseCellAddress(parts[0]);
  const b = parseCellAddress(parts[1]);
  if (a && b) {
    return {
      from: { row: Math.min(a.row, b.row), col: Math.min(a.col, b.col), absRow: a.absRow, absCol: a.absCol },
      to: { row: Math.max(a.row, b.row), col: Math.max(a.col, b.col), absRow: b.absRow, absCol: b.absCol },
    };
  }
  const colA = /^(\$?)([A-Za-z]{1,3})$/.exec(parts[0]);
  const colB = /^(\$?)([A-Za-z]{1,3})$/.exec(parts[1]);
  if (colA && colB) {
    const c1 = columnIndexOfLetter(colA[2]);
    const c2 = columnIndexOfLetter(colB[2]);
    if (c1 < 0 || c2 < 0) return undefined;
    return {
      from: { row: 0, col: Math.min(c1, c2), absRow: false, absCol: colA[1] === "$" },
      to: { row: SHEET_MAX_ROWS - 1, col: Math.max(c1, c2), absRow: false, absCol: colB[1] === "$" },
      wholeColumns: true,
    };
  }
  const rowA = /^(\$?)([1-9]\d{0,6})$/.exec(parts[0]);
  const rowB = /^(\$?)([1-9]\d{0,6})$/.exec(parts[1]);
  if (rowA && rowB) {
    const r1 = Number(rowA[2]) - 1;
    const r2 = Number(rowB[2]) - 1;
    if (r1 >= SHEET_MAX_ROWS || r2 >= SHEET_MAX_ROWS) return undefined;
    return {
      from: { row: Math.min(r1, r2), col: 0, absRow: rowA[1] === "$", absCol: false },
      to: { row: Math.max(r1, r2), col: SHEET_MAX_COLUMNS - 1, absRow: rowB[1] === "$", absCol: false },
      wholeRows: true,
    };
  }
  return undefined;
}
