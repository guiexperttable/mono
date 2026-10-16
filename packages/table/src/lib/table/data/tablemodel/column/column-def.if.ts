import { SizeIf } from "../../common/size.if";
import { CellRendererIf } from "../../../renderer/cell-render.if";
import { AreaObjectMapType } from "../../common/area-map.type";
import { BooleanFunction } from "../../common/boolean-function";
import { SortState } from "../../common/sort-state.type";
import { GetEditRenderer } from "../../../renderer/edit/edit-cell-renderer.type";
import { editInputPipe } from "../../../renderer/edit/edit-input-pipe.if";
import type { ValueGetter, ValueSetter } from "../../../calc/value-getter.type";
import type { ShowValuesAsConfig } from "../../../calc/show-values-as.type";

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
  editInputPipe?: editInputPipe,

  /**
   * A calculated column: computes the value from the row instead of reading `property` (the data stays unchanged).
   * Sorting, filter ({@link TableApi.getRowValue}), copy, Excel, totals (`footerAggregates`) and row groups use the
   * computed value. `property` stays the id of the column (state, `footerAggregates`, other formulas).
   * Without a {@link ColumnDefIf.valueSetter} the column cannot be edited.
   *
   * Supported by the models of `TableFactory.createTableModel({ rows })`, trees, row groups (not by array-of-arrays
   * models; an own `AreaModel` calls it itself).
   *
   * @example
   * ColumnDef.create({ property: "total", headerLabel: "Total", sortable: TrueFn,
   *                    valueGetter: (o: Item) => o.price * o.quantity })
   *
   * @see [Live demo: formulas & calculated columns](https://gui.expert/showcase/formulas/run/) · Training: [Calculated columns, “Show values as” and formulas](https://gui.expert/training/formulas/)
   * @since 1.1.95
   */
  valueGetter?: ValueGetter,
  /**
   * Makes a calculated column editable: writes the edited value back into the row (return `false` to reject).
   *
   * @example
   * valueSetter: (o: Item, v: unknown) => { o.price = Number(v) / o.quantity; }
   *
   * @since 1.1.95
   */
  valueSetter?: ValueSetter,
  /**
   * Shows the numbers of the column differently without changing the data: share of the column total, running
   * total, rank … (see {@link ShowValuesAs}). Change it at runtime with {@link TableApi.setShowValuesAs}.
   *
   * @example
   * ColumnDef.create({ property: "total", headerLabel: "Share", showValuesAs: "percentOfColumnTotal" })
   *
   * @see Training: [Show values as](https://gui.expert/training/formulas/#show-values-as)
   * @since 1.1.95
   */
  showValuesAs?: ShowValuesAsConfig,
  /**
   * The formula of a formula column (`ColumnDef.create({ formula })` compiles it into the `valueGetter`), e.g.
   * `"[price] * [quantity] * 1.19"`. Informational – change it with {@link TableApi.setColumnFormula}.
   *
   * @see [Live demo: formulas](https://gui.expert/showcase/formulas/run/) · Training: [Formulas your users can type](https://gui.expert/training/formulas/#formulas)
   * @since 1.1.95
   */
  formula?: string,
  /**
   * Row drag: the body cells of this column get a drag handle (`true`, or a function that decides per row – e.g. no
   * handle for locked rows). Dragging the handle moves the row (see {@link TableOptionsIf.rowDragOptions}); the keyboard
   * alternative is Ctrl+Alt+↑/↓. `TableFactory.createTableModel({ rows, rowDrag: true })` sets it on the first data
   * column.
   *
   * @example
   * ColumnDef.create({ property: "title", headerLabel: "Task", rowDrag: (task: { locked: boolean }) => !task.locked })
   *
   * @since 1.1.95
   */
  rowDrag?: RowDragColumnOption,
  /**
   * Checks an edited, filled or pasted value (after `editInputPipe`): return a message for an invalid value,
   * `undefined` for a valid one. Batch edit: invalid values are marked (`ge-table-cell-invalid`, the message as
   * tooltip) and block {@link TableApi.commitBatchEdit}; otherwise an invalid value is not written.
   *
   * @example
   * ColumnDef.create({
   *   property: "price", headerLabel: "Price", editable: TrueFn, editInputPipe: editInputPipeForNumber,
   *   validate: (value: unknown) => typeof value === "number" && value >= 0 ? undefined : "A price is a number ≥ 0",
   * })
   *
   * @since 1.1.96
   */
  validate?: CellValidator
}

/**
 * {@link ColumnDefIf.validate}: a message for an invalid value, `undefined` (or `null`, `""`) for a valid one.
 *
 * @category Fill handle & batch edit
 * @since 1.1.96
 */
export type CellValidator<T = any> = (value: unknown, row: T) => string | undefined | null | void;

/**
 * {@link ColumnDefIf.rowDrag}: `true` = every row has a drag handle in this column, a function decides per row
 * (`row` = the row object, a `TreeRow` in a tree; `rowIndex` = display index).
 *
 * @category Row drag
 * @since 1.1.95
 */
export type RowDragColumnOption = boolean | ((row: any, rowIndex: number) => boolean);
