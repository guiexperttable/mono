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

- [property](StarRatingCellRenderer.md#property)

### Methods

- [render](StarRatingCellRenderer.md#render)

## Constructors

### constructor

• **new StarRatingCellRenderer**\<`T`\>(`property`): [`StarRatingCellRenderer`](StarRatingCellRenderer.md)\<`T`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `property` | `string` |

#### Returns

[`StarRatingCellRenderer`](StarRatingCellRenderer.md)\<`T`\>

#### Defined in

[src/lib/table/renderer/star-rating-cell-renderer.ts:14](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/star-rating-cell-renderer.ts#L14)

## Properties

### property

• **property**: `string`

#### Defined in

[src/lib/table/renderer/star-rating-cell-renderer.ts:15](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/star-rating-cell-renderer.ts#L15)

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

[src/lib/table/renderer/star-rating-cell-renderer.ts:21](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/star-rating-cell-renderer.ts#L21)
