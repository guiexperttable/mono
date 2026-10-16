import type { DetailRenderContextIf, DetailRendererIf } from "@guiexpert/table";
import * as svelte from "svelte";

type MountFn = (component: any, options: { target: Element; props: Record<string, any> }) => any;
type UnmountFn = (component: any) => void;

// Svelte 5 exports mount()/unmount(); Svelte 4 components are classes (new Component(...), $destroy()).
const svelteApi = svelte as unknown as Record<string, unknown>;
const mount = svelteApi["mount"] as MountFn | undefined;
const unmount = svelteApi["unmount"] as UnmountFn | undefined;

/**
 * Renders a Svelte component (Svelte 4 and 5) as the content of a detail row (master/detail,
 * `tableOptions.masterDetail`). The component receives the props `row`, `rowIndex`, `tableApi` and `context`. It is
 * mounted once when the detail row becomes visible, kept while scrolling, destroyed when the row is collapsed.
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
    const props = { row, rowIndex: context.rowIndex, tableApi: context.tableApi, context };
    if (typeof mount === "function" && typeof unmount === "function") {
      const instance = mount(this.Component, { target: container, props });
      return () => unmount(instance);
    }
    const c = new this.Component({ target: container, props });
    return () => c.$destroy();
  }
}
