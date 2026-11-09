import { TableApi, TableFactory } from "@guiexpert/table";

type Line = { time: string; level: string; text: string };
const tableModel = TableFactory.createTableModel({ rows: [] as Line[], properties: ["time", "level", "text"] });
declare const tableApi: TableApi;        // from new TableScope(…).getApi() – see demo.html

let frozen = false;                      // the "Freeze scroll" button
function onLines(lines: Line[]) {        // once per animation frame
  tableApi.appendRows(lines, {
    follow: frozen ? false : "auto",     // at the end → stay at the end
    maxRows: 1_000_000                   // ring buffer
  });
}
const scrollToEnd = () => { frozen = false; tableApi.repaintHard({ py: Number.MAX_SAFE_INTEGER }); };
export { tableModel, onLines, scrollToEnd };
