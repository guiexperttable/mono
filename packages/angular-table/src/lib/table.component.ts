import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  SimpleChanges,
  ViewEncapsulation
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { debounceTime, Subject, takeWhile } from "rxjs";
import {
  EventListenerIf, FocusModelIf,
  GeBatchEditEvent, GeDetailEvent, GeEditEvent, GeModelChangeEvent, GeRowDragEvent, GeScrollEvent, GeStateChangeEvent, GeUndoEvent,
  GeMouseEvent, SelectionModelIf,
  TableApi,
  TableModelIf,
  TableOptions,
  TableOptionsIf,
  TableScope
} from '@guiexpert/table';
import { DomService } from "./service/dom-service";


@Component({
  selector: "guiexpert-table",
  standalone: true,
  imports: [CommonModule],
  providers: [DomService],
  template: "",
  styleUrls: [
    "./table.component.css"
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent implements OnInit, OnChanges, OnDestroy, EventListenerIf {

  @Output()
  tableReady = new Subject<TableApi>();

  @Output()
  scroll: Subject<GeScrollEvent> = new Subject<GeScrollEvent>();

  @Output()
  mouseMoved: Subject<GeMouseEvent> = new Subject<GeMouseEvent>();

  @Output()
  mouseDragging: Subject<GeMouseEvent> = new Subject<GeMouseEvent>();

  @Output()
  mouseDraggingEnded: Subject<GeMouseEvent> = new Subject<GeMouseEvent>();

  /**
   * Right click / context menu key on the table.
   *
   * @deprecated since 1.1.101 – use `contextMenu`. Angular binds an output named like a DOM event to the output
   * **and** to the native event of the host element: `(contextmenu)="…"` runs twice, first with the browser's
   * `MouseEvent`, then with the `GeMouseEvent`. Kept for compatibility.
   */
  @Output()
  contextmenu: Subject<GeMouseEvent> = new Subject<GeMouseEvent>();

  /**
   * Right click / context menu key on the table – exactly once per event, always a `GeMouseEvent`
   * (replaces `contextmenu`, which also receives the native `MouseEvent`). Call `evt.originalEvent?.preventDefault()`
   * to suppress the browser menu.
   *
   * @example
   * ```html
   * <guiexpert-table [tableModel]="tableModel" (contextMenu)="onContextMenu($event)" />
   * ```
   *
   * @since 1.1.101
   */
  @Output()
  contextMenu: Subject<GeMouseEvent> = new Subject<GeMouseEvent>();

  @Output()
  mouseClicked: Subject<GeMouseEvent> = new Subject<GeMouseEvent>();

  @Output()
  modelChanged: Subject<GeModelChangeEvent> = new Subject<GeModelChangeEvent>();

  @Output()
  selectionChanged: Subject<SelectionModelIf> = new Subject<SelectionModelIf>();

  @Output()
  focusChanged: Subject<FocusModelIf> = new Subject<FocusModelIf>();

  @Output()
  checkboxChanged: Subject<any[]> = new Subject<any[]>();

  /**
   * The state changed (column layout, sorting, scroll position, tree, checked/selected rows …) – once after the
   * changes settled. Save `evt.state` and pass it back as `tableOptions.initialState`.
   *
   * @since 1.1.92
   */
  @Output()
  stateChanged: Subject<GeStateChangeEvent> = new Subject<GeStateChangeEvent>();

  /**
   * Row drag (handles via `ColumnDef.rowDrag`): a drag started. `evt.preventDefault()` cancels it.
   *
   * @since 1.1.95
   */
  @Output()
  rowDragStart: Subject<GeRowDragEvent> = new Subject<GeRowDragEvent>();

  /**
   * Row drag: the drop target changed. `evt.preventDefault()` marks it as invalid.
   *
   * @since 1.1.95
   */
  @Output()
  rowDragMove: Subject<GeRowDragEvent> = new Subject<GeRowDragEvent>();

  /**
   * Row drag: dropped (`evt.type` "end", managed: after the move) or cancelled ("cancel"). Save the new order here.
   *
   * @since 1.1.95
   */
  @Output()
  rowDragEnd: Subject<GeRowDragEvent> = new Subject<GeRowDragEvent>();

  /**
   * Batch edit: values were marked, set back, written or discarded – e.g. to enable a "Save" button.
   *
   * @since 1.1.96
   */
  @Output()
  batchEditChanged: Subject<GeBatchEditEvent> = new Subject<GeBatchEditEvent>();

  /**
   * Master/detail: a detail row was expanded or collapsed.
   *
   * @since 1.1.97
   */
  @Output()
  detailExpandedChanged: Subject<GeDetailEvent> = new Subject<GeDetailEvent>();

  /**
   * The cell editor opened, its text changed (Excel-style editing), it committed or it was cancelled.
   *
   * @since 1.1.99
   */
  @Output()
  editingChanged: Subject<GeEditEvent> = new Subject<GeEditEvent>();

  @Input()
  tableModel?: TableModelIf;

  @Input()
  tableOptions: TableOptionsIf = new TableOptions();

  @Input()
  debounceMouseClickDelay: number = 150;

  /**
   * `true` shows the loading overlay ("Loading…" with a CSS spinner) over the body, `false` hides it
   * (`TableApi.showLoadingOverlay()` / `hideOverlay()`). Changing it does **not** re-create the table;
   * a re-created table (new model) keeps showing it. Texts: `tableOptions.overlayOptions`.
   *
   * @since 1.1.92
   */
  @Input()
  loading: boolean = false;

  private debounceMouseClick: Subject<GeMouseEvent> = new Subject<GeMouseEvent>();

  private tableScope?: TableScope;
  private alive = true;
  private initialized = false;


  constructor(
    private readonly renderer: Renderer2,
    private readonly elementRef: ElementRef,
    private readonly zone: NgZone,
    private readonly domService: DomService
  ) {
  }

  onSelectionChanged(model: SelectionModelIf): void {
    this.selectionChanged.next(model);
  }

  onFocusChanged(model: FocusModelIf): void {
    this.focusChanged.next(model);
  }

  onContextmenu(evt: GeMouseEvent): void {
    this.contextmenu.next(evt);
    this.contextMenu.next(evt);
  }

  onScroll(evt: GeScrollEvent): void {
    this.scroll.next(evt);
  }

  onStateChanged(evt: GeStateChangeEvent): void {
    this.stateChanged.next(evt);
  }

  onRowDragStart(evt: GeRowDragEvent): void {
    this.rowDragStart.next(evt);
  }

  onRowDragMove(evt: GeRowDragEvent): void {
    this.rowDragMove.next(evt);
  }

  onRowDragEnd(evt: GeRowDragEvent): void {
    this.rowDragEnd.next(evt);
  }

  onBatchEditChanged(evt: GeBatchEditEvent): void {
    this.batchEditChanged.next(evt);
  }

  onDetailExpandedChanged(evt: GeDetailEvent): void {
    this.detailExpandedChanged.next(evt);
  }

  onEditingChanged(evt: GeEditEvent): void {
    this.editingChanged.next(evt);
  }

  /**
   * The undo history changed (undo and redo) – to enable and label own buttons.
   *
   * @since 1.1.99
   */
  @Output()
  undoStackChanged: Subject<GeUndoEvent> = new Subject<GeUndoEvent>();

  onUndoStackChanged(evt: GeUndoEvent): void {
    this.undoStackChanged.next(evt);
  }

  onMouseMoved(evt: GeMouseEvent): void {
    this.mouseMoved.next(evt);
  }

  // will be called by table-scope:
  onMouseClicked(evt: GeMouseEvent): void {
    this.debounceMouseClick.next(evt);
  }

  onCheckboxChanged(arr: any[]): void {
    this.checkboxChanged.next(arr);
  }

  onModelChanged(evt: GeModelChangeEvent): void {
    this.modelChanged.next(evt);
  }

  /**
   * A new `tableModel` or `tableOptions` object re-creates the table (the previous one is released
   * with `TableScope.destroy()`). The first values are handled by `ngOnInit`.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (this.initialized && (changes["tableModel"] || changes["tableOptions"])) {
      this.initModel(); // applies `loading` to the new table
    } else if (this.initialized && changes["loading"]) {
      this.zone.runOutsideAngular(() => this.applyLoading());
    }
  }

  ngOnInit(): void {
    this.initialized = true;
    this.initModel();
    this.debounceMouseClick
      .pipe(
        debounceTime(this.debounceMouseClickDelay),
        takeWhile(() => this.alive)
      )
      .subscribe((value) => {
        this.zone.run(() => {
          this.mouseClicked.next(value);
        });
      });
  }

  ngOnDestroy(): void {
    this.alive = false;
    this.tableScope?.destroy();
    this.tableScope = undefined;
  }


  onMouseDragging(evt: GeMouseEvent): void {
    this.mouseDragging.next(evt);
  }

  onMouseDraggingEnd(evt: GeMouseEvent): void {
    this.mouseDraggingEnded.next(evt);
  }


  private initModel() {
    this.zone.runOutsideAngular(this.init.bind(this));
  }

  private init() {
    this.tableScope?.destroy();
    this.tableScope = undefined;
    if (this.tableModel) {
      this.tableScope = new TableScope(
        this.elementRef.nativeElement, this.tableModel, this.domService, this.tableOptions, this
      );
      this.tableScope.firstInit();
      this.shownByInput = false;
      this.applyLoading();
      this.tableReady.next(this.tableScope.getApi());
    }
  }

  /** the overlay was shown by the `loading` input: `false` hides only that one (not one the app showed itself) */
  private shownByInput = false;

  private applyLoading() {
    if (this.loading) {
      this.tableScope?.showLoadingOverlay();
      this.shownByInput = true;
    } else if (this.shownByInput) {
      this.tableScope?.hideOverlay();
      this.shownByInput = false;
    }
  }


}
