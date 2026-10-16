import type { DetailRenderContextIf, DetailRendererIf, TableApi } from "@guiexpert/table";
import { JSX } from "solid-js/jsx-runtime";
import { render } from "solid-js/web";

/**
 * The props of a Solid component that renders a detail row (master/detail).
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
 * Renders a Solid component as the content of a detail row (master/detail, `tableOptions.masterDetail`). Mounted
 * once when the detail row becomes visible, kept while scrolling, disposed when the row is collapsed.
 *
 * @example
 * masterDetail: { detailHeight: 180, detailRenderer: new DetailComponentRendererWrapper(OrderItems) }
 *
 * @since 1.1.97
 */
export class DetailComponentRendererWrapper<T = any> implements DetailRendererIf<T> {

  constructor(
    private readonly code: (props: DetailComponentProps<T>) => JSX.Element
  ) {
  }

  render(container: HTMLDivElement, row: T, context: DetailRenderContextIf<T>): () => void {
    const props: DetailComponentProps<T> = { row, rowIndex: context.rowIndex, tableApi: context.tableApi, context };
    return render(() => this.code(props), container);
  }
}
