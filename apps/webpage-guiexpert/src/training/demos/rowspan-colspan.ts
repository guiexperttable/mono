// Chapter 29 – connected cells: double periods (rowspan) and breaks across all days (colspan).
// #region model
import { AreaModelArrayOfArrays } from "@guiexpert/table";

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const TIMETABLE: string[][] = [
  ["08:00", "Math", "German", "English", "Physics", "Art"],
  ["08:45", "Math", "German", "English", "Physics", "Art"],
  ["09:30", "Biology", "Math", "History", "Chemistry", "Music"],
  ["10:15", "Break", "", "", "", ""],
  ["10:35", "English", "Sports", "Math", "German", "Computer Science"],
  ["11:20", "English", "Sports", "Math", "German", "Computer Science"],
  ["12:05", "Lunch", "", "", "", ""],
  ["13:00", "Chemistry", "Computer Science", "Sports", "Math", "Project"],
  ["13:45", "Ethics", "Computer Science", "Sports", "History", "Project"]
];

export class TimetableModel extends AreaModelArrayOfArrays<string> {
  constructor(rows: string[][] = TIMETABLE) {
    super("body", rows, 44);
  }

  private isBreak(rowIndex: number): boolean {
    return ["Break", "Lunch"].includes(this.getValueAt(rowIndex, 1));
  }

  // a break row: one cell over all five days
  override getColspanAt(rowIndex: number, columnIndex: number): number {
    return this.isBreak(rowIndex) && columnIndex === 1 ? DAYS.length : 1;
  }

  // the same subject in consecutive periods: one tall cell (only the FIRST cell of a block spans)
  override getRowspanAt(rowIndex: number, columnIndex: number): number {
    if (columnIndex === 0 || this.isBreak(rowIndex)) return 1;
    const at = (row: number) => this.getValueAt(row, columnIndex);
    if (rowIndex > 0 && at(rowIndex) === at(rowIndex - 1)) return 1;      // covered by the cell above
    let span = 1;
    while (rowIndex + span < this.getRowCount() && at(rowIndex + span) === at(rowIndex)) span++;
    return span;
  }

  // a colour per subject (CSS classes)
  override getCustomClassesAt(rowIndex: number, columnIndex: number): string[] {
    if (columnIndex === 0) return ["tt-time"];
    if (this.isBreak(rowIndex)) return ["tt-break"];
    const subject = String(this.getValueAt(rowIndex, columnIndex));
    return ["tt-subject", `tt-${subject.toLowerCase().replace(/\s+/g, "-")}`];
  }
}
// #endregion model

import { EventAdapter, SimpleDomService, TableFactory, TableOptions, TableScope } from "@guiexpert/table";
import { type DemoContext } from "./shared/demo";

export default function (ctx: DemoContext) {
  // #region table
  const tableModel = TableFactory.createTableModel({
    headerData: [["Time", ...DAYS]],
    bodyAreaModel: new TimetableModel(),
    columnSizes: [80, 150, 150, 150, 150, 150]
  });
  // #endregion table
  const scope = new TableScope(ctx.host, tableModel, new SimpleDomService(),
    { ...new TableOptions(), hoverRowVisible: false, hoverColumnVisible: false }, new EventAdapter());
  scope.firstInit();
  ctx.info("double periods = rowspan · breaks = colspan");
  return () => scope.destroy();
}
