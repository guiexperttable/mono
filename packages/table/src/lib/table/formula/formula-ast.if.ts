/**
 * A node of a compiled formula (abstract syntax tree). Read-only; the evaluator walks it – no code is generated
 * (no `eval`, no `new Function`).
 *
 * @example
 * const ast = compileFormula("[price] * 2").ast;
 * // { kind: "binary", op: "*", left: { kind: "field", name: "price" }, right: { kind: "literal", value: 2 } }
 *
 * @since 1.1.95
 * @category Calculated columns & formulas
 */
export type FormulaNode =
  | { readonly kind: "literal"; readonly value: number | string | boolean }
  | { readonly kind: "field"; readonly name: string }
  | { readonly kind: "unary"; readonly op: "-" | "+"; readonly operand: FormulaNode }
  | { readonly kind: "binary"; readonly op: FormulaBinaryOperator; readonly left: FormulaNode; readonly right: FormulaNode }
  | { readonly kind: "call"; readonly name: string; readonly args: readonly FormulaNode[] };

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
