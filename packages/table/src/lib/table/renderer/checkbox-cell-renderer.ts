import { AreaModelIf } from "../data/tablemodel/areamodel/area-model.if";
import { CellRendererIf } from "./cell-render.if";
import { DomServiceIf } from "../service/dom-service.if";
import { AreaIdent } from "../data/tablemodel/area-ident.type";
import { RendererCleanupFnType } from "./renderer-cleanup-fn.type";


/** @category Renderers & editing */
export class CheckboxCellRenderer implements CellRendererIf {

  /** Marker for {@link isCheckboxCellRenderer} (works across copies of the core). @since 1.1.91 */
  readonly type = "CheckboxCellRenderer";

  render(
    cellDiv: HTMLDivElement,
    rowIndex: number,
    columnIndex: number,
    areaIdent: AreaIdent,
    areaModel: AreaModelIf,
    _cellValue: any,
    domService: DomServiceIf): RendererCleanupFnType | undefined {

    if (areaModel.isRowCheckable(rowIndex)) {
      domService.addClass(cellDiv, "ge-table-row-checkbox-div");
      const rowChecked = areaModel.isRowChecked(rowIndex);
      cellDiv.innerText = "";
      const input = domService.createElement<HTMLInputElement>("input");
      domService.setAttribute(input, "type", "checkbox");
      domService.setAttribute(input, "data-area", `${areaIdent}`);
      domService.setAttribute(input, "data-row-index", `${rowIndex}`);
      domService.setAttribute(input, "data-col-index", `${columnIndex}`);
      domService.setAttribute(input, "data-input-type", "checkbox");
      domService.setAttribute(input, "tabindex", "-1"); // the table is one tab stop (Enter toggles the focused row)
      domService.addClass(input, "ge-table-row-checkbox");
      if (rowChecked === "full") {
        domService.setAttribute(input, "checked", "");
        input.checked = true;
      }
      // partly checked (a tree node with some checked children): the native "indeterminate" state –
      // screen readers announce "mixed" (before 1.1.91: a pale ✓ next to an empty box)
      input.indeterminate = rowChecked === "semi";
      domService.appendChild(cellDiv, input);
      // the accessible name ("Select row 5") is set by the table (tableOptions.ariaTexts)
    }
    return undefined;
  }


}
