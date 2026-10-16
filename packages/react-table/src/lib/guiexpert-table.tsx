import {
  EventListenerIf,
  FocusModelIf,
  GeModelChangeEvent,
  GeBatchEditEvent, GeDetailEvent, GeMouseEvent, GeRowDragEvent, GeScrollEvent, GeStateChangeEvent, LicenseManager, SelectionModelIf,
  SimpleDomService,
  TableApi,
  TableModelIf,
  TableOptions,
  TableScope
} from '@guiexpert/table';
import { useEffect, useRef } from "react";

export type GeMouseEventFn = (evt: GeMouseEvent) => void;
export type GeCheckboxEventFn = (evt: any[]) => void;
export type GeTableReadyEventFn = (evt: TableApi) => void;
export type GeModelChangeEventFn = (evt: GeModelChangeEvent) => void;
export type GeSelectionChangeEventFn = (evt: SelectionModelIf) => void;
export type GeFocusChangeEventFn = (evt: FocusModelIf) => void;
export type GeScrollEventFn = (evt: GeScrollEvent) => void;
export type GeStateChangeEventFn = (evt: GeStateChangeEvent) => void;
export type GeRowDragEventFn = (evt: GeRowDragEvent) => void;
export type GeBatchEditEventFn = (evt: GeBatchEditEvent) => void;
export type GeDetailEventFn = (evt: GeDetailEvent) => void;

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
  /**
   * The state changed (column layout, sorting, scroll position, tree, checked/selected rows …) – once after the
   * changes settled. Save `evt.state` (e.g. on your server) and pass it back as `tableOptions.initialState`.
   * @since 1.1.92
   */
  stateChanged?: GeStateChangeEventFn,
  /**
   * Row drag (since 1.1.95, handles via `ColumnDef.rowDrag`): a drag started / its drop target changed / it ended
   * (`evt.type` "end" or "cancel"). `evt.preventDefault()` in start or move vetoes. See `GeRowDragEvent`.
   */
  rowDragStart?: GeRowDragEventFn,
  rowDragMove?: GeRowDragEventFn,
  rowDragEnd?: GeRowDragEventFn,
  /** Batch edit: values marked, set back, written or discarded – e.g. to enable "Save" (since 1.1.96). */
  batchEditChanged?: GeBatchEditEventFn,
  /** Master/detail: a detail row was expanded or collapsed (since 1.1.97). */
  detailExpandedChanged?: GeDetailEventFn,
  tableReady?: GeTableReadyEventFn,
  licenseKey?: string,
  /**
   * `true` shows the loading overlay ("Loading…" with a CSS spinner) over the body, `false` hides it
   * (`TableApi.showLoadingOverlay()` / `hideOverlay()`). Changing it does **not** re-create the table.
   * Texts and behaviour: `tableOptions.overlayOptions`. @since 1.1.92
   */
  loading?: boolean,
}

/**
 * Initialize and render the GuiexpertTable component.
 *
 * @param {Object} props - The properties of the GuiexpertTable component.
 * @param {TableModel} props.tableModel - The model for the table.
 * @param {TableOptions} [props.tableOptions=new TableOptions()] - The options for the table.
 * @param {Function} [props.mouseMoved] - The callback for mouse movement events.
 * @param {Function} [props.checkboxChanged] - The callback for checkbox change events.
 * @param {Function} [props.contextmenu] - The callback for context menu events.
 * @param {Function} [props.modelChanged] - The callback for model change events.
 * @param {Function} [props.mouseClicked] - The callback for mouse click events.
 * @param {Function} [props.mouseDragging] - The callback for mouse dragging events.
 * @param {Function} [props.mouseDraggingEnd] - The callback for mouse dragging end events.
 * @param {Function} [props.tableReady] - The callback for when the table is ready.
 * @param {Function} [props.scroll] - The callback for scroll events.
 * @param {Function} [props.stateChanged] - The state changed (layout, sorting …, since 1.1.92).
 * @param {Function} [props.rowDragStart] - Row drag started (since 1.1.95); also `rowDragMove`, `rowDragEnd`.
 * @param {Function} [props.batchEditChanged] - Batch edit: pending changes changed (since 1.1.96).
 * @param {Function} [props.detailExpandedChanged] - Master/detail: a detail row was expanded or collapsed (since 1.1.97).
 * @param {string} [props.licenseKey] - The license key for the GuiexpertTable component.
 * @param {boolean} [props.loading] - Shows the loading overlay (no re-creation of the table, since 1.1.92).
 *
 * A new `tableModel` or `tableOptions` object (new reference) re-creates the table; the previous
 * table is released with `TableApi.destroy()`. Keep both stable with `useMemo` / `useState`,
 * otherwise the table is re-created on every render. Callback props may change freely.
 *
 * @returns {JSX.Element} - The rendered GuiexpertTable component.
 */
export function GuiexpertTable(props: GuiexpertTableProps) {
  const {
    tableModel,
    tableOptions,
    licenseKey
  } = props;

  const myContainer = useRef<HTMLDivElement>(null);
  const apiRef = useRef<TableApi | undefined>(undefined);
  // true while the overlay was shown by the loading prop: loading={false} hides only that one
  // (an overlay the app shows itself, e.g. in tableReady, stays)
  const shownByPropRef = useRef(false);

  // Always call the latest callback props without re-creating the table.
  const propsRef = useRef<GuiexpertTableProps>(props);
  propsRef.current = props;

  useEffect(() => {
    const ele = myContainer.current;
    if (!ele) {
      return;
    }
    const listener: EventListenerIf = {
      onSelectionChanged: (model: SelectionModelIf) => propsRef.current.selectionChanged?.(model),
      onFocusChanged: (model: FocusModelIf) => propsRef.current.focusChanged?.(model),
      onCheckboxChanged: (evt: any[]) => propsRef.current.checkboxChanged?.(evt),
      onContextmenu: (evt: GeMouseEvent) => propsRef.current.contextmenu?.(evt),
      onModelChanged: (evt: GeModelChangeEvent) => propsRef.current.modelChanged?.(evt),
      onMouseClicked: (evt: GeMouseEvent) => propsRef.current.mouseClicked?.(evt),
      onMouseDragging: (evt: GeMouseEvent) => propsRef.current.mouseDragging?.(evt),
      onMouseDraggingEnd: (evt: GeMouseEvent) => propsRef.current.mouseDraggingEnd?.(evt),
      onMouseMoved: (evt: GeMouseEvent) => propsRef.current.mouseMoved?.(evt),
      onScroll: (evt: GeScrollEvent) => propsRef.current.scroll?.(evt),
      onStateChanged: (evt: GeStateChangeEvent) => propsRef.current.stateChanged?.(evt),
      onRowDragStart: (evt: GeRowDragEvent) => propsRef.current.rowDragStart?.(evt),
      onRowDragMove: (evt: GeRowDragEvent) => propsRef.current.rowDragMove?.(evt),
      onRowDragEnd: (evt: GeRowDragEvent) => propsRef.current.rowDragEnd?.(evt),
      onBatchEditChanged: (evt: GeBatchEditEvent) => propsRef.current.batchEditChanged?.(evt),
      onDetailExpandedChanged: (evt: GeDetailEvent) => propsRef.current.detailExpandedChanged?.(evt)
    };

    // A new tableModel or tableOptions object re-creates the table (dependency array below);
    // the cleanup function releases the previous one (listeners, resize observer, cell renderers).
    const tableScope = new TableScope(
      ele, tableModel, new SimpleDomService(), tableOptions ?? new TableOptions(), listener
    );
    tableScope.firstInit();
    const api = tableScope.getApi();
    apiRef.current = api;
    shownByPropRef.current = !!propsRef.current.loading;
    if (shownByPropRef.current) {
      api.showLoadingOverlay(); // a re-created table keeps showing the overlay
    }
    propsRef.current.tableReady?.(api);

    return () => {
      apiRef.current = undefined;
      tableScope.destroy();
    };
  }, [tableModel, tableOptions]);

  const loading = !!props.loading;
  useEffect(() => {
    const api = apiRef.current;
    if (loading) {
      api?.showLoadingOverlay();
      shownByPropRef.current = true;
    } else if (shownByPropRef.current) {
      api?.hideOverlay();
      shownByPropRef.current = false;
    }
  }, [loading]);

  useEffect(() => {
    if (licenseKey) LicenseManager.getInstance().setLicenseKey(licenseKey);
  }, [licenseKey]);

  return (
    <div
      ref={myContainer}
      className="container-div"
      style={{
        width: "100%",
        height: "100%",
        background: "transparent",
        padding: "0",
        margin: "0"
      }}></div>
  );
}

export default GuiexpertTable;


