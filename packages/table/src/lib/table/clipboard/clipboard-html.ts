import { escapeHtml } from "../../common/escape-html";

/**
 * One cell for {@link toHtmlTable}: the shown text and – for numbers and dates – the number Excel and LibreOffice
 * take instead of the formatted text (`x:num`).
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export interface HtmlTableCellIf {
  text: string;
  num?: number;
}

/**
 * A cell matrix as HTML `<table>` for the clipboard (`text/html`): every text escaped, line breaks as `<br>`,
 * numbers with `x:num` (Excel keeps the number although the cell shows formatted text). DOM-free.
 *
 * @param {ReadonlyArray<ReadonlyArray<HtmlTableCellIf>>} matrix - rows of cells
 * @returns {string} the HTML
 *
 * @example
 * toHtmlTable([[{ text: "1,234.50 €", num: 1234.5 }]]);
 * // '<meta charset="utf-8"><table><tbody><tr><td x:num="1234.5">1,234.50 €</td></tr></tbody></table>'
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export function toHtmlTable(matrix: ReadonlyArray<ReadonlyArray<HtmlTableCellIf>>): string {
  const rows = matrix.map(row => "<tr>" + row.map(cell => {
    const num = cell.num !== undefined && Number.isFinite(cell.num) ? ` x:num="${cell.num}"` : "";
    return `<td${num}>${escapeHtml(cell.text).replace(/\r\n|\n|\r/g, "<br>")}</td>`;
  }).join("") + "</tr>");
  return `<meta charset="utf-8"><table><tbody>${rows.join("")}</tbody></table>`;
}

/**
 * The cell texts of the first `<table>` in clipboard HTML (Excel, Google Sheets). Parsed with `DOMParser` into an
 * inert document – no element of it is ever put into the page, no script runs, images do not load; only the text
 * of the cells is read (`<br>` = line break, `colspan` = empty cells, scripts and styles left out). Without a table or without `DOMParser`: `[]`.
 *
 * @param {string} html - the `text/html` content
 * @returns {string[][]} rows of cell texts, all of the same length
 *
 * @example
 * parseHtmlTable("<table><tr><td>a</td><td>1</td></tr></table>");   // [["a", "1"]]
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export function parseHtmlTable(html: string): string[][] {
  if (typeof DOMParser === "undefined") {
    return [];
  }
  const doc = new DOMParser().parseFromString(html, "text/html");
  const table = doc.querySelector("table");
  if (!table) {
    return [];
  }
  for (const el of Array.from(table.querySelectorAll("script, style, template, noscript"))) {
    el.remove(); // their text is no cell text
  }
  for (const br of Array.from(table.querySelectorAll("br"))) {
    br.replaceWith(doc.createTextNode("\n"));
  }
  const rows: string[][] = [];
  for (const tr of Array.from(table.querySelectorAll("tr"))) {
    if (tr.closest("table") !== table) continue; // a nested table
    const row: string[] = [];
    for (const cell of Array.from(tr.children)) {
      if (cell.tagName !== "TD" && cell.tagName !== "TH") continue;
      row.push(String(cell.textContent).replace(/ /g, " ").trim());
      const span = Math.min(1000, Math.max(1, Number(cell.getAttribute("colspan")) || 1));
      for (let i = 1; i < span; i++) row.push("");
    }
    rows.push(row);
  }
  const width = rows.reduce((max, r) => Math.max(max, r.length), 0);
  for (const r of rows) {
    while (r.length < width) r.push("");
  }
  return rows;
}
