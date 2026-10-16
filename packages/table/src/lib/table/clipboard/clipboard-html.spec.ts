import { describe, expect, it } from 'vitest';
import { parseHtmlTable, toHtmlTable } from './clipboard-html';

describe('clipboard HTML in Node', () => {
  it('parseHtmlTable without DOMParser: []', () => {
    expect(typeof DOMParser).toBe('undefined');
    expect(parseHtmlTable('<table><tr><td>a</td></tr></table>')).toEqual([]);
  });
  it('toHtmlTable needs no DOM', () => {
    expect(toHtmlTable([])).toBe('<meta charset="utf-8"><table><tbody></tbody></table>');
  });
});
