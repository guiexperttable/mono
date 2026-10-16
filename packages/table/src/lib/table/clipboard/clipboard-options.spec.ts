import { describe, expect, it } from 'vitest';
import { ClipboardOptions, clipboardShortcutLayer } from '@guiexpert/table';

describe('ClipboardOptions.create', () => {
  it('off, defaults, overrides (undefined keeps the default)', () => {
    expect(ClipboardOptions.create()).toBeUndefined();
    expect(ClipboardOptions.create(false)).toBeUndefined();
    expect(ClipboardOptions.create(true)).toMatchObject({ copyHeaders: false, copyValue: 'text', html: true, pasteAddsRows: false, maxPasteCells: 1_000_000 });
    expect(ClipboardOptions.create({ copyHeaders: true, html: undefined })).toMatchObject({ copyHeaders: true, html: true });
  });
  it('the keys: ⌘ on macOS, Ctrl and the Insert keys on Windows', () => {
    expect(clipboardShortcutLayer(true)).toEqual({ 'meta+c': 'COPY_2_CLIPBOARD', 'meta+x': 'CUT_2_CLIPBOARD', 'meta+v': 'PASTE_FROM_CLIPBOARD' });
    expect(clipboardShortcutLayer(false)['shift+insert']).toBe('PASTE_FROM_CLIPBOARD');
  });
});
