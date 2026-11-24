import type { TableScope } from "../table-scope";

/** Why a {@link FilterPopupShell} was closed. @category Internals @since 1.1.114 */
export type FilterPopupCloseReason = "action" | "cancel" | "escape" | "outside" | "scroll" | "resize" | "api" | "destroy";

export interface FilterPopupOpenOptionsIf {
  /** Accessible name of the `role="dialog"` container. */
  ariaLabel: string;
  /** Extra CSS class(es) added to the popup container. */
  className?: string;
  /** Anchor rectangle in viewport coordinates (`getBoundingClientRect()`). */
  anchorRect: DOMRect | { left: number; right: number; top: number; bottom: number; width: number; height: number };
  /** Optional trigger element whose click opened the popup (ignored for immediate outside-dismiss). */
  triggerEl?: Element | null;
  /**
   * Recognizes the trigger when `triggerEl` was replaced meanwhile (header cells are rebuilt on every render):
   * a press on such an element is not "outside".
   */
  isTrigger?: (el: HTMLElement) => boolean;
  /** Called once when the popup closes. */
  onClose?: (reason: FilterPopupCloseReason) => void;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function supportsNativePopover(el: HTMLElement): boolean {
  return (
    typeof HTMLElement !== "undefined"
    && Object.prototype.hasOwnProperty.call(HTMLElement.prototype, "popover")
    && typeof (el as HTMLElement & { showPopover?: () => void }).showPopover === "function"
  );
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const nodes = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
  const out: HTMLElement[] = [];
  for (let i = 0; i < nodes.length; i++) {
    const el = nodes[i];
    if (!el.hidden && el.offsetParent !== null) {
      out.push(el);
    }
  }
  return out;
}

/**
 * Top-layer popup shell shared by the per-column filter menu (Part C) and the column chooser (Part D).
 *
 * Uses the native Popover API (`popover="manual"` inside `hostElement`, so the popup stays visible in
 * `hostElement.requestFullscreen()`, is never clipped by `overflow: hidden` and inherits `--ge-table-*` and `dir`
 * even inside a Shadow DOM) with a `document.body` + `position: fixed` fallback for older browsers.
 *
 * @category Internals
 * @since 1.1.114
 */
export class FilterPopupShell {

  private el?: HTMLDivElement;
  private usingPopover = false;
  private abortController?: AbortController;
  private onCloseCb?: (reason: FilterPopupCloseReason) => void;
  private lastAnchorRect?: FilterPopupOpenOptionsIf["anchorRect"];

  constructor(private readonly scope: TableScope) {}

  isOpen(): boolean {
    return this.el !== undefined;
  }

  getElement(): HTMLDivElement | undefined {
    return this.el;
  }

  /** True if a DOM event originated inside this popup (via `composedPath()`, safe across Shadow DOM). */
  isInPopup(evt: Event): boolean {
    const el = this.el;
    if (!el) {
      return false;
    }
    const path = evt.composedPath?.();
    if (path?.length) {
      return path.includes(el);
    }
    return evt.target instanceof Node && el.contains(evt.target);
  }

  /**
   * Opens the popup (closing any previous instance first) and returns its empty container `<div>` so the caller can
   * populate its content before calling {@link reposition} and {@link focusInitial}.
   */
  open(options: FilterPopupOpenOptionsIf): HTMLDivElement {
    if (this.el) {
      this.close("api");
    }

    const host = this.scope.hostElement;
    const doc = host.ownerDocument;
    const win = doc.defaultView ?? window;
    const ds = this.scope.getDomService().domService;

    const el = ds.createElement<HTMLDivElement>("div");
    ds.addClass(el, "ge-table-filter-popup");
    if (options.className) {
      for (const cls of options.className.split(/\s+/).filter(Boolean)) {
        ds.addClass(el, cls);
      }
    }
    ds.setAttribute(el, "role", "dialog");
    ds.setAttribute(el, "aria-modal", "false");
    ds.setAttribute(el, "aria-label", options.ariaLabel);
    ds.setAttribute(el, "tabindex", "-1");
    ds.setAttribute(el, "dir", this.scope.direction);

    // Mount outside the role="grid" host (in fullscreenElement if fullscreen, ShadowRoot if in shadow DOM,
    // otherwise document.body) so role="dialog" is never an illegal direct child of role="grid" (WAI-ARIA / axe)
    // while still staying in the top layer and visible inside requestFullscreen() & Shadow DOM.
    const root = host.getRootNode?.();
    const fullscreenEl = doc.fullscreenElement;
    const mountParent: Node =
      fullscreenEl && (fullscreenEl === host || fullscreenEl.contains(host))
        ? fullscreenEl
        : (typeof ShadowRoot !== "undefined" && root instanceof ShadowRoot ? root : doc.body);

    const nativePopover = supportsNativePopover(el);
    this.usingPopover = nativePopover;
    if (nativePopover) {
      // Always use setAttribute (not IDL property) per modern web guidance
      ds.setAttribute(el, "popover", "manual");
      mountParent.appendChild(el);
    } else {
      ds.addClass(el, "ge-table-filter-popup-fallback");
      mountParent.appendChild(el);
    }

    this.el = el;
    this.onCloseCb = options.onClose;
    this.lastAnchorRect = options.anchorRect;

    if (nativePopover) {
      try {
        (el as HTMLDivElement & { showPopover(): void }).showPopover();
      } catch {
        // Fallback if host is not connected or popover call fails
        this.usingPopover = false;
        ds.removeAttribute?.(el, "popover");
        ds.addClass(el, "ge-table-filter-popup-fallback");
        if (el.parentNode !== mountParent) {
          mountParent.appendChild(el);
        }
      }
    }

    const ac = new AbortController();
    this.abortController = ac;
    const signal = ac.signal;

    // Focus trap & Escape
    el.addEventListener("keydown", (evt: KeyboardEvent) => {
      if (evt.key === "Escape") {
        evt.preventDefault();
        this.close("escape");
        return;
      }
      if (evt.key === "Tab") {
        const focusables = getFocusableElements(el);
        if (focusables.length === 0) {
          evt.preventDefault();
          el.focus();
          return;
        }
        const root = el.getRootNode?.() as Document | ShadowRoot | undefined;
        const active = root && "activeElement" in root ? root.activeElement : doc.activeElement;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (evt.shiftKey) {
          if (active === first || active === el || !el.contains(active)) {
            evt.preventDefault();
            last.focus();
          }
        } else if (active === last || !el.contains(active)) {
          evt.preventDefault();
          first.focus();
        }
      }
    }, { signal });

    // Outside dismiss: require both pointerdown and pointerup outside the popup
    // so dragging a text selection inside the popup and releasing outside does not dismiss it.
    let pressedOutside = false;
    const isOutside = (evt: Event): boolean => {
      const path = evt.composedPath?.();
      if (path?.length) {
        if (path.includes(el)) return false;
        if (options.triggerEl && path.includes(options.triggerEl)) return false;
        if (options.isTrigger) {
          for (let i = 0; i < path.length; i++) {
            const node = path[i];
            if (node instanceof HTMLElement && options.isTrigger(node)) return false;
          }
        }
        return true;
      }
      const target = evt.target as Node | null;
      if (!target) return true;
      if (el.contains(target)) return false;
      if (options.triggerEl && options.triggerEl.contains(target)) return false;
      return true;
    };

    doc.addEventListener("pointerdown", (evt: PointerEvent) => {
      pressedOutside = isOutside(evt);
    }, { capture: true, signal });

    doc.addEventListener("pointerup", (evt: PointerEvent) => {
      if (pressedOutside && isOutside(evt)) {
        pressedOutside = false;
        this.close("outside");
      } else {
        pressedOutside = false;
      }
    }, { capture: true, signal });

    // Close when the table scrolls horizontally (does NOT fire for scrolls inside the popup's own virtual list)
    // The anchor is in the header: only horizontal scrolling moves it. Vertical scrolling (live tail, a filter
    // that jumps to the first row) keeps the popup; so does the scroll event of the scrollLeft that open() itself
    // caused (ensureColumnIsVisible) – it arrives a frame later with the position recorded here.
    const scrollViewport = this.scope.scrollViewport;
    const scrollLeftAtOpen = scrollViewport.scrollLeft;
    scrollViewport.addEventListener("scroll", () => {
      if (Math.abs(scrollViewport.scrollLeft - scrollLeftAtOpen) >= 1) {
        this.close("scroll");
      }
    }, { passive: true, signal });

    win.addEventListener("resize", () => {
      this.close("resize");
    }, { passive: true, signal });

    return el;
  }

  /** Computes viewport-aware fixed coordinates (flipping on block and inline axes in LTR & RTL). */
  reposition(anchorRect = this.lastAnchorRect): void {
    const el = this.el;
    if (!el || !anchorRect) {
      return;
    }
    this.lastAnchorRect = anchorRect;
    const win = el.ownerDocument.defaultView ?? window;
    const vw = win.innerWidth || el.ownerDocument.documentElement.clientWidth || 1024;
    const vh = win.innerHeight || el.ownerDocument.documentElement.clientHeight || 768;
    const margin = 8;
    const gap = 4;

    el.style.position = "fixed";
    el.style.inset = "auto";
    el.style.margin = "0";

    const popupRect = el.getBoundingClientRect();
    const popupW = popupRect.width || 260;
    const popupH = popupRect.height || 300;

    // Vertical placement: prefer below anchor, flip above if overflowing bottom and space above is sufficient
    let top = anchorRect.bottom + gap;
    if (top + popupH > vh - margin && anchorRect.top - gap - popupH >= margin) {
      top = anchorRect.top - gap - popupH;
    }
    top = Math.max(margin, Math.min(top, Math.max(margin, vh - popupH - margin)));

    // Horizontal placement: align inline-start with anchor, flip to inline-end if overflowing, then clamp
    let left: number;
    if (this.scope.isRtl()) {
      left = anchorRect.right - popupW;
      if (left < margin && anchorRect.left + popupW <= vw - margin) {
        left = anchorRect.left;
      }
    } else {
      left = anchorRect.left;
      if (left + popupW > vw - margin && anchorRect.right - popupW >= margin) {
        left = anchorRect.right - popupW;
      }
    }
    left = Math.max(margin, Math.min(left, Math.max(margin, vw - popupW - margin)));

    el.style.left = `${Math.round(left)}px`;
    el.style.top = `${Math.round(top)}px`;
  }

  /** Moves initial focus to `preferred` (if focusable), otherwise the first focusable control or the dialog itself. */
  focusInitial(preferred?: HTMLElement | null): void {
    const el = this.el;
    if (!el) {
      return;
    }
    if (preferred && !preferred.hidden && preferred.isConnected) {
      preferred.focus({ preventScroll: true });
      return;
    }
    const focusables = getFocusableElements(el);
    if (focusables.length > 0) {
      focusables[0].focus({ preventScroll: true });
    } else {
      el.focus({ preventScroll: true });
    }
  }

  /** Closes the popup, releases listeners and DOM, and notifies `onClose(reason)`. Safe to call repeatedly. */
  close(reason: FilterPopupCloseReason = "api"): void {
    const el = this.el;
    if (!el) {
      return;
    }
    const cb = this.onCloseCb;
    // closed by something else than the user in the popup (scroll, resize, API): a focus inside the popup would
    // fall to <body> – hand it to the table
    const root = el.getRootNode?.() as Document | ShadowRoot | undefined;
    const active = root && "activeElement" in root ? root.activeElement : el.ownerDocument.activeElement;
    const hadFocus = !!active && el.contains(active);
    this.el = undefined;
    this.onCloseCb = undefined;
    this.lastAnchorRect = undefined;

    this.abortController?.abort();
    this.abortController = undefined;

    if (this.usingPopover) {
      try {
        (el as HTMLDivElement & { hidePopover?: () => void }).hidePopover?.();
      } catch {
        // already closed
      }
    }
    this.usingPopover = false;
    el.remove();

    cb?.(reason);
    if (hadFocus && reason !== "destroy") {
      const doc = el.ownerDocument;
      if (!doc.activeElement || doc.activeElement === doc.body) {
        this.scope.hostElement.focus({ preventScroll: true });
      }
    }
  }

  destroy(): void {
    this.close("destroy");
  }
}
