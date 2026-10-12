[GuiExpert Table API](../README.md) / [Exports](../modules.md) / PositiveAndNegativeNumberRenderer

# Class: PositiveAndNegativeNumberRenderer

## Implements

- [`CellRendererIf`](../interfaces/CellRendererIf.md)

## Table of contents

### Constructors

- [constructor](PositiveAndNegativeNumberRenderer.md#constructor)

### Methods

- [render](PositiveAndNegativeNumberRenderer.md#render)

## Constructors

### constructor

• **new PositiveAndNegativeNumberRenderer**(): [`PositiveAndNegativeNumberRenderer`](PositiveAndNegativeNumberRenderer.md)

#### Returns

[`PositiveAndNegativeNumberRenderer`](PositiveAndNegativeNumberRenderer.md)

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
| `_areaModel` | [`AreaModelIf`](../interfaces/AreaModelIf.md) | the model of this area (e.g. for `getRowByIndex(rowIndex)`) |
| `cellValue` | `any` | the value of the cell (`areaModel.getValueAt(rowIndex, columnIndex)`) |
| `domService` | [`DomServiceIf`](../interfaces/DomServiceIf.md) | create and change elements through it (works with Angular's Renderer2, too) |

#### Returns

`undefined` \| `Function`

optionally a cleanup function, called before the cell is drawn again

#### Implementation of

[CellRendererIf](../interfaces/CellRendererIf.md).[render](../interfaces/CellRendererIf.md#render)

#### Defined in

[src/lib/table/renderer/positive-and-negative-number-renderer.ts:12](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/positive-and-negative-number-renderer.ts#L12)
