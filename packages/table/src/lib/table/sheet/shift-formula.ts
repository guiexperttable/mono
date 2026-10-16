import type { FormulaNode, FormulaRefNode } from "../formula/formula-ast.if";
import { parseFormula } from "../formula/parser";
import { formatFormula } from "./format-formula";
import { SHEET_MAX_COLUMNS, SHEET_MAX_ROWS } from "./cell-address";

/**
 * A change of the sheet's structure that formulas must follow ({@link adjustFormula}): rows or columns inserted or
 * deleted at `at` (0-based, `count` of them), or cells moved (cut + paste).
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export type SheetStructureEditIf =
  | { kind: "insertRows" | "deleteRows" | "insertColumns" | "deleteColumns"; at: number; count: number }
  | { kind: "moveCells"; from: { r1: number; c1: number; r2: number; c2: number }; to: readonly [number, number] };

type Mapper = (node: FormulaNode) => FormulaNode | undefined;

/** Rebuilds an AST bottom-up; `map` may replace a ref/range node (undefined = keep). */
function transform(node: FormulaNode, map: Mapper): FormulaNode {
  switch (node.kind) {
    case "unary":
      return { ...node, operand: transform(node.operand, map) };
    case "binary":
      return { ...node, left: transform(node.left, map), right: transform(node.right, map) };
    case "call":
      return { ...node, args: node.args.map(a => transform(a, map)) };
    case "ref":
    case "range":
      return map(node) ?? node;
    default:
      return node;
  }
}

/**
 * Parses a formula text (without `=`), applies the mapper, formats it – unchanged if it cannot be parsed.
 * `keepUnchanged`: the original text when no reference changed (no rewrite of the user's spelling).
 */
function rewrite(source: string, map: Mapper, keepUnchanged = false): string {
  let ast: FormulaNode;
  try {
    ast = parseFormula(source, true);
  } catch {
    return source;
  }
  let changed = false;
  const result = transform(ast, node => {
    const mapped = map(node);
    if (mapped && formatFormula(mapped) !== formatFormula(node)) changed = true;
    return mapped;
  });
  return keepUnchanged && !changed ? source : formatFormula(result);
}

const REF_ERROR: FormulaNode = { kind: "error", code: "#REF!" };

function inSheet(row: number, col: number): boolean {
  return row < SHEET_MAX_ROWS && col < SHEET_MAX_COLUMNS && row >= -1 && col >= -1;
}

function moveRef(ref: FormulaRefNode, dRow: number, dCol: number, all: boolean): FormulaRefNode | undefined {
  const row = ref.row < 0 || (ref.absRow && !all) ? ref.row : ref.row + dRow;
  const col = ref.col < 0 || (ref.absCol && !all) ? ref.col : ref.col + dCol;
  if ((ref.row >= 0 && row < 0) || (ref.col >= 0 && col < 0) || !inSheet(row, col)) {
    return undefined;
  }
  return { ...ref, row, col };
}

function shiftAll(source: string, dRow: number, dCol: number, all: boolean): string {
  return rewrite(source, node => {
    if (node.kind === "ref") {
      return moveRef(node, dRow, dCol, all) ?? REF_ERROR;
    }
    if (node.kind === "range") {
      const from = moveRef(node.from, dRow, dCol, all);
      const to = moveRef(node.to, dRow, dCol, all);
      return from && to ? { kind: "range", from, to } : REF_ERROR;
    }
    return undefined;
  });
}

/**
 * A formula copied by `dRow` rows and `dCol` columns (fill handle, copy and paste): relative references move, `$`
 * parts stay; a reference that leaves the sheet becomes `#REF!`. Formula text without `=`.
 *
 * @param {string} source - the formula (without `=`)
 * @param {number} dRow - rows moved
 * @param {number} dCol - columns moved
 * @returns {string} the moved formula (canonical text)
 *
 * @example
 * shiftFormula("B2*C2+$F$1", 1, 0);   // "B3*C3+$F$1"
 * shiftFormula("A1", -1, 0);          // "#REF!"
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export function shiftFormula(source: string, dRow: number, dCol: number): string {
  return shiftAll(source, dRow, dCol, false);
}

/**
 * All references moved, also absolute ones – e.g. for an export whose cells start elsewhere (a header row above).
 *
 * @param {string} source - the formula (without `=`)
 * @param {number} dRow - rows
 * @param {number} dCol - columns
 * @returns {string} the formula
 *
 * @example
 * offsetReferences("$F$1*B2", 1, 0);   // "$F$2*B3"
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export function offsetReferences(source: string, dRow: number, dCol: number): string {
  return shiftAll(source, dRow, dCol, true);
}

/**
 * Inserting/deleting along one axis: the new position of an index, or undefined if deleted (or pushed off the sheet
 * of `max` rows/columns).
 */
function axis(at: number, count: number, insert: boolean, max: number) {
  return {
    point(i: number): number | undefined {
      if (i < 0) return i; // a whole row/column in a range: unchanged
      if (insert) return i < at ? i : i + count < max ? i + count : undefined;
      if (i >= at && i < at + count) return undefined;
      return i >= at + count ? i - count : i;
    },
    /** A span [a, b]: insert inside grows it, delete shrinks it; fully deleted → undefined. */
    span(a: number, b: number): [number, number] | undefined {
      if (a < 0) return [a, b];
      if (insert) {
        const na = a >= at ? a + count : a;
        if (na >= max) return undefined; // the whole span is pushed off the sheet
        return [na, Math.min(b >= at ? b + count : b, max - 1)]; // A1:A1048576 stays A1:A1048576
      }
      const end = at + count - 1;
      if (a >= at && b <= end) return undefined;
      const na = a < at ? a : a > end ? a - count : at;
      const nb = b < at ? b : b > end ? b - count : at - 1;
      return [na, nb];
    },
  };
}

/**
 * A formula after rows or columns were inserted or deleted, or cells moved (Excel's rules): references behind the
 * edit move, a range grows when rows are inserted inside it and shrinks when some of its rows are deleted; a deleted
 * reference (or a fully deleted range) becomes `#REF!`, as does one pushed off the sheet (a range ending at the last
 * row stays there). `moveCells`: references and ranges completely inside the moved cells follow them. Formula text
 * without `=`; unparsable text and formulas without a changed reference are returned unchanged (same spelling).
 *
 * @param {string} source - the formula (without `=`)
 * @param {SheetStructureEditIf} edit - the change
 * @returns {string} the adjusted formula
 *
 * @example
 * adjustFormula("SUM(D2:D4)+B3", { kind: "deleteRows", at: 2, count: 1 });   // "SUM(D2:D3)+#REF!"
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export function adjustFormula(source: string, edit: SheetStructureEditIf): string {
  if (edit.kind === "moveCells") {
    const { from, to } = edit;
    const dRow = to[0] - from.r1;
    const dCol = to[1] - from.c1;
    const inside = (r: FormulaRefNode) => r.row >= from.r1 && r.row <= from.r2 && r.col >= from.c1 && r.col <= from.c2;
    return rewrite(source, node => {
      if (node.kind === "ref" && inside(node)) {
        return { ...node, row: node.row + dRow, col: node.col + dCol };
      }
      if (node.kind === "range" && node.from.row >= 0 && node.from.col >= 0 && inside(node.from) && inside(node.to)) {
        return {
          kind: "range",
          from: { ...node.from, row: node.from.row + dRow, col: node.from.col + dCol },
          to: { ...node.to, row: node.to.row + dRow, col: node.to.col + dCol },
        };
      }
      return undefined;
    }, true);
  }
  const rows = edit.kind === "insertRows" || edit.kind === "deleteRows";
  const a = axis(edit.at, edit.count, edit.kind === "insertRows" || edit.kind === "insertColumns",
    rows ? SHEET_MAX_ROWS : SHEET_MAX_COLUMNS);
  return rewrite(source, node => {
    if (node.kind === "ref") {
      const p = a.point(rows ? node.row : node.col);
      if (p === undefined) return REF_ERROR;
      return rows ? { ...node, row: p } : { ...node, col: p };
    }
    if (node.kind === "range") {
      const span = rows ? a.span(node.from.row, node.to.row) : a.span(node.from.col, node.to.col);
      if (!span) return REF_ERROR;
      return rows
        ? { kind: "range", from: { ...node.from, row: span[0] }, to: { ...node.to, row: span[1] } }
        : { kind: "range", from: { ...node.from, col: span[0] }, to: { ...node.to, col: span[1] } };
    }
    return undefined;
  }, true);
}
