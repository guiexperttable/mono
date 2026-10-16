/**
 * A node of a compiled formula (abstract syntax tree). Read-only; the evaluator walks it – no code is generated
 * (no `eval`, no `new Function`).
 *
 * Cell formulas (since 1.1.99, spreadsheet mode) add cell references (`ref`), ranges (`range`), error literals
 * (`error`, e.g. `#REF!` after deleting rows) and the percent operator (`unary` with `"%"`); the formulas of
 * calculated columns never contain them.
 *
 * @example
 * const ast = compileFormula("[price] * 2").ast;
 * // { kind: "binary", op: "*", left: { kind: "field", name: "price" }, right: { kind: "literal", value: 2 } }
 *
 * @since 1.1.95
 * @category Calculated columns & formulas
 */
export type FormulaNode =
  | { readonly kind: "literal"; readonly value: number | string | boolean | null }
  | { readonly kind: "field"; readonly name: string }
  | { readonly kind: "unary"; readonly op: "-" | "+" | "%"; readonly operand: FormulaNode }
  | { readonly kind: "binary"; readonly op: FormulaBinaryOperator; readonly left: FormulaNode; readonly right: FormulaNode }
  | { readonly kind: "call"; readonly name: string; readonly args: readonly FormulaNode[] }
  | FormulaRefNode
  | { readonly kind: "range"; readonly from: FormulaRefNode; readonly to: FormulaRefNode }
  | { readonly kind: "error"; readonly code: string; readonly message?: string; readonly text?: string };

/**
 * A cell reference of a cell formula: row and column 0-based (`B3` = row 2, column 1), `$` = absolute. In a range a
 * whole column (`A:A`) has `row: -1`, a whole row (`3:3`) has `col: -1`.
 *
 * @example
 * const ref: FormulaRefNode = { kind: "ref", row: 2, col: 1, absRow: true, absCol: false };   // B$3
 *
 * @since 1.1.99
 * @category Spreadsheet
 */
export interface FormulaRefNode {
  readonly kind: "ref";
  readonly row: number;
  readonly col: number;
  readonly absRow: boolean;
  readonly absCol: boolean;
}

/**
 * The binary operators of a formula: arithmetic (`+ - * / ^`), text concatenation (`&`) and comparisons
 * (`=`/`==`, `<>`/`!=`, `<`, `<=`, `>`, `>=`; normalized to `=` and `<>`).
 *
 * @example
 * const op: FormulaBinaryOperator = "&";   // "Total: " & [total]
 *
 * @since 1.1.95
 * @category Calculated columns & formulas
 */
export type FormulaBinaryOperator = "+" | "-" | "*" | "/" | "^" | "&" | "=" | "<>" | "<" | "<=" | ">" | ">=";
