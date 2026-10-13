import { TwoColorGradientArgIf } from "./two-color-gradient-arg.if";
import { ThreeColorGradientArgIf } from "./three-color-gradient-arg.if";
import { TwoColorGradientArg } from "./two-color-gradient-arg";

/**
 * Colour gradients for heatmaps and conditional formatting – returns CSS colours like `rgb(244, 114, 182)`.
 *
 * @example
 * const gradient = new ThreeColorGradientArg(
 *   0, new ColorRgb(255, 255, 255),        // min → white
 *   50, new ColorRgb(244, 114, 182),       // middle → pink
 *   100, new ColorRgb(79, 70, 229));       // max → indigo
 *
 * class HeatmapModel extends AreaModelArrayOfArrays<number> {
 *   override getCustomStyleAt(rowIndex: number, columnIndex: number) {
 *     const value = Number(this.getValueAt(rowIndex, columnIndex));
 *     return { "background-color": GeCssColorUtil.getThreeColorGradientRGB(value, gradient) };
 *   }
 * }
 *
 * @see Training: [Heatmaps and conditional formatting](https://gui.expert/training/heatmap/)
 *
 * @category Styling
 */
export class GeCssColorUtil {


  /** Maps `value` from the range [fromSource, toSource] linearly to [fromTarget, toTarget]. */
  static normalize(
    value: number,
    fromSource: number,
    toSource: number,
    fromTarget: number = 0,
    toTarget: number = 1) {
    return (value - fromSource) / (toSource - fromSource) * (toTarget - fromTarget) + fromTarget;
  }


  /** The colour for `value` between `minColor` (at `minValue`) and `maxColor` (at `maxValue`). */
  static getTwoColorGradientRGB(value: number, para: TwoColorGradientArgIf): string {
    const factor = GeCssColorUtil.normalize(value, para.minValue, para.maxValue, 0, 1);

    const diffRed = para.maxColor.r - para.minColor.r;
    const diffGreen = para.maxColor.g - para.minColor.g;
    const diffBlue = para.maxColor.b - para.minColor.b;

    const r = (diffRed * factor) + para.minColor.r;
    const g = (diffGreen * factor) + para.minColor.g;
    const b = (diffBlue * factor) + para.minColor.b;

    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
  }


  /** The colour for `value` on a min → middle → max gradient (e.g. red → white → green for negative / positive). */
  static getThreeColorGradientRGB(value: number, para: ThreeColorGradientArgIf): string {
    if (value < para.middleValue) {
      return GeCssColorUtil.getTwoColorGradientRGB(value, new TwoColorGradientArg(para.minValue, para.minColor, para.middleValue, para.middleColor));
    }
    if (value > para.middleValue) {
      return GeCssColorUtil.getTwoColorGradientRGB(value, new TwoColorGradientArg(para.middleValue, para.middleColor, para.maxValue, para.maxColor));
    }
    return `rgb(${para.middleColor.r}, ${para.middleColor.g}, ${para.middleColor.b})`;
  }

}
