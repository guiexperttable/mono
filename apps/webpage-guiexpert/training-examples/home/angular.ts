import { Component } from "@angular/core";
import { TableComponent } from "@guiexpert/angular-table";   // styles included
import { GeMouseEvent, TableFactory, TableOptions } from "@guiexpert/table";
import { orders } from "./orders";

@Component({
  selector: "app-order-table",
  imports: [TableComponent],                                   // Angular < 19: standalone: true
  template: `
    <guiexpert-table style="display: block; height: 500px"
      [tableModel]="tableModel" [tableOptions]="tableOptions"
      (mouseClicked)="onClick($event)"></guiexpert-table>`
})
export class OrderTableComponent {
  readonly tableModel = TableFactory.createTableModel({
    rows: orders,
    properties: ["id", "customer", "city", "total"]
  });
  readonly tableOptions = new TableOptions();

  onClick(evt: GeMouseEvent): void { console.info("row", evt.rowIndex); }
}
