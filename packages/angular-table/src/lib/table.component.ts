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
  GeModelChangeEvent, GeScrollEvent,
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

  @Output()
  contextmenu: Subject<GeMouseEvent> = new Subject<GeMouseEvent>();

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
   * @since 1.1.91
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
  }

  onScroll(evt: GeScrollEvent): void {
    this.scroll.next(evt);
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
      this.applyLoading();
      this.tableReady.next(this.tableScope.getApi());
    }
  }

  private applyLoading() {
    if (this.loading) {
      this.tableScope?.showLoadingOverlay();
    } else {
      this.tableScope?.hideOverlay();
    }
  }


}
