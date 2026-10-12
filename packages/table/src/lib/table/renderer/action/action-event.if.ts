import { AreaIdent } from '../../data/tablemodel/area-ident.type';

/** @category Renderers & editing */
export interface ActionEventIf {
  action: string;
  area: AreaIdent;
  rowIndex: number;
  columnIndex: number;
  id: any;
}