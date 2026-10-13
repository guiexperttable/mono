import { editInputPipe } from "./edit-input-pipe.if";

/** @category Renderers & editing */
export const editInputPipeForNumber: editInputPipe = function(value: any, _rowIndex: number, _columnIndex: number) {
  return value ? Number(value) : "";
}

