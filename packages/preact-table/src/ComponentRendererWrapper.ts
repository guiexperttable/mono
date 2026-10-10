import { AreaIdent, AreaModelIf, CellRendererIf, DomServiceIf, RendererCleanupFnType } from "@guiexpert/table";
import { h, render } from "preact";



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
    // Preact's own render() – no react-dom / preact/compat needed; h() keeps hooks working in cell components
    render(h(this.Component, props), cellDiv);

    return () => {
      render(null, cellDiv);
    };
  }


  // private mount(
  //   component: any,
  //   props: (Data & VNodeProps) | null,
  //   appContext: AppContext | null,
  //   cellDiv: HTMLDivElement
  // ) {
  //   let vNode: VNode = createVNode(component, props);
  //
  //   vNode.appContext = appContext;
  //   render(vNode, cellDiv);
  //
  //   const cleanupFn = () => {
  //     if (cellDiv) {
  //       render(null, cellDiv);
  //     }
  //   };
  //
  //   return cleanupFn;
  // }

}
