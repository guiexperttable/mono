// index.html: <guiexpert-table style="display: block; height: 500px"></guiexpert-table>
import { GuiexpertTable } from "@guiexpert/webcomponent-table";
import { GeMouseEvent, TableFactory, TableOptions } from "@guiexpert/table";
import "@guiexpert/table/css/main.css";
import { orders } from "./orders";

customElements.define("guiexpert-table", GuiexpertTable);   // you choose the tag name

const table = document.querySelector<GuiexpertTable>("guiexpert-table")!;
table.addEventListener("mouseClicked", e =>
  console.info("row", (e as CustomEvent<GeMouseEvent>).detail.rowIndex));   // bubbling CustomEvents
table.data = {
  tableModel: TableFactory.createTableModel({ rows: orders, properties: ["id", "customer", "city", "total"] }),
  tableOptions: new TableOptions()
};
