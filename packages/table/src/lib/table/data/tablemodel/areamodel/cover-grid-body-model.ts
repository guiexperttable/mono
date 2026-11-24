import { AreaModelIf } from './area-model.if';
import { CellRendererIf } from '../../../renderer/cell-render.if';
import { CheckedType } from '../../common/checked-type';
import { CheckboxModelIf } from '../../../checkbox/checkbox-model.if';
import { FilterFunction } from '../../common/filter-function';
import { SortItem } from '../../common/sort-item';
import { AreaIdent } from '../area-ident.type';
import { SorterService } from '../../../service/sorter.service';
import { TileLayoutIf } from './tile-layout.if';
import { CoverGridFillOptionsIf } from '../../../cover-grid/cover-grid-fill-options.if';
import { computeCoverGridFill, CoverGridFillLayoutIf } from '../../../cover-grid/cover-grid-fill';

/**
 * Body of a cover grid: `filteredItems[row * columns + column]` is the item of a tile (`getValueAt`), `columns` =
 * `floor(width / coverWidth)` (at least 1). `items` = all items, `filteredItems` = shown items (filter and `sort()`
 * work on it). Change `coverWidth`/`coverHeight` or the items and call `tableApi.repaintHard()`.
 *
 * `filteredItems` is the `items` array itself until the first filter or sort; `sort()` and `doSort()` sort a copy
 * (since 1.1.115 – before, they reordered the array of the app as long as no filter was set).
 *
 * The model is a {@link TileLayoutIf} (since 1.1.115): the keyboard moves from item to item, empty tiles never get
 * the focus and the focus follows the item after sorting, filtering and resizing.
 *
 * Full width (since 1.1.117): with {@link setFill} (or {@link TableOptionsIf.coverGridFill}) the columns come from the
 * wanted tile width and the tiles are stretched until they fill the row – `coverWidth`/`coverHeight` then hold the
 * **effective** size (renderers can read them), the wanted width is `getFill().tileWidth`.
 *
 * @example
 * ```ts
 * declare const grid: CoverGridTableModel<string>;
 * const tiles = grid.bodyModel;
 * tiles.items = ["new-1.jpg", "new-2.jpg"];
 * tiles.filteredItems = tiles.items;   // or tableApi.externalFilterChanged() with a filter
 * tableApi.repaintHard();
 * ```
 *
 * @category Area models
 */
export class CoverGridBodyModel<T> implements AreaModelIf, TileLayoutIf {

  /** Marks the model for {@link isCoverGridBodyModel} (works across copies of the core). @since 1.1.117 */
  readonly kind = 'CoverGridBodyModel';

  public rowSelectionModel: CheckboxModelIf<any> | undefined = undefined;
  public areaIdent: AreaIdent = 'body';

  public filteredItems: T[] = [];


  /** @internal */
  protected sorterService: SorterService = new SorterService();

  /** Full width: the settings (`undefined` = off) and the geometry for `fillWidth`. */
  private fill?: CoverGridFillOptionsIf;
  private fillLayout?: CoverGridFillLayoutIf;
  private fillWidth = -1;


  constructor(
    public items: T[],
    public cellRenderer: CellRendererIf,
    public coverWidth: number = 200,
    public coverHeight: number = 300,
    public width = 0,
    public firstRowPaddingTop: number = 0
  ) {
    this.filteredItems = items;
  }

  setParentWidth(widthInPixel: number): void {
    this.width = widthInPixel;
    if (this.fill) {
      this.applyFill();
    }
  }

  /**
   * Lets the tiles fill the whole width (since 1.1.117): columns = `max(1, floor(width / tileWidth))`, the tiles are
   * stretched until the last one ends flush with the edge (the first columns get the rest pixels), with `aspectRatio`
   * the height follows. `coverWidth`/`coverHeight` are set to the effective size at once and after every width change.
   * A part changes only that part (with `replace` the parts are the whole settings – `tileWidth` stays if not given);
   * `true` = `{ tileWidth: coverWidth }`; `false` switches it off – the tiles get `tileWidth` (and the height of that
   * width with `aspectRatio`). While it is on, `coverWidth`/`coverHeight` are an **output**: values you write are
   * replaced with the next width change – change the tile size with `setFill` / {@link TableApi.setCoverGridFill}. Call `tableApi.repaintHard()` afterwards – or use
   * {@link TableApi.setCoverGridFill}, which does it with one render. The table usually calls it for you
   * ({@link TableOptionsIf.coverGridFill}).
   *
   * @param fill - the settings, `true` or `false`
   * @param replace - `true`: the given parts replace the settings instead of changing them (the table uses it for
   *   {@link TableOptionsIf.coverGridFill})
   * @since 1.1.117
   *
   * @example
   * ```ts
   * declare const grid: CoverGridTableModel<string>;
   * grid.bodyModel.setFill({ tileWidth: 165, aspectRatio: 4 / 3 });
   * tableApi.repaintHard();
   * ```
   */
  setFill(fill: boolean | Partial<CoverGridFillOptionsIf> | undefined, replace = false): void {
    if (!fill) {
      const old = this.fill;
      this.fill = undefined;
      this.fillLayout = undefined;
      this.fillWidth = -1;
      if (old) {
        this.coverWidth = old.tileWidth;
        if (old.aspectRatio !== undefined && old.aspectRatio > 0) {
          this.coverHeight = Math.round(old.tileWidth * old.aspectRatio) + (old.extraHeight ?? 0);
        }
      }
      return;
    }
    const changes = fill === true ? {} : fill;
    const base = replace ? undefined : this.fill;
    const merged: CoverGridFillOptionsIf = { tileWidth: this.fill?.tileWidth ?? this.coverWidth, ...base };
    for (const key of Object.keys(changes) as (keyof CoverGridFillOptionsIf)[]) {
      const value = changes[key];
      if (value === undefined) {
        if (key !== 'tileWidth') delete merged[key];
      } else {
        merged[key] = value;
      }
    }
    this.fill = merged;
    this.applyFill();
  }

  /**
   * The settings of the full width ({@link setFill}) – a copy, `undefined` if the tiles keep `coverWidth`.
   *
   * @returns {CoverGridFillOptionsIf | undefined} the settings
   * @since 1.1.117
   */
  getFill(): CoverGridFillOptionsIf | undefined {
    return this.fill ? { ...this.fill } : undefined;
  }

  /**
   * The width of the tiles in a column: `coverWidth`, with {@link setFill} 1 px more for the first columns (the rest
   * pixels of the width).
   *
   * @param columnIndex - the column
   * @returns {number} the width in px
   * @since 1.1.117
   */
  getTileWidthAt(columnIndex: number): number {
    const layout = this.getFillLayout();
    if (!layout) return this.coverWidth;
    return layout.baseWidth + (columnIndex < layout.rest ? 1 : 0);
  }

  /**
   * The x position of a column from the start of the row (`columnIndex × coverWidth`, with {@link setFill} plus the
   * rest pixels of the columns before).
   *
   * @param columnIndex - the column
   * @returns {number} the position in px
   * @since 1.1.117
   */
  getTileLeftAt(columnIndex: number): number {
    const layout = this.getFillLayout();
    if (!layout) return columnIndex * this.coverWidth;
    return columnIndex * layout.baseWidth + Math.min(columnIndex, layout.rest);
  }

  /**
   * The width of a full row of tiles (`columns × coverWidth`; with {@link setFill} exactly the width).
   *
   * @returns {number} the width in px
   * @since 1.1.117
   */
  getTileRowWidth(): number {
    const columns = this.getColumnCount();
    return this.getTileLeftAt(columns);
  }

  /** The geometry of the full width – computed again if `width` changed (also when an app set it directly). */
  private getFillLayout(): CoverGridFillLayoutIf | undefined {
    if (this.fill && !Object.is(this.fillWidth, this.width)) {
      this.applyFill();
    }
    return this.fillLayout;
  }

  private applyFill(): void {
    const fill = this.fill!;
    const layout = computeCoverGridFill(this.width, fill, this.coverHeight);
    this.fillLayout = layout;
    this.fillWidth = this.width;
    this.coverWidth = layout.baseWidth;
    this.coverHeight = layout.tileHeight;
  }

  getRowCount(): number {
    if (!this.filteredItems?.length) return 0;
    return Math.ceil(this.filteredItems.length / this.getColumnCount());
  }

  /**
   * The number of grid rows without the external filter (`0` without items).
   *
   * @returns {number} grid rows for all items
   * @since 1.1.92
   */
  getUnfilteredRowCount(): number {
    if (!this.items?.length) return 0;
    return Math.ceil(this.items.length / this.getColumnCount());
  }

  /**
   * The number of tiles per row: as many as fit into the width – at least 1 (a width smaller than one tile, width 0
   * or a tile width of 0; before 1.1.115 a narrow grid had 0 columns and `Infinity` rows). With {@link setFill}: as
   * many tiles of `tileWidth` as fit (`coverWidth` is the stretched width then).
   *
   * @returns {number} tiles per row, ≥ 1
   */
  getColumnCount(): number {
    const layout = this.getFillLayout();
    if (layout) return layout.columns;
    if (!this.width || !(this.coverWidth > 0)) return 1;
    return Math.max(1, Math.floor(this.width / this.coverWidth));
  }

  /**
   * The tiles as one sequence of items – the table uses it for the keyboard navigation and to keep the focus on
   * the same item.
   *
   * @returns {TileLayoutIf} this model
   * @since 1.1.115
   */
  getTileLayout(): TileLayoutIf {
    return this;
  }

  /** The number of shown items. @since 1.1.115 */
  getTileCount(): number {
    return this.filteredItems?.length ?? 0;
  }

  /** Tiles per row ({@link getColumnCount}). @since 1.1.115 */
  getTilesPerRow(): number {
    return this.getColumnCount();
  }

  /** The shown item at an index, `undefined` outside the items. @since 1.1.115 */
  getTileAt(index: number): T | undefined {
    return this.filteredItems?.[index];
  }

  /** The index of a shown item, `-1` if it is not shown (filtered out, removed). @since 1.1.115 */
  indexOfTile(item: unknown): number {
    return this.filteredItems ? this.filteredItems.indexOf(item as T) : -1;
  }

  getValueAt(rowIndex: number, columnIndex: number): T | undefined {
    return this.filteredItems?.[rowIndex * this.getColumnCount() + columnIndex];
  }

  getTextValueAt(_rowIndex: number, _columnIndex: number): string {
    return '';
  }

  getTooltipAt(_rowIndex: number, _columnIndex: number): any {
    return '';
  }

  /**
   * All rows have the tile height (`coverHeight`) – unless the first row is higher (`firstRowPaddingTop`). The table
   * then computes row positions as `index × coverHeight` instead of building the prefix sums of all rows on every
   * `repaintHard()` (since 1.1.117: a resize of a grid with 1,000,000 items no longer costs O(rows)).
   *
   * @returns {number | undefined} `coverHeight`, `undefined` with `firstRowPaddingTop`
   * @since 1.1.117
   */
  getConstantRowHeight(): number | undefined {
    if (this.getRowHeight !== CoverGridBodyModel.prototype.getRowHeight) {
      return undefined; // a subclass with own row heights
    }
    this.getFillLayout(); // `width` may have been set directly: the height first
    return this.firstRowPaddingTop > 0 || !(this.coverHeight > 0) ? undefined : this.coverHeight;
  }

  getRowHeight(rowIndex: number): number {
    if (rowIndex === 0 && this.firstRowPaddingTop > 0) return this.firstRowPaddingTop + this.coverHeight;
    return this.coverHeight;
  }


  getCellRenderer(_rowIndex: number, _columnIndex: number): CellRendererIf | undefined {
    return this.cellRenderer;
  }

  getColspanAt(_rowIndex: number, _columnIndex: number): number {
    return 0;
  }

  getCustomClassesAt(_rowIndex: number, _columnIndex: number): string[] {
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

  isRowChecked(_rowIndex: number): CheckedType | undefined {
    return undefined;
  }

  setRowChecked(_rowIndex: number, _checked: boolean): void {
    // ignore
  }

  /**
   * `1`: a tile never spans columns ({@link getColspanAt} is always 0). Since 1.1.117 – before, it reported 31, and
   * every other number of rows (a resize) scanned all rows for spans. A subclass that overrides `getColspanAt` or
   * `getRowspanAt` gets 31 as before.
   *
   * @returns {number} 1, 31 for a subclass with own spans
   */
  getMaxColspan(): number {
    return this.hasOwnSpans() ? 31 : 1;
  }

  /**
   * `1`: a tile never spans rows ({@link getRowspanAt} is always 0). Since 1.1.117, see {@link getMaxColspan}.
   *
   * @returns {number} 1, 31 for a subclass with own spans
   */
  getMaxRowspan(): number {
    return this.hasOwnSpans() ? 31 : 1;
  }

  /** True if a subclass overrides `getColspanAt` or `getRowspanAt` (spans possible). */
  private hasOwnSpans(): boolean {
    return this.getColspanAt !== CoverGridBodyModel.prototype.getColspanAt
      || this.getRowspanAt !== CoverGridBodyModel.prototype.getRowspanAt;
  }


  getYPosByRowIndex(rowIndex: number): number {
    const pad = this.firstRowPaddingTop > 0 ? this.firstRowPaddingTop : 0;
    return this.coverHeight * rowIndex + pad;
  }


  init() {
    // ignore
  }

  externalFilterChanged<_T>(predict: FilterFunction<any>): void {
    this.filteredItems = this.items.filter(predict);
  }

  isFilterable(): boolean {
    return true;
  }

  doSort(sortItems: SortItem[]): boolean {
    if (!this.filteredItems) return false;

    for (const sortItem of sortItems) {
      const { sortState } = sortItem;
      const f = sortState === 'asc' ? 1 :
        sortState === 'desc' ? -1 : 0;
      // a copy: the array of the app (items) keeps its order
      this.filteredItems = this.filteredItems.slice().sort((a, b) => this.sorterService.genericSortComparator(a, b, f));
    }
    return true;
  }

  /**
   * Sorts the shown items – a copy, the `items` array of the app keeps its order (since 1.1.115).
   *
   * @param compareFn - compares two items
   */
  sort(compareFn?: (a: any, b: any) => number): void {
    this.filteredItems = this.filteredItems.slice().sort(compareFn);
  }


  isEditable(_rowIndex: number, _columnIndex: number): boolean {
    return false;
  }

  setValue(_rowIndex: number, _columnIndex: number, _value: any): boolean {
    return true;
  }


  isSelectable(_rowIndex: number, _columnIndex: number): boolean {
    return false;
  }

  changeColumnOrder(_sourceColumnIndex: number, _targetColumnIndex: number): void {
    //  ignore
  }

  protected setPropertyValue(_o: any, _props: string[], _value: any): boolean {
    return false;
  }

  protected arrayMove(_arr: any[], _fromIndex: number, _toIndex: number) {
    // ignore
  }


}

