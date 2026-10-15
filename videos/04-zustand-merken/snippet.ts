import { AutoRestoreOptions, ColumnDef, EventAdapter, SimpleDomService, TableFactory, TableOptions, TableScope, TrueFn } from "@guiexpert/table";
const rows = await (await fetch("/api/orders")).json();
const columnDefs = ["id", "kunde", "stadt", "summe"].map(property => ColumnDef.create({ property, headerLabel: property, sortable: TrueFn }));
const tableOptions = {
  ...new TableOptions(),
  autoRestoreOptions: {
    ...new AutoRestoreOptions(),
    getStorageKeyFn: () => "bestellungen",        // ein Schlüssel pro Tabelle
    autoRestoreColumnLayout: true,                // Breite, Reihenfolge, ausgeblendete Spalten
    autoRestoreSortingState: true
  }
};
const host = document.querySelector<HTMLDivElement>(".table-div")!;
const tableModel = TableFactory.createTableModel({ rows, columnDefs });
new TableScope(host, tableModel, new SimpleDomService(), tableOptions, new EventAdapter()).firstInit();
