import { PivotFactory, SimpleDomService, TableOptions, TableScope, EventAdapter } from "@guiexpert/table";

declare const bestellungen: { land: string; stadt: string; datum: string; summe: number }[];
declare const auswahl: HTMLSelectElement;
const tableModel = PivotFactory.createTableModel({
  rows: bestellungen,                                          // 50.000 flache Zeilen
  rowFields: ["land", "stadt"],                                // ← Zeilen: Land › Stadt
  columnFields: [{ name: "jahr", value: b => b.datum.slice(0, 4) }],   // ← Spalten: aus den Daten
  values: ["summe"],                                           // ← Summe je Zelle + Gesamt
  expanded: 0
});
const host = document.querySelector<HTMLDivElement>(".table-div")!;
const api = new TableScope(host, tableModel, new SimpleDomService(), new TableOptions(), new EventAdapter())
  .firstInit().getApi();
auswahl.onchange = () => api.setPivotConfig({ columnFields: [auswahl.value] });   // neu pivotieren, live
