import {GuiexpertTableProps} from "./GuiexpertTableProps";
import {mergeProps, onMount} from "solid-js";
import {
  EventListenerIf,
  FocusModelIf, GeModelChangeEvent, GeMouseEvent, GeScrollEvent,
  LicenseManager,
  SelectionModelIf,
  SimpleDomService,
  TableOptions,
  TableScope
} from '@guiexpert/table';



/**
 * Render a table component with specified properties
 *
 * @param {GuiexpertTableProps} props - The properties of the table component
 * @returns {JSX.Element} - The rendered table component
 */
export default (props: GuiexpertTableProps) => {

  let ref:any;

  const merged = mergeProps({
    tableModel: null,
    tableOptions: new TableOptions()
  }, props);


  onMount(() => {
    /**
     * Calls the callback prop (e.g. `mouseClicked={...}`) and – for backward compatibility – also dispatches
     * the event as bubbling DOM CustomEvent on the container div.
     */
    const emit = (name: string, detail: any, callback?: (detail: any) => unknown) => {
      if (callback) callback(detail);
      if (ref) ref.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));
    };

    const listener: EventListenerIf = {
      onSelectionChanged: (model: SelectionModelIf) => emit("selectionChanged", model, merged.selectionChanged),
      onFocusChanged: (model: FocusModelIf) => emit("focusChanged", model, merged.focusChanged),
      onScroll: (evt: GeScrollEvent) => emit("scroll", evt, merged.scroll),
      onCheckboxChanged: (evt: any[]) => emit("checkboxChanged", evt, merged.checkboxChanged),
      onContextmenu: (evt: GeMouseEvent) => emit("contextmenu", evt, merged.contextmenu),
      onModelChanged: (evt: GeModelChangeEvent) => emit("modelChanged", evt, merged.modelChanged),
      onMouseClicked: (evt: GeMouseEvent) => emit("mouseClicked", evt, merged.mouseClicked),
      onMouseDragging: (evt: GeMouseEvent) => emit("mouseDragging", evt, merged.mouseDragging),
      onMouseDraggingEnd: (evt: GeMouseEvent) => emit("mouseDraggingEnd", evt, merged.mouseDraggingEnd),
      onMouseMoved: (evt: GeMouseEvent) => emit("mouseMoved", evt, merged.mouseMoved)
    };

    const tableScope = new TableScope(
      ref, merged.tableModel, new SimpleDomService(), merged.tableOptions, listener
    );
    tableScope.firstInit();
    emit("tableReady", tableScope.getApi(), merged.tableReady);

    if (merged.licenseKey) LicenseManager.getInstance().setLicenseKey(merged.licenseKey);
  });

  return (
    <div ref={ref} />
  );
}