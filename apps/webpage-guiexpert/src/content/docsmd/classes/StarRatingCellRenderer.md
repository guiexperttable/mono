[GuiExpert Table API](../README.md) / [Exports](../modules.md) / StarRatingCellRenderer

# Class: StarRatingCellRenderer\<T\>

Works with AreaModelObjectArray only

## Type parameters

| Name |
| :------ |
| `T` |

## Implements

- [`CellRendererIf`](../interfaces/CellRendererIf.md)

## Table of contents

### Constructors

- [constructor](StarRatingCellRenderer.md#constructor)

### Properties

- [ariaLabel](StarRatingCellRenderer.md#arialabel)
- [property](StarRatingCellRenderer.md#property)

### Methods

- [render](StarRatingCellRenderer.md#render)

## Constructors

### constructor

• **new StarRatingCellRenderer**\<`T`\>(`property`, `ariaLabel?`): [`StarRatingCellRenderer`](StarRatingCellRenderer.md)\<`T`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `property` | `string` | - |
| `ariaLabel` | (`stars`: `number`) => `string` | Text for screen readers (the stars are an image). Default: `"4 stars"`. **`Since`** 1.1.91 |

#### Returns

[`StarRatingCellRenderer`](StarRatingCellRenderer.md)\<`T`\>

#### Defined in

[src/lib/table/renderer/star-rating-cell-renderer.ts:15](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/star-rating-cell-renderer.ts#L15)

## Properties

### ariaLabel

• **ariaLabel**: (`stars`: `number`) => `string`

#### Type declaration

▸ (`stars`): `string`

Text for screen readers (the stars are an image). Default: `"4 stars"`.

##### Parameters

| Name | Type |
| :------ | :------ |
| `stars` | `number` |

##### Returns

`string`

**`Since`**

1.1.91

#### Defined in

[src/lib/table/renderer/star-rating-cell-renderer.ts:18](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/star-rating-cell-renderer.ts#L18)

___

### property

• **property**: `string`

#### Defined in

[src/lib/table/renderer/star-rating-cell-renderer.ts:16](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/star-rating-cell-renderer.ts#L16)

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

[src/lib/table/renderer/star-rating-cell-renderer.ts:24](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/star-rating-cell-renderer.ts#L24)
