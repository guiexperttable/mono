import { SpreadsheetFactory } from "@guiexpert/table";
import type { SpreadsheetParamIf, SpreadsheetTableModel, TableOptionsIf } from "@guiexpert/table";

/**
 * A quote with cell formulas (A1 references): positions with quantity, unit price and discount, a net amount per row,
 * subtotal, shipping (free from 1,000), VAT and total. Formulas are text with `=` – the sheet calculates them.
 *
 * @returns {unknown[][]} rows × columns A–F (inputs, not values)
 */
export function createSpreadsheetQuoteData(): unknown[][] {
  return [
    ["Item", "Qty", "Unit price", "Discount", "Net", "Note"],
    ["Laptop 14\"", 4, 1299, 0.05, "=B2*C2*(1-D2)", ""],
    ["Docking station", 4, 189, 0, "=B3*C3*(1-D3)", ""],
    ["Monitor 27\"", 8, 349, 0.1, "=B4*C4*(1-D4)", "=IF(D4>=0.1,\"volume discount\",\"\")"],
    ["Keyboard set", 4, 79, 0, "=B5*C5*(1-D5)", ""],
    ["Setup (hours)", 6, 95, 0, "=B6*C6*(1-D6)", ""],
    ["", "", "", "", "", ""],
    ["Subtotal", "=SUM(B2:B6)", "", "", "=SUM(E2:E6)", "=COUNT(B2:B6)&\" positions\""],
    ["Shipping", "", "", "", "=IF(E8>=1000,0,49)", "=IF(E9=0,\"free from 1,000\",\"\")"],
    ["VAT 19 %", "", "", "", "=ROUND((E8+E9)*0.19,2)", ""],
    ["Total", "", "", "", "=E8+E9+E10", ""],
  ];
}

/**
 * Model and options of the quote sheet ({@link createSpreadsheetQuoteData}): 100 rows × A–H, wider columns.
 *
 * @param {Partial<SpreadsheetParamIf>} [param] - merged over the defaults (e.g. `tableOptions: { direction: "rtl" }`)
 * @returns {{ tableModel: SpreadsheetTableModel, tableOptions: TableOptionsIf }} for a table or a wrapper
 */
export function createSpreadsheetQuoteModelAndOptions(param: Partial<SpreadsheetParamIf> = {}):
  { tableModel: SpreadsheetTableModel; tableOptions: TableOptionsIf } {
  return SpreadsheetFactory.create({
    data: createSpreadsheetQuoteData(),
    rowCount: 100,
    columnCount: 8,
    columnWidth: 130,
    ...param,
  });
}
