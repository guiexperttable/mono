import { ColumnDefIf } from './column-def.if';
import { FalseFn, TrueFn } from '../../common/boolean-function';

/**
 * Internal: visibility of a column has two sources – the API (`TableApi.setColumnVisible`) and the header groups
 * (`AreaModelCellGroups`: a closed group hides its columns). `ColumnDefIf.isVisible` combines both, so toggling a
 * header group no longer brings back a column hidden by the API (and the API does not open a closed group).
 * Not exported from the package.
 */

/** Columns hidden with `setColumnVisible(…, false)`. */
const hiddenByApi = new WeakSet<ColumnDefIf>();

/** The visibility a header group gives a column (set by `AreaModelCellGroups`). */
const groupVisibility = new WeakMap<ColumnDefIf, () => boolean>();

/** Sets the API visibility of a column and rebuilds its `isVisible`. */
export function setApiColumnVisibility(columnDef: ColumnDefIf, visible: boolean): void {
  if (visible) {
    hiddenByApi.delete(columnDef);
  } else {
    hiddenByApi.add(columnDef);
  }
  applyColumnVisibility(columnDef);
}

/** Sets the header group visibility of a column and rebuilds its `isVisible`. */
export function setGroupColumnVisibility(columnDef: ColumnDefIf, isVisible: (() => boolean) | undefined): void {
  if (isVisible) {
    groupVisibility.set(columnDef, isVisible);
  } else {
    groupVisibility.delete(columnDef);
  }
  applyColumnVisibility(columnDef);
}

/**
 * Whether the column is shown apart from a collapsed header group: hidden with `setColumnVisible(…, false)` or by its
 * own `isVisible` (e.g. `FalseFn` in the code) → false.
 */
export function isApiColumnVisible(columnDef: ColumnDefIf): boolean {
  if (groupVisibility.has(columnDef)) {
    return !hiddenByApi.has(columnDef);
  }
  return !hiddenByApi.has(columnDef) && columnDef.isVisible?.() !== false;
}

function applyColumnVisibility(columnDef: ColumnDefIf): void {
  const group = groupVisibility.get(columnDef);
  const apiVisible = !hiddenByApi.has(columnDef);
  if (!group) {
    columnDef.isVisible = apiVisible ? TrueFn : FalseFn;
  } else {
    columnDef.isVisible = () => !hiddenByApi.has(columnDef) && group();
  }
}
