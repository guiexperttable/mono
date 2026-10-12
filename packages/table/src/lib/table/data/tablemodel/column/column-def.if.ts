import { SizeIf } from "../../common/size.if";
import { CellRendererIf } from "../../../renderer/cell-render.if";
import { AreaObjectMapType } from "../../common/area-map.type";
import { BooleanFunction } from "../../common/boolean-function";
import { SortState } from "../../common/sort-state.type";
import { GetEditRenderer } from "../../../renderer/edit/edit-cell-renderer.type";
import { editInputPipe } from "../../../renderer/edit/edit-input-pipe.if";

/**
 * Represents a function that compares two values for sorting purposes.
 * The function takes two values of type T and optionally their corresponding row objects of type U,
 * compares them, and returns a number.
 * If the result is negative, it means 'valueA' comes before 'valueB' in the sorted order.
 * If the result is positive, it means 'valueB' comes before 'valueA' in the sorted order.
 * If the result is zero, it means the two values are considered equal for sorting purposes.
 *
 * @param valueA The first value to be compared.
 * @param valueB The second value to be compared.
 * @param rowA Optional. The row object containing valueA.
 * @param rowB Optional. The row object containing valueB.
 * @param f Optional. The direction. It is not necessary to use this value in the comparator, as this number is used as a factor (1 or -1) in the outer sort method.
 *
 * @returns A number indicating the relative order of 'valueA' and 'valueB'.
 *
 * @category Columns
 */
export type ValueRowSortComparator = (valueA: any, valueB: any, rowA?: any, rowB?: any, f?: number) => number;


/**
 * Describes one column: which property it shows, header label, width, CSS classes, renderers,
 * sorting, editing and visibility. Create it with {@link ColumnDef} – `new ColumnDef(property, label, width, classes)`
 * or {@link ColumnDef.create} with named parameters.
 *
 * Column indices (e.g. in {@link AreaModelIf.getValueAt}) are positions in the `columnDefs` array –
 * fixed columns and hidden columns included.
 *
 * @example
 * const columnDefs: ColumnDefIf[] = [
 *   new ColumnDef("id", "ID", px80, allRight),
 *   ColumnDef.create({
 *     property: "total", headerLabel: "Total", width: px120,
 *     headerClasses: ["ge-table-text-align-right"], bodyClasses: ["ge-table-text-align-right"],
 *     sortable: TrueFn, sortState: "desc"
 *   })
 * ];
 *
 * @see Training: [Columns with ColumnDef](https://gui.expert/training/column-definitions/)
 *
 * @category Columns
 */
export interface ColumnDefIf {
  /** Property of the row object shown in this column (`"customer"`). With nested objects a path like `"address.city"`. */
  property: string;
  /** Text of the header cell (used when the header is built from the column definitions). */
  headerLabel: string;
  /** Width of the column: `px120`, `new Size(10, "%")` or `new Size(1, "weight")`. See {@link SizeUnitType}. */
  width: SizeIf;
  /** Lower limit for percentage widths (`"%"`). Not applied to pixel widths or to resizing with the mouse. */
  minWidth: SizeIf;
  /** Upper limit for percentage widths (`"%"`). Not applied to pixel widths or to resizing with the mouse. */
  maxWidth: SizeIf;
  /**
   * Cell renderers per area – `rendererMap.header`, `.body`, `.footer`.
   * Without a renderer the value is shown as text.
   *
   * @example
   * column.rendererMap.body = new NumberCellProgressBarCellRenderer(20, false);
   * column.rendererMap.footer = new EuroRenderer();     // an own CellRendererIf
   *
   * @see Training: [Cell renderers](https://gui.expert/training/cell-renderers/)
   */
  rendererMap: AreaObjectMapType<CellRendererIf>;
  /**
   * CSS classes per area – `classes.header`, `.body`, `.footer`. The constants {@link bodyLeft}, {@link allRight} …
   * are ready-made maps for the alignment.
   */
  classes: AreaObjectMapType<string[]>;
  /** The column can be sorted by a double-click on its header (e.g. `TrueFn`). */
  sortable?: BooleanFunction,
  /** Show the sort icon in the header. Default: follows `sortable` resp. `sortState`. */
  sortIconVisible?: BooleanFunction,
  /**
   * Own comparison of two cell values (and their rows), like for `Array.prototype.sort`.
   *
   * @example
   * sortComparator: (a: string, b: string) => a.localeCompare(b, "de")     // "Müller" before "Nordlicht"
   *
   * @see Training: [Sorting](https://gui.expert/training/sorting/)
   */
  sortComparator?: ValueRowSortComparator,
  /**
   * The sort icon shown in the header: `"asc"`, `"desc"` or `""` (none). It only sets the icon –
   * sort the rows once with {@link TableModelIf.doSort} to match it.
   */
  sortState?: SortState,
  /** Order of the sort states on repeated double-clicks. Default: `TableOptions.sortOrder` (`["asc", "desc"]`). */
  sortStatesOrder?: SortState[],
  /**
   * The cells of this column can be edited (double-click or F2), e.g. `TrueFn`.
   *
   * @see Training: [Inline editing](https://gui.expert/training/inline-editing/)
   */
  editable?: BooleanFunction,
  /**
   * Whether the column is shown. Hidden columns are not rendered, copied or exported.
   *
   * @example
   * ColumnDef.create({ property: "category", headerLabel: "Category", isVisible: FalseFn })
   */
  isVisible?: BooleanFunction,
  /**
   * The editor of this column. Default: `TableOptions.getEditRenderer` (a text input, {@link InputCellRenderer}).
   *
   * @example
   * getEditRenderer: () => new SelectCellRenderer(["open", "paid"].map(s => new ValueLabel(s, s)))
   */
  getEditRenderer?: GetEditRenderer,
  /** Converts the text of the editor before it is written into the model, e.g. {@link editInputPipeForNumber}. */
  editInputPipe?: editInputPipe
}
