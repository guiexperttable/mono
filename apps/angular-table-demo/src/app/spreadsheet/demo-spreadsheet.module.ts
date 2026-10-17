import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { TableComponent } from "@guiexpert/angular-table";
import { DemoSpreadsheetComponent } from "./demo-spreadsheet.component";

@NgModule({
  declarations: [DemoSpreadsheetComponent],
  imports: [
    TableComponent,
    MatButtonModule,
    RouterModule.forChild([
      {
        path: "spreadsheet",
        component: DemoSpreadsheetComponent
      }
    ])
  ],
})
export class DemoSpreadsheetModule {
}
