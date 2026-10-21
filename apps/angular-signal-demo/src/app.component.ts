// Playground of TableSignalComponent: model switch, loading, events – everything as signals, zoneless.
import { Component, computed, signal } from "@angular/core";
import { TableSignalComponent } from "@guiexpert/angular-table";
import { TableApi, TableFactory, TableModelIf } from "@guiexpert/table";
import type { GeMouseEvent } from "@guiexpert/table";
import { createOrders } from "./orders";
import { OrdersComponent } from "./orders.component";

const PROPERTIES = ["id", "customer", "city", "total"];

function ordersModel(count: number): TableModelIf {
  return TableFactory.createTableModel({ rows: createOrders(count), properties: PROPERTIES, rowNumbersVisible: true });
}

@Component({
  selector: "app-root",
  imports: [TableSignalComponent, OrdersComponent],
  template: `
    <header>
      <h1>&lt;guiexpert-table-signal&gt; <small>Angular 22 · zoneless · signals</small></h1>
      <nav>
        <button [class.active]="view() === 'playground'" (click)="view.set('playground')">Playground</button>
        <button [class.active]="view() === 'video'" (click)="view.set('video')">Video snippet</button>
      </nav>
    </header>

    @if (view() === 'playground') {
      <section class="toolbar">
        <button (click)="rowCount.set(1_000)">1,000 rows</button>
        <button (click)="rowCount.set(100_000)">100,000 rows</button>
        <button (click)="rowCount.set(2_000_000)">2,000,000 rows</button>
        <label><input type="checkbox" [checked]="loading()" (change)="loading.set(!loading())"> loading</label>
        <button [disabled]="!api()" (click)="api()?.downloadExcel('orders.xlsx', 'GuiExpert')">Excel</button>
        @if (show()) {
          <button (click)="show.set(false)">Remove table</button>
        } @else {
          <button (click)="show.set(true)">Show table</button>
        }
      </section>

      <section class="status" aria-live="polite">
        <span>tableApi: <b>{{ api() ? 'set' : 'undefined' }}</b></span>
        <span>tables built: <b>{{ built() }}</b></span>
        <span>rows: <b>{{ rowCount().toLocaleString('en') }}</b></span>
        <span>visible rows: <b>{{ visibleRows() }}</b></span>
        <span>clicked: <b>{{ clicked() }}</b></span>
        <span>context menu: <b>{{ contextMenu() }}</b></span>
      </section>

      @if (show()) {
        <guiexpert-table-signal class="table-div"
          [tableModel]="model()" [loading]="loading()"
          [(tableApi)]="api"
          (tableApiChange)="onApi($event)"
          (mouseClicked)="onClicked($event)"
          (contextMenu)="onContextMenu($event)" />
      }
    } @else {
      <app-orders />
    }`,
})
export class AppComponent {
  readonly view = signal<"playground" | "video">("playground");
  readonly rowCount = signal(100_000);
  readonly model = computed(() => ordersModel(this.rowCount()));   // a new model → the table is re-created
  readonly loading = signal(false);
  readonly show = signal(true);

  readonly api = signal<TableApi | undefined>(undefined);
  readonly built = signal(0);
  readonly visibleRows = computed(() => this.api()?.getDisplayedRowCount() ?? 0);
  readonly clicked = signal("–");
  readonly contextMenu = signal("–");

  onApi(api: TableApi | undefined) {
    if (api) {
      this.built.update(n => n + 1);
    }
  }

  onClicked(evt: GeMouseEvent) {
    this.clicked.set(`${evt.areaIdent} row ${evt.rowIndex}, column ${evt.columnIndex}`);
  }

  onContextMenu(evt: GeMouseEvent) {
    evt.originalEvent?.preventDefault();             // no browser menu
    this.contextMenu.set(`row ${evt.rowIndex} (once per right click)`);
  }
}
