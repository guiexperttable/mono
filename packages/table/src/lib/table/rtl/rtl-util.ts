import { ResolvedTableDirection, TableDirection } from "./table-direction.type";

/**
 * Decides the direction of a table: `"rtl"` and `"ltr"` as given, `"auto"` from the computed `direction` of the host
 * (inherited from `<html dir="rtl">` or any parent) – for a host that is not in the document yet from the nearest
 * `dir` attribute of the host or a parent. Missing (`undefined`) = `"ltr"`.
 *
 * Must be called before the table sets the `dir` attribute of the host.
 *
 * @param {TableDirection | undefined} direction - the option ({@link TableOptionsIf.direction})
 * @param {HTMLElement} [host] - the host element of the table (needed for `"auto"`)
 * @returns {ResolvedTableDirection} `"ltr"` or `"rtl"`
 *
 * @example
 * resolveTableDirection("auto", document.getElementById("table")!); // "rtl" on a page with <html dir="rtl">
 *
 * @since 1.1.98
 * @category Utilities
 */
export function resolveTableDirection(direction: TableDirection | undefined, host?: HTMLElement): ResolvedTableDirection {
  if (direction === "rtl") {
    return "rtl";
  }
  if (direction !== "auto" || !host) {
    return "ltr";
  }
  if (host.isConnected && typeof getComputedStyle === "function") {
    const computed = getComputedStyle(host).direction;
    if (computed === "rtl" || computed === "ltr") {
      return computed;
    }
  }
  const dir = host.closest?.("[dir]")?.getAttribute("dir")?.toLowerCase();
  return dir === "rtl" ? "rtl" : "ltr";
}

/**
 * The horizontal scroll position of an element as distance from the **start** (≥ 0): in left-to-right `scrollLeft`,
 * in right-to-left `-scrollLeft` (browsers report 0 at the right start and negative values when scrolled to the left,
 * CSSOM View).
 *
 * @param {{ scrollLeft: number }} element - a scroll container
 * @param {boolean} rtl - the container is right-to-left
 * @returns {number} px from the start
 *
 * @example
 * const fromStart = getLogicalScrollLeft(tableApi.getTableScope().scrollViewport, tableApi.getDirection() === "rtl");
 *
 * @since 1.1.98
 * @category Utilities
 */
export function getLogicalScrollLeft(element: { scrollLeft: number }, rtl: boolean): number {
  const left = element.scrollLeft;
  return rtl ? Math.max(0, -left) : left;
}

/**
 * Sets the horizontal scroll position of an element as distance from the **start** (see {@link getLogicalScrollLeft}).
 *
 * @param {{ scrollLeft: number }} element - a scroll container
 * @param {number} x - px from the start
 * @param {boolean} rtl - the container is right-to-left
 *
 * @example
 * setLogicalScrollLeft(tableApi.getTableScope().scrollViewport, 0, true); // back to the (right) start
 *
 * @since 1.1.98
 * @category Utilities
 */
export function setLogicalScrollLeft(element: { scrollLeft: number }, x: number, rtl: boolean): void {
  element.scrollLeft = rtl ? -x : x;
}

/**
 * The horizontal scroll position for `element.scrollTo(…)` – physical, i.e. negative in right-to-left.
 *
 * @param {number} x - px from the start
 * @param {boolean} rtl - right-to-left
 * @returns {number} the value for `scrollLeft` / `scrollTo()`
 *
 * @example
 * tableApi.getTableScope().scrollViewport.scrollTo(toPhysicalScrollLeft(200, true), 0); // 200 px from the right start
 *
 * @since 1.1.98
 * @category Utilities
 */
export function toPhysicalScrollLeft(x: number, rtl: boolean): number {
  return rtl && x !== 0 ? -x : x;
}

/**
 * Whether a scroll container can still scroll horizontally by `dx` (physical: `dx > 0` = to the right) – for
 * left-to-right and right-to-left containers alike.
 *
 * @param {{ scrollLeft: number, scrollWidth: number, clientWidth: number }} element - a scroll container
 * @param {number} dx - physical delta (e.g. `WheelEvent.deltaX`)
 * @param {boolean} rtl - the container is right-to-left
 * @returns {boolean} true if a scroll by `dx` would move the content
 *
 * @example
 * host.addEventListener("wheel", e => {
 *   const takesIt = canScrollHorizontally(host, e.deltaX, getComputedStyle(host).direction === "rtl");
 *   console.info(takesIt ? "the element scrolls itself" : "pass it on");
 * });
 *
 * @since 1.1.98
 * @category Utilities
 */
export function canScrollHorizontally(
  element: { scrollLeft: number; scrollWidth: number; clientWidth: number },
  dx: number,
  rtl: boolean
): boolean {
  if (!dx) {
    return false;
  }
  const max = element.scrollWidth - element.clientWidth;
  if (max <= 1) {
    return false;
  }
  // physical position from the left edge: 0 … max (rtl: scrollLeft runs from 0 at the right to -max at the left)
  const fromLeft = rtl ? max + element.scrollLeft : element.scrollLeft;
  return dx > 0 ? fromLeft < max - 1 : fromLeft > 1;
}

/**
 * A client x coordinate (e.g. `PointerEvent.clientX`) as position in a box measured from the box's **start**:
 * left-to-right from its left edge, right-to-left from its right edge.
 *
 * @param {number} clientX - x in client (viewport) coordinates
 * @param {number} boxLeft - the left edge of the box in client coordinates
 * @param {number} boxWidth - the width of the box
 * @param {boolean} rtl - right-to-left
 * @returns {number} px from the start of the box
 *
 * @example
 * host.addEventListener("pointerdown", e => {
 *   const r = host.getBoundingClientRect();
 *   console.info(toLogicalX(e.clientX, r.left + host.clientLeft, host.clientWidth, true)); // px from the right edge
 * });
 *
 * @since 1.1.98
 * @category Utilities
 */
export function toLogicalX(clientX: number, boxLeft: number, boxWidth: number, rtl: boolean): number {
  return rtl ? boxLeft + boxWidth - clientX : clientX - boxLeft;
}

/**
 * Swaps the arrow keys "left" and "right" in a harmonized shortcut (e.g. `"cmd left"` → `"cmd right"`) – the
 * keyboard handling of a right-to-left table, so that → moves backwards in reading direction.
 *
 * @param {string} shortcut - a harmonized shortcut (`harmonizeShortcut`)
 * @returns {string} the shortcut with swapped arrow keys
 *
 * @example
 * mirrorArrowKeys("left");       // "right"
 * mirrorArrowKeys("cmd right");  // "cmd left"
 *
 * @since 1.1.98
 * @category Keyboard
 */
export function mirrorArrowKeys(shortcut: string): string {
  return shortcut
    .split(" ")
    .map(token => token === "left" ? "right" : token === "right" ? "left" : token)
    .join(" ");
}
