/**
 * macOS or not – the one place where the table asks for the platform (⌘ shortcuts, ⌥+letter types text,
 * `aria-keyshortcuts`). Reads `navigator.platform` ("MacIntel", also iPadOS Safari with a keyboard); without a
 * `navigator` (SSR, Node) `false`. Tests switch the platform here with `vi.spyOn(navigator, "platform", "get")`.
 *
 * `navigator.userAgentData.platform` is not used on purpose: only Chromium has it, and the result would be the same.
 *
 * @internal
 */
export function isMacPlatform(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.platform === "string" && navigator.platform.indexOf("Mac") > -1;
}
