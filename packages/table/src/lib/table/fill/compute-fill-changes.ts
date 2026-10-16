import { CellRange } from "../data/common/cell-range";
import type { CellValueChangeIf } from "../batch-edit/cell-value-change.if";
import type { FillDirection } from "./fill-direction.type";
import type { FillValueContextIf } from "./fill-value-context.if";
import { computeFillValues, FillMode, isFillSeries } from "./fill-series";

/**
 * Input of {@link computeFillChanges}.
 *
 * @category Fill handle & batch edit
 * @since 1.1.96
 */
export interface FillRequestIf {
  /** The selected source range (body display indices, `r1 <= r2`, `c1 <= c2`). */
  source: CellRange;
  /** Where the range is extended to. */
  direction: FillDirection;
  /** The number of rows (down/up) or columns (right/left) to fill. */
  count: number;
  /** Series or copy, see {@link FillMode}. */
  mode?: FillMode;
  /** The shown value of a cell (batch edit: the pending value). */
  getValue: (rowIndex: number, columnIndex: number) => unknown;
  /** `false` skips a target cell (not editable, hidden column …); the series keeps counting. */
  isFillable?: (rowIndex: number, columnIndex: number) => boolean;
  /** Own fill function, see {@link FillHandleOptionsIf.fillValue}. */
  fillValue?: (ctx: FillValueContextIf) => unknown;
  /** Row object and property of a cell – for `fillValue`. */
  getCellInfo?: (rowIndex: number, columnIndex: number) => { row: unknown; property: string };
}

/**
 * The cells a fill covers: the source range extended by `count` rows or columns in `direction`.
 *
 * @param {CellRange} source - the selected range
 * @param {FillDirection} direction - the direction of the fill
 * @param {number} count - rows or columns added
 * @returns {CellRange} source and filled cells together
 *
 * @example
 * getFillRange(new CellRange(2, 1, 3, 1), "down", 3);   // rows 2…6 of column 1
 *
 * @category Fill handle & batch edit
 * @since 1.1.96
 */
export function getFillRange(source: CellRange, direction: FillDirection, count: number): CellRange {
  const { r1, c1, r2, c2 } = source;
  switch (direction) {
    case "down":
      return new CellRange(r1, c1, r2 + count, c2);
    case "up":
      return new CellRange(r1 - count, c1, r2, c2);
    case "right":
      return new CellRange(r1, c1, r2, c2 + count);
    default:
      return new CellRange(r1, c1 - count, r2, c2);
  }
}

/**
 * The values a fill writes: per line of the source range (each column when filling down/up, each row when filling
 * right/left) the continuation of its values ({@link computeFillValues}) – DOM-free, the table applies the result with
 * {@link TableApi.applyCellChanges}.
 *
 * @param {FillRequestIf} request - source range, direction, count, value access
 * @returns {CellValueChangeIf[]} one change per fillable target cell (column = model index)
 *
 * @example
 * const values = [[1], [2]];                                    // a 2 × 1 source range
 * computeFillChanges({
 *   source: new CellRange(0, 0, 1, 0), direction: "down", count: 2,
 *   getValue: (r, c) => values[r]?.[c],
 * });   // [{ rowIndex: 2, column: 0, value: 3 }, { rowIndex: 3, column: 0, value: 4 }]
 *
 * @category Fill handle & batch edit
 * @since 1.1.96
 */
export function computeFillChanges(request: FillRequestIf): CellValueChangeIf[] {
  const { source, direction, count, getValue } = request;
  const mode = request.mode ?? "auto";
  const vertical = direction === "down" || direction === "up";
  const backward = direction === "up" || direction === "left";
  const ret: CellValueChangeIf[] = [];
  if (count < 1) {
    return ret;
  }
  const [lineStart, lineEnd] = vertical ? [source.c1, source.c2] : [source.r1, source.r2];
  const [srcStart, srcEnd] = vertical ? [source.r1, source.r2] : [source.c1, source.c2];
  for (let line = lineStart; line <= lineEnd; line++) {
    const cell = (pos: number): [number, number] => vertical ? [pos, line] : [line, pos];
    const sourceValues: unknown[] = [];
    for (let pos = srcStart; pos <= srcEnd; pos++) {
      sourceValues.push(getValue(...cell(pos)));
    }
    const values = computeFillValues(sourceValues, count, backward, mode);
    const series = isFillSeries(sourceValues, mode);
    for (let i = 0; i < count; i++) {
      const pos = backward ? srcStart - 1 - i : srcEnd + 1 + i;
      const [rowIndex, columnIndex] = cell(pos);
      if (request.isFillable && !request.isFillable(rowIndex, columnIndex)) {
        continue;
      }
      let value = values[i];
      if (request.fillValue) {
        const info = request.getCellInfo?.(rowIndex, columnIndex) ?? { row: undefined, property: "" };
        const own = request.fillValue({
          sourceValues, step: backward ? -(i + 1) : i + 1, direction, rowIndex, columnIndex,
          property: info.property, row: info.row, defaultValue: value, copy: !series
        });
        if (own !== undefined) {
          value = own;
        }
      }
      ret.push({ rowIndex, column: columnIndex, value });
    }
  }
  return ret;
}
