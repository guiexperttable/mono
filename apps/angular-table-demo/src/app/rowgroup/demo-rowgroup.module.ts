import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { TableComponent } from "@guiexpert/angular-table";
import { DemoRowgroupComponent } from "./demo-rowgroup.component";

@NgModule({
  declarations: [DemoRowgroupComponent],
  imports: [
    TableComponent,
    MatButtonModule,
    RouterModule.forChild([
      {
        path: "rowgroup",
        component: DemoRowgroupComponent
      }
    ])
  ],
})
export class DemoRowgroupModule {
}
