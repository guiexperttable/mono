[GuiExpert Table API](../README.md) / [Exports](../modules.md) / ActionsCellRenderer

# Class: ActionsCellRenderer

## Implements

- [`CellRendererIf`](../interfaces/CellRendererIf.md)

## Table of contents

### Constructors

- [constructor](ActionsCellRenderer.md#constructor)

### Methods

- [render](ActionsCellRenderer.md#render)

## Constructors

### constructor

• **new ActionsCellRenderer**(`actionEventListener`, `crudActions`): [`ActionsCellRenderer`](ActionsCellRenderer.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `actionEventListener` | [`ActionEventListenerIf`](../interfaces/ActionEventListenerIf.md) |
| `crudActions` | [`CrudAction`](CrudAction.md)[] |

#### Returns

[`ActionsCellRenderer`](ActionsCellRenderer.md)

#### Defined in

[src/lib/table/renderer/action/actions-cell-renderer.ts:15](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/action/actions-cell-renderer.ts#L15)

## Methods

### render

▸ **render**(`cellDiv`, `rowIndex`, `columnIndex`, `areaIdent`, `areaModel`, `cellValue`, `domService`): `undefined` \| `Function`

Fills the (empty) cell element.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cellDiv` | `HTMLDivElement` | the cell element, already positioned and sized |
| `rowIndex` | `number` | row in the area (as displayed) |
| `columnIndex` | `number` | column index (west + center + east) |
| `areaIdent` | [`AreaIdent`](../modules.md#areaident) | `"header"`, `"body"` or `"footer"` |
| `areaModel` | [`AreaModelIf`](../interfaces/AreaModelIf.md) | the model of this area (e.g. for `getRowByIndex(rowIndex)`) |
| `cellValue` | `any` | the value of the cell (`areaModel.getValueAt(rowIndex, columnIndex)`) |
| `domService` | [`DomServiceIf`](../interfaces/DomServiceIf.md) | create and change elements through it (works with Angular's Renderer2, too) |

#### Returns

`undefined` \| `Function`

optionally a cleanup function, called before the cell is drawn again

#### Implementation of

[CellRendererIf](../interfaces/CellRendererIf.md).[render](../interfaces/CellRendererIf.md#render)

#### Defined in

[src/lib/table/renderer/action/actions-cell-renderer.ts:21](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/action/actions-cell-renderer.ts#L21)
