import { TableModel } from "../data/tablemodel/table-model";
import type { TableModelIf } from "../data/tablemodel/table-model.if";
import type { ColumnDefIf } from "../data/tablemodel/column/column-def.if";
import { ColumnDef } from "../data/tablemodel/column/column-def";
import { AreaModelArrayOfArrays } from "../data/tablemodel/areamodel/area-model-array-of-arrays";
import { AreaModelHidden } from "../data/tablemodel/areamodel/area-model-hidden";
import { DefaultRowHeights } from "../data/options/default-row-heights";
import { Size } from "../data/common/size";
import { RowNumberColumnDef } from "../data/common/row-number-column-def";
import { TableOptions } from "../data/options/table-options";
import type { TableOptionsIf } from "../data/options/table-options.if";
import { SelectionModel } from "../selection/selection-model";
import { FocusModel } from "../focus/focus-model";
import type { FormulaFunction } from "../formula/formula-options.if";
import { columnLetter } from "../sheet/cell-address";
import { AreaModelSheet } from "./area-model-sheet";
import { sheetInputPipe } from "../clipboard/input-pipes";
import type { editInputPipe } from "../renderer/edit/edit-input-pipe.if";

/**
 * The parameters of {@link SpreadsheetFactory.create}. All optional.
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export interface SpreadsheetParamIf {
  /** Rows × columns of inputs; formulas as `"=…"`. Default: empty. */
  data: unknown[][];
  /** Rows of the sheet. Default `max(data.length, 100)`. */
  rowCount: number;
  /** Columns of the sheet. Default `max(longest row, 26)` (A–Z). */
  columnCount: number;
  /** Width of a column in px. Default 100. */
  columnWidth: number;
  /** Height of a row in px. Default 30. */
  rowHeight: number;
  /** Row numbers in front (they count the rows of the sheet, also when sorted). Default `true`. */
  rowNumbers: boolean;
  /** Merged over the options of the factory (selection, focus, the spreadsheet preset). */
  tableOptions: Partial<TableOptionsIf>;
  /** Own functions of the cell formulas. */
  functions: Record<string, FormulaFunction>;
  /**
   * The locale of typed and pasted values (`sheetInputPipe`): `"1,5"` is 1.5 in `"de-DE"`. Default: the browser's
   * locale. Formulas always use `.` and English function names.
   */
  locale: string;
}

/**
 * The header of a spreadsheet: one row with the column letters `A, B, …` (`isColumnLetterRow(0)` – a click selects the
 * column).
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export class AreaModelSheetHeader extends AreaModelArrayOfArrays<string> {

  /** The number of header rows with column letters (from the top). */
  readonly columnLetterRows = 1;

  /**
   * @param {number} rowIndex - a header row
   * @returns {boolean} true for the row of column letters
   */
  isColumnLetterRow(rowIndex: number): boolean {
    return rowIndex < this.columnLetterRows;
  }

  /**
   * New columns (insert/delete columns).
   *
   * @param {ColumnDefIf[]} columnDefs - all columns
   */
  setColumns(columnDefs: ColumnDefIf[]): void {
    this.arr.length = 0;
    this.arr.push(columnDefs.map(def => def.headerLabel));
    this.filteredArr = [...this.arr];
    this.columnDefs = columnDefs;
    this.cellRenderers = columnDefs.map(def => def.rendererMap?.[this.areaIdent]);
  }
}

/**
 * The table model of a spreadsheet ({@link SpreadsheetFactory}): its data columns can be inserted and deleted
 * (`TableApi.insertColumns`).
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export class SpreadsheetTableModel extends TableModel {

  constructor(
    header: AreaModelSheetHeader,
    readonly sheetBody: AreaModelSheet,
    private readonly rowNumberColumn: RowNumberColumnDef | undefined,
    columnDefs: ColumnDefIf[],
    rowHeight: number,
    private readonly columnWidth: number,
    private readonly inputPipe: editInputPipe = sheetInputPipe(),
  ) {
    super(header, sheetBody, new AreaModelHidden("footer"), rowNumberColumn ? 1 : 0, 0, false,
      new DefaultRowHeights(rowHeight, rowHeight, rowHeight), columnDefs);
  }

  /**
   * Sets the data columns: `A…` with the given widths (insert/delete columns keep the widths of the moved columns).
   *
   * @param {number} count - data columns
   * @param {number[]} [widths] - width per data column in px (missing: the default width)
   */
  setDataColumns(count: number, widths: number[] = []): void {
    const columnDefs = createSheetColumnDefs(count, this.columnWidth, this.rowNumberColumn, widths, this.inputPipe);
    this.columnDefs = columnDefs;
    this.columnCount = columnDefs.length;
    this.columnSizes = [];
    (this.headerAreaModel as AreaModelSheetHeader).setColumns(columnDefs);
    this.sheetBody.setColumnDefs(columnDefs);
    this.init();
  }

  /** @returns {number[]} the widths of the data columns in px */
  getDataColumnWidths(): number[] {
    const offset = this.rowNumberColumn ? 1 : 0;
    return Array.from({ length: this.getColumnCount() - offset }, (_, i) => this.getColumnWidth(i + offset));
  }
}

function createSheetColumnDefs(count: number, width: number, rowNumberColumn: RowNumberColumnDef | undefined,
                               widths: number[] = [], pipe: editInputPipe): ColumnDefIf[] {
  const defs: ColumnDefIf[] = Array.from({ length: count }, (_, i) => ColumnDef.create({
    editInputPipe: pipe, // typed "5" is the number 5 (numbers, dates, TRUE/FALSE like Excel)
    property: columnLetter(i),
    headerLabel: columnLetter(i),
    width: new Size(widths[i] ?? width, "px"),
    minWidth: new Size(20, "px"),
    maxWidth: new Size(2000, "px"),
  }));
  return rowNumberColumn ? [rowNumberColumn, ...defs] : defs;
}

/**
 * Builds an empty (or filled) spreadsheet in one call: column letters, row numbers, a sparse body (a million rows cost
 * only their filled cells) and the options of the spreadsheet preset – Excel-style editing, copy and paste, undo,
 * cell formulas, the fill handle and a range selection with the active cell on A1.
 *
 * @example
 * const { tableModel, tableOptions } = SpreadsheetFactory.create({
 *   data: [["Product", "Price", "Qty", "Total"], ["Laptop", 1299, 2, "=B2*C2"]],
 * });
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export class SpreadsheetFactory {

  /**
   * Model and options of a spreadsheet.
   *
   * @param {Partial<SpreadsheetParamIf>} [param] - data, size, row numbers, options
   * @returns {{ tableModel: SpreadsheetTableModel, tableOptions: TableOptionsIf }} for the table or a wrapper
   */
  static create(param: Partial<SpreadsheetParamIf> = {}): { tableModel: SpreadsheetTableModel; tableOptions: TableOptionsIf } {
    const data = param.data ?? [];
    const rowCount = Math.max(param.rowCount ?? 100, data.length);
    const columnCount = Math.max(param.columnCount ?? 26, data.reduce((m, row) => Math.max(m, row?.length ?? 0), 0));
    const rowHeight = param.rowHeight ?? 30;
    const columnWidth = param.columnWidth ?? 100;
    const rowNumberColumn = param.rowNumbers === false ? undefined
      : new RowNumberColumnDef({ mode: "original" });
    const pipe = sheetInputPipe(param.locale);
    const columnDefs = createSheetColumnDefs(columnCount, columnWidth, rowNumberColumn, [], pipe);
    const header = new AreaModelSheetHeader("header", [columnDefs.map(def => def.headerLabel)], rowHeight, columnDefs);
    const body = new AreaModelSheet("body", data, rowCount, columnCount, rowHeight, columnDefs, rowNumberColumn ? 1 : 0);
    const tableModel = new SpreadsheetTableModel(header, body, rowNumberColumn, columnDefs, rowHeight, columnWidth, pipe);
    const selectionModel = new SelectionModel("range", "multi");
    const focusModel = new FocusModel("cell");
    focusModel.setFocus(0, rowNumberColumn ? 1 : 0); // A1
    const tableOptions: TableOptionsIf = {
      ...new TableOptions(),
      getSelectionModel: () => selectionModel,
      getFocusModel: () => focusModel,
      spreadsheet: true,
      ...(param.functions ? { cellFormulas: { functions: param.functions } } : {}),
      hoverRowVisible: false,   // a sheet: the active cell and the selection are the marks
      hoverColumnVisible: false,
      ...param.tableOptions,
    };
    return { tableModel, tableOptions };
  }
}

/** @returns {boolean} true for the model of a {@link SpreadsheetFactory} sheet */
export function isSpreadsheetTableModel(model: TableModelIf): model is SpreadsheetTableModel {
  return model instanceof SpreadsheetTableModel;
}
