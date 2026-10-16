import type { DetailRenderContextIf, DetailRendererIf } from "@guiexpert/table";
import { AppContext, createVNode, render, VNode } from 'vue';

/**
 * Renders a Vue component as the content of a detail row (master/detail, `tableOptions.masterDetail`). The component
 * gets the props `row`, `rowIndex`, `tableApi` and `context`. It is mounted once when the detail row becomes visible,
 * kept while scrolling (its state stays) and unmounted when the row is collapsed.
 *
 * @example
 * const app = getCurrentInstance()?.appContext ?? null;   // plugins, global components
 * masterDetail: { detailHeight: 180, detailRenderer: new DetailComponentRendererWrapper(OrderItems, app) }
 *
 * @since 1.1.97
 */
export class DetailComponentRendererWrapper<T = any> implements DetailRendererIf<T> {

  constructor(
    private readonly component: any,
    private readonly appContext: AppContext | null = null
  ) {
  }

  render(container: HTMLDivElement, row: T, context: DetailRenderContextIf<T>): () => void {
    const vNode: VNode = createVNode(this.component, { row, rowIndex: context.rowIndex, tableApi: context.tableApi, context });
    vNode.appContext = this.appContext;
    render(vNode, container);
    return () => render(null, container);
  }
}
