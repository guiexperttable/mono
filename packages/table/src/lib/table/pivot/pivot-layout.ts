import type { ColumnDefIf } from "../data/tablemodel/column/column-def.if";
import type { CellGroupIf } from "../data/tablemodel/cellgroup/cell-group.if";
import type { SizeIf } from "../data/common/size.if";
import type { RowGroup } from "../rowgroup/row-group";
import type { PivotConfigIf } from "./pivot-config.if";
import type { PivotResult } from "./pivot-result";
import type { PivotValueInfoIf } from "./pivot-value.type";
import type { PivotColumnInfoIf } from "./pivot-column-info.if";
import { DEFAULT_TOTAL_LABEL } from "./pivot-internals";
import { PivotColumnDef } from "./pivot-column-def";
import { Size } from "../data/common/size";
import type { RowGroupField } from "../rowgroup/row-group-field.type";
import { resolveRowGroupFields, rowGroupLevelLabels } from "../rowgroup/row-group-internals";

// Not exported from index.ts: the columns and the grouped header of a pivot table (PivotFactory, PivotTableModel).

/** Columns, header groups and fixed right columns of a pivot. */
export interface PivotLayout {
  /** leading columns (row numbers, group column) + value columns + total columns */
  columnDefs: ColumnDefIf[];
  /** the header groups, one leaf per column in the same order */
  cellGroups: CellGroupIf[];
  /** the number of total columns fixed on the right */
  fixedRightColumnCount: number;
}

export interface PivotLayoutOptions {
  /** width of a value column (default 100 px) */
  valueWidth?: SizeIf;
  /** ids of collapsed column groups (kept when the layout is built again) */
  closedIds?: ReadonlySet<string>;
  /** the widths of existing columns by property (kept when the layout is built again) */
  widths?: ReadonlyMap<string, SizeIf>;
}

/** The property of a value column: column path + value name. */
export function pivotValueProperty(column: RowGroup, value: PivotValueInfoIf): string {
  return "pivot:" + JSON.stringify([...column.idParts, value.name]);
}

/** The property of a subtotal column of a column group. */
export function pivotSubtotalProperty(column: RowGroup, value: PivotValueInfoIf): string {
  return "pivot:subtotal:" + JSON.stringify([...column.idParts, value.name]);
}

/** The property of a total column. */
export function pivotTotalProperty(value: PivotValueInfoIf): string {
  return "pivot:total:" + JSON.stringify([value.name]);
}

/** The default name of a field path in a header: the last part, first letter upper case ("address.city" → "City"). */
export function humanizePath(path: string): string {
  const last = path.slice(path.lastIndexOf(".") + 1);
  return last.charAt(0).toUpperCase() + last.slice(1);
}

/** The header of the group column of a pivot: the row field labels, e.g. "Region › Produkt" ("" without row fields). */
export function pivotGroupHeaderLabel(rowFields: RowGroupField[]): string {
  return rowGroupLevelLabels(resolveRowGroupFields(rowFields), humanizePath).join(" › ");
}

/** True if the subtotal columns are on (default: two or more column fields). */
export function hasColumnSubtotals(config: PivotConfigIf): boolean {
  return config.columnSubtotals ?? (config.columnFields?.length ?? 0) > 1;
}

/** Builds the columns and the grouped header of a pivot. */
export function buildPivotLayout<T>(
  result: PivotResult<T>,
  config: PivotConfigIf<T>,
  leading: ColumnDefIf[],
  options: PivotLayoutOptions = {}): PivotLayout {

  const values = result.values;
  const many = values.length > 1;
  const totalLabel = config.totalLabel ?? DEFAULT_TOTAL_LABEL;
  const subtotals = hasColumnSubtotals(config);
  const hasColumnFields = (config.columnFields?.length ?? 0) > 0;
  const width = options.valueWidth ?? new Size(100, "px");
  const columnDefs: ColumnDefIf[] = [...leading];
  const cellGroups: CellGroupIf[] = leading.map(def => ({ data: def.headerLabel, property: def.property }));

  const column = (property: string, label: string, info: PivotColumnInfoIf): CellGroupIf => {
    columnDefs.push(new PivotColumnDef(property, label, info, options.widths?.get(property) ?? width));
    return { data: label, property };
  };
  /** one leaf per value, or a group with one leaf per value (several values) */
  const valueColumns = (
    label: string,
    kind: PivotColumnInfoIf["kind"],
    group: RowGroup<T> | undefined,
    property: (v: PivotValueInfoIf) => string,
    visibility?: CellGroupIf["visibility"]): CellGroupIf => {

    if (!many) {
      return { ...column(property(values[0]), label, { kind, column: group, value: values[0], valueIndex: 0 }), visibility };
    }
    return {
      data: label,
      visibility,
      children: values.map((v, valueIndex) => column(property(v), v.label, { kind, column: group, value: v, valueIndex })),
    };
  };

  const visit = (group: RowGroup<T>): CellGroupIf | undefined => {
    if (!result.isColumnShown(group)) {
      return undefined;
    }
    if (group.isLeaf()) {
      return valueColumns(group.label, "value", group, v => pivotValueProperty(group, v));
    }
    const children = group.children.map(visit).filter((c): c is CellGroupIf => !!c);
    if (subtotals) {
      children.push(valueColumns(`${group.label} ${totalLabel}`, "subtotal", group,
        v => pivotSubtotalProperty(group, v), "always"));
    }
    return {
      id: group.id,
      data: group.label,
      toggle: subtotals,
      closed: subtotals && !!options.closedIds?.has(group.id),
      children,
    };
  };

  let fixedRightColumnCount = 0;
  if (hasColumnFields) {
    for (const group of result.columnGroups) {
      const cellGroup = visit(group);
      if (cellGroup) cellGroups.push(cellGroup);
    }
    if (config.totalColumn !== false) {
      cellGroups.push(valueColumns(totalLabel, "total", undefined, v => pivotTotalProperty(v)));
      if (config.totalColumn === undefined || config.totalColumn === "fixed") {
        fixedRightColumnCount = values.length;
      }
    }
  } else {
    // no column fields: the totals are the value columns
    values.forEach((v, valueIndex) =>
      cellGroups.push(column(pivotTotalProperty(v), v.label, { kind: "total", value: v, valueIndex })));
  }
  return { columnDefs, cellGroups, fixedRightColumnCount };
}
