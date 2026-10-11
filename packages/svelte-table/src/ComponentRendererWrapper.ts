import { AreaIdent, AreaModelIf, CellRendererIf, DomServiceIf, RendererCleanupFnType } from "@guiexpert/table";
import * as svelte from "svelte";

type MountFn = (component: any, options: { target: Element; props: Record<string, any> }) => any;
type UnmountFn = (component: any) => void;

// Svelte 5 exports mount()/unmount(); Svelte 4 components are classes (new Component(...), $destroy()).
const svelteApi = svelte as unknown as Record<string, unknown>;
const mount = svelteApi["mount"] as MountFn | undefined;
const unmount = svelteApi["unmount"] as UnmountFn | undefined;

/**
 * Renders a Svelte component into a table cell (Svelte 4 and 5).
 * The component receives the props `cellDiv`, `rowIndex`, `columnIndex`, `areaIdent`, `areaModel` and `cellValue`.
 *
 * @example
 * applyBodyRenderer(columnDefs[2], new ComponentRendererWrapper(GenderRendererComponent));
 */
export class ComponentRendererWrapper implements CellRendererIf {

  constructor(
    private readonly Component: any
  ) {
  }

  render(
    cellDiv: HTMLDivElement,
    rowIndex: number,
    columnIndex: number,
    areaIdent: AreaIdent,
    areaModel: AreaModelIf,
    cellValue: any,
    _domService: DomServiceIf): RendererCleanupFnType | undefined {

    const props = {
      cellDiv,
      rowIndex,
      columnIndex,
      areaIdent,
      areaModel,
      cellValue
    };

    if (typeof mount === "function" && typeof unmount === "function") {
      const instance = mount(this.Component, { target: cellDiv, props });
      return () => unmount(instance);
    }

    const c = new this.Component({ target: cellDiv, props });
    return () => {
      c.$destroy();
    };
  }

}
