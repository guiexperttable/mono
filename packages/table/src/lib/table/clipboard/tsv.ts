/**
 * Text of a cell matrix as tab-separated values (TSV) the way Excel and Google Sheets read it: cells separated by a
 * tab, rows by a line break; a cell with a tab, a line break or a quotation mark is put in quotation marks
 * (`"…"`), a quotation mark inside is doubled. DOM-free.
 *
 * @param {ReadonlyArray<ReadonlyArray<string>>} matrix - rows of cell texts
 * @returns {string} the TSV text (a line break at the end only if the last row is empty)
 *
 * @example
 * toTsv([["a", "b"], ["1", 'say "hi"']]);   // 'a\tb\n1\t"say ""hi"""'
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export function toTsv(matrix: ReadonlyArray<ReadonlyArray<string>>): string {
  const text = matrix.map(row => row.map(quoteTsvCell).join("\t")).join("\n");
  // an empty last row would vanish (one line break at the end is ignored when pasting): keep it with a line break
  const last = matrix[matrix.length - 1];
  return last && last.every(cell => cell === "") ? text + "\n" : text;
}

/** A cell for TSV: quoted if it contains a tab, a line break or a quotation mark. */
function quoteTsvCell(text: string): string {
  return /[\t\n\r"]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * Cell matrix of a TSV text from the clipboard (Excel, Google Sheets, LibreOffice, a text editor): line breaks
 * `\r\n`, `\n` or `\r`; a cell that starts with a quotation mark is quoted (`""` inside = one quotation mark, line
 * breaks and tabs inside belong to the cell); one line break at the end is ignored; a byte order mark is removed;
 * shorter rows are filled with `""`. DOM-free.
 *
 * @param {string} text - the clipboard text
 * @returns {string[][]} rows of cell texts, all of the same length; `[]` for `""`
 *
 * @example
 * parseTsv('a\t"x\ny"\r\n1\t2\r\n');   // [["a", "x\ny"], ["1", "2"]]
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export function parseTsv(text: string): string[][] {
  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1);
  }
  if (text === "") {
    return [];
  }
  const rows: string[][] = [];
  let row: string[] = [];
  let i = 0;
  const n = text.length;
  let endedWithBreak = false;
  while (i <= n) {
    let cell = "";
    if (text[i] === '"') {
      // quoted cell
      i++;
      for (;;) {
        if (i >= n) break;
        const ch = text[i];
        if (ch === '"') {
          if (text[i + 1] === '"') {
            cell += '"';
            i += 2;
            continue;
          }
          i++;
          break;
        }
        cell += ch;
        i++;
      }
      // text after the closing quotation mark (not Excel's own output): kept as it is
      while (i < n && text[i] !== "\t" && text[i] !== "\n" && text[i] !== "\r") {
        cell += text[i++];
      }
    } else {
      const start = i;
      while (i < n && text[i] !== "\t" && text[i] !== "\n" && text[i] !== "\r") i++;
      cell = text.slice(start, i);
    }
    row.push(cell);
    endedWithBreak = false;
    if (i >= n) {
      rows.push(row);
      break;
    }
    const sep = text[i];
    if (sep === "\t") {
      i++;
      if (i === n) {
        row.push(""); // a tab at the very end: one more empty cell
        rows.push(row);
        break;
      }
      continue;
    }
    // line break
    i += sep === "\r" && text[i + 1] === "\n" ? 2 : 1;
    rows.push(row);
    row = [];
    endedWithBreak = true;
    if (i >= n) {
      break;
    }
  }
  if (endedWithBreak && rows.length === 0) {
    rows.push([""]);
  }
  const width = rows.reduce((max, r) => Math.max(max, r.length), 0);
  for (const r of rows) {
    while (r.length < width) r.push("");
  }
  return rows;
}
