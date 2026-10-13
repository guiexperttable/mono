/**
 * Scroll event containing position and size information.
 *
 * @category Events
 */
export class GeScrollEvent {

  constructor(
    /** Vertical scroll position of the viewport in px. */
    public scrollTop: number,
    /** Horizontal scroll position of the viewport in px. */
    public scrollLeft: number,
    /** Height of the whole (virtual) content in px. */
    public scrollHeight: number,
    /** Width of the whole content in px. */
    public scrollWidth: number,
    /** Visible height in px. */
    public clientHeight: number,
    /** Visible width in px. */
    public clientWidth: number,
    /** Vertical position as factor 0 (top) … 1 (bottom). */
    public scrollFactorY: number,
    /** Horizontal position as factor 0 (left) … 1 (right). */
    public scrollFactorX: number,
  ) {
  }
}