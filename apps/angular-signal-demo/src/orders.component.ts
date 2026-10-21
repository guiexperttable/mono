// The component of the video "Angular Signals: die Tabelle als Signal" (videos/14-angular-signals/snippet.ts).
import { Component, computed, effect, signal } from "@angular/core";
import { TableSignalComponent } from "@guiexpert/angular-table";
import { TableApi, TableFactory } from "@guiexpert/table";
import { createOrders } from "./orders";

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
