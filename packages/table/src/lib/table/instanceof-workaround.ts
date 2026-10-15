import type { RowNumberColumnDef } from './data/common/row-number-column-def';
import type { AreaModelAggregateFooter } from './data/tablemodel/areamodel/area-model-aggregate-footer';
import type { AreaModelRowGroups } from './data/tablemodel/areamodel/area-model-row-groups';
import type { RowGroupIf } from './rowgroup/row-group.if';
import type { RowGroupColumnDef } from './rowgroup/row-group-column-def';
import type { TreeRowIf } from './data/common/tree-row-if';


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

/**
 * True for a group of a row grouping ({@link RowGroupIf}) – the `data` of a group row. Works across copies of the core.
 *
 * @param {any} o - the object to check, e.g. `treeRow.data`
 * @returns {boolean} true for a group
 *
 * @example
 * const row = tableModel.getBodyModel().getRowByIndex(rowIndex);
 * if (isTreeRow(row) && isRowGroup(row.data)) console.log(row.data.label, row.data.count);
 *
 * @since 1.1.94
 * @category Row grouping
 */
export function isRowGroup(o: any): o is RowGroupIf {
  return !!o && o['type'] === 'RowGroup';
}

/**
 * True for a group row of a row grouping: a tree row whose `data` is a {@link RowGroupIf} (detail rows hold your objects).
 *
 * @param {any} row - a body row, e.g. `tableModel.getBodyModel().getRowByIndex(rowIndex)` or `mouseEvent.row`
 * @returns {boolean} true for a group row
 *
 * @example
 * const eventListener = new EventAdapter();
 * eventListener.onMouseClicked = (evt: GeMouseEvent) => {
 *   const row = tableModel.getBodyModel().getRowByIndex(evt.rowIndex);
 *   if (isGroupRow(row)) console.log("group", row.data.path);
 * };
 *
 * @since 1.1.94
 * @category Row grouping
 */
export function isGroupRow(row: any): row is TreeRowIf<RowGroupIf> {
  return isTreeRow(row) && isRowGroup(row['data']);
}

/**
 * True for the body model of a row grouping ({@link AreaModelRowGroups}). It is a tree as well
 * (`isAreaModelTree` is true). Works across copies of the core.
 *
 * @param {any} o - the object to check, e.g. `tableModel.getBodyModel()`
 * @returns {boolean} true for a row grouping
 *
 * @example
 * const body = tableModel.getBodyModel();
 * const groups = isAreaModelRowGroups(body) ? body.getGroups() : [];
 *
 * @since 1.1.94
 * @category Row grouping
 */
export function isAreaModelRowGroups(o: any): o is AreaModelRowGroups {
  return !!o && o['kind'] === 'AreaModelRowGroups';
}

/**
 * True for the group column of a row grouping ({@link RowGroupColumnDef}). Works across copies of the core.
 *
 * @param {any} o - the object to check, e.g. a column definition
 * @returns {boolean} true for the group column
 *
 * @example
 * const groupColumnIndex = (tableModel.getColumnDefs() ?? []).findIndex(isRowGroupColumnDef);
 *
 * @since 1.1.94
 * @category Row grouping
 */
export function isRowGroupColumnDef(o: any): o is RowGroupColumnDef {
  return !!o && o['type'] === 'RowGroupColumnDef';
}
