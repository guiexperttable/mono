import { GuiexpertTable } from "@guiexpert/react-table";
import { GeMouseEvent, TableFactory, TableOptions } from "@guiexpert/table";
import "@guiexpert/table/css/main.css";
import { orders } from "./orders";

// create model and options once – a new object rebuilds the table
const tableModel = TableFactory.createTableModel({
  rows: orders,
  properties: ["id", "customer", "city", "total"]
});
const tableOptions = new TableOptions();

export function OrderTable() {
  return (
    <div style={{ height: 500 }}>
      <GuiexpertTable
        tableModel={tableModel}
        tableOptions={tableOptions}
        mouseClicked={(evt: GeMouseEvent) => console.info("row", evt.rowIndex)} />
    </div>
  );
}
