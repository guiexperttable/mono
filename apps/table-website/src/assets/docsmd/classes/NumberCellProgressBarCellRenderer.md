[GuiExpert Table API](../README.md) / [Exports](../modules.md) / NumberCellProgressBarCellRenderer

# Class: NumberCellProgressBarCellRenderer\<T\>

## Type parameters

| Name |
| :------ |
| `T` |

## Implements

- [`CellRendererIf`](../interfaces/CellRendererIf.md)

## Table of contents

### Constructors

- [constructor](NumberCellProgressBarCellRenderer.md#constructor)

### Properties

- [ariaLabel](NumberCellProgressBarCellRenderer.md#arialabel)
- [labelVisible](NumberCellProgressBarCellRenderer.md#labelvisible)
- [maxValue](NumberCellProgressBarCellRenderer.md#maxvalue)

### Methods

- [render](NumberCellProgressBarCellRenderer.md#render)

## Constructors

### constructor

• **new NumberCellProgressBarCellRenderer**\<`T`\>(`maxValue?`, `labelVisible?`, `ariaLabel?`): [`NumberCellProgressBarCellRenderer`](NumberCellProgressBarCellRenderer.md)\<`T`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `maxValue` | `number` | `100` | - |
| `labelVisible` | `boolean` | `false` | - |
| `ariaLabel` | (`percent`: `number`, `value`: `number`) => `string` | `undefined` | Text for screen readers (the bar is an image). Default: `"75 %"`. **`Since`** 1.1.91 |

#### Returns

[`NumberCellProgressBarCellRenderer`](NumberCellProgressBarCellRenderer.md)\<`T`\>

#### Defined in

[src/lib/table/renderer/number-cell-progress-bar-cell-renderer.ts:12](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/number-cell-progress-bar-cell-renderer.ts#L12)

## Properties

### ariaLabel

• **ariaLabel**: (`percent`: `number`, `value`: `number`) => `string`

#### Type declaration

▸ (`percent`, `value`): `string`

Text for screen readers (the bar is an image). Default: `"75 %"`.

##### Parameters

| Name | Type |
| :------ | :------ |
| `percent` | `number` |
| `value` | `number` |

##### Returns

`string`

**`Since`**

1.1.91

#### Defined in

[src/lib/table/renderer/number-cell-progress-bar-cell-renderer.ts:16](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/number-cell-progress-bar-cell-renderer.ts#L16)

___

### labelVisible

• **labelVisible**: `boolean` = `false`

#### Defined in

[src/lib/table/renderer/number-cell-progress-bar-cell-renderer.ts:14](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/number-cell-progress-bar-cell-renderer.ts#L14)

___

### maxValue

• **maxValue**: `number` = `100`

#### Defined in

[src/lib/table/renderer/number-cell-progress-bar-cell-renderer.ts:13](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/number-cell-progress-bar-cell-renderer.ts#L13)

## Methods

### render

▸ **render**(`cellDiv`, `rowIndex`, `columnIndex`, `areaIdent`, `_areaModel`, `cellValue`, `domService`): `undefined` \| `Function`

Fills the (empty) cell element.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cellDiv` | `HTMLDivElement` | the cell element, already positioned and sized |
| `rowIndex` | `number` | row in the area (as displayed) |
| `columnIndex` | `number` | column index (west + center + east) |
| `areaIdent` | [`AreaIdent`](../modules.md#areaident) | `"header"`, `"body"` or `"footer"` |
| `_areaModel` | [`AreaModelObjectArray`](AreaModelObjectArray.md)\<`T`\> | the model of this area (e.g. for `getRowByIndex(rowIndex)`) |
| `cellValue` | `number` | the value of the cell (`areaModel.getValueAt(rowIndex, columnIndex)`) |
| `domService` | [`DomServiceIf`](../interfaces/DomServiceIf.md) | create and change elements through it (works with Angular's Renderer2, too) |

#### Returns

`undefined` \| `Function`

optionally a cleanup function, called before the cell is drawn again

#### Implementation of

[CellRendererIf](../interfaces/CellRendererIf.md).[render](../interfaces/CellRendererIf.md#render)

#### Defined in

[src/lib/table/renderer/number-cell-progress-bar-cell-renderer.ts:20](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/number-cell-progress-bar-cell-renderer.ts#L20)
