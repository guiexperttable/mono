
import {
  FocusModelIf,
  GeModelChangeEvent, GeMouseEvent, GeScrollEvent, SelectionModelIf, TableApi, TableModelIf, TableOptions
} from '@guiexpert/table';

export type GeMouseEventFn = (evt: GeMouseEvent) => void;
export type GeCheckboxEventFn = (evt: any[]) => void;
export type GeTableReadyEventFn = (evt: TableApi) => void;
export type GeModelChangeEventFn = (evt: GeModelChangeEvent) => void;
export type GeSelectionChangeEventFn = (evt: SelectionModelIf) => void;
export type GeFocusChangeEventFn = (evt: FocusModelIf) => void;
export type GeScrollEventFn = (evt: GeScrollEvent) => void;


export interface GuiexpertTableProps {
  tableModel: TableModelIf,
  tableOptions?: TableOptions,
  scroll?: GeScrollEventFn,
  mouseMoved?: GeMouseEventFn,
  contextmenu?: GeMouseEventFn,
  mouseClicked?: GeMouseEventFn,
  mouseDragging?: GeMouseEventFn,
  mouseDraggingEnd?: GeMouseEventFn,
  checkboxChanged?: GeCheckboxEventFn,
  modelChanged?: GeModelChangeEventFn,
  selectionChanged?: GeSelectionChangeEventFn;
  focusChanged?: GeFocusChangeEventFn;
  tableReady?: GeTableReadyEventFn,
  licenseKey?: string,
}

