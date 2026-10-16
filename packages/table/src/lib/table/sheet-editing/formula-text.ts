// DOM-free helpers of the formula input (prompt 013 stage 6): references in the text, insertion points, F4,
// function prefix and the call at the caret. Work on incomplete formulas ("=SUM(B2" while typing).
import { columnIndexOfLetter } from "../sheet/cell-address";

/** A reference in the formula text: position, text and the text without `$` in capitals (same reference = same color). */
export interface FormulaTextRefIf {
  readonly start: number;
  readonly end: number;
  readonly text: string;
  readonly key: string;
}

const CELL = String.raw`\$?[A-Za-z]{1,3}\$?[1-9][0-9]*`;
const REF = new RegExp(String.raw`(?:${CELL}(?::${CELL})?|\$?[A-Za-z]{1,3}:\$?[A-Za-z]{1,3}|\$?[0-9]+:\$?[0-9]+)`, "y");
const WORD_CHAR = /[A-Za-z0-9_.$]/;

/** Characters after which a reference or a function may be inserted (Excel's point mode). */
const INSERTION_CHARS = new Set(["=", "(", ",", ";", "+", "-", "*", "/", "^", "&", "<", ">"]); // not "%": postfix

/**
 * The references of a formula text (outside strings and `[field]`s), in order.
 *
 * @param {string} text - the editor text (with `=`)
 * @returns {FormulaTextRefIf[]} the references
 */
export function findReferences(text: string): FormulaTextRefIf[] {
  const ret: FormulaTextRefIf[] = [];
  if (!text.startsWith("=")) return ret;
  let i = 1;
  while (i < text.length) {
    const ch = text[i];
    if (ch === '"') {
      i = skipString(text, i);
      continue;
    }
    if (ch === "[") {
      const close = text.indexOf("]", i);
      i = close < 0 ? text.length : close + 1;
      continue;
    }
    if (WORD_CHAR.test(ch) && (i === 0 || !WORD_CHAR.test(text[i - 1]))) {
      REF.lastIndex = i;
      const m = REF.exec(text);
      const end = m ? i + m[0].length : -1;
      if (m && validColumns(m[0]) && (end >= text.length || (!WORD_CHAR.test(text[end]) && text[end] !== "(" && text[end] !== ":"))) {
        ret.push({ start: i, end, text: m[0], key: m[0].replace(/\$/g, "").toUpperCase() });
        i = end;
        continue;
      }
      while (i < text.length && WORD_CHAR.test(text[i])) i++;
      continue;
    }
    i++;
  }
  return ret;
}

/** Every column letter of a reference is inside the sheet (`XFE1` is a name, not a cell). */
function validColumns(ref: string): boolean {
  return (ref.match(/[A-Za-z]+/g) ?? []).every(letters => columnIndexOfLetter(letters) >= 0);
}

function skipString(text: string, i: number): number {
  let j = i + 1;
  while (j < text.length) {
    if (text[j] === '"') {
      if (text[j + 1] === '"') {
        j += 2;
        continue;
      }
      return j + 1;
    }
    j++;
  }
  return j;
}

/** True if `caret` is inside a literal: a string (also an unterminated one) or a field `[…]`. */
function inString(text: string, caret: number): boolean {
  let i = 1;
  while (i < caret) {
    if (text[i] === '"') {
      const end = skipString(text, i);
      const closed = end - 1 > i && text[end - 1] === '"';
      if (end > caret || (end === caret && !closed)) return true;
      i = end;
      continue;
    }
    if (text[i] === "[") {
      const close = text.indexOf("]", i);
      if (close < 0 || close >= caret) return true;
      i = close + 1;
      continue;
    }
    i++;
  }
  return false;
}

/**
 * True if a reference may be inserted at the caret: the text is a formula and the caret follows `=`, `(`, `,`, `;` or
 * an operator (spaces allowed) – not inside a string.
 *
 * @param {string} text - the editor text
 * @param {number} caret - the caret position
 * @returns {boolean} whether pointing inserts here
 */
export function isInsertionPoint(text: string, caret: number): boolean {
  if (caret < text.length && WORD_CHAR.test(text[caret])) return false; // in front of a word
  return followsInsertionChar(text, caret);
}

function followsInsertionChar(text: string, caret: number): boolean {
  if (!text.startsWith("=") || caret < 1 || inString(text, caret)) return false;
  let i = caret - 1;
  while (i > 0 && text[i] === " ") i--;
  return INSERTION_CHARS.has(text[i]);
}

/**
 * F4: the next `$` form of a reference – `A1` → `$A$1` → `A$1` → `$A1` → `A1`; a range changes both ends like its
 * first one. Whole columns/rows toggle their one `$` part.
 *
 * @param {string} ref - e.g. `"B2"`, `"$B$2:$B$4"`
 * @returns {string} the next form
 */
export function toggleAbsolute(ref: string): string {
  const parts = ref.split(":");
  const m = /^(\$?)([A-Za-z]*)(\$?)([0-9]*)$/.exec(parts[0]);
  if (!m) return ref;
  const state = (m[2] && m[4]) ? (m[1] ? (m[3] ? 1 : 3) : (m[3] ? 2 : 0)) : (m[1] || m[3] ? 1 : 0);
  // cells: 0 A1 → 1 $A$1 → 2 A$1 → 3 $A1 → 0; whole columns/rows: 0 ↔ 1
  const next = (m[2] && m[4]) ? (state + 1) % 4 : (state + 1) % 2;
  const absCol = next === 1 || next === 3;
  const absRow = next === 1 || next === 2;
  return parts.map(part => {
    const p = /^\$?([A-Za-z]*)\$?([0-9]*)$/.exec(part);
    if (!p) return part;
    const [, col, row] = p;
    if (col && row) return `${absCol ? "$" : ""}${col}${absRow ? "$" : ""}${row}`;
    return col ? `${next ? "$" : ""}${col}` : `${next ? "$" : ""}${row}`;
  }).join(":");
}

/**
 * The beginning of a function name the caret stands behind (`=SU|` → `"SU"`), `undefined` if there is none: it must
 * start at an insertion point, contain letters and not be a reference already followed by `(`.
 *
 * @param {string} text - the editor text
 * @param {number} caret - the caret position
 * @returns {{ start: number, prefix: string } | undefined} where the name starts and what was typed
 */
export function functionPrefixAt(text: string, caret: number): { start: number; prefix: string } | undefined {
  if (!text.startsWith("=") || inString(text, caret)) return undefined;
  if (caret < text.length && /[A-Za-z0-9_.(]/.test(text[caret])) return undefined;
  let start = caret;
  while (start > 1 && /[A-Za-z0-9_.]/.test(text[start - 1])) start--;
  const prefix = text.slice(start, caret);
  if (!/^[A-Za-z][A-Za-z0-9_.]*$/.test(prefix) || !followsInsertionChar(text, start)) return undefined;
  return { start, prefix };
}

/**
 * The innermost function call the caret is in and the index of its argument (`=SUM(1,|` → `{ name: "SUM", argument: 1 }`).
 *
 * @param {string} text - the editor text
 * @param {number} caret - the caret position
 * @returns {{ name: string, argument: number } | undefined} the call
 */
export function callAt(text: string, caret: number): { name: string; argument: number } | undefined {
  if (!text.startsWith("=")) return undefined;
  const stack: Array<{ name: string; argument: number }> = [];
  let i = 1;
  while (i < caret) {
    const ch = text[i];
    if (ch === '"') {
      const end = skipString(text, i);
      if (end > caret) return named(stack);
      i = end;
      continue;
    }
    if (ch === "[") {
      const close = text.indexOf("]", i);
      if (close < 0 || close >= caret) return named(stack);
      i = close + 1;
      continue;
    }
    if (ch === "(") {
      let s = i;
      while (s > 1 && /[A-Za-z0-9_.]/.test(text[s - 1])) s--;
      stack.push({ name: text.slice(s, i).toUpperCase(), argument: 0 });
    } else if (ch === ")") {
      stack.pop();
    } else if ((ch === "," || ch === ";") && stack.length) {
      stack[stack.length - 1].argument++;
    }
    i++;
  }
  return named(stack);
}

/** The innermost call with a name (`=SUM((A1,|` is inside SUM). */
function named(stack: Array<{ name: string; argument: number }>): { name: string; argument: number } | undefined {
  for (let i = stack.length - 1; i >= 0; i--) {
    if (stack[i].name) return stack[i];
  }
  return undefined;
}

/**
 * The arguments of a signature (`"SUM(number1, [number2], …)"` → `["number1", "[number2]", "…"]`).
 *
 * @param {string} signature - the signature
 * @returns {string[]} the arguments
 */
export function signatureArguments(signature: string): string[] {
  const open = signature.indexOf("(");
  const inner = signature.slice(open + 1, signature.lastIndexOf(")"));
  return inner.trim() ? inner.split(",").map(a => a.trim()) : [];
}
