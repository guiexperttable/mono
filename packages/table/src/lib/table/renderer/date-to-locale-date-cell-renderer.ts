import { CellRendererIf } from "./cell-render.if";
import { AreaModelIf } from "../data/tablemodel/areamodel/area-model.if";
import { DomServiceIf } from "../service/dom-service.if";
import { AreaIdent } from "../data/tablemodel/area-ident.type";
import { RendererCleanupFnType } from "./renderer-cleanup-fn.type";


/** @category Renderers & editing */
export class DateToLocaleDateCellRenderer implements CellRendererIf {

  render(
    cellDiv: HTMLDivElement,
    _rowIndex: number,
    _columnIndex: number,
    _areaIdent: AreaIdent,
    _areaModel: AreaModelIf,
    cellValue: any,
    _domService: DomServiceIf): RendererCleanupFnType | undefined {
    if (cellValue) {
      const date = new Date(cellValue);
      // an invalid date is shown as it is (instead of "Invalid Date")
      cellDiv.innerText = isNaN(date.getTime()) ? String(cellValue) : date.toLocaleDateString();
    }
    return undefined;
  }

}
