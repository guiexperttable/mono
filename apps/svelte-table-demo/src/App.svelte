<script lang="ts">
  // Svelte 5 (runes mode). Svelte 4 / legacy mode: on:tableReady={(e) => …e.detail} works as well.
  import { ComponentRendererWrapper, GuiexpertTable } from "@guiexpert/svelte-table";
  import { type ColumnDefIf, type GeMouseEvent, type TableApi, TableFactory } from "@guiexpert/table";
  import {
    applyBodyRenderer,
    createColumnDefs,
    createTableOptions,
    createTableRows,
    type SimplePersonIf
  } from "@guiexpert/demo-table-models";
  import GenderRendererComponent from "./GenderRendererComponent.svelte";

  const tableOptions = createTableOptions();
  let onlyFemale = $state(false);
  let clicks = $state(0);

  // a new model object re-creates the table
  const tableModel = $derived.by(() => {
    const all: SimplePersonIf[] = createTableRows();
    const rows = onlyFemale ? all.filter(p => p.gender === "Female") : all;
    const columnDefs: ColumnDefIf[] = createColumnDefs();
    applyBodyRenderer(columnDefs[2], new ComponentRendererWrapper(GenderRendererComponent));
    return TableFactory.buildByTypedRowsParam({ rows, columnDefs, tableOptions, fixedLeftColumnCount: 0 });
  });

  function handleTableReady(api: TableApi) {
    console.info("Table API:", api);
  }

  function handleMouseClicked(evt: GeMouseEvent) {
    clicks++;
    console.info("Mouse clicked:", evt);
  }
</script>

<div class="toolbar">
  <button id="toggle" onclick={() => onlyFemale = !onlyFemale}>{onlyFemale ? "Show all" : "Only female"}</button>
  <span id="clicks">Clicks: {clicks}</span>
</div>
<div class="table-div">
  <GuiexpertTable
    {tableModel}
    {tableOptions}
    onTableReady={handleTableReady}
    onMouseClicked={handleMouseClicked}
  />
</div>
