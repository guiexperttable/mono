// Prompt 025 (finding G11): both tree demos read ONE copy of the tree persons (before 1.1.116 the 5 MB were in the
// package twice: src/demodata/tree-persons.ts and src/lib/treepeople/treePeopleData.ts – the same content). Each
// model gets objects of its own (createTreePersons() parses the JSON per call).
import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { isTreeRow } from "@guiexpert/table";
import type { AreaModelIf } from "@guiexpert/table";
import { generateTreeCheckboxModel } from "./generateTreeCheckboxModel";
import { createTreePeopleModelAndOptions } from "./treepeople/generateTreePeopleModel";
import { createTreePersons } from "../demodata/tree-persons";

/** The persons of all displayed rows (everything is expanded). */
function hashOfRows(body: AreaModelIf): { rows: number; hash: string } {
  const rows: string[] = [];
  for (let r = 0; r < body.getRowCount(); r++) {
    const row = body.getRowByIndex(r);
    rows.push(JSON.stringify(isTreeRow(row) ? row.data : row));
  }
  return { rows: rows.length, hash: createHash("sha256").update(rows.join("|")).digest("hex") };
}

/** fingerprint of 1.1.115 – the same for both models */
const ROWS_1_1_115 = { rows: 10_000, hash: "e7d92780e0dc1c4fd0db749712ed77a1c499875b8b94e4729ebe868cd2e514ff" };

describe("tree persons", () => {

  it("generateTreeCheckboxModel shows the same rows as in 1.1.115 (showcase treetablecheckbox)", () => {
    expect(hashOfRows(generateTreeCheckboxModel().getBodyModel())).toEqual(ROWS_1_1_115);
  });

  it("createTreePeopleModelAndOptions shows the same rows as in 1.1.115 (showcase treetable)", () => {
    expect(hashOfRows(createTreePeopleModelAndOptions().tableModel.getBodyModel())).toEqual(ROWS_1_1_115);
  });

  it("each model gets persons of its own: an edit in one tree demo does not change another", () => {
    const a = createTreePeopleModelAndOptions().tableModel.getBodyModel();
    const b = createTreePeopleModelAndOptions().tableModel.getBodyModel();
    const first = (body: AreaModelIf) => {
      const row = body.getRowByIndex(0);
      return (isTreeRow(row) ? row.data : row) as { lastName: string };
    };
    expect(first(a)).not.toBe(first(b));
    first(a).lastName = "Changed";
    expect(first(b).lastName).toBe("Lastname0");
  });

  it("createTreePersons: 100 roots, 10,000 persons", () => {
    const roots = createTreePersons();
    let count = 0;
    const walk = (persons: { friends?: unknown[] }[]) => persons.forEach(p => { count++; walk((p.friends ?? []) as never); });
    walk(roots);
    expect([roots.length, count]).toEqual([100, 10_000]);
  });
});
