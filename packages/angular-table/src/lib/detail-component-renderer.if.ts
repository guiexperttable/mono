import { DetailRenderContextIf } from "@guiexpert/table";

/**
 * An Angular component that renders a detail row (master/detail, `tableOptions.masterDetail`) – created with
 * {@link DetailRenderWrapperFactory}.
 *
 * @since 1.1.97
 */
export interface DetailComponentRendererIf<T = any> {

  /** Called once, right after the component was created (before the first change detection). */
  setDetail(row: T, context: DetailRenderContextIf<T>): void;

}
