import { CoverGridFillOptionsIf } from './cover-grid-fill-options.if';

/**
 * The geometry of a cover grid that fills its width ({@link computeCoverGridFill}).
 *
 * @since 1.1.117
 * @category Table model
 */
export interface CoverGridFillLayoutIf {
  /** Tiles per row, ≥ 1. */
  columns: number;
  /** The width of the narrowest tile; the first `rest` columns are 1 px wider. */
  baseWidth: number;
  /** Pixels left over by `columns × baseWidth` – one more pixel for each of the first `rest` columns. */
  rest: number;
  /** The height of a tile (`coverHeight` without `aspectRatio`). */
  tileHeight: number;
}

/**
 * Computes the tiles of a cover grid that fill a width (DOM-free; {@link CoverGridBodyModel} uses it with
 * {@link TableOptionsIf.coverGridFill}): columns = `max(1, floor(width / tileWidth))`, `baseWidth` =
 * `floor(width / columns)`, the rest pixels go to the first columns (1 px each), so the last tile ends flush with the
 * edge. Height = `round(baseWidth × aspectRatio) + extraHeight`, at least 1 (without a valid `aspectRatio`:
 * `coverHeight`; an `extraHeight` that is no finite number counts as 0). A width ≤ 0 (hidden host) gives one column of
 * `tileWidth` – no division by 0; a `tileWidth` that is no positive number gives one column of the whole width.
 *
 * @param width - the width to fill in px (fractions are floored)
 * @param fill - wanted tile width, aspect ratio and extra height
 * @param coverHeight - the height without `aspectRatio`
 * @returns columns, widths and height
 * @since 1.1.117
 *
 * @example
 * ```ts
 * const layout = computeCoverGridFill(961, { tileWidth: 165 }, 220);
 * // { columns: 5, baseWidth: 192, rest: 1, tileHeight: 220 } → widths 193, 192, 192, 192, 192
 * ```
 *
 * @category Table model
 */
export function computeCoverGridFill(width: number, fill: CoverGridFillOptionsIf, coverHeight: number): CoverGridFillLayoutIf {
  const room = width > 0 && Number.isFinite(width) ? Math.floor(width) : 0;
  const tileWidth = Number.isFinite(fill.tileWidth) && fill.tileWidth > 0 ? fill.tileWidth : room;
  let columns = 1;
  let baseWidth = tileWidth;
  let rest = 0;
  if (room > 0) {
    columns = Math.max(1, Math.floor(room / tileWidth));
    baseWidth = Math.floor(room / columns);
    rest = room - baseWidth * columns;
  }
  const ratio = fill.aspectRatio;
  const extra = Number.isFinite(fill.extraHeight) ? fill.extraHeight! : 0;
  const tileHeight = ratio !== undefined && Number.isFinite(ratio) && ratio > 0
    ? Math.max(1, Math.round(baseWidth * ratio) + extra)
    : coverHeight;
  return { columns, baseWidth, rest, tileHeight };
}
