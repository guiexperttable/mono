/**
 * A cover grid that fills the whole width ({@link TableOptionsIf.coverGridFill}, since 1.1.117): as many tiles per row
 * as fit with `tileWidth` (at least 1), then the tiles are stretched until the last one ends flush with the right
 * edge (the first columns get the rest pixels, 1 px each). With `aspectRatio` the height grows with the width.
 *
 * @example
 * ```ts
 * const fill: CoverGridFillOptionsIf = {
 *   tileWidth: 165,              // wanted (minimal) width of a tile
 *   aspectRatio: 220 / 165,      // height / width of the cover image
 *   extraHeight: 44              // two lines of text below the cover
 * };
 * // 960 px → 5 tiles of 192 × 300 px (round(192 × 220 / 165) + 44)
 * ```
 *
 * @since 1.1.117
 * @category Table model
 */
export interface CoverGridFillOptionsIf {
  /**
   * The wanted width of a tile in px – the minimal width: columns = `max(1, floor(width / tileWidth))`, then the tiles
   * get wider until they fill the row. With `coverGridFill: true` the `coverWidth` of the model.
   */
  tileWidth: number;
  /**
   * Height / width of the stretched part of the tile (e.g. `220 / 165` for a book cover). Tile height =
   * `round(tile width × aspectRatio) + extraHeight`. Not set: the height stays `coverHeight`.
   */
  aspectRatio?: number;
  /** A fixed height added to the scaled height (a caption below the image), only with `aspectRatio`. Default 0. */
  extraHeight?: number;
}
