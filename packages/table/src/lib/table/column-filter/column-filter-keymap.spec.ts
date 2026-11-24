import { describe, expect, it } from "vitest";
import { ColumnFilterMenuOptions, columnFilterShortcutLayer, FilterRowOptions } from "@guiexpert/table";

describe("columnFilterShortcutLayer", () => {
  it("maps Ctrl+Shift+F and Alt+ArrowDown on Windows/Linux", () => {
    const layer = columnFilterShortcutLayer(false);
    expect(layer["ctrl+shift+f"]).toBe("FOCUS_COLUMN_FILTER");
    expect(layer["alt+arrowdown"]).toBe("OPEN_COLUMN_FILTER_MENU");
    expect(layer["meta+shift+f"]).toBeUndefined();
  });

  it("maps Meta+Shift+F and Alt+ArrowDown on macOS", () => {
    const layer = columnFilterShortcutLayer(true);
    expect(layer["meta+shift+f"]).toBe("FOCUS_COLUMN_FILTER");
    expect(layer["alt+arrowdown"]).toBe("OPEN_COLUMN_FILTER_MENU");
    expect(layer["ctrl+shift+f"]).toBeUndefined();
  });
});

describe("FilterRowOptions.create", () => {
  it("returns undefined for false/undefined", () => {
    expect(FilterRowOptions.create(undefined)).toBeUndefined();
    expect(FilterRowOptions.create(false)).toBeUndefined();
  });

  it("returns defaults for true", () => {
    const opts = FilterRowOptions.create(true);
    expect(opts).toEqual({
      visible: true,
      debounce: 200,
      placeholder: undefined,
      height: 34,
      clearButtonVisible: true,
      minInputWidthInPx: 44,
    });
  });

  it("merges partial overrides and clamps negative/too-small values", () => {
    const opts = FilterRowOptions.create({
      visible: false,
      debounce: -10,
      placeholder: "Filter…",
      height: 10,
      clearButtonVisible: false,
      minInputWidthInPx: 5,
    });
    expect(opts).toEqual({
      visible: false,
      debounce: 0,
      placeholder: "Filter…",
      height: 20,
      clearButtonVisible: false,
      minInputWidthInPx: 20,
    });
  });
});

describe("ColumnFilterMenuOptions.create", () => {
  it("returns undefined for false/undefined", () => {
    expect(ColumnFilterMenuOptions.create(undefined)).toBeUndefined();
    expect(ColumnFilterMenuOptions.create(false)).toBeUndefined();
  });

  it("uses defaultMaxValues fallback and merges partial overrides", () => {
    expect(ColumnFilterMenuOptions.create(true, 500)).toEqual({
      showCondition: true,
      showValues: true,
      applyOnChange: false,
      maxValues: 500,
    });
    expect(ColumnFilterMenuOptions.create({ showCondition: false, applyOnChange: true, maxValues: 0 }, 500)).toEqual({
      showCondition: false,
      showValues: true,
      applyOnChange: true,
      maxValues: 1,
    });
  });
});
