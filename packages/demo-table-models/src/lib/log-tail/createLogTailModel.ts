import {
  ColumnDef,
  DefaultRowHeights,
  FocusModel,
  px100,
  px120,
  px80,
  SelectionModel,
  Size,
  TableFactory,
  TableModelAndOptions,
  TableOptions
} from "@guiexpert/table";
import type {
  AreaIdent,
  AreaModelIf,
  CellRendererIf,
  DomServiceIf,
  RendererCleanupFnType,
  TableModelAndOptionsIf,
  TableOptionsIf
} from "@guiexpert/table";
import type { LogLineIf } from "../../model/log-line.if";

/** The level of a log line as a small badge: class `ge-log-level ge-log-level-error` … (text, never HTML). */
export class LogLevelCellRenderer implements CellRendererIf {
  render(cellDiv: HTMLDivElement, _rowIndex: number, _columnIndex: number, _areaIdent: AreaIdent,
         _areaModel: AreaModelIf, cellValue: unknown, domService: DomServiceIf): RendererCleanupFnType | undefined {
    const level = String(cellValue ?? "");
    const badge = domService.createElement<HTMLSpanElement>("span");
    domService.addClass(badge, "ge-log-level");
    domService.addClass(badge, "ge-log-level-" + level.toLowerCase());
    domService.appendChild(badge, domService.createText(level));
    domService.appendChild(cellDiv, badge);
    return undefined;
  }
}

/**
 * A log viewer table (live data, since 1.1.108): #, time, level (badge), source, message; 24 px rows, range
 * selection, cell focus. Feed it with `tableApi.appendRows(lines, { follow: "auto", maxRows })` or the
 * {@link LogTailController}.
 *
 * CSS for the level badges (not part of the table CSS): `.ge-log-level-error { color: … }` – see the showcase.
 *
 * @param lines - the first lines (default none) – the table appends to this array
 */
export function createLogTailModelAndOptions(lines: LogLineIf[] = []): TableModelAndOptionsIf {
  const selectionModel = new SelectionModel("range", "multi");
  const focusModel = new FocusModel("cell");
  const tableOptions: TableOptionsIf = {
    ...new TableOptions(),
    hoverColumnVisible: false,
    verticalBorderVisible: false,
    getSelectionModel: () => selectionModel,
    getFocusModel: () => focusModel,
    overlayOptions: { noRowsText: "Waiting for log lines…" },
    ariaLabel: "Log"
  };
  const tableModel = TableFactory.createTableModel({
    rows: lines,
    defaultRowHeights: new DefaultRowHeights(30, 24, 0),
    columnDefs: [
      ColumnDef.create({
        property: "id", headerLabel: "#", width: px80,
        headerClasses: ["ge-table-text-align-right"], bodyClasses: ["ge-table-text-align-right", "ge-log-id"]
      }),
      ColumnDef.create({
        property: "time", headerLabel: "Time", width: px120,
        headerClasses: ["ge-table-text-align-start"], bodyClasses: ["ge-table-text-align-start", "ge-log-time"]
      }),
      ColumnDef.create({ property: "level", headerLabel: "Level", width: px80, bodyRenderer: new LogLevelCellRenderer() }),
      ColumnDef.create({
        property: "source", headerLabel: "Source", width: px100,
        headerClasses: ["ge-table-text-align-start"], bodyClasses: ["ge-table-text-align-start"]
      }),
      ColumnDef.create({
        property: "text", headerLabel: "Message", width: new Size(1, "weight"),
        headerClasses: ["ge-table-text-align-start"], bodyClasses: ["ge-table-text-align-start"]
      }),
    ],
    tableOptions
  });
  return new TableModelAndOptions(tableModel, tableOptions);
}
