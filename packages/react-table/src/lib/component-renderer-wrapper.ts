import { AreaIdent, AreaModelIf, CellRendererIf, DomServiceIf, RendererCleanupFnType } from "@guiexpert/table";
import { createElement } from "react";
import { createRoot } from "react-dom/client";


export class ComponentRendererWrapper implements CellRendererIf {

  constructor(
    private readonly Component: any
  ) {
  }

  render(
    cellDiv: HTMLDivElement,
    rowIndex: number,
    columnIndex: number,
    areaIdent: AreaIdent,
    areaModel: AreaModelIf,
    cellValue: any,
    domService: DomServiceIf): RendererCleanupFnType | undefined {

    const props = {
      cellDiv,
      rowIndex,
      columnIndex,
      areaIdent,
      areaModel,
      cellValue
    };
    const root = createRoot(cellDiv, {});
    root.render(createElement(this.Component, props)); // render as element, so hooks work in cell components

    return () => {
      // Deferred: the cleanup may run while React is rendering (e.g. GuiexpertTable's effect cleanup
      // after a new tableModel) – a synchronous unmount there triggers a React warning.
      setTimeout(() => root.unmount(), 0);
    };
  }


}
