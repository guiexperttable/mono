import { editInputPipe } from "./edit-input-pipe.if";

/** @category Renderers & editing */
export const editInputPipeForNumber: editInputPipe = function(value: any, _rowIndex: number, _columnIndex: number) {
  // empty input stays empty; since 1.1.96 the number 0 stays 0 (before: "" – filled or pasted zeros were lost)
  return value === "" || value === null || value === undefined ? "" : Number(value);
}

