<!-- Test-only parent in Svelte 5 runes mode: passes $state values and callback props to GuiexpertTable. -->
<svelte:options runes={true} />
<script>
  import GuiexpertTable from "../src/GuiexpertTable.svelte";

  let { initialModel, initialOptions = undefined, onTableReady = undefined, onMouseClicked = undefined } = $props();

  // $state.raw: the table model must not become a deep proxy; the initial props are copied on purpose
  // svelte-ignore state_referenced_locally
  let tableModel = $state.raw(initialModel);
  // svelte-ignore state_referenced_locally
  let tableOptions = $state.raw(initialOptions);

  export function setTableModel(model) {
    tableModel = model;
  }

  export function setTableOptions(options) {
    tableOptions = options;
  }
</script>

<GuiexpertTable {tableModel} {tableOptions} {onTableReady} {onMouseClicked} />
