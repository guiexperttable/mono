import { DomServiceIf } from "../service/dom-service.if";

/**
 * A polite live region (`role="status"`) that lets screen readers speak short messages: "Sorted by Total,
 * descending", "42 rows", "12 cells copied" … Every table has one ({@link TableApi.announce}).
 *
 * The element lives in `document.body`, not in the table: a `role="grid"` may only contain rows, and the body is
 * never managed by a framework. The table creates it in `firstInit()` – before the first message. Known limit: inside
 * a modal dialog (`aria-modal="true"`) screen readers ignore content outside the dialog; announce such messages with
 * a live region of your own in the dialog. It is visually hidden (inline styles – it works without the table CSS, e.g. outside
 * a shadow root) and removed by {@link destroy} (called by `TableScope.destroy()`).
 *
 * The text is written with `textContent` (never HTML). It is set after a short delay and the region is emptied
 * first, so the same message is announced again, and a burst of messages (typing in a filter field) ends with one
 * announcement of the last one.
 *
 * @example
 * const announcer = new LiveAnnouncer(document, "orders-live", new SimpleDomService());
 * announcer.announce("Orders loaded");
 * // later
 * announcer.destroy();
 *
 * @since 1.1.91
 * @category Accessibility
 */
export class LiveAnnouncer {

  /** Delay in ms before a message is written (default for {@link announce}). */
  static defaultDelayInMs = 150;

  private element?: HTMLElement;
  private timeout?: ReturnType<typeof setTimeout>;

  constructor(
    private readonly document: Document | undefined,
    private readonly id: string,
    private readonly domService: DomServiceIf
  ) {
  }

  /**
   * Speaks a message (replaces a message that is still waiting).
   *
   * @param {string} text - plain text
   * @param {number} [delayInMs=LiveAnnouncer.defaultDelayInMs] - wait this long before the text is written
   */
  announce(text: string, delayInMs: number = LiveAnnouncer.defaultDelayInMs): void {
    const element = this.getOrCreateElement();
    if (!element) {
      return;
    }
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    element.textContent = "";
    this.timeout = setTimeout(() => {
      this.timeout = undefined;
      element.textContent = text;
    }, Math.max(0, delayInMs));
  }

  /**
   * The live region element (created on the first call).
   *
   * @returns {HTMLElement | undefined} undefined without a document body (e.g. server side rendering)
   */
  getElement(): HTMLElement | undefined {
    return this.getOrCreateElement();
  }

  /**
   * Cancels a waiting message and removes the live region from the document.
   */
  destroy(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = undefined;
    }
    this.element?.remove();
    this.element = undefined;
  }

  private getOrCreateElement(): HTMLElement | undefined {
    if (this.element) {
      return this.element;
    }
    const body = this.document?.body;
    if (!body) {
      return undefined;
    }
    const ds = this.domService;
    const div = ds.createElement<HTMLDivElement>("div");
    ds.setAttribute(div, "id", this.id);
    ds.setAttribute(div, "role", "status");
    ds.setAttribute(div, "aria-live", "polite");
    ds.setAttribute(div, "aria-atomic", "true");
    ds.addClass(div, "ge-table-sr-only");
    // visually hidden, readable by screen readers (inline: the table CSS may not reach document.body)
    const style: { [key: string]: string } = {
      position: "absolute", width: "1px", height: "1px", padding: "0", margin: "-1px", overflow: "hidden",
      clip: "rect(0, 0, 0, 0)", "white-space": "nowrap", border: "0"
    };
    for (const key in style) {
      ds.setStyle(div, key, style[key]);
    }
    ds.appendChild(body, div);
    this.element = div;
    return div;
  }
}
