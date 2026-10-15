import { Size } from "../../common/size";
import { SizeIf } from "../../common/size.if";
import { ColumnDefIf, ValueRowSortComparator } from "./column-def.if";
import { CellRendererIf } from "../../../renderer/cell-render.if";
import { AreaObjectMapType } from "../../common/area-map.type";
import { AreaObjectMap } from "../../common/area-map";
import { BooleanFunction, FalseFn, TrueFn } from "../../common/boolean-function";
import { SortState } from "../../common/sort-state.type";
import { GetEditRenderer } from "../../../renderer/edit/edit-cell-renderer.type";
import { editInputPipe } from "../../../renderer/edit/edit-input-pipe.if";
import type { ValueGetter, ValueSetter } from "../../../calc/value-getter.type";
import type { ShowValuesAsConfig } from "../../../calc/show-values-as.type";
import type { FormulaOptionsIf } from "../../../formula/formula-options.if";
import { createFormulaValueGetter } from "../../../formula/compile-formula";


/**
 * The column definition – see {@link ColumnDefIf} for all fields.
 *
 * Two ways to create one:
 *
 * @example
 * // short: property, header label, width, CSS classes
 * new ColumnDef("customer", "Customer", px180, bodyLeft);
 * new ColumnDef("total", "Total", px120, allRight);          // numbers: right-aligned in header, body and footer
 *
 * @example
 * // named parameters for everything else
 * ColumnDef.create({
 *   property: "status",
 *   headerLabel: "Status",
 *   width: px110,
 *   bodyRenderer: new StatusBadgeRenderer(),
 *   sortable: TrueFn,
 *   sortComparator: (a: string, b: string) => STATUS_ORDER.indexOf(a) - STATUS_ORDER.indexOf(b)
 * });
 *
 * @see Training: [Columns with ColumnDef](https://gui.expert/training/column-definitions/),
 *   [Sorting](https://gui.expert/training/sorting/), [Cell renderers](https://gui.expert/training/cell-renderers/)
 *
 * @category Columns
 */
export class ColumnDef implements ColumnDefIf {


  public visible = true;

  /** A calculated column, see {@link ColumnDefIf.valueGetter}. */
  public valueGetter?: ValueGetter;
  /** Writes an edited calculated value back, see {@link ColumnDefIf.valueSetter}. */
  public valueSetter?: ValueSetter;
  /** „Show values as“, see {@link ColumnDefIf.showValuesAs}. */
  public showValuesAs?: ShowValuesAsConfig;
  /** The formula of a formula column, see {@link ColumnDefIf.formula}. */
  public formula?: string;

  constructor(
    public property: string,
    public headerLabel: string,
    public width: SizeIf = new Size(100, "px"),
    public classes: AreaObjectMapType<string[]> = new AreaObjectMap<string[]>(),
    public rendererMap: AreaObjectMapType<CellRendererIf> = new AreaObjectMap<CellRendererIf>(),
    public minWidth: SizeIf = new Size(100, "px"),
    public maxWidth: SizeIf = new Size(100, "px"),
    public sortable?: BooleanFunction,
    public sortComparator?: ValueRowSortComparator,
    public sortState?: SortState,
    public sortStatesOrder?: SortState[],
    public sortIconVisible?: BooleanFunction,
    public editable?: BooleanFunction,
    public getEditRenderer?: GetEditRenderer,
    public editInputPipe?: editInputPipe,
    public isVisible: BooleanFunction = ()=>this.visible
  ) {
    if (width.unit !== 'px') {
      this.minWidth = new Size(0, "px");
      this.maxWidth = new Size(100000, "px");
    }
  }

  static bodyRenderer(bodyRenderer: CellRendererIf) {
    return new AreaObjectMap<CellRendererIf>(
      undefined,
      bodyRenderer,
      undefined
    );
  }

  /**
   * Creates a column definition from named parameters. Everything is optional; defaults: width 100 px,
   * visible, not editable, sortable only if `sortable` is given.
   *
   * `headerRenderer` / `bodyRenderer` / `footerRenderer` and `headerClasses` / `bodyClasses` / `footerClasses`
   * fill {@link ColumnDefIf.rendererMap} and {@link ColumnDefIf.classes}.
   *
   * @example
   * ColumnDef.create({
   *   property: "price", headerLabel: "Price", width: px100,
   *   headerClasses: ["ge-table-text-align-right"], bodyClasses: ["ge-table-text-align-right"],
   *   sortable: TrueFn
   * });
   */
  static create(param: {
    /** Property of the row object, see {@link ColumnDefIf.property}. */
    property?: string,
    /** Header label. */
    headerLabel?: string,
    /** Width, default 100 px. */
    width?: SizeIf,
    /** Lower limit for % widths. */
    minWidth?: SizeIf,
    /** Upper limit for % widths. */
    maxWidth?: SizeIf,
    /** Renderer of the header cell. */
    headerRenderer?: CellRendererIf,
    /** Renderer of the body cells. */
    bodyRenderer?: CellRendererIf,
    /** Renderer of the footer cells. */
    footerRenderer?: CellRendererIf,
    /** CSS classes of the header cell, e.g. `["ge-table-text-align-right"]`. */
    headerClasses?: string[]
    /** CSS classes of the body cells. */
    bodyClasses?: string[]
    /** CSS classes of the footer cells. */
    footerClasses?: string[],
    /** Sortable by double-click on the header, e.g. `TrueFn`. */
    sortable?: BooleanFunction,
    /** Show the sort icon (default: follows `sortable`). */
    sortIconVisible?: BooleanFunction,
    /** Own comparison of two cell values. */
    sortComparator?: ValueRowSortComparator,
    /** Initial sort icon (`"asc"`, `"desc"`); sort the rows with `tableModel.doSort()` to match. */
    sortState?: SortState,
    /** Order of the sort states on repeated double-clicks. */
    sortStatesOrder?: SortState[],
    /** Cells can be edited, e.g. `TrueFn`. */
    editable?: BooleanFunction,
    /** Column is shown (default `TrueFn`). */
    isVisible?: BooleanFunction,
    /** The editor of this column. */
    getEditRenderer?: GetEditRenderer,
    /** Converts the editor text before it is stored, e.g. `editInputPipeForNumber`. */
    editInputPipe?: editInputPipe,
    /** A calculated column: `(row, context) => value` (since 1.1.95). */
    valueGetter?: ValueGetter,
    /** Makes a calculated column editable (since 1.1.95). */
    valueSetter?: ValueSetter,
    /** „Show values as“: `"percentOfColumnTotal"`, `"rank"` … (since 1.1.95). */
    showValuesAs?: ShowValuesAsConfig,
    /**
     * A formula column, e.g. `"[price] * [quantity] * 1.19"` – compiled once into the `valueGetter` (since 1.1.95,
     * see {@link compileFormula}). Takes precedence over `valueGetter`.
     */
    formula?: string,
    /** Own functions of the formula (since 1.1.95). */
    formulaOptions?: FormulaOptionsIf,
  }): ColumnDefIf {

    const am = new AreaObjectMap<CellRendererIf>(
      param.headerRenderer,
      param.bodyRenderer,
      param.footerRenderer
    );

    const cm = new AreaObjectMap<string[]>(
      param.headerClasses,
      param.bodyClasses,
      param.footerClasses
    );

    // undefined = icon follows sortState (like the constructor); a later `columnDef.sortable = TrueFn` then shows it too
    const sortIconVisible = param.sortIconVisible ?? param.sortable;
    const editable = param.editable ?? param.editable ?? FalseFn;
    const isVisible = param.isVisible ?? param.isVisible ?? TrueFn;

    const def = new ColumnDef(
      param.property ?? "",
      param.headerLabel ?? "",
      param.width ?? new Size(100, "px"),
      cm,
      am,
      param.minWidth ?? new Size(100, "px"),
      param.maxWidth ?? new Size(100, "px"),
      param.sortable,
      param.sortComparator,
      param.sortState,
      param.sortStatesOrder,
      sortIconVisible,
      editable,
      param.getEditRenderer,
      param.editInputPipe,
      isVisible,
    );
    if (param.formula !== undefined && param.formula !== null) {
      def.formula = param.formula;
      def.valueGetter = createFormulaValueGetter(param.formula, param.formulaOptions);
    } else if (param.valueGetter) {
      def.valueGetter = param.valueGetter;
    }
    if (param.valueSetter) def.valueSetter = param.valueSetter;
    if (param.showValuesAs) def.showValuesAs = param.showValuesAs;
    return def;
  }

}
