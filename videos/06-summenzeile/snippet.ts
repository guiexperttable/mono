import { EventAdapter, SelectionModel, SimpleDomService, TableFactory, TableOptions, TableScope } from "@guiexpert/table";

declare const bestellungen: { id: number; kunde: string; menge: number; summe: number }[], statusBar: HTMLElement;

const tableModel = TableFactory.createTableModel({
  rows: bestellungen,                                        // 1.000.000 Zeilen
  properties: ["id", "kunde", "menge", "summe"],
  footerAggregates: { menge: "sum", summe: "sum" }           // ← die eine Zeile
});
const selectionModel = new SelectionModel("range", "multi");
const tableOptions = { ...new TableOptions(), getSelectionModel: () => selectionModel };
const listener = new EventAdapter();
listener.onSelectionChanged = () => statusBar.textContent = `Σ ${api.getSelectionAggregates().sum}`;
const host = document.querySelector<HTMLDivElement>(".table-div")!;
const api = new TableScope(host, tableModel, new SimpleDomService(), tableOptions, listener).firstInit().getApi();
