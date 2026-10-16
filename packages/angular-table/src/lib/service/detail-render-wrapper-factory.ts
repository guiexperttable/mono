import { ApplicationRef, EnvironmentInjector, Injectable, NgZone, Type } from "@angular/core";
import { DetailComponentRendererIf } from "../detail-component-renderer.if";
import { DetailRendererWrapper } from "./detail-renderer-wrapper";

/**
 * Creates the `detailRenderer` of master/detail from an Angular component (`tableOptions.masterDetail`).
 *
 * @example
 * constructor(private readonly detailFactory: DetailRenderWrapperFactory) {}
 * tableOptions = { ...new TableOptions(), masterDetail: { detailHeight: 180, detailRenderer: this.detailFactory.create(OrderItemsComponent) } };
 *
 * @since 1.1.97
 */
@Injectable({
  providedIn: "root"
})
export class DetailRenderWrapperFactory {

  constructor(
    private readonly appRef: ApplicationRef,
    private readonly injector: EnvironmentInjector,
    private readonly zone: NgZone
  ) {
  }

  create<T = any>(componentType: Type<DetailComponentRendererIf<T>>): DetailRendererWrapper<T> {
    return new DetailRendererWrapper<T>(componentType, this.appRef, this.injector, this.zone);
  }
}
