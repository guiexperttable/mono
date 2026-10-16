import type { DetailRenderContextIf, DetailRendererIf, TableApi } from "@guiexpert/table";
import { h, render } from "preact";

/**
 * The props of a Preact component that renders a detail row (master/detail).
 *
 * @since 1.1.97
 */
export interface DetailComponentProps<T = any> {
  row: T;
  rowIndex: number;
  tableApi: TableApi;
  context: DetailRenderContextIf<T>;
}

/**
 * Renders a Preact component as the content of a detail row (master/detail, `tableOptions.masterDetail`). Mounted
 * once when the detail row becomes visible, kept while scrolling, unmounted when it is collapsed.
 *
 * @example
 * masterDetail: { detailHeight: 180, detailRenderer: new DetailComponentRendererWrapper(OrderItems) }
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
    render(h(this.Component, props), container);
    return () => render(null, container);
  }
}
