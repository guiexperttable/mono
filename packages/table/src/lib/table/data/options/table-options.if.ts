import type { MasterDetailOptionsIf } from "../../master-detail/master-detail-options.if";
import type { RowDragOptionsIf } from "../../row-drag/row-drag-options.if";
import type { FillHandleOptionsIf } from "../../fill/fill-handle-options.if";
import type { BatchEditOptionsIf } from "../../batch-edit/batch-edit-options.if";
import { DefaultRowHeightsIf } from "./default-row-heights.if";
import { TreeOptionsIf } from "./tree-options.if";
import { FilterFunction } from "../common/filter-function";
import { SortState } from "../common/sort-state.type";
import { SortedOptionsIf } from "./sorted-options.if";
import { AutoRestoreOptionsIf } from "./auto-restore-options.if";
import { GetEditRenderer } from "../../renderer/edit/edit-cell-renderer.type";
import { SelectionModelIf } from "../../selection/selection-model.if";
import { GetT } from "../common/get-t";
import { FocusModelIf } from "../../focus/focus-model.if";
import { ShortcutActionIdMapping } from "../../action/shortcut-actionid-mapping.type";
import { HeaderGroupOptionsIf } from './header-group-options.if';
import { AriaTextsIf } from "../../aria/aria-texts.if";
import { TableStateIf } from "../../state/table-state.if";
import { OverlayOptionsIf } from "./overlay-options.if";
import type { TableDirection } from "../../rtl/table-direction.type";

/**
 * Represents the options for configuring a table.
 *
 * | Class Property                   | Description                                                                                   |
 * |----------------------------------|-----------------------------------------------------------------------------------------------|
 * | headerSeparatorBorderVisible     | Indicates whether the header separator border is visible.                                      |
 * | footerSeparatorBorderVisible     | Indicates whether the footer separator border is visible or not.                                |
 * | fixedEastSeparatorBorderVisible  | Determines whether the fixed east separator border is visible.                                  |
 * | fixedWestSeparatorBorderVisible  | Indicates whether the fixed west separator border should be visible.                            |
 * | verticalBorderVisible            | Indicates whether the vertical border is visible.                                               |
 * | horizontalBorderVisible          | Represents the visibility of the horizontal border.                                             |
 * | overflowX                        | Determines the behavior of horizontal overflow for the table body (scroll port).               |
 * | overflowY                        | Determines the behavior of vertical overflow for the table body (scroll port).                 |
 * | tableTopBorderVisible            | Indicates whether the top border of a table is visible or hidden.                                |
 * | tableBottomBorderVisible         | Specifies whether the bottom border of a table is visible.                                       |
 * | hoverRowVisible                  | Flag indicating whether the hover color of a row is visible or not in general.                  |
 * | hoverColumnVisible               | Flag indicating whether the hover color of a column is visible or not in general.               |
 * | columnsResizable                 | Represents whether the columns are resizable.                                                    |
 * | columnsDraggable                 | Flag indicating whether the columns are draggable.                                               |
 * | columnResizeHandleWidthInPx      | The width of the column resize handle in pixels.                                                 |
 * | headerVerticalSeparator          | Represents whether a vertical separator should be displayed in a header.                        |
 * | footerVerticalSeparator          | Indicates whether a vertical separator should be displayed in the footer.                       |
 * | defaultRowHeights                | Represents the default row heights for a given table.                                            |
 * | headerToggleExpandCollapseIcons  | Indicates whether to show toggle icons in the header.                                            |
 * | treeOptions                      | Represents the options for configuring a tree.                                                   |
 * | headerGroupOptions               | Represents the options for expnded/collapsed icons of the header groups.                                                   |
 * | showCheckboxWihoutExtraColumn    | Indicates whether to show checkbox without an extra column.                                       |
 * | externalFilterFunction           | Represents the external filter function used to filter table rows.                                |
 * | sortedOptions                    | Represents a sorted options object.                                                              |
 * | sortOrder                        | Represents the sort order of the columns.                                                        |
 * | autoRestoreOptions               | Represents auto restoration options.                                                             |
 * | getEditRenderer                  | Retrieves the edit renderer for a specific action.                                                |
 * | getSelectionModel                | Retrieves the selection model for a specific object.                                              |
 * | getFocusModel                    | Retrieves the focus model of the component.                                                       |
 * | shortcutActionIdMapping          | Represents a mapping of shortcut action IDs.                                                     |
 *
 * Start from the defaults in {@link TableOptions} and change only what you need.
 *
 * @example
 * const tableOptions: TableOptionsIf = {
 *   ...new TableOptions(),
 *   hoverColumnVisible: false,
 *   columnsDraggable: false,
 *   defaultRowHeights: { header: 40, body: 30, footer: 36 }
 * };
 *
 * @see Training: [TableOptions: behaviour and look](https://gui.expert/training/table-options/)
 *
 * @category Options
 */
export interface TableOptionsIf {


  /**
   * The delay in milliseconds used for debouncing the resize event.
   *
   * @type {number}
   */
  resizeEventDebounceDelay: number;

  /**
   * Indicates whether the header separator border is visible.
   *
   * @type {boolean}
   */
  headerSeparatorBorderVisible: boolean;
  /**
   * Indicates whether the footer separator border is visible or not.
   *
   * @type {boolean}
   */
  footerSeparatorBorderVisible: boolean;
  /**
   * Determines whether the fixed east separator border is visible.
   *
   * @type {boolean}
   */
  fixedEastSeparatorBorderVisible: boolean;
  /**
   * Indicates whether the fixed west separator border should be visible.
   *
   * @type {boolean}
   */
  fixedWestSeparatorBorderVisible: boolean;
  /**
   * Indicates whether the vertical border is visible.
   *
   * @type {boolean}
   */
  verticalBorderVisible: boolean;
  /**
   * Represents the visibility of the horizontal border.
   *
   * @type {boolean}
   */
  horizontalBorderVisible: boolean;

  /**
   * The value of the css `overflowX` determines the behavior of horizontal overflow for the table body (scroll port).
   *
   * @typedef {'auto' | 'scroll'} OverflowX
   */
  overflowX: "auto" | "scroll";
  /**
   * The value of the css `overflowX` determines the behavior of vertical overflow for the table body (scroll port).
   *
   * @typedef {'auto' | 'scroll'} OverflowX
   */
  overflowY: "auto" | "scroll";

  /**
   * Indicates whether the top border of a table is visible or hidden.
   *
   * @type {boolean}
   */
  tableTopBorderVisible: boolean;
  /**
   * Specifies whether the bottom border of a table is visible.
   *
   * @type {boolean}
   */
  tableBottomBorderVisible: boolean;
  /**
   * Flag indicating whether the hover color of a row is visible or not in general.
   * If true, the row get the hover background color while the mouse is over the row.
   *
   * @type {boolean}
   */
  hoverRowVisible: boolean;
  /**
   * Flag indicating whether the hover color of a column is visible or not in general.
   * If true, the column get the hover background color while the mouse is over the column.
   *
   * @typedef {boolean} hoverColumnVisible
   */
  hoverColumnVisible: boolean;
  /**
   * Represents whether the columns are resizable.
   *
   * @type {boolean}
   */
  columnsResizable: boolean;
  /**
   * Flag indicating whether the columns are draggable.
   *
   * @type {boolean}
   */
  columnsDraggable: boolean;
  /**
   * The width of the column resize handle in pixels.
   *
   * @type {number}
   */
  columnResizeHandleWidthInPx: number;

  /**
   * Represents whether a vertical separator should be displayed in a header.
   *
   * @type {boolean}
   * @since 1.0.0
   */
  headerVerticalSeparator: boolean;
  /**
   * Indicates whether a vertical separator should be displayed in the footer.
   *
   * @type {boolean}
   */
  footerVerticalSeparator: boolean;

  /**
   * Row heights of header, body and footer in px (default 34 / 34 / 34). Read by {@link TableFactory.createTableModel}
   * when it creates the area models – pass the options there as `tableOptions`, too.
   */
  defaultRowHeights: DefaultRowHeightsIf;

  /** Reserved – currently not evaluated (tree tables always show the expand-all / collapse-all icon in the top left header cell). */
  headerToggleExpandCollapseIcons: boolean;

  /** Icons and behaviour of tree tables (arrows, indentation). See {@link TreeOptionsIf}. */
  treeOptions: TreeOptionsIf;

  /** Icons of collapsible header groups ({@link AreaModelCellGroups}). */
  headerGroupOptions: HeaderGroupOptionsIf;

  /**
   * Indicates whether to show checkbox without an extra column.
   * If true and the row is checkable, a checkbox is rendered in the first column.
   * If false and the row is checkable, a checkbox is rendered in an extra column left to the first column.
   *
   * @see Training: [Tree table with checkboxes](https://gui.expert/training/tree-table/)
   */
  showCheckboxWihoutExtraColumn: boolean;

  /**
   * Your filter: called for every row, return `true` to show it. After changing the filter criteria call
   * {@link TableApi.externalFilterChanged} – the table filters again and keeps the sort order.
   *
   * @example
   * const filter = { text: "" };
   * const tableOptions: TableOptionsIf = {
   *   ...new TableOptions(),
   *   externalFilterFunction: (order: Order) => order.customer.toLowerCase().includes(filter.text)
   * };
   * searchInput.addEventListener("input", () => {
   *   filter.text = searchInput.value.toLowerCase();
   *   tableApi.externalFilterChanged();
   * });
   *
   * @see Training: [Filtering with a live search](https://gui.expert/training/filtering/)
   */
  externalFilterFunction: FilterFunction<any> | undefined;

  /** The sort icons shown in sortable header cells. */
  sortedOptions: SortedOptionsIf;

  /**
   * The order of the sort states on repeated double-clicks on a header, default `["asc", "desc"]`.
   * Add `""` to get "unsorted" as third state. Per column: {@link ColumnDefIf.sortStatesOrder}.
   */
  sortOrder: SortState[],

  /**
   * Remember sorting, scroll position and expanded tree nodes in `localStorage`. Off by default.
   *
   * @see {@link AutoRestoreOptions}
   * @see Training: [Remember the state](https://gui.expert/training/persist-state/)
   */
  autoRestoreOptions?: AutoRestoreOptionsIf<any>;

  /**
   * The editor for a cell, if the column has no own {@link ColumnDefIf.getEditRenderer}.
   * Default: a text input ({@link InputCellRenderer}).
   *
   * @see Training: [Inline editing](https://gui.expert/training/inline-editing/)
   */
  getEditRenderer?: GetEditRenderer;

  /**
   * Returns the selection model of the table. Without it every table creates its own `new SelectionModel()`
   * of type `"none"` – nothing can be selected.
   *
   * @example
   * const selectionModel = new SelectionModel("row", "single");
   * const tableOptions: TableOptionsIf = { ...new TableOptions(), getSelectionModel: () => selectionModel };
   *
   * @see Training: [Select cells, rows and ranges](https://gui.expert/training/selection-and-copy/)
   */
  getSelectionModel?: GetT<SelectionModelIf>;

  /** Returns the focus model of the table. Default: every table creates its own {@link FocusModel}. */
  getFocusModel?: GetT<FocusModelIf>;

  /**
   * Own keyboard shortcuts: maps a shortcut (e.g. `"ctrl+c"`, `"f2"`) to an {@link ActionId}.
   * Default: {@link WindowsShortcutActionIdMapping} resp. {@link OsxShortcutActionIdMapping}.
   */
  shortcutActionIdMapping?: ShortcutActionIdMapping;

  /** Switch off all keyboard shortcuts of the table (copy, select all, navigation, F2 …). */
  shortcutActionsDisabled: boolean;

  /**
   * The accessible name of the table for screen readers (`aria-label` of the grid), e.g. `"Orders"`.
   * Prefer {@link ariaLabelledBy} if the page shows a title.
   *
   * @example
   * const tableOptions: TableOptionsIf = { ...new TableOptions(), ariaLabel: "Orders" };
   *
   * @since 1.1.91
   * @see Training: [Accessible tables: keyboard and screen readers](https://gui.expert/training/accessibility/)
   */
  ariaLabel?: string;

  /**
   * The id of the element that names the table, e.g. a heading above it (`aria-labelledby` of the grid).
   * Takes precedence over {@link ariaLabel}.
   *
   * @example
   * // <h2 id="orders-title">Orders 2026</h2> <div class="table-div"></div>
   * const tableOptions: TableOptionsIf = { ...new TableOptions(), ariaLabelledBy: "orders-title" };
   *
   * @since 1.1.91
   */
  ariaLabelledBy?: string;

  /**
   * The id of an element that describes the table, e.g. a hint below it (`aria-describedby` of the grid).
   *
   * @example
   * // <p id="orders-hint">Double click a header to sort.</p>
   * const tableOptions: TableOptionsIf = { ...new TableOptions(), ariaDescribedBy: "orders-hint" };
   *
   * @since 1.1.91
   */
  ariaDescribedBy?: string;

  /**
   * Own texts for screen readers – announcements (sorting, filter, copy, select all) and the names of the row
   * checkboxes and header group toggles. Functions you leave out keep their English default ({@link AriaTexts}).
   *
   * @example
   * const tableOptions: TableOptionsIf = {
   *   ...new TableOptions(),
   *   ariaTexts: {
   *     filtered: (rowCount: number) => `${rowCount} Zeilen`,
   *     copied: (cellCount: number) => `${cellCount} Zellen kopiert`,
   *     selectRow: (rowNumber: number) => `Zeile ${rowNumber} auswählen`,
   *   },
   * };
   *
   * @since 1.1.91
   */
  ariaTexts?: Partial<AriaTextsIf>;

  /**
   * Texts and behaviour of the overlays over the body: "Loading…" ({@link TableApi.showLoadingOverlay}),
   * "No rows to show" (empty body, automatic) and "No matching rows" (the filter hides all rows).
   * Fields you leave out keep their default ({@link OverlayOptions}).
   *
   * @example
   * const tableOptions: TableOptionsIf = {
   *   ...new TableOptions(),
   *   overlayOptions: { noRowsText: "No orders yet", blockInteractionWhileLoading: false },
   * };
   *
   * @since 1.1.92
   */
  overlayOptions?: Partial<OverlayOptionsIf>;

  /**
   * Row drag: managed or events only, multi-row drag, tree drop, auto-scroll (see {@link RowDragOptionsIf}). The drag
   * handles come from {@link ColumnDefIf.rowDrag}. Fields you leave out keep their default ({@link RowDragOptions}).
   *
   * @example
   * const tableOptions: TableOptionsIf = {
   *   ...new TableOptions(),
   *   rowDragOptions: { managed: false },   // only events – e.g. the server decides
   * };
   *
   * @since 1.1.95
   */
  rowDragOptions?: Partial<RowDragOptionsIf>;

  /**
   * The fill handle: a small square at the bottom right corner of the selected range. Dragging it fills the
   * neighbouring cells (copy, or a series: 1, 2, 3 …, dates, `Item 1` → `Item 2`); ⌥/Alt switches between series and
   * copy. Keyboard: Ctrl/⌘+D fills down, Ctrl/⌘+R fills right. Needs a selection model of the type `"range"`;
   * only editable cells are filled. `true` = defaults ({@link FillHandleOptions}).
   *
   * @example
   * const selectionModel = new SelectionModel("range", "multi");   // one model – not a new one per call
   * const tableOptions: TableOptionsIf = {
   *   ...new TableOptions(),
   *   getSelectionModel: () => selectionModel,
   *   fillHandle: true,
   * };
   *
   * @since 1.1.96
   */
  fillHandle?: boolean | Partial<FillHandleOptionsIf>;

  /**
   * Batch edit always on: edited and filled values are collected (marked `ge-table-cell-pending`) and written with
   * {@link TableApi.commitBatchEdit} or discarded with {@link TableApi.cancelBatchEdit}. Without it, start a batch
   * edit with {@link TableApi.startBatchEdit} (it ends with commit or cancel).
   *
   * @example
   * const tableOptions: TableOptionsIf = { ...new TableOptions(), batchEdit: true };
   *
   * @since 1.1.96
   */
  batchEdit?: boolean | Partial<BatchEditOptionsIf>;

  /**
   * Master/detail: master rows get an expand icon; below an expanded row a detail row over the full width shows any
   * content (a nested table, a form, a framework component – see {@link MasterDetailOptionsIf}). Only for flat body
   * models. Fields you leave out keep their default ({@link MasterDetailOptions}); `detailRenderer` is required.
   *
   * @example
   * const tableOptions: TableOptionsIf = {
   *   ...new TableOptions(),
   *   masterDetail: {
   *     detailHeight: "auto",
   *     detailRenderer: (container, row) => { container.textContent = `Notes: ${row.notes}`; }
   *   }
   * };
   *
   * @since 1.1.97
   */
  masterDetail?: Partial<MasterDetailOptionsIf>;

  /**
   * Writing direction: `"ltr"` (default), `"rtl"` for Arabic, Hebrew, Persian, Urdu … (first column on the right,
   * horizontal scrolling, fixed columns, tree indent, resize handles and arrow keys mirrored) or `"auto"` (the
   * direction of the page: `dir="rtl"` on `<html>` or a parent element). Read once when the table is built – a new
   * options object rebuilds the table in the wrappers.
   *
   * In right-to-left, the "left" and "right" in names of the API mean **start** and **end**:
   * `fixedLeftColumnCount` fixes columns at the start (right), `fixedRightColumnCount` at the end (left),
   * `ge-table-text-align-left` aligns to the start. The table sets `dir` on its host element (also `dir="ltr"`).
   *
   * @example
   * const tableOptions: TableOptionsIf = { ...new TableOptions(), direction: "rtl" };
   *
   * @since 1.1.98
   */
  direction?: TableDirection;

  /**
   * The state the table starts with: column layout, sorting, tree, checked and selected rows … – e.g. loaded from
   * your server ({@link TableApi.getState}, {@link EventListenerIf.onStateChanged}). A state stored by
   * {@link autoRestoreOptions} wins over it, part by part.
   *
   * @example
   * const saved = (await (await fetch("/api/prefs/orders")).json()) as TableStateIf | null;
   * const tableOptions: TableOptionsIf = { ...new TableOptions(), initialState: saved ?? undefined };
   *
   * @since 1.1.92
   */
  initialState?: Partial<TableStateIf>;

  /**
   * Delay in ms between the last change of the state (resize, sort, scroll …) and
   * {@link EventListenerIf.onStateChanged} / the save of {@link autoRestoreOptions}. Default 300.
   *
   * @since 1.1.92
   */
  stateChangedDebounceDelay?: number;
}
