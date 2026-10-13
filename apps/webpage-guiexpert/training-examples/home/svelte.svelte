<script lang="ts">
  import { GuiexpertTable } from "@guiexpert/svelte-table";   // Svelte 4 and 5
  import { type GeMouseEvent, TableFactory, TableOptions } from "@guiexpert/table";
  import "@guiexpert/table/css/main.css";
  import { orders } from "./orders";

  const tableModel = TableFactory.createTableModel({
    rows: orders,
    properties: ["id", "customer", "city", "total"]
  });
  const tableOptions = new TableOptions();
</script>

<div style="height: 500px">
  <GuiexpertTable
    {tableModel}
    {tableOptions}
    onMouseClicked={(evt: GeMouseEvent) => console.info("row", evt.rowIndex)} />
</div>
