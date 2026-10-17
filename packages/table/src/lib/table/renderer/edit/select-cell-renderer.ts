import { CellRendererIf } from "../cell-render.if";
import { AreaIdent } from "../../data/tablemodel/area-ident.type";
import { AreaModelIf } from "../../data/tablemodel/areamodel/area-model.if";
import { DomServiceIf } from "../../service/dom-service.if";
import { RendererCleanupFnType } from "../renderer-cleanup-fn.type";
import { ValueLabelIf } from "../../data/common/value-label.if";
import { ValueLabel } from "../../data/common/value-label";


/** @category Renderers & editing */
export class SelectCellRenderer implements CellRendererIf {

  constructor(
    protected options: ValueLabelIf[]
  ) {}

  static create(values: string[]) {
    return new SelectCellRenderer(
      values.map(v => new ValueLabel(v, v))
    );
  }

  render(
    cellDiv: HTMLDivElement,
    rowIndex: number,
    columnIndex: number,
    areaIdent: AreaIdent,
    areaModel: AreaModelIf,
    cellValue: any,
    domService: DomServiceIf): RendererCleanupFnType | undefined {

    if (areaModel.isEditable(rowIndex, columnIndex)) {
      domService.addClass(cellDiv, "ge-table-row-select-div");

      // the shown value: a pending value of a batch edit (since 1.1.96), otherwise the model value
      const val = cellValue !== undefined ? cellValue : areaModel.getValueAt(rowIndex, columnIndex);
      // built with DOM APIs – no inline style: works under a strict Content-Security-Policy (since 1.1.99)
      const select = domService.createElement<HTMLSelectElement>("select");
      domService.setAttribute(select, "autofocus", "");
      domService.setAttribute(select, "data-listen", "change");
      domService.setAttribute(select, "data-area", areaIdent);
      domService.setAttribute(select, "data-row-index", String(rowIndex));
      domService.setAttribute(select, "data-col-index", String(columnIndex));
      domService.setAttribute(select, "data-input-type", "text");
      domService.addClass(select, "ge-table-cell-editor-select");
      for (const option of this.options) {
        const el = domService.createElement<HTMLOptionElement>("option");
        el.value = String(option.value);
        el.textContent = String(option.label);
        if (option.value === val) {
          el.selected = true;
          el.defaultSelected = true; // Escape restores it (TableScope.cancelEditing)
        }
        domService.appendChild(select, el);
      }
      cellDiv.textContent = "";
      domService.appendChild(cellDiv, select);
    }
    return undefined;
  }

}
