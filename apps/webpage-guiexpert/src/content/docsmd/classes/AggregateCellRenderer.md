[GuiExpert Table API](../README.md) / [Exports](../modules.md) / AggregateCellRenderer

# Class: AggregateCellRenderer

Writes the formatted text of a cell (`areaModel.getTextValueAt`) as a text node – never as HTML – in the label
structure of a normal cell (`.ge-table-label-div > .ge-table-label`). [AreaModelAggregateFooter](AreaModelAggregateFooter.md) uses it for
its results (`"1,234.5"` instead of the raw `1234.4999999`) and labels when the column has no footer renderer.

**`Example`**

```ts
// an own footer model that formats in getTextValueAt and shows that text
class MyFooter extends AreaModel {
  private readonly renderer = new AggregateCellRenderer();
  override getCellRenderer(_row: number, _col: number): CellRendererIf { return this.renderer; }
  override getTextValueAt(_row: number, _col: number): string { return "Σ 42"; }
}
```

**`Since`**

1.1.94

## Implements

- [`CellRendererIf`](../interfaces/CellRendererIf.md)

## Table of contents

### Constructors

- [constructor](AggregateCellRenderer.md#constructor)

### Properties

- [type](AggregateCellRenderer.md#type)

### Methods

- [render](AggregateCellRenderer.md#render)

## Constructors

### constructor

• **new AggregateCellRenderer**(): [`AggregateCellRenderer`](AggregateCellRenderer.md)

#### Returns

[`AggregateCellRenderer`](AggregateCellRenderer.md)

## Properties

### type

• `Readonly` **type**: ``"AggregateCellRenderer"``

Marker (works across copies of the core).

#### Defined in

[src/lib/table/renderer/aggregate-cell-renderer.ts:26](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/aggregate-cell-renderer.ts#L26)

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

[src/lib/table/renderer/aggregate-cell-renderer.ts:28](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/aggregate-cell-renderer.ts#L28)
