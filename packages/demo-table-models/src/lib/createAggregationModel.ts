import {
  AreaIdent,
  AreaModelIf,
  CellRendererIf,
  DomServiceIf,
  RendererCleanupFnType,
  SelectionModel,
  TableFactory,
  TableModelAndOptions,
  TableModelAndOptionsIf,
  TableOptions,
  TableOptionsIf
} from "@guiexpert/table";
import { createSalesOrderColumnDefs, generateSalesOrders } from "./createRowGroupModel";

const MONEY = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Body cells of price and total with two decimals and thousands separators (text only, no HTML). */
class MoneyCellRenderer implements CellRendererIf {
  render(cellDiv: HTMLDivElement, _rowIndex: number, _columnIndex: number, _areaIdent: AreaIdent,
         _areaModel: AreaModelIf, cellValue: any, domService: DomServiceIf): RendererCleanupFnType | undefined {
    if (typeof cellValue === "number") {
      const div = domService.createElement<HTMLDivElement>("div");
      domService.addClass(div, "ge-table-label-div");
      const label = domService.createElement<HTMLDivElement>("div");
      domService.addClass(label, "ge-table-label");
      domService.appendChild(label, domService.createText(MONEY.format(cellValue)));
      domService.appendChild(div, label);
      domService.appendChild(cellDiv, div);
    }
    return undefined;
  }
}

/**
 * Aggregation demo (since 1.1.94): flat sales orders with three total rows in the footer (sum, average, maximum) and a range
 * selection model – `tableApi.getSelectionAggregates()` gives the numbers for a status bar.
 * The totals follow `externalFilterFunction` (set it on the returned options before the table is created).
 *
 * @param count - number of orders (default 50,000)
 */
export function createAggregationModelAndOptions(count = 50_000): TableModelAndOptionsIf {
  const selectionModel = new SelectionModel("range", "multi");
  const tableOptions: TableOptionsIf = {
    ...new TableOptions(),
    hoverColumnVisible: false,
    getSelectionModel: () => selectionModel,
  };
  const columnDefs = createSalesOrderColumnDefs();
  const money = new MoneyCellRenderer();
  for (const def of columnDefs) {
    if (def.property === "price" || def.property === "total") {
      def.rendererMap.body = money;
    }
  }
  const tableModel = TableFactory.createTableModel({
    rows: generateSalesOrders(count),
    columnDefs,
    footerAggregates: {
      rows: [
        {
          label: (rowCount: number) => `Sum · ${rowCount.toLocaleString("en-US")} orders`,
          aggregates: { quantity: "sum", total: "sum" }
        },
        { label: "Average", aggregates: { quantity: "avg", price: "avg", total: "avg" } },
        { label: "Maximum", aggregates: { quantity: "max", price: "max", total: "max" } }
      ],
      labelProperty: "product"                      // the widest text column holds the labels
    },
    tableOptions,
  });
  return new TableModelAndOptions(tableModel, tableOptions);
}

