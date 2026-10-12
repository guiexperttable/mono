import { AreaModelIf } from "../data/tablemodel/areamodel/area-model.if";
import { DomServiceIf } from "../service/dom-service.if";
import { AreaIdent } from "../data/tablemodel/area-ident.type";
import { RendererCleanupFnType } from "./renderer-cleanup-fn.type";

/**
 * Decides how a cell **looks** – the value stays the same for sorting, filtering, copy and Excel export.
 * Assign it per column and area (`columnDef.rendererMap.body = …`, or `bodyRenderer` in {@link ColumnDef.create})
 * or return it from {@link AreaModelIf.getCellRenderer}.
 *
 * Renderers are called only for visible cells, on every repaint – keep them cheap.
 *
 * @example
 * class StatusBadgeRenderer implements CellRendererIf {
 *   render(cellDiv: HTMLDivElement, rowIndex: number, columnIndex: number, areaIdent: AreaIdent,
 *          areaModel: AreaModelIf, cellValue: string, dom: DomServiceIf): RendererCleanupFnType | undefined {
 *     const badge = dom.createElement<HTMLSpanElement>("span");
 *     dom.addClass(badge, `status-${cellValue}`);
 *     badge.textContent = cellValue;
 *     dom.appendChild(cellDiv, badge);
 *     return undefined;                       // or a cleanup function (listeners, timers …)
 *   }
 * }
 * columnDefs[9].rendererMap.body = new StatusBadgeRenderer();
 *
 * @see Training: [Cell renderers](https://gui.expert/training/cell-renderers/),
 *   [Framework components as cells](https://gui.expert/training/framework-components/)
 *
 * @category Renderers & editing
 */
export interface CellRendererIf {

  /**
   * Fills the (empty) cell element.
   *
   * @param cellDiv - the cell element, already positioned and sized
   * @param rowIndex - row in the area (as displayed)
   * @param columnIndex - column index (west + center + east)
   * @param areaIdent - `"header"`, `"body"` or `"footer"`
   * @param areaModel - the model of this area (e.g. for `getRowByIndex(rowIndex)`)
   * @param cellValue - the value of the cell (`areaModel.getValueAt(rowIndex, columnIndex)`)
   * @param domService - create and change elements through it (works with Angular's Renderer2, too)
   * @returns optionally a cleanup function, called before the cell is drawn again
   */
  render(
    cellDiv: HTMLDivElement,
    rowIndex: number,
    columnIndex: number,
    areaIdent: AreaIdent,
    areaModel: AreaModelIf,
    cellValue: any,
    domService: DomServiceIf): RendererCleanupFnType | undefined;
}
