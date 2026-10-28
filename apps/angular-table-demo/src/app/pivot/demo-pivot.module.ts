import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { TableComponent } from "@guiexpert/angular-table";
import { DemoPivotComponent } from "./demo-pivot.component";

@NgModule({
  declarations: [DemoPivotComponent],
  imports: [
    TableComponent,
    MatButtonModule,
    RouterModule.forChild([
      {
        path: "pivot",
        component: DemoPivotComponent
      }
    ])
  ],
})
export class DemoPivotModule {
}
