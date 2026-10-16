import { SvelteComponent } from "svelte";
import type {
  FocusModelIf,
  GeModelChangeEvent,
  GeMouseEvent,
  GeRowDragEvent,
  GeBatchEditEvent,
  GeScrollEvent,
  GeStateChangeEvent,
  SelectionModelIf,
  TableApi,
  TableModelIf,
  TableOptionsIf
} from "@guiexpert/table";

export interface GuiexpertTableProps {
  tableModel: TableModelIf;
  tableOptions?: TableOptionsIf;
  licenseKey?: string;
  /** `true` shows the loading overlay ("Loading…"), `false` hides it – no re-creation of the table. @since 1.1.92 */
  loading?: boolean;
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
  /** The state changed (column layout, sorting, scroll position …). @since 1.1.92 */
  onStateChanged?: (evt: GeStateChangeEvent) => void;
  /** Row drag: started / drop target changed / ended ("end" or "cancel"). @since 1.1.95 */
  onRowDragStart?: (evt: GeRowDragEvent) => void;
  onRowDragMove?: (evt: GeRowDragEvent) => void;
  onRowDragEnd?: (evt: GeRowDragEvent) => void;
  /** Batch edit: values marked, set back, written or discarded. @since 1.1.96 */
  onBatchEditChanged?: (evt: GeBatchEditEvent) => void;
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
  /** @since 1.1.92 */
  stateChanged: CustomEvent<GeStateChangeEvent>;
  /** @since 1.1.95 */
  rowDragStart: CustomEvent<GeRowDragEvent>;
  rowDragMove: CustomEvent<GeRowDragEvent>;
  rowDragEnd: CustomEvent<GeRowDragEvent>;
  /** @since 1.1.96 */
  batchEditChanged: CustomEvent<GeBatchEditEvent>;
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
