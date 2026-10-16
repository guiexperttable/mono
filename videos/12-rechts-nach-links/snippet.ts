import { EventAdapter, SimpleDomService, TableFactory, TableOptions, TableOptionsIf, TableScope } from "@guiexpert/table";

const rows = [
  { stadt: "الرياض", land: "السعودية", umsatz: 1250000 },
  { stadt: "دبي", land: "الإمارات", umsatz: 980000 },
];
const tableModel = TableFactory.createTableModel({
  rows, properties: ["stadt", "land", "umsatz"],
  fixedLeftColumnCount: 1                                 // „links“ = Anfang → steht RECHTS
});
const tableOptions: TableOptionsIf = { ...new TableOptions(),
  direction: "rtl" };                                     // ← eine Option (oder "auto")
const host = document.querySelector<HTMLDivElement>(".table-div")!;
new TableScope(host, tableModel, new SimpleDomService(), tableOptions, new EventAdapter()).firstInit();
