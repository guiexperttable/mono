import { ConvenienceDomService } from "../service/convenience-dom.service";
import { OverlayOptionsIf } from "../data/options/overlay-options.if";
import { OverlayOptions } from "../data/options/overlay-options";
import { GeOverlayKind } from "./ge-overlay-kind.type";
import { calcOverlayKind } from "./calc-overlay-kind";

/**
 * A change of the shown overlay, reported by {@link TableOverlay.update}.
 *
 * @since 1.1.91
 * @category Internals
 */
export interface TableOverlayChange {
  previous: GeOverlayKind;
  kind: GeOverlayKind;
  /** the text of the new overlay (`""` for `"none"`) */
  text: string;
}

/** CSS class of each kind (on the overlay element). */
const KIND_CLASSES: { [K in GeOverlayKind]: string } = {
  none: "",
  loading: "ge-table-overlay-loading",
  noRows: "ge-table-overlay-no-rows",
  noMatches: "ge-table-overlay-no-matches",
};

/** Mouse events a blocking overlay keeps away from the table (mouseup is not blocked: a drag must be able to end). */
const BLOCKED_MOUSE_EVENTS = ["click", "dblclick", "mousedown", "mousemove", "contextmenu"];

/**
 * The overlay layer over the table body: "Loading…" with a CSS spinner, "No rows to show", "No matching rows".
 * One element per table (`.ge-table-overlay`, a child of the host, `aria-hidden` – the table announces the texts
 * through its live region instead). It is created once and only changed when the shown overlay changes, so
 * scrolling costs one comparison per frame.
 *
 * Apps use it through {@link TableApi.showLoadingOverlay}, {@link TableApi.showNoRowsOverlay},
 * {@link TableApi.hideOverlay} and {@link TableApi.getOverlayState}; texts and behaviour come from
 * {@link TableOptionsIf.overlayOptions}.
 *
 * @example
 * const overlay = new TableOverlay(hostDiv, new ConvenienceDomService(new SimpleDomService()), {}, () => {
 *   overlay.update(0, 0);
 * });
 * overlay.showLoading("Saving…"); // calls the update callback
 * console.log(overlay.getState()); // "loading"
 * overlay.destroy();
 *
 * @since 1.1.91
 * @category Internals
 */
export class TableOverlay {

  /** The overlay element (`.ge-table-overlay`). */
  readonly element: HTMLDivElement;
  /** The content box, centered in the overlay (`.ge-table-overlay-content`). */
  readonly contentElement: HTMLDivElement;
  readonly options: OverlayOptions;

  private manual?: { kind: "loading" | "noRows"; text?: string };
  private delayTimeout?: ReturnType<typeof setTimeout>;
  private shownKind: GeOverlayKind = "none";
  private shownText = "";
  private shownBlocking = false;
  private bounds = "";
  private destroyed = false;
  private readonly abortController = new AbortController();

  /**
   * @param {HTMLDivElement} hostElement - the table host; the overlay is appended to it
   * @param {ConvenienceDomService} dom - DOM access of the table
   * @param {Partial<OverlayOptionsIf>} [overlayOptions] - {@link TableOptionsIf.overlayOptions}
   * @param {() => void} [requestUpdate] - called when the requested overlay changed (API call, end of the
   *   delay); the table answers with {@link update}
   */
  constructor(
    hostElement: HTMLDivElement,
    private readonly dom: ConvenienceDomService,
    overlayOptions?: Partial<OverlayOptionsIf>,
    private readonly requestUpdate: () => void = () => undefined
  ) {
    this.options = OverlayOptions.create(overlayOptions);
    this.element = dom.applyStylePosistionAbsolute(dom.createDivWithClass("ge-table-overlay", hostElement));
    dom.setAriaHidden(this.element);
    dom.applyDisplayNoneStyle(this.element);
    this.contentElement = dom.createDivWithClass("ge-table-overlay-content", this.element);

    const signal = this.abortController.signal;
    for (const type of BLOCKED_MOUSE_EVENTS) {
      this.element.addEventListener(type, evt => {
        if (this.shownBlocking) {
          evt.stopPropagation(); // the table's mouse handler (on the host) never sees it
        }
      }, { signal });
    }
  }

  /**
   * Requests the loading overlay (after {@link OverlayOptionsIf.loadingDelayInMs}).
   *
   * @param {string} [text] - text for this overlay, default {@link OverlayOptionsIf.loadingText}
   */
  showLoading(text?: string): void {
    if (this.destroyed) {
      return;
    }
    const wasLoading = this.manual?.kind === "loading";
    this.manual = { kind: "loading", text };
    const delay = this.options.loadingDelayInMs;
    if (!wasLoading && delay > 0 && !this.delayTimeout) {
      this.delayTimeout = setTimeout(() => {
        this.delayTimeout = undefined;
        this.requestUpdate();
      }, delay);
    }
    this.requestUpdate();
  }

  /**
   * Requests the "no rows" overlay, also over rows and with {@link OverlayOptionsIf.autoNoRows} `false`.
   *
   * @param {string} [text] - text for this overlay, default {@link OverlayOptionsIf.noRowsText}
   */
  showNoRows(text?: string): void {
    if (this.destroyed) {
      return;
    }
    this.clearDelay();
    this.manual = { kind: "noRows", text };
    this.requestUpdate();
  }

  /** Ends a requested overlay; the automatic "no rows" / "no matching rows" stays as long as the body is empty. */
  hide(): void {
    if (this.destroyed || !this.manual) {
      return;
    }
    this.clearDelay();
    this.manual = undefined;
    this.requestUpdate();
  }

  /** The overlay that is shown now. */
  getState(): GeOverlayKind {
    return this.shownKind;
  }

  /** `true` while a loading overlay blocks mouse and keyboard ({@link OverlayOptionsIf.blockInteractionWhileLoading}). */
  isBlocking(): boolean {
    return this.shownBlocking;
  }

  /**
   * Shows the overlay that fits the body: a requested one, else "no matching rows" / "no rows to show"
   * for an empty body. Changes the DOM only if the result differs from what is shown.
   *
   * @param {number} rowCount - `getRowCount()` of the body
   * @param {number} [unfilteredRowCount] - `getUnfilteredRowCount()` of the body (only needed for 0 rows)
   * @returns {TableOverlayChange | undefined} the change, `undefined` if nothing changed
   */
  update(rowCount: number, unfilteredRowCount?: number): TableOverlayChange | undefined {
    if (this.destroyed) {
      return undefined;
    }
    const kind: GeOverlayKind = this.delayTimeout
      ? "none" // waiting for the delayed spinner: show nothing (no "no rows" flash)
      : calcOverlayKind({ manual: this.manual?.kind, rowCount, unfilteredRowCount, autoNoRows: this.options.autoNoRows });
    const text = this.getText(kind);
    const blocking = kind === "loading" && this.options.blockInteractionWhileLoading;
    if (kind === this.shownKind && text === this.shownText && blocking === this.shownBlocking) {
      return undefined;
    }
    const previous = this.shownKind;
    this.render(kind, text, blocking);
    return { previous, kind, text };
  }

  /**
   * Places the overlay over the body (px, relative to the host). Unchanged values do not touch the DOM.
   */
  setBounds(left: number, top: number, width: number, height: number): void {
    const key = `${left},${top},${width},${height}`;
    if (this.destroyed || key === this.bounds) {
      return;
    }
    this.bounds = key;
    this.dom.applyStyle(this.element, {
      left: `${left}px`,
      top: `${top}px`,
      width: `${Math.max(0, width)}px`,
      height: `${Math.max(0, height)}px`,
    });
  }

  /** Removes the overlay element, its listeners and a waiting delay. Calling it twice is harmless. */
  destroy(): void {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;
    this.clearDelay();
    this.abortController.abort();
    this.contentElement.replaceChildren(); // own elements of getOverlayElement are detached
    this.element.remove();
    this.manual = undefined;
    this.shownKind = "none";
    this.shownBlocking = false;
  }

  private getText(kind: GeOverlayKind): string {
    const o = this.options;
    switch (kind) {
      case "loading":
        return this.manual?.text ?? o.loadingText;
      case "noRows":
        return (this.manual?.kind === "noRows" ? this.manual.text : undefined) ?? o.noRowsText;
      case "noMatches":
        return o.noMatchesText;
      default:
        return "";
    }
  }

  private render(kind: GeOverlayKind, text: string, blocking: boolean): void {
    const dom = this.dom;
    const ele = this.element;
    if (this.shownKind !== "none") {
      dom.removeClass(KIND_CLASSES[this.shownKind], ele);
    }
    this.contentElement.replaceChildren();
    if (kind === "none") {
      dom.removeClass("ge-table-overlay-visible", ele);
      dom.applyDisplayNoneStyle(ele);
    } else {
      dom.addClass(`ge-table-overlay-visible ${KIND_CLASSES[kind]}`, ele);
      dom.setStyle(ele, "display", "flex");
      const own = this.options.getOverlayElement?.(kind, text);
      if (own) {
        dom.domService.appendChild(this.contentElement, own);
      } else {
        if (kind === "loading") {
          dom.createDivWithClass("ge-table-spinner", this.contentElement);
        }
        const label = dom.createDivWithClass("ge-table-overlay-text", this.contentElement);
        label.textContent = text; // text, never HTML
      }
    }
    if (blocking) {
      dom.addClass("ge-table-overlay-blocking", ele);
    } else {
      dom.removeClass("ge-table-overlay-blocking", ele);
    }
    this.shownKind = kind;
    this.shownText = text;
    this.shownBlocking = blocking;
  }

  private clearDelay(): void {
    if (this.delayTimeout) {
      clearTimeout(this.delayTimeout);
      this.delayTimeout = undefined;
    }
  }
}
