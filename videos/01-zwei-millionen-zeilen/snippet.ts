import { AreaModel, ColumnDef, EventAdapter, SimpleDomService, TableFactory, TableOptions, TableScope, px120, px200 } from "@guiexpert/table";

class TwoMillionRows extends AreaModel {                       // no array – values are computed on demand
  override getRowCount() { return 2_000_000; }
  override getRowHeight() { return 34; }
  override getValueAt(row: number, col: number) { return col === 0 ? `#${row}` : row * 7; }
}

const tableModel = TableFactory.createTableModel({
  bodyAreaModel: new TwoMillionRows(),
  columnDefs: [new ColumnDef("id", "ID", px120), new ColumnDef("value", "Value", px200)]
});
const host = document.querySelector<HTMLDivElement>(".table-div")!;
new TableScope(host, tableModel, new SimpleDomService(), new TableOptions(), new EventAdapter()).firstInit();
