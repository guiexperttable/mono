import type { FormulaNode, FormulaRefNode } from "../formula/formula-ast.if";
import { columnLetter, SHEET_MAX_COLUMNS, SHEET_MAX_ROWS } from "./cell-address";

/** Binding power for parentheses (as in the parser of cell formulas). */
const BP: Record<string, number> = {
  "=": 10, "<>": 10, "<": 10, "<=": 10, ">": 10, ">=": 10, "&": 20, "+": 30, "-": 30, "*": 40, "/": 40, "^": 60,
};

/** A reference as text: `B3`, `$B$3`; whole columns/rows in ranges. */
export function formatRef(ref: FormulaRefNode): string {
  if (ref.row < 0) {
    return `${ref.absCol ? "$" : ""}${columnLetter(ref.col)}`;
  }
  if (ref.col < 0) {
    return `${ref.absRow ? "$" : ""}${ref.row + 1}`;
  }
  if (ref.row >= SHEET_MAX_ROWS || ref.col >= SHEET_MAX_COLUMNS) {
    return "#REF!";
  }
  return `${ref.absCol ? "$" : ""}${columnLetter(ref.col)}${ref.absRow ? "$" : ""}${ref.row + 1}`;
}

function formatNumber(n: number): string {
  return String(n);
}

function node(n: FormulaNode, parentBp: number): string {
  switch (n.kind) {
    case "literal":
      if (n.value === null) return ""; // an empty argument
      if (typeof n.value === "string") return `"${n.value.replace(/"/g, '""')}"`;
      if (typeof n.value === "boolean") return n.value ? "TRUE" : "FALSE";
      return formatNumber(n.value);
    case "field":
      return `[${n.name}]`;
    case "ref":
      return formatRef(n);
    case "range":
      return `${formatRef(n.from)}:${formatRef(n.to)}`;
    case "error":
      return n.text ?? n.code; // an unknown name keeps its text (`=foo+1` stays `foo+1`)
    case "call":
      return `${n.name}(${n.args.map(a => node(a, 0)).join(",")})`;
    case "unary": {
      if (n.op === "%") {
        const inner = node(n.operand, 70);
        return `${inner}%`;
      }
      const inner = node(n.operand, 75);
      return `${n.op}${inner}`;
    }
    case "binary": {
      const bp = BP[n.op];
      // all operators are left-associative in cell formulas: the right operand needs parentheses at the same level
      const text = `${node(n.left, bp)}${n.op}${node(n.right, bp + 1)}`;
      return bp < parentBp ? `(${text})` : text;
    }
  }
}

/**
 * The canonical text of a formula AST (without `=`): functions and references in capitals, `,` between arguments,
 * texts with `""` for a quotation mark, parentheses only where needed. Used for moving formulas and the Excel export.
 *
 * @param {FormulaNode} ast - the syntax tree
 * @returns {string} the formula text
 *
 * @example
 * formatFormula({ kind: "binary", op: "*", left: { kind: "ref", row: 1, col: 1, absRow: false, absCol: false },
 *   right: { kind: "literal", value: 2 } });   // "B2*2"
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export function formatFormula(ast: FormulaNode): string {
  return node(ast, 0);
}
