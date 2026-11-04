// Keyboard shortcuts per platform for browser specs (prompt 016).
//
// The core reads the platform from `navigator.platform` (contains "Mac" → ⌘ shortcuts, ⌥+letter types text; see
// src/lib/table/common/platform.ts). Two kinds of helpers:
//
// 1. The REAL platform of the test browser – for keys whose effect the browser itself decides (`userEvent.keyboard`
//    into an input: select all, end of line; the browser's copy command):
//
//      await userEvent.keyboard(userEventPrimary('a'));   // ⌘A on macOS, Ctrl+A elsewhere
//
// 2. A SIMULATED platform – so that every run (Linux CI and a Mac) checks the shortcuts of both:
//
//      it.each(PLATFORMS)('Ctrl/⌘+D fills down (%s)', async platform => {
//        mockPlatform(platform);                         // before mountTable: the ShortcutService reads it on init
//        keydown(host, 'd', keyInitOf(platform));
//      });
//
// Lives outside src/ on purpose: it must not end up in the npm package.
import { onTestFinished, vi } from 'vitest';

/** The two keyboard worlds of the table: macOS (⌘) and everything else (Ctrl). */
export type TestPlatform = 'mac' | 'other';

/** Both platforms, for `describe.each`. */
export const PLATFORMS: readonly TestPlatform[] = ['mac', 'other'];

// read once when the module loads – before any mockPlatform()
const REAL_IS_MAC = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform);

/** The test browser runs on macOS (same check as the core: `navigator.platform` contains "Mac"; not affected by mockPlatform). */
export function isMacPlatform(): boolean {
  return REAL_IS_MAC;
}

/** The platform of the browser that runs the test. */
export function realPlatform(): TestPlatform {
  return isMacPlatform() ? 'mac' : 'other';
}

/**
 * Lets the core see another platform (`navigator.platform` = "MacIntel" or "Win32") until the end of the current test
 * (restored with `onTestFinished`). Call it inside the test (or `beforeEach`) before the table is mounted – the
 * ShortcutService reads the platform once on init.
 */
export function mockPlatform(platform: TestPlatform) {
  const spy = vi.spyOn(navigator, 'platform', 'get').mockReturnValue(platform === 'mac' ? 'MacIntel' : 'Win32');
  onTestFinished(() => spy.mockRestore());
  return spy;
}

/** "Meta" (⌘) or "Control" – the modifier of copy, undo, fill … */
export function modifierOf(platform: TestPlatform): 'Meta' | 'Control' {
  return platform === 'mac' ? 'Meta' : 'Control';
}

/** `{ metaKey: true }` or `{ ctrlKey: true }` for `new KeyboardEvent(…)`. */
export function keyInitOf(platform: TestPlatform): KeyboardEventInit {
  return platform === 'mac' ? { metaKey: true } : { ctrlKey: true };
}

/** "Meta+D" or "Control+D" – as in `aria-keyshortcuts`. */
export function ariaShortcutOf(platform: TestPlatform, key: string): string {
  return `${modifierOf(platform)}+${key}`;
}

/** `userEvent.keyboard` text: the key with the platform's modifier held ("{Meta>}c{/Meta}"). */
export function userEventKeyOf(platform: TestPlatform, keys: string): string {
  const mod = modifierOf(platform);
  return `{${mod}>}${keys}{/${mod}}`;
}

/** The modifier of the real platform. */
export function primaryModifier(): 'Meta' | 'Control' {
  return modifierOf(realPlatform());
}

/** `{ metaKey: true }` or `{ ctrlKey: true }` on the real platform. */
export function primaryKeyInit(): KeyboardEventInit {
  return keyInitOf(realPlatform());
}

/** "Meta+D" or "Control+D" on the real platform. */
export function ariaShortcut(key: string): string {
  return ariaShortcutOf(realPlatform(), key);
}

/** `userEvent.keyboard` text with the real platform's modifier: ⌘A selects all of an input on macOS, Ctrl+A elsewhere. */
export function userEventPrimary(keys: string): string {
  return userEventKeyOf(realPlatform(), keys);
}

/** `userEvent.keyboard` text that moves the caret of an input to the end of the line (macOS: ⌘→, End scrolls). */
export function lineEndKeys(): string {
  return isMacPlatform() ? '{Meta>}{ArrowRight}{/Meta}' : '{End}';
}
