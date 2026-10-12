import { CellRendererIf } from "../cell-render.if";

/** @category Renderers & editing */
export type GetEditRenderer = (rowIndex: number, columnIndex: number) => CellRendererIf | undefined;
