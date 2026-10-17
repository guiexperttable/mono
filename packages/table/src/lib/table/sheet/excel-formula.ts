import type { FormulaNode, FormulaRefNode } from "../formula/formula-ast.if";
import { parseFormula } from "../formula/parser";
import { formatFormula } from "./format-formula";

/** Functions newer than Excel 2007: in OOXML with the prefix `_xlfn.` (otherwise Excel shows `#NAME?`). */
const XLFN = new Set(["XLOOKUP", "IFS", "SWITCH", "TEXTJOIN", "CONCAT", "IFNA", "XOR"]);

/** Where the data of the sheet lie in the file: rows above, columns in front, and their number. */
export interface ExcelSheetPlacementIf {
  dRow: number;
  dCol: number;
  rows: number;
  cols: number;
}

/**
 * The formula of a cell formula for an Excel file: all references moved by the offset of the sheet (header rows,
 * leading columns – also absolute parts), whole columns/rows bounded to the data (the file holds headers and totals
 * around them), newer functions with `_xlfn.`. `undefined` for a formula Excel cannot read: a syntax error or a field
 * (`[price]`). Text without `=`.
 *
 * @param {string} input - the cell formula (with `=`)
 * @param {ExcelSheetPlacementIf} at - where the data are in the file
 * @returns {string | undefined} the Excel formula
 *
 * @internal
 */
export function toExcelFormula(input: string, at: ExcelSheetPlacementIf): string | undefined {
  let ast: FormulaNode;
  try {
    ast = parseFormula(input.slice(1), true);
  } catch {
    return undefined;
  }
  let valid = true;
  const ref = (r: FormulaRefNode, end: boolean): FormulaRefNode => ({
    ...r,
    row: r.row < 0 ? at.dRow + (end ? at.rows - 1 : 0) : r.row + at.dRow,
    col: r.col < 0 ? at.dCol + (end ? at.cols - 1 : 0) : r.col + at.dCol,
    absRow: r.row < 0 ? true : r.absRow,
    absCol: r.col < 0 ? true : r.absCol,
  });
  const walk = (n: FormulaNode): FormulaNode => {
    switch (n.kind) {
      case "field":
        valid = false;
        return n;
      case "ref":
        return ref(n, false);
      case "range":
        return { kind: "range", from: ref(n.from, false), to: ref(n.to, true) };
      case "unary":
        return { ...n, operand: walk(n.operand) };
      case "binary":
        return { ...n, left: walk(n.left), right: walk(n.right) };
      case "call":
        return { ...n, name: XLFN.has(n.name) ? `_xlfn.${n.name}` : n.name, args: n.args.map(walk) };
      default:
        return n;
    }
  };
  const moved = walk(ast);
  return valid ? formatFormula(moved) : undefined;
}
