<!--
  GuiexpertTable – Svelte wrapper of @guiexpert/table.

  Shipped as Svelte source (not pre-compiled), so it is compiled by YOUR Svelte compiler and works with
  Svelte 4 and Svelte 5. Written in plain JS (types in GuiexpertTable.svelte.d.ts) – no preprocessor needed.

  `loading` (boolean) shows the loading overlay without re-creating the table.
  Events: listen with `on:tableReady` / `on:mouseClicked` … (event payload in `e.detail`) or pass callback
  props `onTableReady` / `onMouseClicked` … (payload directly; use these in Svelte 5 runes mode).
  A new `tableModel` or `tableOptions` object re-creates the table (the previous one is destroyed).
-->
<script>
  import { createEventDispatcher, onDestroy, onMount } from "svelte";
  import { LicenseManager, SimpleDomService, TableOptions, TableScope } from "@guiexpert/table";

  /** @type {import("@guiexpert/table").TableModelIf} */
  export let tableModel;
  /** @type {import("@guiexpert/table").TableOptionsIf | undefined} */
  export let tableOptions = undefined;
  /** @type {string | undefined} */
  export let licenseKey = undefined;
  /**
   * `true` shows the loading overlay ("Loading…" with a CSS spinner) over the body, `false` hides it –
   * without re-creating the table (since 1.1.91).
   * @type {boolean}
   */
  export let loading = false;

  /** @type {((api: import("@guiexpert/table").TableApi) => void) | undefined} */
  export let onTableReady = undefined;
  /** @type {((evt: import("@guiexpert/table").GeMouseEvent) => void) | undefined} */
  export let onMouseClicked = undefined;
  /** @type {((evt: import("@guiexpert/table").GeMouseEvent) => void) | undefined} */
  export let onMouseMoved = undefined;
  /** @type {((evt: import("@guiexpert/table").GeMouseEvent) => void) | undefined} */
  export let onMouseDragging = undefined;
  /** @type {((evt: import("@guiexpert/table").GeMouseEvent) => void) | undefined} */
  export let onMouseDraggingEnd = undefined;
  /** @type {((evt: import("@guiexpert/table").GeMouseEvent) => void) | undefined} */
  export let onContextmenu = undefined;
  /** @type {((rows: any[]) => void) | undefined} */
  export let onCheckboxChanged = undefined;
  /** @type {((evt: import("@guiexpert/table").GeModelChangeEvent) => void) | undefined} */
  export let onModelChanged = undefined;
  /** @type {((model: import("@guiexpert/table").SelectionModelIf) => void) | undefined} */
  export let onSelectionChanged = undefined;
  /** @type {((model: import("@guiexpert/table").FocusModelIf) => void) | undefined} */
  export let onFocusChanged = undefined;
  /** @type {((evt: import("@guiexpert/table").GeScrollEvent) => void) | undefined} */
  export let onScroll = undefined;

  const dispatch = createEventDispatcher();

  /** @type {HTMLDivElement} */
  let root;
  /** @type {TableScope | undefined} */
  let tableScope = undefined;
  let mounted = false;

  /** @type {import("@guiexpert/table").EventListenerIf} */
  const listener = {
    onSelectionChanged: (model) => { dispatch("selectionChanged", model); onSelectionChanged?.(model); },
    onFocusChanged: (model) => { dispatch("focusChanged", model); onFocusChanged?.(model); },
    onCheckboxChanged: (rows) => { dispatch("checkboxChanged", rows); onCheckboxChanged?.(rows); },
    onContextmenu: (evt) => { dispatch("contextmenu", evt); onContextmenu?.(evt); },
    onModelChanged: (evt) => { dispatch("modelChanged", evt); onModelChanged?.(evt); },
    onMouseClicked: (evt) => { dispatch("mouseClicked", evt); onMouseClicked?.(evt); },
    onMouseDragging: (evt) => { dispatch("mouseDragging", evt); onMouseDragging?.(evt); },
    onMouseDraggingEnd: (evt) => { dispatch("mouseDraggingEnd", evt); onMouseDraggingEnd?.(evt); },
    onMouseMoved: (evt) => { dispatch("mouseMoved", evt); onMouseMoved?.(evt); },
    onScroll: (evt) => { dispatch("scroll", evt); onScroll?.(evt); }
  };

  /**
   * @param {import("@guiexpert/table").TableModelIf} model
   * @param {import("@guiexpert/table").TableOptionsIf | undefined} options
   */
  function init(model, options) {
    tableScope?.destroy();
    tableScope = undefined;
    if (!root || !model) {
      return;
    }
    tableScope = new TableScope(root, model, new SimpleDomService(), options ?? new TableOptions(), listener);
    tableScope.firstInit();
    applyLoading(loading); // a re-created table keeps showing the overlay
    const api = tableScope.getApi();
    dispatch("tableReady", api);
    onTableReady?.(api);
  }

  /** @param {boolean} show */
  function applyLoading(show) {
    if (show) {
      tableScope?.showLoadingOverlay();
    } else {
      tableScope?.hideOverlay();
    }
  }

  onMount(() => {
    mounted = true;
  });

  onDestroy(() => {
    tableScope?.destroy();
    tableScope = undefined;
  });

  // runs after mount and whenever a new tableModel / tableOptions object arrives
  $: if (mounted) init(tableModel, tableOptions);

  // the loading prop: only shows/hides the overlay (depends on `loading` only, no re-creation)
  $: applyLoading(loading);

  $: if (licenseKey) LicenseManager.getInstance().setLicenseKey(licenseKey);
</script>

<div
  bind:this={root}
  class="ge-table"
  style="width: 100%; height: 100%; background-color: transparent; padding: 0; margin: 0"></div>
