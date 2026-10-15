import type { FormulaBinaryOperator, FormulaNode } from "./formula-ast.if";
import { FormulaSyntaxError, type FormulaToken, tokenize } from "./tokenizer";

// Not exported from index.ts: compileFormula() is the public entry.

/** The maximum length of a formula (characters). */
export const MAX_FORMULA_LENGTH = 10_000;

/** The maximum nesting depth (parentheses, function calls, unary operators). */
export const MAX_FORMULA_DEPTH = 64;

/** The maximum number of binary operators (a long chain is a deep tree, too). */
export const MAX_FORMULA_OPERATORS = 1000;

/** Binding power of the binary operators: comparison < & < + - < * / < ^ (right-associative). */
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

/**
 * A Pratt parser (top-down operator precedence). Throws a {@link FormulaSyntaxError}; `compileFormula` turns it into
 * a `#ERROR!` value.
 */
class Parser {
  private index = 0;
  private depth = 0;
  private operators = 0;

  constructor(private readonly tokens: FormulaToken[]) {
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
      const info = BINARY[token.text];
      if (!info || info.bp <= minBp) break;
      this.next();
      if (++this.operators > MAX_FORMULA_OPERATORS) {
        throw new FormulaSyntaxError(`Too many operators (more than ${MAX_FORMULA_OPERATORS})`, token.pos);
      }
      this.enter(token.pos);
      const right = this.expression(info.right ? info.bp - 1 : info.bp);
      this.depth--;
      left = { kind: "binary", op: info.op, left, right };
    }
    return left;
  }

  private prefix(): FormulaNode {
    const token = this.next();
    switch (token.kind) {
      case "number":
        return { kind: "literal", value: token.value as number };
      case "string":
        return { kind: "literal", value: token.text };
      case "field":
        return { kind: "field", name: token.text };
      case "op":
        if (token.text === "-" || token.text === "+") {
          this.enter(token.pos);
          const operand = this.expression(UNARY_BP);
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
        args.push(this.expression(0));
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

  private expect(kind: FormulaToken["kind"], message: string): void {
    const token = this.peek();
    if (token.kind !== kind) {
      throw new FormulaSyntaxError(message, token.pos);
    }
    this.next();
  }
}

/** Parses a formula into an AST. Throws a {@link FormulaSyntaxError}. */
export function parseFormula(source: string): FormulaNode {
  if (source.length > MAX_FORMULA_LENGTH) {
    throw new FormulaSyntaxError(`Formula too long (more than ${MAX_FORMULA_LENGTH} characters)`, MAX_FORMULA_LENGTH);
  }
  return new Parser(tokenize(source)).parse();
}
