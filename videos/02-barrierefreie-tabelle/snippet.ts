import { ColumnDef, EventAdapter, SimpleDomService, TableFactory, TableOptions, TableScope, TrueFn } from "@guiexpert/table";

const tableOptions = {
  ...new TableOptions(),
  ariaLabelledBy: "title",                                       // <h1 id="title">Bestellungen</h1>
  ariaTexts: {                                                   // Ansagen auf Deutsch (Default: Englisch)
    sorted: (spalte: string) => `Sortiert nach ${spalte}`,
    filtered: (zeilen: number) => `${zeilen} Zeilen`,
  },
};
const rows = Array.from({ length: 100_000 }, (_, i) => ({ id: i + 1, kunde: `Kunde ${i % 997}`, summe: i % 1000 }));
const columnDefs = ["id", "kunde", "summe"].map(p => ColumnDef.create({ property: p, headerLabel: p.toUpperCase(), sortable: TrueFn }));
const tableModel = TableFactory.createTableModel({ rows, columnDefs });
const host = document.querySelector<HTMLDivElement>(".table-div")!;
new TableScope(host, tableModel, new SimpleDomService(), tableOptions, new EventAdapter()).firstInit();
