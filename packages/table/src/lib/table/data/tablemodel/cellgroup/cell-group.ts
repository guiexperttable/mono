import { CellGroupIf } from "./cell-group.if";

/** @category Header groups */
export class CellGroup implements CellGroupIf {

  public impl = 'CellGroup';

  /** See {@link CellGroupIf.id}. @since 1.1.92 */
  public id?: string;

  constructor(
    public data: any,
    public property?: string,
    public toggle?: boolean,
    public closed: boolean = false,
    public visibility: "always" | "inverted" | "normal" | undefined = "normal",
    public children: CellGroupIf[] | undefined = undefined
  ) {
  }


}
