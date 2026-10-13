import { ValueLabelIf } from "./value-label.if";


/** @category Columns */
export class ValueLabel implements ValueLabelIf {


  constructor(
    public value: any,
    public label: string
  ) {
  }

}
