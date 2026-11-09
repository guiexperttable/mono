// Chapter 32 – rows that keep coming (a log tail, since 1.1.108): tableApi.appendRows appends in place, keeps
// selection and position, follows the end ("tail -f") or freezes, and drops the oldest rows (ring buffer).
import {
  EventAdapter, SimpleDomService, TableFactory, TableOptions, TableScope, SelectionModel,
  type TableApi, type TableOptionsIf
} from "@guiexpert/table";
import { type DemoContext, fmt } from "./shared/demo";

interface LogLine { id: number; level: "INFO" | "WARN" | "ERROR"; text: string }

let nextId = 1;
function newLines(count: number): LogLine[] {
  const lines: LogLine[] = [];
  for (let i = 0; i < count; i++) {
    const id = nextId++;
    const level = id % 17 === 0 ? "ERROR" : id % 7 === 0 ? "WARN" : "INFO";
    lines.push({ id, level, text: `GET /api/orders/${(id * 7919) % 10_000} ${level === "ERROR" ? 500 : 200}` });
  }
  return lines;
}

export default function (ctx: DemoContext) {
  // #region table
  const tableModel = TableFactory.createTableModel({ rows: [] as LogLine[], properties: ["id", "level", "text"] });
  const tableOptions: TableOptionsIf = {
    ...new TableOptions(),
    getSelectionModel: () => new SelectionModel("range", "multi"),
    overlayOptions: { noRowsText: "Waiting for log lines…" }
  };
  // #endregion table
  const scope = new TableScope(ctx.host, tableModel, new SimpleDomService(), tableOptions, new EventAdapter());
  scope.firstInit();
  const tableApi: TableApi = scope.getApi();

  // #region append
  let frozen = false;
  let newBelow = 0;

  function onLines(lines: LogLine[]) {          // e.g. from a WebSocket, once per animation frame
    const result = tableApi.appendRows(lines, {
      follow: frozen ? false : "auto",          // "auto": at the end → stay at the end
      maxRows: 100_000                          // ring buffer: the oldest lines leave
    });
    if (result) newBelow = result.following ? 0 : newBelow + result.shown;
  }

  function scrollToEnd() {
    frozen = false;
    tableApi.repaintHard({ py: Number.MAX_SAFE_INTEGER });
  }
  // #endregion append

  let frame = 0;
  const tick = () => {
    onLines(newLines(10));                      // 600 lines per second
    ctx.info(`${fmt(tableApi.getBodyModel().getRowCount())} lines${newBelow ? ` · +${fmt(newBelow)} new below` : ""}`);
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);

  const freeze = ctx.button("freeze scroll", () => {
    frozen = !frozen;
    freeze.textContent = frozen ? "frozen – click to unfreeze" : "freeze scroll";
  });
  ctx.button("scroll to end", () => {
    scrollToEnd();
    freeze.textContent = "freeze scroll";
  });

  return () => {
    cancelAnimationFrame(frame);
    scope.destroy();
  };
}
