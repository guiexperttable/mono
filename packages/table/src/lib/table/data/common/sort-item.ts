import { SortState } from "./sort-state.type";

/**
 * One sort instruction: column index + direction. Used by {@link TableModelIf.doSort} and
 * {@link AreaModelIf.doSort}.
 *
 * @example
 * // sort once by column 10 descending (and match the header icon set with sortState: "desc")
 * tableModel.doSort([new SortItem(10, "desc")]);
 *
 * @category Sorting & filtering
 */
export class SortItem {

  constructor(
    /** Column index (west + center + east). */
    public columnIndex: number,
    /** `"asc"`, `"desc"` or `""` (unsorted). */
    public sortState: SortState
  ) {
  }

}
