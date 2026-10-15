import { AreaModel } from "./area-model";
import type { AreaModelIf } from "./area-model.if";
import type { HasDefaultRowHeightIf } from "./has-default-row-height-if";
import type { ColumnDefIf } from "../column/column-def.if";
import type { CellRendererIf } from "../../../renderer/cell-render.if";
import type { TreeRowIf } from "../../common/tree-row-if";
import type { AggregateFooterConfig, AggregateFooterOptionsIf, AggregateFooterRowIf } from "./aggregate-footer-options.if";
import type { AggregateSpecMap } from "../../../aggregation/aggregate-spec.if";
import { Aggregators } from "../../../aggregation/aggregators";
import { formatAggregateValue } from "../../../aggregation/aggregate";
import { createValueGetter } from "../../../aggregation/create-value-getter";
import { aggregateIndexStates, aggregateStates, resolveAggregateSpec, type ResolvedAggregateSpec } from "../../../aggregation/aggregate-internals";
import { AggregateCellRenderer } from "../../../renderer/aggregate-cell-renderer";
import { isAreaModelTree, isCheckboxColumnDef, isRowNumberColumnDef } from "../../../instanceof-workaround";

/** The words of the default labels of a footer with several rows (all aggregates of a row use the same aggregator). */
const AGGREGATOR_WORDS: Record<string, string> = {
  sum: "Sum", count: "Count", avg: "Average", min: "Min", max: "Max", countDistinct: "Distinct", first: "First", last: "Last",
};

const ROW_COUNT_FORMAT = new Intl.NumberFormat("en-US");

interface FooterRow<T> {
  row: AggregateFooterRowIf<T>;
  specs: ResolvedAggregateSpec<T>[];
  byKey: Map<string, ResolvedAggregateSpec<T>>;
}

interface AggregationSource {
  /** changes when the rows change (identity) – undefined: only invalidateDerivedValues() */
  signal: unknown;
  /** the number of rows, cheap (part of the cache key) – undefined: not known without computing the rows */
  length?: number;
  /** the rows (objects) – or, for models without row objects, the number of rows; called on a cache miss only */
  getRows(): ArrayLike<unknown> | number;
}

interface FooterCache {
  signal: unknown;
  length: number | undefined;
  rowCount: number;
  results: Record<string, unknown>[];
}

/**
 * A ready-made footer with totals (sum, average, count, …) that follow filter and sorting – without an own
 * {@link AreaModel}. One or more total rows; every aggregate belongs to the column with the same **property**
 * (column order, row numbers and the checkbox column don't matter). The easiest way is the factory option
 * `footerAggregates` of {@link TableFactory.createTableModel}.
 *
 * - **Data**: the rows the body shows (`getFilteredRows()`), in a tree all leaves the filter keeps (expanded or not),
 *   in other models every row via `getValueAt` of the column. Options `source: "all"` and `getRows` change that.
 * - **Cells**: the value is the raw result (a number stays a number – Excel export, own footer renderers); the text is
 *   formatted (`format` of the spec, otherwise {@link formatAggregateValue}). A footer renderer of the column
 *   (`rendererMap.footer`) gets the raw value; without it the {@link AggregateCellRenderer} writes the text.
 * - **Label**: `"6 rows"` (or the row's `label`) in the first data column without an aggregate, or in `labelProperty`;
 *   screen readers announce it as row header.
 * - **Cache**: computed once per change of the data, not per repaint or scroll frame. The table drops the cache when
 *   it filters, sorts, edits, gets `updateCells()` or `tableApi.repaint()` / `repaintHard()` – after changing row
 *   objects yourself call `tableApi.repaint()`, as for the cells.
 *
 * @example
 * // one line: totals of quantity and total – the label "100,000 rows" goes into the first column without aggregate
 * const tableModel = TableFactory.createTableModel({
 *   rows: orders,
 *   columnDefs,
 *   footerAggregates: { quantity: "sum", total: "sum" }
 * });
 *
 * @example
 * // two total rows with own labels, an own body model
 * const footer = new AreaModelAggregateFooter<Order>(() => tableModel.getBodyModel(), columnDefs, [
 *   { label: "Sum", aggregates: { quantity: "sum", total: "sum" } },
 *   { label: (rowCount: number) => `Ø of ${rowCount}`, aggregates: { quantity: "avg", total: "avg" } }
 * ]);
 * const tableModel = TableFactory.createTableModel({ rows: orders, columnDefs, footerAreaModel: footer });
 *
 * @example
 * // read the results, e.g. for a title
 * const footer = tableModel.getAreaModel("footer") as AreaModelAggregateFooter<Order>;
 * const { total } = footer.getResults();           // { total: 27481033.5, … }
 *
 * @see {@link aggregateColumns} (the same without a table), {@link TableApi.getSelectionAggregates} (selected cells)
 * @see Training: [Footer totals](https://gui.expert/training/footer-totals/)
 *
 * @since 1.1.94
 * @category Aggregation
 */
export class AreaModelAggregateFooter<T = any> extends AreaModel implements HasDefaultRowHeightIf {

  /** Marker (works across copies of the core): {@link isAreaModelAggregateFooter}. */
  readonly type = "AreaModelAggregateFooter";

  /** Height of the footer rows in px (`rowHeight` of the options, default 34). */
  defaultRowHeight: number;

  private readonly getBody: () => AreaModelIf;
  private readonly options: AggregateFooterOptionsIf<T>;
  private readonly footerRows: FooterRow<T>[];
  private readonly textRenderer = new AggregateCellRenderer();
  private cache?: FooterCache;

  /**
   * @param {AreaModelIf | (() => AreaModelIf)} body - the body model, or a function that returns it (if the footer is
   *        created before the table model, e.g. `() => tableModel.getBodyModel()`)
   * @param {ColumnDefIf[]} columnDefs - the column definitions of the table (the same array – columns are found by property)
   * @param {AggregateFooterConfig<T>} config - `{ total: "sum" }` (one row), `[{ label, aggregates }, …]` (several rows)
   *        or full {@link AggregateFooterOptionsIf}
   */
  constructor(
    body: AreaModelIf | (() => AreaModelIf),
    private readonly columnDefs: ColumnDefIf[],
    config: AggregateFooterConfig<T>
  ) {
    super();
    this.areaIdent = "footer";
    this.getBody = typeof body === "function" ? body : () => body;
    this.options = AreaModelAggregateFooter.toOptions(config);
    this.defaultRowHeight = this.options.rowHeight ?? 34;
    this.footerRows = this.options.rows.map(row => {
      const specs = Object.keys(row.aggregates).map(key => resolveAggregateSpec<T>(key, row.aggregates[key]));
      return { row, specs, byKey: new Map(specs.map(spec => [spec.key, spec])) };
    });
  }

  /** The full options of a short configuration. */
  static toOptions<T>(config: AggregateFooterConfig<T>): AggregateFooterOptionsIf<T> {
    if (Array.isArray(config)) {
      return { rows: config };
    }
    const options = config as AggregateFooterOptionsIf<T>;
    if (Array.isArray(options.rows)) {
      return options;
    }
    return { rows: [{ aggregates: config as AggregateSpecMap<T> }] };
  }

  override getRowCount(): number {
    return this.footerRows.length;
  }

  override getRowHeight(_rowIndex: number): number {
    return this.defaultRowHeight;
  }

  override getConstantRowHeight(): number | undefined {
    return this.defaultRowHeight;
  }

  /**
   * Drops the cached results – the next cell read computes them again ({@link AreaModelIf.invalidateDerivedValues}).
   * The table calls it when it filters, sorts, edits, gets `updateCells()` and on `tableApi.repaint()` / `repaintHard()`.
   *
   * @example
   * order.total = 99;                                 // changed outside the table
   * tableApi.repaint();                               // the cells and the footer show it
   */
  invalidateDerivedValues(): void {
    this.cache = undefined;
  }

  /**
   * The results of a footer row by key (also of keys without a column).
   *
   * @param {number} [rowIndex=0] - the footer row
   * @returns {Record<string, unknown>} key → result (`{}` for a row that does not exist); do not modify it
   *
   * @example
   * const footer = tableModel.getAreaModel("footer") as AreaModelAggregateFooter<Order>;
   * document.title = `${formatAggregateValue(footer.getResults().total)} € in ${footer.getAggregationRowCount()} orders`;
   */
  getResults(rowIndex: number = 0): Record<string, unknown> {
    return this.compute().results[rowIndex] ?? {};
  }

  /**
   * The number of aggregated rows (e.g. the filtered body rows; in a tree the leaves).
   *
   * @returns {number} the number of rows the results are based on
   */
  getAggregationRowCount(): number {
    return this.compute().rowCount;
  }

  /**
   * Whether a cell shows the label of its footer row (the table gives it `role="rowheader"`).
   *
   * @param {number} rowIndex - footer row
   * @param {number} columnIndex - column (model index)
   * @returns {boolean} true for the label cell
   */
  isLabelCell(rowIndex: number, columnIndex: number): boolean {
    return rowIndex >= 0 && rowIndex < this.footerRows.length && this.getLabelColumnIndex(rowIndex) === columnIndex;
  }

  override getValueAt(rowIndex: number, columnIndex: number): any {
    const footerRow = this.footerRows[rowIndex];
    const property = this.columnDefs[columnIndex]?.property;
    if (!footerRow || property === undefined) {
      return "";
    }
    if (footerRow.byKey.has(property)) {
      return this.getResults(rowIndex)[property];
    }
    if (this.isLabelCell(rowIndex, columnIndex)) {
      return this.getLabel(rowIndex);
    }
    return "";
  }

  override getTextValueAt(rowIndex: number, columnIndex: number): string {
    const footerRow = this.footerRows[rowIndex];
    const property = this.columnDefs[columnIndex]?.property;
    if (!footerRow || property === undefined) {
      return "";
    }
    const spec = footerRow.byKey.get(property);
    if (spec) {
      const value = this.getResults(rowIndex)[property];
      return spec.format ? spec.format(value) : formatAggregateValue(value);
    }
    return this.isLabelCell(rowIndex, columnIndex) ? this.getLabel(rowIndex) : "";
  }

  /**
   * The renderer of a cell: for a result the footer renderer of the column (it gets the raw value), otherwise – and for
   * the label – an {@link AggregateCellRenderer} that writes {@link getTextValueAt} as text.
   */
  override getCellRenderer(rowIndex: number, columnIndex: number): CellRendererIf | undefined {
    const property = this.columnDefs[columnIndex]?.property;
    const footerRow = this.footerRows[rowIndex];
    if (!footerRow || property === undefined) {
      return undefined;
    }
    if (footerRow.byKey.has(property)) {
      return this.columnDefs[columnIndex].rendererMap?.footer ?? this.textRenderer;
    }
    return this.isLabelCell(rowIndex, columnIndex) ? this.textRenderer : undefined;
  }

  override getCustomClassesAt(rowIndex: number, columnIndex: number): string[] {
    const property = this.columnDefs[columnIndex]?.property;
    if (property !== undefined && this.footerRows[rowIndex]?.byKey.has(property)) {
      return ["ge-table-footer-aggregate"];
    }
    if (!this.isLabelCell(rowIndex, columnIndex)) {
      return [];
    }
    // a long label ("100,000 rows" in a narrow ID column) may run into the next cell if that one stays empty
    const next = this.columnDefs[columnIndex + 1];
    const nextIsEmpty = !next || !this.footerRows[rowIndex].byKey.has(next.property);
    return nextIsEmpty ? ["ge-table-footer-label", "ge-table-footer-label-overflow"] : ["ge-table-footer-label"];
  }

  /** The label column of a footer row, -1 for none. */
  protected getLabelColumnIndex(rowIndex: number): number {
    const byKey = this.footerRows[rowIndex].byKey;
    const labelProperty = this.options.labelProperty;
    if (labelProperty !== undefined) {
      return byKey.has(labelProperty) ? -1 : this.columnDefs.findIndex(def => def.property === labelProperty);
    }
    return this.columnDefs.findIndex(def =>
      !isRowNumberColumnDef(def) && !isCheckboxColumnDef(def) && def.isVisible?.() !== false && !byKey.has(def.property));
  }

  /** The label text of a footer row. */
  protected getLabel(rowIndex: number): string {
    const { row, specs } = this.footerRows[rowIndex];
    const rowCount = this.getAggregationRowCount();
    if (typeof row.label === "string") {
      return row.label;
    }
    if (typeof row.label === "function") {
      return row.label(rowCount, this.getResults(rowIndex));
    }
    if (this.footerRows.length > 1 && specs.length) {
      const name = specs[0].aggregator.name;
      const word = AGGREGATOR_WORDS[name];
      if (word && specs.every(spec => spec.aggregator === Aggregators[name as keyof typeof Aggregators])) {
        return word;
      }
    }
    return `${ROW_COUNT_FORMAT.format(rowCount)} ${rowCount === 1 ? "row" : "rows"}`;
  }

  /**
   * The rows to aggregate: `getRows` of the options, the (filtered) rows of an object body, the leaves of a tree, or –
   * for models without row objects – the row count.
   * @internal
   */
  protected getSource(): AggregationSource {
    const body = this.getBody();
    const getRows = this.options.getRows;
    if (getRows) {
      // may return a new array on every call: computed on a cache miss only, recomputed after invalidateDerivedValues()
      return { signal: getRows, getRows: () => getRows(body) };
    }
    const all = this.options.source === "all";
    const objects = body as unknown as { getFilteredRows?: () => unknown[]; getAllRows?: () => unknown[] };
    if (typeof objects.getFilteredRows === "function" && typeof objects.getAllRows === "function") {
      const rows = all ? objects.getAllRows() : objects.getFilteredRows();
      return { signal: rows, length: rows.length, getRows: () => rows };
    }
    if (isAreaModelTree(body)) {
      const tree = body as unknown as { rows: unknown[]; getLeafRows(filtered?: boolean): TreeRowIf<unknown>[] };
      // walking the tree is O(n): only on a cache miss. Expanding and collapsing don't change the leaves; filter and
      // sorting invalidate the footer through the table.
      return { signal: tree.rows, getRows: () => tree.getLeafRows(!all).map(row => row.data) };
    }
    const rowCount = body.getRowCount();
    return { signal: undefined, length: rowCount, getRows: () => rowCount };
  }

  /**
   * The getter of a spec for a model without row objects: a property with a column → `getValueAt` of that column;
   * a function or a path without column → applied to `getRowByIndex(r)`.
   * @internal
   */
  protected createIndexGetter(body: AreaModelIf, spec: ResolvedAggregateSpec<T>): ((rowIndex: number) => unknown) | undefined {
    if (!spec.getValue) {
      return undefined; // count
    }
    if (typeof spec.value === "string") {
      const columnIndex = this.columnDefs.findIndex(def => def.property === spec.value);
      if (columnIndex >= 0) {
        return (rowIndex: number) => body.getValueAt(rowIndex, columnIndex);
      }
    }
    const getValue = createValueGetter<T>(spec.value);
    return (rowIndex: number) => getValue(body.getRowByIndex(rowIndex));
  }

  /**
   * A spec whose value is the property of a calculated column of the body (`footerAggregates: { total: "sum" }` with
   * `total` = `price * quantity`) sums the computed values, not the (missing) property of the row (since 1.1.95).
   */
  private withCalculatedValues(specs: ResolvedAggregateSpec<T>[]): ResolvedAggregateSpec<T>[] {
    const body = this.getBody() as Partial<{ isCalculatedProperty(p: string): boolean; getRowValue(row: unknown, p: string): unknown }>;
    if (typeof body.isCalculatedProperty !== "function" || typeof body.getRowValue !== "function") {
      return specs;
    }
    return specs.map(spec => {
      const property = spec.value;
      if (!spec.getValue || typeof property !== "string" || !body.isCalculatedProperty!(property)) {
        return spec;
      }
      return { ...spec, getValue: (row: T) => body.getRowValue!(row, property) };
    });
  }

  private compute(): FooterCache {
    const source = this.getSource();
    const cache = this.cache;
    if (cache && cache.signal === source.signal && cache.length === source.length) {
      return cache;
    }
    const rows = source.getRows();
    const allSpecs = this.withCalculatedValues(this.footerRows.flatMap(footerRow => footerRow.specs));
    let states: unknown[];
    if (typeof rows === "number") {
      const body = this.getBody();
      states = aggregateIndexStates(rows, allSpecs.map(spec => ({ aggregator: spec.aggregator, getValue: this.createIndexGetter(body, spec) })));
    } else {
      states = aggregateStates(rows as ArrayLike<T>, allSpecs);
    }
    let i = 0;
    const results = this.footerRows.map(footerRow => {
      const result: Record<string, unknown> = {};
      for (const spec of footerRow.specs) {
        result[spec.key] = spec.aggregator.result(states[i++]);
      }
      return result;
    });
    const rowCount = typeof rows === "number" ? rows : rows.length;
    this.cache = { signal: source.signal, length: source.length, rowCount, results };
    return this.cache;
  }
}
