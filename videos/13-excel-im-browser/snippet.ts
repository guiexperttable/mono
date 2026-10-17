import { EventAdapter, FormulaBar, SimpleDomService, SpreadsheetFactory, TableScope } from "@guiexpert/table";

const { tableModel, tableOptions } = SpreadsheetFactory.create({   // ← ein Aufruf
  data: [
    ["Posten", "Jan", "Feb", "Mär", "Summe"],
    ["Miete", 950, 950, 950, "=SUM(B2:D2)"],
    ["Essen", 410, 385, 432, "=SUM(B3:D3)"],
    ["Summe", "=SUM(B2:B3)", "=SUM(C2:C3)", "=SUM(D2:D3)", "=SUM(E2:E3)"],
  ],
});
const host = document.querySelector<HTMLDivElement>(".table-div")!;
const scope = new TableScope(host, tableModel, new SimpleDomService(), tableOptions, new EventAdapter());
scope.firstInit();
new FormulaBar(document.querySelector<HTMLDivElement>(".formula-bar")!, scope.getApi());   // optional
