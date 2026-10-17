import { describe, expect, it } from 'vitest';
import { escapeHtml, parseHtmlTable, toHtmlTable } from '@guiexpert/table';

describe('clipboard HTML', () => {
  it('toHtmlTable escapes, keeps line breaks and numbers', () => {
    expect(toHtmlTable([[{ text: '<b>&"\'' }, { text: 'a\nb' }, { text: '1.5', num: 1.5 }, { text: 'x', num: Number.NaN }]]))
      .toBe('<meta charset="utf-8"><table><tbody><tr><td>&lt;b&gt;&amp;&quot;&#39;</td><td>a<br>b</td><td x:num="1.5">1.5</td><td>x</td></tr></tbody></table>');
    expect(escapeHtml('a<b')).toBe('a&lt;b');
  });

  it('parseHtmlTable reads cell texts: <br>, colspan, nbsp, nested tables, th; none without table', () => {
    expect(parseHtmlTable('<table><tr><th>h</th><td colspan="2">x</td></tr><tr><td>a<br>b</td><td>&nbsp;c&nbsp;</td></tr></table>'))
      .toEqual([['h', 'x', ''], ['a\nb', 'c', '']]);
    expect(parseHtmlTable('<table><tr><td>o<table><tr><td>i</td></tr></table></td></tr></table>')).toEqual([['oi']]);
    expect(parseHtmlTable('<p>no table</p>')).toEqual([]);
    expect(parseHtmlTable('<table><tr><td colspan="abc">a</td><td>b</td></tr><tr><td>c</td></tr></table>')).toEqual([['a', 'b'], ['c', '']]);
  });

  it('round trip with Excel-like HTML (x:num, styles)', () => {
    const html = '<html><head><style>td{color:red}</style></head><body><table><tr><td x:num="1234.5" style="mso-number-format:0.00">1,234.50</td></tr></table></body></html>';
    expect(parseHtmlTable(html)).toEqual([['1,234.50']]);
  });
});
