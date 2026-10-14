[GuiExpert Table API](../README.md) / [Exports](../modules.md) / NumberCellRenderer

# Class: NumberCellRenderer

## Implements

- [`CellRendererIf`](../interfaces/CellRendererIf.md)

## Table of contents

### Constructors

- [constructor](NumberCellRenderer.md#constructor)

### Properties

- [max](NumberCellRenderer.md#max)
- [min](NumberCellRenderer.md#min)

### Methods

- [render](NumberCellRenderer.md#render)

## Constructors

### constructor

• **new NumberCellRenderer**(`min?`, `max?`): [`NumberCellRenderer`](NumberCellRenderer.md)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `min` | `number` | `Number.MIN_SAFE_INTEGER` |
| `max` | `number` | `Number.MAX_SAFE_INTEGER` |

#### Returns

[`NumberCellRenderer`](NumberCellRenderer.md)

#### Defined in

[src/lib/table/renderer/number-cell-renderer.ts:12](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/number-cell-renderer.ts#L12)

## Properties

### max

• `Protected` **max**: `number` = `Number.MAX_SAFE_INTEGER`

#### Defined in

[src/lib/table/renderer/number-cell-renderer.ts:14](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/number-cell-renderer.ts#L14)

___

### min

• `Protected` **min**: `number` = `Number.MIN_SAFE_INTEGER`

#### Defined in

[src/lib/table/renderer/number-cell-renderer.ts:13](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/number-cell-renderer.ts#L13)

## Methods

### render

▸ **render**(`cellDiv`, `_rowIndex`, `_columnIndex`, `_areaIdent`, `_areaModel`, `cellValue`, `domService`): `undefined` \| `Function`

Fills the (empty) cell element.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cellDiv` | `HTMLDivElement` | the cell element, already positioned and sized |
| `_rowIndex` | `number` | row in the area (as displayed) |
| `_columnIndex` | `number` | column index (west + center + east) |
| `_areaIdent` | [`AreaIdent`](../modules.md#areaident) | `"header"`, `"body"` or `"footer"` |
| `_areaModel` | [`AreaModelIf`](../interfaces/AreaModelIf.md) | the model of this area (e.g. for `getRowByIndex(rowIndex)`) |
| `cellValue` | `any` | the value of the cell (`areaModel.getValueAt(rowIndex, columnIndex)`) |
| `domService` | [`DomServiceIf`](../interfaces/DomServiceIf.md) | create and change elements through it (works with Angular's Renderer2, too) |

#### Returns

`undefined` \| `Function`

optionally a cleanup function, called before the cell is drawn again

#### Implementation of

[CellRendererIf](../interfaces/CellRendererIf.md).[render](../interfaces/CellRendererIf.md#render)

#### Defined in

[src/lib/table/renderer/number-cell-renderer.ts:17](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/number-cell-renderer.ts#L17)
