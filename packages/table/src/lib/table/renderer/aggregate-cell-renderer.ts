import { AreaModelIf } from "../data/tablemodel/areamodel/area-model.if";
import { CellRendererIf } from "./cell-render.if";
import { DomServiceIf } from "../service/dom-service.if";
import { AreaIdent } from "../data/tablemodel/area-ident.type";
import { RendererCleanupFnType } from "./renderer-cleanup-fn.type";

/**
 * Writes the formatted text of a cell (`areaModel.getTextValueAt`) as a text node – never as HTML – in the label
 * structure of a normal cell (`.ge-table-label-div > .ge-table-label`). {@link AreaModelAggregateFooter} uses it for
 * its results (`"1,234.5"` instead of the raw `1234.4999999`) and labels when the column has no footer renderer.
 *
 * @example
 * // an own footer model that formats in getTextValueAt and shows that text
 * class MyFooter extends AreaModel {
 *   private readonly renderer = new AggregateCellRenderer();
 *   override getCellRenderer(_row: number, _col: number): CellRendererIf { return this.renderer; }
 *   override getTextValueAt(_row: number, _col: number): string { return "Σ 42"; }
 * }
 *
 * @since 1.1.94
 * @category Aggregation
 */
export class AggregateCellRenderer implements CellRendererIf {

  /** Marker (works across copies of the core). */
  readonly type = "AggregateCellRenderer";

  render(
    cellDiv: HTMLDivElement,
    rowIndex: number,
    columnIndex: number,
    areaIdent: AreaIdent,
    areaModel: AreaModelIf,
    _cellValue: any,
    domService: DomServiceIf): RendererCleanupFnType | undefined {

    const text = areaModel.getTextValueAt(rowIndex, columnIndex);
    if (!text) {
      return undefined;
    }
    const div = domService.createElement<HTMLDivElement>("div");
    domService.addClass(div, "ge-table-label-div");
    const label = domService.createElement<HTMLDivElement>("div");
    domService.addClass(label, "ge-table-label");
    domService.setAttribute(label, "data-row-index", `${rowIndex}`);
    domService.setAttribute(label, "data-col-index", `${columnIndex}`);
    domService.setAttribute(label, "data-area", areaIdent);
    domService.appendChild(label, domService.createText(text));
    domService.appendChild(div, label);
    domService.appendChild(cellDiv, div);
    return undefined;
  }
}
