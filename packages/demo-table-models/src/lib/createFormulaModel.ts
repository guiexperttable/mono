import {
  AreaIdent,
  AreaModelIf,
  CellRendererIf,
  ColumnDef,
  ColumnDefIf,
  DomServiceIf,
  RendererCleanupFnType,
  TableFactory,
  TableModelAndOptions,
  TableModelAndOptionsIf,
  TableOptions,
  TableOptionsIf,
  TrueFn,
  editInputPipeForNumber,
  px110,
  px120,
  px130,
  px140,
  px160,
  px90
} from "@guiexpert/table";
import { generateSalesOrders } from "./createRowGroupModel";

/** One line of an invoice – the data has no net, VAT or gross: formulas compute them. */
export interface InvoiceLineIf {
  id: number;
  country: string;
  product: string;
  quantity: number;
  price: number;
  /** discount in percent (0, 5, 10, 15) */
  discount: number;
}

const MONEY = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Numbers with two decimals and thousands separators (text only, no HTML); other values (errors) as text. */
class FormulaMoneyRenderer implements CellRendererIf {
  render(cellDiv: HTMLDivElement, _rowIndex: number, _columnIndex: number, _areaIdent: AreaIdent,
         _areaModel: AreaModelIf, cellValue: any, domService: DomServiceIf): RendererCleanupFnType | undefined {
    if (cellValue === undefined || cellValue === null || cellValue === "") {
      return undefined;
    }
    const div = domService.createElement<HTMLDivElement>("div");
    domService.addClass(div, "ge-table-label-div");
    const label = domService.createElement<HTMLDivElement>("div");
    domService.addClass(label, "ge-table-label");
    const text = typeof cellValue === "number" ? MONEY.format(cellValue) : `${cellValue}`;
    domService.appendChild(label, domService.createText(text));
    domService.appendChild(div, label);
    domService.appendChild(cellDiv, div);
    return undefined;
  }
}

/** Invoice lines with a fixed seed: the sales orders of the row grouping demo plus a discount. */
export function generateInvoiceLines(count: number, seed = 8): InvoiceLineIf[] {
  const discounts = [0, 0, 0, 5, 5, 10, 15];
  return generateSalesOrders(count, seed).map((o, i) => ({
    id: o.id, country: o.country, product: o.product, quantity: o.quantity, price: o.price,
    discount: discounts[(i * 7 + o.quantity) % discounts.length],
  }));
}

const right = { headerClasses: ["ge-table-text-align-right"], bodyClasses: ["ge-table-text-align-right"], footerClasses: ["ge-table-text-align-right"] };

/** The formulas of the demo (also shown on the website). */
export const INVOICE_FORMULAS = {
  net: "ROUND([quantity] * [price] * (1 - [discount] / 100), 2)",
  vat: "ROUND([net] * 0.19, 2)",
  gross: "[net] + [vat]",
  custom: "IF([discount] > 0, ROUND([gross] / [quantity], 2), \"–\")",
} as const;

/** The columns: data (price and discount editable), formulas for net, VAT, gross, a share, a rank and a custom formula. */
export function createInvoiceColumnDefs(customFormula: string = INVOICE_FORMULAS.custom): ColumnDefIf[] {
  const money = new FormulaMoneyRenderer();
  return [
    ColumnDef.create({ property: "id", headerLabel: "Line", width: px90, ...right, sortable: TrueFn }),
    ColumnDef.create({ property: "country", headerLabel: "Country", width: px130, sortable: TrueFn }),
    ColumnDef.create({ property: "product", headerLabel: "Product", width: px160, sortable: TrueFn }),
    ColumnDef.create({ property: "quantity", headerLabel: "Qty", width: px90, ...right, sortable: TrueFn,
      editable: TrueFn, editInputPipe: editInputPipeForNumber }),
    ColumnDef.create({ property: "price", headerLabel: "Price", width: px110, ...right, sortable: TrueFn,
      editable: TrueFn, editInputPipe: editInputPipeForNumber, bodyRenderer: money }),
    ColumnDef.create({ property: "discount", headerLabel: "Disc. %", width: px90, ...right, sortable: TrueFn,
      editable: TrueFn, editInputPipe: editInputPipeForNumber }),
    ColumnDef.create({ property: "net", headerLabel: "Net", width: px120, ...right, sortable: TrueFn,
      formula: INVOICE_FORMULAS.net, bodyRenderer: money, footerRenderer: money }),
    ColumnDef.create({ property: "vat", headerLabel: "VAT 19%", width: px110, ...right, sortable: TrueFn,
      formula: INVOICE_FORMULAS.vat, bodyRenderer: money, footerRenderer: money }),
    ColumnDef.create({ property: "gross", headerLabel: "Gross", width: px120, ...right, sortable: TrueFn,
      formula: INVOICE_FORMULAS.gross, bodyRenderer: money, footerRenderer: money }),
    ColumnDef.create({ property: "share", headerLabel: "Share of net", width: px120, ...right, sortable: TrueFn,
      formula: "[net]", showValuesAs: { mode: "percentOfColumnTotal", fractionDigits: 2 } }),
    ColumnDef.create({ property: "rank", headerLabel: "Rank", width: px90, ...right, sortable: TrueFn,
      formula: "[gross]", showValuesAs: "rank" }),
    ColumnDef.create({ property: "custom", headerLabel: "Custom formula", width: px140, ...right, sortable: TrueFn,
      formula: customFormula }),
  ];
}

/**
 * Formula demo (since 1.1.95): invoice lines whose net, VAT and gross are formula columns (`ColumnDef.create({ formula })`),
 * a share of the net total and a rank („Show values as“), a custom formula (change it with
 * `tableApi.setColumnFormula("custom", text)`) and a total row (`footerAggregates` over the calculated columns).
 * Price, quantity and discount are editable – the formulas follow.
 *
 * @param count - number of invoice lines (default 2,000)
 */
export function createFormulaModelAndOptions(count = 2_000): TableModelAndOptionsIf {
  const tableOptions: TableOptionsIf = {
    ...new TableOptions(),
    hoverColumnVisible: false,
  };
  const tableModel = TableFactory.createTableModel({
    rows: generateInvoiceLines(count),
    columnDefs: createInvoiceColumnDefs(),
    footerAggregates: {
      rows: [{ label: (n: number) => `Sum · ${n.toLocaleString("en-US")} lines`, aggregates: { net: "sum", vat: "sum", gross: "sum" } }],
      labelProperty: "product",
    },
    fixedLeftColumnCount: 1,
    tableOptions,
  });
  return new TableModelAndOptions(tableModel, tableOptions);
}
