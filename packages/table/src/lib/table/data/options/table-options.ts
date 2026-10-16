import type { TableDirection } from "../../rtl/table-direction.type";
import type { MasterDetailOptionsIf } from "../../master-detail/master-detail-options.if";
import { DefaultRowHeightsIf } from "./default-row-heights.if";
import { TableOptionsIf } from "./table-options.if";
import { TreeOptions } from "./tree-options";
import { FilterFunction } from "../common/filter-function";
import { SortState } from "../common/sort-state.type";
import { SortedOptions } from "./sorted-options";
import { InputCellRenderer } from "../../renderer/edit/input-cell-renderer";
import { GetEditRenderer } from "../../renderer/edit/edit-cell-renderer.type";
import { SelectionModelIf } from "../../selection/selection-model.if";
import { GetT } from "../common/get-t";
import { FocusModelIf } from "../../focus/focus-model.if";
import { ShortcutActionIdMapping } from "../../action/shortcut-actionid-mapping.type";
import { HeaderGroupOptions } from './header-group-options';
import { AriaTextsIf } from "../../aria/aria-texts.if";
import { OverlayOptionsIf } from "./overlay-options.if";
import type { RowDragOptionsIf } from "../../row-drag/row-drag-options.if";
import type { FillHandleOptionsIf } from "../../fill/fill-handle-options.if";
import type { EditingOptionsIf } from "../../sheet-editing/editing-options.if";
import type { ClipboardOptionsIf } from "../../clipboard/clipboard-options.if";
import type { UndoOptionsIf } from "../../undo/undo-options.if";
import type { CellFormulaOptionsIf } from "../../sheet/cell-formula-options.if";
import type { BatchEditOptionsIf } from "../../batch-edit/batch-edit-options.if";


/**
 * The default editor of {@link TableOptions.getEditRenderer}: a text input in the cell ({@link InputCellRenderer}).
 * With Excel-style editing ({@link TableOptionsIf.editing}) the table recognises this default and uses its own
 * editor above the cell instead – an own `getEditRenderer` is kept.
 *
 * @example
 * const tableOptions: TableOptionsIf = { ...new TableOptions() };
 * tableOptions.getEditRenderer === DEFAULT_GET_EDIT_RENDERER;   // true
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export const DEFAULT_GET_EDIT_RENDERER: GetEditRenderer = (_rowIndex: number, _columnIndex: number) => new InputCellRenderer();

/**
 * All default options of a table – see {@link TableOptionsIf} for the meaning of each field.
 *
 * Use it with the spread pattern: all defaults, plus your changes.
 *
 * @example
 * const tableOptions: TableOptionsIf = {
 *   ...new TableOptions(),
 *   hoverColumnVisible: false,
 *   verticalBorderVisible: false,
 *   defaultRowHeights: { header: 40, body: 30, footer: 36 },
 *   externalFilterFunction: (order: Order) => order.total > 1000
 * };
 *
 * @see Training: [TableOptions: behaviour and look](https://gui.expert/training/table-options/)
 *
 * @category Options
 */
export class TableOptions implements TableOptionsIf {

  overflowX: "auto" | "scroll" = "auto";
  overflowY: "auto" | "scroll" = "auto";

  horizontalBorderVisible = true;
  verticalBorderVisible = true;
  footerSeparatorBorderVisible = true;
  headerSeparatorBorderVisible = true;
  fixedEastSeparatorBorderVisible = true;
  fixedWestSeparatorBorderVisible = true;

  tableTopBorderVisible = true;
  tableBottomBorderVisible = true;
  // TODO tableLeftBorderVisible = true;
  // TODO tableRightBorderVisible = true;

  hoverRowVisible = true;
  hoverColumnVisible = true;
  columnsResizable = true;
  columnsDraggable = true;
  columnResizeHandleWidthInPx = 4;

  defaultRowHeights: DefaultRowHeightsIf = {
    header: 34,
    body: 34,
    footer: 34
  };

  footerVerticalSeparator = false;

  headerToggleExpandCollapseIcons = false;
  headerVerticalSeparator = false;

  treeOptions = new TreeOptions();
  headerGroupOptions = new HeaderGroupOptions();
  showCheckboxWihoutExtraColumn = false;

  externalFilterFunction: FilterFunction<any> | undefined = undefined;
  sortedOptions = new SortedOptions();
  sortOrder: SortState[] = ["asc", "desc"];
  shortcutActionIdMapping?: ShortcutActionIdMapping;
  shortcutActionsDisabled: boolean = false;

  resizeEventDebounceDelay = 500;

  getEditRenderer?: GetEditRenderer = DEFAULT_GET_EDIT_RENDERER;

  /**
   * Selection model of the table. Not set (default): every table creates its own model
   * (`new SelectionModel()`, type "none") – tables never share a selection.
   */
  getSelectionModel?: GetT<SelectionModelIf> = undefined;

  /**
   * Focus model of the table. Not set (default): every table creates its own `new FocusModel("cell")`.
   */
  getFocusModel?: GetT<FocusModelIf> = undefined;

  /** Accessible name of the table (`aria-label`). Default: none. @since 1.1.91 */
  ariaLabel?: string = undefined;

  /** Id of the element that names the table (`aria-labelledby`). Default: none. @since 1.1.91 */
  ariaLabelledBy?: string = undefined;

  /** Id of the element that describes the table (`aria-describedby`). Default: none. @since 1.1.91 */
  ariaDescribedBy?: string = undefined;

  /** Own screen reader texts; missing functions use the English defaults ({@link AriaTexts}). @since 1.1.91 */
  ariaTexts?: Partial<AriaTextsIf> = undefined;

  /** Texts and behaviour of the "Loading…" / "No rows" overlays; missing fields use {@link OverlayOptions}. @since 1.1.92 */
  overlayOptions?: Partial<OverlayOptionsIf> = undefined;
  rowDragOptions?: Partial<RowDragOptionsIf> = undefined;
  fillHandle?: boolean | Partial<FillHandleOptionsIf> = undefined;
  masterDetail?: Partial<MasterDetailOptionsIf> = undefined;
  batchEdit?: boolean | Partial<BatchEditOptionsIf> = undefined;
  /** Excel-style editing ({@link TableOptionsIf.editing}). Not set = off. @since 1.1.99 */
  editing?: boolean | Partial<EditingOptionsIf> = undefined;
  /** Copy, cut and paste ({@link TableOptionsIf.clipboard}). Not set = off. @since 1.1.99 */
  clipboard?: boolean | Partial<ClipboardOptionsIf> = undefined;
  /** Undo and redo ({@link TableOptionsIf.undo}). Not set = off. @since 1.1.99 */
  undo?: boolean | Partial<UndoOptionsIf> = undefined;
  /** Cell formulas ({@link TableOptionsIf.cellFormulas}). Not set = off. @since 1.1.99 */
  cellFormulas?: boolean | Partial<CellFormulaOptionsIf> = undefined;
  /**
   * Writing direction (`"ltr"` | `"rtl"` | `"auto"`). Not set = `"ltr"`; a nested table (master/detail) without its
   * own value takes the direction of the outer table. @since 1.1.98
   */
  direction?: TableDirection = undefined;
}
