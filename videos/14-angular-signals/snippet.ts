// Video 14 – Angular Signals: the table as a signal (Angular 22+, @guiexpert/angular-table@22.1.100).
// Copy of apps/angular-signal-demo/src/orders.component.ts (the lines from @Component on are shown in the video and
// on /whats-new/ – check:features compares them; the demo app compiles them with ngc, strictTemplates).
import { Component, computed, effect, signal } from "@angular/core";
import { TableSignalComponent } from "@guiexpert/angular-table";
import { TableApi, TableFactory } from "@guiexpert/table";
import { createOrders } from "../../apps/angular-signal-demo/src/orders";

@Component({
  selector: "app-orders",
  imports: [TableSignalComponent],
  template: `
    <guiexpert-table-signal class="table-div" [tableModel]="model" [(tableApi)]="api" />
    <button [disabled]="!ready()" (click)="api()?.downloadExcel('orders.xlsx', 'me')">Excel</button>`
})
export class OrdersComponent {
  readonly model = TableFactory.createTableModel({ rows: createOrders(100_000), properties: ["id", "customer", "city", "total"] });
  readonly api = signal<TableApi | undefined>(undefined);
  readonly ready = computed(() => !!this.api());
  constructor() {
    effect(() => this.api()?.scrollToIndex(0, 0));
  }
}
