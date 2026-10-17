import type { FormulaBinaryOperator, FormulaNode, FormulaRefNode } from "./formula-ast.if";
import { columnIndexOfLetter, parseCellAddress, SHEET_MAX_ROWS } from "../sheet/cell-address";
import { FormulaSyntaxError, type FormulaToken, tokenize } from "./tokenizer";

// Not exported from index.ts: compileFormula() is the public entry.

/** The maximum length of a formula (characters). */
export const MAX_FORMULA_LENGTH = 10_000;

/** The maximum nesting depth (parentheses, function calls, unary operators). */
export const MAX_FORMULA_DEPTH = 64;

/** The maximum number of binary operators (a long chain is a deep tree, too). */
export const MAX_FORMULA_OPERATORS = 1000;

/** Binding power of the binary operators: comparison < & < + - < * / < ^ (right-associative, not in cell formulas). */
const BINARY: Record<string, { bp: number; right?: boolean; op: FormulaBinaryOperator }> = {
  "=": { bp: 10, op: "=" }, "==": { bp: 10, op: "=" },
  "<>": { bp: 10, op: "<>" }, "!=": { bp: 10, op: "<>" },
  "<": { bp: 10, op: "<" }, "<=": { bp: 10, op: "<=" }, ">": { bp: 10, op: ">" }, ">=": { bp: 10, op: ">=" },
  "&": { bp: 20, op: "&" },
  "+": { bp: 30, op: "+" }, "-": { bp: 30, op: "-" },
  "*": { bp: 40, op: "*" }, "/": { bp: 40, op: "/" },
  "^": { bp: 60, right: true, op: "^" },
};

/** Unary minus binds weaker than `^` (`-2^2 = -4`) and stronger than `*` (`-2*3 = -6`). */
const UNARY_BP = 50;

/** Cell formulas (Excel): negation binds stronger than `%` and `^` (`=-2^2` = 4), `%` stronger than `^`, `:` most. */
const SHEET_UNARY_BP = 75;
const PERCENT_BP = 70;
const RANGE_BP = 80;

/**
 * A Pratt parser (top-down operator precedence). Throws a {@link FormulaSyntaxError}; `compileFormula` turns it into
 * a `#ERROR!` value.
 */
class Parser {
  private index = 0;
  private depth = 0;
  private operators = 0;

  constructor(private readonly tokens: FormulaToken[], private readonly references = false) {
  }

  parse(): FormulaNode {
    if (this.peek().kind === "eof") {
      throw new FormulaSyntaxError("Empty formula", 0);
    }
    const node = this.expression(0);
    const rest = this.peek();
    if (rest.kind !== "eof") {
      throw new FormulaSyntaxError(`Unexpected "${rest.text}"`, rest.pos);
    }
    return node;
  }

  private peek(): FormulaToken {
    return this.tokens[this.index];
  }

  private next(): FormulaToken {
    return this.tokens[this.index++];
  }

  private enter(pos: number): void {
    if (++this.depth > MAX_FORMULA_DEPTH) {
      throw new FormulaSyntaxError(`Nested too deeply (more than ${MAX_FORMULA_DEPTH} levels)`, pos);
    }
  }

  private expression(minBp: number): FormulaNode {
    let left = this.prefix();
    for (;;) {
      const token = this.peek();
      if (token.kind !== "op") break;
      if (this.references && token.text === "%") {
        if (PERCENT_BP <= minBp) break;
        this.next();
        left = { kind: "unary", op: "%", operand: left };
        continue;
      }
      if (this.references && token.text === ":") {
        if (RANGE_BP <= minBp) break;
        this.next();
        left = this.range(left, token.pos);
        continue;
      }
      const info = BINARY[token.text];
      if (!info || info.bp <= minBp) break;
      this.next();
      if (++this.operators > MAX_FORMULA_OPERATORS) {
        throw new FormulaSyntaxError(`Too many operators (more than ${MAX_FORMULA_OPERATORS})`, token.pos);
      }
      this.enter(token.pos);
      // ^ is right-associative in column formulas (008) and left-associative in cell formulas (Excel: 2^3^2 = 64)
      const right = this.expression(info.right && !this.references ? info.bp - 1 : info.bp);
      this.depth--;
      left = { kind: "binary", op: info.op, left, right };
    }
    return left;
  }

  private prefix(): FormulaNode {
    const token = this.next();
    switch (token.kind) {
      case "number":
        if (this.references && this.peekRangeOp() && /^\d+$/.test(token.text)) {
          return this.rowRef(token.text, token.pos); // 3:3
        }
        return { kind: "literal", value: token.value as number };
      case "string":
        return { kind: "literal", value: token.text };
      case "field":
        return { kind: "field", name: token.text };
      case "error":
        return { kind: "error", code: token.text };
      case "op":
        if (token.text === "-" || token.text === "+") {
          this.enter(token.pos);
          const operand = this.expression(this.references ? SHEET_UNARY_BP : UNARY_BP);
          this.depth--;
          return { kind: "unary", op: token.text, operand };
        }
        throw new FormulaSyntaxError(`Unexpected "${token.text}"`, token.pos);
      case "(": {
        this.enter(token.pos);
        const inner = this.expression(0);
        this.depth--;
        this.expect(")", "Missing )");
        return inner;
      }
      case "ident":
        return this.identifier(token);
      case "eof":
        throw new FormulaSyntaxError("Unexpected end of formula", token.pos);
      default:
        throw new FormulaSyntaxError(`Unexpected "${token.text}"`, token.pos);
    }
  }

  private identifier(token: FormulaToken): FormulaNode {
    const name = token.text.toUpperCase();
    if (this.references && this.peek().kind !== "(") {
      if (name === "TRUE") return { kind: "literal", value: true };
      if (name === "FALSE") return { kind: "literal", value: false };
      const cell = parseCellAddress(token.text);
      if (cell) {
        return { kind: "ref", row: cell.row, col: cell.col, absRow: cell.absRow, absCol: cell.absCol };
      }
      if (this.peekRangeOp()) {
        const col = /^(\$?)([A-Za-z]{1,3})$/.exec(token.text);
        if (col && columnIndexOfLetter(col[2]) >= 0) {
          return { kind: "ref", row: -1, col: columnIndexOfLetter(col[2]), absRow: false, absCol: col[1] === "$" };
        }
        const row = /^\$(\d+)$/.exec(token.text);
        if (row) {
          return this.rowRef(row[1], token.pos, true);
        }
      }
      return { kind: "error", code: "#NAME?", message: `Unknown name "${token.text}"`, text: token.text };
    }
    if (this.references && name.includes("$")) {
      throw new FormulaSyntaxError(`Unexpected "${token.text}"`, token.pos);
    }
    if (this.peek().kind !== "(") {
      if (name === "TRUE") return { kind: "literal", value: true };
      if (name === "FALSE") return { kind: "literal", value: false };
      throw new FormulaSyntaxError(`Unknown name "${token.text}" – fields are written in brackets: [${token.text}]`, token.pos);
    }
    this.next(); // (
    this.enter(token.pos);
    const args: FormulaNode[] = [];
    if (this.peek().kind !== ")") {
      for (;;) {
        const next = this.peek().kind;
        // cell formulas: an empty argument is blank (`VLOOKUP(x,A:B,2,)` = exact match)
        args.push(this.references && (next === "," || next === ")") ? { kind: "literal", value: null } : this.expression(0));
        if (this.peek().kind === ",") {
          this.next();
          continue;
        }
        break;
      }
    }
    this.expect(")", `Missing ) after the arguments of ${name}`);
    this.depth--;
    return { kind: "call", name, args };
  }

  private peekRangeOp(): boolean {
    const t = this.peek();
    return t.kind === "op" && t.text === ":";
  }

  /** A whole row in a range (`3:3`, `$3:$5`). */
  private rowRef(digits: string, pos: number, abs = false): FormulaRefNode {
    const row = Number(digits) - 1;
    if (!(row >= 0 && row < SHEET_MAX_ROWS)) {
      throw new FormulaSyntaxError(`Invalid row "${digits}"`, pos);
    }
    return { kind: "ref", row, col: -1, absRow: abs, absCol: false };
  }

  /** The second part of a range: a cell, a whole column (`A`) or a whole row (`3`, `$3`). */
  private rangeOperand(): FormulaNode {
    const token = this.next();
    if (token.kind === "number" && /^\d+$/.test(token.text)) {
      return this.rowRef(token.text, token.pos);
    }
    if (token.kind === "ident") {
      const cell = parseCellAddress(token.text);
      if (cell) {
        return { kind: "ref", row: cell.row, col: cell.col, absRow: cell.absRow, absCol: cell.absCol };
      }
      const col = /^(\$?)([A-Za-z]{1,3})$/.exec(token.text);
      if (col && columnIndexOfLetter(col[2]) >= 0) {
        return { kind: "ref", row: -1, col: columnIndexOfLetter(col[2]), absRow: false, absCol: col[1] === "$" };
      }
      const row = /^\$(\d+)$/.exec(token.text);
      if (row) {
        return this.rowRef(row[1], token.pos, true);
      }
    }
    throw new FormulaSyntaxError("A range needs two cells, columns or rows (A1:B5, A:A, 3:3)", token.pos);
  }

  /** `from:to` – two cells, two whole columns or two whole rows; the corners are sorted. */
  private range(left: FormulaNode, pos: number): FormulaNode {
    const right = this.rangeOperand();
    if (left.kind !== "ref" || right.kind !== "ref") {
      throw new FormulaSyntaxError("A range needs two cells, columns or rows (A1:B5, A:A, 3:3)", pos);
    }
    const kind = (r: FormulaRefNode) => (r.row < 0 ? "col" : r.col < 0 ? "row" : "cell");
    if (kind(left) !== kind(right)) {
      throw new FormulaSyntaxError("A range needs two cells, columns or rows (A1:B5, A:A, 3:3)", pos);
    }
    const [r1, r2] = left.row <= right.row ? [left, right] : [right, left];
    const [c1, c2] = left.col <= right.col ? [left, right] : [right, left];
    return {
      kind: "range",
      from: { kind: "ref", row: r1.row, col: c1.col, absRow: r1.absRow, absCol: c1.absCol },
      to: { kind: "ref", row: r2.row, col: c2.col, absRow: r2.absRow, absCol: c2.absCol },
    };
  }

  private expect(kind: FormulaToken["kind"], message: string): void {
    const token = this.peek();
    if (token.kind !== kind) {
      throw new FormulaSyntaxError(message, token.pos);
    }
    this.next();
  }
}

/**
 * Parses a formula into an AST. Throws a {@link FormulaSyntaxError}. `references`: a cell formula with Excel's syntax
 * (cell references, ranges, `%`, `;`, Excel's precedence of the negation) – since 1.1.99.
 */
export function parseFormula(source: string, references = false): FormulaNode {
  if (source.length > MAX_FORMULA_LENGTH) {
    throw new FormulaSyntaxError(`Formula too long (more than ${MAX_FORMULA_LENGTH} characters)`, MAX_FORMULA_LENGTH);
  }
  return new Parser(tokenize(source, references), references).parse();
}
