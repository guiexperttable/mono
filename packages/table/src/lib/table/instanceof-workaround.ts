

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
 * Checks if the given object is a CheckboxColumnDef.
 *
 * @param {any} o - The object to be checked.
 * @returns {boolean} - True if the object is a CheckboxColumnDef, false otherwise.
 *
 * @category Utilities
 */
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

export function isCheckboxColumnDef(o: any): boolean {
  return o && o['type'] === 'CheckboxColumnDef';
}


