import { EventAdapter, SelectionModel, SimpleDomService, TableFactory, TableOptions, TableScope } from "@guiexpert/table";

declare const bestellungen: { id: number; kunde: string; summe: number }[]; // 2.000.000 Zeilen

const tableModel = TableFactory.createTableModel({
  rows: bestellungen,
  properties: ["id", "kunde", "summe"],
  rowNumbersVisible: true                                     // ← die eine Zeile
});
const selectionModel = new SelectionModel("range", "multi");  // Klick auf die Nummer = ganze Zeile
const tableOptions = { ...new TableOptions(), getSelectionModel: () => selectionModel };

const host = document.querySelector<HTMLDivElement>(".table-div")!;
new TableScope(host, tableModel, new SimpleDomService(), tableOptions, new EventAdapter()).firstInit();
