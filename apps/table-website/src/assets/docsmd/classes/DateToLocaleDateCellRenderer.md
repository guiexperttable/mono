[GuiExpert Table API](../README.md) / [Exports](../modules.md) / DateToLocaleDateCellRenderer

# Class: DateToLocaleDateCellRenderer

## Implements

- [`CellRendererIf`](../interfaces/CellRendererIf.md)

## Table of contents

### Constructors

- [constructor](DateToLocaleDateCellRenderer.md#constructor)

### Methods

- [render](DateToLocaleDateCellRenderer.md#render)

## Constructors

### constructor

• **new DateToLocaleDateCellRenderer**(): [`DateToLocaleDateCellRenderer`](DateToLocaleDateCellRenderer.md)

#### Returns

[`DateToLocaleDateCellRenderer`](DateToLocaleDateCellRenderer.md)

## Methods

### render

▸ **render**(`cellDiv`, `_rowIndex`, `_columnIndex`, `_areaIdent`, `_areaModel`, `cellValue`, `_domService`): `undefined` \| `Function`

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
| `_domService` | [`DomServiceIf`](../interfaces/DomServiceIf.md) | create and change elements through it (works with Angular's Renderer2, too) |

#### Returns

`undefined` \| `Function`

optionally a cleanup function, called before the cell is drawn again

#### Implementation of

[CellRendererIf](../interfaces/CellRendererIf.md).[render](../interfaces/CellRendererIf.md#render)

#### Defined in

[src/lib/table/renderer/date-to-locale-date-cell-renderer.ts:11](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/date-to-locale-date-cell-renderer.ts#L11)
