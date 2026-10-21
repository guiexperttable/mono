// @since-angular 22
// ^ scripts/sync-angular-src.mjs copies this file only into the builds for Angular 22 and later (ng22, ng23 …).
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  isDevMode,
  model,
  NgZone,
  OnDestroy,
  output,
  PLATFORM_ID,
  untracked,
  ViewEncapsulation
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import {
  EventListenerIf,
  FocusModelIf,
  GeBatchEditEvent,
  GeDetailEvent,
  GeEditEvent,
  GeModelChangeEvent,
  GeMouseEvent,
  GeRowDragEvent,
  GeScrollEvent,
  GeStateChangeEvent,
  GeUndoEvent,
  SelectionModelIf,
  TableApi,
  TableModelIf,
  TableOptions,
  TableOptionsIf,
  TableScope
} from "@guiexpert/table";
import { DomService } from "./service/dom-service";


/**
 * The signal-native GuiExpert table for **Angular 22 and later**: signal inputs (`input()`), the {@link TableApi} as a
 * signal (`model()`, two-way binding `[(tableApi)]`), signal outputs (`output()`), reactivity with `effect()` instead
 * of `ngOnChanges` – no RxJS, works with and without Zone.js (`provideZonelessChangeDetection()`).
 *
 * The classic `TableComponent` (`<guiexpert-table>`, Angular 14 – 22+) stays available unchanged. Differences:
 * the API comes as a signal (`[(tableApi)]` / `(tableApiChange)` – there is no `tableReady` output) and the output
 * `contextMenu` (instead of `contextmenu`: an output named like a DOM event also receives the native event that
 * bubbles out of the table – the handler would run twice).
 *
 * Rules:
 * - The host needs a height (`.table-div { display: block; height: 500px }`).
 * - A new `tableModel` or `tableOptions` value re-creates the table (`tableApi` switches to the new API directly);
 *   `loading` shows / hides the loading overlay without re-creating it.
 * - `tableApi` is set by the table – a value written from outside is replaced (warning in dev mode).
 * - Outputs are emitted outside the Angular zone (no change detection per `mousemove`). Write a **signal** in the
 *   handler – that schedules change detection with and without Zone.js; plain fields need `markForCheck()`.
 * - On the server (SSR) no table is created; it is built in the browser.
 *
 * @since 1.1.100 (`@guiexpert/angular-table@22.1.100`)
 *
 * @example
 * import { Component, computed, effect, signal } from "@angular/core";
 * import { TableSignalComponent } from "@guiexpert/angular-table";
 * import { TableApi, TableFactory } from "@guiexpert/table";
 *
 * @Component({
 *   selector: "app-orders",
 *   imports: [TableSignalComponent],
 *   template: `
 *     <guiexpert-table-signal class="table-div" [tableModel]="model" [(tableApi)]="api" />
 *     <button [disabled]="!ready()" (click)="api()?.downloadExcel('orders.xlsx', 'me')">Excel</button>`
 * })
 * export class OrdersComponent {
 *   readonly model = TableFactory.createTableModel({ rows: [{ id: 1, customer: "Acme" }], properties: ["id", "customer"] });
 *   readonly api = signal<TableApi | undefined>(undefined);
 *   readonly ready = computed(() => !!this.api());
 *   constructor() {
 *     effect(() => this.api()?.scrollToIndex(0, 0));
 *   }
 * }
 */
@Component({
  selector: "guiexpert-table-signal",
  providers: [DomService],
  template: "",
  styleUrls: [
    "./table.component.css"  // the same generated stylesheet as TableComponent – added to the document only once
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableSignalComponent implements OnDestroy {

  // ---------------------------------------------------------------- inputs

  /** The table model. A new value re-creates the table; `undefined` = no table (e.g. while the data is loading). */
  readonly tableModel = input<TableModelIf | undefined>(undefined);

  /** The table options (default: `new TableOptions()`). A new value re-creates the table. */
  readonly tableOptions = input<TableOptionsIf>(new TableOptions());

  /**
   * `true` shows the loading overlay ("Loading…" with a CSS spinner) over the body, `false` hides it again – without
   * re-creating the table. An overlay the app showed itself (`tableApi()?.showNoRowsOverlay()`) is not hidden.
   */
  readonly loading = input<boolean>(false);

  /** Delay of `mouseClicked` in ms (a double click reports only once). `0` = emitted synchronously. Default 150. */
  readonly debounceMouseClickDelay = input<number>(150);

  // ---------------------------------------------------------------- the API as a signal

  /**
   * The {@link TableApi} of the current table, `undefined` before the first table and after the component was
   * destroyed. Two-way binding: `[(tableApi)]="api"` with `api = signal<TableApi | undefined>(undefined)`; also
   * `(tableApiChange)="…"` or `viewChild(TableSignalComponent)?.tableApi()`.
   *
   * @example
   * // template: <guiexpert-table-signal [tableModel]="model" [(tableApi)]="api" />
   * // readonly api = signal<TableApi | undefined>(undefined);
   * // readonly rowCount = computed(() => this.api()?.getDisplayedRowCount() ?? 0);
   */
  readonly tableApi = model<TableApi | undefined>(undefined);

  // ---------------------------------------------------------------- outputs

  /** Mouse click on a cell (debounced: `debounceMouseClickDelay`). */
  readonly mouseClicked = output<GeMouseEvent>();
  /** Mouse moved over the table. */
  readonly mouseMoved = output<GeMouseEvent>();
  /** Mouse dragged (button pressed). */
  readonly mouseDragging = output<GeMouseEvent>();
  /** Mouse drag ended. */
  readonly mouseDraggingEnded = output<GeMouseEvent>();
  /**
   * Right click / context menu key on the table (`TableComponent`: `contextmenu`). Call
   * `evt.originalEvent?.preventDefault()` to suppress the browser menu.
   */
  readonly contextMenu = output<GeMouseEvent>();
  /** The table was scrolled. */
  readonly scroll = output<GeScrollEvent>();
  /** Cell values were changed (editor, fill handle, paste, API …). */
  readonly modelChanged = output<GeModelChangeEvent>();
  /** The selection changed. */
  readonly selectionChanged = output<SelectionModelIf>();
  /** The focused cell changed. */
  readonly focusChanged = output<FocusModelIf>();
  /** Row checkboxes changed – the checked rows. */
  readonly checkboxChanged = output<any[]>();
  /** The table state changed (columns, sorting, scroll position …) – once after the changes settled. */
  readonly stateChanged = output<GeStateChangeEvent>();
  /** Row drag started. `evt.preventDefault()` cancels it. */
  readonly rowDragStart = output<GeRowDragEvent>();
  /** Row drag: the drop target changed. */
  readonly rowDragMove = output<GeRowDragEvent>();
  /** Row drag: dropped or cancelled. */
  readonly rowDragEnd = output<GeRowDragEvent>();
  /** Batch edit: values were marked, written or discarded. */
  readonly batchEditChanged = output<GeBatchEditEvent>();
  /** Master/detail: a detail row was expanded or collapsed. */
  readonly detailExpandedChanged = output<GeDetailEvent>();
  /** The cell editor opened, changed, committed or was cancelled. */
  readonly editingChanged = output<GeEditEvent>();
  /** The undo history changed. */
  readonly undoStackChanged = output<GeUndoEvent>();

  // ---------------------------------------------------------------- internals

  private readonly elementRef = inject<ElementRef<HTMLDivElement>>(ElementRef); // the host element (TableScope types it as a div)
  private readonly zone = inject(NgZone);
  private readonly domService = inject(DomService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private tableScope?: TableScope;
  private destroyed = false;
  /** the overlay was shown by the `loading` input: `false` hides only that one */
  private shownByInput = false;
  private clickTimer?: ReturnType<typeof setTimeout>;
  private pendingClick?: GeMouseEvent;
  private warnedExternalWrite = false;

  /** Forwards the events of the core to the outputs (a separate object: no `onXxx` methods on the component). */
  private readonly listener: EventListenerIf = {
    onMouseClicked: evt => this.onMouseClicked(evt),
    onMouseMoved: evt => this.mouseMoved.emit(evt),
    onMouseDragging: evt => this.mouseDragging.emit(evt),
    onMouseDraggingEnd: evt => this.mouseDraggingEnded.emit(evt),
    onContextmenu: evt => this.contextMenu.emit(evt),
    onScroll: evt => this.scroll.emit(evt),
    onModelChanged: evt => this.modelChanged.emit(evt),
    onSelectionChanged: sm => this.selectionChanged.emit(sm),
    onFocusChanged: fm => this.focusChanged.emit(fm),
    onCheckboxChanged: rows => this.checkboxChanged.emit(rows),
    onStateChanged: evt => this.emitUnlessDestroyed(() => this.stateChanged.emit(evt)),
    onRowDragStart: evt => this.rowDragStart.emit(evt),
    onRowDragMove: evt => this.rowDragMove.emit(evt),
    onRowDragEnd: evt => this.emitUnlessDestroyed(() => this.rowDragEnd.emit(evt)),
    onBatchEditChanged: evt => this.batchEditChanged.emit(evt),
    onDetailExpandedChanged: evt => this.detailExpandedChanged.emit(evt),
    onEditingChanged: evt => this.emitUnlessDestroyed(() => this.editingChanged.emit(evt)),
    onUndoStackChanged: evt => this.emitUnlessDestroyed(() => this.undoStackChanged.emit(evt)),
  };

  constructor() {
    // 1) model / options → (re-)create the table. Runs like ngOnInit: during change detection, host in the DOM.
    effect(() => {
      const tableModel = this.tableModel();
      const tableOptions = this.tableOptions();
      untracked(() => this.createTable(tableModel, tableOptions));
    });

    // 2) loading → overlay, without re-creating the table
    effect(() => {
      const loading = this.loading();
      untracked(() => this.zone.runOutsideAngular(() => this.applyLoading(loading)));
    });

    // 3) tableApi is output-only: a value written from outside is replaced by the real API
    effect(() => {
      const value = this.tableApi();
      untracked(() => {
        const api = this.currentApi();
        if (value !== api && !this.destroyed) {
          if (isDevMode() && !this.warnedExternalWrite) {
            this.warnedExternalWrite = true;
            console.warn("guiexpert-table-signal: tableApi is set by the table; a value written from outside is replaced.");
          }
          this.tableApi.set(api);
        }
      });
    });
  }

  /** Releases the table (all listeners, observers, renderer cleanups) and sets `tableApi` to `undefined`. */
  ngOnDestroy(): void {
    // ngOnDestroy runs before the outputs are released (DestroyRef callbacks): a pending stateChanged of
    // TableScope.destroy() can still be emitted here.
    this.clearClickTimer();
    this.tableScope?.destroy();
    this.tableScope = undefined;
    this.destroyed = true;
    this.tableApi.set(undefined);
  }

  private currentApi(): TableApi | undefined {
    return this.tableScope?.getApi();
  }

  private createTable(tableModel: TableModelIf | undefined, tableOptions: TableOptionsIf): void {
    if (!this.isBrowser || this.destroyed) {
      return;
    }
    this.zone.runOutsideAngular(() => {
      this.clearClickTimer();
      this.tableScope?.destroy();
      this.tableScope = undefined;
      if (tableModel) {
        this.tableScope = new TableScope(
          this.elementRef.nativeElement, tableModel, this.domService, tableOptions, this.listener
        );
        this.tableScope.firstInit();
        this.shownByInput = false;
        this.applyLoading(untracked(() => this.loading()));
      }
    });
    this.tableApi.set(this.currentApi());   // directly the new API – no `undefined` in between
  }

  private applyLoading(loading: boolean): void {
    if (!this.tableScope) {
      return;
    }
    if (loading) {
      if (!this.shownByInput) {
        this.tableScope.showLoadingOverlay();
        this.shownByInput = true;
      }
    } else if (this.shownByInput) {
      this.tableScope.hideOverlay();
      this.shownByInput = false;
    }
  }

  private onMouseClicked(evt: GeMouseEvent): void {
    const delay = untracked(() => this.debounceMouseClickDelay());
    if (delay <= 0) {
      this.mouseClicked.emit(evt);
      return;
    }
    this.pendingClick = evt;
    this.clearClickTimer();
    this.clickTimer = setTimeout(() => {
      this.clickTimer = undefined;
      const pending = this.pendingClick;
      this.pendingClick = undefined;
      if (pending && !this.destroyed) {
        this.mouseClicked.emit(pending);
      }
    }, delay);
  }

  private clearClickTimer(): void {
    if (this.clickTimer !== undefined) {
      clearTimeout(this.clickTimer);
      this.clickTimer = undefined;
    }
  }

  /** events the core can still send while it is released (TableScope.destroy()) – never after the component */
  private emitUnlessDestroyed(emit: () => void): void {
    if (!this.destroyed) {
      emit();
    }
  }
}
