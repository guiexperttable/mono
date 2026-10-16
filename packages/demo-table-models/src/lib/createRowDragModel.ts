import {
  ColumnDef,
  FocusModel,
  px100,
  px120,
  px300,
  SelectionModel,
  TableFactory,
  TableModelAndOptions,
  TableModelAndOptionsIf,
  TableOptions,
  TableOptionsIf
} from "@guiexpert/table";
import type { RowDragOptionsIf } from "@guiexpert/table";
import { TaskIf } from "../model/task.if";

const TITLES = [
  "Fix login timeout", "Ship row drag", "Write release notes", "Review pull requests", "Update dependencies",
  "Dark mode for the dashboard", "Export to Excel", "Keyboard shortcuts help", "Onboarding video", "Fix flaky test",
  "Translate settings page", "Accessibility audit", "Cache API responses", "Remove old feature flags",
  "Improve search ranking", "Mobile layout of the table", "Customer interview notes", "Plan Q1 roadmap",
  "Refactor date utils", "Security headers"
];
const OWNERS = ["Anna", "Ben", "Chen", "Dana", "Emil"];
const STATUS: TaskIf["status"][] = ["todo", "doing", "todo", "done", "todo"];

/**
 * A fixed priority list for row drag demos (since 1.1.95): `count` tasks (title, owner, status, estimate in hours).
 * The same count gives the same tasks; the first task is `locked` (no drag handle) when `withLocked` is true.
 *
 * @param count - number of tasks (default 20; titles repeat with a number above 20)
 * @param withLocked - mark the first task as locked
 */
export function generateTasks(count = 20, withLocked = false): TaskIf[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: i < TITLES.length ? TITLES[i] : `${TITLES[i % TITLES.length]} #${Math.floor(i / TITLES.length) + 1}`,
    owner: OWNERS[i % OWNERS.length],
    status: STATUS[(i * 3) % STATUS.length],
    estimate: 1 + ((i * 7) % 13),
    locked: withLocked && i === 0
  }));
}

/**
 * Row drag demo (since 1.1.95): a priority list with row numbers ("#" = the position), a drag handle in the title column
 * (not for locked tasks), multi-row selection and focus. Drag a grip – or press Ctrl+Alt+↑/↓.
 *
 * @param tasks - the rows (default: {@link generateTasks}) – reordered in place by the table (managed)
 * @param rowDragOptions - e.g. `{ managed: false }` for events only
 */
export function createRowDragModelAndOptions(
  tasks: TaskIf[] = generateTasks(20, true),
  rowDragOptions: Partial<RowDragOptionsIf> = {}
): TableModelAndOptionsIf {
  const selectionModel = new SelectionModel("row", "multi");
  const focusModel = new FocusModel("cell");
  const tableOptions: TableOptionsIf = {
    ...new TableOptions(),
    hoverColumnVisible: false,
    getSelectionModel: () => selectionModel,
    getFocusModel: () => focusModel,
    rowDragOptions,
    ariaLabel: "Priority list"
  };
  const tableModel = TableFactory.createTableModel({
    rows: tasks,
    rowNumbersVisible: { headerLabel: "#" },
    columnDefs: [
      ColumnDef.create({ property: "title", headerLabel: "Task", width: px300, rowDrag: (task: TaskIf) => !task.locked }),
      ColumnDef.create({ property: "owner", headerLabel: "Owner", width: px120 }),
      ColumnDef.create({ property: "status", headerLabel: "Status", width: px100 }),
      ColumnDef.create({
        property: "estimate", headerLabel: "Hours", width: px100,
        headerClasses: ["ge-table-text-align-right"], bodyClasses: ["ge-table-text-align-right"]
      }),
    ],
    tableOptions
  });
  return new TableModelAndOptions(tableModel, tableOptions);
}
