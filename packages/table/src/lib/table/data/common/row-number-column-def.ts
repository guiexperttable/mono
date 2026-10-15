import { Size } from "./size";
import { SizeIf } from "./size.if";
import { ColumnDefIf } from "../tablemodel/column/column-def.if";
import { CellRendererIf } from "../../renderer/cell-render.if";
import { AreaObjectMapType } from "./area-map.type";
import { AreaObjectMap } from "./area-map";
import { AreaModelIf } from "../tablemodel/areamodel/area-model.if";
import { BooleanFunction, TrueFn } from "./boolean-function";
import { RowNumberCellRenderer } from "../../renderer/row-number-cell-renderer";
import { RowNumberOptionsIf } from "./row-number-options.if";
import { RowNumberOptions } from "./row-number-options";

/**
 * A built-in column with running row numbers (1, 2, 3 …) like the row headers of a spreadsheet.
 *
 * The easy way is the factory flag: `TableFactory.createTableModel({ rows, rowNumbersVisible: true })` puts this column
 * in front of the others and fixes it on the left. Put it into `columnDefs` yourself if you build the models yourself
 * – as the **first** column, counted in `fixedLeftColumnCount`.
 *
 * What the table does with it:
 * - the width follows the largest number (`"9"` → `"2000000"`) – after `setRows`, filtering, expanding tree rows;
 * - not sortable, not editable, no resize handle, can't be dragged, no column can be dragged in front of it;
 * - body cells have `role="rowheader"` – screen readers announce the number with the row;
 * - a click on a number selects the row (selection type `"row"` and `"range"`), Shift extends, Ctrl/⌘ toggles;
 *   a click on the header cell selects all;
 * - copy ({@link TableApi.copyToClipboard}) and Excel export ({@link TableApi.downloadExcel}) leave it out, unless
 *   `exported: true`;
 * - with a {@link CheckboxColumnDef} directly behind it, the checkbox, the tree arrow and
 *   `showCheckboxWihoutExtraColumn` move one column to the right.
 *
 * Note: it is a real column – the indices of all other columns are one higher (like with a `CheckboxColumnDef`).
 * Use properties where you can (`tableApi.setColumnVisible("total", false)`, {@link TableApi.getColumnIndex}).
 *
 * @example
 * const withNumbers: ColumnDefIf[] = [new RowNumberColumnDef(), new CheckboxColumnDef(), ...columnDefs];
 * const model = TableFactory.createTableModel({ rows: orders, columnDefs: withNumbers, fixedLeftColumnCount: 2 });
 *
 * @see Training: [Fixed columns](https://gui.expert/training/fixed-columns/)
 *
 * @since 1.1.93
 * @category Row numbers
 */
export class RowNumberColumnDef implements ColumnDefIf {

  /** Marker for {@link isRowNumberColumnDef} (works across copies of the core). */
  readonly type = "RowNumberColumnDef";

  property = "RowNumberColumn";
  headerLabel: string;
  /** Starts with `minWidthInPx`; the table widens it to fit the largest number. */
  width: SizeIf;
  minWidth: SizeIf;
  maxWidth: SizeIf = new Size(400, "px");
  rendererMap: AreaObjectMapType<CellRendererIf>;
  classes: AreaObjectMapType<string[]> = new AreaObjectMap<string[]>(
    ["ge-table-row-number-header", "ge-table-text-align-right"],
    ["ge-table-row-number", "ge-table-text-align-right"],
    ["ge-table-row-number-footer"]
  );
  isVisible: BooleanFunction = TrueFn;

  /** The options (defaults from {@link RowNumberOptions}). */
  readonly options: RowNumberOptionsIf;

  /**
   * "original": position of each row in getAllRows() – built when needed, for one array with one length. Checked on
   * every lookup (`rows[position] === row`): rows sorted or replaced in place rebuild it.
   */
  private originalIndex?: { rows: unknown[]; length: number; index: Map<unknown, number>; missRebuilt: boolean };

  constructor(options: Partial<RowNumberOptionsIf> = {}) {
    this.options = { ...new RowNumberOptions(), ...options };
    this.headerLabel = this.options.headerLabel;
    this.width = new Size(this.options.minWidthInPx, "px");
    this.minWidth = new Size(this.options.minWidthInPx, "px");
    this.rendererMap = new AreaObjectMap<CellRendererIf>(undefined, new RowNumberCellRenderer(this), undefined);
  }

  /**
   * The number of a body row (1-based): its position in the view (`"display"`) or in `getAllRows()` (`"original"`).
   *
   * @param {number} rowIndex - row index in the body (the current view)
   * @param {AreaModelIf} bodyModel - the body model
   * @returns {number} the row number
   *
   * @example
   * const columnDef = new RowNumberColumnDef();
   * const rowNumber = columnDef.getRowNumber(0, tableModel.getBodyModel()); // 1
   */
  getRowNumber(rowIndex: number, bodyModel: AreaModelIf): number {
    if (this.options.mode === "original") {
      const position = this.getOriginalPosition(bodyModel.getRowByIndex(rowIndex), bodyModel);
      if (position !== undefined) {
        return position + 1;
      }
    }
    return rowIndex + 1;
  }

  /**
   * The text of a row number: `options.format(getRowNumber(…))`.
   *
   * @param {number} rowIndex - row index in the body
   * @param {AreaModelIf} bodyModel - the body model
   * @returns {string} the text shown in the cell (and exported with `exported: true`)
   *
   * @example
   * const columnDef = new RowNumberColumnDef({ format: n => n.toLocaleString("en-US") });
   * const text = columnDef.getRowNumberText(1999, tableModel.getBodyModel()); // "2,000"
   */
  getRowNumberText(rowIndex: number, bodyModel: AreaModelIf): string {
    return this.options.format(this.getRowNumber(rowIndex, bodyModel));
  }

  /**
   * The text of the largest number the column can show now – the table measures it for the column width.
   * `"display"`: the row count; `"original"`: the count of all rows (unfiltered). At least the text of 1.
   *
   * @param {AreaModelIf} bodyModel - the body model
   * @returns {string} e.g. `"2000000"`
   *
   * @example
   * const widest = new RowNumberColumnDef().getWidestText(tableModel.getBodyModel()); // "1000" for 1000 rows
   */
  getWidestText(bodyModel: AreaModelIf): string {
    let max = bodyModel.getRowCount();
    if (this.options.mode === "original" && this.hasAllRows(bodyModel)) {
      max = bodyModel.getUnfilteredRowCount?.() ?? bodyModel.getAllRows().length;
    }
    return this.options.format(Math.max(1, max));
  }

  /**
   * True if the numbers are shown without an own `format` (plain digits) – the Excel export then writes numbers.
   *
   * @returns {boolean} false with an own `options.format`
   *
   * @example
   * const plain = new RowNumberColumnDef().hasDefaultFormat(); // true
   */
  hasDefaultFormat(): boolean {
    return this.options.format === new RowNumberOptions().format;
  }

  private hasAllRows(bodyModel: AreaModelIf): bodyModel is AreaModelIf & { getAllRows(): unknown[] } {
    return typeof (bodyModel as { getAllRows?: unknown }).getAllRows === "function";
  }

  /** Position of a row in getAllRows() (0-based), undefined if the model has no getAllRows() or the row is not in it. */
  private getOriginalPosition(row: unknown, bodyModel: AreaModelIf): number | undefined {
    if (!this.hasAllRows(bodyModel)) {
      return undefined;
    }
    const rows = bodyModel.getAllRows();
    if (!Array.isArray(rows)) {
      return undefined;
    }
    let cached = this.originalIndex;
    if (!cached || cached.rows !== rows || cached.length !== rows.length) {
      cached = this.buildOriginalIndex(rows);
    }
    const position = cached.index.get(row);
    if (position !== undefined && rows[position] === row) {
      return position;
    }
    // changed in place (sorted, a row replaced): build once more – but not again for every row that is not there
    if (position !== undefined || !cached.missRebuilt) {
      cached = this.buildOriginalIndex(rows);
      cached.missRebuilt = true;
      const again = cached.index.get(row);
      return again !== undefined && rows[again] === row ? again : undefined;
    }
    return undefined;
  }

  private buildOriginalIndex(rows: unknown[]): { rows: unknown[]; length: number; index: Map<unknown, number>; missRebuilt: boolean } {
    const index = new Map<unknown, number>();
    for (let i = 0; i < rows.length; i++) {
      if (!index.has(rows[i])) index.set(rows[i], i);
    }
    this.originalIndex = { rows, length: rows.length, index, missRebuilt: false };
    return this.originalIndex;
  }
}
