import { AreaModelIf } from "../data/tablemodel/areamodel/area-model.if";
import { CellRendererIf } from "./cell-render.if";
import { DomServiceIf } from "../service/dom-service.if";
import { AreaIdent } from "../data/tablemodel/area-ident.type";
import { RendererCleanupFnType } from "./renderer-cleanup-fn.type";
import type { RowNumberColumnDef } from "../data/common/row-number-column-def";

/**
 * Renders the number of a body row – the body renderer of {@link RowNumberColumnDef}. The text is set as a text node
 * (never as HTML), in the same label structure as a normal cell (`.ge-table-label-div > .ge-table-label`).
 *
 * The table uses it for a `RowNumberColumnDef` with every body model (also own {@link AreaModel}s without renderers).
 *
 * @example
 * const columnDef = new RowNumberColumnDef();
 * const renderer = columnDef.rendererMap.body; // a RowNumberCellRenderer
 *
 * @since 1.1.93
 * @category Row numbers
 */
export class RowNumberCellRenderer implements CellRendererIf {

  /** Marker (works across copies of the core). */
  readonly type = "RowNumberCellRenderer";

  constructor(
    private readonly columnDef: Pick<RowNumberColumnDef, "getRowNumberText">
  ) {
  }

  render(
    cellDiv: HTMLDivElement,
    rowIndex: number,
    columnIndex: number,
    areaIdent: AreaIdent,
    areaModel: AreaModelIf,
    _cellValue: any,
    domService: DomServiceIf): RendererCleanupFnType | undefined {

    const text = this.columnDef.getRowNumberText(rowIndex, areaModel);
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
