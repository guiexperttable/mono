import { CellRendererIf } from "./cell-render.if";
import { AreaObjectMap } from "../data/common/area-map";


/** @category Renderers & editing */
export class Renderer {

  static bodyRenderer(bodyCellRenderer: CellRendererIf): AreaObjectMap<CellRendererIf> {
    return new AreaObjectMap<CellRendererIf>(undefined, bodyCellRenderer, undefined);
  }

}
