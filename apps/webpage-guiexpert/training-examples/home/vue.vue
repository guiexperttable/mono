<script setup lang="ts">
import { GuiexpertTable } from "@guiexpert/vue3-table";
import { GeMouseEvent, TableFactory, TableOptions } from "@guiexpert/table";
import "@guiexpert/table/css/main.css";
import { orders } from "./orders";

// plain objects – no ref() needed, the table keeps its own state
const tableModel = TableFactory.createTableModel({
  rows: orders,
  properties: ["id", "customer", "city", "total"]
});
const tableOptions = new TableOptions();
const onClick = (evt: GeMouseEvent) => console.info("row", evt.rowIndex);
</script>

<template>
  <div style="height: 500px">
    <GuiexpertTable :tableModel="tableModel" :tableOptions="tableOptions" @mouseClicked="onClick" />
  </div>
</template>
