import { FormulaError } from "./formula-error";

// Not exported from index.ts: used by the parser only.

/** The kinds of tokens of a formula. */
export type FormulaTokenKind = "number" | "string" | "field" | "ident" | "op" | "(" | ")" | "," | "eof";

/** One token: kind, text (number/string already decoded) and position in the source. */
export interface FormulaToken {
  readonly kind: FormulaTokenKind;
  readonly text: string;
  readonly value?: number;
  readonly pos: number;
}

/** Thrown by tokenizer and parser, caught by `compileFormula` – never leaves the formula module. */
export class FormulaSyntaxError extends Error {
  constructor(message: string, readonly pos: number) {
    super(message);
  }

  toFormulaError(): FormulaError {
    return new FormulaError("#ERROR!", `${this.message} (at ${this.pos + 1})`, this.pos);
  }
}

const OPERATORS = ["<=", ">=", "<>", "!=", "==", "+", "-", "*", "/", "^", "&", "=", "<", ">"];
const ESCAPES: Record<string, string> = { n: "\n", t: "\t", r: "\r", "\\": "\\", "\"": "\"", "'": "'" };

function isDigit(c: string): boolean {
  return c >= "0" && c <= "9";
}

function isIdentStart(c: string): boolean {
  return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c === "_";
}

function isIdentPart(c: string): boolean {
  return isIdentStart(c) || isDigit(c) || c === ".";
}

/**
 * Splits a formula into tokens. Whitespace is ignored. Throws a {@link FormulaSyntaxError} for an unknown character,
 * an unterminated string or field reference.
 */
export function tokenize(source: string): FormulaToken[] {
  const tokens: FormulaToken[] = [];
  const n = source.length;
  let i = 0;
  while (i < n) {
    const c = source[i];
    if (c === " " || c === "\t" || c === "\n" || c === "\r") {
      i++;
      continue;
    }
    const start = i;
    if (isDigit(c) || (c === "." && i + 1 < n && isDigit(source[i + 1]))) {
      while (i < n && isDigit(source[i])) i++;
      if (source[i] === ".") {
        i++;
        while (i < n && isDigit(source[i])) i++;
      }
      if (source[i] === "e" || source[i] === "E") {
        let j = i + 1;
        if (source[j] === "+" || source[j] === "-") j++;
        if (j < n && isDigit(source[j])) {
          i = j;
          while (i < n && isDigit(source[i])) i++;
        }
      }
      if (i < n && (isIdentStart(source[i]) || source[i] === ".")) {
        throw new FormulaSyntaxError(`Invalid number "${source.slice(start, i + 1)}"`, start);
      }
      const text = source.slice(start, i);
      tokens.push({ kind: "number", text, value: Number(text), pos: start });
      continue;
    }
    if (c === "\"" || c === "'") {
      i++;
      let text = "";
      let closed = false;
      while (i < n) {
        const d = source[i];
        if (d === "\\") {
          const e = source[i + 1];
          if (e === undefined) break;
          text += ESCAPES[e] ?? e;
          i += 2;
          continue;
        }
        if (d === c) {
          closed = true;
          i++;
          break;
        }
        text += d;
        i++;
      }
      if (!closed) {
        throw new FormulaSyntaxError("Unterminated text", start);
      }
      tokens.push({ kind: "string", text, pos: start });
      continue;
    }
    if (c === "[") {
      i++;
      let text = "";
      let closed = false;
      while (i < n) {
        const d = source[i];
        if (d === "\\" && i + 1 < n) {
          text += source[i + 1];
          i += 2;
          continue;
        }
        if (d === "]") {
          closed = true;
          i++;
          break;
        }
        if (d === "[") break;
        text += d;
        i++;
      }
      if (!closed) {
        throw new FormulaSyntaxError("Unterminated field reference, missing ]", start);
      }
      const name = text.trim();
      if (!name) {
        throw new FormulaSyntaxError("Empty field reference []", start);
      }
      tokens.push({ kind: "field", text: name, pos: start });
      continue;
    }
    if (isIdentStart(c)) {
      while (i < n && isIdentPart(source[i])) i++;
      tokens.push({ kind: "ident", text: source.slice(start, i), pos: start });
      continue;
    }
    if (c === "(" || c === ")" || c === ",") {
      tokens.push({ kind: c, text: c, pos: start });
      i++;
      continue;
    }
    const op = OPERATORS.find(o => source.startsWith(o, i));
    if (op) {
      tokens.push({ kind: "op", text: op, pos: start });
      i += op.length;
      continue;
    }
    throw new FormulaSyntaxError(`Unexpected character "${c}"`, start);
  }
  tokens.push({ kind: "eof", text: "", pos: n });
  return tokens;
}
