import { escapeHtml } from "../../common/escape-html";
import { AreaModelIf } from "../data/tablemodel/areamodel/area-model.if";
import { CellRendererIf } from "./cell-render.if";
import { DomServiceIf } from "../service/dom-service.if";
import { AreaIdent } from "../data/tablemodel/area-ident.type";
import { RendererCleanupFnType } from "./renderer-cleanup-fn.type";


/** @category Renderers & editing */
export class TrueFalseCellRenderer implements CellRendererIf {

  /**
   * @param ariaLabels - texts for screen readers (the icons ✅ / ❌ are images). Default: "Yes" / "No". @since 1.1.91
   */
  constructor(
    public ariaLabels: { true: string, false: string } = { true: "Yes", false: "No" }
  ) {
  }

  render(
    cellDiv: HTMLDivElement,
    _rowIndex: number,
    _columnIndex: number,
    _areaIdent: AreaIdent,
    _areaModel: AreaModelIf,
    cellValue: any,
    _domService: DomServiceIf): RendererCleanupFnType | undefined {
    if (cellValue === "true" || cellValue === true) {
      cellDiv.innerHTML = `<span class="ge-true-text-color" role="img" aria-label="${escapeHtml(this.ariaLabels.true)}">✅</span>`;
    } else if (cellValue === "false" || cellValue === false) {
      cellDiv.innerHTML = `<span class="ge-false-text-color" role="img" aria-label="${escapeHtml(this.ariaLabels.false)}">❌</span>`;
    } else {
      cellDiv.innerText = "";
    }
    return undefined;
  }

}
