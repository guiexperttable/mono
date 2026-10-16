import {
  ColumnDef,
  editInputPipeForNumber,
  FocusModel,
  px100,
  px120,
  px200,
  SelectionModel,
  TableFactory,
  TableModelAndOptions,
  TableModelAndOptionsIf,
  TableOptions,
  TableOptionsIf,
  TrueFn
} from "@guiexpert/table";
import type { BatchEditOptionsIf, FillHandleOptionsIf } from "@guiexpert/table";
import { PriceItemIf } from "../model/price-item.if";

const PRODUCTS = [
  ["Desk lamp", "Office"], ["Standing desk", "Office"], ["Office chair", "Office"], ["Monitor arm", "Office"],
  ["Notebook A5", "Paper"], ["Sticky notes", "Paper"], ["Printer paper", "Paper"], ["Envelopes", "Paper"],
  ["USB-C cable", "Tech"], ["Keyboard", "Tech"], ["Mouse", "Tech"], ["Webcam", "Tech"], ["Headset", "Tech"],
  ["Coffee beans", "Kitchen"], ["Tea selection", "Kitchen"], ["Water bottle", "Kitchen"]
];

/**
 * A fixed price list for fill handle and batch edit demos (since 1.1.96): `count` articles with SKU, product, category,
 * valid-from date, price, discount and stock. The same count gives the same articles.
 *
 * @param count - number of articles (default 16)
 */
export function generatePriceItems(count = 16): PriceItemIf[] {
  return Array.from({ length: count }, (_, i) => {
    const [product, category] = PRODUCTS[i % PRODUCTS.length];
    return {
      id: i + 1,
      sku: `SKU-${String(i + 1).padStart(3, "0")}`,
      product: i < PRODUCTS.length ? product : `${product} ${Math.floor(i / PRODUCTS.length) + 1}`,
      category,
      validFrom: "2026-10-01",
      price: Math.round((5 + ((i * i * 37 + i * 11) % 150) + ((i * 13) % 10) / 10) * 100) / 100,
      discount: (i * 5) % 20,
      stock: 10 + ((i * 17) % 90)
    };
  });
}

/**
 * Fill handle and batch edit demo (since 1.1.96): a price list with range selection and the fill handle; price, discount,
 * valid-from and stock are editable (and checked), "Net" is calculated (not filled). With `batchEdit` changes are
 * collected until `tableApi.commitBatchEdit()` ("Save") or `cancelBatchEdit()` ("Discard").
 *
 * @param items - the rows (default: {@link generatePriceItems})
 * @param batchEdit - collect changes (`tableOptions.batchEdit`), default `true`
 * @param fillHandle - fill handle options, default `true`
 */
export function createPriceListModelAndOptions(
  items: PriceItemIf[] = generatePriceItems(),
  batchEdit: boolean | Partial<BatchEditOptionsIf> = true,
  fillHandle: boolean | Partial<FillHandleOptionsIf> = true
): TableModelAndOptionsIf {
  const selectionModel = new SelectionModel("range", "multi");
  const focusModel = new FocusModel("cell");
  const tableOptions: TableOptionsIf = {
    ...new TableOptions(),
    hoverColumnVisible: false,
    getSelectionModel: () => selectionModel,
    getFocusModel: () => focusModel,
    fillHandle,
    batchEdit,
    ariaLabel: "Price list"
  };
  const right = { headerClasses: ["ge-table-text-align-right"], bodyClasses: ["ge-table-text-align-right"] };
  const tableModel = TableFactory.createTableModel({
    rows: items,
    fixedLeftColumnCount: 1,
    columnDefs: [
      ColumnDef.create({ property: "sku", headerLabel: "SKU", width: px100 }),
      ColumnDef.create({ property: "product", headerLabel: "Product", width: px200, editable: TrueFn }),
      ColumnDef.create({ property: "category", headerLabel: "Category", width: px100, editable: TrueFn }),
      ColumnDef.create({
        property: "validFrom", headerLabel: "Valid from", width: px120, editable: TrueFn,
        validate: (v: unknown) => /^\d{4}-\d{2}-\d{2}$/.test(String(v)) ? undefined : "Date as YYYY-MM-DD"
      }),
      ColumnDef.create({
        property: "price", headerLabel: "Price", width: px100, editable: TrueFn, editInputPipe: editInputPipeForNumber,
        ...right,
        validate: (v: unknown) => typeof v === "number" && v >= 0 ? undefined : "A price is a number ≥ 0"
      }),
      ColumnDef.create({
        property: "discount", headerLabel: "Discount %", width: px100, editable: TrueFn, editInputPipe: editInputPipeForNumber,
        ...right,
        validate: (v: unknown) => typeof v === "number" && v >= 0 && v <= 50 ? undefined : "Discount 0 … 50 %"
      }),
      ColumnDef.create({
        property: "net", headerLabel: "Net", width: px100, ...right,
        valueGetter: (o: PriceItemIf) => Math.round(o.price * (100 - o.discount)) / 100
      }),
      ColumnDef.create({
        property: "stock", headerLabel: "Stock", width: px100, editable: TrueFn, editInputPipe: editInputPipeForNumber,
        ...right,
        validate: (v: unknown) => Number.isInteger(v) && (v as number) >= 0 ? undefined : "Stock is a whole number ≥ 0"
      })
    ],
    tableOptions
  });
  return new TableModelAndOptions(tableModel, tableOptions);
}
