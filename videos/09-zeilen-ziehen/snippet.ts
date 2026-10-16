import { EventAdapter, GeRowDragEvent, SimpleDomService, TableFactory, TableOptions, TableScope } from "@guiexpert/table";

declare const aufgaben: { titel: string; wer: string; stunden: number }[];

const tableModel = TableFactory.createTableModel({
  rows: aufgaben,                                         // 10.000 Aufgaben
  rowNumbersVisible: true,                                // „#“ = Position
  rowDrag: true                                           // ← ein Griff pro Zeile
});
const listener = new EventAdapter();
listener.onRowDragEnd = (evt: GeRowDragEvent) => {        // ← nach dem Ablegen
  if (evt.moved) console.log(`${evt.rows[0].titel} → Platz ${evt.toIndex + 1}`);
};
const host = document.querySelector<HTMLDivElement>(".table-div")!;
new TableScope(host, tableModel, new SimpleDomService(), new TableOptions(), listener).firstInit();
