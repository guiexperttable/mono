<template>
  <div
    ref="root"
    class="container-div"
    style="width: 100%; height: 100%; background-color: transparent; padding: 0; margin: 0">
  </div>
</template>

<script lang="ts">
import {
  FocusModelIf,
  GeModelChangeEvent,
  GeMouseEvent,
  LicenseManager, SelectionModelIf,
  SimpleDomService,
  TableOptions,
  TableScope,
  TableModelIf, TableOptionsIf,
  GeScrollEvent, GeStateChangeEvent, GeRowDragEvent, GeBatchEditEvent
} from '@guiexpert/table';
import { defineComponent, onBeforeUnmount, onMounted, PropType, ref, watch } from 'vue';


/**
 * Vue 3 wrapper of the GuiExpert Table.
 * A new `tableModel` or `tableOptions` object (new reference) re-creates the table; the previous table is released
 * with `TableScope.destroy()`, as on unmount. Keep both objects stable (e.g. `shallowRef`), otherwise every new
 * object creates a new table.
 */
export default defineComponent({
  // class, style and other attributes go to the root div (before: inheritAttrs: false dropped them)
  props: {
    tableModel: {
      required: true,
      type: Object as PropType<TableModelIf>
    },
    tableOptions: {
      required: false,
      // factory: every table gets its own options object (the core writes to it, e.g. setSelectionModel)
      default: () => new TableOptions(),
      type: Object as PropType<TableOptionsIf>
    },
    /**
     * Debounce time for `mouseClicked` in ms (like the Angular wrapper): only the last click within this time is
     * emitted, so a double click emits one event with `clickCount === 2`. `0` emits every click immediately.
     */
    debounceMouseClickDelay: {
      required: false,
      type: Number,
      default: 150
    },
    licenseKey: {
      default: '',
      required: false
    },
    /**
     * `true` shows the loading overlay ("Loading…" with a CSS spinner) over the body, `false` hides it.
     * Changing it does **not** re-create the table. Texts: `tableOptions.overlayOptions`. @since 1.1.92
     */
    loading: {
      required: false,
      type: Boolean,
      default: false
    }
  },
  emits: [
    "tableReady",
    "mouseClicked",
    "mouseDragging",
    "checkboxChanged",
    "contextmenu",
    "modelChanged",
    "focusChanged",
    "selectionChanged",
    "mouseDraggingEnd",
    "mouseMoved",
    "scroll",
    "stateChanged",  // since 1.1.92
    "rowDragStart",  // since 1.1.95 (row drag)
    "rowDragMove",
    "rowDragEnd",
    "batchEditChanged" // since 1.1.96 (batch edit)
  ],

  setup(props, { emit }) {
    const root = ref(null);
    let clickTimer: ReturnType<typeof setTimeout> | undefined;
    let tableScope: TableScope | undefined;
    let shownByProp = false; // :loading="false" hides only an overlay the prop showed (not one of the app)

    const emitMouseClicked = (evt: GeMouseEvent) => {
      const delay = props.debounceMouseClickDelay;
      if (!delay || delay <= 0) {
        emit("mouseClicked", evt);
        return;
      }
      if (clickTimer) clearTimeout(clickTimer);
      clickTimer = setTimeout(() => {
        clickTimer = undefined;
        emit("mouseClicked", evt);
      }, delay);
    };

    /** Releases the table (listeners, resize observer, cell renderers) and drops a pending debounced click. */
    const destroyTable = () => {
      if (clickTimer) clearTimeout(clickTimer);
      clickTimer = undefined;
      tableScope?.destroy();
      tableScope = undefined;
    };

    onBeforeUnmount(destroyTable);

    const initTable = (ele: HTMLDivElement) => {
      destroyTable();

      const listener = {

        onSelectionChanged: (evt: SelectionModelIf) => {
          emit("selectionChanged", evt);
        },

        onFocusChanged: (evt: FocusModelIf) => {
          emit("focusChanged", evt);
        },

        onCheckboxChanged: (evt: any[]) => {
          emit("checkboxChanged", evt);
        },

        onContextmenu: (evt: GeMouseEvent) => {
          emit("contextmenu", evt);
        },

        onModelChanged: (evt: GeModelChangeEvent) => {
          emit("modelChanged", evt);
        },

        onMouseClicked: (evt: GeMouseEvent) => {
          emitMouseClicked(evt);
        },

        onMouseDragging: (evt: GeMouseEvent) => {
          emit("mouseDragging", evt);
        },

        onMouseDraggingEnd: (evt: GeMouseEvent) => {
          emit("mouseDraggingEnd", evt);
        },

        onMouseMoved: (evt: GeMouseEvent) => {
          emit("mouseMoved", evt);
        },

        onScroll: (evt: GeScrollEvent) => {
          emit("scroll", evt);
        },

        onStateChanged: (evt: GeStateChangeEvent) => {
          emit("stateChanged", evt);
        },

        onRowDragStart: (evt: GeRowDragEvent) => {
          emit("rowDragStart", evt);
        },

        onRowDragMove: (evt: GeRowDragEvent) => {
          emit("rowDragMove", evt);
        },

        onRowDragEnd: (evt: GeRowDragEvent) => {
          emit("rowDragEnd", evt);
        },

        onBatchEditChanged: (evt: GeBatchEditEvent) => {
          emit("batchEditChanged", evt);
        },
      };

      const scope = new TableScope(
        ele, props.tableModel, new SimpleDomService(), props.tableOptions ?? new TableOptions(), listener
      );
      tableScope = scope;
      scope.firstInit();
      shownByProp = false;
      applyLoading(); // a re-created table keeps showing the overlay
      emit("tableReady", scope.getApi());
    };

    const applyLoading = () => {
      if (props.loading) {
        tableScope?.showLoadingOverlay();
        shownByProp = true;
      } else if (shownByProp) {
        tableScope?.hideOverlay();
        shownByProp = false;
      }
    };


    onMounted(() => {
      if (root.value) {
        initTable(root.value as HTMLDivElement);
      }
    });

    // A new tableModel or tableOptions object re-creates the table (the previous one is destroyed).
    watch([() => props.tableModel, () => props.tableOptions], () => {
      if (root.value) {
        initTable(root.value as HTMLDivElement);
      }
    });

    // the loading prop: no re-creation of the table
    watch(() => props.loading, applyLoading, { flush: 'sync' });

    watch(() => props.licenseKey, (licenseKey) => {
      if (licenseKey) LicenseManager.getInstance().setLicenseKey(licenseKey);
    }, { immediate: true });

    return {
      root
    };
  }
});

</script>

<style >
@import "../../../table/css/main.css";
</style>