import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  AutoRestoreOptions,
  CellRendererIf,
  CoverGridFactory,
  CoverGridTableModel,
  GeFilterService,
  TableApi,
  TableOptions,
  TableOptionsIf
} from '@guiexpert/table';
import { debounceTime, takeWhile } from 'rxjs';
import { ThumbsDim } from './thumbs-dim';
import { RenderWrapperFactory } from '@guiexpert/angular-table';
import { DemoCoverGridRendererComponent } from './demo-cover-thumb-renderer.component';


@Component({
  selector: 'demo-cover-grid',
  templateUrl: './demo-cover-grid.component.html',
  styleUrls: ['./demo-cover-grid.component.css']
})
export class DemoCoverGridComponent implements OnInit, OnDestroy {

  @ViewChild('viewportdiv', { static: true }) parentDiv: ElementRef | undefined;


  thumbsDims: ThumbsDim[] = [
    new ThumbsDim(100, 150),
    new ThumbsDim(200, 300),
    new ThumbsDim(400, 600)
  ];
  thumbsDim: ThumbsDim = this.thumbsDims[1];


  tableOptions: TableOptionsIf = {
    ...new TableOptions(),

    horizontalBorderVisible: false,
    verticalBorderVisible: false,
    footerSeparatorBorderVisible: false,
    headerSeparatorBorderVisible: false,
    fixedEastSeparatorBorderVisible: false,
    fixedWestSeparatorBorderVisible: false,
    tableTopBorderVisible: false,
    tableBottomBorderVisible: false,

    hoverColumnVisible: false,
    hoverRowVisible: false,
    defaultRowHeights: {
      header: 0,
      body: this.thumbsDim.height,
      footer: 0
    },
    externalFilterFunction: this.filterFn.bind(this),
    autoRestoreOptions: {
      ...new AutoRestoreOptions<string>(),
      getStorageKeyFn: () => 'comicCommanderGrid',
      autoRestoreCollapsedExpandedState: false,
      autoRestoreScrollPosition: true,
      autoRestoreSortingState: false,
      autoRestoreSelectedState: false
    }
  };
  tableModel?: CoverGridTableModel<string>;

  filterText = '';
  files: string[] = [];

  private width = 0;
  private cellRenderer: CellRendererIf;
  private filterService = new GeFilterService();

  private tableApi?: TableApi;
  private filter$ = new EventEmitter<number>();
  private alive = true;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly rwf: RenderWrapperFactory
  ) {

    this.cellRenderer = this.rwf.create(DemoCoverGridRendererComponent, this.cdr);
    for (let i = 1; i < 201; i++) {
      const num = ('' + i).padStart(3, '0');
      this.files.push(`/assets/demodata/covergrid/${num}.svg`);
    }
  }

  ngOnInit(): void {
    this.filter$
      .pipe(
        takeWhile(() => this.alive),
        debounceTime(400)
      )
      .subscribe(() => {
        console.info('this.filterText', this.filterText);
        this.tableApi?.externalFilterChanged();
      });
    this.width = this.parentDiv?.nativeElement?.offsetWidth;
    this.createTableModel();
  }


  ngOnDestroy(): void {
    this.alive = false;
  }

  onKeyup() {
    this.filter$.next(Date.now());
  }


  onTableReady($event: TableApi) {
    this.tableApi = $event;
    if (this.filterText) {
      this.tableApi?.externalFilterChanged();
    }
  }

  @HostListener('window:resize')
  reCreateTableModel(): void {
    this.width = this.parentDiv?.nativeElement?.offsetWidth;
    if (this.tableModel) {
      this.tableModel.setParentWidth(this.width);
      this.tableModel.bodyModel.width = this.width;

      this.tableModel.recalcHeightAndPadding();
      this.tableApi?.repaintHard();
    }
  }

  onDimensionChanged() {
    if (this.tableModel) {
      this.tableModel.bodyModel.coverWidth = this.thumbsDim.width;
      this.tableModel.bodyModel.coverHeight = this.thumbsDim.height;
      this.tableModel.recalcHeightAndPadding();
      this.tableApi?.repaintHard();
    }
  }

  private filterFn(v: string, _index: number, _array: string[]) {
    return v.includes(this.filterText);
    // better solution for complex query strings:  return this.filterService.filterPredict<string>(v, this.filterText);
  }

  private createTableModel() {
    if (this.files) {
      if (!this.tableModel) {
        console.info('createTableModel : items:', `${this.files.length}, w:${this.width}px`);
        this.tableModel = CoverGridFactory.createCoverGridModel(
          this.files,
          this.cellRenderer,
          this.thumbsDim.width,
          this.thumbsDim.height,
          this.width,
          64
        );

        if (this.tableApi) {
          this.tableApi.externalFilterChanged();
        }
      }
    }
  }

}

