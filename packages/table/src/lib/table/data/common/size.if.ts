import { SizeUnitType } from './size-unit.type';


/**
 * Represents the size of an object or element.
 *
 * @category Columns
 */
export interface SizeIf {
  value: number;
  unit: SizeUnitType;
}
