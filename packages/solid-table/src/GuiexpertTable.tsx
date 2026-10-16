import {GuiexpertTableProps} from "./GuiexpertTableProps";
import {createEffect, mergeProps, onCleanup, untrack} from "solid-js";
import {
  EventListenerIf,
  FocusModelIf, GeBatchEditEvent, GeModelChangeEvent, GeMouseEvent, GeRowDragEvent, GeScrollEvent, GeStateChangeEvent,
  LicenseManager,
  SelectionModelIf,
  SimpleDomService,
  TableOptions,
  TableScope
} from '@guiexpert/table';



/**
 * Render a table component with specified properties
 *
 * A new `tableModel` or `tableOptions` object (e.g. from a signal) re-creates the table; the previous table is
 * released with `TableScope.destroy()`, as when the component is disposed. Callback props may change freely.
 *
 * @param {GuiexpertTableProps} props - The properties of the table component
 * @returns {JSX.Element} - The rendered table component
 */
export default (props: GuiexpertTableProps) => {

  let ref: HTMLDivElement | undefined;

  const merged = mergeProps({
    tableModel: null,
    tableOptions: new TableOptions()
  }, props);

  /**
   * Calls the callback prop (e.g. `mouseClicked={...}`) and – for backward compatibility – also dispatches
   * the event as bubbling DOM CustomEvent on the container div.
   */
  const emit = (name: string, detail: any, callback?: (detail: any) => unknown) => {
    if (callback) callback(detail);
    // "scroll" does not bubble (like the native event) – otherwise every table scroll reaches window/document listeners
    if (ref) ref.dispatchEvent(new CustomEvent(name, { detail, bubbles: name !== "scroll" }));
  };

  // the callbacks are read at call time: callback props may change without re-creating the table
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
    onMouseMoved: (evt: GeMouseEvent) => emit("mouseMoved", evt, merged.mouseMoved),
    onStateChanged: (evt: GeStateChangeEvent) => emit("stateChanged", evt, merged.stateChanged),
    onRowDragStart: (evt: GeRowDragEvent) => emit("rowDragStart", evt, merged.rowDragStart),
    onRowDragMove: (evt: GeRowDragEvent) => emit("rowDragMove", evt, merged.rowDragMove),
    onRowDragEnd: (evt: GeRowDragEvent) => emit("rowDragEnd", evt, merged.rowDragEnd),
    onBatchEditChanged: (evt: GeBatchEditEvent) => emit("batchEditChanged", evt, merged.batchEditChanged)
  };

  let currentScope: TableScope | undefined;
  let shownByProp = false; // loading={false} hides only an overlay the prop showed (not one of the app)
  const applyLoading = (loading: boolean) => {
    if (loading) {
      currentScope?.showLoadingOverlay();
      shownByProp = true;
    } else if (shownByProp) {
      currentScope?.hideOverlay();
      shownByProp = false;
    }
  };

  // Runs after the div is rendered and again whenever tableModel / tableOptions change (only these two are
  // tracked). onCleanup releases the table before the next run and when the component is disposed.
  createEffect(() => {
    const tableModel = merged.tableModel;
    const tableOptions = merged.tableOptions;
    const ele = ref;
    if (!ele || !tableModel) {
      return;
    }
    const tableScope = untrack(() => {
      const scope = new TableScope(
        ele, tableModel, new SimpleDomService(), tableOptions ?? new TableOptions(), listener
      );
      scope.firstInit();
      currentScope = scope;
      shownByProp = false;
      applyLoading(!!merged.loading); // a re-created table keeps showing the overlay
      emit("tableReady", scope.getApi(), merged.tableReady);
      return scope;
    });
    onCleanup(() => {
      if (currentScope === tableScope) currentScope = undefined;
      tableScope.destroy();
    });
  });

  // the loading prop: shows/hides the overlay, no re-creation of the table
  createEffect(() => {
    const loading = !!merged.loading;
    untrack(() => applyLoading(loading));
  });

  createEffect(() => {
    const licenseKey = merged.licenseKey;
    if (licenseKey) LicenseManager.getInstance().setLicenseKey(licenseKey);
  });

  return (
    <div ref={ref} />
  );
}
