[GuiExpert Table API](../README.md) / [Exports](../modules.md) / CellGroupExtCellRenderer

# Class: CellGroupExtCellRenderer

## Implements

- [`CellRendererIf`](../interfaces/CellRendererIf.md)

## Table of contents

### Constructors

- [constructor](CellGroupExtCellRenderer.md#constructor)

### Methods

- [applyStyleString](CellGroupExtCellRenderer.md#applystylestring)
- [render](CellGroupExtCellRenderer.md#render)

## Constructors

### constructor

• **new CellGroupExtCellRenderer**(`headerGroupOptions?`): [`CellGroupExtCellRenderer`](CellGroupExtCellRenderer.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `headerGroupOptions` | [`HeaderGroupOptionsIf`](../interfaces/HeaderGroupOptionsIf.md) |

#### Returns

[`CellGroupExtCellRenderer`](CellGroupExtCellRenderer.md)

#### Defined in

[src/lib/table/renderer/cell-group-ext-cell-renderer.ts:19](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/cell-group-ext-cell-renderer.ts#L19)

## Methods

### applyStyleString

▸ **applyStyleString**(`domService`, `div`, `style`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `domService` | [`DomServiceIf`](../interfaces/DomServiceIf.md) |
| `div` | `HTMLDivElement` |
| `style` | `string` |

#### Returns

`void`

#### Defined in

[src/lib/table/renderer/cell-group-ext-cell-renderer.ts:122](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/cell-group-ext-cell-renderer.ts#L122)

___

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
| `cellValue` | `undefined` \| ``null`` \| [`CellGroupExt`](CellGroupExt.md) | the value of the cell (`areaModel.getValueAt(rowIndex, columnIndex)`) |
| `domService` | [`DomServiceIf`](../interfaces/DomServiceIf.md) | create and change elements through it (works with Angular's Renderer2, too) |

#### Returns

`undefined` \| `Function`

optionally a cleanup function, called before the cell is drawn again

#### Implementation of

[CellRendererIf](../interfaces/CellRendererIf.md).[render](../interfaces/CellRendererIf.md#render)

#### Defined in

[src/lib/table/renderer/cell-group-ext-cell-renderer.ts:25](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/cell-group-ext-cell-renderer.ts#L25)
