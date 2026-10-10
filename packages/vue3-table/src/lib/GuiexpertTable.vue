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
  GeScrollEvent
} from '@guiexpert/table';
import { defineComponent, onBeforeUnmount, onMounted, PropType, ref } from 'vue';


export default defineComponent({
  inheritAttrs: false,
  props: {
    tableModel: {
      required: true,
      type: Object as PropType<TableModelIf>
    },
    tableOptions: {
      required: false,
      default: new TableOptions(),
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
    "scroll"
  ],

  setup(props, { emit }) {
    const root = ref(null);
    let clickTimer: ReturnType<typeof setTimeout> | undefined;

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

    onBeforeUnmount(() => {
      if (clickTimer) clearTimeout(clickTimer);
    });

    const initTable = (ele: HTMLDivElement) => {

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
      };

      const tableScope = new TableScope(
        ele, props.tableModel, new SimpleDomService(), props.tableOptions, listener
      );
      tableScope.firstInit();
      emit("tableReady", tableScope.getApi());
    };


    onMounted(() => {
      if (root.value) {
        initTable(root.value as HTMLDivElement);
      }
    });

    if (props.licenseKey) LicenseManager.getInstance().setLicenseKey(props.licenseKey);

    return {
      root
    };
  }
});

</script>

<style >
@import "../../../table/css/main.css";
</style>