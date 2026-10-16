import { CellRendererIf } from "../cell-render.if";
import { AreaIdent } from "../../data/tablemodel/area-ident.type";
import { AreaModelIf } from "../../data/tablemodel/areamodel/area-model.if";
import { DomServiceIf } from "../../service/dom-service.if";
import { RendererCleanupFnType } from "../renderer-cleanup-fn.type";
import { escapeHtml } from '../../../common/escape-html';


/** @category Renderers & editing */
export class InputCellRenderer implements CellRendererIf {


  render(
    cellDiv: HTMLDivElement,
    rowIndex: number,
    columnIndex: number,
    areaIdent: AreaIdent,
    areaModel: AreaModelIf,
    cellValue: any,
    domService: DomServiceIf): RendererCleanupFnType | undefined {

    if (areaModel.isEditable(rowIndex, columnIndex)) {
      domService.addClass(cellDiv, "ge-table-row-input-div");

      // the shown value: a pending value of a batch edit (since 1.1.96), otherwise the model value
      const val = cellValue !== undefined ? cellValue : areaModel.getValueAt(rowIndex, columnIndex);
      cellDiv.innerHTML = `
            <input
                type="text"
                value="${escapeHtml(val)}"
                autofocus
                onfocus="this.setSelectionRange(0, this.value.length)"
                data-listen="change"
                data-area="${areaIdent}"
                data-row-index="${rowIndex}"
                data-col-index="${columnIndex}"
                data-input-type="text"
                style="width:calc(100% - 8px);height:100%;border:0;padding:0;padding-inline-start:8px;"
                class="ge-table-cell-editor-input">`;
    }
    return undefined;
  }

}
