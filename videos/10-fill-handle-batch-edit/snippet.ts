import { ColumnDef, EventAdapter, SelectionModel, SimpleDomService, TableFactory, TableOptions, TableScope, TrueFn } from "@guiexpert/table";

declare const preise: { artikel: string; preis: number; ab: string }[];      // 1.000 Artikel
declare const speichern: HTMLButtonElement;

const columnDefs = ["artikel", "preis", "ab"].map(property => ColumnDef.create({ property, headerLabel: property, editable: TrueFn }));
const auswahl = new SelectionModel("range", "multi");
const tableOptions = { ...new TableOptions(), getSelectionModel: () => auswahl,
  fillHandle: true,                                       // ← das Kästchen an der Auswahl
  batchEdit: true };                                      // ← erst sammeln, dann speichern
const host = document.querySelector<HTMLDivElement>(".table-div")!;
const api = new TableScope(host, TableFactory.createTableModel({ rows: preise, columnDefs }), new SimpleDomService(), tableOptions, new EventAdapter()).firstInit().getApi();
speichern.onclick = async () => {
  await fetch("/api/preise", { method: "PATCH", body: JSON.stringify(api.getPendingChanges()) });
  api.commitBatchEdit();                                  // ← jetzt erst in die Daten
};
