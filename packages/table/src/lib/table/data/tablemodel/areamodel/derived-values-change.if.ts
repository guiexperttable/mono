import type { AreaIdent } from "../area-ident.type";

/**
 * What changed when the table calls {@link AreaModelIf.invalidateDerivedValues} after an edit or
 * {@link TableApi.updateCells}: the area and the displayed rows. A model may use it to recompute only what depends on
 * these rows (a row grouping recomputes the path of the changed row only). Without it everything may have changed.
 *
 * @example
 * class MyModel extends AreaModel {
 *   private readonly dirtyRows = new Set<number>();
 *   private allDirty = true;
 *
 *   invalidateDerivedValues(change?: DerivedValuesChangeIf): void {
 *     if (change?.area === "body") {
 *       change.rowIndices.forEach(r => this.dirtyRows.add(r));   // only these rows
 *     } else {
 *       this.allDirty = true;                                      // anything may have changed
 *     }
 *   }
 * }
 *
 * @since 1.1.94
 * @category Area models
 */
export interface DerivedValuesChangeIf {
  /** The area whose values changed. */
  area: AreaIdent;
  /** The changed rows (indices of the displayed rows at the time of the change). */
  rowIndices: number[];
}
