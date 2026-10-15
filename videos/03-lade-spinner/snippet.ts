import { EventAdapter, SimpleDomService, TableFactory, TableOptions, TableScope } from "@guiexpert/table";

const tableModel = TableFactory.createTableModel({ rows: [], properties: ["id", "kunde", "summe"] });
const tableOptions = { ...new TableOptions(), overlayOptions: { noRowsText: "Noch keine Bestellungen" } };
const host = document.querySelector<HTMLDivElement>(".table-div")!;
const scope = new TableScope(host, tableModel, new SimpleDomService(), tableOptions, new EventAdapter());
scope.firstInit();
const tableApi = scope.getApi();

tableApi.showLoadingOverlay("Lädt…");                       // CSS-Spinner, kein Bild, keine Library
const rows = await (await fetch("/api/orders")).json();
tableApi.setRows(rows);
tableApi.repaintHard();
tableApi.hideOverlay();                                     // leer? → "Noch keine Bestellungen"
