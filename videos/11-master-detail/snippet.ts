import { EventAdapter, SimpleDomService, TableFactory, TableOptions, TableOptionsIf, TableScope } from "@guiexpert/table";

declare const bestellungen: { nr: string; kunde: string; summe: number; positionen: { artikel: string; menge: number }[] }[];

const tableModel = TableFactory.createTableModel({ rows: bestellungen, properties: ["nr", "kunde", "summe"], fixedLeftColumnCount: 1 });
const tableOptions: TableOptionsIf = { ...new TableOptions(),
  masterDetail: {                                         // ← eine Option
    detailHeight: 200,
    detailRenderer: (_div, bestellung, ctx) => {
      ctx.createTable({                                   // ← zweite Tabelle, räumt sich selbst auf
        tableModel: TableFactory.createTableModel({ rows: bestellung.positionen, properties: ["artikel", "menge"] }) });
    } } };
const host = document.querySelector<HTMLDivElement>(".table-div")!;
new TableScope(host, tableModel, new SimpleDomService(), tableOptions, new EventAdapter()).firstInit();
