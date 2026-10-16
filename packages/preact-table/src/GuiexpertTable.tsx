import { Component, createRef } from "preact";
import {
  EventListenerIf, FocusModelIf,
  GeModelChangeEvent,
  GeMouseEvent, GeRowDragEvent, GeScrollEvent, GeStateChangeEvent, LicenseManager, SelectionModelIf,
  SimpleDomService, TableApi,
  TableModelIf,
  TableOptions,
  TableScope
} from '@guiexpert/table';

export type GeMouseEventFn = (evt: GeMouseEvent) => void;
export type GeCheckboxEventFn = (evt: any[]) => void;
export type GeTableReadyEventFn = (evt: TableApi) => void;
export type GeModelChangeEventFn = (evt: GeModelChangeEvent) => void;
export type GeSelectionChangeEventFn = (evt: SelectionModelIf) => void;
export type GeFocusChangeEventFn = (evt: FocusModelIf) => void;
export type GeScrollEventFn = (evt: GeScrollEvent) => void;
export type GeStateChangeEventFn = (evt: GeStateChangeEvent) => void;
export type GeRowDragEventFn = (evt: GeRowDragEvent) => void;

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
  tableReady?: GeTableReadyEventFn,
  licenseKey?: string,
  selectionChanged?: GeSelectionChangeEventFn;
  focusChanged?: GeFocusChangeEventFn;
  /**
   * The state changed (column layout, sorting, scroll position, tree, checked/selected rows …) – once after the
   * changes settled. Save `evt.state` (e.g. on your server) and pass it back as `tableOptions.initialState`.
   * @since 1.1.92
   */
  stateChanged?: GeStateChangeEventFn;
  /** Row drag (since 1.1.95, handles via `ColumnDef.rowDrag`): started / target changed / ended ("end" or "cancel"). */
  rowDragStart?: GeRowDragEventFn;
  rowDragMove?: GeRowDragEventFn;
  rowDragEnd?: GeRowDragEventFn;
  /**
   * `true` shows the loading overlay ("Loading…" with a CSS spinner) over the body, `false` hides it.
   * Changing it does **not** re-create the table. Texts: `tableOptions.overlayOptions`. @since 1.1.92
   */
  loading?: boolean;
}


/**
 * GuiexpertTable is a Preact component that wraps the GuiExpert Table (`@guiexpert/table`).
 * It displays a table with various event listeners and callback functions.
 *
 * A new `tableModel` or `tableOptions` object (new reference) re-creates the table; the previous
 * table is released with `TableScope.destroy()`, as on unmount. Keep both objects stable
 * (create them once, not in `render`), otherwise the table is re-created on every render.
 * Callback props may change freely – the current one is called.
 */
export class GuiexpertTable extends Component<GuiexpertTableProps>  {

  ref = createRef<HTMLDivElement>();

  private tableScope?: TableScope;
  /** the overlay was shown by the loading prop: loading={false} hides only that one */
  private shownByProp = false;

  constructor(props: GuiexpertTableProps) {
    super(props);
  }

  componentDidMount() {
    const myContainer = this.ref.current;
    if (myContainer) {
      this.initTable(myContainer, this.props);
    }
  }

  componentDidUpdate(previousProps: Readonly<GuiexpertTableProps>) {
    const myContainer = this.ref.current;
    if (myContainer
      && (previousProps.tableModel !== this.props.tableModel || previousProps.tableOptions !== this.props.tableOptions)) {
      this.initTable(myContainer, this.props);
    }
    if (!!previousProps.loading !== !!this.props.loading) {
      this.applyLoading(); // no re-creation of the table
    }
    if (this.props.licenseKey && this.props.licenseKey !== previousProps.licenseKey) {
      LicenseManager.getInstance().setLicenseKey(this.props.licenseKey);
    }
  }

  componentWillUnmount() {
    this.destroyTable();
  }

  /**
   * Creates the table in `ele` (a table created before is destroyed first) and calls `tableReady`.
   * The event callbacks are always taken from the current props.
   */
  initTable(ele: HTMLDivElement, props: GuiexpertTableProps) {
    this.destroyTable();

    // read the callbacks at call time: callback props may change without re-creating the table
    const current = () => this.props;
    const listener: EventListenerIf = {
      onSelectionChanged: (model: SelectionModelIf) => current().selectionChanged?.(model),
      onFocusChanged: (model: FocusModelIf) => current().focusChanged?.(model),
      onScroll: (evt: GeScrollEvent) => current().scroll?.(evt),
      onCheckboxChanged: (evt: any[]) => current().checkboxChanged?.(evt),
      onContextmenu: (evt: GeMouseEvent) => current().contextmenu?.(evt),
      onModelChanged: (evt: GeModelChangeEvent) => current().modelChanged?.(evt),
      onMouseClicked: (evt: GeMouseEvent) => current().mouseClicked?.(evt),
      onMouseDragging: (evt: GeMouseEvent) => current().mouseDragging?.(evt),
      onMouseDraggingEnd: (evt: GeMouseEvent) => current().mouseDraggingEnd?.(evt),
      onMouseMoved: (evt: GeMouseEvent) => current().mouseMoved?.(evt),
      onStateChanged: (evt: GeStateChangeEvent) => current().stateChanged?.(evt),
      onRowDragStart: (evt: GeRowDragEvent) => current().rowDragStart?.(evt),
      onRowDragMove: (evt: GeRowDragEvent) => current().rowDragMove?.(evt),
      onRowDragEnd: (evt: GeRowDragEvent) => current().rowDragEnd?.(evt)
    };

    const tableScope = new TableScope(
      ele, props.tableModel, new SimpleDomService(), props.tableOptions ?? new TableOptions(), listener
    );
    this.tableScope = tableScope;
    tableScope.firstInit();
    this.shownByProp = false;
    this.applyLoading();
    props.tableReady?.(tableScope.getApi());
    if (props.licenseKey) LicenseManager.getInstance().setLicenseKey(props.licenseKey);
  };

  /** Shows or hides the loading overlay according to the `loading` prop. */
  private applyLoading() {
    if (this.props.loading) {
      this.tableScope?.showLoadingOverlay();
      this.shownByProp = true;
    } else if (this.shownByProp) {
      this.tableScope?.hideOverlay(); // an overlay the app showed itself stays
      this.shownByProp = false;
    }
  }

  /** Releases the table (listeners, resize observer, cell renderers). */
  private destroyTable() {
    this.tableScope?.destroy();
    this.tableScope = undefined;
  }

  render() {
    return <div
      ref={this.ref}
      className="container-div"
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "transparent",
        padding: "0",
        margin: "0"
      }} />;
  }
}

export default GuiexpertTable;
