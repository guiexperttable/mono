// Prompt 025: the module-level values of the time table are created by /* @__PURE__ */ functions – same values.
import { describe, expect, it } from "vitest";
import { COL_IDX_UPDATED_AT, createTimeTableModel, data, tableOptions } from "./createTimeTableModel";

describe("createTimeTableModel", () => {

  it("COL_IDX_UPDATED_AT is the last column, 'updatedAt'", () => {
    const columnDefs = createTimeTableModel().getColumnDefs()!;
    expect(columnDefs.length - 1).toBe(COL_IDX_UPDATED_AT);
    expect(columnDefs[COL_IDX_UPDATED_AT].property).toBe("updatedAt");
  });

  it("every team has an updatedAt date", () => {
    expect(data.length).toBe(21);
    expect(data.every(r => r.updatedAt instanceof Date)).toBe(true);
  });

  it("tableOptions: no hover, 34 px rows, columns resizable but not draggable", () => {
    expect(tableOptions).toMatchObject({
      hoverRowVisible: false, hoverColumnVisible: false, columnsDraggable: false, columnsResizable: true,
      defaultRowHeights: { header: 34, body: 34, footer: 34 },
    });
  });
});
