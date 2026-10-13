import { SortState } from "./data/common/sort-state.type";
import {TableScope} from "./table-scope";
import {ColumnDefIf} from "./data/tablemodel/column/column-def.if";
import {TableCellUpdateEventIf} from "./data/common/event/input/table-cell-update-event.if";
import { SelectionModel } from './selection/selection-model';
import { ActionId } from './action/action-id.type';
import { ShortcutActionIdMapping } from './action/shortcut-actionid-mapping.type';
import { SelectionModelIf } from './selection/selection-model.if';
import { AreaIdent } from './data/tablemodel/area-ident.type';
import { TableModelIf } from './data/tablemodel/table-model.if';
import { AreaModelIf } from './data/tablemodel/areamodel/area-model.if';
import { AreaModelObjectArray } from './data/tablemodel/areamodel/area-model-object-array';
import { isTreeRow } from './instanceof-workaround';
import { TreeRowIf } from './data/common/tree-row-if';


/**
 * The public API of one table – everything you do with a table after it has been created:
 * scrolling, sorting, filtering, selection, copy, Excel export, updating cells and rows, repainting.
 *
 * Every table has exactly one `TableApi`. You never create it yourself – you get it:
 *
 * | Where | How |
 * |---|---|
 * | Plain TypeScript | `new TableScope(host, model, new SimpleDomService(), options, listener).firstInit().getApi()` |
 * | Web Component | `el.addEventListener("tableReady", e => e.detail)` |
 * | React / Preact / Solid | `<GuiexpertTable tableReady={api => …} />` |
 * | Vue 3 | `<GuiexpertTable @tableReady="api => …" />` |
 * | Svelte 5 | `<GuiexpertTable onTableReady={api => …} />` |
 * | Angular | `<guiexpert-table (tableReady)="onReady($event)" />` |
 *
 * ## The most important methods
 *
 * | Task | Methods |
 * |---|---|
 * | scroll | {@link scrollToIndex}, {@link ensureRowIsVisible}, {@link ensureColumnIsVisible}, {@link scrollToPixel}, {@link getFirstVisibleRowIndex} |
 * | sort | {@link sortByColumn}, {@link sort}, {@link reSort} |
 * | filter | {@link externalFilterChanged} (with {@link TableOptionsIf.externalFilterFunction}) |
 * | export | {@link copyToClipboard}, {@link downloadExcel} |
 * | change data | {@link updateCells}, {@link setRows}, {@link addRows}, {@link updateRows}, {@link removeRows} |
 * | redraw | {@link repaint} (same row count), {@link repaintHard} (row count or heights changed) |
 * | columns | {@link autoResizeColumns}, {@link setColumnWidth}, {@link recalcColumnWidths} |
 * | tree | {@link expandAll}, {@link collapseAll}, {@link setRowExpanded} |
 * | lifecycle | {@link destroy} |
 *
 * @example
 * // plain TypeScript: create a table and talk to it
 * const tableModel = TableFactory.createTableModel({ rows: orders });
 * const tableApi = new TableScope(host, tableModel, new SimpleDomService(), new TableOptions(), new EventAdapter())
 *   .firstInit()
 *   .getApi();
 *
 * tableApi.scrollToIndex(0, 50_000);                  // column 0, row 50,000
 * tableApi.sortByColumn("total", "desc");             // like a double-click on the header
 * await tableApi.copyToClipboard();                   // the current selection, tab-separated
 * await tableApi.downloadExcel("orders.xlsx");        // the current view as .xlsx
 *
 * @example
 * // live data: change single cells, only the visible ones are redrawn
 * tableApi.updateCells([
 *   new TableCellUpdateEvent("body", 3, 2, 101.5, { "tick-up": true }),
 *   new TableCellUpdateEvent("body", 3, 3, 0.42)
 * ]);
 *
 * @example
 * // replace the rows of an object-array table – the row count changes, so repaint hard
 * tableApi.setRows(newOrders);
 * tableApi.externalFilterChanged();                   // only if a filter function is set
 * tableApi.repaintHard();
 *
 * @see Training: [Your first table](https://gui.expert/training/first-table/),
 *   [Sorting](https://gui.expert/training/sorting/), [Filtering](https://gui.expert/training/filtering/),
 *   [Excel export](https://gui.expert/training/excel-export/), [Live data](https://gui.expert/training/live-data/)
 *
 * @category Table & API
 */
export class TableApi {


  constructor(
    public readonly tableScope: TableScope
  ) {
  }



  /**
   * Updates the cells in the table with the provided cell update events.
   *
   * This method allows you to update specific cells in the table without requiring a full table repaint,
   * which can significantly improve performance when updating large tables frequently.
   *
   * @param {TableCellUpdateEventIf[]} events - An array of cell update events, each defining a single cell update operation.
   *        Each event must specify:
   *        - area: The table area to update ('header', 'body', or 'footer')
   *        - rowIndex: The row index of the cell to update
   *        - columnIndex: The column index of the cell to update
   *        - value: The new value to set for the cell
   *        - cssClasses: Optional object mapping CSS class names to boolean values
   *          (true to add the class, false to remove it)
   *
   * @param {boolean} [repaintAll=false] - Whether to repaint the entire table after updating cells.
   *        - If true: All cells will be repainted after updating (slower but ensures visual consistency)
   *        - If false: Only the modified cells will be repainted (faster, recommended for frequent updates)
   *
   * @returns {void}
   *
   * @example
   * // Update a single cell with a new value and CSS classes
   * tableApi.updateCells([{
   *   area: 'body',
   *   rowIndex: 3,
   *   columnIndex: 2,
   *   value: 42,
   *   cssClasses: {
   *     'highlight': true,   // Add 'highlight' class
   *     'error': false       // Remove 'error' class if present
   *   }
   * }]);
   *
   * @example
   * // Update multiple cells at once
   * tableApi.updateCells([
   *   {
   *     area: 'body',
   *     rowIndex: 1,
   *     columnIndex: 1,
   *     value: 'New Value 1',
   *     cssClasses: { 'updated': true }
   *   },
   *   {
   *     area: 'body',
   *     rowIndex: 2,
   *     columnIndex: 3,
   *     value: 'New Value 2',
   *     cssClasses: { 'updated': true }
   *   }
   * ]);
   *
   * @example
   * // Update cells and repaint the entire table
   * tableApi.updateCells([
   *   { area: 'body', rowIndex: 0, columnIndex: 0, value: 'Hello', cssClasses: { 'bg-green-0': true } },
   *   { area: 'body', rowIndex: 1, columnIndex: 1, value: 'World', cssClasses: { 'bg-red-0': true } }
   * ], true);
   *
   * @example
   * // High-performance animation example (update without full repaint)
   * function animateCell() {
   *   const value = Math.sin(Date.now() / 1000) * 50;
   *   const cssClasses = {
   *     'positive': value > 0,
   *     'negative': value < 0
   *   };
   *
   *   tableApi.updateCells([{
   *     area: 'body',
   *     rowIndex: 0,
   *     columnIndex: 0,
   *     value: Math.round(value),
   *     cssClasses
   *   }]);
   *
   *   requestAnimationFrame(animateCell);
   * }
   * animateCell();
   */
  updateCells(
    events: TableCellUpdateEventIf[],
    repaintAll: boolean = false): void {
    this.tableScope.updateCells(events, repaintAll);
  }


  /**
   * Notifies the table that an external filter has been changed and needs to be applied.
   *
   * This method is used when an external filter condition (defined by `tableOptions.externalFilterFunction`)
   * has changed and the table needs to refresh its display to reflect the new filtering criteria.
   *
   * When called, this method:
   * 1. Applies the external filter function to all rows
   * 2. Clears the current selection (by default)
   * 3. Scrolls to the top of the table
   * 4. Recalculates table dimensions
   * 5. Repaints the table to display only the filtered rows
   *
   * @example
   * ```typescript
   * // Define an external filter function in your table options
   * const tableOptions = {
   *   externalFilterFunction: (row: MyRowType) => {
   *     // Return true to include the row, false to filter it out
   *     return row.status === 'active';
   *   }
   * };
   *
   * // Initialize your table with these options
   * const tableApi = new TableApi(tableScope);
   *
   * // Later, when filter criteria change (e.g., in a search input handler)
   * function onFilterTextChanged() {
   *   // Update the filter function if needed
   *   tableOptions.externalFilterFunction = (row: MyRowType) => {
   *     return row.name.includes(searchText);
   *   };
   *
   *   // Apply the updated filter
   *   tableApi.externalFilterChanged();
   * }
   * ```
   *
   * @returns {void}
   * @see TableScope.externalFilterChanged
   */
  externalFilterChanged(): void {
    this.tableScope.externalFilterChanged();
  };

  /**
   * Scrolls the table content to the specified pixel coordinates.
   *
   * This method allows programmatic scrolling of the table viewport to exact pixel positions.
   * It delegates the scrolling operation to the underlying TableScope instance.
   *
   * @param {number} px - The horizontal pixel coordinate to scroll to. Defaults to 0 (leftmost position).
   * @param {number} py - The vertical pixel coordinate to scroll to. Defaults to 0 (topmost position).
   * @returns {void}
   *
   * @example
   * // Scroll to the top-left corner of the table
   * tableApi.scrollToPixel(0, 0);
   *
   * @example
   * // Scroll 200 pixels horizontally and 150 pixels vertically
   * tableApi.scrollToPixel(200, 150);
   *
   * @example
   * // Scroll only vertically, keeping the current horizontal position
   * // (an omitted or undefined px means 0; for rows use scrollToIndex(-1, rowIndex))
   * tableApi.scrollToPixel(tableApi.getTableScope().scrollViewport.scrollLeft, 300);
   *
   * @example
   * // Example in a component that needs precise scrolling control
   * class TableScroller {
   *   private tableApi: TableApi;
   *
   *   constructor(tableApi: TableApi) {
   *     this.tableApi = tableApi;
   *   }
   *
   *   scrollToPosition(x: number, y: number) {
   *     // Scroll to exact pixel coordinates
   *     this.tableApi.scrollToPixel(x, y);
   *   }
   *
   *   scrollHalfway() {
   *     const tableModel = this.tableApi.getTableModel();
   *     const totalWidth = tableModel.getContentWidthInPixel();
   *     const totalHeight = tableModel.getContentHeightInPixel();
   *
   *     // Scroll to the middle of the table content
   *     this.tableApi.scrollToPixel(totalWidth / 2, totalHeight / 2);
   *   }
   * }
   *
   * @see {@link scrollToIndex} - For scrolling based on row and column indices
   * @see {@link ensureRowIsVisible} - For scrolling to make a specific row visible
   */
  scrollToPixel(px: number = 0, py: number = 0) {
    this.tableScope.scrollToPixel(px, py);
  }



  /**
   * Scrolls the table to display the specified row and column indices at the top-left corner of the viewport.
   *
   * The row becomes the first row of the body, the column the first column of the scrollable (center) part –
   * as far as the scroll range allows: the last columns and rows cannot move further than to the right/bottom edge.
   *
   * Fixed columns (`fixedLeftColumnCount` / `fixedRightColumnCount`) are always visible: a fixed west column scrolls
   * back to the start (x = 0), a fixed east column – and `-1` or any other index outside the columns – keeps the
   * current horizontal position.
   *
   * @param {number} indexX - The column index (model index, fixed columns included) to scroll to.
   *   Defaults to 0 (first column). `-1` keeps the horizontal position.
   * @param {number} indexY - The vertical index (row) to scroll to. Defaults to 0 (topmost row).
   * @returns {void}
   *
   * @example
   * // Scroll to the 5th row, keeping the current horizontal scroll position
   * tableApi.scrollToIndex(-1, 5);
   *
   * @example
   * // Scroll to column 3, row 10
   * tableApi.scrollToIndex(3, 10);
   *
   * @example
   * // Scroll to column 3, keeping the rows that are currently shown
   * tableApi.scrollToIndex(3, tableApi.getFirstVisibleRowIndex());
   *
   * @see {@link scrollToPixel} - For scrolling to specific pixel coordinates
   * @see {@link ensureRowIsVisible} - For scrolling to make a specific row visible
   */
  scrollToIndex(indexX: number = 0, indexY: number = 0) {
    this.tableScope.scrollToIndex(indexX, indexY);
  }

  /**
   * Shows or hides the header and repaints the table.
   *
   * A hidden header takes no space – the body moves up and shows more rows. The header rows stay in the model
   * (labels, sort icons, header groups), so `setHeaderVisible(true)` brings them back unchanged.
   * Requires a {@link TableModel} (what all factories create).
   *
   * @param {boolean} [visible=true] - false hides the header
   * @returns {void}
   *
   * @example
   * // a compact view without column headers
   * tableApi.setHeaderVisible(false);
   *
   * @example
   * // toggle from a button
   * document.querySelector("#toggle-header")!.addEventListener("click", () =>
   *   tableApi.setHeaderVisible(!tableApi.isHeaderVisible()));
   */
  setHeaderVisible(visible: boolean = true) {
    this.tableScope.setHeaderVisible(visible);
  }

  /**
   * Shows or hides a column and repaints the table.
   *
   * The column keeps its definition, its position (also when other columns are dragged) and its width:
   * a hidden column is just not rendered (width 0), not copied ({@link copyToClipboard}) and not exported
   * ({@link downloadExcel}). Showing it again restores the previous width. Works for fixed columns, too.
   *
   * The same as {@link ColumnDefIf.isVisible} – this method sets it to {@link TrueFn} / {@link FalseFn} (an own
   * `isVisible` function of the column is replaced). Columns without a column definition (e.g. `bodyData` +
   * `columnSizes` without `columnDefs`) can't be hidden.
   *
   * @param {number | string | ColumnDefIf} column - column index (fixed columns included), property (e.g. `"category"`)
   *   or the column definition
   * @param {boolean} [visible=true] - false hides the column
   * @returns {boolean} false if the column (definition) does not exist
   *
   * @example
   * // hide a column by property, show it again later
   * tableApi.setColumnVisible("category", false);
   * tableApi.setColumnVisible("category", true);
   *
   * @example
   * // a checkbox list "visible columns"
   * tableApi.getTableModel().getColumnDefs()?.forEach((columnDef, index) => {
   *   const checkbox = document.createElement("input");
   *   checkbox.type = "checkbox";
   *   checkbox.checked = tableApi.isColumnVisible(index);
   *   checkbox.addEventListener("change", () => tableApi.setColumnVisible(columnDef, checkbox.checked));
   *   document.body.append(checkbox, columnDef.headerLabel);
   * });
   */
  setColumnVisible(column: number | string | ColumnDefIf, visible: boolean = true): boolean {
    return this.tableScope.setColumnVisible(column, visible);
  }

  /**
   * Returns whether a column is visible ({@link ColumnDefIf.isVisible}, see {@link setColumnVisible}).
   * Columns without a column definition are always visible.
   *
   * @param {number | string | ColumnDefIf} column - column index, property or column definition
   * @return {boolean} - True if the column is visible, false if it is hidden or does not exist.
   *
   * @example
   * if (!tableApi.isColumnVisible("category")) {
   *   tableApi.setColumnVisible("category", true);
   * }
   */
  isColumnVisible(column: number | string | ColumnDefIf): boolean {
    const tableModel = this.tableScope.tableModel;
    if (tableModel.isColumnVisible) {
      return tableModel.isColumnVisible(column);
    }
    const columnDefs = tableModel.getColumnDefs() ?? [];
    const columnDef = typeof column === "number"
      ? columnDefs[column]
      : typeof column === "string" ? columnDefs.filter(cd => cd.property === column)[0] : column;
    return columnDef ? columnDef.isVisible?.() !== false
      : typeof column === "number" && column >= 0 && column < tableModel.getColumnCount();
  }

  /**
   * Checks if the header is visible: it has at least one row and is not hidden with {@link setHeaderVisible}.
   *
   * @return {boolean} - Returns true if the header is visible, otherwise returns false.
   *
   * @example
   * const headerShown = tableApi.isHeaderVisible();
   */
  isHeaderVisible(): boolean {
    return this.tableScope.tableModel.isHeaderVisibe();
  }

  /**
   * Shows or hides the footer and repaints the table.
   *
   * A hidden footer takes no space – the body gets taller. Its rows stay in the model, so `setFooterVisible(true)`
   * brings them back (an own footer model, e.g. totals, is asked for its values again).
   * Requires a {@link TableModel} (what all factories create).
   *
   * @param {boolean} [visible=true] - false hides the footer
   * @returns {void}
   *
   * @example
   * // show the totals footer only while a filter is active
   * tableApi.setFooterVisible(!!tableOptions.externalFilterFunction);
   */
  setFooterVisible(visible: boolean = true) {
    this.tableScope.setFooterVisible(visible);
  }

  /**
   * Determines if the footer is visible: it has at least one row and is not hidden with {@link setFooterVisible}.
   *
   * @returns {boolean} True if the footer is visible, false otherwise.
   *
   * @example
   * const footerShown = tableApi.isFooterVisible();
   */
  isFooterVisible(): boolean {
    return this.tableScope.tableModel.isFooterVisibe();
  }


  /**
   * Repaints the table.
   *
   * This method refreshes the visual representation of the table by delegating to the
   * tableScope's repaint functionality. Use this method whenever the table's visual state
   * needs to be updated after data changes, selection changes, or any modifications that
   * affect the rendered output.
   *
   * Repainting the table ensures that all visible cells, rows, and styling reflect the
   * current state of the underlying data model and configuration settings.
   *
   * @example
   * // Update data and repaint the table
   * const tableApi = new TableApi(tableScope);
   * tableApi.setRows(newData);
   * tableApi.repaint();
   *
   * @example
   * // Update selection and repaint to show the visual change
   * tableApi.getSelectionModel()?.togglePoint(2, 3);
   * tableApi.repaint();
   *
   * @example
   * // After changing values in the row objects yourself, repaint to show them
   * orders[0].status = "paid";
   * tableApi.repaint();
   *
   * @returns {void}
   */
  repaint() {
    this.tableScope.repaint();
  }

  /**
   * Releases the table: removes all DOM listeners (incl. the window resize listener), stops the
   * resize observer, calls the cleanup functions of all cell renderers and clears the host element.
   * The framework wrappers call it automatically when they are unmounted or receive a new table model.
   *
   * @example
   * // Plain TS: replace the table with a new model
   * tableApi.destroy();
   * const scope = new TableScope(hostDiv, newModel, new SimpleDomService(), new TableOptions(), new EventAdapter());
   * scope.firstInit();
   *
   * @returns {void}
   */
  destroy(): void {
    this.tableScope.destroy();
  }




  /**
   * Performs a complete repaint of the table by triggering a hard repaint on the underlying table scope.
   *
   * A hard repaint is more thorough than a regular repaint and performs the following operations:
   * - Recalculates the height and padding of the table model
   * - Resets the size of the wrapper div elements
   * - Adjusts containers and rows positioning
   * - Makes additional adjustments after scrolling
   *
   * Use this method when regular repaint isn't sufficient, such as when:
   * - Table dimensions have significantly changed
   * - The structure of data has been modified (rows/columns added or removed)
   * - The table layout needs complete recalculation
   * - After major DOM changes affecting the table's container
   *
   * @example
   * // Example 1: Basic usage
   * tableApi.repaintHard();
   *
   * @example
   * // Example 2: Using after major data changes
   * tableApi.setRows(newDataSet);
   * tableApi.repaintHard();
   *
   * @example
   * // Example 3: Using after resizing a container
   * window.addEventListener('resize', () => {
   *   tableApi.repaintHard();
   * });
   *
   * @example
   * // Example 4: Using after changing ColumnDefIf.isVisible yourself
   * // (setColumnVisible() does this on its own)
   * column.isVisible = FalseFn;
   * tableApi.repaintHard();
   *
   * @returns {void} This method doesn't return a value
   */
  repaintHard() {
    this.tableScope.repaintHard();
  }


  /**
   * Recalculates the column widths of the table.
   *
   * @param {number} clientWidth - The width of the client area.
   *
   * @return {void}
   */
  recalcColumnWidths(clientWidth?: number) {
    this.tableScope.recalcColumnWidths(clientWidth);
  }



  /**
   * Clears the current selection in the table.
   *
   * This method removes any selected cells, rows, or columns in the table.
   * It provides a convenient way to programmatically clear all selections in the table
   * without having to access the underlying selection model directly.
   *
   * When called, this method delegates to the table scope's clearSelection method with
   * a parameter value of true, which ensures the table is automatically repainted after
   * the selection is cleared.
   *
   * @example
   * // Clear all selections in the table (e.g. from a "reset" button)
   * tableApi.clearSelection();
   *
   * @returns {void}
   */
  clearSelection() {
    this.tableScope.clearSelection(true);
  }


  /**
   * Sets the selection model for the table.
   *
   * This method allows you to replace the current selection model with a new one,
   * which controls how cells, rows, or columns can be selected in the table.
   *
   * @param {SelectionModel} sm - The new selection model to be set. This model defines
   *                              the selection behavior including selection type (none, cell, row, column),
   *                              selection mode (single, multi), and manages the selected ranges.
   * @param {boolean} [repaint=true] - Whether to repaint the table after changing the selection model.
   *                                   Default is true, which immediately reflects the change visually.
   *                                   Set to false if you want to avoid immediate repainting.
   *
   * @example
   * // Create a new selection model with row selection and multi-select mode
   * const selectionModel = new SelectionModel("row", "multi");
   *
   * // Set the new selection model and repaint the table
   * tableApi.setSelectionModel(selectionModel);
   *
   * // Set a selection model without repainting (if you plan to make more changes)
   * tableApi.setSelectionModel(selectionModel, false);
   * // ... make other changes ...
   * tableApi.repaint(); // Now repaint once
   *
   * @returns {void}
   */
  setSelectionModel(sm: SelectionModel, repaint: boolean = true){
    this.tableScope.setSelectionModel(sm, repaint);
  }


  /**
   * Triggers the action with the given action ID.
   * This function can be invoked programmatically.
   *
   * @param {ActionId} actionId - The ID of the action to trigger.
   * @return {void}
   */
  triggerAction(actionId: ActionId){
    this.tableScope.onActionTriggered(actionId);
  }


  /**
   * Retrieves the shortcut action mapping from the table's shortcut service.
   *
   * This method provides access to the keyboard shortcut configuration that defines
   * which keys trigger specific actions in the table. The mapping contains key-value
   * pairs where:
   * - Keys are string representations of keyboard shortcuts (e.g., "ctrl+c", "shift+arrow_down")
   * - Values are ActionId values representing the corresponding table actions
   *
   * This mapping can be useful for:
   * - Displaying available shortcuts to users
   * - Creating custom shortcut documentation
   * - Dynamically checking which actions are available via keyboard
   * - Extending or integrating with the table's shortcut system
   *
   * @returns {ShortcutActionIdMapping} An object mapping shortcut key combinations to their corresponding action IDs.
   *          For example: { "ctrl+c": "COPY_2_CLIPBOARD", "arrow_down": "NAVIGATE_DOWN" }
   *
   * @example
   * // Get all available shortcuts in the table
   * const shortcuts = tableApi.getShortcutActionMapping();
   *
   * // Check if a specific shortcut exists
   * if (shortcuts["ctrl+c"]) {
   *   console.log("Copy shortcut is available with action:", shortcuts["ctrl+c"]);
   * }
   *
   * // Display available shortcuts in the UI
   * Object.entries(shortcuts).forEach(([key, actionId]) => {
   *   console.log(`${key}: ${actionId}`);
   * });
   */
  getShortcutActionMapping(): ShortcutActionIdMapping {
    return this.tableScope.shortcutService.getShortcutActionMapping();
  }



  /**
   * Copies the selected data from the table to the clipboard.
   *
   * This method leverages the copyService to extract and copy the currently selected data
   * from the table. It works with the current selection state and focus position to determine
   * what content should be copied.
   *
   * The copied data is formatted as tab-separated text that can be pasted into spreadsheet
   * applications like Excel or text editors while maintaining the tabular structure.
   *
   * @example
   * // Copy the currently selected data to clipboard
   * tableApi.copyToClipboard().then(content => {
   *   console.log('Copied to clipboard:', content);
   * });
   *
   * // Using with a button click handler
   * function onCopyButtonClick() {
   *   if (tableApi) {
   *     tableApi.copyToClipboard()
   *       .then(content => {
   *         console.log('Successfully copied data to clipboard');
   *         // Optionally do something with the copied content
   *       })
   *       .catch(error => {
   *         console.error('Failed to copy to clipboard:', error);
   *       });
   *   }
   * }
   *
   * @returns {Promise<string>} A promise that resolves with the copied data as a string.
   *   The string contains the tab-separated representation of the selected table data.
   */
  copyToClipboard() {
    return this.tableScope.copyService.copyToClipboard(
      this.tableScope.tableModel,
      this.tableScope.selectionModel(),
      this.tableScope.focusModel()
    );
  }

  /**
   * Downloads the current table data as an Excel file.
   *
   * This method extracts all visible data from the table (including header, body, and footer areas),
   * converts it into a matrix format, and triggers a download of an Excel file containing this data.
   *
   * The method works by:
   * 1. Creating an empty matrix to hold all table data
   * 2. Iterating through each area of the table (header, body, footer)
   * 3. For each area, iterating through all rows and columns to extract cell values
   * 4. Passing the complete data matrix to the Excel service for file generation and download
   *
   * @param {string} fileName - The name of the Excel file to be downloaded (default: 'table.xlsx')
   * @param {string} author - Optional metadata for the Excel file to specify the author (default: '')
   *
   * @returns {Promise<void>} resolves when the (compressed) file has been handed to the browser
   *
   * @example
   * // Download table data with default filename
   * tableApi.downloadExcel();
   *
   * @example
   * // Download table data with custom filename and author
   * tableApi.downloadExcel('sales-report.xlsx', 'John Doe');
   *
   * @example
   * // Download table data with custom filename only
   * tableApi.downloadExcel('quarterly-data.xlsx');
   */
  downloadExcel(
    fileName: string = 'table.xlsx',
    author: string = ''
  ): Promise<void> {
    const matrix: Array<Array<any>> = [];
    const tableModel = this.tableScope.tableModel;
    const columns: number[] = []; // visible columns only – what the table shows
    for (let c = 0; c < tableModel.getColumnCount(); c++) {
      if (tableModel.getColumnDef(c)?.isVisible?.() !== false) columns.push(c);
    }

    const areas: AreaIdent[] = ["header" , "body" , "footer"];
    for (const area of areas) {
      const areaModel = tableModel.getAreaModel(area);
      const rowCount = areaModel?.getRowCount() ?? 0;
      for (let r = 0; r < rowCount; r++) {
        matrix.push(columns.map(c => areaModel.getValueAt(r, c)));
      }
    }
    // a custom ExcelServiceIf may return void – the API always returns a Promise
    return Promise.resolve(this.tableScope.excelService.downloadExcel(matrix, fileName, author));
  }


  /**
   * Returns the TableScope instance associated with this TableApi.
   *
   * The TableScope provides access to the core functionality and internal state of the table component,
   * including rendering, event handling, selection, and other low-level operations.
   *
   * This method is useful for advanced customization scenarios where you need direct access
   * to the table's internal structure and behaviors.
   *
   * @returns {TableScope} The TableScope instance that controls this table component
   *
   * @example
   * // Access the TableScope to perform a custom operation
   * const tableApi = new TableApi(myTableScope);
   * const tableScope = tableApi.getTableScope();
   *
   * // Example: Manually trigger a context menu at a specific location
   * const mouseEvent = new MouseEvent('contextmenu');
   * const geMouseEvent = tableScope.createGeMouseEvent(mouseEvent);
   * tableScope.contextmenu(geMouseEvent);
   */
  getTableScope(): TableScope {
    return this.tableScope;
  }


  /**
   * Returns the current selection model for the table.
   *
   * The selection model manages cell selection state, including single cells, ranges, rows, and columns.
   * This method provides access to the selection model instance, allowing operations like:
   * - Checking if cells are selected
   * - Getting selection ranges
   * - Modifying selections
   * - Adding/removing selection event listeners
   *
   * @returns {SelectionModelIf | undefined} The current selection model if available, otherwise undefined.
   *
   * @example
   * // Get the selection model
   * const selectionModel = tableApi.getSelectionModel();
   *
   * // Check if a specific cell is selected
   * if (selectionModel?.isSelected(3, 2)) {
   *   console.log('Cell at row 3, column 2 is selected');
   * }
   *
   * // Get all selected ranges
   * const ranges = selectionModel?.getRanges();
   * console.log('Selected ranges:', ranges);
   *
   * // Clear all selections
   * selectionModel?.clear();
   *
   * // Toggle selection of a cell
   * selectionModel?.togglePoint(5, 1);
   *
   * // Add a selection change listener
   * selectionModel?.addEventSelectionChangedListener({
   *   onSelectionChanged: () => {
   *     console.log('Selection has changed');
   *   }
   * });
   */
  getSelectionModel(): SelectionModelIf | undefined {
    return this.tableScope.selectionModel();
  }



  /**
   * Automatically resizes all columns to fit their content.
   *
   * @param {boolean} recalcWrappers - Determines whether to recalculate wrapper dimensions after resizing columns.
   *                                   Default value is true.
   * 
   * @return {void} - This method doesn't return anything.
   */
  autoResizeColumns(recalcWrappers: boolean= true) {
    this.tableScope.autoResizeColumns(recalcWrappers);
  }

  /**
   * Recalculates the dimensions of all wrapper elements in the table.
   * 
   * This method is typically called after changes to the table structure or content
   * that might affect the layout, such as resizing columns or changing row heights.
   * It ensures that all wrapper elements are properly sized to match their content.
   *
   * @return {void} - This method doesn't return anything.
   */
  recalcWrappers() {
    this.tableScope.recalcWrappers();
  }

  /**
   * Sets the width of a specific column in the table.
   *
   * @param {number} columnIndex - The index of the column to resize.
   * @param {number} width - The new width to set for the column, in pixels.
   * 
   * @return {void} - This method doesn't return anything.
   */
  setColumnWidth(columnIndex: number, width: number): void{
    this.tableScope.setColumnWidth(columnIndex, width);
  }

  /**
   * Retrieves the table model that contains all data and structure information for the table.
   *
   * @return {TableModelIf} The table model interface that provides access to the table's data structure,
   *                        including header, body, and footer area models.
   */
  getTableModel() :TableModelIf{
    return this.tableScope.tableModel;
  }

  /**
   * Retrieves the area model for the body section of the table.
   *
   * @return {AreaModelIf} The area model interface that provides access to the table's body data,
   *                       including rows, cells, and their values.
   */
  getBodyModel() :AreaModelIf {
    return this.tableScope.tableModel.getBodyModel();
  }

  /**
   * Sets the rows data for the table body, replacing any existing rows.
   *
   * Only works with an {@link AreaModelObjectArray} body – logs a console warning otherwise.
   * Does **not** repaint and resets filtering and sorting of the body: afterwards call
   * {@link externalFilterChanged} (if a filter function is set) and {@link repaintHard} (the row count changed).
   *
   * @template T - The type of elements in the rows array
   * @param {T[]} rows - An array of data objects to set as the table's rows
   * 
   * @description
   * This method replaces all existing rows in the table body with the provided array of data objects.
   * It only works with tables that use AreaModelObjectArray as their body model.
   * 
   * @return {void} - This method doesn't return anything.
   */
  setRows<T>(rows: T[]){
    const bodyModel = this.getBodyModel();
    if (bodyModel instanceof AreaModelObjectArray){
      // Type assertion with unknown as intermediate step for type safety
      const am = bodyModel as unknown as AreaModelObjectArray<T>;
      am.setRows(rows); 
    } else {
      console.warn('setRows<T>(rows: T[]) only works with AreaModelObjectArray<T>, but this body area model is ', (typeof bodyModel), bodyModel)
    }
  }

  /**
   * Adds new rows to the end of the table body.
   *
   * Only works with an {@link AreaModelObjectArray} body – logs a console warning otherwise.
   * Does **not** repaint and resets filtering and sorting of the body: afterwards call
   * {@link externalFilterChanged} (if a filter function is set) and {@link repaintHard} (the row count changed).
   *
   * @template T - The type of elements in the rows array
   * @param {T[]} rows - An array of data objects to append to the table's existing rows
   * 
   * @description
   * This method appends the provided array of data objects to the end of the existing rows in the table body.
   * It only works with tables that use AreaModelObjectArray as their body model.
   * 
   * @return {void} - This method doesn't return anything.
   * 
   *
   * @example
   * tableApi.addRows([{ id: 100_001, customer: "New GmbH" }]);
   * tableApi.repaintHard();
   * tableApi.ensureRowIsVisible(tableApi.getDisplayedRowCount() - 1);
   */
  addRows<T>(rows: T[]){
    const bodyModel = this.getBodyModel();
    if (bodyModel instanceof AreaModelObjectArray){
      const am = bodyModel as unknown as AreaModelObjectArray<T>;
      let allRows = am.getAllRows();
      am.setRows([...allRows, ...rows]);
    } else {
      console.warn('addRows<T>(rows: T[]) only works with AreaModelObjectArray<T>, but this body area model is ', (typeof bodyModel), bodyModel)
    }
  }

  /**
   * Inserts new rows at a specific position in the table body.
   *
   * Only works with an {@link AreaModelObjectArray} body – logs a console warning otherwise.
   * Does **not** repaint and resets filtering and sorting of the body: afterwards call
   * {@link externalFilterChanged} (if a filter function is set) and {@link repaintHard} (the row count changed).
   *
   * @template T - The type of elements in the rows array
   * @param {T[]} rows - An array of data objects to insert into the table
   * @param {number} rowIndex - The index position where the new rows should be inserted
   * 
   * @description
   * This method inserts the provided array of data objects at the specified index position in the table body.
   * Existing rows at or after the specified index will be shifted down.
   * It only works with tables that use AreaModelObjectArray as their body model.
   * 
   * @return {void} - This method doesn't return anything.
   */
  addRowsAt<T>(rows: T[], rowIndex: number){
    const bodyModel = this.getBodyModel();
    if (bodyModel instanceof AreaModelObjectArray){
      const am = bodyModel as unknown as AreaModelObjectArray<T>;
      let allRows = am.getAllRows();
      am.setRows([...allRows.slice(0,rowIndex), ...rows, ...allRows.slice(rowIndex)]);
    }else {
      console.warn('addRowsAt<T>(rows: T[]) only works with AreaModelObjectArray<T>, but this body area model is ', (typeof bodyModel), bodyModel)
    }
  }

  /**
   * Removes specified rows from the table body.
   *
   * Only works with an {@link AreaModelObjectArray} body – logs a console warning otherwise.
   * Does **not** repaint and resets filtering and sorting of the body: afterwards call
   * {@link externalFilterChanged} (if a filter function is set) and {@link repaintHard} (the row count changed).
   *
   * @template T - The type of elements in the rows array
   * @param {T[]} rows - An array of data objects to remove from the table
   * @param {(a: T, b: T) => boolean} predicate - A comparison function that determines if two rows match
   *   - Default predicate uses strict equality (===)
   *   - The function should return true if the rows are considered a match
   * 
   * @description
   * This method removes rows from the table body that match any of the provided rows based on the predicate function.
   * It only works with tables that use AreaModelObjectArray as their body model.
   * 
   * @return {void} - This method doesn't return anything.
   */
  removeRows<T>(rows: T[], predicate: (a: T, b: T) => boolean = (a, b) => a === b){
    const bodyModel = this.getBodyModel();
    if (bodyModel instanceof AreaModelObjectArray){
      const am = bodyModel as unknown as AreaModelObjectArray<T>;
      const allRows = am.getAllRows().filter(r => !rows.some(rr => predicate(r, rr)));
      am.setRows(allRows);
    } else {
      console.warn('removeRows<T>(rows: T[]) only works with AreaModelObjectArray<T>, but this body area model is ', (typeof bodyModel), bodyModel)
    }
  }

  /**
   * Searches for and returns rows from the table body that match the given criteria.
   *
   * Only works with an {@link AreaModelObjectArray} body – logs a console warning otherwise.
   *
   * @template T - The type of elements in the rows array
   * 
   * @description
   * This method searches through the table body model for rows that match the provided criteria.
   * It only works with tables that use AreaModelObjectArray as their body model.
   * The method uses a predicate function to determine matches between rows.
   *
   * @param {T[]} rows - An array of rows to search for in the table body
   * @param {(a: T, b: T) => boolean} predicate - A comparison function that determines if two rows match
   *   - Default predicate uses strict equality (===)
   *   - The function should return true if the rows are considered a match
   *   - Parameters:
   *     - a: The row from the table body being checked
   *     - b: The row from the input array being searched for
   *
   * @returns {T[]} An array containing all matching rows found in the table body
   *   - Returns an empty array if:
   *     - The body model is not an instance of AreaModelObjectArray
   *     - No matches are found
   *
   * @example
   * // Find rows with simple equality comparison
   * const matchingRows = tableApi.findRows([orders[0], orders[1]]);
   *
   * @example
   * // Find rows with custom comparison logic
   * const matchingRows = tableApi.findRows<Order>([{ ...orders[0] }], (a, b) => a.id === b.id);
   */
  findRows<T>(rows: T[], predicate: (a: T, b: T) => boolean = (a, b) => a === b): T[] {
    const bodyModel = this.getBodyModel();
    if (bodyModel instanceof AreaModelObjectArray){
      const am = bodyModel as unknown as AreaModelObjectArray<T>;
      return am.getAllRows().filter(r => rows.some(rr => predicate(r, rr)));
    } else {
      console.warn('findRows<T>(rows: T[], predicate: (a: T, b: T) => boolean) only works with AreaModelObjectArray<T>, but this body area model is ', (typeof bodyModel), bodyModel)
    }
    return [];
  }

  /**
   * Searches through the filtered rows of the table to find a row that matches specific criteria.
   * This method only works with tables that use AreaModelObjectArray as their body model.
   *
   * @template T - The type of the row objects in the table
   * 
   * @param {Partial<T>} criteria - A partial object containing the search criteria.
   *                               Only needs to include the properties you want to match against.
   * 
   * @param {(criteria: Partial<T>, row: T) => boolean} predicate - A function that defines how to match rows against the criteria.
   *                                                               Returns true if the row matches the criteria, false otherwise.
   * 
   * @returns {T | undefined} The first matching row from the filtered rows, or undefined if no match is found
   *                         or if the body model is not an instance of AreaModelObjectArray.
   * 
   * @example
   * ```typescript
   * interface Person {
   *   id: number;
   *   name: string;
   *   age: number;
   * }
   * 
   * // Find a person by exact match
   * const criteria = { name: "John", age: 30 };
   * const person = tableApi.findRowFromFilteredRowsByAllCriteria<Person>(
   *   criteria,
   *   (criteria, row) => row.name === criteria.name && row.age === criteria.age
   * );
   * 
   * // Find a person by partial name match
   * const searchCriteria = { name: "Jo" };
   * const person2 = tableApi.findRowFromFilteredRowsByAllCriteria<Person>(
   *   searchCriteria,
   *   (criteria, row) => row.name.toLowerCase().includes(criteria.name!.toLowerCase())
   * );
   * 
   * ```
   * 
   * @throws {Warning} Logs a warning to console if the body model is not an instance of AreaModelObjectArray
   * 
   * @remarks
   * - This method only searches through filtered rows (rows that are currently visible in the table)
   * - If you need to search through all rows (including filtered out ones), use findRowFromAllRowsByAllCriteria instead
   * - The predicate function gives you full control over how to match rows against your criteria
   * - Returns undefined if either no match is found or if the table's body model is not compatible
   */
  findRowFromFilteredRowsByAllCriteria<T>(
    criteria: Partial<T>,
    predicate: (criteria: Partial<T>, row: T) => boolean): T | undefined {
    const bodyModel = this.getBodyModel();
    if (bodyModel instanceof AreaModelObjectArray){
      const am = bodyModel as unknown as AreaModelObjectArray<T>;
      return am.getFilteredRows().find(row => predicate(criteria, row));
    } else {
      console.warn('findRowFromFilteredRowsByAllCriteria(...) only works with AreaModelObjectArray<T>, but this body area model is ', (typeof bodyModel), bodyModel)
    }
    return undefined;
  }

  /**
   * Searches through all rows in the table's body model to find a row that matches specified criteria.
   * This method works only with AreaModelObjectArray<T> body models.
   *
   * @template T - The type of objects/rows in the table
   * 
   * @param {Partial<T>} criteria - A partial object containing the search criteria.
   *                               Only needs to include the properties you want to match against.
   * 
   * @param {(criteria: Partial<T>, row: T) => boolean} predicate - A function that defines how to match rows against the criteria.
   *                                                               Returns true if the row matches the criteria, false otherwise.
   * 
   * @returns {T | undefined} The first matching row, or undefined if no match is found or if the body model is not AreaModelObjectArray.
   * 
   * @example
   * // Find a user row by id and name
   * const criteria = { id: 1, name: "John" };
   * const user = tableApi.findRowFromAllRowsByAllCriteria(criteria, 
   *   (criteria, row) => row.id === criteria.id && row.name === criteria.name
   * );
   * 
   * @example
   * // Find a product row with partial match on name
   * const criteria = { name: "Phone" };
   * const product = tableApi.findRowFromAllRowsByAllCriteria(criteria,
   *   (criteria, row) => row.name.includes(criteria.name!)
   * );
   * 
   * @example
   * // Find an order with complex matching logic
   * const criteria = { total: 100, status: "paid" as const };
   * const order = tableApi.findRowFromAllRowsByAllCriteria<Order>(criteria,
   *   (criteria, row) => {
   *     return row.total > criteria.total! &&
   *            row.status === criteria.status;
   *   }
   * );
   * 
   * @throws {Warning} Logs a warning to console if the body model is not an instance of AreaModelObjectArray
   */
  findRowFromAllRowsByAllCriteria<T>(
    criteria: Partial<T>,
    predicate: (criteria: Partial<T>, row: T) => boolean): T | undefined {
      const bodyModel = this.getBodyModel();
      if (bodyModel instanceof AreaModelObjectArray){
        const am = bodyModel as unknown as AreaModelObjectArray<T>;
        return am.getAllRows().find(row => predicate(criteria, row));
      } else {
        console.warn('findRowFromAllRowsByAllCriteria(...) only works with AreaModelObjectArray<T>, but this body area model is ', (typeof bodyModel), bodyModel)
      }
    return undefined;
  }

  /**
   * Updates existing rows in the table body with new data.
   *
   * Only works with an {@link AreaModelObjectArray} body – logs a console warning otherwise.
   * The properties are copied into the existing objects; nothing is repainted – call {@link repaint} afterwards.
   *
   * @template T - The type of elements in the rows array
   * @param {T[]} rows - An array of data objects containing the updated values
   * @param {(a: T, b: T) => boolean} predicate - A comparison function that determines which rows to update
   *   - Default predicate uses strict equality (===)
   *   - The function should return true if the row should be updated
   * 
   * @description
   * This method updates existing rows in the table body with new values from the provided rows array.
   * For each row in the table, if the predicate returns true when compared with any row in the provided array,
   * all properties from the provided row will be copied to the existing row.
   * It only works with tables that use AreaModelObjectArray as their body model.
   * 
   * @return {void} - This method doesn't return anything.
   */
  updateRows<T>(rows: T[], predicate: (a: T, b: T) => boolean = (a, b) => a === b): void {
    const bodyModel = this.getBodyModel();
    if (bodyModel instanceof AreaModelObjectArray){
      const am = bodyModel as unknown as AreaModelObjectArray<T>;
      let allRows = am.getAllRows();
      for (const allRow of allRows) {
        for (const row of rows) {
          if (predicate(allRow, row)) {
            for (const key of Object.keys(row as any)) {
              (allRow as any)[key] = (row as any)[key];
            }
          }
        }     
      }

    } else {
      console.warn('updateRows<T>(rows: T[], predicate: (a: T, b: T) => boolean) only works with AreaModelObjectArray<T>, but this body area model is ', (typeof bodyModel), bodyModel)
    }
  }

  /**
   * Sorts by one column from code – e.g. from your own button – exactly like a double click on the
   * column header: rows, header icon, filter (sort order survives filtering) and auto-restore.
   *
   * @param {number | string} column - column index or property, e.g. `"total"`
   * @param {SortState} [sortState] - `"asc"` or `"desc"`; omitted: toggles like the header (asc → desc → …)
   * @returns {boolean} false if the column does not exist
   *
   * @example
   * document.querySelector("#by-total")!.addEventListener("click", () => tableApi.sortByColumn("total", "desc"));
   */
  sortByColumn(column: number | string, sortState?: SortState): boolean {
    return this.tableScope.sortByColumn(column, sortState);
  }

  /**
   * Re-applies the current sorting configuration to the table data and repaints.
   *
   * @description
   * The current sorting is the last {@link sort} function, otherwise the columns with a sort state (the header icons,
   * also restored by `autoRestoreOptions`). Useful when the underlying data has changed and needs to be re-sorted
   * without changing the sort columns or direction. (Before 1.1.91 only the sort items stored by `autoRestoreOptions`
   * were used – without them `reSort()` did nothing.)
   *
   * @example
   * orders[0].total = 999_999;
   * tableApi.reSort();
   *
   * @return {void} - This method doesn't return anything.
   */
  reSort(){
    this.tableScope.reSort();
  }

  /**
   * Tree tables: expands every row on every level (like the "expand all" icon in the header) and repaints.
   * No effect for other tables.
   *
   * @example
   * document.querySelector("#expand")!.addEventListener("click", () => tableApi.expandAll());
   */
  expandAll(): void {
    this.tableScope.toggleExpandCollapseAll(true);
  }

  /**
   * Tree tables: collapses every row on every level and repaints. No effect for other tables.
   *
   * @example
   * tableApi.collapseAll();
   */
  collapseAll(): void {
    this.tableScope.toggleExpandCollapseAll(false);
  }

  /**
   * Tree tables: expands or collapses the displayed body row `rowIndex` (like a click on its arrow), repaints and
   * remembers the state with `autoRestoreOptions`.
   *
   * @param {number} rowIndex - index of the displayed body row
   * @param {boolean} expanded - the new state
   * @returns {boolean} false if the table is no tree, the row does not exist or already has this state
   *
   * @example
   * tableApi.setRowExpanded(0, true);   // expand the first row
   */
  setRowExpanded(rowIndex: number, expanded: boolean): boolean {
    const row = this.tableScope.tableModel.getBodyModel().getRowByIndex(rowIndex);
    return isTreeRow(row) ? this.tableScope.setTreeRowExpanded(row as TreeRowIf<any>, expanded) : false;
  }

  /**
   * Sorts the table data using a custom comparison function.
   * 
   * This method allows sorting of table rows by providing a custom comparison function. The comparison function
   * should follow the standard JavaScript array sort comparator pattern, returning:
   * - A negative number if the first element should be sorted before the second
   * - A positive number if the first element should be sorted after the second
   * - Zero if the elements are equal
   * 
   * @param compareFn - A function that defines the sort order. The function should accept two arguments
   *                   and return a number indicating their relative order:
   *                   - Negative number: first argument should come before second
   *                   - Positive number: second argument should come before first
   *                   - Zero: elements are equal
   * 
   * @example
   * // Sort table rows by a specific property in ascending order
   * tableApi.sort((a: Person, b: Person) => {
   *   if (a.name < b.name) return -1;
   *   if (a.name > b.name) return 1;
   *   return 0;
   * });
   * 
   * @example
   * // Sort numbers in descending order
   * tableApi.sort((a: { value: number }, b: { value: number }) => b.value - a.value);
   * 
   * @example
   * // Sort with multiple criteria
   * tableApi.sort((a: Order, b: Order) => {
   *   // First sort by status
   *   const statusCompare = a.status.localeCompare(b.status);
   *   if (statusCompare !== 0) return statusCompare;
   *   
   *   // Then sort by name if status is equal
   *   return a.customer.localeCompare(b.customer);
   * });
   * 
   * @example
   * // Case-insensitive string sorting
   * tableApi.sort((a: Person, b: Person) =>
   *   a.name.toLowerCase().localeCompare(b.name.toLowerCase())
   * );
   *
   * @example
   * // Tree tables: the function compares the tree rows of siblings (your objects: a.data / b.data),
   * // children stay below their parent
   * tableApi.sort((a: TreeRowIf<OrderNode>, b: TreeRowIf<OrderNode>) => b.data.total - a.data.total);
   */
  sort(compareFn: (a: any, b: any) => number): void {
    this.tableScope.sort(compareFn);
  }


  /**
   * Ensures that a specific row is visible in the viewport by scrolling if necessary.
   * This method checks if the target row is within the currently visible range and
   * adjusts the scroll position if it's not visible.
   *
   * The method performs the following:
   * 1. Checks if the row is above the current viewport (before first visible row)
   * 2. Checks if the row is below the current viewport (after last visible row)
   * 3. Scrolls to make the row visible if needed
   *
   * @param {number} rowIndex - The index of the row to make visible
   * @returns {boolean} Returns true if scrolling was needed and performed, false if the row was already visible
   *
   * @example
   * // Ensure row 5 is visible in the viewport
   * tableApi.ensureRowIsVisible(5);
   *
   * @throws {Error} Implicitly may throw if rowIndex is not a number or if required properties are undefined
   *
   * @see {@link scrollToIndex} - The underlying method used for scrolling
   * @see {@link getDisplayedRowCount} - Related method for getting visible row count
   */
  ensureRowIsVisible(rowIndex:number):boolean{
    return this.tableScope.ensureRowIsVisible(rowIndex);
  }

  /**
   * Ensures that a column is fully visible by scrolling horizontally if necessary – the counterpart of
   * {@link ensureRowIsVisible}. A column left of the viewport becomes the first visible column, a column right of it
   * the last one. The vertical position is kept. The arrow keys use it for the focused cell.
   *
   * Fixed columns (`fixedLeftColumnCount` / `fixedRightColumnCount`) are always visible, hidden columns
   * ({@link setColumnVisible}) can't be scrolled to: both return `false`.
   *
   * @param {number} columnIndex - The column index (model index over west + center + east)
   * @returns {boolean} true if the table was scrolled, false if the column was already visible
   *
   * @example
   * // show the column of a search hit (rowIndex/columnIndex from your own search)
   * const rowIndex = 1200, columnIndex = 14;
   * tableApi.ensureColumnIsVisible(columnIndex);
   * tableApi.ensureRowIsVisible(rowIndex);
   *
   * @see {@link scrollToIndex} - scrolls a column and row to the top left
   */
  ensureColumnIsVisible(columnIndex: number): boolean {
    return this.tableScope.ensureColumnIsVisible(columnIndex);
  }

  /**
   * Retrieves the number of rows currently displayed in the table.
   *
   * @description
   * This method returns the count of rows that are currently visible in the table after
   * applying any filtering, pagination, or other visibility constraints.
   * 
   * @return {number} The number of rows currently displayed in the table.
   */
  getDisplayedRowCount():number {
    return this.tableScope.getDisplayedRowCount();
  }


  /**
   * Returns the index of the first visible row in the table's viewport.
   *
   * This method retrieves the first visible row index from the table's scope, which is useful
   * for virtual scrolling and viewport-related calculations. The index represents the topmost
   * visible row in the current scroll position of the table.
   *
   * This value is maintained internally by the table and updated during scrolling operations.
   * It's particularly important for:
   * - Virtual scrolling optimization
   * - Calculating visible range of rows
   * - Viewport-related operations
   * - Scroll position restoration
   *
   * @returns {number} The index of the first visible row in the table's viewport.
   *                   Returns -1 if no rows are visible or if the table is not yet rendered.
   *
   * @example
   * ```typescript
   * // Get the first visible row index
   * const tableApi = new TableApi(tableScope);
   * const firstVisibleIndex = tableApi.getFirstVisibleRowIndex();
   *
   * // Use the index for scroll position calculations
   * if (firstVisibleIndex >= 0) {
   *   // Perform operations with the first visible row
   *   console.log(`First visible row index: ${firstVisibleIndex}`);
   * }
   * ```
   */
  getFirstVisibleRowIndex(): number {
    return this.tableScope.getFirstVisibleRowIndex();
  }

  /**
   * Retrieves the index of the first fully visible row in the table's viewport.
   *
   * A row is considered "fully visible" when it's completely within the visible area of the table.
   * This differs from the regular "visible" row, which might be partially visible at the edges of the viewport.
   *
   * This method is useful for:
   * - Determining which rows are completely in view for operations that require full visibility
   * - Implementing pagination or virtualization logic that needs to know complete row visibility
   * - Supporting keyboard navigation that should skip partially visible rows
   *
   * @returns {number} The index of the first fully visible row, or -1 if no rows are fully visible
   *
   * @example
   * // Get the first fully visible row index
   * const firstFullVisibleRow = tableApi.getFirstFullVisibleRowIndex();
   *
   * // Check if a specific row is fully visible
   * const isRowFullyVisible = (rowIndex: number) => {
   *   const firstFullVisible = tableApi.getFirstFullVisibleRowIndex();
   *   const lastFullVisible = tableApi.getLastFullVisibleRowIndex();
   *   return rowIndex >= firstFullVisible && rowIndex <= lastFullVisible;
   * };
   */
  getFirstFullVisibleRowIndex(): number {
    return this.tableScope.getFirstFullVisibleRowIndex();
  }


  /**
   * Returns the index of the last row that is visible in the table's viewport.
   *
   * This method retrieves the last visible row index from the table scope, which keeps
   * track of which rows are currently visible as the user scrolls through the table.
   *
   * This can be useful for:
   * - Implementing virtualized scrolling optimizations
   * - Determining if specific rows are currently in view
   * - Implementing features that need to know the visible range of rows
   *
   * @returns {number} The index of the last visible row in the table viewport
   *
   * @example
   * // Check if a specific row is currently visible in the viewport
   * const lastVisibleIndex = tableApi.getLastVisibleRowIndex();
   * const firstVisibleIndex = tableApi.getFirstVisibleRowIndex();
   * const isRowVisible = rowIndex >= firstVisibleIndex && rowIndex <= lastVisibleIndex;
   *
   * @example
   * // Get the range of visible rows
   * const visibleRowsRange = {
   *   first: tableApi.getFirstVisibleRowIndex(),
   *   last: tableApi.getLastVisibleRowIndex()
   * };
   * console.log(`Visible rows: ${visibleRowsRange.first} to ${visibleRowsRange.last}`);
   */
  getLastVisibleRowIndex(): number {
    return this.tableScope.getLastVisibleRowIndex();
  }

  /**
   * Returns the index of the last fully visible row in the table's viewport.
   *
   * This method retrieves the last row that is completely visible within the current
   * viewport of the table. A row is considered "fully visible" when its entire height
   * is visible without any portion being cut off by the viewport boundaries.
   *
   * The distinction between "visible" and "fully visible" is important when scrolling:
   * - A row can be partially visible (some portion is in view)
   * - A row can be fully visible (the entire row is in view)
   *
   * @returns {number} The index of the last fully visible row in the table.
   * If no row is fully visible or the table is empty, the method might return -1.
   *
   * @example
   * ```typescript
   * // Get the index of the last fully visible row
   * const lastVisibleRowIndex = tableApi.getLastFullVisibleRowIndex();
   *
   * // Use this information to determine if a specific row is fully visible
   * const isRowFullyVisible = rowIndex <= lastVisibleRowIndex && rowIndex >= tableApi.getFirstFullVisibleRowIndex();
   *
   * // Can be used with scrolling operations to ensure certain rows are visible
   * if (rowIndex > lastVisibleRowIndex) {
   *   tableApi.ensureRowIsVisible(rowIndex);
   * }
   * ```
   */
  getLastFullVisibleRowIndex(): number {
    return this.tableScope.getLastFullVisibleRowIndex();
  }


  /**
   * Checks whether logging is currently active for the table component.
   *
   * This method returns the current state of logging for the table. When logging is active,
   * the table outputs detailed information about its operations to the console, including:
   *
   * - Rendering processes and lifecycle events
   * - Data modifications and updates
   * - Event handling and user interactions
   * - Performance metrics and state changes
   *
   * Logging can be toggled using the `setLoggingActive(boolean)` method.
   *
   * @returns {boolean} True if logging is currently enabled, false otherwise.
   *
   * @example
   * // Check if logging is enabled
   * if (tableApi.isLoggingActive()) {
   *   console.log("Table logging is currently active");
   * }
   *
   * // Conditionally enable logging only if it's not already active
   * if (!tableApi.isLoggingActive()) {
   *   tableApi.setLoggingActive(true);
   *
   *   // Perform operations that need debugging
   *   tableApi.updateCells([
   *     {
   *       area: "body",
   *       rowIndex: 2,
   *       columnIndex: 3,
   *       value: "New Value",
   *       cssClasses: { "highlight": true }
   *     }
   *   ]);
   *
   *   // Run some additional operations...
   *
   *   // Disable logging when finished
   *   tableApi.setLoggingActive(false);
   * }
   */
  setLoggingActive(active:boolean): void {
    this.tableScope.loggingActive = active;
  }

  /**
   * Checks whether logging is currently active for the table component.
   *
   * This method returns the current state of logging for the table. When logging is active,
   * the table outputs detailed information about its operations to the console, including:
   *
   * - Rendering processes and lifecycle events
   * - Data modifications and updates
   * - Event handling and user interactions
   * - Performance metrics and state changes
   *
   * Logging can be toggled using the `setLoggingActive(boolean)` method.
   *
   * @returns {boolean} True if logging is currently enabled, false otherwise.
   *
   * @example
   * // Check if logging is enabled
   * if (tableApi.isLoggingActive()) {
   *   console.log("Table logging is currently active");
   * }
   *
   * // Conditionally enable logging only if it's not already active
   * if (!tableApi.isLoggingActive()) {
   *   tableApi.setLoggingActive(true);
   *
   *   // Perform operations that need debugging
   *   tableApi.updateCells([
   *     {
   *       area: "body",
   *       rowIndex: 2,
   *       columnIndex: 3,
   *       value: "New Value",
   *       cssClasses: { "highlight": true }
   *     }
   *   ]);
   *
   *   // Run some additional operations...
   *
   *   // Disable logging when finished
   *   tableApi.setLoggingActive(false);
   * }
   */
  isLoggingActive(): boolean {
    return this.tableScope.loggingActive;
  }


}
