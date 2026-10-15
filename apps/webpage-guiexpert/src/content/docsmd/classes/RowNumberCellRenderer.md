[GuiExpert Table API](../README.md) / [Exports](../modules.md) / RowNumberCellRenderer

# Class: RowNumberCellRenderer

Renders the number of a body row – the body renderer of [RowNumberColumnDef](RowNumberColumnDef.md). The text is set as a text node
(never as HTML), in the same label structure as a normal cell (`.ge-table-label-div > .ge-table-label`).

The table uses it for a `RowNumberColumnDef` with every body model (also own [AreaModel](AreaModel.md)s without renderers).

**`Example`**

```ts
const columnDef = new RowNumberColumnDef();
const renderer = columnDef.rendererMap.body; // a RowNumberCellRenderer
```

**`Since`**

1.1.93

## Implements

- [`CellRendererIf`](../interfaces/CellRendererIf.md)

## Table of contents

### Constructors

- [constructor](RowNumberCellRenderer.md#constructor)

### Properties

- [type](RowNumberCellRenderer.md#type)

### Methods

- [render](RowNumberCellRenderer.md#render)

## Constructors

### constructor

• **new RowNumberCellRenderer**(`columnDef`): [`RowNumberCellRenderer`](RowNumberCellRenderer.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `columnDef` | `Pick`\<[`RowNumberColumnDef`](RowNumberColumnDef.md), ``"getRowNumberText"``\> |

#### Returns

[`RowNumberCellRenderer`](RowNumberCellRenderer.md)

#### Defined in

[src/lib/table/renderer/row-number-cell-renderer.ts:26](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/row-number-cell-renderer.ts#L26)

## Properties

### type

• `Readonly` **type**: ``"RowNumberCellRenderer"``

Marker (works across copies of the core).

#### Defined in

[src/lib/table/renderer/row-number-cell-renderer.ts:24](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/row-number-cell-renderer.ts#L24)

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

[src/lib/table/renderer/row-number-cell-renderer.ts:31](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/row-number-cell-renderer.ts#L31)
