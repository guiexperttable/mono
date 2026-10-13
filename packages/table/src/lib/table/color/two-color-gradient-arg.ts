import { ColorRgbIf } from "./color-rgb.if";
import { TwoColorGradientArgIf } from "./two-color-gradient-arg.if";

/** @category Styling */
export class TwoColorGradientArg implements TwoColorGradientArgIf {
  constructor(
    public minValue: number,
    public minColor: ColorRgbIf,
    public maxValue: number,
    public maxColor: ColorRgbIf
  ) {
  }
}
