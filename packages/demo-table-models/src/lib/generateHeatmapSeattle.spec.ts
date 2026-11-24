// Prompt 025 (finding G11): the Seattle heat map computes nothing on import – before 1.1.116 the 8,759 weather values
// were grouped on module level, so every app that imported anything from @guiexpert/demo-table-models kept 613 kB of
// weather data in its bundle and ran the loop on every page load.
import { describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";

/** calls of getRawData() – a plain counter: Vitest clears the calls of a vi.fn() before each test */
const reads = vi.hoisted(() => ({ count: 0 }));
vi.mock("./generateHeatmapSeattleData", async (importOriginal) => {
  const original = await importOriginal<typeof import("./generateHeatmapSeattleData")>();
  return { ...original, getRawData: () => { reads.count++; return original.getRawData(); } };
});

import { createHeatMapSeattleModel } from "./generateHeatmapSeattle";

/** reads right after the import – independent of the order of the tests (--sequence.shuffle) */
const readsAtImport = reads.count;

/** Every value, tooltip, style and colspan of body and footer (the showcase heatmap2 shows exactly these). */
function fingerprint(): { columns: number; rows: number; hash: string } {
  const model = createHeatMapSeattleModel();
  const parts: string[] = [];
  for (const area of ["body", "footer"] as const) {
    const am = model.getAreaModel(area);
    for (let r = 0; r < am.getRowCount(); r++) {
      for (let c = 0; c < model.getColumnCount(); c++) {
        parts.push(String(am.getValueAt(r, c)), String(am.getTooltipAt(r, c)),
          JSON.stringify(am.getCustomStyleAt(r, c) ?? null), String(am.getColspanAt(r, c)));
      }
    }
  }
  return {
    columns: model.getColumnCount(),
    rows: model.getAreaModel("body").getRowCount(),
    hash: createHash("sha256").update(parts.join("|")).digest("hex"),
  };
}

describe("createHeatMapSeattleModel", () => {

  it("the import reads no weather data", () => {
    expect(readsAtImport).toBe(0);
  });

  it("the same cells as before 1.1.116: 365 days + time column, 24 hours (fingerprint of 1.1.115)", () => {
    expect(fingerprint()).toEqual({
      columns: 366,
      rows: 24,
      hash: "566662d791abb693b2e5bf682a3ad4373cae987d8440bbb266f9dd690030b3e9",
    });
  });

  it("the weather data are read and grouped once, on the first model", () => {
    createHeatMapSeattleModel();
    createHeatMapSeattleModel();
    expect(reads.count).toBe(1);   // also when another test created a model before
  });

  it("min and max of the temperature give the ends of the color gradient", () => {
    const body = createHeatMapSeattleModel().getAreaModel("body");
    const temperatures: number[] = [];
    for (let r = 0; r < body.getRowCount(); r++) {
      for (let c = 1; c < 366; c++) {
        const tip = String(body.getTooltipAt(r, c));
        if (tip) temperatures.push(Number(tip.split("→ ")[1]));
      }
    }
    expect(temperatures.length).toBe(8759);
    const coldest = temperatures.indexOf(Math.min(...temperatures));
    const warmest = temperatures.indexOf(Math.max(...temperatures));
    const style = (i: number) => body.getCustomStyleAt(Math.floor(i / 365), (i % 365) + 1)!["background"];
    expect(style(coldest)).toBe("rgb(67, 1, 84)");     // minColor
    expect(style(warmest)).toBe("rgb(250, 230, 37)");  // maxColor
  });
});
