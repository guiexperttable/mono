import { CellRendererIf } from "../cell-render.if";
import { AreaIdent } from "../../data/tablemodel/area-ident.type";
import { AreaModelIf } from "../../data/tablemodel/areamodel/area-model.if";
import { DomServiceIf } from "../../service/dom-service.if";
import { RendererCleanupFnType } from "../renderer-cleanup-fn.type";


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
      // built with DOM APIs – no inline event handler and no inline style: works under a strict
      // Content-Security-Policy (before 1.1.99: innerHTML with onfocus="…" and style="…")
      const input = domService.createElement<HTMLInputElement>("input");
      domService.setAttribute(input, "type", "text");
      domService.setAttribute(input, "autofocus", "");
      domService.setAttribute(input, "data-listen", "change");
      domService.setAttribute(input, "data-area", areaIdent);
      domService.setAttribute(input, "data-row-index", String(rowIndex));
      domService.setAttribute(input, "data-col-index", String(columnIndex));
      domService.setAttribute(input, "data-input-type", "text");
      domService.addClass(input, "ge-table-cell-editor-input");
      input.value = val === undefined || val === null ? "" : String(val);
      input.defaultValue = input.value; // Escape restores it (TableScope.cancelEditing)
      input.addEventListener("focus", () => input.setSelectionRange(0, input.value.length), { once: true });
      cellDiv.textContent = "";
      domService.appendChild(cellDiv, input);
    }
    return undefined;
  }

}
