import type { DetailRenderContextIf, DetailRendererIf, TableApi } from "@guiexpert/table";
import { createElement } from "react";
import { createRoot } from "react-dom/client";

/**
 * The props of a React component that renders a detail row (master/detail, `tableOptions.masterDetail`).
 *
 * @since 1.1.97
 */
export interface DetailComponentProps<T = any> {
  /** The master row. */
  row: T;
  /** Its display index when the detail was created. */
  rowIndex: number;
  /** The API of the master table. */
  tableApi: TableApi;
  /** The full context (abort signal, `recreated`, `createTable` …). */
  context: DetailRenderContextIf<T>;
}

/**
 * Renders a React component as the content of a detail row (master/detail). The component is mounted once, when the
 * detail row becomes visible for the first time; its state survives scrolling. It is unmounted when the row is
 * collapsed or the table is destroyed.
 *
 * @example
 * function OrderItems({ row }: DetailComponentProps<Order>) {
 *   const model = useMemo(() => TableFactory.createTableModel({ rows: row.items, properties: ["sku", "qty"] }), [row]);
 *   return <div style={{ height: 160 }}><GuiexpertTable tableModel={model} /></div>;
 * }
 * const tableOptions = { ...new TableOptions(), masterDetail: { detailHeight: 180, detailRenderer: new DetailComponentRendererWrapper(OrderItems) } };
 *
 * @since 1.1.97
 */
export class DetailComponentRendererWrapper<T = any> implements DetailRendererIf<T> {

  constructor(
    private readonly Component: any
  ) {
  }

  render(container: HTMLDivElement, row: T, context: DetailRenderContextIf<T>): () => void {
    const props: DetailComponentProps<T> = { row, rowIndex: context.rowIndex, tableApi: context.tableApi, context };
    const root = createRoot(container, {});
    root.render(createElement(this.Component, props)); // as element: hooks work in the component
    return () => {
      // deferred like the cell wrapper: the cleanup may run while React renders (e.g. a new tableModel)
      setTimeout(() => root.unmount(), 0);
    };
  }
}
