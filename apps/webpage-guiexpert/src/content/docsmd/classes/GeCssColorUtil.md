[GuiExpert Table API](../README.md) / [Exports](../modules.md) / GeCssColorUtil

# Class: GeCssColorUtil

Colour gradients for heatmaps and conditional formatting – returns CSS colours like `rgb(244, 114, 182)`.

**`Example`**

```ts
const gradient = new ThreeColorGradientArg(
  0, new ColorRgb(255, 255, 255),        // min → white
  50, new ColorRgb(244, 114, 182),       // middle → pink
  100, new ColorRgb(79, 70, 229));       // max → indigo

class HeatmapModel extends AreaModelArrayOfArrays<number> {
  override getCustomStyleAt(rowIndex: number, columnIndex: number) {
    const value = Number(this.getValueAt(rowIndex, columnIndex));
    return { "background-color": GeCssColorUtil.getThreeColorGradientRGB(value, gradient) };
  }
}
```

**`See`**

Training: [Heatmaps and conditional formatting](https://gui.expert/training/heatmap/)

## Table of contents

### Constructors

- [constructor](GeCssColorUtil.md#constructor)

### Methods

- [getThreeColorGradientRGB](GeCssColorUtil.md#getthreecolorgradientrgb)
- [getTwoColorGradientRGB](GeCssColorUtil.md#gettwocolorgradientrgb)
- [normalize](GeCssColorUtil.md#normalize)

## Constructors

### constructor

• **new GeCssColorUtil**(): [`GeCssColorUtil`](GeCssColorUtil.md)

#### Returns

[`GeCssColorUtil`](GeCssColorUtil.md)

## Methods

### getThreeColorGradientRGB

▸ **getThreeColorGradientRGB**(`value`, `para`): `string`

The colour for `value` on a min → middle → max gradient (e.g. red → white → green for negative / positive).

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |
| `para` | [`ThreeColorGradientArgIf`](../interfaces/ThreeColorGradientArgIf.md) |

#### Returns

`string`

#### Defined in

[src/lib/table/color/ge-css-color-util.ts:56](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/color/ge-css-color-util.ts#L56)

___

### getTwoColorGradientRGB

▸ **getTwoColorGradientRGB**(`value`, `para`): `string`

The colour for `value` between `minColor` (at `minValue`) and `maxColor` (at `maxValue`).

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |
| `para` | [`TwoColorGradientArgIf`](../interfaces/TwoColorGradientArgIf.md) |

#### Returns

`string`

#### Defined in

[src/lib/table/color/ge-css-color-util.ts:40](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/color/ge-css-color-util.ts#L40)

___

### normalize

▸ **normalize**(`value`, `fromSource`, `toSource`, `fromTarget?`, `toTarget?`): `number`

Maps `value` from the range [fromSource, toSource] linearly to [fromTarget, toTarget].

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `value` | `number` | `undefined` |
| `fromSource` | `number` | `undefined` |
| `toSource` | `number` | `undefined` |
| `fromTarget` | `number` | `0` |
| `toTarget` | `number` | `1` |

#### Returns

`number`

#### Defined in

[src/lib/table/color/ge-css-color-util.ts:29](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/color/ge-css-color-util.ts#L29)
