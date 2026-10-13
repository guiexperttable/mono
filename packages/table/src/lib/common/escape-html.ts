const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/**
 * Escapes a value for HTML text and for (double or single quoted) HTML attribute values:
 * `&`, `<`, `>`, `"` and `'` become entities; `null` and `undefined` become an empty string.
 *
 * Use it whenever data (cell values, labels, ids from the server …) is written into `innerHTML` – otherwise a value
 * like `<img src=x onerror=alert(1)>` is executed as markup (HTML injection / XSS), and a `"` cuts an attribute value.
 *
 * @param {unknown} value - any value; it is converted with `String(value)`
 * @returns {string} the escaped text
 *
 * @example
 * // in a cell renderer
 * const cellDiv = document.createElement('div');
 * const cellValue = 'Tom & Jerry <3';
 * cellDiv.innerHTML = `<div class="my-label" title="${escapeHtml(cellValue)}">${escapeHtml(cellValue)}</div>`;
 *
 * @example
 * escapeHtml('<b>"Tom" & Jerry</b>'); // "&lt;b&gt;&quot;Tom&quot; &amp; Jerry&lt;/b&gt;"
 *
 * @category Utilities
 */
export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).replace(/[&<>"']/g, ch => HTML_ESCAPES[ch]!);
}
