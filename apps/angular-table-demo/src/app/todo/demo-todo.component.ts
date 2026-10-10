import { Component } from '@angular/core';

import {
  CheckboxBooleanPropertyCellRenderer,
  ColumnDef,
  ColumnDefIf, DateToLocaleDateCellRenderer, editInputPipeForNumber, px100,
  px200, px50, SelectCellRenderer,
  TableFactory,
  TableModelIf,
  TableOptions,
  TableOptionsIf, ValueLabel
} from '@guiexpert/table';
import { Todo } from './todo';
import { TodoIf } from './todo.if';

@Component({
  selector: 'demo-todo',
  templateUrl: './demo-todo.component.html',
  styleUrls: ['./demo-todo.component.css']
})
export class DemoTodoComponent {

  tableModel?: TableModelIf;
  tableOptions: TableOptionsIf = {
    ...new TableOptions(),
    hoverColumnVisible: false,
    defaultRowHeights: {
      header: 34,
      body: 34,
      footer: 0
    }
  };

  public rows: TodoIf[] = [
    new Todo(false, 1, 'Dentist Appointment', ':-(', 12, new Date(), 'medium'),
    new Todo(true, 2, 'Grocery Shopping', 'Buy milk, eggs, and bread', 24, new Date(), 'high'),
    new Todo(false, 3, 'Team Meeting', 'Discuss project progress', 36, new Date(), 'low'),
    new Todo(true, 4, 'Workout Session', 'Leg day at the gym', 48, new Date(), 'medium'),
    new Todo(false, 5, 'Call Mom', 'Weekly check-in call :)', 60, new Date(), 'high'),
    new Todo(false, 6, 'Pay Bills', 'Electricity and internet bills', 72, new Date(), 'urgent'),
    new Todo(true, 7, 'Doctor Checkup', 'Annual health checkup', 84, new Date(), 'medium'),
    new Todo(false, 8, 'Read a Book', 'Finish reading the current novel', 96, new Date(), 'low'),
    new Todo(true, 9, 'Office Presentation', 'Prepare slides for client meeting', 108, new Date(), 'urgent'),
    new Todo(false, 10, 'Plan Vacation', 'Research and book tickets', 120, new Date(), 'medium')
  ];


  constructor() {
    const columnDefs: ColumnDefIf[] = [
      ColumnDef.create({property:'checked', headerLabel: ' ', width:px50, bodyRenderer: new CheckboxBooleanPropertyCellRenderer<TodoIf>('checked'),}),
      new ColumnDef('id', 'ID', px50),
      ColumnDef.create({property: 'title', headerLabel:'Title',width: px200, editable: ()=>true}),
      ColumnDef.create({property: 'description', headerLabel:'Description',width: px200, editable: ()=>true}),
      ColumnDef.create({property: 'flagId', headerLabel:'Flag',width: px200, editable: ()=>true, editInputPipe: editInputPipeForNumber}),
      ColumnDef.create({property: 'dueDate', headerLabel:'Due Date',width: px200, editable: ()=>true, bodyRenderer: new DateToLocaleDateCellRenderer()}),
      ColumnDef.create({
        property: 'priority', headerLabel:'Priority',width: px200, editable: ()=>true,
        getEditRenderer: (_rowIndex: number, _columnIndex: number) => new SelectCellRenderer([
          new ValueLabel('low', 'Low'),
          new ValueLabel('medium', 'Medium'),
          new ValueLabel('high', 'High'),
          new ValueLabel('urgent', 'Urgent'),
        ])
      }),
    ];

    this.tableModel = TableFactory.createTableModel({
      rows: this.rows,
      columnDefs: columnDefs,
      tableOptions: this.tableOptions,
      fixedLeftColumnCount: 1
    });
  }


}
