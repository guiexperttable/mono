import { DetailRenderContextIf, DetailRendererIf } from "@guiexpert/table";
import { ApplicationRef, createComponent, EnvironmentInjector, NgZone, Type } from "@angular/core";
import { DetailComponentRendererIf } from "../detail-component-renderer.if";

/**
 * Renders an Angular component as the content of a detail row (master/detail). Created once when the detail row
 * becomes visible, kept while scrolling, destroyed (`ComponentRef.destroy()`) when the row is collapsed.
 *
 * @since 1.1.97
 */
export class DetailRendererWrapper<T = any> implements DetailRendererIf<T> {

  constructor(
    private readonly componentType: Type<DetailComponentRendererIf<T>>,
    private readonly appRef: ApplicationRef,
    private readonly injector: EnvironmentInjector,
    private readonly zone: NgZone
  ) {
  }

  render(container: HTMLDivElement, row: T, context: DetailRenderContextIf<T>): () => void {
    return this.zone.run(() => {
      const componentRef = createComponent(this.componentType, { environmentInjector: this.injector });
      componentRef.instance.setDetail(row, context);
      container.appendChild(componentRef.location.nativeElement);
      this.appRef.attachView(componentRef.hostView);
      componentRef.changeDetectorRef.detectChanges();
      return () => this.zone.run(() => {
        this.appRef.detachView(componentRef.hostView);
        componentRef.destroy();
      });
    });
  }
}
