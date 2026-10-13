import {CellRendererIf} from "./cell-render.if";
import {AreaIdent} from "../data/tablemodel/area-ident.type";
import {AreaModelIf} from "../data/tablemodel/areamodel/area-model.if";
import {DomServiceIf} from "../service/dom-service.if";
import {RendererCleanupFnType} from "./renderer-cleanup-fn.type";
import { escapeHtml } from '../../common/escape-html';


/** @category Renderers & editing */
export class PositiveAndNegativeNumberRenderer implements CellRendererIf {


  render(
    cellDiv: HTMLDivElement,
    rowIndex: number,
    columnIndex: number,
    areaIdent: AreaIdent,
    _areaModel: AreaModelIf,
    cellValue: any,
    domService: DomServiceIf): RendererCleanupFnType | undefined {

    if (cellValue || cellValue === 0) { // 0 is a value, not an empty cell
      cellDiv.innerHTML = `
          <div 
            class="ge-table-label-div" 
            data-row-index="${rowIndex}" 
            data-col-index="${columnIndex}" 
            data-area="${areaIdent}" 
            style="position: relative; background: transparent; width: 100%; height: 100%;">
            <div 
              class="ge-table-label"  
              data-row-index="${rowIndex}" 
              data-col-index="${columnIndex}" 
              data-area="${areaIdent}">${escapeHtml(cellValue)}</div></div>`;
      const n = Number(cellValue);
      if (n > 0) {
        domService.addClass(cellDiv, "ge-positive-text-color");

      } else if (n < 0) {
        domService.addClass(cellDiv, "ge-negative-text-color");
      }
    }
    return undefined;
  }

}

