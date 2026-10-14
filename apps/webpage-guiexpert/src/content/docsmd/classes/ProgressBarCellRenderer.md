[GuiExpert Table API](../README.md) / [Exports](../modules.md) / ProgressBarCellRenderer

# Class: ProgressBarCellRenderer\<T\>

Works with AreaModelObjectArray only

## Type parameters

| Name |
| :------ |
| `T` |

## Implements

- [`CellRendererIf`](../interfaces/CellRendererIf.md)

## Table of contents

### Constructors

- [constructor](ProgressBarCellRenderer.md#constructor)

### Properties

- [ariaLabel](ProgressBarCellRenderer.md#arialabel)
- [labelVisible](ProgressBarCellRenderer.md#labelvisible)
- [maxValue](ProgressBarCellRenderer.md#maxvalue)
- [property](ProgressBarCellRenderer.md#property)

### Methods

- [render](ProgressBarCellRenderer.md#render)

## Constructors

### constructor

• **new ProgressBarCellRenderer**\<`T`\>(`property`, `maxValue?`, `labelVisible?`, `ariaLabel?`): [`ProgressBarCellRenderer`](ProgressBarCellRenderer.md)\<`T`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `property` | `string` | `undefined` | - |
| `maxValue` | `number` | `100` | - |
| `labelVisible` | `boolean` | `false` | - |
| `ariaLabel` | (`percent`: `number`, `value`: `number`) => `string` | `undefined` | Text for screen readers (the bar is an image). Default: `"75 %"`. **`Since`** 1.1.91 |

#### Returns

[`ProgressBarCellRenderer`](ProgressBarCellRenderer.md)\<`T`\>

#### Defined in

[src/lib/table/renderer/progress-bar-cell-renderer.ts:15](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/progress-bar-cell-renderer.ts#L15)

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

[src/lib/table/renderer/progress-bar-cell-renderer.ts:20](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/progress-bar-cell-renderer.ts#L20)

___

### labelVisible

• **labelVisible**: `boolean` = `false`

#### Defined in

[src/lib/table/renderer/progress-bar-cell-renderer.ts:18](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/progress-bar-cell-renderer.ts#L18)

___

### maxValue

• **maxValue**: `number` = `100`

#### Defined in

[src/lib/table/renderer/progress-bar-cell-renderer.ts:17](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/progress-bar-cell-renderer.ts#L17)

___

### property

• **property**: `string`

#### Defined in

[src/lib/table/renderer/progress-bar-cell-renderer.ts:16](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/progress-bar-cell-renderer.ts#L16)

## Methods

### render

▸ **render**(`cellDiv`, `rowIndex`, `columnIndex`, `areaIdent`, `areaModel`, `_cellValue`, `domService`): `undefined` \| `Function`

Fills the (empty) cell element.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cellDiv` | `HTMLDivElement` | the cell element, already positioned and sized |
| `rowIndex` | `number` | row in the area (as displayed) |
| `columnIndex` | `number` | column index (west + center + east) |
| `areaIdent` | [`AreaIdent`](../modules.md#areaident) | `"header"`, `"body"` or `"footer"` |
| `areaModel` | [`AreaModelObjectArray`](AreaModelObjectArray.md)\<`T`\> | the model of this area (e.g. for `getRowByIndex(rowIndex)`) |
| `_cellValue` | `any` | the value of the cell (`areaModel.getValueAt(rowIndex, columnIndex)`) |
| `domService` | [`DomServiceIf`](../interfaces/DomServiceIf.md) | create and change elements through it (works with Angular's Renderer2, too) |

#### Returns

`undefined` \| `Function`

optionally a cleanup function, called before the cell is drawn again

#### Implementation of

[CellRendererIf](../interfaces/CellRendererIf.md).[render](../interfaces/CellRendererIf.md#render)

#### Defined in

[src/lib/table/renderer/progress-bar-cell-renderer.ts:24](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/progress-bar-cell-renderer.ts#L24)
