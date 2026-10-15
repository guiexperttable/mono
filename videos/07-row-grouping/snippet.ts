import { RowGroupFactory, SimpleDomService, TableOptions, TableScope, EventAdapter } from "@guiexpert/table";

declare const bestellungen: { land: string; stadt: string; produkt: string; menge: number; summe: number }[];
declare const auswahl: HTMLSelectElement;

const tableModel = RowGroupFactory.createTableModel({
  rows: bestellungen,                                     // 50.000 flache Zeilen
  groupBy: ["land", "stadt"],                             // ← gruppieren
  aggregations: { menge: "sum", summe: "sum" },           // ← Summen je Gruppe + Gesamtzeile
  expanded: 0                                             // alle Gruppen zu
});
const host = document.querySelector<HTMLDivElement>(".table-div")!;
const api = new TableScope(host, tableModel, new SimpleDomService(), new TableOptions(), new EventAdapter())
  .firstInit().getApi();
auswahl.onchange = () => api.setRowGroupBy(auswahl.value.split(","));   // umgruppieren, live
