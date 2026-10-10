import { AreaIdent, AreaModelIf, CellRendererIf, DomServiceIf, RendererCleanupFnType } from "@guiexpert/table";
import { JSX } from "solid-js/jsx-runtime";
import { mergeProps, render } from "solid-js/web";

export class ComponentRendererWrapper implements CellRendererIf {

  constructor(
    private readonly code: (props: any) => JSX.Element
  ) {
  }

  render(
    cellDiv: HTMLDivElement,
    rowIndex: number,
    columnIndex: number,
    areaIdent: AreaIdent,
    areaModel: AreaModelIf,
    cellValue: any,
    _domService: DomServiceIf): RendererCleanupFnType | undefined {

    const props = mergeProps({
      rowIndex,
      columnIndex,
      areaIdent,
      areaModel,
      cellValue
    });
    const dispose = render(
      () => this.code(props),
      cellDiv
    );

    return dispose; // clean up the Solid root when the cell is re-rendered
  }


}
