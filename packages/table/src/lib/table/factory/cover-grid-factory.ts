import { CoverGridBodyModel } from '../data/tablemodel/areamodel/cover-grid-body-model';
import { CoverGridTableModel } from '../data/tablemodel/cover-grid-table-model';
import { CellRendererIf } from '../renderer/cell-render.if';
import { TableOptionsIf } from '../data/options/table-options.if';
import { TableOptions } from '../data/options/table-options';
import { AutoRestoreOptions } from '../data/options/auto-restore-options';



/**
 * Creates cover grids: a flat array of items shown as tiles (book covers, photos, products) – as many per row as fit
 * into the width of the table (`floor(width / coverWidth)`), without header and footer. Only the visible rows are
 * rendered, like in every GuiExpert Table; filter (`externalFilterFunction`), `sort()` and the scroll position work as
 * usual. Guide: instructions.md 5.10, showcase https://gui.expert/showcase/covergrid/run.
 *
 * @example
 * ```ts
 * interface Book { title: string; }
 * declare const books: Book[];
 *
 * const renderer: CellRendererIf = {
 *   render(cellDiv: HTMLDivElement, _r: number, _c: number, _a: AreaIdent, _m: AreaModelIf, book: any) {
 *     if (book) cellDiv.textContent = (book as Book).title;   // the item of this tile (undefined after the last one)
 *     return undefined;
 *   }
 * };
 * const gridModel = CoverGridFactory.createCoverGridModel(books, renderer, 160, 240);
 * const gridOptions = CoverGridFactory.createCoverGridDefaultOptions(240, () => "books");
 * const gridApi = new TableScope(host, gridModel, new SimpleDomService(), gridOptions, new EventAdapter())
 *   .firstInit()
 *   .getApi();
 * ```
 *
 * @category Table model
 */
export class CoverGridFactory {


  /**
   * Creates the model of a cover grid.
   *
   * @param items - the items, one per tile (the renderer gets the item as `cellValue`)
   * @param cellRenderer - draws one tile into the cell `<div>`
   * @param coverWidth - width of a tile in px (default 200) – change it later via `bodyModel.coverWidth` + `repaintHard()`
   * @param coverHeight - height of a tile in px (default 300)
   * @param width - initial width of the grid; the table sets the width of its host on start and after a resize
   * @param firstRowPaddingTop - extra height of the first row in px (room above the first tiles, e.g. for a toolbar)
   * @returns the table model; `tableModel.bodyModel` holds `items`, `filteredItems`, `coverWidth`, `coverHeight`
   *
   * @example
   * ```ts
   * declare const renderer: CellRendererIf;
   * const gridModel = CoverGridFactory.createCoverGridModel(["a.jpg", "b.jpg", "c.jpg"], renderer, 120, 180);
   * // bigger tiles – no new model:
   * gridModel.bodyModel.coverWidth = 200;
   * gridModel.bodyModel.coverHeight = 300;
   * tableApi.repaintHard();
   * ```
   */
  public static createCoverGridModel<T>(
    items: T[],
    cellRenderer: CellRendererIf,
    coverWidth: number = 200,
    coverHeight: number = 300,
    width = 0,
    firstRowPaddingTop: number = 0
  ): CoverGridTableModel<T> {

    const bodyModel: CoverGridBodyModel<T> = new CoverGridBodyModel<T>(items, cellRenderer, coverWidth, coverHeight, width, firstRowPaddingTop);
    const tableModel: CoverGridTableModel<T> = new CoverGridTableModel<T>(bodyModel, firstRowPaddingTop);

    return tableModel;
  }


  /**
   * Options for a cover grid: no borders and separators, no row or column hover, header and footer height 0, the
   * scroll position restored under the key of `getStorageKeyFn` (`localStorage`), and the focus frame only while the
   * grid is used with the keyboard (`focusFrame: "keyboard"`).
   *
   * The scroll position follows the **item** (since 1.1.116): the state stores the id of the first item of the first
   * visible row (`id`/`uuid` of the item or `autoRestoreOptions.getRowId(item, index)`), so a restore with another
   * width shows the same covers at the top; while the grid lives, a resize or a new tile size keeps the top item at the
   * top, too. Items without id: only the pixels. Before 1.1.116 every cover grid that stored its scroll position (these
   * options do) wrote a console warning "the body model has no row objects" – do not set
   * `getRowId: (_row, rowIndex) => rowIndex`.
   *
   * @param defaultRowHeight - the height of a tile (`coverHeight`)
   * @param getStorageKeyFn - storage key of the scroll position (default `"CoverGrid"`)
   * @returns new options – add your own fields with a spread
   * @since 1.1.115
   *
   * @example
   * ```ts
   * let photoFilter = "";
   * const gridOptions: TableOptionsIf = {
   *   ...CoverGridFactory.createCoverGridDefaultOptions(240, () => "photos"),
   *   externalFilterFunction: (photo: { name: string }) => photo.name.includes(photoFilter)
   * };
   * ```
   */
  public static createCoverGridDefaultOptions(
    defaultRowHeight: number,
    getStorageKeyFn: () => string = () => 'CoverGrid',
  ): TableOptionsIf {
    return CoverGridFactory.createCoverGrisDefaultOptions(defaultRowHeight, getStorageKeyFn);
  }


  /**
   * The same as {@link createCoverGridDefaultOptions} – the old name with a typo, kept for compatibility.
   *
   * @deprecated since 1.1.115: use {@link createCoverGridDefaultOptions}
   * @param defaultRowHeight - the height of a tile (`coverHeight`)
   * @param getStorageKeyFn - storage key of the scroll position (default `"CoverGrid"`)
   * @returns new options – add your own fields with a spread
   *
   * @example
   * ```ts
   * const gridOptions: TableOptionsIf = CoverGridFactory.createCoverGrisDefaultOptions(240, () => "photos");
   * ```
   */
  public static createCoverGrisDefaultOptions(
    defaultRowHeight: number,
    getStorageKeyFn: () => string = () => 'CoverGrid',

  ):TableOptionsIf {
    const tableOptions: TableOptionsIf = {
      ...new TableOptions(),

      horizontalBorderVisible: false,
      verticalBorderVisible: false,
      footerSeparatorBorderVisible: false,
      headerSeparatorBorderVisible: false,
      fixedEastSeparatorBorderVisible: false,
      fixedWestSeparatorBorderVisible: false,
      tableTopBorderVisible: false,
      tableBottomBorderVisible: false,

      hoverColumnVisible: false,
      hoverRowVisible: false,
      // like :focus-visible – the mouse marks a tile through the renderer of the app (since 1.1.115)
      focusFrame: 'keyboard',

      defaultRowHeights: {
        header: 0,
        body: defaultRowHeight,
        footer: 0
      },
      // externalFilterFunction: this.filterFn.bind(this),
      autoRestoreOptions: {
        ...new AutoRestoreOptions<string>(),
        getStorageKeyFn: getStorageKeyFn,
        autoRestoreCollapsedExpandedState: false,
        autoRestoreScrollPosition: true,
        autoRestoreSortingState: false,
        autoRestoreSelectedState: false
      }
    }
    return tableOptions;
  }

}
