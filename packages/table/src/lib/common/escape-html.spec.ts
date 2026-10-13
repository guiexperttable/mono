import { describe, expect, it } from 'vitest';
import { escapeHtml } from '@guiexpert/table';

describe('escapeHtml', () => {

  it('escapes the five HTML special characters', () => {
    expect(escapeHtml(`<a href="x" title='y'>Tom & Jerry</a>`))
      .toBe('&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;Tom &amp; Jerry&lt;/a&gt;');
  });

  it('escapes an existing entity again (the text is shown as typed)', () => {
    expect(escapeHtml('&amp;')).toBe('&amp;amp;');
  });

  it('leaves other text unchanged', () => {
    expect(escapeHtml('Grüße – 100 % ✓')).toBe('Grüße – 100 % ✓');
    expect(escapeHtml('')).toBe('');
  });

  it('turns null and undefined into an empty string', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });

  it('converts other values with String()', () => {
    expect(escapeHtml(0)).toBe('0');
    expect(escapeHtml(-1.5)).toBe('-1.5');
    expect(escapeHtml(false)).toBe('false');
    expect(escapeHtml({ toString: () => '<b>' })).toBe('&lt;b&gt;');
  });

  it('leaves no character that could end an attribute value or start a tag', () => {
    // the DOM check (an injected <img> is not created) is in renderer/renderer.browser.spec.ts and crud/crud.browser.spec.ts
    expect(escapeHtml(`"><img src=x onerror="alert(1)">'`)).not.toMatch(/["'<>]/);
  });
});
