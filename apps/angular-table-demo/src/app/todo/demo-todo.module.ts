import {NgModule} from '@angular/core';

import {TableComponent} from "@guiexpert/angular-table";
import {DemoTodoComponent} from "./demo-todo.component";
import {RouterModule} from "@angular/router";
import {HttpClientModule} from "@angular/common/http";
import {CommonModule} from "@angular/common";

@NgModule({
  declarations: [DemoTodoComponent],
  imports: [
    HttpClientModule,
    CommonModule,
    TableComponent,
    RouterModule.forChild([
      {
        path: "todo",
        component: DemoTodoComponent
      }
    ]),
  ],
  providers: [],
  bootstrap: [DemoTodoComponent],
})
export class DemoTodoModule {
}
