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
import { OverlayOptionsIf } from "./overlay-options.if";

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
   * @since 1.1.91
   */
  overlayOptions?: Partial<OverlayOptionsIf>;
}
