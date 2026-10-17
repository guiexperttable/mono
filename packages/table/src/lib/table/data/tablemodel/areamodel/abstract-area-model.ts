import { CellRendererIf } from "../../../renderer/cell-render.if";
import { AreaModelIf } from "./area-model.if";
import { CheckedType } from "../../common/checked-type";
import { ColumnDefIf } from "../column/column-def.if";
import { hasDefaultEditable } from "../column/default-editable";
import { AreaIdent } from "../area-ident.type";
import { CheckboxModelIf } from "../../../checkbox/checkbox-model.if";
import { FilterFunction } from "../../common/filter-function";
import { SortItem } from "../../common/sort-item";
import { HasDefaultRowHeightIf } from "./has-default-row-height-if";
import { ColumnValues } from "../../../calc/column-values";
import { AggregateCellRenderer } from "../../../renderer/aggregate-cell-renderer";
import { formatShowValuesAs } from "../../../calc/show-values-as";
import { isFormulaError } from "../../../formula/formula-error";
import { isCheckboxColumnDef, isRowGroupColumnDef, isRowNumberColumnDef, isTreeRow } from "../../../instanceof-workaround";
import type { SheetCellsIf } from "../../../sheet/sheet-cells.if";


/** @category Area models */
export abstract class AbstractAreaModel<T> implements AreaModelIf, HasDefaultRowHeightIf {

  public rowSelectionModel: CheckboxModelIf<any> | undefined = undefined;
  private columnValuesInstance?: ColumnValues;
  private calcTextRenderer?: AggregateCellRenderer;
  protected cellRenderers: (CellRendererIf | undefined)[];
  protected yPositions: number[] = [];
  /** Cell formulas of the table (since 1.1.99, set by the table for a flat body). @internal */
  sheetCells?: SheetCellsIf;

  constructor(
    public areaIdent: AreaIdent,
    protected columnDefs: ColumnDefIf[] = [],
    public defaultRowHeight: number = -1
  ) {
    this.cellRenderers = columnDefs.map(def => def.rendererMap[areaIdent]);
  }


  abstract getRowCount(): number;

  abstract getValueAt(rowIndex: number, columnIndex: number): any;

  getTextValueAt(rowIndex: number, columnIndex: number): string {
    // TODO date to iso aso...
    return '' + this.getValueAt(rowIndex, columnIndex);
  }

  getTooltipAt(rowIndex: number, columnIndex: number): any {
    if (this.sheetCells?.isFormulaColumnIndex(columnIndex)) {
      const value = this.getValueAt(rowIndex, columnIndex);
      if (isFormulaError(value)) return value.message; // a cell formula (since 1.1.99)
    }
    return "";
  };

  abstract getRowHeight(rowIndex: number): number;

  getCellRenderer(_rowIndex: number, columnIndex: number): CellRendererIf | undefined {
    if (columnIndex < this.cellRenderers.length) {
      return this.cellRenderers[columnIndex];
    }
    return undefined;
  }

  getColspanAt(_rowIndex: number, _columnIndex: number): number {
    return 0;
  }

  getCustomClassesAt(rowIndex: number, columnIndex: number): string[] {
    if (this.sheetCells?.isFormulaColumnIndex(columnIndex) && isFormulaError(this.getValueAt(rowIndex, columnIndex))) {
      return ["ge-table-cell-error"]; // a cell formula (since 1.1.99)
    }
    return [];
  }

  getCustomStyleAt(_rowIndex: number, _columnIndex: number): { [key: string]: string } | undefined {
    return undefined;
  }

  getRowspanAt(_rowIndex: number, _columnIndex: number): number {
    return 0;
  }

  getRowByIndex(_rowIndex: number): any {
    return undefined;
  }

  isRowCheckable(_rowIndex: number): boolean {
    return true;
  }

  isRowChecked(rowIndex: number): CheckedType | undefined {
    const row = this.getRowByIndex(rowIndex);
    return this.rowSelectionModel?.isRowChecked(row);
  }

  setRowChecked(rowIndex: number, checked: boolean): void {
    if (this.rowSelectionModel) {
      const row = this.getRowByIndex(rowIndex);
      this.rowSelectionModel.checkRow(row, checked);
    }
  }

  getMaxColspan(): number {
    return 31;
  }

  getMaxRowspan(): number {
    return 31;
  }


  getYPosByRowIndex(rowIndex: number): number {
    if (this.defaultRowHeight > 0) {
      return this.defaultRowHeight * rowIndex;
    }
    return this.yPositions[rowIndex];
  }


  init() {
    if (!this.yPositions.length && this.getRowCount() !== undefined) {
      if (this.defaultRowHeight === -1) {
        this.calcYPositions();
      }
    }
  }

  abstract externalFilterChanged<T>(predictFn: FilterFunction<T>): void ;

  isFilterable(): boolean {
    return this.areaIdent === "body";
  }

  doSort(_sortItems: SortItem[]): boolean {
    // do nothing
    return false;
  }

  sort(_compareFn?: (a: any, b: any) => number):void {
    // ignore
  }


  /**
   * Columns without an own `editable` are editable (Excel-style editing, `EditingOptionsIf.defaultEditable`; set by
   * the table). Row number, checkbox and group columns stay read only.
   * @since 1.1.99
   */
  defaultEditable = false;

  isEditable(_rowIndex: number, columnIndex: number): boolean {
    const columnDef = this.columnDefs?.[columnIndex];
    if (this.areaIdent === "body" && columnDef?.valueGetter && !columnDef.valueSetter) {
      return false; // a calculated column without a setter (since 1.1.95)
    }
    if (this.defaultEditable && this.areaIdent === "body" && columnDef
      && hasDefaultEditable(columnDef)) {
      return !isCheckboxColumnDef(columnDef) && !isRowNumberColumnDef(columnDef) && !isRowGroupColumnDef(columnDef);
    }
    return columnDef?.editable?.() ?? false;
  }

  setValue(rowIndex: number, columnIndex: number, value: any): boolean {
    const editInputPipe = this.columnDefs[columnIndex]?.editInputPipe;
    if (editInputPipe) {
      value = editInputPipe(value, rowIndex, columnIndex);
    }
    const row: T = this.getRowByIndex(rowIndex);
    const columnDef = this.columnDefs[columnIndex];
    if (this.areaIdent === "body" && columnDef?.valueGetter) {
      return this.setCalculatedValue(row, columnDef, value);
    }
    const property = this.columnDefs[columnIndex].property;
    if (property.includes(".")) {
      return this.setPropertyValue(row, property.split("."), value);
    }

    row[property as keyof T] = value;
    return true;
  }


  isSelectable(_rowIndex: number, _columnIndex: number): boolean {
    return true;
  }

  changeColumnOrder(sourceColumnIndex: number, targetColumnIndex: number): void {
    //  not this! this.arrayMove(this.columnDefs...)
    this.arrayMove(this.cellRenderers, sourceColumnIndex, targetColumnIndex);
  }

  protected setPropertyValue(o: any, props: string[], value: any): boolean {
    const prop = props.shift();
    if (prop) {
      const o2 = o[prop];
      if (o2 && props.length) {
        return this.setPropertyValue(o2, props, value);

      } else {
        o[prop] = value;
        return true;
      }
    }
    return false;
  }

  protected arrayMove(arr: any[], fromIndex: number, toIndex: number) {
    const element = arr.splice(fromIndex, 1)[0];
    arr.splice(toIndex, 0, element);
    return arr;
  }

  private calcYPositions() {
    const rowCount = this.getRowCount();
    this.yPositions = new Array(rowCount + 1);
    this.yPositions[0] = 0;
    for (let i = 0; i < rowCount; i++) {
      this.yPositions[i + 1] = this.getRowHeight(i) + this.yPositions[i];
    }
  }


  // ---------------------------------------------------------------- calculated columns (since 1.1.95, prompt 008)

  /**
   * True if a column of this model with this property is calculated (`valueGetter` or `formula`).
   *
   * @param {string} property - the property of the column
   * @returns {boolean} whether its values are computed
   *
   * @example
   * tableModel.getBodyModel().isCalculatedProperty?.("total");   // true
   *
   * @since 1.1.95
   */
  isCalculatedProperty(property: string): boolean {
    return this.getColumnValues().isCalculated(property) || !!this.sheetCells?.isFormulaProperty(property);
  }

  /**
   * The value of a column for a row object – the computed value of a calculated column, otherwise the property
   * (path). A `TreeRow` is unwrapped. The table API offers it as {@link TableApi.getRowValue}.
   *
   * @param {any} row - a row object (or `TreeRow`)
   * @param {string} property - the property of the column
   * @returns {unknown} the value
   *
   * @example
   * const body = tableModel.getBodyModel() as AreaModelObjectArray<Item>;
   * body.getRowValue({ price: 25, quantity: 10 }, "total");   // 250
   *
   * @since 1.1.95
   */
  getRowValue(row: any, property: string): unknown {
    if (isTreeRow(row)) {
      row = row.data; // a TreeRow
    }
    const value = this.getColumnValues().get(row, property);
    return this.sheetCells && typeof value === "string" ? this.sheetCells.valueOfProperty(row, property, value) : value;
  }

  /**
   * True if the model has calculated or „Show values as“ columns – their cells depend on other cells
   * (the table redraws them after `updateCells`).
   *
   * @returns {boolean} whether derived columns exist
   * @since 1.1.95
   */
  hasDerivedColumns(): boolean {
    const values = this.getColumnValues();
    return values.hasGetters() || values.hasShowValuesAs();
  }

  /**
   * True if the cells of a column depend on other cells (calculated or „Show values as“).
   *
   * @param {string} property - the property of the column
   * @returns {boolean} whether the column is derived
   * @since 1.1.95
   */
  isDerivedProperty(property: string): boolean {
    const values = this.getColumnValues();
    return values.isCalculated(property) || !!values.getShowValuesAs(property);
  }

  /** The resolver of calculated values of this model (created on first use). @internal */
  protected getColumnValues(): ColumnValues {
    return this.columnValuesInstance ??= new ColumnValues({
      // calculated columns and „Show values as“ apply to the body only (header and footer show their own data)
      getColumnDefsForValues: () => this.areaIdent === "body" ? this.columnDefs : [],
      readPath: (row: any, property: string) => {
        const value = this.readPropertyPath(row, property);
        // cell formulas (since 1.1.99): a calculated column reads the result, not the formula text
        return this.sheetCells && typeof value === "string" ? this.sheetCells.valueOfProperty(row, property, value) : value;
      },
      getAggregationSource: () => this.getAggregationSourceForValues(),
      isSheetFormula: (property: string) => !!this.sheetCells?.isFormulaProperty(property),
    });
  }

  /** Drops the cached aggregates and the getter lookup of calculated columns. */
  protected invalidateColumnValues(): void {
    this.columnValuesInstance?.invalidate();
  }

  /** The value of a property path – overridden by the models with their own path semantics. */
  protected readPropertyPath(row: any, property: string): unknown {
    if (row === null || row === undefined || !property) return undefined;
    let o: any = row;
    for (const key of property.split(".")) {
      if (o === null || o === undefined) return undefined;
      o = o[key];
    }
    return o;
  }

  /** The rows of column aggregates in formulas (`SUM([total])`): the filtered row objects. */
  protected getAggregationSourceForValues(): { signal: unknown; length: number; rows: () => ArrayLike<unknown> } {
    const n = this.getRowCount();
    return { signal: undefined, length: n, rows: () => Array.from({ length: n }, (_, i) => this.getRowByIndex(i)) };
  }

  /** Writes an edited value of a calculated column through its `valueSetter`; without one: rejected. */
  protected setCalculatedValue(row: any, columnDef: ColumnDefIf, value: any): boolean {
    if (!columnDef.valueSetter || row === undefined || row === null) {
      return false;
    }
    if (isTreeRow(row)) {
      row = row.data; // a TreeRow
    }
    return columnDef.valueSetter(row, value) !== false;
  }

  /** The text of a cell of a calculated / „Show values as“ column; `undefined` for a normal column. */
  protected getCalculatedText(property: string | undefined, value: unknown): string | undefined {
    if (property === undefined) return undefined;
    const values = this.getColumnValues();
    const showValuesAs = values.getShowValuesAs(property);
    const calculated = values.isCalculated(property);
    if (calculated && isFormulaError(value)) return value.code;
    if (showValuesAs) return formatShowValuesAs(value, showValuesAs);
    if (calculated) return value === undefined || value === null ? "" : `${value}`;
    return undefined;
  }

  /** The renderer of a „Show values as“ column without an own renderer: the text of `getTextValueAt`. */
  protected getCalculatedRenderer(property: string | undefined): CellRendererIf | undefined {
    if (property !== undefined && this.getColumnValues().getShowValuesAs(property)) {
      return this.calcTextRenderer ??= new AggregateCellRenderer();
    }
    return undefined;
  }

  /** The CSS class and tooltip of an error value of a formula. */
  protected addCalculatedClasses(classes: string[], property: string | undefined, value: () => unknown): string[] {
    if (property !== undefined && this.getColumnValues().isCalculated(property) && isFormulaError(value())) {
      return [...classes, "ge-table-cell-error"];
    }
    return classes;
  }
}


