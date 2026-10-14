import { AreaModelIf } from "../data/tablemodel/areamodel/area-model.if";
import { CellRendererIf } from "./cell-render.if";
import { DomServiceIf } from "../service/dom-service.if";
import { AreaIdent } from "../data/tablemodel/area-ident.type";
import { RendererCleanupFnType } from "./renderer-cleanup-fn.type";


/** @category Renderers & editing */
export class MaleFemaleToIconCellRenderer implements CellRendererIf {

  /**
   * @param ariaLabels - texts for screen readers (the symbols ♂ / ♀ are images). Default: "male" / "female". @since 1.1.91
   */
  constructor(
    public ariaLabels: { male: string, female: string } = { male: "male", female: "female" }
  ) {
  }

  render(
    cellDiv: HTMLDivElement,
    _rowIndex: number,
    _columnIndex: number,
    _areaIdent: AreaIdent,
    _areaModel: AreaModelIf,
    cellValue: any,
    domService: DomServiceIf): RendererCleanupFnType | undefined {
    if (cellValue === "male" || cellValue === "m") {
      this.addSymbol(cellDiv, "♂", this.ariaLabels.male, domService);
    } else if (cellValue === "female" || cellValue === "f") {
      this.addSymbol(cellDiv, "♀", this.ariaLabels.female, domService);
    }
    return undefined;
  }


  private addSymbol(cellDiv: HTMLDivElement, symbol: string, label: string, domService: DomServiceIf) {
    cellDiv.innerText = "";
    const span = domService.createElement<HTMLSpanElement>("span");
    domService.setAttribute(span, "role", "img");
    domService.setAttribute(span, "aria-label", label);
    domService.appendChild(span, domService.createText(symbol));
    domService.appendChild(cellDiv, span);
  }
}
