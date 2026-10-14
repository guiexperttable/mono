import {
  EventListenerIf, FocusModelIf,
  GeModelChangeEvent,
  GeMouseEvent, GeScrollEvent, LicenseManager, SelectionModelIf,
  SimpleDomService,
  TableModelAndOptionsIf,
  TableOptions,
  TableScope
} from '@guiexpert/table';

/**
 * Web Component of the GuiExpert Table. Register it yourself: `customElements.define("guiexpert-table", GuiexpertTable)`.
 *
 * - `el.data = { tableModel, tableOptions }` (or `el.setData(...)`) shows a table; a new object re-creates it –
 *   the previous table is released with `TableScope.destroy()`.
 * - The table lives while the element is in the document: removing the element destroys it, inserting it again
 *   re-creates it from `data`. Data set on an element that is not connected yet is shown when it is connected.
 * - Events are dispatched on the element as bubbling `CustomEvent`s (payload in `detail`): `tableReady`,
 *   `mouseClicked`, `mouseMoved`, `mouseDragging`, `mouseDraggingEnd`, `checkboxChanged`,
 *   `modelChanged`, `selectionChanged`, `focusChanged` – and `scroll` and `contextmenu`, which do **not** bubble
 *   (the browser's own `contextmenu` MouseEvent reaches a listener on the element, too: check
 *   `e instanceof CustomEvent`).
 */
export class GuiexpertTable extends HTMLElement {


  private _data: TableModelAndOptionsIf | undefined;
  private tableScope: TableScope | undefined;
  private _loading = false;

  /** The boolean attribute `loading` (`<guiexpert-table loading>`) sets {@link loading}. */
  static get observedAttributes(): string[] {
    return ['loading'];
  }

  /**
   * `true` shows the loading overlay ("Loading…" with a CSS spinner) over the body, `false` hides it
   * (also as boolean attribute `loading`). Changing it does **not** re-create the table; a new table
   * (new `data`) shows the overlay as long as `loading` is `true`. Texts: `tableOptions.overlayOptions`.
   *
   * @since 1.1.91
   */
  get loading(): boolean {
    return this._loading;
  }

  set loading(value: boolean) {
    this._loading = !!value;
    this.applyLoading();
  }

  attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null) {
    if (name === 'loading') {
      this.loading = newValue !== null;
    }
  }


  get data(): TableModelAndOptionsIf | undefined {
    return this._data;
  }

  set data(value: TableModelAndOptionsIf | undefined) {
    if (value) {
      this.setData(value);
    } else {
      this._data = undefined;
      this.destroyTable();
    }
  }

  set licenseKey(key: string){
    LicenseManager.getInstance().setLicenseKey(key);
  }

  /**
   * Shows `tableModel` with `tableOptions` (same as `el.data = { tableModel, tableOptions }`).
   * A table shown before is destroyed first. If the element is not in the document yet, the table is created
   * when it is connected.
   */
  public setData(data: TableModelAndOptionsIf) {
    this._data = data;
    if (this.isConnected) {
      this.createTable(data);
    } else {
      // not in the document (e.g. removed and re-inserted within one task): drop the table of the previous data,
      // connectedCallback() creates the new one
      this.destroyTable();
    }
  }

  connectedCallback() {
    // properties set before customElements.define() shadow the setters – re-apply them
    this.upgradeProperty('data');
    this.upgradeProperty('licenseKey');
    this.upgradeProperty('loading');
    if (!this.tableScope && this._data) {
      this.createTable(this._data);
    }
  }

  disconnectedCallback() {
    // deferred: moving the element (remove + insert within one task) keeps the table
    queueMicrotask(() => {
      if (!this.isConnected) {
        this.destroyTable();
      }
    });
  }

  private createTable({ tableModel, tableOptions }: TableModelAndOptionsIf) {
    this.destroyTable();

    this.innerHTML = `
     <div
      class="container-div"
      style="width: 100%; height: 100%; background-color: transparent; padding: 0; margin: 0; display: block"></div>
    `;

    const ele = this.querySelector("div") as HTMLDivElement;

    const domService = new SimpleDomService();
    if (tableModel) {

      // Dispatched on the element itself, not on the inner div: that div is the TableScope host and the core
      // listens there for the native events (a "contextmenu" CustomEvent on it would be swallowed by the core).
      const dispatch = (name: string, detail: unknown, bubbles = true) => {
        this.dispatchEvent(new CustomEvent(name, { detail, bubbles }));
      };

      const listener: EventListenerIf = {
        onSelectionChanged: (model: SelectionModelIf) => dispatch("selectionChanged", model),
        onFocusChanged: (model: FocusModelIf) => dispatch("focusChanged", model),
        onCheckboxChanged: (evt: any[]) => dispatch("checkboxChanged", evt),
        // not bubbling: page-level "contextmenu" handlers (document/window) expect the browser's MouseEvent only
        onContextmenu: (evt: GeMouseEvent) => dispatch("contextmenu", evt, false),
        onModelChanged: (evt: GeModelChangeEvent) => dispatch("modelChanged", evt),
        onMouseClicked: (evt: GeMouseEvent) => dispatch("mouseClicked", evt),
        onMouseDragging: (evt: GeMouseEvent) => dispatch("mouseDragging", evt),
        onMouseDraggingEnd: (evt: GeMouseEvent) => dispatch("mouseDraggingEnd", evt),
        onMouseMoved: (evt: GeMouseEvent) => dispatch("mouseMoved", evt),
        // not bubbling (like the native event): window/document "scroll" listeners must not see every table scroll
        onScroll: (evt: GeScrollEvent) => dispatch("scroll", evt, false)
      };

      const tableScope = new TableScope(
        ele, tableModel, domService, tableOptions ?? new TableOptions(), listener
      );
      this.tableScope = tableScope;
      domService.setStyle(ele, "height", "100%");
      domService.setStyle(ele, "width", "100%");
      tableScope.firstInit();
      this.applyLoading();

      dispatch("tableReady", tableScope.getApi());
    }
  }

  /** Releases the table (listeners, resize observer, cell renderers). */
  private applyLoading() {
    if (this._loading) {
      this.tableScope?.showLoadingOverlay();
    } else {
      this.tableScope?.hideOverlay();
    }
  }

  private destroyTable() {
    this.tableScope?.destroy();
    this.tableScope = undefined;
  }

  private upgradeProperty(prop: 'data' | 'licenseKey' | 'loading') {
    const self = this as unknown as Record<string, unknown>;
    if (Object.prototype.hasOwnProperty.call(self, prop)) {
      const value = self[prop];
      delete self[prop];
      self[prop] = value;
    }
  }
}


// we do this in the demo app: customElements.define("guiexpert-table", GuiexpertTable);
