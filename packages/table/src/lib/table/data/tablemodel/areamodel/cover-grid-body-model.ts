import { AreaModelIf } from './area-model.if';
import { CellRendererIf } from '../../../renderer/cell-render.if';
import { CheckedType } from '../../common/checked-type';
import { CheckboxModelIf } from '../../../checkbox/checkbox-model.if';
import { FilterFunction } from '../../common/filter-function';
import { SortItem } from '../../common/sort-item';
import { AreaIdent } from '../area-ident.type';
import { SorterService } from '../../../service/sorter.service';
import { TileLayoutIf } from './tile-layout.if';

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

  public rowSelectionModel: CheckboxModelIf<any> | undefined = undefined;
  public areaIdent: AreaIdent = 'body';

  public filteredItems: T[] = [];


  /** @internal */
  protected sorterService: SorterService = new SorterService();


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
   * or a tile width of 0; before 1.1.115 a narrow grid had 0 columns and `Infinity` rows).
   *
   * @returns {number} tiles per row, ≥ 1
   */
  getColumnCount(): number {
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

  getMaxColspan(): number {
    return 31;
  }

  getMaxRowspan(): number {
    return 31;
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

