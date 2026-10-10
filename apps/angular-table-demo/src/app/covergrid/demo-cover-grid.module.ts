import {NgModule} from '@angular/core';

import {TableComponent} from "@guiexpert/angular-table";
import {DemoCoverGridComponent} from "./demo-cover-grid.component";
import {RouterModule} from "@angular/router";
import {HttpClientModule} from "@angular/common/http";
import {CommonModule} from "@angular/common";

import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from "@angular/material/form-field";
import {FormsModule} from "@angular/forms";
import { MatOption, MatSelect } from '@angular/material/select';

@NgModule({
  declarations: [DemoCoverGridComponent],
  imports: [
    HttpClientModule,
    CommonModule,
    TableComponent,
    RouterModule.forChild([
      {
        path: 'covergrid',
        component: DemoCoverGridComponent
      }
    ]),
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatSelect,
    MatOption

  ],
  providers: [],
  bootstrap: [DemoCoverGridComponent],
})
export class DemoCoverGridModule {
}
