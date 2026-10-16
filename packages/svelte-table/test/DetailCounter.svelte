<script>
  // a detail row component for the master/detail smoke tests (plain JS: compiles with Svelte 4 and 5)
  import { onDestroy } from "svelte";
  export let row;
  export let rowIndex = -1;
  export let tableApi = undefined;
  export let context = undefined;
  let clicks = 0;
  onDestroy(() => {
    window.__mdDestroyed = window.__mdDestroyed || [];
    window.__mdDestroyed.push(row.id);
  });
</script>

<button class="md-btn" data-row-index={rowIndex} data-has-api={!!tableApi && !!context} on:click={() => clicks++}>clicks {clicks} of {row.id}</button>
