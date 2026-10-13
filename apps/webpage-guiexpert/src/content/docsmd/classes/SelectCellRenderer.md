[GuiExpert Table API](../README.md) / [Exports](../modules.md) / SelectCellRenderer

# Class: SelectCellRenderer

## Implements

- [`CellRendererIf`](../interfaces/CellRendererIf.md)

## Table of contents

### Constructors

- [constructor](SelectCellRenderer.md#constructor)

### Properties

- [options](SelectCellRenderer.md#options)

### Methods

- [render](SelectCellRenderer.md#render)
- [create](SelectCellRenderer.md#create)

## Constructors

### constructor

• **new SelectCellRenderer**(`options`): [`SelectCellRenderer`](SelectCellRenderer.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`ValueLabelIf`](../interfaces/ValueLabelIf.md)[] |

#### Returns

[`SelectCellRenderer`](SelectCellRenderer.md)

#### Defined in

[src/lib/table/renderer/edit/select-cell-renderer.ts:13](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/edit/select-cell-renderer.ts#L13)

## Properties

### options

• `Protected` **options**: [`ValueLabelIf`](../interfaces/ValueLabelIf.md)[]

#### Defined in

[src/lib/table/renderer/edit/select-cell-renderer.ts:14](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/edit/select-cell-renderer.ts#L14)

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
| `areaModel` | [`AreaModelIf`](../interfaces/AreaModelIf.md) | the model of this area (e.g. for `getRowByIndex(rowIndex)`) |
| `_cellValue` | `any` | the value of the cell (`areaModel.getValueAt(rowIndex, columnIndex)`) |
| `domService` | [`DomServiceIf`](../interfaces/DomServiceIf.md) | create and change elements through it (works with Angular's Renderer2, too) |

#### Returns

`undefined` \| `Function`

optionally a cleanup function, called before the cell is drawn again

#### Implementation of

[CellRendererIf](../interfaces/CellRendererIf.md).[render](../interfaces/CellRendererIf.md#render)

#### Defined in

[src/lib/table/renderer/edit/select-cell-renderer.ts:23](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/edit/select-cell-renderer.ts#L23)

___

### create

▸ **create**(`values`): [`SelectCellRenderer`](SelectCellRenderer.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `values` | `string`[] |

#### Returns

[`SelectCellRenderer`](SelectCellRenderer.md)

#### Defined in

[src/lib/table/renderer/edit/select-cell-renderer.ts:17](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/edit/select-cell-renderer.ts#L17)
