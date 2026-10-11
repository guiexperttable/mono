import { SvelteComponent } from "svelte";
import type {
  FocusModelIf,
  GeModelChangeEvent,
  GeMouseEvent,
  GeScrollEvent,
  SelectionModelIf,
  TableApi,
  TableModelIf,
  TableOptionsIf
} from "@guiexpert/table";

export interface GuiexpertTableProps {
  tableModel: TableModelIf;
  tableOptions?: TableOptionsIf;
  licenseKey?: string;
  /** Callback props – alternative to `on:…` (required in Svelte 5 runes mode). */
  onTableReady?: (api: TableApi) => void;
  onMouseClicked?: (evt: GeMouseEvent) => void;
  onMouseMoved?: (evt: GeMouseEvent) => void;
  onMouseDragging?: (evt: GeMouseEvent) => void;
  onMouseDraggingEnd?: (evt: GeMouseEvent) => void;
  onContextmenu?: (evt: GeMouseEvent) => void;
  onCheckboxChanged?: (rows: any[]) => void;
  onModelChanged?: (evt: GeModelChangeEvent) => void;
  onSelectionChanged?: (model: SelectionModelIf) => void;
  onFocusChanged?: (model: FocusModelIf) => void;
  onScroll?: (evt: GeScrollEvent) => void;
}

export interface GuiexpertTableEvents {
  tableReady: CustomEvent<TableApi>;
  mouseClicked: CustomEvent<GeMouseEvent>;
  mouseMoved: CustomEvent<GeMouseEvent>;
  mouseDragging: CustomEvent<GeMouseEvent>;
  mouseDraggingEnd: CustomEvent<GeMouseEvent>;
  contextmenu: CustomEvent<GeMouseEvent>;
  checkboxChanged: CustomEvent<any[]>;
  modelChanged: CustomEvent<GeModelChangeEvent>;
  selectionChanged: CustomEvent<SelectionModelIf>;
  focusChanged: CustomEvent<FocusModelIf>;
  scroll: CustomEvent<GeScrollEvent>;
}

/**
 * Svelte wrapper of the GuiExpert Table (Svelte 4 and 5).
 *
 * @example
 * <GuiexpertTable {tableModel} {tableOptions} on:tableReady={(e) => api = e.detail} />
 * <!-- Svelte 5 runes mode: -->
 * <GuiexpertTable {tableModel} onTableReady={(api) => tableApi = api} />
 */
export default class GuiexpertTable extends SvelteComponent<GuiexpertTableProps, GuiexpertTableEvents, {}> {}
