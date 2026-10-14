/**
 * All DOM changes of the table go through this service – the third argument of `new TableScope(…)`.
 * Plain TypeScript and most wrappers use {@link SimpleDomService}; Angular uses its `Renderer2`.
 * Cell renderers get it as last argument of {@link CellRendererIf.render}.
 *
 * @example
 * // inside CellRendererIf.render(cellDiv, …, cellValue, dom)
 * const badge = dom.createElement<HTMLSpanElement>("span");
 * dom.addClass(badge, "status-badge");
 * dom.setStyle(badge, "margin-left", "4px");
 * badge.textContent = String(cellValue);
 * dom.appendChild(cellDiv, badge);
 *
 * @category DOM
 */
export interface DomServiceIf {

  /** Sets one CSS property: `setStyle(el, "background-color", "#fdf2f8")`. */
  setStyle(el: any, style: string, value: any): any;

  /** Adds a CSS class. */
  addClass(div: HTMLElement, clazz: string): HTMLDivElement;

  /** Removes a CSS class. */
  removeClass(div: HTMLElement, clazz: string): HTMLDivElement;

  /** Creates an element: `createElement<HTMLSpanElement>("span")`. */
  createElement<T>(ele: string): T;

  /** Creates a text node. */
  createText(text: string): HTMLElement;

  /** Appends text to an element (no HTML parsing). */
  appendText(parent: HTMLDivElement, text: string): HTMLDivElement;

  /** Appends a child element. */
  appendChild(parent: HTMLElement, child: HTMLElement): void;

  /** Sets an attribute. */
  setAttribute(ele: HTMLElement, key: string, value: string): void;

  /**
   * Removes an attribute (used for ARIA attributes of reused row divs). Optional: without it the table calls
   * `ele.removeAttribute(key)` itself.
   *
   * @since 1.1.91
   */
  removeAttribute?(ele: HTMLElement, key: string): void;
}
