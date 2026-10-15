import type { RowNumberColumnDef } from './data/common/row-number-column-def';
import type { AreaModelAggregateFooter } from './data/tablemodel/areamodel/area-model-aggregate-footer';


/*
 * necessary because of es5 (Svelte, Astro,...)
 */

/**
 * Checks if the given row is a tree row.
 *
 * @param {any} row - The row to be checked.
 *
 * @return {boolean} - true if the row is a tree row, false otherwise.
 *
 * @category Utilities
 */
export function isTreeRow(row: any): boolean {
  return row && row['type'] === 'TreeRow';
}



/**
 * Determines if the given model is an AreaModelTree.
 *
 * @param {any} model - The model object to check.
 * @return {boolean} - True if the model is an AreaModelTree, false otherwise.
 *
 * @category Utilities
 */
export function isAreaModelTree(model: any): boolean {
  return model && model['type'] === 'AreaModelTree';
}


/**
 * True for a {@link CheckboxCellRenderer} – also from another copy of the core (no `instanceof`).
 *
 * @example
 * isCheckboxCellRenderer(new CheckboxCellRenderer()); // true
 *
 * @since 1.1.91
 * @category Utilities
 */
export function isCheckboxCellRenderer(o: any): boolean {
  return !!o && o['type'] === 'CheckboxCellRenderer';
}

/**
 * Checks if the given object is a CheckboxColumnDef.
 *
 * @param {any} o - The object to be checked.
 * @returns {boolean} - True if the object is a CheckboxColumnDef, false otherwise.
 *
 * @category Utilities
 */
export function isCheckboxColumnDef(o: any): boolean {
  return o && o['type'] === 'CheckboxColumnDef';
}

/**
 * True for a {@link RowNumberColumnDef} – also from another copy of the core (no `instanceof`).
 *
 * @param {any} o - the object to check, e.g. `tableModel.getColumnDef(0)`
 * @returns {boolean} true for a row number column
 *
 * @example
 * const hasRowNumbers = isRowNumberColumnDef(tableModel.getColumnDef(0));
 *
 * @since 1.1.93
 * @category Row numbers
 */
export function isRowNumberColumnDef(o: any): o is RowNumberColumnDef {
  return !!o && o['type'] === 'RowNumberColumnDef';
}

/**
 * True for an {@link AreaModelAggregateFooter} – also from another copy of the core (no `instanceof`).
 *
 * @param {any} o - the object to check, e.g. `tableModel.getAreaModel("footer")`
 * @returns {boolean} true for a footer with totals
 *
 * @example
 * const footer = tableModel.getAreaModel("footer");
 * const totals = isAreaModelAggregateFooter(footer) ? footer.getResults() : {};
 *
 * @since 1.1.94
 * @category Aggregation
 */
export function isAreaModelAggregateFooter(o: any): o is AreaModelAggregateFooter {
  return !!o && o['type'] === 'AreaModelAggregateFooter';
}
