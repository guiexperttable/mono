/**
 * A body whose cells are **one sequence of items** shown as tiles (a cover grid): item `i` sits in row
 * `floor(i / tilesPerRow)`, column `i % tilesPerRow`; the cells behind the last item are empty.
 *
 * An area model that returns such a layout from {@link AreaModelIf.getTileLayout} gets the keyboard navigation of a
 * tile grid instead of the cell navigation (since 1.1.115):
 *
 * - ← / → move to the previous / next item and wrap over the end of a row; ↑ / ↓ move one row (↓ without an item
 *   below: the last item); Home / End go to the first / last item; Page Up / Down move a page.
 * - Empty tiles never get the focus (keyboard and mouse), Enter and double click on them report nothing.
 * - The focus follows the **item**: after sorting, filtering or a different number of tiles per row the same item
 *   has the focus (found with {@link indexOfTile}).
 *
 * {@link CoverGridBodyModel} implements it.
 *
 * @example
 * ```ts
 * class PhotoBody extends AreaModel implements TileLayoutIf {
 *   constructor(private photos: string[], private perRow: number) { super(); }
 *   override getRowCount() { return Math.ceil(this.photos.length / this.perRow); }
 *   override getValueAt(rowIndex: number, columnIndex: number) { return this.photos[rowIndex * this.perRow + columnIndex]; }
 *   getTileLayout() { return this; }
 *   getTileCount() { return this.photos.length; }
 *   getTilesPerRow() { return this.perRow; }
 *   getTileAt(index: number) { return this.photos[index]; }
 *   indexOfTile(item: unknown) { return this.photos.indexOf(item as string); }
 * }
 * ```
 *
 * @category Area models
 * @since 1.1.115
 */
export interface TileLayoutIf {

  /** The number of shown items (after the filter). */
  getTileCount(): number;

  /** Tiles per row – at least 1. */
  getTilesPerRow(): number;

  /**
   * The item of a tile: its identity (`===`) is what the focus follows. Return the **same** value for the same item
   * each time (objects of your list, ids) – a model that creates a new object per call never matches, and the table
   * would search with {@link indexOfTile} in every render pass.
   *
   * @param {number} index - index in the shown items
   * @returns {unknown} the item, `undefined` outside the items
   */
  getTileAt(index: number): unknown;

  /**
   * The index of an item in the shown items. Called only when the focused item is no longer in its cell (after
   * sorting, filtering, a resize) – never while scrolling.
   *
   * @param {unknown} item - an item {@link getTileAt} returned
   * @returns {number} the index, `-1` if the item is not shown (filtered out, removed)
   */
  indexOfTile(item: unknown): number;
}
