import {
  EventListenerIf,
  FocusModelIf,
  GeModelChangeEvent,
  GeMouseEvent, GeScrollEvent, LicenseManager, SelectionModelIf,
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
 * @param {string} [props.licenseKey] - The license key for the GuiexpertTable component.
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
      onScroll: (evt: GeScrollEvent) => propsRef.current.scroll?.(evt)
    };

    // A new tableModel or tableOptions object re-creates the table (dependency array below);
    // the cleanup function releases the previous one (listeners, resize observer, cell renderers).
    const tableScope = new TableScope(
      ele, tableModel, new SimpleDomService(), tableOptions ?? new TableOptions(), listener
    );
    tableScope.firstInit();
    propsRef.current.tableReady?.(tableScope.getApi());

    return () => tableScope.destroy();
  }, [tableModel, tableOptions]);

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


