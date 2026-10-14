[GuiExpert Table API](../README.md) / [Exports](../modules.md) / MaleFemaleToIconCellRenderer

# Class: MaleFemaleToIconCellRenderer

## Implements

- [`CellRendererIf`](../interfaces/CellRendererIf.md)

## Table of contents

### Constructors

- [constructor](MaleFemaleToIconCellRenderer.md#constructor)

### Properties

- [ariaLabels](MaleFemaleToIconCellRenderer.md#arialabels)

### Methods

- [render](MaleFemaleToIconCellRenderer.md#render)

## Constructors

### constructor

• **new MaleFemaleToIconCellRenderer**(`ariaLabels?`): [`MaleFemaleToIconCellRenderer`](MaleFemaleToIconCellRenderer.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `ariaLabels` | `Object` | texts for screen readers (the symbols ♂ / ♀ are images). Default: "male" / "female". |
| `ariaLabels.female` | `string` | - |
| `ariaLabels.male` | `string` | - |

#### Returns

[`MaleFemaleToIconCellRenderer`](MaleFemaleToIconCellRenderer.md)

**`Since`**

1.1.91

#### Defined in

[src/lib/table/renderer/male-female-to-icon-cell-renderer.ts:14](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/male-female-to-icon-cell-renderer.ts#L14)

## Properties

### ariaLabels

• **ariaLabels**: `Object`

texts for screen readers (the symbols ♂ / ♀ are images). Default: "male" / "female".

#### Type declaration

| Name | Type |
| :------ | :------ |
| `female` | `string` |
| `male` | `string` |

#### Defined in

[src/lib/table/renderer/male-female-to-icon-cell-renderer.ts:15](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/male-female-to-icon-cell-renderer.ts#L15)

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

[src/lib/table/renderer/male-female-to-icon-cell-renderer.ts:19](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/male-female-to-icon-cell-renderer.ts#L19)
