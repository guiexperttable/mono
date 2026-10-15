import { SortState } from "../data/common/sort-state.type";

/**
 * The id of a row in a {@link TableStateIf} – what {@link AutoRestoreOptionsIf.getRowId} returns.
 *
 * @category State
 * @since 1.1.92
 */
export type TableStateRowId = string | number;

/**
 * One part of a {@link TableStateIf}. Use it to read or apply only some parts:
 * `tableApi.getState(["columns", "sort"])`.
 *
 * | Part | Content | {@link AutoRestoreOptionsIf} flag |
 * |---|---|---|
 * | `columns` | width, order and visibility of the columns | `autoRestoreColumnLayout` |
 * | `sort` | sorted columns | `autoRestoreSortingState` |
 * | `scroll` | scroll position | `autoRestoreScrollPosition` |
 * | `tree` | expanded / collapsed tree nodes | `autoRestoreCollapsedExpandedState` |
 * | `checked` | checked rows (row checkboxes) | `autoRestoreCheckedState` |
 * | `selection` | selected rows, columns, cells or ranges | `autoRestoreSelectedState` |
 * | `headerGroups` | collapsed header groups | `autoRestoreHeaderGroupState` |
 * | `custom` | data of your application ({@link TableApi.setCustomState}) | `autoRestoreCustomState` |
 *
 * @category State
 * @since 1.1.92
 */
export type TableStatePart =
  "columns" | "sort" | "scroll" | "tree" | "checked" | "selection" | "headerGroups" | "custom";

/**
 * The state of a table as plain JSON: column layout, sorting, scroll position, tree, checked and selected rows,
 * header groups and data of your own. Get it with {@link TableApi.getState}, apply it with
 * {@link TableApi.applyState} or pass it at the start as {@link TableOptionsIf.initialState} – e.g. to store it on
 * your server per user. {@link TableOptionsIf.autoRestoreOptions} stores it in `localStorage` for you.
 *
 * Every part is optional: a missing part is not applied (the table keeps its current state of that part).
 * Columns are identified by their property, rows by their id ({@link AutoRestoreOptionsIf.getRowId}) – never by an
 * index, so the state survives moved columns and rows that arrive in another order. Unknown columns and rows are
 * ignored. The state holds no cell values – but row ids can be personal data (e.g. an e-mail address as id).
 *
 * @example
 * const state: TableStateIf = tableApi.getState();
 * localStorage.setItem("orders-layout", JSON.stringify(state));
 * // later, e.g. in another table:
 * tableApi.applyState(JSON.parse(localStorage.getItem("orders-layout")!) as TableStateIf);
 *
 * @example
 * // hand-written: "total" first and 240 px wide, "city" hidden, sorted by total descending
 * const state: TableStateIf = {
 *   version: 1,
 *   columns: [{ property: "total", width: 240 }, { property: "id" }, { property: "city", visible: false }],
 *   sort: [{ property: "total", sortState: "desc" }]
 * };
 *
 * @see Training: [Remember the state](https://gui.expert/training/persist-state/)
 *
 * @category State
 * @since 1.1.92
 */
export interface TableStateIf {
  /** Format version, always `1`. */
  version: 1;
  /**
   * The columns in their order (fixed columns included). Columns of the table that are missing here keep their
   * place; unknown properties are ignored.
   */
  columns?: TableColumnStateIf[];
  /** The sorted columns, the first one is the primary sort key. `[]` = unsorted. */
  sort?: TableSortStateIf[];
  /** The scroll position. */
  scroll?: TableScrollStateIf;
  /** Expanded / collapsed nodes of a tree table. */
  tree?: TableTreeStateIf;
  /** The ids of the checked rows. */
  checkedRowIds?: TableStateRowId[];
  /** The selection. */
  selection?: TableSelectionStateIf;
  /** The state of the header groups with a toggle. */
  headerGroups?: TableHeaderGroupStateIf[];
  /** Data of your application, e.g. the text of a filter field (must be JSON). */
  custom?: unknown;
}

/**
 * Width, visibility and (by its position in {@link TableStateIf.columns}) order of one column.
 *
 * @category State
 * @since 1.1.92
 */
export interface TableColumnStateIf {
  /** The property of the column ({@link ColumnDefIf.property}). */
  property: string;
  /** Width in px – only set for columns the user (or `setColumnWidth`) resized; otherwise the width of the code. */
  width?: number;
  /** `false` = hidden with {@link TableApi.setColumnVisible} (a collapsed header group is stored separately). */
  visible?: boolean;
}

/**
 * One sorted column.
 *
 * @category State
 * @since 1.1.92
 */
export interface TableSortStateIf {
  /** The property of the column. */
  property?: string;
  /** Only for tables without column definitions (and the format before 1.1.92): the column index. */
  columnIndex?: number;
  /** `"asc"` or `"desc"`. */
  sortState: SortState;
}

/**
 * The scroll position.
 *
 * @category State
 * @since 1.1.92
 */
export interface TableScrollStateIf {
  /** Horizontal scroll position in px. */
  left: number;
  /** Vertical scroll position in px. */
  top: number;
  /**
   * The id of the first visible row. If other rows are at the top after restoring `top` (new data), the table
   * scrolls to this row.
   */
  firstRowId?: TableStateRowId;
}

/**
 * Expanded and collapsed nodes of a tree. Only one of the two lists is set – the shorter one:
 * `expandedRowIds` = these nodes are expanded, all others collapsed; `collapsedRowIds` = the other way round.
 * `{ collapsedRowIds: [] }` = all expanded.
 *
 * @category State
 * @since 1.1.92
 */
export interface TableTreeStateIf {
  /** These nodes are expanded, all other nodes are collapsed. */
  expandedRowIds?: TableStateRowId[];
  /** These nodes are collapsed, all other nodes are expanded. */
  collapsedRowIds?: TableStateRowId[];
}

/**
 * The selection: rectangles between rows (ids) and columns (properties).
 *
 * @category State
 * @since 1.1.92
 */
export interface TableSelectionStateIf {
  /** Everything selected (⌘/Ctrl+A). */
  allSelected?: boolean;
  /** The selected rectangles. */
  ranges: TableStateRangeIf[];
  /** Rectangles removed from the selection (Ctrl/⌘+Alt-click). */
  negativeRanges?: TableStateRangeIf[];
}

/**
 * A rectangle of a selection. Without row ids it spans all rows (a selected column), without properties all columns
 * (a selected row); without `toRowId` / `toProperty` it reaches to the last row / column. Restored in the current
 * row order: a rectangle between the same first and last row. Tables without column definitions store only
 * row selections (columns have no property there).
 *
 * @category State
 * @since 1.1.92
 */
export interface TableStateRangeIf {
  fromRowId?: TableStateRowId;
  toRowId?: TableStateRowId;
  fromProperty?: string;
  toProperty?: string;
}

/**
 * Collapsed or expanded header group ({@link CellGroupIf} with `toggle: true`).
 *
 * @category State
 * @since 1.1.92
 */
export interface TableHeaderGroupStateIf {
  /** {@link CellGroupIf.id}, otherwise the path of the labels, e.g. `"Customer"` or `"2026/Q1"`. */
  id: string;
  /** `true` = collapsed. */
  closed: boolean;
}
